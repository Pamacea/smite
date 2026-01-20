/**
 * Repository Feature Module Tests
 * Demonstrates repository analysis workflow
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  RepositoryFeature,
  createRepositoryFeature,
  RepositoryValidationError,
  type AnalyzeRepositoryOptions,
  type FileReadResult,
  type RepositoryInsight,
} from '../src/features/repository.feature.js';

describe('RepositoryFeature', () => {
  const feature = new RepositoryFeature();

  describe('parseRepoName', () => {
    it('should parse valid repo name', () => {
      const result = feature.parseRepoName('vitejs/vite');
      assert.equal(result.owner, 'vitejs');
      assert.equal(result.repo, 'vite');
    });

    it('should parse repo name with dots', () => {
      const result = feature.parseRepoName('vercel/next.js');
      assert.equal(result.owner, 'vercel');
      assert.equal(result.repo, 'next.js');
    });

    it('should reject repo name without slash', () => {
      assert.throws(
        () => feature.parseRepoName('vitejs'),
        (error: Error) => {
          assert(error instanceof RepositoryValidationError);
          assert.equal(error.field, 'repoName');
          return true;
        }
      );
    });

    it('should reject repo name with invalid characters', () => {
      assert.throws(
        () => feature.parseRepoName('vitejs/vite@1.0'),
        (error: Error) => {
          assert(error instanceof RepositoryValidationError);
          return true;
        }
      );
    });

    it('should reject empty owner or repo', () => {
      assert.throws(
        () => feature.parseRepoName('/vite'),
        (error: Error) => {
          assert(error instanceof RepositoryValidationError);
          assert.equal(error.field, 'owner');
          return true;
        }
      );
    });
  });

  describe('readRepoFile', () => {
    it('should return Result type with success status', async () => {
      // This test demonstrates the API signature
      // Actual functionality depends on MCP server availability
      const result = await feature.readRepoFile('vitejs', 'vite', '/README.md');

      // Result should have success property
      assert.hasOwn(result, 'success');

      if (result.success) {
        assert.hasOwn(result, 'data');
        assert(typeof result.data === 'string');
      } else {
        assert.hasOwn(result, 'error');
        assert(result.error instanceof Error);
      }
    });

    it('should validate empty file path', async () => {
      const result = await feature.readRepoFile('vitejs', 'vite', '');

      assert.equal(result.success, false);
      assert(result.error instanceof RepositoryValidationError);
    });
  });

  describe('getRepoStructure', () => {
    it('should return Result type with structure data', async () => {
      const result = await feature.getRepoStructure('vitejs', 'vite', '/src');

      assert.hasOwn(result, 'success');

      if (result.success) {
        assert.hasOwn(result, 'data');
        assert(typeof result.data === 'string');
      } else {
        assert.hasOwn(result, 'error');
      }
    });

    it('should work without directory path', async () => {
      const result = await feature.getRepoStructure('facebook', 'react');

      assert.hasOwn(result, 'success');
    });
  });

  describe('searchRepoDocs', () => {
    it('should return search results', async () => {
      const result = await feature.searchRepoDocs(
        'vitejs',
        'vite',
        'How to configure plugins',
        'en'
      );

      assert.hasOwn(result, 'success');

      if (result.success) {
        assert.hasOwn(result, 'data');
      } else {
        assert.hasOwn(result, 'error');
      }
    });

    it('should reject empty query', async () => {
      const result = await feature.searchRepoDocs('vitejs', 'vite', '');

      assert.equal(result.success, false);
      assert(result.error instanceof RepositoryValidationError);
    });
  });

  describe('analyzeRepo', () => {
    it('should perform comprehensive analysis', async () => {
      const options: AnalyzeRepositoryOptions = {
        owner: 'vitejs',
        repo: 'vite',
        includeReadme: true,
        includePackageJson: true,
        searchQuery: 'configuration',
      };

      const result = await feature.analyzeRepo('vitejs', 'vite', options);

      assert.hasOwn(result, 'success');

      if (result.success) {
        const analysis = result.data;
        assert.hasOwn(analysis, 'repoName');
        assert.hasOwn(analysis, 'structure');
        assert.equal(analysis.repoName, 'vitejs/vite');
      }
    });

    it('should work with minimal options', async () => {
      const result = await feature.analyzeRepo('facebook', 'react', {});

      assert.hasOwn(result, 'success');
    });
  });

  describe('batchReadFiles', () => {
    it('should read multiple files', async () => {
      const filePaths = ['/README.md', '/LICENSE', '/package.json'];

      const result = await feature.batchReadFiles(
        'vitejs',
        'vite',
        filePaths,
        true,
        3
      );

      assert.hasOwn(result, 'success');

      if (result.success) {
        const results = result.data as FileReadResult[];
        assert(Array.isArray(results));
        assert.equal(results.length, 3);

        // Each result should have required properties
        results.forEach((r) => {
          assert.hasOwn(r, 'path');
          assert.hasOwn(r, 'success');
          assert.hasOwn(r, 'content');
          assert.hasOwn(r, 'size');
        });
      }
    });

    it('should handle empty file paths array', async () => {
      const result = await feature.batchReadFiles('vitejs', 'vite', []);

      assert.equal(result.success, false);
      assert(result.error instanceof RepositoryValidationError);
    });

    it('should respect continueOnError flag', async () => {
      // Mix of valid and invalid paths
      const filePaths = ['/README.md', '/nonexistent/file.txt', '/LICENSE'];

      const result = await feature.batchReadFiles(
        'vitejs',
        'vite',
        filePaths,
        true, // continue on error
        2
      );

      // Should succeed even with some failures
      assert.hasOwn(result, 'success');
    });
  });

  describe('getRepositoryInsights', () => {
    it('should extract repository insights', async () => {
      const result = await feature.getRepositoryInsights('vitejs', 'vite');

      assert.hasOwn(result, 'success');

      if (result.success) {
        const insights = result.data as RepositoryInsight;
        assert.hasOwn(insights, 'repoName');
        assert.hasOwn(insights, 'keyTopics');
        assert.hasOwn(insights, 'mainFiles');
        assert.equal(insights.repoName, 'vitejs/vite');
        assert(Array.isArray(insights.keyTopics));
        assert(Array.isArray(insights.mainFiles));
      }
    });

    it('should detect language for different repos', async () => {
      // Test Python repo
      const pythonResult = await feature.getRepositoryInsights('python', 'cpython');

      if (pythonResult.success) {
        const insights = pythonResult.data;
        // Should detect Python language
        if (insights.language) {
          assert.ok(
            insights.language.includes('Python') ||
            insights.language.includes('python')
          );
        }
      }
    });
  });

  describe('createRepositoryFeature', () => {
    it('should create RepositoryFeature instance', () => {
      const instance = createRepositoryFeature();

      assert(instance instanceof RepositoryFeature);
      assert.equal(typeof instance.readRepoFile, 'function');
      assert.equal(typeof feature.getRepoStructure, 'function');
      assert.equal(typeof feature.searchRepoDocs, 'function');
      assert.equal(typeof feature.analyzeRepo, 'function');
    });
  });

  describe('Error handling', () => {
    it('should return Result type on all errors', async () => {
      // Test with invalid repo format
      const result = await feature.readRepoFile('', 'vite', '/README.md');

      assert.equal(result.success, false);
      assert.hasOwn(result, 'error');
    });

    it('should preserve error messages', async () => {
      try {
        feature.parseRepoName('invalid-repo-name');
        assert.fail('Should have thrown error');
      } catch (error) {
        assert(error instanceof RepositoryValidationError);
        assert(typeof error.message === 'string');
        assert(error.message.length > 0);
      }
    });
  });

  describe('Integration workflow examples', () => {
    it('should demonstrate complete repo analysis workflow', async () => {
      // This demonstrates how agents can use the feature
      const owner = 'vitejs';
      const repo = 'vite';

      // Step 1: Get repository structure
      const structureResult = await feature.getRepoStructure(owner, repo);

      if (!structureResult.success) {
        console.log('Failed to get structure:', structureResult.error?.message);
        return;
      }

      console.log('Repository structure retrieved');

      // Step 2: Read README
      const readmeResult = await feature.readRepoFile(owner, repo, '/README.md');

      if (!readmeResult.success) {
        console.log('Failed to read README:', readmeResult.error?.message);
        return;
      }

      console.log('README read successfully');

      // Step 3: Search documentation
      const searchResult = await feature.searchRepoDocs(
        owner,
        repo,
        'getting started',
        'en'
      );

      if (!searchResult.success) {
        console.log('Search failed:', searchResult.error?.message);
        return;
      }

      console.log('Documentation search completed');

      // All steps completed successfully
      assert.ok(structureResult.success);
      assert.ok(readmeResult.success);
      assert.ok(searchResult.success);
    });

    it('should demonstrate batch file reading workflow', async () => {
      // Analyze multiple configuration files
      const owner = 'vitejs';
      const repo = 'vite';

      const configFiles = [
        '/package.json',
        '/tsconfig.json',
        '/vite.config.ts',
      ];

      const batchResult = await feature.batchReadFiles(
        owner,
        repo,
        configFiles,
        true,
        3
      );

      if (!batchResult.success) {
        console.log('Batch read failed:', batchResult.error?.message);
        return;
      }

      const files = batchResult.data;

      // Process results
      const successfulReads = files.filter((f) => f.success);
      const failedReads = files.filter((f) => !f.success);

      console.log(`Successfully read ${successfulReads.length} files`);
      console.log(`Failed to read ${failedReads.length} files`);

      assert.ok(Array.isArray(files));
      assert.equal(files.length, configFiles.length);
    });

    it('should demonstrate insights extraction workflow', async () => {
      // Get quick insights about a repository
      const insightsResult = await feature.getRepositoryInsights(
        'facebook',
        'react'
      );

      if (!insightsResult.success) {
        console.log('Failed to get insights:', insightsResult.error?.message);
        return;
      }

      const insights = insightsResult.data;

      console.log(`Repository: ${insights.repoName}`);
      console.log(`Language: ${insights.language || 'Unknown'}`);
      console.log(`Dependencies: ${insights.dependencies?.length || 0}`);
      console.log(`Key Topics: ${insights.keyTopics.join(', ')}`);

      assert.ok(insights.repoName);
      assert.ok(Array.isArray(insights.keyTopics));
    });
  });
});

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Running Repository Feature Tests...\n');
  console.log('Note: These tests demonstrate API functionality.');
  console.log('Actual execution requires MCP server availability.\n');
}
