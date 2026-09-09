# CURRENT CHECKPOINT — V147 CLOSED

**Date:** 2026-09-09  
**Branch:** `feature/v147-spirit-beast-progression`  
**Gameplay/web version:** `1.40.0-alpha.24.0`  
**Status:** V140–V147 **CLOSED / canonical QA PASS**.  
**Rule:** current branch HEAD is source of truth. **Do not merge `main`** unless the user explicitly asks.

## 1. Closed baseline

- V140 — Tu Luyện: CLOSED.
- V141 — Săn Yêu × Tu Luyện: CLOSED.
- V142 — Trang Bị × Hunt: CLOSED.
- V143 — Hunt reward authority + Set Resonance: CLOSED.
- V144 — Công Pháp/Bí Thuật legacy retirement: CLOSED.
- V145 — Linh Căn vô hạn + Căn Mạch + Căn Ngộ + combat core buff: CLOSED.
- V146 — Đan Dược production closure: CLOSED.
- **V147 — Linh Thú progression/economy/combat integration: CLOSED.**

Không mở lại hệ đã CLOSED vì chat cũ, save cũ, test lịch sử hoặc field compatibility còn tồn tại. Chỉ mở lại khi có regression thật hoặc user đổi yêu cầu.

## 2. V147 authority

Player-facing/canonical Spirit Beast authority là `spirit-beast.v147`.

Live stack:

- `dist/core/spirit-beast-v147.js` — 8 Linh Thú, Sao, Level cap, raw growth, Linh Khế, skill milestones, migration;
- `dist/core/spirit-beast-v86.js` — compatibility aliases only, không phải authority gameplay;
- `dist/core/collection-progression-v12316.js` — nourish/Level consumer canonical;
- `dist/core/gacha-collection-economy-v12325.js` — star-up/read model/economy consumer canonical;
- `dist/core/collection-workshop-gacha-v12326.js` — pet gacha write path canonical;
- `modules/spirit-beast-ui-v147.js` — player-facing copy/transport bridge;
- `standalone-entry.js` — nạp UI bridge sau canonical app.

Các façade tạm `*-legacy.js` và `spirit-beast-data-v147.js` đã bị xóa; V147 data được inline vào canonical authority để giữ static graph trong budget production.

## 3. V147 gameplay contract

### 8 Linh Thú cố định

1. Xích Viêm Sư — burst DPS.
2. Huyền Giáp Quy — hộ chủ/khiên.
3. Mộng Linh Hồ — control/phá phòng.
4. Thanh Vân Hạc — support/nhịp chiến.
5. Lôi Ảnh Lang — liên kích/tốc chiến.
6. Bích Linh Lộc — thanh tẩy/hộ chủ.
7. U Minh Xà — DoT/suy yếu.
8. Sơn Nhạc Hùng — Phá Thế/cận chiến.

Giữ đúng 8 con; không mở rộng roster chỉ để làm loãng gacha.

### Level

- Level dùng `Linh Thú Tinh Phách`.
- Level cap cá nhân: **`100 + 50 × Sao`**.
- 0★ → Lv100.
- 20★ → Lv1100.
- 100★ → Lv5100.
- 1000★ → Lv50100.
- Không có hard cap Sao/Level trong contract hiện tại.
- Raw growth dùng diminishing curve sau Lv100/Lv500/Lv1000 để progression vẫn vô hạn nhưng không lấn át các major system khác.
- Direct star raw multiplier dừng tăng tại 20★, tối đa ×1.60; Sao cao hơn chủ yếu mở Level cap.

### Sao / mảnh

- **10 mảnh đúng Linh Thú = +1★**.
- Pet gacha fragment roll = **5 mảnh**.
- Duplicate Linh Thú đã sở hữu = **10 mảnh**.
- Không còn lượng mảnh khác nhau theo phẩm kiểu Huyền 6 / Địa 8 / Thiên 10 / Tiên 14.
- Mảnh mới không tự convert thành Sao khi ensure/migrate; player chủ động Tăng Sao.
- `Linh Thú Đột Phá Đan` vẫn là sink tại milestone mỗi 4★, chu kỳ chi phí **1 / 1 / 2 / 3 / 5**, lặp lại theo block 20★.
- Star-up milestone phải atomic: thiếu Đột Phá Đan thì không mất mảnh.

