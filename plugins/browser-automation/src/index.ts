/**
 * @smite/browser-automation
 *
 * Agent-Friendly Browser Automation API
 *
 * This library provides a comprehensive suite of tools for web research,
 * analysis, and automation. All functions return typed Result<T, Error>
 * objects for safe error handling.
 *
 * CAPABILITY CATEGORIES:
 *
 * 1. SEARCH: searchWeb, searchAndRead, searchMultiple, research
 * 2. READ: readWebPage, batchRead, extractStructuredData
 * 3. ANALYZE: analyzeImage, extractText, diagnoseError, analyzeUI, compareUI
 * 4. REPOSITORY: readRepoFile, getRepoStructure, searchRepoDocs, analyzeRepo
 * 5. WORKFLOW: researchTopic, debugError, analyzeLibrary, auditCodebase
 *
 * ARCHITECTURE LAYERS:
 *
 * Layer 1 (MCP Clients): Low-level MCP server wrappers
 * Layer 2 (Features): Domain-specific capabilities
 * Layer 3 (Workflows): Complex multi-step operations
 * Layer 4 (Agent API): This file - organized for easy discovery
 *
 * See individual function JSDoc for usage examples.
 *
 * @module @smite/browser-automation
 */

// ============================================================================
// LAYER 4: Agent-Friendly API
// Organized by capability for easy discovery and usage
// ============================================================================

// Re-export all layers
export * from './mcp/index.js';
export * from './features/index.js';
export * from './workflows/index.js';

// ============================================================================
// 🔍 SEARCH CAPABILITIES
// Web search, multi-source research, and competitive analysis
// ============================================================================

/**
 * Search the web for information
 *
 * @param query - Search query string
 * @param options - Optional search configuration
 * @returns Promise<Result<WebSearchResult[]>>
 *
 * @example
 * ```typescript
 * const results = await searchWeb('Next.js 15 documentation');
 * if (results.success) {
 *   results.data.forEach(result => {
 *     console.log(`${result.title}: ${result.url}`);
 *   });
 * }
 * ```
 */
export { searchWeb } from './features/index.js';

/**
 * Search the web and read top results
 *
 * @param query - Search query string
 * @param options - Optional configuration (maxResults, readLimit)
 * @returns Promise<Result<SearchAndReadResult>>
 *
 * @example
 * ```typescript
 * const research = await searchAndRead('TypeScript best practices', {
 *   maxResults: 5,
 *   readLimit: 3
 * });
 * if (research.success) {
 *   console.log(`Found ${research.searchResults.length} results`);
 *   console.log(`Read ${research.readResults.length} pages`);
 * }
 * ```
 */
export { searchAndRead } from './features/index.js';

/**
 * Execute multiple searches in parallel
 *
 * @param queries - Array of search queries
 * @param options - Optional configuration
 * @returns Promise<Result<MultiSearchResult>>
 *
 * @example
 * ```typescript
 * const results = await searchMultiple([
 *   'React Server Components',
 *   'Next.js 15 features',
 *   'TypeScript 5.3'
 * ]);
 * if (results.success) {
 *   results.queries.forEach(query => {
 *     console.log(`${query.query}: ${query.results.length} results`);
 *   });
 * }
 * ```
 */
export { searchMultiple } from './features/index.js';

/**
 * Deep research with iterative searching and reading
 *
 * @param initialQuery - Starting search query
 * @param options - Research configuration (depth, breadth, maxIterations)
 * @returns Promise<Result<EnhancedSearchResult>>
 *
 * @example
 * ```typescript
 * const findings = await research('machine learning for developers', {
 *   depth: 2,
 *   breadth: 3,
 *   maxIterations: 5
 * });
 * ```
 */
export { research } from './features/index.js';

// ============================================================================
// 📖 READ CAPABILITIES
// Read web pages, batch processing, structured data extraction
// ============================================================================

/**
 * Read a web page and convert to markdown
 *
 * @param url - URL to read
 * @param options - Optional read configuration
 * @returns Promise<Result<WebReaderResponse>>
 *
 * @example
 * ```typescript
 * const content = await readWebPage('https://example.com', {
 *   returnFormat: 'markdown',
 *   retainImages: true
 * });
 * if (content.success) {
 *   console.log(content.data.content);
 * }
 * ```
 */
