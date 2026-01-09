#!/usr/bin/env node
"use strict";
/**
 * SMITE Orchestrator - Handoff Artifact Generator
 *
 * Auto-generates MISSION_BRIEF templates for smooth agent handoffs.
 * Creates context from previous agent for next agent.
 *
 * Usage:
 *   ts-node generate-handoff.ts <next_agent> [project_dir]
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
exports.generateHandoff = generateHandoff;
exports.generateChecklist = generateChecklist;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const state_manager_1 = require("./state-manager");
const suggest_next_1 = require("./suggest-next");
/**
 * Generate handoff document
 */
function generateHandoff(nextAgent, projectDir = process.cwd()) {
  try {
    const state = (0, state_manager_1.loadState)(projectDir);
    if (!state) {
      return {
        success: false,
        error: "No active session found",
      };
    }
    // Create handoff content
    const content = generateHandoffContent(nextAgent, state, projectDir);
    // Write handoff file
    const handoffDir = path.join(projectDir, "docs");
    if (!fs.existsSync(handoffDir)) {
      fs.mkdirSync(handoffDir, { recursive: true });
    }
    const handoffFile = path.join(
      handoffDir,
      `MISSION_BRIEF_${nextAgent.toUpperCase()}.md`,
    );
    fs.writeFileSync(handoffFile, content, "utf-8");
    return {
      success: true,
      handoff_file: handoffFile,
      next_agent: nextAgent,
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
 * Generate handoff document content
 */
function generateHandoffContent(nextAgent, state, projectDir) {
  const previousAgent =
    state.last_completed_agent ||
    state.agents_called[state.agents_called.length - 1];
  const agentInfo = suggest_next_1.AGENT_INFO[nextAgent];
  let content = `# MISSION_BRIEF: ${nextAgent.toUpperCase()}

**Generated**: ${new Date().toISOString()}
**Session**: ${state.session_id}
**Previous Agent**: ${previousAgent ? previousAgent.toUpperCase() : "None"}
**Current Phase**: ${state.phase}

---

## 🎯 MISSION OBJECTIVE

${agentInfo.description}

---

## 📋 CONTEXT FROM PREVIOUS AGENTS

`;
  // Add artifacts from previous agents
  if (state.artifacts.length > 0) {
    content += `### Artifacts Delivered\n\n`;
    // Group artifacts by agent
    const byAgent = {};
    state.artifacts.forEach((artifact) => {
      const agent = artifact.agent || "unknown";
      if (!byAgent[agent]) {
        byAgent[agent] = [];
      }
      byAgent[agent].push(artifact);
    });
    // List artifacts by agent
    Object.entries(byAgent).forEach(([agent, artifacts]) => {
      content += `#### ${agent.toUpperCase()}\n\n`;
      artifacts.forEach((artifact) => {
        content += `- 📄 \`${artifact.path}\`\n`;
      });
      content += "\n";
    });
  } else {
    content += "*No artifacts from previous agents*\n\n";
  }
  content += `---

## 🎯 YOUR DELIVERABLES

${agentInfo.deliverables}

---

## 📊 WORKFLOW STATUS

**Agents Called**: ${state.agents_called.join(", ") || "None"}
**Current Agent**: ${state.current_agent || "None"}
**Phase**: ${state.phase}
**Artifacts Tracked**: ${state.artifacts.length}

---

## ✅ CHECKLIST

Use this checklist to ensure completion:

`;
  // Generate agent-specific checklist
  const checklist = generateChecklist(nextAgent);
  checklist.forEach((item) => {
    content += `- [ ] ${item}\n`;
  });
  content += `

---

## 🔗 RESOURCES

### Relevant Documentation

`;
  // Add links to existing documentation
  const docsDir = path.join(projectDir, "docs");
  if (fs.existsSync(docsDir)) {
    const files = fs.readdirSync(docsDir).filter((f) => f.endsWith(".md"));
    files.forEach((file) => {
      if (file !== `MISSION_BRIEF_${nextAgent.toUpperCase()}.md`) {
        content += `- [${file}](docs/${file})\n`;
      }
    });
  } else {
    content += "*No documentation yet*\n";
  }
  content += `

---

## 🚀 NEXT STEPS

After completing your mission:

1. Review your deliverables against the checklist
2. Ensure all documentation is up to date
3. Run quality checks if applicable
4. Mark mission as complete

---

**Generated by SMITE Orchestrator - Handoff System**
*Session ID: ${state.session_id}*
`;
  return content;
}
/**
 * Generate agent-specific checklist
 */
function generateChecklist(agent) {
  const checklists = {
    initializer: [
      "Define technical stack",
      "Create project structure",
      "Set up build tools",
      "Initialize documentation",
      "Create configuration files",
    ],
    explorer: [
      "Map codebase architecture",
      "Identify dependencies",
      "Find components and functions",
      "Analyze patterns",
      "Document code structure",
    ],
    strategist: [
      "Analyze market landscape",
      "Identify competitors",
      "Define user personas",
      "Create business model",
      "Define pricing strategy",
      "Project financial scenarios",
    ],
    aura: [
      "Define design tokens",
      "Create component library",
      "Establish style guide",
      "Build responsive layouts",
      "Document design patterns",
    ],
    constructor: [
      "Implement core features",
      "Write unit tests",
      "Follow architecture specs",
      "Maintain code quality",
      "Update documentation",
    ],
    gatekeeper: [
      "Review code quality",
      "Check type safety",
      "Validate test coverage",
      "Enforce standards",
      "Generate quality report",
    ],
    handover: [
      "Create API documentation",
      "Write README",
      "Create onboarding guide",
      "Document setup process",
      "Prepare knowledge transfer",
    ],
    surgeon: [
      "Analyze technical debt",
      "Refactor identified issues",
      "Optimize performance",
      "Improve type safety",
      "Document changes",
    ],
  };
  return (
    checklists[agent] || [
      "Complete assigned tasks",
      "Document work done",
      "Test deliverables",
    ]
  );
}
/**
 * CLI interface
 */
function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error(
      "Usage: ts-node generate-handoff.ts <next_agent> [project_dir]",
    );
    process.exit(1);
  }
  const nextAgent = args[0];
  const projectDir = args[1] || process.cwd();
  const result = generateHandoff(nextAgent, projectDir);
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
//# sourceMappingURL=generate-handoff.js.map
