import type { StatuslineConfig } from "./config-types.js";
import { colors, formatCost, formatDuration, formatPath, formatProgressBar, formatTokens } from "./formatters.js";

/**
 * Get color for percentage based on value (matches progress bar colors)
 */
function getPercentageColor(percentage: number, color: "progressive" | "single"): string {
  if (color === "single") {
    return colors.blue;
  }

  if (percentage >= 90) {
    return colors.red;
  }

  if (percentage >= 70) {
    return colors.yellow;
  }

  if (percentage >= 40) {
    return colors.green;
  }

  if (percentage >= 20) {
    return colors.cyan;
  }

  return colors.blue;
}

export interface UsageLimit {
  utilization: number;
  resets_at: string;
}

export interface StatuslineData {
  branch: string;
  dirPath: string;
  modelName: string;
  sessionCost: string;
  sessionDuration: string;
  contextTokens: number | null;
  contextPercentage: number | null;
  lastOutputTokens: number | null;
  tokenDiff?: number; // Optional: tokens added since last update
  baseContext?: number; // Base context tokens (system messages + config files)
  transcriptContext?: number; // Transcript context tokens (user/assistant messages)
  userTokens?: number; // User tokens only (excludes system/base context)
  usageLimits?: {
    five_hour: UsageLimit | null;
    seven_day: UsageLimit | null;
  };
  periodCost?: number;
  todayCost?: number;
}

/**
 * Render path and model display
 */
function renderPathAndModel(data: StatuslineData, config: StatuslineConfig): string {
  const modelDisplay =
    config.showSonnetModel || !data.modelName.includes("Sonnet")
      ? data.modelName
      : "Sonnet";
  return `${data.dirPath} ${colors.gray}${config.separator}${colors.reset} ${colors.orange}${modelDisplay}${colors.reset}`;
}

/**
 * Render session information
 */
function renderSessionInfo(data: StatuslineData, config: StatuslineConfig): string | null {
  const sessionParts: string[] = [];

  // Show context breakdown if enabled and data is available
  if (
    config.context.showContextBreakdown &&
    data.baseContext !== undefined &&
    data.transcriptContext !== undefined
  ) {
    const baseK = (data.baseContext / 1000).toFixed(1);
    const transcriptK = (data.transcriptContext / 1000).toFixed(1);
    const totalK = ((data.baseContext + data.transcriptContext) / 1000).toFixed(1);
    sessionParts.push(
      `${colors.cyan}Base:${colors.reset} ${baseK}K ${colors.gray}${config.separator}${colors.reset} `
    );
    sessionParts.push(
      `${colors.magenta}Transcript:${colors.reset} ${transcriptK}K ${colors.gray}${config.separator}${colors.reset} `
    );
    sessionParts.push(`${colors.white}${totalK}K${colors.reset}`);
  }

  if (config.session.cost.enabled) {
    sessionParts.push(data.sessionCost);
  }

  if (config.session.duration.enabled) {
    sessionParts.push(data.sessionDuration);
  }

  if (config.session.tokens.enabled && data.contextTokens !== null) {
    const maxTokens = config.context.maxContextTokens;
    const userTokens = data.userTokens ?? data.contextTokens;
    const totalTokens = data.contextTokens;

    // Display format:
    // - If userTokens is very small (<1K) compared to total, show just total (new session)
    // - If userTokens is significantly different from total, show userTokens(totalTokens)
    // - Otherwise show just userTokens
    let tokensStr: string;
    if (userTokens < 1000 && totalTokens >= 1000) {
      // New session with just base context - show total only
      tokensStr = formatTokens(totalTokens, config.session.tokens.showDecimals);
    } else if (userTokens !== totalTokens) {
      tokensStr = `${formatTokens(userTokens, config.session.tokens.showDecimals)}${colors.dim}(${formatTokens(totalTokens, false)})${colors.reset}`;
    } else {
      tokensStr = formatTokens(userTokens, config.session.tokens.showDecimals);
    }

    // Add token diff if available and recent (shows tokens added since last update)
    if (data.tokenDiff && data.tokenDiff > 0) {
      const diffK = (data.tokenDiff / 1000).toFixed(1);
      const diffColor = data.tokenDiff > 50000 ? colors.red :
                        data.tokenDiff > 20000 ? colors.yellow : colors.green;
      tokensStr += `${diffColor} +${diffK}K${colors.reset}`;
    }

    // Add last output tokens if available
    if (data.lastOutputTokens !== null && data.lastOutputTokens > 0) {
      tokensStr += ` + ${data.lastOutputTokens}`;
    }

    if (config.session.tokens.showMax) {
      tokensStr += `/${formatTokens(maxTokens, false)}`;
    }

    sessionParts.push(tokensStr);
  }

  if (config.session.percentage.enabled) {
    const { progressBar, showValue } = config.session.percentage;

    // Calculate percentage based on context tokens (includes base context for new sessions)
    const maxTokens = config.context.maxContextTokens || 200000; // Default to 200K if not set
    const contextTokens = data.contextTokens ?? 0;

    // Protect against division by zero
    const percentage = maxTokens > 0 && contextTokens > 0
      ? Math.min(100, Math.round((contextTokens / maxTokens) * 100))
      : 0;

    // Show progress bar if we have any tokens (including base context)
    // This ensures the bar shows up even for new sessions with just base context
    if (contextTokens > 0 && maxTokens > 0) {
      if (progressBar.enabled) {
        const bar = formatProgressBar(
          percentage,
          progressBar.length,
          progressBar.style,
          progressBar.color,
          progressBar.background
        );
        sessionParts.push(bar);
      }

      if (showValue) {
        const percentColor = getPercentageColor(percentage, progressBar.color);
        sessionParts.push(`${percentColor}${percentage}%${colors.reset}`);
      }
    }
  }

  if (sessionParts.length === 0) {
    return null;
  }

  const separator =
    config.session.infoSeparator || ` ${colors.gray}${config.separator}${colors.reset} `;
  return sessionParts.join(separator);
}

