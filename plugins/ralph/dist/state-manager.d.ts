import { RalphState } from './types';
export declare class StateManager {
    private statePath;
    private progressPath;
    constructor(smiteDir: string);
    /**
     * Initialize new Ralph session
     */
    initialize(maxIterations: number): RalphState;
    /**
     * Load current state
     */
    load(): RalphState | null;
    /**
     * Save state
     */
    save(state: RalphState): void;
    /**
     * Update state
     */
    update(updates: Partial<RalphState>): RalphState | null;
    /**
     * Mark story as completed
     */
    markCompleted(storyId: string): RalphState | null;
    /**
     * Mark story as failed
     */
    markFailed(storyId: string, error: string): RalphState | null;
    /**
     * Set in-progress story
     */
    setInProgress(storyId: string | null): RalphState | null;
    /**
     * Set status
     */
    setStatus(status: RalphState['status']): RalphState | null;
    /**
     * Append to progress log
     */
    appendProgress(message: string): void;
    /**
     * Read progress log
     */
    readProgress(): string;
    /**
     * Clear state
     */
    clear(): void;
    /**
     * Get session duration
     */
    getDuration(state: RalphState): string;
}
//# sourceMappingURL=state-manager.d.ts.map