export { readWebPage } from './features/index.js';

/**
 * Read multiple web pages in parallel
 *
 * @param urls - Array of URLs to read
 * @param options - Optional batch configuration
 * @returns Promise<Result<BatchReadResults>>
 *
 * @example
 * ```typescript
 * const pages = await batchRead([
 *   'https://example.com/page1',
 *   'https://example.com/page2',
 *   'https://example.com/page3'
 * ], {
 *   concurrency: 3
 * });
 * if (pages.success) {
 *   pages.results.forEach(result => {
 *     console.log(`${result.url}: ${result.content?.length} chars`);
 *   });
 * }
 * ```
 */
export { batchRead } from './features/index.js';

/**
 * Extract structured data from web pages
 *
 * @param url - URL to extract data from
 * @param schema - Zod schema for validation
 * @param options - Optional extraction configuration
 * @returns Promise<Result<ExtractedData>>
 *
 * @example
 * ```typescript
 * import { z } from 'zod';
 *
 * const productSchema = z.object({
 *   name: z.string(),
 *   price: z.number(),
 *   description: z.string()
 * });
 *
 * const products = await extractStructuredData(
 *   'https://example.com/products',
 *   productSchema
 * );
 * ```
 */
export { extractStructuredData } from './features/index.js';

// ============================================================================
// 🖼️ ANALYZE CAPABILITIES
// Image analysis, text extraction, error diagnosis, UI analysis
// ============================================================================

/**
 * Analyze an image with AI
 *
 * @param source - Image URL or local path
 * @param prompt - Analysis prompt
 * @param options - Optional analysis configuration
 * @returns Promise<Result<string>>
 *
 * @example
 * ```typescript
 * const analysis = await analyzeImage(
 *   'https://example.com/image.png',
 *   'Describe the main elements of this design'
 * );
 * ```
 */
export { visionAnalyzeImage as analyzeImage } from './features/index.js';

/**
 * Extract text from an image/screenshot
 *
 * @param source - Image URL or local path
 * @param prompt - Optional extraction instructions
 * @param language - Optional programming language hint
 * @returns Promise<Result<string>>
 *
 * @example
 * ```typescript
 * const code = await extractText('screenshot.png', 'Extract all code', 'typescript');
 * ```
 */
export { visionExtractText as extractText } from './features/index.js';

/**
 * Diagnose an error from a screenshot
 *
 * @param source - Error screenshot URL or local path
 * @param prompt - What help is needed
 * @param context - When the error occurred
 * @returns Promise<Result<string>>
 *
 * @example
 * ```typescript
 * const diagnosis = await diagnoseError(
 *   'error.png',
 *   'How do I fix this error?',
 *   'During npm install'
 * );
 * ```
 */
export { visionDiagnoseError as diagnoseError } from './features/index.js';

/**
 * Analyze UI design and convert to artifact
 *
 * @param source - UI screenshot URL or local path
 * @param outputType - What to generate ('code', 'prompt', 'spec', 'description')
 * @param prompt - Optional specific instructions
 * @returns Promise<Result<string>>
 *
 * @example
 * ```typescript
 * const code = await analyzeUI('design.png', 'code', 'Generate React component');
 * ```
 */
export { visionAnalyzeUI as analyzeUI } from './features/index.js';

/**
 * Compare two UI screenshots
 *
 * @param expected - Expected design URL or path
 * @param actual - Actual implementation URL or path
 * @param prompt - What to focus on in comparison
 * @returns Promise<Result<string>>
 *
 * @example
 * ```typescript
 * const diff = await compareUI(
 *   'expected-design.png',
 *   'actual-implementation.png',
 *   'Compare layout and spacing'
 * );
 * ```
 */
export { visionCompareUI as compareUI } from './features/index.js';

// ============================================================================
// 📦 REPOSITORY CAPABILITIES
// GitHub repository analysis, file reading, structure exploration
// ============================================================================

