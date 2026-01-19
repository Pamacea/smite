# Code Critiquer Hook Architecture
## Smite Quality Gate System

**Version**: 1.0.0
**Author**: Architect Agent
**Date**: 2025-01-19
**Status**: Design Phase

---

## 1. Executive Summary

The Code Critiquer Hook is a "Quality Gate" system that intercepts code changes before they are committed or completed, performing automated analysis for complexity, semantic consistency, and security issues. It implements a feedback loop where rejected code is re-injected into the executor context with specific correction instructions.

### Key Features
- **Pre-completion validation** via `PreToolUse` hook
- **Multi-dimensional analysis**: complexity, semantic, security
- **Automatic retry with context-aware feedback**
- **Multi-model consensus option (e.g., Claude Sonnet critiquing GLM 4.7)**
- **Test execution integration via MCP**
- **Extensible validation criteria catalog**

---

## 2. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Claude Code                              │
│                    (Executor Context)                            │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              │ Tool Use (Write/Edit)
                              ▼
                    ┌─────────────────┐
                    │  PreToolUse     │
                    │    Hook         │
                    └────────┬─────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
    ┌──────────────────┐         ┌──────────────────┐
    │  Judge Hook      │         │  Bypass Logic    │
    │  (Validator)     │         │  (Test files,    │
    │                  │         │   Config, etc.)  │
    └────────┬─────────┘         └──────────────────┘
             │
             │ Analysis Pipeline
             ▼
    ┌──────────────────────────────────────┐
    │     Multi-Dimensional Analysis       │
    └──────────────────────────────────────┘
             │
    ┌────────┼────────┬──────────────┐
    ▼        ▼        ▼              ▼
┌────────┐ ┌──────┐ ┌──────┐  ┌──────────┐
│Complexity│ │Semantic│ │Security│ │Test MCP │
│Analyzer │ │Checker │ │Scanner │ │Runner   │
└────────┘ └──────┘ └──────┘  └──────────┘
             │
             ▼
    ┌──────────────────────────────────────┐
    │     Consensus Engine (Optional)      │
    │  Multi-model validation (e.g.,       │
    │  Claude Sonnet vs GLM 4.7)          │
    └──────────────────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────────┐
    │     Decision Engine                  │
    │  (Aggregate scores, apply rules)     │
    └────────┬─────────────────────────────┘
             │
        ┌────┴────┐
        │         │
        ▼         ▼
   [ACCEPT]   [REJECT]
        │         │
        │         └──────────────┐
        │                        │
        │                        ▼
        │              ┌─────────────────────┐
        │              │  Feedback Generator │
        │              │  (Context capture,  │
        │              │   Correction prompt)│
        │              └─────────┬───────────┘
        │                        │
        │                        ▼
        │              ┌─────────────────────┐
        │              │  Context Re-injector│
        │              │  (Update system msg)│
        │              └─────────┬───────────┘
        │                        │
        │                        ▼
        │              ┌─────────────────────┐
        │              │  Retry Counter      │
        │              │  (Limit attempts)   │
        │              └─────────────────────┘
        │
        ▼
   [CONTINUE]
        │
        ▼
   Code Written
```

---

## 3. Hook Integration Points

### 3.1 Primary Hook: PreToolUse

**Justification**: Using `PreToolUse` allows blocking problematic code *before* it's written to disk, preventing:
- File system pollution with low-quality code
- Need for cleanup/revert operations
- Test suite execution on known-bad code
- Wasted computational resources

**Hook Configuration**:
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/judge-hook.js",
            "timeout": 30,
            "description": "Code quality gate - validates complexity, semantics, and security"
          }
        ]
      }
    ]
  }
}
```

**Input Data** (from Claude Code via stdin):
```typescript
{
  session_id: string;
  transcript_path: string;
  cwd: string;
  hook_event_name: "PreToolUse";
  tool_name: "Write" | "Edit" | "MultiEdit";
  tool_input: {
    file_path: string;
    content?: string;  // For Write
    old_string?: string;  // For Edit
    new_string?: string;  // For Edit
  }
}
```

**Output Decision** (via JSON to stdout):
```typescript
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny" | "allow" | "ask",
    "permissionDecisionReason": string  // Explanation for Claude
  }
}
```

### 3.2 Secondary Hook: PostToolUse (Optional)

**Use Case**: Run expensive tests *after* code is written but before user continues
- Full test suite execution
- Integration tests
- End-to-end tests
- Performance benchmarks

**Trigger**: Only when `PreToolUse` validation passes (optional via config)

---

## 4. Feedback Loop Mechanism

### 4.1 Context Capture Protocol

When validation fails, the hook must capture:

1. **Executor Context**:
   - Current prompt/task description
   - File path being modified
   - Original code (if editing)
   - Proposed code changes

