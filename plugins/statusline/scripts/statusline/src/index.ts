#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";

// Import core modules
import { defaultConfig, type StatuslineConfig } from "./lib/config.js";
import { getContextData } from "./lib/context.js";
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

const TOKEN_DIFF_TIMEOUT = 5000; // 5 seconds - hide token diff after this time
const SESSION_TIMEOUT = 1800000; // 30 minutes - reset tracker after this time

interface TokenTrackerData {
  lastUsage: number;
  timestamp: number;
  lastDiffTime: number;
  sessionId?: string; // Optional session identifier for parallel session detection
}

interface ContextCache {
  timestamp: number;
  data: ContextInfo;
}

let contextCache: ContextCache | null = null;
const CACHE_TTL = 2000; // 2 secondes - éviter les flickers

/**
 * Load token tracker from disk
 */
async function loadTokenTracker(
  currentUsage: number,
  sessionId?: string
): Promise<TokenTrackerData> {
  try {
    if (existsSync(TOKEN_TRACKER_PATH)) {
      const content = await readFile(TOKEN_TRACKER_PATH, "utf-8");
      const tracker = JSON.parse(content) as TokenTrackerData;
      const now = Date.now();

      // Reset tracker if:
      // 1. The tracker is too old (> 30 minutes = likely a new session)
      // 2. Session ID changed (parallel session detected)
      // DO NOT reset based on currentUsage < tracker.lastUsage as this causes false resets
      if (
        now - tracker.timestamp > SESSION_TIMEOUT ||
        (sessionId && tracker.sessionId && sessionId !== tracker.sessionId)
      ) {
        return {
          lastUsage: currentUsage,
          timestamp: now,
          lastDiffTime: now,
          sessionId,
        };
      }
      // Update sessionId if it wasn't set before
      if (sessionId && !tracker.sessionId) {
        tracker.sessionId = sessionId;
      }
      return tracker;
    }
  } catch (e) {
    // File doesn't exist or is invalid
  }
  return {
    lastUsage: currentUsage,
    timestamp: Date.now(),
    lastDiffTime: Date.now(),
    sessionId,
  };
}

/**
 * Save token tracker to disk
 */
async function saveTokenTracker(tracker: TokenTrackerData): Promise<void> {
  try {
    tracker.timestamp = Date.now();
    await writeFile(
      TOKEN_TRACKER_PATH,
      JSON.stringify(tracker, null, 2),
      "utf-8"
    );
  } catch (e) {
    // Fail silently - don't break statusline if we can't save
  }
}

/**
 * Calculate token difference and determine if it should be shown
 * Handles parallel sessions by only showing positive diffs
 */
function getTokenDiff(
  currentUsage: number,
  tracker: TokenTrackerData
): { diff: number; shouldShow: boolean } {
  // Calculate the actual difference
  const tokenDiff = currentUsage - tracker.lastUsage;
  const now = Date.now();
  const timeSinceLastDiff = now - (tracker.lastDiffTime || 0);

  // Only show positive token diffs (new tokens added)
  // Negative diffs (context clearing, compaction) are hidden to avoid confusion
  // The timeout only applies to HIDING the diff after activity stops
  const shouldShow = tokenDiff > 0 && timeSinceLastDiff < TOKEN_DIFF_TIMEOUT;

  return { diff: tokenDiff, shouldShow };
}

/**
 * Update tracker with new usage if tokens have changed
 * IMPORTANT: Only update lastDiffTime when NEW tokens are added
 * This allows the timeout to work and hide the +X.XK after 5s
 *
 * Parallel session handling:
 * - If currentUsage >= lastUsage: Normal progression, update tracker
 * - If currentUsage < lastUsage: Context was cleared/compacted or parallel session
 *   In this case, we update lastUsage but DON'T update lastDiffTime to avoid
 *   showing confusing negative diffs
 */
function updateTracker(
  tracker: TokenTrackerData,
  currentUsage: number
): TokenTrackerData {
  const tokenDiff = currentUsage - tracker.lastUsage;
  const now = Date.now();

  if (tokenDiff > 0) {
    // New tokens added - normal progression
    tracker.lastUsage = currentUsage;
    tracker.lastDiffTime = now;
  } else if (tokenDiff < 0) {
    // Context cleared or parallel session detected
    // Update lastUsage to prevent showing huge positive diffs later
    // but DON'T update lastDiffTime (don't show the negative diff)
    tracker.lastUsage = currentUsage;
    // lastDiffTime stays the same - existing timeout continues
  }
  // If tokenDiff === 0, no update needed

  return tracker;
}

// Tracking du répertoire de travail dynamique
let currentWorkingDir: string | null = null;

