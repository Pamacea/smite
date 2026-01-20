import type { GitStatus } from "./git.js";
import type { GitConfig } from "./config-types.js";
/**
 * ANSI color codes
 */
export declare const colors: {
    reset: string;
    bold: string;
    dim: string;
    red: string;
    green: string;
    yellow: string;
    blue: string;
    cyan: string;
    gray: string;
    orange: string;
    white: string;
};
/**
 * Format git branch status
 */
export declare function formatBranch(git: GitStatus, config: GitConfig): string;
/**
 * Format cost with specified decimals
 */
export declare function formatCost(cost: number, format: "decimal1" | "decimal2" | "decimal3"): string;
/**
 * Format duration in human-readable format
 */
export declare function formatDuration(ms: number): string;
/**
 * Format file path
 * Shows home-relative path (~/...) when possible
 */
export declare function formatPath(path: string, mode: "full" | "truncated" | "basename"): string;
/**
 * Format tokens with K suffix
 */
export declare function formatTokens(tokens: number, showDecimals: boolean): string;
/**
 * Format percentage
 */
export declare function formatPercentage(value: number): string;
/**
 * Format progress bar
 */
export declare function formatProgressBar(percentage: number, length: number, style: "braille" | "blocks" | "percentage", color: "progressive" | "single", background: "none" | "shade" | "dots"): string;
