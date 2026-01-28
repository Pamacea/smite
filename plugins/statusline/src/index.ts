#!/usr/bin/env bun

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { defaultConfig, type StatuslineConfig } from "./lib/config";
import { getContextData } from "./lib/context";
import {
	colors,
	formatBranch,
	formatCost,
	formatDuration,
	formatPath,
} from "./lib/formatters";
import { getGitStatus } from "./lib/git";
import {
	renderStatusline,
	type StatuslineData,
	type UsageLimit,
} from "./lib/render-pure";
import type { HookInput } from "./lib/types";

// Optional feature imports - just delete the folder to disable!
let getUsageLimits: any = null;
let normalizeResetsAt: any = null;
let getPeriodCost: any = null;
let getTodayCostV2: any = null;
let saveSessionV2: any = null;

try {
	const limitsModule = await import("./lib/features/limits");
	getUsageLimits = limitsModule.getUsageLimits;
} catch {
	// Limits feature not available - that's OK!
}

try {
	const utilsModule = await import("./lib/utils");
	normalizeResetsAt = utilsModule.normalizeResetsAt;
} catch {
	// Fallback normalizeResetsAt
	normalizeResetsAt = (resetsAt: string) => resetsAt;
}

try {
	const spendModule = await import("./lib/features/spend");
	getPeriodCost = spendModule.getPeriodCost;
	getTodayCostV2 = spendModule.getTodayCostV2;
	saveSessionV2 = spendModule.saveSessionV2;
} catch {
	// Spend tracking feature not available - that's OK!
}

// Re-export from render-pure for backwards compatibility
export {
	renderStatusline,
	type StatuslineData,
	type UsageLimit,
} from "./lib/render-pure";

const CONFIG_FILE_PATH = join(import.meta.dir, "..", "statusline.config.json");
const LAST_PAYLOAD_PATH = join(
	import.meta.dir,
	"..",
	"data",
	"last_payload.txt",
);

async function loadConfig(): Promise<StatuslineConfig> {
	try {
		const content = await readFile(CONFIG_FILE_PATH, "utf-8");
		return JSON.parse(content);
	} catch {
		return defaultConfig;
	}
}

// Helper functions to build HookInput from session files (for PostToolUse hook)
interface SessionLine {
	type?: string;
	message?: {
		model?: string;
		usage?: {
			input_tokens?: number;
			output_tokens?: number;
		};
	};
	timestamp?: string;
}

interface SessionResult {
	sessionPath: string | null;
	projectDir: string | null;
}

// Detect project root by walking up from current directory
async function detectProjectRoot(): Promise<string | null> {
	const { resolve } = await import("node:path");
	const { existsSync } = await import("node:fs");

	let current = resolve(process.cwd());
	const seen = new Set<string>();

	while (current && !seen.has(current)) {
		seen.add(current);

		// Check if this has .claude directory (project root)
		if (existsSync(join(current, ".claude"))) {
			return current;
		}

		// Check if we're in a plugin directory (plugins/statusline)
		// If so, the project root is two levels up
		const basename = current.split(/[/\\]/).pop();
		if (basename === "statusline") {
			const parent = resolve(current, "..");
			const grandparent = resolve(parent, "..");
			if (existsSync(join(grandparent, ".claude"))) {
				return grandparent;
			}
		}

		const parent = resolve(current, "..");
		if (parent === current) break; // Reached filesystem root
		current = parent;
	}

	return null;
}

