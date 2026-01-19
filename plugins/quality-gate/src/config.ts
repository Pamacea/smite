/**
 * Configuration Management
 * Load and validate judge configuration from .claude/.smite/quality.json
 * Uses JSON Schema validation with AJV and supports environment variable overrides
 */

import * as fs from 'fs';
import * as path from 'path';
import Ajv from 'ajv';
import { JudgeConfig, DEFAULT_CONFIG, ConfigOverrideItem, ComplexityThresholds, TestConfig } from './types';
import { JudgeLogger } from './logger';

// JSON Schema path
const SCHEMA_PATH = path.join(__dirname, '..', 'config-schema.json');

// Environment variable prefix
const ENV_PREFIX = 'SMITE_QUALITY_';

export interface ConfigValidationResult {
  valid: boolean;
  errors: Array<{
    path: string;
    message: string;
    keyword: string;
    params?: Record<string, unknown>;
  }>;
}

export class ConfigManager {
  private configPath: string;
  private config: JudgeConfig;
  private overrides: ConfigOverride[];
  private logger: JudgeLogger;
  private ajv; // eslint-disable-line @typescript-eslint/no-explicit-any

  constructor(cwd: string, logger?: JudgeLogger) {
    this.configPath = path.join(cwd, '.smite', 'quality.json');
    this.logger = logger || new JudgeLogger(cwd, 'info');
    this.ajv = new Ajv({ allErrors: true, verbose: true });
    this.overrides = [];
    this.config = this.loadConfig();
  }

  /**
   * Load configuration from file, validate with JSON Schema, merge defaults and env vars
   *
   * Priority order (highest to lowest):
   * 1. Environment variables (SMITE_QUALITY_*)
   * 2. User config file (.claude/.smite/quality.json)
   * 3. Default configuration
   */
  private loadConfig(): JudgeConfig {
    let userConfig: Partial<JudgeConfig> = {};
    let validationErrors: ConfigValidationResult['errors'] = [];

    try {
      if (fs.existsSync(this.configPath)) {
        const fileContent = fs.readFileSync(this.configPath, 'utf-8');
        userConfig = JSON.parse(fileContent);

        // Validate against JSON Schema
        const validationResult = this.validateConfig(userConfig);
        if (!validationResult.valid) {
          validationErrors = validationResult.errors;
          this.logger.log('error', 'Config', 'Configuration validation failed:');
          validationErrors.forEach(err => {
            this.logger.log('error', 'Config', `  - ${err.path}: ${err.message}`);
          });
          throw new Error('Configuration validation failed');
        }

        // Load overrides if present
        if (userConfig.overrides && Array.isArray(userConfig.overrides)) {
          this.overrides = userConfig.overrides.map(o => ({
            pattern: o.files,
            config: o,
          }));
        }
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        this.logger.log('error', 'Config', `Invalid JSON in ${this.configPath}: ${error.message}`);
      } else {
        this.logger.log('error', 'Config', `Error loading config from ${this.configPath}:`, error);
      }
      this.logger.log('error', 'Config', 'Using default configuration');
    }

    // Merge: defaults -> user config -> environment variables
    const merged = this.mergeConfigs(DEFAULT_CONFIG, userConfig);
    const withEnvOverrides = this.applyEnvironmentOverrides(merged);

    return withEnvOverrides;
  }

  /**
   * Validate configuration object against JSON Schema
   */
  private validateConfig(config: Partial<JudgeConfig>): ConfigValidationResult {
    try {
      const schemaContent = fs.readFileSync(SCHEMA_PATH, 'utf-8');
      const schema = JSON.parse(schemaContent);
      const validate = this.ajv.compile(schema);
      const valid = validate(config);

      if (valid || !validate.errors) {
        return { valid: true, errors: [] };
      }

      const errors = validate.errors.map((err) => ({
        path: (err as { instancePath?: string }).instancePath || '(root)',
        message: err.message || 'Validation error',
        keyword: err.keyword,
        params: err.params as Record<string, unknown> | undefined,
      }));

      return { valid: false, errors };
    } catch (error) {
      this.logger.log('error', 'Config', 'Failed to load JSON Schema:', error);
      // If schema validation fails, allow config but log error
      return { valid: true, errors: [] };
    }
  }

