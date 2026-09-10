# CURRENT CHECKPOINT — V149 PHÁP BẢO CLOSED

**Date:** 2026-09-10  
**Branch:** `feature/v149-artifact-rebuild`  
**Gameplay/web version:** `1.40.0-alpha.24.0`  
**Status:** V140–V149 **CLOSED / canonical QA PASS**.  
**Implementation HEAD validated:** `d54139ba79cd4c94258f0e73ad6146a69c206873`  
**QA run:** `34449454949` — SUCCESS  
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
- **V149 — Pháp Bảo progression/economy/combat/combo + V129 cross-build balance: CLOSED.**

Không mở lại hệ đã CLOSED vì chat cũ, save cũ, test lịch sử hoặc compatibility field còn tồn tại. Chỉ mở lại khi có regression thật hoặc user đổi yêu cầu.

## 2. V149 production authority

- Canonical equip: `collectionV12316.activeArtifactIds`.
- Canonical Chí Bảo: `collectionV12316.economyV12325.activeRelicId`.
- Legacy `state.artifacts` chỉ còn world-relic/reincarnation history compatibility; không có production combat authority.
- 12 Pháp Bảo production giữ nguyên roster authored.
- Shared CombatEngine / CombatKernel V2 là resolver duy nhất.

## 3. V149 progression lock

- Luyện Hóa Lv1–100 giữ nguyên.
- Bảo Giai I–V giữ nguyên.
- Sau Lv100 + Giai V mở **Bảo Hồn ∞**.
- Bảo Hồn chỉ tăng raw additive Công Lực / Thể Phách / Phòng Ngự theo profile món.
- Chỉ Pháp Bảo đang trang bị kích hoạt raw Bảo Hồn.
- Bảo Hồn tiêu `Luyện Bảo Tinh Hoa` hiện có; không tạo currency mới.
- Bảo Vận all-owned vẫn bounded: artifact power 12%, Bảo Khí gain 10%, cooldown recovery 6%, Chí Bảo power 8%.
- Bảo Hồn không scale các % này và không scale Pháp Kỹ vô hạn.

## 4. Combat + combo lock

Pháp Bảo **tham gia chiến đấu thật**, không phải stat-only:

- Pháp Kỹ live trên CombatEntity;
- trigger/event live trong shared CombatEngine;
- Bảo Khí dùng chung;
- presentation có Pháp Bảo call-in actor;
- HUD hiện Bảo Khí, Bảo Hồn raw và combo readiness.

**Combo không khóa theo bộ.** `hardSetLock=false`. Pháp Bảo khác nhóm vẫn combo nếu event/mark/state khớp.

Cross-artifact mark combos live:

- Dẫn Lôi Kính tạo `Lôi Ấn` → Lôi Phạt Kiếm tiêu tối đa 3 tầng để nổ thêm damage/break.
- Phá Vọng Kính tạo `Phá Vọng` → Tinh Lạc Kiếm Hạp tiêu 1 tầng để tăng follow-up.

Các món còn lại có interoperability role theo các event chung như OnHit, OnCrit, OnDamageTaken, OnEnemyHeal, OnShieldBreak, OnTargetDodge, low HP, Bảo Khí và Chân Nguyên.

V149 không tạo resolver combat thứ hai và không tạo HP/target lifecycle riêng cho Pháp Bảo.

## 5. V129 artifact balance lock

| Build | BASE | V88 | V149 | Artifact share | Combo increment |
|---|---:|---:|---:|---:|---:|
| Kiếm–Kim | 285,585 | 417,690 | 449,159 | 36.4% | +7.5% |
| Thể–Thổ | 90,059 | 141,498 | 149,008 | 39.6% | +5.3% |
| Tâm–Thủy | 145,867 | 293,755 | 323,651 | 54.9% | +10.2% |

Permanent policy: đánh giá V149 combo trên cùng V88 package, không ép mọi build phải có cùng total % gain. Combo increment <20%, artifact share <60%, share spread <25pp.

## 6. Permanent V149 QA

- Artifact core: **24/24 PASS**.
- Artifact production: **17/17 PASS**.
- Artifact combo combat: **15/15 PASS**.
- Artifact × V129 three-archetype balance: **PASS**.
- Backend fast: **15/15 PASS**.
- Frontend fast: **6/6 PASS**.
- Backend closure: **83/83 PASS**.
- Frontend closure: **20/20 PASS**.
- Full workflow run `34449454949`: **SUCCESS**.

## 7. Key files

- `dist/core/artifact-v88.js` — V149 artifact combat/combo adapter.
- `dist/core/artifact-v149-base.js` — preserved finite V88 + Bảo Hồn V149 core implementation.
- `dist/core/gacha-collection-economy-v12325.js` — V149 economy/read-model adapter.
- `dist/core/gameplay.js` — canonical player-facing artifact authority adapter.
- `modules/artifact-presentation-v88.js` — HUD/call-in presentation.
- `qa/tests/v149-artifact-core-test.js`.
- `qa/tests/v149-artifact-production-test.js`.
- `qa/tests/v149-artifact-combo-test.js`.
- `qa/tests/v149-artifact-v129-balance-test.js`.
- `docs/V149_ARTIFACT_AUDIT_AND_PRODUCTION_DESIGN.md`.

## 8. Next-session rule

Start from `feature/v149-artifact-rebuild`. Do not use legacy `state.artifacts` as production artifact authority. Do not merge `main` unless explicitly instructed.
