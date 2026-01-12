# SMITE Ralph - Status Script (Windows PowerShell)
# Show current Ralph execution status

$SmiteDir = Join-Path $PWD ".smite"
$StateFile = Join-Path $SmiteDir "ralph-state.json"
$ProgressFile = Join-Path $SmiteDir "progress.txt"

# Colors
$Green = "`e[0;32m"
$Red = "`e[0;31m"
$Yellow = "`e[1;33m"
$Blue = "`e[0;34m"
$NC = "`e[0m"

# Check if Ralph is running
if (-not (Test-Path $StateFile)) {
    Write-Host "${Yellow}No Ralph session found in .smite directory${NC}"
    Write-Host "Start Ralph with: .\ralph-loop.ps1 -Prompt 'your task'"
    exit 0
}

# Parse state
$State = Get-Content $StateFile | ConvertFrom-Json

Write-Host "${Blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
Write-Host "${Blue}SMITE Ralph Status${NC}"
Write-Host "${Blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
Write-Host ""
Write-Host "Session ID: ${Green}$($State.sessionId)${NC}"
Write-Host "Status:     ${Green}$($State.status)${NC}"
Write-Host "Progress:   ${Green}$($State.currentIteration)${NC} / $($State.maxIterations) iterations"
Write-Host "Completed:  ${Green}$($State.completedStories.Count)${NC} stories"
Write-Host "Failed:     ${RED}$($State.failedStories.Count)${NC} stories"
Write-Host ""

# Show progress log if exists
if (Test-Path $ProgressFile) {
    Write-Host "${Blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    Write-Host "${BLUE}Progress Log${NC}"
    Write-Host "${Blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    Get-Content $ProgressFile | Select-Object -Last 20
}

Write-Host "${Blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
