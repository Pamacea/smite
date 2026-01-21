import { readFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join, normalize } from "node:path";
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";

export interface ContextData {
  tokens: number | null;
  percentage: number | null;
  lastOutputTokens: number | null;
  baseContext?: number;
  transcriptContext?: number;
}

export interface ContextOptions {
  transcriptPath: string;
  maxContextTokens: number;
  autocompactBufferTokens: number;
  useUsableContextOnly: boolean;
  overheadTokens: number;
  includeBaseContext?: boolean;
  baseContextPath?: string;
  workspaceDir?: string;
}

// Cache for base context calculation (60 second TTL)
interface BaseContextCache {
  timestamp: number;
  tokens: number;
}

let baseContextCache: BaseContextCache | null = null;
const BASE_CONTEXT_CACHE_TTL = 60000; // 60 seconds

// Memory management limits
const MAX_TRANSCRIPT_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_TRANSCRIPT_LINES = 5000; // Only read last 5000 lines for large files
const MAX_FILE_SIZE_MB = 1; // 1MB limit for context files

/**
 * Estimate tokens from text using ~3.5 characters per token
 * Balanced average between code (4) and text (3)
 */
function estimateTokens(text: string): number {
  return Math.round(text.length / 3.5);
}

/**
 * Safely read a file with size limit
 */
async function safeReadFile(filePath: string, maxsizeMB: number): Promise<string | null> {
  try {
    const stats = await stat(filePath);
    const maxSizeBytes = maxsizeMB * 1024 * 1024;

    if (stats.size > maxSizeBytes) {
      console.error(
        `[statusline] File too large: ${filePath} (${Math.round(stats.size / 1024 / 1024)}MB > ${maxsizeMB}MB)`
      );
      return null;
    }

    return await readFile(filePath, "utf-8");
  } catch (error) {
    return null;
  }
}

/**
 * Read last N lines from a file efficiently using streaming
 */
