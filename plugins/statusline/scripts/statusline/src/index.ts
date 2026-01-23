#!/usr/bin/env bun
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";

// Import core modules
import { defaultConfig, mergeConfig, type StatuslineConfig } from "./lib/config.js";
import { getContextData } from "./lib/context.js";
import { TokenTracker } from "./lib/token-tracker.js";
import { getContextFromCache } from "./lib/context-from-cache.js";
import {
  colors,
  formatBranch,
  formatCost,
  formatDuration,
  formatPath,
} from "./lib/formatters.js";
import { getGitStatus } from "./lib/git.js";
import {
  renderStatusline,
  type StatuslineData,
  type UsageLimit,
  type GitInsertions,
} from "./lib/render-pure.js";
import type { HookInput } from "./lib/types.js";

// Optional feature imports - just delete the folder to disable!
let getUsageLimits:
  | ((
      enabled?: boolean
    ) => Promise<{
      five_hour: UsageLimit | null;
      seven_day: UsageLimit | null;
    }>)
  | null = null;
let getPeriodCost: ((periodId: string) => Promise<number>) | null = null;
let getTodayCostV2: (() => Promise<number>) | null = null;
let saveSessionV2:
  | ((input: HookInput, periodId: string | null) => Promise<void>)
  | null = null;

try {
  const limitsModule = await import("./lib/features/limits.js");
  getUsageLimits = limitsModule.getUsageLimits;
} catch {
  // Limits feature not available - that's OK!
}

try {
  const spendModule = await import("./lib/features/spend.js");
  getPeriodCost = spendModule.getPeriodCost;
  getTodayCostV2 = spendModule.getTodayCostV2;
  saveSessionV2 = spendModule.saveSessionV2;
} catch {
  // Spend tracking feature not available - that's OK!
}

// Re-export for backwards compatibility
export {
  renderStatusline,
  type StatuslineData,
  type UsageLimit,
} from "./lib/render-pure.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONFIG_FILE_PATH = join(__dirname, "..", "statusline.config.json");
const LAST_PAYLOAD_PATH = join(__dirname, "..", "data", "last_payload.txt");
const CACHE_FILE_PATH = join(__dirname, "..", "data", "context_cache.json");
const TOKEN_TRACKER_PATH = join(homedir(), ".claude", ".token-tracker.json");
const SESSION_TOKENS_PATH = join(__dirname, "..", "data", "session_tokens.json");

// Dynamic working directory tracking
let currentWorkingDir: string | null = null;

/**
 * Extract bash commands from transcript entry content.
 * Handles both <function=Bash> tags and direct command patterns.
 */
function extractBashCommands(entryContent: string): string[] {
  const bashCommands: string[] = [];

  // Try to find Bash tool calls in the content
  const functionMatches = entryContent.match(/<function=Bash>([\s\S]*?)<\/function>/g);
  if (functionMatches) {
    for (const match of functionMatches) {
      // Extract content between the tags
      const innerContent = match.replace(/<\/?function=Bash>/g, "");
      // Look for "command": "..." or just cd
      const commandMatch = innerContent.match(/"command"\s*:\s*"([^"]*cd[^"]*)"/);
      if (commandMatch) {
        bashCommands.push(commandMatch[1]);
      } else if (innerContent.includes("cd")) {
        // Fallback: take all content containing cd
        bashCommands.push(innerContent);
      }
    }
  }

  // Also look for direct commands in content (simple case)
  if (bashCommands.length === 0) {
    const directCdMatch = entryContent.match(/(?:^\s*|\n)(cd\s+[^\n]+)/g);
    if (directCdMatch) {
      bashCommands.push(...directCdMatch);
    }
  }

  return bashCommands;
}

/**
 * Extract cd target directory from a command string.
 * Returns null if no valid cd target found.
 */
