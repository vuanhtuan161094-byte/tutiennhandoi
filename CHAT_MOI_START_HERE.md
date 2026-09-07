# CHAT MỚI — START HERE

Source of truth is the current HEAD of branch:

`feature/reincarnation-cultivation-r3`

Read `CURRENT_CHECKPOINT.md` immediately after this file. Do not use the old V141 handoff instruction that said Luân Hồi had not been coded yet; this feature branch has moved past that point.

## Current state

- V141 codebase optimization baseline: CLOSED.
- V140 Tu Luyện V2: canonical and preserved.
- Luân Hồi V4: current feature work exists in source; continue from live implementation rather than restarting from old design notes.
- **Săn Yêu × Tu Luyện V140: CLOSED / PASS.**
- No merge to `main` unless the user explicitly requests it.

## Canonical Tu Luyện contract

`Tu Vi nền + valid sources → Tự Tu / Bế Quan → auto minor realm → deterministic Thăng Cảnh / Thiên Kiếp gate`

Do not restore retired cultivation mechanics simply because old tests/docs mention them.

## Săn Yêu closure — do not reopen by default

The closed Hunt contract is:

- 28 major-realm Hunt maps, Luyện Khí → Sáng Thế Chủ.
- 800 floors per major realm (`8 vực × 100 tầng`).
- one real Boss per floor; Boss victory opens the next floor.
- cleared floors become Săn Ảo farm floors.
- real Boss combat uses CombatKernel V2.
- actual Săn Ảo settlement uses one representative CombatKernel V2 simulation to establish TTK, then aggregates the time batch O(1).
- Săn Ảo preview is telemetry only and now includes current generic outgoing Damage% such as Chiến Mệnh; Boss-only Damage% does not boost ordinary Săn Ảo.
- Săn Yêu grants **no direct Tu Vi**.
- Tu Luyện V140 runs **100% in parallel** while Săn Ảo runs.
- farm rewards include Linh Thạch, Yêu Đan/beast-core and equipment; Tài Mệnh affects actual Linh Thạch settlement.
- difficulty/reward progression is locked against reset/regression across zone boundaries.

Dedicated gate:

`node qa/tests/v141-hunt-cultivation-closure-test.js`

Hunt closure code checkpoint `0e93a012bfb8c580726744f854a8004b7358261b` passed full canonical GitHub Actions run `34087108557`, including V140 core/transport/zero-legacy, Hunt closure, backend fast/full and frontend fast/full.

## Read next

1. `CURRENT_CHECKPOINT.md`
2. `NEXT_CHAT_TASKS.md`
3. relevant live source for the subsystem the user asks to continue
4. `V141_CODEBASE_OPTIMIZATION_CLOSURE_REPORT.md` only when structural history is needed
5. `V140_CULTIVATION_CLOSURE_REPORT.md` / `docs/CULTIVATION_V140_BALANCE.csv` when cultivation pacing is relevant

## Working rule for next chat

Do not automatically audit every remaining system in sequence. Work module-by-module from the user's newest request. When touching a system, inspect backend + frontend + save + economy/content consumers + targeted tests together. Preserve Săn Yêu closure unless the requested feature genuinely needs an explicit integration change.
