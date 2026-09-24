@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
title Dong bo local va chay Full Clean + Canonical

echo ================================================
echo   DONG BO LOCAL ^> GITHUB ^> FULL CLEAN ^> CANONICAL
echo ================================================
echo.

where git >nul 2>&1
if errorlevel 1 goto :nogit

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 goto :notrepo

echo [1/10] Switch to main...
git switch main >nul 2>&1
if errorlevel 1 goto :fail

echo [2/10] Fetch origin/main...
git fetch origin main
if errorlevel 1 goto :fail

echo [3/10] Stage approved local animation assets...
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
  echo [4/10] Commit approved local asset changes...
  git commit -m "assets(godot): sync approved local animation assets"
  if errorlevel 1 goto :fail
) else (
  echo [4/10] No new approved local asset changes.
)

echo [5/10] Normalize tracked drift after fetch...
rem Intended approved changes are committed. Anything else tracked is local drift.
git reset --hard HEAD
if errorlevel 1 goto :fail

for /f %%N in ('git rev-list --count origin/main..HEAD') do set "AHEAD=%%N"
if not defined AHEAD set "AHEAD=0"

if "!AHEAD!"=="0" (
  echo [6/10] Local main has no unpublished commits; align to origin/main...
  git reset --hard origin/main
  if errorlevel 1 goto :fail
) else (
  echo [6/10] Rebase !AHEAD! unpublished commit^(s^) onto origin/main, then push...
  git rebase origin/main
  if errorlevel 1 goto :rebasefail
  rem Re-normalize in case Windows tooling rewrote tracked command files.
  git reset --hard HEAD
  if errorlevel 1 goto :fail
  git push origin main
  if errorlevel 1 goto :fail
)

echo [7/10] Verify exact clean checkout...
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

echo [8/10] Run Local CI FULL CLEAN...
node "qa\local\run-local-ci.mjs" full --require-clean
if errorlevel 1 goto :fail

echo [9/10] Run Backend Canonical Closure...
node "qa\runners\v140-backend-gates.js" closure
if errorlevel 1 goto :fail

echo [10/10] Run Frontend Canonical Closure...
node "qa\runners\v140-frontend-gates.js" closure
if errorlevel 1 goto :fail

echo.
echo ================================================
echo   FULL CLEAN + CANONICAL: PASS
echo ================================================
echo.
for /f %%S in ('git rev-parse --short HEAD') do echo Exact SHA: %%S
pause
exit /b 0

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
