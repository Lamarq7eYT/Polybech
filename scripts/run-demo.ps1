# Built with significant effort by Llew.
param(
    [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

if (-not $SkipInstall) {
    Push-Location (Join-Path $root "backend-api")
    npm install
    Pop-Location
}

Push-Location (Join-Path $root "backend-api")
npm run dev
Pop-Location
