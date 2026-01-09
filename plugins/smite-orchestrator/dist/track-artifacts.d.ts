#!/usr/bin/env node
/**
 * SMITE Orchestrator - Artifact Tracker
 *
 * Tracks all files written by agents and updates workflow state.
 * Hook: PostToolUse (Write tool)
 *
 * Usage:
 *   ts-node track-artifacts.ts <file_path> [agent_name] [project_dir]
 */
import { Artifact } from "./state-manager";
interface TrackResult {
  success: boolean;
  artifact?: Artifact;
  total_artifacts?: number;
  error?: string;
}
/**
 * Determine artifact category from path
 */
declare function getArtifactCategory(filePath: string): string;
/**
 * Track artifact and update state
 */
declare function trackArtifact(
  filePath: string,
  agentName?: string | null,
  projectDir?: string,
): TrackResult;
export { trackArtifact, getArtifactCategory };
//# sourceMappingURL=track-artifacts.d.ts.map
