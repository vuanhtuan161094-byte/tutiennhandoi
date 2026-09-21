@echo off
chcp 65001 >nul
setlocal EnableExtensions
cd /d "%~dp0"
title Cap nhat Tu Tien Nhan Doi

set "NO_PAUSE="
if /I "%~1"=="--no-pause" set "NO_PAUSE=1"

echo ================================================
echo   CAP NHAT GAME TU GITHUB
echo ================================================
echo.

where git >nul 2>&1
if errorlevel 1 goto :nogit

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 goto :notrepo

rem Never overwrite tracked/staged local edits.
git diff --quiet
if errorlevel 1 goto :dirty
git diff --cached --quiet
if errorlevel 1 goto :dirty

echo [1/5] Fetch origin/main...
git fetch origin main
if errorlevel 1 goto :fail

echo [2/5] Switch to main...
git switch main
if errorlevel 1 goto :fail

echo [3/5] Fast-forward local...
git pull --ff-only origin main
if errorlevel 1 goto :fail

echo [4/5] Remove known obsolete UNTRACKED helper files...
for %%F in (
  "APPLY_CHARACTER_PHASE1.ps1"
  "APPLY_HOME_ASSETS.cmd"
  "Apply-HomeAssets.ps1"
  "CAP_NHAT_GAME_LOCAL_GODOT_V3.cmd"
  "README.txt"
  "RUN_CHARACTER_PHASE1.cmd"
) do (
  if exist "%%~F" (
    git ls-files --error-unmatch -- "%%~F" >nul 2>&1
    if errorlevel 1 (
      del /q "%%~F" >nul 2>&1
      if not exist "%%~F" echo       removed %%~F
    )
  )
)

echo [5/5] Done.
for /f %%S in ('git rev-parse --short HEAD') do set "HEADSHA=%%S"
echo.
echo ================================================
echo   UPDATE SUCCESS - HEAD: %HEADSHA%
echo ================================================
echo.
if not defined NO_PAUSE pause
exit /b 0

:dirty
echo.
echo [STOP] Tracked/staged local edits detected.
git status --short
echo.
echo Commit, stash, or revert them first. Unknown untracked files are never deleted.
if not defined NO_PAUSE pause
exit /b 2

:fail
echo.
echo [ERROR] Update failed. No force reset was used.
git status --short
if not defined NO_PAUSE pause
exit /b 1

:nogit
echo [ERROR] Git not found.
if not defined NO_PAUSE pause
exit /b 1

:notrepo
echo [ERROR] CAP_NHAT_GAME_LOCAL.cmd must stay in the repository root.
if not defined NO_PAUSE pause
exit /b 1
