import { PRD, RalphState } from './types';
export declare class TaskOrchestrator {
    private prd;
    private dependencyGraph;
    private stateManager;
    constructor(prd: PRD, smiteDir: string);
    /**
     * Execute all stories with parallel optimization
     */
    execute(maxIterations?: number): Promise<RalphState>;
    /**
     * Execute batch of stories in parallel
     * This is where the magic happens - multiple agents running simultaneously
     */
    private executeBatchParallel;
    /**
     * Execute single story
     */
    private executeStory;
    /**
     * Invoke Claude Code agent for story execution
     * In real implementation, this uses the Task tool
     */
    private invokeAgent;
    /**
     * Build agent prompt from user story
     */
    private buildPrompt;
    /**
     * Get execution status
     */
    getStatus(): string;
}
//# sourceMappingURL=task-orchestrator.d.ts.map