param(
    [string]$GodotBin = $env:GODOT_BIN,
    [switch]$SkipVisual
)

$ErrorActionPreference = "Stop"
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$GodotProject = Join-Path $RepoRoot "godot"
$ToolsRoot = Join-Path $RepoRoot ".tools\godot"
$StagehandExe = Join-Path $ToolsRoot "stagehand\godot-stagehand.exe"
$GdUnitRunner = Join-Path $GodotProject "addons\gdUnit4\runtest.cmd"
$ArtifactsRoot = Join-Path $RepoRoot "artifacts\godot-tools"
$SetupScript = Join-Path $PSScriptRoot "Setup-GodotTooling.ps1"

function Assert-Exit([string]$Label) {
    if ($LASTEXITCODE -ne 0) {
        throw "$Label failed with exit code $LASTEXITCODE"
    }
}

function Resolve-GodotBinary([string]$Explicit) {
    if ($Explicit -and (Test-Path $Explicit)) {
        return (Resolve-Path $Explicit).Path
    }

    foreach ($name in @("godot.exe", "godot", "Godot_v4.7.2-stable_win64.exe")) {
        $cmd = Get-Command $name -ErrorAction SilentlyContinue
        if ($null -ne $cmd -and (Test-Path $cmd.Source)) {
            return $cmd.Source
        }
    }

    $running = Get-Process -ErrorAction SilentlyContinue |
        Where-Object { $_.ProcessName -like "Godot*" -and $_.Path } |
        Select-Object -First 1
    if ($null -ne $running -and (Test-Path $running.Path)) {
        return $running.Path
    }

    $downloads = Join-Path $env:USERPROFILE "Downloads"
    if (Test-Path $downloads) {
        $found = Get-ChildItem -Path $downloads -Filter "Godot_v4.7.2-stable_win64.exe" -File -Recurse -ErrorAction SilentlyContinue |
            Select-Object -First 1
        if ($null -ne $found) {
            return $found.FullName
        }
    }

    throw "Godot 4.7.2 executable not found. Set GODOT_BIN to the full Godot exe path and run again."
}

Write-Host "================================================"
Write-Host "  VERIFY GODOT LOCAL"
Write-Host "================================================"
Write-Host ""

if (-not (Test-Path $StagehandExe) -or -not (Test-Path $GdUnitRunner)) {
    Write-Host "[0/7] Tooling missing; bootstrapping pinned versions ..."
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $SetupScript
    if ($LASTEXITCODE -ne 0) {
        throw "Godot tooling bootstrap failed."
    }
}

$Godot = Resolve-GodotBinary $GodotBin
$version = (& $Godot --version | Select-Object -First 1).Trim()
Assert-Exit "Godot --version"
if ($version -notmatch "^4\.7\.2") {
    throw "Expected Godot 4.7.2, got '$version'"
}
Write-Host "[Godot] $version"
Write-Host "[Godot] $Godot"

Remove-Item -Recurse -Force $ArtifactsRoot -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $ArtifactsRoot | Out-Null

Write-Host ""
Write-Host "[1/7] Importing project resources ..."
& $Godot --headless --path $GodotProject --import
Assert-Exit "Godot import"

Write-Host "[2/7] Parse-checking project GDScript ..."
$scripts = Get-ChildItem -Path (Join-Path $GodotProject "scripts") -Filter "*.gd" -File -Recurse
foreach ($script in $scripts) {
    $relative = $script.FullName.Substring($GodotProject.Length + 1).Replace("\", "/")
    & $Godot --headless --path $GodotProject --check-only --script "res://$relative"
    Assert-Exit "Parse check $relative"
}

Write-Host "[3/7] Running GdUnit4 tests ..."
Push-Location $GodotProject
try {
    & $GdUnitRunner --godot_binary $Godot -a "res://tests" --continue
    Assert-Exit "GdUnit4"
} finally {
    Pop-Location
}

Write-Host "[4/7] Running canonical bridge smoke ..."
$node = Get-Command node.exe -ErrorAction SilentlyContinue
if ($null -eq $node) {
    $node = Get-Command node -ErrorAction SilentlyContinue
}
if ($null -eq $node) {
    throw "Node.js is required for the canonical Godot bridge smoke."
}
Push-Location $GodotProject
try {
    & $node.Source "backend\bridge_smoke.mjs"
    Assert-Exit "Canonical bridge smoke"
} finally {
    Pop-Location
}

Write-Host "[5/7] Running bounded Godot smoke ..."
& $Godot --headless --path $GodotProject --quit-after 300
Assert-Exit "Godot bounded smoke"

Write-Host "[6/7] Running Stagehand structural scenario ..."
$structuralOut = Join-Path $ArtifactsRoot "stagehand-runtime"
New-Item -ItemType Directory -Force -Path $structuralOut | Out-Null
& $StagehandExe run (Join-Path $GodotProject "tests\stagehand\home_runtime_smoke.json") --out-dir $structuralOut --godot-bin $Godot
Assert-Exit "Stagehand runtime smoke"

if (-not $SkipVisual) {
    Write-Host "[7/7] Capturing real 390x844 Home screenshot ..."
    $visualOut = Join-Path $ArtifactsRoot "stagehand-visual"
    New-Item -ItemType Directory -Force -Path $visualOut | Out-Null
    & $StagehandExe run (Join-Path $GodotProject "tests\stagehand\home_visual_capture.json") --out-dir $visualOut --godot-bin $Godot
    Assert-Exit "Stagehand visual capture"
} else {
    Write-Host "[7/7] Visual capture skipped by request."
}

Write-Host ""
Write-Host "================================================"
Write-Host "  GODOT LOCAL VERIFICATION: PASS"
Write-Host "================================================"
Write-Host ""
Write-Host "Artifacts: $ArtifactsRoot"
if (-not $SkipVisual) {
    Write-Host "Screenshot: $ArtifactsRoot\stagehand-visual\screenshots\home-390x844.png"
}