/**
 * Read a file from a GitHub repository
 *
 * @param repo - Repository in format 'owner/repo'
 * @param filePath - Path to file in repo
 * @param options - Optional configuration
 * @returns Promise<Result<string>>
 *
 * @example
 * ```typescript
 * const readme = await readRepoFile('vitejs/vite', 'README.md');
 * if (readme.success) {
 *   console.log(readme.data);
 * }
 * ```
 */
export { readRepoFile } from './mcp/index.js';

/**
 * Get repository directory structure
 *
 * @param repo - Repository in format 'owner/repo'
 * @param dirPath - Directory path to inspect (default: root)
 * @returns Promise<Result<DirectoryStructure>>
 *
 * @example
 * ```typescript
 * const structure = await getRepoStructure('vitejs/vite', '/src');
 * if (structure.success) {
 *   structure.files.forEach(file => {
 *     console.log(file.name);
 *   });
 * }
 * ```
 */
export { getRepoStructure } from './mcp/index.js';

/**
 * Search repository documentation
 *
 * @param repo - Repository in format 'owner/repo'
 * @param query - Search query
 * @param language - 'en' or 'zh'
 * @returns Promise<Result<SearchResult[]>>
 *
 * @example
 * ```typescript
 * const docs = await searchRepoDocs('vitejs/vite', 'plugin API', 'en');
 * if (docs.success) {
 *   docs.data.forEach(doc => {
 *     console.log(`${doc.title}: ${doc.url}`);
 *   });
 * }
 * ```
 */
export { searchRepoDocs } from './mcp/index.js';

/**
 * Analyze a GitHub repository comprehensively
 *
 * @param repo - Repository in format 'owner/repo'
 * @param options - Analysis configuration
 * @returns Promise<Result<RepositoryAnalysis>>
 *
 * @example
 * ```typescript
 * const analysis = await analyzeRepo('facebook/react', {
 *   includeFileCount: true,
 *   includeLanguages: true,
 *   includeStructure: true
 * });
 * if (analysis.success) {
 *   console.log(`Files: ${analysis.fileCount}`);
 *   console.log(`Languages: ${analysis.languages.join(', ')}`);
 * }
 * ```
 */
export { analyzeGitHubRepo as analyzeRepo } from './mcp/index.js';

/**
 * Batch read multiple files from a repository
 *
 * @param repo - Repository in format 'owner/repo'
 * @param filePaths - Array of file paths to read
 * @param options - Optional batch configuration
 * @returns Promise<Result<FileReadResult[]>>
 *
 * @example
 * ```typescript
 * const files = await createRepositoryFeature().batchRead(
 *   'vitejs/vite',
 *   ['README.md', 'package.json', 'src/index.ts']
 * );
 * ```
 */
export { createRepositoryFeature } from './features/index.js';

// ============================================================================
// 🔄 WORKFLOW CAPABILITIES
// High-level multi-step workflows for complex tasks
// ============================================================================

/**
 * Research a topic with deep analysis
 *
 * @param topic - Topic to research
 * @param options - Research configuration
 * @returns Promise<Result<ResearchTopicResult>>
 *
 * @example
 * ```typescript
 * const findings = await researchTopic('React Server Components', {
 *   depth: 3,
 *   includeCodeExamples: true,
 *   sources: ['web', 'github']
 * });
 * if (findings.success) {
 *   console.log(`Analyzed ${findings.data.sourcesAnalyzed} sources`);
 *   console.log(`Found ${findings.data.keyInsights.length} insights`);
 * }
 * ```
 */
export { researchTopic } from './workflows/index.js';

/**
 * Debug an error from a screenshot
 *
 * @param errorSource - Error screenshot path or URL
 * @param context - When/how the error occurred
 * @param options - Debug configuration
 * @returns Promise<Result<DebugErrorResult>>
 *
 * @example
 * ```typescript
 * const solution = await debugError('error.png', 'During npm test', {
 *   searchForSolutions: true,
 *   includeStacktrace: true
 * });
 * if (solution.success) {
 *   console.log(`Root cause: ${solution.data.rootCause}`);
 *   console.log(`Solutions: ${solution.data.solutions.length}`);
 * }
 * ```
 */
export { debugError } from './workflows/index.js';

