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
exports.PRDGenerator = exports.StateManager = exports.TaskOrchestrator = exports.DependencyGraph = exports.PRDParser = void 0;
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
__exportStar(require("./loop-setup"), exports);
__exportStar(require("./types"), exports);
// Re-export for convenience
const prd_parser_2 = require("./prd-parser");
const prd_generator_2 = require("./prd-generator");
const task_orchestrator_2 = require("./task-orchestrator");
const path = __importStar(require("path"));
/**
 * Quick start: Execute Ralph from a prompt
 */
async function execute(prompt, options) {
    const smiteDir = path.join(process.cwd(), '.smite');
    // Generate PRD
    const prd = prd_generator_2.PRDGenerator.generateFromPrompt(prompt);
    // Save PRD
    prd_parser_2.PRDParser.saveToSmiteDir(prd);
    // Execute
    const orchestrator = new task_orchestrator_2.TaskOrchestrator(prd, smiteDir);
    return await orchestrator.execute(options?.maxIterations || 50);
}
/**
 * Execute Ralph from existing PRD file
 */
async function executeFromPRD(prdPath, options) {
    const smiteDir = path.join(process.cwd(), '.smite');
    // Load PRD
    const prd = prd_parser_2.PRDParser.parseFromFile(prdPath);
    // Copy to .smite
    prd_parser_2.PRDParser.saveToSmiteDir(prd);
    // Execute
    const orchestrator = new task_orchestrator_2.TaskOrchestrator(prd, smiteDir);
    return await orchestrator.execute(options?.maxIterations || 50);
}
//# sourceMappingURL=index.js.map