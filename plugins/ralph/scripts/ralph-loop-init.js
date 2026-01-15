#!/usr/bin/env node

// SMITE Ralph - Loop Initialization Script
// Creates the Ralph Loop state file with PRD generation

const { setupRalphLoop } = require('../dist/loop-setup');

// Parse command line arguments
const args = process.argv.slice(2);
let prompt = '';
let maxIterations = 50;
let completionPromise = 'COMPLETE';

for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  if (arg === '--max-iterations' && args[i + 1]) {
    maxIterations = parseInt(args[++i], 10);
  } else if (arg === '--completion-promise' && args[i + 1]) {
    completionPromise = args[++i];
  } else if (!arg.startsWith('--')) {
    prompt += (prompt ? ' ' : '') + arg;
  }
}

// Validate prompt
if (!prompt) {
  console.error('Error: No prompt provided');
  console.error('Usage: node scripts/ralph-loop-init.js "<prompt>" [--max-iterations <n>] [--completion-promise <text>]');
  process.exit(1);
}

// Setup the loop
const result = setupRalphLoop(prompt, {
  maxIterations,
  completionPromise
});

if (result.success) {
  console.log('✅ Ralph Loop initialized successfully');
  console.log('📁 Loop file:', result.loopFilePath);
  console.log('');
  console.log('📊 Configuration:');
  console.log(`   Max iterations: ${maxIterations}`);
  console.log(`   Completion promise: ${completionPromise}`);
  console.log('');
  console.log('🔄 Starting loop...');
  console.log('');
  console.log('To complete the loop, output:');
  console.log(`<promise>${completionPromise}</promise>`);
  console.log('');

  // Read and output the loop file content
  const fs = require('fs');
  if (fs.existsSync(result.loopFilePath)) {
    console.log('='.repeat(80));
    console.log('LOOP FILE CONTENT:');
    console.log('='.repeat(80));
    console.log(fs.readFileSync(result.loopFilePath, 'utf-8'));
    console.log('='.repeat(80));
  }

  process.exit(0);
} else {
  console.error('❌ Failed to setup loop:', result.error);
  process.exit(1);
}
