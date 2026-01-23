/**
 * Refactoring API
 *
 * APIs for automated refactoring including code simplification,
 * dead code elimination, and structure optimization.
 *
 * @module api/refactor
 */
import { type SourceFile } from 'ts-morph';
/**
 * Refactoring type
 */
export declare enum RefactorType {
    SIMPLIFY = "simplify",
    REMOVE_DEAD_CODE = "remove_dead_code",
    OPTIMIZE_STRUCTURE = "optimize_structure",
    RENAME_VARIABLES = "rename_variables",
    EXTRACT_FUNCTION = "extract_function"
}
/**
 * Refactoring result
 */
export interface RefactorResult {
    /** Type of refactoring performed */
    type: RefactorType;
    /** Files modified */
    modifiedFiles: string[];
    /** Number of changes made */
    changeCount: number;
    /** Success status */
    success: boolean;
    /** Error message if failed */
    error?: string;
    /** Diff of changes */
    diff?: string;
    /** Backup file path */
    backupPath?: string;
}
/**
 * Refactoring options
 */
export interface RefactorOptions {
    /** Whether to create backup */
    createBackup?: boolean;
    /** Whether to apply changes */
    applyChanges?: boolean;
    /** Maximum file size to process (bytes) */
    maxFileSize?: number;
    /** File patterns to include */
    includePatterns?: string[];
    /** File patterns to exclude */
    excludePatterns?: string[];
    /** Dry run (don't modify files) */
    dryRun?: boolean;
}
/**
 * Code complexity metrics
 */
interface ComplexityMetrics {
    /** Cyclomatic complexity */
    cyclomatic: number;
    /** Nesting depth */
    nestingDepth: number;
    /** Function length */
    functionLength: number;
    /** Parameter count */
    parameterCount: number;
}
/**
 * Refactoring API class
 */
export declare class RefactoringAPI {
    private project;
    constructor();
    /**
     * Simplify code
     */
    simplifyCode(filePath: string, options?: RefactorOptions): Promise<RefactorResult>;
    /**
     * Remove dead code
     */
    removeDeadCode(filePath: string, options?: RefactorOptions): Promise<RefactorResult>;
    /**
     * Optimize code structure
     */
    optimizeStructure(filePath: string, options?: RefactorOptions): Promise<RefactorResult>;
    /**
     * Calculate code complexity
     */
    calculateComplexity(sourceFile: SourceFile): ComplexityMetrics;
    /**
     * Add source file to project
     */
    private addSourceFile;
    /**
     * Create backup of file
     */
    private createBackup;
    /**
     * Generate diff between two texts
     */
    private generateDiff;
    /**
     * Calculate nesting depth
     */
    private calculateNestingDepth;
    /**
     * Simplify expressions
     * Note: Not yet implemented - would use ts-morph to simplify complex expressions
     */
    private simplifyExpressions;
    /**
     * Remove unnecessary braces
     * Note: Not yet implemented - would identify single-statement blocks
     */
    private removeUnnecessaryBraces;
    /**
     * Simplify conditionals
     * Note: Not yet implemented - would simplify complex boolean expressions
     */
    private simplifyConditionals;
    /**
     * Remove unused imports
     */
    private removeUnusedImports;
    /**
     * Remove unused variables
     * Note: Not yet implemented - would identify variables declared but never used
     */
    private removeUnusedVariables;
    /**
     * Remove unreachable code
     * Note: Not yet implemented - would identify code after return statements
     */
    private removeUnreachableCode;
    /**
     * Organize imports
     * Note: Not yet implemented - would group and sort imports
     */
    private organizeImports;
    /**
     * Sort class members
     * Note: Not yet implemented - would sort members by visibility and type
     */
    private sortClassMembers;
    /**
     * Extract magic numbers to constants
     * Note: Not yet implemented - would identify and extract magic numbers
     */
    private extractConstants;
}
/**
 * Factory function
 */
export declare function createRefactoring(): RefactoringAPI;
export {};
//# sourceMappingURL=refactor.d.ts.map