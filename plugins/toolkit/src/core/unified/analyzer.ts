/**
 * Query Analyzer
 *
 * Analyzes search queries to determine their type and recommend
 * the appropriate search strategy.
 *
 * @module core/unified/analyzer
 */

import { QueryType, SearchStrategy, QueryAnalysis } from './types.js';

/**
 * Patterns for detecting different query types
 */
const PATTERNS = {
  /** Natural language indicators */
  NATURAL_LANGUAGE: [
    /^(how|what|where|when|why|which|who|can|could|would|should|is|are|was|were)\b/i,
    /\b(where|find|search|look for|show me|get|list|display)\b/i,
    /\b(function|class|variable|method|property)\s+(that|which|named)/i,
  ],

  /** Code pattern indicators */
  CODE_PATTERN: [
    /[{}();[\]<>=!+\-*/]/, // Code-like syntax
    /\b(function|class|const|let|var|if|else|for|while|return|import|export)\b/,
    /[\w\s]*[\(\{][^\)\}]*[\)\}]/, // Function calls or blocks
    /^\s*[\w.]+[\w.]*\(/, // Function call pattern
  ],

  /** Symbol lookup indicators */
  SYMBOL_LOOKUP: [
    /^\w+$/, // Single word (likely a symbol)
    /^[A-Z][a-zA-Z0-9_]*$/, // PascalCase (class/component)
    /^[a-z][a-zA-Z0-9]*$/, // camelCase (function/variable)
    /^[_a-z][_a-z0-9]*$/, // snake_case (variable/function)
  ],

  /** File path indicators */
  FILE_PATH: [
    /[\/\\]/, // Path separators
    /\.\w+$/, // File extensions
    /^[\w.]*[\/\\][\w/\\.]*/, // Path-like structure
    /[*?\[\]]/, // Glob patterns
  ],

  /** Hybrid indicators */
  HYBRID: [
    /\b(and|or|but|also|both)\b/i,
    /[\/\\].*\.(js|ts|py|java|go|rs)$/, // File with extension plus natural language
  ],
};

/**
 * Extract search terms from a query
 */
function extractSearchTerms(query: string): string[] {
  const terms: string[] = [];

  // Extract quoted strings
  const quotedRegex = /"([^"]+)"|'([^']+)'/g;
  let match;
  while ((match = quotedRegex.exec(query)) !== null) {
    terms.push(match[1] || match[2]);
  }

  // Extract words (remove common stop words)
  const stopWords = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'can', 'for', 'to', 'of', 'in',
    'on', 'at', 'by', 'with', 'from', 'as', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'between', 'under', 'again',
  ]);

  const words = query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));

  terms.push(...words);

  return terms;
}

/**
 * Determine query type based on patterns
 */
function determineQueryType(query: string): QueryType {
  // Check for file path patterns first
  if (PATTERNS.FILE_PATH.some(pattern => pattern.test(query))) {
    return QueryType.FILE_PATH;
  }

  // Check for code patterns
  if (PATTERNS.CODE_PATTERN.some(pattern => pattern.test(query))) {
    return QueryType.CODE_PATTERN;
  }

  // Check for symbol lookup
  if (PATTERNS.SYMBOL_LOOKUP.some(pattern => pattern.test(query))) {
    return QueryType.SYMBOL_LOOKUP;
  }

  // Check for natural language
  if (PATTERNS.NATURAL_LANGUAGE.some(pattern => pattern.test(query))) {
    return QueryType.NATURAL_LANGUAGE;
  }

  // Default to natural language
  return QueryType.NATURAL_LANGUAGE;
}

/**
 * Recommend search strategy based on query type
 */
function recommendStrategy(queryType: QueryType): SearchStrategy {
  switch (queryType) {
    case QueryType.NATURAL_LANGUAGE:
      return SearchStrategy.SEMANTIC;

    case QueryType.CODE_PATTERN:
      return SearchStrategy.LITERAL;

    case QueryType.SYMBOL_LOOKUP:
      return SearchStrategy.HYBRID;

    case QueryType.FILE_PATH:
      return SearchStrategy.LITERAL;

    case QueryType.HYBRID:
      return SearchStrategy.HYBRID;

    default:
      return SearchStrategy.AUTO;
  }
}

/**
 * Calculate confidence score for query type detection
 */
function calculateConfidence(query: string, queryType: QueryType): number {
  const patterns = PATTERNS[queryType as unknown as keyof typeof PATTERNS] as RegExp[] | undefined;
  if (!patterns) return 0.5;

  let matchCount = 0;
  for (const pattern of patterns) {
    if (pattern.test(query)) matchCount++;
  }

  // Base confidence on number of matching patterns
  const baseConfidence = Math.min(matchCount / patterns.length, 1.0);

  // Adjust based on query length (shorter queries are less certain)
  const lengthFactor = Math.min(query.length / 50, 1.0);

  return baseConfidence * lengthFactor;
}

/**
 * Query Analyzer class
 */
export class QueryAnalyzer {
  /**
   * Analyze a search query
   */
  analyze(query: string): QueryAnalysis {
    // Trim and normalize query
    const normalizedQuery = query.trim();

    // Determine query type
    const type = determineQueryType(normalizedQuery);

    // Calculate confidence
    const confidence = calculateConfidence(normalizedQuery, type);

    // Recommend strategy
    const recommendedStrategy = recommendStrategy(type);

    // Determine alternative strategies
    const alternativeStrategies = this.getAlternativeStrategies(
      type,
      recommendedStrategy
    );

    // Extract search terms
    const searchTerms = extractSearchTerms(normalizedQuery);

    return {
      type,
      confidence,
      recommendedStrategy,
      alternativeStrategies,
      searchTerms,
      metadata: {
        queryLength: normalizedQuery.length,
        wordCount: normalizedQuery.split(/\s+/).length,
      },
    };
  }

  /**
   * Get alternative strategies to try if primary fails
   */
  private getAlternativeStrategies(
    queryType: QueryType,
    primaryStrategy: SearchStrategy
  ): SearchStrategy[] {
    const alternatives: SearchStrategy[] = [];

    switch (queryType) {
      case QueryType.NATURAL_LANGUAGE:
        // Try hybrid if semantic fails
        alternatives.push(SearchStrategy.HYBRID, SearchStrategy.LITERAL);
        break;

      case QueryType.CODE_PATTERN:
        // Try hybrid if literal fails
        alternatives.push(SearchStrategy.HYBRID, SearchStrategy.SEMANTIC);
        break;

      case QueryType.SYMBOL_LOOKUP:
        // Try semantic or literal if hybrid fails
        alternatives.push(SearchStrategy.SEMANTIC, SearchStrategy.LITERAL);
        break;

      case QueryType.FILE_PATH:
        // No good alternatives for file paths
        alternatives.push(SearchStrategy.LITERAL);
        break;

      case QueryType.HYBRID:
        // Try individual strategies
        alternatives.push(SearchStrategy.SEMANTIC, SearchStrategy.LITERAL);
        break;

      default:
        // Ensure exhaustive handling
        alternatives.push(SearchStrategy.SEMANTIC, SearchStrategy.LITERAL);
        break;
    }

    return alternatives;
  }
}
