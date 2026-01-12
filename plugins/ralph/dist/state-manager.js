"use strict";
// SMITE Ralph - State Manager
// Manage Ralph execution state in .smite/ralph-state.json
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
exports.StateManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
class StateManager {
    constructor(smiteDir) {
        this.statePath = path.join(smiteDir, 'ralph-state.json');
        this.progressPath = path.join(smiteDir, 'progress.txt');
    }
    /**
     * Initialize new Ralph session
     */
    initialize(maxIterations) {
        const state = {
            sessionId: (0, uuid_1.v4)(),
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
        this.save(state);
        this.appendProgress(`\n🚀 Ralph session started: ${state.sessionId}`);
        this.appendProgress(`Max iterations: ${maxIterations}\n`);
        return state;
    }
    /**
     * Load current state
     */
    load() {
        if (!fs.existsSync(this.statePath))
            return null;
        try {
            const content = fs.readFileSync(this.statePath, 'utf-8');
            return JSON.parse(content);
        }
        catch {
            return null;
        }
    }
    /**
     * Save state
     */
    save(state) {
        fs.writeFileSync(this.statePath, JSON.stringify(state, null, 2));
    }
    /**
     * Update state
     */
    update(updates) {
        const state = this.load();
        if (!state)
            return null;
        const updated = { ...state, ...updates, lastActivity: Date.now() };
        this.save(updated);
        return updated;
    }
    /**
     * Mark story as completed
     */
    markCompleted(storyId) {
        const state = this.load();
        if (!state)
            return null;
        if (!state.completedStories.includes(storyId)) {
            state.completedStories.push(storyId);
            this.appendProgress(`✅ ${storyId} - PASSED`);
        }
        state.currentIteration++;
        state.lastActivity = Date.now();
        this.save(state);
        return state;
    }
    /**
     * Mark story as failed
     */
    markFailed(storyId, error) {
        const state = this.load();
        if (!state)
            return null;
        if (!state.failedStories.includes(storyId)) {
            state.failedStories.push(storyId);
            this.appendProgress(`❌ ${storyId} - FAILED: ${error}`);
        }
        state.currentIteration++;
        state.lastActivity = Date.now();
        this.save(state);
        return state;
    }
    /**
     * Set in-progress story
     */
    setInProgress(storyId) {
        return this.update({ inProgressStory: storyId });
    }
    /**
     * Set status
     */
    setStatus(status) {
        const state = this.update({ status });
        if (state) {
            this.appendProgress(`\n📊 Status changed to: ${status}`);
        }
        return state;
    }
    /**
     * Append to progress log
     */
    appendProgress(message) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${message}\n`;
        fs.appendFileSync(this.progressPath, logEntry);
    }
    /**
     * Read progress log
     */
    readProgress() {
        if (!fs.existsSync(this.progressPath))
            return '';
        try {
            return fs.readFileSync(this.progressPath, 'utf-8');
        }
        catch {
            return '';
        }
    }
    /**
     * Clear state
     */
    clear() {
        if (fs.existsSync(this.statePath)) {
            fs.unlinkSync(this.statePath);
        }
        if (fs.existsSync(this.progressPath)) {
            fs.unlinkSync(this.progressPath);
        }
    }
    /**
     * Get session duration
     */
    getDuration(state) {
        const duration = Date.now() - state.startTime;
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        return `${minutes}m ${seconds}s`;
    }
}
exports.StateManager = StateManager;
//# sourceMappingURL=state-manager.js.map