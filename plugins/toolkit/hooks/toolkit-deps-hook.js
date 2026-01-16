#!/usr/bin/env node

/**
 * SMITE Toolkit - Dependency Graph Hook
 *
 * Runs at session start to:
 * - Check if deps.json exists and is fresh (<24h)
 * - If fresh: incremental update (only changed files)
 * - If stale or missing: full rebuild
 * - Save to .smite/toolkit/deps.json
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Paths
const homeDir = process.env.USERPROFILE || process.env.HOME;
const smiteDir = path.join(homeDir, '.smite');
const toolkitDir = path.join(smiteDir, 'toolkit');
const depsPath = path.join(toolkitDir, 'deps.json');

// Config
const MAX_AGE_HOURS = 3; // 3 hours freshness

// Import regex patterns
const IMPORT_PATTERNS = [
  /^import\s+.*?from\s+['"]([^'"]+)['"]/,
  /^import\s+['"]([^'"]+)['"]/,
  /require\(['"]([^'"]+)['"]\)/,
  /import\(['"]([^'"]+)['"]\)/,
];

const EXPORT_PATTERNS = [
  /^export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)/,
  /^export\s+\{([^}]+)\}/,
  /^export\s+default/,
];

/**
 * Check if deps needs rebuild
 */
function needsRebuild(depsPath) {
  if (!fs.existsSync(depsPath)) {
    return { needs: true, reason: 'missing' };
  }

  const stats = fs.statSync(depsPath);
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
 * Extract imports from file content
 */
function extractImports(content) {
  const imports = [];
  const lines = content.split('\n');

  for (const line of lines) {
    for (const pattern of IMPORT_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        imports.push(match[1]);
        break;
      }
    }
  }

  return [...new Set(imports)]; // Unique imports
}

/**
 * Extract exports from file content
 */
function extractExports(content) {
  const exports = [];
  const lines = content.split('\n');

  for (const line of lines) {
    for (const pattern of EXPORT_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        if (match[1]) {
          // Named exports
          const names = match[1].split(',').map(s => s.trim());
          exports.push(...names);
        } else {
          // Default export
          exports.push('default');
        }
        break;
      }
    }
  }

  return [...new Set(exports)]; // Unique exports
}

/**
 * Analyze single file
 */
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const imports = extractImports(content);
    const exports = extractExports(content);

    return {
      file: filePath,
      imports,
      exports,
      stats: {
        imports: imports.length,
        exports: exports.length,
        lines: content.split('\n').length,
      }
    };
  } catch (error) {
    return null;
  }
}

/**
 * Build dependency graph
 */
function buildGraph(files) {
  const graph = {};
  const fileMap = new Map();

  // Analyze all files
  for (const file of files) {
    const analysis = analyzeFile(file);
    if (analysis) {
      graph[file] = {
        imports: analysis.imports,
        exports: analysis.exports,
        importedBy: [],
        stats: analysis.stats,
      };
      fileMap.set(file, true);
    }
  }

  // Build reverse dependencies (importedBy)
  for (const [file, data] of Object.entries(graph)) {
    for (const imp of data.imports) {
      // Check if import is relative (local file)
      if (imp.startsWith('.') || imp.startsWith('./')) {
        // Resolve relative path
        const fileDir = path.dirname(file);
        const resolvedPath = path.resolve(fileDir, imp);

        // Try common extensions
        const extensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.js'];
        for (const ext of extensions) {
          const fullPath = resolvedPath + ext;
          if (graph[fullPath]) {
            graph[fullPath].importedBy.push(file);
            break;
          }
        }
      }
    }
  }

  return graph;
}

/**
 * Detect circular dependencies
 */
function detectCircularDeps(graph) {
  const visited = new Set();
  const recursionStack = new Set();
  const cycles = [];

  function dfs(file, path = []) {
    if (recursionStack.has(file)) {
      const cycleStart = path.indexOf(file);
      cycles.push([...path.slice(cycleStart), file]);
      return;
    }

    if (visited.has(file)) {
      return;
    }

    visited.add(file);
    recursionStack.add(file);

    const node = graph[file];
    if (node) {
      for (const imp of node.imports) {
        dfs(imp, [...path, file]);
      }
    }

    recursionStack.delete(file);
  }

  for (const file of Object.keys(graph)) {
    if (!visited.has(file)) {
      dfs(file);
    }
  }

  return cycles;
}

/**
 * Detect dead code (unused exports)
 */
