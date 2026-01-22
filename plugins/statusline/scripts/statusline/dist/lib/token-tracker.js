import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
/**
 * Time to show token diff after activity stops.
 * 10 seconds balances visibility (long enough to see) with
 * recency (fades out before it becomes stale).
 */
const TOKEN_DIFF_TIMEOUT = 10000;
/**
 * Session timeout for token tracker.
 * 30 minutes = 1800000ms. After this period, we assume a new
 * work session and reset the baseline. Prevents showing old
 * token diffs from previous sessions.
 */
const SESSION_TIMEOUT = 1800000;
/**
 * Threshold for detecting spurious token diffs.
 * 50K tokens = far more than typical single action (<10K).
 * Diffs above this threshold are likely from:
 * - Base context configuration changes
 * - Session resets (/new command)
 * - Context window compaction
 */
const SPURIOUS_DIFF_THRESHOLD = 50000;
/**
 * Token tracker for monitoring token usage across a session.
 * Tracks token diffs, handles session detection, and filters spurious diffs.
 */
export class TokenTracker {
    data;
    constructor(currentUsage, sessionId) {
        this.data = {
            lastUsage: currentUsage,
            timestamp: Date.now(),
            lastDiffTime: Date.now(),
            sessionId,
        };
    }
    /**
     * Load token tracker from disk, creating new one if needed.
     * Resets tracker if:
     * - The tracker is too old (> 30 minutes = likely a new session)
     * - Session ID changed (parallel session detected)
     */
    static async load(trackerPath, currentUsage, sessionId) {
        try {
            if (existsSync(trackerPath)) {
                const content = await readFile(trackerPath, "utf-8");
                const data = JSON.parse(content);
                const now = Date.now();
                // Reset if stale or different session
                if (now - data.timestamp > SESSION_TIMEOUT ||
                    (sessionId && data.sessionId && sessionId !== data.sessionId)) {
                    return new TokenTracker(currentUsage, sessionId);
                }
                const tracker = new TokenTracker(currentUsage, sessionId);
                tracker.data = { ...data, sessionId: sessionId || data.sessionId };
                return tracker;
            }
        }
        catch {
            // File doesn't exist or invalid - create new tracker
        }
        return new TokenTracker(currentUsage, sessionId);
    }
    /**
     * Save token tracker to disk.
     * Fails silently to avoid breaking statusline if save fails.
     */
    async save(trackerPath) {
        try {
            this.data.timestamp = Date.now();
            await writeFile(trackerPath, JSON.stringify(this.data, null, 2), "utf-8");
        }
        catch {
            // Fail silently - don't break statusline if we can't save
        }
    }
    /**
     * Get current token diff and whether it should be shown.
     * Only shows positive diffs within timeout window.
     */
    getCurrentDiff(currentUsage) {
        const diff = currentUsage - this.data.lastUsage;
        const now = Date.now();
        const timeSinceLastDiff = now - (this.data.lastDiffTime || 0);
        // Only show positive diffs within timeout
        const shouldShow = diff > 0 && timeSinceLastDiff < TOKEN_DIFF_TIMEOUT;
        return { diff, shouldShow };
    }
    /**
     * Update tracker with new token usage.
     * - Positive diffs: active work, keep diff visible
     * - Negative diffs: context cleared/compacted, reset baseline
     */
    update(currentUsage) {
        const diff = currentUsage - this.data.lastUsage;
        const now = Date.now();
        const timeSinceLastDiff = now - (this.data.lastDiffTime || 0);
        if (diff > 0) {
            // New tokens added - active work in progress
            // Keep the baseline (lastUsage) UNCHANGED to ACCUMULATE the diff
            // Only update lastDiffTime to keep the diff visible
            // Only reset baseline when timeout expires (10s of no activity)
            if (timeSinceLastDiff >= TOKEN_DIFF_TIMEOUT) {
                // Timeout expired - activity stopped, reset baseline
                this.data.lastUsage = currentUsage;
                this.data.lastDiffTime = now;
            }
            else {
                // Still active - just update the timestamp to keep diff visible
                this.data.lastDiffTime = now;
            }
        }
        else if (diff < 0) {
            // Context cleared or parallel session detected
            // Update lastUsage to prevent showing huge positive diffs later
            // but DON'T update lastDiffTime (don't show the negative diff)
            this.data.lastUsage = currentUsage;
            // lastDiffTime stays the same - existing timeout continues
        }
        // If diff === 0, no update needed
    }
    /**
     * Check if a diff is spurious (unreasonably large).
     * Spurious diffs indicate session resets or config changes.
     */
    isSpuriousDiff(diff) {
        return Math.abs(diff) > SPURIOUS_DIFF_THRESHOLD;
    }
    /**
     * Reset the baseline to current usage (used for spurious diffs).
     */
    resetBaseline(currentUsage) {
        this.data.lastUsage = currentUsage;
        this.data.timestamp = Date.now();
    }
}
