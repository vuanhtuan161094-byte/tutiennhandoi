@echo off
setlocal
cd /d "%~dp0..\.."
node qa\benchmarks\poison-dao-p4-benchmark.js
set "RESULT=%ERRORLEVEL%"
if /i not "%~1"=="--no-pause" pause
exit /b %RESULT%
