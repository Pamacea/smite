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
class PRDParser {
    /**
     * Parse PRD from JSON file
     */
    static parseFromFile(filePath) {
        const fullPath = path.resolve(filePath);
        const content = fs.readFileSync(fullPath, 'utf-8');
        return this.parseFromString(content);
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
            throw new Error(`Failed to parse PRD: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Validate PRD structure
     */
    static validate(prd) {
        if (!prd.project)
            throw new Error('PRD must have a project name');
        if (!prd.branchName)
            throw new Error('PRD must have a branch name');
        if (!prd.description)
            throw new Error('PRD must have a description');
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
        if (typeof story.priority !== 'number' || story.priority < 1 || story.priority > 10) {
            throw new Error(`Story ${story.id} must have priority between 1-10`);
        }
        if (!story.agent)
            throw new Error(`Story ${story.id} must specify an agent`);
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
    static loadFromSmiteDir() {
        const prdPath = path.join(process.cwd(), '.smite', 'prd.json');
        if (!fs.existsSync(prdPath))
            return null;
        return this.parseFromFile(prdPath);
    }
    /**
     * Save PRD to .smite directory
     */
    static saveToSmiteDir(prd) {
        const smiteDir = path.join(process.cwd(), '.smite');
        if (!fs.existsSync(smiteDir)) {
            fs.mkdirSync(smiteDir, { recursive: true });
        }
        const prdPath = path.join(smiteDir, 'prd.json');
        fs.writeFileSync(prdPath, JSON.stringify(prd, null, 2));
    }
}
exports.PRDParser = PRDParser;
//# sourceMappingURL=prd-parser.js.map