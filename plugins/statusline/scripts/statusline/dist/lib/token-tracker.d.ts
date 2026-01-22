export interface TokenTrackerData {
    lastUsage: number;
    timestamp: number;
    lastDiffTime: number;
    sessionId?: string;
}
export interface TokenDiff {
    diff: number;
    shouldShow: boolean;
}
/**
 * Token tracker for monitoring token usage across a session.
 * Tracks token diffs, handles session detection, and filters spurious diffs.
 */
export declare class TokenTracker {
    private data;
    constructor(currentUsage: number, sessionId?: string);
    /**
     * Load token tracker from disk, creating new one if needed.
     * Resets tracker if:
     * - The tracker is too old (> 30 minutes = likely a new session)
     * - Session ID changed (parallel session detected)
     */
    static load(trackerPath: string, currentUsage: number, sessionId?: string): Promise<TokenTracker>;
    /**
     * Save token tracker to disk.
     * Fails silently to avoid breaking statusline if save fails.
     */
    save(trackerPath: string): Promise<void>;
    /**
     * Get current token diff and whether it should be shown.
     * Only shows positive diffs within timeout window.
     */
    getCurrentDiff(currentUsage: number): TokenDiff;
    /**
     * Update tracker with new token usage.
     * - Positive diffs: active work, keep diff visible
     * - Negative diffs: context cleared/compacted, reset baseline
     */
    update(currentUsage: number): void;
    /**
     * Check if a diff is spurious (unreasonably large).
     * Spurious diffs indicate session resets or config changes.
     */
    isSpuriousDiff(diff: number): boolean;
    /**
     * Reset the baseline to current usage (used for spurious diffs).
     */
    resetBaseline(currentUsage: number): void;
}
