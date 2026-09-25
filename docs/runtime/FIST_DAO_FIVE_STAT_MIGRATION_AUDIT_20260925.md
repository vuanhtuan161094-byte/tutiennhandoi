# FIST DAO — FIVE-STAT MIGRATION AUDIT — 2026-09-25

Status: **OPEN / AUDIT LOCKED / NO PRODUCTION SCALING CHANGE YET**

Repository: `vuanhtuan161094-byte/tutiennhandoi`  
Branch: `main`  
Parent foundation: Sword A–F five-stat migration CLOSED / LOCKED.

## 1. Scope

This slice migrates **Quyền Đạo** only.

Do not reopen Sword F. Do not migrate Thể / Pháp / Độc / Ngự Khí / Trận / Thần Niệm inside this slice.

The five primary stats remain exactly:

- CL — Công Lực;
- TP — Thể Phách;
- TPH — Thân Pháp;
- LL — Linh Lực;
- TT — Thần Thức.

## 2. Current production content

Quyền currently has exactly **10 skills**:

1. Khai Sơn Quyền Thức — Basic
2. Tam Hoàn Liên Kình
3. Chấn Mạch Khai Sơn
4. Tàng Kình Dưỡng Thế
5. Băng Sơn Trọng Quyền
6. Hồi Thân Phản Quyền
7. Liệt Địa Liên Hoàn
8. Trấn Nhạc Áp Quyền
9. Phá Quân Quyết
10. Cửu Thiên Trấn Ngục Quyền — Ultimate

It also has **8 passives** and mastery milestones at 100 / 250 / 500 / 750 / 1000 for all 10 skills.

## 3. Terminology / resource authority

Current source mixes old labels `Liên Quyền`, metadata resource `fistChain`, runtime field `fistForce`, and passive stack `Liên Kình`.

Production terminology for the migration is:

### Quyền Thế — core resource

Runtime authority: `battleDaoStateV2.fist.core.fistForce`.

- main-Dao only;
- normal cap 5;
- every successful damaging root action gains +1;
- current value grants +3% outgoing damage per point;
- current value grants +4% Break per point;
- at 5, the next damaging Active receives +35% effect and +35% Break, then consumes 3 before the action resolves;
- the action may then rebuild Quyền Thế through the normal successful-root gain.

Player-facing copy should use **Quyền Thế**, not Liên Quyền.

### Liên Kình — passive stack

Runtime authority: `battleDaoStateV2.fist.stack`.

This is separate from Quyền Thế.

- requires passive p1;
- base cap 20;
- p5 raises cap by +2 → +10;
- base duration 12s;
- after expiry it decays 1 stack/s; p3 extends duration and can slow decay to 1 stack/2s;
- each eligible damaging root action gains +1;
- p2 gives 10% → 30% chance for one extra stack;
- learned Secondary Quyền passives may build/use Liên Kình without granting Quyền Active/Core.

Do not merge Quyền Thế and Liên Kình.

## 4. Current passive behavior

Implemented runtime behavior:

- p1 Liên Kình Quyết:
  - at >=10 Liên Kình: +5% → +10% Break;
  - at >=20: +8% → +15% direct damage.
- p2 Dưỡng Kình Chân Kinh: 10% → 30% chance for +1 extra Liên Kình.
- p3 Liên Kình Trường Tồn: duration / decay tuning.
- p5 Quyền Tâm Vô Cực: +2 → +10 stack cap.
- p6 Áp Thế Chân Ý: +4% → +12% Break per 10 stacks.
- p7 Trọng Kình Lăng Thiên: at >=20, +10% → +35% direct damage.
- p8 Liên Kình Bất Tuyệt: at stack cap, +10% → +30% direct damage, up to +20% Gauge gain, and refreshes peak-state duration.

### Proven missing mechanic

p4 **Hùng Kình Hộ Thể** is authored as additional Defense per Liên Kình:

- Lv1: +0.15% Defense / stack;
- Lv20: +0.50% Defense / stack.

No canonical runtime consumer currently reads `passive.v2.fist.p4` / Hùng Kình Hộ Thể in `stats.js`, `combat-rules.js`, `combat.js`, or `battle-dao-v2-runtime.js`.

