#!/bin/bash
# SMITE Studio - Metrics Tracking Hook
# Tracks code metrics after each file change

set -euo pipefail

# Metrics file
METRICS_DIR=".smite"
METRICS_FILE="$METRICS_DIR/session-metrics.json"

# Create directory if needed
mkdir -p "$METRICS_DIR" 2>/dev/null || true

# Initialize metrics if not exist
if [ ! -f "$METRICS_FILE" ]; then
    cat > "$METRICS_FILE" << 'EOF'
{
  "filesModified": 0,
  "linesAdded": 0,
  "linesRemoved": 0,
  "lastUpdate": null
}
EOF
fi

# Increment file count
CURRENT=$(cat "$METRICS_FILE" 2>/dev/null || echo '{}')
FILES=$(echo "$CURRENT" | grep -oP '"filesModified":\K[0-9]+' || echo 0)
NEW_FILES=$((FILES + 1))

# Update metrics
cat > "$METRICS_FILE" << EOF
{
  "filesModified": $NEW_FILES,
  "linesAdded": 0,
  "linesRemoved": 0,
  "lastUpdate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

exit 0
