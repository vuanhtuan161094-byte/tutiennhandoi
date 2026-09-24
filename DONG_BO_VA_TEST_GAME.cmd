@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
title Dong bo local va chay Full Clean

echo ================================================
echo   DONG BO LOCAL ^> GITHUB ^> FULL CLEAN
echo ================================================
echo.

where git >nul 2>&1
if errorlevel 1 goto :nogit

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 goto :notrepo

echo [1/8] Switch to main...
git switch main >nul 2>&1
if errorlevel 1 goto :fail

echo [2/8] Fetch origin/main...
git fetch origin main
if errorlevel 1 goto :fail

echo [3/8] Stage approved local animation assets...
for %%P in (
  "godot/art/approved/character/animation_v2"
  "godot/art/approved/character/standing_idle_atlas.webp"
  "godot/art/approved/home/animation_v2"
  "godot/art/approved/home/animation_v3"
) do (
  if exist "%%~P" (
    git add -A -- "%%~P"
    if errorlevel 1 goto :fail
  )
)

git diff --cached --quiet
if errorlevel 1 (
  echo [4/8] Commit approved local asset changes...
  git commit -m "assets(godot): sync approved local animation assets"
  if errorlevel 1 goto :fail
) else (
  echo [4/8] No new approved local asset changes.
)

echo [5/8] Normalize tracked drift after fetch...
rem Intended approved changes are committed. Anything else tracked is local drift.
git reset --hard HEAD
if errorlevel 1 goto :fail

for /f %%N in ('git rev-list --count origin/main..HEAD') do set "AHEAD=%%N"
if not defined AHEAD set "AHEAD=0"

if "!AHEAD!"=="0" (
  echo [6/8] Local main has no unpublished commits; align to origin/main...
  git reset --hard origin/main
  if errorlevel 1 goto :fail
) else (
  echo [6/8] Rebase !AHEAD! unpublished commit^(s^) onto origin/main, then push...
  git rebase origin/main
  if errorlevel 1 goto :rebasefail
  rem Re-normalize in case Windows tooling rewrote tracked command files.
  git reset --hard HEAD
  if errorlevel 1 goto :fail
  git push origin main
  if errorlevel 1 goto :fail
)

echo [7/8] Verify exact clean checkout...
git reset --hard HEAD >nul
if errorlevel 1 goto :fail
set "DIRTY="
for /f "delims=" %%S in ('git status --short') do set "DIRTY=1"
if defined DIRTY (
  echo.
  echo [ERROR] Working tree still contains unclassified local files:
  git status --short
  echo.
  echo Approved animation assets are auto-synced. Known generated helpers are ignored.
  echo Unknown files are preserved instead of being deleted automatically.
  pause
  exit /b 1
)

echo [8/8] Run Local CI FULL CLEAN...
call "tools\web\TEST_GAME_LOCAL.cmd" full --require-clean
set "RC=%ERRORLEVEL%"
exit /b %RC%

:rebasefail
echo.
echo [ERROR] Rebase failed. No force push was used.
git status --short
echo.
echo Send this output for review; do not delete local assets.
pause
exit /b 1

:fail
echo.
echo [ERROR] Sync/test workflow failed.
git status --short
pause
exit /b 1

:nogit
echo [ERROR] Git not found.
pause
exit /b 1

:notrepo
echo [ERROR] Keep this file in the repository root.
pause
exit /b 1