function detectDeadCode(graph) {
  const dead = [];

  for (const [file, data] of Object.entries(graph)) {
    for (const exp of data.exports) {
      // Check if export is imported anywhere
      let isUsed = false;

      for (const [otherFile, otherData] of Object.entries(graph)) {
        if (otherFile === file) continue;

        for (const imp of otherData.imports) {
          // Check if import matches this export
          if (imp.includes(file) || imp.endsWith(path.basename(file))) {
            isUsed = true;
            break;
          }
        }

        if (isUsed) break;
      }

      if (!isUsed && data.importedBy.length === 0) {
        dead.push({ file, export: exp });
      }
    }
  }

  return dead;
}

/**
 * Build full dependency graph
 */
async function buildFullDeps(projectDir) {
  console.log('🔗 Building full dependency graph...');

  const files = await scanFiles(projectDir);
  const graph = buildGraph(files);
  const cycles = detectCircularDeps(graph);
  const deadCode = detectDeadCode(graph);

  const deps = {
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    projectDir,
    metadata: {
      totalNodes: Object.keys(graph).length,
      totalEdges: Object.values(graph).reduce((sum, n) => sum + n.imports.length, 0),
      circularDeps: cycles.length,
      deadCode: deadCode.length,
    },
    graph,
    issues: {
      circularDeps: cycles,
      deadCode,
    }
  };

  return deps;
}

/**
 * Update existing deps incrementally
 */
async function updateDeps(projectDir, oldDeps) {
  console.log('🔗 Updating dependency graph incrementally...');

  const files = await scanFiles(projectDir);
  const oldFiles = new Set(Object.keys(oldDeps.graph));

  const newFiles = files.filter(f => !oldFiles.has(f));
  const removedFiles = [...oldFiles].filter(f => !files.includes(f));

  let graph = { ...oldDeps.graph };

  // Remove deleted files
  for (const file of removedFiles) {
    delete graph[file];
  }

  // Add new files
  for (const file of newFiles) {
    const analysis = analyzeFile(file);
    if (analysis) {
      graph[file] = {
        imports: analysis.imports,
        exports: analysis.exports,
        importedBy: [],
        stats: analysis.stats,
      };
    }
  }

  // Rebuild reverse dependencies for affected files
  const affectedFiles = new Set([...newFiles, ...removedFiles]);
  for (const file of affectedFiles) {
    // Clear and rebuild importedBy
    for (const [otherFile, data] of Object.entries(graph)) {
      data.importedBy = data.importedBy.filter(f => f !== file);
    }

    for (const [otherFile, data] of Object.entries(graph)) {
      for (const imp of data.imports) {
        if (imp.includes(file) || imp.endsWith(path.basename(file))) {
          if (!data.importedBy.includes(file)) {
            data.importedBy.push(file);
          }
        }
      }
    }
  }

  const cycles = detectCircularDeps(graph);
  const deadCode = detectDeadCode(graph);

  const deps = {
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    projectDir,
    metadata: {
      totalNodes: Object.keys(graph).length,
      totalEdges: Object.values(graph).reduce((sum, n) => sum + n.imports.length, 0),
      circularDeps: cycles.length,
      deadCode: deadCode.length,
      added: newFiles.length,
      removed: removedFiles.length,
    },
    graph,
    issues: {
      circularDeps: cycles,
      deadCode,
    }
  };

  return deps;
}

/**
 * Main function
 */
async function buildDependencyGraph() {
  try {
    const projectDir = process.cwd();

    // Check if rebuild needed
    const check = needsRebuild(depsPath);

    if (!check.needs) {
      console.log(`✓ Deps fresh (${check.age}h old)`);
      return true;
    }

    // Create toolkit directory
    fs.mkdirSync(toolkitDir, { recursive: true });

    // Build or update deps
    let deps;
    if (check.reason === 'stale') {
      // Load existing deps for incremental update
      try {
        const oldDeps = JSON.parse(fs.readFileSync(depsPath, 'utf-8'));
        deps = await updateDeps(projectDir, oldDeps);
        console.log(`  Added: ${deps.metadata.added} files`);
        console.log(`  Removed: ${deps.metadata.removed} files`);
      } catch (error) {
        // If load fails, do full rebuild
        deps = await buildFullDeps(projectDir);
      }
    } else {
      // Full rebuild
      deps = await buildFullDeps(projectDir);
    }

    // Save deps
    fs.writeFileSync(depsPath, JSON.stringify(deps, null, 2));

    console.log('✓ Deps built:');
    console.log(`  Nodes: ${deps.metadata.totalNodes}`);
    console.log(`  Edges: ${deps.metadata.totalEdges}`);
    console.log(`  Circular deps: ${deps.metadata.circularDeps}`);
    console.log(`  Dead code: ${deps.metadata.deadCode}`);

    return true;
  } catch (error) {
    console.error('⚠️  Deps build failed:', error.message);
    return false;
  }
}

// Run dependency graph build
module.exports = buildDependencyGraph();
