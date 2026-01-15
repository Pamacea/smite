import { PRD, RalphState } from "./types";
export declare class TaskOrchestrator {
    private prd;
    private dependencyGraph;
    private stateManager;
    private specGenerator;
    private smiteDir;
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
     * Update story status in memory and persist to PRD file
     * Consolidates duplicate PRD update logic
     */
    private updateStoryStatus;
    /**
     * Invoke Claude Code agent for story execution
     * In real implementation, this uses the Task tool
     */
    private invokeAgent;
    /**
     * Generate and validate specification before agent execution
     */
    private generateAndValidateSpec;
    /**
     * Build agent prompt from user story
     */
    private buildPrompt;
    /**
     * Get execution status (async)
     */
    getStatus(): Promise<string>;
}
//# sourceMappingURL=task-orchestrator.d.ts.map