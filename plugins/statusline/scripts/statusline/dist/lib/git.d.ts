export interface GitStatus {
    branch: string | null;
    changes: number;
    staged: number;
    unstaged: number;
    isDirty: boolean;
}
/**
 * Get git status information
 */
export declare function getGitStatus(): Promise<GitStatus>;
