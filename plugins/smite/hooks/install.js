#!/usr/bin/env node

/**
 * PostPluginInstall hook for commands@smite
 *
 * Copies essential command files to ~/.claude/commands/
 * without overwriting existing commands.
 */

const fs = require('fs');
const path = require('path');

const commands = [
  'oneshot.md',
  'explore.md',
  'debug.md',
  'commit.md',
  'epct.md',
  'smite.md'
];

function installCommands() {
  const pluginDir = path.dirname(__dirname);
  const commandsDir = path.join(pluginDir, 'commands');
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  const targetDir = path.join(homeDir, '.claude', 'commands');

  // Ensure target directory exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  let installed = 0;
  let skipped = 0;

  commands.forEach(file => {
    const source = path.join(commandsDir, file);
    const target = path.join(targetDir, file);

    // Skip if already exists
    if (fs.existsSync(target)) {
      skipped++;
      return;
    }

    // Copy command file
    fs.copyFileSync(source, target);
    installed++;
  });

  console.log(`✅ Commands installed: ${installed}`);
  if (skipped > 0) {
    console.log(`⏭️  Skipped existing: ${skipped}`);
  }
  console.log('');
  console.log('Available commands:');
  commands.forEach(file => {
    const name = file.replace('.md', '');
    console.log(`  /${name}`);
  });
}

installCommands();
