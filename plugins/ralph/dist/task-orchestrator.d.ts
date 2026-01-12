import { PRD, RalphState } from './types';
export declare class TaskOrchestrator {
    private prd;
    private dependencyGraph;
    private stateManager;
    constructor(prd: PRD, smiteDir: string);
    private static readonly DEFAULT_MAX_ITERATIONS;
    execute(maxIterations?: number): Promise<RalphState>;
    private logExecutionStart;
    private shouldStopExecution;
    private executeBatch;
    private finalizeExecution;
    /**
     * Execute batch of stories in parallel
     * This is where the magic happens - multiple agents running simultaneously
     */
    private executeBatchParallel;
    private executeStory;
    private processStoryResult;
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