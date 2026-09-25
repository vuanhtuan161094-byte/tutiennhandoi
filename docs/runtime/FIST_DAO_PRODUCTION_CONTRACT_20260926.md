# FIST DAO PRODUCTION CONTRACT — 2026-09-26

Status: **DESIGN LOCK / IMPLEMENTATION OPEN**

Repository: `vuanhtuan161094-byte/tutiennhandoi`  
Branch: `main`  
Parent authority: Sword A–F five-stat foundation CLOSED / LOCKED.

This document replaces piecemeal Fist design decisions. Quyền must be implemented against this whole contract, then tuned from deterministic runtime evidence.

## 1. Identity

Quyền Đạo is a **close-range pressure / Break / counter bruiser**.

It wins by:

1. building **Quyền Thế** quickly;
2. maintaining **Liên Kình** over a long exchange;
3. creating a short interrupt/stagger window;
4. forcing **Thất Thế** through Break;
5. cashing Quyền Thế into a heavy hit or finisher.

Quyền is **not** the primary hard-CC Dao. Thần Niệm remains the main control Dao.

Quyền must never gain:

- long stun chains;
- root;
- silence;
- suppression;
- generic TPH Action Speed;
- generic TT damage scaling;
- hidden Crit from CL.

## 2. Primary-stat identity

Five primary stats remain exactly CL / TP / TPH / LL / TT.

For Quyền:

- **CL** — primary damage stat for the whole Dao.
- **TP** — heavy strike / body force / counter-bruiser secondary stat.
- **TPH** — fast combo / reaction / counter secondary stat.
- **LL** — CN capacity only unless a future skill explicitly says otherwise.
- **TT** — Accuracy / Control / Resolve utility; not a generic Quyền damage stat.

Three production archetypes:

- **Trọng Quyền** — CL + TP.
- **Liên Hoàn** — CL + TPH.
- **Phản Quyền** — CL + TP + TPH.

## 3. Two separate resources

### 3.1 Quyền Thế — main-Dao core

Runtime field remains `fistForce` for compatibility. Player-facing name is always **Quyền Thế**.

Normal cap: **5**.

Quyền Thế is short-cycle combat momentum. It is generated/spent explicitly by skills; do not show the obsolete player-facing term “Liên Quyền”.

Base state bonus while held:

- +3% Skill Quyền direct damage per point;
- +4% Break per point.

At 5, **Trọng Thế** is armed.

Trọng Thế applies only to a tagged heavy payoff action:
- Băng Sơn Trọng Quyền;
- Trấn Nhạc Áp Quyền;
- Phá Quân Quyết;
- Cửu Thiên Trấn Ngục Quyền.

It must not be consumed by Tam Hoàn / Liệt Địa / Hồi Thân merely because they are damaging Actives.

When a valid payoff starts at 5:
- +35% effect;
- +35% Break;
- the action consumes at least 3 Quyền Thế, or its authored larger spend.

### 3.2 Liên Kình — passive long-cycle stack

Liên Kình remains a separate passive stack.

Base:
- cap 20;
- duration 12s;
- after expiry, decay 1 stack/s;
- new stack refreshes duration;
- carries across Hunt kills.

p5 may raise cap to 30.

Do not merge Liên Kình with Quyền Thế in UI, save or Auto logic.

## 4. CC contract for Quyền

Quyền owns **brief disruption**, not sustained hard control.

### 4.1 Chấn Nhịp — Interrupt

Primary owner: **Chấn Mạch Khai Sơn**.

If the target is casting/channeling and is not Control-immune:
- cancel the current cast/channel;
- apply a short BodyControl stagger with base duration **0.35s**.

The 0.35s duration is resolved by the canonical Control vs Resolve contest and Control Pressure.

This is not a guaranteed long stun.

### 4.2 Phản Chấn — counter stagger

Primary owner: **Hồi Thân Phản Quyền**.

On a successful counter:
- apply BodyControl stagger, base **0.40s**;
- resolved through Control vs Resolve and the same-group pressure rules.