/**
 * Analyze a library/framework
 *
 * @param libraryName - Name of the library
 * @param useCase - What you want to use it for
 * @param options - Analysis configuration
 * @returns Promise<Result<AnalyzeLibraryResult>>
 *
 * @example
 * ```typescript
 * const analysis = await analyzeLibrary('zustand', 'state management in React', {
 *   checkLatestVersion: true,
 *   analyzeExamples: true,
 *   checkAlternatives: true
 * });
 * if (analysis.success) {
 *   console.log(`Version: ${analysis.data.version}`);
 *   console.log(`Best for: ${analysis.data.bestUseCases.join(', ')}`);
 * }
 * ```
 */
export { analyzeLibrary } from './workflows/index.js';

/**
 * Audit a codebase for patterns, issues, and structure
 *
 * @param repo - Repository in format 'owner/repo'
 * @param options - Audit configuration
 * @returns Promise<Result<AuditCodebaseResult>>
 *
 * @example
 * ```typescript
 * const audit = await auditCodebase('owner/repo', {
 *   checkPatterns: true,
 *   analyzeStructure: true,
 *   detectIssues: true,
 *   maxFiles: 100
 * });
 * if (audit.success) {
 *   console.log(`Pattern score: ${audit.data.patternScore}`);
 *   console.log(`Issues found: ${audit.data.issues.length}`);
 * }
 * ```
 */
export { auditCodebase } from './workflows/index.js';

// ============================================================================
// 🛠️ UTILITY FUNCTIONS
// Error handling, result processing, async operations
// ============================================================================

/**
 * Check if operation was successful
 * @param result - Result object to check
 * @returns boolean - True if successful
 *
 * @example
 * ```typescript
 * const result = await searchWeb('test');
 * if (isSuccess(result)) {
 *   console.log(result.data);
 * }
 * ```
 */
export { isSuccess } from './mcp/index.js';

/**
 * Check if operation failed
 * @param result - Result object to check
 * @returns boolean - True if failed
 *
 * @example
 * ```typescript
 * const result = await searchWeb('test');
 * if (isFailure(result)) {
 *   console.error(result.error);
 * }
 * ```
 */
export { isFailure } from './mcp/index.js';

/**
 * Unwrap result or throw error
 * @param result - Result object
 * @returns T - Data if successful
 * @throws Error if operation failed
 *
 * @example
 * ```typescript
 * const result = await searchWeb('test');
 * const data = unwrap(result); // Throws if failed
 * ```
 */
export { unwrap } from './mcp/index.js';

/**
 * Unwrap result or return default value
 * @param result - Result object
 * @param defaultValue - Default if failed
 * @returns T - Data or default
 *
 * @example
 * ```typescript
 * const result = await searchWeb('test');
 * const data = unwrapOr(result, []);
 * ```
 */
export { unwrapOr } from './mcp/index.js';

/**
 * Map over successful result data
 * @param result - Result object
 * @param fn - Transformation function
 * @returns Result<U> - Transformed result
 *
 * @example
 * ```typescript
 * const result = await searchWeb('test');
 * const urls = map(result, (results) => results.map(r => r.url));
 * ```
 */
export { map } from './mcp/index.js';

/**
 * Chain multiple result operations
 * @param result - Initial result
 * @param fn - Function returning new result
 * @returns Promise<Result<U>> - Chained result
 *
 * @example
 * ```typescript
 * const search = await searchWeb('test');
 * const urls = await andThen(search, (results) => {
 *   return readMultipleUrls(results.map(r => r.url));
 * });
 * ```
 */
export { andThen } from './mcp/index.js';

/**
 * Retry an operation with exponential backoff
 * @param fn - Function to retry
 * @param maxAttempts - Maximum attempts (default: 3)
 * @param delayMs - Delay between attempts (default: 1000)
 * @returns Promise<Result<T>> - Result
 *
 * @example
 * ```typescript
 * const result = await retry(
 *   () => searchWeb('test'),
 *   5,
 *   2000
 * );
 * ```
 */
export { retry } from './mcp/index.js';

/**
 * Execute multiple operations in parallel
 * @param fns - Array of functions
 * @returns Promise<Result<T[]>> - Combined results
 *
 * @example
 * ```typescript
 * const results = await all([
 *   () => searchWeb('query1'),
 *   () => searchWeb('query2'),
 *   () => searchWeb('query3')
 * ]);
 * ```
 */
