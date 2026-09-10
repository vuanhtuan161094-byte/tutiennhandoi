# CURRENT CHECKPOINT — V151 CHÍ BẢO CLOSED

**Date:** 2026-09-10  
**Branch:** `feature/v151-relic-rebuild`  
**Gameplay/web version:** `1.40.0-alpha.24.0`  
**Status:** V140–V151 **CLOSED / LOCKED** once the exact current branch HEAD passes canonical QA.  
**Implementation HEAD validated:** `d2c85aa3aa4295a02a8f217eaac340f70a5b9aa8`  
**Implementation QA run:** `34462446269` — SUCCESS  
**Main:** intentionally **not merged / untouched**.  
**Rule:** current branch source is truth. **Do not merge `main`** unless the user explicitly asks.

## 1. Closed baseline

- V140 — Tu Luyện: CLOSED.
- V141 — Săn Yêu × Tu Luyện: CLOSED.
- V142 — Trang Bị × Hunt: CLOSED.
- V143 — Hunt reward authority + Set Resonance: CLOSED.
- V144 — Công Pháp/Bí Thuật legacy retirement: CLOSED.
- V145 — Linh Căn infinite progression: CLOSED.
- V146 — Đan Dược production closure: CLOSED.
- V147 — Linh Thú progression/economy/combat: CLOSED.
- V148 — Tri Kỷ progression/economy/combat + V129 cross-build balance: CLOSED.
- V149 — Pháp Bảo progression/economy/combat/combo + V129 cross-build balance: CLOSED.
- V150 — bỏ Bảo Khí khỏi production Pháp Bảo/Chí Bảo combat: CLOSED.
- **V151 — Chí Bảo one-slot combat-law rebuild, finite progression, source/sink, all-eight real combat QA + V129 one-slot balance: CLOSED.**

Không mở lại hệ đã CLOSED vì chat cũ, save cũ, test lịch sử hoặc compatibility field còn tồn tại. Chỉ mở lại khi có regression thật hoặc user đổi yêu cầu.

## 2. Production authority

- Canonical Pháp Bảo equip: `collectionV12316.activeArtifactIds`.
- Canonical Chí Bảo equip: `collectionV12316.economyV12325.activeRelicId`.
- Chí Bảo active limit: **1**.
- `activeRelicId` chỉ có hiệu lực nếu item thực sự **owned** trong `economyV12325.extraItems`.
- Save hỏng/stale ghi một Chí Bảo chưa sở hữu là active phải cho **zero combat effect**.
- Legacy `state.artifacts` chỉ còn world-relic/reincarnation history compatibility; không có production combat authority.
- Roster giữ **12 Pháp Bảo + 8 Chí Bảo**.
- Shared CombatEngine / CombatKernel V2 là resolver duy nhất.

## 3. Pháp Bảo lock retained from V149/V150

- Luyện Hóa Lv1–100.
- Bảo Giai I–V.
- Sau Lv100 + Giai V mở **Bảo Hồn ∞** cho Pháp Bảo.
- Bảo Hồn chỉ tăng raw additive Công Lực / Thể Phách / Phòng Ngự theo profile món.
- Chỉ Pháp Bảo đang trang bị kích hoạt raw Bảo Hồn.
- Bảo Hồn tiêu `Luyện Bảo Tinh Hoa`; không tạo currency mới.
- Bảo Hồn không scale %/cooldown/Pháp Kỹ vô hạn.
- Combo Pháp Bảo **không khóa theo bộ**: `hardSetLock=false`.
- Dẫn Lôi Kính → `Lôi Ấn` → Lôi Phạt Kiếm tiêu mark.
- Phá Vọng Kính → `Phá Vọng` → Tinh Lạc Kiếm Hạp tiêu mark.
- Production Pháp Bảo/Chí Bảo không còn dùng Bảo Khí.

Canonical activation:

`event/condition -> cooldown/once-per-battle -> effect -> shared CombatEngine`

## 4. V151 Chí Bảo identity lock

Chí Bảo không phải Pháp Bảo mạnh hơn và không phải slot cộng stat thụ động. Người chơi chọn đúng **1 Chí Bảo**, và món đó phải thay đổi một luật/tình huống combat có ý nghĩa.

