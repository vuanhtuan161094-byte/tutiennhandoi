@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0\..\.."
if errorlevel 1 goto :badpath
title Mind Dao M5 Benchmark

set "NO_PAUSE="
for %%A in (%*) do if /I "%%~A"=="--no-pause" set "NO_PAUSE=1"

if not exist "qa\benchmarks\mind-dao-m4-benchmark.js" goto :wrongfolder
if not exist "qa\output" mkdir "qa\output" >nul 2>&1
set "LOG=qa\output\mind-m4-benchmark.log"

set "NODE_EXE="
for /f "delims=" %%N in ('where node 2^>nul') do if not defined NODE_EXE set "NODE_EXE=%%~fN"
if not defined NODE_EXE (
  for /d %%D in ("E:\node24\node-v*-win-x64") do if exist "%%~fD\node.exe" set "NODE_EXE=%%~fD\node.exe"
)
if not defined NODE_EXE goto :nonode

set "HEAD_SHA=UNKNOWN"
for /f "delims=" %%G in ('git rev-parse HEAD 2^>nul') do set "HEAD_SHA=%%G"
set "OBSERVE_PATCH=UNKNOWN"
for /f "delims=" %%C in ('findstr /C:"MIND_M5_OBSERVE_CHANNEL_DAMAGE_COEFFICIENT" dist\content\registry.js 2^>nul') do set "OBSERVE_PATCH=%%C"

echo ============================================================
echo MIND DAO M5 - DETERMINISTIC TUNING BENCHMARK
echo ============================================================
echo Repo : %CD%
echo Head : !HEAD_SHA!
echo Patch: !OBSERVE_PATCH!
echo Node : !NODE_EXE!
echo Log  : %LOG%
echo.

> "%LOG%" echo sourceHead=!HEAD_SHA!
>> "%LOG%" echo observePatch=!OBSERVE_PATCH!
>> "%LOG%" echo.
"!NODE_EXE!" qa\benchmarks\mind-dao-m4-benchmark.js %* >> "%LOG%" 2>&1
set "RC=!ERRORLEVEL!"
type "%LOG%"
echo.

if not "!RC!"=="0" (
  echo ============================================================
  echo [FAIL] Mind M5 benchmark failed - exit code !RC!
  echo ============================================================
  echo Gui file nay cho ChatGPT:
  echo   %LOG%
  echo.
  if not defined NO_PAUSE pause
  exit /b !RC!
)

echo ============================================================
echo [OK] Mind M5 benchmark completed
echo ============================================================
echo Output:
echo   qa\output\mind-m4-benchmark.json
echo Log:
echo   %LOG%
echo.
echo M5 tuning run - log now records exact source HEAD and active Observe patch.
echo.
if not defined NO_PAUSE pause
exit /b 0

:nonode
echo [FAIL] Khong tim thay Node.js.
echo Da thu PATH va E:\node24\node-v*-win-x64\node.exe
if not defined NO_PAUSE pause
exit /b 1

:wrongfolder
echo [FAIL] Khong tim thay qa\benchmarks\mind-dao-m4-benchmark.js
echo Hay giu file CMD trong tools\web cua repo.
if not defined NO_PAUSE pause
exit /b 1

:badpath
echo [FAIL] Khong the mo thu muc repo.
if not defined NO_PAUSE pause
exit /b 1