import { readFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join, normalize } from "node:path";
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
let baseContextCache = null;
/**
 * Time-to-live for base context cache.
 * 60 seconds prevents excessive file I/O while ensuring changes
 * to CLAUDE.md or rules are picked up reasonably quickly.
 */
const BASE_CONTEXT_CACHE_TTL = 60000;
// Memory management limits
/**
 * Maximum transcript file size before switching to streaming.
 * 5MB = ~1.4M tokens (theoretical max). Ensures we don't load
 * massive files into memory which could cause performance issues.
 */
const MAX_TRANSCRIPT_FILE_SIZE = 5 * 1024 * 1024;
/**
 * Maximum lines to read from large transcripts.
 * 5000 lines = ~100-200K tokens typical. Balances accuracy
 * with performance for large sessions. Reading more lines would
 * give diminishing returns on accuracy while hurting performance.
 */
const MAX_TRANSCRIPT_LINES = 5000;
/**
 * Maximum file size for context files (CLAUDE.md, rules/*.md).
 * 1MB = ~285K tokens. Prevents loading unexpectedly large files
 * that could indicate misconfiguration or corrupted data.
 */
const MAX_FILE_SIZE_MB = 1;
/**
 * Estimate tokens from text using ~3.5 characters per token
 * Balanced average between code (4) and text (3)
 */
function estimateTokens(text) {
    return Math.round(text.length / 3.5);
}
/**
 * Estimate tokens from character count using ~3.5 characters per token
 * Use this when you already have the character count (avoids string conversion)
 */
function estimateTokensFromCharCount(charCount) {
    return Math.round(charCount / 3.5);
}
/**
 * Safely read a file with size limit
 */
async function safeReadFile(filePath, maxsizeMB) {
    try {
        const stats = await stat(filePath);
        const maxSizeBytes = maxsizeMB * 1024 * 1024;
        if (stats.size > maxSizeBytes) {
            console.error(`[statusline] File too large: ${filePath} (${Math.round(stats.size / 1024 / 1024)}MB > ${maxsizeMB}MB)`);
            return null;
        }
        return await readFile(filePath, "utf-8");
    }
    catch (error) {
        return null;
    }
}
/**
 * Read last N lines from a file efficiently using streaming
 */
export async function readLastLines(filePath, maxLines) {
    const fileStats = await stat(filePath);
    // For small files, read entirely
    if (fileStats.size < MAX_TRANSCRIPT_FILE_SIZE) {
        const content = await readFile(filePath, "utf-8");
        return content.split("\n").filter((line) => line.trim());
    }
    // For large files, stream and keep last N lines
    const lines = [];
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
 * Read first N lines from a file (for detecting session start events)
 */
export async function readFirstLines(filePath, maxLines) {
    const fileStats = await stat(filePath);
    // For small files, read entirely
    if (fileStats.size < MAX_TRANSCRIPT_FILE_SIZE) {
        const content = await readFile(filePath, "utf-8");
        const allLines = content.split("\n").filter((line) => line.trim());
        return allLines.slice(0, maxLines);
    }
    // For large files, stream first N lines
    const lines = [];
    const rl = createInterface({
        input: createReadStream(filePath, { encoding: "utf-8" }),
        crlfDelay: Infinity,
    });
    for await (const line of rl) {
        if (line.trim()) {
            lines.push(line);
            if (lines.length >= maxLines) {
                rl.close();
                break;
            }
        }
    }
    return lines;
}
/**
 * Read and tokenize all base context files
 * Caches results for performance
 * Counts: CLAUDE.md, rules, plugins config/README (not full source code)
 */
export async function getBaseContextTokens(baseContextPath) {
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
        const pluginsDir = join(normalizedBasePath, "plugins");
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
        // Read all .md files in rules directory (recursively)
        if (existsSync(rulesDir)) {
            try {
                const readDirRecursive = async (dir) => {
                    const entries = await readdir(dir, { withFileTypes: true });
                    for (const entry of entries) {
                        const fullPath = join(dir, entry.name);
                        try {
                            if (entry.isDirectory()) {
                                await readDirRecursive(fullPath);
                            }
                            else if (entry.isFile() && entry.name.endsWith(".md")) {
                                const content = await safeReadFile(fullPath, MAX_FILE_SIZE_MB);
                                if (content) {
                                    totalTokens += estimateTokens(content);
                                }
                            }
                        }
                        catch {
                            // Skip file if read fails
                        }
                    }
                };
                await readDirRecursive(rulesDir);
            }
            catch {
                // Skip directory if read fails
            }
        }
        // Count plugins config files (README.md, package.json, etc.)
        // NOT counting full source code to avoid massive token counts
        if (existsSync(pluginsDir)) {
            try {
                const readPluginsRecursive = async (dir, depth) => {
                    // Limit depth to avoid scanning too deep
                    if (depth > 4)
                        return;
                    const entries = await readdir(dir, { withFileTypes: true });
                    for (const entry of entries) {
                        const fullPath = join(dir, entry.name);
                        try {
                            if (entry.isDirectory()) {
                                // Skip node_modules, dist, cache directories
                                if (!["node_modules", "dist", "cache", ".git", "build"].includes(entry.name)) {
                                    await readPluginsRecursive(fullPath, depth + 1);
                                }
                            }
                            else if (entry.isFile()) {
                                // Only count config/documentation files, not source code
                                const name = entry.name.toLowerCase();
                                if (name.endsWith(".md") && name.includes("readme")) {
                                    const content = await safeReadFile(fullPath, MAX_FILE_SIZE_MB);
                                    if (content)
                                        totalTokens += estimateTokens(content);
                                }
                                else if (name === "package.json" || name === "manifest.json" || name === "config.json") {
                                    const content = await safeReadFile(fullPath, 0.1); // 100KB limit for config files
                                    if (content)
                                        totalTokens += estimateTokens(content);
                                }
                            }
                        }
                        catch {
                            // Skip file if read fails
                        }
                    }
                };
                await readPluginsRecursive(pluginsDir, 0);
            }
            catch {
                // Skip directory if read fails
            }
        }
        // Fixed overhead for system prompt, tools, agents (estimated)
        // These are always loaded but not in files
        const systemOverhead = 15000; // ~15K for system prompt, tools definitions
        totalTokens += systemOverhead;
        baseContextCache = { timestamp: now, tokens: totalTokens };
    }
    catch {
        // If scanning fails, return estimated overhead
        totalTokens = 15000;
    }
    return totalTokens;
}
/**
 * Calculate context tokens from transcript file
 * NOTE: The payload's current_usage is always 0, so we estimate from transcript content
 */
