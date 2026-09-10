# V151 — CHÍ BẢO AUDIT & PRODUCTION REBUILD

**Date:** 2026-09-10  
**Branch:** `feature/v151-relic-rebuild`  
**Status:** CLOSED / LOCKED after exact-head canonical QA  
**Supersedes:** V150 Chí Bảo mechanic details only. V149 Pháp Bảo progression/combo and V150 no-Bảo-Khí rule remain canonical.

## 1. Canonical identity

Chí Bảo is **not** a stronger Pháp Bảo and is not a passive stat slot.

Canonical rule:

> The player equips exactly **one** Chí Bảo. That one item changes a meaningful combat law, trigger window, survival rule, execution rule, or cross-system interaction.

Production authority remains:

- `collectionV12316.economyV12325.activeRelicId`
- active limit: **1**
- the selected id must also be **owned** in `economyV12325.extraItems[id]`
- a stale/corrupt `activeRelicId` for an unowned item grants **zero** combat effect

Legacy `state.artifacts` remains history/compatibility only and has no production Chí Bảo authority.

## 2. V150 no-resource rule retained

Bảo Khí remains removed from production combat.

Chí Bảo activation follows:

`combat event/condition -> cooldown/once-per-battle check -> Chí Bảo rule -> shared CombatEngine effect`

There is no Chí Bảo Bảo Khí cost, gain, refund, capacity or resource bar.

## 3. Final eight Chí Bảo

| Chí Bảo | Identity | Production mechanic |
|---|---|---|
| **Sơn Hà Đồ** | Đạo vực cứu nguy | `OnDamageTaken`, HP <35%, once/battle: heal 3% max HP + shield 18% max HP for 6s. Creates one emergency reset window, not an extra life. |
| **Luân Hồi Kính** | Đảo tử hộ mệnh | On a lethal hit, once/battle keep 1 HP through the existing shared anti-death path. Shares `__birth_antideath_used` with other anti-death sources, so effects cannot stack into extra lives. |
| **Trảm Tiên Đài** | Kết liễu / Boss | `OnHit/ActiveHit`, target HP <20%, CD 9s: 0.85 true-damage strike that cannot be dodged. Intended for the final Boss phase, not passive all-fight DPS. |
| **Thái Hư Châu** | Xuyên giới đổi nhịp | `OnHit/ActiveHit`, CD 12s: unavoidable 0.42 follow-up + restore 12 Chân Nguyên. |
| **Vạn Pháp Đạo Chung** | Cộng hưởng vạn pháp | `OnHit/Summon`, CD 7.5s: 0.32 non-dodge follow-up. Listens to real Pháp Bảo/summon hit traffic; cooldown prevents self-loop spam. |
| **Hỗn Độn Đỉnh** | Phản luyện áp lực | `OnDamageTaken`, HP <70%, CD 10s: 0.42 counter hit + 4% max-HP shield for 4s + restore 6 Chân Nguyên. |
| **Càn Khôn Xích** | Khóa thân pháp / combo | `OnTargetDodge/ActiveHit`, CD 8s: unavoidable 0.58 counter + add 2 `Phá Vọng` stacks (max 3), creating a real bridge into compatible finishers such as Tinh Lạc Kiếm Hạp. |
| **Tịnh Thế Liên** | Tịnh hóa khống chế | `OnDamageTaken`, HP <45%, CD 14s: remove BodyControl/SpiritControl + 8% max-HP shield for 5s + restore 5 Chân Nguyên. |

The eight items have eight distinct combat-law patterns. No same-set membership is required.

## 4. Finite progression

Chí Bảo remains intentionally finite:

- Luyện Hóa Lv1–100
- Bảo Giai I–V
- no Bảo Hồn infinite lane for Chí Bảo

Effect scale uses existing finite progression and bounded relic fortune:

`(.9 + level * .0045) × (1 + gradeIndex * .06) × (1 + relicFortunePowerPct / 100)`

Progression scales authored damage/heal/shield/Chân Nguyên values, but **does not silently accelerate cooldowns**.

## 5. Source / sink loop

Production read-model exposes the existing loop:

- summon: **Thiên Bảo**
- daily source: **Chí Bảo Tàn Giới**
- strengthening material: **Chí Bảo Linh Tinh**
- advancement: **mảnh riêng + Thiên Tinh Tiến Giai**

No new currency was introduced in V151.

## 6. Shared-engine and authority guarantees

- Shared `CombatEngine` / CombatKernel V2 remains the only mechanic resolver.
- V151 adds no `RelicCombat` class and no second combat engine.
- Seven Chí Bảo use normal shared-engine triggers.
- Luân Hồi Kính uses the existing shared lethal-hit/anti-death branch.
- Only the owned active Chí Bảo is injected.
- Legacy mirror tags are stripped and re-added only when the owned active Chí Bảo is Luân Hồi Kính.

## 7. Real gameplay QA — all eight exercised

V151 production gate does not stop at definition/injection checks. It creates real CombatKernel situations for every item:

1. Sơn Hà Đồ is forced below 35% HP; exactly one emergency reset and a real shared-engine shield must occur.
2. Luân Hồi Kính receives a lethal hit; the real anti-death event must keep 1 HP and consume the shared once-per-battle charge.
3. Trảm Tiên Đài must see a real target below 20% and emit real true damage.
4. Thái Hư Châu must repeatedly trigger in a live fight while remaining bounded by 12s cooldown.
5. Vạn Pháp Đạo Chung must receive real Pháp Bảo/Summon hits and repeatedly trigger without recursive spam.
6. Hỗn Độn Đỉnh fixture must genuinely cross its <70% HP gate before its counter is accepted as a PASS.
7. Càn Khôn Xích must observe an actual dodge and create `Phá Vọng` in shared mark state.
8. Tịnh Thế Liên is tested against a real `status.stun` (`BodyControl`) under low HP and must actually remove at least one control status.

Final V151 production gate on implementation HEAD: **44/44 PASS**.

## 8. Audit findings that changed implementation

### Vạn Pháp source-tag bug

The first V151 implementation listened to `ProcHit`. Real Pháp Bảo damage in production travels with source tag `Summon`, so the rule did not fire in the gameplay scenario.

The test was not weakened. Vạn Pháp Đạo Chung was corrected to listen to real `Summon` hit traffic, with its 7.5s cooldown retained as the recursion/pacing bound.

### Hỗn Độn pressure-fixture bug

The initial test actor had `physique=2400`, therefore 48,000 combat HP, while the attacking fixture dealt too little post-defense damage to reach 70% HP within the scenario window. The core Chí Bảo rule was correct; the fixture was not actually exercising its condition.

The fixture was corrected to provide enough sustained incoming pressure and now explicitly asserts that the authored <70% HP gate was genuinely crossed before accepting the trigger PASS.

## 9. V151 × V129 one-slot balance

The balance gate holds the same Pháp Bảo package constant, then swaps each of the eight Chí Bảo over three canonical V129 archetypes and three seeds.

| Build | Baseline | Thái Hư Châu | Δ | Vạn Pháp Đạo Chung | Δ |
|---|---:|---:|---:|---:|---:|
| Kiếm–Kim | 432,658 | 455,577 | +5.3% | 436,135 | +0.8% |
| Thể–Thổ | 148,373 | 151,712 | +2.3% | 152,386 | +2.7% |
| Tâm–Thủy | 346,087 | 360,312 | +4.1% | 357,662 | +3.3% |

Against the idle-target sustained-DPS fixture, Sơn Hà Đồ, Luân Hồi Kính, Trảm Tiên Đài, Hỗn Độn Đỉnh, Càn Khôn Xích and Tịnh Thế Liên correctly add 0% baseline DPS because their authored conditions are not present. Their real conditional mechanics are verified separately in the production-combat gate.

Permanent V151 balance rules:

- any single Chí Bảo must add **<15%** sustained DPS over the same Pháp Bảo build in this benchmark;
- always-relevant Thái Hư/Vạn Pháp remain under the stricter **12%** soft ceiling;
- defensive/situational relics must not grant free idle-target sustained DPS;
- offensive/tempo relics must produce measurable output and repeated real participation.

Result: no general-purpose Chí Bảo becomes a mandatory DPS pick.

## 10. Player-facing clarity

The collection/economy read-model exposes:

- one-slot Chí Bảo authority;
- finite progression;
- each item's combat identity/pattern;
- active Chí Bảo summary and source/sink provenance.

Combat HUD now shows the selected Chí Bảo name, its identity and its purpose. Call-in presentation marks it as `ArtifactV151` while mechanic resolution remains entirely in CombatEngine.

Current presentation still uses the generic artifact visual asset; unique Chí Bảo art/VFX is a separate presentation-production task, not a mechanic gap.

## 11. QA closure evidence

Implementation HEAD validated before documentation closure:

`d2c85aa3aa4295a02a8f217eaac340f70a5b9aa8`

Canonical workflow run:

`34462446269` — **SUCCESS**

Observed gates:

- V149 core: 24/24 PASS
- V149 production: 17/17 PASS
- V149/V150 combo: 19/19 PASS
- V149 × V129 balance: PASS
- V150 no-Bảo-Khí: 23/23 PASS
- **V151 Chí Bảo production: 44/44 PASS**
- **V151 Chí Bảo × V129 one-slot balance: PASS**
- backend fast: 15/15 PASS
- frontend fast: 6/6 PASS
- backend closure: 86/86 PASS
- frontend closure: 20/20 PASS

After this document and `CURRENT_CHECKPOINT.md` are committed, the exact documentation closure HEAD must also pass the canonical workflow before V151 is treated as fully closed.

## 12. Key files

- `dist/core/artifact-v88.js` — V151 public Chí Bảo combat adapter and V150 resource-free artifact adapter.
- `dist/core/artifact-v149-base.js` — preserved V149 finite core/Bảo Hồn implementation.
- `dist/core/gacha-collection-economy-v12325.js` — V151 read-model/provenance.
- `modules/artifact-presentation-v88.js` — Chí Bảo identity HUD/call-in.
- `qa/tests/v151-relic-production-test.js` — all-eight real gameplay gate.
- `qa/tests/v151-relic-v129-balance-test.js` — one-slot cross-build balance gate.
- `.github/workflows/v140-ci.yml` — canonical QA workflow.

## 13. Lock

Do not restore Bảo Khí, multi-relic simultaneous activation, unowned active-id authority, or stat-only Chí Bảo behavior from historical code/docs. Any such change requires an explicit new gameplay decision.
