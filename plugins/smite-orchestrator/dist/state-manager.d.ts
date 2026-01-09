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
type AgentName =
  | "initializer"
  | "explorer"
  | "strategist"
  | "aura"
  | "constructor"
  | "gatekeeper"
  | "handover"
  | "surgeon";
type WorkflowPhase =
  | "init"
  | "exploration"
  | "strategy"
  | "design-system"
  | "implementation"
  | "review"
  | "documentation"
  | "refactoring"
  | "unknown";
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
 * Initialize new session state
 */
declare function init(projectDir?: string): OrchestratorState;
/**
 * Load current state
 */
declare function loadState(projectDir?: string): OrchestratorState | null;
/**
 * Save state
 */
declare function saveState(state: OrchestratorState, projectDir?: string): void;
/**
 * Set current agent
 */
declare function setAgent(
  agentName: string,
  projectDir?: string,
): OrchestratorState;
/**
 * Add artifact to state
 */
declare function addArtifact(
  artifactPath: string,
  projectDir?: string,
): OrchestratorState;
/**
 * Get next agent in workflow
 */
declare function getNext(projectDir?: string): NextAgentResult | null;
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
  WorkflowPhase,
};
//# sourceMappingURL=state-manager.d.ts.map
