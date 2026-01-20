/**
 * Vision Feature Module - Layer 2
 * High-level vision and UI analysis capabilities built on MCP clients
 *
 * This module provides domain-specific functionality for:
 * - General image analysis
 * - OCR text extraction
 * - UI understanding and code generation
 * - Error diagnosis
 * - Visual regression testing
 *
 * @module @smite/browser-automation/features/vision
 */

import type { Result } from '../mcp/types.js';
import { VisionClient } from '../mcp/vision-client.js';
import type {
  AnalyzeImageOptions,
  ExtractTextOptions,
  UiToArtifactOptions,
  DiagnoseErrorOptions,
  UiDiffCheckOptions,
} from '../mcp/types.js';

// ============================================================================
// Feature-Specific Types
// ============================================================================

/**
 * Image source type (local file or remote URL)
 */
export type ImageSource = string;

/**
 * Text extraction result with metadata
 */
export interface TextExtractionResult {
  text: string;
  confidence?: number;
  language?: string;
  programmingLanguage?: string;
}

/**
 * UI analysis result with component breakdown
 */
export interface UIAnalysisResult {
  description: string;
  components: Array<{
    name: string;
    type: string;
    props?: Record<string, unknown>;
  }>;
  layout: string;
  styles: string;
}

/**
 * Error diagnosis result with actionable suggestions
 */
export interface ErrorDiagnosisResult {
  errorType: string;
  errorMessage: string;
  stackTrace?: string;
  possibleCauses: string[];
  suggestedFixes: string[];
  relatedDocs?: string[];
}

/**
 * UI comparison result highlighting differences
 */
export interface UIComparisonResult {
  hasDifferences: boolean;
  differences: Array<{
    location: string;
    type: 'layout' | 'style' | 'content' | 'missing' | 'added';
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  similarityScore: number;
  summary: string;
}

// ============================================================================
// Vision Feature Class
// ============================================================================

/**
 * Vision Feature Module
 *
 * High-level API for vision and UI analysis operations.
 * Built on top of the VisionClient MCP wrapper.
 *
 * @example
 * ```typescript
 * const vision = new VisionFeature();
 *
 * // Analyze an image
 * const analysis = await vision.analyzeImage(
 *   '/path/to/screenshot.png',
 *   'Describe the UI layout and components'
 * );
 *
 * // Extract text from screenshot
 * const text = await vision.extractText('/path/to/screenshot.png');
 *
 * // Diagnose an error
 * const diagnosis = await vision.diagnoseError(
 *   '/path/to/error.png',
 *   'During npm install'
 * );
 * ```
 */
export class VisionFeature {
  private readonly client: VisionClient;

  /**
   * Create a new VisionFeature instance
   *
   * @param client - Optional VisionClient instance (creates default if not provided)
   */
  constructor(client?: VisionClient) {
    this.client = client || new VisionClient();
  }

  // ========================================================================
  // General Image Analysis
  // ========================================================================

