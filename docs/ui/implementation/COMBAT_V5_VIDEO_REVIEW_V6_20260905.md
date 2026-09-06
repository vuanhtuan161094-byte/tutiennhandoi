# Combat V5 Video Review → V6 Readability Pass

Source reviewed: the user-recorded 390×844 Chrome DevTools Auto-QA video dated 2026-09-05 (~96 s).

## Findings from the recording

1. **Typography was materially undersized.** V5 still used visible text at 5.3–7.3 px in Dao/Ultimate meters, Phá Thế, status timers, combat report, CTA subtitle and navigation. This is below a practical mobile reading threshold and was the main reason the screen felt visually "small" despite large actor art.
2. **Bottom app navigation did not reliably appear inside the recorded emulated viewport.** V5 intended the nav to own a grid row, but the actual recording ended at the combat report. V6 makes the Hunt shell deterministic: viewport is explicitly inset above a 66 px bottom HUD anchored inside `game-shell`.
3. **Player vitals crossed the character face/hair.** The fixed player HUD was too low. V6 lifts it and gives it a lightweight dark gradient so HP/CN remain readable without becoming another panel.
4. **Boss information hierarchy was compressed.** Boss name was acceptable, but metadata, HP values and Phá Thế were too small. V6 raises title/value sizes and keeps only the important persistent fields.
5. **Dao/Ultimate meters were effectively telemetry.** 5 px labels forced users to inspect instead of glance. V6 increases the meter height and labels; secondary copy remains omitted rather than being shrunk.
6. **Skill rail felt visually detached.** Icons were usable but too small relative to the lower empty area and the missing nav. V6 grows skill icons and establishes a fixed rhythm: Dao/Ultimate → Auto skills → Combat report → App nav.
7. **Tiny role/name/meta text around skills added noise.** V6 hides role/name/meta in the production dock. Tapping the icon remains the route to detail; auto combat remains authoritative.
8. **Combat report was too small to function as a readable optional layer.** V6 raises its label/body typography and hit areas while preserving compact/expanded/hidden states.
9. **Status durations/stacks inherited 5–6 px legacy rules.** V6 keeps icon-first status chips but enlarges visible duration/stack values.
10. **Telegraph / Thất Thế / contextual callouts were correctly contextual, but still too small.** V6 increases the temporary information hierarchy without allowing those elements to become permanent dashboard chrome.

## V6 layout contract at 390×844

- App bottom HUD: 66 px, always inside the game shell.
- Hunt viewport: all remaining height above the HUD.
- Encounter top row: 34 px controls.
- Boss core: ~66 px with Name → HP → Phá Thế.
- Battlefield: actor/FX-first; only contextual telegraph/statuses intrude.
- Player core: fixed lower-left, lifted above the face overlap seen in V5.
- Lower combat dock: 22 px Dao/Ultimate + 58 px skill rail + 38 px report/CTA.
- No production microcopy intentionally below ~8.3 px in the V6 combat overrides.

## Gameplay contract

No CombatKernel, damage, reward, AI rotation or backend gameplay behavior was changed. Skill icons remain read-only monitoring/detail affordances; no manual cast or fake speed control is introduced. Phá Thế remains first-tier Boss information. One-click DEV Auto-QA remains available and still ends with an authoritative `endlessFight` backend combat.

## Asset decision

No new render is required for this pass. The defects observed in the video are layout/typography/shell issues. Background cleanup (especially baked-in text on the Wood background) remains an art-polish task after Combat UX geometry is locked.
