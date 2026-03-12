#!/usr/bin/env node
/**
 * SMITE Cross-Platform Test Runner
 *
 * Executes all tests and validates cross-platform compatibility
 * for Windows, macOS, and Linux
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SMITE_ROOT = dirname(__dirname);

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('');
  log(`\n═══════════════════════════════════════════════════`, 'cyan');
  log(`  ${title}`, 'bright');
  log(`═══════════════════════════════════════════════════`, 'cyan');
}

function logTest(name, success, details = '') {
  const icon = success ? '✓' : '✗';
  const color = success ? 'green' : 'red';
  log(`${icon} ${name}`, color);
  if (details) {
    log(`  ${details}`, 'reset');
  }
}

function logInfo(message) {
  log(`  ${message}`, 'blue');
}

// Platform detection
function getPlatform() {
  const platform = process.platform;
  if (platform === 'win32') return 'windows';
  if (platform === 'darwin') return 'macos';
  return 'linux';
}

// Read package.json
function getPackageJSON(plugin) {
  const pkgPath = join(SMITE_ROOT, 'plugins', plugin, 'package.json');
  if (!existsSync(pkgPath)) return null;
  return JSON.parse(readFileSync(pkgPath, 'utf8'));
}

// Read plugin.json
function getPluginJSON(plugin) {
  const pluginPath = join(SMITE_ROOT, 'plugins', plugin, '.claude-plugin', 'plugin.json');
  if (!existsSync(pluginPath)) return null;
  return JSON.parse(readFileSync(pluginPath, 'utf8'));
}

// Check if file exists
function fileExists(plugin, ...pathSegments) {
  const filePath = join(SMITE_ROOT, 'plugins', plugin, ...pathSegments);
  return existsSync(filePath);
}

// Check lazy_load frontmatter
function hasLazyLoadFrontmatter(plugin, filePath) {
  const fullPath = join(SMITE_ROOT, 'plugins', plugin, filePath);
  if (!existsSync(fullPath)) return false;
  const content = readFileSync(fullPath, 'utf8');
  return content.includes('lazy_load:');
}

// Run a command and return result
function runCommand(command, cwd = SMITE_ROOT) {
  try {
    const output = execSync(command, {
      cwd,
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 30000
    });
    return { success: true, output };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      output: error.stdout || ''
    };
  }
}

// Validate plugin structure
function validatePluginStructure(plugin) {
  const results = [];

  // Check package.json
  const pkg = getPackageJSON(plugin);
  results.push({
    name: 'package.json exists',
    success: pkg !== null
  });

  if (pkg) {
    results.push({
      name: 'package.json has valid name',
      success: pkg.name === plugin
    });
    results.push({
      name: 'package.json has version',
      success: !!pkg.version
    });
    results.push({
      name: 'package.json has scripts',
      success: !!pkg.scripts
    });
  }

  // Check plugin.json
  const pluginJson = getPluginJSON(plugin);
  results.push({
    name: 'plugin.json exists',
    success: pluginJson !== null
  });

  if (pluginJson && pkg) {
    results.push({
      name: 'Versions match',
      success: pluginJson.version === pkg.version
    });
  }

  // Check documentation
  results.push({
    name: 'README.md exists',
    success: fileExists(plugin, 'README.md')
  });

  results.push({
    name: 'GUIDE.md exists',
    success: fileExists(plugin, 'GUIDE.md')
  });

  results.push({
    name: 'REFERENCE.md exists',
    success: fileExists(plugin, 'REFERENCE.md')
  });

  // Check hooks
  results.push({
    name: 'hooks/hooks.json exists',
    success: fileExists(plugin, 'hooks', 'hooks.json')
  });

  return results;
}

// Validate Studio plugin
function validateStudio() {
  logSection('Studio Plugin v2.5.0');

  const results = validatePluginStructure('studio');

  // Studio-specific checks
  results.push({
    name: 'skills/core/build/SKILL.md exists',
    success: fileExists('studio', 'skills', 'core', 'build', 'SKILL.md')
  });

  results.push({
    name: 'core/build has lazy_load',
    success: hasLazyLoadFrontmatter('studio', 'skills/core/build/SKILL.md')
  });

  results.push({
    name: 'mcp/memory-server.js exists',
    success: fileExists('studio', 'mcp', 'memory-server.js')
  });

  results.push({
    name: 'mcp/analytics-server.js exists',
    success: fileExists('studio', 'mcp', 'analytics-server.js')
  });

  results.push({
    name: 'scripts/quality-gate.sh exists',
    success: fileExists('studio', 'scripts', 'quality-gate.sh')
  });

  return results;
}

// Validate Agents plugin
function validateAgents() {
  logSection('Agents Plugin v2.0.0');

  const results = validatePluginStructure('agents');

  // Agents-specific checks
  results.push({
    name: 'mcp/agent-discovery.js exists',
    success: fileExists('agents', 'mcp', 'agent-discovery.js')
  });

  results.push({
    name: 'mcp/pattern-library.js exists',
    success: fileExists('agents', 'mcp', 'pattern-library.js')
  });

  results.push({
    name: 'scripts/validate-agent.sh exists',
    success: fileExists('agents', 'scripts', 'validate-agent.sh')
  });

  results.push({
    name: 'scripts/init-agents.sh exists',
    success: fileExists('agents', 'scripts', 'init-agents.sh')
  });

  // Check some agents have lazy_load
  const plannerAgent = hasLazyLoadFrontmatter('agents', 'agents/workflow/planner.agent.md');
  results.push({
    name: 'workflow/planner.agent.md has lazy_load',
    success: plannerAgent
  });

  const nestjsAgent = hasLazyLoadFrontmatter('agents', 'agents/backend/nestjs.agent.md');
  results.push({
    name: 'backend/nestjs.agent.md has lazy_load',
    success: nestjsAgent
  });

  return results;
}

// Validate Essentials plugin
function validateEssentials() {
  logSection('Essentials Plugin v2.0.0');

  const results = validatePluginStructure('essentials');

  // Essentials-specific checks
  results.push({
    name: 'skills/auto-rename/SKILL.md exists',
    success: fileExists('essentials', 'skills', 'auto-rename', 'SKILL.md')
  });

  results.push({
    name: 'skills/shell/SKILL.md exists',
    success: fileExists('essentials', 'skills', 'shell', 'SKILL.md')
  });

  results.push({
    name: 'auto-rename has lazy_load',
    success: hasLazyLoadFrontmatter('essentials', 'skills/auto-rename/SKILL.md')
  });

  results.push({
    name: 'shell has lazy_load',
    success: hasLazyLoadFrontmatter('essentials', 'skills/shell/SKILL.md')
  });

  results.push({
    name: 'scripts/install-aliases.js exists (cross-platform)',
    success: fileExists('essentials', 'scripts', 'install-aliases.js')
  });

  return results;
}

// Validate Core plugin
function validateCore() {
  logSection('Core Plugin v2.0.0');

  const results = validatePluginStructure('core');

  // Core-specific checks
  results.push({
    name: 'skills/template-loader.ts exists',
    success: fileExists('core', 'skills', 'template-loader.ts')
  });

  results.push({
    name: 'mcp/template-server.js exists',
    success: fileExists('core', 'mcp', 'template-server.js')
  });

  results.push({
    name: 'mcp/validation-server.js exists',
    success: fileExists('core', 'mcp', 'validation-server.js')
  });

  results.push({
    name: 'mcp/core-server.js exists',
    success: fileExists('core', 'mcp', 'core-server.js')
  });

  // Check all Node.js scripts exist (cross-platform)
  const nodeScripts = [
    'scripts/init-core.js',
    'scripts/validate-plugin.js',
    'scripts/detect-platform.js',
    'scripts/template-renderer.js'
  ];

  for (const script of nodeScripts) {
    const scriptName = script.split('/').pop();
    results.push({
      name: `${scriptName} exists (cross-platform)`,
      success: fileExists('core', script)
    });
  }

  // Check templates have lazy_load
  const templates = [
    'infrastructure/templates/command-header.md',
    'infrastructure/templates/warnings.md',
    'infrastructure/templates/metadata.md',
    'infrastructure/templates/plan-mode-first.md'
  ];

  for (const template of templates) {
    const templateName = template.split('/').pop();
    results.push({
      name: `${templateName} has lazy_load`,
      success: hasLazyLoadFrontmatter('core', template)
    });
  }

  return results;
}

// Test cross-platform script execution
function testCrossPlatformScripts() {
  logSection('Cross-Platform Script Tests');

  const results = [];
  const platform = getPlatform();

  logInfo(`Current platform: ${platform}`);

  // Test detect-platform.js
  const detectScript = join(SMITE_ROOT, 'plugins', 'core', 'scripts', 'detect-platform.js');
  if (existsSync(detectScript)) {
    const result = runCommand(`node "${detectScript}"`);
    results.push({
      name: 'detect-platform.js executes',
      success: result.success,
      details: result.success ? `Detected: ${result.output.trim()}` : result.error
    });

    // Verify output is valid JSON
    if (result.success) {
      try {
        const output = JSON.parse(result.output);
        results.push({
          name: 'detect-platform.js returns valid JSON',
          success: true,
          details: `platform: ${output.platform}, shell: ${output.shell}`
        });
      } catch {
        results.push({
          name: 'detect-platform.js returns valid JSON',
          success: false
        });
      }
    }
  }

  // Test template-renderer.js
  const templateScript = join(SMITE_ROOT, 'plugins', 'core', 'scripts', 'template-renderer.js');
  if (existsSync(templateScript)) {
    const result = runCommand(`node "${templateScript}" list`);
    results.push({
      name: 'template-renderer.js list executes',
      success: result.success,
      details: result.success ? `${result.output.split('\n').slice(0, 3).join('\n')}` : result.error
    });
  }

  return results;
}

// Test all plugins
function runAllTests() {
  log('', 'bright');
  log('╔═══════════════════════════════════════════════════╗', 'cyan');
  log('║   SMITE Cross-Platform Test Suite v2.5.0         ║', 'cyan');
  log('╚═══════════════════════════════════════════════════╝', 'cyan');

  const platform = getPlatform();
  log(`Platform: ${platform}`, 'yellow');
  log(`Node.js: ${process.version}`, 'yellow');
  log(`SMITE Root: ${SMITE_ROOT}`, 'yellow');

  const allResults = [];

  // Validate all plugins
  allResults.push(...validateStudio());
  allResults.push(...validateAgents());
  allResults.push(...validateEssentials());
  allResults.push(...validateCore());

  // Test cross-platform scripts
  allResults.push(...testCrossPlatformScripts());

  // Print summary
  logSection('Test Summary');

  const passed = allResults.filter(r => r.success).length;
  const failed = allResults.filter(r => !r.success).length;
  const total = allResults.length;

  for (const result of allResults) {
    logTest(result.name, result.success, result.details);
  }

  console.log('');
  log(`═══════════════════════════════════════════════════`, 'cyan');
  log(`Total: ${total} | Passed: ${passed} | Failed: ${failed}`, 'bright');
  log(`═══════════════════════════════════════════════════`, 'cyan');

  if (failed === 0) {
    log('', 'green');
    log('✓ All tests passed!', 'bright');
    log('✓ SMITE is ready for cross-platform deployment!', 'green');
    return 0;
  } else {
    log('', 'red');
    log(`✗ ${failed} test(s) failed`, 'bright');
    log('✗ Please fix the issues above before deployment', 'red');
    return 1;
  }
}

// Main entry point
const exitCode = runAllTests();
process.exit(exitCode);
