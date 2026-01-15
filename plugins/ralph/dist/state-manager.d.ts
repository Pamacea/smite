import { RalphState } from "./types";
export declare class StateManager {
    private readonly statePath;
    private readonly progressPath;
    private static readonly MINUTES_MS;
    constructor(smiteDir: string);
    initialize(maxIterations: number, prdPath?: string): Promise<RalphState>;
    load(): Promise<RalphState | null>;
    save(state: RalphState): Promise<void>;
    update(updates: Partial<RalphState>): Promise<RalphState | null>;
    markStoryResult(storyId: string, success: boolean, error?: string): Promise<RalphState | null>;
    setInProgress(storyId: string | null): Promise<RalphState | null>;
    setStatus(status: RalphState["status"]): Promise<RalphState | null>;
    readProgress(): Promise<string>;
    clear(): Promise<void>;
    getDuration(state: RalphState): string;
    private logProgress;
    /**
     * Validate that the tracked PRD still exists - async
     * Returns true if PRD exists, false otherwise
     */
    validatePRDExists(): Promise<boolean>;
    /**
     * Check if PRD has been modified since session started - async
     * (Optional feature using hash comparison)
     */
    hasPRDChanged(): Promise<boolean>;
}
//# sourceMappingURL=state-manager.d.ts.map