// SMITE Ralph - Main Entry Point
// Multi-agent orchestrator with parallel execution

export { PRDParser } from './prd-parser';
export { DependencyGraph } from './dependency-graph';
export { TaskOrchestrator } from './task-orchestrator';
export { StateManager } from './state-manager';
export { PRDGenerator } from './prd-generator';
export { StopHookHandler } from './stop-handler';
export * from './types';

// Re-export for convenience
import { PRDParser } from './prd-parser';
import { PRDGenerator } from './prd-generator';
import { TaskOrchestrator } from './task-orchestrator';
import * as path from 'path';

/**
 * Quick start: Execute Ralph from a prompt
 */
export async function execute(prompt: string, options?: { maxIterations?: number }) {
  const smiteDir = path.join(process.cwd(), '.smite');

  // Generate PRD
  const prd = PRDGenerator.generateFromPrompt(prompt);

  // Save PRD
  PRDParser.saveToSmiteDir(prd);

  // Execute
  const orchestrator = new TaskOrchestrator(prd, smiteDir);
  return await orchestrator.execute(options?.maxIterations || 50);
}

/**
 * Execute Ralph from existing PRD file
 */
export async function executeFromPRD(prdPath: string, options?: { maxIterations?: number }) {
  const smiteDir = path.join(process.cwd(), '.smite');

  // Load PRD
  const prd = PRDParser.parseFromFile(prdPath);

  // Copy to .smite
  PRDParser.saveToSmiteDir(prd);

  // Execute
  const orchestrator = new TaskOrchestrator(prd, smiteDir);
  return await orchestrator.execute(options?.maxIterations || 50);
}
