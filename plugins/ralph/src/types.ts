// SMITE Ralph - Type Definitions
// Multi-agent parallel orchestration system

export interface UserStory {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  priority: number;
  agent: string;
  dependencies: string[];
  passes: boolean;
  notes: string;
}

export interface PRD {
  project: string;
  branchName: string;
  description: string;
  userStories: UserStory[];
}

export interface RalphState {
  sessionId: string;
  startTime: number;
  currentIteration: number;
  maxIterations: number;
  currentBatch: number;
  totalBatches: number;
  completedStories: string[];
  failedStories: string[];
  inProgressStory: string | null;
  status: 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  lastActivity: number;
}

export interface StoryBatch {
  batchNumber: number;
  stories: UserStory[];
  canRunInParallel: boolean;
  dependenciesMet: boolean;
}

export interface TaskResult {
  storyId: string;
  success: boolean;
  output: string;
  error?: string;
  timestamp: number;
}
