@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
title Tu Tien Nhan Doi - Godot Local

set "BRANCH=main"
set "PROJECT=%CD%\godot"

cls
echo ================================================
echo   TU TIEN NHAN DOI - GODOT LOCAL
echo   Dong bo main ^> Mo game Godot
echo ================================================
echo.

where git >nul 2>&1
if errorlevel 1 goto :nogit

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 goto :notrepo

REM Chi chan tracked/staged edits. Untracked local artifacts/old launchers are ignored.
git diff --quiet
if errorlevel 1 goto :dirty
git diff --cached --quiet
if errorlevel 1 goto :dirty

echo [1/3] Dong bo origin/main...
git fetch origin %BRANCH%
if errorlevel 1 goto :syncfail
git switch %BRANCH% >nul 2>&1
if errorlevel 1 goto :syncfail
git pull --ff-only origin %BRANCH%
if errorlevel 1 goto :syncfail

for /f "delims=" %%H in ('git rev-parse --short HEAD') do set "HEAD_SHA=%%H"
echo       HEAD = !HEAD_SHA!

echo [2/3] Tim Godot 4.7.2...
set "GODOT_BIN="

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

if not defined GODOT_BIN goto :nogodot

for /f "delims=" %%V in ('"!GODOT_BIN!" --version 2^>nul') do set "GODOT_VERSION=%%V"
echo       !GODOT_VERSION!

echo [3/3] Mo game...
echo       !GODOT_BIN!
start "Tu Tien Nhan Doi - Godot" "!GODOT_BIN!" --path "%PROJECT%"
if errorlevel 1 goto :launchfail

echo.
echo ================================================
echo   DA DONG BO + MO GODOT
echo ================================================
echo.
echo Tu gio de choi/test local, chi can dung file nay.
echo Game se mo truc tiep. Khong can bam F5.
timeout /t 2 /nobreak >nul
exit /b 0

:dirty
echo.
echo [DUNG] Dang co tracked/staged local changes.
git status --short
echo.
echo File untracked khong bi chan. Hay commit/stash/revert tracked edits roi chay lai.
pause
exit /b 2

:syncfail
echo.
echo [LOI] Khong dong bo duoc origin/main. Khong force reset.
pause
exit /b 1

:nogit
echo [LOI] Khong tim thay Git.
pause
exit /b 1

:notrepo
echo [LOI] File nay phai nam o root repo.
pause
exit /b 1

:nogodot
echo.
echo [LOI] Khong tim thay Godot 4.7.2.
echo Dat Godot_v4.7.2-stable_win64.exe trong PATH, Downloads, Desktop hoac repo.
pause
exit /b 1

:launchfail
echo [LOI] Tim thay Godot nhung khong mo duoc project.
pause
exit /b 1