/**
 * Render usage limits
 */
function renderUsageLimits(data: StatuslineData, config: StatuslineConfig): string | null {
  if (!config.limits.enabled || !data.usageLimits) {
    return null;
  }

  const limitsParts: string[] = [];
  const { five_hour } = data.usageLimits;

  if (five_hour) {
    if (config.limits.percentage.enabled) {
      const bar = formatProgressBar(
        five_hour.utilization,
        config.limits.percentage.progressBar.length,
        config.limits.percentage.progressBar.style,
        config.limits.percentage.progressBar.color,
        config.limits.percentage.progressBar.background
      );
      limitsParts.push(bar);
    }

    if (config.limits.percentage.showValue) {
      limitsParts.push(`${Math.round(five_hour.utilization)}%`);
    }

    if (config.limits.cost.enabled && data.periodCost !== undefined) {
      limitsParts.push(formatCost(data.periodCost, config.limits.cost.format));
    }
  }

  return limitsParts.length > 0 ? limitsParts.join(" ") : null;
}

/**
 * Render daily spend
 */
function renderDailySpend(data: StatuslineData, config: StatuslineConfig): string | null {
  if (!config.dailySpend.cost.enabled || data.todayCost === undefined) {
    return null;
  }

  return `${colors.gray}Today:${colors.reset} ${formatCost(
    data.todayCost,
    config.dailySpend.cost.format
  )}`;
}

/**
 * Render statusline output
 *
 * Order: Branch • Model • Path • Cost • Duration • Tokens • Separator • Progressbar • Percentage
 */
export function renderStatusline(
  data: StatuslineData,
  config: StatuslineConfig
): string {
  const parts: string[] = [];

  // Git branch (keep it short - just the name)
  if (config.git.enabled && data.branch) {
    // Extract just branch name without changes
    const branchName = data.branch.split(/[•\s]/)[0];
    parts.push(`${colors.white}${branchName}${colors.reset}`);
  }

  // Model name (short)
  const modelDisplay =
    config.showSonnetModel || !data.modelName.includes("Sonnet")
      ? data.modelName
      : "Sonnet";
  parts.push(`${colors.orange}${modelDisplay}${colors.reset}`);

  // Path/repo name (after model as requested)
  parts.push(`${colors.cyan}${formatPath(data.dirPath, config.pathDisplayMode)}${colors.reset}`);

  // Cost and duration
  if (config.session.cost.enabled) {
    parts.push(data.sessionCost);
  }
  if (config.session.duration.enabled) {
    parts.push(data.sessionDuration);
  }

  // Tokens + Progressbar + Percentage - with separator between tokens and bar
  if (config.session.tokens.enabled && data.contextTokens !== null) {
    const maxTokens = config.context.maxContextTokens;
    const userTokens = data.userTokens ?? data.contextTokens;
    const totalTokens = data.contextTokens;

    // Show just total tokens for compact display
    let tokensStr: string;
    if (userTokens < 1000 && totalTokens >= 1000) {
      tokensStr = formatTokens(totalTokens, config.session.tokens.showDecimals);
    } else if (userTokens !== totalTokens) {
      tokensStr = `${formatTokens(userTokens, config.session.tokens.showDecimals)}`;
    } else {
      tokensStr = formatTokens(userTokens, config.session.tokens.showDecimals);
    }
    parts.push(`${colors.magenta}${tokensStr}${colors.reset}`);

    // Progressbar + percentage with separator before bar
    if (config.session.percentage.enabled) {
      const { progressBar, showValue } = config.session.percentage;
      const maxTokensVal = config.context.maxContextTokens || 200000;
      const percentage = maxTokensVal > 0 && totalTokens > 0
        ? Math.min(100, Math.round((totalTokens / maxTokensVal) * 100))
        : 0;

      if (totalTokens > 0 && maxTokensVal > 0) {
        if (progressBar.enabled) {
          const bar = formatProgressBar(
            percentage,
            progressBar.length,
            progressBar.style,
            progressBar.color,
            progressBar.background
          );
          parts.push(bar);
        }
        if (showValue) {
          const percentColor = getPercentageColor(percentage, progressBar.color);
          parts.push(`${percentColor}${percentage}%${colors.reset}`);
        }
      }
    }
  }

  // Git changes (if any) - compact format
  if (config.git.showChanges && data.branch) {
    const changes = data.branch.split(/[•\s]+/).slice(1);
    const filtered = changes.filter(c => c && c !== "•");
    if (filtered.length > 0) {
      parts.push(filtered.join(" "));
    }
  }

  return parts.join(` ${colors.gray}${config.separator}${colors.reset} `);
}
