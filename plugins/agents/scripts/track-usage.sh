#!/bin/bash
# SMITE Agents - Usage Tracking Hook
# Tracks agent usage for analytics

set -euo pipefail

TRACKING_DIR=".smite/agents"
METRICS_FILE="$TRACKING_DIR/metrics.json"

# Read current metrics
if [ -f "$METRICS_FILE" ]; then
    CURRENT=$(cat "$METRICS_FILE" 2>/dev/null || echo '{}')
    TOTAL=$(echo "$CURRENT" | grep -oP '"totalAgentInvocations":\K[0-9]+' || echo 0)
    NEW_TOTAL=$((TOTAL + 1))
else
    NEW_TOTAL=1
fi

# Update metrics
cat > "$METRICS_FILE" << EOF
{
  "totalAgentInvocations": $NEW_TOTAL,
  "lastUpdate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

exit 0
