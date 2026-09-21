@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion

rem ============================================================
rem SELF-UPDATE-SAFE BOOTSTRAP
rem Never run git update from the root CHOI_GAME.cmd itself.
rem cmd.exe reads batch files incrementally; replacing a running
rem batch file can move the read cursor into the middle of a line.
rem ============================================================
if /I "%~1"=="--bootstrap" goto :bootstrap
if /I "%~1"=="--post-update" goto :post_update

set "ROOT=%~dp0"
set "TEMP_LAUNCHER=%TEMP%\tutien_choi_game_%RANDOM%_%RANDOM%.cmd"
copy /y "%~f0" "%TEMP_LAUNCHER%" >nul
if errorlevel 1 (
  echo [ERROR] Khong tao duoc launcher tam.
  pause
  exit /b 1
)
call "%TEMP_LAUNCHER%" --bootstrap "%ROOT%"
set "BOOT_RC=%ERRORLEVEL%"
del /q "%TEMP_LAUNCHER%" >nul 2>&1
exit /b %BOOT_RC%

:bootstrap
set "ROOT=%~2"
cd /d "%ROOT%"
title Tu Tien Nhan Doi - Update

cls
echo ================================================
echo   TU TIEN NHAN DOI
echo   1 click = cap nhat main + bridge + mo Godot
echo ================================================
echo.

call "%ROOT%CAP_NHAT_GAME_LOCAL.cmd" --no-pause
if errorlevel 1 (
  echo.
  echo [STOP] Khong cap nhat duoc game. Godot chua duoc mo.
  pause
  exit /b 1
)

rem Root CHOI_GAME.cmd may have changed during update.
rem Start the freshly updated copy; do not continue old logic.
call "%ROOT%CHOI_GAME.cmd" --post-update
exit /b %ERRORLEVEL%

:post_update
cd /d "%~dp0"
title Tu Tien Nhan Doi

set "PROJECT=%CD%\godot"
set "GODOT_BIN="
set "NODE_BIN="
set "BRIDGE_PATH=%PROJECT%\backend\bridge_server.mjs"
set "BRIDGE_PID_FILE=%PROJECT%\.runtime\bridge.pid"
set "BRIDGE_STDOUT=%PROJECT%\.runtime\bridge.stdout.log"
set "BRIDGE_STDERR=%PROJECT%\.runtime\bridge.stderr.log"
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

echo [BRIDGE] Kiem tra syntax backend...
pushd "%PROJECT%\backend"
"%NODE_BIN%" --check bridge_server.mjs
set "BRIDGE_CHECK_RC=%ERRORLEVEL%"
popd
if not "%BRIDGE_CHECK_RC%"=="0" (
  echo.
  echo [ERROR] bridge_server.mjs co loi syntax. Godot chua duoc mo.
  pause
  exit /b %BRIDGE_CHECK_RC%
)

echo [BRIDGE] Khoi dong canonical backend...
set "NODE_BIN_ENV=%NODE_BIN%"
set "BRIDGE_DIR_ENV=%PROJECT%\backend"
set "BRIDGE_PID_ENV=%BRIDGE_PID_FILE%"
set "BRIDGE_STDOUT_ENV=%BRIDGE_STDOUT%"
set "BRIDGE_STDERR_ENV=%BRIDGE_STDERR%"
del /q "%BRIDGE_STDOUT%" >nul 2>&1
del /q "%BRIDGE_STDERR%" >nul 2>&1
rem IMPORTANT: run a RELATIVE script name from backend working directory.
rem This avoids Windows/PowerShell splitting the repository path at spaces.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$p=Start-Process -FilePath $env:NODE_BIN_ENV -ArgumentList @('bridge_server.mjs','4192') -WorkingDirectory $env:BRIDGE_DIR_ENV -RedirectStandardOutput $env:BRIDGE_STDOUT_ENV -RedirectStandardError $env:BRIDGE_STDERR_ENV -WindowStyle Hidden -PassThru; Set-Content -LiteralPath $env:BRIDGE_PID_ENV -Value $p.Id"
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
echo.
if exist "%BRIDGE_STDERR%" (
  echo -------- bridge stderr --------
  type "%BRIDGE_STDERR%"
)
if exist "%BRIDGE_STDOUT%" (
  echo -------- bridge stdout --------
  type "%BRIDGE_STDOUT%"
)
echo -------------------------------
if exist "%BRIDGE_PID_FILE%" (
  for /f "usebackq delims=" %%P in ("%BRIDGE_PID_FILE%") do taskkill /PID %%P /T /F >nul 2>&1
  del /q "%BRIDGE_PID_FILE%" >nul 2>&1
)
pause
exit /b 1
