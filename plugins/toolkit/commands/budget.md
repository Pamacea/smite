# toolkit budget

Token budget tracking and statistics with lifetime savings reporting.

## Description

View current token budget, session statistics, and lifetime savings from using the SMITE Toolkit optimization layer.

## Usage

```bash
/toolkit budget [options]
```

## Options

- `--reset` - Reset token budget (start new session)
- `--history` - Show historical session data
- `--detail` - Show detailed breakdown by operation
- `--output <format>` - Output format: `table` (default), `json`

## Examples

```bash
# Show current budget
/toolkit budget
# → Token budget: 45,000/100,000 (45%)

# Reset budget
/toolkit budget --reset
# → Budget reset. Starting new session.

# Show history
/toolkit budget --history
# → Last 10 sessions with statistics

# Detailed breakdown
/toolkit budget --detail
# → Breakdown by operation (search, context, detect, etc.)

# JSON output
/toolkit budget --output=json
# → Machine-readable format
```

## Output Format

### Table Output (default)

```
💰 Token Budget Report

Current Session:
─────────────────────────────────────────────────
Budget:      45,234 / 100,000 tokens (45%)
Used:        45,234 tokens
Remaining:   54,766 tokens
Status:       ✅ Within budget

Thresholds:
  ⚠️  Warning at:     70,000 tokens (70%)
  🚨 Critical at:     90,000 tokens (90%)

Session Savings:
─────────────────────────────────────────────────
Session:     45,234 tokens used
Traditional: 180,936 tokens equivalent
Saved:       135,702 tokens (75% savings)

Lifetime Statistics:
─────────────────────────────────────────────────
Sessions:    127
Total Used:  5,234,567 tokens
Total Saved: 15,703,701 tokens
Avg Savings: 75% per session

Cost Savings:
─────────────────────────────────────────────────
Estimated Cost (Traditional): $235.42
Actual Cost (With Toolkit):    $58.85
Money Saved:                    $176.57 (75%)

Operations Breakdown:
─────────────────────────────────────────────────
Search:     15,234 tokens (34%) - 82 searches
Context:    18,456 tokens (41%) - 45 builds
Detect:     8,234 tokens (18%) - 12 detections
Graph:      3,310 tokens (7%)  - 6 analyses

✓ Budget healthy. Keep using toolkit for maximum savings!
```

### With Warnings

```
💰 Token Budget Report

⚠️  WARNING: Token budget at 73%

Current Session:
─────────────────────────────────────────────────
Budget:      73,456 / 100,000 tokens (73%)
Used:        73,456 tokens
Remaining:   26,544 tokens
Status:       ⚠️  Approaching limit

Recommendations:
  • Consider using lazy mode for searches
  • Use surgeon mode for large files
  • Scope operations to specific directories
  • Reset budget when starting new task

Continue? Y/n
```

### Critical Alert

```
🚨 CRITICAL: Token budget at 94%

Current Session:
─────────────────────────────────────────────────
Budget:      94,234 / 100,000 tokens (94%)
Used:        94,234 tokens
Remaining:   5,766 tokens
Status:       🚨  CRITICAL - Nearly exhausted

⛔ STOP: Consider these actions:
  1. Reset budget with: /toolkit budget --reset
  2. Use lazy mode for all searches
  3. Avoid full context builds
  4. Scope all operations

Continuing may result in degraded performance.
```

### Detailed Breakdown

```
💰 Token Budget Report (Detailed)

Operations Breakdown:
─────────────────────────────────────────────────
Search Operations (82 total):
  Hybrid:     10,234 tokens (22.6%) - 12 searches - avg: 853 tokens
  RAG-only:   3,456 tokens (7.6%)   - 45 searches - avg: 77 tokens
  Lazy:       1,544 tokens (3.4%)   - 25 searches - avg: 62 tokens

  Traditional would have used: ~65,000 tokens
  Saved: 54,766 tokens (84%)

Context Builds (45 total):
  Surgeon:    12,345 tokens (27.3%) - 38 builds - avg: 325 tokens
  Lazy:       4,567 tokens (10.1%)  - 5 builds - avg: 913 tokens
  Full:       1,544 tokens (3.4%)   - 2 builds - avg: 772 tokens

  Traditional would have used: ~95,000 tokens
  Saved: 76,544 tokens (81%)

Detection (12 total):
  Security:   4,123 tokens (9.1%)   - 4 scans - avg: 1,031 tokens
  Performance: 2,567 tokens (5.7%) - 4 scans - avg: 642 tokens
  Logic:      1,544 tokens (3.4%)  - 4 scans - avg: 386 tokens

  Traditional would have used: ~20,000 tokens
  Saved: 15,766 tokens (79%)

Top Consumers:
─────────────────────────────────────────────────
1. Context build - src/auth/jwt.ts (3,245 tokens)
2. Search - "authentication flow" (2,134 tokens)
3. Detect - security scan src/api (4,123 tokens)
4. Context build - src/db/schema.ts (2,876 tokens)
5. Search - "error handling" (1,923 tokens)

Recommendations:
─────────────────────────────────────────────────
✓ Good usage of lazy mode (25 searches)
✓ Surgeon mode working well (38 builds)
⚠️  Consider scoping large searches
⚠️  Some full builds could use surgeon mode
```