async function readLastLines(filePath: string, maxLines: number): Promise<string[]> {
  const fileStats = await stat(filePath);

  // For small files, read entirely
  if (fileStats.size < MAX_TRANSCRIPT_FILE_SIZE) {
    const content = await readFile(filePath, "utf-8");
    return content.split("\n").filter((line) => line.trim());
  }

  // For large files, stream and keep last N lines
  const lines: string[] = [];
  const rl = createInterface({
    input: createReadStream(filePath, { encoding: "utf-8" }),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (line.trim()) {
      lines.push(line);
      // Keep only last N lines
      if (lines.length > maxLines) {
        lines.shift();
      }
    }
  }

  return lines;
}

/**
 * Read and tokenize all base context files
 * Caches results for performance
 */
export async function getBaseContextTokens(
  baseContextPath: string,
  workspaceDir?: string
): Promise<number> {
  const now = Date.now();

  if (
    baseContextCache &&
    now - baseContextCache.timestamp < BASE_CONTEXT_CACHE_TTL
  ) {
    return baseContextCache.tokens;
  }

  let totalTokens = 0;

  try {
    // Normalize path for Windows compatibility
    const normalizedBasePath = normalize(baseContextPath).replace(/^~/, homedir());
    const claudeMdPath = join(normalizedBasePath, "CLAUDE.md");
    const clauderulesPath = join(normalizedBasePath, ".clauderules");
    const rulesDir = join(normalizedBasePath, "rules");

    // Read main CLAUDE.md
    if (existsSync(claudeMdPath)) {
      const content = await safeReadFile(claudeMdPath, MAX_FILE_SIZE_MB);
      if (content) {
        totalTokens += estimateTokens(content);
      }
    }

    // Read .clauderules
    if (existsSync(clauderulesPath)) {
      const content = await safeReadFile(clauderulesPath, MAX_FILE_SIZE_MB);
      if (content) {
        totalTokens += estimateTokens(content);
      }
    }

    // Read all .md files in rules directory
    if (existsSync(rulesDir)) {
      const files = await readdir(rulesDir);
      for (const file of files) {
        if (file.endsWith(".md")) {
          const filePath = join(rulesDir, file);
          const content = await safeReadFile(filePath, MAX_FILE_SIZE_MB);
          if (content) {
            totalTokens += estimateTokens(content);
          }
        }
      }
    }

    // Read workspace-specific base context if provided
    if (workspaceDir) {
      const workspaceClaudeMd = join(workspaceDir, ".claude", "CLAUDE.md");
      const workspaceRulesDir = join(workspaceDir, ".claude", "rules");

      if (existsSync(workspaceClaudeMd)) {
        const content = await safeReadFile(workspaceClaudeMd, MAX_FILE_SIZE_MB);
        if (content) {
          totalTokens += estimateTokens(content);
        }
      }

      if (existsSync(workspaceRulesDir)) {
        const files = await readdir(workspaceRulesDir);
        for (const file of files) {
          if (file.endsWith(".md")) {
            const filePath = join(workspaceRulesDir, file);
            const content = await safeReadFile(filePath, MAX_FILE_SIZE_MB);
            if (content) {
              totalTokens += estimateTokens(content);
            }
          }
        }
      }
    }

    baseContextCache = { timestamp: now, tokens: totalTokens };
  } catch {
    // If scanning fails, return 0
    totalTokens = 0;
  }

  return totalTokens;
}

/**
 * Calculate context tokens from transcript file
 * NOTE: The payload's current_usage is always 0, so we estimate from transcript content
 */
export async function getContextData(
  options: ContextOptions
): Promise<ContextData> {
  const {
    transcriptPath,
    maxContextTokens,
    autocompactBufferTokens,
    useUsableContextOnly,
    overheadTokens,
    includeBaseContext,
    baseContextPath,
    workspaceDir,
  } = options;

  try {
    // Use streaming read for large transcripts to avoid memory issues
    const lines = await readLastLines(transcriptPath, MAX_TRANSCRIPT_LINES);

    let transcriptChars = 0;
    let systemChars = 0;
    let messageCount = 0;

    for (const line of lines) {
      try {
        const entry = JSON.parse(line);

        // System messages (reminders) are already counted in baseContext
        // so we skip them here to avoid double-counting
        if (entry.type === "user" || entry.type === "assistant") {
          transcriptChars += line.length;
          messageCount++;
        }
      } catch {
        continue;
      }
    }

    // Estimate transcript tokens (using improved 3.5 ratio)
    const transcriptTokens = Math.round(transcriptChars / 3.5) || 0;

    // Calculate base context from files if enabled
    let baseContextTokens = 0;
    if (includeBaseContext && baseContextPath) {
      try {
        baseContextTokens = await getBaseContextTokens(baseContextPath, workspaceDir);
        // Ensure we got a valid number
        if (!isFinite(baseContextTokens) || baseContextTokens < 0) {
          baseContextTokens = 0;
        }
      } catch {
        baseContextTokens = 0;
      }
    }

    // Total = transcript + base context files + overhead
    // (system messages are excluded as they're already in baseContext)
    const totalTokens = (transcriptTokens + baseContextTokens + overheadTokens) || 0;

    // Calculate usable context
    let usableTokens = totalTokens;
    if (useUsableContextOnly) {
      usableTokens = Math.max(0, totalTokens - autocompactBufferTokens);
    }

    // If usable tokens is 0 but total tokens > 0, use total tokens for small sessions
    // This prevents showing 0 for sessions that are smaller than the autocompact buffer
    if (usableTokens === 0 && totalTokens > 0) {
      usableTokens = totalTokens;
    }

    const percentage = Math.min(
      100,
      Math.round(((usableTokens || 0) / maxContextTokens) * 100)
    ) || 0;

    const lastOutputTokens = null;

    return {
      tokens: usableTokens,
      percentage,
      lastOutputTokens,
      baseContext: baseContextTokens,
      transcriptContext: transcriptTokens,
    };
  } catch (error) {
    // Log error for debugging
    console.error(`[statusline] Error calculating context:`, error);
    return {
      tokens: null,
      percentage: null,
      lastOutputTokens: null,
    };
  }
}
