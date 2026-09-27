@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
title Dong bo va test retire Ngu Hanh Equipment

echo ================================================
echo   NGU HANH EQUIPMENT RETIREMENT - LOCAL CLOSURE
echo ================================================
echo.

where git >nul 2>&1
if errorlevel 1 goto :nogit
where node >nul 2>&1
if errorlevel 1 goto :nonode

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 goto :notrepo

echo [1/6] Switch to main...
git switch main >nul 2>&1
if errorlevel 1 goto :fail

echo [2/6] Fetch origin/main...
git fetch origin main
if errorlevel 1 goto :fail

echo [3/6] Align tracked files to GitHub main...
git reset --hard origin/main
if errorlevel 1 goto :fail

echo [4/6] Verify clean checkout...
set "DIRTY="
for /f "delims=" %%S in ('git status --short') do set "DIRTY=1"
if defined DIRTY (
  echo.
  echo [ERROR] Working tree is not clean:
  git status --short
  echo.
  echo Unknown untracked files are preserved. Clean/review them before closure.
  pause
  exit /b 1
)

echo [5/6] Run targeted Ngu Hanh retirement regression...
node "qa\tests\nguhanh-equipment-retirement-regression-test.js"
if errorlevel 1 goto :fail

echo [6/6] Run Local CI FULL CLEAN...
node "qa\local\run-local-ci.mjs" full --require-clean
if errorlevel 1 goto :fail

echo.
echo ================================================
echo   NGU HANH RETIREMENT LOCAL CLOSURE: PASS
echo ================================================
for /f %%S in ('git rev-parse HEAD') do echo Exact SHA: %%S
pause
exit /b 0

:fail
echo.
echo [ERROR] Ngu Hanh retirement closure failed.
git status --short
pause
exit /b 1

:nogit
echo [ERROR] Git not found.
pause
exit /b 1

:nonode
echo [ERROR] Node.js not found.
pause
exit /b 1

:notrepo
echo [ERROR] Keep this CMD in the repository root.
pause
exit /b 1