| Chí Bảo | Identity | Production mechanic |
|---|---|---|
| **Sơn Hà Đồ** | Đạo vực cứu nguy | `OnDamageTaken`, HP <35%, once/battle: hồi 3% max HP + khiên 18% max HP trong 6s. |
| **Luân Hồi Kính** | Đảo tử hộ mệnh | Đòn chí tử, once/battle giữ 1 HP bằng shared anti-death path; dùng chung `__birth_antideath_used`. |
| **Trảm Tiên Đài** | Kết liễu / Boss | `OnHit/ActiveHit`, target HP <20%, CD 9s: đòn true damage 0.85, không thể né. |
| **Thái Hư Châu** | Xuyên giới đổi nhịp | `OnHit/ActiveHit`, CD 12s: follow-up 0.42 không thể né + hồi 12 Chân Nguyên. |
| **Vạn Pháp Đạo Chung** | Cộng hưởng vạn pháp | `OnHit/Summon`, CD 7.5s: follow-up 0.32 không thể né; nghe hit Pháp Bảo/triệu hồi thật. |
| **Hỗn Độn Đỉnh** | Phản luyện áp lực | `OnDamageTaken`, HP <70%, CD 10s: counter 0.42 + khiên 4% max HP/4s + hồi 6 Chân Nguyên. |
| **Càn Khôn Xích** | Khóa thân pháp / combo | `OnTargetDodge/ActiveHit`, CD 8s: counter 0.58 không thể né + tạo 2 `Phá Vọng` (max 3). |
| **Tịnh Thế Liên** | Tịnh hóa khống chế | `OnDamageTaken`, HP <45%, CD 14s: xóa BodyControl/SpiritControl + khiên 8% max HP/5s + hồi 5 Chân Nguyên. |

Tám món có tám pattern combat khác nhau. Không có cùng-bộ/set requirement.

## 5. V151 progression and economy

Chí Bảo giữ progression **finite**, không có Bảo Hồn ∞:

- Luyện Hóa Lv1–100.
- Bảo Giai I–V.
- Effect scale: `(.9 + level * .0045) × (1 + gradeIndex * .06) × (1 + relicFortunePowerPct / 100)`.
- Progression tăng damage/heal/shield/Chân Nguyên authored values nhưng **không tự giảm cooldown**.

Source/sink production:

- summon: **Thiên Bảo**;
- daily source: **Chí Bảo Tàn Giới**;
- strengthening: **Chí Bảo Linh Tinh**;
- advancement: **mảnh riêng + Thiên Tinh Tiến Giai**.

V151 không tạo currency mới.

## 6. Shared-engine guarantees

- Shared `CombatEngine` / CombatKernel V2 là mechanic resolver duy nhất.
- Không có `RelicCombat` class và không có second engine.
- 7 Chí Bảo dùng trigger shared-engine bình thường.
- Luân Hồi Kính dùng lethal-hit/anti-death path hiện hữu.
- Chỉ Chí Bảo vừa **owned vừa active** được inject.
- Legacy Luân Hồi Kính tags được strip rồi chỉ add lại khi owned active relic đúng là Luân Hồi Kính.

## 7. All-eight real combat QA

V151 production gate ép đủ 8/8 tình huống gameplay thật:

1. Sơn Hà Đồ phải thực sự xuống <35% HP, chỉ mở đúng một emergency-reset window và tạo khiên thật.
2. Luân Hồi Kính phải nhận lethal hit thật, giữ 1 HP và tiêu shared anti-death charge.
3. Trảm Tiên Đài phải thấy target <20% HP và gây true damage thật.
4. Thái Hư Châu phải proc lặp trong combat thật nhưng bị bound bởi CD 12s.
5. Vạn Pháp Đạo Chung phải nhận hit `Summon` thật từ Pháp Bảo/triệu hồi và không recursive spam.
6. Hỗn Độn Đỉnh fixture phải chứng minh HP thực sự đi qua <70% trước khi trigger được tính PASS.
7. Càn Khôn Xích phải bắt dodge thật và tạo `Phá Vọng` trong shared mark state.
8. Tịnh Thế Liên phải gặp `status.stun` BodyControl thật dưới ngưỡng HP và thực sự remove control status.

Final implementation gate: **44/44 PASS**.

## 8. Audit findings fixed in V151

