# CURRENT CHECKPOINT — V141 CODEBASE OPTIMIZATION CLOSURE

**Structural checkpoint:** `V141`  
**Gameplay/web version preserved:** `1.40.0-alpha.24.0`  
**Date:** 2026-09-06  
**Status:** PASS / canonical source for next work.

V141 is a **codebase/architecture optimization closure only**. It does not redesign, rebalance, restore, or remove any V140 gameplay mechanic. The canonical Tu Luyện rules below remain exactly the V140 contract.

## V141 structural closure

- Large runtime responsibilities were split from the monolithic facade/session/combat shells into focused modules while preserving public behavior and save/API contracts.
- `SimulationSession` extractions include guidance, dungeon challenge, alchemy-pill use, and content-event effect application.
- Combat decision handling and effect-resolution responsibilities are isolated from the main combat shell.
- Gameplay dispatch/flow responsibilities are isolated; Vạn Thế read-model assembly is consolidated into the existing gameplay-flow module so the initial static graph does not grow past the performance budget.
- Frontend action binding was structurally split without changing player-facing behavior.
- Dead local functions/imports found by the V141 safe-prune passes were removed only when mechanically unreferenced.
- Final health scan reports no unresolved relative imports and no risky-pattern hits.
- Final hotspot snapshot: `dist/core/session.js` 471,518 bytes / 5,450 lines; `dist/core/gameplay.js` 108,087 bytes / 1,253 lines; `dist/core/combat.js` 116,149 bytes / 1,713 lines; `app.js` 492,932 bytes / 2,804 lines.

## Canonical Tu Luyện V2

- 118 realm orders / 29 major realms through Sáng Thế Chủ.
- One source of truth: `dist/core/cultivation-v140.js`.
- Realm requirement is authored from `baseTuViPer15s × targetSeconds / 15`.
- Base Tu Vi never decreases as realm order increases.
- Realtime cultivation commits integer Tu Vi every 15 seconds.
- Minor realms auto-advance when Tu Vi is full.
- Major-realm transition is deterministic `Thăng Cảnh`.
- Orders 41–45 are explicit Thiên Kiếp challenge gates and cannot auto-skip.
- Bế Quan: +3h bank/day, max 9h; reward is a realm-specific percent converted to concrete Tu Vi; near-cap usage consumes only needed bank time.
- Tu Vi provenance: base + concrete flat sources + rare percent-of-base sources.
- Thương Thế is the single cultivation-related bodily damage state. It does not reduce passive Tu Vi; heavy injury blocks Bế Quan/Thăng Cảnh.
- Thọ Nguyên / Đạo Suy remain separate life-cycle systems.

## Removed from production

No production consumer/state/API/UI remains for: Căn Cơ/Tổn Căn, cultivation Kinh Mạch, Tạp Chất/Độ Thanh Tịnh, Hấp Thu/Thông Lượng/Backlog/Luyện Hóa/Tinh Thuần pipeline, five cultivation methods, Thiêu Thọ, realm Phá Cảnh RNG/Preparation/quality/failure engine, Phá Cảnh Đan, realm-requirement reduction, or late-game realm catalyst.

Old related pills/rewards were removed or converted to valid Tu Vi/Thương Thế mechanics. Linh Căn/Pháp Bảo/Thể Chất "breakthrough" terminology that means their own upgrade system is not the retired realm-transition system.

## QA closure

Final V141 structural source was validated with the unchanged V140 canonical gates:

- V140 cultivation core: **11/11 PASS**.
- V140 cultivation transport/API: **4/4 PASS**.
- Production zero-legacy: **4510/4510 PASS** over 205 production files.
- Backend full regression closure: **47/47 PASS**.
- Frontend/transport full regression closure: **19/19 PASS**.
- Frontend performance architecture gate: **PASS**, including the existing initial-static-graph module budget.
- Health scan: **0 unresolved relative imports; 0 risky-pattern hits**.

Historical tests whose only purpose was to lock obsolete V1–V8 UI or V103/V106/V108/V127/V129 cultivation contracts remain excluded from current QA rather than keeping compatibility code alive.

See `V141_CODEBASE_OPTIMIZATION_CLOSURE_REPORT.md` for the structural closure record.
