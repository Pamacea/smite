/**
 * Hook input data structure from Claude Code
 */
export interface HookInput {
  workspace: {
    current_dir: string;
  };
  model: {
    display_name: string;
  };
  cost: {
    total_cost_usd: number;
    total_duration_ms: number;
  };
  transcript_path: string;
  context_window?: {
    current_usage?: {
      input_tokens?: number;
      cache_creation_input_tokens?: number;
      cache_read_input_tokens?: number;
    };
    context_window_size?: number;
  };
}

/**
 * Git status information
 */
export interface GitStatus {
  branch: string | null;
  changes: number;
  staged: number;
  unstaged: number;
  isDirty: boolean;
}

/**
 * Usage limit information
 */
export interface UsageLimit {
  utilization: number;
  resets_at: string;
}

/**
 * Formatted context data
 */
export interface ContextData {
  tokens: number | null;
  percentage: number | null;
  lastOutputTokens: number | null;
}
