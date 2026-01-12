import { PRD } from './types';
export declare class PRDGenerator {
    /**
     * Generate PRD from natural language prompt
     */
    static generateFromPrompt(prompt: string, projectName?: string): PRD;
    /**
     * Extract project name from prompt
     */
    private static extractProjectName;
    /**
     * Extract description from prompt
     */
    private static extractDescription;
    /**
     * Generate user stories from prompt
     * This is a simplified version - in production would use AI
     */
    private static generateStories;
    /**
     * Validate and suggest improvements to PRD
     */
    static suggestImprovements(prd: PRD): string[];
}
//# sourceMappingURL=prd-generator.d.ts.map