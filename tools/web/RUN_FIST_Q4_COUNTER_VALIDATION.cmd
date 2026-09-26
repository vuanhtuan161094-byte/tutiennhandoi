@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0\..\.."
if errorlevel 1 goto :badpath
title Fist Dao Q4 Counter Validation

set "NO_PAUSE="
for %%A in (%*) do if /I "%%~A"=="--no-pause" set "NO_PAUSE=1"

if not exist "qa\benchmarks\fist-dao-q4-counter-validation.js" goto :wrongfolder
if not exist "qa\output" mkdir "qa\output" >nul 2>&1
set "LOG=qa\output\fist-q4-counter-validation.log"

set "NODE_EXE="
for /f "delims=" %%N in ('where node 2^>nul') do if not defined NODE_EXE set "NODE_EXE=%%~fN"
if not defined NODE_EXE (
  for /d %%D in ("E:\node24\node-v*-win-x64") do if exist "%%~fD\node.exe" set "NODE_EXE=%%~fD\node.exe"
)
if not defined NODE_EXE goto :nonode

echo ============================================================
echo FIST DAO Q4 - COUNTER ARCHETYPE VALIDATION
echo ============================================================
echo Repo : %CD%
echo Node : !NODE_EXE!
echo Log  : %LOG%
echo.
"!NODE_EXE!" qa\benchmarks\fist-dao-q4-counter-validation.js > "%LOG%" 2>&1
set "RC=!ERRORLEVEL!"
type "%LOG%"
echo.

if not "!RC!"=="0" (
  echo ============================================================
  echo [FAIL] Counter validation failed - exit code !RC!
  echo ============================================================
  echo Gui 2 file nay cho ChatGPT:
  echo   qa\output\fist-q4-counter-validation.log
  echo   qa\output\fist-q4-counter-validation.json
  echo.
  if not defined NO_PAUSE pause
  exit /b !RC!
)

echo ============================================================
echo [OK] Counter validation completed

echo ============================================================
echo Gui 2 file nay cho ChatGPT:
echo   qa\output\fist-q4-counter-validation.log
echo   qa\output\fist-q4-counter-validation.json
echo.
if not defined NO_PAUSE pause
exit /b 0

:nonode
echo [FAIL] Khong tim thay Node.js.
if not defined NO_PAUSE pause
exit /b 1

:wrongfolder
echo [FAIL] Khong tim thay counter validation script.
if not defined NO_PAUSE pause
exit /b 1

:badpath
echo [FAIL] Khong the mo thu muc repo.
if not defined NO_PAUSE pause
exit /b 1
