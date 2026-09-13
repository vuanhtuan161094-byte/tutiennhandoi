# UI/UX WORKFLOW V2 — RUNTIME-FIRST, VISUAL-APPROVAL REQUIRED

Date: 2026-09-13
Status: CANONICAL EXECUTION WORKFLOW

This workflow governs all UI/UX work from this point forward. It supplements the visual/product direction in `UI_UX_PRODUCTION_DIRECTION_V1.md` and overrides any older execution sequence where they conflict.

## 1. Core rule

A UI slice is **not complete** because code compiles, tests pass, or a static mock looks acceptable.

A UI slice is complete only when all of the following are true:

1. the candidate is running from the actual current `main` codebase;
2. runtime screenshots are captured from the real game;
3. automated QA is green;
4. the user has visually reviewed the real runtime result;
5. the user explicitly approves the slice;
6. only then may `[closure]` / Canonical QA / LOCK happen.

**Static reconstructions, hand-built mockups, partial HTML/CSS recreations, concept images, and placeholder-only previews do not count as visual proof.**

## 2. Slice states

Every UI slice must be in exactly one of these states:

- `AUDIT` — current runtime inspected; no implementation yet.
- `CANDIDATE` — implementation exists but is not visually approved.
- `VISUAL_REVIEW` — real runtime screenshots are ready for user review.
- `APPROVED` — user explicitly approves the runtime visual result.
- `LOCKED` — approval recorded, closure QA passed, checkpoint updated.

There is no direct path from `CANDIDATE` to `LOCKED`.

## 3. Canonical workflow

### Gate 0 — Source snapshot

Before touching UI:

- read `CURRENT_CHECKPOINT.md`;
- confirm current `main` HEAD;
- inspect the actual renderer, CSS, assets and runtime owner for the target screen;
- do not reuse old chat assumptions without source confirmation;
- identify locked runtime/gameplay authorities that must not change.

Output:

- target screen/slice;
- current entry point and renderer;
- runtime authorities that are read-only for this work.

### Gate 1 — Baseline runtime capture

Run the **actual game** from the repo, using the canonical web server (`web/server.mjs`) or the project's current launcher.

Capture the existing screen before modification.

Required portrait reference captures:

- 390×844 — primary review size;
- 360×800 — compact robustness check;
- 412×915 — tall/wide portrait robustness check when shell/layout changes.

Capture additional states when relevant:

- default/normal;
- empty;
- blocked/locked;
- loading;
- error;
- selected/detail sheet;
- combat/animation-active state where applicable.

Rules:

- screenshots must come from the real runtime;
- production assets must load normally;
- no reconstructed mock may replace this gate;
- baseline images are retained for before/after comparison.

Output: `BASELINE` screenshot set.

### Gate 2 — UX audit

Audit the current screen before styling it.

For the target screen answer:

1. Where am I?
2. What is the player's primary goal here?
3. What is the primary action?
4. What are the secondary actions?
5. If an action is blocked, is the reason obvious?
6. Is the source of the missing resource/action obvious?
7. What changes after the player acts?
8. What information must remain visible at all times?
9. What can move behind progressive disclosure?
10. Which existing visual elements are already good and must be preserved?

Classify visible elements as:

- `KEEP` — already strong/canonical;
- `REFINE` — keep behavior, improve hierarchy/presentation;
- `HIDE/DEFER` — move behind sheet/details;
- `REMOVE` — presentation-only redundancy;
- `DO NOT TOUCH` — runtime/gameplay-owned truth.

Output: short UX audit, not a redesign yet.

### Gate 3 — Slice brief

Define a narrow visual objective before code changes.

Each slice should normally contain no more than 3 primary UX/visual goals.

The brief must state:

- what problem is being solved;
- what is intentionally preserved;
- what is changing;
- what is explicitly out of scope;
- runtime/save/gameplay invariants;
- acceptance criteria visible in a screenshot.

Avoid broad "make it prettier" patches.

Output: candidate acceptance contract.

### Gate 4 — Candidate implementation

Implement the smallest presentation patch that satisfies the slice brief.

Rules:

