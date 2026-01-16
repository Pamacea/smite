/**
 * SMITE Toolkit - Graph Skill
 *
 * Specialized dependency graph command that reads from deps.json
 * Built for fast dependency analysis and impact assessment
 */

import fs from 'fs';
import path from 'path';

interface DepNode {
  imports: string[];
  exports: string[];
  importedBy: string[];
  stats: {
    imports: number;
    exports: number;
    lines: number;
  };
}

interface Deps {
  version: string;
  createdAt: string;
  projectDir: string;
  metadata: {
    totalNodes: number;
    totalEdges: number;
    circularDeps: number;
    deadCode: number;
  };
  graph: Record<string, DepNode>;
  issues: {
    circularDeps: string[][];
    deadCode: Array<{ file: string; export: string }>;
  };
}

/**
 * Load deps from .smite/toolkit/deps.json
 */
function loadDeps(): Deps | null {
  const homeDir = process.env.USERPROFILE || process.env.HOME || '';
  if (!homeDir) return null;
  const smiteDir = path.join(homeDir, '.smite');
  const depsPath = path.join(smiteDir, 'toolkit', 'deps.json');

  if (!fs.existsSync(depsPath)) {
    console.error('⚠️  Deps not found. Run session start to build deps.');
    return null;
  }

  try {
    const content = fs.readFileSync(depsPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('⚠️  Failed to load deps:', error);
    return null;
  }
}

/**
 * Display dependency tree
 */
function displayTree(deps: Deps, targetPath?: string) {
  console.log('');
  console.log('🔗 Dependency Graph');

  if (targetPath) {
    console.log(`Target: ${targetPath}`);
  }

  console.log('');

  const graph = deps.graph;
  let nodes = Object.keys(graph);

  if (targetPath) {
    nodes = nodes.filter(n => n.includes(targetPath));
  }

  if (nodes.length === 0) {
    console.log('No files found.');
    return;
  }

  // Display tree
  for (const node of nodes.slice(0, 20)) {
    const data = graph[node];
    const file = path.basename(node);
    const relPath = path.relative(deps.projectDir, node);

    console.log(`${relPath}`);
    console.log(`  ├─ imports: ${data.stats.imports}`);
    console.log(`  ├─ exports: ${data.stats.exports}`);
    console.log(`  └─ imported by: ${data.importedBy.length}`);
  }

  if (nodes.length > 20) {
    console.log(`... and ${nodes.length - 20} more files`);
  }

  console.log('');
}

/**
 * Display impact analysis
 */
function displayImpact(deps: Deps, targetPath: string) {
  console.log('');
  console.log('💥 Impact Analysis');
  console.log(`Target: ${targetPath}`);
  console.log('');

  const graph = deps.graph;
  const node = Object.keys(graph).find(n => n.includes(targetPath));

  if (!node) {
    console.log('File not found in dependency graph.');
    return;
  }

  const data = graph[node];
  const affectedFiles: Array<{
    file: string;
    risk: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  }> = [];

  // Direct dependents (HIGH risk)
  for (const imp of data.importedBy) {
    const impData = graph[imp];
    if (impData) {
      affectedFiles.push({
        file: imp,
        risk: 'HIGH',
        reason: 'Direct import, breaking change',
      });
    }
  }

  // Indirect dependents (MEDIUM risk)
  for (const imp of data.importedBy) {
    const impData = graph[imp];
    if (impData) {
      for (const subImp of impData.importedBy) {
        if (!affectedFiles.find(f => f.file === subImp)) {
          affectedFiles.push({
            file: subImp,
            risk: 'MEDIUM',
            reason: 'Indirect import, test needed',
          });
        }
      }
    }
  }

  // Sort by risk
  affectedFiles.sort((a, b) => {
    const riskOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return riskOrder[a.risk] - riskOrder[b.risk];
  });

  console.log(`Affected Files: ${affectedFiles.length}`);
  console.log('┌─────────────────────────────┬──────────┬──────────────────────────────────┐');
  console.log('│ File                        │ Risk     │ Impact                           │');
  console.log('├─────────────────────────────┼──────────┼──────────────────────────────────┤');

  for (const { file, risk, reason } of affectedFiles.slice(0, 10)) {
    const relPath = path.relative(deps.projectDir, file);
    console.log(`│ ${relPath.padEnd(27)}│ ${risk.padEnd(9)}│ ${reason.padEnd(33)}│`);
  }

  console.log('└─────────────────────────────┴──────────┴──────────────────────────────────┘');
  console.log('');
}

/**
 * Display issues
 */
function displayIssues(deps: Deps) {
  console.log('');

  if (deps.issues.circularDeps.length > 0) {
    console.log(`⚠️  Circular Dependencies: ${deps.issues.circularDeps.length}`);
    for (const cycle of deps.issues.circularDeps.slice(0, 5)) {
      console.log(`   ${cycle.join(' → ')}`);
    }
    console.log('');
  }

  if (deps.issues.deadCode.length > 0) {
    console.log(`💀 Dead Code: ${deps.issues.deadCode.length} unused exports`);
    for (const { file, export: exp } of deps.issues.deadCode.slice(0, 5)) {
      const relPath = path.relative(deps.projectDir, file);
      console.log(`   ${relPath}:${exp}`);
    }
    console.log('');
  }
}

/**
 * Main graph function
 */
export function graph(targetPath?: string, options: {
  impact?: boolean;
  view?: 'tree' | 'json';
} = {}) {
  const deps = loadDeps();

  if (!deps) {
    return false;
  }

  if (options.impact && targetPath) {
    displayImpact(deps, targetPath);
  } else {
    displayTree(deps, targetPath);
  }

  displayIssues(deps);

  return true;
}

/**
 * Graph with JSON output
 */
export function graphJSON(targetPath?: string, options: { impact?: boolean } = {}) {
  const deps = loadDeps();

  if (!deps) {
    return { error: 'Deps not found' };
  }

  if (options.impact && targetPath) {
    // Return impact analysis
    const node = Object.keys(deps.graph).find(n => n.includes(targetPath));

    if (!node) {
      return { error: 'File not found' };
    }

    const data = deps.graph[node];
    const affectedFiles = data.importedBy.map(file => ({
      file,
      risk: 'HIGH' as const,
      reason: 'Direct import',
    }));

    return {
      target: targetPath,
      affectedFiles,
      breakingChanges: data.imports.length,
    };
  }

  // Return tree
  return {
    target: targetPath || 'all',
    nodes: Object.keys(deps.graph).length,
    edges: deps.metadata.totalEdges,
    issues: deps.issues,
  };
}
