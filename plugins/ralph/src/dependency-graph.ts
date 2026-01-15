import { PRD, UserStory, StoryBatch } from "./types";

export class DependencyGraph {
  private readonly storyMap: Map<string, UserStory>;
  private cachedBatches: StoryBatch[] | null = null;
  private cachedPrdHash: string | null = null;

  constructor(private prd: PRD) {
    this.storyMap = new Map(prd.userStories.map((s) => [s.id, s]));
  }

  generateBatches(): StoryBatch[] {
    // Check if cache is valid
    const currentHash = this.hashPRD();
    if (this.cachedBatches && this.cachedPrdHash === currentHash) {
      return this.cachedBatches;
    }

    // Recalculate and cache
    const batches: StoryBatch[] = [];
    const completed = new Set<string>();
    const inProgress = new Set<string>();
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

  private hashPRD(): string {
    // Simple hash based on story count and passes status
    const storyCount = this.prd.userStories.length;
    const completedCount = this.prd.userStories.filter((s) => s.passes).length;
    return `${storyCount}-${completedCount}`;
  }

  private getReadyStories(completed: Set<string>, inProgress: Set<string>): UserStory[] {
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

  private findCriticalPath(): string[] {
    const depths = new Map<string, number>();
    const memo = new Map<string, number>();

    const getDepth = (storyId: string): number => {
      if (memo.has(storyId)) return memo.get(storyId)!;

      const story = this.storyMap.get(storyId);
      if (!story) return 0;

      const depth =
        story.dependencies.length === 0
          ? 1
          : Math.max(...story.dependencies.map((dep) => getDepth(dep))) + 1;

      memo.set(storyId, depth);
      return depth;
    };

    this.prd.userStories.forEach((story) => depths.set(story.id, getDepth(story.id)));

    return this.buildCriticalPath(depths);
  }

  private buildCriticalPath(depths: Map<string, number>): string[] {
    const path: string[] = [];
    let current = Array.from(depths.entries()).sort((a, b) => b[1] - a[1])[0][0];

    while (current) {
      path.push(current);
      const story = this.storyMap.get(current);
      if (!story || story.dependencies.length === 0) break;

      const nextDep = story.dependencies
        .map((dep) => ({ id: dep, depth: depths.get(dep) ?? 0 }))
        .sort((a, b) => b.depth - a.depth)[0];

      current = nextDep.id;
    }

    return path;
  }

  visualize(): string {
    const summary = this.getExecutionSummary();

    return [
      "Dependency Graph:",
      "",
      ...this.prd.userStories.map(
        (story) =>
          `  ${story.id}: ${story.title} (priority: ${story.priority})${
            story.dependencies.length > 0 ? ` <- [${story.dependencies.join(", ")}]` : ""
          }`
      ),
      "",
      "Summary:",
      `  Total stories: ${summary.totalStories}`,
      `  Max parallel: ${summary.maxParallelStories}`,
      `  Estimated batches: ${summary.estimatedBatches}`,
      `  Critical path: [${summary.criticalPath.join(" -> ")}]`,
    ].join("\n");
  }
}
