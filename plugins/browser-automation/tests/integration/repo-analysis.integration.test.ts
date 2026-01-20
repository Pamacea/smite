/**
 * Repository Analysis Integration Tests
 *
 * Tests the complete repository analysis workflow:
 * Get structure → Read key files → Search docs → Summarize insights
 * Uses REAL MCP calls to validate GitHub repository research
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { RepositoryFeature } from '../../dist/features/repository.feature.js';

describe('Repository Analysis Integration', { timeout: 30000 }, () => {
  const repoFeature = new RepositoryFeature();

  it('should analyze a popular GitHub repository end-to-end', async () => {
    const owner = 'vitejs';
    const repo = 'vite';

    // Step 1: Get repository structure
    const structureResult = await repoFeature.getRepoStructure(owner, repo, '/');

    assert.ok(structureResult.success, 'Should get repository structure');
    assert.ok(structureResult.data, 'Structure data should exist');

    const structureText = structureResult.data;
    assert.ok(structureText.length > 0, 'Structure should not be empty');

    console.log('✓ Retrieved repository structure');
    console.log(`  Structure length: ${structureText.length} chars`);

    // Step 2: Read key files (README, package.json, LICENSE)
    const keyFiles = ['/README.md', '/package.json', '/LICENSE'];
    const batchResult = await repoFeature.batchReadFiles(owner, repo, keyFiles, true, 3);

    assert.ok(batchResult.success, 'Should read files in batch');
    assert.ok(batchResult.data.length === 3, 'Should read 3 files');

    const files = batchResult.data;
    const successfulReads = files.filter((f) => f.success);

    console.log(`\n✓ Batch read complete:`);
    console.log(`  Successful: ${successfulReads.length}/${files.length}`);

    // Validate README
    const readme = files.find((f) => f.path === '/README.md');
    if (readme?.success) {
      assert.ok(readme.content.length > 100, 'README should have content');
      console.log(`\n✓ README: ${readme.content.length} chars`);

      // Check for expected sections
      const readmeLower = readme.content.toLowerCase();
      const hasInstallation = readmeLower.includes('install') || readmeLower.includes('getting started');
      const hasUsage = readmeLower.includes('usage') || readmeLower.includes('example');

      console.log(`  Installation guide: ${hasInstallation ? 'Yes' : 'No'}`);
      console.log(`  Usage examples: ${hasUsage ? 'Yes' : 'No'}`);
    }

    // Validate package.json
    const packageJson = files.find((f) => f.path === '/package.json');
    if (packageJson?.success) {
      try {
        const pkg = JSON.parse(packageJson.content);
        assert.ok(pkg.name, 'Should have package name');
        assert.ok(pkg.version, 'Should have version');
        console.log(`\n✓ package.json:`);
        console.log(`  Name: ${pkg.name}`);
        console.log(`  Version: ${pkg.version}`);
        console.log(`  Dependencies: ${Object.keys(pkg.dependencies || {}).length}`);
      } catch (e) {
        console.log(`⚠ Could not parse package.json`);
      }
    }

    // Step 3: Search documentation
    const searchResult = await repoFeature.searchRepoDocs(
      owner,
      repo,
      'How to configure plugins',
      'en'
    );

    if (searchResult.success) {
      console.log(`\n✓ Documentation search successful`);
      console.log(`  Results: ${searchResult.data.length > 0 ? 'Found' : 'No results'}`);
    }

    // Step 4: Get repository insights
    const insightsResult = await repoFeature.getRepositoryInsights(owner, repo);

    if (insightsResult.success) {
      const insights = insightsResult.data;

      console.log(`\n✓ Repository insights:`);
      console.log(`  Repository: ${insights.repoName}`);
      console.log(`  Language: ${insights.language || 'Unknown'}`);
      console.log(`  Key topics: ${insights.keyTopics.length}`);
      console.log(`  Main files: ${insights.mainFiles.length}`);
      console.log(`  Dependencies: ${insights.dependencies?.length || 0}`);

      assert.ok(insights.repoName === `${owner}/${repo}`, 'Repo name should match');
      assert.ok(Array.isArray(insights.keyTopics), 'Should have key topics array');
      assert.ok(Array.isArray(insights.mainFiles), 'Should have main files array');
    }

    // Validate complete workflow
    assert.ok(structureResult.success, 'Structure retrieval should succeed');
    assert.ok(batchResult.success, 'Batch read should succeed');
    assert.ok(successfulReads.length >= 2, 'At least 2 files should be read successfully');
  });

  it('should analyze repository with comprehensive options', async () => {
    const options = {
      owner: 'facebook',
      repo: 'react',
      includeReadme: true,
      includePackageJson: true,
      includeLicense: true,
      searchQuery: 'hooks',
      maxDepth: 2,
    };

    const analysisResult = await repoFeature.analyzeRepo(
      options.owner,
      options.repo,
      options
    );

    assert.ok(analysisResult.success, 'Analysis should succeed');
    const analysis = analysisResult.data;

    console.log('✓ Comprehensive analysis complete:');
    console.log(`  Repository: ${analysis.repoName}`);
    console.log(`  Structure: ${analysis.structure ? 'Yes' : 'No'}`);
    console.log(`  README: ${analysis.readme ? 'Yes (' + analysis.readme.length + ' chars)' : 'No'}`);
    console.log(`  Package.json: ${analysis.packageJson ? 'Yes' : 'No'}`);
    console.log(`  License: ${analysis.license ? 'Yes' : 'No'}`);
    console.log(`  Search results: ${analysis.searchResults?.length || 0}`);

    assert.ok(analysis.repoName === `${options.owner}/${options.repo}`, 'Repo name should match');
    assert.ok(analysis.structure, 'Should have structure');
  });

  it('should compare multiple repositories', async () => {
    const repos = [
      { owner: 'vercel', repo: 'next.js' },
      { owner: 'facebook', repo: 'react' },
    ];

    console.log('Comparing multiple repositories...\n');

    const comparisonResults = await Promise.all(
      repos.map(async ({ owner, repo }) => {
        const insightsResult = await repoFeature.getRepositoryInsights(owner, repo);

        if (insightsResult.success) {
          const insights = insightsResult.data;
          return {
            name: insights.repoName,
            language: insights.language,
            topics: insights.keyTopics,
            dependencies: insights.dependencies?.length || 0,
            mainFiles: insights.mainFiles.length,
          };
        }

        return null;
      })
    );

    const validResults = comparisonResults.filter((r) => r !== null);

    console.log('✓ Repository comparison:');
    validResults.forEach((result: any) => {
      console.log(`\n  ${result.name}:`);
      console.log(`    Language: ${result.language}`);
      console.log(`    Topics: ${result.topics.length}`);
      console.log(`    Dependencies: ${result.dependencies}`);
      console.log(`    Main files: ${result.mainFiles}`);
    });

    assert.ok(validResults.length >= 2, 'Should analyze at least 2 repos');
  });

  it('should analyze TypeScript repository specifically', async () => {
    // Analyze a TypeScript-focused repo
    const owner = 'microsoft';
    const repo = 'TypeScript';

    // Get structure
    const structureResult = await repoFeature.getRepoStructure(owner, repo, '/src');

    assert.ok(structureResult.success, 'Should get structure');

    // Read key TypeScript files
    const tsFiles = [
      '/package.json',
      '/README.md',
      '/tsconfig.json',
    ];

    const batchResult = await repoFeature.batchReadFiles(owner, repo, tsFiles, true, 3);

    assert.ok(batchResult.success, 'Should read TypeScript files');

    const files = batchResult.data;
    const successfulReads = files.filter((f) => f.success);

    console.log(`✓ TypeScript repository analysis:`);
    console.log(`  Successful reads: ${successfulReads.length}/${files.length}`);

    // Validate package.json
    const packageJson = files.find((f) => f.path === '/package.json');
    if (packageJson?.success) {
      try {
        const pkg = JSON.parse(packageJson.content);
        console.log(`  Package: ${pkg.name}`);
        console.log(`  Version: ${pkg.version}`);

        // Should have TypeScript as dependency or devDependency
        const hasTs = Object.keys(pkg.dependencies || {})
          .concat(Object.keys(pkg.devDependencies || {}))
          .some((dep) => dep.toLowerCase().includes('typescript'));

        console.log(`  Has TypeScript: ${hasTs ? 'Yes' : 'No'}`);
      } catch (e) {
        console.log(`  Could not parse package.json`);
      }
    }

    // Search for TypeScript-specific documentation
    const searchResult = await repoFeature.searchRepoDocs(
      owner,
      repo,
      'type system features',
      'en'
    );

    if (searchResult.success) {
      console.log(`  Documentation search: ${searchResult.data.length > 0 ? 'Results found' : 'No results'}`);
    }
  });

  it('should handle repository search with technical queries', async () => {
    const owner = 'nodejs';
    const repo = 'node';

    const technicalQueries = [
      'event loop',
      'streams API',
      'buffer',
    ];

    console.log('Searching technical documentation...\n');

    const searchResults = await Promise.all(
      technicalQueries.map((query) =>
        repoFeature.searchRepoDocs(owner, repo, query, 'en')
      )
    );

    searchResults.forEach((result, i) => {
      const query = technicalQueries[i];
      if (result.success) {
        console.log(`✓ Query "${query}": ${result.data.length} results`);
      } else {
        console.log(`✗ Query "${query}": Failed`);
      }
    });

    // At least some searches should succeed
    const successfulSearches = searchResults.filter((r) => r.success);
    assert.ok(successfulSearches.length > 0, 'At least one search should succeed');
  });

  it('should analyze repository package dependencies', async () => {
    const owner = 'vitejs';
    const repo = 'vite';

    // Read package.json
    const packageResult = await repoFeature.readRepoFile(owner, repo, '/package.json');

    assert.ok(packageResult.success, 'Should read package.json');

    const packageJson = JSON.parse(packageResult.data);

    console.log('✓ Package dependency analysis:');
    console.log(`  Name: ${packageJson.name}`);
    console.log(`  Dependencies: ${Object.keys(packageJson.dependencies || {}).length}`);
    console.log(`  DevDependencies: ${Object.keys(packageJson.devDependencies || {}).length}`);

    // Analyze key dependencies
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    const depCategories = {
      build: ['rollup', 'esbuild', 'vite', 'webpack'],
      testing: ['vitest', 'jest', 'mocha', 'test'],
      typescript: ['typescript', '@types'],
      linting: ['eslint', 'prettier'],
    };

    console.log('\n  Dependency categories:');
    Object.entries(depCategories).forEach(([category, keywords]) => {
      const found = Object.keys(allDeps).filter((dep) =>
        keywords.some((kw) => dep.toLowerCase().includes(kw))
      );

      if (found.length > 0) {
        console.log(`    ${category}: ${found.join(', ')}`);
      }
    });

    assert.ok(Object.keys(allDeps).length > 0, 'Should have dependencies');
  });

  it('should handle error cases gracefully', async () => {
    // Test invalid repo name
    const invalidResult = await repoFeature.getRepoStructure('', 'invalid-repo');

    assert.ok(!invalidResult.success, 'Should fail for invalid repo');
    assert.ok(invalidResult.error, 'Should have error object');

    console.log('✓ Invalid repo name handled correctly');
    console.log(`  Error: ${invalidResult.error?.message.slice(0, 80)}...`);

    // Test non-existent file
    const fileResult = await repoFeature.readRepoFile('vitejs', 'vite', '/nonexistent/file.txt');

    assert.ok(!fileResult.success, 'Should fail for non-existent file');

    console.log('✓ Non-existent file handled correctly');

    // Test invalid batch (empty array)
    const batchResult = await repoFeature.batchReadFiles('vitejs', 'vite', []);

    assert.ok(!batchResult.success, 'Should fail for empty file list');

    console.log('✓ Empty batch handled correctly');
  });

  it('should get repository structure for different directories', async () => {
    const owner = 'facebook';
    const repo = 'react';

    const directories = ['/', '/src', '/packages', '/scripts'];

    console.log('Exploring repository structure...\n');

    const structureResults = await Promise.all(
      directories.map((dir) =>
        repoFeature.getRepoStructure(owner, repo, dir)
      )
    );

    structureResults.forEach((result, i) => {
      const dir = directories[i];
      if (result.success) {
        const lineCount = result.data.split('\n').length;
        console.log(`✓ Directory "${dir}": ${lineCount} lines`);
      } else {
        console.log(`✗ Directory "${dir}": Failed (may not exist)`);
      }
    });

    // At least root directory should succeed
    const rootResult = structureResults[0];
    assert.ok(rootResult.success, 'Root directory should succeed');
  });

  it('should extract insights from multiple programming language repos', async () => {
    const repos = [
      { owner: 'python', repo: 'cpython', language: 'Python' },
      { owner: 'golang', repo: 'go', language: 'Go' },
      { owner: 'rust-lang', repo: 'rust', language: 'Rust' },
    ];

    console.log('Analyzing multi-language repositories...\n');

    const insights = await Promise.all(
      repos.map(async ({ owner, repo, language }) => {
        const result = await repoFeature.getRepositoryInsights(owner, repo);

        if (result.success) {
          return {
            repo: result.data.repoName,
            detectedLanguage: result.data.language,
            topics: result.data.keyTopics,
            dependencies: result.data.dependencies?.length || 0,
          };
        }

        return null;
      })
    );

    const validInsights = insights.filter((i) => i !== null);

    console.log('✓ Multi-language analysis:');
    validInsights.forEach((insight: any) => {
      console.log(`\n  ${insight.repo}:`);
      console.log(`    Language: ${insight.detectedLanguage || 'Unknown'}`);
      console.log(`    Topics: ${insight.topics.slice(0, 3).join(', ')}`);
      console.log(`    Dependencies: ${insight.dependencies}`);
    });

    assert.ok(validInsights.length > 0, 'Should analyze at least one repo');
  });
});

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Running Repository Analysis Integration Tests...\n');
}
