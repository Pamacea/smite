#!/usr/bin/env node
/**
 * SMITE Orchestrator - Technical Debt Detector
 *
 * Fast pattern matching for technical debt detection.
 * Hook: PostToolUse (Write tool) - analyzes code after writes
 *
 * Usage:
 *   ts-node detect-debt.ts file <file_path> [project_dir]
 *   ts-node detect-debt.ts scan [dir] [project_dir]
 */
interface DebtIssue {
    type: string;
    severity: 'high' | 'medium' | 'low';
    message: string;
    recommendation: string;
    line: number;
    column: number;
    code: string;
}
interface DebtDetectionResult {
    analyzed: boolean;
    reason?: string;
    issues_found?: number;
    issues?: DebtIssue[];
    file?: string;
    summary?: {
        bySeverity: {
            high: number;
            medium: number;
            low: number;
        };
        byType: Record<string, number>;
    };
    error?: string;
}
interface ScanResult {
    files_scanned: number;
    files_with_issues: number;
    total_issues: number;
    issues_by_file: Record<string, DebtDetectionResult>;
}
/**
 * Check if file should be analyzed
 */
declare function shouldAnalyze(filePath: string): boolean;
/**
 * Detect technical debt in file
 */
declare function detectDebt(filePath: string, projectDir?: string): DebtDetectionResult;
/**
 * Scan directory for technical debt
 */
declare function scanDirectory(dir?: string): ScanResult;
export { detectDebt, scanDirectory, shouldAnalyze, DebtIssue, DebtDetectionResult, ScanResult };
//# sourceMappingURL=detect-debt.d.ts.map