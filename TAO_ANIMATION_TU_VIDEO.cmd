@echo off
chcp 65001 >nul
setlocal EnableExtensions

set "ROOT=%~dp0"
set "SCRIPT=%ROOT%tools\video_to_godot_animation.py"
set "REQ=%ROOT%tools\video_animation_requirements.txt"

if not exist "%SCRIPT%" (
  echo [ERROR] Khong tim thay:
  echo %SCRIPT%
  pause
  exit /b 1
)

set "PY_MODE="
where py >nul 2>&1
if not errorlevel 1 set "PY_MODE=py"
if not defined PY_MODE (
  where python >nul 2>&1
  if not errorlevel 1 set "PY_MODE=python"
)

if not defined PY_MODE (
  echo [ERROR] Khong tim thay Python 3.
  echo Cai Python 3 roi chay lai.
  pause
  exit /b 1
)

if "%PY_MODE%"=="py" (
  py -3 -c "import PIL" >nul 2>&1
) else (
  python -c "import PIL" >nul 2>&1
)
if errorlevel 1 goto :missing_deps

where ffmpeg >nul 2>&1
if not errorlevel 1 goto :deps_ok

if "%PY_MODE%"=="py" (
  py -3 -c "import imageio_ffmpeg" >nul 2>&1
) else (
  python -c "import imageio_ffmpeg" >nul 2>&1
)
if errorlevel 1 goto :missing_deps
goto :deps_ok

:missing_deps
echo.
echo [ERROR] Thieu dependency cho tool video animation.
echo Chay mot lan:
if "%PY_MODE%"=="py" (
  echo   py -3 -m pip install -r "%REQ%"
) else (
  echo   python -m pip install -r "%REQ%"
)
echo.
pause
exit /b 1

:deps_ok

if "%~1"=="" (
  echo ================================================
  echo   VIDEO -^> GODOT ANIMATION
  echo ================================================
  echo.
  echo Cach nhanh:
  echo   Keo file MP4 tha vao TAO_ANIMATION_TU_VIDEO.cmd
  echo.
  echo Hoac:
  echo   TAO_ANIMATION_TU_VIDEO.cmd meditation.mp4 --start 0 --end 3 --fps 10
  echo.
  echo Test tool:
  echo   TAO_ANIMATION_TU_VIDEO.cmd --self-test
  echo.
  pause
  exit /b 0
)

if "%PY_MODE%"=="py" (
  py -3 "%SCRIPT%" %*
) else (
  python "%SCRIPT%" %*
)
set "RC=%ERRORLEVEL%"

if not "%RC%"=="0" (
  echo.
  echo [ERROR] Tool video animation that bai.
  pause
)

exit /b %RC%
