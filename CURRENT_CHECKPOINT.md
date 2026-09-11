# CURRENT CHECKPOINT

This file is the source of truth for a new chat.
Read this first. Do not reconstruct project state by reading old chats.

## Active state

- Branch: `main` only.
- V160: LOCKED.
- V161: LOCKED.
- V162 Runtime Authority Consolidation: CLOSED / LOCKED.
- V162 closure executable HEAD: `f46c5e956f1410fa5228d691c16ddca4a594d09c`.
- V163 Pháp Bảo / Chí Bảo Runtime Authority: CLOSED / LOCKED.
- V163 executable closure HEAD: `8033f37ac32354c34ece82959491a89ae3f8f4de`.
- V163 canonical QA run: `34576745935` — SUCCESS.
- V163 Fast QA, canonical V140→V163, backend closure and frontend closure all PASS.
- No V164 scope has been opened yet.

## Locked V162 authority

- V12326 is the player-facing Collection/Gacha authority.
- Collection strengthen / advance / equip / unequip public behavior routes through V12326.
- Older V12325/V12316 progression names may remain only as compatibility shims, not independent behavior paths.
- `collectionV12316` remains a save/runtime compatibility structure.
- V162 did not authorize gameplay balance changes.

## Locked V163 authority

- Player-facing Pháp Bảo ownership/progression is `state.collectionV12316.items`.
- Equipped Pháp Bảo authority is `state.collectionV12316.activeArtifactIds`.
- Active Chí Bảo authority is `state.collectionV12316.economyV12325.activeRelicId`; Chí Bảo remains a separate one-slot combat-law system and does not consume a Pháp Bảo slot.
- V12325/V12316 player-facing progression names are compatibility aliases into V12326.
- Current standalone V12325 action labels dispatch through Game API compatibility methods and do not form a second authority.
- `dist/core/artifact-v88.js` is the live Pháp Bảo/Chí Bảo combat adapter over the V149/V150/V151 behavior stack.
- Production combat composes Collection artifact/relic power once; legacy `state.artifacts` is not applied as direct Pháp Bảo combat gear.
- Canonical `GameplayFacade.overview()` and `GameplayFacade.artifacts()` expose Collection-backed player-facing reads.
- Legacy `dist/core/artifact.js` / `state.artifacts` is intentionally retained because it still owns distinct compatibility/history semantics: nourishment, Khí Linh, ownership years, battle history, saved-loadout compatibility, Integration scoring, lost/recovered world relics and Luân Hồi consumers.
- Save/restore preserves `state.artifacts`, `state.collectionV12316`, and meta `artifactRelics` as separate cloned channels.
- No legacy artifact module/handler was deleted in V163 because no surviving path was proven wholly dead without semantic loss.
- V163 made no gameplay balance, rate, reward, slot-count or save-key redesign changes.

## V163 evidence

- B1 guard: `qa/tests/v163-artifact-runtime-authority-test.js`.
- B2 guard: `qa/tests/v163-artifact-mutation-authority-test.js`.
- B3 guard: `qa/tests/v163-artifact-read-combat-authority-test.js`.
- B4 guard: `qa/tests/v163-artifact-compatibility-cleanup-test.js`.
- B1 Fast QA: `34574636743` — SUCCESS.
- B2 Fast QA: `34575463668` — SUCCESS.
- B3 Fast QA: `34575666381` — SUCCESS.
- B4 Fast QA: `34576629851` — SUCCESS.
- Canonical closure run: `34576745935` — SUCCESS.

## Do not reopen unless regression proves necessary

- V161 gameplay/pacing closure.
- V162 Collection/Gacha authority consolidation.
- V163 Pháp Bảo/Chí Bảo runtime authority consolidation.
- V160 economy-source/sink and wealth pacing.
- Earlier locked gameplay systems unrelated to the next explicitly opened block.

## Required next read order

1. `CURRENT_CHECKPOINT.md`
2. the next version note only after a new scope is explicitly opened
3. `docs/DEVELOPMENT_PROTOCOL.md`
4. `docs/systems/INDEX.md` only when subsystem routing is unclear
5. exact source/test regions needed for the active block

## Working rule

Repository current `main` is source of truth.
Do not preload old chats or version history.
Use search -> narrow read -> patch -> targeted proof.
Do not create a new version scope merely for naming continuity; open it only when the next subsystem objective is defined.
