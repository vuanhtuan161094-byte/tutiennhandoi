# Simplified Combat Biome Family Architecture — 2026-10-06

**Combat Asset Architecture PASS**. This record supersedes the earlier 28-base / zone-layer / element-layer model.

Opening main: `ce9dfbb2077f02f56f2b8a4526b9a6e62fb4ad00` (fetch/pull current, clean).
Exact clean runtime SHA verified by full Windows gate: `b1f0b3c678b49b413a5d80f480c5ad11e3f79928`.
The final documentation commit follows this tested runtime commit; final published HEAD is reported in the task completion report. No executable changes follow the clean runtime gate.

## Architecture and authority

28 canonical backend biome names map explicitly into **8 master biome families**. Generic is a separate fallback, not a ninth master family. The family owns the future base art. Optional biomeVariant is empty; no per-biome assets are required.

`godot/data/combat_biome_families.json` owns presentation mapping and family manifests. The generator reads canonical realm maps, archetypes and skill registry, validates exact mapping coverage and all eight families, then writes `combat_asset_manifest.json`. Missing/extra canonical name or unknown family fails generation. Generated identities are never hand-edited. All eight families expose familyId, displayName, baseBackgroundPath, fallbackPath, tint and composition hint. Reserved paths point to future art only.

| Canonical biomeName | Master family |
| --- | --- |
| Thanh Hư Sơn Mạch | mountain_valley |
| Lôi Minh Cốc | mountain_valley |
| Kim Tiên Thần Sơn | mountain_valley |
| Đan Hỏa Sơn | volcanic_badlands |
| Thiên Kiếp Hoang Nguyên | volcanic_badlands |
| Tử Kính Hồ | lake_river_sea |
| Vân Hồn Hải | lake_river_sea |
| Thiên Khung Tiên Hải | lake_river_sea |
| Thái Ất Kỷ Hà | lake_river_sea |
| Địa Mạch Tiên Uyên | canyon_ruins |
| Chân Tiên Cổ Lộ | canyon_ruins |
| Huyền Pháp Thiên Khư | canyon_ruins |
| Ngộ Đạo Thiên Nhai | heavenly_cliff |
| Đại Thừa Thiên Nguyên | heavenly_cliff |
| Cực Hạn Biên Giới | heavenly_cliff |
| Vạn Tượng Hợp Vực | sacred_realm |
| Tiên Linh Cổ Vực | sacred_realm |
| Đại La Vạn Giới | sacred_realm |
| Tiên Vương Cổ Đình | sacred_realm |
| Tiên Đế Thần Vực | sacred_realm |
| Hư Không Liệt Cốc | void_chaos |
| Cực Đạo Hỗn Độn Hải | void_chaos |
| Hỗn Độn Tổ Vực | void_chaos |
| Hồng Mông Nguyên Hải | divine_origin |
| Khai Thiên Nguyên Giới | divine_origin |
| Vạn Giới Chủ Vực | divine_origin |
| Vĩnh Sinh Thần Hà | divine_origin |
| Sáng Thế Hư Không | divine_origin |

Zone 1–8 retains canonical zoneName and intensity tier/key; it has **no asset path**. Primary elements Wood/Fire/Earth/Metal/Water retain infoKey and elementAccent; they have **no asset path** and do not tint the battlefield. Changing zone or element never changes family/base art. Battlefield selection and palette come only from the family; optional family background/foreground layers are supported.

## Resolver and integration

`environment(VM.environment)` returns biomeFamilyId, biomeBasePath, zoneIntensityKey, primaryElement, primaryElementInfoKey, plus copied biome/family/zone/element configs. Exact biome_name selects a family. Missing/unknown biome name returns generic even if major_realm_index exists. Missing/invalid zone returns tier.1. Missing/invalid element returns neutral / element.neutral. No floor/name heuristic or element inference.

CombatScreen binds resolver output into battlefield and actor. Battlefield uses family base → optional family fallback texture → existing native shell. Art overrides are limited by group; zone/element cannot acquire asset paths through overrides. Only approved resource paths can load textures; missing resources return null without crashing.

