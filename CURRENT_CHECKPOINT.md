# CURRENT CHECKPOINT

This file is the source of truth for a new chat.
Read this first. Do not reconstruct project state by reading old chats.

## Active state

- Branch: `main` only.
- V160: LOCKED.
- V161: LOCKED.
- V162 Runtime Authority Consolidation: CLOSED / LOCKED.
- V162 closure executable HEAD: `f46c5e956f1410fa5228d691c16ddca4a594d09c`.
- V162 closure Fast QA: `34562603034` — SUCCESS.
- V163 Pháp Bảo / Chí Bảo Runtime Authority: ACTIVE.
- V163 B1 Authority Discovery: PASS.
- V163 B1 Fast QA run: `34574636743` — SUCCESS.
- V163 B2 Mutation Authority: PASS.
- V163 B2 executable checkpoint: `14526a012d063fc4cddceb6f48129647354b8793`.
- V163 B2 Fast QA run: `34575463668` — SUCCESS.
- Next scoped block: V163 B3 Read / Combat Authority.

## Locked V162 authority

- V12326 is the player-facing Collection/Gacha authority.
- Collection strengthen / advance / equip / unequip public behavior routes through V12326.
- Older V12325/V12316 progression names may remain only as compatibility shims, not independent behavior paths.
- `collectionV12316` state remains a save/runtime compatibility structure.
- V162 did not authorize gameplay balance changes.

## V163 B1/B2 locked findings

- Player-facing Pháp Bảo ownership/progression is Collection-backed: `state.collectionV12316.items`.
- Equipped Pháp Bảo authority is `state.collectionV12316.activeArtifactIds`.
- Chí Bảo active authority is `state.collectionV12316.economyV12325.activeRelicId`; it remains a separate one-slot combat-law system.
- `dist/core/artifact-v88.js` is the current Pháp Bảo/Chí Bảo combat adapter over the V149 artifact base and V150/V151 behavior patches.
- `applyCollectionEconomyToEntityV12325()` composes the Collection runtime once through `applyCollectionToEntityV12316()`.
- `SimulationSession.personalCombatEntityForState()` deliberately skips legacy `state.artifacts` as direct Pháp Bảo combat power and applies Collection artifact/relic power once.
- V12325/V12316 player-facing progression names are compatibility aliases into V12326; runtime B2 proof confirms they mutate canonical Collection state without mutating legacy `state.artifacts`.
- Current standalone progression actions still carry V12325 labels, but dispatch through the Game API compatibility methods and therefore do not form a second authority.
- Legacy `activateArtifact` / `deactivateArtifact` behavior mutates only `state.artifacts`; current standalone UI does not emit those commands and canonical `GameplayFacade.artifacts()` does not surface legacy artifact instances as the player-facing loadout.
- Legacy `dist/core/artifact.js` / `state.artifacts` remains required compatibility/history state with nourishment, Khí Linh, ownership-year, battle-history, saved-loadout/integration/reincarnation consumers. It is not safe to delete.
- Save/restore clones legacy `artifacts` and canonical `collectionV12316` independently; B1/B2 found no state merge.
- Focused guards: `qa/tests/v163-artifact-runtime-authority-test.js`, `qa/tests/v163-artifact-mutation-authority-test.js`.
- B1/B2 did not change gameplay balance or production rates.

## V163 B3 mission

1. audit all player-facing Pháp Bảo/Chí Bảo read models and combat consumers;
2. find stale reads of legacy `state.artifacts` that can leak into player-facing counts, build sheets, HUD or summaries;
3. replace only stale player-facing reads with canonical Collection-backed equivalents;
4. preserve Integration/history/reincarnation reads where legacy state is semantically required;
5. prove active Pháp Bảo + one-slot Chí Bảo combat effects are applied once;
6. add targeted B3 regression, then run Fast QA.

## Do not reopen unless regression proves necessary

- V161 gameplay/pacing closure.
- V162 Collection/Gacha authority consolidation.
- V163 B1 Authority Discovery.
- V163 B2 Mutation Authority.
- V160 economy-source/sink and wealth pacing.
- Earlier locked gameplay systems unrelated to the active V163 authority block.

## Required next read order

1. `docs/versions/V163.md`
2. exact Pháp Bảo/Chí Bảo read/combat source regions needed for B3
3. `docs/systems/INDEX.md` only when subsystem routing is unclear

## Working rule

Repository current `main` is source of truth.
Do not preload old chats or version history.
Use search -> narrow read -> patch -> targeted proof.
Do not run broad CI repeatedly while the authority block is still being investigated.
