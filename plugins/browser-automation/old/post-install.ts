import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

console.log('🔧 SMITE Browser Automation - Post Install');
console.log('========================================\n');

async function checkPlaywrightInstalled(): Promise<boolean> {
  const playwrightPath = path.join(process.cwd(), 'node_modules', 'playwright');
  return existsSync(playwrightPath);
}

async function installPlaywrightBrowsers(): Promise<void> {
  console.log('📦 Installing Playwright browsers...');
  console.log('This may take a few minutes on first run...\n');

  return new Promise((resolve, reject) => {
    const install = spawn('npx', ['playwright', 'install', 'chromium'], {
      stdio: 'inherit',
      shell: true
    });

    install.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ Playwright browsers installed successfully!');
        resolve();
      } else {
        console.error('\n❌ Failed to install Playwright browsers');
        reject(new Error(`Install failed with code ${code}`));
      }
    });

    install.on('error', (error) => {
      console.error('\n❌ Error installing Playwright:', error);
      reject(error);
    });
  });
}

async function createConfigFile(): Promise<void> {
  const fs = await import('fs/promises');
  const configPath = '.claude/.smite/browser.json';

  try {
    // Check if config already exists
    try {
      await fs.access(configPath);
      console.log('✅ Config file already exists at:', configPath);
      return;
    } catch {
      // Config doesn't exist, create it
      const defaultConfig = {
        browser: 'chromium',
        headless: false,
        viewport: {
          width: 1280,
          height: 720
        },
        timeout: 30000,
        screenshots: {
          dir: '.claude/.smite/screenshots',
          format: 'png'
        }
      };

      await fs.mkdir('.claude/.smite', { recursive: true });
      await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2));
      console.log('✅ Created default config at:', configPath);
    }
  } catch (error) {
    console.warn('⚠️  Could not create config file:', error);
  }
}

async function main() {
  try {
    // Check if Playwright is installed
    const isInstalled = await checkPlaywrightInstalled();

    if (!isInstalled) {
      console.log('⚠️  Playwright not found, please run: npm install');
      process.exit(1);
    }

    // Install browsers
    await installPlaywrightBrowsers();

    // Create default config
    await createConfigFile();

    console.log('\n🎉 Setup complete!');
    console.log('You can now use the Browser Automation plugin!');
    console.log('\nQuick start:');
    console.log('  npx tsx scripts/browse.ts goto https://google.com');
    console.log('  npx tsx scripts/browse.ts search "Browser MCP"\n');

  } catch (error) {
    console.error('\n❌ Post-install failed:', error);
    process.exit(1);
  }
}

main();
