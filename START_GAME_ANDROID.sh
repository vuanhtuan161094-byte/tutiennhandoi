#!/data/data/com.termux/files/usr/bin/bash
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
PORT="${PORT:-8765}"
PY="$(command -v python3 || command -v python || true)"
if [ -z "$PY" ]; then
  if command -v pkg >/dev/null 2>&1; then
    echo "[Tu Tien] Dang cai Python lan dau..."
    pkg install -y python
    PY="$(command -v python3 || command -v python)"
  else
    echo "Khong tim thay Python. Hay mo Termux va chay: pkg install python -y"
    exit 1
  fi
fi
cd "$HERE"
if [ -f .tu_tien_server.pid ]; then
  OLD="$(cat .tu_tien_server.pid 2>/dev/null || true)"
  [ -n "$OLD" ] && kill "$OLD" 2>/dev/null || true
fi
"$PY" -m http.server "$PORT" --bind 127.0.0.1 > .tu_tien_server.log 2>&1 &
PID=$!
echo "$PID" > .tu_tien_server.pid
sleep 1
URL="http://127.0.0.1:${PORT}/index.html?standalone=1"
echo ""
echo "========================================"
echo " TU TIEN NHAN ROI - V129 WIP3 HOTFIX4"
echo " $URL"
echo " Khong can PC / Node server."
echo " Giu Termux chay trong khi choi."
echo "========================================"
if command -v termux-open-url >/dev/null 2>&1; then
  termux-open-url "$URL" >/dev/null 2>&1 || true
fi
wait "$PID"