Enemy routing remains **wolf / serpent / golem / spirit / demon / dragon + generic = 7 entries**. Exact canonical ID selects sprite/shadow/layout/anchors; missing/unknown ID uses generic. Boss display names never select archetypes.

Skill routing remains **80 registry entries**, eight Dao × (1 Basic + 8 Active + 1 Ultimate). SkillSlot/rail uses resolver: exact skillId → Dao family → generic; textures use exact icon → family icon → native glyph. No per-icon UI hardcoding. Gameplay state and visible equipped slots are unchanged.

## Verification

- Manifest drift check: PASS.
- Node biome family contract: PASS; all 28 entries, eight families, negative missing/unknown mapping, no zone/element paths.
- Canonical metadata / gameplay / exact RNG baseline: **6/6 PASS** (480 generator cases and 12 V3 fights remain identical).
- Targeted Godot asset + ViewModel: **18/18 PASS**, exit 0. Tests cover every biome, **1,120** biome × zone × element combinations, all seven archetypes, all 80 skill IDs and category counts, missing metadata/resources, copied config isolation, actual texture loading and full/missing Screen/slot binds.
- `KIEM_TRA_GAME.cmd`: **PASS, exit 0** at exact runtime SHA above. Import/parse, **76/76 GdUnit / 17 suites**, canonical bridge, isolated P2 fixture, bounded smoke, Home **50/50**, Combat **28/28**, Home capture **9/9**, Combat capture **23/23**, screenshot pixels PASS.
- Both actual 390×844 Combat PNGs inspected: wolf preview / serpent playback, family fallback battlefield and artifact glyph routing visible, no clipped HUD or early results overlay. Baseline remains NOT APPROVED; this does not claim visual closure.
- Ordinary save SHA256 unchanged: `7893E5CB59864CEC72CA5C9E5BBF712F8D161B9A5F9BB67F72D986BBC06826A7`.

Logs: `qa/output/biome-family-unit.log`, `qa/output/biome-family-full-gate.log`.
Screenshots: `artifacts/godot-tools/stagehand-combat-visual/screenshots/combat-prefight-390x844.png`, `combat-playback-390x844.png`.
Exact gate identity: `artifacts/godot-tools/verified-head.txt`.

## Files changed

- godot/data/combat_biome_families.json
- godot/data/combat_asset_manifest.json
- godot/data/combat_asset_overrides.json
- godot/scripts/combat/combat_asset_resolver.gd
- godot/scripts/combat/combat_battlefield_shell.gd
- godot/tests/unit/combat_asset_resolver_test.gd
- tools/godot/Build-CombatAssetManifest.mjs
- qa/tests/combat-biome-family-contract-test.mjs
- docs/ui/GODOT_COMBAT_BIOME_FAMILY_ARCHITECTURE_20261006.md
- docs/ui/GODOT_COMBAT_ASSET_ARCHITECTURE_20261006.md (superseded notice only)
- CURRENT_CHECKPOINT.md
- docs/systems/combat-ui/MODULE.md

## Future art binding and status

Add approved art at reserved family paths or bind `biomeFamilies.<id>.baseBackgroundPath` in overrides. Enemy and skill binding keys remain unchanged. Regenerate from canonical data, run import/check/tests/full gate. Future packaged export must include data/*.json; no export preset or packaging was added.

Background production art **NOT STARTED**.
Monster production art **NOT STARTED**.
Skill icon production art **NOT STARTED**.
GCombat-4 **NOT STARTED**.
Gameplay authority / RNG sequence / balance / rewards / CombatKernel modified: **NO**.
Save schema migrated: **NO**. Production art created: **NO**.

Reproduce from the repository directory:

```powershell
node tools/godot/Build-CombatAssetManifest.mjs --check
node qa/tests/combat-biome-family-contract-test.mjs
node qa/tests/combat-visual-metadata-contract-test.js
$env:GODOT_BIN='E:\Godot_v4.7.2-stable_win64_console.exe'
cmd /c 'KIEM_TRA_GAME.cmd < NUL'
```
