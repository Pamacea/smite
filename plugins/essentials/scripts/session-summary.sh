#!/bin/bash
# SMITE Essentials - Session Summary Hook
# Displays session metrics on stop

set -euo pipefail

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

METRICS_FILE=".smite/session-metrics.json"

if [ -f "$METRICS_FILE" ]; then
    echo -e "${CYAN}[SMITE Essentials] Session Summary${NC}"
    cat "$METRICS_FILE" | grep -oP '"\K[^"]+": *[0-9]+' || true
    echo -e "${GREEN}[SMITE Essentials] Session complete!${NC}"
fi

exit 0
