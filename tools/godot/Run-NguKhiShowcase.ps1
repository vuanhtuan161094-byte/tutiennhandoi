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

function Add-WithConsoleSibling([System.Collections.Generic.List[string]]$List, [string]$Path) {
    if ([string]::IsNullOrWhiteSpace($Path)) { return }
    if ($Path -match "(?i)\.exe$" -and $Path -notmatch "(?i)_console\.exe$") {
        Add-Candidate $List ($Path -replace "(?i)\.exe$", "_console.exe")
    }
    Add-Candidate $List $Path
}

function Resolve-Godot([string]$Explicit) {
    $candidates = New-Object "System.Collections.Generic.List[string]"
    Add-WithConsoleSibling $candidates $Explicit

    foreach ($name in @(
        "Godot_v4.7.2-stable_win64_console.exe",
        "Godot_v4.7.2-stable_win64.exe",
        "godot_console.exe",
        "godot.exe",
        "godot"
    )) {
        $cmd = Get-Command $name -ErrorAction SilentlyContinue
        if ($null -ne $cmd -and $cmd.Source) {
            Add-WithConsoleSibling $candidates $cmd.Source
        }
    }

    $running = Get-Process -ErrorAction SilentlyContinue |
        Where-Object { $_.ProcessName -like "Godot*" -and $_.Path }
    foreach ($process in $running) {
        Add-WithConsoleSibling $candidates $process.Path
    }

    # Project machine commonly keeps Godot at the top of the same drive as the repo,
    # e.g. E:\Godot_v4.7.2-stable_win64_console.exe. Search only that top level first.
    $repoDriveRoot = [IO.Path]::GetPathRoot($RepoRoot)
    if ($repoDriveRoot) {
        foreach ($pattern in @(
            "Godot_v4.7.2-stable_win64_console.exe",
            "Godot_v4.7.2-stable_win64.exe"
        )) {
            foreach ($file in Get-ChildItem -Path $repoDriveRoot -Filter $pattern -File -ErrorAction SilentlyContinue) {
                Add-WithConsoleSibling $candidates $file.FullName
            }
        }
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
                Add-WithConsoleSibling $candidates $file.FullName
            }
        }
    }

    $failures = New-Object "System.Collections.Generic.List[string]"
    foreach ($candidate in $candidates) {
        try {
            Write-Host "[Godot] Probing $candidate"
            $output = @(& $candidate --version 2>&1)
            $exitCode = $LASTEXITCODE
            $version = ""
            if ($output.Count -gt 0 -and $null -ne $output[0]) {
                $version = ([string]$output[0]).Trim()
            }
            if ($exitCode -eq 0 -and $version.StartsWith($ExpectedVersion)) {
                return $candidate
            }
            $failures.Add("$candidate => exit=$exitCode version='$version'")
        } catch {
            $failures.Add("$candidate => $($_.Exception.Message)")
        }
    }

    $detail = ""
    if ($failures.Count -gt 0) {
        $detail = [Environment]::NewLine + "Candidates tried:" + [Environment]::NewLine + " - " +
            ($failures -join ([Environment]::NewLine + " - "))
    }

    throw "Cannot find working Godot 4.7.2. You can pass the exact exe path to XEM_TOAN_BO_NGUKHI.cmd." + $detail
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
