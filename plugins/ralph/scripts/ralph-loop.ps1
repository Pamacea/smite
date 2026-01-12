# SMITE Ralph - Loop Script (Windows PowerShell)
# Execute Ralph with automatic continuation until completion

param(
    [string]$Prompt,
    [string]$File,
    [int]$Iterations = 50
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SmiteDir = Join-Path $PWD ".smite"

# Colors
$Green = "`e[0;32m"
$Red = "`e[0;31m"
$Yellow = "`e[1;33m"
$NC = "`e[0m"

# Create .smite directory if not exists
if (-not (Test-Path $SmiteDir)) {
    New-Item -ItemType Directory -Path $SmiteDir -Force | Out-Null
    Write-Host "${Green}✓ Created .smite directory${NC}"
}

# Execute Ralph
if ($File) {
    Write-Host "${Green}▶ Ralph executing from PRD: $File${NC}"
    node (Join-Path $ScriptDir "..\dist\index.js") --file $File --iterations $Iterations
}
elseif ($Prompt) {
    Write-Host "${Green}▶ Ralph executing with prompt${NC}"
    node (Join-Path $ScriptDir "..\dist\index.js") --prompt $Prompt --iterations $Iterations
}
else {
    Write-Host "${Red}Error: Either -Prompt or -File is required${NC}"
    exit 1
}
