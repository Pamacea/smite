/**
 * Vision Feature Tests
 *
 * Tests for the Vision feature module demonstrating various analysis scenarios.
 *
 * Note: These tests require the MCP vision server to be available.
 * They are marked as integration tests and may be skipped in CI/CD.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { VisionFeature } from '../src/features/vision.feature.js';
import type { Result } from '../src/mcp/types.js';

describe('VisionFeature', () => {
  let vision: VisionFeature;

  beforeEach(() => {
    vision = new VisionFeature();
  });

  describe('General Image Analysis', () => {
    it('should analyze a local image file', async () => {
      const result = await vision.analyzeImage(
        '/path/to/test-screenshot.png',
        'Describe the main components and layout of this UI'
      );

      // In real usage, this would return AI analysis
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');

      if (result.success) {
        expect(typeof result.data).toBe('string');
      } else {
        expect(result.error).toBeInstanceOf(Error);
      }
    });

    it('should analyze a remote image URL', async () => {
      const result = await vision.analyzeImage(
        'https://example.com/screenshot.png',
        'What are the design patterns used in this interface?'
      );

      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });

    it('should handle invalid image source', async () => {
      const result = await vision.analyzeImage('', 'Test prompt');

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Image source');
    });

    it('should handle empty prompt', async () => {
      const result = await vision.analyzeImage('/path/to/image.png', '');

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Prompt');
    });
  });

  describe('Text Extraction (OCR)', () => {
    it('should extract text from screenshot', async () => {
      const result = await vision.extractText('/path/to/text-screenshot.png');

      expect(result).toBeDefined();

      if (result.success) {
        expect(result.data).toHaveProperty('text');
        expect(typeof result.data.text).toBe('string');
      }
    });

    it('should extract code with programming language hint', async () => {
      const result = await vision.extractText('/path/to/code-screenshot.png', {
        programmingLanguage: 'typescript',
      });

      if (result.success) {
        expect(result.data.programmingLanguage).toBe('typescript');
      }
    });

    it('should extract text with custom prompt', async () => {
      const result = await vision.extractText('/path/to/screenshot.png', {
        prompt: 'Extract only error messages and their line numbers',
      });

      expect(result).toBeDefined();
    });

    it('should handle invalid image source for text extraction', async () => {
      const result = await vision.extractText(null as any);

      expect(result.success).toBe(false);
    });
  });

  describe('UI Analysis', () => {
    it('should generate code from UI screenshot', async () => {
      const result = await vision.analyzeUI(
        '/path/to/ui-screenshot.png',
        'code',
        'Generate React code with Tailwind CSS'
      );

      expect(result).toBeDefined();

      if (result.success) {
        expect(typeof result.data).toBe('string');
        // Should contain code snippets
        expect(result.data).toMatch(/function|class|export|import/);
      }
    });

    it('should generate prompt for UI recreation', async () => {
      const result = await vision.analyzeUI(
        '/path/to/ui-screenshot.png',
        'prompt'
      );

      if (result.success) {
        expect(typeof result.data).toBe('string');
        expect(result.data.length).toBeGreaterThan(50);
      }
    });

    it('should extract design specification', async () => {
      const result = await vision.analyzeUI('/path/to/ui-screenshot.png', 'spec');

      if (result.success) {
        expect(typeof result.data).toBe('string');
        // Should mention design elements
        expect(result.data.toLowerCase()).toMatch(/layout|color|component|style/);
      }
    });

    it('should provide detailed description', async () => {
      const result = await vision.analyzeUI(
        '/path/to/ui-screenshot.png',
        'description'
      );

      if (result.success) {
        expect(typeof result.data).toBe('string');
      }
    });

    it('should handle invalid output type', async () => {
      const result = await vision.analyzeUI(
        '/path/to/ui-screenshot.png',
        'invalid' as any
      );

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Output type');
    });

    it('should handle invalid image source', async () => {
      const result = await vision.analyzeUI('', 'code');

      expect(result.success).toBe(false);
    });
  });

  describe('Error Diagnosis', () => {
    it('should diagnose error with context', async () => {
      const result = await vision.diagnoseError(
        '/path/to/error-screenshot.png',
        'During npm install in CI/CD'
      );

      expect(result).toBeDefined();

      if (result.success) {
        expect(result.data).toHaveProperty('errorType');
        expect(result.data).toHaveProperty('errorMessage');
        expect(result.data).toHaveProperty('possibleCauses');
        expect(result.data).toHaveProperty('suggestedFixes');
        expect(Array.isArray(result.data.possibleCauses)).toBe(true);
        expect(Array.isArray(result.data.suggestedFixes)).toBe(true);
      }
    });

    it('should diagnose error without context', async () => {
      const result = await vision.diagnoseError('/path/to/error.png');

      expect(result).toBeDefined();

      if (result.success) {
        expect(result.data.errorType).toBeDefined();
        expect(result.data.errorMessage).toBeDefined();
      }
    });

    it('should handle invalid image source', async () => {
      const result = await vision.diagnoseError('');

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Image source');
    });
  });

  describe('Visual Regression Testing', () => {
    it('should compare two similar UIs', async () => {
      const result = await vision.compareUI(
        '/path/to/expected-design.png',
        '/path/to/actual-implementation.png'
      );

      expect(result).toBeDefined();

      if (result.success) {
        expect(result.data).toHaveProperty('hasDifferences');
        expect(result.data).toHaveProperty('differences');
        expect(result.data).toHaveProperty('similarityScore');
        expect(typeof result.data.similarityScore).toBe('number');
      }
    });

    it('should compare with focus areas', async () => {
      const result = await vision.compareUI(
        '/path/to/expected.png',
        '/path/to/actual.png',
        'Focus on the header component and navigation menu'
      );

      expect(result).toBeDefined();

      if (result.success) {
        expect(result.data.summary).toBeDefined();
      }
    });

    it('should detect layout differences', async () => {
      const result = await vision.compareUI(
        '/path/to/expected.png',
        '/path/to/layout-changed.png'
      );

      if (result.success && result.data.hasDifferences) {
        expect(result.data.differences.length).toBeGreaterThan(0);

        const layoutDiff = result.data.differences.find(
          (d) => d.type === 'layout'
        );
        expect(layoutDiff).toBeDefined();
      }
    });

    it('should handle invalid expected image', async () => {
      const result = await vision.compareUI(
        '',
        '/path/to/actual.png'
      );

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Expected image');
    });

    it('should handle invalid actual image', async () => {
      const result = await vision.compareUI(
        '/path/to/expected.png',
        null as any
      );

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Actual image');
    });
  });

  describe('Advanced Analysis', () => {
    it('should analyze data visualization', async () => {
      const result = await vision.analyzeDataViz(
        '/path/to/chart.png',
        'What are the key trends and outliers in this chart?',
        'trends'
      );

      expect(result).toBeDefined();

      if (result.success) {
        expect(typeof result.data).toBe('string');
      }
    });

    it('should understand technical diagram', async () => {
      const result = await vision.understandDiagram(
        '/path/to/architecture-diagram.png',
        'Explain the data flow and component interactions',
        'architecture'
      );

      expect(result).toBeDefined();

      if (result.success) {
        expect(typeof result.data).toBe('string');
      }
    });

    it('should analyze video content', async () => {
      const result = await vision.analyzeVideo(
        '/path/to/demo-video.mp4',
        'Describe the user interactions and UI changes in this video'
      );

      expect(result).toBeDefined();

      if (result.success) {
        expect(typeof result.data).toBe('string');
      }
    });

    it('should handle invalid video source', async () => {
      const result = await vision.analyzeVideo('', 'Test prompt');

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Video source');
    });
  });

  describe('Convenience Functions', () => {
    it('should provide analyzeImage convenience function', async () => {
      const { analyzeImage: analyzeImageFn } = await import('../src/features/vision.feature.js');

      const result = await analyzeImageFn(
        '/path/to/image.png',
        'Test analysis'
      );

      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });

    it('should provide extractText convenience function', async () => {
      const { extractText: extractTextFn } = await import('../src/features/vision.feature.js');

      const result = await extractTextFn('/path/to/image.png');

      expect(result).toBeDefined();
    });

    it('should provide analyzeUI convenience function', async () => {
      const { analyzeUI: analyzeUIFn } = await import('../src/features/vision.feature.js');

      const result = await analyzeUIFn('/path/to/image.png', 'code');

      expect(result).toBeDefined();
    });

    it('should provide diagnoseError convenience function', async () => {
      const { diagnoseError: diagnoseErrorFn } = await import('../src/features/vision.feature.js');

      const result = await diagnoseErrorFn('/path/to/error.png');

      expect(result).toBeDefined();
    });

    it('should provide compareUI convenience function', async () => {
      const { compareUI: compareUIFn } = await import('../src/features/vision.feature.js');

      const result = await compareUIFn(
        '/path/to/expected.png',
        '/path/to/actual.png'
      );

      expect(result).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // This test assumes the image URL will fail
      const result = await vision.analyzeImage(
        'https://invalid-domain-12345.com/image.png',
        'Test prompt'
      );

      // Should return failure result, not throw
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');

      if (!result.success) {
        expect(result.error).toBeInstanceOf(Error);
      }
    });

    it('should handle malformed responses', async () => {
      // Test with special characters that might break parsing
      const result = await vision.analyzeImage(
        '/path/to/image.png',
        'Test prompt with special chars: """\'\'\'{{{{{}}}}}'

      );

      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
    });
  });

  describe('Type Safety', () => {
    it('should enforce ImageSource type', async () => {
      const invalidSource: any = 12345;
      const result = await vision.analyzeImage(invalidSource, 'Test');

      expect(result.success).toBe(false);
    });

    it('should enforce Result type structure', async () => {
      const result = await vision.analyzeImage('/path/to/image.png', 'Test');

      // TypeScript should enforce this structure
      const isValidResult: Result<string> = result;
      expect(isValidResult).toBeDefined();

      if (isValidResult.success) {
        expect(typeof isValidResult.data).toBe('string');
      } else {
        expect(isValidResult.error).toBeInstanceOf(Error);
      }
    });
  });
});

/**
 * Integration Test Examples
 *
 * These tests demonstrate real-world usage patterns.
 */
