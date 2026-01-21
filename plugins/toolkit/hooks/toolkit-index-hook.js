#!/usr/bin/env node

/**
 * SMITE Toolkit - Auto-Index Hook
 *
 * Runs at session start to:
 * - Check if index.json exists and is fresh (<24h)
 * - If fresh: incremental update (only changed files)
 * - If stale or missing: full rebuild
 * - Save to .claude/.smite/toolkit/index.json
 */

const fs = require('fs');
const path = require('path');

// Paths
const projectDir = process.cwd();
const smiteDir = path.join(projectDir, '.claude', '.smite');
const toolkitDir = path.join(smiteDir, 'toolkit');
const indexPath = path.join(toolkitDir, 'index.json');

// Config
const MAX_AGE_HOURS = 3; // 3 hours freshness
const CHUNK_SIZE_LINES = 100; // ~1000 tokens per chunk
const MAX_FILE_SIZE = 1024 * 1024; // 1MB max file size
const MAX_CHUNKS = 10000; // Maximum total chunks to prevent memory issues
const MAX_DEPTH = 15; // Maximum directory depth to scan

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
 * Scan project files recursively
 */
function scanFiles(projectDir) {
  try {
    const files = [];
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    const excludeDirs = ['node_modules', 'dist', '.next', 'coverage', 'build'];

    function scanDir(dir, depth = 0) {
      // Prevent infinite recursion with depth limit
      if (depth > MAX_DEPTH) {
        return;
      }

      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            // Skip excluded directories
            if (excludeDirs.includes(entry.name)) {
              continue;
            }
            scanDir(fullPath, depth + 1);
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name);
            // Skip test files
            if (entry.name.includes('.test.')) {
              continue;
            }
            // Include only target extensions
            if (extensions.includes(ext)) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    }

    // Scan src and plugins directories if they exist
    if (fs.existsSync(path.join(projectDir, 'src'))) {
      scanDir(path.join(projectDir, 'src'));
    }
    if (fs.existsSync(path.join(projectDir, 'plugins'))) {
      scanDir(path.join(projectDir, 'plugins'));
    }

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
  // Check file size before processing
  const stats = fs.statSync(filePath);
  if (stats.size > MAX_FILE_SIZE) {
    console.warn(`⚠️  Skipping large file: ${filePath} (${Math.round(stats.size / 1024)}KB)`);
    return [];
  }

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
function buildFullIndex(projectDir) {
  console.log('🔄 Building full toolkit index...');

  const files = scanFiles(projectDir);
  const chunks = [];

  for (const file of files) {
    // Stop if we've hit the chunk limit
    if (chunks.length >= MAX_CHUNKS) {
      console.warn(`⚠️  Reached maximum chunk limit (${MAX_CHUNKS}), stopping...`);
      break;
    }

    try {
      const content = fs.readFileSync(file, 'utf-8');
      const fileChunks = createChunks(file, content);

      // Only add chunks if we haven't exceeded the limit
      const remainingSpace = MAX_CHUNKS - chunks.length;
      if (fileChunks.length > remainingSpace) {
        chunks.push(...fileChunks.slice(0, remainingSpace));
        console.warn(`⚠️  Reached chunk limit, partially processed file: ${file}`);
        break;
      }

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
function updateIndex(projectDir, oldIndex) {
  console.log('🔄 Updating toolkit index incrementally...');

  const files = scanFiles(projectDir);
  const oldFiles = new Set(oldIndex.chunks.map(c => c.file));

  const newFiles = files.filter(f => !oldFiles.has(f));
  const removedFiles = [...oldFiles].filter(f => !files.includes(f));

  let chunks = oldIndex.chunks.filter(c => !removedFiles.includes(c.file));

  for (const file of newFiles) {
    // Stop if we've hit the chunk limit
    if (chunks.length >= MAX_CHUNKS) {
      console.warn(`⚠️  Reached maximum chunk limit (${MAX_CHUNKS}), stopping...`);
      break;
    }

    try {
      const content = fs.readFileSync(file, 'utf-8');
      const fileChunks = createChunks(file, content);

      // Only add chunks if we haven't exceeded the limit
      const remainingSpace = MAX_CHUNKS - chunks.length;
      if (fileChunks.length > remainingSpace) {
        chunks.push(...fileChunks.slice(0, remainingSpace));
        console.warn(`⚠️  Reached chunk limit, partially processed file: ${file}`);
        break;
      }

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
function buildIndex() {
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
        index = updateIndex(projectDir, oldIndex);
        console.log(`  Added: ${index.metadata.added} files`);
        console.log(`  Removed: ${index.metadata.removed} files`);
      } catch (error) {
        // If load fails, do full rebuild
        index = buildFullIndex(projectDir);
      }
    } else {
      // Full rebuild
      index = buildFullIndex(projectDir);
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
