/**
 * Workflow Orchestrator - Layer 3
 * Barrel export for all workflow modules
 *
 * This module exports high-level workflows that compose Layer 2 features
 * into complex, multi-step operations.
 *
 * @module @smite/browser-automation/workflows
 */

// ============================================================================
// Workflow Orchestrator
// ============================================================================

export {
  WorkflowOrchestrator,
  researchTopic,
  debugError,
  analyzeLibrary,
  auditCodebase,
} from './workflow-orchestrator.js';

// ============================================================================
// Workflow Result Types
// ============================================================================

export type {
  ResearchTopicResult,
  DebugErrorResult,
  AnalyzeLibraryResult,
  AuditCodebaseResult,
  WorkflowContext,
  WorkflowStep,
} from './workflow-orchestrator.js';
