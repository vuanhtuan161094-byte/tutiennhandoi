@echo off
chcp 65001 >nul
setlocal EnableExtensions
cd /d "%~dp0"
title Cap nhat Tu Tien Nhan Doi

set "NO_PAUSE="
if /I "%~1"=="--no-pause" set "NO_PAUSE=1"

echo ================================================
echo   CAP NHAT GAME TU GITHUB
echo   GitHub = source of truth
echo ================================================
echo.

where git >nul 2>&1
if errorlevel 1 goto :nogit

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 goto :notrepo

echo [1/5] Fetch origin/main...
git fetch origin main
if errorlevel 1 goto :fail

echo [2/5] Switch to main...
git switch main >nul 2>&1
if errorlevel 1 goto :fail

echo [3/5] Mirror TRACKED files exactly from origin/main...
git reset --hard origin/main
if errorlevel 1 goto :fail

echo [4/5] Remove known obsolete UNTRACKED helper files...
for %%F in (
  "APPLY_CHARACTER_PHASE1.ps1"
  "APPLY_HOME_ASSETS.cmd"
  "Apply-HomeAssets.ps1"
  "CAP_NHAT_GAME_LOCAL_GODOT_V3.cmd"
  "README.txt"
  "RUN_CHARACTER_PHASE1.cmd"
  "KHOI_PHUC_LOCAL_1_LAN.cmd"
  "KHOI_PHUC_LOCAL_1_LAN (1).cmd"
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
echo Tracked local edits are intentionally replaced by GitHub main.
echo Unknown untracked files are preserved.
echo.
if not defined NO_PAUSE pause
exit /b 0

:fail
echo.
echo [ERROR] Update failed.
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
