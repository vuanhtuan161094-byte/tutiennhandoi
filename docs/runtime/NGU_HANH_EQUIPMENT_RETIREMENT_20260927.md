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

## Closure fixes discovered by clean Local CI

The clean Windows closure surfaced stale cross-system expectations caused by retiring Set/Gem/element equipment state. These were corrected without restoring retired gameplay:

- V142 legacy Set identity is readable as retired metadata while Set power remains inert.
- V165 equipment authority accepts retired Set metadata but strips retired axes from effective gameplay power.
- V129 stat source/architecture tests now assert retired Gem/Set semantics instead of historical live bonuses.
- Dodge rarity was rebaselined after removal of elemental affixes from the live roll pool; gameplay weights were not changed.
- Balance Lab tolerates the absence of live equipment Sets.
- Tri Kỷ V129 benchmark uses aggregate role envelopes rather than a stale per-archetype burst/support ordering that depended on historical Set synergy.
- Frontend performance keeps the 4.40 MiB static-byte ceiling; its module-count ceiling is rebaselined to 199 because compatibility retirement intentionally split legacy modules into explicit read-only files.

## Commits

- Initial retirement: `741772931ffcc46bfdc0ad831424ce2abf0a3e7d`
- Hardened regression: `6067ef3c0e7a6a7f089c366c29c1e62f136c3d67`
- Legacy-path seal: `9770f48c6127522d912a8df7bb413f2f609d692e`
- Delegated Local CI validator fix: `e6d1086e2ff1b7eebdb96cb59383e5c84769d36f`
- Preserve retired V142 Set metadata: `3e6d5113ba4c789bc52252343675d47c7be0df8e`
- Align V165 authority with retirement: `479f70cd249e9296f334b4b2b0f54c4fbc0c0413`
- Retire stale Set/Gem source-audit expectations: `7f093181f9292dfa8c1bc8043176ef2ad5464d58`
- Retire stale Gem architecture expectations: `20c9c8ce9bc6d2bc734a10efe1a844aca49dc992`
- Balance Lab no-op for retired Sets: `e1bb60bf4f38fc27167fc2d491d3850ae38cec0c`
- Dodge rarity rebaseline after element-affix retirement: `ce69587c0becf1d7cc5d1eb18417ec478fb03ca5`
- Tri Kỷ benchmark alignment after Set retirement: `77769be7755d2cad47bafeb634664e431e938474`
- Frontend module-count rebaseline after compatibility split: `39781155b11b1c48edce11fb141cd204a71df71c`

## Closure status

**CLOSED / LOCKED — 2026-09-29 (Asia/Bangkok).**

Exact user-local Windows closure evidence SHA:

`39781155b11b1c48edce11fb141cd204a71df71c`

Evidence:
- branch `main`;
- clean checkout / exact-SHA evidence;
- targeted Ngũ Hành equipment retirement regression PASS;
- Backend Fast **39/39 PASS**;
- Frontend Fast **20/20 PASS**;
- canonical server healthy on `http://127.0.0.1:4173`;
- Runtime Browser Smoke **4/4 PASS**: Home navigation, Character equipment, Combat action, Save/restore;
- Strict Browser Smoke PASS with `runtimeErrors=0`, `networkFailures=0`, `missingImages=0`, `overflow=0`;
- final `LOCAL CI PASS`;
- final `NGU HANH RETIREMENT LOCAL CLOSURE: PASS`.

Local artifact root:

`artifacts/local-ci/20260928T171330Z-39781155-clean-full`

The exact gameplay/runtime evidence remains the SHA above. Any later documentation-only closure commit does not replace that tested evidence SHA.

Reopen this slice only for a proven regression or an explicit new design request. Do not restore a universal equipment-level Ngũ Hành combat wheel, Gem/Set mutation path, or equipment elemental-affix authority implicitly.
