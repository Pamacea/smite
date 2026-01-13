import type { HookInput } from "../types.js";
/**
 * Save session data to database
 */
export declare function saveSessionV2(input: HookInput, periodId: string | null): Promise<void>;
/**
 * Get total cost for a specific period
 */
export declare function getPeriodCost(periodId: string): Promise<number>;
/**
 * Get today's total cost
 */
export declare function getTodayCostV2(): Promise<number>;
