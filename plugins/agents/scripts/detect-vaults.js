#!/usr/bin/env node

/**
 * Obsidian Vault Detection Script
 *
 * Detects Obsidian vaults by looking for .obsidian folders
 * and updates the vaults configuration.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG_PATH = path.join(__dirname, '../config/vaults.json');
const OBSIDIAN_FOLDER = '.obsidian';
const SEARCH_DEPTH = 2;

/**
 * Recursively search for directories containing .obsidian folder
 */
function findVaults(dir, depth = 0) {
  if (depth > SEARCH_DEPTH) return [];

  const vaults = [];

  try {
    // Check if current directory has .obsidian folder
    const obsidianPath = path.join(dir, OBSIDIAN_FOLDER);
    if (fs.existsSync(obsidianPath)) {
      vaults.push({
        name: path.basename(dir),
        path: dir,
        isVault: true
      });
    }

    // Search subdirectories
    if (depth < SEARCH_DEPTH) {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        if (item.isDirectory() && !item.name.startsWith('.')) {
          const subPath = path.join(dir, item.name);
          vaults.push(...findVaults(subPath, depth + 1));
        }
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }

  return vaults;
}

/**
 * Load existing vaults configuration
 */
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const content = fs.readFileSync(CONFIG_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Error loading config:', error.message);
  }

  // Return default config
  return {
    vaults: [],
    currentVault: 'auto-detect',
    vaultDetection: {
      enabled: true,
      searchDepth: SEARCH_DEPTH,
      indicatorFolder: OBSIDIAN_FOLDER
    },
    lastUpdated: null
  };
}

/**
 * Save vaults configuration
 */
function saveConfig(config) {
  try {
    config.lastUpdated = new Date().toISOString();
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving config:', error.message);
    return false;
  }
}

/**
 * Merge detected vaults with existing config
 */
function mergeVaults(existing, detected) {
  const vaultMap = new Map();

  // Add existing vaults
  existing.vaults.forEach(vault => {
    vaultMap.set(vault.path, vault);
  });

  // Add or update detected vaults
  detected.forEach(vault => {
    const existing = vaultMap.get(vault.path);
    if (existing) {
      // Update existing
      existing.isVault = true;
      existing.lastDetected = new Date().toISOString();
    } else {
      // Add new
      vault.lastDetected = new Date().toISOString();
      vaultMap.set(vault.path, vault);
    }
  });

  return Array.from(vaultMap.values());
}

/**
 * Check if current directory looks like it might be a vault
 */
function looksLikeVault(dir) {
  const suspiciousNames = ['vault', 'notes', 'brain', 'second-brain', 'obsidian', 'knowledge'];
  const dirName = path.basename(dir).toLowerCase();
  return suspiciousNames.some(name => dirName.includes(name));
}

/**
 * Main execution
 */
function main() {
  // Get current working directory
  const currentDir = process.cwd();

  // Find vaults
  const detectedVaults = findVaults(currentDir);

  // Load existing config
  const config = loadConfig();

  // Merge vaults
  config.vaults = mergeVaults(config, detectedVaults);

  // Save config silently
  if (!saveConfig(config)) {
    console.error('❌ Failed to save vault configuration');
    process.exit(1);
  }

  // Only show output if vaults were detected OR directory looks suspicious
  if (detectedVaults.length > 0) {
    console.log(`\n✅ Obsidian: Found ${detectedVaults.length} vault(s)`);
    detectedVaults.forEach(vault => {
      console.log(`   - ${vault.name} (${vault.path})`);
    });
  } else if (looksLikeVault(currentDir)) {
    console.warn(`⚠️  Obsidian: Directory "${path.basename(currentDir)}" looks like a vault but .obsidian folder not found`);
  }
  // Otherwise: silent (no vaults found, not suspicious)
}

// Run main function
main();
