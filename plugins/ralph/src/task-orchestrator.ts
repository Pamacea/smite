// SMITE Ralph - Task Orchestrator
// Parallel execution engine using Claude Code Task tool

import { PRD, UserStory, TaskResult, RalphState, StoryBatch } from "./types";
import { DependencyGraph } from "./dependency-graph";
import { StateManager } from "./state-manager";
import { PRDParser } from "./prd-parser";
import { SpecGenerator } from "./spec-generator";
import * as path from "path";

export class TaskOrchestrator {
  private prd: PRD;
  private dependencyGraph: DependencyGraph;
  private stateManager: StateManager;
  private specGenerator: SpecGenerator;
  private smiteDir: string;

  constructor(prd: PRD, smiteDir: string) {
    this.prd = prd;
    this.dependencyGraph = new DependencyGraph(prd);
    this.stateManager = new StateManager(smiteDir);
    this.specGenerator = new SpecGenerator(smiteDir);
    this.smiteDir = smiteDir;
  }

  private static readonly DEFAULT_MAX_ITERATIONS = Infinity; // No limit by default - execute all stories

  async execute(maxIterations = TaskOrchestrator.DEFAULT_MAX_ITERATIONS): Promise<RalphState> {
    // Get PRD path before initialization
    const prdPath = PRDParser.getStandardPRDPath();

    // Validate PRD exists before starting
    await PRDParser.assertPRDExists();

    const state = await this.stateManager.initialize(maxIterations, prdPath);
    const batches = this.dependencyGraph.generateBatches();

    this.logExecutionStart(batches.length, prdPath);

    for (const batch of batches) {
      if (this.shouldStopExecution(state, maxIterations)) break;
      await this.executeBatch(batch, state);
    }

    await this.finalizeExecution(state, maxIterations);
    return state;
  }

  private logExecutionStart(batchCount: number, prdPath: string): void {
    console.log(`\n🚀 Starting Ralph execution with ${this.prd.userStories.length} stories`);
    console.log(`📄 PRD: ${prdPath}`);
    console.log(`📊 Optimized into ${batchCount} batches (parallel execution)\n`);
  }

  private shouldStopExecution(state: RalphState, maxIterations: number): boolean {
    // If infinite iterations, only stop when all stories are done
    if (maxIterations === Infinity) {
      const allStoriesCompleted = state.completedStories.length >= this.prd.userStories.length;
      if (allStoriesCompleted) {
        console.log(`\n✅ All ${this.prd.userStories.length} stories completed!`);
        return true;
      }
      return false;
    }

    // If limited iterations, check if reached
    if (state.currentIteration >= state.maxIterations) {
      const completed = state.completedStories.length;
      const total = this.prd.userStories.length;
      console.log(`\n⚠️  Max iterations (${maxIterations}) reached`);
      console.log(`   Completed: ${completed}/${total} stories`);
      console.log(`   Use --max-iterations=${total} or higher to complete all stories`);
      state.status = "failed";
      return true;
    }

    return false;
  }

  private async executeBatch(batch: StoryBatch, state: RalphState): Promise<void> {
    console.log(`\n📦 Batch ${batch.batchNumber}: ${batch.stories.length} story(ies)`);

    if (batch.canRunInParallel) {
      console.log(`⚡ Running in PARALLEL: ${batch.stories.map((s) => s.id).join(", ")}`);
      await this.executeBatchParallel(batch.stories, state);
    } else {
      const story = batch.stories[0];
      console.log(`📝 Running sequential: ${story.id}`);
      await this.executeStory(story, state);
    }

    state.currentBatch = batch.batchNumber;
    await this.stateManager.save(state);
  }

  private async finalizeExecution(state: RalphState, maxIterations: number): Promise<void> {
    if (state.status === "running") {
      state.status = state.failedStories.length === 0 ? "completed" : "failed";
    }

    await this.stateManager.save(state);

    console.log(`\n${state.status === "completed" ? "✅" : "❌"} Ralph execution ${state.status}`);
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

    const promises = stories.map((story) => this.executeStory(story, state));
    await Promise.all(promises);
  }

  private async executeStory(story: UserStory, state: RalphState): Promise<void> {
    state.inProgressStory = story.id;
    state.lastActivity = Date.now();

    console.log(`   → Executing ${story.id}: ${story.title}`);
    console.log(`      Agent: ${story.agent}`);

    // Spec-first workflow: Generate spec before invoking agent
    const specResult = await this.generateAndValidateSpec(story);
    if (!specResult.valid) {
      await this.processStoryResult(story, state, {
        storyId: story.id,
        success: false,
        output: "",
        error: `Spec validation failed: ${specResult.gaps.join(", ")}`,
        timestamp: Date.now(),
      });
      state.inProgressStory = null;
      return;
    }

    const result = await this.invokeAgent(story, specResult.specPath);
    await this.processStoryResult(story, state, result);

    state.inProgressStory = null;
    state.currentIteration++;
  }

