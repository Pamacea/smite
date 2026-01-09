#!/usr/bin/env node
/**
 * SMITE Orchestrator - Handoff Artifact Generator
 *
 * Auto-generates MISSION_BRIEF templates for smooth agent handoffs.
 * Creates context from previous agent for next agent.
 *
 * Usage:
 *   ts-node generate-handoff.ts <next_agent> [project_dir]
 */
import { AgentName } from "./state-manager";
interface HandoffResult {
  success: boolean;
  handoff_file?: string;
  next_agent?: AgentName;
  error?: string;
}
/**
 * Generate handoff document
 */
declare function generateHandoff(
  nextAgent: AgentName,
  projectDir?: string,
): HandoffResult;
/**
 * Generate agent-specific checklist
 */
declare function generateChecklist(agent: AgentName): string[];
export { generateHandoff, generateChecklist };
//# sourceMappingURL=generate-handoff.d.ts.map
