// SMITE Ralph - Loop Setup
// Integration with Ralph Wiggum's hook-based looping system

import * as fs from "fs";
import * as path from "path";
import { PRDGenerator } from "./prd-generator";
import { PRDParser } from "./prd-parser";
import { PRD, UserStory, RalphState } from "./types";

export interface LoopOptions {
  maxIterations?: number;
  completionPromise?: string;
  autoExecute?: boolean; // If true, automatically start execution after setup
}

export interface LoopConfig {
  active: boolean;
  iteration: number;
  max_iterations: number;
  completion_promise: string | null;
  started_at: string;
  prd_path: string;
}

const DEFAULT_MAX_ITERATIONS = Infinity; // No limit by default
const DEFAULT_COMPLETION_PROMISE = "COMPLETE";

/**
 * Setup Ralph Loop with hook-based auto-iteration (async)
 * IMPORTANT: This MERGES with existing PRD instead of overwriting
 */
export async function setupRalphLoop(
  prompt: string,
  options: LoopOptions = {}
): Promise<{ success: boolean; loopFilePath: string; prdPath: string; prd?: PRD; error?: string }> {
  try {
    const maxIterations = options.maxIterations || DEFAULT_MAX_ITERATIONS;
    const completionPromise = options.completionPromise || DEFAULT_COMPLETION_PROMISE;

    // Generate PRD from prompt
    const newPrd = PRDGenerator.generateFromPrompt(prompt);

    // Merge with existing PRD (preserves completed stories)
    console.log("\n🔄 Merging PRD with existing...");
    const prdPath = await PRDParser.mergePRD(newPrd);

    // Load merged PRD
    const prd = await PRDParser.loadFromSmiteDir();
    if (!prd) {
      throw new Error("Failed to load merged PRD");
    }

    console.log(`✅ PRD ready: ${prdPath}`);
    console.log(`   Stories: ${prd.userStories.length} total`);
    console.log(`   Completed: ${prd.userStories.filter((s) => s.passes).length}`);

    // Create .claude directory if it doesn't exist
    const claudeDir = path.join(process.cwd(), ".claude");
    try {
      await fs.promises.mkdir(claudeDir, { recursive: true });
    } catch (error) {
      throw new Error(
        `Failed to create .claude directory: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }

    // Create loop file with YAML frontmatter
    const loopFilePath = path.join(claudeDir, "loop.md");
    const config: LoopConfig = {
      active: true,
      iteration: 1,
      max_iterations: maxIterations,
      completion_promise: completionPromise,
      started_at: new Date().toISOString(),
      prd_path: prdPath, // Always use standard PRD path
    };

    const loopContent = generateLoopFileContent(config, prd);
    await fs.promises.writeFile(loopFilePath, loopContent, "utf-8");

    console.log(`✅ Loop file created: ${loopFilePath}`);

    return { success: true, loopFilePath, prdPath, prd };
  } catch (error) {
    return {
      success: false,
      loopFilePath: "",
      prdPath: "",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate loop file content with YAML frontmatter
 */
function generateLoopFileContent(config: LoopConfig, prd: PRD): string {
  const yamlFrontmatter = [
    "---",
    `active: ${config.active}`,
    `iteration: ${config.iteration}`,
    `max_iterations: ${config.max_iterations}`,
    `completion_promise: ${JSON.stringify(config.completion_promise)}`,
    `started_at: ${config.started_at}`,
    `prd_path: ${config.prd_path}`,
    "---",
    "",
  ].join("\n");

  const promptContent = [
    "# Ralph Loop Execution",
    "",
    `**Iteration: ${config.iteration}/${config.max_iterations}**`,
    `**Started: ${config.started_at}**`,
    "",
    "## Task",
    "",
    prd.description || "Execute the PRD below",
    "",
    "## PRD Details",
    "",
    `**Project:** ${prd.project}`,
    `**Branch:** ${prd.branchName || "main"}`,
    "",
    "## User Stories",
    "",
    ...prd.userStories.map((story: UserStory) => {
      const status = story.passes ? "✅ DONE" : "⏳ TODO";
      return [
        `### ${status} ${story.id}: ${story.title}`,
        "",
        `**Agent:** \`${story.agent}\``,
        `**Tech:** ${story.tech || "general"}`,
        `**Priority:** ${story.priority}`,
        "",
        story.description,
        "",
        "**Acceptance Criteria:**",
        ...story.acceptanceCriteria.map((c: string) => `  - ${c}`),
        "",
        story.dependencies.length > 0
          ? `**Dependencies:** ${story.dependencies.join(", ")}`
          : "**No dependencies**",
        "",
        story.notes ? `**Notes:** ${story.notes}` : "",
        "",
      ].join("\n");
    }),
    "",
    "## Instructions",
    "",
    "1. Execute remaining user stories in order of priority",
    "2. Use the Task tool to invoke appropriate agents",
    "3. Mark stories as complete by setting `passes: true`",
    "4. Update notes with learnings and issues",
    "5. Commit changes after each successful story",
    "6. When ALL stories are complete, output:",
    `   \`<promise>\${config.completion_promise}</promise>\``,
    "",
    "## Loop Mechanics",
    "",
    "- This prompt will be repeated until completion or max iterations",
    "- Previous work is preserved in files and git history",
    "- Check `.smite/prd.json` for current story status",
    "- Use `/ralph status` to see progress",
    "",
  ].join("\n");

  return yamlFrontmatter + promptContent;
}

