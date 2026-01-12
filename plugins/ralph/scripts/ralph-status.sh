#!/bin/bash
# SMITE Ralph - Status Script
# Show current Ralph execution status

set -e

SMITE_DIR="$(pwd)/.smite"
STATE_FILE="$SMITE_DIR/ralph-state.json"
PROGRESS_FILE="$SMITE_DIR/progress.txt"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Ralph is running
if [ ! -f "$STATE_FILE" ]; then
  echo -e "${YELLOW}No Ralph session found in .smite directory${NC}"
  echo "Start Ralph with: ralph-loop --prompt \"your task\""
  exit 0
fi

# Parse state
SESSION_ID=$(grep -o '"sessionId":[^,]*' "$STATE_FILE" | cut -d':' -f2 | tr -d '"')
STATUS=$(grep -o '"status":[^,]*' "$STATE_FILE" | cut -d':' -f2 | tr -d '"')
CURRENT_ITER=$(grep -o '"currentIteration":[^,]*' "$STATE_FILE" | cut -d':' -f2)
MAX_ITER=$(grep -o '"maxIterations":[^,]*' "$STATE_FILE" | cut -d':' -f2)
COMPLETED=$(grep -o '"completedStories":\[[^]]*\]' "$STATE_FILE" | grep -o '\"[^\"]*\"' | wc -l)
FAILED=$(grep -o '"failedStories":\[[^]]*\]' "$STATE_FILE" | grep -o '\"[^\"]*\"' | wc -l)

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}SMITE Ralph Status${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Session ID: ${GREEN}$SESSION_ID${NC}"
echo -e "Status:     ${GREEN}$STATUS${NC}"
echo -e "Progress:   ${GREEN}$CURRENT_ITER${NC} / ${MAX_ITER} iterations"
echo -e "Completed:  ${GREEN}$COMPLETED${NC} stories"
echo -e "Failed:     ${RED}$FAILED${NC} stories"
echo ""

# Show progress log if exists
if [ -f "$PROGRESS_FILE" ]; then
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}Progress Log${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  tail -n 20 "$PROGRESS_FILE"
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
