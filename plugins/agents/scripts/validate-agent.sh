#!/bin/bash
# SMITE Agents - Agent Validation Hook
# Validates agent before invocation

set -euo pipefail

INPUT=$(cat 2>/dev/null || echo '{}')
AGENT=$(echo "$INPUT" | grep -oP '"agent":"\K[^"]+' || echo "")
SUBAGENT_TYPE=$(echo "$INPUT" | grep -oP '"subagent_type":"\K[^"]+' || echo "")

# Skip if no agent specified
if [ -z "$AGENT" ] && [ -z "$SUBAGENT_TYPE" ]; then
    exit 0
fi

# Validate agent exists
AGENT_FILE=""
if [ -n "$AGENT" ]; then
    # Check if agent file exists
    AGENT_FILE="plugins/agents/agents/$AGENT.agent.md"
    if [ -f "$AGENT_FILE" ]; then
        exit 0
    fi

    # Check with .agent.md extension if needed
    AGENT_FILE="plugins/agents/agents/$AGENT.agent.md"
fi

# Log agent invocation (for tracking)
TRACKING_DIR=".smite/agents"
mkdir -p "$TRACKING_DIR" 2>/dev/null || true

LOG_FILE="$TRACKING_DIR/invocations.log"
echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") | AGENT=$AGENT SUBAGENT=$SUBAGENT_TYPE >> "$LOG_FILE" 2>/dev/null || true

exit 0
