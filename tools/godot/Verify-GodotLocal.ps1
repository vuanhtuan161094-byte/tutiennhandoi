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
$ApprovedBaseline = Join-Path $GodotProject "tests\visual-baselines\home-390x844.png"
$ToolingLockPath = Join-Path $PSScriptRoot "TOOLING_LOCK.json"
$InstallManifest = Join-Path $ToolsRoot "installed.json"
$ToolingLock = Get-Content -Raw $ToolingLockPath | ConvertFrom-Json
$ExpectedEngineVersion = [string]$ToolingLock.engine.version

function Assert-Exit([string]$Label) {
    if ($LASTEXITCODE -ne 0) {
        throw "$Label failed with exit code $LASTEXITCODE"
    }
}

function Test-PinnedTooling() {
    if (-not (Test-Path $StagehandExe) -or -not (Test-Path $GdUnitRunner) -or -not (Test-Path $InstallManifest)) {
        return $false
    }

    try {
        $manifest = Get-Content -Raw $InstallManifest | ConvertFrom-Json
        $stagehandHash = (Get-FileHash -Algorithm SHA256 $StagehandExe).Hash.ToLowerInvariant()
        $expectedStagehandHash = ([string]$ToolingLock.stagehand.windows_sha256).ToLowerInvariant()

        if ($stagehandHash -ne $expectedStagehandHash) { return $false }
        if ([string]$manifest.stagehand.version -ne [string]$ToolingLock.stagehand.tag) { return $false }
        if (([string]$manifest.stagehand.sha256).ToLowerInvariant() -ne $expectedStagehandHash) { return $false }
        if ([string]$manifest.gdunit4.tag -ne [string]$ToolingLock.gdunit4.tag) { return $false }
        if ([string]$manifest.gdunit4.commit -ne [string]$ToolingLock.gdunit4.commit) { return $false }
        return $true
    } catch {
        return $false
    }
}

function Add-GodotCandidate([System.Collections.Generic.List[string]]$Candidates, [string]$Path) {
    if ([string]::IsNullOrWhiteSpace($Path)) {
        return
    }

    try {
        if (-not (Test-Path $Path -PathType Leaf)) {
            return
        }
        $resolved = (Resolve-Path $Path).Path
        if (-not $Candidates.Contains($resolved)) {
            $Candidates.Add($resolved)
        }
    } catch {
        return
    }
}

function Add-GodotWithConsoleSibling([System.Collections.Generic.List[string]]$Candidates, [string]$Path) {
    if ([string]::IsNullOrWhiteSpace($Path)) {
        return
    }

    # Official Windows archives ship a console sibling intended for CLI/headless
    # automation. Prefer it when the discovered path points at the GUI binary.
    if ($Path -match "(?i)\\.exe$" -and $Path -notmatch "(?i)_console\\.exe$") {
        $consoleSibling = $Path -replace "(?i)\\.exe$", "_console.exe"
        Add-GodotCandidate $Candidates $consoleSibling
    }

    Add-GodotCandidate $Candidates $Path
}

function Resolve-GodotBinary([string]$Explicit, [string]$ExpectedVersion) {
    $candidates = New-Object "System.Collections.Generic.List[string]"

    if ($Explicit) {
        Add-GodotWithConsoleSibling $candidates $Explicit
    }

    foreach ($name in @(
        "Godot_v4.7.2-stable_win64_console.exe",
        "godot_console.exe",
        "godot.exe",
        "godot",
        "Godot_v4.7.2-stable_win64.exe"
    )) {
        $cmd = Get-Command $name -ErrorAction SilentlyContinue
        if ($null -ne $cmd -and $cmd.Source) {
            Add-GodotWithConsoleSibling $candidates $cmd.Source
        }
    }

    $running = Get-Process -ErrorAction SilentlyContinue |
        Where-Object { $_.ProcessName -like "Godot*" -and $_.Path }
    foreach ($process in $running) {
        Add-GodotWithConsoleSibling $candidates $process.Path
    }

    foreach ($root in @(
        (Join-Path $env:USERPROFILE "Downloads"),
        (Join-Path $env:USERPROFILE "Desktop"),
        $RepoRoot
    )) {
        if (-not (Test-Path $root)) {
            continue
        }

        foreach ($pattern in @(
            "Godot_v4.7.2-stable_win64_console.exe",
            "Godot_v4.7.2-stable_win64.exe"
        )) {
            $found = Get-ChildItem -Path $root -Filter $pattern -File -Recurse -ErrorAction SilentlyContinue
            foreach ($file in $found) {
                Add-GodotWithConsoleSibling $candidates $file.FullName
            }
        }
    }

    $failures = New-Object "System.Collections.Generic.List[string]"
    $expectedPattern = "^" + [regex]::Escape($ExpectedVersion)

    foreach ($candidate in $candidates) {
        Write-Host "[Godot] Probing $candidate"
        $global:LASTEXITCODE = 0
        try {
            $output = @(& $candidate --version 2>&1)
            $exitCode = $LASTEXITCODE
            $version = ""
            if ($output.Count -gt 0 -and $null -ne $output[0]) {
                $version = ([string]$output[0]).Trim()
            }

            if ($exitCode -eq 0 -and $version -match $expectedPattern) {
                return [pscustomobject]@{
                    Path = $candidate
                    Version = $version
                }
            }

            $failures.Add("$candidate => exit=$exitCode version='$version'")
        } catch {
            $failures.Add("$candidate => $($_.Exception.Message)")
        }
    }

    $details = if ($failures.Count -gt 0) {
        [Environment]::NewLine + "Candidates tried:" + [Environment]::NewLine + " - " + ($failures -join ([Environment]::NewLine + " - "))
    } else {
        ""
    }

    throw "No working Godot $ExpectedVersion CLI binary found. Prefer Godot_v$ExpectedVersion-stable_win64_console.exe or set GODOT_BIN to its full path.$details"
}

