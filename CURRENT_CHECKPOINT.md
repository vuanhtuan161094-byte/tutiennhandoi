# CURRENT CHECKPOINT — V148 TRI KỶ + V129 BALANCE CLOSED

**Date:** 2026-09-10  
**Branch:** `feature/v148-confidant-rebuild`  
**Gameplay/web version:** `1.40.0-alpha.24.0`  
**Status:** V140–V148 **CLOSED / V129 combat balance LOCKED / canonical QA PASS**.  
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
- **V148 — Tri Kỷ progression/economy/combat integration + V129 combat calibration: CLOSED.**

Không mở lại hệ đã CLOSED vì chat cũ, save cũ, test lịch sử hoặc compatibility field còn tồn tại. Chỉ mở lại khi có regression thật hoặc user đổi yêu cầu.

## 2. V148 authority

Player-facing/canonical Tri Kỷ authority là `confidant.v148`.

Live stack:

- `dist/core/confidant-v87.js` — canonical V148 progression/combat authority; V87 exports chỉ là compatibility;
- `dist/core/collection-progression-v12316.js` — Thân Mật, Duyên Sao, Tâm Ý, Fortune/stat consumer;
- `dist/core/gacha-collection-economy-v12325.js` — economy/read-model consumer canonical;
- `dist/core/collection-workshop-gacha-v12326.js` — companion gacha write path canonical;
- `dist/core/combat.js` — Đồng Tâm/Hợp Kích trong shared CombatKernel;
- `modules/confidant-presentation-v87.js` — presentation bridge hỗ trợ `confidant.v148`;
- `qa/tests/v148-confidant-rebuild-test.js` — progression/economy/migration/runtime regression;
- `qa/tests/v148-confidant-v129-balance-test.js` — permanent V129 combat benchmark + role-envelope regression.

Temporary V148 apply/audit/balance workflows, patch tools và staging artifacts đã bị xóa khỏi production tree.

## 3. Canonical gameplay contract

### 8 Tri Kỷ cố định

Giữ đúng **8 Tri Kỷ**; không mở roster chỉ để làm loãng gacha.

### Thân Mật

- **Thân Mật tăng vô hạn.**
- Max Thân Mật cá nhân: **`100 + 50 × Sao`**.
- 0★ → cap 100; 20★ → 1100; 100★ → 5100; 1000★ → 50100.
- Hiệu lực dùng diminishing growth để endgame không tăng tuyến tính vô hạn.

### Duyên Sao / mảnh

- **Duyên ★ tăng vô hạn.**
- **10 mảnh đúng Tri Kỷ = +1★** cố định.
- Gacha fragment hit = **5 mảnh**.
- Duplicate nguyên Tri Kỷ đã sở hữu = **10 mảnh**.
- `Duyên Tinh` chỉ tiêu tại milestone mỗi 5★; chi phí tăng dần nhưng cap ở **5**.
- Star-up atomic: thiếu Duyên Tinh thì không mất mảnh.

### Tâm Lực / Tâm Ý

- `Tâm Lực` scale theo Thân Mật + phẩm + progression nhưng có diminishing curve.
- Mỗi **10★ nhận 1 Điểm Tâm Ý**.
- 3 nhánh authored: Trợ Chiến / Hộ Đạo / Hợp Kích, mỗi nhánh tối đa **Lv10**.
- Nhánh raw lặp vô hạn chỉ mở sau khi 3 nhánh đạt 10/10/10.
- Raw repeatable tăng Tâm Lực, không mở multiplier % vô hạn.

## 4. Combat — Đồng Tâm canonical

- Chỉ **1 `activeCompanionId`** tham gia combat.
- Trợ Chiến/Hộ Đạo/Hợp Kích đều chạy trong **shared CombatKernel**; không có resolver thứ hai.
- `Đồng Tâm` từ **0 → 100**.
- Hợp Kích **không dùng cooldown**; đủ 100 Đồng Tâm thì tự kích và tiêu 100.
- 8 Tri Kỷ có gauge profile riêng dựa trên event thật: `OnHit`, `OnCrit`, `OnDamageTaken`, `OnShieldBreak`, `OnDodge`, `OnTargetDodge`, `Summon`.
- Canonical trigger IDs: `confidant.v148.*`.

## 5. Phúc Duyên / Sở Trường

All-owned Phúc Duyên là raw-only:

- `cultivationPct = 0`;
- `huntRewardPct = 0`;
- `craftQualityPct = 0`.

All-owned raw contribution:

- `cultivationFlatPer15s`;
- `resourceMastery`;
- `craftMastery`.

Chỉ Tri Kỷ đang Đồng Hành kích hoạt Sở Trường. Active-specialty `%` là bounded/capped và cả 8 Sở Trường đều có consumer gameplay thật.

## 6. Companion gacha canonical

Pool đúng 8 người, không nearest-grade remap.

Explicit weights:

- `companion.5` — Huyền: 24
- `companion.6` — Huyền: 24
- `companion.2` — Địa: 15
- `companion.4` — Địa: 15
- `companion.1` — Thiên: 7
- `companion.3` — Thiên: 7
- `companion.8` — Thiên: 6
- `companion.7` — Tiên: 2

