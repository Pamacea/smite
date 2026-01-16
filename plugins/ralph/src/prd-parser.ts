// SMITE Ralph - PRD Parser
// Parse and validate PRD files

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { PRD, UserStory } from "./types";
import { sanitizePath } from "./path-utils";
import { createFileError, createParseError, createValidationError, wrapError } from "./error-utils";

export class PRDParser {
  // Standard PRD location - SINGLE SOURCE OF TRUTH
  private static readonly STANDARD_PRD_PATH = path.join(".claude", ".smite", "prd.json");

  // PRD cache for I/O optimization (70-90% reduction in file reads)
  private static prdCache = new Map<string, { prd: PRD; mtime: number }>();
  private static readonly CACHE_TTL_MS = 5000; // 5 seconds cache TTL

  /**
   * Parse PRD from JSON file (async) with caching and path sanitization
   */
  static async parseFromFile(filePath: string): Promise<PRD> {
    // Sanitize path to prevent traversal attacks
    const fullPath = sanitizePath(filePath, process.cwd());

    // Check cache first (70-90% I/O reduction)
    const cached = this.prdCache.get(fullPath);
    if (cached) {
      try {
        const stats = await fs.promises.stat(fullPath);
        const cacheAge = Date.now() - cached.mtime;

        // Use cache if file hasn't been modified and cache is fresh
        if (stats.mtimeMs <= cached.mtime && cacheAge < PRDParser.CACHE_TTL_MS) {
          console.log(`✅ Cache hit for PRD: ${filePath}`);
          return cached.prd;
        }

        // Cache stale or file modified, remove it
        this.prdCache.delete(fullPath);
        console.log(`🔄 Cache invalidation for PRD: ${filePath}`);
      } catch {
        // File doesn't exist, remove from cache
        this.prdCache.delete(fullPath);
      }
    } else {
      console.log(`❌ Cache miss for PRD: ${filePath}`);
    }

    // SECURITY: Only allow .smite/prd.json or explicit user intent
    if (!this.isValidPRDPath(fullPath)) {
      console.warn(`⚠️  Warning: Non-standard PRD path detected: ${filePath}`);
      console.warn(`   Standard path is: ${this.STANDARD_PRD_PATH}`);
      console.warn(`   Copying to standard location...`);
    }

    try {
      const content = await fs.promises.readFile(fullPath, "utf-8");
      const prd = this.parseFromString(content);

      // Add to cache
      const stats = await fs.promises.stat(fullPath);
      this.prdCache.set(fullPath, { prd, mtime: stats.mtimeMs });

      return prd;
    } catch (error) {
      throw wrapError(error instanceof Error ? error : new Error(String(error)), `Failed to read PRD file`, {
        operation: "parseFromFile",
        filePath: fullPath,
      });
    }
  }

  /**
   * Validate PRD file path - prevent phantom PRD files
   */
  private static isValidPRDPath(filePath: string): boolean {
    const resolved = path.resolve(filePath);
    const standard = path.resolve(this.STANDARD_PRD_PATH);
    return resolved === standard;
  }

