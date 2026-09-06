# CURRENT CHECKPOINT — V140 TU LUYỆN V2 CLEAN CLOSURE

**Version:** `1.40.0-alpha.24.0`  
**Date:** 2026-09-06  
**Status:** PASS / canonical source for next work.

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

- V140 cultivation core: 11/11 PASS.
- V140 cultivation transport/API: 4/4 PASS.
- Production zero-legacy: 4466/4466 PASS over 203 production files.
- Backend current regression closure: 47/47 PASS.
- Frontend/transport current regression closure: 19/19 PASS.
- PvP balance: 8/8 PASS.

Historical tests whose only purpose was to lock obsolete V1–V8 UI or V103/V106/V108/V127/V129 cultivation contracts were removed from current QA rather than keeping compatibility code alive.
