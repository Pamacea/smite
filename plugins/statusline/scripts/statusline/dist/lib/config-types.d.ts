/**
 * Statusline configuration types
 */
export interface CostConfig {
    enabled: boolean;
    format: "decimal1" | "decimal2" | "decimal3";
}
export interface PercentageConfig {
    enabled: boolean;
    showValue: boolean;
    progressBar: {
        enabled: boolean;
        length: number;
        style: "braille" | "blocks" | "percentage";
        color: "progressive" | "single";
        background: "none" | "shade" | "dots";
    };
}
export interface GitConfig {
    enabled: boolean;
    showBranch: boolean;
    showDirtyIndicator: boolean;
    showChanges: boolean;
    showStaged: boolean;
    showUnstaged: boolean;
}
export interface SessionConfig {
    infoSeparator: string | null;
    cost: CostConfig;
    duration: {
        enabled: boolean;
    };
    tokens: {
        enabled: boolean;
        showMax: boolean;
        showDecimals: boolean;
    };
    percentage: PercentageConfig;
}
export interface ContextConfig {
    usePayloadContextWindow: boolean;
    maxContextTokens: number;
    autocompactBufferTokens: number;
    useUsableContextOnly: boolean;
    overheadTokens: number;
    includeBaseContext: boolean;
    baseContextPath: string;
    showContextBreakdown: boolean;
}
export interface LimitsConfig {
    enabled: boolean;
    showTimeLeft: boolean;
    showPacingDelta: boolean;
    cost: CostConfig;
    percentage: PercentageConfig;
}
export interface WeeklyUsageConfig {
    enabled: string | boolean;
    showTimeLeft: boolean;
    showPacingDelta: boolean;
    cost: CostConfig;
    percentage: PercentageConfig;
}
export interface DailySpendConfig {
    cost: CostConfig;
}
export interface FeaturesConfig {
    usageLimits: boolean;
    spendTracking: boolean;
}
export interface StatuslineConfig {
    features: FeaturesConfig;
    oneLine: boolean;
    showSonnetModel: boolean;
    pathDisplayMode: "full" | "truncated" | "basename";
    git: GitConfig;
    separator: string;
    session: SessionConfig;
    context: ContextConfig;
    limits: LimitsConfig;
    weeklyUsage: WeeklyUsageConfig;
    dailySpend: DailySpendConfig;
}
