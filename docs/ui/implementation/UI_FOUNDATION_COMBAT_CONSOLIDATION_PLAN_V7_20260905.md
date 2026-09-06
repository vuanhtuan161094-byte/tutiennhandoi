# UI FOUNDATION + COMBAT CONSOLIDATION V7 — EXECUTION PLAN

Date: 2026-09-05
Baseline: V129 clean handoff + Combat V6 readability patch
Visual benchmark: `docs/ui/reference/REFERENCE_COMBAT_TARGET_20260905.png` + user's newest combat target screenshot

## Goal
Stop incremental CSS patching. Replace the stacked Combat V1→V6 overrides with one portrait-shell contract and one canonical Combat presentation layer. Keep gameplay/backend truth unchanged.

## P0 — Freeze and audit
- Work on a clean V129 tree with V6 overlaid.
- Preserve backend/runtime files unless integration exposes a real contract bug.
- Inventory shell, Combat DOM, all player-visible combat states, typography, touch targets and responsive breakpoints.

Acceptance:
- No assumption that 390×844 is a fixed canvas.
- 390×844 remains a QA sample only.

## P1 — Portrait client shell
Product rule: game stays portrait on phone and web.

Mobile:
- client uses full viewport width/height;
- safe-area aware;
- no browser/page scroll.

Web/desktop:
- portrait client centered in browser;
- width derives from available height and is capped;
- outer browser space is decorative/background only;
- no desktop-wide redesign.

Height profiles:
- compact: <= 740 px available height;
- standard: 741–900 px;
- tall: > 900 px.

Acceptance:
- no hard-coded 390×844 shell;
- shell fits 360×800, 390×844, 412×915 and short desktop browsers;
- no horizontal overflow.

## P2 — Typography and spacing foundation
Canonical gameplay scale:
- micro: 10 px (rare, non-critical only)
- small: 11 px
- body: 12 px
- emphasis: 14 px
- section: 16 px
- title: 18 px
- hero: 22 px
- minimum interactive target: 44 px

Rule: when space is insufficient, remove/condense Tier-3 metadata before shrinking important text.

Acceptance:
- no core Combat text below 10 px;
- nav labels >= 10 px;
- key names >= 15 px;
- HP/Poise/resource values readable without zoom.

## P3 — Remove Combat override stack
- Delete Combat Wireframe V1, Visual QA R1, V2 R2, V2 R3, V3, V4, V5 and V6 override blocks from `combat-v2.css`.
- Keep only the stable legacy mechanics/animation/sheet base and append one canonical V7 presentation block.
- Remove V2→V6 root classes from Combat DOM.
- Keep one root marker: `.huntv2-combat-v7`.

Acceptance:
- no `.huntv2-combat-v2`…`.huntv2-combat-v6` selectors remain in runtime Combat CSS/DOM;
- no historical combat shell override stack remains in `styles.css`.

## P4 — Combat hierarchy from target
Screen order:
1. identity/top resources;
2. encounter chip;
3. boss core HUD (name, HP, Phá Thế, contextual state);
4. battlefield / actor art / FX;
5. player core HUD (HP, CN, contextual status);
6. Dao resource + Ultimate;
7. Auto Skill timeline;
8. one-row Combat report OR pre-fight CTA;
9. persistent app bottom navigation.

Always visible:
- Boss HP;
- Phá Thế;
- Player HP/CN;
- Dao resource when applicable;
- Ultimate state;
- learned Auto skills;
- current navigation context.

Contextual only:
- Phase;
- telegraph;
- Thất Thế/Ổn Thế;
- shield;
- buff/debuff/mark stack;
- counter window;
- skill callout.

Detail-only:
- formulas;
- raw status IDs;
- full battle log;
- deep telemetry.

## P5 — Combat DOM cleanup
- Add top-left player identity presentation.
- Keep player combat HP/CN near actor as a separate core HUD.
- Remove redundant visible Boss-ready/readiness/mechanic chips from battlefield.
- Remove obsolete stage footer.
- Move Dao/Ultimate meter into the fixed lower Combat dock.
- Move compact battle report into the same lower dock.
- Pre-fight CTA and battle report occupy the same fixed row, preventing layout jumps.

## P6 — One-click DEV QA
Keep `CHẠY TOÀN BỘ COMBAT QA` as the operator workflow.
It must cover:
- 8 Dao;
- player HP/CN/resource/Ultimate states;
- Poise 70, Thất Thế, recovery;
- buffs/debuffs/mark stacks;
- Boss phase/telegraph/counter;
- actor poses + FX;
- report compact/expanded/hidden;
- one authoritative backend fight + replay.

## P7 — Automated gates
Required before packaging:
- JS syntax;
- CSS structural/braces check;
- V7 targeted contract test;
- frontend FAST 7/7;
- backend gates only if gameplay/backend contract was changed.

## P8 — Visual closure rule
Do not request new art merely to compensate for layout defects.
After V7 passes structural QA, use one DEV Auto-QA video for final geometry/polish review.
Only then identify assets that genuinely require replacement/rendering.
