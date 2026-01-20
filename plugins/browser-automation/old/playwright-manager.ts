import { chromium, Browser, BrowserContext, Page, BrowserContextOptions } from 'playwright';
import { promises as fs } from 'fs';
import path from 'path';

export interface BrowserConfig {
  browser?: 'chromium' | 'firefox' | 'webkit';
  headless?: boolean;
  viewport?: { width: number; height: number };
  timeout?: number;
  screenshots?: {
    dir: string;
    format: 'png' | 'jpeg';
  };
}

export class PlaywrightManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private config: BrowserConfig;

  constructor(config: BrowserConfig = {}) {
    this.config = {
      browser: config.browser || 'chromium',
      headless: config.headless ?? false,
      viewport: config.viewport || { width: 1280, height: 720 },
      timeout: config.timeout || 30000,
      screenshots: config.screenshots || {
        dir: '.claude/.smite/screenshots',
        format: 'png'
      }
    };
  }

  async initialize(): Promise<void> {
    console.log('🎭 Initializing Playwright...');

    try {
      // Launch browser
      this.browser = await chromium.launch({
        headless: this.config.headless,
        timeout: this.config.timeout
      });

      // Create context with viewport
      const contextOptions: BrowserContextOptions = {
        viewport: this.config.viewport
      };

      this.context = await this.browser.newContext(contextOptions);

      // Create page
      this.page = await this.context.newPage();

      // Set default timeout
      if (this.config.timeout) {
        this.page.setDefaultTimeout(this.config.timeout);
      }

      console.log('✅ Playwright initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Playwright:', error);
      throw error;
    }
  }

  async goto(url: string): Promise<void> {
    if (!this.page) {
      throw new Error('Playwright not initialized. Call initialize() first.');
    }

    console.log(`🌐 Navigating to: ${url}`);
    await this.page.goto(url, { waitUntil: 'networkidle' });
    console.log('✅ Navigation complete');
  }

  async search(query: string, searchEngine: 'google' | 'youtube' | 'bing' = 'google'): Promise<void> {
    if (!this.page) {
      throw new Error('Playwright not initialized. Call initialize() first.');
    }

    const urls = {
      google: 'https://www.google.com',
      youtube: 'https://www.youtube.com',
      bing: 'https://www.bing.com'
    };

    await this.goto(urls[searchEngine]);

    console.log(`🔍 Searching for: ${query}`);

    if (searchEngine === 'google') {
      await this.page.fill('textarea[name="q"]', query);
      await this.page.press('textarea[name="q"]', 'Enter');
    } else if (searchEngine === 'youtube') {
      await this.page.fill('input[name="search_query"]', query);
      await this.page.press('input[name="search_query"]', 'Enter');
    } else if (searchEngine === 'bing') {
      await this.page.fill('input[name="q"]', query);
      await this.page.press('input[name="q"]', 'Enter');
    }

    // Wait for results
    await this.page.waitForLoadState('networkidle');
    console.log('✅ Search complete');
  }

  async screenshot(filename?: string): Promise<string> {
    if (!this.page) {
      throw new Error('Playwright not initialized. Call initialize() first.');
    }

    const screenshotDir = this.config.screenshots!.dir;
    await fs.mkdir(screenshotDir, { recursive: true });

    const name = filename || `screenshot-${Date.now()}.${this.config.screenshots!.format}`;
    const filepath = path.join(screenshotDir, name);

    await this.page.screenshot({
      path: filepath,
      type: this.config.screenshots!.format
    });

    console.log(`📸 Screenshot saved: ${filepath}`);
    return filepath;
  }

  async extract(selector: string): Promise<string[]> {
    if (!this.page) {
      throw new Error('Playwright not initialized. Call initialize() first.');
    }

    console.log(`📝 Extracting content from: ${selector}`);
    const elements = await this.page.$$(selector);

    const results: string[] = [];
    for (const element of elements) {
      const text = await element.textContent();
      if (text) {
        results.push(text.trim());
      }
    }

    console.log(`✅ Extracted ${results.length} elements`);
    return results;
  }

  async click(selector: string): Promise<void> {
    if (!this.page) {
      throw new Error('Playwright not initialized. Call initialize() first.');
    }

    console.log(`🖱️  Clicking: ${selector}`);
    await this.page.click(selector);
    console.log('✅ Click complete');
  }

  async fill(selector: string, value: string): Promise<void> {
    if (!this.page) {
      throw new Error('Playwright not initialized. Call initialize() first.');
    }

    console.log(`⌨️  Filling ${selector} with: ${value}`);
    await this.page.fill(selector, value);
    console.log('✅ Fill complete');
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
      console.log('🔚 Browser closed');
    }
  }

  getPage(): Page {
    if (!this.page) {
      throw new Error('Playwright not initialized. Call initialize() first.');
    }
    return this.page;
  }

  async getTitle(): Promise<string> {
    if (!this.page) {
      throw new Error('Playwright not initialized. Call initialize() first.');
    }
    return await this.page.title();
  }

  async getUrl(): Promise<string> {
    if (!this.page) {
      throw new Error('Playwright not initialized. Call initialize() first.');
    }
    return this.page.url();
  }
}
