"use strict";
// SMITE Ralph - Main Entry Point
// Multi-agent orchestrator with parallel execution
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
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
exports.checkCompletionPromise = exports.clearLoopFile = exports.incrementLoopIteration = exports.readLoopConfig = exports.setupAndExecuteLoop = exports.setupRalphLoop = exports.SpecLock = exports.SpecGenerator = exports.PRDGenerator = exports.StateManager = exports.TaskOrchestrator = exports.DependencyGraph = exports.PRDParser = void 0;
exports.execute = execute;
exports.executeFromPRD = executeFromPRD;
var prd_parser_1 = require("./prd-parser");
Object.defineProperty(exports, "PRDParser", { enumerable: true, get: function () { return prd_parser_1.PRDParser; } });
var dependency_graph_1 = require("./dependency-graph");
Object.defineProperty(exports, "DependencyGraph", { enumerable: true, get: function () { return dependency_graph_1.DependencyGraph; } });
var task_orchestrator_1 = require("./task-orchestrator");
Object.defineProperty(exports, "TaskOrchestrator", { enumerable: true, get: function () { return task_orchestrator_1.TaskOrchestrator; } });
var state_manager_1 = require("./state-manager");
Object.defineProperty(exports, "StateManager", { enumerable: true, get: function () { return state_manager_1.StateManager; } });
var prd_generator_1 = require("./prd-generator");
Object.defineProperty(exports, "PRDGenerator", { enumerable: true, get: function () { return prd_generator_1.PRDGenerator; } });
var spec_generator_1 = require("./spec-generator");
Object.defineProperty(exports, "SpecGenerator", { enumerable: true, get: function () { return spec_generator_1.SpecGenerator; } });
var spec_lock_1 = require("./spec-lock");
Object.defineProperty(exports, "SpecLock", { enumerable: true, get: function () { return spec_lock_1.SpecLock; } });
__exportStar(require("./path-utils"), exports);
var loop_setup_1 = require("./loop-setup");
Object.defineProperty(exports, "setupRalphLoop", { enumerable: true, get: function () { return loop_setup_1.setupRalphLoop; } });
Object.defineProperty(exports, "setupAndExecuteLoop", { enumerable: true, get: function () { return loop_setup_1.setupAndExecuteLoop; } });
Object.defineProperty(exports, "readLoopConfig", { enumerable: true, get: function () { return loop_setup_1.readLoopConfig; } });
Object.defineProperty(exports, "incrementLoopIteration", { enumerable: true, get: function () { return loop_setup_1.incrementLoopIteration; } });
Object.defineProperty(exports, "clearLoopFile", { enumerable: true, get: function () { return loop_setup_1.clearLoopFile; } });
Object.defineProperty(exports, "checkCompletionPromise", { enumerable: true, get: function () { return loop_setup_1.checkCompletionPromise; } });
__exportStar(require("./types"), exports);
// Re-export for convenience
const prd_parser_2 = require("./prd-parser");
const prd_generator_2 = require("./prd-generator");
const task_orchestrator_2 = require("./task-orchestrator");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
/**
 * Quick start: Execute Ralph from a prompt
 * IMPORTANT: This MERGES with existing PRD instead of overwriting
 *
 * By default, executes ALL stories (no limit). Use maxIterations to limit.
 */
async function execute(prompt, options) {
    try {
        const smiteDir = path.join(process.cwd(), ".smite");
        // Generate PRD from prompt
        const newPrd = prd_generator_2.PRDGenerator.generateFromPrompt(prompt);
        // Merge with existing PRD (preserves completed stories)
        const prdPath = await prd_parser_2.PRDParser.mergePRD(newPrd);
        // Load merged PRD for execution
        const mergedPrd = await prd_parser_2.PRDParser.loadFromSmiteDir();
        if (!mergedPrd) {
            throw new Error("Failed to load merged PRD");
        }
        console.log(`\n✅ PRD ready at: ${prdPath}`);
        console.log(`📊 Stories: ${mergedPrd.userStories.length} total`);
        // Execute (no limit by default - completes all stories)
        const orchestrator = new task_orchestrator_2.TaskOrchestrator(mergedPrd, smiteDir);
        const maxIterations = options?.maxIterations ?? Infinity; // Default: unlimited
        if (maxIterations !== Infinity) {
            console.log(`⚠️  Limited to ${maxIterations} stories`);
        }
        return await orchestrator.execute(maxIterations);
    }
    catch (error) {
        console.error("❌ Ralph execution failed:", error);
        throw error; // Re-throw for caller to handle
    }
}
/**
 * Execute Ralph from existing PRD file
 */
async function executeFromPRD(prdPath, options) {
    const smiteDir = path.join(process.cwd(), ".smite");
    // Validate PRD exists
    try {
        await fs.promises.access(prdPath, fs.constants.F_OK);
    }
    catch {
        throw new Error(`PRD file not found: ${prdPath}`);
    }
    // Load PRD
    const prd = await prd_parser_2.PRDParser.parseFromFile(prdPath);
    // Merge with existing PRD at standard location (preserves completed stories)
    const standardPath = await prd_parser_2.PRDParser.mergePRD(prd);
    console.log(`\n✅ PRD merged to standard location: ${standardPath}`);
    // Load merged PRD for execution
    const mergedPrd = await prd_parser_2.PRDParser.loadFromSmiteDir();
    if (!mergedPrd) {
        throw new Error("Failed to load merged PRD");
    }
    console.log(`📊 Stories: ${mergedPrd.userStories.length} total`);
    // Execute (no limit by default)
    const orchestrator = new task_orchestrator_2.TaskOrchestrator(mergedPrd, smiteDir);
    const maxIterations = options?.maxIterations ?? Infinity; // Default: unlimited
    if (maxIterations !== Infinity) {
        console.log(`⚠️  Limited to ${maxIterations} stories`);
    }
    return await orchestrator.execute(maxIterations);
}
//# sourceMappingURL=index.js.map