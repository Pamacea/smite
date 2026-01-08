#!/usr/bin/env node
"use strict";
/**
 * SMITE Orchestrator - Suggestion Display System
 *
 * Displays suggestions to users in a non-intrusive way.
 * Hook: UserPromptSubmit - shows suggestions when relevant
 *
 * Usage:
 *   ts-node suggest-display.ts [project_dir]
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentSuggestion = getCurrentSuggestion;
exports.formatSuggestion = formatSuggestion;
exports.displaySuggestion = displaySuggestion;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const state_manager_1 = require("./state-manager");
/**
 * Get current suggestion to display
 */
function getCurrentSuggestion(projectDir = process.cwd()) {
    const state = (0, state_manager_1.loadState)(projectDir);
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
function formatSuggestion(suggestion) {
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
    }
    else if (suggestion.type === 'next-agent') {
        output += '💡 SUGGESTION\n\n';
        output += 'Ready to continue the workflow?\n';
        output += 'See recommendation in: `.smite/suggestions/next-action.md`\n\n';
    }
    else if (suggestion.type === 'workflow-complete') {
        output += '🎉 WORKFLOW COMPLETE\n\n';
        output += 'All SMITE agents have been executed!\n\n';
    }
    output += '═'.repeat(60) + '\n';
    return output;
}
/**
 * Display suggestion if available
 */
function displaySuggestion(projectDir = process.cwd()) {
    const suggestion = getCurrentSuggestion(projectDir);
    if (suggestion.show) {
        console.log(formatSuggestion(suggestion));
    }
}
/**
 * CLI interface
 */
function main() {
    const args = process.argv.slice(2);
    const projectDir = args[0] || process.cwd();
    const suggestion = getCurrentSuggestion(projectDir);
    if (suggestion.show) {
        console.log(formatSuggestion(suggestion));
    }
    else {
        console.log('No suggestions to display');
    }
}
// Run if called directly
if (require.main === module) {
    main();
}
//# sourceMappingURL=suggest-display.js.map