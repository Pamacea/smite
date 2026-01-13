import { $ } from "bun";
/**
 * Get git status information
 */
export async function getGitStatus() {
    const result = {
        branch: null,
        changes: 0,
        staged: 0,
        unstaged: 0,
        isDirty: false,
    };
    try {
        // Get branch name
        const branchOutput = await $ `git branch --show-current`.quiet();
        result.branch = branchOutput.stdout.toString().trim() || null;
        // Get porcelain status
        const statusOutput = await $ `git status --porcelain`.quiet();
        const statusLines = statusOutput.stdout.toString().trim().split("\n").filter(Boolean);
        for (const line of statusLines) {
            if (!line)
                continue;
            const index = line[0];
            const workTree = line[1];
            // Count staged changes (first character not space or ?)
            if (index !== " " && index !== "?") {
                result.staged++;
            }
            // Count unstaged changes (second character not space)
            if (workTree !== " ") {
                result.unstaged++;
            }
            result.changes++;
        }
        result.isDirty = result.changes > 0;
    }
    catch {
        // Not in git repo or git not available
        return result;
    }
    return result;
}
