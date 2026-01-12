// SMITE Ralph - Stop Hook Handler
// Implements Ralph Wiggum infinite loop technique

import * as fs from 'fs';
import * as path from 'path';
import { RalphState } from './types';

export class StopHookHandler {
  private smiteDir: string;
  private statePath: string;
  private originalPromptPath: string;

  constructor(cwd: string = process.cwd()) {
    this.smiteDir = path.join(cwd, '.smite');
    this.statePath = path.join(this.smiteDir, 'ralph-state.json');
    this.originalPromptPath = path.join(this.smiteDir, 'original-prompt.txt');
  }

  /**
   * Check if Ralph should continue looping
   * Returns the original prompt if should continue, null otherwise
   */
  shouldContinue(): string | null {
    // Load state
    if (!fs.existsSync(this.statePath)) {
      return null;
    }

    const state: RalphState = JSON.parse(fs.readFileSync(this.statePath, 'utf-8'));

    // Check if running
    if (state.status !== 'running') {
      return null;
    }

    // Check if max iterations reached
    if (state.currentIteration >= state.maxIterations) {
      this.updateStatus('failed');
      return null;
    }

    // Check for inactivity timeout (30 minutes)
    const inactiveTime = Date.now() - state.lastActivity;
    if (inactiveTime > 30 * 60 * 1000) {
      this.updateStatus('failed');
      this.appendProgress('⏰ Session timed out after 30 minutes of inactivity');
      return null;
    }

    // Load original prompt
    if (!fs.existsSync(this.originalPromptPath)) {
      return null;
    }

    const originalPrompt = fs.readFileSync(this.originalPromptPath, 'utf-8');

    // Increment iteration
    state.currentIteration++;
    state.lastActivity = Date.now();
    fs.writeFileSync(this.statePath, JSON.stringify(state, null, 2));

    // Append progress
    this.appendProgress(`🔄 Iteration ${state.currentIteration}/${state.maxIterations}`);

    // Return original prompt to continue loop
    return originalPrompt;
  }

  /**
   * Save original prompt for looping
   */
  saveOriginalPrompt(prompt: string): void {
    fs.writeFileSync(this.originalPromptPath, prompt);
    this.appendProgress(`💾 Original prompt saved for looping`);
  }

  /**
   * Initialize Ralph session
   */
  initializeSession(maxIterations: number): void {
    const state: RalphState = {
      sessionId: this.generateSessionId(),
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

    fs.writeFileSync(this.statePath, JSON.stringify(state, null, 2));
    this.appendProgress(`🚀 Ralph session initialized: ${state.sessionId}`);
  }

  /**
   * Update session status
   */
  updateStatus(status: RalphState['status']): void {
    if (!fs.existsSync(this.statePath)) return;

    const state: RalphState = JSON.parse(fs.readFileSync(this.statePath, 'utf-8'));
    state.status = status;
    state.lastActivity = Date.now();
    fs.writeFileSync(this.statePath, JSON.stringify(state, null, 2));

    this.appendProgress(`📊 Status updated: ${status}`);
  }

  /**
   * Mark story as completed
   */
  markStoryCompleted(storyId: string): void {
    if (!fs.existsSync(this.statePath)) return;

    const state: RalphState = JSON.parse(fs.readFileSync(this.statePath, 'utf-8'));
    if (!state.completedStories.includes(storyId)) {
      state.completedStories.push(storyId);
      this.appendProgress(`✅ ${storyId} - PASSED`);
    }
    state.lastActivity = Date.now();
    fs.writeFileSync(this.statePath, JSON.stringify(state, null, 2));
  }

  /**
   * Mark story as failed
   */
  markStoryFailed(storyId: string, error: string): void {
    if (!fs.existsSync(this.statePath)) return;

    const state: RalphState = JSON.parse(fs.readFileSync(this.statePath, 'utf-8'));
    if (!state.failedStories.includes(storyId)) {
      state.failedStories.push(storyId);
      this.appendProgress(`❌ ${storyId} - FAILED: ${error}`);
    }
    state.currentIteration++;
    state.lastActivity = Date.now();
    fs.writeFileSync(this.statePath, JSON.stringify(state, null, 2));
  }

  /**
   * Get current state
   */
  getState(): RalphState | null {
    if (!fs.existsSync(this.statePath)) return null;
    return JSON.parse(fs.readFileSync(this.statePath, 'utf-8'));
  }

  /**
   * Append to progress log
   */
  private appendProgress(message: string): void {
    const progressPath = path.join(this.smiteDir, 'progress.txt');
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(progressPath, logEntry);
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `ralph-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear session
   */
  clear(): void {
    if (fs.existsSync(this.statePath)) {
      fs.unlinkSync(this.statePath);
    }
    if (fs.existsSync(this.originalPromptPath)) {
      fs.unlinkSync(this.originalPromptPath);
    }
  }

  /**
   * Get session summary
   */
  getSummary(): string {
    const state = this.getState();
    if (!state) return 'No active Ralph session';

    const duration = Date.now() - state.startTime;
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);

    return `
Ralph Session Summary
=====================
Session ID: ${state.sessionId}
Status: ${state.status}
Duration: ${minutes}m ${seconds}s
Iterations: ${state.currentIteration}/${state.maxIterations}
Completed: ${state.completedStories.length} stories
Failed: ${state.failedStories.length} stories
In Progress: ${state.inProgressStory || 'None'}
    `.trim();
  }
}
