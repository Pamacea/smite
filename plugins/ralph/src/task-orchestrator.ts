// SMITE Ralph - Task Orchestrator
// Parallel execution engine using Claude Code Task tool

import { PRD, UserStory, TaskResult, RalphState, StoryBatch } from './types';
import { DependencyGraph } from './dependency-graph';
import { StateManager } from './state-manager';
import * as path from 'path';

export class TaskOrchestrator {
  private prd: PRD;
  private dependencyGraph: DependencyGraph;
  private stateManager: StateManager;

  constructor(prd: PRD, smiteDir: string) {
    this.prd = prd;
    this.dependencyGraph = new DependencyGraph(prd);
    this.stateManager = new StateManager(smiteDir);
  }

  private static readonly DEFAULT_MAX_ITERATIONS = 50;

  async execute(maxIterations = TaskOrchestrator.DEFAULT_MAX_ITERATIONS): Promise<RalphState> {
    const state = this.stateManager.initialize(maxIterations);
    const batches = this.dependencyGraph.generateBatches();

    this.logExecutionStart(batches.length);

    for (const batch of batches) {
      if (this.shouldStopExecution(state, maxIterations)) break;
      await this.executeBatch(batch, state);
    }

    this.finalizeExecution(state, maxIterations);
    return state;
  }

  private logExecutionStart(batchCount: number): void {
    console.log(`\n🚀 Starting Ralph execution with ${this.prd.userStories.length} stories`);
    console.log(`📊 Optimized into ${batchCount} batches (parallel execution)\n`);
  }

  private shouldStopExecution(state: RalphState, maxIterations: number): boolean {
    if (state.currentIteration < state.maxIterations) return false;

    console.log(`\n⚠️  Max iterations (${maxIterations}) reached`);
    state.status = 'failed';
    return true;
  }

  private async executeBatch(batch: StoryBatch, state: RalphState): Promise<void> {
    console.log(`\n📦 Batch ${batch.batchNumber}: ${batch.stories.length} story(ies)`);

    if (batch.canRunInParallel) {
      console.log(`⚡ Running in PARALLEL: ${batch.stories.map(s => s.id).join(', ')}`);
      await this.executeBatchParallel(batch.stories, state);
    } else {
      const story = batch.stories[0];
      console.log(`📝 Running sequential: ${story.id}`);
      await this.executeStory(story, state);
    }

    state.currentBatch = batch.batchNumber;
    this.stateManager.save(state);
  }

  private finalizeExecution(state: RalphState, maxIterations: number): void {
    if (state.status === 'running') {
      state.status = state.failedStories.length === 0 ? 'completed' : 'failed';
    }

    this.stateManager.save(state);

    console.log(`\n${state.status === 'completed' ? '✅' : '❌'} Ralph execution ${state.status}`);
    console.log(`   Completed: ${state.completedStories.length}/${this.prd.userStories.length}`);
    console.log(`   Failed: ${state.failedStories.length}`);
    console.log(`   Iterations: ${state.currentIteration}/${maxIterations}\n`);
  }

  /**
   * Execute batch of stories in parallel
   * This is where the magic happens - multiple agents running simultaneously
   */
  private async executeBatchParallel(stories: UserStory[], state: RalphState): Promise<void> {
    // In a real implementation, this would launch multiple Claude Code agents in parallel
    // For now, we simulate by marking them as ready for parallel execution
    console.log(`   → Stories can run in parallel:`);

    const promises = stories.map(story => this.executeStory(story, state));
    await Promise.all(promises);
  }

  private async executeStory(story: UserStory, state: RalphState): Promise<void> {
    state.inProgressStory = story.id;
    state.lastActivity = Date.now();

    console.log(`   → Executing ${story.id}: ${story.title}`);
    console.log(`      Agent: ${story.agent}`);

    const result = await this.invokeAgent(story);
    this.processStoryResult(story, state, result);

    state.inProgressStory = null;
    state.currentIteration++;
  }

  private processStoryResult(story: UserStory, state: RalphState, result: TaskResult): void {
    if (result.success) {
      state.completedStories.push(story.id);
      story.passes = true;
      story.notes = result.output;
      console.log('      ✅ PASSED');
      return;
    }

    state.failedStories.push(story.id);
    story.passes = false;
    story.notes = result.error ?? 'Unknown error';
    console.log(`      ❌ FAILED: ${result.error}`);
  }

  /**
   * Invoke Claude Code agent for story execution
   * In real implementation, this uses the Task tool
   */
  private async invokeAgent(story: UserStory): Promise<TaskResult> {
    // This is a placeholder for the actual Task tool invocation
    // In production, this would call Claude Code's Task tool like:
    // Task(subagent_type=story.agent, prompt=this.buildPrompt(story))

    const prompt = this.buildPrompt(story);

    // Simulate execution
    return {
      storyId: story.id,
      success: true,
      output: `Executed: ${story.title}`,
      timestamp: Date.now(),
    };
  }

  /**
   * Build agent prompt from user story
   */
  private buildPrompt(story: UserStory): string {
    const parts = [
      `Story ID: ${story.id}`,
      `Title: ${story.title}`,
      `Description: ${story.description}`,
      '',
      'Acceptance Criteria:',
      ...story.acceptanceCriteria.map((c, i) => `  ${i + 1}. ${c}`),
      '',
      story.dependencies.length > 0
        ? `Dependencies: ${story.dependencies.join(', ')}`
        : 'No dependencies - can start immediately',
    ];

    return parts.join('\n');
  }

  /**
   * Get execution status
   */
  getStatus(): string {
    const state = this.stateManager.load();
    if (!state) return 'Not started';

    const summary = this.dependencyGraph.getExecutionSummary();

    return `
Ralph Execution Status:
========================
Session: ${state.sessionId}
Status: ${state.status}
Progress: ${state.completedStories.length}/${summary.totalStories} stories
Batch: ${state.currentBatch}/${summary.estimatedBatches}
Iteration: ${state.currentIteration}/${state.maxIterations}

Completed: [${state.completedStories.join(', ') || 'None'}]
Failed: [${state.failedStories.join(', ') || 'None'}]
In Progress: ${state.inProgressStory || 'None'}

Last Activity: ${new Date(state.lastActivity).toISOString()}
    `.trim();
  }
}
