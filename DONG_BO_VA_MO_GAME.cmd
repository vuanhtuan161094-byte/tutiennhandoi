@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
if errorlevel 1 goto :badpath

set "REPO=vuanhtuan161094-byte/tutiennhandoi"
set "BRANCH=main"

cls
echo ================================================
echo   TU TIEN NHAN ROI - DONG BO + MO GAME
echo ================================================
echo.

where git >nul 2>&1
if errorlevel 1 goto :nogit
where node >nul 2>&1
if errorlevel 1 goto :nonode

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 goto :notrepo

for /f "delims=" %%R in ('git remote get-url origin 2^>nul') do set "ORIGIN_URL=%%R"
if not defined ORIGIN_URL goto :noorigin

echo Repo   : %REPO%
echo Branch : %BRANCH%
echo Origin : !ORIGIN_URL!
echo.

REM Bao ve file local: khong tu dong xoa/stash thay doi cua nguoi dung.
for /f "delims=" %%S in ('git status --porcelain') do set "DIRTY=1"
if defined DIRTY goto :dirty

echo [1/4] Dang lay thong tin moi nhat tu GitHub...
git fetch origin %BRANCH%
if errorlevel 1 goto :syncfail

echo [2/4] Dang chuyen ve branch %BRANCH%...
git checkout %BRANCH%
if errorlevel 1 goto :syncfail

echo [3/4] Dang dong bo source code...
git pull --ff-only origin %BRANCH%
if errorlevel 1 goto :syncfail

for /f "delims=" %%H in ('git rev-parse --short HEAD') do set "HEAD_SHA=%%H"
echo.
echo Dong bo thanh cong. HEAD = !HEAD_SHA!
echo.

echo [4/4] Dang mo game...
if not exist "CHOI_WEB_GAME.cmd" goto :nolauncher
call "CHOI_WEB_GAME.cmd"
exit /b %errorlevel%

:dirty
echo [DUNG] Thu muc game dang co thay doi local chua commit.
echo De tranh mat code/file, launcher KHONG tu dong ghi de.
echo.
git status --short
echo.
echo Hay commit/stash/cat thay doi local, sau do chay lai file nay.
pause
exit /b 2

:syncfail
echo.
echo [LOI] Khong dong bo duoc main tu GitHub.
echo Khong co file local nao bi tu dong xoa.
echo.
pause
exit /b 1

:nolauncher
echo [LOI] Khong tim thay CHOI_WEB_GAME.cmd sau khi dong bo.
pause
exit /b 1

:nogit
echo [LOI] Khong tim thay Git trong PATH.
echo Cai Git for Windows, mo lai cua so CMD roi chay lai.
pause
exit /b 1

:nonode
echo [LOI] Khong tim thay Node.js trong PATH.
echo Cai Node.js LTS, mo lai cua so CMD roi chay lai.
pause
exit /b 1

:notrepo
echo [LOI] File nay phai nam trong thu muc repo game da clone bang Git.
echo Thu muc hien tai:
echo   %CD%
pause
exit /b 1

:noorigin
echo [LOI] Repo khong co remote origin.
echo Can cau hinh origin tro toi GitHub repo %REPO%.
pause
exit /b 1

:badpath
echo [LOI] Khong the mo thu muc chua launcher.
pause
exit /b 1
