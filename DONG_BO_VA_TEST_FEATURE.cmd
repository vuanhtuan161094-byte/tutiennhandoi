@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
title Dong bo va test Feature Closure

set "FEATURE=%~1"
set "NO_PAUSE="
if /I "%~2"=="--no-pause" set "NO_PAUSE=1"

echo ================================================
echo   FEATURE CLOSURE V3
echo   UPDATE ^> FULL CLEAN ^> SCOPED FEATURE GATE
echo ================================================
echo.

if not exist "CAP_NHAT_GAME_LOCAL.cmd" goto :wrongfolder
if not exist "qa\local\run-local-ci.mjs" goto :wrongfolder
if not exist "qa\runners\v140-backend-gates.js" goto :wrongfolder

echo [1/4] Update clean local checkout from GitHub main...
call "CAP_NHAT_GAME_LOCAL.cmd" --no-pause
if errorlevel 1 goto :fail

if not defined FEATURE (
  echo.
  node "qa\runners\v140-backend-gates.js" feature-list
  echo.
  set /p "FEATURE=Feature id: "
)
if not defined FEATURE goto :usage

echo.
echo [2/4] Validate feature manifest: !FEATURE!
node "qa\runners\v140-backend-gates.js" feature-info "!FEATURE!"
if errorlevel 1 goto :fail

echo.
echo NOTE: deterministic identity-valid benchmark evidence is a precondition.
echo This closure launcher does not auto-rerun feature-specific balance benchmarks.
echo.

echo [3/4] Run FULL CLEAN exact-candidate proof...
node "qa\local\run-local-ci.mjs" full --require-clean
if errorlevel 1 goto :fail

echo.
echo [4/4] Run scoped feature backend closure...
node "qa\runners\v140-backend-gates.js" feature "!FEATURE!"
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
echo   FEATURE FULL CLEAN + SCOPED CLOSURE: PASS
echo ================================================
echo Feature : !FEATURE!
echo Exact SHA: !HEADSHA!
echo.
echo Full-game backend closure remains a separate audit.
echo.
if not defined NO_PAUSE pause
exit /b 0

:usage
echo.
echo [ERROR] Missing feature id.
echo Usage: DONG_BO_VA_TEST_FEATURE.cmd ^<feature-id^>
echo Example: DONG_BO_VA_TEST_FEATURE.cmd dao-fist
echo.
if not defined NO_PAUSE pause
exit /b 2

:fail
echo.
echo [ERROR] Feature closure workflow failed.
git status --short
if not defined NO_PAUSE pause
exit /b 1

:wrongfolder
echo [ERROR] Keep DONG_BO_VA_TEST_FEATURE.cmd in the repository root.
if not defined NO_PAUSE pause
exit /b 1
