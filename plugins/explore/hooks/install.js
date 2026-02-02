/**
 * Post-installation hook for @smite/explore
 *
 * Creates configuration file and displays welcome message
 */

const fs = require('fs');
const path = require('path');

/**
 * Validate and sanitize path to prevent directory traversal
 */
function validatePath(inputPath) {
  const normalized = path.normalize(inputPath);
  const resolved = path.resolve(normalized);

  // Ensure path doesn't escape current working directory
  const cwd = process.cwd();
  if (!resolved.startsWith(cwd)) {
    throw new Error(`Path traversal detected: ${inputPath}`);
  }

  return resolved;
}

function getConfigPath() {
  const configPath = path.join(process.cwd(), '.claude/.smite/explore.json');
  return validatePath(configPath);
}

function createConfig() {
  const configPath = getConfigPath();
  const configDir = validatePath(path.dirname(configPath));

  // Create .claude/.smite/ directory if it doesn't exist
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true, mode: 0o755 });
  }

  // Create default config if it doesn't exist
  if (!fs.existsSync(configPath)) {
    const defaultConfig = {
      defaults: {
        mode: 'deep',
        depth: 'medium',
        output: 'files',
        format: 'markdown'
      },
      grepai: {
        enabled: true,
        limit: 20,
        ranking: true,
        optimize: true,
        hybrid: true
      },
      exclude: [
        'node_modules/**',
        'dist/**',
        '.claude/**',
        'build/**',
        '*.min.js',
        '*.map',
        '.git/**'
      ],
      output: {
        directory: '.claude/.smite',
        format: 'markdown',
        timestamps: true
      },
      modes: {
        deep: {
          description: 'Deep exploration with multi-source research',
          output: 'file',
          time: '10-30 min',
          steps: ['search', 'analyze', 'summarize']
        },
        quick: {
          description: 'Fast, targeted search',
          output: 'terminal',
          time: '1-5 min',
          steps: ['search', 'filter', 'output']
        },
        pattern: {
          description: 'Find code patterns',
          output: 'file',
          time: '5-15 min',
          steps: ['search', 'identify', 'document']
        },
        impact: {
          description: 'Impact analysis before changes',
          output: 'file',
          time: '5-15 min',
          steps: ['analyze', 'map', 'report']
        },
        semantic: {
          description: 'Native semantic search via grepai',
          output: 'terminal',
          time: '1-5 min',
          steps: ['search', 'rank', 'extract']
        }
      },
      flags: {
        type: {
          options: ['architecture', 'code', 'patterns', 'tests'],
          description: 'Type of exploration'
        },
        depth: {
          options: ['shallow', 'medium', 'deep'],
          description: 'Depth of exploration'
        },
        output: {
          options: ['files', 'summary', 'details', 'tree'],
          description: 'Output format'
        },
        format: {
          options: ['markdown', 'json', 'tree'],
          description: 'Output format'
        },
        grepai: {
          options: ['optimize', 'hybrid', 'ranking', 'limit'],
          description: 'Grepai optimization flags'
        }
      }
    };

    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    console.log('✅ Created config:', configPath);
  } else {
    console.log('ℹ️  Config already exists:', configPath);
  }
}

function displayWelcome() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║      🎯 @smite/explore - Unified Exploration Agent   ║
╚═══════════════════════════════════════════════════════════╝

🚀 Quick Start:

  # Deep exploration
  /explore --mode=deep "How does the payment system work?"

  # Quick search
  /explore --mode=quick "Authentication components"

  # Pattern search
  /explore --mode=pattern "Repository pattern"

  # Semantic search (native grepai)
  /explore --mode=semantic "How to implement JWT refresh?"

  # Impact analysis
  /explore --mode=impact src/auth/jwt.ts

📚 Documentation:

  - README: plugins/explore/README.md
  - Skill: plugins/explore/skills/explore/SKILL.md
  - Guide: docs/EXPLORE_GUIDE.md
  - Grepai: https://grepai.app/

🔧 Configuration:

  Config: .claude/.smite/explore.json
  Grepai API Key: MXBAI_API_KEY (required for semantic search)

🎯 Modes:

  --mode=deep    : Deep exploration with multi-source research
  --mode=quick   : Fast, targeted search
  --mode=pattern  : Find code patterns
  --mode=impact   : Impact analysis before changes
  --mode=semantic : Native semantic search via grepai

🎯 Flags:

  --type=architecture|code|patterns|tests : Type of exploration
  --depth=shallow|medium|deep            : Depth of exploration
  --output=files|summary|details|tree    : Output format
  --format=markdown|json|tree            : Output format
  --optimize|hybrid|ranking|limit=N       : Grepai optimization

📊 Examples:

  # Deep exploration
  /explore --mode=deep "How does the payment system work?"

  # Quick search with type
  /explore --mode=quick --type=code "JWT token logic"

  # Pattern search with output
  /explore --mode=pattern --output=tree "Factory pattern"

  # Semantic search with optimization
  /explore --mode=semantic --optimize "Payment processing logic"

  # Impact analysis with format
  /explore --mode=impact --format=tree src/services/payment/

🔄 Migration:

  From basics/explore → /explore --mode=deep
  From toolkit/explore → /explore --mode=quick
  From toolkit/search → /explore --mode=semantic --hybrid
  From toolkit/graph → /explore --mode=impact
  From builder/explore → /explore --type=code
  From ralph/analyze → /explore --output=summary

✨ Happy exploring!
  `);
}

function main() {
  try {
    createConfig();
    displayWelcome();
  } catch (error) {
    console.error('❌ Installation failed:', error.message);
    process.exit(1);
  }
}

main();
