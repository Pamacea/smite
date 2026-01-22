#!/usr/bin/env bun
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
// Import core modules
import { defaultConfig, mergeConfig } from "./lib/config.js";
import { getContextData } from "./lib/context.js";
import { colors, formatBranch, formatCost, formatDuration, formatPath, } from "./lib/formatters.js";
import { getGitStatus } from "./lib/git.js";
import { renderStatusline, } from "./lib/render-pure.js";
// Optional feature imports - just delete the folder to disable!
let getUsageLimits = null;
let getPeriodCost = null;
let getTodayCostV2 = null;
let saveSessionV2 = null;
try {
    const limitsModule = await import("./lib/features/limits.js");
    getUsageLimits = limitsModule.getUsageLimits;
}
catch {
    // Limits feature not available - that's OK!
}
try {
    const spendModule = await import("./lib/features/spend.js");
    getPeriodCost = spendModule.getPeriodCost;
    getTodayCostV2 = spendModule.getTodayCostV2;
    saveSessionV2 = spendModule.saveSessionV2;
}
catch {
    // Spend tracking feature not available - that's OK!
}
// Re-export for backwards compatibility
export { renderStatusline, } from "./lib/render-pure.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CONFIG_FILE_PATH = join(__dirname, "..", "statusline.config.json");
const LAST_PAYLOAD_PATH = join(__dirname, "..", "data", "last_payload.txt");
const CACHE_FILE_PATH = join(__dirname, "..", "data", "context_cache.json");
const TOKEN_TRACKER_PATH = join(homedir(), ".claude", ".token-tracker.json");
const TOKEN_DIFF_TIMEOUT = 5000; // 5 seconds - hide token diff after this time
const SESSION_TIMEOUT = 1800000; // 30 minutes - reset tracker after this time
let contextCache = null;
const CACHE_TTL = 2000; // 2 secondes - éviter les flickers
/**
 * Check if payload tokens are trustworthy for the given transcript path.
 *
 * IMPORTANT: After /clear or /new, the payload contains tokens from the OLD session
 * but the transcriptPath points to the NEW (empty or small) file.
 * In this case, we should NOT trust the payload tokens.
 *
 * We trust the payload ONLY when:
 * 1. The payload transcript path matches the actual transcript path (same session)
 * 2. OR the payload tokens are consistent with the transcript file size
 */
async function shouldTrustPayload(actualTranscriptPath, payloadTranscriptPath, payloadTokens) {
    // Normalize paths for comparison
    const { normalize } = await import("node:path");
    const normalizedActual = normalize(actualTranscriptPath);
    const normalizedPayload = normalize(payloadTranscriptPath);
    // If paths match, payload tokens are for this session - trust them
    if (normalizedActual === normalizedPayload) {
        return { trust: payloadTokens >= 0, reason: "same session" };
    }
    // Paths don't match - this is after /clear or /new
    // The payload tokens are from the OLD session, don't trust them for the new file
    console.error(`[DEBUG] Session mismatch: payload=${payloadTranscriptPath}, actual=${actualTranscriptPath}`);
    return { trust: false, reason: "session mismatch" };
}
/**
 * Find the actual transcript path, handling /clear command
 * After /clear, the payload contains the old transcript path, but a new one was created
 * This function finds the most recent transcript file
 */
async function findActualTranscriptPath(payloadPath) {
    try {
        const { existsSync, readdirSync, statSync } = await import("node:fs");
        const { join, normalize } = await import("node:path");
        // Get the directory containing transcripts
        const transcriptDir = join(payloadPath, "..");
        if (!existsSync(transcriptDir)) {
            return payloadPath;
        }
        // Normalize payload path for consistent comparison (handles \ vs /)
        const normalizedPayloadPath = normalize(payloadPath);
        // Find all .jsonl files and get the most recent one
        const files = readdirSync(transcriptDir);
        const jsonlFiles = files.filter(f => f.endsWith('.jsonl'));
        let newestFile = null;
        let newestMtime = 0;
        for (const file of jsonlFiles) {
            const filePath = join(transcriptDir, file);
            try {
                const stats = statSync(filePath);
                if (stats.mtimeMs > newestMtime) {
                    newestMtime = stats.mtimeMs;
                    newestFile = filePath;
                }
            }
            catch {
                continue;
            }
        }
        // If the newest file is different from payload, we detected a /clear or /new
        // Use normalized paths for comparison to handle Windows path inconsistencies
        if (newestFile) {
            const normalizedNewestFile = normalize(newestFile);
            if (normalizedNewestFile !== normalizedPayloadPath) {
                // Get stats for comparison (may fail if file was deleted)
                try {
                    const payloadStats = statSync(payloadPath);
                    // If newest file is more than 1 second newer, it's a new session
                    // Reduced from 5s to 1s for faster detection
                    if (newestMtime - payloadStats.mtimeMs > 1000) {
                        console.error(`[DEBUG] Detected new session: payload has ${payloadPath} but newest is ${newestFile}`);
                        return newestFile;
                    }
                }
                catch {
                    // Payload file doesn't exist (was deleted), use newest
                    console.error(`[DEBUG] Payload file missing, using newest: ${newestFile}`);
                    return newestFile;
                }
            }
        }
        return payloadPath;
    }
    catch (e) {
        console.error(`[DEBUG] Error finding actual transcript: ${e}`);
        return payloadPath;
    }
}
/**
 * Load token tracker from disk
 */
