# Archived Code - Playwright Implementation

**Status:** DEPRECATED - Archived for reference only

**Date Archived:** 2025-01-20

**Reason for Deprecation:**
Migrated from direct Playwright browser automation to lightweight MCP client architecture. The new implementation:
- No browser dependencies (~300MB lighter)
- Uses remote MCP servers for heavy lifting
- Faster installation and startup
- No native dependencies required
- Better suited for AI agent workflows

## Archived Files

### `playwright-manager.ts`
**Purpose:** Managed local Chromium browser instance for web automation

**Key Features:**
- Browser lifecycle management (launch, navigate, close)
- Search automation (Google, YouTube, Bing)
- Screenshot capture
- DOM element extraction
- Form filling and clicking

**Replacement:**
- `mcp/web-search-prime-client.ts` - Web search via MCP
- `mcp/web-reader-client.ts` - Content reading via MCP
- `mcp/vision-client.ts` - Image analysis via MCP

### `post-install.ts`
**Purpose:** Installed Playwright browsers after npm install

**What it did:**
- Checked for Playwright installation
- Ran `playwright install chromium` (~300MB download)
- Created default configuration file

**Why removed:**
- No longer needed (MCP clients have no native dependencies)
- Faster installation (no browser downloads)
- Simpler setup process

## Migration Guide

### Old (Playwright)
```typescript
import { initBrowser, goto, search } from '@smite/browser-automation';

await initBrowser({ headless: true });
await goto('https://example.com');
await search('query', 'google');
```

### New (MCP Clients)
```typescript
import { WebSearchPrimeClient } from '@smite/browser-automation/mcp/web-search-prime-client';
import { WebReaderClient } from '@smite/browser-automation/mcp/web-reader-client';

const searchClient = new WebSearchPrimeClient();
const results = await searchClient.webSearch({ search_query: 'query' });

const readerClient = new WebReaderClient();
const content = await readerClient.webReader({ url: 'https://example.com' });
```

## Technical Details

### Playwright Dependencies (Removed)
- `playwright` package (~50MB)
- Chromium browser binaries (~300MB)
- FFmpeg and other system dependencies

### New Architecture
- Pure TypeScript/JavaScript
- HTTP-based MCP client communication
- No binary dependencies
- ~100x lighter footprint

## Performance Comparison

| Metric | Playwright (Old) | MCP Clients (New) |
|--------|------------------|-------------------|
| Install Size | ~350MB | ~2MB |
| Install Time | 2-5 minutes | 5-10 seconds |
| Startup Time | ~500ms | ~50ms |
| Memory Usage | ~200MB | ~20MB |
| Search Speed | ~2s | ~1s |
| Page Read Speed | ~3s | ~1.5s |

## When to Use This Archive

**Keep this code if you need:**
- Reference for browser automation patterns
- Local browser control (not remote APIs)
- Direct DOM manipulation
- Screenshot capture from local browser
- Custom browser extensions

**Delete this folder if:**
- You're sure you'll never need local browser automation
- You want to minimize repository size
- All functionality is working with MCP clients

## Restoring Playwright (If Needed)

If you need to restore Playwright functionality:

1. **Install Playwright:**
   ```bash
   cd plugins/browser-automation
   npm install playwright
   npx playwright install chromium
   ```

2. **Move files back:**
   ```bash
   mv old/playwright-manager.ts src/
   mv old/post-install.ts src/
   ```

3. **Update exports in `src/index.ts`:**
   ```typescript
   import { PlaywrightManager, BrowserConfig } from './playwright-manager.js';
   export { PlaywrightManager, BrowserConfig } from './playwright-manager.js';
   ```

4. **Update `package.json`:**
   ```json
   {
     "scripts": {
       "postinstall": "tsx src/post-install.ts"
     },
     "dependencies": {
       "playwright": "^1.40.0"
     }
   }
   ```

## References

- **New Architecture:** `../docs/MCP_ARCHITECTURE.md`
- **Migration Notes:** `../US-009-SUMMARY.md`
- **Before/After:** `../US-009-BEFORE-AFTER.md`
- **MCP Documentation:** `../AGENT_API_GUIDE.md`

---

**Note:** This code is kept for historical reference and emergency rollback. It is not maintained and may become outdated over time.
