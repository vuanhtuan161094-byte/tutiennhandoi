@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
title Dong bo va test Dao Closure

echo ================================================
echo   DAO CLOSURE - UPDATE ^> FULL CLEAN ^> DAO GATE
echo ================================================
echo.

if not exist "CAP_NHAT_GAME_LOCAL.cmd" goto :wrongfolder
if not exist "qa\local\run-local-ci.mjs" goto :wrongfolder
if not exist "qa\runners\v140-backend-gates.js" goto :wrongfolder

call "CAP_NHAT_GAME_LOCAL.cmd" --no-pause
if errorlevel 1 goto :fail

echo.
echo [2/3] Run FULL CLEAN candidate proof...
node "qa\local\run-local-ci.mjs" full --require-clean
if errorlevel 1 goto :fail

echo.
echo [3/3] Run scoped Main Dao backend closure...
node "qa\runners\v140-backend-gates.js" dao
if errorlevel 1 goto :fail

set "DIRTY="
for /f "delims=" %%S in ('git status --short') do set "DIRTY=1"
if defined DIRTY (
  echo.
  echo [ERROR] Tests passed but working tree is not clean:
  git status --short
  goto :fail
)

for /f %%S in ('git rev-parse HEAD') do set "HEADSHA=%%S"
echo.
echo ================================================
echo   DAO FULL CLEAN + SCOPED CLOSURE: PASS
echo ================================================
echo Exact SHA: !HEADSHA!
echo.
echo Full-game backend closure remains a separate audit and is not modified by this command.
pause
exit /b 0

:fail
echo.
echo [ERROR] Dao closure workflow failed.
git status --short
pause
exit /b 1

:wrongfolder
echo [ERROR] Keep DONG_BO_VA_TEST_DAO.cmd in the repository root.
pause
exit /b 1
