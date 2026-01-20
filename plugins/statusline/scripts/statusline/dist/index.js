#!/usr/bin/env bun
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";
// Import core modules
import { defaultConfig } from "./lib/config.js";
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
let contextCache = null;
const CACHE_TTL = 2000; // 2 secondes - éviter les flickers
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
        return { ...defaultConfig, ...userConfig };
    }
    catch {
        return defaultConfig;
    }
}
async function getContextInfo(input, config) {
    const now = Date.now();
    // Vérifier le cache pour éviter les flickers
    if (contextCache && (now - contextCache.timestamp) < CACHE_TTL) {
        return contextCache.data;
    }
    let result;
    // Priorité absolue au payload si disponible (plus précis)
    const usePayloadContext = config.context.usePayloadContextWindow && input.context_window;
    if (usePayloadContext) {
        const current = input.context_window?.current_usage;
        if (current) {
            const tokens = (current.input_tokens || 0) +
                (current.cache_creation_input_tokens || 0) +
                (current.cache_read_input_tokens || 0);
            const maxTokens = input.context_window?.context_window_size ||
                config.context.maxContextTokens;
            const percentage = Math.min(100, Math.round((tokens / maxTokens) * 100));
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
    if (contextCache && (now - contextCache.timestamp) < (CACHE_TTL * 3)) {
        // Garder la valeur cached pendant 6 secondes de plus pour éviter les sauts
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
        const input = await Bun.stdin.json();
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
        // Tracker le répertoire de travail dynamique
        const workingDir = await trackWorkingDirectory(input.transcript_path, input.workspace.current_dir);
        const data = {
            branch: formatBranch(git, config.git),
            dirPath: formatPath(workingDir, config.pathDisplayMode),
            modelName: input.model.display_name,
            sessionCost: formatCost(input.cost.total_cost_usd, config.session.cost.format),
            sessionDuration: formatDuration(input.cost.total_duration_ms),
            contextTokens: contextInfo.tokens,
            contextPercentage: contextInfo.percentage,
            lastOutputTokens: contextInfo.lastOutputTokens,
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
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`${colors.red}Error:${colors.reset} ${errorMessage}`);
        console.log(`${colors.gray}Check statusline configuration${colors.reset}`);
    }
}
main();
