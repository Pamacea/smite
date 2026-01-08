#!/usr/bin/env node

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

import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

// Configuration
const STATE_DIR = '.smite';
const STATE_FILE = path.join(STATE_DIR, 'orchestrator-state.json');

// SMITE Workflow Order
const WORKFLOW_ORDER: AgentName[] = [
  'initializer',
  'explorer',
  'strategist',
  'aura',
  'constructor',
  'gatekeeper',
  'handover'
];

// Type Definitions
type AgentName =
  | 'initializer'
  | 'explorer'
  | 'strategist'
  | 'aura'
  | 'constructor'
  | 'gatekeeper'
  | 'handover'
  | 'surgeon';

type WorkflowPhase =
  | 'init'
  | 'exploration'
  | 'strategy'
  | 'design-system'
  | 'implementation'
  | 'review'
  | 'documentation'
  | 'refactoring'
  | 'unknown';

interface Artifact {
  path: string;
  category: string;
  created_at: string;
  size?: number;
  agent?: AgentName | string;
}

interface OrchestratorState {
  session_id: string;
  created_at: string;
  updated_at: string;
  project_dir: string;
  current_agent: AgentName | null;
  phase: WorkflowPhase;
  artifacts: Artifact[];
  agents_called: AgentName[];
  workflow_complete: boolean;
  last_completed_agent?: AgentName;
}

interface NextAgentResult {
  next: AgentName | null;
  message: string;
  state: OrchestratorState;
}

/**
 * Ensure state directory exists
 */
function ensureStateDir(projectDir: string): void {
  const stateDir = path.join(projectDir, STATE_DIR);
  if (!fs.existsSync(stateDir)) {
    fs.mkdirSync(stateDir, { recursive: true });
  }
}

/**
 * Initialize new session state
 */
function init(projectDir: string = process.cwd()): OrchestratorState {
  ensureStateDir(projectDir);

  const state: OrchestratorState = {
    session_id: randomUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    project_dir: projectDir,
    current_agent: null,
    phase: 'init',
    artifacts: [],
    agents_called: [],
    workflow_complete: false
  };

  fs.writeFileSync(
    path.join(projectDir, STATE_FILE),
    JSON.stringify(state, null, 2)
  );

  console.log(JSON.stringify(state));
  return state;
}

/**
 * Load current state
 */
function loadState(projectDir: string = process.cwd()): OrchestratorState | null {
  const statePath = path.join(projectDir, STATE_FILE);

  if (!fs.existsSync(statePath)) {
    return null;
  }

  const content = fs.readFileSync(statePath, 'utf-8');
  return JSON.parse(content) as OrchestratorState;
}

/**
 * Save state
 */
function saveState(state: OrchestratorState, projectDir: string = process.cwd()): void {
  state.updated_at = new Date().toISOString();
  fs.writeFileSync(
    path.join(projectDir, STATE_FILE),
    JSON.stringify(state, null, 2)
  );
}

/**
 * Set current agent
 */
function setAgent(agentName: string, projectDir: string = process.cwd()): OrchestratorState {
  let state = loadState(projectDir);

  if (!state) {
    state = init(projectDir);
  }

  // Track agent call if not already called
  if (!state.agents_called.includes(agentName as AgentName)) {
    state.agents_called.push(agentName as AgentName);
  }

  state.current_agent = agentName as AgentName;
  state.phase = determinePhase(agentName as AgentName);

  saveState(state, projectDir);

  console.log(JSON.stringify(state));
  return state;
}

/**
 * Add artifact to state
 */
function addArtifact(artifactPath: string, projectDir: string = process.cwd()): OrchestratorState {
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
function determinePhase(agentName: AgentName): WorkflowPhase {
  const phaseMap: Record<AgentName, WorkflowPhase> = {
    'initializer': 'init',
    'explorer': 'exploration',
    'strategist': 'strategy',
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
function getNext(projectDir: string = process.cwd()): NextAgentResult | null {
  const state = loadState(projectDir);

  if (!state) {
    return null;
  }

  // Find current agent index
  const currentIndex = WORKFLOW_ORDER.indexOf(state.current_agent!);

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
function suggestByPhase(state: OrchestratorState): NextAgentResult {
  const phaseTransitions: Record<WorkflowPhase, AgentName | null> = {
    'init': 'initializer',
    'exploration': 'strategist',
    'strategy': 'aura',
    'design-system': 'constructor',
    'implementation': 'gatekeeper',
    'review': 'handover',
    'documentation': null,
    'refactoring': state.current_agent!, // Return to previous agent
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
function main(): void {
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
      } else {
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

export {
  init,
  setAgent,
  addArtifact,
  getNext,
  loadState,
  saveState,
  OrchestratorState,
  Artifact,
  AgentName,
  WorkflowPhase
};
