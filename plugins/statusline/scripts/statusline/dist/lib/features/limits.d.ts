import type { UsageLimit } from "../render-pure.js";
export interface UsageLimitsResponse {
    five_hour: UsageLimit | null;
    seven_day: UsageLimit | null;
}
/**
 * Get usage limits from Claude API
 * This is a placeholder implementation - actual implementation requires API integration
 */
export declare function getUsageLimits(enabled?: boolean): Promise<UsageLimitsResponse>;
