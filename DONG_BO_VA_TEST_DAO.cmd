@echo off
chcp 65001 >nul
setlocal EnableExtensions
cd /d "%~dp0"

echo [INFO] Compatibility wrapper: DAO closure now uses Feature Closure V3.
echo [INFO] Registered target: dao-fist ^(already CLOSED / LOCKED^).
echo.

if not exist "DONG_BO_VA_TEST_FEATURE.cmd" (
  echo [ERROR] Missing DONG_BO_VA_TEST_FEATURE.cmd
  pause
  exit /b 1
)

call "DONG_BO_VA_TEST_FEATURE.cmd" dao-fist
exit /b %ERRORLEVEL%
