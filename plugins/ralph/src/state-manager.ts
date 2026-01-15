import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { RalphState } from "./types";
import { PRDParser } from "./prd-parser";

export class StateManager {
  private readonly statePath: string;
  private readonly progressPath: string;
  private static readonly MINUTES_MS = 60000;

  constructor(smiteDir: string) {
    this.statePath = path.join(smiteDir, "ralph-state.json");
    this.progressPath = path.join(smiteDir, "progress.txt");
  }

  async initialize(maxIterations: number, prdPath?: string): Promise<RalphState> {
    // Use provided PRD path or default to standard location
    const effectivePrdPath = prdPath || PRDParser.getStandardPRDPath();

    // Validate PRD exists
    try {
      await fs.promises.access(effectivePrdPath, fs.constants.F_OK);
    } catch {
      throw new Error(`PRD not found at ${effectivePrdPath}. Cannot initialize Ralph session.`);
    }

    const state: RalphState = {
      sessionId: crypto.randomUUID(),
      startTime: Date.now(),
      currentIteration: 0,
      maxIterations,
      currentBatch: 0,
      totalBatches: 0,
      completedStories: [],
      failedStories: [],
      inProgressStory: null,
      status: "running",
      lastActivity: Date.now(),
      prdPath: effectivePrdPath,
    };

    await this.save(state);
    await this.logProgress(`\n🚀 Ralph session started: ${state.sessionId}`);
    await this.logProgress(`📄 PRD: ${effectivePrdPath}`);
    await this.logProgress(`🔄 Max iterations: ${maxIterations}\n`);

    return state;
  }

  async load(): Promise<RalphState | null> {
    try {
      await fs.promises.access(this.statePath, fs.constants.F_OK);
    } catch {
      return null;
    }

    try {
      const content = await fs.promises.readFile(this.statePath, "utf-8");
      return JSON.parse(content) as RalphState;
    } catch {
      return null;
    }
  }

  async save(state: RalphState): Promise<void> {
    await fs.promises.writeFile(this.statePath, JSON.stringify(state, null, 2), "utf-8");
  }

  async update(updates: Partial<RalphState>): Promise<RalphState | null> {
    const state = await this.load();
    if (!state) return null;

    const updated = { ...state, ...updates, lastActivity: Date.now() };
    await this.save(updated);
    return updated;
  }

  async markStoryResult(
    storyId: string,
    success: boolean,
    error?: string
  ): Promise<RalphState | null> {
    const state = await this.load();
    if (!state) return null;

    const array = success ? state.completedStories : state.failedStories;
    const emoji = success ? "✅" : "❌";
    const status = success ? "PASSED" : `FAILED: ${error}`;

    if (!array.includes(storyId)) {
      array.push(storyId);
      await this.logProgress(`${emoji} ${storyId} - ${status}`);
    }

    state.currentIteration++;
    state.lastActivity = Date.now();
    await this.save(state);

    return state;
  }

  async setInProgress(storyId: string | null): Promise<RalphState | null> {
    return await this.update({ inProgressStory: storyId });
  }

  async setStatus(status: RalphState["status"]): Promise<RalphState | null> {
    const state = await this.update({ status });
    if (state) {
      await this.logProgress(`\n📊 Status changed to: ${status}`);
    }
    return state;
  }

  async readProgress(): Promise<string> {
    try {
      await fs.promises.access(this.progressPath, fs.constants.F_OK);
      return await fs.promises.readFile(this.progressPath, "utf-8");
    } catch {
      return "";
    }
  }

  async clear(): Promise<void> {
    for (const filePath of [this.statePath, this.progressPath]) {
      try {
        await fs.promises.unlink(filePath);
      } catch {
        // File doesn't exist, skip
      }
    }
  }

  getDuration(state: RalphState): string {
    const duration = Date.now() - state.startTime;
    const minutes = Math.floor(duration / StateManager.MINUTES_MS);
    const seconds = Math.floor((duration % StateManager.MINUTES_MS) / 1000);
    return `${minutes}m ${seconds}s`;
  }

  private async logProgress(...messages: string[]): Promise<void> {
    const timestamp = new Date().toISOString();
    const content = messages.map((m) => `[${timestamp}] ${m}`).join("\n") + "\n";
    await fs.promises.appendFile(this.progressPath, content, "utf-8");
  }

  /**
   * Validate that the tracked PRD still exists - async
   * Returns true if PRD exists, false otherwise
   */
  async validatePRDExists(): Promise<boolean> {
    const state = await this.load();
    if (!state) return false;

    try {
      await fs.promises.access(state.prdPath, fs.constants.F_OK);
      return true;
    } catch {
      await this.logProgress(`\n⚠️  WARNING: PRD file missing: ${state.prdPath}`);
      return false;
    }
  }

  /**
   * Check if PRD has been modified since session started - async
   * (Optional feature using hash comparison)
   */
  async hasPRDChanged(): Promise<boolean> {
    const state = await this.load();
    if (!state || !state.prdHash) return false;

    try {
      const prd = await PRDParser.parseFromFile(state.prdPath);
      const currentHash = PRDParser.generateHash(prd);
      return currentHash !== state.prdHash;
    } catch {
      return false;
    }
  }
}
