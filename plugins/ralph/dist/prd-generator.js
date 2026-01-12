"use strict";
// SMITE Ralph - PRD Generator
// Auto-generate PRD from user prompt
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRDGenerator = void 0;
class PRDGenerator {
    /**
     * Generate PRD from natural language prompt
     */
    static generateFromPrompt(prompt, projectName) {
        // Extract project name if not provided
        const project = projectName || this.extractProjectName(prompt);
        // Generate branch name
        const branchName = `ralph/${project.toLowerCase().replace(/\s+/g, '-')}`;
        // Extract description
        const description = this.extractDescription(prompt);
        // Generate user stories from prompt
        const userStories = this.generateStories(prompt);
        return {
            project,
            branchName,
            description,
            userStories,
        };
    }
    /**
     * Extract project name from prompt
     */
    static extractProjectName(prompt) {
        // Look for common patterns
        const patterns = [
            /build\s+(?:a\s+)?(?:the\s+)?(.+?)(?:\s+(?:app|application|platform|system|website))/i,
            /create\s+(?:a\s+)?(?:the\s+)?(.+?)(?:\s+(?:app|application|platform|system|website))/i,
            /develop\s+(?:a\s+)?(?:the\s+)?(.+?)(?:\s+(?:app|application|platform|system|website))/i,
        ];
        for (const pattern of patterns) {
            const match = prompt.match(pattern);
            if (match) {
                return match[1].trim().replace(/\b\w/g, l => l.toUpperCase());
            }
        }
        // Fallback: use first few words
        const words = prompt.split(/\s+/).slice(0, 3);
        return words.join(' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    /**
     * Extract description from prompt
     */
    static extractDescription(prompt) {
        // Remove common action words and get the core request
        const cleaned = prompt
            .replace(/^(build|create|develop|make|implement|construct)\s+(?:a\s+)?(?:the\s+)?/i, '')
            .trim();
        return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
    /**
     * Generate user stories from prompt
     * This is a simplified version - in production would use AI
     */
    static generateStories(prompt) {
        const stories = [];
        const lowerPrompt = prompt.toLowerCase();
        // Detect common features and generate stories
        if (lowerPrompt.includes('auth') || lowerPrompt.includes('login')) {
            stories.push({
                id: 'US-001',
                title: 'Setup project structure',
                description: 'Initialize project with proper folder structure and dependencies',
                acceptanceCriteria: [
                    'Project structure follows best practices',
                    'Dependencies installed',
                    'TypeScript configured',
                    'Build system working',
                ],
                priority: 10,
                agent: 'architect',
                dependencies: [],
                passes: false,
                notes: '',
            }, {
                id: 'US-002',
                title: 'Implement authentication',
                description: 'Add user authentication with secure session management',
                acceptanceCriteria: [
                    'Login form working',
                    'Password hashing implemented',
                    'Session management working',
                    'Protected routes functional',
                ],
                priority: 9,
                agent: 'builder',
                dependencies: ['US-001'],
                passes: false,
                notes: '',
            });
        }
        // Default story if nothing detected
        if (stories.length === 0) {
            stories.push({
                id: 'US-001',
                title: 'Initialize project',
                description: 'Set up project structure and core infrastructure',
                acceptanceCriteria: [
                    'Project created',
                    'Dependencies installed',
                    'Basic configuration done',
                    'Build system working',
                ],
                priority: 10,
                agent: 'architect',
                dependencies: [],
                passes: false,
                notes: '',
            });
        }
        // Add finalize story
        stories.push({
            id: `US-${String(stories.length + 1).padStart(3, '0')}`,
            title: 'Finalize and document',
            description: 'Run QA, fix issues, and create documentation',
            acceptanceCriteria: [
                'All tests passing',
                'No linting errors',
                'Documentation complete',
                'Code reviewed',
            ],
            priority: 1,
            agent: 'finalize',
            dependencies: stories.map(s => s.id),
            passes: false,
            notes: '',
        });
        return stories;
    }
    /**
     * Validate and suggest improvements to PRD
     */
    static suggestImprovements(prd) {
        const suggestions = [];
        // Check for common issues
        if (prd.userStories.length < 3) {
            suggestions.push('⚠️  Consider breaking down into more user stories');
        }
        const hasNoDeps = prd.userStories.filter(s => s.dependencies.length === 0).length;
        if (hasNoDeps > 3) {
            suggestions.push('⚠️  Too many stories without dependencies - consider adding parallelization opportunities');
        }
        const lowPriority = prd.userStories.filter(s => s.priority < 5).length;
        if (lowPriority === prd.userStories.length) {
            suggestions.push('⚠️  All stories have low priority - consider adjusting priorities');
        }
        // Check for agent distribution
        const agents = new Set(prd.userStories.map(s => s.agent));
        if (agents.size < 3) {
            suggestions.push('💡 Consider using more specialized agents for better parallelization');
        }
        return suggestions;
    }
}
exports.PRDGenerator = PRDGenerator;
//# sourceMappingURL=prd-generator.js.map