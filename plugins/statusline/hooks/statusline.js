#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// ANSI color codes
const COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
  white: '\x1b[37m'
};

const TOKENS_PER_CHAR = 0.15;
const JSON_OVERHEAD = 4.0;

// Cache for base context token count (per project)
const baseContextCache = new Map();

class StatusLine {
  constructor() {
    this.homeDir = os.homedir();
    this.claudeDir = path.join(this.homeDir, '.claude');
    this.projectsDir = path.join(this.claudeDir, 'projects');
    this.contextLimits = {
      'opus': 200000,
      'sonnet': 200000,
      'haiku': 200000,
      'glm': 200000,
      'default': 200000
    };
  }

  run() {
    try {
      const status = this.buildStatus();
      if (status) {
        console.log(status);
      }
    } catch (error) {
      console.error('Statusline Error:', error.message);
    }
  }

  buildStatus() {
    const gitInfo = this.getGitInfo();
    const sessionInfo = this.getSessionInfo();
    const pathInfo = this.getPathInfo();

    // Hide statusline for empty/new sessions (no API calls yet)
    // This prevents showing stale data from previous sessions
    if (sessionInfo.model === 'N/A' && !sessionInfo.tokens) {
      return '';
    }

    const parts = [
      this.colorize(gitInfo.branch, 'cyan'),
      gitInfo.insertions, // Already colored
      this.colorize(pathInfo.abbrevPath, 'dim'),
      this.colorize(sessionInfo.model, 'blue'),
      this.colorize(sessionInfo.cost, 'yellow'),
      this.colorize(sessionInfo.tokens, 'magenta'),
      sessionInfo.progress,
      this.colorize(sessionInfo.percentage, 'cyan'),
      this.colorize(sessionInfo.duration, 'dim')
    ];

    return parts.filter(Boolean).join(` ${COLORS.dim}•${COLORS.reset} `);
  }

  colorize(text, color) {
    if (!text) return '';
    return `${COLORS[color]}${text}${COLORS.reset}`;
  }

  getGitInfo() {
    const info = {
      branch: 'N/A',
      insertions: ''
    };

    try {
      execSync('git rev-parse --git-dir', { stdio: 'ignore' });
      try {
        info.branch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
      } catch {
        info.branch = 'HEAD';
      }

      try {
        const numstat = execSync('git diff --numstat', { encoding: 'utf-8' }).trim();
        const lines = numstat.split('\n').filter(l => l.trim());
        let totalInsertions = 0;
        let totalDeletions = 0;

        for (const line of lines) {
          const [additions, deletions] = line.split('\t');
          if (additions && deletions) {
            totalInsertions += parseInt(additions, 10) || 0;
            totalDeletions += parseInt(deletions, 10) || 0;
          }
        }

        if (totalInsertions > 0 || totalDeletions > 0) {
          const plus = totalInsertions > 0 ? `${COLORS.green}+${totalInsertions}${COLORS.reset}` : '';
          const minus = totalDeletions > 0 ? `${COLORS.red}/-${totalDeletions}${COLORS.reset}` : '';
          info.insertions = plus + minus;
        }
      } catch {
        // No changes
      }
    } catch {
      // Not a git repo
    }

    return info;
  }

  getSessionInfo() {
    const info = {
      model: 'N/A',
      cost: '',
      tokens: '',
      progress: '',
      percentage: '',
      duration: ''
    };

    try {
      const sessionPath = this.findCurrentSession();
      if (!sessionPath) return info;

      const sessionData = this.readSession(sessionPath);
      if (!sessionData || sessionData.length === 0) return info;

      // Get latest entry with model data
      const apiEntry = sessionData.slice().reverse().find(e =>
        (e.type === 'assistant' || e.type === 'api_call_start' || e.type === 'completion_params') &&
        (e.message?.model || e.model)
      );

      if (apiEntry) {
        info.model = this.extractModelName(apiEntry);

        // Try actual tokens first, then estimate from file size
        const tokens = this.extractTokens(sessionData, sessionPath);
        info.tokens = this.formatTokens(tokens);

        const cost = this.calculateCost(tokens, apiEntry);
        info.cost = cost ? `$${cost.toFixed(2)}` : '';

        // Context percentage
        const contextLimit = this.getContextLimit(info.model);
        const pct = Math.min(100, Math.round((tokens.total / contextLimit) * 100));
        info.percentage = `${pct}%`;
        info.progress = this.renderProgress(info.percentage);
      }

      // Duration
      info.duration = this.calculateDuration(sessionData);
    } catch (error) {
      // Session read failed
    }

    return info;
  }

