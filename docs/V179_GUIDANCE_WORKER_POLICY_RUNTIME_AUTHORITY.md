# V179 — Guidance Worker Policy Runtime Authority

Status: **CLOSED / LOCKED**

## Finding

The Guidance main decision planner honored automation policy, but the pre-loop auto-assignment helper for Phân Thân dungeon workers did not.

`recommendGuidanceWorkerAssignments()` could assign an idle worker before the main Guidance decision loop even when the player had configured:

- dungeon automation disabled through `allowedActivityTypes`,
- a dungeon in `blockedDungeonIds`, or
- current injury above `automationPolicy.maxInjury`.

This was a real live mutation path: `runGuidance()` could change `state.dungeons.assignments` despite an explicit safety/policy block.

## Runtime authority

Worker auto-assignment must obey the same normalized automation policy as the rest of Guidance:

- no worker dungeon assignment when `dungeon` is not allowed;
- no assignment into a blocked dungeon;
- no automatic assignment while injury exceeds `maxInjury`;
- valid allowed assignments preserve the existing scoring/ranking behavior.

## Runtime fix

- `8c9cc37088014841e483897f3bfc66f3aa91f3c9` — `fix: V179 enforce guidance worker automation policy`

The patch stays inside the existing Guidance helper and does not alter dungeon scores, goal priorities, rewards, worker efficiency or other balance values.

## Targeted proof

- `de3c2b84a90cda5d155622fcf01c934e16549b79` — `test: prove V179 guidance worker policy authority`
- Guard: `qa/tests/v179-guidance-worker-policy-runtime-authority-test.js`
- Proof covers both helper-level policy behavior and live `runGuidance()` mutation behavior with a real Phân Thân worker.
- Negative cases prove blocked/safety policy cannot create an assignment.
- Positive case proves an allowed assignment still works.

## QA

- Fast candidate: `fef322900b1cfc2bb126bb4ccb2f339820c663ba`
- Fast QA run `34735361470` — **SUCCESS**
  - Backend Fast: **25/25 PASS**
  - Frontend Fast: **6/6 PASS**
  - frontend performance lock unchanged.
- Closure commit: `dd3930371ee58ee4d9e35cfdfc2a253a64efe15d`
- Canonical QA run `34735478253` — **SUCCESS**
  - Backend closure: **119/119 PASS**
  - Frontend closure: **20/20 PASS**

No gameplay balance, dungeon reward, worker strength, automation score or pacing value changed in V179.
