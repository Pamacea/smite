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
  magenta: "\x1b[35m",
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

  const parts: string[] = [git.branch];

  // Afficher les lignes ajoutées/supprimées au lieu de l'indicateur dirty
  if (config.showChanges && git.isDirty) {
    if (git.additions > 0) {
      parts.push(`${colors.green}+${git.additions}${colors.reset}`);
    }
    if (git.deletions > 0) {
      parts.push(`${colors.red}-${git.deletions}${colors.reset}`);
    }
    if (git.modifications > 0 && git.additions === 0 && git.deletions === 0) {
      parts.push(`${colors.yellow}*${git.modifications}${colors.reset}`);
    }
  } else if (config.showDirtyIndicator && git.isDirty) {
    parts.push("*");
  }

  if (config.showStaged && git.staged > 0) {
    parts.push(`${colors.green}S${git.staged}${colors.reset}`);
  }

  if (config.showUnstaged && git.unstaged > 0) {
    parts.push(`${colors.yellow}U${git.unstaged}${colors.reset}`);
  }

  return parts.join(` ${colors.gray}•${colors.reset} `);
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
  const costStr = cost < 1
    ? `$${(cost * 100).toFixed(0)}`
    : `$${cost.toFixed(decimals[format])}`;
  return `${colors.green}${costStr}${colors.reset}`;
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  let timeStr: string;
  if (hours > 0) {
    timeStr = `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    timeStr = `${minutes}m ${seconds % 60}s`;
  } else {
    timeStr = `${seconds}s`;
  }

  return `${colors.blue}${timeStr}${colors.reset}`;
}

/**
 * Format file path
 * Shows home-relative path (~/...) when possible
 */
export function formatPath(
  path: string,
  mode: "full" | "truncated" | "basename"
): string {
  // Normaliser les séparateurs de chemin
  let normalizedPath = path.replace(/\\/g, "/");

  // Replace home directory with ~ for cleaner display
  const homeDir = process.env.HOME || process.env.USERPROFILE || "";
  if (homeDir && normalizedPath.startsWith(homeDir)) {
    normalizedPath = "~" + normalizedPath.slice(homeDir.length);
  } else if (process.platform === "win32") {
    // On Windows, remove drive letter (C:\) if not using home
    const match = path.match(/^.:\\/);
    if (match) {
      normalizedPath = normalizedPath.substring(3); // Remove "C:\"
    }
  }

  if (mode === "basename") {
    const parts = normalizedPath.split("/").filter(p => p && p !== ".");
    const basename = parts.pop() || normalizedPath;

    // Afficher le dossier parent + le dossier actuel pour plus de contexte
    if (parts.length > 0) {
      const parent = parts.pop();
      return parent ? `${parent}/${basename}` : basename;
    }

    return basename;
  }

  if (mode === "truncated") {
    const parts = normalizedPath.split("/").filter(p => p && p !== ".");
    if (parts.length <= 3) {
      return normalizedPath;
    }
    // Show first and last 2 parts
    return `${parts[0]}/.../${parts.slice(-2).join("/")}`;
  }

  return normalizedPath;
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

  if (percentage >= 40) {
    return colors.green;
  }

  if (percentage >= 20) {
    return colors.cyan;
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

  // Calculate filled length, but always show at least 1 if percentage > 0
  let filled = Math.round((percentage / 100) * length);
  if (percentage > 0 && filled === 0) {
    filled = 1;
  }
  const empty = length - filled;
  const barColor = getProgressBarColor(percentage, color);

  if (style === "braille") {
    const emptyChar = getEmptyChar(background);
    const filledPart = barColor + "█".repeat(Math.ceil(filled / 2)) + colors.reset;
    const emptyPart = colors.dim + emptyChar.repeat(length - Math.ceil(filled / 2)) + colors.reset;
    return filledPart + emptyPart;
  }

  // style === "blocks"
  const emptyChar = getEmptyChar(background);
  const filledPart = barColor + "█".repeat(filled) + colors.reset;
  const emptyPart = colors.dim + emptyChar.repeat(empty) + colors.reset;
  return filledPart + emptyPart;
}
