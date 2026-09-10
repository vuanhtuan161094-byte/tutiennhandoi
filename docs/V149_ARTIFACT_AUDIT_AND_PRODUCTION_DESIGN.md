# V149 — PHÁP BẢO AUDIT & PRODUCTION DESIGN

Status: DESIGN LOCK BEFORE CODE
Base: `feature/v148-confidant-rebuild` @ `69016cf5e9b8fe8623a478029d9abeb64be21a47`
Working branch: `feature/v149-artifact-rebuild`
`main`: LOCKED / DO NOT MERGE

## 1. Production authority audit

### Canonical combat authority
- Canonical combat runtime is `artifact.production.v88` compiled from `collectionV12316`.
- Canonical equipped Pháp Bảo IDs: `collectionV12316.activeArtifactIds`.
- Canonical active Chí Bảo ID: `collectionV12316.economyV12325.activeRelicId`.
- `SimulationSession.personalCombatEntityForState()` deliberately skips legacy `ArtifactState` combat power and applies collection production through `applyCollectionEconomyToEntityV12325()`.
- Pháp Kỹ are ordinary entity triggers consumed by the shared `CombatEngine` through CombatKernel V2. V149 MUST NOT introduce a second combat resolver.

### Canonical acquisition/economy authority
- Canonical gacha write is `collectionGachaV12326`; V12316/V12325 gacha writes are retired compatibility paths.
- Artifact banner: `banner.artifact`; Chí Bảo banner: `banner.relic`.
- Pull cost: 160 single / 1440 ten-pull.
- Production outcome mix: 74% strengthening material / 8% breakthrough material / 16% specific fragments / 2% full item, with grade/pity/rate-up rules owned by V12326.
- Specific item fragments are gacha-only.
- Canonical farm is Resource PVE V109/V12329, not the retired daily workshop writer.
- `dungeon.v12329.artifact` (Vạn Bảo Bí Khố) yields `Luyện Bảo Tinh Hoa` + `Thiên Tinh Pháp Bảo`.
- Repeat farming is time-based after first-clear; repeated guardian clicks do not print material.

## 2. Current authored Pháp Bảo roster

1. Trấn Linh Chung — defense — low-HP shield.
2. Dẫn Lôi Kính — setup — Lôi Ấn / Bảo Khí support.
3. Lôi Phạt Kiếm — burst — lightning strike.
4. Phá Vọng Kính — anti-dodge — OnTargetDodge pursuit.
5. Chấn Sơn Ấn — break — OnShieldBreak pressure.
6. Đoạn Huyết Hồ — anti-heal / DoT — OnEnemyHeal punish.
7. Tử Phủ Minh Đăng — Bảo Khí engine / spirit sustain.
8. Kim Đan Hỏa Đỉnh — burn / ramp.
9. Tinh Lạc Kiếm Hạp — crit follow-up / multi-hit.
10. Dưỡng Hồn Liên — cleanse / sustain.
11. Nguyên Anh Phân Hồn Phiên — echo / duplicate hit.
12. Thanh Linh Hồ Lô — Chân Nguyên recovery engine.

Adjacent Chí Bảo roster remains 8 authored rule items: Sơn Hà Đồ, Luân Hồi Kính, Trảm Tiên Đài, Thái Hư Châu, Vạn Pháp Đạo Chung, Hỗn Độn Đỉnh, Càn Khôn Xích, Tịnh Thế Liên.

## 3. Current progression

- Artifact slots by realm order: 0 / 2 / 3 / 4 at `<10`, `10–13`, `14–21`, `>=22`.
- Luyện Hóa: Lv1–100.
- Bảo Giai: I–V (`advance` 0–4 for save compatibility).
- Luyện Hóa consumes the artifact-category strengthening material; Luyện Bảo Các discounts the cost with a bounded facility modifier.
- Bảo Giai consumes specific fragments plus category breakthrough essence.
- Grade III and V add authored effects; grade IV gives an authored cooldown milestone.
- Current finite item progression has no post-Lv100/post-Giai-V sink.

