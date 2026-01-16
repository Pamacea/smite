#!/usr/bin/env node

/**
 * SMITE Toolkit - Auto-Index Hook
 *
 * Runs at session start to:
 * - Check if index.json exists and is fresh (<24h)
 * - If fresh: incremental update (only changed files)
 * - If stale or missing: full rebuild
 * - Save to .smite/toolkit/index.json
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Paths
const homeDir = process.env.USERPROFILE || process.env.HOME;
const smiteDir = path.join(homeDir, '.smite');
const toolkitDir = path.join(smiteDir, 'toolkit');
const indexPath = path.join(toolkitDir, 'index.json');

// Config
const MAX_AGE_HOURS = 3; // 3 hours freshness
const CHUNK_SIZE_LINES = 100; // ~1000 tokens per chunk

/**
 * Check if index needs rebuild
 */
function needsRebuild(indexPath) {
  if (!fs.existsSync(indexPath)) {
    return { needs: true, reason: 'missing' };
  }

  const stats = fs.statSync(indexPath);
  const ageMs = Date.now() - stats.mtimeMs;
  const ageHours = ageMs / (1000 * 60 * 60);

  if (ageHours >= MAX_AGE_HOURS) {
    return { needs: true, reason: 'stale', age: ageHours.toFixed(1) };
  }

  return { needs: false, age: ageHours.toFixed(1) };
}

/**
 * Scan project files
 */
async function scanFiles(projectDir) {
  try {
    const patterns = [
      'src/**/*.ts',
      'src/**/*.tsx',
      'src/**/*.js',
      'src/**/*.jsx',
      'plugins/**/*.ts',
      'plugins/**/*.js',
      '!**/node_modules/**',
      '!**/dist/**',
      '!**/.next/**',
      '!**/*.test.ts',
      '!**/*.test.js',
    ];

    const files = await glob(patterns, {
      cwd: projectDir,
      absolute: true,
      nodir: true,
    });

    return files;
  } catch (error) {
    console.error('⚠️  File scan failed:', error.message);
    return [];
  }
}

/**
 * Create chunks from file content
 */
function createChunks(filePath, content) {
  const lines = content.split('\n');
  const chunks = [];

  for (let i = 0; i < lines.length; i += CHUNK_SIZE_LINES) {
    const end = Math.min(i + CHUNK_SIZE_LINES, lines.length);
    const chunkLines = lines.slice(i, end);

    chunks.push({
      id: `${filePath}:${i}-${end}`,
      file: filePath,
      startLine: i + 1,
      endLine: end,
      content: chunkLines.join('\n'),
      metadata: {
        tokens: Math.ceil(chunkLines.join('').length / 4),
        language: path.extname(filePath).slice(1),
      }
    });
  }

  return chunks;
}

/**
 * Build full index
 */
async function buildFullIndex(projectDir) {
  console.log('🔄 Building full toolkit index...');

  const files = await scanFiles(projectDir);
  const chunks = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const fileChunks = createChunks(file, content);
      chunks.push(...fileChunks);
    } catch (error) {
      // Skip unreadable files
    }
  }

  const index = {
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    projectDir,
    metadata: {
      totalFiles: files.length,
      totalChunks: chunks.length,
      totalTokens: chunks.reduce((sum, c) => sum + c.metadata.tokens, 0),
    },
    chunks,
  };

  return index;
}

/**
 * Update existing index incrementally
 */
async function updateIndex(projectDir, oldIndex) {
  console.log('🔄 Updating toolkit index incrementally...');

  const files = await scanFiles(projectDir);
  const oldFiles = new Set(oldIndex.chunks.map(c => c.file));

  const newFiles = files.filter(f => !oldFiles.has(f));
  const removedFiles = [...oldFiles].filter(f => !files.includes(f));

  let chunks = oldIndex.chunks.filter(c => !removedFiles.includes(c.file));

  for (const file of newFiles) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const fileChunks = createChunks(file, content);
      chunks.push(...fileChunks);
    } catch (error) {
      // Skip unreadable files
    }
  }

  const index = {
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    projectDir,
    metadata: {
      totalFiles: files.length,
      totalChunks: chunks.length,
      totalTokens: chunks.reduce((sum, c) => sum + c.metadata.tokens, 0),
      added: newFiles.length,
      removed: removedFiles.length,
    },
    chunks,
  };

  return index;
}

/**
 * Main function
 */
async function buildIndex() {
  try {
    const projectDir = process.cwd();

    // Check if rebuild needed
    const check = needsRebuild(indexPath);

    if (!check.needs) {
      console.log(`✓ Index fresh (${check.age}h old)`);
      return true;
    }

    // Create toolkit directory
    fs.mkdirSync(toolkitDir, { recursive: true });

    // Build or update index
    let index;
    if (check.reason === 'stale') {
      // Load existing index for incremental update
      try {
        const oldIndex = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
        index = await updateIndex(projectDir, oldIndex);
        console.log(`  Added: ${index.metadata.added} files`);
        console.log(`  Removed: ${index.metadata.removed} files`);
      } catch (error) {
        // If load fails, do full rebuild
        index = await buildFullIndex(projectDir);
      }
    } else {
      // Full rebuild
      index = await buildFullIndex(projectDir);
    }

    // Save index
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));

    console.log('✓ Index built:');
    console.log(`  Files: ${index.metadata.totalFiles}`);
    console.log(`  Chunks: ${index.metadata.totalChunks}`);
    console.log(`  Tokens: ${index.metadata.totalTokens.toLocaleString()}`);

    return true;
  } catch (error) {
    console.error('⚠️  Index build failed:', error.message);
    return false;
  }
}

// Run index build
module.exports = buildIndex();