  findCurrentSession() {
    try {
      const cwd = process.cwd();
      const sessionEnvDir = path.join(this.claudeDir, 'session-env');

      // Candidate sessions: map UUID to project path
      const sessionCandidates = new Map();

      // Find matching project directory first
      let matchingProject = null;
      const projects = fs.readdirSync(this.projectsDir);
      for (const project of projects) {
        const projectDir = path.join(this.projectsDir, project);
        const stat = fs.statSync(projectDir);
        if (!stat.isDirectory()) continue;

        const indexPath = path.join(projectDir, 'sessions-index.json');
        if (fs.existsSync(indexPath)) {
          try {
            const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
            if (index.originalPath && cwd.startsWith(index.originalPath)) {
              matchingProject = projectDir;
              break;
            }
          } catch {
            // Continue
          }
        }
      }

      if (!matchingProject) return null;

      // PRIMARY METHOD: Use session-env to find recently active sessions
      // The session-env directory is created when a session starts, so recent entries
      // indicate sessions that were started recently (even if empty)
      const recentThreshold = 2 * 60 * 1000; // 2 minutes
      const now = Date.now();

      if (fs.existsSync(sessionEnvDir)) {
        const sessionDirs = fs.readdirSync(sessionEnvDir, { withFileTypes: true })
          .filter(d => d.isDirectory())
          .map(d => ({
            uuid: d.name,
            envPath: path.join(sessionEnvDir, d.name),
            envMtime: fs.statSync(path.join(sessionEnvDir, d.name)).mtimeMs
          }))
          .filter(d => now - d.envMtime < recentThreshold); // Only very recent sessions

        // Find matching .jsonl files and get their modification times
        for (const sessionDir of sessionDirs) {
          const sessionPath = path.join(matchingProject, `${sessionDir.uuid}.jsonl`);
          if (fs.existsSync(sessionPath)) {
            const sessionStat = fs.statSync(sessionPath);
            sessionCandidates.set(sessionDir.uuid, {
              path: sessionPath,
              envMtime: sessionDir.envMtime,
              fileMtime: sessionStat.mtimeMs,
              hasApiCalls: sessionStat.size > 1000 // Assume >1KB means has content
            });
          }
        }
      }

      // Choose the best candidate:
      // 1. Prefer sessions with API calls (content)
      // 2. Among those, prefer the most recently modified file
      // 3. If no content, prefer the most recent env (newest session)
      let bestSession = null;
      let bestScore = -1;

      for (const [uuid, candidate] of sessionCandidates) {
        let score = 0;
        // Base score from file recency (more recent = higher)
        const fileAge = now - candidate.fileMtime;
        score += Math.max(0, 1000000 - fileAge);

        // Big bonus for having API calls (this is likely the active session)
        if (candidate.hasApiCalls) {
          score += 10000000;
        }

        // Small bonus for recent env creation (newer sessions)
        const envAge = now - candidate.envMtime;
        score += Math.max(0, 500000 - envAge);

        if (score > bestScore) {
          bestScore = score;
          bestSession = candidate.path;
        }
      }

      if (bestSession) {
        return bestSession;
      }

      // FALLBACK: Use the most recently modified .jsonl file in the project
      const sessions = fs.readdirSync(matchingProject)
        .filter(f => f.endsWith('.jsonl'))
        .map(f => ({
          path: path.join(matchingProject, f),
          mtime: fs.statSync(path.join(matchingProject, f)).mtimeMs
        }));

      if (sessions.length === 0) return null;

      sessions.sort((a, b) => b.mtime - a.mtime);
      return sessions[0].path;
    } catch {
      return null;
    }
  }