export async function getContextData(options) {
    const { transcriptPath, maxContextTokens, autocompactBufferTokens, useUsableContextOnly, overheadTokens, includeBaseContext, baseContextPath, } = options;
    try {
        // Use streaming read for large transcripts to avoid memory issues
        const lines = await readLastLines(transcriptPath, MAX_TRANSCRIPT_LINES);
        let transcriptChars = 0;
        let systemChars = 0;
        let messageCount = 0;
        // Types to skip (internal, not counted toward context)
        const skipTypes = new Set([
            "progress",
            "file-history-snapshot",
            "agent_progress",
            "bash_progress",
            "hook_progress",
            "thinking",
            "js", // Code execution artifacts
            "ts", // TypeScript execution artifacts
        ]);
        for (const line of lines) {
            try {
                const entry = JSON.parse(line);
                // Skip internal entries that don't consume context
                if (skipTypes.has(entry.type)) {
                    continue;
                }
                // Helper to get content from entry (handles nested structures)
                const getContent = () => {
                    // user/assistant entries with nested message.content
                    if ((entry.type === "user" || entry.type === "assistant") && entry.message?.content) {
                        const content = entry.message.content;
                        if (Array.isArray(content)) {
                            // Filter out thinking blocks
                            const nonThinking = content.filter((c) => c.type !== "thinking");
                            return JSON.stringify(nonThinking);
                        }
                        return String(content);
                    }
                    // Generic message entries with nested message.content
                    if (entry.type === "message" && entry.message?.content) {
                        const content = entry.message.content;
                        if (Array.isArray(content)) {
                            // Filter out thinking blocks
                            const nonThinking = content.filter((c) => c.type !== "thinking");
                            return JSON.stringify(nonThinking);
                        }
                        return String(content);
                    }
                    // Legacy format: direct content
                    if (entry.content) {
                        const content = entry.content;
                        if (Array.isArray(content)) {
                            const nonThinking = content.filter((c) => c.type !== "thinking");
                            return JSON.stringify(nonThinking);
                        }
                        return String(content);
                    }
                    // text entries
                    if (entry.type === "text" && entry.text) {
                        return String(entry.text);
                    }
                    // system entries
                    if (entry.type === "system" && entry.content) {
                        return String(entry.content);
                    }
                    return "";
                };
                // Count different message types that consume context tokens
                if (entry.type === "user" || entry.type === "assistant" || entry.type === "message") {
                    transcriptChars += getContent().length;
                    messageCount++;
                }
                else if (entry.type === "tool_result" || entry.type === "tool_use") {
                    // Tool outputs/inputs - these consume tokens
                    const content = entry.content || entry.output || "";
                    const input = entry.input || "";
                    transcriptChars += content.length + input.length;
                    messageCount++;
                }
                else if (entry.type === "text" || entry.type === "system") {
                    // Text and system entries also consume context
                    transcriptChars += getContent().length;
                    messageCount++;
                }
            }
            catch {
                continue;
            }
        }
        // Estimate transcript tokens (using improved 3.5 ratio)
        const transcriptTokens = estimateTokensFromCharCount(transcriptChars);
        // Calculate base context from files if enabled
        // NOTE: Only counts global ~/.claude/ files, NOT workspace .claude/
        let baseContextTokens = 0;
        if (includeBaseContext && baseContextPath) {
            try {
                baseContextTokens = await getBaseContextTokens(baseContextPath);
                // Ensure we got a valid number
                if (!isFinite(baseContextTokens) || baseContextTokens < 0) {
                    baseContextTokens = 0;
                }
            }
            catch {
                baseContextTokens = 0;
            }
        }
        // Total = transcript (messages + tools) + base context files + overhead
        // All of these consume actual context tokens
        const totalTokens = transcriptTokens + baseContextTokens + overheadTokens;
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
            baseContext: baseContextTokens, // included in total
            transcriptContext: transcriptTokens, // messages + tools
            userTokens: transcriptTokens, // user tokens only (excludes system)
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
