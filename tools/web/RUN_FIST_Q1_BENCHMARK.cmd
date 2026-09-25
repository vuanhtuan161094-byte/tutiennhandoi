@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0\..\.."
if errorlevel 1 goto :badpath
title Fist Dao Q1 Pre-Migration Benchmark
set "NODE_EXE="
for /f "delims=" %%N in ('where node 2^>nul') do if not defined NODE_EXE set "NODE_EXE=%%~fN"
if not defined NODE_EXE (
 for /d %%D in ("E:\node24\node-v*-win-x64") do if exist "%%~fD\node.exe" set "NODE_EXE=%%~fD\node.exe"
)
if not defined NODE_EXE goto :nonode
if not exist "qa\benchmarks\fist-dao-q1-premigration-benchmark.js" goto :wrongfolder
if not exist "qa\output" mkdir "qa\output" >nul 2>&1
set "LOG=qa\output\fist-q1-premigration-benchmark.log"
echo ============================================================
echo FIST DAO Q1 - PRE-MIGRATION BENCHMARK
echo ============================================================
echo Repo : %CD%
echo Node : !NODE_EXE!
echo Log  : %LOG%
echo.
"!NODE_EXE!" qa\benchmarks\fist-dao-q1-premigration-benchmark.js %* > "%LOG%" 2>&1
set "RC=!ERRORLEVEL!"
type "%LOG%"
echo.
if not "!RC!"=="0" (
 echo [FAIL] Fist Q1 benchmark failed - exit code !RC!
 pause
 exit /b !RC!
)
echo [OK] Output: qa\output\fist-q1-premigration-benchmark.json
pause
exit /b 0
:nonode
echo [FAIL] Khong tim thay Node.js.
pause
exit /b 1
:wrongfolder
echo [FAIL] Khong tim thay Fist Q1 benchmark script.
pause
exit /b 1
:badpath
echo [FAIL] Khong the mo thu muc repo.
pause
exit /b 1