## 4. Current stat model

### Equipped-only effects
Equipped Pháp Bảo compile authored passives and Pháp Kỹ into the combat entity. V88 intentionally does not use the generic collection stat lines for artifacts.

### All-owned effects
`artifactFortuneSummaryV88()` gives bounded collection bonuses from all owned artifacts and finite Lv/grade milestones:
- Artifact power <= 12%.
- Bảo Khí gain <= 10%.
- Cooldown recovery <= 6%.
- Chí Bảo power <= 8%.
These are already bounded and MUST remain bounded.

### Missing V149 requirement
There is no clear canonical raw/base stat progression owned by Pháp Bảo. V149 adds this without creating an unbounded percentage multiplier.

## 5. Current combat trigger contract

Authored Pháp Bảo use only shared CombatEngine events/effects audited by V107.

Events: `OnCrit`, `OnDamageTaken`, `OnEnemyHeal`, `OnHit`, `OnShieldBreak`, `OnTargetDodge`.

Effects: `addMark`, `applyStatus`, `damage`, `damageOverTime`, `heal`, `removeStatus`, `restoreSpirit`, `shield`.

Bảo Khí is combat-local state stored on the entity and is generated/spent by CombatEngine. Ngự Khí Đạo modifies artifact-source efficiency inside the same engine. V149 preserves this contract.

## 6. Duplicate authority / legacy findings

### A. Legacy `dist/core/artifact.js`
This older system still models tier 0–20, quality, nourishment, Khí Linh awakening, resonance, loss/recovery and `%` stat multipliers. The same named artifacts also exist in V88 with different mechanics. It is NOT production combat authority anymore.

### B. Read-model drift
Despite V88 being production combat authority, several reads still use `state.artifacts`:
- overview active artifact count;
- generic `artifacts()` read-model;
- combat-review name map;
- parts of reincarnation/world-relic presentation.
This makes the UI/API capable of reporting a different loadout from the one CombatKernel actually uses.

### C. Legacy world-relic feature
`state.artifacts` is still used by the old world-relic/reincarnation history loop (lost/recovered artifacts). This cannot be deleted blindly without breaking old saves. V149 therefore classifies it as `legacy-world-relic/history compatibility`, never as production power/loadout authority.

### D. Orphan naming
`resource.artifact_dust` / “Bảo Khí Tàn Tinh” survives as a legacy display label while production artifact progression uses V12326/V12329 category materials. V149 must not add another material lane. A legacy-only resource must stay inert/compatibility or be migrated explicitly; it must not become a hidden second economy.

## 7. Integration audit

- CombatKernel: LIVE. V88 triggers are injected into the same CombatEntity used by CombatKernel V2.
- Ngự Khí Đạo: LIVE. Artifact-source count modifies Bảo Khí generation/cost behavior inside CombatEngine.
- Trang Bị: LIVE sequential composition; equipment is applied before collection/artifact runtime. No separate resolver.
- Công Pháp/Tâm Pháp: LIVE through collection stat/runtime composition; artifact catalog itself carries no generic manual stat lines.
- Linh Thú: LIVE in the same collection composition stage; pet triggers coexist on the same entity.
- Tri Kỷ V148: LIVE in the same collection composition stage; confidant triggers coexist on the same entity.
- Linh Căn V145: independent character/root progression; no direct artifact-specific multiplier is authored. V149 must not create implicit cross-multiplication.
- Tu Vi: Pháp Bảo V88 has no canonical direct Tu Vi contribution. V149 does not invent one; Tu Vi remains owned by cultivation/manual/root/etc. unless explicitly designed later.
- Luân Hồi: old world-relic history still references legacy ArtifactState. Treat as compatibility boundary, not combat authority.

## 8. Test/UI audit

Existing V107 tests already lock:
- 12 artifacts + 8 relics;
- slot progression;
- Lv100/Giai V finite progression;
- trigger/effect consumers;
- canonical equip state;
- runtime injection;
- Saved Loadout serialization/restore;
- standalone transport;
- Build Sheet canonical V88 loadout.

