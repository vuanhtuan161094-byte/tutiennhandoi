@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
title Tu Tien Nhan Doi - Godot Local

set "BRANCH=main"
set "PROJECT=%CD%\godot"
set "SELF_NAME=%~nx0"

cls
echo ================================================
echo   TU TIEN NHAN DOI - GODOT LOCAL
echo   1 click: sync main ^> open Godot game
echo ================================================
echo.

where git >nul 2>&1
if errorlevel 1 goto :nogit

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 goto :notrepo

rem Never overwrite tracked/staged user edits.
git diff --quiet
if errorlevel 1 goto :dirty
git diff --cached --quiet
if errorlevel 1 goto :dirty

echo [1/4] Fetch origin/main...
git fetch origin %BRANCH%
if errorlevel 1 goto :syncfail

set "SELF_UNTRACKED="
for /f "delims=" %%S in ('git ls-files --others --exclude-standard -- "%SELF_NAME%"') do set "SELF_UNTRACKED=1"

echo [2/4] Backup only untracked files that collide with origin/main...
set "TUTIEN_SYNC_SELF=%SELF_NAME%"
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference='Stop';" ^
  "$root=(git rev-parse --show-toplevel).Trim();" ^
  "$self=$env:TUTIEN_SYNC_SELF;" ^
  "$tracked=@{};" ^
  "@(git -c core.quotepath=false ls-tree -r --name-only origin/main) | ForEach-Object { $tracked[[string]$_]=$true };" ^
  "$items=@(git -c core.quotepath=false ls-files --others --exclude-standard) | Where-Object { $_ -and $_ -ne $self -and $_ -notlike '.local-sync-backup/*' };" ^
  "$stamp=Get-Date -Format 'yyyyMMdd-HHmmss';" ^
  "$backup=Join-Path $root ('.local-sync-backup\'+$stamp);" ^
  "$moved=0;" ^
  "foreach($p in $items){" ^
  " if($tracked.ContainsKey([string]$p)){" ^
  "   $src=Join-Path $root $p;" ^
  "   $dst=Join-Path $backup $p;" ^
  "   [void][System.IO.Directory]::CreateDirectory((Split-Path $dst -Parent));" ^
  "   Move-Item -LiteralPath $src -Destination $dst -Force;" ^
  "   $moved++;" ^
  " }" ^
  "};" ^
  "if($moved -gt 0){Write-Host ('       Backed up '+$moved+' colliding file(s) to '+$backup)}"
if errorlevel 1 goto :syncfail

for /f "delims=" %%B in ('git branch --show-current') do set "CURRENT_BRANCH=%%B"
if /I not "!CURRENT_BRANCH!"=="%BRANCH%" (
  git switch %BRANCH% >nul 2>&1
  if errorlevel 1 goto :syncfail
)

rem Bootstrap when this launcher itself is untracked but origin/main already tracks it.
if defined SELF_UNTRACKED (
  git cat-file -e "origin/%BRANCH%:%SELF_NAME%" >nul 2>&1
  if not errorlevel 1 (
    git merge-base --is-ancestor HEAD origin/%BRANCH% >nul 2>&1
    if errorlevel 1 goto :syncfail
    for /f "delims=" %%H in ('git rev-parse HEAD') do set "OLD_HEAD=%%H"
    git update-ref refs/heads/%BRANCH% origin/%BRANCH% !OLD_HEAD!
    if errorlevel 1 goto :syncfail
    git reset --hard HEAD >nul
    if errorlevel 1 goto :syncfail
    goto :synced
  )
)

git pull --ff-only origin %BRANCH%
if errorlevel 1 goto :syncfail

:synced
for /f "delims=" %%H in ('git rev-parse --short HEAD') do set "HEAD_SHA=%%H"
echo       HEAD = !HEAD_SHA!

echo [3/4] Find Godot 4.7.2...
set "GODOT_BIN="

for %%G in (
  "Godot_v4.7.2-stable_win64_console.exe"
  "Godot_v4.7.2-stable_win64.exe"
  "godot_console.exe"
  "godot.exe"
) do (
  if not defined GODOT_BIN (
    for /f "delims=" %%P in ('where %%~G 2^>nul') do (
      if not defined GODOT_BIN set "GODOT_BIN=%%P"
    )
  )
)

if not defined GODOT_BIN (
  for %%R in ("%USERPROFILE%\Downloads" "%USERPROFILE%\Desktop" "%CD%") do (
    if exist "%%~R" (
      for /f "delims=" %%P in ('dir /b /s "%%~R\Godot_v4.7.2-stable_win64_console.exe" 2^>nul') do (
        if not defined GODOT_BIN set "GODOT_BIN=%%P"
      )
      for /f "delims=" %%P in ('dir /b /s "%%~R\Godot_v4.7.2-stable_win64.exe" 2^>nul') do (
        if not defined GODOT_BIN set "GODOT_BIN=%%P"
      )
    )
  )
)

if not defined GODOT_BIN goto :nogodot

for /f "delims=" %%V in ('"!GODOT_BIN!" --version 2^>nul') do set "GODOT_VERSION=%%V"
echo       !GODOT_VERSION!

echo [4/4] Open game...
start "Tu Tien Nhan Doi - Godot" "!GODOT_BIN!" --path "%PROJECT%"
if errorlevel 1 goto :launchfail

echo.
echo ================================================
echo   SYNCED + GAME OPENED
echo ================================================
echo.
timeout /t 2 /nobreak >nul
exit /b 0

:dirty
echo.
echo [STOP] Tracked/staged local edits detected.
git status --short
echo.
echo Untracked files are safe; only colliding untracked files are auto-backed-up.
pause
exit /b 2

:syncfail
echo.
echo [ERROR] Could not sync origin/main.
echo No tracked local edits were force-reset.
echo Colliding untracked files, if any, were moved to .local-sync-backup.
pause
exit /b 1

:nogit
echo [ERROR] Git not found.
pause
exit /b 1

:notrepo
echo [ERROR] Put this CMD in the repository root.
pause
exit /b 1

:nogodot
echo.
echo [ERROR] Godot 4.7.2 not found.
echo Put Godot_v4.7.2-stable_win64.exe in PATH, Downloads, Desktop, or the repo.
pause
exit /b 1

:launchfail
echo [ERROR] Godot was found but the project could not be opened.
pause
exit /b 1
