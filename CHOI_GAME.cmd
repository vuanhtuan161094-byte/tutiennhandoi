@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
title Tu Tien Nhan Doi

cls
echo ================================================
echo   TU TIEN NHAN DOI
echo   1 click = cap nhat main + bridge + mo Godot
echo ================================================
echo.

call "%~dp0CAP_NHAT_GAME_LOCAL.cmd" --no-pause
if errorlevel 1 (
  echo.
  echo [STOP] Khong cap nhat duoc game. Godot chua duoc mo.
  pause
  exit /b 1
)

set "PROJECT=%CD%\godot"
set "GODOT_BIN="
set "NODE_BIN="
set "BRIDGE_PATH=%PROJECT%\backend\bridge_server.mjs"
set "BRIDGE_PID_FILE=%PROJECT%\.runtime\bridge.pid"
set "BRIDGE_OWNED=0"

echo [GAME] Tim Godot 4.7.2...
for %%G in (
  "Godot_v4.7.2-stable_win64_console.exe"
  "Godot_v4.7.2-stable_win64.exe"
  "godot_console.exe"
  "godot.exe"
) do (
  if not defined GODOT_BIN (
    for /f "delims=" %%P in ('where %%~G 2^>nul') do (
      if not defined GODOT_BIN set "GODOT_BIN=%%P"
    )
  )
)

if not defined GODOT_BIN (
  for %%R in ("%USERPROFILE%\Downloads" "%USERPROFILE%\Desktop" "%CD%") do (
    if exist "%%~R" (
      for /f "delims=" %%P in ('dir /b /s "%%~R\Godot_v4.7.2-stable_win64_console.exe" 2^>nul') do (
        if not defined GODOT_BIN set "GODOT_BIN=%%P"
      )
      for /f "delims=" %%P in ('dir /b /s "%%~R\Godot_v4.7.2-stable_win64.exe" 2^>nul') do (
        if not defined GODOT_BIN set "GODOT_BIN=%%P"
      )
    )
  )
)

if not defined GODOT_BIN (
  echo.
  echo [ERROR] Khong tim thay Godot 4.7.2.
  echo Dat Godot_v4.7.2-stable_win64.exe trong PATH, Downloads, Desktop, hoac repo.
  pause
  exit /b 1
)

echo [BRIDGE] Tim Node.js...
for /f "delims=" %%P in ('where node 2^>nul') do (
  if not defined NODE_BIN set "NODE_BIN=%%P"
)
if not defined NODE_BIN if exist "%ProgramFiles%\nodejs\node.exe" set "NODE_BIN=%ProgramFiles%\nodejs\node.exe"
if not defined NODE_BIN if exist "%ProgramFiles(x86)%\nodejs\node.exe" set "NODE_BIN=%ProgramFiles(x86)%\nodejs\node.exe"
if not defined NODE_BIN if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" set "NODE_BIN=%LOCALAPPDATA%\Programs\nodejs\node.exe"

if not defined NODE_BIN (
  echo.
  echo [ERROR] Khong tim thay Node.js. Home se khong co Tu Vi/Linh Can.
  echo Cai Node.js LTS roi chay lai CHOI_GAME.cmd.
  pause
  exit /b 1
)

if not exist "%PROJECT%\.runtime" mkdir "%PROJECT%\.runtime" >nul 2>&1

echo [BRIDGE] Kiem tra backend...
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r=Invoke-RestMethod -Uri 'http://127.0.0.1:4192/health' -TimeoutSec 1; if($r.ok -and $r.bridgeVersion -eq 'godot-bridge.v2'){exit 0} } catch {}; exit 1"
if not errorlevel 1 goto :bridge_ready

echo [BRIDGE] Khoi dong canonical backend...
set "NODE_BIN_ENV=%NODE_BIN%"
set "BRIDGE_PATH_ENV=%BRIDGE_PATH%"
set "BRIDGE_PID_ENV=%BRIDGE_PID_FILE%"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$p=Start-Process -FilePath $env:NODE_BIN_ENV -ArgumentList @($env:BRIDGE_PATH_ENV,'4192') -WindowStyle Hidden -PassThru; Set-Content -LiteralPath $env:BRIDGE_PID_ENV -Value $p.Id"
if errorlevel 1 goto :bridge_fail
set "BRIDGE_OWNED=1"

for /L %%I in (1,1,12) do (
  powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r=Invoke-RestMethod -Uri 'http://127.0.0.1:4192/health' -TimeoutSec 1; if($r.ok -and $r.bridgeVersion -eq 'godot-bridge.v2'){exit 0} } catch {}; exit 1"
  if not errorlevel 1 goto :bridge_ready
  timeout /t 1 /nobreak >nul
)

goto :bridge_fail

:bridge_ready
echo       Bridge OK - http://127.0.0.1:4192
set "TUTIEN_GODOT_BRIDGE_EXTERNAL=1"

for /f "delims=" %%V in ('"!GODOT_BIN!" --version 2^>nul') do set "GODOT_VERSION=%%V"
echo [GAME] !GODOT_VERSION!
echo [GAME] Mo project...
"!GODOT_BIN!" --path "%PROJECT%"
set "GAME_EXIT=%ERRORLEVEL%"

if "%BRIDGE_OWNED%"=="1" (
  if exist "%BRIDGE_PID_FILE%" (
    for /f "usebackq delims=" %%P in ("%BRIDGE_PID_FILE%") do taskkill /PID %%P /T /F >nul 2>&1
    del /q "%BRIDGE_PID_FILE%" >nul 2>&1
  )
)

exit /b %GAME_EXIT%

:bridge_fail
echo.
echo [ERROR] Backend bridge khong khoi dong duoc.
echo Node: %NODE_BIN%
echo Script: %BRIDGE_PATH%
if exist "%BRIDGE_PID_FILE%" (
  for /f "usebackq delims=" %%P in ("%BRIDGE_PID_FILE%") do taskkill /PID %%P /T /F >nul 2>&1
  del /q "%BRIDGE_PID_FILE%" >nul 2>&1
)
pause
exit /b 1