### 4.3 Trấn Áp — soft control

Primary owner: **Trấn Nhạc Áp Quyền**.

Base debuff:
- -12% Mobility;
- +12% recovery time;
- 3s.

This is non-disabling soft control. It does not become root/stun/silence.

Mastery may strengthen it, but must not turn it into long hard CC.

### 4.4 Break is not CC

Thất Thế remains a Break vulnerability state. It is not renamed to stun and does not bypass the canonical control system.

## 5. Ten-skill production kit

### 5.1 Khai Sơn Quyền Thức — Basic

Role: generator / steady pressure.

- Cost: zero.
- Quyền Thế: +1 on successful root damage.
- Gauge: keep current Basic cadence.
- Damage identity: CL-dominant with light TP contribution.
- No CC.

Mastery:
- 100: 20% chance for a 55% follow-up punch.
- 250: follow-up also grants +1 Quyền Thế.
- 500: at 5 Quyền Thế, every third Basic creates 65% shockwave.
- 750: consecutive Basic hits reduce next Basic recovery by 0.15s.
- 1000: Cực Ý · Tam Điệp Kình — every third Basic becomes 100% + 65% + 65%.

Candidate five-stat family: **CL + TP**.

### 5.2 Tam Hoàn Liên Kình

Role: fast combo / Liên Hoàn generator.

- 3-hit combo.
- Quyền Thế: +1 per root cast, not per hit.
- No hard CC.
- Candidate family: **CL + TPH**.

Mastery:
- 100: third hit +20%.
- 250: at >=3 Quyền Thế add hit 4 = 40%.
- 500: hit 4 becomes 70% and can Hội Tâm.
- 750: at 5 Quyền Thế cooldown becomes 2.4s.
- 1000: 4 hits; final hit 110% and +25% Break.

### 5.3 Chấn Mạch Khai Sơn

Role: interrupt / Break setup.

- Quyền Thế: +1.
- Has real **Chấn Nhịp** Interrupt.
- Base Break-heavy damage.
- Candidate family: **CL + TPH**.

Mastery:
- 100: Break +20%.
- 250: if target not Thất Thế, +15% additional Break.
- 500: if this skill causes Thất Thế, target takes +10% direct damage for 4s.
- 750: recovery 0.65s.
- 1000: at 5 Quyền Thế may consume 2; damage ×1.4 and Break ×1.4.

### 5.4 Tàng Kình Dưỡng Thế

Role: deliberate setup / resource recovery.

- low damage;
- Quyền Thế: +2 on completed cast.
- No CC.
- Candidate family: **CL + TP**, intentionally low damage importance.

Mastery:
- 100: cast 1.30s.
- 250: completed cast grants +3 Quyền Thế instead.
- 500: after cast +18% Skill Quyền damage for 4s.
- 750: cast 1.05s.
- 1000: if starting at 0–1 Quyền Thế, completed cast sets Quyền Thế to 5.

### 5.5 Băng Sơn Trọng Quyền

Role: primary heavy spender / Break.

- Requires >=2 Quyền Thế.
- Base spend: 2.
- Trọng Thế valid payoff.
- Candidate family: **CL + TP**.

Mastery:
- 100: damage +15%.
- 250: spending full 2 gives +20% Break.
- 500: if starting at 5, may spend 3 for an additional 80% hit.
- 750: cast 0.75s.
- 1000: Băng Sơn Song Trọng — 265% + 130%; final hit +35% Break.

### 5.6 Hồi Thân Phản Quyền

Role: reactive counter / bruiser sustain.

- On successful counter: +2 Quyền Thế.
- Applies **Phản Chấn** stagger 0.40s.
- Candidate family: **CL + TP + TPH**.

Mastery:
- 100: successful counter +20% damage.
- 250: successful counter heals 4% Max HP.
- 500: successful counter grants +3 Quyền Thế instead.
- 750: recovery 0.50s.
- 1000: at <=30% HP, successful counter grants shield = 12% Max HP for 3s.

