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

import * as fs from 'fs';
import * as path from 'path';
import { loadState, saveState, init, OrchestratorState, Artifact } from './state-manager';

// Artifact categories
const ARTIFACT_CATEGORIES: Record<string, string> = {
  'docs/': 'documentation',
  'src/': 'code',
  'components/': 'components',
  'lib/': 'code',
  'tests/': 'tests',
  '.smite/': 'workflow',
  'config/': 'configuration'
};

interface TrackResult {
  success: boolean;
  artifact?: Artifact;
  total_artifacts?: number;
  error?: string;
}

/**
 * Determine artifact category from path
 */
function getArtifactCategory(filePath: string): string {
  for (const [dir, category] of Object.entries(ARTIFACT_CATEGORIES)) {
    if (filePath.startsWith(dir)) {
      return category;
    }
  }
  return 'other';
}

/**
 * Track artifact and update state
 */
function trackArtifact(
  filePath: string,
  agentName: string | null = null,
  projectDir: string = process.cwd()
): TrackResult {
  try {
    // Check if file exists
    const fullPath = path.join(projectDir, filePath);
    if (!fs.existsSync(fullPath)) {
      return {
        success: false,
        error: 'File does not exist'
      };
    }

    // Get file stats
    const stats = fs.statSync(fullPath);
    const category = getArtifactCategory(filePath);

    // Load current state
    let state = loadState(projectDir);

    if (!state) {
      // Initialize state if not exists
      state = init(projectDir);
    }

    // Add artifact to state
    const artifact: Artifact = {
      path: filePath,
      category: category,
      created_at: new Date().toISOString(),
      size: stats.size,
      agent: agentName || state.current_agent || 'unknown'
    };

    // Check if artifact already tracked
    const existingIndex = state.artifacts.findIndex(a => a.path === filePath);

    if (existingIndex >= 0) {
      // Update existing artifact
      state.artifacts[existingIndex] = artifact;
    } else {
      // Add new artifact
      state.artifacts.push(artifact);
    }

    // Save updated state
    saveState(state, projectDir);

    // Update session info file
    updateSessionInfo(state, projectDir);

    return {
      success: true,
      artifact: artifact,
      total_artifacts: state.artifacts.length
    };

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: message
    };
  }
}

/**
 * Update session info with artifacts
 */
function updateSessionInfo(state: OrchestratorState, projectDir: string): void {
  const sessionInfoPath = path.join(projectDir, '.smite', 'workflow', 'session-info.md');

  let content = `# SMITE Workflow Session

**Started**: ${state.created_at}
**Updated**: ${state.updated_at}
**Current Agent**: ${state.current_agent || 'None'}
**Phase**: ${state.phase}
**Status**: ${state.workflow_complete ? 'Complete' : 'In Progress'}

## Workflow Progress

\`\`\`
initializer → explorer → strategist → aura → constructor → gatekeeper → handover
`;

  // Add progress indicators
  const agents = ['initializer', 'explorer', 'strategist', 'aura', 'constructor', 'gatekeeper', 'handover'];
  agents.forEach(agent => {
    const called = state.agents_called.includes(agent as any);
    const isCurrent = state.current_agent === agent;
    content += isCurrent ? ' [→]' : (called ? ' [✓]' : ' [ ]');
  });

  content += `\n\`\`\`

## Artifacts (${state.artifacts.length})

`;

  // Group artifacts by category
  const byCategory: Record<string, Artifact[]> = {};
  state.artifacts.forEach(artifact => {
    if (!byCategory[artifact.category]) {
      byCategory[artifact.category] = [];
    }
    byCategory[artifact.category].push(artifact);
  });

  // List artifacts by category
  Object.entries(byCategory).forEach(([category, artifacts]) => {
    content += `### ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
    artifacts.forEach(artifact => {
      const icon = artifact.agent ? `🤖 ${artifact.agent}` : '📄';
      content += `- ${icon} \`${artifact.path}\` (${formatSize(artifact.size!)})\n`;
    });
    content += '\n';
  });

  if (state.artifacts.length === 0) {
    content += '*No artifacts tracked yet*\n\n';
  }

  content += `---

*This file is automatically maintained by SMITE Orchestrator*
`;

  fs.writeFileSync(sessionInfoPath, content, 'utf-8');
}

/**
 * Format file size
 */
function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * CLI interface
 */
function main(): void {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error('Usage: ts-node track-artifacts.ts <file_path> [agent_name] [project_dir]');
    process.exit(1);
  }

  const filePath = args[0];
  const agentName = args[1] || null;
  const projectDir = args[2] || process.cwd();

  const result = trackArtifact(filePath, agentName, projectDir);

  if (result.success) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.error(JSON.stringify(result));
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export {
  trackArtifact,
  getArtifactCategory
};
