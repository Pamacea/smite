import { colors, formatCost, formatProgressBar, formatTokens } from "./formatters.js";
/**
 * Render path and model display
 */
function renderPathAndModel(data, config) {
    const modelDisplay = config.showSonnetModel || !data.modelName.includes("Sonnet")
        ? data.modelName
        : "Sonnet";
    return `${data.dirPath} ${colors.gray}${config.separator}${colors.reset} ${colors.orange}${modelDisplay}${colors.reset}`;
}
/**
 * Render session information
 */
function renderSessionInfo(data, config) {
    const sessionParts = [];
    if (config.session.cost.enabled) {
        sessionParts.push(data.sessionCost);
    }
    if (config.session.duration.enabled) {
        sessionParts.push(data.sessionDuration);
    }
    if (config.session.tokens.enabled && data.contextTokens !== null) {
        const maxTokens = config.context.maxContextTokens;
        let tokensStr = formatTokens(data.contextTokens, config.session.tokens.showDecimals);
        // Add token diff if available and recent (shows tokens added since last update)
        if (data.tokenDiff && data.tokenDiff > 0) {
            const diffK = (data.tokenDiff / 1000).toFixed(1);
            const diffColor = data.tokenDiff > 50000 ? colors.red :
                data.tokenDiff > 20000 ? colors.yellow : colors.green;
            tokensStr += `${diffColor} +${diffK}K${colors.reset}`;
        }
        // Add last output tokens if available
        if (data.lastOutputTokens !== null && data.lastOutputTokens > 0) {
            tokensStr += ` + ${data.lastOutputTokens}`;
        }
        if (config.session.tokens.showMax) {
            tokensStr += `/${formatTokens(maxTokens, false)}`;
        }
        sessionParts.push(tokensStr);
    }
    if (config.session.percentage.enabled && data.contextPercentage !== null) {
        const { progressBar, showValue } = config.session.percentage;
        if (progressBar.enabled) {
            const bar = formatProgressBar(data.contextPercentage, progressBar.length, progressBar.style, progressBar.color, progressBar.background);
            sessionParts.push(bar);
        }
        if (showValue) {
            sessionParts.push(`${colors.green}${data.contextPercentage}%${colors.reset}`);
        }
    }
    if (sessionParts.length === 0) {
        return null;
    }
    const separator = config.session.infoSeparator || ` ${colors.gray}${config.separator}${colors.reset} `;
    return sessionParts.join(separator);
}
/**
 * Render usage limits
 */
function renderUsageLimits(data, config) {
    if (!config.limits.enabled || !data.usageLimits) {
        return null;
    }
    const limitsParts = [];
    const { five_hour } = data.usageLimits;
    if (five_hour) {
        if (config.limits.percentage.enabled) {
            const bar = formatProgressBar(five_hour.utilization, config.limits.percentage.progressBar.length, config.limits.percentage.progressBar.style, config.limits.percentage.progressBar.color, config.limits.percentage.progressBar.background);
            limitsParts.push(bar);
        }
        if (config.limits.percentage.showValue) {
            limitsParts.push(`${Math.round(five_hour.utilization)}%`);
        }
        if (config.limits.cost.enabled && data.periodCost !== undefined) {
            limitsParts.push(formatCost(data.periodCost, config.limits.cost.format));
        }
    }
    return limitsParts.length > 0 ? limitsParts.join(" ") : null;
}
/**
 * Render daily spend
 */
function renderDailySpend(data, config) {
    if (!config.dailySpend.cost.enabled || data.todayCost === undefined) {
        return null;
    }
    return `${colors.gray}Today:${colors.reset} ${formatCost(data.todayCost, config.dailySpend.cost.format)}`;
}
/**
 * Render statusline output
 */
export function renderStatusline(data, config) {
    const parts = [];
    // Path and model
    parts.push(renderPathAndModel(data, config));
    // Git branch
    if (config.git.enabled && data.branch) {
        parts.push(`${colors.white}${data.branch}${colors.reset}`);
    }
    // Session info
    const sessionInfo = renderSessionInfo(data, config);
    if (sessionInfo) {
        parts.push(sessionInfo);
    }
    // Usage limits
    const limitsInfo = renderUsageLimits(data, config);
    if (limitsInfo) {
        parts.push(limitsInfo);
    }
    // Daily spend
    const dailySpend = renderDailySpend(data, config);
    if (dailySpend) {
        parts.push(dailySpend);
    }
    return parts.join(` ${colors.gray}${config.separator}${colors.reset} `);
}
