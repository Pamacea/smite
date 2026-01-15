"use strict";
// SMITE Ralph - Task Orchestrator
// Parallel execution engine using Claude Code Task tool
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskOrchestrator = void 0;
const dependency_graph_1 = require("./dependency-graph");
const state_manager_1 = require("./state-manager");
const prd_parser_1 = require("./prd-parser");
class TaskOrchestrator {
    constructor(prd, smiteDir) {
        this.prd = prd;
        this.dependencyGraph = new dependency_graph_1.DependencyGraph(prd);
        this.stateManager = new state_manager_1.StateManager(smiteDir);
    }
    async execute(maxIterations = TaskOrchestrator.DEFAULT_MAX_ITERATIONS) {
        // Get PRD path before initialization
        const prdPath = prd_parser_1.PRDParser.getStandardPRDPath();
        // Validate PRD exists before starting
        prd_parser_1.PRDParser.assertPRDExists();
        const state = this.stateManager.initialize(maxIterations, prdPath);
        const batches = this.dependencyGraph.generateBatches();
        this.logExecutionStart(batches.length, prdPath);
        for (const batch of batches) {
            if (this.shouldStopExecution(state, maxIterations))
                break;
            await this.executeBatch(batch, state);
        }
        this.finalizeExecution(state, maxIterations);
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
            state.status = 'failed';
            return true;
        }
        return false;
    }
    async executeBatch(batch, state) {
        console.log(`\n📦 Batch ${batch.batchNumber}: ${batch.stories.length} story(ies)`);
        if (batch.canRunInParallel) {
            console.log(`⚡ Running in PARALLEL: ${batch.stories.map(s => s.id).join(', ')}`);
            await this.executeBatchParallel(batch.stories, state);
        }
        else {
            const story = batch.stories[0];
            console.log(`📝 Running sequential: ${story.id}`);
            await this.executeStory(story, state);
        }
        state.currentBatch = batch.batchNumber;
        this.stateManager.save(state);
    }
    finalizeExecution(state, maxIterations) {
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
    async executeBatchParallel(stories, state) {
        // In a real implementation, this would launch multiple Claude Code agents in parallel
        // For now, we simulate by marking them as ready for parallel execution
        console.log(`   → Stories can run in parallel:`);
        const promises = stories.map(story => this.executeStory(story, state));
        await Promise.all(promises);
    }
    async executeStory(story, state) {
        state.inProgressStory = story.id;
        state.lastActivity = Date.now();
        console.log(`   → Executing ${story.id}: ${story.title}`);
        console.log(`      Agent: ${story.agent}`);
        const result = await this.invokeAgent(story);
        this.processStoryResult(story, state, result);
        state.inProgressStory = null;
        state.currentIteration++;
    }
    processStoryResult(story, state, result) {
        if (result.success) {
            state.completedStories.push(story.id);
            story.passes = true;
            story.notes = result.output;
            console.log('      ✅ PASSED');
            // Save story status to PRD file
            prd_parser_1.PRDParser.updateStory(story.id, { passes: true, notes: result.output });
            return;
        }
        state.failedStories.push(story.id);
        story.passes = false;
        story.notes = result.error ?? 'Unknown error';
        console.log(`      ❌ FAILED: ${result.error}`);
        // Save story status to PRD file
        prd_parser_1.PRDParser.updateStory(story.id, { passes: false, notes: result.error ?? 'Unknown error' });
    }
    /**
     * Invoke Claude Code agent for story execution
     * In real implementation, this uses the Task tool
     */
    async invokeAgent(story) {
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
    buildPrompt(story) {
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
    getStatus() {
        const state = this.stateManager.load();
        if (!state)
            return 'Not started';
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
exports.TaskOrchestrator = TaskOrchestrator;
TaskOrchestrator.DEFAULT_MAX_ITERATIONS = Infinity; // No limit by default - execute all stories
//# sourceMappingURL=task-orchestrator.js.map