2. **Validation Results**:
   - Specific issues found (line numbers, rule violations)
   - Severity levels (critical, error, warning)
   - Suggested fixes

3. **Session State**:
   - Retry count (to prevent infinite loops)
   - Previous failures (to avoid repeating same mistakes)
   - Learning context (what the AI has already tried)

### 4.2 Correction Prompt Template

```typescript
interface CorrectionPrompt {
  systemMessage: string;
  userContext: string;
  validationFeedback: ValidationFeedback;
  retryCount: number;
  maxRetries: number;
}

interface ValidationFeedback {
  summary: string;
  issues: ValidationIssue[];
  suggestions: string[];
}

interface ValidationIssue {
  type: 'complexity' | 'semantic' | 'security' | 'test';
  severity: 'critical' | 'error' | 'warning';
  location?: {
    file: string;
    line: number;
    column: number;
  };
  message: string;
  rule: string;
  suggestion?: string;
}
```

**Generated Prompt Example**:
```
🛑 CODE QUALITY GATE - VALIDATION FAILED

Your recent code change has been blocked due to quality issues.

## Summary
- Complexity: 2 functions exceed threshold (cyclomatic complexity > 10)
- Security: 1 potential SQL injection vulnerability detected
- Tests: 3 tests failing

## Critical Issues

1. SQL Injection Risk (CRITICAL)
   File: src/api/users.ts:45
   Issue: User input directly concatenated into SQL query
   Rule: security-no-sql-injection
   Fix: Use parameterized queries or ORM

   const query = `SELECT * FROM users WHERE id = ${userId}`;  // ❌
   // Should be:
   const query = 'SELECT * FROM users WHERE id = $1';  // ✅
   const result = await db.query(query, [userId]);

2. High Complexity (ERROR)
   File: src/utils/validation.ts:78
   Issue: Function 'validateUserInput' has cyclomatic complexity of 15 (threshold: 10)
   Rule: complexity-max-complexity
   Fix: Extract nested logic into separate functions

## Suggestions
1. Use parameterized queries for all database operations
2. Break down validateUserInput into smaller functions:
   - validateEmail()
   - validatePhone()
   - validateAddress()
3. Run tests after each function extraction

## Context
- Attempt: 1/3
- Original task: "Add user authentication endpoint"
- Previous attempts: None

Please revise your code to address these issues.
```

### 4.3 Re-injection Protocol

The hook updates Claude's context via:

1. **System Message Injection** (via `permissionDecisionReason`):
   ```javascript
   output = {
     hookSpecificOutput: {
       hookEventName: "PreToolUse",
       permissionDecision: "deny",
       permissionDecisionReason: correctionPrompt  // Rich feedback
     }
   };
   ```

2. **Session State Persistence**:
   ```javascript
   // Save retry state to file
   const retryState = {
     sessionId: input.session_id,
     retryCount: currentRetry + 1,
     lastFailure: Date.now(),
     issuesDetected: validationResults.issues
   };

   fs.writeFileSync(
     path.join(process.cwd(), '.claude', '.smite', 'judge-retry-state.json'),
     JSON.stringify(retryState, null, 2)
   );
   ```

### 4.4 Retry Management

```typescript
interface RetryState {
  sessionId: string;
  retryCount: number;
  maxRetries: number;
  lastFailureTimestamp: number;
  issuesDetected: ValidationIssue[];
  previousAttempts: CodeChangeAttempt[];
}

interface CodeChangeAttempt {
  timestamp: number;
  filePath: string;
  content: string;
  validationResults: ValidationResults;
}

// Retry logic
if (retryState.retryCount >= retryState.maxRetries) {
  // Allow code to proceed with warning
  return {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "allow",  // Give up
      permissionDecisionReason: "⚠️ Maximum validation retries reached. Proceeding with potential quality issues."
    }
  };
}
```

**Configuration**:
```json
{
  "judge": {
    "maxRetries": 3,
    "retryDelayMs": 1000,
    "escalateOnMaxRetries": true
  }
}
```

---

## 5. Validation Criteria Catalog

### 5.1 Complexity Analysis

**Metrics**:
```typescript
interface ComplexityMetrics {
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  nestingDepth: number;
  functionLength: number;
  parameterCount: number;
}

interface ComplexityThresholds {
  maxCyclomaticComplexity: number;  // Default: 10
  maxCognitiveComplexity: number;   // Default: 15
  maxNestingDepth: number;           // Default: 4
  maxFunctionLength: number;         // Default: 50 lines
  maxParameterCount: number;         // Default: 5
}
```

