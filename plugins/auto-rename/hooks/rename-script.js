const SessionManager = require('./session-manager');

class RenameScript {
  constructor() {
    this.manager = new SessionManager();
    this.lastRename = null;
    this.lastRenameTime = 0;
    this.renameCount = 0;
    // Configuration constants
    this.config = {
      maxRenamesPerSession: 15,
      minRenameInterval: 15000,
      llmTimeout: 15000,
      initialDelay: 3000,
      additionalDelay: 5000,
      minEntriesForRename: 3
    };
  }

  async run() {
    const args = process.argv.slice(2);
    const hookType = args[0] || 'session-start';

    try {
      const input = this.readStdin();

      if (hookType === 'session-start') {
        await this.handleSessionStart(input);
      } else if (hookType === 'post-tool') {
        await this.handlePostToolUse(input);
      } else if (hookType === 'user-prompt') {
        await this.handleUserPromptSubmit(input);
      } else if (hookType === 'manual') {
        await this.handleManualRename(args[1]);
      }

    } catch (error) {
      console.error(`[AutoRename] Error: ${error.message}`);
      process.exit(1);  // Exit with error code on failure
    }
  }

  readStdin() {
    try {
      const fs = require('fs');

      // Check if stdin has data available without blocking
      // Use stat to check if stdin is a pipe/has content
      try {
        const stdinStat = fs.fstatSync(0);
        // Only read if stdin is a pipe (not a tty) and has size
        if (stdinStat.isFIFO() || stdinStat.size > 0) {
          const inputData = fs.readFileSync(0, 'utf-8');

          if (inputData && inputData.trim()) {
            const parsed = JSON.parse(inputData);

            // Log successful input for debugging
            if (parsed && (parsed.tool_name || parsed.content)) {
              console.error('[AutoRename] Input received:', JSON.stringify(parsed).substring(0, 100));
            }

            return parsed;
          }
        }

        console.error('[AutoRename] No stdin data available (not a pipe or empty)');
        return null;
      } catch (readError) {
        // On Windows or certain systems, fstatSync might fail for stdin
        // Try reading anyway as fallback
        if (readError.code === 'EBADF' || readError.code === 'EINVAL') {
          console.error('[AutoRename] stdin not available, continuing without input');
          return null;
        }
        throw readError;
      }
    } catch (error) {
      // No stdin data or invalid JSON - return null for hooks that don't require input
      console.error('[AutoRename] stdin parse error:', error.message);
      return null;
    }
  }

  async handleSessionStart(input) {
    const sessionPath = this.manager.findCurrentSession();

    if (!sessionPath) {
      console.error('[AutoRename] SessionStart: No session path found');
      return;
    }

    console.error('[AutoRename] SessionStart: Waiting for initial context...');

    // Wait to gather initial context - adaptive delay
    await this.delay(this.config.initialDelay);

    let entries = this.manager.readSession(sessionPath);
    console.error(`[AutoRename] SessionStart: Found ${entries.length} entries after initial delay`);

    // If we still don't have much context, wait a bit more and retry
    if (entries.length < 2) {
      const additionalDelay = this.config.additionalDelay;
      console.error(`[AutoRename] SessionStart: Only ${entries.length} entries, waiting ${additionalDelay}ms more...`);
      await this.delay(additionalDelay);

      // Clear cache to get fresh data
      this.manager.clearCache();
      const updatedEntries = this.manager.readSession(sessionPath);
      console.error(`[AutoRename] SessionStart: Found ${updatedEntries.length} entries after additional delay`);

      await this.attemptRename(sessionPath, updatedEntries, 'session-start');
      return;
    }

    await this.attemptRename(sessionPath, entries, 'session-start');
  }

  async handlePostToolUse(input) {
    console.error('[AutoRename] PostToolUse triggered');

    if (!this.shouldTriggerRename(input)) {
      console.error('[AutoRename] PostToolUse: not a significant tool');
      return;
    }

    const sessionPath = this.manager.findCurrentSession();
    if (!sessionPath) {
      console.error('[AutoRename] PostToolUse: no session found');
      return;
    }

    // Clear cache to ensure we have fresh session data
    this.manager.clearCache();
    const entries = this.manager.getSessionHistory(sessionPath);
    console.error(`[AutoRename] PostToolUse: session has ${entries.length} entries`);

    // Rename periodically - every 3-5 significant tool uses
    if (entries.length < this.config.minEntriesForRename) {
      console.error('[AutoRename] PostToolUse: not enough entries yet');
      return;
    }

    await this.attemptRename(sessionPath, entries, 'post-tool');
  }

