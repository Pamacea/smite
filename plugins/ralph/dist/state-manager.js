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
const crypto = __importStar(require("crypto"));
const prd_parser_1 = require("./prd-parser");
class StateManager {
    constructor(smiteDir) {
        this.statePath = path.join(smiteDir, "ralph-state.json");
        this.progressPath = path.join(smiteDir, "progress.txt");
    }
    async initialize(maxIterations, prdPath) {
        // Use provided PRD path or default to standard location
        const effectivePrdPath = prdPath || prd_parser_1.PRDParser.getStandardPRDPath();
        // Validate PRD exists
        try {
            await fs.promises.access(effectivePrdPath, fs.constants.F_OK);
        }
        catch {
            throw new Error(`PRD not found at ${effectivePrdPath}. Cannot initialize Ralph session.`);
        }
        const state = {
            sessionId: crypto.randomUUID(),
            startTime: Date.now(),
            currentIteration: 0,
            maxIterations,
            currentBatch: 0,
            totalBatches: 0,
            completedStories: [],
            failedStories: [],
            inProgressStory: null,
            status: "running",
            lastActivity: Date.now(),
            prdPath: effectivePrdPath,
        };
        await this.save(state);
        await this.logProgress(`\n🚀 Ralph session started: ${state.sessionId}`);
        await this.logProgress(`📄 PRD: ${effectivePrdPath}`);
        await this.logProgress(`🔄 Max iterations: ${maxIterations}\n`);
        return state;
    }
    async load() {
        try {
            await fs.promises.access(this.statePath, fs.constants.F_OK);
        }
        catch {
            return null;
        }
        try {
            const content = await fs.promises.readFile(this.statePath, "utf-8");
            return JSON.parse(content);
        }
        catch {
            return null;
        }
    }
    async save(state) {
        await fs.promises.writeFile(this.statePath, JSON.stringify(state, null, 2), "utf-8");
    }
    async update(updates) {
        const state = await this.load();
        if (!state)
            return null;
        const updated = { ...state, ...updates, lastActivity: Date.now() };
        await this.save(updated);
        return updated;
    }
    async markStoryResult(storyId, success, error) {
        const state = await this.load();
        if (!state)
            return null;
        const array = success ? state.completedStories : state.failedStories;
        const emoji = success ? "✅" : "❌";
        const status = success ? "PASSED" : `FAILED: ${error}`;
        if (!array.includes(storyId)) {
            array.push(storyId);
            await this.logProgress(`${emoji} ${storyId} - ${status}`);
        }
        state.currentIteration++;
        state.lastActivity = Date.now();
        await this.save(state);
        return state;
    }
    async setInProgress(storyId) {
        return await this.update({ inProgressStory: storyId });
    }
    async setStatus(status) {
        const state = await this.update({ status });
        if (state) {
            await this.logProgress(`\n📊 Status changed to: ${status}`);
        }
        return state;
    }
    async readProgress() {
        try {
            await fs.promises.access(this.progressPath, fs.constants.F_OK);
            return await fs.promises.readFile(this.progressPath, "utf-8");
        }
        catch {
            return "";
        }
    }
    async clear() {
        for (const filePath of [this.statePath, this.progressPath]) {
            try {
                await fs.promises.unlink(filePath);
            }
            catch {
                // File doesn't exist, skip
            }
        }
    }
    getDuration(state) {
        const duration = Date.now() - state.startTime;
        const minutes = Math.floor(duration / StateManager.MINUTES_MS);
        const seconds = Math.floor((duration % StateManager.MINUTES_MS) / 1000);
        return `${minutes}m ${seconds}s`;
    }
    async logProgress(...messages) {
        const timestamp = new Date().toISOString();
        const content = messages.map((m) => `[${timestamp}] ${m}`).join("\n") + "\n";
        await fs.promises.appendFile(this.progressPath, content, "utf-8");
    }
    /**
     * Validate that the tracked PRD still exists - async
     * Returns true if PRD exists, false otherwise
     */
    async validatePRDExists() {
        const state = await this.load();
        if (!state)
            return false;
        try {
            await fs.promises.access(state.prdPath, fs.constants.F_OK);
            return true;
        }
        catch {
            await this.logProgress(`\n⚠️  WARNING: PRD file missing: ${state.prdPath}`);
            return false;
        }
    }
    /**
     * Check if PRD has been modified since session started - async
     * (Optional feature using hash comparison)
     */
    async hasPRDChanged() {
        const state = await this.load();
        if (!state || !state.prdHash)
            return false;
        try {
            const prd = await prd_parser_1.PRDParser.parseFromFile(state.prdPath);
            const currentHash = prd_parser_1.PRDParser.generateHash(prd);
            return currentHash !== state.prdHash;
        }
        catch {
            return false;
        }
    }
}
exports.StateManager = StateManager;
StateManager.MINUTES_MS = 60000;
//# sourceMappingURL=state-manager.js.map