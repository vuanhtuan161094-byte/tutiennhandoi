GAME TU TIÊN NHÀN DỖI — V140 START HERE

CHƠI GAME
Windows:
  CHOI_WEB_GAME.cmd

Android/Termux:
  docs/guides/CAI_TREN_ANDROID.txt
  START_GAME_ANDROID.sh / STOP_GAME_ANDROID.sh

LAN / điện thoại cùng Wi-Fi:
  START_WEBGAME_LAN.sh

CHAT TIẾP THEO
  1) Đọc CHAT_MOI_START_HERE.md
  2) Đọc CURRENT_CHECKPOINT.md
  3) Nếu làm UI: đọc CHAT_MOI_START_HERE_UI.md + CURRENT_UI_CHECKPOINT.md
  4) Cấu trúc repo: docs/PROJECT_STRUCTURE.md

QA NHANH
  node qa/runners/v140-backend-gates.js fast
  node qa/runners/v140-frontend-gates.js fast

QA CLOSURE
  node qa/runners/v140-backend-gates.js closure
  node qa/runners/v140-frontend-gates.js closure

TU LUYỆN V2
  node qa/tests/v140-cultivation-core-test.js
  node qa/tests/v140-cultivation-transport-test.js
  node qa/tests/v140-zero-legacy-test.js

QUY TẮC
  CURRENT_CHECKPOINT.md + source hiện tại là source of truth.
  Không phục hồi contract cũ chỉ để làm test/tài liệu lịch sử chạy lại.
