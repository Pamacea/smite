"use strict";
// SMITE Ralph - Dependency Graph
// Analyze dependencies and optimize parallel execution
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyGraph = void 0;
class DependencyGraph {
    constructor(prd) {
        this.prd = prd;
        this.storyMap = new Map(prd.userStories.map(s => [s.id, s]));
    }
    /**
     * Generate execution batches optimized for parallel processing
     */
    generateBatches() {
        const batches = [];
        const completed = new Set();
        const inProgress = new Set();
        let batchNumber = 1;
        while (completed.size < this.prd.userStories.length) {
            // Find stories that can run next
            const readyStories = this.getReadyStories(completed, inProgress);
            if (readyStories.length === 0) {
                // Circular dependency or error
                throw new Error('Unable to resolve dependencies - possible circular dependency');
            }
            // Create batch
            const batch = {
                batchNumber,
                stories: readyStories,
                canRunInParallel: readyStories.length > 1,
                dependenciesMet: true,
            };
            batches.push(batch);
            // Mark stories as in-progress
            readyStories.forEach(s => inProgress.add(s.id));
            batchNumber++;
        }
        return batches;
    }
    /**
     * Get stories ready to execute (all dependencies met)
     */
    getReadyStories(completed, inProgress) {
        const ready = [];
        for (const story of this.prd.userStories) {
            // Skip if already completed or in progress
            if (completed.has(story.id) || inProgress.has(story.id))
                continue;
            // Check if all dependencies are completed
            const depsMet = story.dependencies.every(dep => completed.has(dep));
            if (depsMet) {
                ready.push(story);
            }
        }
        // Sort by priority (higher priority first)
        ready.sort((a, b) => b.priority - a.priority);
        return ready;
    }
    /**
     * Get execution summary
     */
    getExecutionSummary() {
        const batches = this.generateBatches();
        const maxParallel = Math.max(...batches.map(b => b.stories.length));
        // Find critical path (longest dependency chain)
        const criticalPath = this.findCriticalPath();
        return {
            totalStories: this.prd.userStories.length,
            maxParallelStories: maxParallel,
            estimatedBatches: batches.length,
            criticalPath,
        };
    }
    /**
     * Find critical path (longest chain of dependencies)
     */
    findCriticalPath() {
        const visited = new Set();
        const memo = new Map();
        const getDepth = (storyId) => {
            if (memo.has(storyId))
                return memo.get(storyId);
            const story = this.storyMap.get(storyId);
            if (!story)
                return 0;
            if (story.dependencies.length === 0) {
                memo.set(storyId, 1);
                return 1;
            }
            const maxDepDepth = Math.max(...story.dependencies.map(dep => getDepth(dep)));
            const depth = maxDepDepth + 1;
            memo.set(storyId, depth);
            return depth;
        };
        // Get depth for all stories
        const depths = new Map();
        for (const story of this.prd.userStories) {
            depths.set(story.id, getDepth(story.id));
        }
        // Build critical path
        const path = [];
        let current = Array.from(depths.entries()).sort((a, b) => b[1] - a[1])[0][0];
        while (current) {
            path.push(current);
            const story = this.storyMap.get(current);
            if (!story || story.dependencies.length === 0)
                break;
            // Find dependency with max depth
            const nextDep = story.dependencies
                .map(dep => ({ id: dep, depth: depths.get(dep) || 0 }))
                .sort((a, b) => b.depth - a.depth)[0];
            current = nextDep.id;
        }
        return path;
    }
    /**
     * Visualize dependency graph as ASCII
     */
    visualize() {
        const lines = ['Dependency Graph:', ''];
        for (const story of this.prd.userStories) {
            const deps = story.dependencies.length > 0
                ? ` <- [${story.dependencies.join(', ')}]`
                : '';
            lines.push(`  ${story.id}: ${story.title} (priority: ${story.priority})${deps}`);
        }
        lines.push('');
        const summary = this.getExecutionSummary();
        lines.push(`Summary:`);
        lines.push(`  Total stories: ${summary.totalStories}`);
        lines.push(`  Max parallel: ${summary.maxParallelStories}`);
        lines.push(`  Estimated batches: ${summary.estimatedBatches}`);
        lines.push(`  Critical path: [${summary.criticalPath.join(' -> ')}]`);
        return lines.join('\n');
    }
}
exports.DependencyGraph = DependencyGraph;
//# sourceMappingURL=dependency-graph.js.map