## 4. Skill / combat

- Skill mở theo Sao: 0★ / 8★ / 16★.
- 12★ tăng Nội Tại.
- 20★ là capstone Nội Tại/cooldown.
- Chỉ `activePetId` đưa trigger Linh Thú vào shared CombatKernel.
- Không có resolver combat song song.
- Linh Thú không có authority thắng/thua riêng; Combat Power chỉ telemetry như các hệ khác.
- Mộng Linh Hồ đã sửa role/wording cũ không khớp cơ chế thành `Khống chế · Phá phòng`.

## 5. Linh Khế / stat safety

- Linh Khế percent bị khóa tại **Lv1000 + 20★**; Level/Sao cao hơn không tăng thêm percent.
- Max collection budget của 8 thú giữ bounded:
  - **+32% Công Lực**
  - **+30% Thể Phách**
  - **+27.8% Phòng Ngự**
- Stored over-level bị clamp theo Level cap riêng của từng thú, không thể exploit save để sinh stat vượt cap.
- Nuôi dưỡng vẫn có consumer thật từ `Linh Thú Tinh Phách`; Beast facility Lv1–10 là discount consumer thật, tối đa 18%.

## 6. Migration

Legacy Huyết Mạch Linh Thú chuyển một lần sang Sao:

- HM 0 → 0★
- HM I → 4★
- HM II → 8★
- HM III → 12★
- HM IV → 16★
- HM V → 20★

Migration deterministic + idempotent; giữ mảnh chưa tiêu; compatibility field/import cũ không được trở lại thành gameplay authority.

## 7. V147 canonical QA — PASS / LOCKED

Code closure source HEAD trước commit checkpoint:

`b4a046913b6a9a280422769fd227e96735b3a1d5`

Full `V140 Canonical QA` run:

**`34326482304` — SUCCESS**

PASS gồm:

- codebase health scan: no unresolved relative imports, no risky patterns;
- V140 cultivation core + transport + zero legacy;
- V141 Hunt × Cultivation closure;
- V142/V143/V144 Equipment/Hunt/technique regression;
- V145 Linh Căn core/source-sink/realm-origin/UI;
- V146 Alchemy core/source-runtime/production closure;
- V147 Spirit Beast dedicated progression/economy/gacha/migration/transport test;
- **backend fast 13/13 PASS**;
- **frontend fast 6/6 PASS**;
- **backend closure 77/77 PASS**;
- **frontend closure 20/20 PASS**.

Static graph performance regression introduced during façade refactor was closed by inlining canonical modules; frontend performance gate now PASS without raising the production limit.

**V147 is CLOSED.**

## 8. Existing invariants still active

- Tu Luyện 15s/tick; Hunt không mint Tu Vi trực tiếp.
- Hunt: 28 map đại cảnh × 800 tầng; Boss thật/tầng; cleared floor → Săn Ảo; shared CombatKernel V2.
- Trang Bị canonical: Slot + Rank + Enhancement + Affixes + optional Set; +15 cap; Set Resonance là sink dài hạn.
- Công Pháp authority duy nhất: `dist/core/manual-progression-v127.js`.
- Linh Căn V145 là progression vô hạn riêng, không phải Ngũ Hành.
- Đan Dược V146 chỉ dùng material/source/sink canonical đã khóa.
- Không để material/currency live không có source và sink/consumer rõ.
- Không tạo duplicate authority/resolver chỉ để compatibility.

## 9. Next work

Không tự bắt đầu subsystem mới khi user chưa yêu cầu.

Roadmap đề xuất tiếp theo:

- V148 Tri Kỷ;
- V149 Pháp Bảo;
- V150 Luân Hồi Production Closure;
- V151 Economy/source-authority toàn game.
