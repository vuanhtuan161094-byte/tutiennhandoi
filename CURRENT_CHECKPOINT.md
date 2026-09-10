# CURRENT CHECKPOINT — V150 BỎ BẢO KHÍ CLOSED

**Date:** 2026-09-10  
**Branch:** `feature/v150-remove-bao-qi`  
**Gameplay/web version:** `1.40.0-alpha.24.0`  
**Status:** V140–V150 **CLOSED / canonical QA PASS**.  
**Implementation HEAD validated:** `bdb265dde3fce4673e6a5c8a38493463433bcdaf`  
**QA run:** `34458834371` — SUCCESS  
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
- **V150 — bỏ Bảo Khí khỏi production Pháp Bảo/Chí Bảo combat, chuyển sang trigger + cooldown + condition: CLOSED.**

Không mở lại hệ đã CLOSED vì chat cũ, save cũ, test lịch sử hoặc compatibility field còn tồn tại. Chỉ mở lại khi có regression thật hoặc user đổi yêu cầu.

## 2. Production authority

- Canonical Pháp Bảo equip: `collectionV12316.activeArtifactIds`.
- Canonical Chí Bảo equip: `collectionV12316.economyV12325.activeRelicId`.
- Legacy `state.artifacts` chỉ còn world-relic/reincarnation history compatibility; không có production combat authority.
- 12 Pháp Bảo + 8 Chí Bảo giữ nguyên roster.
- Shared CombatEngine / CombatKernel V2 là resolver duy nhất.

## 3. V149 progression retained

- Luyện Hóa Lv1–100 giữ nguyên.
- Bảo Giai I–V giữ nguyên.
- Sau Lv100 + Giai V mở **Bảo Hồn ∞**.
- Bảo Hồn chỉ tăng raw additive Công Lực / Thể Phách / Phòng Ngự theo profile món.
- Chỉ Pháp Bảo đang trang bị kích hoạt raw Bảo Hồn.
- Bảo Hồn tiêu `Luyện Bảo Tinh Hoa`; không tạo currency mới.
- Bảo Hồn không scale %/cooldown/Pháp Kỹ vô hạn.

## 4. V150 combat lock — Bảo Khí đã bỏ

Production Pháp Bảo/Chí Bảo **không còn dùng Bảo Khí**.

Canonical activation:

`event/condition -> cooldown -> Pháp Kỹ hoặc Chí Bảo rule -> shared CombatEngine effect`

- Không còn Bảo Khí cost.
- Không còn Bảo Khí gain/refund.
- Không còn Bảo Khí max/cap gameplay.
- HUD không còn thanh Bảo Khí.
- Economy/player DTO không còn trình bày Bảo Khí Fortune.
- Runtime compatibility fields liên quan Bảo Khí được hard-zero để nhánh legacy trong CombatEngine không hoạt động.
- V150 dùng cooldown multiplier `1.05` cho Pháp Kỹ để thay thế resource throttle và giữ power budget; gate balance không được nới.

## 5. Combo retained

**Combo không khóa theo bộ.** `hardSetLock=false`.

- Dẫn Lôi Kính tạo `Lôi Ấn` → Lôi Phạt Kiếm tiêu tối đa 3 tầng để tăng damage/break.
- Phá Vọng Kính tạo `Phá Vọng` → Tinh Lạc Kiếm Hạp tiêu 1 tầng để tăng follow-up.
- Các tương tác còn lại dùng event/trạng thái như OnHit, OnCrit, OnDamageTaken, OnEnemyHeal, OnShieldBreak, OnTargetDodge, low HP và Chân Nguyên.

V150 không tạo resolver combat thứ hai và không tạo HP/target lifecycle riêng cho Pháp Bảo.

## 6. Three Chí Bảo formerly tied to Bảo Khí

V150 thay gameplay thay vì để thành passive chết:

- **Thái Hư Châu — Thái Hư Xuyên Giới:** OnHit/ActiveHit, CD 12s, xuyên kích không thể né + hồi 10 Chân Nguyên.
- **Vạn Pháp Đạo Chung — Vạn Pháp Cộng Minh:** OnHit/ProcHit, CD 7.5s, đạo âm follow-up; không khóa bộ.
- **Hỗn Độn Đỉnh — Hỗn Độn Dung Lô:** OnDamageTaken khi HP <70%, CD 10s, khiên 8% HP tối đa trong 5s + hồi 8 Chân Nguyên.

Năm Chí Bảo còn lại giữ identity combat hiện có nhưng bỏ mọi cost/refund Bảo Khí.

## 7. Balance lock after resource removal

| Build | BASE | V88 package | V150 final | Artifact share | Increment over V88 |
|---|---:|---:|---:|---:|---:|
| Kiếm–Kim | 285,585 | 417,690 | 449,854 | 36.5% | +7.7% |
| Thể–Thổ | 90,059 | 141,498 | 149,618 | 39.8% | +5.7% |
| Tâm–Thủy | 145,867 | 293,755 | 346,967 | 58.0% | +18.1% |

Permanent policy: artifact share <60%, incremental package power <20%, share spread <25pp. Không nới gate để hợp thức hóa việc bỏ resource.

## 8. Permanent V150 QA

- V149 Artifact core: **24/24 PASS**.
- V149 Artifact production: **17/17 PASS**.
- V149/V150 Artifact combo: **19/19 PASS**.
- Artifact × V129 three-archetype balance: **PASS**.
- V150 no-Bảo-Khí contract: **23/23 PASS**.
- Backend fast: **15/15 PASS**.
- Frontend fast: **6/6 PASS**.
- Backend closure: **84/84 PASS**.
- Frontend closure: **20/20 PASS**.
- Full workflow run `34458834371`: **SUCCESS**.

## 9. Key files

- `dist/core/artifact-v88.js` — V150 public combat/resource adapter.
- `dist/core/artifact-v149-base.js` — preserved V149 progression/base implementation.
- `dist/core/gacha-collection-economy-v12325.js` — V150 resource-free economy/read model.
- `dist/core/gameplay.js` — canonical player-facing artifact authority adapter.
- `modules/artifact-presentation-v88.js` — resource-free HUD/call-in presentation.
- `qa/tests/v149-artifact-core-test.js`.
- `qa/tests/v149-artifact-production-test.js`.
- `qa/tests/v149-artifact-combo-test.js`.
- `qa/tests/v149-artifact-v129-balance-test.js`.
- `qa/tests/v150-artifact-no-baoqi-test.js`.
- `docs/V149_ARTIFACT_AUDIT_AND_PRODUCTION_DESIGN.md` — historical V149 closure; its Bảo Khí activation statements are superseded by V150.
- `docs/V150_ARTIFACT_RESOURCE_REMOVAL.md` — current resource-removal lock.

## 10. Next-session rule

Start from `feature/v150-remove-bao-qi`. Do not restore Bảo Khí from historical V149 code/docs or compatibility fields. Do not use legacy `state.artifacts` as production authority. Do not merge `main` unless explicitly instructed.