### 5.7 Liệt Địa Liên Hoàn

Role: sustained combo / maintain pressure.

- Multi-hit combo.
- Quyền Thế: +1 per root cast.
- Does not consume Trọng Thế merely for being damaging.
- Candidate family: **CL + TPH**.

Mastery:
- 100: final hit +20%.
- 250: at >=3 Quyền Thế final hit +20% Break.
- 500: at 5 Quyền Thế add a 75% heavy hit.
- 750: recovery 0.70s.
- 1000: Liệt Địa Ngũ Hoàn — 5 hits; final hit 125%; end with at least 2 Quyền Thế.

### 5.8 Trấn Nhạc Áp Quyền

Role: Break / soft-control setup.

- Quyền Thế: +1 in normal form.
- Applies **Trấn Áp**: -12% Mobility, +12% recovery time, 3s.
- Trọng Thế valid payoff.
- Candidate family: **CL + TP**.

Mastery:
- 100: Break +15%.
- 250: target already Thất Thế => +15% damage.
- 500: at >=4 Quyền Thế, target Defense -10% for 4s.
- 750: cast 0.70s.
- 1000: starting at 5 consumes 2; Break ×1.5; Defense -18% for 5s; Trấn Áp becomes -18% Mobility / +18% recovery for 4s.

### 5.9 Phá Quân Quyết

Role: finisher / consume stored momentum.

- Minimum 1 Quyền Thế.
- Spend all current Quyền Thế, capped at 5 outside special Ultimate field.
- Trọng Thế valid payoff.
- Candidate family: **CL + TP**.

Mastery:
- 100: each Quyền Thế spent adds +5% authored coefficient.
- 250: target Thất Thế => +20% damage.
- 500: spend >=4 => +15% skill-specific Armor Pen.
- 750: recovery 0.80s.
- 1000: Phá Quân Tận Kình — spend up to 5; final hit has 1.5× Hội Tâm power.

### 5.10 Cửu Thiên Trấn Ngục Quyền — Ultimate

Role: unavoidable ultimate payoff / temporary Quyền domain.

- Ultimate Gauge cost: 100.
- Unavoidable.
- Consumes current Quyền Thế for authored payoff.
- Trọng Thế valid payoff.
- No added hard CC.
- Candidate family: **CL + TP**.

Mastery:
- 100: base 640% → 700%.
- 250: each current Quyền Thế adds +12% coefficient.
- 500: at 5 Quyền Thế add 160% finishing hit.
- 750: recovery 1.10s.
- 1000: **Cửu Thiên Quyền Vực** 4s:
  - Quyền Thế cap +2;
  - each successful root Skill Quyền generates +1 additional Quyền Thế;
  - this does not grant permanent cap and does not turn every hit into a resource event.

## 6. Eight-passive production contract

### p1 — Liên Kình Quyết

Purpose: unlock the long-cycle Liên Kình engine.

- each eligible damaging root action: +1 Liên Kình;
- >=10: +5% → +10% Break;
- >=20: +8% → +15% direct damage.

The old authored p1 text that also claimed Max HP / Defense per stack is treated as stale duplicate copy and should be removed. Defensive stacking belongs to p4.

### p2 — Dưỡng Kình Chân Kinh

Each eligible damaging root action has:
- Lv1 10%;
- Lv20 30%;
chance to gain one additional Liên Kình.

### p3 — Liên Kình Trường Tồn

- +2s → +8s duration;
- high mastery slows decay to 1 stack / 2s.

### p4 — Hùng Kình Hộ Thể

Each Liên Kình:
- Lv1 +0.15% Defense;
- Lv20 +0.50% Defense.

Already implemented as Q1 correctness repair.

### p5 — Quyền Tâm Vô Cực

Liên Kình cap:
- +2 → +10.

### p6 — Áp Thế Chân Ý

Per 10 Liên Kình:
- +4% → +12% Break.

### p7 — Trọng Kình Lăng Thiên

