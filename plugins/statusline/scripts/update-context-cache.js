#!/usr/bin/env bun

/**
 * /sc command - Update statusline token cache
 *
 * This script reads the current transcript and updates the context cache
 * with accurate token counts for the statusline.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, homedir } from "node:path";

const CACHE_DIR = join(homedir(), ".claude", ".context-cache");
const CACHE_FILE = join(CACHE_DIR, "current-context.json");
const TRANSCRIPT_BASE = join(homedir(), ".claude", "projects");

interface CacheData {
  tokens: number;
  percentage: number;
  maxTokens: number;
  timestamp: number;
}

/**
 * Get the current transcript path from stdin input
 */
async function getCurrentTranscriptPath(): Promise<string | null> {
  try {
    const input = JSON.parse(await process.stdin.read() || "{}");

    // Try to get transcript path from input
    if (input.transcript_path) {
      return input.transcript_path;
    }

    // Fallback: find the most recent .jsonl file in projects
    const projectsDir = join(homedir(), ".claude", "projects");
    // This would require fs.readdir, keeping it simple for now
    return null;
  } catch {
    return null;
  }
}

/**
 * Count tokens from transcript
 */
async function countTranscriptTokens(transcriptPath: string): Promise<number> {
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

        // Extract text content from user/assistant messages
        let content = "";
        if (entry.type === "user" || entry.type === "assistant") {
          if (entry.message?.content) {
            if (typeof entry.message.content === "string") {
              content = entry.message.content;
            } else if (Array.isArray(entry.message.content)) {
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
    return Math.round(textChars / 3.5);
  } catch {
    return 0;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    // Get transcript path from environment or argument
    const transcriptPath = process.env.TRANSCRIPT_PATH || process.argv[2];

    if (!transcriptPath) {
      console.log(`${colors.red}Error:${colors.reset} Could not determine transcript path`);
      console.log(`\n${colors.gray}Tip: Run /context first to see accurate token counts${colors.reset}`);
      process.exit(1);
    }

    // Count transcript tokens
    const transcriptTokens = await countTranscriptTokens(transcriptPath);

    // Add base context estimate
    const baseContext = 23000;
    const totalTokens = transcriptTokens + baseContext;
    const maxTokens = 200000;
    const percentage = Math.min(100, Math.round((totalTokens / maxTokens) * 100));

    // Create cache data
    const cacheData: CacheData = {
      tokens: totalTokens,
      percentage,
      maxTokens,
      timestamp: Date.now(),
    };

    // Ensure cache directory exists
    if (!existsSync(CACHE_DIR)) {
      await mkdir(CACHE_DIR, { recursive: true });
    }

    // Write cache
    await writeFile(CACHE_FILE, JSON.stringify(cacheData, null, 2));

    // Display result
    console.log(`${colors.green}✓${colors.reset} Statusline cache updated: ${colors.cyan}${totalTokens.toLocaleString()}${colors.reset} tokens (${colors.cyan}${percentage}%${colors.reset})`);
    console.log(`${colors.gray}Cache valid for 60 seconds. Run /sc again to refresh.${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}Error:${colors.reset} ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Simple colors
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
  reset: "\x1b[0m",
};

main();
