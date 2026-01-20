# Workflow Orchestrator - Layer 3

The **Workflow Orchestrator** provides high-level, complex workflows that compose Layer 2 feature modules into powerful, multi-step operations.

## Overview

The orchestrator enables agents and users to accomplish complex tasks with a single function call. Each workflow handles the entire process from start to finish, combining:

- 🔍 **Search** - Find relevant information
- 📖 **Read** - Extract and parse content
- 👁️ **Analyze** - Understand images and UIs
- 🔧 **Repository** - Explore GitHub codebases

## Available Workflows

### 1. `researchTopic(query, sourceCount?)`

**Purpose**: Comprehensive research on any topic

**Process**: Search → Read → Extract → Summarize

**Returns**: Structured research report with sources, key findings, and summary

**Example**:
```typescript
import { researchTopic } from '@smite/browser-automation';

const result = await researchTopic('Browser automation MCP', 3);

if (result.success) {
  console.log('Summary:', result.data.summary);
  console.log('Key findings:', result.data.keyFindings);
  console.log('Sources:', result.data.sources.length);
}
```

**Result Structure**:
```typescript
{
  query: string;
  sources: Array<{
    title: string;
    url: string;
    summary: string;
    content: string;
  }>;
  keyFindings: string[];
  summary: string;
  totalSources: number;
}
```

---

### 2. `debugError(screenshot, context?)`

**Purpose**: Debug errors from screenshots with actionable fixes

**Process**: Analyze error → Search solutions → Provide fixes

**Returns**: Structured error diagnosis with solutions and action plan

**Example**:
```typescript
import { debugError } from '@smite/browser-automation';

const result = await debugError(
  '/path/to/error-screenshot.png',
  'During npm install in CI/CD pipeline'
);

if (result.success) {
  console.log('Error type:', result.data.errorType);
  console.log('Causes:', result.data.possibleCauses);
  console.log('Fixes:', result.data.suggestedFixes);
  console.log('Action plan:', result.data.actionPlan);
}
```

**Result Structure**:
```typescript
{
  errorType: string;
  errorMessage: string;
  possibleCauses: string[];
  suggestedFixes: string[];
  relatedSolutions: Array<{
    source: string;
    url: string;
    relevant: boolean;
  }>;
  actionPlan: string[];
}
```

---

### 3. `analyzeLibrary(libName, version?)`

**Purpose**: Comprehensive library analysis

**Process**: Find docs → Extract examples → Identify issues → Analyze repo

**Returns**: Complete library overview with getting started guide

**Example**:
```typescript
import { analyzeLibrary } from '@smite/browser-automation';

const result = await analyzeLibrary('react', '18');

if (result.success) {
  console.log('Description:', result.data.description);
  console.log('Examples:', result.data.examples.length);
  console.log('Common issues:', result.data.commonIssues);
  console.log('Getting started:', result.data.gettingStarted);
}
```

**Result Structure**:
```typescript
{
  libraryName: string;
  version: string;
  description?: string;
  documentation: string;
  examples: Array<{
    title: string;
    url: string;
    code?: string;
  }>;
  commonIssues: Array<{
    issue: string;
    solution: string;
  }>;
  repository?: {
    name: string;
    language?: string;
    keyFiles: string[];
  };
  gettingStarted: string[];
}
```

---

### 4. `auditCodebase(repoUrl)`

**Purpose**: Comprehensive GitHub repository audit

**Process**: Get structure → Analyze architecture → Assess quality → Recommend improvements

**Returns**: Complete codebase analysis with insights and recommendations

**Example**:
```typescript
import { auditCodebase } from '@smite/browser-automation';

const result = await auditCodebase('vitejs/vite');

if (result.success) {
  console.log('Architecture:', result.data.architecture);
  console.log('Code quality:', result.data.codeQuality);
  console.log('Insights:', result.data.insights);
  console.log('Recommendations:', result.data.recommendations);
}
```

**Result Structure**:
```typescript
{
  repository: string;
  structure: string;
  architecture: {
    language: string;
    framework?: string;
    buildTool?: string;
    mainEntry?: string;
  };
  keyComponents: Array<{
    path: string;
    purpose: string;
  }>;
  dependencies?: string[];
  codeQuality: {
    hasTests: boolean;
    hasLinting: boolean;
    hasDocs: boolean;
    hasCI: boolean;
  };
  insights: string[];
  recommendations: string[];
}
```

---

## Using the WorkflowOrchestrator Class

For more control, use the `WorkflowOrchestrator` class directly:

```typescript
import { WorkflowOrchestrator } from '@smite/browser-automation';

const orchestrator = new WorkflowOrchestrator();

// Use any workflow
const research = await orchestrator.researchTopic('AI tools');
const debug = await orchestrator.debugError('/path/to/error.png');
const lib = await orchestrator.analyzeLibrary('vue');
const audit = await orchestrator.auditCodebase('facebook/react');
```