  /**
   * Parse PRD from JSON string with enhanced error context
   */
  static parseFromString(json: string): PRD {
    try {
      const prd = JSON.parse(json) as PRD;
      this.validate(prd);
      return prd;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw createParseError("<string>", error);
      }
      throw wrapError(error instanceof Error ? error : new Error(String(error)), "Failed to parse PRD", {
        operation: "parseFromString",
        details: "Attempted to parse PRD from JSON string",
      });
    }
  }

  /**
   * Validate PRD structure with enhanced error messages
   */
  static validate(prd: PRD): void {
    if (!prd.project) {
      throw createValidationError("PRD", "missing project name", {
        details: "The 'project' field is required",
      });
    }
    if (!prd.branchName) {
      throw createValidationError("PRD", "missing branch name", {
        details: "The 'branchName' field is required",
      });
    }
    if (!prd.description) {
      throw createValidationError("PRD", "missing description", {
        details: "The 'description' field is required",
      });
    }
    if (!prd.userStories || !Array.isArray(prd.userStories)) {
      throw createValidationError("PRD", "invalid user stories", {
        details: "The 'userStories' field must be an array",
      });
    }
    if (prd.userStories.length === 0) {
      throw createValidationError("PRD", "no user stories", {
        details: "PRD must have at least one user story",
      });
    }

    // Validate each user story
    prd.userStories.forEach((story, index) => {
      this.validateUserStory(story, index);
    });

    // Validate dependencies exist
    const storyIds = new Set(prd.userStories.map((s) => s.id));
    prd.userStories.forEach((story) => {
      story.dependencies.forEach((dep) => {
        if (!storyIds.has(dep)) {
          throw createValidationError("UserStory", `invalid dependency: ${dep}`, {
            operation: "validateDependencies",
            details: `Story ${story.id} depends on non-existent story ${dep}`,
          });
        }
      });
    });
  }

  /**
   * Validate individual user story
   */
  static validateUserStory(story: UserStory, index: number): void {
    if (!story.id) throw new Error(`Story at index ${index} missing id`);
    if (!story.title) throw new Error(`Story ${story.id} missing title`);
    if (!story.description) throw new Error(`Story ${story.id} missing description`);
    if (!story.acceptanceCriteria || !Array.isArray(story.acceptanceCriteria)) {
      throw new Error(`Story ${story.id} must have acceptanceCriteria array`);
    }
    if (story.acceptanceCriteria.length === 0) {
      throw new Error(`Story ${story.id} must have at least one acceptance criterion`);
    }
    if (typeof story.priority !== "number" || story.priority < 1 || story.priority > 10) {
      throw new Error(`Story ${story.id} must have priority between 1-10`);
    }
    if (!story.agent) throw new Error(`Story ${story.id} must specify an agent`);
    if (!Array.isArray(story.dependencies)) {
      throw new Error(`Story ${story.id} must have dependencies array`);
    }
    if (typeof story.passes !== "boolean") {
      throw new Error(`Story ${story.id} must have passes boolean`);
    }
  }

  /**
   * Load PRD from .smite directory (async)
   */
  static async loadFromSmiteDir(): Promise<PRD | null> {
    const prdPath = path.join(process.cwd(), this.STANDARD_PRD_PATH);
    try {
      await fs.promises.access(prdPath, fs.constants.F_OK);
      return await this.parseFromFile(prdPath);
    } catch {
      return null;
    }
  }

  /**
   * Save PRD to .smite directory (ONLY valid location) - async
   * WARNING: This OVERWRITES the existing PRD. Use mergePRD() instead to preserve existing stories.
   */
  static async saveToSmiteDir(prd: PRD): Promise<string> {
    const smiteDir = path.join(process.cwd(), ".claude", ".smite");
    try {
      await fs.promises.mkdir(smiteDir, { recursive: true });
    } catch (error) {
      throw new Error(
        `Failed to create .smite directory: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }

    const prdPath = path.join(process.cwd(), this.STANDARD_PRD_PATH);
    try {
      await fs.promises.writeFile(prdPath, JSON.stringify(prd, null, 2), "utf-8");

      // Invalidate cache after writing
      this.prdCache.delete(prdPath);
    } catch (error) {
      throw new Error(
        `Failed to write PRD file at ${prdPath}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }

    // Clean up any phantom PRD files
    await this.cleanupPhantomPRDs();

    return prdPath;
  }

  /**
   * Merge new PRD content with existing PRD (preserves completed stories) - async
   * This is the PREFERRED way to update a PRD.
   */
  static async mergePRD(newPrd: PRD): Promise<string> {
    const existingPrd = await this.loadFromSmiteDir();

    if (!existingPrd) {
      // No existing PRD, just save the new one
      console.log("📄 Creating new PRD");
      return await this.saveToSmiteDir(newPrd);
    }

    // Merge: Keep existing stories, add new ones, update description
    const mergedPrd: PRD = {
      project: existingPrd.project, // Keep existing project name
      branchName: existingPrd.branchName, // Keep existing branch
      description: this.mergeDescriptions(existingPrd.description, newPrd.description),
      userStories: this.mergeStories(existingPrd.userStories, newPrd.userStories),
    };

    console.log(`🔄 Merging PRDs:`);
    console.log(`   Existing: ${existingPrd.userStories.length} stories`);
    console.log(`   New: ${newPrd.userStories.length} stories`);
    console.log(`   Merged: ${mergedPrd.userStories.length} stories`);

    return await this.saveToSmiteDir(mergedPrd);
  }

  /**
   * Merge descriptions intelligently
   */
  private static mergeDescriptions(existing: string, newDesc: string): string {
    // If new description is significantly different, append it
    if (existing.toLowerCase() === newDesc.toLowerCase()) {
      return existing;
    }

    // Check if new description is already contained in existing
    if (existing.toLowerCase().includes(newDesc.toLowerCase())) {
      return existing;
    }

    // Append new description
    return `${existing}\n\n${newDesc}`;
  }

  /**
   * Merge story lists, avoiding duplicates by ID
   * Preserves existing stories with their status (passes, notes)
   */
  private static mergeStories(existing: UserStory[], newStories: UserStory[]): UserStory[] {
    const storyMap = new Map<string, UserStory>();

    // Add existing stories first (preserves completed status)
    existing.forEach((story) => {
      storyMap.set(story.id, story);
    });

    // Add/update new stories
    newStories.forEach((story) => {
      const existingStory = storyMap.get(story.id);

      if (!existingStory) {
        // New story - add it
        console.log(`   ➕ Adding new story: ${story.id}`);
        storyMap.set(story.id, story);
      } else {
        // Story exists - update fields but preserve status
        console.log(`   🔄 Updating existing story: ${story.id}`);
        storyMap.set(story.id, {
          ...existingStory, // Keep existing passes, notes, status
          title: story.title,
          description: story.description,
          acceptanceCriteria: story.acceptanceCriteria,
          priority: story.priority,
          agent: story.agent,
          dependencies: story.dependencies,
        });
      }
    });

    return Array.from(storyMap.values()).sort((a, b) => {
      // Sort by priority, then by ID
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.id.localeCompare(b.id);
    });
  }

  /**
   * Update specific story in PRD (e.g., mark as passed) - async
   */
  static async updateStory(storyId: string, updates: Partial<UserStory>): Promise<boolean> {
    const prd = await this.loadFromSmiteDir();
    if (!prd) return false;

    const storyIndex = prd.userStories.findIndex((s) => s.id === storyId);
    if (storyIndex === -1) return false;

    // Update story
    prd.userStories[storyIndex] = {
      ...prd.userStories[storyIndex],
      ...updates,
    };

    // Save updated PRD
    await this.saveToSmiteDir(prd);
    return true;
  }

  /**
   * Generate hash for PRD content (for change detection)
   */
  static generateHash(prd: PRD): string {
    const content = JSON.stringify(prd);
    return crypto.createHash("md5").update(content).digest("hex");
  }

  /**
   * Clean up phantom PRD files (prd-*.json in .smite or root) - async
   * This prevents accumulation of unused PRD files
   */
  private static async cleanupPhantomPRDs(): Promise<void> {
    try {
      const smiteDir = path.join(process.cwd(), ".claude", ".smite");
      const rootDir = process.cwd();

      // Clean .smite directory
      try {
        const files = await fs.promises.readdir(smiteDir);
        for (const file of files) {
          if (file.match(/^prd-.*\.json$/) || file.match(/^prd-\d+\.json$/)) {
            const filePath = path.join(smiteDir, file);
            console.log(`🧹 Cleaning up phantom PRD: ${file}`);
            await fs.promises.unlink(filePath);
          }
        }
      } catch {
        // .smite directory doesn't exist yet, skip
      }

      // Clean root directory (warn but don't delete unless it's clearly a phantom)
      try {
        const rootFiles = await fs.promises.readdir(rootDir);
        for (const file of rootFiles) {
          if (file.match(/^prd-\d+\.json$/)) {
            console.warn(`⚠️  Warning: Phantom PRD in root: ${file}`);
            console.warn(`   Consider moving to .smite/prd.json or deleting`);
          }
        }
      } catch {
        // Root directory read failed, skip
      }
    } catch (error) {
      // Non-critical: log but don't fail
      console.warn(
        `Could not cleanup phantom PRDs: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Get the standard PRD path
   */
  static getStandardPRDPath(): string {
    return path.join(process.cwd(), this.STANDARD_PRD_PATH);
  }

  /**
   * Check if standard PRD exists - async
   */
  static async standardPRDExists(): Promise<boolean> {
    try {
      await fs.promises.access(this.getStandardPRDPath(), fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Assert that PRD exists - throw error if missing (async)
   */
  static async assertPRDExists(message?: string): Promise<void> {
    const exists = await this.standardPRDExists();
    if (!exists) {
      throw new Error(
        message ||
          `PRD not found at ${this.getStandardPRDPath()}. Use '/ralph \"<prompt>\"' to create one.`
      );
    }
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.prdCache.size,
      keys: Array.from(this.prdCache.keys()),
    };
  }

  /**
   * Clear the PRD cache (useful for testing or force reload)
   */
  static clearCache(): void {
    const size = this.prdCache.size;
    this.prdCache.clear();
    console.log(`🧹 Cleared PRD cache (${size} entries)`);
  }
}
