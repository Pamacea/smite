// SMITE Ralph - Structured Logging Framework
// Simple, lightweight logging with levels and formatting

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

/**
 * Log entry structure
 */
export interface LogEntry {
  level: LogLevel;
  levelName: string;
  timestamp: string;
  message: string;
  context?: Record<string, any>;
  error?: Error;
}

/**
 * Structured logger with levels and formatting
 */
export class Logger {
  private static currentLevel: LogLevel = LogLevel.INFO;
  private static logs: LogEntry[] = [];
  private static readonly MAX_LOGS = 1000; // Prevent memory leaks

  /**
   * Set the minimum log level
   */
  static setLevel(level: LogLevel): void {
    Logger.currentLevel = level;
  }

  /**
   * Get current log level
   */
  static getLevel(): LogLevel {
    return Logger.currentLevel;
  }

  /**
   * Log a debug message
   */
  static debug(message: string, context?: Record<string, any>): void {
    Logger.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log an info message
   */
  static info(message: string, context?: Record<string, any>): void {
    Logger.log(LogLevel.INFO, message, context);
  }

  /**
   * Log a warning message
   */
  static warn(message: string, context?: Record<string, any>): void {
    Logger.log(LogLevel.WARN, message, context);
  }

  /**
   * Log an error message
   */
  static error(message: string, error?: Error, context?: Record<string, any>): void {
    Logger.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Core logging method
   */
  private static log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): void {
    if (level < Logger.currentLevel) {
      return;
    }

    const entry: LogEntry = {
      level,
      levelName: LogLevel[level],
      timestamp: new Date().toISOString(),
      message,
      context,
      error,
    };

    // Store log entry
    Logger.logs.push(entry);
    if (Logger.logs.length > Logger.MAX_LOGS) {
      Logger.logs.shift(); // Remove oldest log
    }

    // Format and output
    const formatted = Logger.formatEntry(entry);
    console.log(formatted);
  }

  /**
   * Format a log entry for output
   */
  private static formatEntry(entry: LogEntry): string {
    const parts = [
      `[${entry.timestamp}]`,
      `[${entry.levelName}]`,
      entry.message,
    ];

    if (entry.context) {
      const contextStr = Object.entries(entry.context)
        .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
        .join(" ");
      parts.push(`(${contextStr})`);
    }

    if (entry.error) {
      parts.push(`\n${entry.error.stack || entry.error.message}`);
    }

    return parts.join(" ");
  }

  /**
   * Get all log entries
   */
  static getLogs(): LogEntry[] {
    return [...Logger.logs];
  }

  /**
   * Clear all logs
   */
  static clearLogs(): void {
    Logger.logs = [];
  }

  /**
   * Get logs filtered by level
   */
  static getLogsByLevel(level: LogLevel): LogEntry[] {
    return Logger.logs.filter((log) => log.level === level);
  }

  /**
   * Export logs as JSON string
   */
  static exportLogs(): string {
    return JSON.stringify(Logger.logs, null, 2);
  }

  /**
   * Create a child logger with additional context
   */
  static createChild(defaultContext: Record<string, any>): ChildLogger {
    return new ChildLogger(defaultContext);
  }
}

/**
 * Child logger with preset context
 */
export class ChildLogger {
  constructor(private defaultContext: Record<string, any>) {}

  debug(message: string, context?: Record<string, any>): void {
    Logger.debug(message, { ...this.defaultContext, ...context });
  }

  info(message: string, context?: Record<string, any>): void {
    Logger.info(message, { ...this.defaultContext, ...context });
  }

  warn(message: string, context?: Record<string, any>): void {
    Logger.warn(message, { ...this.defaultContext, ...context });
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    Logger.error(message, error, { ...this.defaultContext, ...context });
  }
}
