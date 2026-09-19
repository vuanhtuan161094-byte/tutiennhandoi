@echo off
setlocal
cd /d "%~dp0"
echo =================================================
echo   APPROVE GODOT HOME VISUAL BASELINE
echo =================================================
echo.
echo This command copies the latest verified Home screenshot
echo into the committed visual-baseline location.
echo Run it ONLY after explicit visual approval of that screenshot.
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\godot\Approve-HomeBaseline.ps1" -ConfirmApproved
set "EXIT_CODE=%ERRORLEVEL%"
echo.
if "%EXIT_CODE%"=="0" (
  echo [OK] Baseline copied. Review the PNG in Git before commit.
) else (
  echo [FAIL] Baseline approval failed with code %EXIT_CODE%.
)
pause
exit /b %EXIT_CODE%
