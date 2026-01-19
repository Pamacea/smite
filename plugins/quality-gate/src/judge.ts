/**
 * Core Judge Orchestrator
 * Main validator that coordinates all analysis components
 */

import * as ts from 'typescript';
import { TypeScriptParser } from './parser';
import { ComplexityAnalyzer } from './analyzers/complexity';
import { SecurityScanner } from './analyzers/security';
import { SemanticChecker } from './analyzers/semantic';
import { FeedbackGenerator } from './feedback';
import { ConfigManager } from './config';
import { JudgeLogger } from './logger';
import { TestRunner } from './test-runner';
import { MCPClient } from './mcp-client';
import { DocTrigger } from './doc-trigger';
import {
  JudgeHookInput,
  JudgeHookOutput,
  ValidationResults,
  Decision,
  ValidationIssue,
  ASTAnalysisContext,
  TestMetrics,
  JudgeConfig,
} from './types';

export class Judge {
  private configManager: ConfigManager;
  private logger: JudgeLogger;
  private parser: TypeScriptParser;
  private feedbackGenerator: FeedbackGenerator;
  private testRunner: TestRunner;
  private mcpClient: MCPClient | null = null;
  private docTrigger: DocTrigger | null = null;
  private changedFiles: Set<string> = new Set();
  private startTime: number = 0;

  constructor(cwd: string) {
    this.configManager = new ConfigManager(cwd);
    const config = this.configManager.getConfig();

    this.logger = new JudgeLogger(cwd, config.logLevel);
    this.parser = new TypeScriptParser(this.logger);
    this.feedbackGenerator = new FeedbackGenerator(this.logger, cwd);
    this.testRunner = new TestRunner(this.logger, cwd);

    this.logger.info('judge', 'Judge initialized', {
      enabled: config.enabled,
      logLevel: config.logLevel,
      testsEnabled: config.tests.enabled,
      mcpEnabled: config.mcp.enabled,
    });
  }

  /**
   * Initialize MCP client and documentation trigger
   * Called on first validation to avoid blocking constructor
   */
  private async initializeMCPIntegrationIfNeeded(): Promise<void> {
    // Skip if already initialized or not enabled
    if (this.mcpClient !== null || this.docTrigger !== null) {
      return;
    }

    const config = this.configManager.getConfig();
    if (!config.mcp.enabled) {
      return;
    }

    try {
      this.logger.info('judge', 'Initializing MCP integration');

      // Create MCP client
      this.mcpClient = new MCPClient({
        serverPath: config.mcp.serverPath,
      });

      // Connect to MCP server
      await this.mcpClient.connect();

      // Create documentation trigger
      this.docTrigger = new DocTrigger({
        enabled: true,
        serverPath: config.mcp.serverPath,
        triggers: config.mcp.triggers,
      });

      // Set MCP client on trigger
      this.docTrigger.setMCPClient(this.mcpClient);

      this.logger.info('judge', 'MCP integration initialized successfully');
    } catch (error) {
      this.logger.warn('judge', `Failed to initialize MCP integration: ${error}`);
      // Non-blocking: continue without MCP
      this.mcpClient = null;
      this.docTrigger = null;
    }
  }

