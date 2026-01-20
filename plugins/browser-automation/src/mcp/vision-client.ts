/**
 * Vision/Analysis MCP Client Wrapper
 * Wraps mcp__zai-mcp-server__* (multi-modal AI vision tools)
 */

import type {
  IMcpClient,
  Result,
  RetryConfig,
  AnalyzeImageOptions,
  UiToArtifactOptions,
  ExtractTextOptions,
  DiagnoseErrorOptions,
  AnalyzeDataVizOptions,
  UiDiffCheckOptions,
  UnderstandDiagramOptions,
  AnalyzeVideoOptions,
} from './types.js';
import {
  DEFAULT_RETRY_CONFIG,
  McpError,
} from './types.js';

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate next delay with exponential backoff
 */
function calculateDelay(
  attempt: number,
  config: RetryConfig
): number {
  const delay = Math.min(
    config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt),
    config.maxDelayMs
  );
  return delay;
}

/**
 * Execute with retry logic
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  toolName: string,
  config: RetryConfig
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry validation errors
      if (error instanceof McpError) {
        const isRetryable = !error.message.includes('validation') &&
                          !error.message.includes('invalid') &&
                          !error.message.includes('not found') &&
                          !error.message.includes('404');

        if (!isRetryable || attempt === config.maxAttempts - 1) {
          throw error;
        }
      }

      // Wait before next retry
      if (attempt < config.maxAttempts - 1) {
        const delay = calculateDelay(attempt, config);
        console.warn(`⚠️  ${toolName} failed (attempt ${attempt + 1}/${config.maxAttempts}), retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  throw new McpError(toolName, lastError, `Tool ${toolName} failed after ${config.maxAttempts} attempts`);
}

/**
 * Validate file path
 */
function isValidFilePath(path: string): boolean {
  if (!path || typeof path !== 'string') {
    return false;
  }

  // Check if path looks valid (has extension)
  const hasExtension = /\.[a-z]{2,4}$/i.test(path);
  return hasExtension || path.startsWith('http://') || path.startsWith('https://');
}

/**
 * Vision/Analysis Client
 * Wrapper for mcp__zai-mcp-server tools
 */
export class VisionClient implements IMcpClient {
  private available: boolean = true;

  constructor(private readonly retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG) {}

  /**
   * Check if the MCP server is available
   */
  isAvailable(): boolean {
    return this.available;
  }

