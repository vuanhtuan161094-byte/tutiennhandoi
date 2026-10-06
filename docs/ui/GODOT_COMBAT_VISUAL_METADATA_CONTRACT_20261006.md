# Godot Combat Visual Metadata Contract — 2026-10-06

**IMPLEMENTED / PASS**. Gameplay authority modified: **NO**. RNG sequence modified: **NO**. Save schema migrated: **NO**. GCombat-4: **NOT STARTED**. Asset integration: **NOT STARTED**.

Opening main: `e867a2ba9c4e616dfb965e6e8255635e7c8197c0` (fetch/pull current, clean).
Final implementation / exact clean Windows gate SHA: `54b1a422691de2f337c650162fd5f0b935b0906b`.
Later proof/checkpoint commits do not replace that tested implementation SHA; final documentation HEAD is reported with Git publication evidence in the task report.

## Source and transport

This checkout tracks the active canonical JS runtime under `dist/`; there is no corresponding tracked TypeScript source, tsconfig or build package for these files. The bridge directly imports it. This is not a generated-output-only patch with an omitted source/build sync.

- `dist/content/endless-hunt.js::endlessHuntArchetypes` retains the unchanged six IDs: `wolf`, `serpent`, `golem`, `spirit`, `demon`, `dragon`.
- `dist/core/endless-hunt.js::monsterName` retains `archetype.id` from the existing RNG selection; `generateEndlessHuntMonster` adds `archetypeId` to its final object. No RNG expression/call/order, roster, name, tags, elements, grade, bias, stats, reward or behavior changed.
- `dist/core/session.js::endlessHuntSummary` forwards that ID to its monster projection. `fightEndlessFloor` adds `monsterArchetypeId` from the actual resolved monster to its result. This is necessary because read-side previews can select a different monster from the real fight; presentation never rerolls or guesses.
- `dist/content/realm-maps.js::realmMapDefinitionForFloor` remains environment authority. Its existing 8 zones × 100 floors, biome names and `primaryElementForZoneFloor` cycle are unchanged.
- `godot/backend/combat_presentation.mjs` copies currentMap into `snapshot.environment`, forwards `enemy.archetypeId`, and copies actual result metadata into playback. Playback keeps the original encounter environment even if victory advances the floor across an element boundary.
- `godot/scripts/models/combat_view_model.gd` stores this data using existing snake_case ViewModel conventions. CombatScreen/header and all visual components remain unchanged.

| Canonical currentMap | DTO environment | Godot VM environment |
| --- | --- | --- |
| id | mapId | map_id |
| majorRealmIndex | majorRealmIndex | major_realm_index |
| realmName | realmName | realm_name |
| biomeName | biomeName | biome_name |
| zone | zone | zone |
| zoneName | zoneName | zone_name |
| zoneFloor | zoneFloor | zone_floor |
| localFloor | localFloor | local_floor |
| primaryElement | primaryElement | primary_element |

Monster `archetypeId` → DTO `enemy.archetypeId` → VM `enemy.archetype_id`.

Legacy activeMonster without ID stays unknown (`''`) and is neither rerolled nor migrated by presentation. Clone preserves optional IDs. Missing environment uses empty strings / zero identifiers; null environment is accepted. Legacy playback result without ID also stays unknown rather than inheriting a possibly wrong preview. Existing schema/version identifiers remain unchanged because the contract is additive and existing consumers accept optional metadata.

## Actual canonical HTTP bridge sample

From `qa/output/metadata-full-gate.log`, after the bridge's normal diagnostic cultivation/ascension path:

```json
{
  "environment": {
    "mapId": "realm-map.1.1", "majorRealmIndex": 1,
    "realmName": "Luyện Khí", "biomeName": "Thanh Hư Sơn Mạch",
    "zone": 1, "zoneName": "Phàm Vực", "zoneFloor": 1,
    "localFloor": 1, "primaryElement": "Wood"
  },
  "enemy": {
    "name": "Thủ Tầng · U Minh Xà",
    "archetypeId": "serpent", "elements": ["Wood"]
  }
}
```

## Determinism and Windows gates

Baseline was recorded and independently reproduced **before production edits** at the opening SHA. `qa/fixtures/combat-visual-metadata-baseline.json` stores SHA256 digests, not a duplicated implementation; there is no auto-update mode in the test. Exact postpatch comparison excludes only the two new metadata keys (`archetypeId`, `monsterArchetypeId`). It compares every other generated field, complete V3 result/events/reward/settlement/state and every RNG uint32 draw.

- 480 generation cases: 24 seeds × 10 floor/zone/realm/element-boundary cases × ordinary/Boss; all six selected IDs covered; **2,276 RNG draws identical**.
- 12 real V3 fights: 6 seeds × ordinary/strong test builds; both victory and defeat; **868 RNG draws identical**. The high-power build is a synthetic test fixture, not a production tuning change.
- Targeted metadata: **6/6 PASS**; actual archetype selection, map copies, real-fight/playback identity, floor-20 → 21 environment retention, old save/no mutation, absent map and exact baseline parity.
- Targeted Godot Combat GdUnit: **12/12 PASS**, exit 0. New-field parsing and legacy/missing/null fixtures; no DTO mutation.
- Regression: V129 parity **6/6**, V3 cutover **5/5**, Hunt time-only reward authority **PASS**.
- `KIEM_TRA_GAME.cmd -SkipVisual`: **PASS, exit 0** on clean implementation SHA above: import/parse, **70/70 GdUnit / 16 suites**, canonical HTTP bridge, isolated P2 and bounded smoke, Home **50/50**, Combat Stagehand **28/28**. No errors/failures/skips/orphans in unit tests.
- Existing `-SkipVisual` was used because this user-scoped metadata pass does not change visuals or request screenshots. No new PNG was exported, scenario/gate was not changed. Prior two shell screenshots were preserved and remain evidence of their original visual SHA `22eb0a785d4f77d0c3b67573ff844c841a6e06e8`, not of this metadata gate.
- Ordinary save remains SHA256 `7893E5CB59864CEC72CA5C9E5BBF712F8D161B9A5F9BB67F72D986BBC06826A7`.

Logs: `qa/output/metadata-unit.log`, `qa/output/metadata-parse.log`, `qa/output/metadata-full-gate.log`; tested identity: `artifacts/godot-tools/verified-head.txt`.

Re-run from repository root:

```powershell
node qa/tests/combat-visual-metadata-contract-test.js
$env:GODOT_BIN='E:\Godot_v4.7.2-stable_win64_console.exe'
cmd /c 'KIEM_TRA_GAME.cmd -SkipVisual < NUL'
```

This pass does not approve or close the existing visual shell. Asset resolver, assets, all-Dao widgets, animation/VFX and gameplay changes remain unopened.
