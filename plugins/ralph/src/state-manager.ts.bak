// SMITE Ralph - State Manager
// Manage Ralph execution state in .smite/ralph-state.json

import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { RalphState } from './types';

export class StateManager {
  private statePath: string;
  private progressPath: string;

  constructor(smiteDir: string) {
    this.statePath = path.join(smiteDir, 'ralph-state.json');
    this.progressPath = path.join(smiteDir, 'progress.txt');
  }

  /**
   * Initialize new Ralph session
   */
  initialize(maxIterations: number): RalphState {
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
    };

    this.save(state);
    this.appendProgress(`\n🚀 Ralph session started: ${state.sessionId}`);
    this.appendProgress(`Max iterations: ${maxIterations}\n`);

    return state;
  }

  /**
   * Load current state
   */
  load(): RalphState | null {
    if (!fs.existsSync(this.statePath)) return null;

    try {
      const content = fs.readFileSync(this.statePath, 'utf-8');
      return JSON.parse(content) as RalphState;
    } catch {
      return null;
    }
  }

  /**
   * Save state
   */
  save(state: RalphState): void {
    fs.writeFileSync(this.statePath, JSON.stringify(state, null, 2));
  }

  /**
   * Update state
   */
  update(updates: Partial<RalphState>): RalphState | null {
    const state = this.load();
    if (!state) return null;

    const updated = { ...state, ...updates, lastActivity: Date.now() };
    this.save(updated);
    return updated;
  }

  /**
   * Mark story as completed
   */
  markCompleted(storyId: string): RalphState | null {
    const state = this.load();
    if (!state) return null;

    if (!state.completedStories.includes(storyId)) {
      state.completedStories.push(storyId);
      this.appendProgress(`✅ ${storyId} - PASSED`);
    }

    state.currentIteration++;
    state.lastActivity = Date.now();
    this.save(state);

    return state;
  }

  /**
   * Mark story as failed
   */
  markFailed(storyId: string, error: string): RalphState | null {
    const state = this.load();
    if (!state) return null;

    if (!state.failedStories.includes(storyId)) {
      state.failedStories.push(storyId);
      this.appendProgress(`❌ ${storyId} - FAILED: ${error}`);
    }

    state.currentIteration++;
    state.lastActivity = Date.now();
    this.save(state);

    return state;
  }

  /**
   * Set in-progress story
   */
  setInProgress(storyId: string | null): RalphState | null {
    return this.update({ inProgressStory: storyId });
  }

  /**
   * Set status
   */
  setStatus(status: RalphState['status']): RalphState | null {
    const state = this.update({ status });
    if (state) {
      this.appendProgress(`\n📊 Status changed to: ${status}`);
    }
    return state;
  }

  /**
   * Append to progress log
   */
  appendProgress(message: string): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;

    fs.appendFileSync(this.progressPath, logEntry);
  }

  /**
   * Read progress log
   */
  readProgress(): string {
    if (!fs.existsSync(this.progressPath)) return '';

    try {
      return fs.readFileSync(this.progressPath, 'utf-8');
    } catch {
      return '';
    }
  }

  /**
   * Clear state
   */
  clear(): void {
    if (fs.existsSync(this.statePath)) {
      fs.unlinkSync(this.statePath);
    }
    if (fs.existsSync(this.progressPath)) {
      fs.unlinkSync(this.progressPath);
    }
  }

  /**
   * Get session duration
   */
  getDuration(state: RalphState): string {
    const duration = Date.now() - state.startTime;
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }
}