  /**
   * Main validation entry point
   */
  async validate(input: JudgeHookInput): Promise<JudgeHookOutput> {
    this.startTime = Date.now();

    const config = this.configManager.getConfig();

    // Check if judge is enabled
    if (!config.enabled) {
      return this.allow('Quality gate is disabled in configuration');
    }

    // Initialize MCP integration on first validation if enabled
    await this.initializeMCPIntegrationIfNeeded();

    // Extract file path and content
    const filePath = input.tool_input.file_path;
    const content =
      'content' in input.tool_input ? input.tool_input.content : input.tool_input.new_string;

    this.logger.info('judge', `Starting validation for ${filePath}`, {
      tool: input.tool_name,
      contentLength: content.length,
    });

    // Check if file should be validated
    if (!this.configManager.shouldValidateFile(filePath)) {
      this.logger.debug('judge', `File excluded from validation: ${filePath}`);
      return this.allow(`File excluded from validation: ${filePath}`);
    }

    // Track changed file for MCP documentation
    this.changedFiles.add(filePath);

    // Parse code
    const sourceFile = this.parser.parseCode(filePath, content);
    if (!sourceFile) {
      this.logger.warn('judge', `Failed to parse ${filePath}, allowing with warning`);
      return this.ask(`Failed to parse ${filePath}. The code may have syntax errors.`);
    }

    // Initialize analysis context
    const context = this.initializeAnalysisContext(sourceFile, config);

    try {
      // Run all analyses
      await this.runAnalyses(sourceFile, context, config);

      // Calculate analysis time
      const analysisTimeMs = Date.now() - this.startTime;

      // Make decision
      const results: ValidationResults = {
        decision: this.makeDecision(context),
        confidence: this.calculateConfidence(context),
        issues: context.issues,
        metrics: context.metrics,
        analysisTimeMs,
      };

      // Log validation results
      this.logger.logValidation(input, results);

      // Handle decision
      return this.handleValidationDecision(results, input, filePath, content, config);
    } catch (error) {
      this.logger.error('judge', 'Validation error', error);
      return this.ask(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Initialize analysis context with default values
   */
  private initializeAnalysisContext(sourceFile: ts.SourceFile, config: JudgeConfig): ASTAnalysisContext {
    return {
      sourceFile,
      config,
      issues: [],
      metrics: {
        complexity: {
          cyclomaticComplexity: 0,
          cognitiveComplexity: 0,
          nestingDepth: 0,
          functionLength: 0,
          parameterCount: 0,
          totalFunctions: 0,
          highComplexityFunctions: 0,
        },
        security: {
          criticalIssues: 0,
          errorIssues: 0,
          warningIssues: 0,
          categories: {
            injection: 0,
            xss: 0,
            crypto: 0,
            auth: 0,
            dataExposure: 0,
          },
        },
        semantics: {
          apiContractViolations: 0,
          typeInconsistencies: 0,
          namingViolations: 0,
          duplicateCodeInstances: 0,
        },
      },
    };
  }

  /**
   * Run all configured analyses on the source file
   */
  private async runAnalyses(
    sourceFile: ts.SourceFile,
    context: ASTAnalysisContext,
    config: JudgeConfig
  ): Promise<void> {
    // Run complexity analysis
    const complexityAnalyzer = new ComplexityAnalyzer(this.parser, this.logger, config.complexity);
    complexityAnalyzer.analyze(sourceFile, context);

    // Run security scanning
    if (config.security.enabled) {
      const securityScanner = new SecurityScanner(this.parser, this.logger, config.security.rules);
      securityScanner.scan(sourceFile, context);
    }

    // Run semantic checks
    if (config.semantics.enabled) {
      const semanticChecker = new SemanticChecker(this.parser, this.logger, config.semantics.checks);
      semanticChecker.check(sourceFile, context);
    }

    // Run tests if enabled
    if (config.tests.enabled) {
      await this.runTestsAndAddIssues(context, config.tests);
    }
  }

  /**
   * Run tests and add failures as validation issues
   */
  private async runTestsAndAddIssues(
    context: ASTAnalysisContext,
    testConfig: JudgeConfig['tests']
  ): Promise<void> {
    const testResults = await this.testRunner.runTests(testConfig);

    // Add test failures as validation issues
    if (!testResults.skipped && testResults.failures.length > 0) {
      for (const failure of testResults.failures) {
        context.issues.push({
          type: 'test',
          severity: testConfig.failOnTestFailure ? 'error' : 'warning',
          location: {
            file: failure.testFile,
            line: failure.line,
            column: failure.column,
          },
          message: `Test failure: ${failure.testName}`,
          rule: 'test-failure',
          suggestion: failure.message,
        });
      }
    }

    // Store test metrics
    const testMetrics: TestMetrics = {
      totalTests: testResults.totalTests,
      passedTests: testResults.passedTests,
      failedTests: testResults.failedTests,
      skippedTests: testResults.skippedTests,
      failures: testResults.failures,
    };

    context.metrics.tests = testMetrics;
  }

  /**
   * Handle the validation decision and return appropriate response
   */
  private async handleValidationDecision(
    results: ValidationResults,
    input: JudgeHookInput,
    filePath: string,
    content: string,
    config: JudgeConfig
  ): Promise<JudgeHookOutput> {
    if (results.decision === 'allow') {
      return this.handleAllowDecision(results, input, filePath);
    }

    return this.handleDenyDecision(results, input, filePath, content, config);
  }

  /**
   * Handle allow decision
   */
  private async handleAllowDecision(
    results: ValidationResults,
    input: JudgeHookInput,
    filePath: string
  ): Promise<JudgeHookOutput> {
    this.logger.info('judge', `Validation passed for ${filePath}`);
    this.feedbackGenerator.clearRetryState();

    // Trigger MCP documentation updates after successful validation
    await this.triggerDocumentationUpdates(input.cwd, filePath, results);

    return this.allow('Code quality validation passed');
  }

  /**
   * Handle deny decision
   */
  private async handleDenyDecision(
    results: ValidationResults,
    input: JudgeHookInput,
    filePath: string,
    content: string,
    config: JudgeConfig
  ): Promise<JudgeHookOutput> {
    this.logger.warn('judge', `Validation failed for ${filePath}`, {
      issuesCount: results.issues.length,
      critical: results.issues.filter((i) => i.severity === 'critical').length,
    });

    // Check if max retries reached
    if (this.feedbackGenerator.hasMaxRetriesReached(config.maxRetries)) {
      this.logger.warn('judge', 'Max retries reached, allowing with warning');
      this.feedbackGenerator.clearRetryState();
      return this.allow('⚠️ Maximum validation retries reached. Proceeding with potential quality issues.');
    }

    // Update retry state
    this.feedbackGenerator.updateRetryState(
      input.session_id,
      filePath,
      content,
      results,
      config.maxRetries
    );

    // Generate correction prompt
    const retryState = this.feedbackGenerator.loadRetryState();
    const correctionPrompt = this.feedbackGenerator.generateCorrectionPrompt(
      {
        sessionId: input.session_id,
        filePath,
        retryCount: retryState?.retryCount || 1,
        maxRetries: config.maxRetries,
      },
      results
    );

    return this.deny(correctionPrompt);
  }

  /**
   * Trigger documentation updates via MCP
   */
  private async triggerDocumentationUpdates(
    projectPath: string,
    currentFile: string,
    results: ValidationResults
  ): Promise<void> {
    if (!this.docTrigger || !this.mcpClient) {
      return;
    }

    try {
      this.logger.info('judge', 'Triggering documentation updates', {
        changedFiles: this.changedFiles.size,
        currentFile,
      });

      // Analyze triggers and execute actions
      const actions = await this.docTrigger.analyzeTriggers({
        projectPath,
        changedFiles: Array.from(this.changedFiles),
        validatedFiles: [currentFile],
        issues: results.issues,
      });

      if (actions.length > 0) {
        this.logger.info('judge', `Executing ${actions.length} documentation action(s)`);
        await this.docTrigger.executeActions(actions);

        // Clear changed files after processing
        this.changedFiles.clear();
      } else {
        this.logger.debug('judge', 'No documentation triggers matched');
      }
    } catch (error) {
      // Non-blocking: log error but don't fail validation
      this.logger.warn('judge', `Documentation update failed: ${error}`);
    }
  }

  /**
   * Make allow/deny decision based on issues found
   */
  private makeDecision(context: ASTAnalysisContext): Decision {
    if (this.hasCriticalIssues(context)) {
      return 'deny';
    }

    if (this.hasErrorIssues(context)) {
      return 'deny';
    }

    if (this.hasSecurityIssues(context)) {
      return 'deny';
    }

    if (this.hasTestFailures(context)) {
      return 'deny';
    }

    return 'allow';
  }

  /**
   * Check if context has critical issues
   */
  private hasCriticalIssues(context: ASTAnalysisContext): boolean {
    return context.issues.some((i) => i.severity === 'critical');
  }

  /**
   * Check if context has error issues
   */
  private hasErrorIssues(context: ASTAnalysisContext): boolean {
    return context.issues.some((i) => i.severity === 'error');
  }

  /**
   * Check if context has security issues
   */
  private hasSecurityIssues(context: ASTAnalysisContext): boolean {
    const { metrics } = context;
    return metrics.security.criticalIssues > 0 || metrics.security.errorIssues > 0;
  }

  /**
   * Check if context has test failures that should deny
   */
  private hasTestFailures(context: ASTAnalysisContext): boolean {
    const { metrics } = context;

    if (!metrics.tests || metrics.tests.failedTests === 0) {
      return false;
    }

    const config = this.configManager.getConfig();
    return config.tests.failOnTestFailure;
  }

  /**
   * Calculate confidence score for the decision
   */
  private calculateConfidence(context: ASTAnalysisContext): number {
    const { issues, metrics } = context;

    // Start with 100% confidence
    let confidence = 1.0;

    // Reduce confidence based on issues
    for (const issue of issues) {
      switch (issue.severity) {
        case 'critical':
          confidence -= 0.3;
          break;
        case 'error':
          confidence -= 0.2;
          break;
        case 'warning':
          confidence -= 0.05;
          break;
      }
    }

    // Ensure confidence is between 0 and 1
    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Generate allow response
   */
  private allow(reason: string): JudgeHookOutput {
    return {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'allow',
        permissionDecisionReason: reason,
      },
    };
  }

  /**
   * Generate deny response
   */
  private deny(reason: string): JudgeHookOutput {
    return {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason,
      },
    };
  }

  /**
   * Generate ask response
   */
  private ask(reason: string): JudgeHookOutput {
    return {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'ask',
        permissionDecisionReason: reason,
      },
    };
  }
}
