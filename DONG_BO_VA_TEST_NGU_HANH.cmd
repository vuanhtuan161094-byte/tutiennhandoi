@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
title Dong bo + test Ngũ Hành retirement

echo ================================================
echo   NGU HANH RETIREMENT - SYNC + LOCAL CI
echo ================================================
echo.

call CAP_NHAT_GAME_LOCAL.cmd --no-pause
if errorlevel 1 goto :fail

echo.
echo [TEST] Run Local CI FULL CLEAN...
node "qa\local\run-local-ci.mjs" full --require-clean
if errorlevel 1 goto :fail

echo.
echo ================================================
echo   NGU HANH RETIREMENT: LOCAL CI PASS
echo ================================================
for /f %%S in ('git rev-parse HEAD') do echo Exact SHA: %%S
pause
exit /b 0

:fail
echo.
echo ================================================
echo   NGU HANH RETIREMENT: FAIL
echo ================================================
git status --short
pause
exit /b 1
