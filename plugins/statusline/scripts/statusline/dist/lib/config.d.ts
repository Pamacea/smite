import type { StatuslineConfig } from "./config-types";
/**
 * Default statusline configuration
 */
export declare const defaultConfig: StatuslineConfig;
/**
 * Deep merge configuration
 */
export declare function mergeConfig(userConfig: Partial<StatuslineConfig>): StatuslineConfig;
export type { StatuslineConfig };
