import type { GitStatus } from "./git.js";
import type { GitConfig } from "./config-types.js";

/**
 * ANSI color codes
 */
export const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
  orange: "\x1b[38;5;208m",
  white: "\x1b[97m",
};

/**
 * Format git branch status
 */
export function formatBranch(git: GitStatus, config: GitConfig): string {
  if (!config.enabled || !git.branch) {
    return "";
  }

  let output = git.branch;

  if (config.showDirtyIndicator && git.isDirty) {
    output += " *";
  }

  if (config.showChanges && git.changes > 0) {
    output += ` +${git.changes}`;
  }

  if (config.showStaged && git.staged > 0) {
    output += ` ${colors.green}S${git.staged}${colors.reset}`;
  }

  if (config.showUnstaged && git.unstaged > 0) {
    output += ` ${colors.yellow}U${git.unstaged}${colors.reset}`;
  }

  return output;
}

/**
 * Format cost with specified decimals
 */
export function formatCost(cost: number, format: "decimal1" | "decimal2" | "decimal3"): string {
  const decimals: Record<typeof format, number> = {
    decimal1: 1,
    decimal2: 2,
    decimal3: 3,
  };
  return `$${cost.toFixed(decimals[format])}`;
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Format file path
 */
export function formatPath(
  path: string,
  mode: "full" | "truncated" | "basename"
): string {
  if (mode === "basename") {
    return path.split(/[/\\]/).pop() || path;
  }

  if (mode === "truncated") {
    const parts = path.split(/[/\\]/);
    if (parts.length <= 3) {
      return path;
    }
    // Show first and last 2 parts
    return `${parts[0]}/.../${parts.slice(-2).join("/")}`;
  }

  return path;
}

/**
 * Format tokens with K suffix
 */
export function formatTokens(tokens: number, showDecimals: boolean): string {
  if (tokens < 1000) {
    return tokens.toString();
  }

  const k = tokens / 1000;
  const roundedK = Math.round(k);

  if (showDecimals && roundedK >= 100) {
    return `${k.toFixed(1)}K`;
  }
  return `${roundedK}K`;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${value}%`;
}

/**
 * Get color for progress bar based on percentage
 */
function getProgressBarColor(percentage: number, color: "progressive" | "single"): string {
  if (color === "single") {
    return colors.blue;
  }

  if (percentage >= 90) {
    return colors.red;
  }

  if (percentage >= 70) {
    return colors.yellow;
  }

  return colors.blue;
}

/**
 * Get empty character for progress bar background
 */
function getEmptyChar(background: "none" | "shade" | "dots"): string {
  const emptyChars: Record<typeof background, string> = {
    none: " ",
    shade: "░",
    dots: "·",
  };
  return emptyChars[background];
}

/**
 * Format progress bar
 */
export function formatProgressBar(
  percentage: number,
  length: number,
  style: "braille" | "blocks" | "percentage",
  color: "progressive" | "single",
  background: "none" | "shade" | "dots"
): string {
  if (style === "percentage") {
    return `${percentage}%`;
  }

  const filled = Math.round((percentage / 100) * length);
  const empty = length - filled;
  const barColor = getProgressBarColor(percentage, color);

  if (style === "braille") {
    const baseBar = colors.dim + "█".repeat(length) + colors.reset;
    const overlay = barColor + "█".repeat(Math.ceil(filled / 2)) + colors.reset;
    return overlay + baseBar.substring(overlay.length);
  }

  // style === "blocks"
  const emptyChar = getEmptyChar(background);
  const filledPart = barColor + "█".repeat(filled) + colors.reset;
  const emptyPart = colors.dim + emptyChar.repeat(empty) + colors.reset;
  return filledPart + emptyPart;
}
