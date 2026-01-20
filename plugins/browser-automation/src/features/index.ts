/**
 * Feature Modules - Layer 2
 * Barrel export for all feature modules
 *
 * This module exports all feature modules which provide domain-specific
 * functionality built on top of the MCP client layer.
 *
 * @module @smite/browser-automation/features
 */

// ============================================================================
// Search Feature
// ============================================================================

export {
  SearchFeature,
  searchWeb,
  searchAndRead,
  searchMultiple,
  research,
} from './search.feature.js';

export type {
  EnhancedSearchResult,
  SearchAndReadResult,
  MultiSearchResult,
  SearchFeatureOptions,
  SearchAndReadOptions,
  MultiSearchOptions,
} from './search.feature.js';

// ============================================================================
// Vision Feature
// ============================================================================

export {
  VisionFeature,
  analyzeImage as visionAnalyzeImage,
  extractText as visionExtractText,
  analyzeUI as visionAnalyzeUI,
  diagnoseError as visionDiagnoseError,
  compareUI as visionCompareUI,
} from './vision.feature.js';

export type {
  ImageSource,
  TextExtractionResult,
  UIAnalysisResult,
  ErrorDiagnosisResult,
  UIComparisonResult,
} from './vision.feature.js';

// ============================================================================
// Read Feature
// ============================================================================

export {
  ReadFeature,
  readWebPage,
  batchRead,
  extractStructuredData,
} from './read.feature.js';

export type {
  ExtractionSchema,
  ExtractedData,
  BatchReadResults,
  ReadFeatureOptions,
} from './read.feature.js';

// ============================================================================
// Repository Feature
// ============================================================================

export {
  RepositoryFeature,
  createRepositoryFeature,
  type AnalyzeRepositoryOptions,
  type BatchReadOptions,
  type FileReadResult,
  type RepositoryInsight,
} from './repository.feature.js';

export { RepositoryValidationError } from './repository.feature.js';

// ============================================================================
// Type Re-exports from MCP Layer
// ============================================================================

export type {
  Result,
  ReadUrlOptions,
  WebReaderResponse,
  WebSearchOptions,
  WebSearchResult,
  AnalyzeImageOptions,
  UiToArtifactOptions,
  ExtractTextOptions,
  DiagnoseErrorOptions,
  AnalyzeDataVizOptions,
  UiDiffCheckOptions,
  UnderstandDiagramOptions,
  AnalyzeVideoOptions,
  GetRepoStructureOptions,
  ReadRepoFileOptions,
  SearchRepoDocOptions,
} from '../mcp/types.js';

export {
  isSuccess,
  isFailure,
  unwrap,
  unwrapOr,
  map,
  andThen,
  retry,
  all,
  allSettled,
} from '../mcp/index.js';