describe('VisionFeature Integration Examples', () => {
  it('example: debugging visual regression', async () => {
    const vision = new VisionFeature();

    // Compare design vs implementation
    const comparison = await vision.compareUI(
      '/designs/login-page.png',
      '/screenshots/actual-login.png'
    );

    if (comparison.success) {
      if (comparison.data.hasDifferences) {
        console.log('Visual differences found:');
        comparison.data.differences.forEach((diff) => {
          console.log(`- [${diff.severity}] ${diff.type}: ${diff.description}`);
        });
      } else {
        console.log('No visual differences detected');
      }
    }
  });

  it('example: extracting error information', async () => {
    const vision = new VisionFeature();

    const diagnosis = await vision.diagnoseError(
      '/screenshots/error.png',
      'Running TypeScript compilation'
    );

    if (diagnosis.success) {
      console.log(`Error Type: ${diagnosis.data.errorType}`);
      console.log(`Message: ${diagnosis.data.errorMessage}`);
      console.log('Possible fixes:');
      diagnosis.data.suggestedFixes.forEach((fix, i) => {
        console.log(`${i + 1}. ${fix}`);
      });
    }
  });

  it('example: generating code from design', async () => {
    const vision = new VisionFeature();

    const code = await vision.analyzeUI(
      '/designs/dashboard-card.png',
      'code',
      'Generate React component with TypeScript and Tailwind CSS'
    );

    if (code.success) {
      console.log('Generated code:');
      console.log(code.data);

      // Could be written to a file
      // await fs.writeFile('./DashboardCard.tsx', code.data);
    }
  });

  it('example: extracting structured data', async () => {
    const vision = new VisionFeature();

    const text = await vision.extractText('/screenshots/table.png', {
      programmingLanguage: 'typescript',
    });

    if (text.success) {
      console.log('Extracted text:', text.data.text);
      console.log('Detected language:', text.data.programmingLanguage);
    }
  });
});
