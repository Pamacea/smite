"use strict";
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
        this.logProgress(`\n🚀 Ralph session started: ${state.sessionId}`, `Max iterations: ${maxIterations}\n`);
        return state;
    }
    load() {
        if (!fs.existsSync(this.statePath))
            return null;
        try {
            return JSON.parse(fs.readFileSync(this.statePath, 'utf-8'));
        }
        catch {
            return null;
        }
    }
    save(state) {
        fs.writeFileSync(this.statePath, JSON.stringify(state, null, 2));
    }
    update(updates) {
        const state = this.load();
        if (!state)
            return null;
        const updated = { ...state, ...updates, lastActivity: Date.now() };
        this.save(updated);
        return updated;
    }
    markStoryResult(storyId, success, error) {
        const state = this.load();
        if (!state)
            return null;
        const array = success ? state.completedStories : state.failedStories;
        const emoji = success ? '✅' : '❌';
        const status = success ? 'PASSED' : `FAILED: ${error}`;
        if (!array.includes(storyId)) {
            array.push(storyId);
            this.logProgress(`${emoji} ${storyId} - ${status}`);
        }
        state.currentIteration++;
        state.lastActivity = Date.now();
        this.save(state);
        return state;
    }
    setInProgress(storyId) {
        return this.update({ inProgressStory: storyId });
    }
    setStatus(status) {
        const state = this.update({ status });
        if (state) {
            this.logProgress(`\n📊 Status changed to: ${status}`);
        }
        return state;
    }
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
    clear() {
        [this.statePath, this.progressPath].forEach(filePath => {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });
    }
    getDuration(state) {
        const duration = Date.now() - state.startTime;
        const minutes = Math.floor(duration / StateManager.MINUTES_MS);
        const seconds = Math.floor((duration % StateManager.MINUTES_MS) / 1000);
        return `${minutes}m ${seconds}s`;
    }
    logProgress(...messages) {
        const timestamp = new Date().toISOString();
        fs.appendFileSync(this.progressPath, messages.map(m => `[${timestamp}] ${m}`).join('\n') + '\n');
    }
}
exports.StateManager = StateManager;
StateManager.MINUTES_MS = 60000;
//# sourceMappingURL=state-manager.js.map