---

## Custom Workflows

Define your own multi-step workflows:

```typescript
import { WorkflowOrchestrator } from '@smite/browser-automation';

const orchestrator = new WorkflowOrchestrator();

const customWorkflow = [
  {
    name: 'search',
    description: 'Search for information',
    execute: async (context) => {
      return await orchestrator.search.searchWeb('TypeScript patterns');
    },
  },
  {
    name: 'read',
    description: 'Read top result',
    dependencies: ['search'],
    execute: async (context) => {
      const results = context.variables.get('search');
      const topUrl = results[0]?.url;
      return await orchestrator.read.readWebPage(topUrl);
    },
  },
  {
    name: 'summarize',
    description: 'Create summary',
    dependencies: ['read'],
    execute: async (context) => {
      const content = context.variables.get('read');
      return {
        success: true,
        data: { summary: content.substring(0, 500) }
      };
    },
  },
];

const result = await orchestrator.executeWorkflow(customWorkflow);

if (result.success) {
  console.log('All steps completed!');
  console.log('Variables:', result.data.variables);
  console.log('History:', result.data.history);
}
```

---

## Composing Workflows

Workflows can call other workflows:

```typescript
// Research → Analyze mentioned library → Audit repository
const research = await researchTopic('Modern JavaScript frameworks', 3);

if (research.success) {
  // Extract library name from research
  const libName = 'react'; // Found in research

  // Analyze the library
  const libAnalysis = await analyzeLibrary(libName);

  if (libAnalysis.success && libAnalysis.data.repository) {
    // Audit the repository
    const audit = await auditCodebase(libAnalysis.data.repository.name);

    console.log('Complete analysis:', audit.data);
  }
}
```

---

## Workflow Context

Each workflow execution maintains a context with:

```typescript
{
  variables: Map<string, unknown>;  // Results from each step
  history: Array<{                  // Execution history
    step: string;
    result: unknown;
    timestamp: string;
  }>;
  metadata: Record<string, unknown>; // Custom metadata
}
```

Access context in custom workflows:

```typescript
execute: async (context) => {
  // Read variables from previous steps
  const previousResult = context.variables.get('previousStep');

  // Access execution history
  const stepsCompleted = context.history.length;

  // Add custom metadata
  context.metadata.customField = 'value';

  return { success: true, data: { /* ... */ } };
}
```

---

## Error Handling

All workflows return `Result<T>` type:

```typescript
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: Error };
```

Handle errors:

```typescript
const result = await researchTopic('Topic');

if (result.success) {
  // Use result.data
} else {
  // Handle result.error
  console.error('Research failed:', result.error.message);
}
```

---

## Real-World Examples

### Example 1: Competitive Analysis

```typescript
// Research competitors
const competitors = await researchTopic('React alternatives', 5);

if (competitors.success) {
  // Analyze each competitor's library
  for (const source of competitors.data.sources) {
    const libName = extractLibName(source.title);
    const analysis = await analyzeLibrary(libName);

    console.log(`${libName}:`, analysis.data.description);
  }
}
```

### Example 2: Technical Investigation

```typescript
// Debug error and find solutions
const error = await debugError('/path/to/error.png', 'In production');

if (error.success) {
  // Research the error type
  const research = await researchTopic(error.data.errorType, 3);

  // Combine error analysis with research
  const combined = {
    error: error.data,
    research: research.data,
    recommendedFix: error.data.actionPlan[0],
  };

  console.log('Investigation complete:', combined);
}
```

### Example 3: Library Evaluation

```typescript
// Analyze multiple libraries
const libraries = ['react', 'vue', 'svelte'];
const analyses = [];

for (const lib of libraries) {
  const result = await analyzeLibrary(lib);
  if (result.success) {
    analyses.push(result.data);
  }
}

// Compare libraries
const comparison = analyses.map(a => ({
  name: a.libraryName,
  examples: a.examples.length,
  issues: a.commonIssues.length,
  hasRepo: !!a.repository,
}));

console.table(comparison);
```

---

## Performance Considerations

- **Parallelization**: Workflows use parallel execution where possible
- **Caching**: Feature modules cache responses automatically
- **Timeouts**: Each step has configurable timeouts
- **Retries**: Failed operations retry with exponential backoff

Typical execution times:
- `researchTopic`: 10-30 seconds
- `debugError`: 5-15 seconds
- `analyzeLibrary`: 20-40 seconds
- `auditCodebase`: 15-30 seconds

---

## See Also

- **Layer 1 (MCP Clients)**: `./mcp/README.md`
- **Layer 2 (Features)**: `./features/README.md`
- **Architecture**: `../.smite/browser-automation-architecture.md`
- **Demo**: `./demo.ts`
- **Tests**: `./__tests__/workflow-orchestrator.test.ts`
