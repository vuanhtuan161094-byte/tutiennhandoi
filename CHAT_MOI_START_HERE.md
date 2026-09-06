# CHAT MỚI — START HERE

Source of truth is the **V141 codebase-optimized tree/release** and `CURRENT_CHECKPOINT.md`.

## Current state

V141 Codebase Optimization is CLOSED. The player-facing gameplay/web version remains `1.40.0-alpha.24.0` because V141 is a structural refactor checkpoint, not a gameplay redesign or balance version.

Tu Luyện V2 remains the V140 canonical contract. Do not restore mechanics removed by V140 just to satisfy old notes/tests: Căn Cơ, cultivation Kinh Mạch, Tạp Chất, Hấp Thu/Thông Lượng/Backlog/Luyện Hóa/Tinh Thuần, five cultivation methods, Thiêu Thọ, or realm Phá Cảnh RNG/Preparation/quality.

Canonical progression is:

`Tu Vi nền + valid sources → Tự Tu / Bế Quan → auto minor realm → deterministic Thăng Cảnh / Thiên Kiếp gate`.

V141 only reorganized production code into clearer responsibilities and removed mechanically dead local code/imports. It must not be used as justification to change gameplay rules.

When extending Công Pháp, Pháp Bảo, Linh Căn, Đan, Luân Hồi or activities, use the Tu Vi provenance contract instead of inventing another cultivation pipeline. Normal permanent bonuses should generally become concrete Tu Vi numbers authored against a target-realm budget; rare stars/sets/milestones may own percentage-of-base effects.

## Read next

1. `CURRENT_CHECKPOINT.md`
2. `V141_CODEBASE_OPTIMIZATION_CLOSURE_REPORT.md`
3. `V140_CULTIVATION_CLOSURE_REPORT.md`
4. `docs/CULTIVATION_V140_BALANCE.csv`
5. `docs/PROJECT_STRUCTURE.md`
6. `UI_UX_PRODUCTION_DIRECTION_V1.md` when continuing UI work.

## Next gameplay-system task

Audit **B. Luân Hồi** from the actual current source before coding. Follow `NEXT_CHAT_TASKS.md`; do not implement a redesign until the user explicitly approves the Luân Hồi design.
