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
interface SuggestionDisplay {
    show: boolean;
    type: 'next-agent' | 'technical-debt' | 'workflow-complete' | 'none';
    content?: string;
    priority: 'high' | 'medium' | 'low';
}
/**
 * Get current suggestion to display
 */
declare function getCurrentSuggestion(projectDir?: string): SuggestionDisplay;
/**
 * Format suggestion for display
 */
declare function formatSuggestion(suggestion: SuggestionDisplay): string;
/**
 * Display suggestion if available
 */
declare function displaySuggestion(projectDir?: string): void;
export { getCurrentSuggestion, formatSuggestion, displaySuggestion, SuggestionDisplay };
//# sourceMappingURL=suggest-display.d.ts.map