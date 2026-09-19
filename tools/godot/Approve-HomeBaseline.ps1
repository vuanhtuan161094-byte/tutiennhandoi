param(
    [switch]$ConfirmApproved
)

$ErrorActionPreference = "Stop"
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$Candidate = Join-Path $RepoRoot "artifacts\godot-tools\stagehand-visual\screenshots\home-390x844.png"
$BaselineDir = Join-Path $RepoRoot "godot\tests\visual-baselines"
$Baseline = Join-Path $BaselineDir "home-390x844.png"

if (-not $ConfirmApproved) {
    throw "Refusing to bless a baseline without -ConfirmApproved."
}
if (-not (Test-Path $Candidate)) {
    throw "Candidate screenshot not found: $Candidate. Run VERIFY_GODOT_LOCAL.cmd first."
}

New-Item -ItemType Directory -Force -Path $BaselineDir | Out-Null
Copy-Item -Force $Candidate $Baseline

Write-Host "Approved Home baseline copied:"
Write-Host "  $Baseline"
Write-Host ""
Write-Host "Review this PNG in Git before committing it."
