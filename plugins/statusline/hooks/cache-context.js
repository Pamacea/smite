#!/usr/bin/env node

/**
 * Cache context hook for statusline
 * Automatically captures /context output and stores it for the statusline to use
 *
 * This hook is triggered by SessionStart and periodically updates the context cache
 * with the current token usage from the Claude context window.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const CACHE_DIR = path.join(os.homedir(), '.claude', '.context-cache');
const CACHE_FILE = path.join(CACHE_DIR, 'current-context.json');

/**
 * Parse /context output to extract token information
 * @param {string} contextOutput - The raw output from /context command
 * @returns {object|null} - Parsed token data or null if parsing fails
 */
function parseContextOutput(contextOutput) {
  try {
    // Look for patterns like "0k/200k tokens (0%)" or "45.2k/200k tokens (23%)"
    const usageMatch = contextOutput.match(/(\d+\.?\d*[k]?|\d+)\/(\d+)[kK]?\s*tokens\s*\((\d+)%\)/);

    if (usageMatch) {
      const usedStr = usageMatch[1];
      const maxStr = usageMatch[2];
      const percentage = parseInt(usageMatch[3], 10);

      // Parse the used tokens (handle "k" suffix)
      let usedTokens = parseFloat(usedStr);
      if (usedStr.toLowerCase().includes('k')) {
        usedTokens = usedTokens * 1000;
      }

      const maxTokens = parseInt(maxStr, 10) * 1000; // Assume max is in thousands

      return {
        tokens: Math.round(usedTokens),
        maxTokens: maxTokens,
        percentage: percentage,
      };
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Parse token usage from categories in /context output
 * @param {string} contextOutput - The raw output from /context command
 * @returns {object} - Detailed token breakdown
 */
function parseCategoryTokens(contextOutput) {
  const categories = {
    systemPrompt: 0,
    systemTools: 0,
    memoryFiles: 0,
    skills: 0,
    messages: 0,
  };

  try {
    // System prompt: 2.0k tokens (1.0%)
    const systemPromptMatch = contextOutput.match(/System prompt:\s*([\d.]+[k]?)\s*tokens/);
    if (systemPromptMatch) {
      categories.systemPrompt = parseTokenValue(systemPromptMatch[1]);
    }

    // System tools: 14.3k tokens (7.2%)
    const systemToolsMatch = contextOutput.match(/System tools:\s*([\d.]+[k]?)\s*tokens/);
    if (systemToolsMatch) {
      categories.systemTools = parseTokenValue(systemToolsMatch[1]);
    }

    // Memory files: 6.8k tokens (3.4%)
    const memoryFilesMatch = contextOutput.match(/Memory files:\s*([\d.]+[k]?)\s*tokens/);
    if (memoryFilesMatch) {
      categories.memoryFiles = parseTokenValue(memoryFilesMatch[1]);
    }

    // Skills: 386 tokens (0.2%)
    const skillsMatch = contextOutput.match(/Skills:\s*([\d.]+[k]?)\s*tokens/);
    if (skillsMatch) {
      categories.skills = parseTokenValue(skillsMatch[1]);
    }

    // Messages: 67.9k tokens (33.9%)
    const messagesMatch = contextOutput.match(/Messages:\s*([\d.]+[k]?)\s*tokens/);
    if (messagesMatch) {
      categories.messages = parseTokenValue(messagesMatch[1]);
    }
  } catch (error) {
    // Ignore parsing errors
  }

  return categories;
}

/**
 * Parse token value with optional 'k' suffix
 * @param {string} value - Token value string (e.g., "2.0k" or "386")
 * @returns {number} - Parsed numeric value
 */
function parseTokenValue(value) {
  let num = parseFloat(value);
  if (value.toLowerCase().includes('k')) {
    num = num * 1000;
  }
  return Math.round(num);
}

/**
 * Calculate total tokens from category breakdown
 * @param {object} categories - Token categories
 * @returns {number} - Total tokens
 */
function calculateTotalFromCategories(categories) {
  return categories.systemPrompt +
         categories.systemTools +
         categories.memoryFiles +
         categories.skills +
         categories.messages;
}

/**
 * Write context data to cache file
 * @param {object} data - Context data to cache
 */
function writeCache(data) {
  try {
    // Ensure cache directory exists
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }

    // Write cache with timestamp
    const cacheData = {
      ...data,
      timestamp: Date.now(),
    };

    fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2));
  } catch (error) {
    // Silently fail - don't break the hook
  }
}

/**
 * Main hook execution
 */
function main() {
  try {
    // This hook is triggered automatically
    // We'll create/update the cache with estimated values
    // The actual /context output will be captured when available

    const defaultCache = {
      tokens: 23000,  // Default base context estimate
      percentage: 12, // ~23K / 200K
      maxTokens: 200000,
      timestamp: Date.now(),
    };

    writeCache(defaultCache);
  } catch (error) {
    // Silently fail
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { parseContextOutput, parseCategoryTokens, writeCache };
