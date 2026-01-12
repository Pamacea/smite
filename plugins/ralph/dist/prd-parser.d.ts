import { PRD, UserStory } from './types';
export declare class PRDParser {
    /**
     * Parse PRD from JSON file
     */
    static parseFromFile(filePath: string): PRD;
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
     * Load PRD from .smite directory
     */
    static loadFromSmiteDir(): PRD | null;
    /**
     * Save PRD to .smite directory
     */
    static saveToSmiteDir(prd: PRD): void;
}
//# sourceMappingURL=prd-parser.d.ts.map