  /**
   * Generic invoke method
   */
  async invoke<T>(tool: string, args: unknown): Promise<Result<T>> {
    try {
      const result = await withRetry(async () => {
        // @ts-ignore - MCP tool invocation (handled by SMITE runtime)
        return await globalThis[`mcp__zai-mcp-server__${tool}`](args);
      }, tool, this.retryConfig);

      return { success: true, data: result as T };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Analyze an image with AI
   *
   * @param options - Image analysis options
   * @returns Promise<string> - AI analysis of the image
   *
   * @example
   * ```typescript
   * const client = new VisionClient();
   * const result = await client.analyzeImage({
   *   imagePath: '/path/to/image.png',
   *   prompt: 'Describe the layout and components of this UI'
   * });
   * ```
   */
  async analyzeImage(options: AnalyzeImageOptions): Promise<Result<string>> {
    try {
      if (!options.imagePath || !isValidFilePath(options.imagePath)) {
        throw new McpError(
          'analyze_image',
          'Invalid image path',
          'Image path must be a valid file path or URL'
        );
      }

      if (!options.prompt || typeof options.prompt !== 'string') {
        throw new McpError(
          'analyze_image',
          'Invalid prompt',
          'Prompt must be a non-empty string'
        );
      }

      const args = {
        image_source: options.imagePath,
        prompt: options.prompt,
      };

      const result = await withRetry(async () => {
        // @ts-ignore - MCP tool invocation
        return await globalThis.mcp__zai_mcp_server__analyze_image(args);
      }, 'analyze_image', this.retryConfig);

      return { success: true, data: String(result) };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Convert UI screenshot to artifact (code, prompt, spec, or description)
   *
   * @param options - UI to artifact conversion options
   * @returns Promise<string> - Generated artifact
   *
   * @example
   * ```typescript
   * const client = new VisionClient();
   * const result = await client.uiToArtifact({
   *   imagePath: '/path/to/ui-screenshot.png',
   *   outputType: 'code',
   *   prompt: 'Generate React code for this UI'
   * });
   * ```
   */
  async uiToArtifact(options: UiToArtifactOptions): Promise<Result<string>> {
    try {
      if (!options.imagePath || !isValidFilePath(options.imagePath)) {
        throw new McpError(
          'ui_to_artifact',
          'Invalid image path',
          'Image path must be a valid file path or URL'
        );
      }

      const validOutputTypes = ['code', 'prompt', 'spec', 'description'];
      if (!validOutputTypes.includes(options.outputType)) {
        throw new McpError(
          'ui_to_artifact',
          'Invalid output type',
          `Output type must be one of: ${validOutputTypes.join(', ')}`
        );
      }

      // Build specialized prompt based on output type
      const prompt = options.prompt || this.buildDefaultPrompt(options.outputType);

      const args = {
        image_source: options.imagePath,
        output_type: options.outputType,
        prompt,
      };

      const result = await withRetry(async () => {
        // @ts-ignore - MCP tool invocation
        return await globalThis.mcp__zai_mcp_server__ui_to_artifact(args);
      }, 'ui_to_artifact', this.retryConfig);

      return { success: true, data: String(result) };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Extract text from screenshot (OCR)
   *
   * @param options - Text extraction options
   * @returns Promise<string> - Extracted text
   *
   * @example
   * ```typescript
   * const client = new VisionClient();
   * const result = await client.extractText({
   *   imagePath: '/path/to/screenshot.png',
   *   programmingLanguage: 'typescript'
   * });
   * ```
   */
  async extractText(options: ExtractTextOptions): Promise<Result<string>> {
    try {
      if (!options.imagePath || !isValidFilePath(options.imagePath)) {
        throw new McpError(
          'extract_text_from_screenshot',
          'Invalid image path',
          'Image path must be a valid file path or URL'
        );
      }

      const args: Record<string, string> = {
        image_source: options.imagePath,
        prompt: options.prompt || 'Extract all text from this image',
      };

      if (options.programmingLanguage) {
        args.programming_language = options.programmingLanguage;
      }

      const result = await withRetry(async () => {
        // @ts-ignore - MCP tool invocation
        return await globalThis.mcp__zai_mcp_server__extract_text_from_screenshot(args);
      }, 'extract_text_from_screenshot', this.retryConfig);

      return { success: true, data: String(result) };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Diagnose error from screenshot
   *
   * @param options - Error diagnosis options
   * @returns Promise<string> - Diagnosis and suggestions
   *
   * @example
   * ```typescript
   * const client = new VisionClient();
   * const result = await client.diagnoseError({
   *   imagePath: '/path/to/error-screenshot.png',
   *   prompt: 'What is causing this error and how do I fix it?',
   *   context: 'During npm install'
   * });
   * ```
   */
  async diagnoseError(options: DiagnoseErrorOptions): Promise<Result<string>> {
    try {
      if (!options.imagePath || !isValidFilePath(options.imagePath)) {
        throw new McpError(
          'diagnose_error_screenshot',
          'Invalid image path',
          'Image path must be a valid file path or URL'
        );
      }

      if (!options.prompt || typeof options.prompt !== 'string') {
        throw new McpError(
          'diagnose_error_screenshot',
          'Invalid prompt',
          'Prompt must be a non-empty string'
        );
      }

      const args: Record<string, string> = {
        image_source: options.imagePath,
        prompt: options.prompt,
      };

      if (options.context) {
        args.context = options.context;
      }

      const result = await withRetry(async () => {
        // @ts-ignore - MCP tool invocation
        return await globalThis.mcp__zai_mcp_server__diagnose_error_screenshot(args);
      }, 'diagnose_error_screenshot', this.retryConfig);

      return { success: true, data: String(result) };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Analyze data visualization (charts, graphs)
   *
   * @param options - Data visualization analysis options
   * @returns Promise<string> - Insights from the visualization
   */
  async analyzeDataViz(options: AnalyzeDataVizOptions): Promise<Result<string>> {
    try {
      if (!options.imagePath || !isValidFilePath(options.imagePath)) {
        throw new McpError(
          'analyze_data_visualization',
          'Invalid image path',
          'Image path must be a valid file path or URL'
        );
      }

      const args: Record<string, string> = {
        image_source: options.imagePath,
        prompt: options.prompt,
      };

      if (options.analysisFocus) {
        args.analysis_focus = options.analysisFocus;
      }

      const result = await withRetry(async () => {
        // @ts-ignore - MCP tool invocation
        return await globalThis.mcp__zai_mcp_server__analyze_data_visualization(args);
      }, 'analyze_data_visualization', this.retryConfig);

      return { success: true, data: String(result) };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Compare two UI screenshots for differences
   *
   * @param options - UI comparison options
   * @returns Promise<string> - Comparison results
   */
  async uiDiffCheck(options: UiDiffCheckOptions): Promise<Result<string>> {
    try {
      if (!options.expectedImagePath || !isValidFilePath(options.expectedImagePath)) {
        throw new McpError(
          'ui_diff_check',
          'Invalid expected image path',
          'Expected image path must be a valid file path or URL'
        );
      }

      if (!options.actualImagePath || !isValidFilePath(options.actualImagePath)) {
        throw new McpError(
          'ui_diff_check',
          'Invalid actual image path',
          'Actual image path must be a valid file path or URL'
        );
      }

      if (!options.prompt || typeof options.prompt !== 'string') {
        throw new McpError(
          'ui_diff_check',
          'Invalid prompt',
          'Prompt must be a non-empty string'
        );
      }

      const args = {
        expected_image_source: options.expectedImagePath,
        actual_image_source: options.actualImagePath,
        prompt: options.prompt,
      };

      const result = await withRetry(async () => {
        // @ts-ignore - MCP tool invocation
        return await globalThis.mcp__zai_mcp_server__ui_diff_check(args);
      }, 'ui_diff_check', this.retryConfig);

      return { success: true, data: String(result) };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Understand technical diagrams (architecture, flowcharts, etc.)
   *
   * @param options - Diagram understanding options
   * @returns Promise<string> - Explanation of the diagram
   */
  async understandDiagram(options: UnderstandDiagramOptions): Promise<Result<string>> {
    try {
      if (!options.imagePath || !isValidFilePath(options.imagePath)) {
        throw new McpError(
          'understand_technical_diagram',
          'Invalid image path',
          'Image path must be a valid file path or URL'
        );
      }

      if (!options.prompt || typeof options.prompt !== 'string') {
        throw new McpError(
          'understand_technical_diagram',
          'Invalid prompt',
          'Prompt must be a non-empty string'
        );
      }

      const args: Record<string, string> = {
        image_source: options.imagePath,
        prompt: options.prompt,
      };

      if (options.diagramType) {
        args.diagram_type = options.diagramType;
      }

      const result = await withRetry(async () => {
        // @ts-ignore - MCP tool invocation
        return await globalThis.mcp__zai_mcp_server__understand_technical_diagram(args);
      }, 'understand_technical_diagram', this.retryConfig);

      return { success: true, data: String(result) };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Analyze video content
   *
   * @param options - Video analysis options
   * @returns Promise<string> - Video analysis
   */
  async analyzeVideo(options: AnalyzeVideoOptions): Promise<Result<string>> {
    try {
      if (!options.videoPath || !isValidFilePath(options.videoPath)) {
        throw new McpError(
          'analyze_video',
          'Invalid video path',
          'Video path must be a valid file path or URL'
        );
      }

      if (!options.prompt || typeof options.prompt !== 'string') {
        throw new McpError(
          'analyze_video',
          'Invalid prompt',
          'Prompt must be a non-empty string'
        );
      }

      const args = {
        video_source: options.videoPath,
        prompt: options.prompt,
      };

      const result = await withRetry(async () => {
        // @ts-ignore - MCP tool invocation
        return await globalThis.mcp__zai_mcp_server__analyze_video(args);
      }, 'analyze_video', this.retryConfig);

      return { success: true, data: String(result) };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Build default prompt based on output type
   */
  private buildDefaultPrompt(outputType: UiToArtifactOptions['outputType']): string {
    switch (outputType) {
      case 'code':
        return 'Describe in detail the layout structure, color style, main components, and interactive elements of the website in this image to facilitate subsequent code generation by the model.';
      case 'prompt':
        return 'Create a detailed prompt that would allow another AI to recreate this UI design.';
      case 'spec':
        return 'Extract a comprehensive design specification from this UI, including layout, colors, typography, components, and interactions.';
      case 'description':
        return 'Provide a detailed natural language description of this user interface, its layout, components, and visual design.';
      default:
        return 'Analyze this image in detail.';
    }
  }
}

/**
 * Convenience functions for quick vision operations
 */
export async function analyzeImage(
  imagePath: string,
  prompt: string
): Promise<Result<string>> {
  const client = new VisionClient();
  return client.analyzeImage({ imagePath, prompt });
}

export async function extractTextFromScreenshot(
  imagePath: string,
  programmingLanguage?: string
): Promise<Result<string>> {
  const client = new VisionClient();
  return client.extractText({
    imagePath,
    prompt: 'Extract all text from this image',
    programmingLanguage,
  });
}

export async function uiToCode(
  imagePath: string,
  targetFramework?: 'react' | 'vue' | 'svelte' | 'html'
): Promise<Result<string>> {
  const client = new VisionClient();
  const prompt = targetFramework
    ? `Generate ${targetFramework} code for this UI`
    : 'Generate code for this UI';
  return client.uiToArtifact({
    imagePath,
    outputType: 'code',
    prompt,
  });
}

export async function diagnoseErrorScreenshot(
  imagePath: string,
  context?: string
): Promise<Result<string>> {
  const client = new VisionClient();
  return client.diagnoseError({
    imagePath,
    prompt: 'What is causing this error and how do I fix it?',
    context,
  });
}
