@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0\..\.."
if errorlevel 1 goto :badpath
title Mind Dao M4 Benchmark

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

echo ============================================================
echo MIND DAO M4 - DETERMINISTIC IDENTITY BENCHMARK
echo ============================================================
echo Repo : %CD%
echo Node : !NODE_EXE!
echo Log  : %LOG%
echo.
"!NODE_EXE!" qa\benchmarks\mind-dao-m4-benchmark.js %* > "%LOG%" 2>&1
set "RC=!ERRORLEVEL!"
type "%LOG%"
echo.

if not "!RC!"=="0" (
  echo ============================================================
  echo [FAIL] Mind M4 benchmark failed - exit code !RC!
  echo ============================================================
  echo Gui file nay cho ChatGPT:
  echo   %LOG%
  echo.
  if not defined NO_PAUSE pause
  exit /b !RC!
)

echo ============================================================
echo [OK] Mind M4 benchmark completed
echo ============================================================
echo Output:
echo   qa\output\mind-m4-benchmark.json
echo Log:
echo   %LOG%
echo.
echo Baseline only - M5 coefficient tuning is a separate phase.
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