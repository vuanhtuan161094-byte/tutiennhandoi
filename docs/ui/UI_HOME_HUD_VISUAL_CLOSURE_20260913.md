# Home / Tu Luyện + App Shell / HUD — Visual Closure

Date: 2026-09-13

## Status

**APPROVED — awaiting Canonical QA at this closure commit before checkpoint lock.**

This note records the Workflow V2 visual approval gate for the Home / Tu Luyện and App Shell / HUD slice.

## Approved runtime candidate

- Candidate SHA before closure: `59006543e9f2b856b1e73dd61d7401abc633ba13`
- Fast QA run: `34749539482` — SUCCESS
- Runtime Visual Proof run: `34749539476` — SUCCESS
- Runtime artifact: `ui-visual-59006543e9f2b856b1e73dd61d7401abc633ba13`
- Viewports reviewed: `390×844`, `412×915`
- Baseline Character capture retained at `390×844`
- `mockOrReconstruction: false`
- No horizontal overflow in captured Home viewports.

## Runtime interaction proof

The visual runner performs a real interaction smoke on the production runtime fixture:

1. Render Home / Tu Luyện.
2. Click the Home side-rail `Linh Căn` entry.
3. Verify the canonical runtime transitions from `cultivation` to `roots`.
4. Verify the Linh Căn heading is rendered from the real runtime.
5. Return to Home before the second viewport capture.

The side rail proxies existing canonical `data-tab-jump` controls and does not own navigation, gameplay, save, or transport authority.

## Visual review result

User reviewed the exact runtime screenshots and explicitly accepted the result on 2026-09-13 (`t thấy ổn. bạn tự xem xem`). A second visual review of the exact runtime captures also found the slice suitable for closure.

Accepted characteristics:

- art-first cultivation scene with the character as the dominant focal point;
- clear realm/life identity hierarchy;
- integrated Tu Vi progress and primary cultivation CTA;
- functional side rails grounded in real routes;
- restrained HUD and five-destination bottom dock;
- no dashboard-card regression in the primary hero scene;
- readable 390 px portrait composition after the vitals-overlay adjustment.

Non-blocking polish observations retained for future global polish only:

- some secondary side-rail text can lose contrast over bright character hair/effects;
- the 390 px secondary label under `Chiến Đấu` can truncate.

These are not blocking defects and do not justify keeping this slice open.

## Authority / performance constraints

- V160–V179 runtime/save/gameplay authority remains CLOSED / LOCKED.
- No V180 runtime version is opened.
- Frontend static graph limits remain unchanged: ≤193 modules and ≤4.40 MiB.
- This closure is UI presentation / interaction-adapter scope only.

## Closure rule

This commit intentionally carries `[closure]` so Canonical QA must pass before `CURRENT_CHECKPOINT.md` marks Home / Tu Luyện and App Shell / HUD as LOCKED under Workflow V2.
