#!/usr/bin/env node
"use strict";
/**
 * SMITE Orchestrator - State Manager
 *
 * Ultra-fast JSON state management for workflow coordination.
 * Performance: <10ms per operation using native JSON.parse/stringify
 *
 * Usage:
 *   ts-node state-manager.ts init [project_dir]
 *   ts-node state-manager.ts set-agent <agent_name>
 *   ts-node state-manager.ts add-artifact <artifact_path>
 *   ts-node state-manager.ts get-next
 *   ts-node state-manager.ts get-state
 */
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
exports.init = init;
exports.setAgent = setAgent;
exports.addArtifact = addArtifact;
exports.getNext = getNext;
exports.loadState = loadState;
exports.saveState = saveState;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto_1 = require("crypto");
// Configuration
const STATE_DIR = '.smite';
const STATE_FILE = path.join(STATE_DIR, 'orchestrator-state.json');
// SMITE Workflow Order
const WORKFLOW_ORDER = [
    'initializer',
    'analyst',
    'architect',
    'economist',
    'aura',
    'constructor',
    'gatekeeper',
    'handover'
];
/**
 * Ensure state directory exists
 */
function ensureStateDir(projectDir) {
    const stateDir = path.join(projectDir, STATE_DIR);
    if (!fs.existsSync(stateDir)) {
        fs.mkdirSync(stateDir, { recursive: true });
    }
}
/**
 * Initialize new session state
 */
function init(projectDir = process.cwd()) {
    ensureStateDir(projectDir);
    const state = {
        session_id: (0, crypto_1.randomUUID)(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        project_dir: projectDir,
        current_agent: null,
        phase: 'init',
        artifacts: [],
        agents_called: [],
        workflow_complete: false
    };
    fs.writeFileSync(path.join(projectDir, STATE_FILE), JSON.stringify(state, null, 2));
    console.log(JSON.stringify(state));
    return state;
}
/**
 * Load current state
 */
function loadState(projectDir = process.cwd()) {
    const statePath = path.join(projectDir, STATE_FILE);
    if (!fs.existsSync(statePath)) {
        return null;
    }
    const content = fs.readFileSync(statePath, 'utf-8');
    return JSON.parse(content);
}
/**
 * Save state
 */
function saveState(state, projectDir = process.cwd()) {
    state.updated_at = new Date().toISOString();
    fs.writeFileSync(path.join(projectDir, STATE_FILE), JSON.stringify(state, null, 2));
}
/**
 * Set current agent
 */
function setAgent(agentName, projectDir = process.cwd()) {
    let state = loadState(projectDir);
    if (!state) {
        state = init(projectDir);
    }
    // Track agent call if not already called
    if (!state.agents_called.includes(agentName)) {
        state.agents_called.push(agentName);
    }
    state.current_agent = agentName;
    state.phase = determinePhase(agentName);
    saveState(state, projectDir);
    console.log(JSON.stringify(state));
    return state;
}
/**
 * Add artifact to state
 */
function addArtifact(artifactPath, projectDir = process.cwd()) {
    const state = loadState(projectDir);
    if (!state) {
        console.error('Error: No active session. Run init first.');
        process.exit(1);
    }
    if (!state.artifacts.find(a => a.path === artifactPath)) {
        state.artifacts.push({
            path: artifactPath,
            category: 'unknown',
            created_at: new Date().toISOString()
        });
        saveState(state, projectDir);
    }
    console.log(JSON.stringify(state));
    return state;
}
/**
 * Determine workflow phase from agent
 */
function determinePhase(agentName) {
    const phaseMap = {
        'initializer': 'init',
        'analyst': 'analysis',
        'architect': 'design',
        'economist': 'business',
        'aura': 'design-system',
        'constructor': 'implementation',
        'gatekeeper': 'review',
        'handover': 'documentation',
        'surgeon': 'refactoring'
    };
    return phaseMap[agentName] || 'unknown';
}
/**
 * Get next agent in workflow
 */
function getNext(projectDir = process.cwd()) {
    const state = loadState(projectDir);
    if (!state) {
        return null;
    }
    // Find current agent index
    const currentIndex = WORKFLOW_ORDER.indexOf(state.current_agent);
    if (currentIndex === -1) {
        // Current agent not in standard workflow, suggest next based on phase
        return suggestByPhase(state);
    }
    // Get next agent
    const nextIndex = currentIndex + 1;
    if (nextIndex >= WORKFLOW_ORDER.length) {
        // Workflow complete
        state.workflow_complete = true;
        saveState(state, projectDir);
        return {
            next: null,
            message: 'Workflow complete! All agents have been executed.',
            state
        };
    }
    const nextAgent = WORKFLOW_ORDER[nextIndex];
    return {
        next: nextAgent,
        message: `Next agent in workflow: ${nextAgent}`,
        state
    };
}
/**
 * Suggest next agent based on phase
 */
function suggestByPhase(state) {
    const phaseTransitions = {
        'init': 'initializer',
        'analysis': 'architect',
        'design': 'economist',
        'business': 'aura',
        'design-system': 'constructor',
        'implementation': 'gatekeeper',
        'review': 'handover',
        'documentation': null,
        'refactoring': state.current_agent, // Return to previous agent
        'unknown': null
    };
    const nextAgent = phaseTransitions[state.phase];
    return {
        next: nextAgent,
        message: nextAgent
            ? `Suggested next agent based on phase: ${nextAgent}`
            : 'No clear next agent for current phase',
        state
    };
}
/**
 * CLI interface
 */
function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const value = args[1];
    switch (command) {
        case 'init':
            init(value);
            break;
        case 'set-agent':
            if (!value) {
                console.error('Error: Agent name required');
                process.exit(1);
            }
            setAgent(value);
            break;
        case 'add-artifact':
            if (!value) {
                console.error('Error: Artifact path required');
                process.exit(1);
            }
            addArtifact(value);
            break;
        case 'get-next':
            const result = getNext();
            console.log(JSON.stringify(result, null, 2));
            break;
        case 'get-state':
            const state = loadState();
            if (state) {
                console.log(JSON.stringify(state, null, 2));
            }
            else {
                console.log('No active session found');
            }
            break;
        default:
            console.log(`
SMITE Orchestrator - State Manager

Usage:
  ts-node state-manager.ts init [project_dir]     Initialize new session
  ts-node state-manager.ts set-agent <agent>      Set current agent
  ts-node state-manager.ts add-artifact <path>    Track artifact
  ts-node state-manager.ts get-next               Get next agent suggestion
  ts-node state-manager.ts get-state              Display current state

Agents: ${WORKFLOW_ORDER.join(', ')}
      `);
            break;
    }
}
// Run if called directly
if (require.main === module) {
    main();
}
//# sourceMappingURL=state-manager.js.map