At Liên Kình >=20:
- +10% → +35% direct damage.

### p8 — Liên Kình Bất Tuyệt

At Liên Kình cap:
- +10% → +30% direct damage;
- up to +20% Ultimate Gauge gain;
- damaging root actions refresh peak-state hold by 1s → 2s.

## 7. Candidate five-stat scaling map

This map locks **which stats each skill is allowed to use**. Exact numeric weights are balance knobs until the Q2/Q4 benchmark passes.

- Basic: CL + TP
- Triple: CL + TPH
- Shock: CL + TPH
- Nurture: CL + TP
- Heavy: CL + TP
- Counter: CL + TP + TPH
- Chain Heavy: CL + TPH
- Pressure: CL + TP
- Finisher: CL + TP
- Ultimate: CL + TP

TT is not permitted as generic Quyền damage scaling.
LL is not permitted as generic Quyền damage scaling.

Starting weight candidates for the first implementation benchmark:

- Basic: 2.20 CL + 0.60 TP
- Triple: 1.20 CL + 1.40 TPH
- Shock: 1.50 CL + 0.90 TPH
- Nurture: 0.70 CL + 0.80 TP
- Heavy: 1.70 CL + 1.50 TP
- Counter: 1.20 CL + 0.80 TP + 0.80 TPH
- Chain Heavy: 1.10 CL + 1.50 TPH
- Pressure: 1.50 CL + 1.20 TP
- Finisher: 1.80 CL + 1.40 TP
- Ultimate: 2.00 CL + 1.50 TP

These exact weights are **candidate implementation values**, not closure authority. Tune only from deterministic evidence.

## 8. Auto rotation contract

Priority intent:

1. If target is casting/channeling and Chấn Mạch is available → interrupt.
2. If a counter opportunity exists → Hồi Thân Phản Quyền.
3. If target is not Thất Thế → prioritize Chấn Mạch / Trấn Nhạc.
4. At 5 Quyền Thế → prefer valid Trọng Thế payoff, not a random combo skill.
5. Target Thất Thế + >=4 Quyền Thế → Phá Quân Quyết.
6. Gauge 100 + >=4 Quyền Thế → Ultimate may fire; Auto may hold briefly to reach 5 but must not hold indefinitely.
7. Low Quyền Thế → Tàng Kình / Tam Hoàn.
8. Liên Hoàn filler → Liệt Địa.
9. Basic fallback.

Auto must not spend Quyền Thế through obsolete `fistChain` metadata in a way that contradicts the production rules above.

## 9. Benchmark contract

Three fixed-budget profiles:

### Trọng Quyền
- CL + TP heavy;
- Heavy / Pressure / Finisher core.
- Relative sustained DPS reference: 100%.

### Liên Hoàn
- CL + TPH;
- Triple / Chain / Shock.
- Initial target band: **92–98%** of Trọng Quyền.

### Phản Quyền
- CL + TP + TPH;
- Counter / sustain / short disruption.
- Initial target band: **85–92%** of Trọng Quyền.

These are internal Quyền archetype targets, not cross-Dao rankings.

The harness must report:
- DPS;
- Break count/time;
- CN;
- Ultimate casts;
- Quyền Thế generation/spend/average;
- Liên Kình average/cap uptime;
- interrupt count;
- successful counter count;
- stagger/soft-control applications;
- casts and damage by skill.

## 10. Implementation order

Q1 — correctness debt:
- p4 Defense;
- terminology cleanup;
- p1 stale defensive copy cleanup;
- targeted guards.

Q2 — implement the ten-skill resource/CC contract and five-stat scaling map.

Q3 — parity:
- PvE;
- PvP snapshots;
- Hunt preview;
- offline/virtual Hunt;
- legacy NPC snapshots;
- Auto rotation.

Q4 — deterministic three-archetype benchmark and tuning.

Q5 — Fast + Full Clean closure.

Do not reopen Sword and do not mix Tri Kỷ rebalance into this slice.
