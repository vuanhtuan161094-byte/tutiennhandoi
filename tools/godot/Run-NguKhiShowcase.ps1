param(
    [string]$GodotBin = $env:GODOT_BIN
)

$ErrorActionPreference = "Stop"
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$GodotProject = Join-Path $RepoRoot "godot"
$Scene = "res://scenes/debug/ngukhi_showcase.tscn"
$ExpectedVersion = "4.7.2"

function Add-Candidate([System.Collections.Generic.List[string]]$List, [string]$Path) {
    if ([string]::IsNullOrWhiteSpace($Path)) { return }
    try {
        if (-not (Test-Path $Path -PathType Leaf)) { return }
        $resolved = (Resolve-Path $Path).Path
        if (-not $List.Contains($resolved)) { $List.Add($resolved) }
    } catch {}
}

function Resolve-Godot([string]$Explicit) {
    $candidates = New-Object "System.Collections.Generic.List[string]"
    Add-Candidate $candidates $Explicit

    foreach ($name in @(
        "Godot_v4.7.2-stable_win64_console.exe",
        "Godot_v4.7.2-stable_win64.exe",
        "godot_console.exe",
        "godot.exe",
        "godot"
    )) {
        $cmd = Get-Command $name -ErrorAction SilentlyContinue
        if ($null -ne $cmd -and $cmd.Source) {
            Add-Candidate $candidates $cmd.Source
        }
    }

    $running = Get-Process -ErrorAction SilentlyContinue |
        Where-Object { $_.ProcessName -like "Godot*" -and $_.Path }
    foreach ($process in $running) {
        Add-Candidate $candidates $process.Path
    }

    foreach ($root in @(
        (Join-Path $env:USERPROFILE "Downloads"),
        (Join-Path $env:USERPROFILE "Desktop"),
        $RepoRoot
    )) {
        if (-not (Test-Path $root)) { continue }
        foreach ($pattern in @(
            "Godot_v4.7.2-stable_win64_console.exe",
            "Godot_v4.7.2-stable_win64.exe"
        )) {
            foreach ($file in Get-ChildItem -Path $root -Filter $pattern -File -Recurse -ErrorAction SilentlyContinue) {
                Add-Candidate $candidates $file.FullName
            }
        }
    }

    foreach ($candidate in $candidates) {
        try {
            $version = (& $candidate --version 2>&1 | Select-Object -First 1).ToString().Trim()
            if ($LASTEXITCODE -eq 0 -and $version.StartsWith($ExpectedVersion)) {
                return $candidate
            }
        } catch {}
    }

    throw "Cannot find Godot 4.7.2. Set GODOT_BIN to the Godot executable path."
}

$Godot = Resolve-Godot $GodotBin
Write-Host ""
Write-Host "==============================================="
Write-Host "  NGU KHI COMBAT - FULL ANIMATION REVIEW"
Write-Host "==============================================="
Write-Host "[Godot] $Godot"
Write-Host "[Mode] 390x844 - source animation speed 1x"
Write-Host ""

$AssetRoot = Join-Path $GodotProject "art\candidate\combat\ngukhi_v1"
if (-not (Test-Path $AssetRoot)) {
    throw "Ngukhi candidate assets are missing: $AssetRoot"
}

Write-Host "[1/2] Importing candidate resources..."
& $Godot --headless --path $GodotProject --import
if ($LASTEXITCODE -ne 0) {
    throw "Godot import failed with exit code $LASTEXITCODE"
}

Write-Host "[2/2] Opening review window..."
Write-Host "SPACE/ENTER = start or replay"
Write-Host "ESC         = close"
Write-Host ""
& $Godot --path $GodotProject $Scene
exit $LASTEXITCODE
