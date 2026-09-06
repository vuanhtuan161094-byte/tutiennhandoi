# Combat Visual QA R1 — 2026-09-05

Evidence: first real user capture after Wireframe V1, 367x792 viewport image.
Reference: docs/ui/reference/REFERENCE_COMBAT_TARGET_20260905.png (864x1536).

## Verdict

PARTIAL PASS — composition direction is correct, but Combat is NOT visually locked yet.

## What already works

- Battlefield/art is now the dominant surface rather than stacked dashboard cards.
- Enemy is upper-right and player lower-left, matching the target diagonal hierarchy.
- Enemy/player HP stays close to its actor.
- Boss CTA only appears in pre-fight; the combat screen does not fake manual skill casting.
- Compact event log is separate from bottom navigation and does not overflow the capture.
- Right-side Auto control is understandable and does not compete with the actor art.

## Gaps found in the real capture

1. Early-game locked skill placeholders are visually promoted like real combat actions. This is misleading and creates large dead circles near the action zone.
2. Three tiny stage utility buttons beside the skill area are cryptic and redundant in pre-fight. Floor already opens from the centered encounter chip; map/help already live at the top-right.
3. Player character and CTA/loadout area are too tightly stacked. The player needs a slightly higher visual anchor and the boss CTA needs a clearer lane above the skill row.
4. Upper field still has more utility/readiness visual noise than the reference. It should remain subordinate to enemy identity and actor art.
5. The screenshot is PRE-FIGHT (`KHIÊU CHIẾN BOSS` visible), while the canonical reference is ACTIVE COMBAT. Therefore active-combat geometry, telegraph, damage numbers, cooldown/proc states and 3-line log cannot be visually locked from this capture alone.
6. There is a clipped large text fragment at the extreme top edge (`Khắc: Thủy ...`) in the capture. Its producer is not present as a literal in `hunt-combat-v2.js`; it requires one more live capture after R1 (preferably with browser/device chrome excluded) to determine whether it is a stale overlay, shell artifact, or combat state label.

## R1 code response

- Compact skill HUD now promotes only learned/real abilities; locked or empty future slots remain in DOM for progression/state truth but are hidden from battlefield presentation.
- Skill cluster is flex-packed to the lower-right, so 1 learned skill does not reserve four fake columns.
- Pre-fight duplicate stage-tool micro-cluster is hidden.
- Player HUD and actor are shifted slightly upward.
- Pre-fight boss CTA is separated vertically from the skill row.
- Readiness/utility chrome is slightly quieter.
- No backend, CombatKernel, stat, AI, reward, action transport or Pixi combat truth changed.

## QA

- Targeted Combat Wireframe Visual QA: 16/16 PASS.
- V129 Frontend FAST: 7/7 PASS.
- Browser visual/device gate remains manual and separate.

## Next visual evidence required

After applying R1, capture:
1. pre-fight boss screen once more; and
2. one screenshot DURING the fight, ideally while a skill is cooling down or enemy telegraph/damage number is visible.

Those two captures are sufficient to decide Combat UX Lock versus another geometry pass. No new rendered art is required yet.
