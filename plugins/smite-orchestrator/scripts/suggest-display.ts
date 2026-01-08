#!/usr/bin/env node

/**
 * SMITE Orchestrator - Suggestion Display System
 *
 * Displays suggestions to users in a non-intrusive way.
 * Hook: UserPromptSubmit - shows suggestions when relevant
 *
 * Usage:
 *   ts-node suggest-display.ts [project_dir]
 */

import * as fs from 'fs';
import * as path from 'path';
import { loadState } from './state-manager';

interface SuggestionDisplay {
  show: boolean;
  type: 'next-agent' | 'technical-debt' | 'workflow-complete' | 'none';
  content?: string;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Get current suggestion to display
 */
function getCurrentSuggestion(projectDir: string = process.cwd()): SuggestionDisplay {
  const state = loadState(projectDir);

  if (!state) {
    return {
      show: false,
      type: 'none',
      priority: 'low'
    };
  }

  // Check for high-priority technical debt first
  const debtPath = path.join(projectDir, '.smite', 'suggestions', 'fix-surgeon.md');
  if (fs.existsSync(debtPath)) {
    const debtContent = fs.readFileSync(debtPath, 'utf-8');
    const hasHighSeverity = debtContent.includes('## 🚨 High Severity') &&
                           !debtContent.includes('*No high severity issues*');

    if (hasHighSeverity) {
      return {
        show: true,
        type: 'technical-debt',
        priority: 'high',
        content: debtContent
      };
    }
  }

  // Check for next agent suggestion
  const nextPath = path.join(projectDir, '.smite', 'suggestions', 'next-action.md');
  if (fs.existsSync(nextPath)) {
    const nextContent = fs.readFileSync(nextPath, 'utf-8');

    // Only show if not workflow complete
    if (!nextContent.includes('Workflow Complete!')) {
      return {
        show: true,
        type: 'next-agent',
        priority: 'medium',
        content: nextContent
      };
    }
  }

  return {
    show: false,
    type: 'none',
    priority: 'low'
  };
}

/**
 * Format suggestion for display
 */
function formatSuggestion(suggestion: SuggestionDisplay): string {
  if (!suggestion.show) {
    return '';
  }

  let output = '\n';
  output += '═'.repeat(60) + '\n';
  output += '🎯 SMITE ORCHESTRATOR SUGGESTION\n';
  output += '═'.repeat(60) + '\n\n';

  if (suggestion.type === 'technical-debt') {
    output += '⚠️  PRIORITY: HIGH\n\n';
    output += 'Technical debt detected that should be addressed.\n';
    output += 'See full details in: `.smite/suggestions/fix-surgeon.md`\n\n';
  } else if (suggestion.type === 'next-agent') {
    output += '💡 SUGGESTION\n\n';
    output += 'Ready to continue the workflow?\n';
    output += 'See recommendation in: `.smite/suggestions/next-action.md`\n\n';
  } else if (suggestion.type === 'workflow-complete') {
    output += '🎉 WORKFLOW COMPLETE\n\n';
    output += 'All SMITE agents have been executed!\n\n';
  }

  output += '═'.repeat(60) + '\n';

  return output;
}

/**
 * Display suggestion if available
 */
function displaySuggestion(projectDir: string = process.cwd()): void {
  const suggestion = getCurrentSuggestion(projectDir);

  if (suggestion.show) {
    console.log(formatSuggestion(suggestion));
  }
}

/**
 * CLI interface
 */
function main(): void {
  const args = process.argv.slice(2);
  const projectDir = args[0] || process.cwd();

  const suggestion = getCurrentSuggestion(projectDir);

  if (suggestion.show) {
    console.log(formatSuggestion(suggestion));
  } else {
    console.log('No suggestions to display');
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export {
  getCurrentSuggestion,
  formatSuggestion,
  displaySuggestion,
  SuggestionDisplay
};
