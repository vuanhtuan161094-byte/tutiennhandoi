@echo off
chcp 65001 >nul
setlocal EnableExtensions
cd /d "%~dp0"
title Tu Tien Nhan Doi - Godot Phase 1 Smoke

echo ================================================
echo   GODOT PHASE 1 - CANONICAL BACKEND SMOKE
echo ================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [FAIL] Khong tim thay Node.js trong PATH.
  echo        Godot bridge se khong the khoi dong.
  pause
  exit /b 1
)

if not exist "godot\backend\bridge_smoke.mjs" (
  echo [FAIL] Thieu godot\backend\bridge_smoke.mjs
  pause
  exit /b 1
)

echo [1/1] Testing canonical bridge, action, autosave, restart...
node godot\backend\bridge_smoke.mjs
if errorlevel 1 (
  echo.
  echo ================================================
  echo   PHASE 1 BACKEND: FAIL
  echo ================================================
  echo.
  pause
  exit /b 1
)

echo.
echo ================================================
echo   PHASE 1 BACKEND: PASS
echo ================================================
echo.
echo Backend gate da PASS.
echo Buoc con lai: mo Godot va F5 de xac nhan runtime khong co error
echo va header hien "CANONICAL V140 - ONLINE".
echo.
pause
exit /b 0