async function findCurrentSession(): Promise<SessionResult> {
	const homeDir = process.env.HOME || process.env.USERPROFILE || "";
	const claudeDir = join(homeDir, ".claude");
	const projectsDir = join(claudeDir, "projects");
	const sessionEnvDir = join(claudeDir, "session-env");

	try {
		const { readdirSync, readFileSync, existsSync, statSync } = await import("node:fs");
		if (!existsSync(projectsDir)) return { sessionPath: null, projectDir: null };

		// Detect the current project root
		const detectedProjectRoot = await detectProjectRoot();
		const normalizePath = (p: string) => p.replace(/\\/g, "/");

		type SessionCandidate = { sessionPath: string; projectDir: string; mtime: number; isCurrentProject: boolean };
		const candidates: SessionCandidate[] = [];

		const projects = readdirSync(projectsDir, { withFileTypes: true })
			.filter(d => d.isDirectory())
			.map(d => d.name);

		for (const project of projects) {
			const indexPath = join(projectsDir, project, "sessions-index.json");
			if (!existsSync(indexPath)) continue;
			try {
				const index = JSON.parse(readFileSync(indexPath, "utf-8"));
				const originalPath = index.originalPath || index.projectPath;
				if (!originalPath) continue;

				const projectDataDir = join(projectsDir, project);
				const normalizedOriginal = normalizePath(originalPath);
				const normalizedDetected = detectedProjectRoot ? normalizePath(detectedProjectRoot) : "";

				// Check if this matches our detected project
				const isCurrentProject = detectedProjectRoot && (
					normalizedOriginal === normalizedDetected ||
					normalizedDetected.startsWith(normalizedOriginal + "/")
				);

				// Check session-env for active sessions (within 1 hour)
				if (existsSync(sessionEnvDir)) {
					const sessions = readdirSync(sessionEnvDir, { withFileTypes: true })
						.filter(d => d.isDirectory())
						.map(d => d.name);
					const now = Date.now();
					for (const sessionId of sessions) {
						const envPath = join(sessionEnvDir, sessionId);
						const envStat = statSync(envPath);
						if (now - envStat.mtimeMs < 60 * 60 * 1000) {
							const sessionPath = join(projectDataDir, sessionId + ".jsonl");
							if (existsSync(sessionPath)) {
								candidates.push({
									sessionPath,
									projectDir: originalPath,
									mtime: statSync(sessionPath).mtimeMs,
									isCurrentProject
								});
							}
						}
					}
				}

				// Also check all jsonl files
				const jsonlFiles = readdirSync(projectDataDir).filter(f => f.endsWith(".jsonl"));
				for (const file of jsonlFiles) {
					const filePath = join(projectDataDir, file);
					candidates.push({
						sessionPath: filePath,
						projectDir: originalPath,
						mtime: statSync(filePath).mtimeMs,
						isCurrentProject
					});
				}
			} catch (e) { /* continue */ }
		}

		if (candidates.length > 0) {
			// Sort: current project first, then by mtime
			candidates.sort((a, b) => {
				if (a.isCurrentProject && !b.isCurrentProject) return -1;
				if (!a.isCurrentProject && b.isCurrentProject) return 1;
				return b.mtime - a.mtime;
			});
			return { sessionPath: candidates[0].sessionPath, projectDir: candidates[0].projectDir };
		}
	} catch (e) { /* ignore */ }
	return { sessionPath: null, projectDir: null };
}

async function readSession(path: string): Promise<SessionLine[]> {
	const { readFileSync } = await import("node:fs");
	const content = readFileSync(path, "utf-8");
	return content.trim().split("\n").map(line => {
		try { return JSON.parse(line); } catch { return null; }
	}).filter(Boolean);
}

function extractModelName(entry: SessionLine): string {
	const model = entry.message?.model || "";
	if (!model) return "N/A";
	const modelLower = model.toLowerCase();
	if (modelLower.includes("opus")) return "Opus 4.5";
	if (modelLower.includes("sonnet")) return "Sonnet 4.5";
	if (modelLower.includes("haiku")) return "Haiku 4.5";
	if (modelLower.includes("glm")) {
		if (modelLower.includes("4.5") || modelLower.includes("4-5")) return "Glm 4.5";
		if (modelLower.includes("4.7") || modelLower.includes("4-7")) return "Glm 4.7";
		return "Glm";
	}
	const parts = model.split(/[-_]/);
	if (parts.length > 0) {
		return parts.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
	}
	return "N/A";
}

function extractTokens(sessionData: SessionLine[]): { input: number; output: number; total: number } {
	let input = 0, output = 0;
	for (const e of sessionData) {
		if (e.message?.usage) {
			input += e.message.usage.input_tokens || 0;
			output += e.message.usage.output_tokens || 0;
		}
	}
	return { input, output, total: input + output };
}

function calculateCost(tokens: { input: number; output: number }, model: string): number {
	const pricing = {
		opus: { input: 15, output: 75 },
		sonnet: { input: 3, output: 15 },
		haiku: { input: 1, output: 5 },
		glm: { input: 0.5, output: 1 }
	};
	const modelLower = model.toLowerCase();
	let key = "opus";
	if (modelLower.includes("sonnet")) key = "sonnet";
	else if (modelLower.includes("haiku")) key = "haiku";
	else if (modelLower.includes("glm")) key = "glm";
	const rates = pricing[key as keyof typeof pricing];
	return (tokens.input / 1_000_000) * rates.input + (tokens.output / 1_000_000) * rates.output;
}

function calculateDuration(sessionData: SessionLine[]): number {
	// Calculate duration from first to last timestamp
	let firstTimestamp: string | null = null;
	let lastTimestamp: string | null = null;
	for (const e of sessionData) {
		if (e.timestamp) {
			if (!firstTimestamp) firstTimestamp = e.timestamp;
			lastTimestamp = e.timestamp;
		}
	}
	if (!firstTimestamp || !lastTimestamp) return 0;
	return new Date(lastTimestamp).getTime() - new Date(firstTimestamp).getTime();
}

