# Godot Combat Asset Architecture — 2026-10-06

**ASSET ARCHITECTURE PASS**. Production art **NOT STARTED**. GCombat-4 full presentation behavior **NOT STARTED**. Gameplay / RNG / save schema changed: **NO**.

Opening main: `6f4ac119b56d015902026647b659cc5fbc826753` (fetch/pull current, clean).
Exact clean runtime implementation / full Windows gate SHA: `7a73ac6518440dcd7abcc68b40e99034c8e09c09`.
Subsequent build-check-only SHA `f232306f3a52265d4399e016a468ee57bcc1944e` normalizes CRLF/LF in the Node catalog check; both line endings were tested. No Godot/runtime content changed after the full gate. Final documentation HEAD is reported with publication evidence in the task report; these later commits do not replace the tested runtime SHA.

## Model and coverage

| System | Canonical source | Supported catalog |
| --- | --- | --- |
| Biome base | realm-maps availableRealmMaps / majorRealmIndex | **28** major realms, exact realmName/biomeName |
| Zone intensity | canonical realm map zone identities | **8** Vực, Phàm → Phá |
| Element layer | environment.primaryElement | **5**: Wood, Fire, Earth, Metal, Water |
| Enemy actor | endlessHuntArchetypes.id | **6 + generic = 7** |
| Dao skill icons | registry runtimeV117.daoBinding / slotClass / skill.id | **80**: 8 families × (1 Basic + 8 Active + 1 Ultimate) |

Battlefield = biome base + zone intensity + primary-element layer. This covers the entire canonical map progression without an image per floor. No element cycle, progression formula or archetype name heuristic is reconstructed in Godot.

`tools/godot/Build-CombatAssetManifest.mjs` reads the live canonical JS content/registry and generates `godot/data/combat_asset_manifest.json`; `--check` rejects catalog drift. No gameplay content file changed in this pass. `godot/data/combat_asset_overrides.json` is the separate editable presentation binding layer; regeneration preserves it.

Generated entries declare reserved paths under `res://art/approved/combat/`. These are future asset slots, not claims that art exists. Paths, optional background/foreground/shadow layers, tint/accent, layout scale and impact/ground anchors are declared. Existing production-asset approval policy still governs files placed there.

## Resolver contract

`combat_asset_resolver.gd` reads/caches the catalog and bindings; returns independent config dictionaries. Overrides can change only presentation paths/hints, not canonical IDs, Dao ownership or category. Family accent overrides propagate to the family's skill entries; explicit per-skill overrides then win.

- `environment(VM environment)` → biome / zone / element configs plus `biomeBasePath`, `zoneLayerPath`, `elementLayerPath`. Biome selection: canonical major index first, exact canonical biomeName if index missing, otherwise native shell. Zone/element remain independent; missing primaryElement never derives one from the floor. Canonical IDs include `biome.major.1`, `zone.1`, `Wood`.
- `enemy(archetypeId)` → actor sprite/shadow paths, placeholder key, layout scale and anchors. Exactly wolf / serpent / golem / spirit / demon / dragon / generic; missing/unknown IDs use generic. Boss names are not inspected.
- `skill(daoId, skillId, category)` → exact registry skill config first, then Dao-family config, then generic. Category is basic / active / ultimate. Real textures fall back from exact icon path to family icon path, then a native glyph.
- `texture_for_path` accepts normalized approved-resource paths only, returns null for unavailable paths and caches loaded Texture2D resources. Returned configs do not mutate catalog state.

## Integration and files

