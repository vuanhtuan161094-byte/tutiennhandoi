# CURRENT CHECKPOINT — V148 TRI KỶ REBUILD CLOSED

**Date:** 2026-09-10  
**Branch:** `feature/v148-confidant-rebuild`  
**Gameplay/web version:** `1.40.0-alpha.24.0`  
**Status:** V140–V148 **CLOSED / canonical QA PASS**.  
**Main:** intentionally **not merged / untouched**.  
**Rule:** current branch source is truth. **Do not merge `main`** unless the user explicitly asks.

## 1. Closed baseline

- V140 — Tu Luyện: CLOSED.
- V141 — Săn Yêu × Tu Luyện: CLOSED.
- V142 — Trang Bị × Hunt: CLOSED.
- V143 — Hunt reward authority + Set Resonance: CLOSED.
- V144 — Công Pháp/Bí Thuật legacy retirement: CLOSED.
- V145 — Linh Căn vô hạn + Căn Mạch + Căn Ngộ + combat core buff: CLOSED.
- V146 — Đan Dược production closure: CLOSED.
- V147 — Linh Thú progression/economy/combat integration: CLOSED.
- **V148 — Tri Kỷ progression/economy/combat integration: CLOSED.**

Không mở lại hệ đã CLOSED vì chat cũ, save cũ, test lịch sử hoặc field compatibility còn tồn tại. Chỉ mở lại khi có regression thật hoặc user đổi yêu cầu.

## 2. V148 authority

Player-facing/canonical Tri Kỷ authority là `confidant.v148`.

Live stack:

- `dist/core/confidant-v87.js` — chứa canonical V148 progression/combat authority; V87 exports chỉ còn compatibility;
- `dist/core/collection-progression-v12316.js` — Thân Mật, Duyên Sao, Tâm Ý, Fortune/stat consumer;
- `dist/core/gacha-collection-economy-v12325.js` — economy/read-model consumer canonical;
- `dist/core/collection-workshop-gacha-v12326.js` — companion gacha write path canonical;
- `dist/core/combat.js` — Đồng Tâm/Hợp Kích chạy trong shared CombatKernel;
- `modules/confidant-presentation-v87.js` — presentation bridge hỗ trợ `confidant.v148`;
- `qa/tests/v148-confidant-rebuild-test.js` — dedicated canonical regression.

Temporary V148 apply/audit/discovery workflows, patch tools và staging artifacts đã bị xóa khỏi production tree.

## 3. Canonical gameplay contract

### 8 Tri Kỷ cố định

Giữ đúng **8 Tri Kỷ**; không mở roster chỉ để làm loãng gacha.

### Thân Mật

- **Thân Mật tăng vô hạn.**
- Max Thân Mật cá nhân: **`100 + 50 × Sao`**.
- 0★ → cap 100.
- 20★ → cap 1100.
- 100★ → cap 5100.
- 1000★ → cap 50100.
- Hiệu lực dùng diminishing growth để endgame không tăng tuyến tính vô hạn.

### Duyên Sao / mảnh

- **Duyên ★ tăng vô hạn.**
- **10 mảnh đúng Tri Kỷ = +1★** cố định.
- Gacha fragment hit = **5 mảnh**.
- Duplicate nguyên Tri Kỷ đã sở hữu = **10 mảnh**.
- `Duyên Tinh` chỉ tiêu tại milestone mỗi 5★.
- Chi phí milestone Duyên Tinh tăng dần nhưng cap ở **5**.
- Star-up atomic: thiếu Duyên Tinh thì không mất mảnh.

### Tâm Lực / Tâm Ý

- `Tâm Lực` là chỉ số riêng của Tri Kỷ, scale theo Thân Mật + phẩm + progression nhưng có diminishing curve.
- Mỗi **10★ nhận 1 Điểm Tâm Ý**.
- Mỗi Tri Kỷ có 3 nhánh authored:
  - Trợ Chiến;
  - Hộ Đạo;
  - Hợp Kích.
- Mỗi nhánh hữu hạn tối đa **Lv10**.
- Nhánh raw lặp vô hạn **chỉ mở sau khi 3 nhánh đạt 10/10/10**.
- Raw repeatable tăng Tâm Lực, không mở thêm multiplier % vô hạn.

## 4. Combat — Đồng Tâm canonical

- Chỉ **1 `activeCompanionId`** tham gia combat.
- Trợ Chiến/Hộ Đạo/Hợp Kích đều chạy trong **shared CombatKernel**; không có resolver thứ hai.
- `Đồng Tâm` từ **0 → 100**.
- Hợp Kích **không dùng cooldown**; đủ 100 Đồng Tâm thì tự kích và tiêu 100.
- 8 Tri Kỷ có gauge profile khác nhau dựa trên các event thật như `OnHit`, `OnCrit`, `OnDamageTaken`, `OnShieldBreak`, `OnDodge`, `OnTargetDodge`, `Summon`.
- Canonical trigger IDs: `confidant.v148.*`.
- V129 global balance regression kiểm semantic runtime V148 gồm `assist + guard + gauge + harmony`, không còn khóa prefix V87 cũ.

