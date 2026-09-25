# SWORD DAO F — FIVE-STAT MIGRATION CLOSURE — 2026-09-25

Status: **CLOSED / LOCKED**

Repository: `vuanhtuan161094-byte/tutiennhandoi`  
Branch: `main`  
Exact verified gameplay SHA: `edf479ff465c262d105020d96dc23a31ba7b66c1`

## 1. Closure scope

This closes Sword Production V1 slice F:

- five-axis Potential and one-time legacy refund;
- CL / TP / TPH / LL / TT combat derivation;
- Mobility↔Accuracy Dodge authority;
- Control↔Resolve duration contest and pressure reset;
- Sword per-skill five-stat scaling;
- PvE / PvP / Hunt / offline / legacy-combatant parity;
- Character five-stat read models;
- F6 production rebalance for Trọng Trảm / Lưu Quang / Ngự Kiếm.

Sword A–E remain locked and were not reopened by this closure.

## 2. Final production stat model

Primary stats:

- Công Lực (CL)
- Thể Phách (TP)
- Thân Pháp (TPH)
- Linh Lực (LL)
- Thần Thức (TT)

No sixth primary stat, no Physical/Magic split, no hidden Realm damage multiplier, no global Action Speed from TPH, and no hidden Crit/CDR from the five primaries.

Old three-axis Potential saves use the locked one-time full refund from legitimate `lifetimeEarned`.

## 3. Final Sword F6 scaling

- Thanh Minh: 2.70 CL
- Lưu Quang: 1.35 CL + 1.55 TPH
- Tàng Phong: 1.50 CL
- Phá Vọng: 1.60 CL + 2.00 TT
- Liên Kiếm: 1.00 CL + 1.85 TPH
- Hồi Phong: 1.20 CL + 1.50 TPH
- Đoạn Cương: 3.00 CL
- Quyết Sinh: 2.10 CL + 2.00 TT
- Vạn Kiếm: 1.60 CL + 8.00 TT
- Đoạn Thiên: 2.10 CL + 2.00 TT

Vạn Kiếm Cực Ý uses 14 channel hits and the authored final-hit ×1.5 is applied by CombatKernel.

## 4. Deterministic F6 proof

Final user-local F6 benchmark:

- engine: `combat.v3`;
- duration: 180 seconds;
- seeds: 12;
- exactly 5 Sword Active slots + Basic + Ultimate;
- all 8 Sword passives Lv20;
- all Sword mastery tiers 1000.

Results:

| Profile | Mean DPS | Relative | Target | Result |
| --- | ---: | ---: | ---: | --- |
| Trọng Trảm | 1489.390 | 100.00% | 100% | PASS |
| Lưu Quang | 1346.763 | 90.42% | 90–95% | PASS |
| Ngự Kiếm | 1313.622 | 88.20% | 85–92% | PASS |

Resource health:

- Ultimate casts mean: 6 / 6 / 6;
- final CN mean: 118.794 / 120.175 / 121.804;
- OOM channel endings: 0 for all profiles.

No further Sword coefficient, CN, Kiếm Khí, Kiếm Ý or Gauge tuning is justified by the closure evidence.

## 5. Local QA proof

On exact SHA `edf479ff465c262d105020d96dc23a31ba7b66c1`:

- FAST: PASS;
- clean worktree: YES;
- exact-SHA evidence: YES;
- Backend Fast: PASS;
- Frontend Fast: PASS;
- Mode 5 FULL CLEAN: PASS;
- Full Clean steps: 30/30 PASS;
- deterministic browser runtime journey: PASS;
- strict browser summary: PASS;
- visual diagnostics that were still part of Mode 5 at this SHA: PASS.

Godot five-stat Character presentation had previously passed `KIEM_TRA_GAME.cmd`. No `godot/**` file changed from that verified Godot candidate through the final gameplay SHA, so the presentation tree is unchanged.

## 6. Lock rule

Sword F is now read-only unless one of these occurs:

1. a proven regression;
2. an explicitly requested Sword balance/design change;
3. a later cross-system migration that provides parity evidence and explicitly reopens the affected contract.

The next Dao must be migrated as a new independent slice. Do not use migration of another Dao to silently retune Sword.
