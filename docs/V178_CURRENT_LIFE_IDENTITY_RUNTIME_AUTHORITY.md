# V178 — Current-Life Identity Runtime Authority

Status: **CLOSED / LOCKED**

## Finding

`currentLife.lifeNumber` and `currentLife.lifeId` were restored as independent saved fields even though live runtime authors the deterministic identity `life.<lifeNumber>`.

A stale/mismatched `lifeId` could therefore disconnect otherwise valid current-life consumers after restore. The concrete failure was proven against live Faction membership and the V176 first-life settlement authority: canonical state remained present, but consumers keyed by `currentLife.lifeId` could no longer find it.

## Runtime authority

- A valid positive integer `lifeNumber` is the canonical authority for the deterministic current-life ID `life.<lifeNumber>`.
- If `lifeNumber` is missing/invalid but `lifeId` is already canonical (`life.<positive integer>`), the number may be recovered from that ID.
- A valid matching identity is preserved unchanged.
- If neither side carries valid canonical evidence, V178 does not invent a new identity.
- Repair runs during restore before current-life keyed consumers execute.

## Runtime fix

- `ee4b7487ba6846dfd764d3c4fb8c54c9f0573dcb` — `fix: V178 canonicalize current-life runtime identity`

## Targeted proof

- `01b830f742a0bcd4538cd8357b9c0a6f4faff12b` — `test: prove V178 current-life identity authority`
- Guard: `qa/tests/v178-current-life-identity-runtime-authority-test.js`
- 6 cases, including full `SimulationSession.restore()` into:
  - live `factionMembership()` consumer;
  - V176 first-life one-shot settlement replay protection.

## QA

V178 was included in the shared V178/V179 candidate and closure:

- Fast candidate: `fef322900b1cfc2bb126bb4ccb2f339820c663ba`
- Fast QA run `34735361470` — **SUCCESS**
  - Backend Fast: **25/25 PASS**
  - Frontend Fast: **6/6 PASS**
  - frontend performance lock unchanged.
- Closure commit: `dd3930371ee58ee4d9e35cfdfc2a253a64efe15d`
- Canonical QA run `34735478253` — **SUCCESS**
  - Backend closure: **119/119 PASS**
  - Frontend closure: **20/20 PASS**

No gameplay balance, reward, pacing or authored content values changed in V178.
