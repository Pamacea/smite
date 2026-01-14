# SMITE Commands Installer (Windows)
# This script is called by the /smite command

$ErrorActionPreference = "Stop"

# Find smite plugin directory
$smiteDir = Join-Path $PSScriptRoot ".."
$commandsDir = Join-Path $smiteDir "commands"
$targetDir = Join-Path $env:USERPROFILE ".claude\commands"

Write-Host "🔥 SMITE Commands Installer" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $commandsDir)) {
    Write-Host "❌ Error: Cannot find smite commands directory" -ForegroundColor Red
    Write-Host "   Looked for: $commandsDir" -ForegroundColor Red
    exit 1
}

# Create target directory if needed
if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}

# Copy all commands
Write-Host "📦 Installing commands to: $targetDir" -ForegroundColor Yellow
Copy-Item -Path "$commandsDir\*.md" -Destination $targetDir -Force

if ($?) {
    Write-Host ""
    Write-Host "✅ Successfully installed SMITE commands:" -ForegroundColor Green
    Get-ChildItem "$commandsDir\*.md" | ForEach-Object {
        $name = $_.Name -replace '\.md$', ''
        Write-Host "   /$name" -ForegroundColor White
    }
    Write-Host ""
    Write-Host "🚀 All commands are now available!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to copy commands" -ForegroundColor Red
    exit 1
}
