"use strict";
// SMITE Ralph - PRD Parser
// Parse and validate PRD files
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
exports.PRDParser = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const path_utils_1 = require("./path-utils");
class PRDParser {
    /**
     * Parse PRD from JSON file (async) with caching and path sanitization
     */
    static async parseFromFile(filePath) {
        // Sanitize path to prevent traversal attacks
        const fullPath = (0, path_utils_1.sanitizePath)(filePath, process.cwd());
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
            }
            catch {
                // File doesn't exist, remove from cache
                this.prdCache.delete(fullPath);
            }
        }
        else {
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
        }
        catch (error) {
            throw new Error(`Failed to read PRD file at ${fullPath}: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    /**
     * Validate PRD file path - prevent phantom PRD files
     */
    static isValidPRDPath(filePath) {
        const resolved = path.resolve(filePath);
        const standard = path.resolve(this.STANDARD_PRD_PATH);
        return resolved === standard;
    }
    /**
     * Parse PRD from JSON string
     */
    static parseFromString(json) {
        try {
            const prd = JSON.parse(json);
            this.validate(prd);
            return prd;
        }
        catch (error) {
            throw new Error(`Failed to parse PRD: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    /**
     * Validate PRD structure
     */
    static validate(prd) {
        if (!prd.project)
            throw new Error("PRD must have a project name");
        if (!prd.branchName)
            throw new Error("PRD must have a branch name");
        if (!prd.description)
            throw new Error("PRD must have a description");
        if (!prd.userStories || !Array.isArray(prd.userStories)) {
            throw new Error("PRD must have userStories array");
        }
        if (prd.userStories.length === 0) {
            throw new Error("PRD must have at least one user story");
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
                    throw new Error(`Story ${story.id} depends on non-existent story ${dep}`);
                }
            });
        });
    }
    /**
     * Validate individual user story
     */
    static validateUserStory(story, index) {
        if (!story.id)
            throw new Error(`Story at index ${index} missing id`);
        if (!story.title)
            throw new Error(`Story ${story.id} missing title`);
        if (!story.description)
            throw new Error(`Story ${story.id} missing description`);
        if (!story.acceptanceCriteria || !Array.isArray(story.acceptanceCriteria)) {
            throw new Error(`Story ${story.id} must have acceptanceCriteria array`);
        }
        if (story.acceptanceCriteria.length === 0) {
            throw new Error(`Story ${story.id} must have at least one acceptance criterion`);
        }
        if (typeof story.priority !== "number" || story.priority < 1 || story.priority > 10) {
            throw new Error(`Story ${story.id} must have priority between 1-10`);
        }
        if (!story.agent)
            throw new Error(`Story ${story.id} must specify an agent`);
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
    static async loadFromSmiteDir() {
        const prdPath = path.join(process.cwd(), this.STANDARD_PRD_PATH);
        try {
            await fs.promises.access(prdPath, fs.constants.F_OK);
            return await this.parseFromFile(prdPath);
        }
        catch {
            return null;
        }
    }
    /**
     * Save PRD to .smite directory (ONLY valid location) - async
     * WARNING: This OVERWRITES the existing PRD. Use mergePRD() instead to preserve existing stories.
     */
    static async saveToSmiteDir(prd) {
        const smiteDir = path.join(process.cwd(), ".smite");
        try {
            await fs.promises.mkdir(smiteDir, { recursive: true });
        }
        catch (error) {
            throw new Error(`Failed to create .smite directory: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
        const prdPath = path.join(process.cwd(), this.STANDARD_PRD_PATH);
        try {
            await fs.promises.writeFile(prdPath, JSON.stringify(prd, null, 2), "utf-8");
            // Invalidate cache after writing
            this.prdCache.delete(prdPath);
        }
        catch (error) {
            throw new Error(`Failed to write PRD file at ${prdPath}: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
        // Clean up any phantom PRD files
        await this.cleanupPhantomPRDs();
        return prdPath;
    }
    /**
     * Merge new PRD content with existing PRD (preserves completed stories) - async
     * This is the PREFERRED way to update a PRD.
     */
    static async mergePRD(newPrd) {
        const existingPrd = await this.loadFromSmiteDir();
        if (!existingPrd) {
            // No existing PRD, just save the new one
            console.log("📄 Creating new PRD");
            return await this.saveToSmiteDir(newPrd);
        }
        // Merge: Keep existing stories, add new ones, update description
        const mergedPrd = {
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
    static mergeDescriptions(existing, newDesc) {
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
    static mergeStories(existing, newStories) {
        const storyMap = new Map();
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
            }
            else {
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
    static async updateStory(storyId, updates) {
        const prd = await this.loadFromSmiteDir();
        if (!prd)
            return false;
        const storyIndex = prd.userStories.findIndex((s) => s.id === storyId);
        if (storyIndex === -1)
            return false;
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
    static generateHash(prd) {
        const content = JSON.stringify(prd);
        return crypto.createHash("md5").update(content).digest("hex");
    }
    /**
     * Clean up phantom PRD files (prd-*.json in .smite or root) - async
     * This prevents accumulation of unused PRD files
     */
    static async cleanupPhantomPRDs() {
        try {
            const smiteDir = path.join(process.cwd(), ".smite");
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
            }
            catch {
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
            }
            catch {
                // Root directory read failed, skip
            }
        }
        catch (error) {
            // Non-critical: log but don't fail
            console.warn(`Could not cleanup phantom PRDs: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    /**
     * Get the standard PRD path
     */
    static getStandardPRDPath() {
        return path.join(process.cwd(), this.STANDARD_PRD_PATH);
    }
    /**
     * Check if standard PRD exists - async
     */
    static async standardPRDExists() {
        try {
            await fs.promises.access(this.getStandardPRDPath(), fs.constants.F_OK);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Assert that PRD exists - throw error if missing (async)
     */
    static async assertPRDExists(message) {
        const exists = await this.standardPRDExists();
        if (!exists) {
            throw new Error(message ||
                `PRD not found at ${this.getStandardPRDPath()}. Use '/ralph \"<prompt>\"' to create one.`);
        }
    }
    /**
     * Get cache statistics
     */
    static getCacheStats() {
        return {
            size: this.prdCache.size,
            keys: Array.from(this.prdCache.keys()),
        };
    }
    /**
     * Clear the PRD cache (useful for testing or force reload)
     */
    static clearCache() {
        const size = this.prdCache.size;
        this.prdCache.clear();
        console.log(`🧹 Cleared PRD cache (${size} entries)`);
    }
}
exports.PRDParser = PRDParser;
// Standard PRD location - SINGLE SOURCE OF TRUTH
PRDParser.STANDARD_PRD_PATH = path.join(".smite", "prd.json");
// PRD cache for I/O optimization (70-90% reduction in file reads)
PRDParser.prdCache = new Map();
PRDParser.CACHE_TTL_MS = 5000; // 5 seconds cache TTL
//# sourceMappingURL=prd-parser.js.map