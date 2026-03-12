#!/bin/bash
# SMITE Agents - Agent Metrics Display
# Shows agent usage metrics at session end

set -euo pipefail

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

METRICS_FILE=".smite/agents/metrics.json"

if [ -f "$METRICS_FILE" ]; then
    echo ""
    echo -e "${CYAN}[SMITE Agents] Session Metrics${NC}"
    echo "════════════════════════════════════════"

    TOTAL=$(grep -oP '"totalAgentInvocations":\K[0-9]+' "$METRICS_FILE" 2>/dev/null || echo 0)
    echo -e "${GREEN}Agent invocations:${NC} $TOTAL"

    # Count agents by domain
    FRONTEND=$(find plugins/agents/agents/frontend -name "*.agent.md" 2>/dev/null | wc -l || echo 0)
    BACKEND=$(find plugins/agents/agents/backend -name "*.agent.md" 2>/dev/null | wc -l || echo 0)
    DATABASE=$(find plugins/agents/agents/database -name "*.agent.md" 2>/dev/null | wc -l || echo 0)
    DEVOPS=$(find plugins/agents/agents/devops -name "*.agent.md" 2>/dev/null | wc -l || echo 0)
    WORKFLOW=$(find plugins/agents/agents/workflow -name "*.agent.md" 2>/dev/null | wc -l || echo 0)
    OPTIMIZATION=$(find plugins/agents/agents/optimization -name "*.agent.md" 2>/dev/null | wc -l || echo 0)

    echo ""
    echo -e "${YELLOW}Available Agents:${NC}"
    echo "  Frontend:   $FRONTEND"
    echo "  Backend:    $BACKEND"
    echo "  Database:   $DATABASE"
    echo "  DevOps:     $DEVOPS"
    echo "  Workflow:   $WORKFLOW"
    echo "  Optimization: $OPTIMIZATION"
    echo ""
else
    echo -e "${YELLOW}[SMITE Agents] No metrics recorded yet${NC}"
fi

exit 0
