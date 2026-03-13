#!/usr/bin/env node
/**
 * SMITE Studio - Command Validation Hook (Cross-platform)
 * Validates bash commands before execution
 */

const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
};

// Read input from stdin
let input = '';
try {
  input = await readStdin();
} catch {
  input = '{}';
}

let command = '';
try {
  const data = JSON.parse(input || '{}');
  command = data.command || '';
} catch {
  // Invalid JSON
}

// Skip if no command
if (!command) {
  process.exit(0);
}

// Block dangerous patterns
const dangerous = ['rm -rf', 'dd if=', 'mkfs', 'format', '> \\.\\.'];
for (const pattern of dangerous) {
  const regex = new RegExp(pattern);
  if (regex.test(command)) {
    log(`[SMITE]🚫 Blocked dangerous command: ${command}`, colors.red);
    process.exit(2);
  }
}

// Warn about risky operations
const risky = ['git push', 'npm publish', 'docker push', 'rm '];
for (const pattern of risky) {
  const regex = new RegExp(pattern);
  if (regex.test(command)) {
    log(`[SMITE]⚠️  Risky operation: ${command}`, colors.yellow);
  }
}

process.exit(0);

/**
 * Read stdin asynchronously
 */
async function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

function log(msg, color = '') {
  process.stderr.write(`${color}${msg}${colors.reset}\n`);
}
