# V175 — Social Family Identity Runtime Authority

Status: **CLOSED / LOCKED**

## Proven runtime finding

Social child identity had two persisted authorities:

- allocated child IDs in `state.social.familyMembers[].id`, formatted as `family.child.<lifeId>.<serial>`;
- `state.social.familySerial`, used directly by `createChildForLife()` as the next identity serial.

A restored save could retain an already allocated child ID while carrying a lower `familySerial`. The next live child creation would then reuse an existing ID. This is an impossible identity state under normal monotonic runtime allocation and a real restore-to-consumer collision risk.

## Fix

`dist/core/social.js` now treats already allocated child IDs as durable lower-bound evidence for the next family serial:

- derive the highest safe allocated child serial and require `familySerial >= highest + 1`;
- preserve any legitimate higher saved serial;
- ignore malformed/unrelated IDs as authority;
- normalize at Social clone/restore boundary;
- defensively normalize immediately before `createChildForLife()` allocates a new ID.

The patch does **not** renumber or remove family members and changes no Social reward, stat, bond, relationship, lifespan, pacing, probability, or other balance value.

## Targeted proof

`qa/tests/v175-social-family-identity-runtime-authority-test.js` locks five cases:

1. stale serial repairs from an allocated child ID;
2. highest allocated serial across multiple lives wins;
3. a legitimate higher saved serial is preserved;
4. malformed/unrelated family IDs cannot forge serial authority;
5. `SimulationSession.restore()` repairs the serial before the real `createChildForLife()` identity consumer is invoked, and the next child ID remains unique.

## QA evidence

- Runtime fix: `646d925c9ed08750ad03b7932d3de84961b1c6ab`
- Targeted proof: `3ef41b447b4438a2e01e6baf7135636faddee089`
- Runtime candidate / Fast gate wiring: `48dc4f33716a8ad4d0cbe86b9f227b2f3ce73bb1`
- Fast QA: `34700817822` — SUCCESS
  - Backend: 21/21 PASS
  - Frontend: 6/6 PASS
- Closure commit: `d3858711bd95822b3a2894b820dcfc40598b8fed`
- Canonical QA: `34700863946` — SUCCESS
  - locked baseline V140–V151 PASS
  - locked authorities V152–V159 PASS
  - V160–V169 closure steps PASS
  - Backend closure PASS
  - Frontend closure PASS

## Audit exclusions

During V175 discovery, two suspected lanes were explicitly audited and **not patched**:

- Hunt → Alchemy V146 first-clear mirror: `settleAlchemyHuntRewardsV146()` has no current caller in the production runtime; current Hunt awards Yêu Đan through the Hunt lane, so no live authority bug was proven.
- PvP season payout: season progression plus the V89 `progressionAwardedIds` key already provides idempotent settlement evidence; no replay bug was proven.

Do not reopen these lanes without a new concrete runtime regression.
