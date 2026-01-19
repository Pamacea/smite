/**
 * Feedback Generator and Context Re-injection
 * Generate correction prompts and manage retry state
 *
 * This implements the feedback loop mechanism described in the architecture document.
 * When validation fails, it generates a structured correction prompt that is
 * reinjected into the executor context via the permissionDecisionReason field.
 */

import * as fs from 'fs';
import * as path from 'path';
import { ValidationResults, ValidationIssue, RetryState, CodeChangeAttempt, TestFailure } from './types';
import { JudgeLogger } from './logger';

export class FeedbackGenerator {
  private logger: JudgeLogger;
  private retryStatePath: string;

  constructor(logger: JudgeLogger, cwd: string) {
    this.logger = logger;
    this.retryStatePath = path.join(cwd, '.smite', 'judge-retry-state.json');
  }

  /**
   * Generate correction prompt for failed validation
   * This prompt will be reinjected into Claude's context
   */
  generateCorrectionPrompt(
    input: {
      sessionId: string;
      filePath: string;
      retryCount: number;
      maxRetries: number;
    },
    results: ValidationResults
  ): string {
    const { filePath, retryCount, maxRetries } = input;

    // Group issues by severity
    const issueGroups = this.groupIssuesBySeverity(results.issues);

    // Build prompt sections
    const sections: string[] = [];

    sections.push(this.generateHeader(filePath));
    sections.push(this.generateSummary(results));

    const criticalSection = this.generateCriticalSection(issueGroups.critical);
    if (criticalSection) sections.push(criticalSection);

    const errorSection = this.generateErrorSection(issueGroups.error);
    if (errorSection) sections.push(errorSection);

    const warningSection = this.generateWarningSection(issueGroups.warning, issueGroups);
    if (warningSection) sections.push(warningSection);

    const testSection = this.generateTestSection(results.metrics.tests);
    if (testSection) sections.push(testSection);

    const suggestions = this.generateSuggestions(results);
    if (suggestions) sections.push(`## Suggestions\n${suggestions}`);

    sections.push(this.generateContextSection(retryCount, maxRetries, results));
    sections.push('Please revise your code to address these issues before proceeding.\n');

    return sections.join('\n');
  }

  /**
   * Group issues by severity
   */
  private groupIssuesBySeverity(issues: ValidationIssue[]): {
    critical: ValidationIssue[];
    error: ValidationIssue[];
    warning: ValidationIssue[];
  } {
    return {
      critical: issues.filter((i) => i.severity === 'critical'),
      error: issues.filter((i) => i.severity === 'error'),
      warning: issues.filter((i) => i.severity === 'warning'),
    };
  }

  /**
   * Generate prompt header
   */
  private generateHeader(filePath: string): string {
    let header = '🛑 CODE QUALITY GATE - VALIDATION FAILED\n\n';
    header += `Your recent code change to \`${filePath}\` has been blocked due to quality issues.\n\n`;
    header += '## Summary\n';
    return header;
  }

  /**
   * Generate critical issues section
   */
  private generateCriticalSection(criticalIssues: ValidationIssue[]): string {
    if (criticalIssues.length === 0) return '';

    let section = '## Critical Issues\n\n';
    for (const issue of criticalIssues) {
      section += this.formatIssue(issue, 1);
    }
    return section;
  }

  /**
   * Generate error issues section
   */
  private generateErrorSection(errorIssues: ValidationIssue[]): string {
    if (errorIssues.length === 0) return '';

    let section = '## Error Issues\n\n';
    const limitedErrors = errorIssues.slice(0, 5);

    for (const issue of limitedErrors) {
      section += this.formatIssue(issue, 2);
    }

    if (errorIssues.length > 5) {
      section += `... and ${errorIssues.length - 5} more error(s)\n\n`;
    }

    return section;
  }

