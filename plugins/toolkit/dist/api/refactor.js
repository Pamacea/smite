"use strict";
/**
 * Refactoring API
 *
 * APIs for automated refactoring including code simplification,
 * dead code elimination, and structure optimization.
 *
 * @module api/refactor
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
exports.RefactoringAPI = exports.RefactorType = void 0;
exports.createRefactoring = createRefactoring;
const ts_morph_1 = require("ts-morph");
const error_handler_1 = require("../core/utils/error-handler");
/**
 * Refactoring type
 */
var RefactorType;
(function (RefactorType) {
    RefactorType["SIMPLIFY"] = "simplify";
    RefactorType["REMOVE_DEAD_CODE"] = "remove_dead_code";
    RefactorType["OPTIMIZE_STRUCTURE"] = "optimize_structure";
    RefactorType["RENAME_VARIABLES"] = "rename_variables";
    RefactorType["EXTRACT_FUNCTION"] = "extract_function";
})(RefactorType || (exports.RefactorType = RefactorType = {}));
/**
 * Refactoring API class
 */
class RefactoringAPI {
    constructor() {
        this.project = new ts_morph_1.Project({
            skipFileDependencyResolution: true,
            compilerOptions: {
                allowJs: true,
            },
        });
    }
    /**
     * Simplify code
     */
    async simplifyCode(filePath, options) {
        try {
            const dryRun = options?.dryRun ?? false;
            // Load source file
            const sourceFile = this.addSourceFile(filePath);
            if (!sourceFile) {
                return {
                    type: RefactorType.SIMPLIFY,
                    modifiedFiles: [],
                    changeCount: 0,
                    success: false,
                    error: 'Failed to load source file',
                };
            }
            // Create backup if needed
            let backupPath;
            if (options?.createBackup && !dryRun) {
                backupPath = await this.createBackup(filePath);
            }
            const oldText = sourceFile.getFullText();
            let changeCount = 0;
            // Simplify complex expressions
            changeCount += this.simplifyExpressions(sourceFile);
            // Remove unnecessary braces
            changeCount += this.removeUnnecessaryBraces(sourceFile);
            // Simplify conditionals
            changeCount += this.simplifyConditionals(sourceFile);
            const newText = sourceFile.getFullText();
            // Generate diff
            const diff = this.generateDiff(oldText, newText);
            // Apply changes if not dry run
            if (!dryRun && changeCount > 0) {
                if (options?.applyChanges !== false) {
                    sourceFile.saveSync();
                }
            }
            return {
                type: RefactorType.SIMPLIFY,
                modifiedFiles: changeCount > 0 ? [filePath] : [],
                changeCount,
                success: true,
                diff,
                backupPath,
            };
        }
        catch (err) {
            return (0, error_handler_1.refactorError)(RefactorType.SIMPLIFY, err);
        }
    }
    /**
     * Remove dead code
     */
    async removeDeadCode(filePath, options) {
        try {
            const dryRun = options?.dryRun ?? false;
            // Load source file
            const sourceFile = this.addSourceFile(filePath);
            if (!sourceFile) {
                return {
                    type: RefactorType.REMOVE_DEAD_CODE,
                    modifiedFiles: [],
                    changeCount: 0,
                    success: false,
                    error: 'Failed to load source file',
                };
            }
            // Create backup if needed
            let backupPath;
            if (options?.createBackup && !dryRun) {
                backupPath = await this.createBackup(filePath);
            }
            const oldText = sourceFile.getFullText();
            let changeCount = 0;
            // Remove unused imports
            changeCount += this.removeUnusedImports(sourceFile);
            // Remove unused variables
            changeCount += this.removeUnusedVariables(sourceFile);
            // Remove unreachable code
            changeCount += this.removeUnreachableCode(sourceFile);
            const newText = sourceFile.getFullText();
            // Generate diff
            const diff = this.generateDiff(oldText, newText);
            // Apply changes if not dry run
            if (!dryRun && changeCount > 0) {
                if (options?.applyChanges !== false) {
                    sourceFile.saveSync();
                }
            }
            return {
                type: RefactorType.REMOVE_DEAD_CODE,
                modifiedFiles: changeCount > 0 ? [filePath] : [],
                changeCount,
                success: true,
                diff,
                backupPath,
            };
        }
        catch (err) {
            return (0, error_handler_1.refactorError)(RefactorType.REMOVE_DEAD_CODE, err);
        }
    }
    /**
     * Optimize code structure
     */
    async optimizeStructure(filePath, options) {
        try {
            const dryRun = options?.dryRun ?? false;
            // Load source file
            const sourceFile = this.addSourceFile(filePath);
            if (!sourceFile) {
                return {
                    type: RefactorType.OPTIMIZE_STRUCTURE,
                    modifiedFiles: [],
                    changeCount: 0,
                    success: false,
                    error: 'Failed to load source file',
                };
            }
            // Create backup if needed
            let backupPath;
            if (options?.createBackup && !dryRun) {
                backupPath = await this.createBackup(filePath);
            }
            const oldText = sourceFile.getFullText();
            let changeCount = 0;
            // Reorganize imports
            changeCount += this.organizeImports(sourceFile);
            // Sort class members
            changeCount += this.sortClassMembers(sourceFile);
            // Extract magic numbers to constants
            changeCount += this.extractConstants(sourceFile);
            const newText = sourceFile.getFullText();
            // Generate diff
            const diff = this.generateDiff(oldText, newText);
            // Apply changes if not dry run
            if (!dryRun && changeCount > 0) {
                if (options?.applyChanges !== false) {
                    sourceFile.saveSync();
                }
            }
            return {
                type: RefactorType.OPTIMIZE_STRUCTURE,
                modifiedFiles: changeCount > 0 ? [filePath] : [],
                changeCount,
                success: true,
                diff,
                backupPath,
            };
        }
        catch (err) {
            return (0, error_handler_1.refactorError)(RefactorType.OPTIMIZE_STRUCTURE, err);
        }
    }
    /**
     * Calculate code complexity
     */
    calculateComplexity(sourceFile) {
        const functions = sourceFile.getFunctions();
        let totalCyclomatic = 0;
        let maxNestingDepth = 0;
        let maxFunctionLength = 0;
        let maxParameterCount = 0;
        for (const func of functions) {
            // Cyclomatic complexity (simplified)
            const body = func.getBody()?.getText() || '';
            const decisions = (body.match(/if|for|while|case|catch/g) || []).length;
            totalCyclomatic += decisions + 1;
            // Nesting depth
            const maxDepth = this.calculateNestingDepth(body);
            maxNestingDepth = Math.max(maxNestingDepth, maxDepth);
            // Function length
            const lines = body.split('\n').length;
            maxFunctionLength = Math.max(maxFunctionLength, lines);
            // Parameter count
            const params = func.getParameters().length;
            maxParameterCount = Math.max(maxParameterCount, params);
        }
        return {
            cyclomatic: functions.length > 0 ? totalCyclomatic / functions.length : 0,
            nestingDepth: maxNestingDepth,
            functionLength: maxFunctionLength,
            parameterCount: maxParameterCount,
        };
    }
    /**
     * Add source file to project
     */
    addSourceFile(filePath) {
        try {
            return this.project.addSourceFileAtPath(filePath);
        }
        catch {
            return null;
        }
    }
    /**
     * Create backup of file
     */
    async createBackup(filePath) {
        const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
        const path = await Promise.resolve().then(() => __importStar(require('path')));
        const backupPath = `${filePath}.backup`;
        await fs.copyFile(filePath, backupPath);
        return backupPath;
    }
    /**
     * Generate diff between two texts
     */
    generateDiff(oldText, newText) {
        const lines1 = oldText.split('\n');
        const lines2 = newText.split('\n');
        const diff = [];
        for (let i = 0; i < Math.max(lines1.length, lines2.length); i++) {
            const line1 = lines1[i];
            const line2 = lines2[i];
            if (line1 !== line2) {
                if (line1 !== undefined) {
                    diff.push(`- ${line1}`);
                }
                if (line2 !== undefined) {
                    diff.push(`+ ${line2}`);
                }
            }
        }
        return diff.join('\n');
    }
    /**
     * Calculate nesting depth
     */
    calculateNestingDepth(text) {
        let maxDepth = 0;
        let currentDepth = 0;
        for (const char of text) {
            if (char === '{') {
                currentDepth++;
                maxDepth = Math.max(maxDepth, currentDepth);
            }
            else if (char === '}') {
                currentDepth--;
            }
        }
        return maxDepth;
    }
    /**
     * Simplify expressions
     * Note: Not yet implemented - would use ts-morph to simplify complex expressions
     */
    simplifyExpressions(sourceFile) {
        return 0;
    }
    /**
     * Remove unnecessary braces
     * Note: Not yet implemented - would identify single-statement blocks
     */
    removeUnnecessaryBraces(sourceFile) {
        return 0;
    }
    /**
     * Simplify conditionals
     * Note: Not yet implemented - would simplify complex boolean expressions
     */
    simplifyConditionals(sourceFile) {
        return 0;
    }
    /**
     * Remove unused imports
     */
    removeUnusedImports(sourceFile) {
        let count = 0;
        // Get all imports
        const imports = sourceFile.getImportDeclarations();
        for (const imp of imports) {
            // Check if import is used
            const name = imp.getDefaultImport()?.getText() ||
                imp.getNamedImports()[0]?.getText();
            if (!name)
                continue;
            const usages = sourceFile.getDescendantsOfKind(ts_morph_1.SyntaxKind.Identifier)
                .filter(id => id.getText() === name);
            if (usages.length === 0) {
                imp.remove();
                count++;
            }
        }
        return count;
    }
    /**
     * Remove unused variables
     * Note: Not yet implemented - would identify variables declared but never used
     */
    removeUnusedVariables(sourceFile) {
        return 0;
    }
    /**
     * Remove unreachable code
     * Note: Not yet implemented - would identify code after return statements
     */
    removeUnreachableCode(sourceFile) {
        return 0;
    }
    /**
     * Organize imports
     * Note: Not yet implemented - would group and sort imports
     */
    organizeImports(sourceFile) {
        return 0;
    }
    /**
     * Sort class members
     * Note: Not yet implemented - would sort members by visibility and type
     */
    sortClassMembers(sourceFile) {
        return 0;
    }
    /**
     * Extract magic numbers to constants
     * Note: Not yet implemented - would identify and extract magic numbers
     */
    extractConstants(sourceFile) {
        return 0;
    }
}
exports.RefactoringAPI = RefactoringAPI;
/**
 * Factory function
 */
function createRefactoring() {
    return new RefactoringAPI();
}
//# sourceMappingURL=refactor.js.map