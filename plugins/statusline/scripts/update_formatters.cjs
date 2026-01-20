const fs = require('fs');
const path = require('path');

// Read the file
const formattersPath = path.join(__dirname, 'statusline/src/lib/formatters.ts');
const content = fs.readFileSync(formattersPath, 'utf8');

// Replace the function body
const oldPattern = `  if (mode === "basename") {
    return path.split(/[/\\\\]/).pop() || path;
  }

  if (mode === "truncated") {
    const parts = path.split(/[/\\\\]/);
    if (parts.length <= 3) {
      return path;
    }
    // Show first and last 2 parts
    return \`\${parts[0]}/.../\${parts.slice(-2).join("/")}\`;
  }

  return path;
}`;

const newPattern = `  // Normaliser les séparateurs de chemin
  const normalizedPath = path.replace(/\\\\/g, "/");

  if (mode === "basename") {
    const parts = normalizedPath.split("/").filter(p => p && p !== ".");
    const basename = parts.pop() || normalizedPath;

    // Afficher le dossier parent + le dossier actuel pour plus de contexte
    if (parts.length > 0) {
      const parent = parts.pop();
      return parent ? \`\${parent}/\${basename}\` : basename;
    }

    return basename;
  }

  if (mode === "truncated") {
    const parts = normalizedPath.split("/").filter(p => p && p !== ".");
    if (parts.length <= 3) {
      return normalizedPath;
    }
    // Show first and last 2 parts
    return \`\${parts[0]}/.../\${parts.slice(-2).join("/")}\`;
  }

  return normalizedPath;
}`;

const newContent = content.replace(oldPattern, newPattern);

// Write back
fs.writeFileSync(formattersPath, newContent);

console.log('File updated successfully!');