  /**
   * Generate warnings section (only if no critical/error issues)
   */
  private generateWarningSection(
    warningIssues: ValidationIssue[],
    allGroups: { critical: ValidationIssue[]; error: ValidationIssue[] }
  ): string {
    // Only show warnings if no critical or error issues
    if (allGroups.critical.length > 0 || allGroups.error.length > 0) {
      return '';
    }

    if (warningIssues.length === 0) return '';

    let section = '## Warnings\n\n';
    const limitedWarnings = warningIssues.slice(0, 3);

    for (const issue of limitedWarnings) {
      section += this.formatIssue(issue, 3);
    }

    if (warningIssues.length > 3) {
      section += `... and ${warningIssues.length - 3} more warning(s)\n\n`;
    }

    return section;
  }

  /**
   * Generate test failures section
   */
  private generateTestSection(testMetrics: ValidationResults['metrics']['tests']): string {
    if (!testMetrics || testMetrics.failedTests === 0) return '';

    let section = '## Test Failures\n\n';
    const limitedFailures = testMetrics.failures.slice(0, 5);

    for (const failure of limitedFailures) {
      section += this.formatTestFailure(failure);
    }

    if (testMetrics.failures.length > 5) {
      section += `... and ${testMetrics.failures.length - 5} more test failure(s)\n\n`;
    }

    return section;
  }

  /**
   * Generate context section
   */
  private generateContextSection(
    retryCount: number,
    maxRetries: number,
    results: ValidationResults
  ): string {
    let context = '## Context\n';
    context += `- Attempt: ${retryCount}/${maxRetries}\n`;
    context += `- Confidence score: ${Math.round(results.confidence * 100)}%\n`;
    context += `- Analysis time: ${results.analysisTimeMs}ms\n`;

    const retryState = this.loadRetryState();
    if (retryState && retryState.previousAttempts.length > 0) {
      context += `- Previous attempts: ${retryState.previousAttempts.length}\n`;
    }

    return context + '\n';
  }

  /**
   * Generate a summary of issues
   */
  private generateSummary(results: ValidationResults): string {
    const lines: string[] = [];

    this.addComplexitySummary(results, lines);
    this.addSecuritySummary(results, lines);
    this.addSemanticSummary(results, lines);
    this.addTestSummary(results, lines);

    return lines.length > 0 ? lines.join('\n') : 'No specific issues detected.';
  }

  /**
   * Add complexity summary to lines
   */
  private addComplexitySummary(results: ValidationResults, lines: string[]): void {
    if (results.metrics.complexity.highComplexityFunctions > 0) {
      lines.push(
        `- Complexity: ${results.metrics.complexity.highComplexityFunctions} function(s) exceed threshold`
      );
    }
  }

  /**
   * Add security summary to lines
   */
  private addSecuritySummary(results: ValidationResults, lines: string[]): void {
    const securityIssues = results.metrics.security.criticalIssues + results.metrics.security.errorIssues;
    if (securityIssues === 0) return;

    const categories = Object.entries(results.metrics.security.categories)
      .filter(([_, count]) => count > 0)
      .map(([cat, count]) => `${count} ${cat}`)
      .join(', ');

    lines.push(`- Security: ${securityIssues} issue(s) (${categories})`);
  }

  /**
   * Add semantic summary to lines
   */
  private addSemanticSummary(results: ValidationResults, lines: string[]): void {
    if (results.metrics.semantics.namingViolations > 0) {
      lines.push(`- Semantics: ${results.metrics.semantics.namingViolations} naming violation(s)`);
    }
    if (results.metrics.semantics.typeInconsistencies > 0) {
      lines.push(`- Semantics: ${results.metrics.semantics.typeInconsistencies} type inconsistency(ies)`);
    }
  }

  /**
   * Add test summary to lines
   */
  private addTestSummary(results: ValidationResults, lines: string[]): void {
    if (!results.metrics.tests || results.metrics.tests.failedTests === 0) return;

    lines.push(
      `- Tests: ${results.metrics.tests.failedTests}/${results.metrics.tests.totalTests} test(s) failed`
    );
  }

