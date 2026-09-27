# Ngũ Hành Equipment Retirement — 2026-09-27

## Scope

This slice retires the equipment-level global Ngũ Hành axis while preserving Linh Căn and legacy save readability.

Retired from live gameplay/UI:
- Ngũ Hành Ngọc / gem sockets / gem upgrades / unsocket / gem blank acquisition.
- Ngũ Hành equipment Sets, Tàn Ấn, Set engraving, Set Resonance and Set combat bonuses.
- Equipment elemental affixes and equipment-sourced elemental affinities/resistances.
- Set/Gem/Ngũ Hành equipment UI and mutation controls.

Preserved:
- Linh Căn progression and its authored data.
- Đạo Văn and unrelated equipment progression/enhancement/merge/affixes.
- Legacy save fields (`gemSockets`, old `setId`, old elemental affixes/stats) as read-only compatibility payloads.

## Runtime behavior

- Legacy gem payloads load but have zero socket capacity, zero gem effect, zero salvage yield and cannot be socketed/upgraded/removed.
- Legacy Set payloads load but cannot grant fragments, be engraved, create resonance, activate mechanics or contribute stats.
- Legacy elemental equipment affixes remain readable but cannot be rolled, reforged, refined or selected as a new target family.
- Equipment power strips the retired global elemental axis while preserving base/Linh Căn elemental state already present on the combat entity.
- Stored legacy Set Resonance bonuses are removed from effective equipment power. V142 ranked items resolve to canonical rank base stats for this compatibility path.
- New equipment cannot acquire active Set/Gem/element-affix state through the retired paths.

## UI

`modules/nguhanh-equipment-retirement-ui.js` prunes retired Gem/Set/element-stat controls and legacy elemental affix rows without touching the Linh Căn/root screen.

## Regression

Targeted regression:
`qa/tests/nguhanh-equipment-retirement-regression-test.js`

It covers legacy save readability, zero retired bonuses/effects, mutation blocks, no new retired state, Linh Căn/base affinity preservation, stored Set Resonance removal and UI retirement guards.

`qa/local/run-local-ci.mjs` runs the targeted regression before the existing Local CI suite.

## Commits

- Initial retirement: `741772931ffcc46bfdc0ad831424ce2abf0a3e7d`
- Hardened regression: `6067ef3c0e7a6a7f089c366c29c1e62f136c3d67`
- Legacy-path seal: `9770f48c6127522d912a8df7bb413f2f609d692e`
- One-click local closure command added after the above runtime commits.

## Closure status

**CODE COMPLETE / LOCAL CLOSURE PENDING.**

The remote environment cannot provide the required Windows clean-checkout Local CI/Godot evidence. When the user PC is available, run only:

`DONG_BO_VA_TEST_NGU_HANH_RETIRE.cmd`

Required closure evidence:
- `main` clean checkout;
- exact SHA printed by the CMD;
- targeted `NGUHANH EQUIPMENT RETIREMENT REGRESSION: PASS`;
- Local CI FULL CLEAN PASS.

Do not run routine GitHub Actions for this slice.
