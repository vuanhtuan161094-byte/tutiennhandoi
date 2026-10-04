@echo off
cd /d "%~dp0\..\.."
node qa\benchmarks\artifact-dao-p4-benchmark.js
exit /b %errorlevel%
