import { defaultConfigJson } from "../defaults.js";
/**
 * Default statusline configuration
 */
export const defaultConfig = defaultConfigJson;
/**
 * Deep merge configuration
 */
export function mergeConfig(userConfig) {
    return {
        ...defaultConfig,
        ...userConfig,
        session: { ...defaultConfig.session, ...userConfig.session },
        context: { ...defaultConfig.context, ...userConfig.context },
        git: { ...defaultConfig.git, ...userConfig.git },
        limits: { ...defaultConfig.limits, ...userConfig.limits },
        weeklyUsage: { ...defaultConfig.weeklyUsage, ...userConfig.weeklyUsage },
        dailySpend: { ...defaultConfig.dailySpend, ...userConfig.dailySpend },
    };
}
