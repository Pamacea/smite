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

export interface GitInsertions {
  additions: number;
  deletions: number;
  modifications: number;
}

export interface StatuslineData {
  branch: string;
  gitInsertions?: GitInsertions; // Raw git data for insertions display
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
 * Render session information (unused - kept for compatibility)
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

    let tokensStr: string;
    if (userTokens < 1000 && totalTokens >= 1000) {
      tokensStr = formatTokens(totalTokens, config.session.tokens.showDecimals);
    } else if (userTokens !== totalTokens) {
      tokensStr = `${formatTokens(userTokens, config.session.tokens.showDecimals)}${colors.dim}(${formatTokens(totalTokens, false)})${colors.reset}`;
    } else {
      tokensStr = formatTokens(userTokens, config.session.tokens.showDecimals);
    }

    if (data.tokenDiff && data.tokenDiff > 0) {
      const diffK = (data.tokenDiff / 1000).toFixed(1);
      const diffColor = data.tokenDiff > 50000 ? colors.red :
                        data.tokenDiff > 20000 ? colors.yellow : colors.green;
      tokensStr += `${diffColor} +${diffK}K${colors.reset}`;
    }

    if (data.lastOutputTokens !== null && data.lastOutputTokens > 0) {
      tokensStr += ` + ${data.lastOutputTokens}`;
    }

    if (config.session.tokens.showMax) {
      tokensStr += `/${formatTokens(maxTokens, false)}`;
    }

    sessionParts.push(tokensStr);
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
 * Order: Branch • INSERTIONS • Path • Model • Cost • Tokens • ProgressBar • Percentage • Duration
 */
export function renderStatusline(
  data: StatuslineData,
  config: StatuslineConfig
): string {
  const parts: string[] = [];

  // 1. Git branch (keep it short - just the name)
  if (config.git.enabled && data.branch) {
    const branchName = data.branch.split(/[•\s]/)[0];
    parts.push(`${colors.white}${branchName}${colors.reset}`);
  }

  // 2. INSERTIONS (lignes ajoutées/modifiées/supprimées)
  if (config.git.enabled && data.gitInsertions) {
    const { additions, deletions, modifications } = data.gitInsertions;
    const insertionParts: string[] = [];

    if (additions > 0) {
      insertionParts.push(`${colors.green}+${additions}${colors.reset}`);
    }
    if (deletions > 0) {
      insertionParts.push(`${colors.red}-${deletions}${colors.reset}`);
    }
    if (modifications > 0 && additions === 0 && deletions === 0) {
      insertionParts.push(`${colors.yellow}*${modifications}${colors.reset}`);
    }

    if (insertionParts.length > 0) {
      parts.push(insertionParts.join(" "));
    }
  }

  // 3. Path/repo name
  parts.push(`${colors.cyan}${formatPath(data.dirPath, config.pathDisplayMode)}${colors.reset}`);

  // 4. Model name (short)
  const modelDisplay =
    config.showSonnetModel || !data.modelName.includes("Sonnet")
      ? data.modelName
      : "Sonnet";
  parts.push(`${colors.orange}${modelDisplay}${colors.reset}`);

  // 5. Cost
  if (config.session.cost.enabled) {
    parts.push(data.sessionCost);
  }

  // 6. Tokens + ProgressBar + Percentage
  if (config.session.tokens.enabled && data.contextTokens !== null) {
    const maxTokens = config.context.maxContextTokens;
    const userTokens = data.userTokens ?? data.contextTokens;
    const totalTokens = data.contextTokens;

    let tokensStr: string;
    // Display capped at maxTokens to show actual context window usage
    const displayTokens = Math.min(totalTokens, maxTokens);
    const displayUserTokens = Math.min(userTokens, maxTokens);

    if (displayUserTokens < 1000 && displayTokens >= 1000) {
      tokensStr = formatTokens(displayTokens, config.session.tokens.showDecimals);
    } else if (displayUserTokens !== displayTokens) {
      tokensStr = `${formatTokens(displayUserTokens, config.session.tokens.showDecimals)}`;
    } else {
      tokensStr = formatTokens(displayUserTokens, config.session.tokens.showDecimals);
    }
    parts.push(`${colors.magenta}${tokensStr}${colors.reset}`);

    // 7. Progressbar + Percentage
    if (config.session.percentage.enabled) {
      const { progressBar, showValue } = config.session.percentage;
      // Use pre-calculated percentage from context (single source of truth)
      const percentage = data.contextPercentage ?? (
        maxTokens > 0 && totalTokens > 0
          ? Math.min(100, Math.round((totalTokens / maxTokens) * 100))
          : 0
      );

      // Show progressbar if we have any tokens (even 0% for new sessions)
      if (totalTokens > 0) {
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

  // 8. Duration (à la fin)
  if (config.session.duration.enabled) {
    parts.push(data.sessionDuration);
  }

  return parts.join(` ${colors.gray}${config.separator}${colors.reset} `);
}