  readSession(sessionPath) {
    try {
      const content = fs.readFileSync(sessionPath, 'utf-8');
      const lines = content.trim().split('\n');
      return lines.map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      }).filter(Boolean);
    } catch {
      return [];
    }
  }

  extractModelName(entry) {
    const model = entry.message?.model || entry.model || entry.model_name || entry.slate?.model;
    if (model) {
      const modelLower = model.toLowerCase();
      if (modelLower.includes('opus')) return 'Opus 4.5';
      if (modelLower.includes('sonnet')) return 'Sonnet 4.5';
      if (modelLower.includes('haiku')) return 'Haiku 4.5';
      if (modelLower.includes('glm')) {
        if (modelLower.includes('4.5') || modelLower.includes('4-5')) return 'Glm 4.5';
        if (modelLower.includes('4.7') || modelLower.includes('4-7')) return 'Glm 4.7';
        return 'Glm';
      }
      return model.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
    return 'N/A';
  }

  estimateBaseContextTokens() {
    const cwd = process.cwd();
    const cacheKey = cwd;

    // Return cached value if available
    if (baseContextCache.has(cacheKey)) {
      return baseContextCache.get(cacheKey);
    }

    let totalChars = 0;

    // Helper to safely count file characters
    const countFile = (filePath) => {
      try {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          return content.length;
        }
      } catch {
        // File not accessible
      }
      return 0;
    };

    // Helper to recursively count files in directory matching pattern
    const countDir = (dirPath, pattern = /\.md$/) => {
      let count = 0;
      try {
        if (fs.existsSync(dirPath)) {
          const items = fs.readdirSync(dirPath, { withFileTypes: true });
          for (const item of items) {
            const fullPath = path.join(dirPath, item.name);
            if (item.isDirectory()) {
              count += countDir(fullPath, pattern);
            } else if (item.isFile() && pattern.test(item.name)) {
              count += countFile(fullPath);
            }
          }
        }
      } catch {
        // Dir not accessible
      }
      return count;
    };

    // 1. Global Claude config files
    totalChars += countFile(path.join(this.claudeDir, 'CLAUDE.md'));

    // 2. Global rules (core, domain, project)
    totalChars += countDir(path.join(this.claudeDir, 'rules', 'core'));
    totalChars += countDir(path.join(this.claudeDir, 'rules', 'domain'));
    totalChars += countDir(path.join(this.claudeDir, 'rules', 'project'));

    // 3. MCP config
    totalChars += countFile(path.join(this.claudeDir, 'mcp.json'));
    totalChars += countFile(path.join(this.claudeDir, 'mcp_settings.json'));

    // 4. Project-specific config (if exists)
    const projectClaudeMd = path.join(cwd, 'CLAUDE.md');
    totalChars += countFile(projectClaudeMd);

    const projectClaudeDir = path.join(cwd, '.claude');
    if (fs.existsSync(projectClaudeDir)) {
      // Project rules
      totalChars += countDir(path.join(projectClaudeDir, 'rules'));

      // Project smite config
      totalChars += countDir(path.join(projectClaudeDir, '.smite'));
    }

    // 5. Plugins - ONLY count command markdown files that are actually sent to the API
    // Source code, hooks, skills docs are NOT included in API context
    const possiblePluginPaths = [
      path.join(cwd, 'plugins'),
      path.join(cwd, '..', 'plugins'),
      path.join(this.claudeDir, 'plugins'),
    ];

    for (const pluginsPath of possiblePluginPaths) {
      if (fs.existsSync(pluginsPath)) {
        const pluginDirs = fs.readdirSync(pluginsPath, { withFileTypes: true })
          .filter(d => d.isDirectory())
          .map(d => path.join(pluginsPath, d.name));

        for (const pluginDir of pluginDirs) {
          // Only count command markdown files (these are loaded into context)
          // Skip: source code, skills docs, hooks (not sent to API)
          const commandsDir = path.join(pluginDir, 'commands');
          totalChars += countDir(commandsDir, /\.md$/);
        }
      }
    }

    // Convert characters to estimated tokens
    // Use TOKENS_PER_CHAR but with lower overhead since these are plain text/markdown
    const estimatedTokens = Math.round(totalChars * TOKENS_PER_CHAR);

    // Cache the result (with a reasonable minimum base)
    const result = Math.max(estimatedTokens, 5000); // At least 5K base context
    baseContextCache.set(cacheKey, result);

    return result;
  }

  extractTokens(sessionData, sessionPath) {
    let inputTokens = 0;
    let outputTokens = 0;

    // First, try to get actual tokens from session data
    for (const entry of sessionData) {
      if (entry.type === 'api_call_start') {
        inputTokens += entry.input_tokens || 0;
        outputTokens += entry.output_tokens || 0;
      } else if (entry.type === 'completion_params') {
        inputTokens += entry.prompt_tokens || 0;
        outputTokens += entry.completion_tokens || 0;
      } else if (entry.type === 'assistant' && entry.message?.usage) {
        inputTokens += entry.message.usage.input_tokens || 0;
        outputTokens += entry.message.usage.output_tokens || 0;
      }
    }

    // If we have actual tokens, use them directly
    // Note: API-reported input_tokens already include base context (system prompt, tools, memory files)
    // So we don't add baseContext again - that would double-count
    if (inputTokens > 0 || outputTokens > 0) {
      // Actual tokens from API are complete, no modification needed
    } else if (sessionData.length > 0) {
      // No actual tokens found, estimate from actual message content
      // Extract just the text content from messages, not JSON metadata

      let userTextChars = 0;
      let assistantTextChars = 0;

      for (const entry of sessionData) {
        try {
          if (entry.type === 'user' && entry.message?.content) {
            userTextChars += this.extractTextContent(entry.message.content);
          } else if (entry.type === 'assistant' && entry.message?.content) {
            assistantTextChars += this.extractTextContent(entry.message.content);
          }
        } catch {
          // Skip malformed entries
        }
      }

      // Estimate tokens from actual text content (not JSON overhead)
      // Text content is much closer to actual tokens than JSON structure
      const estimatedInput = Math.round(userTextChars * TOKENS_PER_CHAR);
      const estimatedOutput = Math.round(assistantTextChars * TOKENS_PER_CHAR);

      // Add base context ONCE (sent with each API request)
      const baseContext = this.estimateBaseContextTokens();

      // Input = user text content + base context
      inputTokens = estimatedInput + baseContext;
      // Output = assistant text content
      outputTokens = estimatedOutput;
    }

    // Fallback: if no tokens at all, at least show base context
    // (even an empty session has base context sent to API)
    if (inputTokens === 0 && outputTokens === 0) {
      inputTokens = this.estimateBaseContextTokens();
    }

    return { input: inputTokens, output: outputTokens, total: inputTokens + outputTokens };
  }

  extractTextContent(content) {
    if (!content) return 0;
    if (typeof content === 'string') {
      return content.length;
    }
    if (Array.isArray(content)) {
      return content.reduce((sum, item) => {
        if (typeof item === 'string') return sum + item.length;
        if (item?.type === 'text') return sum + (item.text?.length || 0);
        if (item?.type === 'tool_use') {
          // Count tool name and input params
          let toolChars = (item.name?.length || 0);
          if (item.input) {
            toolChars += JSON.stringify(item.input).length;
          }
          return sum + toolChars;
        }
        if (item?.type === 'thinking' || item?.type === 'signature') {
          return sum + (item.thinking?.length || item.signature?.length || 0);
        }
        return sum;
      }, 0);
    }
    return 0;
  }

  getContextLimit(modelName) {
    const modelLower = (modelName || '').toLowerCase();
    if (modelLower.includes('opus')) return this.contextLimits.opus;
    if (modelLower.includes('sonnet')) return this.contextLimits.sonnet;
    if (modelLower.includes('haiku')) return this.contextLimits.haiku;
    if (modelLower.includes('glm')) return this.contextLimits.glm;
    return this.contextLimits.default;
  }

  formatTokens(tokens) {
    if (!tokens || tokens.total === 0) return '';
    const t = tokens.total;
    return t >= 1000 ? `${(t / 1000).toFixed(0)}K` : `${t}`;
  }

  calculateCost(tokens, entry) {
    const pricing = {
      opus: { input: 15, output: 75 },
      sonnet: { input: 3, output: 15 },
      haiku: { input: 1, output: 5 },
      glm: { input: 0.5, output: 1 }
    };

    let model = 'opus';
    const modelStr = (entry.message?.model || entry.model || entry.model_name || '').toLowerCase();
    if (modelStr.includes('sonnet')) model = 'sonnet';
    else if (modelStr.includes('haiku')) model = 'haiku';
    else if (modelStr.includes('glm')) model = 'glm';

    const rates = pricing[model];
    const inputCost = (tokens.input / 1_000_000) * rates.input;
    const outputCost = (tokens.output / 1_000_000) * rates.output;

    return inputCost + outputCost;
  }

  renderProgress(percentage) {
    if (!percentage) return '';
    const pct = parseInt(percentage);
    if (isNaN(pct)) return '';

    const width = 10;
    const filled = Math.round((pct / 100) * width);
    const empty = width - filled;

    // Color gradient based on percentage
    let color = COLORS.green;
    if (pct >= 80) color = COLORS.red;
    else if (pct >= 50) color = COLORS.yellow;

    return color + '█'.repeat(filled) + COLORS.dim + '░'.repeat(empty) + COLORS.reset;
  }

  calculateDuration(sessionData) {
    if (sessionData.length === 0) return '';

    let start = null;
    let end = null;

    for (const entry of sessionData) {
      const ts = entry.timestamp || entry.time;
      if (ts) {
        if (!start) start = ts;
        end = ts;
      }
    }

    if (!start || !end) return '';

    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const diffMs = endTime - startTime;

    if (diffMs < 0) return '';

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  getPathInfo() {
    const cwd = process.cwd();
    let abbrevPath = cwd;

    if (cwd.startsWith(this.homeDir)) {
      abbrevPath = '~' + cwd.slice(this.homeDir.length);
    }

    const parts = abbrevPath.split(path.sep);
    if (parts.length > 3) {
      const last = parts[parts.length - 1];
      const secondLast = parts[parts.length - 2];
      abbrevPath = ['~', '...', secondLast, last].join(path.sep);
    }

    return { abbrevPath };
  }
}

if (require.main === module) {
  const statusline = new StatusLine();
  statusline.run();
}

module.exports = StatusLine;
