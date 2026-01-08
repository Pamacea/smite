#!/usr/bin/env node
/**
 * SMITE Orchestrator - Agent Completion Handler
 *
 * Detects agent completion and generates next agent suggestion.
 * Hook: SubagentStop
 *
 * Usage:
 *   ts-node agent-complete.ts <agent_name> [project_dir]
 */
import { AgentName } from './state-manager';
interface CompleteResult {
    success: boolean;
    message?: string;
    next_agent?: AgentName | null;
    suggestion_file?: string;
    error?: string;
}
/**
 * Handle agent completion
 */
declare function handleAgentComplete(agentName: string, projectDir?: string): CompleteResult;
export { handleAgentComplete };
//# sourceMappingURL=agent-complete.d.ts.map