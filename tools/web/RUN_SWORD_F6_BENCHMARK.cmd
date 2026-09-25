@echo off
setlocal
cd /d "%~dp0\..\.."
echo ============================================================
echo SWORD DAO F6 - DETERMINISTIC BALANCE HARNESS
echo ============================================================
where node >nul 2>nul
if errorlevel 1 (
  echo [FAIL] Node.js not found in PATH.
  exit /b 1
)
node qa\benchmarks\sword-dao-f6-benchmark.js %*
if errorlevel 1 (
  echo.
  echo [FAIL] Sword F6 benchmark failed.
  exit /b 1
)
echo.
echo [OK] Output: qa\output\sword-f6-benchmark.json
exit /b 0