## 5. Phúc Duyên / Sở Trường

**Phúc Duyên toàn bộ Tri Kỷ là raw-only:**

- `cultivationPct = 0`;
- `huntRewardPct = 0`;
- `craftQualityPct = 0`.

All-owned contribution dùng raw:

- `cultivationFlatPer15s`;
- `resourceMastery`;
- `craftMastery`.

Chỉ Tri Kỷ đang Đồng Hành mới kích hoạt Sở Trường. Sở Trường vẫn có `%` bounded/capped vì đây là active-specialty effect, không phải collection multiplier vô hạn. Cả 8 Sở Trường đã có consumer gameplay thật.

## 6. Companion gacha canonical

Gacha dùng pool đúng 8 người; **không nearest-grade remap**.

Explicit weights:

- `companion.5` — Huyền: 24
- `companion.6` — Huyền: 24
- `companion.2` — Địa: 15
- `companion.4` — Địa: 15
- `companion.1` — Thiên: 7
- `companion.3` — Thiên: 7
- `companion.8` — Thiên: 6
- `companion.7` — Tiên: 2

Tổng = 100.

50,000-pull simulation snapshot:

- Huyền: khoảng **43–44 pull / 1★**;
- Địa: khoảng **64–67 pull / 1★**;
- Thiên: khoảng **112–118 pull / 1★**;
- Tiên — Yến Vũ: khoảng **179 pull / 1★**.

Không còn rarity inversion kiểu phẩm cao tích mảnh nhanh hơn phẩm thấp.

## 7. Migration / save safety

Legacy Duyên được chuyển một lần:

- Duyên I → 0★
- Duyên II → 5★
- Duyên III → 10★
- Duyên IV → 15★
- Duyên V → 20★

Migration deterministic + idempotent.

Save cũ đã mở mechanic không bị mất quyền vì điều kiện V148 mới:

- Trợ Chiến upgrade đã kiếm được được bảo toàn;
- Hộ Đạo đã kiếm được được bảo toàn;
- Hợp Kích đã kiếm được được bảo toàn.

Compatibility entitlement chỉ bảo toàn mechanic; không tặng giả Thân Mật/Level mới.

## 8. V148 canonical QA — PASS / LOCKED ON FEATURE BRANCH

Runtime-cleanup candidate trước checkpoint metadata:

`068c4704544e92e6182f7007761e81775ae99122`

Full `V140 Canonical QA` run:

**`34435772700` — SUCCESS**

PASS gồm:

- repository hygiene;
- static module graph + drift gate;
- codebase health;
- CombatKernel parity;
- V87 compatibility baseline;
- V124–V139 regression suite;
- V140 runtime/static/legacy/real-source/UI suites;
- V141 codebase optimization;
- developer-mode isolation;
- V129 save fixture compatibility;
- V148 dedicated Tri Kỷ regression;
- backend closure;
- frontend closure;
- final V140 closure gate.

One-off V148 scaffolding đã được dọn; production tree chỉ giữ dedicated `qa/tests/v148-confidant-rebuild-test.js` cho V148.

**V148 is CLOSED on `feature/v148-confidant-rebuild`. `main` chưa merge.**

## 9. Existing invariants still active

- Tu Luyện 15s/tick; Hunt không mint Tu Vi trực tiếp.
- Hunt: 28 map đại cảnh × 800 tầng; Boss thật/tầng; cleared floor → Săn Ảo; shared CombatKernel V2.
- Trang Bị canonical: Slot + Rank + Enhancement + Affixes + optional Set; +15 cap; Set Resonance là sink dài hạn.
- Công Pháp authority duy nhất: `dist/core/manual-progression-v127.js`.
- Linh Căn V145 là progression vô hạn riêng, không phải Ngũ Hành.
- Đan Dược V146 chỉ dùng material/source/sink canonical đã khóa.
- Linh Thú V147 giữ đúng 8 con, Sao/Level dài hạn, all-owned raw + active-only Linh Khế %.
- Không để material/currency live không có source và sink/consumer rõ.
- Không tạo duplicate authority/resolver chỉ để compatibility.
- Combat Power chỉ là telemetry, không phải authority gameplay.

## 10. Next work

Không tự merge `main` và không tự mở subsystem mới khi user chưa yêu cầu.

Roadmap đề xuất tiếp theo:

- V149 Pháp Bảo;
- V150 Luân Hồi Production Closure;
- V151 Economy/source-authority toàn game.