function extractCdTarget(command: string): string | null {
  // Normalize the command
  const normalizedCmd = command.replace(/\\'/g, "'").replace(/\\"/g, '"');

  // Look for cd with different patterns
  // Pattern 1: cd && other_command
  // Pattern 2: cd dir
  // Pattern 3: command && cd dir
  const cdPatterns = [
    /(?:^|&&\s*|;\s*)cd\s+([^\s&;]+)/,
    /cd\s+"([^"]+)"/,
    /cd\s+'([^']+)'/,
  ];

  for (const pattern of cdPatterns) {
    const match = normalizedCmd.match(pattern);
    if (match?.[1]) {
      // Clean remaining quotes and return
      return match[1].replace(/^["']|["']$/g, "").trim();
    }
  }

  // Handle "cd &&" case (no argument)
  if (normalizedCmd.includes("cd &&")) {
    return null;
  }

  return null;
}

/**
 * Resolve a target path relative to a base path.
 * Handles absolute paths, relative paths, special cases (.., ~), and normalizes separators.
 */
function resolveTargetPath(targetDir: string, basePath: string): string {
  // Absolute path
  if (targetDir.startsWith("/") || targetDir.match(/^[A-Za-z]:\\/)) {
    return targetDir;
  }

  // Go up one level
  if (targetDir === "..") {
    const parts: string[] = basePath.split(/[/\\]/);
    parts.pop();
    return parts.join("/");
  }

  // Home directory - use workspace home directory
  if (targetDir === "~") {
    const workspaceParts = basePath.split(/[/\\]/);
    return workspaceParts.length >= 2
      ? workspaceParts.slice(0, 2).join("/")
      : basePath;
  }

  // Relative path
  const separator = basePath.includes("/") ? "/" : "\\";
  return basePath + separator + targetDir;
}

/**
 * Parse the transcript to detect directory changes (cd commands)
 * and return the current working directory.
 */
async function trackWorkingDirectory(
  transcriptPath: string,
  initialDir: string
): Promise<string> {
  // Initialize with the initial directory on first run
  if (!currentWorkingDir) {
    currentWorkingDir = initialDir;
  }

  try {
    const content = await readFile(transcriptPath, "utf-8");
    const transcript = JSON.parse(content);

    // Look for recent cd commands in the transcript
    // Only check the last 20 entries to avoid parsing everything
    const recentEntries = transcript.slice(-20);

    for (const entry of recentEntries) {
      // Guard clause: skip non-message entries
      if (entry.type !== "user" && entry.type !== "assistant") {
        continue;
      }

      const entryContent = entry.content || "";
      const bashCommands = extractBashCommands(entryContent);

      // Process each bash command
      for (const cmd of bashCommands) {
        const targetDir = extractCdTarget(cmd);
        if (targetDir) {
          const basePath = currentWorkingDir || initialDir;
          currentWorkingDir = resolveTargetPath(targetDir, basePath);
          // Normalize path (use / everywhere)
          if (currentWorkingDir) {
            currentWorkingDir = currentWorkingDir.replace(/\\/g, "/");
          }
        }
      }
    }

    return currentWorkingDir || initialDir;
  } catch {
    // On error, return the initial directory
    return initialDir;
  }
}

async function loadConfig(): Promise<StatuslineConfig> {
  try {
    const content = await readFile(CONFIG_FILE_PATH, "utf-8");
    const userConfig = JSON.parse(content);
    return mergeConfig(userConfig);
  } catch {
    return defaultConfig;
  }
}

interface ContextInfo {
  tokens: number | null;
  percentage: number | null;
  lastOutputTokens: number | null;
  baseContext?: number;
  transcriptContext?: number;
  userTokens?: number;
}

async function getContextInfo(
  input: HookInput,
  config: StatuslineConfig,
  transcriptPath: string
): Promise<ContextInfo> {
  // ALWAYS calculate from transcript file
  // The payload total_input_tokens can be cumulative/wrong across sessions
  // The transcript contains the actual messages for THIS session
  const contextData = await getContextData({
    transcriptPath,
    maxContextTokens: config.context.maxContextTokens,
    autocompactBufferTokens: config.context.autocompactBufferTokens,
    useUsableContextOnly: config.context.useUsableContextOnly,
    overheadTokens: config.context.overheadTokens,
    includeBaseContext: config.context.includeBaseContext,
    baseContextPath: config.context.baseContextPath,
  });

  return {
    tokens: contextData.tokens,
    percentage: contextData.percentage,
    lastOutputTokens: contextData.lastOutputTokens,
    baseContext: contextData.baseContext,
    transcriptContext: contextData.transcriptContext,
    userTokens: contextData.userTokens,
  };
}

async function getSpendInfo(
  currentResetsAt: string | undefined
): Promise<{ periodCost?: number; todayCost?: number }> {
  if (!getPeriodCost || !getTodayCostV2) {
    return {};
  }

  const normalizedPeriodId = currentResetsAt ?? null;
  const periodCost = normalizedPeriodId ? await getPeriodCost(normalizedPeriodId) : 0;
  const todayCost = await getTodayCostV2();

  return { periodCost, todayCost };
}

/**
 * Session token tracking using payload's total_input_tokens.
 * This is MORE accurate than transcript parsing because:
 * - total_input_tokens is the actual token count from the API
 * - Transcript parsing is an estimate and includes tool outputs
 *
 * We track the delta of total_input_tokens per session (transcript path).
 */
interface SessionTokensData {
  // Map of transcript_path -> baseline total_input_tokens when session started
  sessions: Record<string, number>;
  // Last update timestamp (for cleanup)
  lastUpdate: number;
}

async function getSessionTokens(
  transcriptPath: string,
  totalInputTokens: number
): Promise<{ sessionTokens: number; isNewSession: boolean }> {
  try {
    if (existsSync(SESSION_TOKENS_PATH)) {
      const content = await readFile(SESSION_TOKENS_PATH, "utf-8");
      const data = JSON.parse(content) as SessionTokensData;

      // Clean up old sessions (> 24 hours)
      const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
      for (const [path, _] of Object.entries(data.sessions)) {
        // Can't easily check age without timestamps, skip for now
      }

      if (data.sessions[transcriptPath] !== undefined) {
        // Existing session
        const baseline = data.sessions[transcriptPath];
        const sessionTokens = Math.max(0, totalInputTokens - baseline);
        return { sessionTokens, isNewSession: false };
      } else {
        // New session - set baseline
        data.sessions[transcriptPath] = totalInputTokens;
        data.lastUpdate = Date.now();
        await writeFile(SESSION_TOKENS_PATH, JSON.stringify(data, null, 2));
        return { sessionTokens: 0, isNewSession: true };
      }
    }
  } catch {
    // File doesn't exist or error - create new
  }

  // Create new tracking file
  const data: SessionTokensData = {
    sessions: { [transcriptPath]: totalInputTokens },
    lastUpdate: Date.now(),
  };
  await writeFile(SESSION_TOKENS_PATH, JSON.stringify(data, null, 2));
  return { sessionTokens: 0, isNewSession: true };
}

async function main() {
  try {
    // Read stdin using chunks since Bun.stdin.json() can hang
  const chunks: Buffer[] = [];
  for await (const chunk of Bun.stdin.stream()) {
    chunks.push(Buffer.from(chunk));
  }
  const stdinContent = Buffer.concat(chunks).toString();
  const input: HookInput = JSON.parse(stdinContent);

    // Ensure data directory exists
    const dataDir = dirname(LAST_PAYLOAD_PATH);
    try {
      await mkdir(dataDir, { recursive: true });
    } catch {
      // Directory might already exist, that's fine
    }

    // Save last payload for debugging
    await writeFile(LAST_PAYLOAD_PATH, JSON.stringify(input, null, 2));

    // Use the transcript path from the hook input directly
    // The hook provides the correct transcript path for THIS session
    // Don't try to find "newest" file - that causes session sharing!
    const actualTranscriptPath = input.transcript_path;

    const config = await loadConfig();

    // Get usage limits (if feature exists)
    const usageLimits = getUsageLimits
      ? await getUsageLimits(config.features.usageLimits)
      : { five_hour: null, seven_day: null };

    const currentResetsAt = usageLimits.five_hour?.resets_at ?? undefined;

    // Save session with current period context (if feature exists)
    if (saveSessionV2) {
      await saveSessionV2(input, currentResetsAt ?? null);
    }

    const git = await getGitStatus();

    // ========== PLAN C: TOKEN TRACKING FROM /CONTEXT CACHE ==========
    // 1. Try to read from cache (created by /context command) - MOST ACCURATE
    // 2. Fallback to simple transcript estimation (counts only text, no tool results)
    const contextData = await getContextFromCache(
      actualTranscriptPath,
      config.context.maxContextTokens
    );

    const totalTokens = contextData.tokens;
    const percentage = contextData.percentage;
    const sourceIndicator = contextData.source === "cache" ? "" : "*"; // * = estimated

    const spendInfo = await getSpendInfo(currentResetsAt);

    // Token diff tracking
    const currentUsage = totalTokens;
    const sessionId = actualTranscriptPath;
    const tracker = await TokenTracker.load(TOKEN_TRACKER_PATH, currentUsage, sessionId);
    const { diff: tokenDiff, shouldShow: showTokenDiff } = tracker.getCurrentDiff(currentUsage);

    if (tracker.isSpuriousDiff(tokenDiff)) {
      tracker.resetBaseline(currentUsage);
      await tracker.save(TOKEN_TRACKER_PATH);
    } else {
      tracker.update(currentUsage);
      await tracker.save(TOKEN_TRACKER_PATH);
    }

    // Track the dynamic working directory
    let workingDir = await trackWorkingDirectory(
      actualTranscriptPath,
      input.workspace.current_dir
    );

    // Try to get more accurate current directory from transcript
    // Look for the last bash command with a cwd parameter
    try {
      if (actualTranscriptPath) {
        const transcriptContent = await readFile(actualTranscriptPath, "utf-8");
        const transcript = JSON.parse(transcriptContent) as Array<{
          type: string;
          content?: string;
        }>;

        // Search backwards for the most recent bash tool use with cwd
        for (let i = transcript.length - 1; i >= 0; i--) {
          const entry = transcript[i];
          if (entry.type === "assistant" && entry.content) {
            // Look for "cwd": "path" in tool uses
            const cwdMatch = entry.content.match(/"cwd"\s*:\s*"([^"]+)"/);
            if (cwdMatch && cwdMatch[1]) {
              workingDir = cwdMatch[1];
              break;
            }
          }
        }
      }
    } catch (e) {
      // Use tracked directory if transcript can't be read
    }

    const data: StatuslineData = {
      branch: formatBranch(git, config.git),
      gitInsertions: {
        additions: git.additions,
        deletions: git.deletions,
        modifications: git.modifications,
      },
      dirPath: formatPath(workingDir, config.pathDisplayMode),
      modelName: input.model.display_name,
      sessionCost: formatCost(
        input.cost.total_cost_usd,
        config.session.cost.format
      ),
      sessionDuration: formatDuration(input.cost.total_duration_ms),
      contextTokens: totalTokens,
      contextPercentage: percentage,
      lastOutputTokens: null,
      tokenDiff: showTokenDiff ? tokenDiff : undefined,
      baseContext: contextData.source === "cache" ? 0 : 23000, // Only for estimate
      transcriptContext: contextData.source === "cache" ? totalTokens : totalTokens - 23000,
      userTokens: contextData.source === "cache" ? totalTokens : totalTokens - 23000,
      ...(getUsageLimits && {
        usageLimits: {
          five_hour: usageLimits.five_hour
            ? {
                utilization: usageLimits.five_hour.utilization,
                resets_at: usageLimits.five_hour.resets_at,
              }
            : null,
          seven_day: usageLimits.seven_day
            ? {
                utilization: usageLimits.seven_day.utilization,
                resets_at: usageLimits.seven_day.resets_at,
              }
            : null,
        },
      }),
      ...((getPeriodCost || getTodayCostV2) && spendInfo),
    };

    const output = renderStatusline(data, config);
    console.log(output);

    // DEBUG: Write debug info to file
    try {
      await writeFile(LAST_PAYLOAD_PATH.replace('.txt', '_debug.txt'), JSON.stringify({
        transcript: actualTranscriptPath,
        tokens: totalTokens,
        percentage: percentage,
        source: contextData.source, // "cache" = /context, "estimate" = fallback
      }, null, 2));
    } catch {}

    if (config.oneLine) {
      console.log("");
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`${colors.red}Error:${colors.reset} ${errorMessage}`);
    console.log(`${colors.gray}Check statusline configuration${colors.reset}`);
  }
}

main();
