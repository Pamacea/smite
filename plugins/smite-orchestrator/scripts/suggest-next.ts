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

import { loadState, AgentName, getNext as getNextAgent } from './state-manager';

// Type Definitions
export interface SuggestionResult {
  next: AgentName | null;
  reason?: string;
  workflow_progress: string;
  deliverables?: string;
}

// Agent descriptions and expected deliverables
const AGENT_INFO: Record<AgentName, { description: string; deliverables: string }> = {
  initializer: {
    description: 'Initialize project with technical stack',
    deliverables: 'Technical stack definition, project structure, initial configuration'
  },
  analyst: {
    description: 'Analyze requirements and user needs',
    deliverables: 'Market analysis, competitive landscape, user personas'
  },
  architect: {
    description: 'Design system architecture',
    deliverables: 'Architecture diagrams, database schema, API specifications'
  },
  economist: {
    description: 'Create business model and pricing strategy',
    deliverables: 'Business plan, pricing tiers, revenue projections'
  },
  aura: {
    description: 'Create design system and UI components',
    deliverables: 'Design tokens, component library, style guide'
  },
  constructor: {
    description: 'Implement features and write code',
    deliverables: 'Production code, tests, documentation'
  },
  gatekeeper: {
    description: 'Review code quality and enforce standards',
    deliverables: 'Code review report, quality metrics, recommendations'
  },
  handover: {
    description: 'Create documentation and knowledge transfer',
    deliverables: 'API documentation, README, onboarding guide'
  },
  surgeon: {
    description: 'Refactor and optimize code',
    deliverables: 'Refactored code, performance improvements, debt reduction'
  }
};

/**
 * Generate suggestion for next agent
 */
export function generateSuggestion(projectDir: string = process.cwd()): SuggestionResult {
  const state = loadState(projectDir);

  if (!state) {
    return {
      next: 'initializer',
      reason: 'No session found. Start with initializer.',
      workflow_progress: generateWorkflowProgress([]),
      deliverables: AGENT_INFO.initializer.deliverables
    };
  }

  const result = getNextAgent(projectDir);

  if (!result) {
    return {
      next: null,
      workflow_progress: generateWorkflowProgress(state.agents_called),
      deliverables: 'All agents completed'
    };
  }

  const nextAgent = result.next;

  return {
    next: nextAgent,
    reason: generateReason(state, nextAgent),
    workflow_progress: generateWorkflowProgress(state.agents_called),
    deliverables: nextAgent ? AGENT_INFO[nextAgent].deliverables : 'All complete'
  };
}

/**
 * Generate reason for suggestion
 */
function generateReason(state: any, nextAgent: AgentName | null): string {
  if (!nextAgent) {
    return 'Workflow is complete!';
  }

  const completed = state.agents_called.length;
  const total = 8; // Total agents in workflow
  const progress = Math.round((completed / total) * 100);

  return `${progress}% complete. ${total - completed} agent(s) remaining.`;
}

/**
 * Generate workflow progress string
 */
function generateWorkflowProgress(calledAgents: string[]): string {
  const agents = ['initializer', 'analyst', 'architect', 'economist', 'aura', 'constructor', 'gatekeeper', 'handover'];

  let progress = 'initializer → analyst → architect → economist → aura → constructor → gatekeeper → handover\n';

  agents.forEach(agent => {
    const called = calledAgents.includes(agent as AgentName);
    progress += called ? ' [✓]' : ' [ ]';
  });

  return progress;
}

/**
 * CLI interface
 */
function main(): void {
  const args = process.argv.slice(2);
  const projectDir = args[0] || process.cwd();

  const suggestion = generateSuggestion(projectDir);

  console.log(JSON.stringify(suggestion, null, 2));
}

// Run if called directly
if (require.main === module) {
  main();
}

export {
  AGENT_INFO
};
