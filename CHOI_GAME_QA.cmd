@echo off
chcp 65001 >nul
call "%~dp0CHOI_GAME.cmd" --qa
exit /b %ERRORLEVEL%