async function buildHookInputFromSession(): Promise<{ input: HookInput; projectDir: string | null }> {
	const { sessionPath, projectDir } = await findCurrentSession();
	const sessionData = sessionPath ? await readSession(sessionPath) : [];
	const latestEntry = sessionData.slice().reverse().find(e => e.type === "assistant" || e.type === "api_call_start");
	const model = extractModelName(latestEntry || {});
	const tokens = extractTokens(sessionData);
	const cost = calculateCost(tokens, model);
	const durationMs = calculateDuration(sessionData);

	// Use the actual project directory from session index
	const workingDir = projectDir || process.cwd();

	const input: HookInput = {
		session_id: "current",
		transcript_path: sessionPath || "",
		cwd: workingDir,
		model: { id: model.toLowerCase().replace(/\s+/g, "-"), display_name: model },
		workspace: { current_dir: workingDir, project_dir: workingDir },
		version: "1.0.0",
		output_style: { name: "Explanatory" },
		cost: { total_cost_usd: cost, total_duration_ms: durationMs, total_api_duration_ms: 0, total_lines_added: 0, total_lines_removed: 0 },
		context_window: {
			total_input_tokens: tokens.input,
			total_output_tokens: tokens.output,
			context_window_size: 200000,
			current_usage: {
				input_tokens: tokens.input,
				output_tokens: tokens.output
			}
		}
	};
	return { input, projectDir };
}

async function main() {
	try {
		// Try to read JSON from stdin first (aiblueprint format)
		let input: HookInput;
		const stdinData: Buffer[] = [];

		// Read all available stdin with timeout
		const stdinTimeout = new Promise<void>((resolve) => setTimeout(resolve, 100));
		const readStdin = (async () => {
			for await (const chunk of process.stdin) {
				stdinData.push(chunk);
			}
		})();

		await Promise.race([stdinTimeout, readStdin]);

		if (stdinData.length > 0) {
			try {
				const stdinText = Buffer.concat(stdinData).toString();
				if (stdinText.trim()) {
					input = JSON.parse(stdinText);
				} else {
					const result = await buildHookInputFromSession();
					input = result.input;
				}
			} catch {
				const result = await buildHookInputFromSession();
				input = result.input;
			}
		} else {
			const result = await buildHookInputFromSession();
			input = result.input;
		}

		// Save last payload for debugging
		await writeFile(LAST_PAYLOAD_PATH, JSON.stringify(input, null, 2));

		const config = await loadConfig();

		// Get usage limits (if feature exists)
		const usageLimits = getUsageLimits
			? await getUsageLimits()
			: { five_hour: null, seven_day: null };
		const currentResetsAt = usageLimits.five_hour?.resets_at ?? undefined;

		// Save session with current period context (if feature exists)
		if (saveSessionV2) {
			await saveSessionV2(input, currentResetsAt);
		}

		// Get git status from the actual project directory
		const git = await getGitStatus(input.workspace.current_dir);

		let contextTokens: number | null;
		let contextPercentage: number | null;

		const usePayloadContext =
			config.context.usePayloadContextWindow && input.context_window;

		if (usePayloadContext) {
			const current = input.context_window?.current_usage;
			if (current) {
				contextTokens =
					(current.input_tokens || 0) +
					(current.cache_creation_input_tokens || 0) +
					(current.cache_read_input_tokens || 0);
				const maxTokens =
					input.context_window?.context_window_size ||
					config.context.maxContextTokens;
				contextPercentage = Math.min(
					100,
					Math.round((contextTokens / maxTokens) * 100),
				);
			} else {
				// No context data yet - session not started
				contextTokens = null;
				contextPercentage = null;
			}
		} else {
			const contextData = await getContextData({
				transcriptPath: input.transcript_path,
				maxContextTokens: config.context.maxContextTokens,
				autocompactBufferTokens: config.context.autocompactBufferTokens,
				useUsableContextOnly: config.context.useUsableContextOnly,
				overheadTokens: config.context.overheadTokens,
			});
			contextTokens = contextData.tokens;
			contextPercentage = contextData.percentage;
		}

		// Get period cost from SQLite (if feature exists)
		let periodCost: number | undefined;
		let todayCost: number | undefined;

		if (getPeriodCost && getTodayCostV2 && normalizeResetsAt) {
			const normalizedPeriodId = currentResetsAt
				? normalizeResetsAt(currentResetsAt)
				: null;
			periodCost = normalizedPeriodId ? getPeriodCost(normalizedPeriodId) : 0;
			todayCost = getTodayCostV2();
		}

		const data: StatuslineData = {
			branch: formatBranch(git, config.git),
			dirPath: formatPath(input.workspace.current_dir, config.pathDisplayMode),
			modelName: input.model.display_name,
			sessionCost: formatCost(
				input.cost.total_cost_usd,
				config.session.cost.format,
			),
			sessionDuration: formatDuration(input.cost.total_duration_ms),
			contextTokens,
			contextPercentage,
			...(getUsageLimits && {
				usageLimits: {
					five_hour: usageLimits.five_hour
						? {
								utilization: usageLimits.five_hour.utilization,
								resets_at: usageLimits.five_hour.resets_at,
							}
						: null,
					seven_day: usageLimits.seven_day
						? {
								utilization: usageLimits.seven_day.utilization,
								resets_at: usageLimits.seven_day.resets_at,
							}
						: null,
				},
			}),
			...((getPeriodCost || getTodayCostV2) && { periodCost, todayCost }),
		};

		const output = renderStatusline(data, config);
		console.log(output);
		if (config.oneLine) {
			console.log("");
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.log(`${colors.red("Error:")} ${errorMessage}`);
		console.log(colors.gray("Check statusline configuration"));
	}
}

main();