  /**
   * Format a single issue for display
   */
  private formatIssue(issue: ValidationIssue, index: number): string {
    let text = `${index}. **${issue.message}**\n`;

    if (issue.location) {
      text += `   Location: \`${issue.location.file}:${issue.location.line}:${issue.location.column}\`\n`;
    }

    text += `   Rule: \`${issue.rule}\`\n`;

    if (issue.suggestion) {
      text += `   Fix: ${issue.suggestion}\n`;
    }

    if (issue.codeSnippet && issue.codeSnippet.length > 0) {
      const snippet = issue.codeSnippet.trim().substring(0, 200);
      text += `   \`\`\`\n${snippet}\n   \`\`\`\n`;
    }

    text += '\n';
    return text;
  }

  /**
   * Format a single test failure for display
   */
  private formatTestFailure(failure: TestFailure): string {
    let text = `- **${failure.testName}**\n`;
    text += `   File: \`${failure.testFile}:${failure.line}:${failure.column}\`\n`;

    if (failure.message) {
      const messageLines = failure.message.split('\n').slice(0, 3).join('\n');
      text += `   Error: ${messageLines}\n`;
    }

    text += '\n';
    return text;
  }

  /**
   * Generate actionable suggestions
   */
  private generateSuggestions(results: ValidationResults): string {
    const suggestions: string[] = [];

    for (const issue of results.issues) {
      if (issue.suggestion && !suggestions.includes(issue.suggestion)) {
        suggestions.push(`1. ${issue.suggestion}`);
      }
    }

    return suggestions.length > 0 ? suggestions.join('\n') : '';
  }

  /**
   * Load retry state from file
   */
  loadRetryState(): RetryState | null {
    try {
      if (fs.existsSync(this.retryStatePath)) {
        const content = fs.readFileSync(this.retryStatePath, 'utf-8');
        return JSON.parse(content);
      }
    } catch (error) {
      this.logger.warn('feedback', 'Failed to load retry state', error);
    }
    return null;
  }

  /**
   * Save retry state to file
   */
  saveRetryState(state: RetryState): void {
    try {
      const smiteDir = path.dirname(this.retryStatePath);
      if (!fs.existsSync(smiteDir)) {
        fs.mkdirSync(smiteDir, { recursive: true });
      }

      fs.writeFileSync(this.retryStatePath, JSON.stringify(state, null, 2));
      this.logger.debug('feedback', 'Saved retry state', {
        retryCount: state.retryCount,
        attempts: state.previousAttempts.length,
      });
    } catch (error) {
      this.logger.error('feedback', 'Failed to save retry state', error);
    }
  }

  /**
   * Update retry state after a failed validation
   */
  updateRetryState(
    sessionId: string,
    filePath: string,
    content: string,
    results: ValidationResults,
    maxRetries: number
  ): RetryState {
    const existing = this.loadRetryState();
    const contentHash = this.hashContent(content);

    const newAttempt: CodeChangeAttempt = {
      timestamp: Date.now(),
      filePath,
      contentHash,
      validationResults: results,
    };

    const state: RetryState = existing || {
      sessionId,
      retryCount: 0,
      maxRetries,
      lastFailureTimestamp: 0,
      issuesDetected: [],
      previousAttempts: [],
    };

    // Update state
    state.retryCount++;
    state.lastFailureTimestamp = Date.now();
    state.issuesDetected = results.issues;
    state.previousAttempts.push(newAttempt);

    // Keep only last 5 attempts
    if (state.previousAttempts.length > 5) {
      state.previousAttempts = state.previousAttempts.slice(-5);
    }

    this.saveRetryState(state);
    return state;
  }

  /**
   * Clear retry state (e.g., after successful validation)
   */
  clearRetryState(): void {
    try {
      if (fs.existsSync(this.retryStatePath)) {
        fs.unlinkSync(this.retryStatePath);
        this.logger.debug('feedback', 'Cleared retry state');
      }
    } catch (error) {
      this.logger.warn('feedback', 'Failed to clear retry state', error);
    }
  }

  /**
   * Generate simple hash of content for change detection
   */
  private hashContent(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  /**
   * Check if max retries have been reached
   */
  hasMaxRetriesReached(maxRetries: number): boolean {
    const state = this.loadRetryState();
    return state ? state.retryCount >= maxRetries : false;
  }
}
