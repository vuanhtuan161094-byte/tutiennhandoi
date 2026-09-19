@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\godot\Verify-GodotLocal.ps1" %*
set "EXIT_CODE=%ERRORLEVEL%"
echo.
if "%EXIT_CODE%"=="0" (
  echo [PASS] Godot verification completed.
) else (
  echo [FAIL] Godot verification failed with code %EXIT_CODE%.
)
pause
exit /b %EXIT_CODE%