- **Vạn Pháp source-tag bug:** bản đầu nghe `ProcHit`, trong khi production Pháp Bảo damage đi bằng `Summon`. Đã sửa mechanic sang `Summon`; không nới test.
- **Hỗn Độn pressure fixture bug:** fixture đầu không đủ damage để actor 48,000 HP xuống dưới 70% trong cửa sổ test. Đã sửa fixture và thêm assertion chứng minh ngưỡng HP thật sự được vượt qua.
- **Stale activeRelic authority:** `activeRelicId` không còn được tin nếu item chưa owned; kể cả Luân Hồi Kính cũng không được leak anti-death từ save lỗi.

## 9. V151 × V129 one-slot balance

Giữ cùng Pháp Bảo package rồi thay lần lượt 8 Chí Bảo trên 3 archetype canonical.

| Build | Baseline | Thái Hư Châu | Δ | Vạn Pháp Đạo Chung | Δ |
|---|---:|---:|---:|---:|---:|
| Kiếm–Kim | 432,658 | 455,577 | +5.3% | 436,135 | +0.8% |
| Thể–Thổ | 148,373 | 151,712 | +2.3% | 152,386 | +2.7% |
| Tâm–Thủy | 346,087 | 360,312 | +4.1% | 357,662 | +3.3% |

Sơn Hà Đồ, Luân Hồi Kính, Trảm Tiên Đài, Hỗn Độn Đỉnh, Càn Khôn Xích và Tịnh Thế Liên cho 0% idle-target sustained DPS khi điều kiện riêng không xuất hiện; effect điều kiện của chúng được kiểm bằng production combat gate riêng.

Permanent V151 balance rules:

- mỗi Chí Bảo <15% sustained DPS trong benchmark này;
- Thái Hư/Vạn Pháp dùng soft ceiling chặt hơn: <12%;
- defensive/situational relic không được có free idle-target sustained DPS;
- offensive/tempo relic phải có output đo được và real repeated participation.

Không có general-purpose Chí Bảo nào trở thành mandatory DPS pick.

## 10. Player-facing clarity

Collection/economy read-model phải hiển thị:

- one-slot Chí Bảo authority;
- finite progression;
- combat identity/pattern từng món;
- active Chí Bảo summary;
- source/sink provenance.

Combat HUD hiển thị tên Chí Bảo đang chọn, identity và purpose. Call-in presentation dùng `ArtifactV151`; mechanic vẫn resolve hoàn toàn trong CombatEngine.

Unique Chí Bảo art/VFX **chưa phải mechanic gap**; presentation hiện vẫn dùng generic artifact visual asset.

## 11. QA evidence

Implementation HEAD: `d2c85aa3aa4295a02a8f217eaac340f70a5b9aa8`  
Implementation canonical run: `34462446269` — **SUCCESS**.

Observed:

- V149 core: **24/24 PASS**.
- V149 production: **17/17 PASS**.
- V149/V150 combo: **19/19 PASS**.
- V149 × V129 balance: **PASS**.
- V150 no-Bảo-Khí: **23/23 PASS**.
- V151 Chí Bảo production: **44/44 PASS**.
- V151 Chí Bảo × V129 one-slot balance: **PASS**.
- Backend fast: **15/15 PASS**.
- Frontend fast: **6/6 PASS**.
- Backend closure: **86/86 PASS**.
- Frontend closure: **20/20 PASS**.

The exact current documentation/checkpoint closure HEAD must also have a SUCCESS canonical workflow run. If that run is not SUCCESS, V151 is not considered locked regardless of this file title.

## 12. Key files

- `dist/core/artifact-v88.js` — V151 public Chí Bảo combat adapter + V150 resource-free artifact adapter.
- `dist/core/artifact-v149-base.js` — preserved V149 core/Bảo Hồn implementation.
- `dist/core/gacha-collection-economy-v12325.js` — V151 read-model/provenance.
- `dist/core/gameplay.js` — canonical player-facing artifact authority adapter.
- `modules/artifact-presentation-v88.js` — Chí Bảo identity HUD/call-in.
- `qa/tests/v151-relic-production-test.js` — 8/8 real gameplay gate.
- `qa/tests/v151-relic-v129-balance-test.js` — one-slot cross-build balance gate.
- `.github/workflows/v140-ci.yml` — canonical QA workflow.
- `docs/V151_RELIC_AUDIT_AND_PRODUCTION_DESIGN.md` — V151 closure design/audit.

## 13. Next-session rule

Start from `feature/v151-relic-rebuild`. Do not restore Bảo Khí, multi-relic simultaneous activation, unowned active-id authority, stat-only Chí Bảo behavior, or legacy `state.artifacts` production authority. Do not merge `main` unless explicitly instructed.
