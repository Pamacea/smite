"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRDGenerator = void 0;
class PRDGenerator {
    static generateFromPrompt(prompt, projectName) {
        return {
            project: projectName ?? this.extractProjectName(prompt),
            branchName: this.generateBranchName(prompt, projectName),
            description: this.extractDescription(prompt),
            userStories: this.generateStories(prompt),
        };
    }
    static generateBranchName(prompt, projectName) {
        const project = projectName ?? this.extractProjectName(prompt);
        return `ralph/${project.toLowerCase().replace(/\s+/g, "-")}`;
    }
    static extractProjectName(prompt) {
        for (const pattern of this.PROJECT_PATTERNS) {
            const match = prompt.match(pattern);
            if (match) {
                return this.titleCase(match[1].trim());
            }
        }
        const words = prompt.split(/\s+/).slice(0, 3);
        return this.titleCase(words.join(" "));
    }
    static extractDescription(prompt) {
        const cleaned = prompt.replace(this.ACTION_WORDS, "").trim();
        return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
    static titleCase(text) {
        return text.replace(/\b\w/g, (l) => l.toUpperCase());
    }
    static generateStories(prompt) {
        const stories = this.detectFeatureStories(prompt);
        const baseStories = stories.length > 0 ? stories : [this.createDefaultStory()];
        return [...baseStories, this.createFinalizeStory(baseStories)];
    }
    static detectFeatureStories(prompt) {
        const lowerPrompt = prompt.toLowerCase();
        const hasAuth = lowerPrompt.includes("auth") || lowerPrompt.includes("login");
        if (!hasAuth)
            return [];
        return [
            this.createStory("US-001", "Setup project structure", "architect:task", 10, [
                "Project structure follows best practices",
                "Dependencies installed",
                "TypeScript configured",
                "Build system working",
            ], []),
            this.createStory("US-002", "Implement authentication", "builder:task", 9, [
                "Login form working",
                "Password hashing implemented",
                "Session management working",
                "Protected routes functional",
            ], ["US-001"]),
        ];
    }
    static createDefaultStory() {
        return this.createStory("US-001", "Initialize project", "architect:task", 10, [
            "Project created",
            "Dependencies installed",
            "Basic configuration done",
            "Build system working",
        ], []);
    }
    static createFinalizeStory(dependencies) {
        const id = `US-${String(dependencies.length + 1).padStart(3, "0")}`;
        return this.createStory(id, "Finalize and document", "finalize:task", 1, ["All tests passing", "No linting errors", "Documentation complete", "Code reviewed"], dependencies.map((s) => s.id));
    }
    static createStory(id, title, agent, priority, acceptanceCriteria, dependencies) {
        // Extract tech from agent (e.g., "builder:task" with tech "typescript")
        const tech = this.extractTechFromAgent(agent);
        return {
            id,
            title,
            description: title.toLowerCase() + " implementation",
            acceptanceCriteria,
            priority,
            agent,
            tech,
            dependencies,
            passes: false,
            notes: "",
        };
    }
    static extractTechFromAgent(agent) {
        // Default technology mapping based on agent type
        const techMap = {
            "architect:task": "general",
            "builder:task": "typescript", // Default to TypeScript for builder
            "finalize:task": "general",
            "simplifier:task": "typescript",
            "explorer:task": "general",
        };
        return techMap[agent] || "general";
    }
    static suggestImprovements(prd) {
        return [
            prd.userStories.length < this.DEFAULT_STORY_COUNT &&
                "⚠️  Consider breaking down into more user stories",
            prd.userStories.filter((s) => s.dependencies.length === 0).length > 3 &&
                "⚠️  Too many stories without dependencies - consider adding parallelization opportunities",
            prd.userStories.filter((s) => s.priority < 5).length === prd.userStories.length &&
                "⚠️  All stories have low priority - consider adjusting priorities",
            new Set(prd.userStories.map((s) => s.agent)).size < 3 &&
                "💡 Consider using more specialized agents for better parallelization",
        ].filter(Boolean);
    }
}
exports.PRDGenerator = PRDGenerator;
PRDGenerator.PROJECT_PATTERNS = [
    /build\s+(?:a\s+)?(?:the\s+)?(.+?)(?:\s+(?:app|application|platform|system|website))/i,
    /create\s+(?:a\s+)?(?:the\s+)?(.+?)(?:\s+(?:app|application|platform|system|website))/i,
    /develop\s+(?:a\s+)?(?:the\s+)?(.+?)(?:\s+(?:app|application|platform|system|website))/i,
];
PRDGenerator.ACTION_WORDS = /^(build|create|develop|make|implement|construct)\s+(?:a\s+)?(?:the\s+)?/i;
PRDGenerator.DEFAULT_STORY_COUNT = 3;
//# sourceMappingURL=prd-generator.js.map