  /**
   * Analyze an image with AI
   *
   * General-purpose image analysis for any visual content.
   * Supports both local file paths and remote URLs.
   *
   * @param source - Image source (local file path or URL)
   * @param prompt - Analysis prompt describing what to extract/understand
   * @returns Promise<Result<string>> - AI analysis result
   *
   * @example
   * ```typescript
   * const vision = new VisionFeature();
   *
   * // Local file
   * const result1 = await vision.analyzeImage(
   *   '/path/to/screenshot.png',
   *   'Describe the layout and main components of this UI'
   * );
   *
   * // Remote URL
   * const result2 = await vision.analyzeImage(
   *   'https://example.com/screenshot.png',
   *   'What are the key design patterns in this interface?'
   * );
   * ```
   */
  async analyzeImage(
    source: ImageSource,
    prompt: string
  ): Promise<Result<string>> {
    try {
      if (!source || typeof source !== 'string') {
        throw new Error('Image source must be a non-empty string (file path or URL)');
      }

      if (!prompt || typeof prompt !== 'string') {
        throw new Error('Prompt must be a non-empty string');
      }

      return await this.client.analyzeImage({
        imagePath: source,
        prompt,
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  // ========================================================================
  // Text Extraction (OCR)
  // ========================================================================

  /**
   * Extract text from an image (OCR)
   *
   * Advanced OCR with support for code syntax highlighting and
   * multiple programming languages.
   *
   * @param source - Image source (local file path or URL)
   * @param options - Extraction options
   * @returns Promise<Result<TextExtractionResult>> - Extracted text with metadata
   *
   * @example
   * ```typescript
   * const vision = new VisionFeature();
   *
   * // Extract general text
   * const text1 = await vision.extractText('/path/to/screenshot.png');
   *
   * // Extract code with syntax highlighting
   * const code = await vision.extractText(
   *   '/path/to/code-screenshot.png',
   *   { programmingLanguage: 'typescript' }
   * );
   *
   * // Extract with custom prompt
   * const text2 = await vision.extractText(
   *   '/path/to/screenshot.png',
   *   { prompt: 'Extract only error messages and line numbers' }
   * );
   * ```
   */
  async extractText(
    source: ImageSource,
    options?: Partial<ExtractTextOptions>
  ): Promise<Result<TextExtractionResult>> {
    try {
      if (!source || typeof source !== 'string') {
        throw new Error('Image source must be a non-empty string (file path or URL)');
      }

      const extractOptions: ExtractTextOptions = {
        imagePath: source,
        prompt: options?.prompt || 'Extract all text from this image, preserving structure and formatting',
        programmingLanguage: options?.programmingLanguage,
      };

      const result = await this.client.extractText(extractOptions);

      if (!result.success) {
        return result as unknown as Result<TextExtractionResult>;
      }

      // Parse raw text into structured result
      const structured: TextExtractionResult = {
        text: result.data,
        programmingLanguage: options?.programmingLanguage,
      };

      return { success: true, data: structured };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  // ========================================================================
  // UI Analysis
  // ========================================================================

  /**
   * Analyze UI and extract components
   *
   * Understand UI layouts, components, design patterns, and styles.
   * Can generate code, prompts, specs, or descriptions.
   *
   * @param source - Image source (local file path or URL)
   * @param outputType - What to generate from the UI analysis
   * @param prompt - Optional custom prompt for the analysis
   * @returns Promise<Result<UIAnalysisResult | string>> - UI analysis or generated artifact
   *
   * @example
   * ```typescript
   * const vision = new VisionFeature();
   *
   * // Generate React code from UI
   * const code = await vision.analyzeUI(
   *   '/path/to/ui-screenshot.png',
   *   'code',
   *   'Generate React code with Tailwind CSS for this UI'
   * );
   *
   * // Extract design specification
   * const spec = await vision.analyzeUI(
   *   '/path/to/ui-screenshot.png',
   *   'spec'
   * );
   *
   * // Get detailed description
   * const description = await vision.analyzeUI(
   *   '/path/to/ui-screenshot.png',
   *   'description'
   * );
   * ```
   */
  async analyzeUI(
    source: ImageSource,
    outputType: 'code' | 'prompt' | 'spec' | 'description',
    prompt?: string
  ): Promise<Result<string>> {
    try {
      if (!source || typeof source !== 'string') {
        throw new Error('Image source must be a non-empty string (file path or URL)');
      }

      const validOutputTypes = ['code', 'prompt', 'spec', 'description'];
      if (!validOutputTypes.includes(outputType)) {
        throw new Error(
          `Output type must be one of: ${validOutputTypes.join(', ')}`
        );
      }

      const uiOptions: UiToArtifactOptions = {
        imagePath: source,
        outputType,
        prompt,
      };

      return await this.client.uiToArtifact(uiOptions);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  // ========================================================================
  // Error Diagnosis
  // ========================================================================

  /**
   * Diagnose error from screenshot
   *
   * Parse error messages, analyze stack traces, and provide
   * actionable suggestions for fixing errors.
   *
   * @param source - Image source (local file path or URL)
   * @param context - Optional context about when the error occurred
   * @returns Promise<Result<ErrorDiagnosisResult>> - Structured error diagnosis
   *
   * @example
   * ```typescript
   * const vision = new VisionFeature();
   *
   * // Diagnose error with context
   * const diagnosis = await vision.diagnoseError(
   *   '/path/to/error-screenshot.png',
   *   'During npm install in CI/CD pipeline'
   * );
   *
   * if (diagnosis.success) {
   *   console.log('Error type:', diagnosis.data.errorType);
   *   console.log('Suggested fixes:', diagnosis.data.suggestedFixes);
   * }
   * ```
   */
  async diagnoseError(
    source: ImageSource,
    context?: string
  ): Promise<Result<ErrorDiagnosisResult>> {
    try {
      if (!source || typeof source !== 'string') {
        throw new Error('Image source must be a non-empty string (file path or URL)');
      }

      const errorOptions: DiagnoseErrorOptions = {
        imagePath: source,
        prompt: 'Analyze this error screenshot. Identify the error type, error message, stack trace, possible causes, and suggest specific fixes.',
        context,
      };

      const result = await this.client.diagnoseError(errorOptions);

      if (!result.success) {
        return result as unknown as Result<ErrorDiagnosisResult>;
      }

      // Parse raw diagnosis into structured result
      const structured: ErrorDiagnosisResult = this.parseErrorDiagnosis(result.data);

      return { success: true, data: structured };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  // ========================================================================
  // Visual Regression Testing
  // ========================================================================

  /**
   * Compare two UI screenshots for differences
   *
   * Visual regression testing to detect layout, style, or content changes.
   *
   * @param expected - Expected design image source (file path or URL)
   * @param actual - Actual implementation image source (file path or URL)
   * @param focusAreas - Optional areas to focus comparison on
   * @returns Promise<Result<UIComparisonResult>> - Detailed comparison results
   *
   * @example
   * ```typescript
   * const vision = new VisionFeature();
   *
   * // Compare expected vs actual
   * const comparison = await vision.compareUI(
   *   '/path/to/expected-design.png',
   *   '/path/to/actual-implementation.png'
   * );
   *
   * if (comparison.success) {
   *   if (comparison.data.hasDifferences) {
   *     console.log('Found differences:', comparison.data.differences);
   *     console.log('Similarity score:', comparison.data.similarityScore);
   *   }
   * }
   *
   * // Compare with specific focus
   * const focused = await vision.compareUI(
   *   '/path/to/expected.png',
   *   '/path/to/actual.png',
   *   'Focus on the header component and navigation'
   * );
   * ```
   */
  async compareUI(
    expected: ImageSource,
    actual: ImageSource,
    focusAreas?: string
  ): Promise<Result<UIComparisonResult>> {
    try {
      if (!expected || typeof expected !== 'string') {
        throw new Error('Expected image source must be a non-empty string (file path or URL)');
      }

      if (!actual || typeof actual !== 'string') {
        throw new Error('Actual image source must be a non-empty string (file path or URL)');
      }

      const prompt = focusAreas
        ? `Compare these two UI screenshots. Focus specifically on: ${focusAreas}. Identify any differences in layout, styling, or content.`
        : 'Compare these two UI screenshots. Identify any differences in layout, styling, or content. List each difference with its location, type, and severity.';

      const diffOptions: UiDiffCheckOptions = {
        expectedImagePath: expected,
        actualImagePath: actual,
        prompt,
      };

      const result = await this.client.uiDiffCheck(diffOptions);

      if (!result.success) {
        return result as unknown as Result<UIComparisonResult>;
      }

      // Parse comparison result into structured format
      const structured: UIComparisonResult = this.parseUIComparison(result.data);

      return { success: true, data: structured };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  // ========================================================================
  // Advanced Analysis (Data Viz, Diagrams, Video)
  // ========================================================================

  /**
   * Analyze data visualization (charts, graphs, dashboards)
   *
   * Extract insights, trends, and metrics from data visualizations.
   *
   * @param source - Image source (local file path or URL)
   * @param prompt - What insights to extract from the visualization
   * @param analysisFocus - Optional focus area (trends, anomalies, comparisons, etc.)
   * @returns Promise<Result<string>> - Analysis insights
   *
   * @example
   * ```typescript
   * const vision = new VisionFeature();
   *
   * const insights = await vision.analyzeDataViz(
   *   '/path/to/chart.png',
   *   'What are the key trends and outliers in this chart?',
   *   'trends'
   * );
   * ```
   */
  async analyzeDataViz(
    source: ImageSource,
    prompt: string,
    analysisFocus?: string
  ): Promise<Result<string>> {
    try {
      if (!source || typeof source !== 'string') {
        throw new Error('Image source must be a non-empty string (file path or URL)');
      }

      if (!prompt || typeof prompt !== 'string') {
        throw new Error('Prompt must be a non-empty string');
      }

      return await this.client.analyzeDataViz({
        imagePath: source,
        prompt,
        analysisFocus,
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Understand technical diagrams
   *
   * Analyze architecture diagrams, flowcharts, sequence diagrams, etc.
   *
   * @param source - Image source (local file path or URL)
   * @param prompt - What to understand about the diagram
   * @param diagramType - Optional diagram type hint
   * @returns Promise<Result<string>> - Diagram explanation
   *
   * @example
   * ```typescript
   * const vision = new VisionFeature();
   *
   * const explanation = await vision.understandDiagram(
   *   '/path/to/architecture-diagram.png',
   *   'Explain the data flow and component interactions',
   *   'architecture'
   * );
   * ```
   */
  async understandDiagram(
    source: ImageSource,
    prompt: string,
    diagramType?: string
  ): Promise<Result<string>> {
    try {
      if (!source || typeof source !== 'string') {
        throw new Error('Image source must be a non-empty string (file path or URL)');
      }

      if (!prompt || typeof prompt !== 'string') {
        throw new Error('Prompt must be a non-empty string');
      }

      return await this.client.understandDiagram({
        imagePath: source,
        prompt,
        diagramType,
      });
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
   * Understand actions, scenes, and content in video files.
   *
   * @param source - Video source (local file path or URL)
   * @param prompt - What to analyze in the video
   * @returns Promise<Result<string>> - Video analysis
   *
   * @example
   * ```typescript
   * const vision = new VisionFeature();
   *
   * const analysis = await vision.analyzeVideo(
   *   '/path/to/demo-video.mp4',
   *   'Describe the user interactions and UI changes in this video'
   * );
   * ```
   */
  async analyzeVideo(
    source: ImageSource,
    prompt: string
  ): Promise<Result<string>> {
    try {
      if (!source || typeof source !== 'string') {
        throw new Error('Video source must be a non-empty string (file path or URL)');
      }

      if (!prompt || typeof prompt !== 'string') {
        throw new Error('Prompt must be a non-empty string');
      }

      return await this.client.analyzeVideo({
        videoPath: source,
        prompt,
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  // ========================================================================
  // Helper Methods
  // ========================================================================

  /**
   * Parse error diagnosis result into structured format
   */
  private parseErrorDiagnosis(rawDiagnosis: string): ErrorDiagnosisResult {
    // Try to extract structured information from the diagnosis
    const lines = rawDiagnosis.split('\n');
    const result: ErrorDiagnosisResult = {
      errorType: 'Unknown',
      errorMessage: '',
      possibleCauses: [],
      suggestedFixes: [],
    };

    let currentSection: 'error' | 'causes' | 'fixes' | 'docs' | 'none' = 'none';

    for (const line of lines) {
      const lower = line.toLowerCase();

      // Detect sections
      if (lower.includes('error type') || lower.includes('type of error')) {
        currentSection = 'error';
        result.errorType = line.split(':')[1]?.trim() || 'Unknown';
        continue;
      }
      if (lower.includes('possible cause') || lower.includes('causes:')) {
        currentSection = 'causes';
        continue;
      }
      if (lower.includes('suggested fix') || lower.includes('fix:') || lower.includes('solution')) {
        currentSection = 'fixes';
        continue;
      }
      if (lower.includes('related doc') || lower.includes('documentation') || lower.includes('reference')) {
        currentSection = 'docs';
        continue;
      }

      // Extract content based on current section
      const trimmed = line.trim();
      if (trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+\./.test(trimmed)) {
        const content = trimmed.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '');
        if (currentSection === 'causes' && content) {
          result.possibleCauses.push(content);
        } else if (currentSection === 'fixes' && content) {
          result.suggestedFixes.push(content);
        }
      } else if (currentSection === 'error' && trimmed) {
        result.errorMessage += (result.errorMessage ? ' ' : '') + trimmed;
      }
    }

    // If parsing failed, provide default structure
    if (!result.errorMessage) {
      result.errorMessage = rawDiagnosis.split('\n')[0] || rawDiagnosis.substring(0, 200);
    }

    if (result.possibleCauses.length === 0) {
      result.possibleCauses.push('See error message above');
    }

    if (result.suggestedFixes.length === 0) {
      result.suggestedFixes.push('Review error message and stack trace for details');
    }

    return result;
  }

  /**
   * Parse UI comparison result into structured format
   */
  private parseUIComparison(rawComparison: string): UIComparisonResult {
    const lines = rawComparison.split('\n');
    const result: UIComparisonResult = {
      hasDifferences: false,
      differences: [],
      similarityScore: 0,
      summary: rawComparison.substring(0, 500),
    };

    // Try to extract structured differences
    for (const line of lines) {
      const lower = line.toLowerCase();

      // Check for differences
      if (lower.includes('difference') || lower.includes('discrepancy') || lower.includes('mismatch')) {
        result.hasDifferences = true;

        // Try to parse difference details
        const trimmed = line.trim();
        if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
          const content = trimmed.replace(/^[-*]\s*/, '');

          // Try to detect severity
          let severity: 'low' | 'medium' | 'high' = 'medium';
          if (content.toLowerCase().includes('critical') || content.toLowerCase().includes('major')) {
            severity = 'high';
          } else if (content.toLowerCase().includes('minor') || content.toLowerCase().includes('subtle')) {
            severity = 'low';
          }

          result.differences.push({
            location: 'Unknown',
            type: 'layout',
            description: content,
            severity,
          });
        }
      }

      // Try to extract similarity score
      const scoreMatch = lower.match(/similarity[:\s]+(\d+(?:\.\d+)?%?)/);
      if (scoreMatch) {
        const score = parseFloat(scoreMatch[1].replace('%', ''));
        result.similarityScore = score;
      }
    }

    // If no differences found but text mentions them
    if (!result.hasDifferences && rawComparison.toLowerCase().includes('no difference')) {
      result.hasDifferences = false;
      result.similarityScore = 100;
    } else if (!result.hasDifferences && rawComparison.toLowerCase().includes('identical')) {
      result.hasDifferences = false;
      result.similarityScore = 100;
    }

    return result;
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Analyze an image with AI
 *
 * @param source - Image source (file path or URL)
 * @param prompt - Analysis prompt
 * @returns Promise<Result<string>> - Analysis result
 *
 * @example
 * ```typescript
 * const result = await analyzeImage('/path/to/image.png', 'Describe this UI');
 * ```
 */
export async function analyzeImage(
  source: ImageSource,
  prompt: string
): Promise<Result<string>> {
  const vision = new VisionFeature();
  return vision.analyzeImage(source, prompt);
}

/**
 * Extract text from an image (OCR)
 *
 * @param source - Image source (file path or URL)
 * @param options - Extraction options
 * @returns Promise<Result<TextExtractionResult>> - Extracted text
 *
 * @example
 * ```typescript
 * const result = await extractText('/path/to/screenshot.png');
 * ```
 */
export async function extractText(
  source: ImageSource,
  options?: Partial<ExtractTextOptions>
): Promise<Result<TextExtractionResult>> {
  const vision = new VisionFeature();
  return vision.extractText(source, options);
}

/**
 * Analyze UI and generate code/spec/prompt/description
 *
 * @param source - Image source (file path or URL)
 * @param outputType - What to generate
 * @param prompt - Optional custom prompt
 * @returns Promise<Result<string>> - Generated artifact
 *
 * @example
 * ```typescript
 * const result = await analyzeUI('/path/to/ui.png', 'code');
 * ```
 */
export async function analyzeUI(
  source: ImageSource,
  outputType: 'code' | 'prompt' | 'spec' | 'description',
  prompt?: string
): Promise<Result<string>> {
  const vision = new VisionFeature();
  return vision.analyzeUI(source, outputType, prompt);
}

/**
 * Diagnose error from screenshot
 *
 * @param source - Image source (file path or URL)
 * @param context - Optional context
 * @returns Promise<Result<ErrorDiagnosisResult>> - Error diagnosis
 *
 * @example
 * ```typescript
 * const result = await diagnoseError('/path/to/error.png', 'During npm install');
 * ```
 */
export async function diagnoseError(
  source: ImageSource,
  context?: string
): Promise<Result<ErrorDiagnosisResult>> {
  const vision = new VisionFeature();
  return vision.diagnoseError(source, context);
}

/**
 * Compare two UI screenshots
 *
 * @param expected - Expected design
 * @param actual - Actual implementation
 * @param focusAreas - Optional focus areas
 * @returns Promise<Result<UIComparisonResult>> - Comparison result
 *
 * @example
 * ```typescript
 * const result = await compareUI('/path/to/expected.png', '/path/to/actual.png');
 * ```
 */
export async function compareUI(
  expected: ImageSource,
  actual: ImageSource,
  focusAreas?: string
): Promise<Result<UIComparisonResult>> {
  const vision = new VisionFeature();
  return vision.compareUI(expected, actual, focusAreas);
}
