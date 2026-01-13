/**
 * Default configuration values
 */
export declare const defaultConfigJson: {
    features: {
        usageLimits: boolean;
        spendTracking: boolean;
    };
    oneLine: boolean;
    showSonnetModel: boolean;
    pathDisplayMode: "truncated";
    git: {
        enabled: boolean;
        showBranch: boolean;
        showDirtyIndicator: boolean;
        showChanges: boolean;
        showStaged: boolean;
        showUnstaged: boolean;
    };
    separator: string;
    session: {
        infoSeparator: null;
        cost: {
            enabled: boolean;
            format: "decimal1";
        };
        duration: {
            enabled: boolean;
        };
        tokens: {
            enabled: boolean;
            showMax: boolean;
            showDecimals: boolean;
        };
        percentage: {
            enabled: boolean;
            showValue: boolean;
            progressBar: {
                enabled: boolean;
                length: number;
                style: "braille";
                color: "progressive";
                background: "none";
            };
        };
    };
    context: {
        usePayloadContextWindow: boolean;
        maxContextTokens: number;
        autocompactBufferTokens: number;
        useUsableContextOnly: boolean;
        overheadTokens: number;
    };
    limits: {
        enabled: boolean;
        showTimeLeft: boolean;
        showPacingDelta: boolean;
        cost: {
            enabled: boolean;
            format: "decimal1";
        };
        percentage: {
            enabled: boolean;
            showValue: boolean;
            progressBar: {
                enabled: boolean;
                length: number;
                style: "braille";
                color: "progressive";
                background: "none";
            };
        };
    };
    weeklyUsage: {
        enabled: "90%";
        showTimeLeft: boolean;
        showPacingDelta: boolean;
        cost: {
            enabled: boolean;
            format: "decimal1";
        };
        percentage: {
            enabled: boolean;
            showValue: boolean;
            progressBar: {
                enabled: boolean;
                length: number;
                style: "braille";
                color: "progressive";
                background: "none";
            };
        };
    };
    dailySpend: {
        cost: {
            enabled: boolean;
            format: "decimal1";
        };
    };
};
