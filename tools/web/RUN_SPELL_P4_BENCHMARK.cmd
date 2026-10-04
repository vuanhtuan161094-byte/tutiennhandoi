@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0\..\.."
node qa\benchmarks\spell-dao-p4-benchmark.js
exit /b %ERRORLEVEL%
