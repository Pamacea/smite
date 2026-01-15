import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { RalphState } from './types';
import { PRDParser } from './prd-parser';

export class StateManager {
  private readonly statePath: string;
  private readonly progressPath: string;
  private static readonly MINUTES_MS = 60000;

  constructor(smiteDir: string) {
    this.statePath = path.join(smiteDir, 'ralph-state.json');
    this.progressPath = path.join(smiteDir, 'progress.txt');
  }

  initialize(maxIterations: number, prdPath?: string): RalphState {
    // Use provided PRD path or default to standard location
    const effectivePrdPath = prdPath || PRDParser.getStandardPRDPath();

    // Validate PRD exists
    if (!fs.existsSync(effectivePrdPath)) {
      throw new Error(`PRD not found at ${effectivePrdPath}. Cannot initialize Ralph session.`);
    }

    const state: RalphState = {
      sessionId: uuidv4(),
      startTime: Date.now(),
      currentIteration: 0,
      maxIterations,
      currentBatch: 0,
      totalBatches: 0,
      completedStories: [],
      failedStories: [],
      inProgressStory: null,
      status: 'running',
      lastActivity: Date.now(),
      prdPath: effectivePrdPath,
    };

    this.save(state);
    this.logProgress(`\n🚀 Ralph session started: ${state.sessionId}`);
    this.logProgress(`📄 PRD: ${effectivePrdPath}`);
    this.logProgress(`🔄 Max iterations: ${maxIterations}\n`);

    return state;
  }

  load(): RalphState | null {
    if (!fs.existsSync(this.statePath)) return null;

    try {
      return JSON.parse(fs.readFileSync(this.statePath, 'utf-8')) as RalphState;
    } catch {
      return null;
    }
  }

  save(state: RalphState): void {
    fs.writeFileSync(this.statePath, JSON.stringify(state, null, 2));
  }

  update(updates: Partial<RalphState>): RalphState | null {
    const state = this.load();
    if (!state) return null;

    const updated = { ...state, ...updates, lastActivity: Date.now() };
    this.save(updated);
    return updated;
  }

  markStoryResult(storyId: string, success: boolean, error?: string): RalphState | null {
    const state = this.load();
    if (!state) return null;

    const array = success ? state.completedStories : state.failedStories;
    const emoji = success ? '✅' : '❌';
    const status = success ? 'PASSED' : `FAILED: ${error}`;

    if (!array.includes(storyId)) {
      array.push(storyId);
      this.logProgress(`${emoji} ${storyId} - ${status}`);
    }

    state.currentIteration++;
    state.lastActivity = Date.now();
    this.save(state);

    return state;
  }

  setInProgress(storyId: string | null): RalphState | null {
    return this.update({ inProgressStory: storyId });
  }

  setStatus(status: RalphState['status']): RalphState | null {
    const state = this.update({ status });
    if (state) {
      this.logProgress(`\n📊 Status changed to: ${status}`);
    }
    return state;
  }

  readProgress(): string {
    if (!fs.existsSync(this.progressPath)) return '';

    try {
      return fs.readFileSync(this.progressPath, 'utf-8');
    } catch {
      return '';
    }
  }

  clear(): void {
    [this.statePath, this.progressPath].forEach(filePath => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  }

  getDuration(state: RalphState): string {
    const duration = Date.now() - state.startTime;
    const minutes = Math.floor(duration / StateManager.MINUTES_MS);
    const seconds = Math.floor((duration % StateManager.MINUTES_MS) / 1000);
    return `${minutes}m ${seconds}s`;
  }

  private logProgress(...messages: string[]): void {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(this.progressPath, messages.map(m => `[${timestamp}] ${m}`).join('\n') + '\n');
  }

  /**
   * Validate that the tracked PRD still exists
   * Returns true if PRD exists, false otherwise
   */
  validatePRDExists(): boolean {
    const state = this.load();
    if (!state) return false;

    const exists = fs.existsSync(state.prdPath);
    if (!exists) {
      this.logProgress(`\n⚠️  WARNING: PRD file missing: ${state.prdPath}`);
    }
    return exists;
  }

  /**
   * Check if PRD has been modified since session started
   * (Optional feature using hash comparison)
   */
  hasPRDChanged(): boolean {
    const state = this.load();
    if (!state || !state.prdHash) return false;

    try {
      const prd = PRDParser.parseFromFile(state.prdPath);
      const currentHash = PRDParser.generateHash(prd);
      return currentHash !== state.prdHash;
    } catch {
      return false;
    }
  }
}
