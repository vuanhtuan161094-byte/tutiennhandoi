@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
if errorlevel 1 goto :badpath

set "GAME_LABEL=COMBAT LAYOUT STUDIO"
set "GAME_HOST=127.0.0.1"
set "GAME_BIND=0.0.0.0"

where node >nul 2>&1
if errorlevel 1 goto :nonode
if not exist "web\server.mjs" goto :wrongfolder
if not exist "combat-layout-studio.html" goto :wrongfolder
if not exist "modules\combat-layout-studio-v1.js" goto :wrongfolder
if not exist "dist\core\session.js" goto :nodist

for %%P in (4273 4274 4275 4276 4277 4278 4279 4280) do (
  if not defined FOUND_PORT (
    powershell -NoProfile -Command "$c=New-Object Net.Sockets.TcpClient; try{$c.Connect('127.0.0.1',%%P); exit 1}catch{exit 0}finally{$c.Dispose()}" >nul 2>&1
    if not errorlevel 1 set "FOUND_PORT=%%P"
  )
)
if not defined FOUND_PORT goto :noport
set "GAME_PORT=!FOUND_PORT!"

cls
echo ========================================
echo   TU TIEN - COMBAT LAYOUT STUDIO
echo ========================================
echo.
echo Studio: http://%GAME_HOST%:!GAME_PORT!/combat-layout-studio.html
echo Preview dung game runtime that; khong thay doi gameplay/save.
echo.

start "Tu Tien Server - %GAME_LABEL%" cmd /k "node web\server.mjs !GAME_PORT! !GAME_BIND!"

set /a WAIT_COUNT=0
:wait_server
powershell -NoProfile -Command "try{$r=Invoke-WebRequest -UseBasicParsing -TimeoutSec 1 'http://127.0.0.1:!GAME_PORT!/__tutien_launcher_health'; if($r.StatusCode -eq 200){exit 0}else{exit 1}}catch{exit 1}" >nul 2>&1
if not errorlevel 1 goto :server_ready
set /a WAIT_COUNT+=1
if !WAIT_COUNT! GEQ 15 goto :server_failed
timeout /t 1 /nobreak >nul
goto :wait_server

:server_ready
start "" "http://127.0.0.1:!GAME_PORT!/combat-layout-studio.html"
echo Da mo Combat Layout Studio.
echo Keo Player/Boss/HUD truc tiep tren khung preview, sau do bam Copy JSON.
echo Hay GIU CUA SO "Tu Tien Server - %GAME_LABEL%" mo trong luc chinh.
echo.
timeout /t 2 /nobreak >nul
exit /b 0

:server_failed
echo [LOI] Server khong khoi dong duoc sau 15 giay.
pause
exit /b 1

:nonode
echo [LOI] Khong tim thay Node.js trong PATH.
pause
exit /b 1

:wrongfolder
echo [LOI] Thieu file Combat Layout Studio trong thu muc:
echo   %CD%
echo Hay chay CAP_NHAT_GAME_LOCAL.cmd truoc.
pause
exit /b 1

:nodist
echo [LOI] Khong tim thay dist\core\session.js.
pause
exit /b 1

:noport
echo [LOI] Cac cong DEV 4273-4280 deu dang duoc su dung.
echo Dong server DEV cu roi chay lai.
pause
exit /b 1

:badpath
echo [LOI] Khong the mo thu muc game.
pause
exit /b 1
