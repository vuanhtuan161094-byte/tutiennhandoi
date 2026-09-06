#!/data/data/com.termux/files/usr/bin/bash
HERE="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$HERE/.tu_tien_server.pid" ]; then
  PID="$(cat "$HERE/.tu_tien_server.pid" 2>/dev/null || true)"
  [ -n "$PID" ] && kill "$PID" 2>/dev/null || true
  rm -f "$HERE/.tu_tien_server.pid"
fi
echo "Da dung Tu Tien local server."
