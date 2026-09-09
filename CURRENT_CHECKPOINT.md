# CURRENT CHECKPOINT — V147 CLOSED

**Date:** 2026-09-09  
**Branch:** `feature/v147-spirit-beast-progression`  
**Gameplay/web version:** `1.40.0-alpha.24.0`  
**Status:** V140–V147 **CLOSED / canonical QA PASS**.  
**Rule:** current branch source is truth. **Do not merge `main`** unless the user explicitly asks.

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
- `dist/core/collection-progression-v12316.js` — nourish/Level + stat consumer canonical;
- `dist/core/gacha-collection-economy-v12325.js` — star-up/read model/economy consumer canonical;
- `dist/core/collection-workshop-gacha-v12326.js` — pet gacha write path canonical;
- `modules/spirit-beast-ui-v147.js` — player-facing copy/transport bridge;
- `standalone-entry.js` — nạp UI bridge sau canonical app.

Các façade tạm `*-legacy.js`, split `spirit-beast-data-v147.js` và toàn bộ one-off refactor/fix scaffolding đã bị xóa. V147 data nằm trong canonical authority để giữ static graph trong production budget.

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
- `Linh Thú Đột Phá Đan` là sink milestone mỗi 4★, chu kỳ **1 / 1 / 2 / 3 / 5**, lặp lại theo block 20★.
- Star-up milestone atomic: thiếu Đột Phá Đan thì không mất mảnh.

## 4. Raw stat / Linh Khế — canonical rule

**Đây là rule bắt buộc của V147:**

- **Tất cả Linh Thú đã sở hữu** đều đóng góp raw cho nhân vật, kể cả không Trợ Chiến.
- Mỗi thú đóng góp **10% raw HP / Công / Phòng authored hiện tại của chính nó** vào collection stat:
  - pet Attack → `attackFlat`;
  - pet HP → `hpFlat`;
  - pet Defense → `defenseFlat`.
- Level/Sao làm raw pet tăng theo curve V147; vì vậy nuôi nhiều thú luôn có giá trị.
- Ở fixture cả 8 thú Lv1000 / 20★, tổng collection raw hiện là **+1,685 Công / +20,187 HP / +1,532 Phòng**.

**% Linh Khế hoàn toàn tách khỏi raw:**

- **Chỉ `activePetId` đang Trợ Chiến mới cho % Linh Khế.**
- Thú sở hữu nhưng không Trợ Chiến cho **0%**, chỉ còn raw.
- **0★ cho 0% Linh Khế.**
- % chỉ tăng theo Sao, tuyến tính tới 20★ rồi cap; **Level không tăng %**.
- Sao >20★ và Level cực cao không thể tiếp tục inflate %.
- Max % khi 20★ của từng con vẫn giữ identity authored, ví dụ:
  - Xích Viêm Sư: +5.6% Công / +2.6% Thể / +2.3% Phòng;
  - Huyền Giáp Quy: +2.6% Công / +5.5% Thể / +5.2% Phòng;
  - U Minh Xà: +5.3% Công / +3.1% Thể / +2.5% Phòng.
- Aggregate cũ `+32% Công / +30% Thể / +27.8% Phòng` từ cả 8 thú **đã RETIRED**, không còn là gameplay live.
- Equip/unequip chỉ đổi % Linh Khế + combat active; không double raw.

## 5. Skill / combat

- Skill mở theo Sao: 0★ / 8★ / 16★.
- 12★ tăng Nội Tại.
- 20★ là capstone Nội Tại/cooldown.
- Chỉ `activePetId` đưa trigger Linh Thú vào shared CombatKernel.
- Không có resolver combat song song.
- Linh Thú không có authority thắng/thua riêng; Combat Power chỉ telemetry như các hệ khác.
- Mộng Linh Hồ đã sửa role/wording cũ không khớp cơ chế thành `Khống chế · Phá phòng`.
- Player-facing copy ghi rõ: tất cả thú sở hữu cộng raw; chỉ thú Trợ Chiến kích hoạt % Linh Khế.

## 6. Migration

Legacy Huyết Mạch Linh Thú chuyển một lần sang Sao:

- HM 0 → 0★
- HM I → 4★
- HM II → 8★
- HM III → 12★
- HM IV → 16★
- HM V → 20★

Migration deterministic + idempotent; giữ mảnh chưa tiêu; compatibility field/import cũ không được trở lại thành gameplay authority.

## 7. Stat / save safety

- Stored over-level bị clamp theo Level cap riêng của từng thú, không thể exploit save để sinh stat vượt cap.
- Nuôi dưỡng dùng `Linh Thú Tinh Phách`; Beast facility Lv1–10 là discount consumer thật, tối đa 18%.
- Raw collection share là constant bounded `0.10`, không phải hidden multiplier chain.
- Equipped-only Linh Khế có per-pet authored cap < 6% mỗi trục trong catalog hiện tại.
- Dedicated regression khóa cả 3 điều kiện: all-owned raw, active-only %, 0★ = 0% và Level không inflate %.

## 8. V147 canonical QA — PASS / LOCKED

Canonical code candidate đã đóng:

`f6b129d4e80d2ca0331f8df5c33ce1fd1b7962d4`

Full `V140 Canonical QA` run:

**`34327784759` — SUCCESS**

PASS gồm:

- codebase health scan;
- V140 cultivation core + transport + zero legacy;
- V141 Hunt × Cultivation closure;
- V142/V143/V144 Equipment/Hunt/technique regression;
- V145 Linh Căn core/source-sink/realm-origin/UI;
- V146 Alchemy core/source-runtime/production closure;
- V147 Spirit Beast dedicated progression/economy/gacha/migration/raw/bond/transport tests;
- backend fast: PASS;
- frontend fast: PASS;
- backend closure: PASS;
- frontend closure: PASS.

Static graph performance remains within production budget; test limit was not raised.

**V147 is CLOSED.**

## 9. Existing invariants still active

- Tu Luyện 15s/tick; Hunt không mint Tu Vi trực tiếp.
- Hunt: 28 map đại cảnh × 800 tầng; Boss thật/tầng; cleared floor → Săn Ảo; shared CombatKernel V2.
- Trang Bị canonical: Slot + Rank + Enhancement + Affixes + optional Set; +15 cap; Set Resonance là sink dài hạn.
- Công Pháp authority duy nhất: `dist/core/manual-progression-v127.js`.
- Linh Căn V145 là progression vô hạn riêng, không phải Ngũ Hành.
- Đan Dược V146 chỉ dùng material/source/sink canonical đã khóa.
- Không để material/currency live không có source và sink/consumer rõ.
- Không tạo duplicate authority/resolver chỉ để compatibility.

## 10. Next work

Không tự bắt đầu subsystem mới khi user chưa yêu cầu.

Roadmap đề xuất tiếp theo:

- V148 Tri Kỷ;
- V149 Pháp Bảo;
- V150 Luân Hồi Production Closure;
- V151 Economy/source-authority toàn game.
