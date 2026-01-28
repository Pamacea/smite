import { execSync } from "node:child_process";

export interface GitStatus {
	branch: string;
	hasChanges: boolean;
	staged: {
		added: number;
		deleted: number;
		files: number;
	};
	unstaged: {
		added: number;
		deleted: number;
		files: number;
	};
}

function toForwardSlashes(path: string): string {
	return path.replace(/\\/g, "/");
}

function execGit(cwd: string | undefined, args: string[]): { stdout: string; exitCode: number } {
	try {
		const cmd = ["git", ...(cwd ? ["-C", toForwardSlashes(cwd)] : []), ...args];
		const result = execSync(cmd.join(" "), {
			cwd: cwd || undefined,
			encoding: "utf-8",
			stdio: ["ignore", "pipe", "pipe"],
		});
		return { stdout: result, exitCode: 0 };
	} catch (error: any) {
		return { stdout: error.stdout || "", exitCode: error.status || 1 };
	}
}

export async function getGitStatus(workingDir?: string): Promise<GitStatus> {
	const isGitRepo = execGit(workingDir, ["rev-parse", "--git-dir"]);
	if (isGitRepo.exitCode !== 0) {
		return {
			branch: "no-git",
			hasChanges: false,
			staged: { added: 0, deleted: 0, files: 0 },
			unstaged: { added: 0, deleted: 0, files: 0 },
		};
	}

	const branchResult = execGit(workingDir, ["branch", "--show-current"]);
	const branch = branchResult.stdout.trim() || "detached";

	const diffCheck = execGit(workingDir, ["diff-index", "--quiet", "HEAD", "--"]);
	const cachedCheck = execGit(workingDir, ["diff-index", "--quiet", "--cached", "HEAD", "--"]);

	if (diffCheck.exitCode !== 0 || cachedCheck.exitCode !== 0) {
		const unstagedDiff = execGit(workingDir, ["diff", "--numstat"]);
		const stagedDiff = execGit(workingDir, ["diff", "--cached", "--numstat"]);
		const stagedFilesResult = execGit(workingDir, ["diff", "--cached", "--name-only"]);
		const unstagedFilesResult = execGit(workingDir, ["diff", "--name-only"]);

		const parseStats = (diff: string) => {
			let added = 0;
			let deleted = 0;
			for (const line of diff.split("\n")) {
				if (!line.trim()) continue;
				const [a, d] = line
					.split("\t")
					.map((n) => Number.parseInt(n, 10) || 0);
				added += a;
				deleted += d;
			}
			return { added, deleted };
		};

		const unstagedStats = parseStats(unstagedDiff.stdout);
		const stagedStats = parseStats(stagedDiff.stdout);

		const stagedFilesCount = stagedFilesResult.stdout
			.split("\n")
			.filter((f) => f.trim()).length;
		const unstagedFilesCount = unstagedFilesResult.stdout
			.split("\n")
			.filter((f) => f.trim()).length;

		return {
			branch,
			hasChanges: true,
			staged: {
				added: stagedStats.added,
				deleted: stagedStats.deleted,
				files: stagedFilesCount,
			},
			unstaged: {
				added: unstagedStats.added,
				deleted: unstagedStats.deleted,
				files: unstagedFilesCount,
			},
		};
	}

	return {
		branch,
		hasChanges: false,
		staged: { added: 0, deleted: 0, files: 0 },
		unstaged: { added: 0, deleted: 0, files: 0 },
	};
}
