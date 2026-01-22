#!/usr/bin/env node

/**
 * Simplified Statusline for Claude Code
 *
 * A reliable, cross-platform statusline that:
 * - Shows git branch, cost, duration, and current session token usage
 * - Parses transcript to count tokens from current session only
 * - Works on Windows, macOS, and Linux
 * - No cumulative token tracking - session-specific only
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  red: '\x1b[31m'
};

/**
 * Estimate tokens from transcript for CURRENT SESSION only
 * Uses 3.5 chars per token ratio (balanced for code + text)
 */
function estimateSessionTokens(transcriptPath) {
  if (!transcriptPath || !fs.existsSync(transcriptPath)) {
    return 0;
  }

  try {
    const transcriptContent = fs.readFileSync(transcriptPath, 'utf-8');
    const lines = transcriptContent.trim().split('\n');

    let charCount = 0;

    // Parse all entries to count session tokens
    for (const line of lines) {
      try {
        const entry = JSON.parse(line);

        // Skip internal entries that don't consume context
        if (entry.type === 'progress' || entry.type === 'file-history-snapshot') {
          continue;
        }

        // Count user and assistant messages (excluding "thinking" blocks)
        if (entry.type === 'user' || entry.type === 'assistant') {
          // Content is in entry.message.content for Claude Code format
          const content = entry.message?.content || entry.content || '';
          if (Array.isArray(content)) {
            // Filter out "thinking" blocks
            const nonThinkingContent = content.filter(c => c.type !== 'thinking');
            charCount += JSON.stringify(nonThinkingContent).length;
          } else {
            charCount += content.length;
          }
        }
        // Count tool results and tool uses (also in message content array)
        else if (entry.type === 'tool_result' || entry.type === 'tool_use') {
          const toolContent = entry.message?.content || entry.content || entry.output || '';
          const toolInput = entry.message?.input || entry.input || '';
          charCount += JSON.stringify(toolContent).length + JSON.stringify(toolInput).length;
        }
      } catch {
        // Skip malformed lines
        continue;
      }
    }

    // Estimate tokens: 3.5 chars per token
    return Math.round(charCount / 3.5);

  } catch (e) {
    return 0;
  }
}

