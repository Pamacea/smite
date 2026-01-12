# SMITE Ralph - Cancel Script (Windows PowerShell)
# Cancel running Ralph session

$SmiteDir = Join-Path $PWD ".smite"
$StateFile = Join-Path $SmiteDir "ralph-state.json"

# Colors
$Green = "`e[0;32m"
$Red = "`e[0;31m"
$Yellow = "`e[1;33m"
$NC = "`e[0m"

# Check if Ralph is running
if (-not (Test-Path $StateFile)) {
    Write-Host "${Yellow}No Ralph session found${NC}"
    exit 0
}

# Parse state
$State = Get-Content $StateFile | ConvertFrom-Json

if ($State.status -eq "cancelled") {
    Write-Host "${Yellow}Session already cancelled${NC}"
    exit 0
}

if ($State.status -eq "completed" -or $State.status -eq "failed") {
    Write-Host "${Yellow}Session already finished ($($State.status))${NC}"
    Write-Host "To start a new session, remove .smite directory or run ralph-loop again"
    exit 0
}

# Cancel session
Write-Host "${Red}Cancelling Ralph session: $($State.sessionId)${NC}"

# Update state to cancelled
$State.status = "cancelled"
$State | ConvertTo-Json -Depth 10 | Set-Content $StateFile

Write-Host "${Green}✓ Session cancelled${NC}"
Write-Host "Progress saved in .smite/progress.txt"