  async handleUserPromptSubmit(input) {
    console.error('[AutoRename] UserPromptSubmit triggered');

    const sessionPath = this.manager.findCurrentSession();
    if (!sessionPath) {
      console.error('[AutoRename] UserPromptSubmit: no session found');
      return;
    }

    // Clear cache to ensure we have fresh session data
    this.manager.clearCache();
    const entries = this.manager.getSessionHistory(sessionPath);
    console.error(`[AutoRename] UserPromptSubmit: session has ${entries.length} entries`);

    // Rename after every few user prompts to capture conversation evolution
    if (entries.length < this.config.minEntriesForRename) {
      console.error('[AutoRename] UserPromptSubmit: not enough entries yet');
      return;
    }

    await this.attemptRename(sessionPath, entries, 'user-prompt');
  }

  async handleManualRename(customName) {
    const sessionPath = this.manager.findCurrentSession();

    if (!sessionPath) {
      console.error('[AutoRename] No session found');
      process.exit(1);
      return;
    }

    if (customName) {
      this.manager.writeSessionRename(sessionPath, customName);
      console.log(`[AutoRename] Session renamed to: "${customName}"`);
    } else {
      const entries = this.manager.getSessionHistory(sessionPath);
      await this.attemptRename(sessionPath, entries, 'manual');
    }
  }

  shouldTriggerRename(input) {
    // PostToolUse hook provides: tool_name, tool_input, tool_response
    // See: https://code.claude.com/docs/en/hooks#PostToolUse Input
    if (!input || !input.tool_name) {
      console.error('[AutoRename] shouldTriggerRename: no tool_name in input');
      return false;
    }

    const significantTools = [
      'Write', 'Edit', 'MultiEdit', 'NotebookEdit',
      'Bash', 'Skill'
    ];

    console.error(`[AutoRename] Checking tool: ${input.tool_name}`);

    if (significantTools.includes(input.tool_name)) {
      // For Bash, check if it's a significant command
      if (input.tool_name === 'Bash' && input.tool_input) {
        const command = input.tool_input.command || '';
        // Expanded list of significant commands
        const significantCommands = [
          'git commit', 'git add', 'git push', 'git pull', 'git merge', 'git checkout',
          'git rebase', 'git reset', 'git revert', 'git stash',
          'npm ', 'yarn ', 'pnpm ', 'bun ',
          'npm install', 'npm run', 'npm ci',
          'yarn install', 'yarn add',
          'pnpm install', 'pnpm add',
          'bun install', 'bun add',
          'eslint', 'prettier', 'pytest', 'jest', 'vitest',
          'build', 'test', 'lint', 'typecheck', 'format',
          'docker', 'terraform', 'ansible'
        ];
        const isSignificant = significantCommands.some(cmd => command.includes(cmd));

        console.error(`[AutoRename] Bash command: "${command}", significant: ${isSignificant}`);
        return isSignificant;
      }

      console.error(`[AutoRename] Tool ${input.tool_name} is significant`);
      return true;
    }

    console.error(`[AutoRename] Tool ${input.tool_name} is not significant`);
    return false;
  }