async function loadTokenTracker(currentUsage, sessionId) {
    try {
        if (existsSync(TOKEN_TRACKER_PATH)) {
            const content = await readFile(TOKEN_TRACKER_PATH, "utf-8");
            const tracker = JSON.parse(content);
            const now = Date.now();
            // Reset tracker if:
            // 1. The tracker is too old (> 30 minutes = likely a new session)
            // 2. Session ID changed (parallel session detected)
            // DO NOT reset based on currentUsage < tracker.lastUsage as this causes false resets
            if (now - tracker.timestamp > SESSION_TIMEOUT ||
                (sessionId && tracker.sessionId && sessionId !== tracker.sessionId)) {
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
    }
    catch (e) {
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
async function saveTokenTracker(tracker) {
    try {
        tracker.timestamp = Date.now();
        await writeFile(TOKEN_TRACKER_PATH, JSON.stringify(tracker, null, 2), "utf-8");
    }
    catch (e) {
        // Fail silently - don't break statusline if we can't save
    }
}
/**
 * Calculate token difference and determine if it should be shown
 * Handles parallel sessions by only showing positive diffs
 */
function getTokenDiff(currentUsage, tracker) {
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
function updateTracker(tracker, currentUsage) {
    const tokenDiff = currentUsage - tracker.lastUsage;
    const now = Date.now();
    const timeSinceLastDiff = now - (tracker.lastDiffTime || 0);
    if (tokenDiff > 0) {
        // New tokens added - active work in progress
        // Keep the baseline (lastUsage) UNCHANGED to ACCUMULATE the diff
        // Only update lastDiffTime to keep the diff visible
        tracker.lastDiffTime = now;
        // Only reset baseline when timeout expires (5s of no activity)
        if (timeSinceLastDiff >= TOKEN_DIFF_TIMEOUT) {
            // Timeout expired - activity stopped, reset baseline
            tracker.lastUsage = currentUsage;
            tracker.lastDiffTime = now;
        }
    }
    else if (tokenDiff < 0) {
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
let currentWorkingDir = null;
/**
 * Parse le transcript pour détecter les changements de répertoire (cd)
 * et retourne le répertoire de travail actuel
 */
async function trackWorkingDirectory(transcriptPath, initialDir) {
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
                let bashCommands = [];
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
                        }
                        else if (innerContent.includes("cd")) {
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
                                }
                                else if (targetDir === "..") {
                                    // Remonter d'un niveau
                                    const parts = (currentWorkingDir || initialDir).split(/[/\\]/);
                                    parts.pop();
                                    currentWorkingDir = parts.join("/");
                                }
                                else if (targetDir === "~") {
                                    // Home directory - utiliser le home directory du workspace
                                    const workspaceParts = initialDir.split(/[/\\]/);
                                    if (workspaceParts.length >= 2) {
                                        currentWorkingDir = workspaceParts.slice(0, 2).join("/");
                                    }
                                    else {
                                        currentWorkingDir = initialDir;
                                    }
                                }
                                else {
                                    // Chemin relatif
                                    const basePath = currentWorkingDir || initialDir;
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
    }
    catch {
        // En cas d'erreur, retourner le répertoire initial
        return initialDir;
    }
}
async function loadConfig() {
    try {
        const content = await readFile(CONFIG_FILE_PATH, "utf-8");
        const userConfig = JSON.parse(content);
        return mergeConfig(userConfig);
    }
    catch {
        return defaultConfig;
    }
}
async function getContextInfo(input, config, actualTranscriptPath // ✅ Pass actual transcript path for cache key
) {
    const now = Date.now();
    let result;
    // DEBUG: Log what we're receiving
    console.error(`[DEBUG] usePayloadContextWindow: ${config.context.usePayloadContextWindow}`);
    console.error(`[DEBUG] input.transcript_path: ${input.transcript_path}`);
    console.error(`[DEBUG] actualTranscriptPath: ${actualTranscriptPath}`);
    console.error(`[DEBUG] detectedClearSession: ${actualTranscriptPath !== input.transcript_path}`);
    console.error(`[DEBUG] input.context_window: ${!!input.context_window}`);
    if (input.context_window) {
        console.error(`[DEBUG] total_input_tokens: ${input.context_window.total_input_tokens}`);
        console.error(`[DEBUG] current_usage:`, input.context_window.current_usage);
    }
    // Priorité absolue au payload si disponible (plus précis)
    // Le payload contient total_input_tokens qui est le total exact de la session
    // MAIS: après /clear ou /new, le payload a les tokens de l'ANCIENNE session
    // On doit donc vérifier que le payload correspond au transcript actuel
    let usePayloadContext = config.context.usePayloadContextWindow && !!input.context_window;
    // Check if we should trust the payload data for THIS session
    if (usePayloadContext && input.context_window) {
        const payloadTokens = input.context_window.total_input_tokens || 0;
        const { trust: trustPayload, reason } = await shouldTrustPayload(actualTranscriptPath, input.transcript_path, payloadTokens);
        console.error(`[DEBUG] Trust payload: ${trustPayload} (reason: ${reason})`);
        if (!trustPayload) {
            usePayloadContext = false; // Force fallback to transcript calculation
        }
    }
    if (usePayloadContext && input.context_window) {
        // Try current_usage first (real-time tracking)
        const current = input.context_window.current_usage;
        let tokens = 0;
        let maxTokens = input.context_window.context_window_size || config.context.maxContextTokens;
        if (current) {
            tokens =
                (current.input_tokens || 0) +
                    (current.cache_creation_input_tokens || 0) +
                    (current.cache_read_input_tokens || 0);
        }
        // If current_usage is 0, fall back to total_input_tokens (session total)
        if (tokens === 0 && input.context_window.total_input_tokens) {
            tokens = input.context_window.total_input_tokens;
        }
        // Only use payload context if it has valid data (>0 tokens)
        // Otherwise fall back to transcript-based calculation
        if (tokens > 0) {
            const percentage = Math.min(100, Math.round((tokens / maxTokens) * 100));
            console.error(`[DEBUG] Using payload context: ${tokens} tokens (${percentage}%)`);
            // Calculate base context for display breakdown
            // NOTE: We only count global ~/.claude/ files, NOT workspace .claude/
            let baseContextTokens = 0;
            if (config.context.includeBaseContext && config.context.baseContextPath) {
                try {
                    const { getBaseContextTokens } = await import("./lib/context.js");
                    baseContextTokens = await getBaseContextTokens(config.context.baseContextPath);
                    if (!isFinite(baseContextTokens) || baseContextTokens < 0) {
                        baseContextTokens = 0;
                    }
                }
                catch {
                    baseContextTokens = 0;
                }
            }
            // Estimate transcript: total - base context
            // (payload includes everything, so we reverse-calculate transcript)
            const transcriptTokens = Math.max(0, tokens - baseContextTokens);
            result = {
                tokens,
                percentage,
                lastOutputTokens: null,
                baseContext: baseContextTokens,
                transcriptContext: transcriptTokens,
                userTokens: transcriptTokens // User tokens exclude system/base context
            };
            // Mettre en cache uniquement si on a des données valides
            // Use actualTranscriptPath as sessionId - it changes with /new and /clear
            contextCache = { timestamp: now, sessionId: actualTranscriptPath, data: result };
            return result;
        }
        console.error(`[DEBUG] Payload context not available, falling back to transcript`);
    }
    // Fallback sur le transcript SEULEMENT si le payload n'est pas disponible
    // et qu'on n'a pas de cache récent (éviter les sauts 36% → 0%)
    // Extended cache (3x CACHE_TTL = 6 seconds) prevents flickering when:
    // - Payload context is temporarily unavailable
    // - Context is being recalculated
    // - Cache is being invalidated
    // IMPORTANT: Don't use cache if session changed OR tokens are null/0
    // Session is tracked by actualTranscriptPath (changes with /new and /clear)
    if (contextCache &&
        contextCache.sessionId === actualTranscriptPath && // ✅ Check by transcript path
        (now - contextCache.timestamp) < (CACHE_TTL * 3) &&
        contextCache.data.tokens !== null &&
        contextCache.data.tokens > 0) {
        // Garder la valeur cached pendant 6 secondes de plus pour éviter les sauts
        // This smooths transitions between different context calculation methods
        return contextCache.data;
    }
    const contextData = await getContextData({
        transcriptPath: actualTranscriptPath,
        maxContextTokens: config.context.maxContextTokens,
        autocompactBufferTokens: config.context.autocompactBufferTokens,
        useUsableContextOnly: config.context.useUsableContextOnly,
        overheadTokens: config.context.overheadTokens,
        includeBaseContext: config.context.includeBaseContext,
        baseContextPath: config.context.baseContextPath,
        // NOTE: workspaceDir removed - we don't count project .claude/ in base context
    });
    result = {
        tokens: contextData.tokens,
        percentage: contextData.percentage,
        lastOutputTokens: contextData.lastOutputTokens,
        baseContext: contextData.baseContext,
        transcriptContext: contextData.transcriptContext,
        userTokens: contextData.userTokens,
    };
    // Mettre en cache (use actualTranscriptPath as sessionId)
    if (contextData.tokens !== null && contextData.percentage !== null) {
        contextCache = { timestamp: now, sessionId: actualTranscriptPath, data: result };
    }
    return result;
}
async function getSpendInfo(currentResetsAt) {
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
        // Read stdin using chunks since Bun.stdin.json() can hang
        const chunks = [];
        for await (const chunk of Bun.stdin.stream()) {
            chunks.push(Buffer.from(chunk));
        }
        const stdinContent = Buffer.concat(chunks).toString();
        const input = JSON.parse(stdinContent);
        // Ensure data directory exists
        const dataDir = dirname(LAST_PAYLOAD_PATH);
        try {
            await mkdir(dataDir, { recursive: true });
        }
        catch {
            // Directory might already exist, that's fine
        }
        // Save last payload for debugging
        await writeFile(LAST_PAYLOAD_PATH, JSON.stringify(input, null, 2));
        // Find the actual transcript path (handles /clear command)
        const actualTranscriptPath = await findActualTranscriptPath(input.transcript_path);
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
        const contextInfo = await getContextInfo(input, config, actualTranscriptPath);
        const spendInfo = await getSpendInfo(currentResetsAt);
        // Token tracking
        const currentUsage = contextInfo.tokens || 0;
        // Use actual transcript path as unique session ID (changes with /clear command)
        const sessionId = actualTranscriptPath;
        const tokenTracker = await loadTokenTracker(currentUsage, sessionId);
        let { diff: tokenDiff, shouldShow: showTokenDiff } = getTokenDiff(currentUsage, tokenTracker);
        // Detect spurious diffs from base context calculation changes or session resets
        // If diff is unreasonably large (>50K in either direction), it's likely due to:
        // - Base context being added/changed in config
        // - New session (/new command) starting from 0
        // - Context window reset/clear
        // Threshold of 50K is safe because normal token additions are <10K per update
        const SPURIOUS_DIFF_THRESHOLD = 50000;
        if (Math.abs(tokenDiff) > SPURIOUS_DIFF_THRESHOLD) {
            // This is likely a spurious diff - don't show it and reset baseline
            showTokenDiff = false;
            tokenTracker.lastUsage = currentUsage;
            tokenTracker.timestamp = Date.now();
            await saveTokenTracker(tokenTracker);
        }
        else {
            // Normal path: update tracker with actual changes
            const updatedTracker = updateTracker(tokenTracker, currentUsage);
            await saveTokenTracker(updatedTracker);
        }
        // Tracker le répertoire de travail dynamique
        let workingDir = await trackWorkingDirectory(actualTranscriptPath, input.workspace.current_dir);
        // Try to get more accurate current directory from transcript
        // Look for the last bash command with a cwd parameter
        try {
            if (actualTranscriptPath) {
                const transcriptContent = await readFile(actualTranscriptPath, "utf-8");
                const transcript = JSON.parse(transcriptContent);
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
        }
        catch (e) {
            // Use tracked directory if transcript can't be read
        }
        const data = {
            branch: formatBranch(git, config.git),
            dirPath: formatPath(workingDir, config.pathDisplayMode),
            modelName: input.model.display_name,
            sessionCost: formatCost(input.cost.total_cost_usd, config.session.cost.format),
            sessionDuration: formatDuration(input.cost.total_duration_ms),
            contextTokens: contextInfo.tokens,
            contextPercentage: contextInfo.percentage,
            lastOutputTokens: contextInfo.lastOutputTokens,
            tokenDiff: showTokenDiff ? tokenDiff : undefined,
            baseContext: contextInfo.baseContext,
            transcriptContext: contextInfo.transcriptContext,
            userTokens: contextInfo.userTokens,
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
                input_transcript: input.transcript_path,
                actual_transcript: actualTranscriptPath,
                detected_clear: actualTranscriptPath !== input.transcript_path,
                context_tokens: contextInfo.tokens,
                user_tokens: contextInfo.userTokens,
                total_input_tokens: input.context_window?.total_input_tokens,
            }, null, 2));
        }
        catch { }
        if (config.oneLine) {
            console.log("");
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`${colors.red}Error:${colors.reset} ${errorMessage}`);
        console.log(`${colors.gray}Check statusline configuration${colors.reset}`);
    }
}
main();