Missing coverage for V149:
- infinite raw progression and its source/sink;
- no unbounded percentage growth;
- raw stat provenance by equipped artifact;
- legacy read-model drift;
- save migration from V88 and from saves with legacy ArtifactState;
- cross-build balance against V129 archetypes.

## 9. V149 Production Design

### 9.1 Finite mechanic progression stays
Keep Luyện Hóa 1–100 and Bảo Giai I–V unchanged as the authored mechanic progression. Existing saves, gacha fragments, facility discount, Pháp Kỹ grade milestones and Saved Loadouts remain valid.

### 9.2 New infinite lane: Bảo Hồn ∞
Unlock condition per artifact: owned + Luyện Hóa 100 + Bảo Giai V.

`Bảo Hồn` is an unbounded integer rank stored on the existing canonical item progress record under a V149 namespaced field. It is additive progression only.

Each Bảo Hồn rank grants explicit raw `Công Lực / Thể Phách / Phòng Ngự` according to that artifact's authored raw profile. It does NOT grant:
- damage %;
- HP %;
- defense %;
- cooldown %;
- action speed %;
- Bao Qi gain/cost %;
- global multiplier %.

This makes the progression infinite while percentage mechanics remain finite and bounded.

### 9.3 Source → sink
Bảo Hồn consumes the existing `Luyện Bảo Tinh Hoa` material from the artifact resource dungeon/gacha. No new currency is introduced. Cost grows with rank, so the existing farm has a permanent sink.

Specific fragments + `Thiên Tinh Pháp Bảo` remain finite Bảo Giai sinks. They are not reused for infinite raw growth.

### 9.4 Equipped vs owned
- Equipped artifact: full authored passive + Pháp Kỹ + its V149 raw stats.
- All owned artifacts: only the existing bounded Bảo Vận/Fortune account bonuses.
- Unequipped artifact Bảo Hồn rank is preserved but its raw combat stats are inactive until equipped.
This prevents “collect everything and multiply forever” while preserving long-term investment and loadout choice.

### 9.5 Raw profiles
Every one of the 12 artifacts receives an authored three-axis raw profile matching role. Offensive artifacts lean Công Lực; defensive/sustain artifacts lean Thể Phách/Phòng Ngự; setup/resource artifacts use mixed profiles. Values are additive and exposed in the read-model so provenance is inspectable.

### 9.6 Authority cleanup
- Production DTO/API reads canonical `collectionV12316` artifact state.
- `state.artifacts` may remain in save/runtime only for legacy world-relic compatibility until that feature is migrated separately.
- New/updated V149 UI must never display `state.artifacts.activeIds` as the production loadout.
- Legacy activate/deactivate paths are compatibility-only and must not alter production CombatKernel loadout.

### 9.7 Save migration
Migration is idempotent and additive:
- existing V88 progress remains untouched;
- missing V149 Bảo Hồn state initializes to zero;
- invalid/negative/non-finite ranks clamp to zero;
- no existing item IDs are changed;
- no existing currencies are deleted;
- legacy ArtifactState remains readable for old world-relic history but cannot supply production combat power.

## 10. V149 acceptance gates

1. Existing V107 production + transport tests stay PASS.
2. Existing V140–V148 canonical QA stays PASS.
3. New V149 core test proves Bảo Hồn is infinite additive raw and % caps do not increase with Bảo Hồn rank.
4. New source/sink test proves Vạn Bảo Bí Khố / gacha material can be spent by Bảo Hồn and no new orphan currency appears.
5. New authority test proves production read-model/loadout uses collection state, not legacy `state.artifacts.activeIds`.
6. New CombatKernel test proves Pháp Kỹ still resolve through shared CombatEngine.
7. New V129 cross-build simulation verifies artifact roles do not collapse into one universally optimal damage loadout.
8. Save migration test proves pre-V149 saves load with Bảo Hồn rank 0 and retain existing Lv/Giai/equip state.

V149 code may begin only against this contract.