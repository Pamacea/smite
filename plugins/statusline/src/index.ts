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
const DEBUG_PATH = join(import.meta.dir, "..", "data", "debug.txt");

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
			cache_creation_input_tokens?: number;
			cache_read_input_tokens?: number;
		};
	};
	timestamp?: string;
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

function extractTokens(sessionData: SessionLine[]): { input: number; output: number; total: number; cacheRead: number; cacheCreation: number } {
	// Find the most recent assistant message with actual token usage
	// This gives us CURRENT context window usage, not cumulative session total
	for (let i = sessionData.length - 1; i >= 0; i--) {
		const e = sessionData[i];
		if (e.type === "assistant" && e.message?.usage) {
			const input = e.message.usage.input_tokens || 0;
			const output = e.message.usage.output_tokens || 0;
			const cacheRead = e.message.usage.cache_read_input_tokens || 0;
			const cacheCreation = e.message.usage.cache_creation_input_tokens || 0;
			return { input, output, total: input + output, cacheRead, cacheCreation };
		}
	}
	// Fallback: cumulative (only for sessions without assistant messages yet)
	let input = 0, output = 0, cacheRead = 0, cacheCreation = 0;
	for (const e of sessionData) {
		if (e.message?.usage) {
			input += e.message.usage.input_tokens || 0;
			output += e.message.usage.output_tokens || 0;
			cacheRead += e.message.usage.cache_read_input_tokens || 0;
			cacheCreation += e.message.usage.cache_creation_input_tokens || 0;
		}
	}
	return { input, output, total: input + output, cacheRead, cacheCreation };
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
	// Calculate duration from first timestamp to NOW (for live sessions)
	let firstTimestamp: string | null = null;
	for (const e of sessionData) {
		if (e.timestamp) {
			if (!firstTimestamp) firstTimestamp = e.timestamp;
		}
	}
	if (!firstTimestamp) return 0;
	// Use current time for live sessions
	return Date.now() - new Date(firstTimestamp).getTime();
}

// Complete partial HookInput with data from transcript
async function completeHookInput(partial: Partial<HookInput>): Promise<HookInput> {
	// CRITICAL: Always use payload paths if provided - NEVER search for sessions!
	// The payload from Claude Code has the CORRECT transcript_path and cwd
	const transcriptPath = partial.transcript_path || "";
	const workingDir = partial.cwd || "";

	// Debug: log what we received
	const debugInfo = {
		partial_session_id: partial.session_id,
		partial_transcript: partial.transcript_path,
		partial_cwd: partial.cwd,
		using_transcript: !!transcriptPath,
		using_cwd: !!workingDir,
		process_cwd: process.cwd(),
	};

	// If no paths provided, we can't do anything useful
	if (!transcriptPath && !workingDir) {
		return {
			session_id: partial.session_id || "unknown",
			transcript_path: "",
			cwd: process.cwd(),
			model: { id: "unknown", display_name: "N/A" },
			workspace: { current_dir: process.cwd(), project_dir: process.cwd() },
			version: "1.0.0",
			output_style: { name: "Explanatory" },
			cost: { total_cost_usd: 0, total_duration_ms: 0, total_api_duration_ms: 0, total_lines_added: 0, total_lines_removed: 0 },
			context_window: {
				total_input_tokens: 0,
				total_output_tokens: 0,
				context_window_size: 200000
			}
		};
	}

	// Read session data
	const sessionData = transcriptPath ? await readSession(transcriptPath) : [];

	// Extract data from session
	const latestEntry = sessionData.slice().reverse().find(e => e.type === "assistant" || e.type === "api_call_start");
	const model = extractModelName(latestEntry || {});
	const tokens = extractTokens(sessionData);
	const cost = calculateCost(tokens, model);
	const durationMs = calculateDuration(sessionData);

	return {
		session_id: partial.session_id || "current",
		transcript_path: transcriptPath,
		cwd: workingDir,
		model: { id: model.toLowerCase().replace(/\s+/g, "-"), display_name: model },
		workspace: { current_dir: workingDir, project_dir: workingDir },
		version: partial.version || "1.0.0",
		output_style: partial.output_style || { name: "Explanatory" },
		cost: { total_cost_usd: cost, total_duration_ms: durationMs, total_api_duration_ms: 0, total_lines_added: 0, total_lines_removed: 0 },
		context_window: {
			total_input_tokens: tokens.input,
			total_output_tokens: tokens.output,
			context_window_size: 200000,
			current_usage: {
				input_tokens: tokens.input,
				output_tokens: tokens.output,
				cache_read_input_tokens: tokens.cacheRead,
				cache_creation_input_tokens: tokens.cacheCreation
			}
		}
	};
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
					const partialInput = JSON.parse(stdinText) as Partial<HookInput>;
					// Complete partial input with data from transcript
					input = await completeHookInput(partialInput);
				} else {
					input = await completeHookInput({});
				}
			} catch {
				input = await completeHookInput({});
			}
		} else {
			input = await completeHookInput({});
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

		// Always use getContextData from transcript (payload doesn't have reliable context data)
		const contextData = await getContextData({
			transcriptPath: input.transcript_path,
			maxContextTokens: config.context.maxContextTokens,
			autocompactBufferTokens: config.context.autocompactBufferTokens,
			useUsableContextOnly: config.context.useUsableContextOnly,
			overheadTokens: config.context.overheadTokens,
		});
		contextTokens = contextData.tokens;
		contextPercentage = contextData.percentage;

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
