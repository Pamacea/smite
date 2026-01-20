#!/bin/bash
cd /c/Users/Yanis/Projects/smite/plugins/statusline/scripts/statusline/src/lib

# Sauvegarder formatters.ts
cp formatters.ts formatters.ts.bak

# Créer la nouvelle version de formatPath
cat > formatters_new.txt << 'EOF'
export function formatPath(
  path: string,
  mode: "full" | "truncated" | "basename"
): string {
  // Normaliser les séparateurs de chemin
  const normalizedPath = path.replace(/\\/g, "/");

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
EOF

# Remplacer la fonction dans le fichier
# C'est compliqué avec sed sur Windows, donc on va utiliser une approche différente
echo "Patch file créé. Veuillez appliquer manuellement."
