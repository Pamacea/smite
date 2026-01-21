/**
 * Default configuration values
 */
export const defaultConfigJson = {
  features: {
    usageLimits: true,
    spendTracking: true,
  },
  oneLine: true,
  showSonnetModel: false,
  pathDisplayMode: "truncated" as const,
  git: {
    enabled: true,
    showBranch: true,
    showDirtyIndicator: true,
    showChanges: true,
    showStaged: true,
    showUnstaged: true,
  },
  separator: "•",
  session: {
    infoSeparator: null,
    cost: { enabled: true, format: "decimal1" as const },
    duration: { enabled: true },
    tokens: { enabled: true, showMax: false, showDecimals: false },
    percentage: {
      enabled: true,
      showValue: true,
      progressBar: {
        enabled: true,
        length: 10,
        style: "braille" as const,
        color: "progressive" as const,
        background: "none" as const,
      },
    },
  },
  context: {
    usePayloadContextWindow: true,
    maxContextTokens: 200000,
    autocompactBufferTokens: 45000,
    useUsableContextOnly: true,
    overheadTokens: 0,
    includeBaseContext: true,
    baseContextPath: "~/.claude",
    showContextBreakdown: false,
  },
  limits: {
    enabled: true,
    showTimeLeft: true,
    showPacingDelta: true,
    cost: { enabled: false, format: "decimal1" as const },
    percentage: {
      enabled: true,
      showValue: true,
      progressBar: {
        enabled: true,
        length: 10,
        style: "braille" as const,
        color: "progressive" as const,
        background: "none" as const,
      },
    },
  },
  weeklyUsage: {
    enabled: "90%" as const,
    showTimeLeft: true,
    showPacingDelta: true,
    cost: { enabled: false, format: "decimal1" as const },
    percentage: {
      enabled: true,
      showValue: true,
      progressBar: {
        enabled: true,
        length: 10,
        style: "braille" as const,
        color: "progressive" as const,
        background: "none" as const,
      },
    },
  },
  dailySpend: {
    cost: { enabled: true, format: "decimal1" as const },
  },
};
