@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
if errorlevel 1 goto :badpath

where node >nul 2>&1
if errorlevel 1 goto :nonode
if not exist "qa\local\run-local-ci.mjs" goto :wrongfolder
if not exist "qa\local\validate-visual-proof.mjs" goto :wrongfolder
if not exist "web\server.mjs" goto :wrongfolder

node --check qa\local\run-local-ci.mjs >nul 2>&1
if errorlevel 1 goto :badlocalci
node --check qa\local\validate-visual-proof.mjs >nul 2>&1
if errorlevel 1 goto :badlocalci

set "MODE=%~1"
set "EXTRA=%~2"
if not defined MODE goto :menu
goto :run

:menu
cls
echo ==============================================
echo   TU TIEN NHAN ROI - LOCAL CI
echo ==============================================
echo.
echo  [1] FAST       - Active gates + Backend Fast + Frontend Fast
echo  [2] BROWSER    - Browser Playtest runtime that
echo  [3] VISUAL     - Runtime UI + Combat 4 viewport
echo  [4] FULL       - FAST + BROWSER + VISUAL
echo  [5] FULL CLEAN - FULL va bat buoc git working tree sach
echo  [D] DEV        - Mo CHOI_UI_DEV.cmd
echo  [Q] Thoat
echo.
set /p "CHOICE=Chon che do: "
if /I "%CHOICE%"=="1" set "MODE=fast"
if /I "%CHOICE%"=="2" set "MODE=browser"
if /I "%CHOICE%"=="3" set "MODE=visual"
if /I "%CHOICE%"=="4" set "MODE=full"
if /I "%CHOICE%"=="5" set "MODE=full"& set "EXTRA=--require-clean"
if /I "%CHOICE%"=="D" goto :dev
if /I "%CHOICE%"=="Q" exit /b 0
if not defined MODE goto :menu

:run
cls
echo ==============================================
echo   LOCAL CI - %MODE%
echo ==============================================
echo.
echo Repo: %CD%
echo Node:
node --version
echo.
echo GitHub Actions KHONG duoc su dung boi launcher nay.
echo Ket qua se nam trong artifacts\local-ci\
echo.
node qa\local\run-local-ci.mjs %MODE% %EXTRA%
set "RC=%ERRORLEVEL%"
echo.
if "%RC%"=="0" (
  echo ==============================================
  echo   LOCAL CI PASS
  echo ==============================================
) else (
  echo ==============================================
  echo   LOCAL CI FAIL - exit code %RC%
  echo ==============================================
)
echo.
if exist "artifacts\local-ci\LAST_RUN.txt" (
  set /p LAST_RUN=<"artifacts\local-ci\LAST_RUN.txt"
  echo Evidence: !LAST_RUN!
)
echo.
set /p "OPEN_RESULT=Mo thu muc ket qua? [Y/N]: "
if /I "!OPEN_RESULT!"=="Y" (
  if defined LAST_RUN explorer "!LAST_RUN!"
)
pause
exit /b %RC%

:dev
if exist "CHOI_UI_DEV.cmd" (
  call "CHOI_UI_DEV.cmd"
  exit /b %ERRORLEVEL%
)
echo [LOI] Khong tim thay CHOI_UI_DEV.cmd
pause
exit /b 1

:badlocalci
echo [LOI] Local CI script bi loi JavaScript syntax.
echo Chay thu:
echo   node --check qa\local\run-local-ci.mjs
echo   node --check qa\local\validate-visual-proof.mjs
pause
exit /b 1

:nonode
echo [LOI] Khong tim thay Node.js trong PATH.
echo Can Node.js 22 tro len.
pause
exit /b 1

:wrongfolder
echo [LOI] Day khong phai thu muc repo day du.
echo Thieu Local CI scripts hoac web\server.mjs.
pause
exit /b 1

:badpath
echo [LOI] Khong the mo thu muc repo.
pause
exit /b 1
