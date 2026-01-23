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
export function success<T>(data: T): SuccessResult<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Create an error result
 */
export function error<T = never>(message: string): ErrorResult<T> {
  return {
    success: false,
    error: message,
  };
}

/**
 * Convert an unknown error to a string message
 */
export function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

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
export async function safeAsync<T>(
  fn: () => Promise<T>,
  errorContext: string = 'Operation failed'
): Promise<Result<T>> {
  try {
    const data = await fn();
    return success(data);
  } catch (err) {
    return error(`${errorContext}: ${errorMessage(err)}`);
  }
}

/**
 * Wrap a synchronous function with standard error handling
 *
 * @param fn - The function to wrap
 * @param errorContext - Context to include in error messages
 * @returns A result object with success status
 */
export function safeSync<T>(
  fn: () => T,
  errorContext: string = 'Operation failed'
): Result<T> {
  try {
    const data = fn();
    return success(data);
  } catch (err) {
    return error(`${errorContext}: ${errorMessage(err)}`);
  }
}

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

export function refactorError<T extends string>(
  type: T,
  err: unknown
): Omit<RefactorResultData, 'diff' | 'backupPath'> & { success: false; error: string; type: T } {
  return {
    type,
    modifiedFiles: [],
    changeCount: 0,
    success: false,
    error: errorMessage(err),
  };
}

/**
 * Create a result object for documentation operations
 */
export interface DocResultData {
  content: string;
  filePath: string;
}

export function docError(
  errorContext: string,
  err: unknown
): { success: false; error: string; content?: string; filePath?: string } {
  return {
    success: false,
    error: `${errorContext}: ${errorMessage(err)}`,
    content: undefined,
    filePath: undefined,
  };
}
