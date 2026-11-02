@echo off
setlocal
cd /d "%~dp0"
echo [HG] Source folder: %CD%
where node >nul 2>nul
if errorlevel 1 (
 echo [BLOCKED] Node.js not installed
 exit /b 2
)
node qa-engine.cjs
if errorlevel 1 (
 echo [FAIL] Node engine tests
 exit /b 1
)
where py >nul 2>nul
if not errorlevel 1 (
 set "PY=py"
) else (
 where python >nul 2>nul
 if errorlevel 1 (
  echo [BLOCKED] Python not installed
  exit /b 2
 )
 set "PY=python"
)
%PY% build_offline.py
if errorlevel 1 (
 echo [FAIL] Offline HTML build
 exit /b 1
)
%PY% qa-browser.py
if errorlevel 1 (
 echo [BLOCKED OR FAIL] Browser suite did not complete.
 echo See RESUME_HG08_NO_GUI_20261102.md
 exit /b 2
)
echo [PASS] Node, HTML build and headless Chromium browser tests
exit /b 0
