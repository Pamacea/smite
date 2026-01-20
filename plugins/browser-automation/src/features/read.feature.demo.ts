/**
 * Read Feature Module - Usage Demonstration
 *
 * This file demonstrates how to use the read feature module.
 * Run with: npx tsx src/features/read.feature.demo.ts
 */

import {
  ReadFeature,
  readWebPage,
  batchRead,
  extractStructuredData,
  type ExtractionSchema,
} from './read.feature.js';

async function demoBasicRead() {
  console.log('\n=== Demo 1: Basic Web Page Reading ===\n');

  const feature = new ReadFeature();
  const result = await feature.readWebPage('https://example.com', {
    returnFormat: 'markdown',
    retainImages: false,
  });

  if (result.success) {
    console.log('✅ Successfully read example.com');
    console.log(`Content length: ${result.data.length} characters`);
    console.log(`Preview: ${result.data.slice(0, 200)}...`);
  } else {
    console.error('❌ Failed to read:', result.error.message);
  }
}

async function demoReadWithMetadata() {
  console.log('\n=== Demo 2: Reading with Metadata ===\n');

  const feature = new ReadFeature();
  const result = await feature.readWebPageWithMetadata('https://example.com', {
    includeMetadata: true,
  });

  if (result.success) {
    console.log('✅ Successfully read with metadata');
    console.log(`Content: ${result.data.content.length} chars`);
    console.log(`Images found: ${result.data.images?.length || 0}`);
    console.log(`Links found: ${result.data.links?.length || 0}`);

    if (result.data.images && result.data.images.length > 0) {
      console.log('\nSample images:');
      result.data.images.slice(0, 3).forEach(img => console.log(`  - ${img}`));
    }

    if (result.data.links && result.data.links.length > 0) {
      console.log('\nSample links:');
      result.data.links.slice(0, 3).forEach(link => console.log(`  - ${link}`));
    }
  }
}

async function demoBatchRead() {
  console.log('\n=== Demo 3: Batch Reading ===\n');

  const feature = new ReadFeature();
  const urls = [
    'https://example.com',
    'https://example.org',
    'https://example.net',
  ];

  const results = await feature.batchRead(urls, {
    returnFormat: 'markdown',
    retainImages: false,
  });

  console.log(`✅ Batch complete`);
  console.log(`  Successful: ${results.contents.size}/${urls.length}`);
  console.log(`  Failed: ${results.errors.size}/${urls.length}`);
  console.log(`  Success rate: ${(results.successRate * 100).toFixed(1)}%`);
  console.log(`  Total time: ${results.totalTime}ms`);

  for (const [url, content] of results.contents) {
    console.log(`\n  ✅ ${url}`);
    console.log(`     Length: ${content.length} chars`);
  }

  for (const [url, error] of results.errors) {
    console.log(`\n  ❌ ${url}`);
    console.log(`     Error: ${error.message}`);
  }
}

async function demoStructuredExtraction() {
  console.log('\n=== Demo 4: Structured Data Extraction ===\n');

  const feature = new ReadFeature();
  const schema: ExtractionSchema = {
    fields: {
      title: {
        pattern: /^#\s+(.*)$/m,
      },
      headings: {
        pattern: /^#{1,6}\s+(.*)$/gm,
        multiple: true,
      },
      links: {
        pattern: /\[.*?\]\((.*?)\)/g,
        multiple: true,
      },
    },
  };

  const result = await feature.extractStructuredData(
    'https://example.com',
    schema
  );

  if (result.success) {
    console.log('✅ Successfully extracted structured data');
    console.log(`  Title: ${result.data.title || 'N/A'}`);
    console.log(`  Headings: ${Array.isArray(result.data.headings) ? result.data.headings.length : 0}`);
    console.log(`  Links: ${Array.isArray(result.data.links) ? result.data.links.length : 0}`);

    if (Array.isArray(result.data.headings) && result.data.headings.length > 0) {
      console.log('\n  Sample headings:');
      result.data.headings.slice(0, 3).forEach(h => console.log(`    - ${h}`));
    }
  }
}

async function demoContentSummary() {
  console.log('\n=== Demo 5: Content Summarization ===\n');

  const feature = new ReadFeature();
  const result = await feature.readWebPage('https://example.com');

  if (result.success) {
    const summary = feature.summarizeContent(result.data);
    console.log('✅ Content summary:');
    console.log(`  Title: ${summary.title || 'N/A'}`);
    console.log(`  Total headings: ${summary.headings.length}`);
    console.log(`  Word count: ${summary.wordCount}`);
    console.log(`  Image count: ${summary.imageCount}`);
    console.log(`  Link count: ${summary.linkCount}`);

    if (summary.headings.length > 0) {
      console.log('\n  Headings found:');
      summary.headings.slice(0, 5).forEach(h => console.log(`    - ${h}`));
    }
  }
}

async function demoConvenienceFunctions() {
  console.log('\n=== Demo 6: Convenience Functions ===\n');

  // Using convenience function instead of class
  const result = await readWebPage('https://example.com', {
    returnFormat: 'markdown',
  });

  if (result.success) {
    console.log('✅ Convenience function worked!');
    console.log(`  Read ${result.data.length} characters`);
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     Read Feature Module - Usage Demonstration             ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    await demoBasicRead();
    await demoReadWithMetadata();
    await demoBatchRead();
    await demoStructuredExtraction();
    await demoContentSummary();
    await demoConvenienceFunctions();

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║     All demos completed!                                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
  } catch (error) {
    console.error('\n❌ Demo failed:', error);
    process.exit(1);
  }
}

// Run demos if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