Tổng = 100. 50,000-pull simulation snapshot: Huyền ~43–44 pull/★; Địa ~64–67; Thiên ~112–118; Tiên Yến Vũ ~179. Không có rarity inversion.

## 7. Migration / save safety

Legacy Duyên chuyển một lần:

- Duyên I → 0★
- Duyên II → 5★
- Duyên III → 10★
- Duyên IV → 15★
- Duyên V → 20★

Migration deterministic + idempotent. Save cũ đã mở Trợ Chiến/Hộ Đạo/Hợp Kích được bảo toàn mechanic bằng compatibility entitlement, không tặng giả Thân Mật/Level mới.

## 8. V129 combat balance closure — LOCKED

Permanent benchmark: `qa/tests/v148-confidant-v129-balance-test.js`.

Representative V129 fixture:

- Kiếm Đạo / Kim Linh Căn;
- Potential = 1000, phân bổ Công 60% / Thể 20% / Phòng 20%;
- Đạo Hạnh 70;
- 4-piece thematic attire;
- grade Immortal;
- 8 deterministic seeds;
- 60 giây offense dummy + 60 giây pressure boss;
- Tri Kỷ fixture Lv5100 / 100★, Tâm Ý 0/0/0 để benchmark base kit thay vì trộn thêm branch investment.

Baseline: **262,803 damage/60s offense**, **210,322 damage/60s pressure**, survival score **61.40**.

Final calibrated snapshot:

| Tri Kỷ | Vai trò | Offense gain | Pressure gain | Survival Δ | Control Δ | Harmony/60s |
|---|---|---:|---:|---:|---:|---:|
| Mộc Quỳnh | Sustain | +0.0% | +7.1% | +13.60 | +0.00 | 0.50 |
| Ninh Tố | Control | +27.4% | +25.5% | +1.49 | +13.25 | 2.31 |
| Hạ Liên | Support | +21.5% | +20.3% | +5.69 | +4.88 | 2.53 |
| Tạ Vân | Burst | +29.8% | +20.4% | +0.93 | +13.00 | 2.25 |
| Lạc Dao | Support | +18.1% | +16.9% | +0.69 | +10.88 | 1.00 |
| Cố Thanh Hà | Control | +16.3% | +13.3% | +2.52 | +9.88 | 0.78 |
| Yến Vũ | Burst | +33.1% | +26.1% | +1.05 | +4.25 | 2.34 |
| Bạch Tố Tâm | Guard | +10.2% | +13.8% | +5.35 | +11.88 | 0.75 |

Calibration outcome:

- Mộc Quỳnh giữ sustain anchor mạnh nhất, không bị biến thành DPS.
- Tạ Vân tăng nhịp Hợp Kích thường dụng và đạt burst đúng vai trò.
- Lạc Dao đã hạ khỏi vùng DPS, giữ support/tempo ở +18.1% offense.
- Yến Vũ từ outlier +46.1% về **+33.1%**, vẫn là offense cao nhất nhưng nằm trong cap burst.
- Bạch Tố Tâm từ survival +1.67 lên **+5.35**, có guard identity thật; damage không lấn support/burst.
- Ninh Tố/Cố Thanh Hà giữ control identity; Hạ Liên giữ hybrid support/sustain.

Role envelopes đã khóa bằng assertion, không chỉ snapshot:

- Sustain Mộc Quỳnh: offense -2..10%, survival Δ ≥10.
- Ninh Tố control: offense 20..32%, control Δ ≥10.
- Hạ Liên support: offense 15..26%, survival Δ ≥4.
- Tạ Vân burst: offense 25..36% và phải vượt Hạ Liên.
- Lạc Dao support: offense 12..24% và không được vượt Tạ Vân.
- Cố Thanh Hà control: offense 10..24%, control Δ ≥8.
- Yến Vũ burst: offense 30..40% và phải là offense cao nhất.
- Bạch Tố Tâm guard: offense 5..18%, survival Δ ≥4 và phải rõ ràng cao hơn Yến Vũ burst.
- Harmony của mọi Tri Kỷ phải reachable và không spam >8 lần/60s trung bình.

## 9. Canonical QA — PASS

Balance source + permanent role-envelope candidate:

`cbe8a0a40e2189e86f3fcb6a5bcef5a207ca4ad7`

Full `V140 Canonical QA` run:

**`34438237851` — SUCCESS**

PASS gồm:

- codebase health;
- V140–V147 closed-system regression;
- dedicated V148 Tri Kỷ progression/economy/migration/runtime regression;
- dedicated `V148 Confidant × V129 balance` role-envelope benchmark;
- backend fast gate;
- frontend fast gate;
- backend closure **79/79**;
- frontend closure **20/20**.

Production tree không còn one-off V148 balance patch workflow.

**V148 + V129 balance is CLOSED on `feature/v148-confidant-rebuild`. `main` chưa merge.**

## 10. Existing invariants still active

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

## 11. Next work

Không tự merge `main` và không tự mở subsystem mới khi user chưa yêu cầu.

Roadmap đề xuất tiếp theo:

- V149 Pháp Bảo;
- V150 Luân Hồi Production Closure;
- V151 Economy/source-authority toàn game.
