"use strict";
// SMITE Ralph - Stop Hook Handler
// Implements Ralph Wiggum infinite loop technique
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StopHookHandler = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class StopHookHandler {
    constructor(cwd = process.cwd()) {
        this.smiteDir = path.join(cwd, '.smite');
        this.statePath = path.join(this.smiteDir, 'ralph-state.json');
        this.originalPromptPath = path.join(this.smiteDir, 'original-prompt.txt');
    }
    /**
     * Check if Ralph should continue looping
     * Returns the original prompt if should continue, null otherwise
     */
    shouldContinue() {
        // Load state
        if (!fs.existsSync(this.statePath)) {
            return null;
        }
        const state = JSON.parse(fs.readFileSync(this.statePath, 'utf-8'));
        // Check if running
        if (state.status !== 'running') {
            return null;
        }
        // Check if max iterations reached
        if (state.currentIteration >= state.maxIterations) {
            this.updateStatus('failed');
            return null;
        }
        // Check for inactivity timeout (30 minutes)
        const inactiveTime = Date.now() - state.lastActivity;
        if (inactiveTime > 30 * 60 * 1000) {
            this.updateStatus('failed');
            this.appendProgress('⏰ Session timed out after 30 minutes of inactivity');
            return null;
        }
        // Load original prompt
        if (!fs.existsSync(this.originalPromptPath)) {
            return null;
        }
        const originalPrompt = fs.readFileSync(this.originalPromptPath, 'utf-8');
        // Increment iteration
        state.currentIteration++;
        state.lastActivity = Date.now();
        fs.writeFileSync(this.statePath, JSON.stringify(state, null, 2));
        // Append progress
        this.appendProgress(`🔄 Iteration ${state.currentIteration}/${state.maxIterations}`);
        // Return original prompt to continue loop
        return originalPrompt;
    }
    /**
     * Save original prompt for looping
     */
    saveOriginalPrompt(prompt) {
        fs.writeFileSync(this.originalPromptPath, prompt);
        this.appendProgress(`💾 Original prompt saved for looping`);
    }
    /**
     * Initialize Ralph session
     */
    initializeSession(maxIterations) {
        const state = {
            sessionId: this.generateSessionId(),
            startTime: Date.now(),
            currentIteration: 0,
            maxIterations,
            currentBatch: 0,
            totalBatches: 0,
            completedStories: [],
            failedStories: [],
            inProgressStory: null,
            status: 'running',
            lastActivity: Date.now(),
        };
        fs.writeFileSync(this.statePath, JSON.stringify(state, null, 2));
        this.appendProgress(`🚀 Ralph session initialized: ${state.sessionId}`);
    }
    /**
     * Update session status
     */
    updateStatus(status) {
        if (!fs.existsSync(this.statePath))
            return;
        const state = JSON.parse(fs.readFileSync(this.statePath, 'utf-8'));
        state.status = status;
        state.lastActivity = Date.now();
        fs.writeFileSync(this.statePath, JSON.stringify(state, null, 2));
        this.appendProgress(`📊 Status updated: ${status}`);
    }
    /**
     * Mark story as completed
     */
    markStoryCompleted(storyId) {
        if (!fs.existsSync(this.statePath))
            return;
        const state = JSON.parse(fs.readFileSync(this.statePath, 'utf-8'));
        if (!state.completedStories.includes(storyId)) {
            state.completedStories.push(storyId);
            this.appendProgress(`✅ ${storyId} - PASSED`);
        }
        state.lastActivity = Date.now();
        fs.writeFileSync(this.statePath, JSON.stringify(state, null, 2));
    }
    /**
     * Mark story as failed
     */
    markStoryFailed(storyId, error) {
        if (!fs.existsSync(this.statePath))
            return;
        const state = JSON.parse(fs.readFileSync(this.statePath, 'utf-8'));
        if (!state.failedStories.includes(storyId)) {
            state.failedStories.push(storyId);
            this.appendProgress(`❌ ${storyId} - FAILED: ${error}`);
        }
        state.currentIteration++;
        state.lastActivity = Date.now();
        fs.writeFileSync(this.statePath, JSON.stringify(state, null, 2));
    }
    /**
     * Get current state
     */
    getState() {
        if (!fs.existsSync(this.statePath))
            return null;
        return JSON.parse(fs.readFileSync(this.statePath, 'utf-8'));
    }
    /**
     * Append to progress log
     */
    appendProgress(message) {
        const progressPath = path.join(this.smiteDir, 'progress.txt');
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${message}\n`;
        fs.appendFileSync(progressPath, logEntry);
    }
    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return `ralph-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Clear session
     */
    clear() {
        if (fs.existsSync(this.statePath)) {
            fs.unlinkSync(this.statePath);
        }
        if (fs.existsSync(this.originalPromptPath)) {
            fs.unlinkSync(this.originalPromptPath);
        }
    }
    /**
     * Get session summary
     */
    getSummary() {
        const state = this.getState();
        if (!state)
            return 'No active Ralph session';
        const duration = Date.now() - state.startTime;
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        return `
Ralph Session Summary
=====================
Session ID: ${state.sessionId}
Status: ${state.status}
Duration: ${minutes}m ${seconds}s
Iterations: ${state.currentIteration}/${state.maxIterations}
Completed: ${state.completedStories.length} stories
Failed: ${state.failedStories.length} stories
In Progress: ${state.inProgressStory || 'None'}
    `.trim();
    }
}
exports.StopHookHandler = StopHookHandler;
//# sourceMappingURL=stop-handler.js.map