  /**
   * Apply environment variable overrides to configuration
   * Supports environment variables in the format SMITE_QUALITY_<PATH>
   * Examples:
   *   SMITE_QUALITY_ENABLED=false
   *   SMITE_QUALITY_COMPLEXITY_MAX_CYCLOMATIC_COMPLEXITY=15
   *   SMITE_QUALITY_LOG_LEVEL=debug
   */
  private applyEnvironmentOverrides(config: JudgeConfig): JudgeConfig {
    const result = { ...config };

    this.applyGeneralOverrides(result);
    this.applyComplexityOverrides(result);
    this.applyTestOverrides(result);
    this.applyMcpOverrides(result);
    this.applyOutputOverrides(result);

    return result;
  }

  /**
   * Apply general configuration overrides
   */
  private applyGeneralOverrides(config: JudgeConfig): void {
    this.applyEnabledOverride(config);
    this.applyLogLevelOverride(config);
    this.applyMaxRetriesOverride(config);
  }

  /**
   * Apply enabled flag override
   */
  private applyEnabledOverride(config: JudgeConfig): void {
    if (process.env[`${ENV_PREFIX}ENABLED`] !== undefined) {
      config.enabled = process.env[`${ENV_PREFIX}ENABLED`] === 'true';
    }
  }

  /**
   * Apply log level override
   */
  private applyLogLevelOverride(config: JudgeConfig): void {
    const logLevel = process.env[`${ENV_PREFIX}LOG_LEVEL`];
    if (logLevel && ['debug', 'info', 'warn', 'error'].includes(logLevel)) {
      config.logLevel = logLevel as 'debug' | 'info' | 'warn' | 'error';
    }
  }

  /**
   * Apply max retries override
   */
  private applyMaxRetriesOverride(config: JudgeConfig): void {
    const maxRetriesStr = process.env[`${ENV_PREFIX}MAX_RETRIES`];
    if (maxRetriesStr) {
      const maxRetries = parseInt(maxRetriesStr, 10);
      if (!isNaN(maxRetries)) {
        config.maxRetries = maxRetries;
      }
    }
  }

  /**
   * Apply complexity threshold overrides
   */
  private applyComplexityOverrides(config: JudgeConfig): void {
    const cyclomatic = process.env[`${ENV_PREFIX}COMPLEXITY_MAX_CYCLOMATIC_COMPLEXITY`];
    if (cyclomatic) {
      const value = parseInt(cyclomatic, 10);
      if (!isNaN(value)) {
        config.complexity.maxCyclomaticComplexity = value;
      }
    }

    const cognitive = process.env[`${ENV_PREFIX}COMPLEXITY_MAX_COGNITIVE_COMPLEXITY`];
    if (cognitive) {
      const value = parseInt(cognitive, 10);
      if (!isNaN(value)) {
        config.complexity.maxCognitiveComplexity = value;
      }
    }
  }

  /**
   * Apply test configuration overrides
   */
  private applyTestOverrides(config: JudgeConfig): void {
    if (process.env[`${ENV_PREFIX}TESTS_ENABLED`] !== undefined) {
      config.tests.enabled = process.env[`${ENV_PREFIX}TESTS_ENABLED`] === 'true';
    }

    if (process.env[`${ENV_PREFIX}TESTS_COMMAND`]) {
      config.tests.command = process.env[`${ENV_PREFIX}TESTS_COMMAND`];
    }

    if (process.env[`${ENV_PREFIX}TESTS_TIMEOUT_MS`]) {
      const timeoutStr = process.env[`${ENV_PREFIX}TESTS_TIMEOUT_MS`];
      if (timeoutStr) {
        const timeout = parseInt(timeoutStr, 10);
        if (!isNaN(timeout)) {
          config.tests.timeoutMs = timeout;
        }
      }
    }
  }

  /**
   * Apply MCP configuration overrides
   */
  private applyMcpOverrides(config: JudgeConfig): void {
    if (process.env[`${ENV_PREFIX}MCP_ENABLED`] !== undefined) {
      config.mcp.enabled = process.env[`${ENV_PREFIX}MCP_ENABLED`] === 'true';
    }

    if (process.env[`${ENV_PREFIX}MCP_SERVER_PATH`]) {
      config.mcp.serverPath = process.env[`${ENV_PREFIX}MCP_SERVER_PATH`] || '';
    }
  }