/**
 * Parse le transcript pour détecter les changements de répertoire (cd)
 * et retourne le répertoire de travail actuel
 */
async function trackWorkingDirectory(
  transcriptPath: string,
  initialDir: string
): Promise<string> {
  // Si c'est la première fois, initialiser avec le répertoire initial
  if (!currentWorkingDir) {
    currentWorkingDir = initialDir;
  }

  try {
    const content = await readFile(transcriptPath, "utf-8");
    const transcript = JSON.parse(content);

    // Chercher les dernières commandes cd dans le transcript
    // On regarde seulement les 20 dernières entrées pour éviter de tout parser
    const recentEntries = transcript.slice(-20);

    for (const entry of recentEntries) {
      // Si c'est une commande de l'utilisateur ou de l'IA
      if (entry.type === "user" || entry.type === "assistant") {
        const entryContent = entry.content || "";

        // Tenter d'extraire les commandes bash des tool calls
        // Format 1: <function=Bash>...command...</function>
        // Format 2: Tool use blocks avec "command" field
        let bashCommands: string[] = [];

        // Essayer de trouver les tool calls Bash dans le contenu
        const functionMatches = entryContent.match(/<function=Bash>([\s\S]*?)<\/function>/g);
        if (functionMatches) {
          for (const match of functionMatches) {
            // Extraire le contenu entre les balises
            const innerContent = match.replace(/<\/?function=Bash>/g, "");
            // Chercher "command": "..." ou juste cd
            const commandMatch = innerContent.match(/"command"\s*:\s*"([^"]*cd[^"]*)"/);
            if (commandMatch) {
              bashCommands.push(commandMatch[1]);
            } else if (innerContent.includes("cd")) {
              // Fallback: prendre tout le contenu qui contient cd
              bashCommands.push(innerContent);
            }
          }
        }

        // Aussi chercher les commandes directes dans le contenu (cas simple)
        if (bashCommands.length === 0) {
          const directCdMatch = entryContent.match(/(?:^\s*|\n)(cd\s+[^\n]+)/g);
          if (directCdMatch) {
            bashCommands.push(...directCdMatch);
          }
        }

        // Analyser chaque commande pour trouver les cd
        for (const cmd of bashCommands) {
          // Normaliser la commande
          const normalizedCmd = cmd.replace(/\\'/g, "'").replace(/\\"/g, '"');

          // Chercher cd avec différents patterns
          // Pattern 1: cd && other_command
          // Pattern 2: cd dir
          // Pattern 3: command && cd dir
          const cdPatterns = [
            /(?:^|&&\s*|;\s*)cd\s+([^\s&;]+)/,
            /cd\s+&&/,
            /cd\s+"([^"]+)"/,
            /cd\s+'([^']+)'/,
          ];

          for (const pattern of cdPatterns) {
            const match = normalizedCmd.match(pattern);
            if (match) {
              let targetDir = match[1];

              if (!targetDir && match[0]?.includes("cd &&")) {
                // Cas "cd &&" sans argument = utiliser le répertoire initial
                continue;
              }

              if (targetDir) {
                // Nettoyer les quotes et guillemets restants
                targetDir = targetDir.replace(/^["']|["']$/g, "").trim();

                // Résoudre le chemin relatif ou absolu
                if (targetDir.startsWith("/") || targetDir.match(/^[A-Za-z]:\\/)) {
                  // Chemin absolu
                  currentWorkingDir = targetDir;
                } else if (targetDir === "..") {
                  // Remonter d'un niveau
                  const parts: string[] = (currentWorkingDir || initialDir).split(/[/\\]/);
                  parts.pop();
                  currentWorkingDir = parts.join("/");
                } else if (targetDir === "~") {
                  // Home directory - utiliser le home directory du workspace
                  const workspaceParts = initialDir.split(/[/\\]/);
                  if (workspaceParts.length >= 2) {
                    currentWorkingDir = workspaceParts.slice(0, 2).join("/");
                  } else {
                    currentWorkingDir = initialDir;
                  }
                } else {
                  // Chemin relatif
                  const basePath: string = currentWorkingDir || initialDir;
                  const separator = basePath.includes("/") ? "/" : "\\";
                  currentWorkingDir = basePath + separator + targetDir;
                }

                // Normaliser le chemin (utiliser / partout)
                if (currentWorkingDir) {
                  currentWorkingDir = currentWorkingDir.replace(/\\/g, "/");
                }
              }
            }
          }
        }
      }
    }

    return currentWorkingDir || initialDir;
  } catch {
    // En cas d'erreur, retourner le répertoire initial
    return initialDir;
  }
}

