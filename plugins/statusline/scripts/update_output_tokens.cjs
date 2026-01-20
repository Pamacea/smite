const fs = require('fs');
const path = require('path');

// Step 1: Update types.ts to include output_tokens in ContextData
const typesPath = path.join(__dirname, 'statusline/src/lib/types.ts');
let typesContent = fs.readFileSync(typesPath, 'utf8');

// Update ContextData interface
const oldContextData = `export interface ContextData {
  tokens: number | null;
  percentage: number | null;
}`;

const newContextData = `export interface ContextData {
  tokens: number | null;
  percentage: number | null;
  lastOutputTokens: number | null;
}`;

typesContent = typesContent.replace(oldContextData, newContextData);
fs.writeFileSync(typesPath, typesContent);
console.log('✓ Updated types.ts');

// Step 2: Update context.ts to extract last output tokens
const contextPath = path.join(__dirname, 'statusline/src/lib/context.ts');
let contextContent = fs.readFileSync(contextPath, 'utf8');

// Update interface
const oldContextDataInterface = `export interface ContextData {
  tokens: number | null;
  percentage: number | null;
}`;

contextContent = contextContent.replace(oldContextDataInterface, newContextData);

// Update return statement at end
const oldReturn = `    return {
      tokens: usableTokens,
      percentage,
    };
  } catch {
    // Transcript not available or parse error
    return {
      tokens: null,
      percentage: null,
    };
  }
}`;

const newReturn = `    // Get last output tokens from the most recent assistant message
    let lastOutputTokens = null;
    for (let i = transcript.length - 1; i >= 0; i--) {
      const entry = transcript[i];
      if (entry.type === 'assistant' && entry.usage?.output_tokens) {
        lastOutputTokens = entry.usage.output_tokens;
        break;
      }
    }

    return {
      tokens: usableTokens,
      percentage,
      lastOutputTokens,
    };
  } catch {
    // Transcript not available or parse error
    return {
      tokens: null,
      percentage: null,
      lastOutputTokens: null,
    };
  }
}`;

contextContent = contextContent.replace(oldReturn, newReturn);
fs.writeFileSync(contextPath, contextContent);
console.log('✓ Updated context.ts');

// Step 3: Update StatuslineData interface in render-pure.ts
const renderPurePath = path.join(__dirname, 'statusline/src/lib/render-pure.ts');
let renderPureContent = fs.readFileSync(renderPurePath, 'utf8');

const oldStatuslineData = `export interface StatuslineData {
  branch: string;
  dirPath: string;
  modelName: string;
  sessionCost: string;
  sessionDuration: string;
  contextTokens: number | null;
  contextPercentage: number | null;
  usageLimits?: {
    five_hour: UsageLimit | null;
    seven_day: UsageLimit | null;
  };
  periodCost?: number;
  todayCost?: number;
}`;

const newStatuslineData = `export interface StatuslineData {
  branch: string;
  dirPath: string;
  modelName: string;
  sessionCost: string;
  sessionDuration: string;
  contextTokens: number | null;
  contextPercentage: number | null;
  lastOutputTokens: number | null;
  usageLimits?: {
    five_hour: UsageLimit | null;
    seven_day: UsageLimit | null;
  };
  periodCost?: number;
  todayCost?: number;
}`;

renderPureContent = renderPureContent.replace(oldStatuslineData, newStatuslineData);
fs.writeFileSync(renderPurePath, renderPureContent);
console.log('✓ Updated render-pure.ts');

// Step 4: Update renderSessionInfo to display output tokens
const oldRenderSessionInfo = `  if (config.session.tokens.enabled && data.contextTokens !== null) {
    const maxTokens = config.context.maxContextTokens;
    const tokensStr = config.session.tokens.showMax
      ? \`\${formatTokens(data.contextTokens, config.session.tokens.showDecimals)}/\${formatTokens(maxTokens, false)}\`
      : formatTokens(data.contextTokens, config.session.tokens.showDecimals);
    sessionParts.push(tokensStr);
  }`;

const newRenderSessionInfo = `  if (config.session.tokens.enabled && data.contextTokens !== null) {
    const maxTokens = config.context.maxContextTokens;
    let tokensStr = formatTokens(data.contextTokens, config.session.tokens.showDecimals);

    // Add last output tokens if available
    if (data.lastOutputTokens !== null && data.lastOutputTokens > 0) {
      tokensStr += \` + \${data.lastOutputTokens}\`;
    }

    if (config.session.tokens.showMax) {
      tokensStr += \`/\${formatTokens(maxTokens, false)}\`;
    }

    sessionParts.push(tokensStr);
  }`;

renderPureContent = fs.readFileSync(renderPurePath, 'utf8'); // Re-read after previous write
renderPureContent = renderPureContent.replace(oldRenderSessionInfo, newRenderSessionInfo);
fs.writeFileSync(renderPurePath, renderPureContent);
console.log('✓ Updated renderSessionInfo in render-pure.ts');

// Step 5: Update index.ts to pass lastOutputTokens
const indexPath = path.join(__dirname, 'statusline/src/index.ts');
let indexContent = fs.readFileSync(indexPath, 'utf8');

const oldDataAssignment = `    const data: StatuslineData = {
      branch: formatBranch(git, config.git),
      dirPath: formatPath(workingDir, config.pathDisplayMode),
      modelName: input.model.display_name,
      sessionCost: formatCost(
        input.cost.total_cost_usd,
        config.session.cost.format
      ),
      sessionDuration: formatDuration(input.cost.total_duration_ms),
      contextTokens: contextInfo.tokens,
      contextPercentage: contextInfo.percentage,
      ...(getUsageLimits && {
        usageLimits: {
          five_hour: usageLimits.five_hour
            ? {
                utilization: usageLimits.five_hour.utilization,
                resets_at: usageLimits.five_hour.resets_at,
              }
            : null,
          seven_day: usageLimits.seven_day
            ? {
                utilization: usageLimits.seven_day.utilization,
                resets_at: usageLimits.seven_day.resets_at,
              }
            : null,
        },
      }),
      ...((getPeriodCost || getTodayCostV2) && spendInfo),
    };`;

const newDataAssignment = `    const data: StatuslineData = {
      branch: formatBranch(git, config.git),
      dirPath: formatPath(workingDir, config.pathDisplayMode),
      modelName: input.model.display_name,
      sessionCost: formatCost(
        input.cost.total_cost_usd,
        config.session.cost.format
      ),
      sessionDuration: formatDuration(input.cost.total_duration_ms),
      contextTokens: contextInfo.tokens,
      contextPercentage: contextInfo.percentage,
      lastOutputTokens: contextInfo.lastOutputTokens,
      ...(getUsageLimits && {
        usageLimits: {
          five_hour: usageLimits.five_hour
            ? {
                utilization: usageLimits.five_hour.utilization,
                resets_at: usageLimits.five_hour.resets_at,
              }
            : null,
          seven_day: usageLimits.seven_day
            ? {
                utilization: usageLimits.seven_day.utilization,
                resets_at: usageLimits.seven_day.resets_at,
              }
            : null,
        },
      }),
      ...((getPeriodCost || getTodayCostV2) && spendInfo),
    };`;

indexContent = indexContent.replace(oldDataAssignment, newDataAssignment);
fs.writeFileSync(indexPath, indexContent);
console.log('✓ Updated index.ts');

console.log('\n✅ All files updated successfully!');
console.log('\nNext steps:');
console.log('1. Build the TypeScript: cd statusline/scripts && bun run build');
console.log('2. Test the statusline');