  private async processStoryResult(
    story: UserStory,
    state: RalphState,
    result: TaskResult
  ): Promise<void> {
    if (result.success) {
      state.completedStories.push(story.id);
      await this.updateStoryStatus(story, true, result.output);
      console.log("      ✅ PASSED");
      return;
    }

    state.failedStories.push(story.id);
    await this.updateStoryStatus(story, false, result.error ?? "Unknown error");
    console.log(`      ❌ FAILED: ${result.error}`);
  }

  /**
   * Update story status in memory and persist to PRD file
   * Consolidates duplicate PRD update logic
   */
  private async updateStoryStatus(story: UserStory, passes: boolean, notes: string): Promise<void> {
    story.passes = passes;
    story.notes = notes;
    await PRDParser.updateStory(story.id, { passes, notes });
  }

  /**
   * Invoke Claude Code agent for story execution
   * In real implementation, this uses the Task tool
   */
  private async invokeAgent(story: UserStory, specPath?: string): Promise<TaskResult> {
    // This is a placeholder for the actual Task tool invocation
    // In production, this would call Claude Code's Task tool like:
    // Task(subagent_type=story.agent, prompt=this.buildPrompt(story, specPath))

    const prompt = this.buildPrompt(story, specPath);

    // Simulate execution
    return {
      storyId: story.id,
      success: true,
      output: `Executed: ${story.title}${specPath ? ` with spec: ${specPath}` : ""}`,
      timestamp: Date.now(),
    };
  }

  /**
   * Generate and validate specification before agent execution
   */
  private async generateAndValidateSpec(story: UserStory): Promise<{
    valid: boolean;
    specPath?: string;
    gaps: string[];
  }> {
    try {
      console.log(`      📋 Generating specification for ${story.id}...`);

      const spec = await this.specGenerator.generateSpec(story);
      const specPath = await this.specGenerator.writeSpec(spec);

      console.log(`      ✅ Spec written to: ${specPath}`);

      const validation = await this.specGenerator.validateSpec(spec);

      if (validation.warnings.length > 0) {
        console.log(`      ⚠️  Spec warnings: ${validation.warnings.join(", ")}`);
      }

      if (!validation.valid) {
        console.log(`      ❌ Spec validation failed: ${validation.gaps.join(", ")}`);
        return { valid: false, gaps: validation.gaps };
      }

      console.log(`      ✅ Spec validated successfully`);

      return { valid: true, specPath, gaps: [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.log(`      ❌ Spec generation failed: ${errorMessage}`);
      return { valid: false, gaps: [errorMessage] };
    }
  }

  /**
   * Build agent prompt from user story
   */
  private buildPrompt(story: UserStory, specPath?: string): string {
    const parts = [
      `Story ID: ${story.id}`,
      `Title: ${story.title}`,
      `Description: ${story.description}`,
      "",
    ];

    if (specPath) {
      parts.push("**SPEC-FIRST MODE ENABLED**");
      parts.push("");
      parts.push(`You MUST read the specification at: ${specPath}`);
      parts.push("");
      parts.push("Follow the specification EXACTLY:");
      parts.push("1. Read the spec completely before starting");
      parts.push("2. Implement steps in the order defined");
      parts.push("3. DO NOT deviate from the spec without updating it first");
      parts.push("4. If you find a logic gap: STOP, report it, wait for spec update");
      parts.push("");
    }

    parts.push("Acceptance Criteria:");
    parts.push(...story.acceptanceCriteria.map((c, i) => `  ${i + 1}. ${c}`));
    parts.push("");

    if (story.dependencies.length > 0) {
      parts.push(`Dependencies: ${story.dependencies.join(", ")}`);
    } else {
      parts.push("No dependencies - can start immediately");
    }

    return parts.join("\n");
  }

  /**
   * Get execution status (async)
   */
  async getStatus(): Promise<string> {
    const state = await this.stateManager.load();
    if (!state) return "Not started";

    const summary = this.dependencyGraph.getExecutionSummary();

    return `
Ralph Execution Status:
========================
Session: ${state.sessionId}
Status: ${state.status}
Progress: ${state.completedStories.length}/${summary.totalStories} stories
Batch: ${state.currentBatch}/${summary.estimatedBatches}
Iteration: ${state.currentIteration}/${state.maxIterations}

Completed: [${state.completedStories.join(", ") || "None"}]
Failed: [${state.failedStories.join(", ") || "None"}]
In Progress: ${state.inProgressStory || "None"}

Last Activity: ${new Date(state.lastActivity).toISOString()}
    `.trim();
  }
}
