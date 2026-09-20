param(
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$ToolsRoot = Join-Path $RepoRoot ".tools\godot"
$GodotProject = Join-Path $RepoRoot "godot"
$ToolingLockPath = Join-Path $PSScriptRoot "TOOLING_LOCK.json"
$ToolingLock = Get-Content -Raw $ToolingLockPath | ConvertFrom-Json

$StagehandVersion = [string]$ToolingLock.stagehand.tag
$StagehandAsset = [string]$ToolingLock.stagehand.windows_asset
$StagehandExe = Join-Path $ToolsRoot "stagehand\godot-stagehand.exe"
$StagehandUrl = "https://github.com/$($ToolingLock.stagehand.repository)/releases/download/$StagehandVersion/$StagehandAsset"
$StagehandSha256 = ([string]$ToolingLock.stagehand.windows_sha256).ToLowerInvariant()

$GdUnitTagLock = ([string]$ToolingLock.gdunit4.tag).Trim()
$GdUnitTag = $GdUnitTagLock.TrimStart("/")
$GdUnitTag = $GdUnitTag -replace "^refs/tags/+", ""
$GdUnitTag = $GdUnitTag -replace "^tags/+", ""
$GdUnitTag = $GdUnitTag.TrimStart("/")
if ([string]::IsNullOrWhiteSpace($GdUnitTag)) {
    throw "Invalid GdUnit4 tag in TOOLING_LOCK.json: '$GdUnitTagLock'"
}
$GdUnitTagRef = "refs/tags/$GdUnitTag"

$GdUnitCommit = [string]$ToolingLock.gdunit4.commit
$GdUnitRepo = "https://github.com/$($ToolingLock.gdunit4.repository).git"
$GdUnitSource = Join-Path $ToolsRoot "gdunit4-src"
$GdUnitTarget = Join-Path $GodotProject "addons\gdUnit4"

function Assert-LastExitCode([string]$Label) {
    if ($LASTEXITCODE -ne 0) {
        throw "$Label failed with exit code $LASTEXITCODE"
    }
}

New-Item -ItemType Directory -Force -Path $ToolsRoot | Out-Null
New-Item -ItemType Directory -Force -Path (Split-Path $StagehandExe -Parent) | Out-Null

Write-Host "================================================"
Write-Host "  SETUP GODOT TOOLING"
Write-Host "================================================"
Write-Host ""

$stagehandNeedsDownload = $Force -or -not (Test-Path $StagehandExe)
if (-not $stagehandNeedsDownload) {
    $currentHash = (Get-FileHash -Algorithm SHA256 $StagehandExe).Hash.ToLowerInvariant()
    $stagehandNeedsDownload = $currentHash -ne $StagehandSha256
}

if ($stagehandNeedsDownload) {
    $temp = "$StagehandExe.download"
    Remove-Item $temp -Force -ErrorAction SilentlyContinue
    Write-Host "[Stagehand] Downloading $StagehandVersion ..."
    Invoke-WebRequest -UseBasicParsing -Uri $StagehandUrl -OutFile $temp
    $hash = (Get-FileHash -Algorithm SHA256 $temp).Hash.ToLowerInvariant()
    if ($hash -ne $StagehandSha256) {
        Remove-Item $temp -Force -ErrorAction SilentlyContinue
        throw "Stagehand SHA256 mismatch. Expected $StagehandSha256, got $hash"
    }
    Move-Item -Force $temp $StagehandExe
} else {
    Write-Host "[Stagehand] Pinned binary already present."
}

$stagehandAddon = Join-Path $GodotProject "addons\stagehand\plugin.cfg"
if (-not (Test-Path $stagehandAddon)) {
    throw "Vendored Stagehand addon missing: $stagehandAddon"
}

$git = Get-Command git.exe -ErrorAction SilentlyContinue
if ($null -eq $git) {
    $git = Get-Command git -ErrorAction SilentlyContinue
}
if ($null -eq $git) {
    throw "Git is required to install pinned GdUnit4."
}

if ($Force -and (Test-Path $GdUnitSource)) {
    Remove-Item -Recurse -Force $GdUnitSource
}

if (-not (Test-Path (Join-Path $GdUnitSource ".git"))) {
    Write-Host "[GdUnit4] Creating pinned source cache ..."
    New-Item -ItemType Directory -Force -Path $GdUnitSource | Out-Null
    & $git.Source -C $GdUnitSource init --quiet
    Assert-LastExitCode "git init"
    & $git.Source -C $GdUnitSource remote add origin $GdUnitRepo
    Assert-LastExitCode "git remote add"
}

if ($GdUnitTagLock -ne $GdUnitTag) {
    Write-Host "[GdUnit4] Normalized lock tag '$GdUnitTagLock' -> '$GdUnitTag'."
}
Write-Host "[GdUnit4] Fetching $GdUnitTag ..."
& $git.Source -C $GdUnitSource fetch --force --depth 1 origin "${GdUnitTagRef}:${GdUnitTagRef}"
Assert-LastExitCode "git fetch GdUnit4"
& $git.Source -C $GdUnitSource checkout --quiet --detach $GdUnitCommit
Assert-LastExitCode "git checkout GdUnit4"

$actualGdUnitCommit = (& $git.Source -C $GdUnitSource rev-parse HEAD).Trim()
Assert-LastExitCode "git rev-parse GdUnit4"
if ($actualGdUnitCommit -ne $GdUnitCommit) {
    throw "GdUnit4 commit mismatch. Expected $GdUnitCommit, got $actualGdUnitCommit"
}

$sourceAddon = Join-Path $GdUnitSource "addons\gdUnit4"
if (-not (Test-Path $sourceAddon)) {
    throw "Pinned GdUnit4 addon not found at $sourceAddon"
}
if (Test-Path $GdUnitTarget) {
    Remove-Item -Recurse -Force $GdUnitTarget
}
New-Item -ItemType Directory -Force -Path (Split-Path $GdUnitTarget -Parent) | Out-Null
Copy-Item -Recurse -Force $sourceAddon $GdUnitTarget

$manifest = [ordered]@{
    schema = "tutien-godot-tooling-install.v1"
    installed_at = (Get-Date).ToString("o")
    stagehand = [ordered]@{
        version = $StagehandVersion
        path = $StagehandExe
        sha256 = $StagehandSha256
    }
    gdunit4 = [ordered]@{
        # Keep the exact lock value in the install manifest so Verify-GodotLocal
        # can compare installation provenance without normalization drift.
        tag = $GdUnitTagLock
        commit = $GdUnitCommit
        path = $GdUnitTarget
    }
}
$manifest | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 (Join-Path $ToolsRoot "installed.json")

Write-Host ""
Write-Host "[OK] Stagehand: $StagehandExe"
Write-Host "[OK] GdUnit4:   $GdUnitTarget"
Write-Host ""
Write-Host "Next: run VERIFY_GODOT_LOCAL.cmd"
