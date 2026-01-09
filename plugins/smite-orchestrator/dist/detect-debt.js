#!/usr/bin/env node
"use strict";
/**
 * SMITE Orchestrator - Technical Debt Detector
 *
 * Fast pattern matching for technical debt detection.
 * Hook: PostToolUse (Write tool) - analyzes code after writes
 *
 * Usage:
 *   ts-node detect-debt.ts file <file_path> [project_dir]
 *   ts-node detect-debt.ts scan [dir] [project_dir]
 */
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o)
            if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectDebt = detectDebt;
exports.scanDirectory = scanDirectory;
exports.shouldAnalyze = shouldAnalyze;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const DEBT_PATTERNS = [
  {
    name: "any-type",
    pattern: /:\s*any\b/g,
    severity: "medium",
    message: 'Type "any" detected - reduces type safety',
    recommendation: "Use specific types or unknown",
  },
  {
    name: "ts-ignore",
    pattern: /@ts-ignore/g,
    severity: "high",
    message: "@ts-ignore comment detected - bypasses type checking",
    recommendation: "Fix the type error instead of ignoring it",
  },
  {
    name: "ts-expect-error",
    pattern: /@ts-expect-error/g,
    severity: "medium",
    message: "@ts-expect-error comment detected",
    recommendation: "Ensure this is truly necessary",
  },
  {
    name: "console-statement",
    pattern: /\bconsole\.(log|debug|info|warn|error)\(/g,
    severity: "low",
    message: "Console statement detected - should be removed in production",
    recommendation: "Use proper logging system or remove",
  },
  {
    name: "todo-comment",
    pattern: /\/\/\s*(TODO|FIXME|HACK|XXX)/gi,
    severity: "low",
    message: "TODO/FIXME comment detected - technical debt marker",
    recommendation: "Create issue or implement the fix",
  },
  {
    name: "debugger-statement",
    pattern: /\bdebugger;\b/g,
    severity: "medium",
    message: "Debugger statement detected - will pause execution",
    recommendation: "Remove before production",
  },
  {
    name: "any-async",
    pattern: /async\s*\(\s*\)\s*=>/g,
    severity: "low",
    message: "Async function without explicit return type",
    recommendation: "Add return type annotation",
  },
  {
    name: "empty-interface",
    pattern: /interface\s+\w+\s*{}/g,
    severity: "medium",
    message: "Empty interface detected",
    recommendation: "Remove or add properties",
  },
  {
    name: "hardcoded-string",
    pattern: /==\s*["'][\w]+["']|===\s*["'][\w]+["']/g,
    severity: "low",
    message: "Possible hardcoded string comparison",
    recommendation: "Use enums or constants",
  },
];
// File extensions to analyze
const ANALYZE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".vue", ".svelte"];
/**
 * Check if file should be analyzed
 */
function shouldAnalyze(filePath) {
  return ANALYZE_EXTENSIONS.some((ext) => filePath.endsWith(ext));
}
/**
 * Detect technical debt in file
 */
function detectDebt(filePath, projectDir = process.cwd()) {
  try {
    // Skip if not code file
    if (!shouldAnalyze(filePath)) {
      return {
        analyzed: false,
        reason: "Not a code file",
      };
    }
    // Read file content
    const fullPath = path.join(projectDir, filePath);
    if (!fs.existsSync(fullPath)) {
      return {
        analyzed: false,
        reason: "File does not exist",
      };
    }
    const content = fs.readFileSync(fullPath, "utf-8");
    const lines = content.split("\n");
    const issues = [];
    // Check each pattern
    DEBT_PATTERNS.forEach((pattern) => {
      const matches = content.match(pattern.pattern);
      if (matches) {
        // Find line numbers for each match
        lines.forEach((line, index) => {
          const lineMatch = line.match(pattern.pattern);
          if (lineMatch) {
            issues.push({
              type: pattern.name,
              severity: pattern.severity,
              message: pattern.message,
              recommendation: pattern.recommendation,
              line: index + 1,
              column: line.search(pattern.pattern) + 1,
              code: line.trim(),
            });
          }
        });
      }
    });
    if (issues.length === 0) {
      return {
        analyzed: true,
        issues: [],
        issues_found: 0,
      };
    }
    // Create suggestion file if issues found
    if (issues.length > 0) {
      createDebtSuggestion(filePath, issues, projectDir);
    }
    return {
      analyzed: true,
      issues_found: issues.length,
      issues: issues,
      file: filePath,
      summary: generateSummary(issues),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      analyzed: false,
      error: message,
    };
  }
}
/**
 * Generate summary of issues
 */
function generateSummary(issues) {
  const bySeverity = {
    high: issues.filter((i) => i.severity === "high").length,
    medium: issues.filter((i) => i.severity === "medium").length,
    low: issues.filter((i) => i.severity === "low").length,
  };
  const byType = {};
  issues.forEach((issue) => {
    if (!byType[issue.type]) {
      byType[issue.type] = 0;
    }
    byType[issue.type]++;
  });
  return {
    bySeverity,
    byType,
  };
}
/**
 * Create technical debt suggestion file
 */
function createDebtSuggestion(filePath, issues, projectDir) {
  const suggestionsDir = path.join(projectDir, ".smite", "suggestions");
  // Create directory if it doesn't exist
  if (!fs.existsSync(suggestionsDir)) {
    fs.mkdirSync(suggestionsDir, { recursive: true });
  }
  const suggestionPath = path.join(suggestionsDir, "fix-surgeon.md");
  const highIssues = issues.filter((i) => i.severity === "high");
  const mediumIssues = issues.filter((i) => i.severity === "medium");
  let content = `# ⚠️ TECHNICAL DEBT DETECTED

**File**: \`${filePath}\`
**Generated**: ${new Date().toISOString()}
**Issues Found**: ${issues.length}

---

## 🚨 High Severity (${highIssues.length})

`;
  if (highIssues.length > 0) {
    highIssues.forEach((issue) => {
      content += `
### ${issue.type} (Line ${issue.line})

**Issue**: ${issue.message}

**Code**:
\`\`\`
${issue.code}
\`\`\`

**Recommendation**: ${issue.recommendation}

`;
    });
  } else {
    content += "\n*No high severity issues*\n\n";
  }
  content += `---

## ⚠️ Medium Severity (${mediumIssues.length})

`;
  if (mediumIssues.length > 0) {
    mediumIssues.forEach((issue) => {
      content += `- **${issue.type}** (Line ${issue.line}): ${issue.message}\n`;
    });
  } else {
    content += "\n*No medium severity issues*\n\n";
  }
  content += `---

## 🚀 Recommended Action

\`\`\`
/smite:surgeon --mode=refactor --target="${filePath}"
\`\`\`

This will launch the Surgeon agent to fix the detected technical debt.

---

## 📊 Summary

- **High**: ${issues.filter((i) => i.severity === "high").length}
- **Medium**: ${issues.filter((i) => i.severity === "medium").length}
- **Low**: ${issues.filter((i) => i.severity === "low").length}

---

*Suggestion generated by SMITE Orchestrator - Technical Debt Detector*
`;
  fs.writeFileSync(suggestionPath, content, "utf-8");
}
/**
 * Scan directory for technical debt
 */
function scanDirectory(dir = process.cwd()) {
  const results = {
    files_scanned: 0,
    files_with_issues: 0,
    total_issues: 0,
    issues_by_file: {},
  };
  function scanDir(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    entries.forEach((entry) => {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        // Skip node_modules and .git
        if (
          entry.name !== "node_modules" &&
          entry.name !== ".git" &&
          !entry.name.startsWith(".")
        ) {
          scanDir(fullPath);
        }
      } else if (entry.isFile()) {
        const relativePath = path.relative(dir, fullPath);
        if (shouldAnalyze(relativePath)) {
          results.files_scanned++;
          const detection = detectDebt(relativePath, dir);
          if (
            detection.analyzed &&
            detection.issues_found &&
            detection.issues_found > 0
          ) {
            results.files_with_issues++;
            results.total_issues += detection.issues_found;
            results.issues_by_file[relativePath] = detection;
          }
        }
      }
    });
  }
  scanDir(dir);
  return results;
}
/**
 * CLI interface
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const target = args[1];
  const projectDir = args[2] || process.cwd();
  if (command === "scan") {
    const scanDir = target || projectDir;
    const results = scanDirectory(scanDir);
    console.log(JSON.stringify(results, null, 2));
  } else if (command === "file") {
    if (!target) {
      console.error(
        "Usage: ts-node detect-debt.ts file <file_path> [project_dir]",
      );
      process.exit(1);
    }
    const result = detectDebt(target, projectDir);
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`
SMITE Orchestrator - Technical Debt Detector

Usage:
  ts-node detect-debt.ts file <file_path> [project_dir]   Analyze single file
  ts-node detect-debt.ts scan [dir] [project_dir]         Scan directory

Supported file types: ${ANALYZE_EXTENSIONS.join(", ")}
    `);
  }
}
// Run if called directly
if (require.main === module) {
  main();
}
//# sourceMappingURL=detect-debt.js.map
