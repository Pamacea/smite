#!/usr/bin/env node
/**
 * SMITE Essentials - Install Aliases Script
 * 
 * Cross-platform alias installer for Claude Code
 * Supports: Windows (PowerShell, cmd), macOS (Bash, Zsh), Linux (Bash, Zsh)
 * 
 * Usage: node scripts/install-aliases.js
 */

import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { homedir, platform } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function detectShell() {
  const env = process.env;
  const plat = platform();

  if (plat === 'win32') {
    if (env.PSModulePath) return 'powershell';
    return 'cmd';
  }

  return env.SHELL?.includes('zsh') ? 'zsh' : 'bash';
}

function getConfigPath(shell) {
  const home = homedir();

  switch (shell) {
    case 'powershell':
      return process.env.PSModulePath?.split(';')[0] || join(home, 'Documents', 'WindowsPowerShell');
    case 'cmd':
      return join(home, 'cc.bat');
    case 'zsh':
      return join(home, '.zshrc');
    case 'bash':
    default:
      return join(home, '.bashrc');
  }
}

function backupFile(filePath) {
  if (!existsSync(filePath)) return null;

  const backupPath = `${filePath}.smite-backup-${Date.now()}`;
  const content = readFileSync(filePath, 'utf8');
  writeFileSync(backupPath, content);
  return backupPath;
}

function installPowerShellAliases(configPath) {
  const aliasScript = `
# SMITE Essentials - Claude Code Aliases
# Added: ${new Date().toISOString()}

function cc {
  claude $args
}

function ccc {
  claude-code $args
}

# Show this help
function smite-help {
  Write-Host "SMITE Essentials Aliases:" -ForegroundColor Green
  Write-Host "  cc <args>    - Claude Code (normal mode)" -ForegroundColor Cyan
  Write-Host "  ccc <args>   - Claude Code (bypass mode)" -ForegroundColor Cyan
}

# Export for use in other sessions
Export-ModuleMember -Function cc, ccc, smite-help
`;

  const modulePath = join(configPath, 'SMITE.psm1');
  
  // Backup existing
  const backup = backupFile(modulePath);
  if (backup) log(`Created backup: ${backup}`, 'yellow');

  // Write module
  writeFileSync(modulePath, aliasScript);

  // Add to profile if not exists
  const profilePath = join(homedir(), 'Documents', 'WindowsPowerShell', 'Microsoft.PowerShell_profile.ps1');
  const importLine = `Import-Module "${modulePath}"`;
  
  if (existsSync(profilePath)) {
    const profile = readFileSync(profilePath, 'utf8');
    if (!profile.includes('SMITE.psm1')) {
      appendFileSync(profilePath, `\n${importLine}\n`);
    }
  } else {
    writeFileSync(profilePath, `${importLine}\n`);
  }

  return modulePath;
}

function installCmdAliases(configPath) {
  const batchContent = `@echo off
REM SMITE Essentials - Claude Code Aliases
REM Added: ${new Date().toISOString()}

if "%1"=="" (
  claude
) else (
  claude %*
)
`;

  writeFileSync(configPath, batchContent);
  return configPath;
}

function installBashAliases(configPath, shell) {
  const aliasScript = `
# SMITE Essentials - Claude Code Aliases
# Added: ${new Date().toISOString()}

# Claude Code aliases
alias cc='claude'
alias ccc='claude-code'

# Show this help
smite-help() {
  echo "SMITE Essentials Aliases:"
  echo "  cc <args>    - Claude Code (normal mode)"
  echo "  ccc <args>   - Claude Code (bypass mode)"
}
`;

  // Backup existing
  const backup = backupFile(configPath);
  if (backup) log(`Created backup: ${backup}`, 'yellow');

  // Append to config
  if (existsSync(configPath)) {
    const content = readFileSync(configPath, 'utf8');
    if (!content.includes('SMITE Essentials')) {
      appendFileSync(configPath, aliasScript);
    }
  } else {
    writeFileSync(configPath, aliasScript);
  }

  return configPath;
}

function verifyInstallation(shell, configPath) {
  log('\n📋 Installation Summary:', 'blue');
  log(`Shell: ${shell}`, 'reset');
  log(`Config: ${configPath}`, 'reset');

  if (existsSync(configPath)) {
    log('\n✅ Installation successful!', 'green');
    log('\n📝 Next steps:', 'blue');
    
    switch (shell) {
      case 'powershell':
        log('  1. Restart PowerShell', 'reset');
        log('  2. Test with: cc "hello"', 'reset');
        break;
      case 'cmd':
        log('  1. Open new cmd window', 'reset');
        log('  2. Test with: cc hello', 'reset');
        break;
      case 'zsh':
        log('  1. Run: source ~/.zshrc', 'reset');
        log('  2. Test with: cc "hello"', 'reset');
        break;
      default:
        log('  1. Run: source ~/.bashrc', 'reset');
        log('  2. Test with: cc "hello"', 'reset');
    }
  } else {
    log('\n❌ Installation failed - config file not found', 'red');
    process.exit(1);
  }
}

function main() {
  log('🔧 SMITE Essentials - Alias Installer', 'blue');
  log('=' .repeat(40), 'blue');

  const shell = detectShell();
  log(`Detected shell: ${shell}`, 'yellow');

  const configPath = getConfigPath(shell);
  log(`Config path: ${configPath}`, 'yellow');

  log('\n📦 Installing aliases...', 'blue');

  try {
    switch (shell) {
      case 'powershell':
        installPowerShellAliases(configPath);
        break;
      case 'cmd':
        installCmdAliases(configPath);
        break;
      case 'zsh':
      case 'bash':
        installBashAliases(configPath, shell);
        break;
    }

    verifyInstallation(shell, configPath);
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();