async function loadConfig(): Promise<StatuslineConfig> {
  try {
    const content = await readFile(CONFIG_FILE_PATH, "utf-8");
    const userConfig = JSON.parse(content);
    return { ...defaultConfig, ...userConfig };
  } catch {
    return defaultConfig;
  }
}

interface ContextInfo {
  tokens: number | null;
  percentage: number | null;
  lastOutputTokens: number | null;
}

async function getContextInfo(
  input: HookInput,
  config: StatuslineConfig
): Promise<ContextInfo> {
  const now = Date.now();

  // Vérifier le cache pour éviter les flickers
  if (contextCache && (now - contextCache.timestamp) < CACHE_TTL) {
    return contextCache.data;
  }

  let result: ContextInfo;

  // Priorité absolue au payload si disponible (plus précis)
  const usePayloadContext =
    config.context.usePayloadContextWindow && input.context_window;

  if (usePayloadContext) {
    const current = input.context_window?.current_usage;
    if (current) {
      const tokens =
        (current.input_tokens || 0) +
        (current.cache_creation_input_tokens || 0) +
        (current.cache_read_input_tokens || 0);
      const maxTokens =
        input.context_window?.context_window_size ||
        config.context.maxContextTokens;
      const percentage = Math.min(
        100,
        Math.round((tokens / maxTokens) * 100)
      );
      result = { tokens, percentage, lastOutputTokens: null };

      // Mettre en cache uniquement si on a des données valides
      if (tokens > 0) {
        contextCache = { timestamp: now, data: result };
      }
      return result;
    }
  }

  // Fallback sur le transcript SEULEMENT si le payload n'est pas disponible
  // et qu'on n'a pas de cache récent (éviter les sauts 36% → 0%)
  // Extended cache (3x CACHE_TTL = 6 seconds) prevents flickering when:
  // - Payload context is temporarily unavailable
  // - Context is being recalculated
  // - Cache is being invalidated
  if (contextCache && (now - contextCache.timestamp) < (CACHE_TTL * 3)) {
    // Garder la valeur cached pendant 6 secondes de plus pour éviter les sauts
    // This smooths transitions between different context calculation methods
    return contextCache.data;
  }

  const contextData = await getContextData({
    transcriptPath: input.transcript_path,
    maxContextTokens: config.context.maxContextTokens,
    autocompactBufferTokens: config.context.autocompactBufferTokens,
    useUsableContextOnly: config.context.useUsableContextOnly,
    overheadTokens: config.context.overheadTokens,
  });

  result = {
    tokens: contextData.tokens,
    percentage: contextData.percentage,
    lastOutputTokens: contextData.lastOutputTokens,
  };

  // Mettre en cache
  if (contextData.tokens !== null && contextData.percentage !== null) {
    contextCache = { timestamp: now, data: result };
  }

  return result;
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

async function main() {
  try {
    const input: HookInput = await Bun.stdin.json();

    // Ensure data directory exists
    const dataDir = dirname(LAST_PAYLOAD_PATH);
    try {
      await mkdir(dataDir, { recursive: true });
    } catch {
      // Directory might already exist, that's fine
    }

    // Save last payload for debugging
    await writeFile(LAST_PAYLOAD_PATH, JSON.stringify(input, null, 2));

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
    const contextInfo = await getContextInfo(input, config);
    const spendInfo = await getSpendInfo(currentResetsAt);

    // Token tracking
    const currentUsage = contextInfo.tokens || 0;
    // Generate session ID from workspace path to detect parallel sessions
    const sessionId = input.workspace.current_dir;
    const tokenTracker = await loadTokenTracker(currentUsage, sessionId);
    const { diff: tokenDiff, shouldShow: showTokenDiff } = getTokenDiff(
      currentUsage,
      tokenTracker
    );

    // Always update timestamp even if no new tokens (for timeout to work)
    const updatedTracker = updateTracker(tokenTracker, currentUsage);
    await saveTokenTracker(updatedTracker);

    // Tracker le répertoire de travail dynamique
    let workingDir = await trackWorkingDirectory(
      input.transcript_path,
      input.workspace.current_dir
    );

    // Try to get more accurate current directory from transcript
    // Look for the last bash command with a cwd parameter
    try {
      if (input.transcript_path) {
        const transcriptContent = await readFile(input.transcript_path, "utf-8");
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
      dirPath: formatPath(workingDir, config.pathDisplayMode),
      modelName: input.model.display_name,
      sessionCost: formatCost(
        input.cost.total_cost_usd,
        config.session.cost.format
      ),
      sessionDuration: formatDuration(input.cost.total_duration_ms),
      contextTokens: contextInfo.tokens,
      contextPercentage: contextInfo.percentage,
      lastOutputTokens: contextInfo.lastOutputTokens,
      tokenDiff: showTokenDiff ? tokenDiff : undefined,
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
