@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
title Cap nhat Tu Tien Nhan Doi

set "NO_PAUSE="
set "POST_SYNC="
if /I "%~1"=="--no-pause" set "NO_PAUSE=1"
if /I "%~1"=="--post-sync" set "POST_SYNC=1"
if /I "%~2"=="--no-pause" set "NO_PAUSE=1"
if /I "%~2"=="--post-sync" set "POST_SYNC=1"

echo ================================================
echo   CAP NHAT GAME TU GITHUB
echo ================================================
echo.

where git >nul 2>&1
if errorlevel 1 goto :nogit

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 goto :notrepo

if defined POST_SYNC goto :cleanup

rem Never overwrite tracked/staged local edits.
git diff --quiet
if errorlevel 1 goto :dirty
git diff --cached --quiet
if errorlevel 1 goto :dirty

for /f "delims=" %%H in ('git rev-parse HEAD') do set "OLD_HEAD=%%H"

echo [1/5] Fetch origin/main...
git fetch origin main
if errorlevel 1 goto :fail

echo [2/5] Switch to main...
git switch main
if errorlevel 1 goto :fail

echo [3/5] Fast-forward local...
git pull --ff-only origin main
if errorlevel 1 goto :fail

for /f "delims=" %%H in ('git rev-parse HEAD') do set "NEW_HEAD=%%H"
if /I not "!OLD_HEAD!"=="!NEW_HEAD!" (
  echo       Updater changed with the repository. Restarting the NEW updater once...
  if defined NO_PAUSE (
    call "%~f0" --post-sync --no-pause
  ) else (
    call "%~f0" --post-sync
  )
  exit /b !ERRORLEVEL!
)

:cleanup
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
echo This updater will NOT overwrite them automatically.
echo If this machine is only a GitHub mirror, run KHOI_PHUC_LOCAL_1_LAN.cmd once.
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
