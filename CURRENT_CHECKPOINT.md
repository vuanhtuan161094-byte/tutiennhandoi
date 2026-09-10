# CURRENT CHECKPOINT — V148 TRI KỶ + V129 CROSS-BUILD BALANCE CLOSED

**Date:** 2026-09-10  
**Branch:** `feature/v148-confidant-rebuild`  
**Gameplay/web version:** `1.40.0-alpha.24.0`  
**Status:** V140–V148 **CLOSED / V129 three-archetype combat balance LOCKED / canonical QA PASS**.  
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
- **V148 — Tri Kỷ progression/economy/combat integration + V129 cross-build combat calibration: CLOSED.**

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
- `qa/tests/v148-confidant-v129-balance-test.js` — permanent V129 **three-archetype** combat matrix + role-envelope regression.

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

### Heart Power damage scaling — cross-build lock

V129 matrix phát hiện flat damage từ `Tâm Lực` làm Tri Kỷ gánh tỷ lệ sát thương quá lớn trên build có personal DPS thấp. Cơ chế này đã bị loại khỏi V148 damage authority.

Canonical mới:

- authored `flatDamage` vẫn được tôn trọng nếu effect thật sự có authored flat;
- **Tâm Lực không còn bơm flat damage trực tiếp**;
- Tâm Lực chuyển thành attack-scaled coefficient có hard cap:
  - Trợ Chiến: tối đa **+0.12 coefficient**;
  - Hộ Đạo damage: tối đa **+0.10 coefficient**;
  - Hợp Kích: tối đa **+0.28 coefficient**;
- relation scale, branch bonus và Phá Thế vẫn giữ bounded cap riêng.

Kết quả: build Tâm/Thể không còn bị Tri Kỷ chiếm +70–80% DPS chỉ vì baseline cá nhân thấp.

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

## 8. V129 three-archetype combat matrix — LOCKED

Permanent benchmark: `qa/tests/v148-confidant-v129-balance-test.js`.

Shared fixture:

- Potential tổng = **1000**;
- Đạo Hạnh = **70**;
- 4-piece thematic attire;
- grade Immortal;
- **6 deterministic seeds** mỗi archetype;
- 60 giây offense dummy + 60 giây pressure boss;
- Tri Kỷ fixture Lv5100 / 100★;
- Tâm Ý 0/0/0 để đo base kit, không trộn branch investment.

Ba archetype canonical:

1. **Kiếm–Kim · thiên Công** — Công 65% / Thể 20% / Phòng 15%.
2. **Thể–Thổ · sinh tồn** — Công 20% / Thể 50% / Phòng 30%.
3. **Tâm–Thủy · khống chế** — Công 40% / Thể 20% / Phòng 40%.

### Aggregate cuối — trung bình 3 archetype

| Tri Kỷ | Vai trò | Offense gain | Pressure gain | Survival Δ | Control Δ |
|---|---|---:|---:|---:|---:|
| Mộc Quỳnh | Sustain | **+0.0%** | +0.3% | **+8.99** | +0.00 |
| Ninh Tố | Control | +22.8% | +21.9% | +0.83 | **+13.22** |
| Hạ Liên | Support | +17.1% | +12.1% | +3.61 | +4.56 |
| Tạ Vân | Burst | **+26.5%** | +21.6% | +0.62 | +13.11 |
| Lạc Dao | Support | +17.5% | +12.1% | +0.81 | +10.67 |
| Cố Thanh Hà | Control | +12.8% | +14.4% | +1.65 | **+9.67** |
| Yến Vũ | Burst / Tiên | **+28.4%** | **+27.6%** | +0.53 | +4.44 |
| Bạch Tố Tâm | Guard | +8.8% | +11.8% | **+3.72** | +11.89 |

### Cross-build interpretation

- **Yến Vũ** là burst leader theo aggregate: +28.4%, cao hơn Tạ Vân +26.5%.
- Ở Thể–Thổ, Tạ Vân có thể nhỉnh hơn Yến Vũ do `armor_fracture` hợp build; đây là synergy hợp lệ, không ép mọi build có cùng ranking.
- **Tạ Vân** vẫn vượt hai support ở cả 3 archetype.
- **Mộc Quỳnh** giữ sustain anchor; aggregate survival +8.99 cao nhất.
- **Bạch Tố Tâm** giữ guard identity: offense chỉ +8.8%, survival +3.72 và control +11.89.
- **Ninh Tố/Cố Thanh Hà** giữ control identity trên cả 3 build.
- Hạ Liên/Lạc Dao không vượt burst envelope ở aggregate.
- Sau scaler fix, archetype Tâm–Thủy có mức offense cao nhất riêng lẻ là Yến Vũ **+44.3%**, vẫn dưới hard safety envelope 55%; không còn outlier 75–81%.

Role hierarchy regression đã khóa:

- mọi archetype: Tri Kỷ phải có Assist, Harmony reachable và Harmony không spam >8 lần/60s;
- mọi archetype: offense gain phải nằm trong **(-5%, 55%)**;
- Tạ Vân phải vượt Hạ Liên và Lạc Dao trên từng archetype;
- Ninh Tố control Δ ≥10 trên từng archetype;
- Cố Thanh Hà control Δ ≥8 trên từng archetype;
- Bạch Tố Tâm không được drift thành burst; Lạc Dao không được drift thành burst;
- aggregate Yến Vũ phải vượt Tạ Vân;
- aggregate Tạ Vân phải vượt support;
- aggregate survival hierarchy: **Sustain > Guard > Burst**;
- aggregate Guard offense phải thấp hơn Support offense.

## 9. Canonical QA — PASS

Cross-build source + permanent role hierarchy lock:

`8080cc1e44c519468da65d0a9457a4e4eef1e69b`

Full `V140 Canonical QA` run:

**`34439513061` — SUCCESS**

PASS gồm:

- codebase health;
- V140–V147 closed-system regression;
- dedicated V148 Tri Kỷ progression/economy/migration/runtime regression;
- dedicated `V148 Confidant × V129 balance` **three-archetype** matrix;
- backend fast **15/15**;
- frontend fast **6/6**;
- backend closure **79/79**;
- frontend closure **20/20**.

Production tree không còn one-off V148 balance/scaler/Yến Vũ patch workflow.

**V148 + V129 cross-build balance is CLOSED on `feature/v148-confidant-rebuild`. `main` chưa merge.**

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
