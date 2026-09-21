@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
title Tu Tien Nhan Doi - Godot Local

set "BRANCH=main"
set "PROJECT=%CD%\godot"
set "SELF_NAME=%~nx0"

cls
echo ================================================
echo   TU TIEN NHAN DOI - GODOT LOCAL
echo   1 click: dong bo main ^> mo game Godot
echo ================================================
echo.

where git >nul 2>&1
if errorlevel 1 goto :nogit

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 goto :notrepo

REM Khong tu ghi de tracked/staged edits cua nguoi dung.
git diff --quiet
if errorlevel 1 goto :dirty
git diff --cached --quiet
if errorlevel 1 goto :dirty

echo [1/4] Lay origin/main moi nhat...
git fetch origin %BRANCH%
if errorlevel 1 goto :syncfail

REM Goi patch cu co the de lai file untracked trung voi file moi tren GitHub.
REM Tu dong backup CHI nhung file untracked se bi origin/main ghi de.
set "SELF_UNTRACKED="
for /f "delims=" %%S in ('git ls-files --others --exclude-standard -- "%SELF_NAME%"') do set "SELF_UNTRACKED=1"

echo [2/4] Don xung dot file untracked an toan...
set "TUTIEN_SYNC_SELF=%SELF_NAME%"
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference='Stop';" ^
  "$root=(git rev-parse --show-toplevel).Trim();" ^
  "$self=$env:TUTIEN_SYNC_SELF;" ^
  "$items=@(git -c core.quotepath=false ls-files --others --exclude-standard);" ^
  "$stamp=Get-Date -Format 'yyyyMMdd-HHmmss';" ^
  "$backup=Join-Path $root ('.local-sync-backup\\'+$stamp);" ^
  "$moved=0;" ^
  "foreach($p in $items){" ^
  " if([string]::IsNullOrWhiteSpace($p) -or $p -eq $self){continue};" ^
  " git cat-file -e ('origin/%BRANCH%:'+$p) 2>$null;" ^
  " if($LASTEXITCODE -eq 0){" ^
  "   $src=Join-Path $root $p; $dst=Join-Path $backup $p;" ^
  "   New-Item -ItemType Directory -Force -Path (Split-Path $dst -Parent) ^| Out-Null;" ^
  "   Move-Item -LiteralPath $src -Destination $dst -Force; $moved++;" ^
  " }" ^
  "};" ^
  "if($moved -gt 0){Write-Host ('       Da backup '+$moved+' file xung dot vao '+$backup)}"
if errorlevel 1 goto :syncfail

for /f "delims=" %%B in ('git branch --show-current') do set "CURRENT_BRANCH=%%B"
if /I not "!CURRENT_BRANCH!"=="%BRANCH%" (
  git switch %BRANCH% >nul 2>&1
  if errorlevel 1 goto :syncfail
)

REM Neu chinh launcher dang la file untracked nhung origin/main da track no,
REM bootstrap bang fast-forward ref + hard reset. Tracked edits da duoc chan o tren.
if defined SELF_UNTRACKED (
  git cat-file -e "origin/%BRANCH%:%SELF_NAME%" >nul 2>&1
  if not errorlevel 1 (
    git merge-base --is-ancestor HEAD origin/%BRANCH% >nul 2>&1
    if errorlevel 1 goto :syncfail
    for /f "delims=" %%H in ('git rev-parse HEAD') do set "OLD_HEAD=%%H"
    git update-ref refs/heads/%BRANCH% origin/%BRANCH% !OLD_HEAD!
    if errorlevel 1 goto :syncfail
    git reset --hard HEAD >nul
    if errorlevel 1 goto :syncfail
    goto :synced
  )
)

git pull --ff-only origin %BRANCH%
if errorlevel 1 goto :syncfail

:synced
for /f "delims=" %%H in ('git rev-parse --short HEAD') do set "HEAD_SHA=%%H"
echo       HEAD = !HEAD_SHA!

echo [3/4] Tim Godot 4.7.2...
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

echo [4/4] Mo game...
start "Tu Tien Nhan Doi - Godot" "!GODOT_BIN!" --path "%PROJECT%"
if errorlevel 1 goto :launchfail

echo.
echo ================================================
echo   DA DONG BO + MO GAME
echo ================================================
echo.
timeout /t 2 /nobreak >nul
exit /b 0

:dirty
echo.
echo [DUNG] Dang co tracked/staged local changes.
git status --short
echo.
echo File untracked khong bi mat; launcher chi backup file xung dot voi origin/main.
pause
exit /b 2

:syncfail
echo.
echo [LOI] Khong dong bo duoc origin/main.
echo Khong force reset khi co tracked edits.
echo Neu co file untracked xung dot, no duoc backup vao .local-sync-backup.
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
