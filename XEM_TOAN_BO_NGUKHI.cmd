@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\godot\Run-NguKhiShowcase.ps1"
set "RC=%ERRORLEVEL%"
echo.
if not "%RC%"=="0" echo [FAIL] Ngu Khi showcase exited with code %RC%.
pause
exit /b %RC%
