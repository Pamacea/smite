/**
 * Post-installation hook for @smite/refactor
 *
 * Creates configuration file and displays welcome message
 */

const fs = require('fs');
const path = require('path');

function getConfigPath() {
  return path.join(process.cwd(), '.claude/.smite/refactor.json');
}

function createConfig() {
  const configPath = getConfigPath();
  const configDir = path.dirname(configPath);

  // Create .claude/.smite/ directory if it doesn't exist
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  // Create default config if it doesn't exist
  if (!fs.existsSync(configPath)) {
    const defaultConfig = {
      defaults: {
        scope: "recent",
        riskThreshold: 30,
        complexityThreshold: 8,
        coverageTarget: 80,
        autoCommit: true
      },
      exclude: [
        "node_modules/**",
        "dist/**",
        ".claude/**",
        "build/**",
        "*.min.js",
        "*.map"
      ],
      patterns: {
        enabled: [
          "extract-method",
          "extract-class",
          "introduce-parameter-object",
          "replace-magic-numbers",
          "decompose-conditional",
          "move-method",
          "inline-method"
        ],
        severity: {
          high: ["extract-class", "decompose-conditional"],
          medium: ["extract-method", "introduce-parameter-object"],
          low: ["replace-magic-numbers", "inline-method", "move-method"]
        }
      },
      quickMode: {
        maxRisk: 30,
        maxComplexity: 8,
        minCoverage: 80,
        autoApply: true
      },
      output: {
        directory: ".claude/.smite",
        format: "markdown",
        timestamps: true
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
╔══════════════════════════════════════════════════════════╗
║      🎯 @smite/refactor - Unified Refactoring Agent   ║
╚══════════════════════════════════════════════════════════╝

🚀 Quick Start:

  # Quick refactoring (auto-fix low-risk items)
  /refactor --quick

  # Full refactoring workflow
  /refactor --full

  # Bug fixing
  /refactor --scope=bug "TypeError in auth"

📚 Documentation:

  - README: plugins/refactor/README.md
  - Skill: plugins/refactor/skills/refactor/SKILL.md
  - Guide: docs/REFACTOR_GUIDE.md

🔧 Configuration:

  Config: .claude/.smite/refactor.json

🔄 Migration:

  From agents/refactor → /refactor --full
  From ralph/refactor → /refactor --full
  From basics/debug → /refactor --scope=bug
  From predator/debug → /refactor --scope=bug

✨ Happy refactoring!
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
