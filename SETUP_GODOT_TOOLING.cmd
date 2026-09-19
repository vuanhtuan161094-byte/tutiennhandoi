@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\godot\Setup-GodotTooling.ps1" %*
set "EXIT_CODE=%ERRORLEVEL%"
echo.
if not "%EXIT_CODE%"=="0" (
  echo [FAIL] Godot tooling setup failed with code %EXIT_CODE%.
  pause
)
exit /b %EXIT_CODE%
