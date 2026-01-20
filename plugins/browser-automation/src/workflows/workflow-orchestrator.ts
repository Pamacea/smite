/**
 * Workflow Orchestrator - Layer 3
 * High-level workflows composed from Layer 2 feature modules
 *
 * This module provides complex, multi-step workflows that combine
 * search, read, vision, and repository features to solve real-world tasks.
 *
 * @module @smite/browser-automation/workflows
 */

import type { Result } from '../mcp/types.js';
import {
  SearchFeature,
  ReadFeature,
  VisionFeature,
  RepositoryFeature,
  type SearchAndReadResult,
  type EnhancedSearchResult,
  type ErrorDiagnosisResult,
  type RepositoryInsight,
} from '../features/index.js';

// ============================================================================
// Workflow Result Types
// ============================================================================

/**
 * Research topic workflow result
 */
export interface ResearchTopicResult {
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

/**
 * Debug error workflow result
 */
export interface DebugErrorResult {
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

/**
 * Analyze library workflow result
 */
export interface AnalyzeLibraryResult {
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
    stars?: string;
    language?: string;
    keyFiles: string[];
  };
  gettingStarted: string[];
}

/**
 * Audit codebase workflow result
 */
export interface AuditCodebaseResult {
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

/**
 * Workflow execution context
 */
export interface WorkflowContext {
  variables: Map<string, unknown>;
  history: Array<{ step: string; result: unknown; timestamp: string }>;
  metadata: Record<string, unknown>;
}

/**
 * Workflow step definition
 */
export interface WorkflowStep<T = unknown> {
  name: string;
  description: string;
  execute: (context: WorkflowContext) => Promise<Result<T>>;
  dependencies?: string[];
}

// ============================================================================
// Workflow Orchestrator Class
// ============================================================================

/**
 * Workflow Orchestrator
 *
 * Executes complex, multi-step workflows by composing feature modules.
 * Maintains execution context and handles dependencies between steps.
 *
 * @example
 * ```typescript
 * const orchestrator = new WorkflowOrchestrator();
 *
 * // Research a topic
 * const research = await orchestrator.researchTopic('Browser MCP servers');
 *
 * // Debug an error
 * const debug = await orchestrator.debugError('/path/to/error.png');
 *
 * // Analyze a library
 * const analysis = await orchestrator.analyzeLibrary('react', '18');
 * ```
 */
export class WorkflowOrchestrator {
  public readonly search: SearchFeature;
  public readonly read: ReadFeature;
  public readonly vision: VisionFeature;
  public readonly repo: RepositoryFeature;

  constructor(
    searchFeature?: SearchFeature,
    readFeature?: ReadFeature,
    visionFeature?: VisionFeature,
    repoFeature?: RepositoryFeature
  ) {
    this.search = searchFeature || new SearchFeature();
    this.read = readFeature || new ReadFeature();
    this.vision = visionFeature || new VisionFeature();
    this.repo = repoFeature || new RepositoryFeature();
  }

  // ========================================================================
  // Workflow 1: Research Topic
  // ========================================================================

