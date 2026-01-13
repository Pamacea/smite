#!/usr/bin/env bun
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
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
            return { tokens, percentage };
        }
        return { tokens: null, percentage: null };
    }
    const contextData = await getContextData({
        transcriptPath: input.transcript_path,
        maxContextTokens: config.context.maxContextTokens,
        autocompactBufferTokens: config.context.autocompactBufferTokens,
        useUsableContextOnly: config.context.useUsableContextOnly,
        overheadTokens: config.context.overheadTokens,
    });
    return {
        tokens: contextData.tokens,
        percentage: contextData.percentage,
    };
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
        const data = {
            branch: formatBranch(git, config.git),
            dirPath: formatPath(input.workspace.current_dir, config.pathDisplayMode),
            modelName: input.model.display_name,
            sessionCost: formatCost(input.cost.total_cost_usd, config.session.cost.format),
            sessionDuration: formatDuration(input.cost.total_duration_ms),
            contextTokens: contextInfo.tokens,
            contextPercentage: contextInfo.percentage,
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
