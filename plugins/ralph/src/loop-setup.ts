// SMITE Ralph - Loop Setup
// Integration with Ralph Wiggum's hook-based looping system

import * as fs from 'fs';
import * as path from 'path';
import { PRDGenerator } from './prd-generator';
import { PRDParser } from './prd-parser';

export interface LoopOptions {
  maxIterations?: number;
  completionPromise?: string;
}

export interface LoopConfig {
  active: boolean;
  iteration: number;
  max_iterations: number;
  completion_promise: string | null;
  started_at: string;
  prd_path: string;
}

const DEFAULT_MAX_ITERATIONS = 50;
const DEFAULT_COMPLETION_PROMISE = 'COMPLETE';

/**
 * Setup Ralph Loop with hook-based auto-iteration
 */
export function setupRalphLoop(
  prompt: string,
  options: LoopOptions = {}
): { success: boolean; loopFilePath: string; error?: string } {
  try {
    const maxIterations = options.maxIterations || DEFAULT_MAX_ITERATIONS;
    const completionPromise = options.completionPromise || DEFAULT_COMPLETION_PROMISE;

    // Generate PRD from prompt
    const prd = PRDGenerator.generateFromPrompt(prompt);
    const smiteDir = path.join(process.cwd(), '.smite');
    const prdPath = path.join(smiteDir, 'prd.json');

    // Ensure .smite directory exists
    if (!fs.existsSync(smiteDir)) {
      fs.mkdirSync(smiteDir, { recursive: true });
    }

    // Save PRD
    PRDParser.saveToSmiteDir(prd);

    // Create .claude directory if it doesn't exist
    const claudeDir = path.join(process.cwd(), '.claude');
    if (!fs.existsSync(claudeDir)) {
      fs.mkdirSync(claudeDir, { recursive: true });
    }

    // Create loop file with YAML frontmatter
    const loopFilePath = path.join(claudeDir, 'ralph-loop.local.md');
    const config: LoopConfig = {
      active: true,
      iteration: 1,
      max_iterations: maxIterations,
      completion_promise: completionPromise,
      started_at: new Date().toISOString(),
      prd_path: prdPath,
    };

    const loopContent = generateLoopFileContent(config, prd);
    fs.writeFileSync(loopFilePath, loopContent, 'utf-8');

    return { success: true, loopFilePath };
  } catch (error) {
    return {
      success: false,
      loopFilePath: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate loop file content with YAML frontmatter
 */
function generateLoopFileContent(config: LoopConfig, prd: any): string {
  const yamlFrontmatter = [
    '---',
    `active: ${config.active}`,
    `iteration: ${config.iteration}`,
    `max_iterations: ${config.max_iterations}`,
    `completion_promise: ${JSON.stringify(config.completion_promise)}`,
    `started_at: ${config.started_at}`,
    `prd_path: ${config.prd_path}`,
    '---',
    '',
  ].join('\n');

  const promptContent = [
    '# Ralph Loop Execution',
    '',
    `**Iteration: ${config.iteration}/${config.max_iterations}**`,
    `**Started: ${config.started_at}**`,
    '',
    '## Task',
    '',
    prd.description || 'Execute the PRD below',
    '',
    '## PRD Details',
    '',
    `**Project:** ${prd.project}`,
    `**Branch:** ${prd.branchName || 'main'}`,
    '',
    '## User Stories',
    '',
    ...prd.userStories.map((story: any) => {
      const status = story.passes ? '✅ DONE' : '⏳ TODO';
      return [
        `### ${status} ${story.id}: ${story.title}`,
        '',
        `**Agent:** \`${story.agent}\``,
        `**Tech:** ${story.tech || 'general'}`,
        `**Priority:** ${story.priority}`,
        '',
        story.description,
        '',
        '**Acceptance Criteria:**',
        ...story.acceptanceCriteria.map((c: string) => `  - ${c}`),
        '',
        story.dependencies.length > 0
          ? `**Dependencies:** ${story.dependencies.join(', ')}`
          : '**No dependencies**',
        '',
        story.notes ? `**Notes:** ${story.notes}` : '',
        '',
      ].join('\n');
    }),
    '',
    '## Instructions',
    '',
    '1. Execute remaining user stories in order of priority',
    '2. Use the Task tool to invoke appropriate agents',
    '3. Mark stories as complete by setting `passes: true`',
    '4. Update notes with learnings and issues',
    '5. Commit changes after each successful story',
    '6. When ALL stories are complete, output:',
    '   `<promise>' + config.completion_promise + '</promise>`',
    '',
    '## Loop Mechanics',
    '',
    '- This prompt will be repeated until completion or max iterations',
    '- Previous work is preserved in files and git history',
    '- Check `.smite/prd.json` for current story status',
    '- Use `/ralph status` to see progress',
    '',
  ].join('\n');

  return yamlFrontmatter + promptContent;
}

/**
 * Read loop configuration from file
 */
export function readLoopConfig(loopFilePath?: string): LoopConfig | null {
  const filePath = loopFilePath || path.join(process.cwd(), '.claude', 'ralph-loop.local.md');

  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const match = content.match(/^---\n([\s\S]+?)\n---/);

    if (!match) {
      return null;
    }

    const yaml = match[1];
    const config: Partial<LoopConfig> = {};

    yaml.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim();
        switch (key.trim()) {
          case 'active':
            config.active = value === 'true';
            break;
          case 'iteration':
            config.iteration = parseInt(value, 10);
            break;
          case 'max_iterations':
            config.max_iterations = parseInt(value, 10);
            break;
          case 'completion_promise':
            config.completion_promise = value === 'null' ? null : value.replace(/['"]/g, '');
            break;
          case 'started_at':
            config.started_at = value;
            break;
          case 'prd_path':
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
 * Update loop iteration counter
 */
export function incrementLoopIteration(loopFilePath?: string): boolean {
  const filePath = loopFilePath || path.join(process.cwd(), '.claude', 'ralph-loop.local.md');

  if (!fs.existsSync(filePath)) {
    return false;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    let updatedContent = content;

    updatedContent = updatedContent.replace(
      /iteration: (\d+)/,
      (_, iteration) => `iteration: ${parseInt(iteration, 10) + 1}`
    );

    fs.writeFileSync(filePath, updatedContent, 'utf-8');
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear loop file
 */
export function clearLoopFile(loopFilePath?: string): boolean {
  const filePath = loopFilePath || path.join(process.cwd(), '.claude', 'ralph-loop.local.md');

  if (!fs.existsSync(filePath)) {
    return true;
  }

  try {
    fs.unlinkSync(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if output contains completion promise
 */
export function checkCompletionPromise(output: string, promise: string): boolean {
  const regex = new RegExp(`<promise>\\s*${escapeRegExp(promise)}\\s*</promise>`, 'i');
  return regex.test(output);
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
