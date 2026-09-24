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

echo [1/7] Fetch origin/main...
git fetch origin main
if errorlevel 1 goto :fail

echo [2/7] Switch to main...
git switch main >nul 2>&1
if errorlevel 1 goto :fail

echo [3/7] Align tracked files to origin/main...
git reset --hard origin/main
if errorlevel 1 goto :fail

echo [4/7] Stage approved local animation assets only...
set "FOUND="
for %%P in (
  "godot/art/approved/character/animation_v2"
  "godot/art/approved/character/standing_idle_atlas.webp"
  "godot/art/approved/home/animation_v2"
  "godot/art/approved/home/animation_v3"
) do (
  if exist "%%~P" (
    echo       staging %%~P
    git add -A -- "%%~P"
    if errorlevel 1 goto :fail
    set "FOUND=1"
  )
)

git diff --cached --quiet
if errorlevel 1 (
  echo [5/7] Commit local approved assets...
  git commit -m "assets(godot): sync approved local animation assets"
  if errorlevel 1 goto :fail

  echo [6/7] Rebase safely onto latest origin/main and push...
  git fetch origin main
  if errorlevel 1 goto :fail
  git rebase origin/main
  if errorlevel 1 goto :rebasefail
  git push origin main
  if errorlevel 1 goto :fail
) else (
  echo [5/7] No new approved local assets to commit.
  echo [6/7] Nothing to push.
)

echo [7/7] Require clean tree, then run Local CI FULL CLEAN...
for /f "delims=" %%S in ('git status --short') do (
  echo.
  echo [ERROR] Working tree is still dirty:
  git status --short
  echo.
  echo Only approved animation asset paths are auto-synced.
  echo Unknown local files are preserved and must be classified before exact-SHA QA.
  pause
  exit /b 1
)

call "tools\web\TEST_GAME_LOCAL.cmd" full --require-clean
set "RC=%ERRORLEVEL%"
exit /b %RC%

:rebasefail
echo.
echo [ERROR] Rebase failed. No force push will be used.
git status --short
echo.
echo Resolve the conflict or send this output for review.
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
