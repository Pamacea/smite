# Claude Code Aliases Installer (Windows PowerShell)
# This script installs cc and ccc aliases for Claude Code

$ErrorActionPreference = "Stop"

# Color helpers
function Write-Success { param([string]$Message); Write-Host $Message -ForegroundColor Green }
function Write-Info { param([string]$Message); Write-Host $Message -ForegroundColor Cyan }
function Write-Warning { param([string]$Message); Write-Host $Message -ForegroundColor Yellow }
function Write-Error { param([string]$Message); Write-Host $Message -ForegroundColor Red }

Write-Info ""
Write-Info "Installing Claude Code Shell Aliases"
Write-Info "===================================="
Write-Host ""

# Get PowerShell profile path
$profilePath = $PROFILE
if (-not $profilePath) {
    Write-Error "❌ Could not find PowerShell profile"
    Write-Host "   You may need to create a profile first:"
    Write-Host "   New-Item -Path $PROFILE -ItemType File -Force" -ForegroundColor Cyan
    exit 1
}

# Check if profile exists, create if not
if (-not (Test-Path $profilePath)) {
    Write-Warning "Profile does not exist, creating: $profilePath"
    New-Item -Path $profilePath -ItemType File -Force | Out-Null
}

# Create backup
$backupPath = "$profilePath.backup"
if (Test-Path $profilePath) {
    Copy-Item -Path $profilePath -Destination $backupPath -Force
    Write-Success "Backed up profile to: $backupPath"
}

# Alias definitions
$aliasMarker = "# Claude Code aliases"
$aliasContent = @"

$aliasMarker
function cc { claude $args }
function ccc { claude --bypass-permissions $args }
# End Claude Code aliases
"@

# Check if aliases already exist
$profileContent = Get-Content -Path $profilePath -Raw -ErrorAction SilentlyContinue
if ($profileContent -and $profileContent.Contains($aliasMarker)) {
    Write-Warning "Aliases already installed in profile"
    Write-Host "   Skipping installation..." -ForegroundColor Yellow
    Write-Host ""
    Write-Success "Aliases already configured!"
    Write-Host ""
    Write-Info "Available aliases:"
    Write-Host "   cc    -> claude" -ForegroundColor Cyan
    Write-Host "   ccc   -> claude --bypass-permissions" -ForegroundColor Cyan
    Write-Host ""
    Write-Info "Reload your shell:"
    Write-Host "   . `$PROFILE" -ForegroundColor Cyan
    exit 0
}

# Append aliases to profile
Add-Content -Path $profilePath -Value $aliasContent

Write-Success "Installed aliases to: $profilePath"
Write-Host ""

Write-Info "Aliases added:"
Write-Host "   cc    -> claude" -ForegroundColor Cyan
Write-Host "   ccc   -> claude --bypass-permissions" -ForegroundColor Cyan
Write-Host ""

Write-Info "Reload your shell to use aliases:"
Write-Host "   . `$PROFILE" -ForegroundColor Cyan
Write-Host "   Then close and reopen your terminal" -ForegroundColor Cyan
Write-Host ""

Write-Success "Done! You can now use: cc and ccc"
