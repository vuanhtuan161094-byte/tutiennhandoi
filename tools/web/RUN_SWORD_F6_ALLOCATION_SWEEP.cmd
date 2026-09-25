@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0\..\.."
if errorlevel 1 goto :badpath
title Sword Dao F6 Allocation Sweep

set "NODE_EXE="
for /f "delims=" %%N in ('where node 2^>nul') do if not defined NODE_EXE set "NODE_EXE=%%~fN"
if not defined NODE_EXE (
  for /d %%D in ("E:\node24\node-v*-win-x64") do if exist "%%~fD\node.exe" set "NODE_EXE=%%~fD\node.exe"
)
if not defined NODE_EXE goto :nonode
if not exist "qa\benchmarks\sword-dao-f6-allocation-sweep.js" goto :wrongfolder
if not exist "qa\output" mkdir "qa\output" >nul 2>&1

set "LOG=qa\output\sword-f6-allocation-sweep.log"
echo ============================================================
echo SWORD DAO F6 - ALLOCATION SWEEP
echo ============================================================
echo Repo : %CD%
echo Node : !NODE_EXE!
echo Log  : %LOG%
echo.
"!NODE_EXE!" qa\benchmarks\sword-dao-f6-allocation-sweep.js %* > "%LOG%" 2>&1
set "RC=!ERRORLEVEL!"
type "%LOG%"
echo.
if not "!RC!"=="0" (
  echo [FAIL] Allocation sweep failed - exit code !RC!
  pause
  exit /b !RC!
)
echo [OK] Output: qa\output\sword-f6-allocation-sweep.json
pause
exit /b 0

:nonode
echo [FAIL] Khong tim thay Node.js.
pause
exit /b 1

:wrongfolder
echo [FAIL] Khong tim thay allocation sweep script.
pause
exit /b 1

:badpath
echo [FAIL] Khong the mo thu muc repo.
pause
exit /b 1