/**
 * Read loop configuration from file (async)
 */
export async function readLoopConfig(loopFilePath?: string): Promise<LoopConfig | null> {
  const filePath = loopFilePath || path.join(process.cwd(), ".claude", "loop.md");

  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
  } catch {
    return null;
  }

  try {
    const content = await fs.promises.readFile(filePath, "utf-8");
    const match = content.match(/^---\n([\s\S]+?)\n---/);

    if (!match) {
      return null;
    }

    const yaml = match[1];
    const config: Partial<LoopConfig> = {};

    yaml.split("\n").forEach((line) => {
      const [key, ...valueParts] = line.split(":");
      if (key && valueParts.length > 0) {
        const value = valueParts.join(":").trim();
        switch (key.trim()) {
          case "active":
            config.active = value === "true";
            break;
          case "iteration":
            config.iteration = parseInt(value, 10);
            break;
          case "max_iterations":
            config.max_iterations = parseInt(value, 10);
            break;
          case "completion_promise":
            config.completion_promise = value === "null" ? null : value.replace(/['"]/g, "");
            break;
          case "started_at":
            config.started_at = value;
            break;
          case "prd_path":
            config.prd_path = value;
            break;
        }
      }
    });

    return config as LoopConfig;
  } catch {
    return null;
  }
}

/**
 * Update loop iteration counter (async)
 */
export async function incrementLoopIteration(loopFilePath?: string): Promise<boolean> {
  const filePath = loopFilePath || path.join(process.cwd(), ".claude", "loop.md");

  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
  } catch {
    return false;
  }

  try {
    const content = await fs.promises.readFile(filePath, "utf-8");
    let updatedContent = content;

    updatedContent = updatedContent.replace(
      /iteration: (\d+)/,
      (_, iteration) => `iteration: ${parseInt(iteration, 10) + 1}`
    );

    await fs.promises.writeFile(filePath, updatedContent, "utf-8");
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear loop file (async)
 */
export async function clearLoopFile(loopFilePath?: string): Promise<boolean> {
  const filePath = loopFilePath || path.join(process.cwd(), ".claude", "loop.md");

  try {
    await fs.promises.unlink(filePath);
    return true;
  } catch {
    // File doesn't exist or cannot be deleted
    return false;
  }
}

/**
 * Check if output contains completion promise
 */
export function checkCompletionPromise(output: string, promise: string): boolean {
  const regex = new RegExp(`<promise>\\s*${escapeRegExp(promise)}\\s*</promise>`, "i");
  return regex.test(output);
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Setup Ralph Loop AND execute automatically
 * This is the convenience function for: "Check PRD, merge prompt, execute"
 *
 * By default, executes ALL stories (no limit). Use maxIterations to limit.
 */
export async function setupAndExecuteLoop(
  prompt: string,
  options: LoopOptions & { maxIterations?: number } = {}
): Promise<{
  success: boolean;
  loopFilePath: string;
  prdPath: string;
  state?: RalphState;
  error?: string;
}> {
  try {
    // Step 1: Setup loop (merges PRD automatically)
    const setupResult = await setupRalphLoop(prompt, options);

    if (!setupResult.success) {
      return {
        success: false,
        loopFilePath: "",
        prdPath: "",
        error: setupResult.error,
      };
    }

    // Step 2: Import TaskOrchestrator dynamically (avoid circular dependency)
    const { TaskOrchestrator } = await import("./task-orchestrator");
    const smiteDir = path.join(process.cwd(), ".smite");

    // Step 3: Execute automatically
    const maxIterations = options.maxIterations ?? Infinity; // Default: unlimited

    console.log("\n🚀 Starting automatic execution...");

    if (maxIterations !== Infinity) {
      console.log(`⚠️  Limited to ${maxIterations} stories`);
    } else {
      if (!setupResult.prd) {
        return {
          success: false,
          loopFilePath: "",
          prdPath: "",
          error: "PRD not loaded after setup",
        };
      }
      console.log(`✅ Will execute all ${setupResult.prd.userStories.length} stories`);
    }
    console.log();

    const orchestrator = new TaskOrchestrator(setupResult.prd!, smiteDir);
    const state = await orchestrator.execute(maxIterations);

    return {
      success: true,
      loopFilePath: setupResult.loopFilePath,
      prdPath: setupResult.prdPath,
      state,
    };
  } catch (error) {
    return {
      success: false,
      loopFilePath: "",
      prdPath: "",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
