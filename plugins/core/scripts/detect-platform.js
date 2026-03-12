#!/usr/bin/env node
/**
 * SMITE Core - Detect Platform
 *
 * Cross-platform detection script for Windows, macOS, and Linux.
 * Returns platform information as JSON.
 */

import { platform, homedir } from 'os';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

function detectPlatform() {
  const info = {
    platform: 'linux',
    shell: 'bash',
    arch: process.arch,
    nodeVersion: process.version,
    homeDir: homedir()
  };

  // Detect OS
  const os = platform();
  if (os === 'win32') {
    info.platform = 'windows';
  } else if (os === 'darwin') {
    info.platform = 'macos';
  }

  // Detect shell
  const env = process.env;

  if (info.platform === 'windows') {
    if (env.PSModulePath) {
      info.shell = 'powershell';
    } else if (env.COMSPEC) {
      info.shell = 'cmd';
    }
  } else {
    const shellPath = env.SHELL || '';
    if (shellPath.includes('zsh')) {
      info.shell = 'zsh';
    } else if (shellPath.includes('bash')) {
      info.shell = 'bash';
    }
  }

  return info;
}

function detectFromGitConfig() {
  try {
    const gitConfigPath = join(process.cwd(), '.gitconfig');
    if (!existsSync(gitConfigPath)) {
      return null;
    }

    const content = readFileSync(gitConfigPath, 'utf8');

    // Check for Windows-specific indicators
    if (content.includes('core.autocrlf') || content.includes('core.symlinks')) {
      return { platform: 'windows' };
    }

    return null;
  } catch {
    return null;
  }
}

// Main execution - always run when file is executed directly
const info = detectPlatform();

// Try to detect from git config as fallback
const gitInfo = detectFromGitConfig();
if (gitInfo) {
  Object.assign(info, gitInfo);
}

// Output as JSON
console.log(JSON.stringify(info, null, 2));

export { detectPlatform };
