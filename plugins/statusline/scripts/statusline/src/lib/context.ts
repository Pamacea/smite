import { readFile } from "node:fs/promises";

export interface ContextData {
  tokens: number | null;
  percentage: number | null;
  lastOutputTokens: number | null;
}

export interface ContextOptions {
  transcriptPath: string;
  maxContextTokens: number;
  autocompactBufferTokens: number;
  useUsableContextOnly: boolean;
  overheadTokens: number;
}

/**
 * Calculate context tokens from transcript file
 * NOTE: The payload's current_usage is always 0, so we estimate from transcript content
 */
export async function getContextData(
  options: ContextOptions
): Promise<ContextData> {
  const {
    transcriptPath,
    maxContextTokens,
    autocompactBufferTokens,
    useUsableContextOnly,
    overheadTokens,
  } = options;

  try {
    const content = await readFile(transcriptPath, "utf-8");
    const lines = content.split("\n").filter((line) => line.trim());

    // Estimate tokens by counting characters in user/assistant messages
    // The transcript's `usage` fields are always 0, so we estimate from content size
    let totalChars = 0;
    let messageCount = 0;

    for (const line of lines) {
      try {
        const entry = JSON.parse(line);

        // Count user and assistant messages (these are in the context)
        if (entry.type === "user" || entry.type === "assistant") {
          totalChars += line.length;
          messageCount++;
        }
      } catch {
        // Skip lines that can't be parsed
        continue;
      }
    }

    // Rough estimate: ~3 characters per token (conservative estimate)
    // This is approximate but better than relying on empty `usage` fields
    let estimatedTokens = Math.round(totalChars / 3);

    // Add overhead tokens
    estimatedTokens += overheadTokens;

    // Calculate usable context
    let usableTokens = estimatedTokens;
    if (useUsableContextOnly) {
      usableTokens = Math.max(0, estimatedTokens - autocompactBufferTokens);
    }

    // Calculate percentage
    const percentage = Math.min(
      100,
      Math.round((usableTokens / maxContextTokens) * 100)
    );

    // lastOutputTokens can't be reliably determined from transcript (usage is always 0)
    const lastOutputTokens = null;

    return {
      tokens: usableTokens,
      percentage,
      lastOutputTokens,
    };
  } catch {
    // Transcript not available or parse error
    return {
      tokens: null,
      percentage: null,
      lastOutputTokens: null,
    };
  }
}
