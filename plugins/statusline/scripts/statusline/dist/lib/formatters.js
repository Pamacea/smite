/**
 * ANSI color codes
 */
export const colors = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    dim: "\x1b[2m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    gray: "\x1b[90m",
    orange: "\x1b[38;5;208m",
    white: "\x1b[97m",
};
/**
 * Format git branch status
 */
export function formatBranch(git, config) {
    if (!config.enabled || !git.branch) {
        return "";
    }
    let output = git.branch;
    if (config.showDirtyIndicator && git.isDirty) {
        output += " *";
    }
    // Afficher les lignes ajoutées/supprimées au lieu du nombre de fichiers
    if (config.showChanges && git.isDirty) {
        const parts = [];
        if (git.additions > 0) {
            parts.push(`${colors.green}+${git.additions}${colors.reset}`);
        }
        if (git.deletions > 0) {
            parts.push(`${colors.red}-${git.deletions}${colors.reset}`);
        }
        if (git.modifications > 0 && git.additions === 0 && git.deletions === 0) {
            parts.push(`${colors.yellow}*${git.modifications}${colors.reset}`);
        }
        if (parts.length > 0) {
            output += ` ${parts.join(" ")}`;
        }
    }
    if (config.showStaged && git.staged > 0) {
        output += ` ${colors.green}S${git.staged}${colors.reset}`;
    }
    if (config.showUnstaged && git.unstaged > 0) {
        output += ` ${colors.yellow}U${git.unstaged}${colors.reset}`;
    }
    return output;
}
/**
 * Format cost with specified decimals
 */
export function formatCost(cost, format) {
    const decimals = {
        decimal1: 1,
        decimal2: 2,
        decimal3: 3,
    };
    return `$${cost.toFixed(decimals[format])}`;
}
/**
 * Format duration in human-readable format
 */
export function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    }
    else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    }
    else {
        return `${seconds}s`;
    }
}
/**
 * Format file path
 * Shows home-relative path (~/...) when possible
 */
export function formatPath(path, mode) {
    // Normaliser les séparateurs de chemin
    let normalizedPath = path.replace(/\\/g, "/");
    // Replace home directory with ~ for cleaner display
    const homeDir = process.env.HOME || process.env.USERPROFILE || "";
    if (homeDir && normalizedPath.startsWith(homeDir)) {
        normalizedPath = "~" + normalizedPath.slice(homeDir.length);
    }
    else if (process.platform === "win32") {
        // On Windows, remove drive letter (C:\) if not using home
        const match = path.match(/^.:\\/);
        if (match) {
            normalizedPath = normalizedPath.substring(3); // Remove "C:\"
        }
    }
    if (mode === "basename") {
        const parts = normalizedPath.split("/").filter(p => p && p !== ".");
        const basename = parts.pop() || normalizedPath;
        // Afficher le dossier parent + le dossier actuel pour plus de contexte
        if (parts.length > 0) {
            const parent = parts.pop();
            return parent ? `${parent}/${basename}` : basename;
        }
        return basename;
    }
    if (mode === "truncated") {
        const parts = normalizedPath.split("/").filter(p => p && p !== ".");
        if (parts.length <= 3) {
            return normalizedPath;
        }
        // Show first and last 2 parts
        return `${parts[0]}/.../${parts.slice(-2).join("/")}`;
    }
    return normalizedPath;
}
/**
 * Format tokens with K suffix
 */
export function formatTokens(tokens, showDecimals) {
    if (tokens < 1000) {
        return tokens.toString();
    }
    const k = tokens / 1000;
    const roundedK = Math.round(k);
    if (showDecimals && roundedK >= 100) {
        return `${k.toFixed(1)}K`;
    }
    return `${roundedK}K`;
}
/**
 * Format percentage
 */
export function formatPercentage(value) {
    return `${value}%`;
}
/**
 * Get color for progress bar based on percentage
 */
function getProgressBarColor(percentage, color) {
    if (color === "single") {
        return colors.blue;
    }
    if (percentage >= 90) {
        return colors.red;
    }
    if (percentage >= 70) {
        return colors.yellow;
    }
    return colors.blue;
}
/**
 * Get empty character for progress bar background
 */
function getEmptyChar(background) {
    const emptyChars = {
        none: " ",
        shade: "░",
        dots: "·",
    };
    return emptyChars[background];
}
/**
 * Format progress bar
 */
export function formatProgressBar(percentage, length, style, color, background) {
    if (style === "percentage") {
        return `${percentage}%`;
    }
    const filled = Math.round((percentage / 100) * length);
    const empty = length - filled;
    const barColor = getProgressBarColor(percentage, color);
    if (style === "braille") {
        const baseBar = colors.dim + "█".repeat(length) + colors.reset;
        const overlay = barColor + "█".repeat(Math.ceil(filled / 2)) + colors.reset;
        return overlay + baseBar.substring(overlay.length);
    }
    // style === "blocks"
    const emptyChar = getEmptyChar(background);
    const filledPart = barColor + "█".repeat(filled) + colors.reset;
    const emptyPart = colors.dim + emptyChar.repeat(empty) + colors.reset;
    return filledPart + emptyPart;
}