**Rules**:
1. **Cyclomatic Complexity ≥ 10** (Error)
   - Rationale: Functions with high complexity are harder to test and maintain
   - Source: [Understanding Abstract Syntax Trees](https://gravitycloud.ai/blog/abstract-syntax-tree)

2. **Cognitive Complexity ≥ 15** (Error)
   - Rationale: Measures how difficult code is to understand for humans
   - Source: [Genese Cpx Framework](https://github.com/geneseframework/complexity)

3. **Nesting Depth ≥ 4** (Warning)
   - Rationale: Deeply nested code is harder to read

4. **Function Length > 50 lines** (Warning)
   - Rationale: Long functions often do too much

5. **Parameter Count > 5** (Warning)
   - Rationale: Too many parameters indicate need for object parameter

### 5.2 Semantic Consistency

**Checks**:
```typescript
interface SemanticCheck {
  type: 'api-contract' | 'type-consistency' | 'naming' | 'duplicate-code';
  description: string;
  severity: 'error' | 'warning';
}

// Example checks
const semanticChecks = [
  {
    type: 'api-contract',
    description: 'API signature change detected - verify all callers updated',
    severity: 'error',
    check: async (oldCode, newCode) => {
      // Detect function signature changes
      // Search for callers in codebase
      // Verify if callers match new signature
    }
  },
  {
    type: 'type-consistency',
    description: 'Type mismatch detected - annotation says "string" but usage suggests number',
    severity: 'error',
    check: async (code, ast) => {
      // Analyze type annotations vs actual usage
    }
  },
  {
    type: 'naming',
    description: 'Function name violates convention (should be camelCase)',
    severity: 'warning',
    check: async (name) => {
      // Check naming conventions
    }
  },
  {
    type: 'duplicate-code',
    description: 'Code appears duplicated in 3 other files',
    severity: 'warning',
    check: async (code, codebase) => {
      // Use semantic similarity to find duplicates
      // Leverage existing SemanticAnalysisAPI
    }
  }
];
```

**Implementation Strategy**:
- Leverage existing `SemanticAnalysisAPI` from toolkit
- Use AST diffing for API contract changes
- Integrate with code search (mgrep) for caller verification

### 5.3 Security Scanning

**Patterns**:
```typescript
interface SecurityRule {
  id: string;
  name: string;
  category: 'injection' | 'xss' | 'crypto' | 'auth' | 'data-exposure';
  severity: 'critical' | 'error';
  pattern: RegExp | ASTPattern;
  message: string;
  fix: string;
  cwe?: string;  // CWE identifier
  owasp?: string;  // OWASP category
}

const securityRules: SecurityRule[] = [
  {
    id: 'sql-injection',
    name: 'SQL Injection',
    category: 'injection',
    severity: 'critical',
    pattern: /(?:query|execute)\s*\(\s*[`'"]\s*\$\s*{/,
    message: 'Potential SQL injection - user input directly concatenated',
    fix: 'Use parameterized queries or prepared statements',
    cwe: 'CWE-89',
    owasp: 'A01:2021 – Broken Access Control'
  },
  {
    id: 'xss-vulnerability',
    name: 'Cross-Site Scripting (XSS)',
    category: 'xss',
    severity: 'critical',
    pattern: /innerHTML\s*=\s*|dangerouslySetInnerHTML/,
    message: 'XSS vulnerability - unsanitized input rendered to DOM',
    fix: 'Use textContent or sanitize with DOMPurify',
    cwe: 'CWE-79',
    owasp: 'A03:2021 – Injection'
  },
  {
    id: 'weak-crypto',
    name: 'Weak Cryptographic Algorithm',
    category: 'crypto',
    severity: 'error',
    pattern: /createCipher\s*\(|md5\s*\(|sha1\s*\(/,
    message: 'Weak cryptographic algorithm detected',
    fix: 'Use authenticated encryption (AES-256-GCM) and SHA-256+',
    cwe: 'CWE-327',
    owasp: 'A02:2021 – Cryptographic Failures'
  },
  {
    id: 'hardcoded-secret',
    name: 'Hardcoded Secret',
    category: 'data-exposure',
    severity: 'critical',
    pattern: /(?:password|secret|key|token)\s*[=:]\s*['"`](?!<).*['"`]/,
    message: 'Potential hardcoded secret in source code',
    fix: 'Use environment variables or secret management',
    cwe: 'CWE-798',
    owasp: 'A07:2021 – Identification and Authentication Failures'
  }
];
```

**Sources**:
- [20 Static Analysis Tools Every TypeScript Team Needs](https://www.in-com.com/blog/20-powerful-static-analysis-tools-every-typescript-team-needs/)
- [Comprehensive Framework for Secure Code Review in TypeScript](https://medium.com/@greglusk/a-comprehensive-framework-for-secure-code-review-in-go-and-typescript-7aa7afd0adaa)
- OWASP Top 10 2021

### 5.4 Test Execution

**Integration via MCP**:
```typescript
interface TestExecutionConfig {
  enabled: boolean;
  frameworks: ('jest' | 'vitest' | 'pytest' | 'mocha')[];
  command?: string;  // Custom test command
  timeoutMs: number;
  failOnError: boolean;
}

interface TestResults {
  framework: string;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  failures: TestFailure[];
}

interface TestFailure {
  testFile: string;
  testName: string;
  error: string;
  stack?: string;
}
```

**MCP Tool Design**:
```typescript
// MCP Server: test-runner
{
  name: 'test-runner',
  tools: [
    {
      name: 'run_tests',
      description: 'Run test suite and return results',
      inputSchema: {
        type: 'object',
        properties: {
          framework: { type: 'string', enum: ['jest', 'vitest', 'pytest', 'mocha'] },
          pattern: { type: 'string', description: 'File pattern to match' },
          timeout: { type: 'number' }
        }
      }
    }
  ]
}
```

**Hook Integration**:
```javascript
// In judge-hook.js
if (config.tests.enabled) {
  const testResults = await runTestsViaMCP(config.tests);

  if (testResults.failed > 0) {
    validationResults.issues.push({
      type: 'test',
      severity: 'error',
      message: `${testResults.failed} tests failing`,
      details: testResults.failures.slice(0, 3)  // First 3 failures
    });
  }
}
```

---

## 6. Multi-Model Consensus Architecture

### 6.1 Design Overview

The consensus system allows using multiple AI models to cross-validate code quality, increasing confidence in validation decisions.

```
┌─────────────────────────────────────────────────────────┐
│                   Code Change                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Primary Validator   │
          │  (GLM 4.7 - Default) │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Secondary Validator │
          │  (Claude Sonnet)     │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Consensus Engine    │
          └──────────┬───────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
    [AGREE]    [DISAGREE]   [UNCERTAIN]
        │            │            │
        │            ▼            │
        │    ┌───────────────┐    │
        │    │  Adjudicator  │    │
        │    │  (Heuristic   │    │
        │    │   + Config)   │    │
        │    └───────┬───────┘    │
        │            │            │
        └────────────┴────────────┘
                     │
                     ▼
              Final Decision
```

### 6.2 Consensus Strategies

```typescript
type ConsensusStrategy =
  | 'unanimous'     // All models must agree
  | 'majority'      // Majority rules
  | 'primary-weighted'  // Trust primary more, secondary as tiebreaker
  | 'security-override'  // If any model flags security issue, block
  | 'best-of-n'     // Use most confident model

interface ConsensusConfig {
  enabled: boolean;
  strategy: ConsensusStrategy;
  models: ModelConfig[];
  timeout: number;
  fallbackOnTimeout: 'allow' | 'deny' | 'primary-only';
}

interface ModelConfig {
  name: string;
  type: 'internal' | 'api';
  endpoint?: string;  // For API models
  apiKey?: string;
  weight?: number;  // For weighted strategies
  specialties?: string[];  // ['security', 'complexity', 'semantics']
}
```

### 6.3 Implementation

```typescript
class ConsensusEngine {
  private models: ValidatorModel[];
  private config: ConsensusConfig;

  async validate(code: string, context: ValidationContext): Promise<ConsensusResult> {
    // Run all models in parallel
    const modelResults = await Promise.allSettled(
      this.models.map(model => model.validate(code, context))
    );

    // Extract successful results
    const successfulResults = modelResults
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);

    // Apply consensus strategy
    const decision = this.applyConsensusStrategy(successfulResults);

    return {
      decision,
      modelResults: successfulResults,
      confidence: this.calculateConfidence(decision, successfulResults),
      disagreements: this.findDisagreements(successfulResults)
    };
  }

  private applyConsensusStrategy(results: ValidationResult[]): Decision {
    switch (this.config.strategy) {
      case 'unanimous':
        return results.every(r => r.decision === 'allow') ? 'allow' : 'deny';

      case 'majority':
        const allows = results.filter(r => r.decision === 'allow').length;
        return allows > results.length / 2 ? 'allow' : 'deny';

      case 'primary-weighted':
        const primary = results[0];  // Assume first is primary
        const secondary = results.slice(1);

        if (primary.decision === 'deny' && primary.severity === 'critical') {
          return 'deny';  // Trust primary on critical issues
        }

        // Use secondary as tiebreaker if primary is uncertain
        if (primary.confidence < 0.7 && secondary.length > 0) {
          return secondary[0].decision;
        }

        return primary.decision;

      case 'security-override':
        // If any model flags security issue, deny
        return results.some(r =>
          r.decision === 'deny' && r.issues.some(i => i.category === 'security')
        ) ? 'deny' : 'allow';

      case 'best-of-n':
        // Use result with highest confidence
        const bestResult = results.reduce((best, current) =>
          current.confidence > best.confidence ? current : best
        );
        return bestResult.decision;
    }
  }
}
```

### 6.4 Configuration Example

```json
{
  "judge": {
    "consensus": {
      "enabled": true,
      "strategy": "security-override",
      "models": [
        {
          "name": "primary",
          "type": "internal",
          "weight": 0.7,
          "specialties": ["complexity", "semantics"]
        },
        {
          "name": "secondary",
          "type": "api",
          "endpoint": "https://api.anthropic.com/v1/messages",
          "model": "claude-sonnet-4.5-20250929",
          "weight": 0.3,
          "specialties": ["security", "architecture"]
        }
      ],
      "timeout": 15000,
      "fallbackOnTimeout": "primary-only"
    }
  }
}
```

---

## 7. Data Structures and Interfaces

### 7.1 Core Types

```typescript
// Hook Input
interface JudgeHookInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
  hook_event_name: "PreToolUse";
  tool_name: "Write" | "Edit" | "MultiEdit";
  tool_input: WriteInput | EditInput | MultiEditInput;
}

interface WriteInput {
  file_path: string;
  content: string;
}

interface EditInput {
  file_path: string;
  old_string: string;
  new_string: string;
}

// Hook Output
interface JudgeHookOutput {
  hookSpecificOutput: {
    hookEventName: "PreToolUse";
    permissionDecision: "allow" | "deny" | "ask";
    permissionDecisionReason: string;
  };
}

// Validation Results
interface ValidationResults {
  decision: "allow" | "deny";
  confidence: number;  // 0-1
  issues: ValidationIssue[];
  metrics: ValidationMetrics;
  modelResults?: ModelValidationResult[];  // If consensus enabled
  testResults?: TestResults;  // If tests run
}

interface ValidationMetrics {
  complexity: ComplexityMetrics;
  security: SecurityMetrics;
  semantics: SemanticMetrics;
  performance?: PerformanceMetrics;
}

interface ComplexityMetrics {
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  nestingDepth: number;
  functionLength: number;
  totalFunctions: number;
  highComplexityFunctions: number;
}

interface SecurityMetrics {
  criticalIssues: number;
  errorIssues: number;
  warningIssues: number;
  categories: {
    injection: number;
    xss: number;
    crypto: number;
    auth: number;
    dataExposure: number;
  };
}

interface SemanticMetrics {
  typeConsistencyScore: number;
  namingConsistencyScore: number;
  duplicateCodeScore: number;
  apiContractViolations: number;
}
```

### 7.2 Configuration Schema

```typescript
interface JudgeConfig {
  // Global settings
  enabled: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  maxRetries: number;

  // File filtering
  include: string[];  // Glob patterns
  exclude: string[];  // Glob patterns

  // Complexity thresholds
  complexity: ComplexityThresholds;

  // Semantic checks
  semantics: {
    enabled: boolean;
    checks: SemanticCheckConfig[];
    detectDuplicates: boolean;
    duplicateThreshold: number;  // Similarity 0-1
  };

  // Security rules
  security: {
    enabled: boolean;
    rules: SecurityRuleConfig[];
    customRules?: CustomSecurityRule[];
  };

  // Test execution
  tests: TestExecutionConfig;

  // Consensus
  consensus: ConsensusConfig;

  // Output formatting
  output: {
    format: 'json' | 'text' | 'html';
    includeCodeSnippets: boolean;
    maxSuggestions: number;
  };
}

interface SemanticCheckConfig {
  type: string;
  enabled: boolean;
  severity: 'error' | 'warning';
}

interface SecurityRuleConfig {
  id: string;
  enabled: boolean;
  severity?: 'critical' | 'error' | 'warning';
  customPattern?: string;
}
```

**Default Configuration** (`.smite/judge.config.json`):
```json
{
  "enabled": true,
  "logLevel": "info",
  "maxRetries": 3,
  "include": ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
  "exclude": [
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**"
  ],
  "complexity": {
    "maxCyclomaticComplexity": 10,
    "maxCognitiveComplexity": 15,
    "maxNestingDepth": 4,
    "maxFunctionLength": 50,
    "maxParameterCount": 5
  },
  "semantics": {
    "enabled": true,
    "checks": [
      { "type": "api-contract", "enabled": true, "severity": "error" },
      { "type": "type-consistency", "enabled": true, "severity": "error" },
      { "type": "naming", "enabled": true, "severity": "warning" },
      { "type": "duplicate-code", "enabled": true, "severity": "warning" }
    ],
    "detectDuplicates": true,
    "duplicateThreshold": 0.85
  },
  "security": {
    "enabled": true,
    "rules": [
      { "id": "sql-injection", "enabled": true },
      { "id": "xss-vulnerability", "enabled": true },
      { "id": "weak-crypto", "enabled": true },
      { "id": "hardcoded-secret", "enabled": true }
    ]
  },
  "tests": {
    "enabled": true,
    "frameworks": ["jest", "vitest"],
    "timeoutMs": 60000,
    "failOnError": true
  },
  "consensus": {
    "enabled": false,
    "strategy": "primary-weighted"
  },
  "output": {
    "format": "text",
    "includeCodeSnippets": true,
    "maxSuggestions": 5
  }
}
```

---

## 8. Error Handling Strategy

### 8.1 Error Categories

```typescript
type ErrorCategory =
  | 'config-error'        // Invalid configuration
  | 'parse-error'         // Failed to parse code
  | 'analysis-error'      // Analysis tool failed
  | 'timeout-error'       // Analysis took too long
  | 'model-error'         // AI model unavailable
  | 'test-error'          // Test execution failed
  | 'filesystem-error';   // File I/O issues

interface JudgeError {
  category: ErrorCategory;
  message: string;
  details?: unknown;
  recoverable: boolean;
  fallbackAction?: 'allow' | 'deny' | 'ask';
}
```

### 8.2 Fallback Strategy

```typescript
const FALLBACK_STRATEGY: Record<ErrorCategory, FallbackAction> = {
  'config-error': 'deny',     // Fail secure - require config fix
  'parse-error': 'ask',       // Ask user - might be partial code
  'analysis-error': 'ask',    // Ask user - degraded validation
  'timeout-error': 'allow',   // Allow - don't block on performance
  'model-error': 'allow',     // Allow - fallback to basic checks
  'test-error': 'ask',        // Ask user - tests might not be critical
  'filesystem-error': 'deny'  // Fail secure - can't write anyway
};

class ErrorHandler {
  handle(error: JudgeError): HookOutput {
    console.error(`[Judge Hook] Error: ${error.category} - ${error.message}`);

    const fallbackAction = FALLBACK_STRATEGY[error.category];

    return {
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: fallbackAction,
        permissionDecisionReason: this.formatErrorMessage(error)
      }
    };
  }

  private formatErrorMessage(error: JudgeError): string {
    return `⚠️ Quality Gate Error (${error.category})

${error.message}

${error.recoverable ?
  'This is a recoverable error. You may:
  1. Fix the issue and retry
  2. Override this warning (if asked)
  3. Check .smite/judge.log for details' :
  'This error requires attention. Please check:
  1. .smite/judge.config.json for configuration issues
  2. .smite/judge.log for detailed error traces
  3. Run hooks in debug mode: claude --debug'}`;
  }
}
```

### 8.3 Logging Strategy

```typescript
class JudgeLogger {
  private logFile: string;

  log(level: string, category: string, message: string, details?: unknown) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      details,
      sessionId: process.env.CLAUDE_SESSION_ID
    };

    // Append to log file
    fs.appendFileSync(
      this.logFile,
      JSON.stringify(entry) + '\n'
    );

    // Also output to stderr for debugging
    console.error(`[Judge ${level.toUpperCase()}] ${message}`);
  }

  // Log validation results for audit trail
  logValidation(input: HookInput, results: ValidationResults) {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      sessionId: input.session_id,
      file: input.tool_input.file_path,
      decision: results.decision,
      confidence: results.confidence,
      issuesCount: results.issues.length,
      issues: results.issues.map(i => ({
        type: i.type,
        severity: i.severity,
        message: i.message
      })),
      metrics: results.metrics
    };

    fs.appendFileSync(
      path.join(process.cwd(), '.smite', 'judge-audit.log'),
      JSON.stringify(auditEntry) + '\n'
    );
  }
}
```

---

## 9. Implementation Phases

### Phase 1: Core Validator (US-002)
- Basic PreToolUse hook implementation
- Complexity analysis via TypeScript Compiler API
- Basic security pattern matching (regex-based)
- Feedback loop with retry mechanism
- Configuration system

### Phase 2: Semantic Analysis (US-002 extended)
- Integration with existing SemanticAnalysisAPI
- API contract change detection
- Type consistency checking
- Duplicate code detection

### Phase 3: Test Integration (US-003)
- MCP server for test execution
- Jest/Vitest result parsing
- Test failure feedback integration
- Configurable test commands

### Phase 4: Multi-Model Consensus (Optional)
- Integration with external AI APIs
- Consensus strategies implementation
- Model result aggregation
- Confidence scoring

### Phase 5: Advanced Features
- Learning from past validations
- Custom rule editor
- Performance optimization (caching, parallel analysis)
- Rich UI for validation results

---

## 10. Performance Considerations

### 10.1 Latency Budget

```
Total Hook Timeout: 30s (configurable)

