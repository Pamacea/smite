"use strict";
/**
 * Error Handler Utility
 *
 * Shared error handling utilities for consistent error responses
 * across API modules.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.success = success;
exports.error = error;
exports.errorMessage = errorMessage;
exports.safeAsync = safeAsync;
exports.safeSync = safeSync;
exports.refactorError = refactorError;
exports.docError = docError;
/**
 * Create a successful result
 */
function success(data) {
    return {
        success: true,
        data,
    };
}
/**
 * Create an error result
 */
function error(message) {
    return {
        success: false,
        error: message,
    };
}
/**
 * Convert an unknown error to a string message
 */
function errorMessage(error) {
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
async function safeAsync(fn, errorContext = 'Operation failed') {
    try {
        const data = await fn();
        return success(data);
    }
    catch (err) {
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
function safeSync(fn, errorContext = 'Operation failed') {
    try {
        const data = fn();
        return success(data);
    }
    catch (err) {
        return error(`${errorContext}: ${errorMessage(err)}`);
    }
}
function refactorError(type, err) {
    return {
        type,
        modifiedFiles: [],
        changeCount: 0,
        success: false,
        error: errorMessage(err),
    };
}
function docError(errorContext, err) {
    return {
        success: false,
        error: `${errorContext}: ${errorMessage(err)}`,
        content: undefined,
        filePath: undefined,
    };
}
//# sourceMappingURL=error-handler.js.map