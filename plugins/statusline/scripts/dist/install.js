#!/usr/bin/env tsx
/**
 * Statusline Plugin Auto-Configuration Script
 *
 * Automatically configures Claude Code settings.json to enable the statusline
 * Supports Windows, macOS, and Linux with Bun or Node.js runtime
 */
import * as fs from 'fs/promises';
import * as path from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
// ============ Utilities ============
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};
const log = {
    info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
    error: (msg) => console.error(`${colors.red}[ERROR]${colors.reset} ${msg}`),
    warn: (msg) => console.warn(`${colors.yellow}[WARN]${colors.reset} ${msg}`),
    dry: (msg) => console.log(`${colors.cyan}[DRY RUN]${colors.reset} ${msg}`),
};
// ============ Platform Detection ============
async function detectPlatform() {
    // Detect OS
    let os;
    if (process.env.WINDIR || process.platform === 'win32') {
        os = 'windows';
    }
    else if (process.platform === 'darwin') {
        os = 'mac';
    }
    else {
        os = 'linux';
    }
    // Detect runtime - prefer bun if available, check if bun command exists
    let runtime = 'node'; // default to node
    try {
        // Try to execute bun --version to check if it's available
        const { execSync } = await import('node:child_process');
        execSync('bun --version', { stdio: 'ignore' });
        runtime = 'bun';
    }
    catch {
        // bun not found, use node
        runtime = 'node';
    }
    // Resolve paths
    const home = process.env.HOME || process.env.USERPROFILE || '';
    const settingsPath = path.join(home, '.claude', 'settings.json');
    const pluginCache = path.join(home, '.claude', 'plugins', 'cache', 'smite', 'statusline', '1.0.0');
    return { os, runtime, home, settingsPath, pluginCache };
}
// ============ File Operations ============
async function backupFile(filePath) {
    const backupPath = `${filePath}.backup`;
    await fs.copyFile(filePath, backupPath);
    return backupPath;
}
async function atomicWrite(filePath, content) {
    const tempPath = `${filePath}.${Date.now()}.tmp`;
    await fs.writeFile(tempPath, content, 'utf-8');
    await fs.rename(tempPath, filePath);
}
function validateJSON(jsonString) {
    try {
        JSON.parse(jsonString);
        return true;
    }
    catch {
        return false;
    }
}
// ============ Settings Configuration ============
async function readSettings(settingsPath) {
    try {
        const content = await fs.readFile(settingsPath, 'utf-8');
        if (!validateJSON(content)) {
            throw new Error('Invalid JSON in settings.json');
        }
        return JSON.parse(content);
    }
    catch (error) {
        if (error instanceof Error && error.code === 'ENOENT') {
            return null; // File doesn't exist
        }
        throw error;
    }
}
async function writeSettings(settingsPath, settings, options) {
    const content = JSON.stringify(settings, null, 2);
    if (options.dryRun) {
        log.dry(`Would write to ${settingsPath}:`);
        console.log(content);
        return;
    }
    await atomicWrite(settingsPath, content);
}
function createStatuslineCommand(platform) {
    // Use simplified statusline script (cross-platform, reliable)
    // Normalize path separators to forward slashes for cross-platform compatibility
    const statuslineScript = path.join(platform.home, '.claude', 'statusline.js').replace(/\\/g, '/');
    const runtime = platform.runtime === 'bun' ? 'bun' : 'node';
    return `${runtime} ${statuslineScript}`;
}
async function configureSettings(settings, platform, options) {
    const currentSettings = settings || {};
    const command = createStatuslineCommand(platform);
    const newSettings = {
        ...currentSettings,
        statusLine: {
            type: 'command',
            command,
            padding: 0,
        },
    };
    if (options.verbose) {
        log.info('Statusline command:');
        console.log(`  ${command}`);
    }
    return newSettings;
}
// ============ Config File Creation ============
async function createDefaultConfig(platform, options) {
    // Get the script directory, handling both file:// and direct paths
    const scriptPath = fileURLToPath(import.meta.url);
    const scriptDir = path.dirname(scriptPath);
    const defaultsPath = path.join(scriptDir, 'statusline', 'data', 'defaults.json');
    const configPath = path.join(platform.home, '.claude', 'statusline.config.json');
    if (options.verbose) {
        log.info(`Script directory: ${scriptDir}`);
        log.info(`Defaults path: ${defaultsPath}`);
    }
    if (options.dryRun) {
        log.dry(`Would create ${configPath} from ${defaultsPath}`);
        return;
    }
    try {
        // Check if defaults.json exists
        if (!existsSync(defaultsPath)) {
            // Try alternative location (when installed)
            const altDefaultsPath = path.join(platform.pluginCache, 'scripts', 'statusline', 'data', 'defaults.json');
            if (existsSync(altDefaultsPath)) {
                const defaults = await fs.readFile(altDefaultsPath, 'utf-8');
                await atomicWrite(configPath, defaults);
                log.success(`Created config file: ${configPath}`);
                return;
            }
            throw new Error(`Defaults file not found at ${defaultsPath} or ${altDefaultsPath}`);
        }
        const defaults = await fs.readFile(defaultsPath, 'utf-8');
        await atomicWrite(configPath, defaults);
        log.success(`Created config file: ${configPath}`);
    }
    catch (error) {
        throw new Error(`Failed to create config file: ${error}`);
    }
}
// ============ Logging ============
async function writeLog(message, logPath) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    try {
        await fs.appendFile(logPath, logMessage, 'utf-8');
    }
    catch {
        // Silently fail if logging fails
    }
}
// ============ Main Installation ============
async function ensureSettingsFileExists(settingsPath, options) {
    if (existsSync(settingsPath)) {
        return;
    }
    if (options.dryRun) {
        log.dry(`Would create ${settingsPath}`);
    }
    else {
        await fs.mkdir(path.dirname(settingsPath), { recursive: true });
        await atomicWrite(settingsPath, JSON.stringify({}, null, 2));
        log.success('Created settings.json');
    }
}
async function performBackup(settingsPath, options) {
    if (!existsSync(settingsPath) || options.dryRun) {
        return;
    }
    log.info('Backing up existing settings...');
    const backupPath = await backupFile(settingsPath);
    log.success(`Backup created: ${backupPath}`);
}
async function performRollback(settingsPath, options) {
    const backupPath = `${settingsPath}.backup`;
    if (!existsSync(backupPath) || options.dryRun) {
        return false;
    }
    try {
        log.warn('Attempting rollback...');
        await fs.copyFile(backupPath, settingsPath);
        log.success('Rollback completed - settings restored from backup');
        return true;
    }
    catch (rollbackError) {
        log.error(`Rollback failed: ${rollbackError}`);
        return false;
    }
}
function getLogPath() {
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    return path.join(homeDir, '.claude', 'logs', 'statusline-install.log');
}
async function installStatuslineScript(platform, options) {
    // When running from dist/install.js, go up to scripts/ directory
    const scriptDir = fileURLToPath(import.meta.url);
    const scriptsDir = path.dirname(path.dirname(scriptDir)); // Go up from dist/ to scripts/
    const sourceScript = path.join(scriptsDir, 'statusline-simple.js');
    const targetScript = path.join(platform.home, '.claude', 'statusline.js');
    if (options.verbose) {
        log.info(`Copying statusline script:`);
        log.info(`  Script dir: ${scriptDir}`);
        log.info(`  Scripts parent: ${scriptsDir}`);
        log.info(`  Source: ${sourceScript}`);
        log.info(`  Target: ${targetScript}`);
    }
    if (options.dryRun) {
        log.dry(`Would copy ${sourceScript} to ${targetScript}`);
        return;
    }
    try {
        // Check if source exists
        if (!existsSync(sourceScript)) {
            throw new Error(`Source script not found: ${sourceScript}`);
        }
        await fs.copyFile(sourceScript, targetScript);
        log.success('Installed statusline script');
    }
    catch (error) {
        throw new Error(`Failed to copy statusline script: ${error}`);
    }
}
async function install(options) {
    const startTime = Date.now();
    const logPath = getLogPath();
    await writeLog('=== Installation started ===', logPath);
    try {
        // Detect platform
        log.info('Detecting platform...');
        const platform = await detectPlatform();
        await writeLog(`Platform: ${platform.os} (${platform.runtime})`, logPath);
        log.success(`Detected ${platform.os} with ${platform.runtime}`);
        log.info(`Home directory: ${platform.home}`);
        log.info(`Settings path: ${platform.settingsPath}`);
        // Install simplified statusline script
        await installStatuslineScript(platform, options);
        // Ensure settings file exists
        await ensureSettingsFileExists(platform.settingsPath, options);
        // Backup existing settings
        await performBackup(platform.settingsPath, options);
        if (existsSync(platform.settingsPath)) {
            const backupPath = `${platform.settingsPath}.backup`;
            await writeLog(`Backup: ${backupPath}`, logPath);
        }
        // Read current settings
        log.info('Reading current settings...');
        const currentSettings = await readSettings(platform.settingsPath);
        await writeLog('Settings read successfully', logPath);
        // Configure new settings
        log.info('Configuring statusline...');
        const newSettings = await configureSettings(currentSettings, platform, options);
        // Write settings
        log.info('Writing settings...');
        await writeSettings(platform.settingsPath, newSettings, options);
        await writeLog('Settings written successfully', logPath);
        if (!options.dryRun) {
            log.success('Settings configured successfully');
        }
        // Create config file
        log.info('Creating default configuration...');
        await createDefaultConfig(platform, options);
        await writeLog('Config file created', logPath);
        // Done
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        if (options.dryRun) {
            log.dry('Dry run complete - no changes made');
        }
        else {
            log.success(`Installation completed in ${duration}s`);
            log.info('');
            log.info('Statusline is now configured!');
            log.info('Restart Claude Code to see the statusline.');
        }
        await writeLog('=== Installation completed successfully ===', logPath);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        await writeLog(`ERROR: ${errorMessage}`, logPath);
        log.error(`Installation failed: ${errorMessage}`);
        // Attempt rollback
        try {
            const platform = await detectPlatform();
            await performRollback(platform.settingsPath, options);
            await writeLog('Rollback completed', logPath);
        }
        catch (rollbackError) {
            const rollbackMessage = rollbackError instanceof Error ? rollbackError.message : String(rollbackError);
            log.error(`Rollback failed: ${rollbackMessage}`);
            await writeLog(`Rollback failed: ${rollbackMessage}`, logPath);
        }
        process.exit(1);
    }
}
// ============ CLI ============
async function main() {
    const args = process.argv.slice(2);
    const options = {
        dryRun: args.includes('--dry-run'),
        verbose: args.includes('--verbose') || args.includes('-v'),
    };
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
Statusline Plugin Auto-Configuration

Usage:
  tsx install.ts [options]

Options:
  --dry-run    Show what would be done without making changes
  --verbose    Show detailed output
  --help       Show this help message

This script automatically configures Claude Code to use the statusline plugin.
It backs up your existing settings.json before making any changes.
`);
        process.exit(0);
    }
    await install(options);
}
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=install.js.map