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
- V163 B1 executable/CI checkpoint: `04a07c36dad5f12f7ad133838b7c34a0a272c39c`.
- V163 B1 Fast QA run: `34574636743` — SUCCESS.
- Next scoped block: V163 B2 Mutation Authority.

## Locked V162 authority

- V12326 is the player-facing Collection/Gacha authority.
- Collection strengthen / advance / equip / unequip public behavior routes through V12326.
- Older V12325/V12316 progression names may remain only as compatibility shims, not independent behavior paths.
- `collectionV12316` state remains a save/runtime compatibility structure.
- V162 did not authorize gameplay balance changes.

## V163 B1 locked findings

- Player-facing Pháp Bảo ownership/progression is Collection-backed: `state.collectionV12316.items`.
- Equipped Pháp Bảo authority is `state.collectionV12316.activeArtifactIds`.
- Chí Bảo active authority is `state.collectionV12316.economyV12325.activeRelicId`; it remains a separate one-slot combat-law system.
- `dist/core/artifact-v88.js` is the current Pháp Bảo/Chí Bảo combat adapter over the V149 artifact base and V150/V151 behavior patches.
- `applyCollectionEconomyToEntityV12325()` composes the Collection runtime once through `applyCollectionToEntityV12316()`.
- `SimulationSession.personalCombatEntityForState()` deliberately skips legacy `state.artifacts` as direct Pháp Bảo combat power and applies Collection artifact/relic power once.
- Legacy `dist/core/artifact.js` / `state.artifacts` is required compatibility/history state with verified nourishment, Khí Linh, ownership-year, battle-history, lost/recovered and Integration/reincarnation consumers. It is not safe to delete.
- Save/restore clones legacy `artifacts` and canonical `collectionV12316` independently; B1 found no state merge.
- Focused guard: `qa/tests/v163-artifact-runtime-authority-test.js`.
- B1 did not change gameplay balance or production rates.

## V163 B2 mission

1. audit all player-facing Pháp Bảo/Chí Bảo mutation entry points across UI, standalone transport, Game API, GameplayFacade and Session;
2. prove they enter through the V12326 Collection public authority;
3. distinguish player-facing mutations from intentional history-only `state.artifacts` mutations;
4. remove only mutation paths proven unreachable or semantically duplicated;
5. add targeted mutation-authority regression before broader cleanup;
6. run targeted regression first, then Fast QA when B2 is ready.

## Do not reopen unless regression proves necessary

- V161 gameplay/pacing closure.
- V162 Collection/Gacha authority consolidation.
- V163 B1 Artifact/Relic authority discovery and guard.
- V160 economy-source/sink and wealth pacing.
- Earlier locked gameplay systems unrelated to the active V163 authority block.

## Required next read order

1. `docs/versions/V163.md`
2. `docs/DEVELOPMENT_PROTOCOL.md`
3. `docs/systems/INDEX.md` only when subsystem routing is unclear
4. exact Pháp Bảo/Chí Bảo mutation source/test regions needed for B2

## Working rule

Repository current `main` is source of truth.
Do not preload old chats or version history.
Use search -> narrow read -> patch -> targeted proof.
Do not run broad CI repeatedly while the authority block is still being investigated.
