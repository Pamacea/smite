#!/usr/bin/env node
/**
 * SMITE Orchestrator - Next Agent Suggestion Engine
 *
 * Determines the next agent in the SMITE workflow based on
 * current state and workflow progression.
 *
 * Usage:
 *   ts-node suggest-next.ts [project_dir]
 */
import { AgentName } from './state-manager';
export interface SuggestionResult {
    next: AgentName | null;
    reason?: string;
    workflow_progress: string;
    deliverables?: string;
}
declare const AGENT_INFO: Record<AgentName, {
    description: string;
    deliverables: string;
}>;
/**
 * Generate suggestion for next agent
 */
export declare function generateSuggestion(projectDir?: string): SuggestionResult;
export { AGENT_INFO };
//# sourceMappingURL=suggest-next.d.ts.map