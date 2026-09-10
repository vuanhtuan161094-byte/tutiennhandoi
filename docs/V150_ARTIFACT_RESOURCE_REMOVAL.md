# V150 — PHÁP BẢO RESOURCE REMOVAL

**Date:** 2026-09-10  
**Branch:** `feature/v150-remove-bao-qi`  
**Status:** CLOSED / LOCKED after canonical QA  
**Supersedes:** V149 Bảo Khí activation model only. V149 progression, Bảo Hồn, equip authority and mark-combo architecture remain canonical.

## 1. Decision

V150 removes **Bảo Khí** as a production combat resource for Pháp Bảo and Chí Bảo.

Canonical activation is now:

`combat event/condition -> cooldown check -> Pháp Kỹ / Chí Bảo rule -> shared CombatEngine effects`

There is no player-facing artifact resource bar, no Bảo Khí cost, no Bảo Khí gain/refund, and no Bảo Khí capacity gameplay.

Reason: Chân Nguyên already owns the character skill-resource role. A second resource whose main purpose was throttling automatic Pháp Bảo proc duplicated complexity that trigger conditions + cooldowns can handle directly.

## 2. What remains unchanged from V149

- Production Pháp Bảo equip authority: `collectionV12316.activeArtifactIds`.
- Production Chí Bảo authority: `collectionV12316.economyV12325.activeRelicId`.
- 12 authored Pháp Bảo remain.
- 8 authored Chí Bảo remain.
- Shared CombatEngine / CombatKernel V2 remains the only mechanic resolver.
- Bảo Hồn ∞ remains additive raw Công Lực / Thể Phách / Phòng Ngự only.
- Bảo Hồn uses existing `Luyện Bảo Tinh Hoa`; no new currency.
- Cross-artifact combos remain state/event/mark based and never require same-set membership.
- Dẫn Lôi Kính -> `Lôi Ấn` -> Lôi Phạt Kiếm consumption remains live.
- Phá Vọng Kính -> `Phá Vọng` -> Tinh Lạc Kiếm Hạp consumption remains live.

## 3. V150 runtime contract

Public resource contract:

- schema: `artifact.resource.v150`
- mode: `trigger-cooldown`
- `baoQiEnabled=false`
- artifact cooldown pacing multiplier: `1.05`

The 1.05 cooldown multiplier is an explicit replacement throttle after removing resource gating. It was added because the first no-resource balance run pushed Tâm–Thủy's incremental artifact package to the 20% ceiling. The test ceiling was **not relaxed**; pacing was corrected instead.

Compatibility values on `combatBuildV117.artifactV88` are hard-zeroed:

- `baoQiMax=0`
- `baseGainPerAction=0`
- `baoQiGainPct=0`
- `baoQiCostReductionPct=0`

These zeros keep the older dormant CombatEngine resource branch inert. They are compatibility fields, not production gameplay. Physical removal of that legacy branch is a separate cleanup task and is not required for V150 gameplay closure.

## 4. Player-facing cleanup

- Artifact definitions no longer expose Bảo Khí cost/gain passives.
- Relic definitions no longer expose Bảo Khí cost/gain/max passives.
- Economy DTO removes the obsolete Bảo Khí Fortune line from player-facing output.
- Combat HUD removes the Bảo Khí meter.
- Artifact callouts no longer display Bảo Khí costs.
- HUD explains activation as `Trigger + hồi chiêu` and still shows Chí Bảo, Bảo Hồn raw and ready mark-combos.

## 5. Former resource-only Chí Bảo replacements

Three Chí Bảo would have become dead passives after resource removal, so V150 gives them actual shared-engine combat rules:

### Thái Hư Châu — Thái Hư Xuyên Giới

- Role: Không gian / đổi nhịp.
- Trigger: `OnHit` from `ActiveHit`.
- Cooldown: 12s.
- Effect: unavoidable follow-up damage + restore 10 Chân Nguyên.

### Vạn Pháp Đạo Chung — Vạn Pháp Cộng Minh

- Role: Cộng hưởng Pháp Bảo.
- Trigger: `OnHit` from `ProcHit`.
- Cooldown: 7.5s.
- Effect: non-dodge follow-up damage.
- No same-set lock.

### Hỗn Độn Đỉnh — Hỗn Độn Dung Lô

- Role: Luyện hóa áp lực.
- Trigger: `OnDamageTaken` when HP <70%.
- Cooldown: 10s.
- Effect: 8% max-HP shield for 5s + restore 8 Chân Nguyên.

Other five Chí Bảo keep their pre-existing combat identities while all Bảo Khí costs/refunds are removed.

## 6. Balance evidence

Validated implementation HEAD: `bdb265dde3fce4673e6a5c8a38493463433bcdaf`  
Canonical workflow run: `34458834371` — SUCCESS.

V149/V150 artifact package against the same V129 three-archetype benchmark:

| Build | BASE | Pre-V150 V88 package | V150 final | Final artifact share | Increment over V88 |
|---|---:|---:|---:|---:|---:|
| Kiếm–Kim | 285,585 | 417,690 | 449,854 | 36.5% | +7.7% |
| Thể–Thổ | 90,059 | 141,498 | 149,618 | 39.8% | +5.7% |
| Tâm–Thủy | 145,867 | 293,755 | 346,967 | 58.0% | +18.1% |

Permanent gates remain:

- final artifact contribution share <60%;
- incremental package power <20% over the same V88 package;
- share spread across three V129 archetypes <25 percentage points;
- live repeated Pháp Bảo triggers required;
- real mark combo occurrence required.

## 7. QA closure

On run `34458834371`:

- V149 core: 24/24 PASS.
- V149 production: 17/17 PASS.
- V149/V150 combo: 19/19 PASS.
- V149 × V129 balance: PASS.
- V150 no-Bảo-Khí contract: 23/23 PASS.
- Backend fast: 15/15 PASS.
- Frontend fast: 6/6 PASS.
- Backend closure: 84/84 PASS.
- Frontend closure: 20/20 PASS.

## 8. Key files

- `dist/core/artifact-v88.js` — V150 public combat/resource adapter.
- `dist/core/artifact-v149-base.js` — preserved V149 progression/base implementation.
- `dist/core/gacha-collection-economy-v12325.js` — player-facing resource-free read model.
- `modules/artifact-presentation-v88.js` — resource-free combat HUD/call-in.
- `qa/tests/v149-artifact-combo-test.js` — combo contract updated for V150.
- `qa/tests/v149-artifact-v129-balance-test.js` — cross-build power gate.
- `qa/tests/v150-artifact-no-baoqi-test.js` — permanent resource-removal gate.

## 9. Lock

Do not restore Bảo Khí because old V149 code, fields, docs or save compatibility still mention it. Reintroducing a separate Pháp Bảo resource is a gameplay-design change and requires explicit user approval.
