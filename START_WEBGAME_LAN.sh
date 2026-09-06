#!/usr/bin/env bash
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
PORT="${PORT:-8765}"
PY="$(command -v python3 || command -v python || true)"
if [ -z "$PY" ]; then
  echo "Can Python 3 de mo static web server (python -m http.server)."
  exit 1
fi
cd "$HERE"
echo "========================================"
echo " TU TIEN NHAN ROI - V129 WIP3 HOTFIX4"
echo " Desktop tren may nay: http://127.0.0.1:${PORT}/"
echo " Dien thoai cung Wi-Fi: mo http://<IP-may-chu>:${PORT}/"
echo " File game la static web; khong can backend Node/API server."
echo "========================================"
exec "$PY" -m http.server "$PORT" --bind 0.0.0.0
