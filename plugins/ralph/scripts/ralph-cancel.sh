#!/bin/bash
# SMITE Ralph - Cancel Script
# Cancel running Ralph session

set -e

SMITE_DIR="$(pwd)/.smite"
STATE_FILE="$SMITE_DIR/ralph-state.json"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Ralph is running
if [ ! -f "$STATE_FILE" ]; then
  echo -e "${YELLOW}No Ralph session found${NC}"
  exit 0
fi

# Update state to cancelled
SESSION_ID=$(grep -o '"sessionId":[^,]*' "$STATE_FILE" | cut -d':' -f2 | tr -d '"')
STATUS=$(grep -o '"status":[^,]*' "$STATE_FILE" | cut -d':' -f2 | tr -d '"')

if [ "$STATUS" == "cancelled" ]; then
  echo -e "${YELLOW}Session already cancelled${NC}"
  exit 0
fi

if [ "$STATUS" == "completed" ] || [ "$STATUS" == "failed" ]; then
  echo -e "${YELLOW}Session already finished (${STATUS})${NC}"
  echo "To start a new session, remove .smite directory or run ralph-loop again"
  exit 0
fi

# Cancel session
echo -e "${RED}Cancelling Ralph session: $SESSION_ID${NC}"

# Update state file to cancelled
temp_file=$(mktemp)
sed 's/"status": "running"/"status": "cancelled"/' "$STATE_FILE" > "$temp_file"
mv "$temp_file" "$STATE_FILE"

echo -e "${GREEN}✓ Session cancelled${NC}"
echo "Progress saved in .smite/progress.txt"
