@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
title Tu Tien Nhan Doi

cls
echo ================================================
echo   TU TIEN NHAN DOI
echo   1 click = cap nhat main + mo Godot
echo ================================================
echo.

call "%~dp0CAP_NHAT_GAME_LOCAL.cmd" --no-pause
if errorlevel 1 (
  echo.
  echo [STOP] Khong cap nhat duoc game. Godot chua duoc mo.
  pause
  exit /b 1
)

set "PROJECT=%CD%\godot"
set "GODOT_BIN="

echo [GAME] Tim Godot 4.7.2...
for %%G in (
  "Godot_v4.7.2-stable_win64_console.exe"
  "Godot_v4.7.2-stable_win64.exe"
  "godot_console.exe"
  "godot.exe"
) do (
  if not defined GODOT_BIN (
    for /f "delims=" %%P in ('where %%~G 2^>nul') do (
      if not defined GODOT_BIN set "GODOT_BIN=%%P"
    )
  )
)

if not defined GODOT_BIN (
  for %%R in ("%USERPROFILE%\Downloads" "%USERPROFILE%\Desktop" "%CD%") do (
    if exist "%%~R" (
      for /f "delims=" %%P in ('dir /b /s "%%~R\Godot_v4.7.2-stable_win64_console.exe" 2^>nul') do (
        if not defined GODOT_BIN set "GODOT_BIN=%%P"
      )
      for /f "delims=" %%P in ('dir /b /s "%%~R\Godot_v4.7.2-stable_win64.exe" 2^>nul') do (
        if not defined GODOT_BIN set "GODOT_BIN=%%P"
      )
    )
  )
)

if not defined GODOT_BIN (
  echo.
  echo [ERROR] Khong tim thay Godot 4.7.2.
  echo Dat Godot_v4.7.2-stable_win64.exe trong PATH, Downloads, Desktop, hoac repo.
  pause
  exit /b 1
)

for /f "delims=" %%V in ('"!GODOT_BIN!" --version 2^>nul') do set "GODOT_VERSION=%%V"
echo       !GODOT_VERSION!
echo [GAME] Mo project...
start "Tu Tien Nhan Doi - Godot" "!GODOT_BIN!" --path "%PROJECT%"
if errorlevel 1 (
  echo [ERROR] Tim thay Godot nhung khong mo duoc project.
  pause
  exit /b 1
)

echo.
echo ================================================
echo   GAME OPENED
echo ================================================
timeout /t 2 /nobreak >nul
exit /b 0
