# Ngũ Hành Equipment Retirement — Phase 1

Date: 2026-09-27
Status: **PHASE 1 CODE COMPLETE CANDIDATE / PHASE 2 USER-LOCAL CI PENDING**

## Scope

This slice retires the equipment-side Ngũ Hành Gem and Set systems without reopening Combat V3, Sword, Fist, or Linh Căn.

Retired from live production:

- Ngũ Hành Gem catalog, socket capacity, effects, socket/upgrade/unsocket actions and salvage acquisition.
- V116 equipment Set live catalog/mechanics/crafting.
- V142 Set/Tàn Ấn acquisition, engraving, resonance, Set power and dungeon Set grants.
- Equipment-generated global elemental affinity/resistance contribution and elemental affix generation.
- Set-based loot protection and active Set presentation/actions.

## Compatibility

Historical save payloads remain readable. Legacy fields such as `gemSockets`, `gemBlanks`, `setId`, Set fragment wallets and resonance payloads may remain in old saves, but they are inert and cannot grant live Gem/Set effects. Production facades preserve historical modules under `*-legacy.js` paths solely for tolerant reads/migration seams.

New equipment generation no longer creates active Set identity, Ngũ Hành Gem sockets, or elemental equipment affixes. Linh Căn/base character elemental data is not deleted by this migration; only equipment-added global element power is severed.

`Hành Ấn` is not reopened here; its V133 module already reports the V144 retirement state.

## Prepared regression proof

- `qa/tests/nguhanh-equipment-retirement-regression-test.js`
- `qa/local/run-local-ci.mjs` executes the retirement regression before the pre-existing Local CI runner.
- `standalone-entry.js` loads the equipment-retirement presentation guard after `app.js`.

Static syntax validation was performed while preparing the facades. Windows/Godot Local CI is intentionally **not claimed** in this record because the user's PC was off during this remote implementation. Phase 2 closes only after clean user-local evidence is returned.
