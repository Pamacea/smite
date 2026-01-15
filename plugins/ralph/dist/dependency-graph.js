"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyGraph = void 0;
class DependencyGraph {
    constructor(prd) {
        this.prd = prd;
        this.cachedBatches = null;
        this.cachedPrdHash = null;
        this.storyMap = new Map(prd.userStories.map((s) => [s.id, s]));
    }
    generateBatches() {
        // Check if cache is valid
        const currentHash = this.hashPRD();
        if (this.cachedBatches && this.cachedPrdHash === currentHash) {
            return this.cachedBatches;
        }
        // Recalculate and cache
        const batches = [];
        const completed = new Set();
        const inProgress = new Set();
        let batchNumber = 1;
        while (completed.size < this.prd.userStories.length) {
            const readyStories = this.getReadyStories(completed, inProgress);
            if (readyStories.length === 0) {
                throw new Error("Unable to resolve dependencies - possible circular dependency");
            }
            batches.push({
                batchNumber,
                stories: readyStories,
                canRunInParallel: readyStories.length > 1,
                dependenciesMet: true,
            });
            readyStories.forEach((s) => inProgress.add(s.id));
            batchNumber++;
        }
        // Update cache
        this.cachedBatches = batches;
        this.cachedPrdHash = currentHash;
        return batches;
    }
    hashPRD() {
        // Simple hash based on story count and passes status
        const storyCount = this.prd.userStories.length;
        const completedCount = this.prd.userStories.filter((s) => s.passes).length;
        return `${storyCount}-${completedCount}`;
    }
    getReadyStories(completed, inProgress) {
        return this.prd.userStories
            .filter((story) => !completed.has(story.id) && !inProgress.has(story.id))
            .filter((story) => story.dependencies.every((dep) => completed.has(dep)))
            .sort((a, b) => b.priority - a.priority);
    }
    getExecutionSummary() {
        const batches = this.generateBatches();
        const maxParallel = batches.length > 0 ? Math.max(...batches.map((b) => b.stories.length)) : 0;
        return {
            totalStories: this.prd.userStories.length,
            maxParallelStories: maxParallel,
            estimatedBatches: batches.length,
            criticalPath: this.findCriticalPath(),
        };
    }
    findCriticalPath() {
        const depths = new Map();
        const memo = new Map();
        const getDepth = (storyId) => {
            if (memo.has(storyId))
                return memo.get(storyId);
            const story = this.storyMap.get(storyId);
            if (!story)
                return 0;
            const depth = story.dependencies.length === 0
                ? 1
                : Math.max(...story.dependencies.map((dep) => getDepth(dep))) + 1;
            memo.set(storyId, depth);
            return depth;
        };
        this.prd.userStories.forEach((story) => depths.set(story.id, getDepth(story.id)));
        return this.buildCriticalPath(depths);
    }
    buildCriticalPath(depths) {
        const path = [];
        let current = Array.from(depths.entries()).sort((a, b) => b[1] - a[1])[0][0];
        while (current) {
            path.push(current);
            const story = this.storyMap.get(current);
            if (!story || story.dependencies.length === 0)
                break;
            const nextDep = story.dependencies
                .map((dep) => ({ id: dep, depth: depths.get(dep) ?? 0 }))
                .sort((a, b) => b.depth - a.depth)[0];
            current = nextDep.id;
        }
        return path;
    }
    visualize() {
        const summary = this.getExecutionSummary();
        return [
            "Dependency Graph:",
            "",
            ...this.prd.userStories.map((story) => `  ${story.id}: ${story.title} (priority: ${story.priority})${story.dependencies.length > 0 ? ` <- [${story.dependencies.join(", ")}]` : ""}`),
            "",
            "Summary:",
            `  Total stories: ${summary.totalStories}`,
            `  Max parallel: ${summary.maxParallelStories}`,
            `  Estimated batches: ${summary.estimatedBatches}`,
            `  Critical path: [${summary.criticalPath.join(" -> ")}]`,
        ].join("\n");
    }
}
exports.DependencyGraph = DependencyGraph;
//# sourceMappingURL=dependency-graph.js.map