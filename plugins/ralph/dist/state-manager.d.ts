import { RalphState } from './types';
export declare class StateManager {
    private readonly statePath;
    private readonly progressPath;
    private static readonly MINUTES_MS;
    constructor(smiteDir: string);
    initialize(maxIterations: number): RalphState;
    load(): RalphState | null;
    save(state: RalphState): void;
    update(updates: Partial<RalphState>): RalphState | null;
    markStoryResult(storyId: string, success: boolean, error?: string): RalphState | null;
    setInProgress(storyId: string | null): RalphState | null;
    setStatus(status: RalphState['status']): RalphState | null;
    readProgress(): string;
    clear(): void;
    getDuration(state: RalphState): string;
    private logProgress;
}
//# sourceMappingURL=state-manager.d.ts.map