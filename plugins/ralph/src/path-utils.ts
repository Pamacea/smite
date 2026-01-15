// SMITE Ralph - Path Utilities
// Path sanitization and validation for security

import * as path from "path";
import * as fs from "fs";

/**
 * Sanitize a file path to prevent path traversal attacks
 * Ensures the path is within the allowed base directory
 *
 * @param userPath - User-provided file path
 * @param allowedBase - Allowed base directory (default: current working directory)
 * @returns Sanitized absolute path
 * @throws Error if path tries to escape base directory
 */
export function sanitizePath(userPath: string, allowedBase: string = process.cwd()): string {
  // Resolve to absolute path
  const resolvedPath = path.resolve(userPath);

  // Resolve allowed base to absolute path
  const resolvedBase = path.resolve(allowedBase);

  // Check if the resolved path is within the allowed base
  const relativePath = path.relative(resolvedBase, resolvedPath);

  // If relative path starts with '..', it's trying to escape
  if (relativePath.startsWith("..")) {
    throw new Error(
      `Path traversal detected: ${userPath} tries to escape allowed base directory ${resolvedBase}`
    );
  }

  return resolvedPath;
}

/**
 * Validate that a path is safe and within allowed boundaries
 *
 * @param userPath - User-provided file path
 * @param allowedBase - Allowed base directory (default: current working directory)
 * @returns true if path is safe
 * @throws Error if path is unsafe
 */
export function validateSafePath(userPath: string, allowedBase: string = process.cwd()): boolean {
  const sanitized = sanitizePath(userPath, allowedBase);

  // Ensure the file exists (optional, based on use case)
  try {
    fs.accessSync(sanitized, fs.constants.F_OK);
    return true;
  } catch {
    // File doesn't exist, but path is safe
    return true;
  }
}

/**
 * Sanitize multiple paths at once
 *
 * @param paths - Array of user-provided paths
 * @param allowedBase - Allowed base directory (default: current working directory)
 * @returns Array of sanitized paths
 * @throws Error if any path is unsafe
 */
export function sanitizePaths(paths: string[], allowedBase: string = process.cwd()): string[] {
  return paths.map((p) => sanitizePath(p, allowedBase));
}

/**
 * Join path segments and sanitize the result
 *
 * @param segments - Path segments to join
 * @param allowedBase - Allowed base directory (default: current working directory)
 * @returns Sanitized joined path
 */
export function sanitizeJoin(...segments: string[]): string {
  const joined = path.join(...segments);
  return sanitizePath(joined);
}

/**
 * Check if a path is a child of another path
 *
 * @param childPath - Potential child path
 * @param parentPath - Potential parent path
 * @returns true if childPath is within parentPath
 */
export function isPathChild(childPath: string, parentPath: string): boolean {
  const resolvedChild = path.resolve(childPath);
  const resolvedParent = path.resolve(parentPath);
  const relative = path.relative(resolvedParent, resolvedChild);
  return !relative.startsWith("..");
}
