/**
 * SMITE Plugin Manifest System
 *
 * Central manifest exports for plugin dependency management.
 */

export { ManifestLoader, loadFromPluginRoot } from './loader';
export type { PluginManifest, DependencyGraph } from './loader';

/**
 * Current SMITE version
 */
export const SMITE_VERSION = '3.1.0';

/**
 * Current core version
 */
export const CORE_VERSION = '1.0.0';