export { all } from './mcp/index.js';

/**
 * Execute operations in parallel, settle all
 * @param fns - Array of functions
 * @returns Promise<Array<Result<T>>> - All results
 *
 * @example
 * ```typescript
 * const results = await allSettled([
 *   () => searchWeb('query1'),
 *   () => searchWeb('query2')
 * ]);
 * const successful = results.filter(isSuccess);
 * ```
 */
export { allSettled } from './mcp/index.js';

// ============================================================================
// 📦 TYPE EXPORTS
// Common types for consumers of the library
// ============================================================================

// Core result types
export type { Result, RetryConfig } from './mcp/types.js';

// Search types
export type {
  WebSearchResult,
  WebSearchOptions,
} from './mcp/types.js';

export type {
  EnhancedSearchResult,
  SearchAndReadResult,
  MultiSearchResult,
} from './features/index.js';

// Read types
export type {
  WebReaderResponse,
  ReadUrlOptions,
} from './mcp/types.js';

export type {
  ExtractionSchema,
  ExtractedData,
  BatchReadResults,
} from './features/index.js';

// Vision/analysis types
export type {
  AnalyzeImageOptions,
  UiToArtifactOptions,
  ExtractTextOptions,
  DiagnoseErrorOptions,
  AnalyzeDataVizOptions,
  UiDiffCheckOptions,
  UnderstandDiagramOptions,
  AnalyzeVideoOptions,
} from './mcp/types.js';

export type {
  ImageSource,
  TextExtractionResult,
  UIAnalysisResult,
  ErrorDiagnosisResult,
  UIComparisonResult,
} from './features/index.js';

// Repository types
export type {
  GetRepoStructureOptions,
  ReadRepoFileOptions,
  SearchRepoDocOptions,
} from './mcp/types.js';

export type { RepositoryAnalysis } from './mcp/index.js';

export type {
  AnalyzeRepositoryOptions,
  BatchReadOptions,
  FileReadResult,
  RepositoryInsight,
} from './features/index.js';

// Workflow types
export type {
  ResearchTopicResult,
  DebugErrorResult,
  AnalyzeLibraryResult,
  AuditCodebaseResult,
  WorkflowContext,
  WorkflowStep,
} from './workflows/index.js';

// ============================================================================
// 🏗️ CLIENT CLASSES (Advanced Usage)
// For advanced users who need fine-grained control
// ============================================================================

/**
 * Bundle of all MCP clients
 *
 * @example
 * ```typescript
 * const mcp = new McpClients({
 *   webSearch: { maxAttempts: 5 },
 *   vision: { maxAttempts: 2 }
 * });
 *
 * const results = await mcp.webSearch.search({ query: 'test' });
 * ```
 */
export { McpClients } from './mcp/index.js';

/**
 * Create configured MCP clients bundle
 *
 * @example
 * ```typescript
 * const mcp = createMpClients({
 *   webSearch: { maxAttempts: 5 }
 * });
 * ```
 */
export { createMpClients } from './mcp/index.js';

/**
 * Web search client
 */
export { WebSearchClient } from './mcp/index.js';

/**
 * Web reader client
 */
export { WebReaderClient } from './mcp/index.js';

/**
 * Vision/analysis client
 */
export { VisionClient } from './mcp/index.js';

/**
 * Repository client
 */
export { RepoClient } from './mcp/index.js';

/**
 * Feature modules (for advanced usage)
 */
export {
  SearchFeature,
  VisionFeature,
  ReadFeature,
  RepositoryFeature,
} from './features/index.js';

/**
 * Workflow orchestrator (for advanced usage)
 */
export { WorkflowOrchestrator } from './workflows/index.js';

// ============================================================================
// ⚠️ ERROR TYPES
// Exception types for error handling
// ============================================================================

export {
  McpError,
  McpTimeoutError,
  McpRetryError,
  McpValidationError,
} from './mcp/index.js';

export { RepositoryValidationError } from './features/index.js';

export { DEFAULT_RETRY_CONFIG } from './mcp/index.js';