├── File Parsing & AST Generation: 2s
├── Complexity Analysis: 1s
├── Semantic Checks: 5s
│   ├── Duplicate Detection: 3s (can be parallelized)
│   ├── API Contract Analysis: 1s
│   └── Type Consistency: 1s
├── Security Scanning: 2s
├── Consensus (if enabled): 15s
│   └── Secondary Model: 10s (with 5s buffer)
└── Test Execution (if enabled): 20s (parallel with other checks)
```

**Optimization Strategies**:
1. **Parallel Execution**: Run independent checks in parallel
2. **Incremental Analysis**: Only analyze changed lines (for Edit operations)
3. **Caching**: Cache AST and semantic embeddings
4. **Lazy Evaluation**: Skip expensive checks if quick checks fail
5. **Background Processing**: Run tests in parallel, don't block on quick checks

### 10.2 Scalability

```
Hook Execution Strategy:

Small Files (< 100 lines):
  - Full analysis pipeline
  - All checks enabled
  - < 2s latency expected

Medium Files (100-500 lines):
  - Full analysis pipeline
  - Parallelize where possible
  - < 10s latency expected

Large Files (> 500 lines):
  - Function-level analysis (not file-level)
  - Sample-based duplicate detection
  - Optional test execution (user configurable)
  - < 30s latency expected

