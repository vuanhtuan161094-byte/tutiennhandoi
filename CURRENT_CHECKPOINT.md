# CURRENT CHECKPOINT — V146 CLOSED

**Date:** 2026-09-08  
**Branch:** `feature/v142-equipment-hunt`  
**Gameplay/web version:** `1.40.0-alpha.24.0`  
**Status:** V140–V146 **CLOSED / canonical QA PASS**.  
**Rule:** current branch HEAD is source of truth. **Do not merge `main`** unless the user explicitly asks.

## 1. Closed baseline

- V140 — Tu Luyện: CLOSED.
- V141 — Săn Yêu × Tu Luyện: CLOSED.
- V142 — Trang Bị × Hunt: CLOSED.
- V143 — Hunt reward authority + Set Resonance: CLOSED.
- V144 — Công Pháp/Bí Thuật legacy retirement: CLOSED.
- V145 — Linh Căn vô hạn + Căn Mạch + Căn Ngộ + combat core buff: CLOSED.
- **V146 — Đan Dược production closure: CLOSED.**

Không mở lại hệ đã CLOSED vì chat cũ, save cũ, test lịch sử hoặc field compatibility còn tồn tại. Chỉ mở lại khi có regression thật hoặc user đổi yêu cầu.

## 2. V146 authority

Player-facing/canonical authority là `alchemy.v146`.

Live production stack:

- `dist/core/alchemy-v146.js` — material/pill/effect contract;
- `dist/core/alchemy-hunt-v146.js` — Săn Yêu/Săn Ảo → Yêu Đan;
- `dist/core/alchemy-production-v146.js` — Dược Viên, crafting, queue, mastery, promotion, migration;
- `dist/core/alchemy-session-bridge-v146.js` — bridge vào live session, giữ compatibility method/action cũ;
- `modules/alchemy-v146-ui-bridge.js` — player-facing UI/read model V146;
- `standalone-entry.js` — cài runtime + UI bridge.

`dist/core/alchemy-v112.js` chỉ còn compatibility/migration/helper; không phải production authority.

## 3. V146 content contract

### 11 họ Đan

1. Tu Vi Đan
2. Trị Thương Đan
3. Công Lực Đan
4. Khí Huyết Đan
5. Hộ Thể Đan
6. Chiến Ý Đan
7. Kim Cương Đan
8. Tụ Nguyên Đan
9. Bạo Huyết Cấm Đan
10. Thọ Nguyên Đan
11. Tĩnh Suy Đan

29 mốc recipe: Phàm Nhân + 28 đại cảnh; tổng availability thật là **299 Đan Phương**.

### Hai nguyên liệu canonical duy nhất

- `Linh Thảo · <đại cảnh>` — source Dược Viên.
- `Yêu Đan · <đại cảnh>` — source Săn Yêu/Săn Ảo.

Dược Viên có Linh Chủng khởi nguyên để tránh seed deadlock; sau đó Linh Thảo tự làm giống. Yield Thành Thục/Lâu Năm/Cổ Linh = 4/5/7.

Săn Ảo deterministic O(1), lưu remainder meter. 800 Boss First Clear/đại cảnh cho đúng tổng 240 Yêu Đan theo contract. Realm-gating cứng: chưa đạt đại cảnh thì không mint material tier đó.

## 4. Đan Đạo / crafting

- 9 đại bậc × 9 Chuyển = 81 bước.
- Đan Phương tự mở theo cảnh giới + Đan Đạo; không research bằng `resource.alchemy_essence`.
- Mastery dùng chung theo 11 họ, max 1000.
- Không còn Specialization/Chuyên Tinh player-facing.
- Tối đa 4 lò.
- Batch thường 1/10/100; Bạo Huyết/Thọ Nguyên/Tĩnh Suy 1/10.
- Craft live chỉ tiêu Linh Thảo/Yêu Đan V146 và chỉ sinh pill V146.

Quality ở trần mastery/rank vẫn stochastic; target cuối: 5% Hạ / 15% Trung / 50% Thượng / 30% Cực, không bao giờ 100% Cực phẩm.

## 5. Pill effect invariants

- Công Lực Đan → raw Công vĩnh viễn.
- Khí Huyết Đan → raw HP vĩnh viễn.
- Hộ Thể Đan → raw Phòng vĩnh viễn.
- Ba họ trên: quota 3 viên / họ / đại cảnh / mỗi đời; Luân Hồi reset quota nhưng không xóa raw stat đã hấp thu.
- Tu Vi Đan: 10 viên/đại cảnh, exact-major, không ăn Tụ Linh V145.
- Trị Thương Đan chỉ giảm Thương Thế, không heal HP/CN combat.
- Tĩnh Suy Đan chỉ từ Nhân Tiên trở lên.
- Thọ Nguyên Đan bounded theo lifespan cơ sở.
- Combat pill dùng shared active-buff authority; không có combat resolver riêng.
- `daoPower`, `daoBody`, `daoDefense` retired khỏi production.

## 6. Migration / retirement V112

- Queue V112 đang dở: refund nguyên liệu rồi retire.
- Garden V112 đang trồng: refund seed rồi retire.
- `resource.alchemy_essence`: migrate sang Linh Thảo V146, không còn live research loop.
- Pill V112: migrate sang V146 khi mapping an toàn.
- Legacy action/API names có thể giữ để compatibility nhưng live read-model/runtime phải trả V146.
- Legacy UI wording/lĩnh ngộ/chuyên tinh V112 không còn player-facing.

Migration phải deterministic, idempotent, không double-mint khi reload.

## 7. V146 canonical QA — PASS / LOCKED

Code closure source HEAD trước commit tài liệu:

`ddd2242c10c516be470dc21b879ea313b04b9ef0`

Full `V140 Canonical QA` run:

**`34224883992` — SUCCESS**

PASS gồm:

- codebase health scan;
- V140 cultivation core + transport + zero legacy;
- V141 Hunt × Cultivation closure;
- V142 Equipment × Hunt;
- V145 Linh Căn core/source-sink/realm-origin/UI transport;
- V146 Alchemy core;
- V146 Alchemy source runtime;
- V146 Alchemy production closure;
- backend fast gate;
- frontend fast gate;
- backend closure;
- frontend closure.

**V146 is CLOSED.**

## 8. Existing invariants still active

- V145 Linh Căn là một progression vô hạn/character, không phải Ngũ Hành.
- Ngũ Hành/Băng/Lôi/Phong/Huyết/Độc/Ám/Quang/Hư Không để dành cho Pháp Tắc tương lai; Lĩnh Vực là subsystem chí cao sau đó.
- Tu Luyện 15s/tick; Hunt không mint Tu Vi trực tiếp.
- Hunt: 28 map đại cảnh × 800 tầng; Boss thật/tầng; cleared floor → Săn Ảo; shared CombatKernel V2.
- Trang Bị canonical: Slot + Rank + Enhancement + Affixes + optional Set; +15 cap; Set Resonance là sink dài hạn.
- Công Pháp authority duy nhất: `dist/core/manual-progression-v127.js`.
- Không để material/currency live không có source và sink/consumer rõ.

## 9. Next work

Không tự bắt đầu subsystem mới khi user chưa yêu cầu.

Roadmap đề xuất:

- V147 Linh Thú;
- V148 Tri Kỷ;
- V149 Pháp Bảo;
- V150 Luân Hồi Production Closure;
- V151 Economy/source-authority toàn game.