- New data: `godot/data/combat_asset_manifest.json`, `combat_asset_overrides.json`.
- New routing/glyph helpers: `godot/scripts/combat/combat_asset_resolver.gd`, `combat_placeholder_glyph.gd`.
- `combat_screen.gd` binds canonical environment/enemy metadata into the battlefield and actor, preserving navigation and event handling.
- `combat_battlefield_shell.gd` renders available base/layers, or the existing native atmosphere with a static element tint and zone-intensity ground ring. Optional foreground/background layers are supported.
- `combat_actor_placeholder.gd` renders approved sprite/shadow paths when present, otherwise distinct native archetype placeholders (beast, serpent, golem, spirit, demon, dragon, neutral generic). These are temporary illustrative shapes, not final art. Scale hints affect presentation only; anchors are exposed for future effects, with no production VFX implemented.
- `combat_skill_slot.gd` uses resolver textures/glyphs. `combat_placeholder_glyph.gd` provides one engraved language with Dao-specific accent/geometry and Basic/Active/Ultimate distinctions. No 80 hand-crafted images were made. Exactly five equipped Actives + Basic/AUTO/Ult remain visible; cooldown, selected state and sole numeric gauge remain authoritative.
- `godot/backend/combat_presentation.mjs` adds only `skills[].daoId` from canonical `runtimeV117.daoBinding`; `combat_view_model.gd` forwards it as `dao_id`. Existing environment/archetype/schema metadata is unchanged. Main Dao widgets were not expanded or redesigned.
- Tests: `godot/tests/unit/combat_asset_resolver_test.gd`, updated `combat_view_model_test.gd`.
- Generator: `tools/godot/Build-CombatAssetManifest.mjs`.
- Records: this proof, `CURRENT_CHECKPOINT.md`, `docs/systems/combat-ui/MODULE.md`.

## Adding approved art later

1. Keep canonical IDs from the generated catalog; do not edit generated identity rows manually.
2. Place approved assets in the reserved directory or another approved resource path.
3. Use bindings to override paths/palette/scale where necessary, e.g. `biomes["1"].baseBackgroundPath`, `enemies.serpent.spritePath`, `families.artifact.iconPath`, or `skills["skill.dao.artifact.basic"].iconPath`.
4. Run import, `--check`, tests and the normal gate; restart the runtime to read changed bindings. No UI logic edit is required for those bindings.

This checkout has no Godot export preset. A future packaged export must include `data/*.json`; export packaging was not opened or claimed in this desktop-runtime pass.

## Verification

- Catalog generation/drift check: **PASS**, both LF and Windows CRLF.
- Targeted GdUnit asset + Combat VM: **17/17**, exit 0; coverage includes all 80 exact IDs and per-Dao category counts, 28-biome endpoints, all seven actor keys, first-map composition, actual texture loading, safe missing-resource fallback, immutable configs and full/missing metadata Screen/slot binds.
- Canonical metadata/determinism regression: **6/6 PASS**; prior 480 generator / 12 V3 fight baseline and all RNG draws remain identical.
- Clean runtime `KIEM_TRA_GAME.cmd`: **PASS, exit 0**, import/parse, **75/75 GdUnit / 17 suites**, bridge/P2, bounded smoke, Home **50/50**, Combat **28/28**, Home capture **9/9**, Combat capture **23/23**.
- Both actual 390×844 Combat PNGs were inspected and pass pixel validation: preview wolf vs actual serpent routing and artifact-family glyphs are visible; no clipping or early result overlay.
- Ordinary save hash remains `7893E5CB59864CEC72CA5C9E5BBF712F8D161B9A5F9BB67F72D986BBC06826A7`.

Logs: `qa/output/asset-parse.log`, `asset-unit.log`, `asset-full-gate.log`. Actual screenshots: `artifacts/godot-tools/stagehand-combat-visual/screenshots/combat-prefight-390x844.png` and `combat-playback-390x844.png`. No extra Combat viewport PNGs or new screenshot framework.

```powershell
node tools/godot/Build-CombatAssetManifest.mjs --check
node qa/tests/combat-visual-metadata-contract-test.js
$env:GODOT_BIN='E:\Godot_v4.7.2-stable_win64_console.exe'
cmd /c 'KIEM_TRA_GAME.cmd < NUL'
```

Architecture/runtime PASS does not approve art, visuals or close/lock the Combat UI slice. Balance, CombatKernel, rewards, AI, Hunt logic, save migration, animation/VFX/sound and GCombat-4 remain unopened.
