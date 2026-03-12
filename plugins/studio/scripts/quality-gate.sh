#!/bin/bash
# SMITE Studio - Quality Gate Script
# Provides objective quality metrics for code changes

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo "════════════════════════════════════════"
echo -e "${CYAN}   SMITE Quality Gate${NC}"
echo "════════════════════════════════════════"
echo ""

# Get git diff if available
if git rev-parse --git-dir > /dev/null 2>&1; then
    # Get changed files
    FILES=$(git diff --cached --name-only 2>/dev/null || git diff --name-only 2>/dev/null || echo "")
    FILE_COUNT=$(echo "$FILES" | grep -c '.' || echo 0)

    # Count lines
    LINES_ADDED=$(git diff --cached 2>/dev/null | grep -c '^+' || git diff 2>/dev/null | grep -c '^+' || echo 0)
    LINES_REMOVED=$(git diff --cached 2>/dev/null | grep -c '^-' || git diff 2>/dev/null | grep -c '^-' || echo 0)
    NET_CHANGE=$((LINES_ADDED - LINES_REMOVED))
else
    FILE_COUNT=0
    LINES_ADDED=0
    LINES_REMOVED=0
    NET_CHANGE=0
fi

echo -e "${CYAN}📊 Code Metrics:${NC}"
echo "   Files changed: $FILE_COUNT"
echo "   Lines added:   $LINES_ADDED"
echo "   Lines removed: $LINES_REMOVED"
echo "   Net change:    $NET_CHANGE"
echo ""

# Quality scoring
SCORE=0
MAX_SCORE=100

echo -e "${CYAN}🔍 Quality Checks:${NC}"

# Check for barrel exports
if echo "$FILES" | grep -q 'index.ts\|index.js'; then
    echo -e "   ${GREEN}✅${NC} Barrel exports present"
    SCORE=$((SCORE + 20))
else
    echo -e "   ${YELLOW}⚠️${NC}  No barrel exports detected"
fi

# Check for tests
if echo "$FILES" | grep -q '\.test\.\|\.spec\.'; then
    echo -e "   ${GREEN}✅${NC} Tests included"
    SCORE=$((SCORE + 30))
else
    echo -e "   ${YELLOW}⚠️${YC}  No test files detected"
fi

# Check for TypeScript
if echo "$FILES" | grep -q '\.tsx\?$'; then
    if git diff 2>/dev/null | grep -q ': any'; then
        echo -e "   ${RED}❌${NC} Using 'any' type"
    else
        echo -e "   ${GREEN}✅${NC} Type-safe (no 'any')"
        SCORE=$((SCORE + 20))
    fi
fi

# Delete-first bonus
if [ $NET_CHANGE -lt 0 ]; then
    echo -e "   ${GREEN}✅${NC} Net code reduction!"
    SCORE=$((SCORE + 30))
elif [ $NET_CHANGE -eq 0 ]; then
    echo -e "   ${GREEN}✅${NC} Net zero change"
    SCORE=$((SCORE + 15))
fi

# Documentation check
if echo "$FILES" | grep -q '\.md$'; then
    echo -e "   ${GREEN}✅${NC} Documentation updated"
    SCORE=$((SCORE + 10))
fi

echo ""
echo -e "${CYAN}📈 Quality Score: ${SCORE}/${MAX_SCORE}${NC}"

if [ $SCORE -ge 80 ]; then
    echo -e "   ${GREEN}✅ Excellent quality!${NC}"
    exit 0
elif [ $SCORE -ge 50 ]; then
    echo -e "   ${YELLOW}⚠️  Good quality, room for improvement${NC}"
    exit 0
else
    echo -e "   ${RED}❌ Low quality score - review recommended${NC}"
    exit 1
fi
