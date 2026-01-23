import type { StatuslineConfig } from "./config-types.js";
export interface UsageLimit {
    utilization: number;
    resets_at: string;
}
export interface GitInsertions {
    additions: number;
    deletions: number;
    modifications: number;
}
export interface StatuslineData {
    branch: string;
    gitInsertions?: GitInsertions;
    dirPath: string;
    modelName: string;
    sessionCost: string;
    sessionDuration: string;
    contextTokens: number | null;
    contextPercentage: number | null;
    lastOutputTokens: number | null;
    tokenDiff?: number;
    baseContext?: number;
    transcriptContext?: number;
    userTokens?: number;
    usageLimits?: {
        five_hour: UsageLimit | null;
        seven_day: UsageLimit | null;
    };
    periodCost?: number;
    todayCost?: number;
}
/**
 * Render statusline output
 *
 * Order: Branch • INSERTIONS • Path • Model • Cost • Tokens • ProgressBar • Percentage • Duration
 */
export declare function renderStatusline(data: StatuslineData, config: StatuslineConfig): string;