Write-Host "================================================"
Write-Host "  VERIFY GODOT LOCAL"
Write-Host "================================================"
Write-Host ""

if (-not (Test-PinnedTooling)) {
    Write-Host "[0/8] Tooling missing or does not match TOOLING_LOCK; bootstrapping pinned versions ..."
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $SetupScript
    if ($LASTEXITCODE -ne 0) {
        throw "Godot tooling bootstrap failed."
    }
}
if (-not (Test-PinnedTooling)) {
    throw "Installed Godot tooling does not match tools/godot/TOOLING_LOCK.json."
}

$resolvedGodot = Resolve-GodotBinary $GodotBin $ExpectedEngineVersion
$Godot = [string]$resolvedGodot.Path
$version = [string]$resolvedGodot.Version
Write-Host "[Godot] $version"
Write-Host "[Godot] $Godot"

$resolvedArtifacts = [IO.Path]::GetFullPath($ArtifactsRoot)
if (-not $resolvedArtifacts.StartsWith($RepoRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Artifacts directory must remain inside the repository."
}
Remove-Item -LiteralPath $resolvedArtifacts -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $ArtifactsRoot | Out-Null

# Every Godot process in this gate owns a disposable save, including QA ascension.
# Never let verification read or overwrite the player's ordinary bridge save.
$oldSave = $env:TUTIEN_GODOT_BRIDGE_SAVE
try {
$env:TUTIEN_GODOT_BRIDGE_SAVE = Join-Path $ArtifactsRoot "home-smoke-save.json"

Write-Host ""
Write-Host "[1/8] Importing project resources ..."
& $Godot --headless --path $GodotProject --import
Assert-Exit "Godot import"

Write-Host "[2/8] Parse-checking project GDScript in project context ..."
$parseLog = Join-Path $ArtifactsRoot "parse-check.log"
$parseOutput = @(& $Godot --headless --editor --path $GodotProject --quit 2>&1)
$parseExit = $LASTEXITCODE
$parseOutput | Set-Content -Encoding UTF8 $parseLog
foreach ($line in $parseOutput) {
    Write-Host $line
}
if ($parseExit -ne 0) {
    throw "Godot project-context parse check failed with exit code $parseExit. See $parseLog"
}

$parseFailurePatterns = @(
    "SCRIPT ERROR: Parse Error:",
    "SCRIPT ERROR: Compile Error:",
    "ERROR: Failed to load script"
)
$parseFailures = @()
foreach ($line in $parseOutput) {
    $lineText = [string]$line
    foreach ($pattern in $parseFailurePatterns) {
        if ($lineText.Contains($pattern)) {
            $parseFailures += $lineText
            break
        }
    }
}
if ($parseFailures.Count -gt 0) {
    throw "Godot project-context parse check reported script errors. See $parseLog"
}

Write-Host "[3/8] Running GdUnit4 tests ..."
Push-Location $GodotProject
try {
    & $GdUnitRunner --godot_binary $Godot -a "res://tests" --continue
    Assert-Exit "GdUnit4"
} finally {
    Pop-Location
}

Write-Host "[4/8] Running canonical bridge smoke ..."
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

Write-Host "[5/8] Running isolated P2 QA fixture smoke ..."
Push-Location $GodotProject
try {
    & $node.Source "backend\bridge_p2_fixture_smoke.mjs"
    Assert-Exit "P2 QA fixture smoke"
} finally {
    Pop-Location
}

Write-Host "[6/8] Running bounded Godot smoke ..."
& $Godot --headless --path $GodotProject --quit-after 300
Assert-Exit "Godot bounded smoke"

Write-Host "[7/8] Running Stagehand structural scenarios ..."
$structuralOut = Join-Path $ArtifactsRoot "stagehand-runtime"
New-Item -ItemType Directory -Force -Path $structuralOut | Out-Null
$homeStructuralOut = Join-Path $structuralOut "home"
New-Item -ItemType Directory -Force -Path $homeStructuralOut | Out-Null
& $StagehandExe run (Join-Path $GodotProject "tests\stagehand\home_runtime_smoke.json") --out-dir $homeStructuralOut --godot-bin $Godot
Assert-Exit "Stagehand Home runtime smoke"

$oldQa = $env:TUTIEN_GODOT_QA
$oldDiagnostic = $env:TUTIEN_GODOT_BRIDGE_DIAGNOSTIC
try {
    $env:TUTIEN_GODOT_QA = "1"
    $env:TUTIEN_GODOT_BRIDGE_DIAGNOSTIC = "1"
    $env:TUTIEN_GODOT_BRIDGE_SAVE = Join-Path $ArtifactsRoot "combat-smoke-save.json"
    $combatStructuralOut = Join-Path $structuralOut "combat"
    New-Item -ItemType Directory -Force -Path $combatStructuralOut | Out-Null
    & $StagehandExe run (Join-Path $GodotProject "tests\stagehand\combat_runtime_smoke.json") --out-dir $combatStructuralOut --godot-bin $Godot
    Assert-Exit "Stagehand Combat runtime smoke"
} finally {
    $env:TUTIEN_GODOT_QA = $oldQa
    $env:TUTIEN_GODOT_BRIDGE_DIAGNOSTIC = $oldDiagnostic
}
$env:TUTIEN_GODOT_BRIDGE_SAVE = Join-Path $ArtifactsRoot "home-visual-save.json"

if (-not $SkipVisual) {
    if (Test-Path $ApprovedBaseline) {
        Write-Host "[8/8] Running Stagehand visual regression against approved baseline ..."
        $visualOut = Join-Path $ArtifactsRoot "stagehand-visual-regression"
        New-Item -ItemType Directory -Force -Path $visualOut | Out-Null
        & $StagehandExe run (Join-Path $GodotProject "tests\stagehand\home_visual_regression.json") --out-dir $visualOut --godot-bin $Godot
        Assert-Exit "Stagehand visual regression"
    } else {
        Write-Host "[8/8] No approved baseline yet; capturing deterministic 390x844 Home candidate ..."
        $visualOut = Join-Path $ArtifactsRoot "stagehand-visual"
        New-Item -ItemType Directory -Force -Path $visualOut | Out-Null
        & $StagehandExe run (Join-Path $GodotProject "tests\stagehand\home_visual_capture.json") --out-dir $visualOut --godot-bin $Godot
        Assert-Exit "Stagehand visual capture"
    }
} else {
    Write-Host "[8/8] Visual gate skipped by request."
}

if (-not $SkipVisual) {
    $oldVisualQa = $env:TUTIEN_GODOT_QA
    $oldVisualDiagnostic = $env:TUTIEN_GODOT_BRIDGE_DIAGNOSTIC
    try {
        $env:TUTIEN_GODOT_QA = "1"
        $env:TUTIEN_GODOT_BRIDGE_DIAGNOSTIC = "1"
        $env:TUTIEN_GODOT_BRIDGE_SAVE = Join-Path $ArtifactsRoot "combat-visual-save.json"
        $combatVisualOut = Join-Path $ArtifactsRoot "stagehand-combat-visual"
        New-Item -ItemType Directory -Force -Path $combatVisualOut | Out-Null
        & $StagehandExe run (Join-Path $GodotProject "tests\stagehand\combat_visual_capture.json") --out-dir $combatVisualOut --godot-bin $Godot
        Assert-Exit "Stagehand canonical Combat visual capture"
    } finally {
        $env:TUTIEN_GODOT_QA = $oldVisualQa
        $env:TUTIEN_GODOT_BRIDGE_DIAGNOSTIC = $oldVisualDiagnostic
    }
}

Write-Host ""
Write-Host "================================================"
Write-Host "  GODOT LOCAL VERIFICATION: PASS"
Write-Host "================================================"
Write-Host ""
Write-Host "Artifacts: $ArtifactsRoot"
if (-not $SkipVisual) {
    if (Test-Path $ApprovedBaseline) {
        Write-Host "Visual baseline: $ApprovedBaseline"
        Write-Host "Regression artifacts: $ArtifactsRoot\stagehand-visual-regression"
    } else {
        Write-Host "Candidate screenshot: $ArtifactsRoot\stagehand-visual\screenshots\home-390x844.png"
        Write-Host "Baseline status: NOT APPROVED"
    }
}
} finally {
    $env:TUTIEN_GODOT_BRIDGE_SAVE = $oldSave
}
