import { PRD, UserStory } from "./types";
export declare class PRDParser {
    private static readonly STANDARD_PRD_PATH;
    private static prdCache;
    private static readonly CACHE_TTL_MS;
    /**
     * Parse PRD from JSON file (async) with caching and path sanitization
     */
    static parseFromFile(filePath: string): Promise<PRD>;
    /**
     * Validate PRD file path - prevent phantom PRD files
     */
    private static isValidPRDPath;
    /**
     * Parse PRD from JSON string
     */
    static parseFromString(json: string): PRD;
    /**
     * Validate PRD structure
     */
    static validate(prd: PRD): void;
    /**
     * Validate individual user story
     */
    static validateUserStory(story: UserStory, index: number): void;
    /**
     * Load PRD from .smite directory (async)
     */
    static loadFromSmiteDir(): Promise<PRD | null>;
    /**
     * Save PRD to .smite directory (ONLY valid location) - async
     * WARNING: This OVERWRITES the existing PRD. Use mergePRD() instead to preserve existing stories.
     */
    static saveToSmiteDir(prd: PRD): Promise<string>;
    /**
     * Merge new PRD content with existing PRD (preserves completed stories) - async
     * This is the PREFERRED way to update a PRD.
     */
    static mergePRD(newPrd: PRD): Promise<string>;
    /**
     * Merge descriptions intelligently
     */
    private static mergeDescriptions;
    /**
     * Merge story lists, avoiding duplicates by ID
     * Preserves existing stories with their status (passes, notes)
     */
    private static mergeStories;
    /**
     * Update specific story in PRD (e.g., mark as passed) - async
     */
    static updateStory(storyId: string, updates: Partial<UserStory>): Promise<boolean>;
    /**
     * Generate hash for PRD content (for change detection)
     */
    static generateHash(prd: PRD): string;
    /**
     * Clean up phantom PRD files (prd-*.json in .smite or root) - async
     * This prevents accumulation of unused PRD files
     */
    private static cleanupPhantomPRDs;
    /**
     * Get the standard PRD path
     */
    static getStandardPRDPath(): string;
    /**
     * Check if standard PRD exists - async
     */
    static standardPRDExists(): Promise<boolean>;
    /**
     * Assert that PRD exists - throw error if missing (async)
     */
    static assertPRDExists(message?: string): Promise<void>;
    /**
     * Get cache statistics
     */
    static getCacheStats(): {
        size: number;
        keys: string[];
    };
    /**
     * Clear the PRD cache (useful for testing or force reload)
     */
    static clearCache(): void;
}
//# sourceMappingURL=prd-parser.d.ts.map