// SMITE Ralph - PRD Parser
// Parse and validate PRD files

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { PRD, UserStory } from './types';

export class PRDParser {
  // Standard PRD location - SINGLE SOURCE OF TRUTH
  private static readonly STANDARD_PRD_PATH = path.join('.smite', 'prd.json');

  /**
   * Parse PRD from JSON file
   */
  static parseFromFile(filePath: string): PRD {
    const fullPath = path.resolve(filePath);

    // SECURITY: Only allow .smite/prd.json or explicit user intent
    if (!this.isValidPRDPath(fullPath)) {
      console.warn(`⚠️  Warning: Non-standard PRD path detected: ${filePath}`);
      console.warn(`   Standard path is: ${this.STANDARD_PRD_PATH}`);
      console.warn(`   Copying to standard location...`);
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    return this.parseFromString(content);
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
   * Parse PRD from JSON string
   */
  static parseFromString(json: string): PRD {
    try {
      const prd = JSON.parse(json) as PRD;
      this.validate(prd);
      return prd;
    } catch (error) {
      throw new Error(`Failed to parse PRD: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate PRD structure
   */
  static validate(prd: PRD): void {
    if (!prd.project) throw new Error('PRD must have a project name');
    if (!prd.branchName) throw new Error('PRD must have a branch name');
    if (!prd.description) throw new Error('PRD must have a description');
    if (!prd.userStories || !Array.isArray(prd.userStories)) {
      throw new Error('PRD must have userStories array');
    }
    if (prd.userStories.length === 0) {
      throw new Error('PRD must have at least one user story');
    }

    // Validate each user story
    prd.userStories.forEach((story, index) => {
      this.validateUserStory(story, index);
    });

    // Validate dependencies exist
    const storyIds = new Set(prd.userStories.map(s => s.id));
    prd.userStories.forEach((story) => {
      story.dependencies.forEach(dep => {
        if (!storyIds.has(dep)) {
          throw new Error(`Story ${story.id} depends on non-existent story ${dep}`);
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
    if (typeof story.priority !== 'number' || story.priority < 1 || story.priority > 10) {
      throw new Error(`Story ${story.id} must have priority between 1-10`);
    }
    if (!story.agent) throw new Error(`Story ${story.id} must specify an agent`);
    if (!Array.isArray(story.dependencies)) {
      throw new Error(`Story ${story.id} must have dependencies array`);
    }
    if (typeof story.passes !== 'boolean') {
      throw new Error(`Story ${story.id} must have passes boolean`);
    }
  }

  /**
   * Load PRD from .smite directory
   */
  static loadFromSmiteDir(): PRD | null {
    const prdPath = path.join(process.cwd(), this.STANDARD_PRD_PATH);
    if (!fs.existsSync(prdPath)) return null;
    return this.parseFromFile(prdPath);
  }

  /**
   * Save PRD to .smite directory (ONLY valid location)
   * WARNING: This OVERWRITES the existing PRD. Use mergePRD() instead to preserve existing stories.
   */
  static saveToSmiteDir(prd: PRD): string {
    const smiteDir = path.join(process.cwd(), '.smite');
    if (!fs.existsSync(smiteDir)) {
      fs.mkdirSync(smiteDir, { recursive: true });
    }
    const prdPath = path.join(process.cwd(), this.STANDARD_PRD_PATH);
    fs.writeFileSync(prdPath, JSON.stringify(prd, null, 2));

    // Clean up any phantom PRD files
    this.cleanupPhantomPRDs();

    return prdPath;
  }

  /**
   * Merge new PRD content with existing PRD (preserves completed stories)
   * This is the PREFERRED way to update a PRD.
   */
  static mergePRD(newPrd: PRD): string {
    const existingPrd = this.loadFromSmiteDir();

    if (!existingPrd) {
      // No existing PRD, just save the new one
      console.log('📄 Creating new PRD');
      return this.saveToSmiteDir(newPrd);
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

    return this.saveToSmiteDir(mergedPrd);
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
    existing.forEach(story => {
      storyMap.set(story.id, story);
    });

    // Add/update new stories
    newStories.forEach(story => {
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
   * Update specific story in PRD (e.g., mark as passed)
   */
  static updateStory(storyId: string, updates: Partial<UserStory>): boolean {
    const prd = this.loadFromSmiteDir();
    if (!prd) return false;

    const storyIndex = prd.userStories.findIndex(s => s.id === storyId);
    if (storyIndex === -1) return false;

    // Update story
    prd.userStories[storyIndex] = {
      ...prd.userStories[storyIndex],
      ...updates,
    };

    // Save updated PRD
    this.saveToSmiteDir(prd);
    return true;
  }

  /**
   * Generate hash for PRD content (for change detection)
   */
  static generateHash(prd: PRD): string {
    const content = JSON.stringify(prd);
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * Clean up phantom PRD files (prd-*.json in .smite or root)
   * This prevents accumulation of unused PRD files
   */
  private static cleanupPhantomPRDs(): void {
    try {
      const smiteDir = path.join(process.cwd(), '.smite');
      const rootDir = process.cwd();

      // Clean .smite directory
      if (fs.existsSync(smiteDir)) {
        const files = fs.readdirSync(smiteDir);
        files.forEach(file => {
          if (file.match(/^prd-.*\.json$/) || file.match(/^prd-\d+\.json$/)) {
            const filePath = path.join(smiteDir, file);
            console.log(`🧹 Cleaning up phantom PRD: ${file}`);
            fs.unlinkSync(filePath);
          }
        });
      }

      // Clean root directory (warn but don't delete unless it's clearly a phantom)
      const rootFiles = fs.readdirSync(rootDir);
      rootFiles.forEach(file => {
        if (file.match(/^prd-\d+\.json$/)) {
          const filePath = path.join(rootDir, file);
          console.warn(`⚠️  Warning: Phantom PRD in root: ${file}`);
          console.warn(`   Consider moving to .smite/prd.json or deleting`);
        }
      });
    } catch (error) {
      // Non-critical: log but don't fail
      console.warn(`Could not cleanup phantom PRDs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get the standard PRD path
   */
  static getStandardPRDPath(): string {
    return path.join(process.cwd(), this.STANDARD_PRD_PATH);
  }

  /**
   * Check if standard PRD exists
   */
  static standardPRDExists(): boolean {
    return fs.existsSync(this.getStandardPRDPath());
  }

  /**
   * Assert that PRD exists - throw error if missing
   */
  static assertPRDExists(message?: string): void {
    if (!this.standardPRDExists()) {
      throw new Error(
        message ||
          `PRD not found at ${this.getStandardPRDPath()}. Use '/ralph \"<prompt>\"' to create one.`
      );
    }
  }
}
