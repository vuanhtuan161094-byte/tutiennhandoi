@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Update Tu Tien Nhan Roi

echo ================================================
echo   UPDATE LOCAL FROM ORIGIN MAIN
echo ================================================
echo.

where git >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Git was not found on this computer.
  pause
  exit /b 1
)

git rev-parse --is-inside-work-tree >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Put this CMD file in the repo root folder.
  pause
  exit /b 1
)

rem Block only tracked/staged local edits. Ignore untracked artifacts.
git diff --quiet
if errorlevel 1 goto :dirty
git diff --cached --quiet
if errorlevel 1 goto :dirty

echo [1/4] Fetching latest origin/main...
git fetch origin main
if errorlevel 1 goto :fail

echo [2/4] Switching to main...
git switch main
if errorlevel 1 goto :fail

echo [3/4] Pulling with fast-forward only...
git pull --ff-only origin main
if errorlevel 1 goto :fail

echo [4/4] Done.
for /f %%S in ('git rev-parse --short HEAD') do set "HEADSHA=%%S"
echo.
echo ================================================
echo   UPDATE SUCCESS - HEAD: %HEADSHA%
echo ================================================
echo.
pause
exit /b 0

:dirty
echo.
echo [STOP] There are tracked or staged local changes.
git status --short
echo.
echo Commit, stash, or revert them, then run this CMD again.
pause
exit /b 2

:fail
echo.
echo [ERROR] Update failed. No force reset was used.
git status --short
echo.
pause
exit /b 1
