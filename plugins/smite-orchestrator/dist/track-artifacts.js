#!/usr/bin/env node
"use strict";
/**
 * SMITE Orchestrator - Artifact Tracker
 *
 * Tracks all files written by agents and updates workflow state.
 * Hook: PostToolUse (Write tool)
 *
 * Usage:
 *   ts-node track-artifacts.ts <file_path> [agent_name] [project_dir]
 */
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o)
            if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackArtifact = trackArtifact;
exports.getArtifactCategory = getArtifactCategory;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const state_manager_1 = require("./state-manager");
// Artifact categories
const ARTIFACT_CATEGORIES = {
  "docs/": "documentation",
  "src/": "code",
  "components/": "components",
  "lib/": "code",
  "tests/": "tests",
  ".smite/": "workflow",
  "config/": "configuration",
};
/**
 * Determine artifact category from path
 */
function getArtifactCategory(filePath) {
  for (const [dir, category] of Object.entries(ARTIFACT_CATEGORIES)) {
    if (filePath.startsWith(dir)) {
      return category;
    }
  }
  return "other";
}
/**
 * Track artifact and update state
 */
function trackArtifact(filePath, agentName = null, projectDir = process.cwd()) {
  try {
    // Check if file exists
    const fullPath = path.join(projectDir, filePath);
    if (!fs.existsSync(fullPath)) {
      return {
        success: false,
        error: "File does not exist",
      };
    }
    // Get file stats
    const stats = fs.statSync(fullPath);
    const category = getArtifactCategory(filePath);
    // Load current state
    let state = (0, state_manager_1.loadState)(projectDir);
    if (!state) {
      // Initialize state if not exists
      state = (0, state_manager_1.init)(projectDir);
    }
    // Add artifact to state
    const artifact = {
      path: filePath,
      category: category,
      created_at: new Date().toISOString(),
      size: stats.size,
      agent: agentName || state.current_agent || "unknown",
    };
    // Check if artifact already tracked
    const existingIndex = state.artifacts.findIndex((a) => a.path === filePath);
    if (existingIndex >= 0) {
      // Update existing artifact
      state.artifacts[existingIndex] = artifact;
    } else {
      // Add new artifact
      state.artifacts.push(artifact);
    }
    // Save updated state
    (0, state_manager_1.saveState)(state, projectDir);
    // Update session info file
    updateSessionInfo(state, projectDir);
    return {
      success: true,
      artifact: artifact,
      total_artifacts: state.artifacts.length,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: message,
    };
  }
}
/**
 * Update session info with artifacts
 */
function updateSessionInfo(state, projectDir) {
  const sessionInfoPath = path.join(
    projectDir,
    ".smite",
    "workflow",
    "session-info.md",
  );
  let content = `# SMITE Workflow Session

**Started**: ${state.created_at}
**Updated**: ${state.updated_at}
**Current Agent**: ${state.current_agent || "None"}
**Phase**: ${state.phase}
**Status**: ${state.workflow_complete ? "Complete" : "In Progress"}

## Workflow Progress

\`\`\`
initializer → explorer → strategist → aura → constructor → gatekeeper → handover
`;
  // Add progress indicators
  const agents = [
    "initializer",
    "explorer",
    "strategist",
    "aura",
    "constructor",
    "gatekeeper",
    "handover",
  ];
  agents.forEach((agent) => {
    const called = state.agents_called.includes(agent);
    const isCurrent = state.current_agent === agent;
    content += isCurrent ? " [→]" : called ? " [✓]" : " [ ]";
  });
  content += `\n\`\`\`

## Artifacts (${state.artifacts.length})

`;
  // Group artifacts by category
  const byCategory = {};
  state.artifacts.forEach((artifact) => {
    if (!byCategory[artifact.category]) {
      byCategory[artifact.category] = [];
    }
    byCategory[artifact.category].push(artifact);
  });
  // List artifacts by category
  Object.entries(byCategory).forEach(([category, artifacts]) => {
    content += `### ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
    artifacts.forEach((artifact) => {
      const icon = artifact.agent ? `🤖 ${artifact.agent}` : "📄";
      content += `- ${icon} \`${artifact.path}\` (${formatSize(artifact.size)})\n`;
    });
    content += "\n";
  });
  if (state.artifacts.length === 0) {
    content += "*No artifacts tracked yet*\n\n";
  }
  content += `---

*This file is automatically maintained by SMITE Orchestrator*
`;
  fs.writeFileSync(sessionInfoPath, content, "utf-8");
}
/**
 * Format file size
 */
function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
/**
 * CLI interface
 */
function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error(
      "Usage: ts-node track-artifacts.ts <file_path> [agent_name] [project_dir]",
    );
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
//# sourceMappingURL=track-artifacts.js.map