  async attemptRename(sessionPath, entries, trigger) {
    console.error(`[AutoRename] attemptRename called (trigger: ${trigger})`);

    if (this.renameCount >= this.config.maxRenamesPerSession) {
      console.error(`[AutoRename] Max renames reached (${this.renameCount}/${this.config.maxRenamesPerSession})`);
      return;
    }

    // Debounce: Don't rename if we've renamed recently (within minRenameInterval)
    const now = Date.now();
    const timeSinceLastRename = now - this.lastRenameTime;

    if (timeSinceLastRename < this.config.minRenameInterval) {
      console.error(`[AutoRename] Too soon since last rename (${timeSinceLastRename}ms < ${this.config.minRenameInterval}ms)`);
      return;
    }

    const context = this.manager.extractContext(entries);
    console.error(`[AutoRename] Context extracted: firstUserMessage="${context.firstUserMessage?.substring(0, 50)}..."`);

    if (!context.firstUserMessage && entries.length < 5) {
      console.error('[AutoRename] Not enough context to rename');
      return;
    }

    const prompt = this.manager.generateSessionNamePrompt(context);
    console.error('[AutoRename] Generating name with LLM...');

    const newName = await this.generateNameWithLLM(prompt);

    if (!newName) {
      console.error('[AutoRename] Failed to generate name');
      return;
    }

    if (this.lastRename === newName) {
      console.error(`[AutoRename] Name unchanged: "${newName}"`);
      return;
    }

    console.error(`[AutoRename] Writing rename: "${newName}"`);
    const success = this.manager.writeSessionRename(sessionPath, newName);

    if (success) {
      this.lastRename = newName;
      this.lastRenameTime = now;
      this.renameCount++;
      console.log(`[AutoRename] Session renamed to: "${newName}" (trigger: ${trigger}, count: ${this.renameCount})`);
    } else {
      console.error('[AutoRename] Failed to write rename');
    }
  }

  async generateNameWithLLM(prompt) {
    try {
      const { spawn } = require('child_process');

      return new Promise((resolve) => {
        let completed = false;
        let timeoutHandle = null;

        // Sanitize environment: remove potentially dangerous variables
        const safeEnv = {
          ...process.env,
          PATH: process.env.PATH || '',
          PATHEXT: process.env.PATHEXT || '',
          HOME: process.env.HOME || process.env.USERPROFILE || '',
          USERPROFILE: process.env.USERPROFILE || ''
        };

        // Use -p flag for non-interactive mode
        // Avoid shell: true to prevent injection, resolve command manually
        const isWindows = process.platform === 'win32';
        const command = isWindows ? 'claude.cmd' : 'claude';
        const args = ['-p', '--output-format', 'text'];

        const claude = spawn(command, args, {
          env: safeEnv,
          shell: false  // Disabled: prevents shell injection
        });

        let output = '';
        let errorOutput = '';

        claude.stdout.on('data', (data) => {
          output += data.toString();
        });

        claude.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });

        // Write prompt to stdin
        claude.stdin.write(prompt);
        claude.stdin.end();

        const cleanup = (result) => {
          if (completed) return;  // Prevent double resolution
          completed = true;
          if (timeoutHandle) clearTimeout(timeoutHandle);

          // Kill process if still running
          try {
            if (!claude.killed) claude.kill();
          } catch (e) {
            // Ignore cleanup errors
          }

          resolve(result);
        };

        claude.on('close', (code) => {
          console.error('[AutoRename] LLM generation completed with code:', code);

          if (output.trim()) {
            // Extract first meaningful line as the name
            const name = output.trim()
              .split('\n')[0]
              .replace(/["']/g, '')
              .trim()
              .substring(0, 50);

            if (name.length > 5 && !name.toLowerCase().startsWith('usage:')) {
              console.error('[AutoRename] Generated name:', name);
              cleanup(name);
              return;
            }
          }

          console.error('[AutoRename] LLM output invalid, using fallback');
          cleanup(this.generateFallbackName());
        });

        claude.on('error', (error) => {
          console.error('[AutoRename] LLM spawn error:', error.message);
          cleanup(this.generateFallbackName());
        });

        // Timeout for LLM generation
        timeoutHandle = setTimeout(() => {
          console.error('[AutoRename] LLM timeout, using fallback');
          cleanup(this.generateFallbackName());
        }, this.config.llmTimeout);
      });
    } catch (error) {
      console.error('[AutoRename] LLM generation error:', error.message);
      return this.generateFallbackName();
    }
  }

  generateFallbackName() {
    const hour = new Date().getHours();
    const actions = ['Working on', 'Fixing', 'Building', 'Debugging'];
    const action = actions[hour % actions.length];

    return `${action} code`;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

if (require.main === module) {
  const script = new RenameScript();
  script.run().catch(error => {
    console.error('[AutoRename] Fatal error:', error);
    process.exit(1);  // Exit with error code on failure
  });
}

module.exports = RenameScript;
