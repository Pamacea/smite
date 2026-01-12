// SMITE Ralph - PRD Parser
// Parse and validate PRD files

import * as fs from 'fs';
import * as path from 'path';
import { PRD, UserStory } from './types';

export class PRDParser {
  /**
   * Parse PRD from JSON file
   */
  static parseFromFile(filePath: string): PRD {
    const fullPath = path.resolve(filePath);
    const content = fs.readFileSync(fullPath, 'utf-8');
    return this.parseFromString(content);
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
    const prdPath = path.join(process.cwd(), '.smite', 'prd.json');
    if (!fs.existsSync(prdPath)) return null;
    return this.parseFromFile(prdPath);
  }

  /**
   * Save PRD to .smite directory
   */
  static saveToSmiteDir(prd: PRD): void {
    const smiteDir = path.join(process.cwd(), '.smite');
    if (!fs.existsSync(smiteDir)) {
      fs.mkdirSync(smiteDir, { recursive: true });
    }
    const prdPath = path.join(smiteDir, 'prd.json');
    fs.writeFileSync(prdPath, JSON.stringify(prd, null, 2));
  }
}
