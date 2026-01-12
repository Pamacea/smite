import { PRD, StoryBatch } from './types';
export declare class DependencyGraph {
    private prd;
    private storyMap;
    constructor(prd: PRD);
    /**
     * Generate execution batches optimized for parallel processing
     */
    generateBatches(): StoryBatch[];
    /**
     * Get stories ready to execute (all dependencies met)
     */
    private getReadyStories;
    /**
     * Get execution summary
     */
    getExecutionSummary(): {
        totalStories: number;
        maxParallelStories: number;
        estimatedBatches: number;
        criticalPath: string[];
    };
    /**
     * Find critical path (longest chain of dependencies)
     */
    private findCriticalPath;
    /**
     * Visualize dependency graph as ASCII
     */
    visualize(): string;
}
//# sourceMappingURL=dependency-graph.d.ts.map