# UI/UX WORKFLOW V2 — RUNTIME-FIRST, VISUAL-APPROVAL REQUIRED

Date: 2026-09-17
Status: CANONICAL EXECUTION WORKFLOW

## 1. Core rule

A UI slice is complete only when:

1. the candidate runs from current `main`;
2. Game CI is green on the exact candidate SHA;
3. runtime screenshots come from the real game;
4. the user visually reviews and explicitly approves the result;
5. `[closure]` Canonical QA passes;
6. the checkpoint is updated.

Static mocks, reconstructed HTML/CSS and generated concept images do not count as runtime proof.

## 2. Slice states

`AUDIT -> CANDIDATE -> VISUAL_REVIEW -> APPROVED -> LOCKED`

There is no direct path from `CANDIDATE` to `LOCKED`.

## 3. Working sequence

### Gate 0 — Source snapshot

Before editing:
- confirm current `main` HEAD;
- read `CURRENT_CHECKPOINT.md`;
- identify renderer/CSS/assets for the target screen;
- identify locked runtime/gameplay authorities that must remain untouched.

### Gate 1 — Baseline runtime

Use the actual game runtime.

Default baseline:
- **390×844** primary portrait viewport;
- normal/default state relevant to the target screen.

Capture additional evidence only when the changed risk requires it:
- 360×800 for compact-layout issues;
- 412×915 for tall/wide portrait issues;
- blocked/error/selected/combat-animation states only when those states are being changed or are suspected to regress.

Do not build a screenshot matrix by default.

### Gate 2 — UX audit

Answer only what is needed for the slice:
- where is the player and what is the primary goal/action;
- what must always remain visible;
- what is blocked and why;
- what existing presentation should be kept;
- what can be hidden/deferred.

Classify visible elements as `KEEP`, `REFINE`, `HIDE/DEFER`, `REMOVE`, or `DO NOT TOUCH`.

### Gate 3 — Narrow brief

Normally use no more than 3 primary visual/UX goals.

State:
- problem;
- preserved behavior;
- intended visual change;
- explicit out-of-scope items;
- screenshot-visible acceptance criteria.

### Gate 4 — Candidate implementation

Patch the smallest presentation layer that solves the brief.

Rules:
- preserve backend/runtime/save authority;
- do not invent UI-owned gameplay state;
- avoid new global CSS override layers;
- preserve portrait shell/accessibility basics;
- prefer existing production assets/components.

Status becomes `CANDIDATE`.

### Gate 5 — Automated proof

Run targeted tests only when useful, then rely on unified **Game CI**:
- Backend Fast;
- Frontend Fast;
- real-browser Runtime Smoke;
- exact-SHA runtime screenshots/report artifact.

The Runtime Smoke artifact is the normal visual proof. It already checks the real production URL, missing images, horizontal overflow, runtime/browser errors and representative interaction journeys.

Deep `qa/visual/` showcase capture is **on demand only**. Do not automatically capture all skills, all shake phases, all viewports, or every transient state after each UI commit.

### Gate 6 — User visual approval

Show the user the real runtime candidate.

Default review package:
- primary 390×844 screenshot for the changed screen/state;
- one concise note on what changed;
- extra viewport/state only if the change is actually layout-sensitive or the user asks to inspect it.

If rejected, patch and repeat Gate 5/6. Only explicit approval moves the slice to `APPROVED`.

### Gate 7 — Closure

Only after `APPROVED`:
1. create `[closure]` commit;
2. Game CI Fast + Runtime Smoke run normally;
3. Canonical Closure QA runs automatically for the closure commit;
4. confirm performance hard locks remain unchanged;
5. update `CURRENT_CHECKPOINT.md`;
6. mark the slice `LOCKED`.

## 4. Visual evidence policy

Valid:
- screenshot/video from current real runtime;
- screenshots exported by Game CI Runtime Smoke;
- deliberate on-demand deep capture from `qa/visual/` when a specific visual risk needs it.

Invalid:
- reconstructed mock;
- partial HTML/CSS imitation;
- concept image presented as implemented UI;
- screenshot from a different candidate SHA.

## 5. Efficiency rule

Proof depth must match risk.

Normal UI commit:
`390×844 real runtime + representative interaction`

Responsive/layout-sensitive commit:
`390×844 + only the compact/tall viewport needed to test the changed breakpoint`

Animation/transient-state defect:
`only the affected state/skill/effect frames`

Do not generate large frame matrices unless the task explicitly requires a full visual audit.

## 6. Working cadence

`source snapshot -> baseline -> audit -> narrow brief -> candidate patch -> Game CI -> runtime screenshot review -> iterate -> user approval -> [closure] -> Canonical QA -> checkpoint`