  /**
   * Research a topic comprehensively
   *
   * Combines web search, content reading, and summarization to provide
   * a complete research report on any topic.
   *
   * @param query - Topic to research
   * @param sourceCount - Number of sources to analyze (default: 3)
   * @returns Promise<Result<ResearchTopicResult>> - Research results
   *
   * @example
   * ```typescript
   * const result = await orchestrator.researchTopic('Browser automation MCP');
   * if (result.success) {
   *   console.log('Summary:', result.data.summary);
   *   console.log('Key findings:', result.data.keyFindings);
   * }
   * ```
   */
  async researchTopic(
    query: string,
    sourceCount: number = 3
  ): Promise<Result<ResearchTopicResult>> {
    try {
      console.log(`🔍 Researching topic: "${query}"`);

      // Step 1: Search for relevant sources
      const searchResult = await this.search.searchWeb(query, {
        maxResults: sourceCount * 2, // Get more to filter
        enrich: true,
      });

      if (!searchResult.success) {
        return searchResult as Result<ResearchTopicResult>;
      }

      const searchResults = searchResult.data.slice(0, sourceCount);
      console.log(`📊 Found ${searchResults.length} sources`);

      // Step 2: Read top sources
      const urls = searchResults.map(r => r.url);
      const contents: Map<string, string> = new Map();

      for (const url of urls) {
        const readResult = await this.read.readWebPage(url, {
          retainImages: false,
          withLinksSummary: false,
        });

        if (readResult.success) {
          contents.set(url, readResult.data);
        }
      }

      console.log(`📖 Read ${contents.size} pages successfully`);

      // Step 3: Extract key findings and generate summary
      const sources: ResearchTopicResult['sources'] = searchResults
        .filter(result => contents.has(result.url))
        .map(result => ({
          title: result.title,
          url: result.url,
          summary: result.summary,
          content: contents.get(result.url) || '',
        }));

      const keyFindings = this.extractKeyFindings(sources);
      const summary = this.generateResearchSummary(query, sources, keyFindings);

      const researchResult: ResearchTopicResult = {
        query,
        sources,
        keyFindings,
        summary,
        totalSources: sources.length,
      };

      return { success: true, data: researchResult };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  // ========================================================================
  // Workflow 2: Debug Error
  // ========================================================================

  /**
   * Debug an error from a screenshot
   *
   * Analyzes error screenshots, searches for solutions, and provides
   * actionable fixes with references to documentation.
   *
   * @param screenshot - Path or URL to error screenshot
   * @param context - Optional context about when the error occurred
   * @returns Promise<Result<DebugErrorResult>> - Debug analysis
   *
   * @example
   * ```typescript
   * const result = await orchestrator.debugError(
   *   '/path/to/error.png',
   *   'During npm install in CI/CD'
   * );
   * if (result.success) {
   *   console.log('Error type:', result.data.errorType);
   *   console.log('Suggested fixes:', result.data.suggestedFixes);
   * }
   * ```
   */
  async debugError(
    screenshot: string,
    context?: string
  ): Promise<Result<DebugErrorResult>> {
    try {
      console.log('🐛 Debugging error from screenshot');

      // Step 1: Diagnose error from screenshot
      const diagnosisResult = await this.vision.diagnoseError(screenshot, context);

      if (!diagnosisResult.success) {
        return diagnosisResult as unknown as Result<DebugErrorResult>;
      }

      const diagnosis = diagnosisResult.data;
      console.log(`🔍 Error type identified: ${diagnosis.errorType}`);

      // Step 2: Search for solutions
      const searchQuery = `${diagnosis.errorType} ${diagnosis.errorMessage.split(' ').slice(0, 5).join(' ')} solution`;
      const searchResult = await this.search.searchWeb(searchQuery, {
        maxResults: 5,
        timeRange: 'oneYear',
        enrich: true,
      });

      let relatedSolutions: DebugErrorResult['relatedSolutions'] = [];

      if (searchResult.success) {
        // Step 3: Rank solutions by relevance
        relatedSolutions = searchResult.data.map(result => ({
          source: result.title,
          url: result.url,
          relevant: this.isSolutionRelevant(diagnosis, result.summary),
        }));
      }

      // Step 4: Generate action plan
      const actionPlan = this.generateActionPlan(diagnosis, relatedSolutions);

      const debugResult: DebugErrorResult = {
        errorType: diagnosis.errorType,
        errorMessage: diagnosis.errorMessage,
        possibleCauses: diagnosis.possibleCauses,
        suggestedFixes: diagnosis.suggestedFixes,
        relatedSolutions,
        actionPlan,
      };

      return { success: true, data: debugResult };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  // ========================================================================
  // Workflow 3: Analyze Library
  // ========================================================================

  /**
   * Analyze a software library comprehensively
   *
   * Gathers documentation, examples, common issues, and repository insights
   * to provide a complete library analysis.
   *
   * @param libName - Library name (e.g., 'react', 'vue')
   * @param version - Library version (e.g., '18', '3.0')
   * @returns Promise<Result<AnalyzeLibraryResult>> - Library analysis
   *
   * @example
   * ```typescript
   * const result = await orchestrator.analyzeLibrary('react', '18');
   * if (result.success) {
   *   console.log('Description:', result.data.description);
   *   console.log('Getting started:', result.data.gettingStarted);
   * }
   * ```
   */
  async analyzeLibrary(
    libName: string,
    version?: string
  ): Promise<Result<AnalyzeLibraryResult>> {
    try {
      console.log(`📚 Analyzing library: ${libName}${version ? `@${version}` : ''}`);

      const versionSuffix = version ? ` ${version}` : '';

      // Step 1: Search for official documentation
      const docsResult = await this.search.searchWeb(
        `${libName}${versionSuffix} documentation official`,
        {
          domainFilter: [`${libName}.js.org`, `${libName}.dev`, 'github.com', 'npmjs.com'],
          maxResults: 3,
        }
      );

      let documentation = '';
      let description: string | undefined;

      if (docsResult.success && docsResult.data.length > 0) {
        const docsUrl = docsResult.data[0].url;
        const docsContent = await this.read.readWebPage(docsUrl);

        if (docsContent.success) {
          documentation = docsContent.data;
          description = docsResult.data[0].summary;
        }
      }

      // Step 2: Find examples and tutorials
      const examplesResult = await this.search.searchWeb(
        `${libName}${versionSuffix} examples tutorials`,
        {
          maxResults: 5,
          timeRange: 'oneYear',
        }
      );

      const examples: AnalyzeLibraryResult['examples'] = [];

      if (examplesResult.success) {
        for (const result of examplesResult.data.slice(0, 3)) {
          const content = await this.read.readWebPage(result.url);
          examples.push({
            title: result.title,
            url: result.url,
            code: content.success ? this.extractCodeExample(content.data) : undefined,
          });
        }
      }

      // Step 3: Find common issues and solutions
      const issuesResult = await this.search.searchWeb(
        `${libName}${versionSuffix} common issues problems errors`,
        {
          maxResults: 5,
          timeRange: 'oneYear',
        }
      );

      const commonIssues: AnalyzeLibraryResult['commonIssues'] = [];

      if (issuesResult.success) {
        for (const result of issuesResult.data.slice(0, 3)) {
          commonIssues.push({
            issue: result.title,
            solution: result.summary,
          });
        }
      }

      // Step 4: Analyze GitHub repository if available
      let repository: AnalyzeLibraryResult['repository'] | undefined;

      const repoResult = await this.search.searchWeb(
        `${libName} github official repository`,
        {
          domainFilter: ['github.com'],
          maxResults: 1,
        }
      );

      if (repoResult.success && repoResult.data.length > 0) {
        const match = repoResult.data[0].url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (match) {
          const [, owner, repo] = match;
          const insights = await this.repo.getRepositoryInsights(owner, repo);

          if (insights.success) {
            const structure = await this.repo.getRepoStructure(owner, repo);

            repository = {
              name: `${owner}/${repo}`,
              language: insights.data.language,
              keyFiles: structure.success
                ? this.extractKeyFiles(structure.data)
                : [],
            };
          }
        }
      }

      // Step 5: Generate getting started guide
      const gettingStarted = this.extractGettingStarted(documentation, examples);

      const analysisResult: AnalyzeLibraryResult = {
        libraryName: libName,
        version: version || 'latest',
        description,
        documentation: documentation.substring(0, 1000),
        examples,
        commonIssues,
        repository,
        gettingStarted,
      };

      return { success: true, data: analysisResult };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  // ========================================================================
  // Workflow 4: Audit Codebase
  // ========================================================================

  /**
   * Audit a GitHub codebase comprehensively
   *
   * Analyzes repository structure, architecture, code quality, and provides
   * insights and recommendations.
   *
   * @param repoUrl - GitHub repository URL (e.g., 'vitejs/vite')
   * @returns Promise<Result<AuditCodebaseResult>> - Codebase audit
   *
   * @example
   * ```typescript
   * const result = await orchestrator.auditCodebase('vitejs/vite');
   * if (result.success) {
   *   console.log('Architecture:', result.data.architecture);
   *   console.log('Recommendations:', result.data.recommendations);
   * }
   * ```
   */
  async auditCodebase(repoUrl: string): Promise<Result<AuditCodebaseResult>> {
    try {
      console.log(`🔍 Auditing codebase: ${repoUrl}`);

      // Parse repository URL
      const { owner, repo } = this.repo.parseRepoName(repoUrl);

      // Step 1: Get repository structure
      const structureResult = await this.repo.getRepoStructure(owner, repo);

      if (!structureResult.success) {
        return structureResult as unknown as Result<AuditCodebaseResult>;
      }

      const structure = structureResult.data;
      console.log('📂 Repository structure retrieved');

      // Step 2: Get repository insights
      const insightsResult = await this.repo.getRepositoryInsights(owner, repo);

      if (!insightsResult.success) {
        return insightsResult as unknown as Result<AuditCodebaseResult>;
      }

      const insights = insightsResult.data;

      // Step 3: Analyze architecture
      const architecture = this.analyzeArchitecture(structure, insights);

      // Step 4: Identify key components
      const keyComponents = insights.mainFiles;

      // Step 5: Check code quality indicators
      const codeQuality = await this.assessCodeQuality(owner, repo, structure);

      // Step 6: Generate insights and recommendations
      const workflowInsights = this.generateCodebaseInsights(
        structure,
        insights,
        codeQuality
      );
      const recommendations = this.generateRecommendations(
        architecture,
        codeQuality,
        insights
      );

      const auditResult: AuditCodebaseResult = {
        repository: repoUrl,
        structure,
        architecture,
        keyComponents,
        dependencies: insights.dependencies,
        codeQuality,
        insights: workflowInsights,
        recommendations,
      };

      return { success: true, data: auditResult };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  // ========================================================================
  // Generic Workflow Execution
  // ========================================================================

  /**
   * Execute a custom workflow defined as a series of steps
   *
   * @param steps - Array of workflow steps
   * @returns Promise<Result<WorkflowContext>> - Execution context with results
   *
   * @example
   * ```typescript
   * const steps: WorkflowStep[] = [
   *   {
   *     name: 'search',
   *     description: 'Search for information',
   *     execute: async (context) => {
   *       return await searchWeb('Browser automation');
   *     }
   *   },
   *   {
   *     name: 'read',
   *     description: 'Read top result',
   *     dependencies: ['search'],
   *     execute: async (context) => {
   *       const searchResults = context.variables.get('search');
   *       return await readWebPage(searchResults[0].url);
   *     }
   *   }
   * ];
   *
   * const result = await orchestrator.executeWorkflow(steps);
   * ```
   */
  async executeWorkflow(
    steps: WorkflowStep[]
  ): Promise<Result<WorkflowContext>> {
    const context: WorkflowContext = {
      variables: new Map(),
      history: [],
      metadata: {},
    };

    try {
      for (const step of steps) {
        console.log(`⚙️  Executing step: ${step.name}`);

        // Check dependencies
        if (step.dependencies) {
          for (const dep of step.dependencies) {
            if (!context.variables.has(dep)) {
              throw new Error(`Dependency "${dep}" not found for step "${step.name}"`);
            }
          }
        }

        // Execute step
        const result = await step.execute(context);

        if (!result.success) {
          throw new Error(`Step "${step.name}" failed: ${result.error?.message}`);
        }

        // Store result
        context.variables.set(step.name, result.data);
        context.history.push({
          step: step.name,
          result: result.data,
          timestamp: new Date().toISOString(),
        });

        console.log(`✅ Step "${step.name}" completed`);
      }

      return { success: true, data: context };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  // ========================================================================
  // Helper Methods
  // ========================================================================

  /**
   * Extract key findings from research sources
   */
  private extractKeyFindings(sources: ResearchTopicResult['sources']): string[] {
    const findings: string[] = [];

    for (const source of sources) {
      // Extract first paragraph after headings as key findings
      const paragraphs = source.content.split('\n\n');
      for (const para of paragraphs) {
        if (para.length > 100 && para.length < 500) {
          findings.push(para.trim().substring(0, 200));
          break;
        }
      }
    }

    return findings.slice(0, 5);
  }

  /**
   * Generate research summary
   */
  private generateResearchSummary(
    query: string,
    sources: ResearchTopicResult['sources'],
    keyFindings: string[]
  ): string {
    const lines = [
      `# Research Summary: ${query}`,
      '',
      `## Overview`,
      '',
      `This report synthesizes information from ${sources.length} sources on the topic of "${query}".`,
      '',
      `## Key Findings`,
      '',
      ...keyFindings.map(f => `- ${f}`),
      '',
      `## Sources`,
      '',
      ...sources.map((s, i) => `${i + 1}. **${s.title}** - ${s.url}`),
      '',
      `---`,
      `*Generated at ${new Date().toISOString()}*`,
    ];

    return lines.join('\n');
  }

  /**
   * Check if solution is relevant to error diagnosis
   */
  private isSolutionRelevant(
    diagnosis: ErrorDiagnosisResult,
    solution: string
  ): boolean {
    const diagnosisLower = diagnosis.errorMessage.toLowerCase();
    const solutionLower = solution.toLowerCase();

    // Check if solution mentions error type or key terms
    const keywords = [
      ...diagnosis.errorType.toLowerCase().split(' '),
      ...diagnosis.possibleCauses.join(' ').toLowerCase().split(' ').slice(0, 10),
    ];

    return keywords.some(keyword =>
      keyword.length > 3 && solutionLower.includes(keyword)
    );
  }

  /**
   * Generate action plan for fixing error
   */
  private generateActionPlan(
    diagnosis: ErrorDiagnosisResult,
    solutions: DebugErrorResult['relatedSolutions']
  ): string[] {
    const actions: string[] = [];

    // Add suggested fixes from diagnosis
    actions.push(...diagnosis.suggestedFixes.slice(0, 3));

    // Add top relevant solutions
    const relevantSolutions = solutions
      .filter(s => s.relevant)
      .slice(0, 2);

    for (const solution of relevantSolutions) {
      actions.push(`Consult: ${solution.source} (${solution.url})`);
    }

    return actions;
  }

  /**
   * Extract code example from documentation
   */
  private extractCodeExample(content: string): string {
    // Extract first code block
    const codeBlockMatch = content.match(/```[\s\S]*?\n([\s\S]*?)```/);
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim().substring(0, 500);
    }

    // Fallback: extract indented code
    const lines = content.split('\n');
    const codeLines: string[] = [];

    for (const line of lines) {
      if (line.startsWith('    ') || line.startsWith('\t')) {
        codeLines.push(line.trim());
        if (codeLines.length > 10) break;
      }
    }

    return codeLines.length > 0 ? codeLines.join('\n') : '';
  }

  /**
   * Extract key files from repository structure
   */
  private extractKeyFiles(structure: string): string[] {
    const keyFiles: string[] = [];
    const importantPaths = [
      'README',
      'package.json',
      'tsconfig.json',
      '.gitignore',
      'src/index',
      'dist',
      'node_modules',
    ];

    for (const path of importantPaths) {
      if (structure.toLowerCase().includes(path.toLowerCase())) {
        keyFiles.push(path);
      }
    }

    return keyFiles;
  }

  /**
   * Extract getting started guide from docs and examples
   */
  private extractGettingStarted(
    documentation: string,
    examples: AnalyzeLibraryResult['examples']
  ): string[] {
    const steps: string[] = [];

    // Extract installation instructions
    const installMatch = documentation.match(/install[nation]+[\s\S]{0,300}/i);
    if (installMatch) {
      steps.push(installMatch[0].trim());
    }

    // Add first example
    if (examples.length > 0) {
      steps.push(`Example: ${examples[0].title}`);
    }

    return steps;
  }

  /**
   * Analyze repository architecture
   */
  private analyzeArchitecture(
    structure: string,
    insights: RepositoryInsight
  ): AuditCodebaseResult['architecture'] {
    const architecture: AuditCodebaseResult['architecture'] = {
      language: insights.language || 'Unknown',
    };

    // Detect framework
    if (structure.toLowerCase().includes('react')) {
      architecture.framework = 'React';
    } else if (structure.toLowerCase().includes('vue')) {
      architecture.framework = 'Vue';
    } else if (structure.toLowerCase().includes('angular')) {
      architecture.framework = 'Angular';
    } else if (structure.toLowerCase().includes('next')) {
      architecture.framework = 'Next.js';
    } else if (structure.toLowerCase().includes('nuxt')) {
      architecture.framework = 'Nuxt';
    }

    // Detect build tool
    if (structure.toLowerCase().includes('vite.config')) {
      architecture.buildTool = 'Vite';
    } else if (structure.toLowerCase().includes('webpack.config')) {
      architecture.buildTool = 'Webpack';
    } else if (structure.toLowerCase().includes('rollup.config')) {
      architecture.buildTool = 'Rollup';
    } else if (structure.toLowerCase().includes('tsconfig')) {
      architecture.buildTool = 'TypeScript Compiler';
    }

    // Detect main entry point
    if (insights.mainFiles.length > 0) {
      const entryFile = insights.mainFiles.find(f => f.purpose === 'entry point');
      if (entryFile) {
        architecture.mainEntry = entryFile.path;
      }
    }

    return architecture;
  }

  /**
   * Assess code quality indicators
   */
  private async assessCodeQuality(
    owner: string,
    repo: string,
    structure: string
  ): Promise<AuditCodebaseResult['codeQuality']> {
    const quality: AuditCodebaseResult['codeQuality'] = {
      hasTests: false,
      hasLinting: false,
      hasDocs: false,
      hasCI: false,
    };

    const lowerStructure = structure.toLowerCase();

    // Check for tests
    if (
      lowerStructure.includes('test') ||
      lowerStructure.includes('spec') ||
      lowerStructure.includes('__tests__')
    ) {
      quality.hasTests = true;
    }

    // Check for linting
    if (
      lowerStructure.includes('.eslintrc') ||
      lowerStructure.includes('eslint.config') ||
      lowerStructure.includes('.prettierrc') ||
      lowerStructure.includes('prettier.config')
    ) {
      quality.hasLinting = true;
    }

    // Check for docs
    if (
      lowerStructure.includes('readme') ||
      lowerStructure.includes('docs') ||
      lowerStructure.includes('.md')
    ) {
      quality.hasDocs = true;
    }

    // Check for CI
    if (
      lowerStructure.includes('.github') ||
      lowerStructure.includes('.gitlab-ci') ||
      lowerStructure.includes('.travis') ||
      lowerStructure.includes('circleci')
    ) {
      quality.hasCI = true;
    }

    return quality;
  }

  /**
   * Generate codebase insights
   */
  private generateCodebaseInsights(
    structure: string,
    insights: RepositoryInsight,
    codeQuality: AuditCodebaseResult['codeQuality']
  ): string[] {
    const workflowInsights: string[] = [];

    // Language insights
    workflowInsights.push(`Primary language: ${insights.language || 'Unknown'}`);

    // Structure insights
    if (structure.includes('src')) {
      workflowInsights.push('Uses standard src/ directory structure');
    }

    // Quality insights
    const qualityScore = [
      codeQuality.hasTests,
      codeQuality.hasLinting,
      codeQuality.hasDocs,
      codeQuality.hasCI,
    ].filter(Boolean).length;

    workflowInsights.push(
      `Code quality score: ${qualityScore}/4 (tests, linting, docs, CI)`
    );

    // Topic insights
    if (insights.keyTopics.length > 0) {
      workflowInsights.push(`Key topics: ${insights.keyTopics.join(', ')}`);
    }

    return workflowInsights;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    architecture: AuditCodebaseResult['architecture'],
    codeQuality: AuditCodebaseResult['codeQuality'],
    insights: RepositoryInsight
  ): string[] {
    const recommendations: string[] = [];

    // Testing recommendations
    if (!codeQuality.hasTests) {
      recommendations.push('Consider adding automated tests for reliability');
    }

    // Documentation recommendations
    if (!codeQuality.hasDocs) {
      recommendations.push('Add README.md and API documentation for better adoption');
    }

    // CI/CD recommendations
    if (!codeQuality.hasCI) {
      recommendations.push('Set up CI/CD pipeline for automated testing and deployment');
    }

    // Linting recommendations
    if (!codeQuality.hasLinting) {
      recommendations.push('Add linter and formatter for consistent code style');
    }

    return recommendations;
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Research a topic (convenience function)
 *
 * @param query - Topic to research
 * @param sourceCount - Number of sources to analyze
 * @returns Promise<Result<ResearchTopicResult>> - Research results
 *
 * @example
 * ```typescript
 * const result = await researchTopic('Browser automation');
 * console.log(result.data.summary);
 * ```
 */
export async function researchTopic(
  query: string,
  sourceCount?: number
): Promise<Result<ResearchTopicResult>> {
  const orchestrator = new WorkflowOrchestrator();
  return orchestrator.researchTopic(query, sourceCount);
}

/**
 * Debug an error (convenience function)
 *
 * @param screenshot - Path or URL to error screenshot
 * @param context - Optional context
 * @returns Promise<Result<DebugErrorResult>> - Debug analysis
 *
 * @example
 * ```typescript
 * const result = await debugError('/path/to/error.png');
 * console.log(result.data.suggestedFixes);
 * ```
 */
export async function debugError(
  screenshot: string,
  context?: string
): Promise<Result<DebugErrorResult>> {
  const orchestrator = new WorkflowOrchestrator();
  return orchestrator.debugError(screenshot, context);
}

/**
 * Analyze a library (convenience function)
 *
 * @param libName - Library name
 * @param version - Library version
 * @returns Promise<Result<AnalyzeLibraryResult>> - Library analysis
 *
 * @example
 * ```typescript
 * const result = await analyzeLibrary('react', '18');
 * console.log(result.data.gettingStarted);
 * ```
 */
export async function analyzeLibrary(
  libName: string,
  version?: string
): Promise<Result<AnalyzeLibraryResult>> {
  const orchestrator = new WorkflowOrchestrator();
  return orchestrator.analyzeLibrary(libName, version);
}

/**
 * Audit a codebase (convenience function)
 *
 * @param repoUrl - GitHub repository URL
 * @returns Promise<Result<AuditCodebaseResult>> - Codebase audit
 *
 * @example
 * ```typescript
 * const result = await auditCodebase('vitejs/vite');
 * console.log(result.data.recommendations);
 * ```
 */
export async function auditCodebase(
  repoUrl: string
): Promise<Result<AuditCodebaseResult>> {
  const orchestrator = new WorkflowOrchestrator();
  return orchestrator.auditCodebase(repoUrl);
}
