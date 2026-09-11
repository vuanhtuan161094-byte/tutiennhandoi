# CURRENT CHECKPOINT

This file is the source of truth for a new chat.
Read this first. Do not reconstruct project state from old chats.

## Active state

- Branch: `main` only.
- V160: LOCKED.
- V161: LOCKED.
- V162 Runtime Authority Consolidation: CLOSED / LOCKED.
- V163 Pháp Bảo / Chí Bảo Runtime Authority: CLOSED / LOCKED.
  - Executable closure: `8033f37ac32354c34ece82959491a89ae3f8f4de`
  - Canonical QA: `34576745935` — SUCCESS
- V164 Linh Thú / Tri Kỷ Runtime Authority: CLOSED / LOCKED.
  - Executable closure: `1a1013d9cad94c9be341f26ea3e5e486232ee6d3`
  - Canonical QA: `34580265307` — SUCCESS
- No V165 scope has been opened yet.

## Locked Collection authority

- V12326 is the player-facing Collection/Gacha progression authority.
- V12325/V12316 strengthen/advance/equip/unequip names are compatibility aliases only.
- `collectionV12316` remains the canonical runtime/save container for Collection systems.

## Locked V163 authority

- Pháp Bảo ownership/progression: `state.collectionV12316.items`.
- Equipped Pháp Bảo: `state.collectionV12316.activeArtifactIds`.
- Active Chí Bảo: `state.collectionV12316.economyV12325.activeRelicId`.
- Production combat applies Collection artifact/relic authority once.
- Legacy `state.artifacts` is retained only because it still owns distinct history/Integration/Luân Hồi/world-relic compatibility semantics.

## Locked V164 authority

- Linh Thú and Tri Kỷ ownership/progression: `state.collectionV12316.items`.
- Active Linh Thú: `state.collectionV12316.activePetId`.
- Active Tri Kỷ: `state.collectionV12316.activeCompanionId`.
- Linh Thú V147 is canonical; `spirit-beast-v86.js` is a compatibility adapter into V147, not a second authority.
- All owned Linh Thú contribute intended raw bond stats; only active Linh Thú contributes active percentage bond/combat triggers.
- Tri Kỷ V148 is canonical behavior inside `confidant-v87.js`; only active Tri Kỷ contributes combat triggers.
- Tâm Lực/Heart V148 mutates canonical Collection item state.
- Production combat composes Linh Thú + Tri Kỷ once; no duplicate combat state was found.
- Historical Pet Gear V12328 remains only as a retired compatibility transport: it throws before mutation and its combat multiplier is neutral.
- Snapshot/restore preserves active pet/companion selectors and canonical progression.
- No balance/rate/reward changes were made in V164.

## V164 evidence

- `qa/tests/v164-pet-confidant-runtime-authority-test.js`
- `qa/tests/v164-pet-confidant-integration-authority-test.js`
- B1 Fast QA: `34579993824` — SUCCESS
- B2/B3 Fast QA: `34580157430` — SUCCESS
- Canonical closure: `34580265307` — SUCCESS

## Working rule

Repository current `main` is source of truth.
Use search → narrow read → patch → targeted proof.
Do not reopen locked systems unless a regression proves necessary.
Do not create a new version solely for naming continuity; open the next scope only when the next subsystem objective is selected.
