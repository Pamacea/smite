#!/bin/bash
# SMITE Ralph - Loop Script
# Execute Ralph with automatic continuation until completion

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SMITE_DIR="$(pwd)/.smite"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
MAX_ITERATIONS=50
PROMPT=""
PRD_FILE=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -p|--prompt)
      PROMPT="$2"
      shift 2
      ;;
    -f|--file)
      PRD_FILE="$2"
      shift 2
      ;;
    -i|--iterations)
      MAX_ITERATIONS="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: ralph-loop [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  -p, --prompt <prompt>    Execute Ralph with prompt"
      echo "  -f, --file <prd.json>    Execute Ralph from PRD file"
      echo "  -i, --iterations <num>   Max iterations (default: 50)"
      echo "  -h, --help               Show this help"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

# Check if .smite exists
if [ ! -d "$SMITE_DIR" ]; then
  mkdir -p "$SMITE_DIR"
  echo -e "${GREEN}✓ Created .smite directory${NC}"
fi

# Execute Ralph
if [ -n "$PRD_FILE" ]; then
  echo -e "${GREEN}▶ Ralph executing from PRD: $PRD_FILE${NC}"
  node "$SCRIPT_DIR/../dist/index.js" --file "$PRD_FILE" --iterations "$MAX_ITERATIONS"
elif [ -n "$PROMPT" ]; then
  echo -e "${GREEN}▶ Ralph executing with prompt${NC}"
  node "$SCRIPT_DIR/../dist/index.js" --prompt "$PROMPT" --iterations "$MAX_ITERATIONS"
else
  echo -e "${RED}Error: Either --prompt or --file is required${NC}"
  exit 1
fi
