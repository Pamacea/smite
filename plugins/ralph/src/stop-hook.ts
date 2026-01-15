#!/usr/bin/env node

// SMITE Ralph - Stop Hook
// Intercepts Claude Code exit to create looping behavior (like Ralph Wiggum)

import * as fs from 'fs';
import * as path from 'path';

interface LoopConfig {
  active: boolean;
  iteration: number;
  max_iterations: number;
  completion_promise: string | null;
  started_at: string;
  prd_path: string;
}

interface HookResponse {
  decision: 'allow' | 'block';
  reason?: string;
  systemMessage?: string;
}

function readLoopConfig(loopFilePath?: string): LoopConfig | null {
  const filePath = loopFilePath || path.join(process.cwd(), '.claude', 'ralph-loop.local.md');

  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);

    if (!match) {
      return null;
    }

    const yaml = match[1];
    const config: Partial<LoopConfig> = {};

    yaml.split('\n').forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) return;

      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();

      switch (key) {
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
          if (value !== 'null' && value !== '""' && value !== "''") {
            config.completion_promise = value.replace(/^["']|["']$/g, '');
          }
          break;
        case 'started_at':
          config.started_at = value;
          break;
        case 'prd_path':
          config.prd_path = value;
          break;
      }
    });

    if (config.active === undefined ||
        config.iteration === undefined ||
        config.max_iterations === undefined) {
      return null;
    }

    return config as LoopConfig;
  } catch {
    return null;
  }
}

function incrementLoopIteration(loopFilePath?: string): boolean {
  const filePath = loopFilePath || path.join(process.cwd(), '.claude', 'ralph-loop.local.md');

  if (!fs.existsSync(filePath)) {
    return false;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const match = content.match(/^(iteration:\s*)(\d+)$/m);

    if (!match) {
      return false;
    }

    const currentIteration = parseInt(match[2], 10);
    const nextIteration = currentIteration + 1;

    const updatedContent = content.replace(
      /^(iteration:\s*)(\d+)$/m,
      `$1${nextIteration}`
    );

    fs.writeFileSync(filePath, updatedContent, 'utf-8');
    return true;
  } catch {
    return false;
  }
}

function deleteLoopFile(loopFilePath?: string): boolean {
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

function checkCompletionPromise(output: string, promise: string): boolean {
  if (!promise) return false;

  const regex = new RegExp(`<promise>\\s*${escapeRegExp(promise)}\\s*</promise>`, 'i');
  return regex.test(output);
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getPromptFromLoopFile(loopFilePath: string): string {
  if (!fs.existsSync(loopFilePath)) {
    return '';
  }

  try {
    const content = fs.readFileSync(loopFilePath, 'utf-8');
    const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/);

    if (match) {
      return match[1].trim();
    }

    return '';
  } catch {
    return '';
  }
}

// Main hook logic
function main(): HookResponse {
  const loopFile = path.join(process.cwd(), '.claude', 'ralph-loop.local.md');
  const config = readLoopConfig(loopFile);

  // No active loop, allow exit
  if (!config || !config.active) {
    return { decision: 'allow' };
  }

  // Get last assistant output from environment
  const lastOutput = process.env.LAST_ASSISTANT_OUTPUT || '';

  // Check for completion promise
  if (config.completion_promise && checkCompletionPromise(lastOutput, config.completion_promise)) {
    console.error('✅ Ralph loop: Detected completion promise');

    deleteLoopFile(loopFile);
    return { decision: 'allow' };
  }

  // Check max iterations
  if (config.iteration >= config.max_iterations) {
    console.error('⚠️  Ralph loop: Max iterations reached');

    deleteLoopFile(loopFile);
    return { decision: 'allow' };
  }

  // Continue loop - increment iteration
  const nextIteration = config.iteration + 1;
  incrementLoopIteration(loopFile);

  // Get the prompt content
  const promptContent = getPromptFromLoopFile(loopFile);

  const responseMsg = `🔄 Ralph Loop - Iteration ${nextIteration}/${config.max_iterations}

Previous work is preserved in files and git history.
Continue from where you left off.

${promptContent}`;

  return {
    decision: 'block',
    reason: responseMsg,
    systemMessage: `🔄 Ralph Loop: Starting iteration ${nextIteration} of ${config.max_iterations}`
  };
}

// Execute hook
try {
  const result = main();

  if (result.decision === 'block') {
    // Output JSON to stdout for Claude Code to parse
    console.log(JSON.stringify(result));
    process.exit(1); // Non-zero exit means "block"
  } else {
    process.exit(0); // Zero exit means "allow"
  }
} catch (error) {
  console.error('Error in Ralph stop hook:', error);
  process.exit(0); // On error, allow exit to avoid infinite loops
}
