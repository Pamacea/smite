import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join, normalize } from "node:path";
let baseContextCache = null;
const BASE_CONTEXT_CACHE_TTL = 60000; // 60 seconds
/**
 * Estimate tokens from text using ~3.5 characters per token
 * Balanced average between code (4) and text (3)
 */
function estimateTokens(text) {
    return Math.round(text.length / 3.5);
}
/**
 * Read and tokenize all base context files
 * Caches results for performance
 */
export async function getBaseContextTokens(baseContextPath, workspaceDir) {
    const now = Date.now();
    if (baseContextCache &&
        now - baseContextCache.timestamp < BASE_CONTEXT_CACHE_TTL) {
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
            const content = await readFile(claudeMdPath, "utf-8");
            totalTokens += estimateTokens(content);
        }
        // Read .clauderules
        if (existsSync(clauderulesPath)) {
            const content = await readFile(clauderulesPath, "utf-8");
            totalTokens += estimateTokens(content);
        }
        // Read all .md files in rules directory
        if (existsSync(rulesDir)) {
            const files = await readdir(rulesDir);
            for (const file of files) {
                if (file.endsWith(".md")) {
                    const filePath = join(rulesDir, file);
                    const content = await readFile(filePath, "utf-8");
                    totalTokens += estimateTokens(content);
                }
            }
        }
        // Read workspace-specific base context if provided
        if (workspaceDir) {
            const workspaceClaudeMd = join(workspaceDir, ".claude", "CLAUDE.md");
            const workspaceRulesDir = join(workspaceDir, ".claude", "rules");
            if (existsSync(workspaceClaudeMd)) {
                const content = await readFile(workspaceClaudeMd, "utf-8");
                totalTokens += estimateTokens(content);
            }
            if (existsSync(workspaceRulesDir)) {
                const files = await readdir(workspaceRulesDir);
                for (const file of files) {
                    if (file.endsWith(".md")) {
                        const filePath = join(workspaceRulesDir, file);
                        const content = await readFile(filePath, "utf-8");
                        totalTokens += estimateTokens(content);
                    }
                }
            }
        }
        baseContextCache = { timestamp: now, tokens: totalTokens };
    }
    catch {
        // If scanning fails, return 0
        totalTokens = 0;
    }
    return totalTokens;
}
/**
 * Calculate context tokens from transcript file
 * NOTE: The payload's current_usage is always 0, so we estimate from transcript content
 */
export async function getContextData(options) {
    const { transcriptPath, maxContextTokens, autocompactBufferTokens, useUsableContextOnly, overheadTokens, includeBaseContext, baseContextPath, workspaceDir, } = options;
    try {
        const content = await readFile(transcriptPath, "utf-8");
        const lines = content.split("\n").filter((line) => line.trim());
        let transcriptChars = 0;
        let systemChars = 0;
        let messageCount = 0;
        for (const line of lines) {
            try {
                const entry = JSON.parse(line);
                if (entry.type === "system") {
                    systemChars += line.length;
                }
                else if (entry.type === "user" || entry.type === "assistant") {
                    transcriptChars += line.length;
                    messageCount++;
                }
            }
            catch {
                continue;
            }
        }
        // Estimate transcript tokens (using improved 3.5 ratio)
        const transcriptTokens = Math.round(transcriptChars / 3.5) || 0;
        const systemTokens = Math.round(systemChars / 3.5) || 0;
        // Calculate base context from files if enabled
        let baseContextTokens = 0;
        if (includeBaseContext && baseContextPath) {
            try {
                baseContextTokens = await getBaseContextTokens(baseContextPath, workspaceDir);
                // Ensure we got a valid number
                if (!isFinite(baseContextTokens) || baseContextTokens < 0) {
                    baseContextTokens = 0;
                }
            }
            catch {
                baseContextTokens = 0;
            }
        }
        // Total = transcript + system messages + base context files + overhead
        const totalTokens = (transcriptTokens + systemTokens + baseContextTokens + overheadTokens) || 0;
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
        const percentage = Math.min(100, Math.round(((usableTokens || 0) / maxContextTokens) * 100)) || 0;
        const lastOutputTokens = null;
        return {
            tokens: usableTokens,
            percentage,
            lastOutputTokens,
            baseContext: baseContextTokens + systemTokens,
            transcriptContext: transcriptTokens,
        };
    }
    catch (error) {
        // Log error for debugging
        console.error(`[statusline] Error calculating context:`, error);
        return {
            tokens: null,
            percentage: null,
            lastOutputTokens: null,
        };
    }
}
