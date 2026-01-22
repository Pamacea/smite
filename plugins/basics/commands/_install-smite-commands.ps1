# SMITE Commands Installer (Windows)
# This script is called by the /smite command

$ErrorActionPreference = "Stop"

# Find smite plugin directory
$smiteDir = Join-Path $PSScriptRoot ".."
$commandsDir = Join-Path $smiteDir "commands"
$agentsDir = Join-Path $smiteDir "agents"
$targetCommandsDir = Join-Path $env:USERPROFILE ".claude\commands"
$targetAgentsDir = Join-Path $env:USERPROFILE ".claude\agents"

Write-Host "🔥 SMITE Commands & Agents Installer" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $commandsDir)) {
    Write-Host "❌ Error: Cannot find smite commands directory" -ForegroundColor Red
    Write-Host "   Looked for: $commandsDir" -ForegroundColor Red
    exit 1
}

# Create target directories if needed
if (-not (Test-Path $targetCommandsDir)) {
    New-Item -ItemType Directory -Path $targetCommandsDir -Force | Out-Null
}
if (-not (Test-Path $targetAgentsDir)) {
    New-Item -ItemType Directory -Path $targetAgentsDir -Force | Out-Null
}

# Copy all commands
Write-Host "📦 Installing commands to: $targetCommandsDir" -ForegroundColor Yellow
Copy-Item -Path "$commandsDir\*.md" -Destination $targetCommandsDir -Force

# Copy all agents
Write-Host "📦 Installing agents to: $targetAgentsDir" -ForegroundColor Yellow
if (Test-Path $agentsDir) {
    Copy-Item -Path "$agentsDir\*.md" -Destination $targetAgentsDir -Force
} else {
    Write-Host "⚠️  No agents directory found (skipping agents)" -ForegroundColor Yellow
}

if ($?) {
    Write-Host ""
    Write-Host "✅ Successfully installed SMITE:" -ForegroundColor Green
    Write-Host "   Commands:" -ForegroundColor White
    Get-ChildItem "$commandsDir\*.md" | ForEach-Object {
        $name = $_.Name -replace '\.md$', ''
        Write-Host "     /$name" -ForegroundColor Cyan
    }
    if (Test-Path $agentsDir) {
        Write-Host "   Agents:" -ForegroundColor White
        Get-ChildItem "$agentsDir\*.md" | ForEach-Object {
            $name = $_.Name -replace '\.md$', ''
            Write-Host "     $name" -ForegroundColor Cyan
        }
    }
    Write-Host ""
    Write-Host "🚀 All commands and agents are now available!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to copy files" -ForegroundColor Red
    exit 1
}
