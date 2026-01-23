"use strict";
/**
 * RAG (Retrieval-Augmented Generation) Core Module
 *
 * Provides intelligent token optimization through:
 * - AST-based code extraction (surgeon mode)
 * - Semantic caching with similarity matching
 * - Budget management with configurable thresholds
 *
 * @module core/rag
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.cosineKeywordSimilarity = exports.jaccardSimilarity = exports.extractKeywordSet = exports.extractKeywords = exports.DEFAULT_CACHE_CONFIG = exports.SemanticCache = exports.DEFAULT_SURGEON_CONFIG = exports.ExtractionMode = exports.SurgeonExtractor = exports.DEFAULT_CONFIG = exports.OptimizationMode = exports.BudgetThreshold = exports.CHARS_PER_TOKEN = exports.RAGOptimizer = void 0;
exports.createOptimizer = createOptimizer;
exports.createSurgeon = createSurgeon;
exports.createCache = createCache;
// Optimizer exports
var optimizer_js_1 = require("./optimizer.js");
Object.defineProperty(exports, "RAGOptimizer", { enumerable: true, get: function () { return optimizer_js_1.RAGOptimizer; } });
Object.defineProperty(exports, "CHARS_PER_TOKEN", { enumerable: true, get: function () { return optimizer_js_1.CHARS_PER_TOKEN; } });
Object.defineProperty(exports, "BudgetThreshold", { enumerable: true, get: function () { return optimizer_js_1.BudgetThreshold; } });
Object.defineProperty(exports, "OptimizationMode", { enumerable: true, get: function () { return optimizer_js_1.OptimizationMode; } });
Object.defineProperty(exports, "DEFAULT_CONFIG", { enumerable: true, get: function () { return optimizer_js_1.DEFAULT_CONFIG; } });
// Surgeon exports
var surgeon_js_1 = require("./surgeon.js");
Object.defineProperty(exports, "SurgeonExtractor", { enumerable: true, get: function () { return surgeon_js_1.SurgeonExtractor; } });
Object.defineProperty(exports, "ExtractionMode", { enumerable: true, get: function () { return surgeon_js_1.ExtractionMode; } });
Object.defineProperty(exports, "DEFAULT_SURGEON_CONFIG", { enumerable: true, get: function () { return surgeon_js_1.DEFAULT_SURGEON_CONFIG; } });
// Cache exports
var cache_js_1 = require("./cache.js");
Object.defineProperty(exports, "SemanticCache", { enumerable: true, get: function () { return cache_js_1.SemanticCache; } });
Object.defineProperty(exports, "DEFAULT_CACHE_CONFIG", { enumerable: true, get: function () { return cache_js_1.DEFAULT_CACHE_CONFIG; } });
// Keywords exports
var keywords_js_1 = require("./keywords.js");
Object.defineProperty(exports, "extractKeywords", { enumerable: true, get: function () { return keywords_js_1.extractKeywords; } });
Object.defineProperty(exports, "extractKeywordSet", { enumerable: true, get: function () { return keywords_js_1.extractKeywordSet; } });
Object.defineProperty(exports, "jaccardSimilarity", { enumerable: true, get: function () { return keywords_js_1.jaccardSimilarity; } });
Object.defineProperty(exports, "cosineKeywordSimilarity", { enumerable: true, get: function () { return keywords_js_1.cosineKeywordSimilarity; } });
/**
 * Quick access factory for creating optimizer with default config
 */
function createOptimizer(config) {
    const { RAGOptimizer: Optimizer } = require('./optimizer.js');
    return new Optimizer(config);
}
/**
 * Quick access factory for creating surgeon with default config
 */
function createSurgeon(config) {
    const { SurgeonExtractor: Surgeon } = require('./surgeon.js');
    return new Surgeon(config);
}
/**
 * Quick access factory for creating cache with default config
 */
function createCache(maxSize, ttl) {
    const { SemanticCache: Cache } = require('./cache.js');
    return new Cache(maxSize, ttl);
}
//# sourceMappingURL=index.js.map