/**
 * Error Handler Utility
 *
 * Shared error handling utilities for consistent error responses
 * across API modules.
 */
/**
 * Error result type
 */
export interface ErrorResult<T> {
    success: false;
    error: string;
    data?: T;
}
/**
 * Success result type
 */
export interface SuccessResult<T> {
    success: true;
    data: T;
}
/**
 * Result type that can be either success or error
 */
export type Result<T> = SuccessResult<T> | ErrorResult<T>;
/**
 * Create a successful result
 */
export declare function success<T>(data: T): SuccessResult<T>;
/**
 * Create an error result
 */
export declare function error<T = never>(message: string): ErrorResult<T>;
/**
 * Convert an unknown error to a string message
 */
export declare function errorMessage(error: unknown): string;
/**
 * Wrap an async function with standard error handling
 *
 * @param fn - The async function to wrap
 * @param errorContext - Context to include in error messages
 * @returns A result object with success status
 *
 * @example
 * ```ts
 * const result = await safeAsync(
 *   () => readFile(path),
 *   'Failed to read file'
 * );
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export declare function safeAsync<T>(fn: () => Promise<T>, errorContext?: string): Promise<Result<T>>;
/**
 * Wrap a synchronous function with standard error handling
 *
 * @param fn - The function to wrap
 * @param errorContext - Context to include in error messages
 * @returns A result object with success status
 */
export declare function safeSync<T>(fn: () => T, errorContext?: string): Result<T>;
/**
 * Create a result object for refactoring operations
 */
export interface RefactorResultData {
    type: string;
    modifiedFiles: string[];
    changeCount: number;
    diff?: string;
    backupPath?: string;
}
export declare function refactorError<T extends string>(type: T, err: unknown): Omit<RefactorResultData, 'diff' | 'backupPath'> & {
    success: false;
    error: string;
    type: T;
};
/**
 * Create a result object for documentation operations
 */
export interface DocResultData {
    content: string;
    filePath: string;
}
export declare function docError(errorContext: string, err: unknown): {
    success: false;
    error: string;
    content?: string;
    filePath?: string;
};
//# sourceMappingURL=error-handler.d.ts.map