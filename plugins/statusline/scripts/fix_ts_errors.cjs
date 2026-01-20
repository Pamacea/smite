const fs = require('fs');
const path = require('path');

// Fix index.ts
const indexPath = path.join(__dirname, 'statusline/src/index.ts');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Fix 1: Update ContextInfo interface
const oldContextInfo = `interface ContextInfo {
  tokens: number | null;
  percentage: number | null;
}`;

const newContextInfo = `interface ContextInfo {
  tokens: number | null;
  percentage: number | null;
  lastOutputTokens: number | null;
}`;

indexContent = indexContent.replace(oldContextInfo, newContextInfo);

// Fix 2: Add type annotation for parts at line 173
const oldPartsLine = `                  const parts = (currentWorkingDir || initialDir).split(/[/\\\\]/);`;
const newPartsLine = `                  const parts: string[] = (currentWorkingDir || initialDir).split(/[/\\\\]/);`;

indexContent = indexContent.replace(oldPartsLine, newPartsLine);

// Fix 3: Update cache interface to include lastOutputTokens
const oldContextCache = `interface ContextCache {
  timestamp: number;
  data: ContextInfo;
}`;

const newContextCacheWithTokens = `interface ContextCache {
  timestamp: number;
  data: ContextInfo;
}`;

// Actually ContextCache is already correct since it uses ContextInfo

// Fix 4: Update all places where ContextInfo is created to include lastOutputTokens
const oldResult1 = `      result = { tokens, percentage };

      // Mettre en cache uniquement si on a des données valides
      if (tokens > 0) {
        contextCache = { timestamp: now, data: result };
      }
      return result;`;

const newResult1 = `      result = { tokens, percentage, lastOutputTokens: null };

      // Mettre en cache uniquement si on a des données valides
      if (tokens > 0) {
        contextCache = { timestamp: now, data: result };
      }
      return result;`;

indexContent = indexContent.replace(oldResult1, newResult1);

const oldResult2 = `  result = {
    tokens: contextData.tokens,
    percentage: contextData.percentage,
  };

  // Mettre en cache
  if (contextData.tokens !== null && contextData.percentage !== null) {
    contextCache = { timestamp: now, data: result };
  }

  return result;`;

const newResult2 = `  result = {
    tokens: contextData.tokens,
    percentage: contextData.percentage,
    lastOutputTokens: contextData.lastOutputTokens,
  };

  // Mettre en cache
  if (contextData.tokens !== null && contextData.percentage !== null) {
    contextCache = { timestamp: now, data: result };
  }

  return result;`;

indexContent = indexContent.replace(oldResult2, newResult2);

fs.writeFileSync(indexPath, indexContent);
console.log('✓ Fixed index.ts TypeScript errors');

console.log('\n✅ All TypeScript errors fixed!');
