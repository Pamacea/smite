#!/usr/bin/env node

/**
 * SMITE Toolkit - Install Hook Script
 *
 * This script copies shell hooks to the ~/.claude/plugins/ directory
 * during npm install. These hooks track token usage and provide
 * session-level automation.
 */

const fs = require('fs');
const path = require('path');

// Determine home directory (Windows vs Unix)
const homeDir = process.env.USERPROFILE || process.env.HOME;
const targetDir = path.join(homeDir, '.claude', 'plugins');

// Hooks to copy
const hooks = [
  'toolkit-init-hook.js',
  'toolkit-stats-hook.js',
  'toolkit-save-hook.js',
  'toolkit-index-hook.js',
  'toolkit-deps-hook.js',
  'toolkit-enforcer-hook.js'
];

console.log('🔧 Installing SMITE Toolkit hooks...');

// Create target directory if it doesn't exist
try {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`✅ Created directory: ${targetDir}`);
} catch (error) {
  console.error(`❌ Failed to create directory: ${error.message}`);
  process.exit(1);
}

// Copy each hook
let copied = 0;
hooks.forEach(hook => {
  const sourcePath = path.join(__dirname, 'hooks', hook);
  const targetPath = path.join(targetDir, hook);

  try {
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ Copied: ${hook}`);
      copied++;
    } else {
      console.warn(`⚠️  Source not found: ${hook}`);
    }
  } catch (error) {
    console.error(`❌ Failed to copy ${hook}: ${error.message}`);
  }
});

console.log(`\n✅ Installation complete: ${copied}/${hooks.length} hooks installed`);
console.log(`📁 Target directory: ${targetDir}`);