### History View

```
📊 Session History (Last 10 Sessions)

┌──────┬────────────────────┬──────────┬──────────┬──────────┬────────────┐
│ #    │ Date               │ Used     │ Saved    │ % Saved  │ Status     │
├──────┼────────────────────┼──────────┼──────────┼──────────┼────────────┤
│ 127  │ 2025-01-15 22:45   │ 45,234   │ 135,702  │ 75%      │ ✅ OK      │
│ 126  │ 2025-01-15 21:30   │ 67,890   │ 203,670  │ 75%      │ ⚠️  Warn    │
│ 125  │ 2025-01-15 18:15   │ 34,567   │ 103,701  │ 75%      │ ✅ OK      │
│ 124  │ 2025-01-15 14:20   │ 89,234   │ 267,702  │ 75%      │ 🚨 Crit     │
│ 123  │ 2025-01-15 10:05   │ 23,456   │ 70,368   │ 75%      │ ✅ OK      │
│ 122  │ 2025-01-14 22:40   │ 56,789   │ 170,367  │ 75%      │ ✅ OK      │
│ 121  │ 2025-01-14 16:25   │ 78,901   │ 236,703  │ 75%      │ ⚠️  Warn    │
│ 120  │ 2025-01-14 11:10   │ 45,234   │ 135,702  │ 75%      │ ✅ OK      │
│ 119  │ 2025-01-14 09:00   │ 34,567   │ 103,701  │ 75%      │ ✅ OK      │
│ 118  │ 2025-01-13 22:30   │ 91,234   │ 273,702  │ 75%      │ 🚨 Crit     │
└──────┴────────────────────┴──────────┴──────────┴──────────┴────────────┘

Total (10 sessions): 567,106 tokens used
Total Saved: 1,701,318 tokens (75%)
Average per session: 56,711 tokens
```

### JSON Output

```json
{
  "current": {
    "used": 45234,
    "max": 100000,
    "remaining": 54766,
    "percentage": 45,
    "status": "ok"
  },
  "thresholds": {
    "warning": 70000,
    "critical": 90000
  },
  "session": {
    "used": 45234,
    "traditional": 180936,
    "saved": 135702,
    "savings_percent": 75
  },
  "lifetime": {
    "sessions": 127,
    "total_used": 5234567,
    "total_saved": 15703701,
    "avg_savings_percent": 75
  },
  "operations": {
    "search": {
      "tokens": 15234,
      "count": 82,
      "percentage": 34
    },
    "context": {
      "tokens": 18456,
      "count": 45,
      "percentage": 41
    },
    "detect": {
      "tokens": 8234,
      "count": 12,
      "percentage": 18
    },
    "graph": {
      "tokens": 3310,
      "count": 6,
      "percentage": 7
    }
  }
}
```

## Features

- **Real-Time Tracking:** Monitors token usage during session
- **Threshold Warnings:** Alerts at 70% and 90%
- **Lifetime Statistics:** Tracks all-time savings
- **Operation Breakdown:** Shows usage by operation type
- **Cost Estimation:** Estimates monetary savings
- **History:** View past session statistics
- **Reset:** Start new session with fresh budget

## Configuration

Environment variables:

```bash
# Set custom budget
TOOLKIT_MAX_TOKENS=150000

# Adjust thresholds
TOOLKIT_WARN_THRESHOLD=0.6
TOOLKIT_CRITICAL_THRESHOLD=0.85
```

## Notes

- Budget stored in `~/.smite/toolkit/budget.json`
- Statistics stored in `~/.smite/toolkit/stats.json`
- Automatic tracking via shell hooks
- 75% average savings across all operations
- Best for: monitoring usage, cost management, optimization tracking

## See Also

- `/toolkit search` - Token-efficient search
- `/toolkit surgeon` - Maximum token savings
- `/toolkit explore` - Lazy mode for exploration
