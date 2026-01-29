/**
 * SMITE Plugin Manifest Loader
 *
 * Centralized manifest loading, validation, and dependency resolution.
 */

export interface PluginManifest {
  name: string;
  version: string;
  description?: string;
  smite: string;
  core?: string;
  depends?: string[];
  optional?: string[];
  provides: string[];
  conflicts?: string[];
  loadAfter?: string[];
  loadBefore?: string[];
  tags?: string[];
  author?: string;
  license?: string;
  repository?: string;
}

export interface DependencyGraph {
  nodes: Map<string, PluginManifest>;
  edges: Map<string, Set<string>>;
  loadOrder: string[];
  circular: string[][];
  missing: string[];
}

/**
 * Parse semver string into comparable parts
 */
function parseSemver(version: string): { major: number; minor: number; patch: number } {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) throw new Error(`Invalid semver: ${version}`);
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
  };
}

/**
 * Check if version satisfies constraint
 */
function satisfiesVersion(version: string, constraint: string): boolean {
  const v = parseSemver(version);
  const c = parseSemver(constraint);
  return v.major >= c.major && v.minor >= c.minor && v.patch >= c.patch;
}

/**
 * Detect circular dependencies using depth-first search
 */
function detectCircular(
  graph: Map<string, Set<string>>,
  path: string[] = [],
  visited = new Set<string>()
): string[][] {
  const cycles: string[][] = [];
  const current = path[path.length - 1];

  if (path.includes(current)) {
    cycles.push([...path.slice(path.indexOf(current)), current]);
    return cycles;
  }

  if (visited.has(current)) return cycles;
  visited.add(current);

  const deps = graph.get(current) || new Set();
  for (const dep of deps) {
    cycles.push(...detectCircular(graph, [...path, dep], visited));
  }

  return cycles;
}

/**
 * Topological sort for load order
 */
function topologicalSort(
  manifests: Map<string, PluginManifest>
): { order: string[]; cycles: string[][] } {
  const graph = new Map<string, Set<string>>();
  const inDegree = new Map<string, number>();

  // Initialize
  for (const [name] of manifests) {
    graph.set(name, new Set());
    inDegree.set(name, 0);
  }

  // Build graph from dependencies
  for (const [name, manifest] of manifests) {
    const deps = new Set([
      ...(manifest.depends || []),
      ...(manifest.loadAfter || []),
    ]);

    for (const dep of deps) {
      if (manifests.has(dep)) {
        graph.get(name)?.add(dep);
        inDegree.set(name, (inDegree.get(name) || 0) + 1);
      }
    }
  }

  // Check for cycles
  const cycles = detectCircular(graph);

  // Topological sort (Kahn's algorithm)
  const order: string[] = const queue: string[] = [];

  for (const [name, degree] of inDegree) {
    if (degree === 0) queue.push(name);
  }

  while (queue.length > 0) {
    const name = queue.shift()!;
    order.push(name);

    for (const [depName, deps] of graph) {
      if (deps.has(name)) {
        deps.delete(name);
        inDegree.set(depName, inDegree.get(depName)! - 1);
        if (inDegree.get(depName) === 0) queue.push(depName);
      }
    }
  }

  return { order, cycles };
}

/**
 * Load and validate plugin manifests
 */
export class ManifestLoader {
  private manifests = new Map<string, PluginManifest>();

  /**
   * Load a single plugin manifest
   */
  load(manifest: PluginManifest): void {
    // Validate required fields
    if (!manifest.name) throw new Error('Manifest missing "name"');
    if (!manifest.version) throw new Error('Manifest missing "version"');
    if (!manifest.smite) throw new Error('Manifest missing "smite" version');
    if (!manifest.provides) throw new Error('Manifest missing "provides"');

    // Parse semver
    parseSemver(manifest.version);
    parseSemver(manifest.smite);

    this.manifests.set(manifest.name, manifest);
  }

  /**
   * Load multiple manifests
   */
  loadAll(manifests: PluginManifest[]): void {
    for (const manifest of manifests) {
      this.load(manifest);
    }
  }

  /**
   * Get a plugin manifest by name
   */
  get(name: string): PluginManifest | undefined {
    return this.manifests.get(name);
  }

  /**
   * Get all manifests
   */
  getAll(): Map<string, PluginManifest> {
    return new Map(this.manifests);
  }

  /**
   * Build dependency graph
   */
  buildGraph(): DependencyGraph {
    const { order, cycles } = topologicalSort(this.manifests);

    // Find missing dependencies
    const missing: string[] = [];
    for (const [name, manifest] of this.manifests) {
      for (const dep of manifest.depends || []) {
        if (!this.manifests.has(dep)) {
          missing.push(dep);
        }
      }
    }

    return {
      nodes: this.manifests,
      edges: this.buildEdges(),
      loadOrder: order,
      circular: cycles,
      missing,
    };
  }

  /**
   * Build adjacency list for dependency graph
   */
  private buildEdges(): Map<string, Set<string>> {
    const edges = new Map<string, Set<string>>();

    for (const [name, manifest] of this.manifests) {
      const deps = new Set([
        ...(manifest.depends || []),
        ...(manifest.loadAfter || []),
      ]);
      edges.set(name, deps);
    }

    return edges;
  }

  /**
   * Check for conflicts
   */
  checkConflicts(): Map<string, string[]> {
    const conflicts = new Map<string, string[]>();

    for (const [name, manifest] of this.manifests) {
      const pluginConflicts: string[] = [];

      for (const conflict of manifest.conflicts || []) {
        if (this.manifests.has(conflict)) {
          pluginConflicts.push(conflict);
        }
      }

      if (pluginConflicts.length > 0) {
        conflicts.set(name, pluginConflicts);
      }
    }

    return conflicts;
  }

  /**
   * Validate version constraints
   */
  validateVersions(smiteVersion: string, coreVersion: string): string[] {
    const errors: string[] = [];

    for (const [name, manifest] of this.manifests) {
      // Check SMITE version
      if (!satisfiesVersion(smiteVersion, manifest.smite)) {
        errors.push(
          `${name}: Requires SMITE >= ${manifest.smite}, current is ${smiteVersion}`
        );
      }

      // Check core version
      const coreReq = manifest.core || '1.0.0';
      if (!satisfiesVersion(coreVersion, coreReq)) {
        errors.push(
          `${name}: Requires core >= ${coreReq}, current is ${coreVersion}`
        );
      }
    }

    return errors;
  }

  /**
   * Get plugins that provide a capability
   */
  getProviders(capability: string): PluginManifest[] {
    const providers: PluginManifest[] = [];

    for (const manifest of this.manifests.values()) {
      if (manifest.provides.includes(capability)) {
        providers.push(manifest);
      }
    }

    return providers;
  }

  /**
   * Find plugins by tag
   */
  findByTag(tag: string): PluginManifest[] {
    const found: PluginManifest[] = [];

    for (const manifest of this.manifests.values()) {
      if (manifest.tags?.includes(tag)) {
        found.push(manifest);
      }
    }

    return found;
  }
}

/**
 * Create a manifest loader from plugin.json files
 */
export async function loadFromPluginRoot(
  rootPaths: string[]
): Promise<ManifestLoader> {
  const loader = new ManifestLoader();

  for (const root of rootPaths) {
    try {
      // In a real implementation, this would read plugin-manifest.json
      // For now, we'll skip actual file I/O
    } catch {
      // Skip missing manifests
    }
  }

  return loader;
}