  /**
   * Apply output format overrides
   */
  private applyOutputOverrides(config: JudgeConfig): void {
    if (process.env[`${ENV_PREFIX}OUTPUT_FORMAT`]) {
      const format = process.env[`${ENV_PREFIX}OUTPUT_FORMAT`];
      if (format && ['json', 'text'].includes(format)) {
        config.output.format = format as 'json' | 'text';
      }
    }
  }

  /**
   * Merge user config with defaults (user config takes precedence)
   */
  private mergeConfigs(defaults: JudgeConfig, user: Partial<JudgeConfig>): JudgeConfig {
    return {
      ...defaults,
      ...user,
      complexity: { ...defaults.complexity, ...user.complexity },
      semantics: {
        ...defaults.semantics,
        ...user.semantics,
        checks: user.semantics?.checks || defaults.semantics.checks,
      },
      security: {
        ...defaults.security,
        rules: user.security?.rules || defaults.security.rules,
      },
      tests: {
        ...defaults.tests,
        ...user.tests,
      },
      mcp: {
        ...defaults.mcp,
        ...user.mcp,
        triggers: {
          ...defaults.mcp.triggers,
          ...user.mcp?.triggers,
          openAPI: {
            ...defaults.mcp.triggers.openAPI,
            ...user.mcp?.triggers?.openAPI,
          },
          readme: {
            ...defaults.mcp.triggers.readme,
            ...user.mcp?.triggers?.readme,
          },
          jsdoc: {
            ...defaults.mcp.triggers.jsdoc,
            ...user.mcp?.triggers?.jsdoc,
          },
        },
      },
      output: { ...defaults.output, ...user.output },
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): JudgeConfig {
    return this.config;
  }

  /**
   * Get configuration for a specific file, applying overrides if applicable
   * Returns the most specific configuration (file override > directory override > default)
   */
  getConfigForFile(filePath: string): JudgeConfig {
    const normalizedPath = filePath.replace(/\\/g, '/');

    // Find matching overrides (last match wins as it's more specific)
    let matchedOverride: ConfigOverride | undefined;
    for (const override of this.overrides) {
      if (this.matchPattern(normalizedPath, override.pattern)) {
        matchedOverride = override;
      }
    }

    if (!matchedOverride) {
      return this.config;
    }

    // Apply override to base config
    return this.mergeConfigs(this.config, this.overrideToPartial(matchedOverride.config));
  }

  /**
   * Convert ConfigOverrideItem to Partial<JudgeConfig>
   */
  private overrideToPartial(override: ConfigOverrideItem): Partial<JudgeConfig> {
    const partial: Partial<JudgeConfig> = {};

    if (override.complexity) {
      partial.complexity = override.complexity as ComplexityThresholds;
    }

    if (override.security) {
      partial.security = override.security as JudgeConfig['security'];
    }

    if (override.semantics) {
      partial.semantics = override.semantics as JudgeConfig['semantics'];
    }

    if (override.tests) {
      partial.tests = override.tests as TestConfig;
    }

    return partial;
  }

  /**
   * Check if a file should be validated based on include/exclude patterns
   */
  shouldValidateFile(filePath: string): boolean {
    const normalizedPath = filePath.replace(/\\/g, '/');

    // Check exclude patterns first
    for (const pattern of this.config.exclude) {
      if (this.matchPattern(normalizedPath, pattern)) {
        return false;
      }
    }

    // Check include patterns
    for (const pattern of this.config.include) {
      if (this.matchPattern(normalizedPath, pattern)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Simple glob pattern matching (supports * and ** wildcards)
   */
  private matchPattern(filePath: string, pattern: string): boolean {
    const regexPattern = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '.');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(filePath);
  }

  /**
   * Reload configuration from file (useful for long-running processes)
   */
  reloadConfig(): void {
    this.config = this.loadConfig();
    this.logger.log('info', 'Config', 'Configuration reloaded');
  }
}

/**
 * Configuration override for specific files or directories
 */
interface ConfigOverride {
  pattern: string;
  config: ConfigOverrideItem;
}
