import { PRD, StoryBatch } from './types';
export declare class DependencyGraph {
    private prd;
    private readonly storyMap;
    constructor(prd: PRD);
    generateBatches(): StoryBatch[];
    private getReadyStories;
    getExecutionSummary(): {
        totalStories: number;
        maxParallelStories: number;
        estimatedBatches: number;
        criticalPath: string[];
    };
    private findCriticalPath;
    private buildCriticalPath;
    visualize(): string;
}
//# sourceMappingURL=dependency-graph.d.ts.map