# UI/UX PRODUCTION DIRECTION V1 — REFERENCE-DRIVEN

> **Execution rule:** all UI/UX work is now governed by `docs/ui/UI_UX_WORKFLOW_V2_20260913.md`.
> Where this older direction document conflicts with Workflow V2, Workflow V2 wins. In particular: a reconstructed mock/placeholder preview is never valid visual proof, and no UI slice may be locked before the user sees and explicitly approves screenshots from the actual runtime candidate.

## 1. Problem being solved
The project has deep backend/gameplay systems but the visual product identity is not yet sufficiently locked. A free-form screen-by-screen redesign is high risk because it tends to produce locally attractive but inconsistent screens.

The solution is to lock the product through a small vertical slice and propagate its design grammar afterward.

## 2. Canonical workflow
### Stage A — Functional UX
For each screen, inventory:
- entry point;
- player's current goal;
- primary action;
- secondary actions;
- blockers/prerequisites;
- resource sources;
- rewards/result;
- exit/back path;
- backend action/read-model owner.

### Stage B — Reference decomposition
Turn the selected reference into measurable rules:
- content zones and proportions;
- character/art occupancy;
- header/bottom-nav height;
- CTA hierarchy;
- maximum visible counters;
- panel density;
- text hierarchy;
- spacing rhythm;
- icon sizing;
- information that is always visible vs progressive disclosure.

### Stage C — Neutral code prototype
Build layout with current code stack and placeholder art. Do not decorate prematurely.

**Workflow V2 constraint:** neutral prototypes are internal implementation aids only. They cannot be presented as proof of the current game and cannot satisfy visual review.

### Stage D — Portrait shell gate
The product is portrait-only on both mobile and web. Mobile fills the device; desktop/web centers the portrait client instead of creating a separate desktop game layout. Validate 360×800, 390×844, 412×915, compact-height browser windows and tall browser windows. 390×844 is a QA reference only, never a hard-coded canvas.

### Stage E — Visual lock
Only after UX/layout approval:
- xianxia art;
- background;
- character illustration;
- icons;
- ornament;
- VFX;
- micro-animation.

**Workflow V2 constraint:** visual lock requires screenshots from the real runtime candidate plus explicit user approval before `[closure]`.

## 3. Visual direction
Primary identity:
- classical xianxia;
- semi-realistic/manhua-quality character rendering;
- light ink-wash / mountainous environments where appropriate;
- dark translucent HUD panels;
- restrained ivory/gold ornament;
- art-first, not dashboard-first.

Avoid:
- unrelated modern-fashion theme as global identity;
- excessive glassmorphism;
- every feature being a bordered rectangular card;
- neon glow on every control;
- too many simultaneous currencies;
- tiny unreadable text to fit more systems.

## 4. Core shell principles
The persistent shell should eventually converge on a small set of main areas rather than exposing every subsystem at once.

Candidate functional grouping (not final visual lock):
- Nhân Vật / build systems;
- Tu Luyện / realm progression;
- Chiến Đấu / combat activities;
- Động Phủ / economy & companion systems;
- Thế Giới / maps, major progression, reincarnation.

Do not finalize exact labels or iconography until the first vertical slice proves the navigation works.

## 5. Combat canonical direction
Use the provided combat reference for spatial hierarchy.

Requirements:
- enemy located in upper combat field;
- player located in lower combat field;
- full-scene background;
- compact HP/resource/status information near the combatants; HP text uses absolute current/max values, while bar length communicates percentage;
- all learned production skills remain visible in a non-overflowing lower auto-skill rail; empty/future slots are hidden;
- auto-combat status visualized through cooldown rings, stack badges, READY/proc states;
- compact event log, expandable/hideable for details; live cooldown/status/telegraph countdowns show integer seconds only;
- speed controls only where supported;
- no fake manual-cast affordance.

## 6. Home canonical direction
The home screen should communicate "I am cultivating in a world" rather than "I am operating a management console".

Requirements:
- character + environment are dominant;
- current realm and cultivation progress are visible;
- one contextual primary progression CTA;
- small number of contextual recommendations;
- access to major destinations without covering the artwork in cards.

## 7. Character/build canonical direction
Use the second reference for presentation quality:
- large full-body hero/companion artwork;
- equipment/skill information arranged around the visual focus;
- concise summary first;
- deeper stat sheets and formulas behind secondary detail actions.

## 8. UX invariants
Every screen must answer:
1. Where am I?
2. What should I do now?
3. If I cannot do it, why?
4. Where do I obtain what is missing?
5. What changes after I do it?

If a screen fails these questions, it is not ready for visual polish.

## 9. First implementation sequence
1. Combat reverse-engineering spec.
2. Combat neutral prototype.
3. Combat visual candidate(s), tightly controlled.
4. Home neutral prototype.
5. Home visual lock.
6. Tu Luyện / Thăng Cảnh.
7. Nhân Vật / Trang Bị.
8. Freeze Design System V1 from the four approved screens.
9. Expand systematically to remaining systems.

## 10. Acceptance standard before showing the user
Self-review each candidate against:
- reference alignment;
- xianxia identity;
- visual hierarchy;
- readability;
- art prominence;
- touch targets;
- information density;
- mobile fit;
- component consistency;
- gameplay truthfulness.

If the candidate is obviously weaker than the reference on hierarchy or polish, revise before presenting it.

After self-review, follow Workflow V2: capture real runtime proof, show it to the user, and wait for explicit visual approval before closure.