Very Large Files (> 2000 lines):
  - Warn user about file size
  - Ask if they want full validation
  - Default: complexity only, skip expensive checks
```

---

## 11. Security Considerations

### 11.1 Input Validation

```typescript
function sanitizeInput(input: HookInput): HookInput {
  // Validate file paths
  if (input.tool_input.file_path.includes('..')) {
    throw new JudgeError({
      category: 'parse-error',
      message: 'Path traversal detected',
      recoverable: false
    });
  }

  // Check file size limits
  const content = input.tool_input.content || '';
  if (content.length > MAX_FILE_SIZE) {
    throw new JudgeError({
      category: 'parse-error',
      message: `File too large (${content.length} bytes, max ${MAX_FILE_SIZE})`,
      recoverable: true,
      fallbackAction: 'ask'
    });
  }

  return input;
}
```

### 11.2 Sandbox Isolation

```typescript
// Run external tools in sandboxed environment
class SandboxExecutor {
  async execute(command: string, input: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const proc = spawn(command, [], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          PATH: '/usr/bin:/bin',  // Restricted PATH
          NODE_ENV: 'production'
        },
        timeout: 5000,
        uid: 65534,  // nobody user
        gid: 65534   // nobody group
      });

      // ... rest of execution logic
    });
  }
}
```

### 11.3 Secret Protection

```typescript
// Never log secrets or sensitive code
function sanitizeForLogging(content: string): string {
  // Remove potential secrets
  return content
    .replace(/password\s*[=:]\s*["'][^"']+["']/gi, 'password="***"')
    .replace(/secret\s*[=:]\s*["'][^"']+["']/gi, 'secret="***"')
    .replace(/key\s*[=:]\s*["'][^"']+["']/gi, 'key="***"')
    .replace(/token\s*[=:]\s*["'][^"']+["']/gi, 'token="***"');
}
```

---

## 12. Testing Strategy

### 12.1 Unit Tests

```typescript
describe('JudgeHook', () => {
  describe('Complexity Analysis', () => {
    it('should detect high cyclomatic complexity', async () => {
      const complexCode = `
        function complex(x) {
          if (x > 0) {
            for (let i = 0; i < x; i++) {
              if (i % 2 === 0) {
                while (i < 100) {
                  i++;
                }
              } else {
                do {
                  i--;
                } while (i > 0);
              }
            }
          }
        }
      `;

      const result = await analyzer.analyze(complexCode);
      expect(result.metrics.complexity.cyclomaticComplexity).toBeGreaterThan(10);
      expect(result.decision).toBe('deny');
    });
  });

  describe('Security Scanning', () => {
    it('should detect SQL injection', async () => {
      const vulnerableCode = `
        const query = "SELECT * FROM users WHERE id = " + userId;
        db.query(query);
      `;

      const result = await scanner.scan(vulnerableCode);
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          type: 'security',
          category: 'injection',
          severity: 'critical'
        })
      );
    });
  });

  describe('Feedback Loop', () => {
    it('should generate correction prompt', async () => {
      const validationResults = {
        decision: 'deny',
        issues: [/* ... */]
      };

      const prompt = await feedbackGenerator.generate(validationResults, { retryCount: 1 });
      expect(prompt).toContain('CRITICAL');
      expect(prompt).toContain('SQL Injection');
      expect(prompt).toContain('Attempt: 1/3');
    });
  });
});
```

### 12.2 Integration Tests

```typescript
describe('JudgeHook Integration', () => {
  it('should intercept Write tool and block bad code', async () => {
    const hookInput = {
      tool_name: 'Write',
      tool_input: {
        file_path: '/tmp/test.ts',
        content: 'bad code here...'
      }
    };

    const result = await executeHook(hookInput);
    expect(result.hookSpecificOutput.permissionDecision).toBe('deny');
  });

  it('should allow good code after retry', async () => {
    const hookInput = {
      tool_name: 'Write',
      tool_input: {
        file_path: '/tmp/test.ts',
        content: 'good code here...'
      }
    };

    const result = await executeHook(hookInput);
    expect(result.hookSpecificOutput.permissionDecision).toBe('allow');
  });
});
```

---

## 13. Future Enhancements

1. **Machine Learning**: Train models on codebase-specific patterns
2. **Historical Analysis**: Track quality trends over time
3. **PR Integration**: GitHub/GitLab PR comment integration
4. **IDE Extensions**: Real-time feedback in VS Code, JetBrains
5. **Custom Rules UI**: Visual editor for creating validation rules
6. **Team Policy Sharing**: Shareable rule sets across teams
7. **Performance Profiling**: Identify slow functions and suggest optimizations
8. **Documentation Generation**: Auto-generate docs from validated code
9. **Refactoring Suggestions**: Proactively suggest code improvements
10. **Cost Estimation**: Estimate technical debt in hours/dollars

---

## 14. References

### Hook Documentation
- [Claude Code Hooks Reference (Chinese)](https://www.claude-cn.org/claude-code-docs-zh/reference/hooks)
- [Claude Code Hooks from 51CTO](https://www.51cto.com/article/829071.html)
- [GitHub Issue #3148 - Hook Matcher Bug](https://github.com/anthropics/claude-code/issues/3148)

### Code Analysis Best Practices
- [Understanding Abstract Syntax Trees](https://gravitycloud.ai/blog/abstract-syntax-tree)
- [Static Code Analysis Explained](https://bix-tech.com/static-code-analysis-sast-explained-how-it-works-why-it-matters-and-how-to-do-it-right/)
- [How Code Complexity Metrics Influence Your Bottom Line](https://mstone.ai/blog/code-complexity-metrics-business-impact/)
- [Genese Cpx Framework](https://github.com/geneseframework/complexity)

### Security Standards
- [20 Static Analysis Tools for TypeScript](https://www.in-com.com/blog/20-powerful-static-analysis-tools-every-typescript-team-needs/)
- [Comprehensive Framework for Secure Code Review in TypeScript](https://medium.com/@greglusk/a-comprehensive-framework-for-secure-code-review-in-go-and-typescript-7aa7afd0adaa)
- OWASP Top 10 2021
- CWE Mitre

### AI Code Review
- [AI Code Review Tools 2026](https://www.qodo.ai/blog/best-ai-code-review-tools-2026/)
- [Auto Code Review Tools 2025](https://www.augmentcode.com/tools/auto-code-review-15-tools-for-faster-releases-in-2025)

---

## 15. Appendix: Example Hook Scripts

### A. Basic Hook Implementation (`judge-hook.js`)

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { JudgeHook } = require('./dist/judge-hook');

async function main() {
  try {
    // Read hook input from stdin
    const inputData = readStdin();

    // Load configuration
    const config = loadConfig();

    // Create judge hook instance
    const judge = new JudgeHook(config);

    // Execute validation
    const result = await judge.validate(inputData);

    // Output decision
    console.log(JSON.stringify(result));

    // Exit with appropriate code
    process.exit(result.hookSpecificOutput.permissionDecision === 'allow' ? 0 : 2);
  } catch (error) {
    console.error(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "ask",
        permissionDecisionReason: `Error: ${error.message}`
      }
    }));
    process.exit(1);
  }
}

function readStdin() {
  const inputData = fs.readFileSync(0, 'utf-8');
  return JSON.parse(inputData);
}

function loadConfig() {
  const configPath = path.join(process.cwd(), '.smite', 'judge.config.json');
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }
  return require('./default-config.json');
}

main();
```

### B. Hook Configuration Template (`.claude/hooks.json`)

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "node $CLAUDE_PROJECT_DIR/.claude/hooks/judge-hook.js",
            "timeout": 30,
            "description": "Code quality gate - validates complexity, semantics, and security"
          }
        ]
      }
    ]
  }
}
```

---

**End of Architecture Document**

**Next Steps**: Proceed to US-002 (Implementation) with this architecture as the specification.
