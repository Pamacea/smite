import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";

/**
 * Plan C: Get token count from /context command output cache.
 *
 * Usage:
 * 1. User runs /context (creates a cache file with current context info)
 * 2. Statusline reads this cache file to get REAL token counts
 * 3. Fallback to simple estimation if cache doesn't exist
 */

const CACHE_DIR = join(homedir(), ".claude", ".context-cache");
const CACHE_FILE = join(CACHE_DIR, "current-context.json");

export interface ContextFromCache {
  tokens: number;
  percentage: number;
  maxTokens: number;
  timestamp: number;
  source: "cache" | "estimate";
}

/**
 * Try to read context info from cache created by /context command.
 * If cache doesn't exist or is stale (> 60 seconds), return null.
 */
async function readFromCache(): Promise<ContextFromCache | null> {
  try {
    if (!existsSync(CACHE_FILE)) {
      return null;
    }

    const content = await readFile(CACHE_FILE, "utf-8");
    const data = JSON.parse(content) as ContextFromCache & { transcriptPath?: string };

    // Check if cache is stale (> 60 seconds)
    const age = Date.now() - data.timestamp;
    if (age > 60000) {
      return null;
    }

    return {
      tokens: data.tokens,
      percentage: data.percentage,
      maxTokens: data.maxTokens,
      timestamp: data.timestamp,
      source: "cache",
    };
  } catch {
    return null;
  }
}

/**
 * Simple estimation from transcript (fallback).
 * Count only user/assistant text messages, skip tool results.
 */
async function estimateFromTranscript(
  transcriptPath: string,
  maxTokens: number
): Promise<ContextFromCache> {
  try {
    const content = await readFile(transcriptPath, "utf-8");
    const lines = content.split("\n").filter(Boolean);

    let textChars = 0;
    const skipTypes = new Set([
      "progress", "thinking", "agent_progress", "bash_progress",
      "hook_progress", "tool_result", "file-history-snapshot"
    ]);

    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        if (skipTypes.has(entry.type)) continue;

        // Extract only text content from user/assistant messages
        let content = "";
        if (entry.type === "user" || entry.type === "assistant") {
          if (entry.message?.content) {
            if (typeof entry.message.content === "string") {
              content = entry.message.content;
            } else if (Array.isArray(entry.message.content)) {
              // Filter out tool_use blocks, keep only text
              const textBlocks = entry.message.content
                .filter((c: any) => c.type === "text")
                .map((c: any) => c.text || "");
              content = textBlocks.join("");
            }
          }
        } else if (entry.type === "text" && entry.text) {
          content = entry.text;
        }

        textChars += content.length;
      } catch {
        continue;
      }
    }

    // Estimate tokens: ~3.5 chars per token
    const estimatedTokens = Math.round(textChars / 3.5);

    // Add base context estimate
    const baseContext = 23000;
    const totalTokens = estimatedTokens + baseContext;
    const percentage = Math.min(100, Math.round((totalTokens / maxTokens) * 100));

    return {
      tokens: totalTokens,
      percentage,
      maxTokens,
      timestamp: Date.now(),
      source: "estimate",
    };
  } catch {
    // Error reading transcript - return base context only
    const baseContext = 23000;
    return {
      tokens: baseContext,
      percentage: Math.round((baseContext / maxTokens) * 100),
      maxTokens,
      timestamp: Date.now(),
      source: "estimate",
    };
  }
}

/**
 * Get context tokens with Plan C approach.
 * 1. Try to read from /context cache (most accurate)
 * 2. Fallback to simple transcript estimation
 */
export async function getContextFromCache(
  transcriptPath: string,
  maxTokens: number = 200000
): Promise<ContextFromCache> {
  // Try cache first
  const cached = await readFromCache();
  if (cached) {
    return cached;
  }

  // Fallback to estimation
  return await estimateFromTranscript(transcriptPath, maxTokens);
}

export { CACHE_DIR, CACHE_FILE };
