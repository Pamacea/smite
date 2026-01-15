// SMITE Ralph - Spec Lock Mechanism
// Enables agents to pause execution when logical gaps are found

import * as fs from "fs/promises";
import * as path from "path";

export interface SpecLockState {
  locked: boolean;
  storyId: string;
  gapDescription: string;
  lockedAt: number;
  agent: string;
}

export class SpecLock {
  private smiteDir: string;
  private lockFilePath: string;

  constructor(smiteDir: string) {
    this.smiteDir = smiteDir;
    this.lockFilePath = path.join(smiteDir, "spec-lock.json");
  }

  /**
   * Check if spec is currently locked (agent waiting for update)
   */
  async isLocked(): Promise<boolean> {
    try {
      const lockState = await this.loadLock();
      return lockState?.locked ?? false;
    } catch {
      return false;
    }
  }

  /**
   * Check if agent should lock (stop execution)
   */
  async checkLockCondition(): Promise<boolean> {
    return this.isLocked();
  }

  /**
   * Report a logic gap and lock execution
   * Called by agent when it finds a logical inconsistency
   */
  async reportGap(storyId: string, agent: string, gapDescription: string): Promise<void> {
    const lockState: SpecLockState = {
      locked: true,
      storyId,
      agent,
      gapDescription,
      lockedAt: Date.now(),
    };

    await this.saveLock(lockState);

    console.log("\n🔒 SPEC LOCK ACTIVATED");
    console.log(`   Story: ${storyId}`);
    console.log(`   Agent: ${agent}`);
    console.log(`   Gap: ${gapDescription}`);
    console.log("   ⏸️  Execution paused. Update the spec to continue.\n");
  }

  /**
   * Wait for spec update (poll-based)
   * In production, this could use file watching or events
   */
  async waitForSpecUpdate(timeoutMs = 300000): Promise<boolean> {
    const startTime = Date.now();
    const checkInterval = 5000; // Check every 5 seconds

    console.log("⏳ Waiting for spec update...");

    while (Date.now() - startTime < timeoutMs) {
      const locked = await this.isLocked();
      if (!locked) {
        console.log("✅ Spec lock released. Resuming execution.\n");
        return true;
      }

      await new Promise((resolve) => setTimeout(resolve, checkInterval));
    }

    console.log("⏰ Timeout waiting for spec update.\n");
    return false;
  }

  /**
   * Release the lock (spec has been updated)
   * Called by user/orchestrator after fixing the gap
   */
  async releaseLock(): Promise<void> {
    try {
      await fs.unlink(this.lockFilePath);
      console.log("🔓 Spec lock released.\n");
    } catch (error) {
      // File might not exist, that's ok
      console.log("ℹ️  No lock to release.\n");
    }
  }

  /**
   * Get current lock state
   */
  async getLockState(): Promise<SpecLockState | null> {
    return this.loadLock();
  }

  /**
   * Load lock state from file
   */
  private async loadLock(): Promise<SpecLockState | null> {
    try {
      const content = await fs.readFile(this.lockFilePath, "utf-8");
      return JSON.parse(content) as SpecLockState;
    } catch {
      return null;
    }
  }

  /**
   * Save lock state to file
   */
  private async saveLock(lockState: SpecLockState): Promise<void> {
    await fs.writeFile(this.lockFilePath, JSON.stringify(lockState, null, 2), "utf-8");
  }

  /**
   * Get lock information as formatted string
   */
  async getLockInfo(): Promise<string> {
    const lockState = await this.loadLock();

    if (!lockState || !lockState.locked) {
      return "No active spec lock.";
    }

    const lockedDuration = Math.floor((Date.now() - lockState.lockedAt) / 1000);
    const minutes = Math.floor(lockedDuration / 60);
    const seconds = lockedDuration % 60;

    return `
🔒 SPEC LOCK ACTIVE
==================
Story: ${lockState.storyId}
Agent: ${lockState.agent}
Locked: ${minutes}m ${seconds}s ago

Gap Description:
${lockState.gapDescription}

To release: Update the specification and run spec-release command
    `.trim();
  }
}
