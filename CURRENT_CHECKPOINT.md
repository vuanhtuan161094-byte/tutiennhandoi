# CURRENT CHECKPOINT — GAME TU TIÊN NHÀN DỖI

Date: 2026-09-11

## Canonical state

- Repository authority: **`main` only**.
- Git history is the archive; do not keep duplicate snapshots for backup.
- Locked baseline: **V161 CLOSED / LOCKED**.
- V161 closure SHA: `d7e917a8ebc77dce767412e8ffad94bd1f085bb7`.
- V161 canonical QA: `34557869821` — **SUCCESS**.
- Active version: **V162 — Runtime Authority Consolidation**.
- Gameplay/web version string remains `1.40.0-alpha.24.0` until deliberately changed.

## V162 status

- B1 — Collection/Gacha public authority: **PASS**.
  - Player-facing Gameplay/API exposes only V12326 Gacha.
  - Legacy V12316/V12325 Gacha transport remains blocked.
  - Internal Session compatibility methods are intentionally retained because moving/splitting `session.js` broke unrelated structural gates that inspect the canonical source file.
  - Commit lineage stabilized at `81c1af2a502c65e9e166dbe2499d202f5ea99351`.
  - Fast QA `34559739435`: targeted + backend + frontend **SUCCESS**.
- B2 — Collection progression canonical API: **PASS**.
  - Canonical V12326 strengthen/advance/equip/unequip methods now exist on Gameplay/API.
  - They delegate to the locked V12325 progression engine; no progression math/state was rewritten.
  - V12325 API names remain temporary compatibility shims because current standalone/UI transport still calls them.
  - Executable HEAD: `54eae66a23dcc498130f4218a5b7136173740d53`.
  - Fast QA `34559828970`: targeted + backend + frontend **SUCCESS**.
- B3 — Collection progression transport/UI namespace migration: **NEXT**.
- V162 closure: **PENDING**.

## Authority rules learned in V162

- Consolidate public authority before deleting lower-level implementation/state.
- Do not rename or split large canonical files solely for cleanliness when locked tests legitimately inspect their source blocks.
- `collectionV12316` save/state naming and V12325 progression internals are compatibility implementation details, not proof that they are the player-facing authority.
- No gameplay rates, prices, reward math or save semantics changed in B1/B2.

## Minimal-context protocol

Read only:

1. `CURRENT_CHECKPOINT.md`
2. `docs/versions/V162.md`
3. `docs/systems/INDEX.md` only if routing is unclear
4. exact live source/tests for the current subsystem

Do not preload old reports/chats/raw simulations/full CI logs.

## Execution rules

- Search → narrow → authority patch → targeted gate → Fast QA.
- Executable pushes to `main` run Fast QA.
- Markdown/docs-only pushes do not run QA.
- `[closure]` runs Fast QA then Canonical QA.
- Inspect logs only on failure.
- Current user instruction > live `main` source/tests > current V162 note > Git history.

## Next work

B3: migrate Collection strengthen/advance/equip/unequip transport/UI from V12325 names to the canonical V12326 names **without changing the V12325 progression engine**. Only after the live transport no longer needs V12325 compatibility names should those public aliases be retired.