- preserve backend/runtime/save authority unless the task explicitly changes gameplay;
- do not invent UI-owned gameplay state;
- prefer existing production assets and existing strong components;
- avoid global CSS churn when a scoped layer can solve the problem;
- avoid adding a new design language per screen;
- preserve portrait shell behavior;
- preserve accessibility basics: focus, touch targets, semantic active state, reduced motion where applicable.

After implementation, status becomes `CANDIDATE`, never `LOCKED`.

### Gate 5 — Automated proof + runtime visual proof

Run targeted tests first, then normal Fast QA.

At the same candidate SHA, capture **real runtime screenshots** again at the required viewport(s).

Visual review checklist:

- no clipping/overflow;
- no hidden primary CTA;
- no accidental asset fallback;
- no missing background/character/equipment art;
- readable text at portrait size;
- touch targets remain usable;
- modal/sheet/nav layering is correct;
- no shell regression outside the target screen;
- art remains visually dominant where the screen calls for it;
- information density is intentional, not accidental;
- no fake values or decorative state disconnected from runtime truth.

Output:

- `BEFORE` runtime screenshot(s);
- `AFTER` runtime screenshot(s);
- QA result;
- concise description of what visibly changed.

Status becomes `VISUAL_REVIEW`.

### Gate 6 — User visual approval

Show the user the **actual runtime result** before closure.

Required review package:

- primary 390×844 screenshot;
- relevant compact/tall screenshot if layout-sensitive;
- before/after when the change is substantial;
- exact list of changed visual regions;
- known remaining imperfections, if any.

Then stop.

Do **not** run `[closure]` merely because Fast QA passed.

If the user rejects or asks for changes:

- keep the slice in `CANDIDATE` / `VISUAL_REVIEW`;
- patch only the requested/observed problems;
- repeat Gate 5 and Gate 6;
- do not update the checkpoint as locked.

Only explicit user approval moves the slice to `APPROVED`.

### Gate 7 — Closure

Only after `APPROVED`:

1. create the `[closure]` commit;
2. run Canonical QA;
3. confirm performance hard locks remain unchanged;
4. update `CURRENT_CHECKPOINT.md`;
5. mark the slice `LOCKED`;
6. record candidate SHA, closure SHA, QA run and visual approval.

A closure without recorded visual approval is invalid for UI/UX work under Workflow V2.

## 4. Visual evidence policy

### Valid evidence

- screenshot from the actual current repo runtime;
- screen recording from the actual current repo runtime;
- browser capture produced by automated visual smoke tooling against the actual current repo runtime.

### Invalid evidence

- manually reconstructed HTML preview;
- partial CSS mock;
- Figma-like static imitation not generated from runtime;
- concept art presented as implemented UI;
- image-generation output presented as the current game;
- screenshots from an old commit presented as the current candidate.

## 5. Runtime visual capture automation target

The repo should gain a dedicated visual-smoke path that:

1. starts `node web/server.mjs` on CI;
2. waits for `__tutien_launcher_health`;
3. opens the real game in Chromium;
4. loads a deterministic QA/save state when one exists;
5. captures selected screen(s) at 390×844 and robustness viewport(s);
6. uploads screenshots as a GitHub Actions artifact;
7. fails on launcher/runtime errors;
8. does not make pixel-diff approval automatic unless a stable baseline is intentionally introduced later.

Until that automation is implemented, visual proof must still be captured from the real runtime manually; mock reconstruction remains prohibited.

## 6. Existing UI slices under migration

Home / Tu Luyện and App Shell / HUD have already passed automated QA and Canonical closure, but they were closed before Workflow V2 required explicit runtime visual approval.

Therefore their status under this workflow is:

- automated/technical closure: PASS;
- runtime visual approval: NOT YET RECORDED;
- visual status: `VISUAL_REVIEW REQUIRED`;
- do not treat their visual design as permanently locked until the user sees and approves real runtime captures.

This does **not** reopen V160–V179 runtime/gameplay authorities.

## 7. Working cadence

For each UI slice:

`source snapshot → real baseline screenshot → UX audit → narrow brief → candidate patch → targeted test → Fast QA → real after screenshot → user visual review → iterate if needed → explicit approval → [closure] → Canonical QA → checkpoint`

This is the canonical UI/UX workflow from 2026-09-13 onward.