try {
  // Read stdin synchronously
  const inputData = fs.readFileSync(0, 'utf-8');
  const data = JSON.parse(inputData);

  // Get git branch with timeout
  let branch = 'main';
  try {
    branch = execSync('git branch --show-current', {
      encoding: 'utf8',
      timeout: 300,
      stdio: ['ignore', 'pipe', 'ignore'],
      cwd: data.workspace?.current_dir?.replace(/\\/g, '/') || process.cwd()
    }).trim() || 'main';
  } catch {
    branch = 'main';
  }

  // Format cost
  const cost = (data.cost?.total_cost_usd || 0).toFixed(2);

  // Format duration
  const durationSecs = Math.floor((data.cost?.total_duration_ms || 0) / 1000);
  const mins = Math.floor(durationSecs / 60);
  const secs = durationSecs % 60;

  // Get context window size
  const contextWindow = data.context_window?.context_window_size || 200000;

  // Token counting strategy: try transcript first, then payload
  // We want CURRENT SESSION tokens, not cumulative

  // 1. Try transcript parsing (session-specific, most accurate)
  let currentUsage = estimateSessionTokens(data.transcript_path);

  // 2. Fallback: use payload current_usage if transcript is empty
  // This happens at session start or if transcript parsing fails
  if (currentUsage === 0) {
    const payloadUsage = (data.context_window?.current_usage?.input_tokens || 0) +
                         (data.context_window?.current_usage?.cache_creation_input_tokens || 0) +
                         (data.context_window?.current_usage?.cache_read_input_tokens || 0);

    if (payloadUsage > 0) {
      currentUsage = payloadUsage;
    }
  }

  const percentage = Math.min(100, Math.round((currentUsage / contextWindow) * 100));

  // Color-coded progress bar based on usage
  const filled = Math.floor(percentage / 10);
  const empty = 10 - filled;

  let barColor = colors.green;
  if (percentage >= 80) barColor = colors.yellow;
  if (percentage >= 90) barColor = colors.bright + colors.red;

  const bar = barColor + '█'.repeat(filled) + colors.gray + '░'.repeat(empty) + colors.reset;

  // Get model name
  const modelName = data.model?.display_name || 'Claude';

  // Format tokens in K
  const tokensK = (currentUsage / 1000).toFixed(1);

  // Get project path and format it relative to home directory
  const homeDir = os.homedir();
  let projectPath = (data.workspace?.current_dir || process.cwd()).replace(/\\/g, '/');

  // Try to get current working directory from transcript
  try {
    if (data.transcript_path && fs.existsSync(data.transcript_path)) {
      const transcriptContent = fs.readFileSync(data.transcript_path, 'utf-8');
      const lines = transcriptContent.trim().split('\n');
      const recentLines = lines.slice(-50);
      let currentDir = projectPath;

      // Process in reverse to find most recent cd command
      for (let i = recentLines.length - 1; i >= 0; i--) {
        try {
          const entry = JSON.parse(recentLines[i]);
          const entryStr = JSON.stringify(entry);

          // Look for cd commands
          const bashInputMatch = entryStr.match(/<bash-input>cd\s+([^\s<]+)<\/bash-input>/);
          if (bashInputMatch) {
            let targetDir = bashInputMatch[1].trim();

            if (targetDir === '..') {
              const parts = currentDir.split(/[/\\]/);
              parts.pop();
              currentDir = parts.join('/');
            } else if (targetDir.startsWith('/') || targetDir.match(/^[A-Za-z]:\\/)) {
              currentDir = targetDir;
            } else if (targetDir !== '.' && targetDir !== '~') {
              const separator = currentDir.includes('/') ? '/' : '\\';
              currentDir = currentDir + separator + targetDir;
            }

            currentDir = currentDir.replace(/\\/g, '/');
            projectPath = currentDir;
            break;
          }
        } catch {
          continue;
        }
      }
    }
  } catch {
    // Use default path
  }

  // Replace home directory with ~
  const normalizedProjectPath = projectPath;
  const normalizedHomeDir = homeDir.replace(/\\/g, '/');

  let displayPath = normalizedProjectPath;
  if (normalizedProjectPath.startsWith(normalizedHomeDir + '/') || normalizedProjectPath === normalizedHomeDir) {
    const relativePath = normalizedProjectPath.slice(normalizedHomeDir.length);
    displayPath = '~' + (relativePath.startsWith('/') ? relativePath : '/' + relativePath);
  }

  // Get project name
  const pathParts = displayPath.split(/[/\\]/);
  const projectName = pathParts.pop() || 'project';
  const pathWithoutProject = pathParts.join('/');

  let finalPathDisplay = projectName;
  if (pathWithoutProject && pathWithoutProject !== '~') {
    finalPathDisplay = pathWithoutProject + '/' + projectName;
  } else if (pathWithoutProject === '~') {
    finalPathDisplay = '~/' + projectName;
  }

  // Output the statusline
  console.log(
    colors.cyan + branch + colors.reset + ' • ' +
    colors.gray + finalPathDisplay + colors.reset + ' • ' +
    colors.bright + modelName + colors.reset + ' • ' +
    colors.yellow + '$' + cost + colors.reset + ' • ' +
    colors.white + mins + 'm' + secs + 's' + colors.reset + ' • ' +
    colors.blue + tokensK + 'K' + colors.reset + ' • ' +
    bar + ' ' + percentage + '%' + colors.reset
  );

} catch (error) {
  // Fallback output on any error
  console.log(colors.gray + '>> accepts edits on' + colors.reset);
}
