"use strict";
// SMITE Ralph - Task Orchestrator
// Parallel execution engine using Claude Code Task tool
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskOrchestrator = void 0;
const dependency_graph_1 = require("./dependency-graph");
const state_manager_1 = require("./state-manager");
const prd_parser_1 = require("./prd-parser");
const spec_generator_1 = require("./spec-generator");
class TaskOrchestrator {
    constructor(prd, smiteDir) {
        this.prd = prd;
        this.dependencyGraph = new dependency_graph_1.DependencyGraph(prd);
        this.stateManager = new state_manager_1.StateManager(smiteDir);
        this.specGenerator = new spec_generator_1.SpecGenerator(smiteDir);
        this.smiteDir = smiteDir;
    }
    async execute(maxIterations = TaskOrchestrator.DEFAULT_MAX_ITERATIONS) {
        // Get PRD path before initialization
        const prdPath = prd_parser_1.PRDParser.getStandardPRDPath();
        // Validate PRD exists before starting
        await prd_parser_1.PRDParser.assertPRDExists();
        const state = await this.stateManager.initialize(maxIterations, prdPath);
        const batches = this.dependencyGraph.generateBatches();
        this.logExecutionStart(batches.length, prdPath);
        for (const batch of batches) {
            if (this.shouldStopExecution(state, maxIterations))
                break;
            await this.executeBatch(batch, state);
        }
        await this.finalizeExecution(state, maxIterations);
        return state;
    }
    logExecutionStart(batchCount, prdPath) {
        console.log(`\n🚀 Starting Ralph execution with ${this.prd.userStories.length} stories`);
        console.log(`📄 PRD: ${prdPath}`);
        console.log(`📊 Optimized into ${batchCount} batches (parallel execution)\n`);
    }
    shouldStopExecution(state, maxIterations) {
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
    async executeBatch(batch, state) {
        console.log(`\n📦 Batch ${batch.batchNumber}: ${batch.stories.length} story(ies)`);
        if (batch.canRunInParallel) {
            console.log(`⚡ Running in PARALLEL: ${batch.stories.map((s) => s.id).join(", ")}`);
            await this.executeBatchParallel(batch.stories, state);
        }
        else {
            const story = batch.stories[0];
            console.log(`📝 Running sequential: ${story.id}`);
            await this.executeStory(story, state);
        }
        state.currentBatch = batch.batchNumber;
        await this.stateManager.save(state);
    }
    async finalizeExecution(state, maxIterations) {
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
    async executeBatchParallel(stories, state) {
        // In a real implementation, this would launch multiple Claude Code agents in parallel
        // For now, we simulate by marking them as ready for parallel execution
        console.log(`   → Stories can run in parallel:`);
        const promises = stories.map((story) => this.executeStory(story, state));
        await Promise.all(promises);
    }
    async executeStory(story, state) {
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
    async processStoryResult(story, state, result) {
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
    async updateStoryStatus(story, passes, notes) {
        story.passes = passes;
        story.notes = notes;
        await prd_parser_1.PRDParser.updateStory(story.id, { passes, notes });
    }
    /**
     * Invoke Claude Code agent for story execution
     * In real implementation, this uses the Task tool
     */
    async invokeAgent(story, specPath) {
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
    async generateAndValidateSpec(story) {
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            console.log(`      ❌ Spec generation failed: ${errorMessage}`);
            return { valid: false, gaps: [errorMessage] };
        }
    }
    /**
     * Build agent prompt from user story
     */
    buildPrompt(story, specPath) {
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
        }
        else {
            parts.push("No dependencies - can start immediately");
        }
        return parts.join("\n");
    }
    /**
     * Get execution status (async)
     */
    async getStatus() {
        const state = await this.stateManager.load();
        if (!state)
            return "Not started";
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
exports.TaskOrchestrator = TaskOrchestrator;
TaskOrchestrator.DEFAULT_MAX_ITERATIONS = Infinity; // No limit by default - execute all stories
//# sourceMappingURL=task-orchestrator.js.map