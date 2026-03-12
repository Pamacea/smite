#!/bin/bash
# SMITE Agents - List Available Agents
# Lists all agents with their domain and tech stack

set -euo pipefail

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0;033[0m'

echo -e "${CYAN}SMITE Agents - Available Agents${NC}"
echo "════════════════════════════════════════"

# Function to list agents in directory
list_agents_in_domain() {
    local domain=$1
    local domain_dir="plugins/agents/agents/$domain"

    if [ -d "$domain_dir" ]; then
        echo -e "\n${GREEN}$domain${NC}"

        for agent_file in "$domain_dir"/*.agent.md; do
            if [ -f "$agent_file" ]; then
                # Extract name from file
                name=$(grep -oP '^# \K.*' "$agent_file" | head -1)
                tech=$(grep -oP 'tech_stack: \K.*' "$agent_file" | head -1 || echo "")
                version=$(grep -oP 'version: "\K[^"]+' "$agent_file" | head -1 || echo "")

                if [ -n "$name" ]; then
                    basename=$(basename "$agent_file" .agent.md)
                    echo "  • $basename${tech:+ ($tech)}${version:+ v$version}"
                fi
            fi
        done
    fi
}

# List all domains
list_agents_in_domain "frontend"
list_agents_in_domain "backend"
list_agents_in_domain "database"
list_agents_in_domain "devops"
list_agents_in_domain "workflow"
list_agents_in_domain "optimization"

echo ""
echo -e "${YELLOW}Usage:${NC}"
echo "  /studio build --tech=<tech> <task>"
echo "  /studio build --agent=<domain>/<agent> <task>"
echo ""
echo -e "${YELLOW}Examples:${NC}"
echo "  /studio build --tech=rust \"Create API\""
echo "  /studio build --agent=frontend/nextjs \"Build UI\""
echo "  /studio build --tech=nextjs --scale \"Full feature\""

exit 0
