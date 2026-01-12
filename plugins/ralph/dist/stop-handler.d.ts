import { RalphState } from './types';
export declare class StopHookHandler {
    private smiteDir;
    private statePath;
    private originalPromptPath;
    constructor(cwd?: string);
    /**
     * Check if Ralph should continue looping
     * Returns the original prompt if should continue, null otherwise
     */
    shouldContinue(): string | null;
    /**
     * Save original prompt for looping
     */
    saveOriginalPrompt(prompt: string): void;
    /**
     * Initialize Ralph session
     */
    initializeSession(maxIterations: number): void;
    /**
     * Update session status
     */
    updateStatus(status: RalphState['status']): void;
    /**
     * Mark story as completed
     */
    markStoryCompleted(storyId: string): void;
    /**
     * Mark story as failed
     */
    markStoryFailed(storyId: string, error: string): void;
    /**
     * Get current state
     */
    getState(): RalphState | null;
    /**
     * Append to progress log
     */
    private appendProgress;
    /**
     * Generate unique session ID
     */
    private generateSessionId;
    /**
     * Clear session
     */
    clear(): void;
    /**
     * Get session summary
     */
    getSummary(): string;
}
//# sourceMappingURL=stop-handler.d.ts.map