This is a real implementation gap and belongs in the Quyền slice.

## 5. Chân Nguyên authority

Quyền skills still use legacy cost classes `low / medium / high`.

This is **not** a Max-CN percentage bug: the cost-class authority resolves against **Chân Nguyên Chuẩn**, while regeneration also uses Chân Nguyên Chuẩn rather than Max CN.

Therefore LL still increases the usable CN pool without automatically increasing the absolute cost from Max CN.

Decision for this slice:

- do not convert Quyền to flat CN merely for five-stat compatibility;
- keep standard-cost authority unless benchmark evidence justifies a separate resource redesign.

## 6. Five-stat identity for Quyền

Role lock before coefficients:

- **CL is the dominant offensive stat.**
- **TP is the secondary stat for Trọng Quyền / chịu lực / heavy-counter identity.**
- **TPH is the secondary stat for Liên Hoàn / phản quyền / fast-combo identity.**
- **LL remains resource capacity only** unless a skill explicitly uses CN as a mechanic.
- **TT is utility (Accuracy / Control / Resolve), not a generic Quyền damage stat.**

Do not add hidden Action Speed from TPH.
Do not add hidden Crit from CL.
Do not give all Quyền skills one identical hybrid formula.

Candidate archetype families for benchmark:

- **Trọng Quyền:** CL + TP; heavy / break / finisher.
- **Liên Hoàn:** CL + TPH; triple / chain / fast pressure.
- **Phản Quyền:** CL + TP + TPH; counter / sustain-oriented pressure.

Exact coefficients and relative-DPS targets are **not locked yet**. They must be derived from deterministic CombatKernel V3 evidence rather than guessed.

## 7. Existing balance multiplier that must be re-audited

Current shared runtime still applies the old progression-aware Main-Dao output calibration:

- Fist midgame anchor: 1.10
- Fist endgame anchor: 0.84

These values were calibrated before the five-stat migration.

Do not silently delete them, but do not assume they remain correct after Quyền gains TP/TPH scaling. The Quyền benchmark must explicitly measure them.

## 8. Migration order

Q1 — close current Quyền correctness debt:
- implement p4 Defense-per-Liên-Kình;
- normalize player-facing resource terminology to Quyền Thế vs Liên Kình;
- targeted regression guard.

Q2 — add five-stat scaling metadata to the 10 Quyền skills:
- preserve authored mastery extra hits and Break behavior;
- no resource redesign unless evidence requires it.

Q3 — parity audit:
- PvE / PvP synthetic scaling;
- Hunt preview / offline;
- legacy NPC fallback;
- Auto rotation `fistForce` conditions.

Q4 — deterministic Quyền balance harness:
- Trọng Quyền;
- Liên Hoàn;
- Phản Quyền;
- fixed allocation budget and deterministic seed matrix;
- report DPS, Break, CN, Quyền Thế, Liên Kình, Ultimate cadence, per-skill casts/damage.

Q5 — tune only from evidence, then Fast + Full Clean closure.

## 9. Non-goals

- no Tri Kỷ rebalance in this slice;
- no element redesign;
- no new sixth stat;
- no Sword retune;
- no visual/VFX work;
- no migration of the other six remaining Dao.


## 10. Production contract supersession — 2026-09-26

The piecemeal audit above is superseded for design intent by:

`docs/runtime/FIST_DAO_PRODUCTION_CONTRACT_20260926.md`

Important correction discovered during consolidation:

- p1 Liên Kình Quyết old copy also claimed Max HP / Defense per stack, but canonical runtime did not implement those lines;
- the production contract treats those p1 defensive lines as stale duplicate copy because p4 Hùng Kình Hộ Thể is the dedicated Defense-per-stack passive;
- therefore Q1 should remove the stale p1 defensive text rather than silently add a second overlapping Defense/Max-HP engine.

CC is now explicitly part of the Quyền production contract:
- Chấn Mạch = short interrupt/stagger;
- Hồi Thân = successful-counter stagger;
- Trấn Nhạc = non-disabling soft control;
- no root/silence/suppression/long stun.
