#!/usr/bin/env node
/**
 * SMITE Core - Validate Plugin
 *
 * Validates SMITE plugin structure and configuration.
 * Checks plugin.json, skills, hooks, and documentation.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  pluginName?: string;
  pluginVersion?: string;
}

function validatePlugin(pluginPath: string): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: []
  };

  // Check plugin.json exists
  const pluginJsonPath = join(pluginPath, '.claude-plugin/plugin.json');
  if (!existsSync(pluginJsonPath)) {
    result.errors.push('Missing .claude-plugin/plugin.json');
    result.valid = false;
    return result;
  }

  // Parse and validate plugin.json
  try {
    const pluginJson = JSON.parse(readFileSync(pluginJsonPath, 'utf8'));
    result.pluginName = pluginJson.name;
    result.pluginVersion = pluginJson.version;

    // Required fields
    if (!pluginJson.name) {
      result.errors.push('Missing required field: name');
      result.valid = false;
    }
    if (!pluginJson.version) {
      result.errors.push('Missing required field: version');
      result.valid = false;
    }

    // Validate version format (semver)
    if (pluginJson.version && !/^\d+\.\d+\.\d+/.test(pluginJson.version)) {
      result.warnings.push(`Version should follow semver: ${pluginJson.version}`);
    }
  } catch (error) {
    result.errors.push(`Invalid plugin.json: ${error}`);
    result.valid = false;
  }

  // Check for README.md
  if (!existsSync(join(pluginPath, 'README.md'))) {
    result.warnings.push('Missing README.md');
  }

  // Check for skills directory
  const skillsPath = join(pluginPath, 'skills');
  if (existsSync(skillsPath)) {
    validateSkills(skillsPath, result);
  }

  // Check for hooks directory
  const hooksPath = join(pluginPath, 'hooks');
  if (existsSync(hooksPath)) {
    validateHooks(hooksPath, result);
  }

  return result;
}

function validateSkills(skillsPath: string, result: ValidationResult): void {
  try {
    const files = readdirSync(skillsPath);
    let hasSkillMd = false;
    let hasLazyLoad = true; // Assume good until proven bad

    for (const file of files) {
      if (file.endsWith('SKILL.md')) {
        hasSkillMd = true;
        const content = readFileSync(join(skillsPath, file), 'utf8');

        // Check for lazy_load in frontmatter
        if (!content.includes('lazy_load:')) {
          hasLazyLoad = false;
        }
      }
    }

    if (!hasSkillMd) {
      result.warnings.push('No SKILL.md files found in skills/');
    }

    if (!hasLazyLoad) {
      result.warnings.push('Some skills are missing lazy_load frontmatter');
    }
  } catch (error) {
    result.errors.push(`Error validating skills: ${error}`);
    result.valid = false;
  }
}

function validateHooks(hooksPath: string, result: ValidationResult): void {
  const hooksJsonPath = join(hooksPath, 'hooks.json');

  if (existsSync(hooksJsonPath)) {
    try {
      const hooksJson = JSON.parse(readFileSync(hooksJsonPath, 'utf8'));

      // Validate structure
      if (!hooksJson.hooks || typeof hooksJson.hooks !== 'object') {
        result.errors.push('Invalid hooks.json: missing "hooks" object');
        result.valid = false;
      }
    } catch (error) {
      result.errors.push(`Invalid hooks.json: ${error}`);
      result.valid = false;
    }
  } else {
    result.warnings.push('No hooks.json found');
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const pluginPath = process.argv[2] || '.';

  if (pluginPath === '--help' || pluginPath === '-h') {
    console.log(`
Usage: node validate-plugin.js [plugin-path]

Validates SMITE plugin structure and configuration.

Arguments:
  plugin-path    Path to plugin directory (default: .)

Exit codes:
  0              Validation passed
  1              Validation failed

Examples:
  node validate-plugin.js ../studio
  node validate-plugin.js .
    `);
    process.exit(0);
  }

  const result = validatePlugin(pluginPath);

  console.log(`\n📋 Validation Results for: ${result.pluginName || 'Unknown'}`);
  console.log('='.repeat(40));

  if (result.valid) {
    console.log('✅ Plugin is VALID\n');
  } else {
    console.log('❌ Plugin is INVALID\n');
  }

  if (result.errors.length > 0) {
    console.log('\n❌ Errors:');
    result.errors.forEach(err => console.log(`  - ${err}`));
  }

  if (result.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    result.warnings.forEach(warn => console.log(`  - ${warn}`));
  }

  process.exit(result.valid ? 0 : 1);
}

export { validatePlugin, ValidationResult };
