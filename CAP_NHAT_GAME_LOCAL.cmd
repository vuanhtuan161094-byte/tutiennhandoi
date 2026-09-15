@echo off
setlocal EnableExtensions
chcp 65001 >nul

cd /d "%~dp0"
title Cap nhat Game Tu Tien Nhan Roi

echo ================================================
echo   CAP NHAT GAME TU TIEN NHAN ROI - MAIN MỚI NHAT
echo ================================================
echo.

where git >nul 2>nul
if errorlevel 1 (
  echo [LOI] Khong tim thay Git tren may.
  echo Cai Git for Windows roi chay lai file nay.
  pause
  exit /b 1
)

git rev-parse --is-inside-work-tree >nul 2>nul
if errorlevel 1 (
  echo [LOI] File CMD phai nam trong thu muc repo tutiennhandoi.
  echo Hay chep file nay vao thu muc goc cua game roi chay lai.
  pause
  exit /b 1
)

for /f "delims=" %%A in ('git status --porcelain') do set "DIRTY=1"
if defined DIRTY (
  echo [DUNG] Repo local dang co file da sua/chua commit.
  echo De tranh mat du lieu, script se KHONG tu reset hay ghi de.
  echo.
  git status --short
  echo.
  echo Hay xu ly cac file local tren, sau do chay lai CMD.
  pause
  exit /b 2
)

echo [1/4] Lay thong tin moi nhat tu GitHub...
git fetch origin main
if errorlevel 1 goto :fail

echo [2/4] Chuyen ve main...
git switch main
if errorlevel 1 goto :fail

echo [3/4] Cap nhat fast-forward tu origin/main...
git pull --ff-only origin main
if errorlevel 1 goto :fail

echo [4/4] Hoan tat.
for /f %%S in ('git rev-parse --short HEAD') do set "HEADSHA=%%S"
echo.
echo ================================================
echo   CAP NHAT THANH CONG - HEAD: %HEADSHA%
echo ================================================
echo Ban co the mo game local nhu binh thuong.
echo.
pause
exit /b 0

:fail
echo.
echo [LOI] Cap nhat that bai. Script KHONG xoa file local.
echo Hay chup man hinh loi nay gui cho ChatGPT de xu ly.
echo.
pause
exit /b 1
