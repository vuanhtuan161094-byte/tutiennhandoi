@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
if errorlevel 1 goto :badpath

set "GAME_LABEL=V129 UI DEV · COMBAT V8"
set "GAME_HOST=127.0.0.1"
set "GAME_BIND=0.0.0.0"

where node >nul 2>&1
if errorlevel 1 goto :nonode
if not exist "web\server.mjs" goto :wrongfolder
if not exist "index.html" goto :wrongfolder
if not exist "standalone-runtime.js" goto :wrongfolder
if not exist "dist\core\session.js" goto :nodist

for %%P in (4173 4174 4175 4176 4177 4178 4179 4180) do (
  if not defined FOUND_PORT (
    powershell -NoProfile -Command "$c=New-Object Net.Sockets.TcpClient; try{$c.Connect('127.0.0.1',%%P); exit 1}catch{exit 0}finally{$c.Dispose()}" >nul 2>&1
    if not errorlevel 1 set "FOUND_PORT=%%P"
  )
)
if not defined FOUND_PORT goto :noport
set "GAME_PORT=!FOUND_PORT!"

cls
echo ========================================
echo   TU TIEN NHAN ROI - UI DEV SANDBOX
echo ========================================
echo.
echo Node.js:
node --version
echo.
echo Dang khoi dong UI DEV tai http://%GAME_HOST%:!GAME_PORT!/?dev=1^&tools=1^&anime=1^&tab=hunt
echo.

REM Server bind 0.0.0.0 de cho phep dien thoai cung Wi-Fi truy cap.
REM Trinh duyet/health check tren may chu van dung 127.0.0.1; save theo browser origin nhu cu.
REM Port + bind host duoc truyen bang tham so CLI de tranh trailing-space cua Windows CMD.
REM tools=1 bat stats.js + lil-gui; anime=1 bat Anime.js motion enhancer. Tat ca DEV/presentation-only.
start "Tu Tien Game Server - %GAME_LABEL%" cmd /k "node web\server.mjs !GAME_PORT! !GAME_BIND!"

set /a WAIT_COUNT=0
:wait_server
powershell -NoProfile -Command "try{$r=Invoke-WebRequest -UseBasicParsing -TimeoutSec 1 'http://127.0.0.1:!GAME_PORT!/__tutien_launcher_health'; if($r.StatusCode -eq 200){exit 0}else{exit 1}}catch{exit 1}" >nul 2>&1
if not errorlevel 1 goto :server_ready
set /a WAIT_COUNT+=1
if !WAIT_COUNT! GEQ 15 goto :server_failed
timeout /t 1 /nobreak >nul
goto :wait_server

:server_ready
start "" "http://127.0.0.1:!GAME_PORT!/?dev=1&tools=1&anime=1&tab=hunt&v129ui=20260915-combat-tools-v1"
echo Da mo trinh duyet sau khi server HEALTH CHECK PASS.
echo Anime.js + stats.js + lil-gui chi duoc tai trong UI DEV nay.
echo Hay GIU CUA SO "Tu Tien Game Server" mo trong luc choi.
echo.
timeout /t 2 /nobreak >nul
exit /b 0

:server_failed
echo [LOI] Server khong khoi dong duoc sau 15 giay.
echo Hay xem cua so "Tu Tien Game Server" de doc loi chi tiet.
echo.
pause
exit /b 1

:nonode
echo [LOI] Khong tim thay Node.js trong PATH.
echo Cai Node.js LTS neu Node da bi go, sau do chay lai file nay.
pause
exit /b 1

:wrongfolder
echo [LOI] Thieu file game trong thu muc:
echo   %CD%
echo Hay giai nen DAY DU ZIP V129 roi chay lai CHOI_WEB_GAME.cmd.
pause
exit /b 1

:nodist
echo [LOI] Khong tim thay dist\core\session.js.
echo Hay giai nen DAY DU ZIP V129.
pause
exit /b 1

:noport
echo [LOI] Cac cong 4173-4180 deu dang duoc su dung.
echo Dong server game/ung dung cu roi chay lai.
pause
exit /b 1

:badpath
echo [LOI] Khong the mo thu muc game.
pause
exit /b 1
