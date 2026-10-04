@echo off
cd /d "%~dp0\..\.."
node qa\benchmarks\formation-dao-p4-benchmark.js
exit /b %errorlevel%
