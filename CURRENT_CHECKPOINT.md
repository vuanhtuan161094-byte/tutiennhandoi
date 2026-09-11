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
- V163 B1 Authority Discovery: IN PROGRESS.

## Locked V162 authority

- V12326 is the player-facing Collection/Gacha authority.
- Collection strengthen / advance / equip / unequip public behavior routes through V12326.
- Older V12325/V12316 progression names may remain only as compatibility shims, not independent behavior paths.
- `collectionV12316` state remains a save/runtime compatibility structure.
- V162 did not authorize gameplay balance changes.

## V163 current findings

- Player-facing Pháp Bảo / Chí Bảo are read from Collection economy categories `artifact` / `relic`.
- `dist/core/artifact-v88.js` is the current combat adapter over the V149 artifact base and V150/V151 behavior patches.
- `dist/core/gameplay.js` exposes Collection-backed Pháp Bảo as the player-facing artifact view.
- Legacy `state.artifacts` is not the player-facing combat loadout authority, but it still has verified consumers in late-game integration/history/reincarnation flows. It is not safe to delete yet.
- `game-artifact.js` is not a current-main file; do not use that stale documentation path as authority.

## V163 mission

1. finish classifying every surviving legacy Pháp Bảo consumer;
2. add focused executable authority proof;
3. route replaceable player-facing reads/writes to the Collection-backed authority;
4. preserve required history/save/reincarnation semantics;
5. delete only paths proven dead;
6. run targeted regression first, then Fast QA when the block is ready.

## Do not reopen unless regression proves necessary

- V161 gameplay/pacing closure.
- V162 Collection/Gacha authority consolidation.
- V160 economy-source/sink and wealth pacing.
- Earlier locked gameplay systems unrelated to the active V163 authority block.

## Required next read order

1. `docs/versions/V163.md`
2. `docs/DEVELOPMENT_PROTOCOL.md`
3. `docs/systems/INDEX.md` only when subsystem routing is unclear
4. exact Pháp Bảo/Chí Bảo source/test regions needed for the active block

## Working rule

Repository current `main` is source of truth.
Do not preload old chats or version history.
Use search -> narrow read -> patch -> targeted proof.
Do not run broad CI repeatedly while the authority block is still being investigated.
