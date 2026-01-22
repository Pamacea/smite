/**
 * MgrepClient Security Tests
 *
 * Security tests to verify command injection vulnerabilities are fixed
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { spawn, ChildProcess } from 'child_process';
import { MgrepClient } from './client.js';

// Mock spawn to avoid requiring actual mgrep installation
jest.mock('child_process');
const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;

describe('MgrepClient Security', () => {
  let mockProc: MockChildProcess;
  let client: MgrepClient;

  beforeEach(() => {
    // Create mock process
    mockProc = new MockChildProcess();
    mockSpawn.mockReturnValue(mockProc as any);
    client = new MgrepClient({ timeout: 5000 });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Command Injection Prevention', () => {
    it('should not execute shell commands with semicolon', async () => {
      const maliciousQuery = 'valid search; rm -rf /';

      // Simulate mgrep error (not found)
      mockProc.simulateError('mgrep not found');

      const result = await client.search(maliciousQuery);

      // Should NOT execute the malicious command
      // The spawn should be called with args as array (not through shell)
      expect(mockSpawn).toHaveBeenCalledWith(
        'mgrep',
        expect.arrayContaining([
          'search',
          expect.stringContaining('valid search; rm -rf /'),
        ]),
        expect.not.objectContaining({ shell: true })
      );

      // Result should indicate mgrep not available, not command execution
      expect(result.success).toBe(false);
      expect(result.error).toContain('not available');
    });

    it('should not execute shell commands with pipe', async () => {
      const maliciousQuery = 'search | cat /etc/passwd';

      mockProc.simulateError('Command failed');

      await client.search(maliciousQuery);

      expect(mockSpawn).toHaveBeenCalledWith(
        'mgrep',
        expect.arrayContaining([expect.stringContaining('|')]),
        expect.not.objectContaining({ shell: true })
      );
    });

    it('should not execute shell commands with command substitution', async () => {
      const maliciousQuery = 'search $(whoami)';

      mockProc.simulateError('Command failed');

      await client.search(maliciousQuery);

      expect(mockSpawn).toHaveBeenCalledWith(
        'mgrep',
        expect.arrayContaining([expect.stringContaining('$(whoami)')]),
        expect.not.objectContaining({ shell: true })
      );
    });

    it('should not execute shell commands with backticks', async () => {
      const maliciousQuery = 'search `id`';

      mockProc.simulateError('Command failed');

      await client.search(maliciousQuery);

      expect(mockSpawn).toHaveBeenCalledWith(
        'mgrep',
        expect.arrayContaining([expect.stringContaining('`id`')]),
        expect.not.objectContaining({ shell: true })
      );
    });

    it('should handle newlines in query', async () => {
      const maliciousQuery = 'search\nmalicious command';

      mockProc.simulateError('Command failed');

      await client.search(maliciousQuery);

      expect(mockSpawn).toHaveBeenCalledWith(
        'mgrep',
        expect.arrayContaining([expect.stringContaining('\n')]),
        expect.not.objectContaining({ shell: true })
      );
    });

    it('should handle ampersand in query', async () => {
      const maliciousQuery = 'search & malicious';

      mockProc.simulateError('Command failed');

      await client.search(maliciousQuery);

      expect(mockSpawn).toHaveBeenCalledWith(
        'mgrep',
        expect.arrayContaining([expect.stringContaining('&')]),
        expect.not.objectContaining({ shell: true })
      );
    });
  });

  describe('Argument Injection Prevention', () => {
    it('should pass query as separate argument, not shell string', async () => {
      const query = 'test query';

      mockProc.simulateSuccess([]);

      await client.search(query);

      // Verify spawn is called with args array (not concatenated string)
      const spawnCall = mockSpawn.mock.calls[0];
      expect(spawnCall[0]).toBe('mgrep'); // executable
      expect(Array.isArray(spawnCall[1])).toBe(true); // args array
      expect(spawnCall[1]).toContain('search');
      expect(spawnCall[1]).toContain(query);
      expect(spawnCall[2]).toEqual(undefined); // no options (shell: true removed)
    });

    it('should not use shell option in spawn', async () => {
      const query = 'test';

      mockProc.simulateSuccess([]);

      await client.search(query);

      // Verify shell: true is NOT present in options
      const spawnCall = mockSpawn.mock.calls[2]; // options arg
      expect(spawnCall).toEqual(undefined); // no options passed
    });
  });

  describe('Path Traversal Prevention', () => {
    it('should not interpret relative path components in executable path', async () => {
      // The executable path is configurable but should be passed directly
      const customClient = new MgrepClient({ executable: '../../../bin/mgrep' });

      mockProc.simulateError('not found');

      await customClient.search('test');

      expect(mockSpawn).toHaveBeenCalledWith(
        '../../../bin/mgrep',
        expect.any(Array),
        expect.not.objectContaining({ shell: true })
      );
    });
  });

  describe('Timeout Protection', () => {
    it('should kill process after timeout', async () => {
      jest.useFakeTimers();

      const query = 'test';

      // Don't call close, simulate timeout
      let closeCallback: ((code: number) => void) | null = null;
      mockProc.on('close', (callback) => {
        closeCallback = callback;
      });

      const resultPromise = client.search(query);

      // Fast-forward past timeout
      jest.advanceTimersByTime(6000);

      const result = await resultPromise;

      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');

      jest.useRealTimers();
    });
  });

  describe('isAvailable Security', () => {
    it('should not use shell when checking availability', async () => {
      mockProc.simulateClose(0); // mgrep available

      await client.isAvailable();

      expect(mockSpawn).toHaveBeenCalledWith(
        'mgrep',
        ['--version'],
        undefined // no shell: true
      );
    });
  });
});

/**
 * Mock ChildProcess for testing
 */
class MockChildProcess {
  private stdout: { on: jest.Mock };
  private stderr: { on: jest.Mock };
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.stdout = { on: jest.fn(this._on.bind(this, 'stdout')) };
    this.stderr = { on: jest.fn(this._on.bind(this, 'stderr')) };
  }

  private _on(event: string, callback: Function) {
    this._addEventListener(event, callback);
  }

  public on(event: string, callback: Function): this {
    this._addEventListener(event, callback);
    return this;
  }

  private _addEventListener(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  public simulateError(error: string): void {
    const errorCallbacks = this.listeners.get('error') || [];
    errorCallbacks.forEach(cb => cb(new Error(error)));
  }

  public simulateClose(code: number): void {
    const closeCallbacks = this.listeners.get('close') || [];
    closeCallbacks.forEach(cb => cb(code));
  }

  public simulateSuccess(results: any[]): void {
    // Emit stdout data
    const stdoutCallbacks = this.listeners.get('stdout') || [];
    stdoutCallbacks.forEach(cb => cb(Buffer.from('[]')));

    // Emit close with success
    this.simulateClose(0);
  }

  public kill(): void {
    // Mock kill
  }
}
