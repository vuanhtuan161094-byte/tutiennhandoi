# UI FOUNDATION + COMBAT V7 — IMPLEMENTATION REPORT

**Date:** 2026-09-05  
**Baseline:** V129 UI handoff + latest Combat V6 patch  
**Scope:** Portrait client foundation + Combat UI consolidation only  
**Gameplay/backend:** unchanged

## 1. Why this pass exists

The previous Combat iterations improved individual symptoms but accumulated presentation overrides. The main failure mode was patch-by-patch CSS: a visible issue was fixed, while older rules remained able to influence another state. The user's newest direction is therefore applied as a structural reset: old/wrong presentation code may be deleted; target composition is a reference, not a mechanic specification; web still hosts a portrait game client rather than a desktop-wide game.

## 2. Executed plan

### P0 — Freeze / baseline
- Rebuilt the working tree from the clean V129 UI handoff and overlaid the latest V6 patch.
- Backend/gameplay source was not redesigned.

### P1 — Shell audit
- Confirmed `390×844` had been treated too strongly as a design frame in older Hunt CSS.
- Removed the obsolete Hunt-specific fixed `430px` web shell and old Hunt bottom-nav overrides.
- Confirmed `app.js` already owns `body.dataset.uxShell='p0'`; no backend or route contract change was required.

### P2 — Typography / spacing audit
- Global historical stylesheet still contains many legacy micro-font declarations on screens that have not yet been rebuilt. They are inventoried, not blanket-inflated, because doing so would break those screens without fixing their hierarchy.
- The final Combat V7 presentation block has **88 explicit font-size declarations; minimum = 10px; under 10px = 0**.
- Readability floor is also enforced for skill detail, combat help, status callouts and DEV controls, not only the main battlefield.
- Global P0 tokens now start at 10/11/12/14/16/18/22px with a 44px touch target.

### P3 — Portrait Client Shell V1
- Mobile: game client owns the full `100dvh` viewport.
- Web/desktop: the same portrait client is centered; its width derives from available viewport height at 9:16 instead of expanding across desktop width.
- `390×844` is now only a QA sample, not a fixed canvas.
- Height profiles are used: compact <=740px, standard 741–900px, tall >900px.
- Important typography does not shrink in the compact profile; spacing/actor geometry is reduced first.

### P4 — Combat CSS/DOM consolidation
- Removed the historical appended presentation stacks for Wireframe V1, V2 R2/R3, V3, V4, V5 and V6.
- Combat root now opts into one presentation architecture only: `huntv2-combat-v7` / `portrait-target-consolidated-v7`.
- Removed redundant visible battlefield surfaces: old stage footer, Boss-ready chip and readiness chip.
- Kept stable mechanic/FX/sheet behavior required by runtime, then overrides it through one V7 presentation contract.

### P5 — Target-driven Combat hierarchy
Reference grammar preserved where it fits the actual game:
1. top-left player identity;
2. top/right compact resources;
3. centered encounter chip;
4. Boss name + HP + **Phá Thế** near Boss;
5. actor-first battlefield;
6. player HP/CN/status near player;
7. Dao resource + Ultimate;
8. Auto Skill timeline;
9. one-row Combat report / pre-fight CTA;
10. app bottom navigation.

Mechanics not supported by backend, such as manual cast or fake `×2`, were not introduced.

### P6 — DEV one-click QA
- One-click Auto QA remains available.
- It covers all 8 Dao: Sword, Fist, Body, Spell, Poison, Artifact, Formation and Mind.
- Existing state stress / real backend combat / replay path is preserved.

### P7 — QA batch
- JS syntax: PASS.
- CSS brace structure: PASS.
- UI Foundation + Combat V7 targeted checks: **50/50 PASS**.
- Frontend FAST: **7/7 PASS**.
  - Browser module syntax: 22/22.
  - Performance architecture: 22/22.
  - Performance stress: 4/4.
  - Frontend performance: 13/13.
  - Launcher: 8/8.
  - Web surface: 28/28.
  - Transport: 17/17.
- Backend FAST was not rerun because no backend/gameplay contract changed.

### P8 — Visual lock
Not yet claimed. Headless Chromium in the execution environment still times out at the Linux DBus/zygote layer, so there is no honest local rendered screenshot gate. The correct final visual gate is one user-recorded DEV Auto QA video after applying V7.

## 3. Files changed
- `styles.css`
- `combat-v2.css`
- `modules/hunt-combat-v2.js`
- `index.html`
- `standalone-entry.js`
- `CHOI_UI_DEV.cmd`
- `qa/tests/ui-foundation-combat-v7-test.js`
- this implementation report and the V7 plan

Obsolete QA file to remove from an existing V6 tree:
- `qa/tests/ui-combat-readable-bottom-dock-v6-test.js`

## 4. What is deliberately NOT done in this pass

### No global blind font inflation
The wider game still contains legacy screens with tiny type declarations. They should be rebuilt through the same tokens during the vertical slice (Home -> Cultivation/Breakthrough -> Character/Equipment), not globally multiplied. A blanket replacement would create clipping/overflow while retaining poor information hierarchy.

### No 5-tab IA rewrite yet
The target's five-tab rhythm is useful, but collapsing the game's current routes is an information-architecture decision. Combat now has a stable readable bottom navigation, but route regrouping should be audited with Home before becoming canonical.

### No new rendered art
Current Combat assets are sufficient for structural validation. Rendering now would hide layout defects instead of solving them.

## 5. Next visual gate
1. Apply the patch.
2. Run `CHOI_UI_DEV.cmd`.
3. Open Combat DEV and press the one-click full Combat QA button.
4. Record one continuous video from start to completion.
5. Review V7 as a batch: typography, top identity/resources, Boss HP/Phá Thế, actor scale/spacing, player HUD, skill dock, report show/hide, bottom navigation, compact-height behavior.

If this skeleton passes, Combat architecture is locked and the next implementation target is **Home / Main Cultivation Scene** on the same Portrait Client + typography foundation.
