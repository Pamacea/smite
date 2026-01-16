/**
 * SMITE Toolkit - Explore Skill
 *
 * Specialized explore command using index.json and deps.json
 * Built for fast codebase exploration with minimal token usage
 */

import fs from 'fs';
import path from 'path';
import { search } from './search.js';
import { graph } from './graph.js';

/**
 * Find function in codebase
 */
export function findFunction(targetFunction: string) {
  console.log('');
  console.log('🔍 Finding function:', targetFunction);
  console.log('');

  // Search for function definition
  const query = `function ${targetFunction}`;
  const found = search(query, { maxResults: 20 });

  if (!found) {
    return false;
  }

  return true;
}

/**
 * Find component in codebase
 */
export function findComponent(targetComponent: string) {
  console.log('');
  console.log('🔍 Finding component:', targetComponent);
  console.log('');

  // Search for component definition
  const query = `component ${targetComponent} ${targetComponent} =`;
  const found = search(query, { maxResults: 20 });

  if (!found) {
    return false;
  }

  return true;
}

/**
 * Analyze impacts of changes
 */
export function analyzeImpacts(targetPath: string) {
  console.log('');
  console.log('💥 Analyzing impacts:', targetPath);
  console.log('');

  const result = graph(targetPath, { impact: true });

  if (!result) {
    return false;
  }

  return true;
}

/**
 * Map architecture
 */
export function mapArchitecture() {
  console.log('');
  console.log('🗺️  Architecture Map');
  console.log('');

  const result = graph(undefined, { impact: false });

  if (!result) {
    return false;
  }

  return true;
}

/**
 * Find bugs
 */
export function findBugs(target: string) {
  console.log('');
  console.log('🐛 Finding bugs:', target);
  console.log('');

  // Use search to find potential bug patterns
  const patterns = [
    'TODO',
    'FIXME',
    'BUG',
    'HACK',
    'XXX',
  ];

  for (const pattern of patterns) {
    console.log(`Searching for ${pattern}...`);
    search(`${pattern} ${target}`, { maxResults: 5 });
  }

  return true;
}

/**
 * Main explore function
 */
export function explore(task: string, target?: string) {
  switch (task) {
    case 'find-function':
      if (!target) {
        console.error('⚠️  Target required for find-function');
        return false;
      }
      return findFunction(target);

    case 'find-component':
      if (!target) {
        console.error('⚠️  Target required for find-component');
        return false;
      }
      return findComponent(target);

    case 'analyze-impacts':
      if (!target) {
        console.error('⚠️  Target required for analyze-impacts');
        return false;
      }
      return analyzeImpacts(target);

    case 'map-architecture':
      return mapArchitecture();

    case 'find-bug':
      if (!target) {
        console.error('⚠️  Target required for find-bug');
        return false;
      }
      return findBugs(target);

    default:
      console.error('⚠️  Unknown task:', task);
      console.error('Available tasks:');
      console.error('  - find-function');
      console.error('  - find-component');
      console.error('  - analyze-impacts');
      console.error('  - map-architecture');
      console.error('  - find-bug');
      return false;
  }
}
