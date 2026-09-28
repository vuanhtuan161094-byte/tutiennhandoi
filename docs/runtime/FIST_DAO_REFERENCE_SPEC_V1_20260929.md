# FIST DAO REFERENCE SPEC V1 — 2026-09-29

Status: **GOLDEN REFERENCE / CLOSED / LOCKED**

Dao: **Quyền Đạo (`fist`)**  
System standard: `docs/runtime/DAO_SYSTEM_DESIGN_STANDARD_V1_20260929.md`  
Historical production contract: `docs/runtime/FIST_DAO_PRODUCTION_CONTRACT_20260926.md`

This reference reflects the **current main runtime/catalog/benchmark authority**. The historical Fist contract contains an earlier opening-status header; that stale header does not override the current CLOSED / LOCKED project state.

This file documents the locked system for future Dao design and regression comparison. It does not reopen Quyền tuning.

---

## 1. Authority / identity

Quyền is the **close-range pressure / Break / counter bruiser Dao**.

It wins by:
1. building short-cycle **Quyền Thế**;
2. maintaining long-cycle **Liên Kình**;
3. disrupting a cast/channel with a brief authored interrupt/stagger;
4. forcing **Thất Thế** through Break pressure;
5. cashing Quyền Thế into a heavy/finisher payoff.

Primary strengths:
- consistent close pressure;
- high Break access;
- legitimate reactive Counter archetype;
- TP-backed bruiser durability and TPH-backed chain options.

Tradeoffs:
- not the primary sustained hard-control Dao;
- Counter value depends on real target action windows;
- heavy payoff requires resource setup;
- utility archetypes intentionally give up some raw sustained DPS.

Forbidden drift:
- no long stun chains;
- no root/silence/suppression identity;
- no generic TPH → Action Speed;
- no generic TT → Quyền damage;
- no hidden Crit from CL;
- no merging Quyền Thế and Liên Kình into one resource.

---

## 2. Core loop

**`THẾ → KÌNH → TRỌNG`**

- **THẾ:** root Quyền actions establish short-cycle Quyền Thế.
- **KÌNH:** sustained damaging root actions maintain Liên Kình and long-fight pressure.
- **TRỌNG:** at high Quyền Thế, valid heavy payoff actions convert setup into damage/Break/finisher value.

The loop is measured through `fistForce` generation/spend, Liên Kình samples, Break events, heavy-payoff events, Counter successes and soft-control/interrupt events.

---

## 3. Resource / state model

### 3.1 Quyền Thế — Main-only core

Internal compatibility field: `fistForce`.  
Player-facing name: **Quyền Thế**.  
Normal cap: **5**.

While held:
- each Quyền Thế gives **+3% Skill Quyền direct damage**;
- each gives **+4% Break**.

At 5, **Trọng Thế** is armed.

Valid Trọng Thế payoff skills:
- Băng Sơn Trọng Quyền;
- Trấn Nhạc Áp Quyền;
- Phá Quân Quyết;
- Cửu Thiên Trấn Ngục Quyền.

A valid payoff starting at 5 receives the authored heavy bonus and spends the amount defined by that skill. Ordinary chain/counter skills must not accidentally consume Trọng Thế merely because they deal damage.

### 3.2 Liên Kình — long-cycle passive stack

Base state:
- cap 20;
- duration 12s;
- after expiry decay 1 stack/s;
- new eligible stack refreshes duration;
- carries across Hunt kills;
- p3 extends duration/slows decay;
- p5 may raise cap to 30;
- p8 owns the at-cap peak state.

Liên Kình is **not a spender**. It rewards sustained pressure and remains distinct from Quyền Thế in runtime, UI and Auto semantics.

### 3.3 Cửu Thiên Quyền Vực — temporary Ultimate state

At Ultimate Cực Ý, the authored domain lasts **4s**:
- temporary Quyền Thế cap +2;
- each successful root Skill Quyền gains one additional Quyền Thế during the window.

This is a temporary state, not a permanent core-cap increase and not a third persistent resource.

---

## 4. Realm unlock tree

| Order | Active | Passive |
|---:|---|---|
| 10 | Tam Hoàn Liên Kình | Liên Kình Quyết |
| 18 | Chấn Mạch Khai Sơn | Dưỡng Kình Chân Kinh |
| 34 | Tàng Kình Dưỡng Thế | Liên Kình Trường Tồn |
| 46 | Băng Sơn Trọng Quyền | Hùng Kình Hộ Thể |
| 62 | Hồi Thân Phản Quyền | Quyền Tâm Vô Cực |
| 74 | Liệt Địa Liên Hoàn | Áp Thế Chân Ý |
| 90 | Trấn Nhạc Áp Quyền | Trọng Kình Lăng Thiên |
| 102 | Phá Quân Quyết | Liên Kình Bất Tuyệt |

Basic and Ultimate remain separate. Endgame still equips only **5 Actives**.

---

## 5. Ten-skill production table

Quyền uses the shared cost-class model: `zero=0%`, `low=8%`, `medium=16%`, `high=28%` of standard CN, subject to canonical runtime modifiers/floors.

| Skill | Slot / Form | Cost | CD | Cast / Recovery | Five-stat production scaling | Loop role |
|---|---|---|---:|---|---|---|
| Khai Sơn Quyền Thức | Basic / Instant | zero | 0 | 0 / 1.00s | 2.20 CL + 0.60 TP | generator / pressure |
| Tam Hoàn Liên Kình | Active / Combo | low | 3s | 0.20 / 0.75s | 1.20 CL + 1.40 TPH | fast chain generator |
| Chấn Mạch Khai Sơn | Active / Instant | low | 5s | 0 / 0.80s | 1.50 CL + 0.90 TPH | interrupt / Break setup |
| Tàng Kình Dưỡng Thế | Active / Charge | low | 6s | 1.50 / 0.80s | 0.70 CL + 0.80 TP | deliberate setup |
| Băng Sơn Trọng Quyền | Active / Cast | medium | 8s | 1.00 / 0.95s | 1.70 CL + 1.50 TP | heavy spender / Break |
| Hồi Thân Phản Quyền | Active / Counter | low | 8s | 0 / 0.70s | 1.20 CL + 0.80 TP + 0.80 TPH | reactive counter / sustain |
| Liệt Địa Liên Hoàn | Active / Combo | medium | 8s | 0.45 / 0.90s | 1.10 CL + 1.50 TPH | sustained chain |
| Trấn Nhạc Áp Quyền | Active / Cast | medium | 9s | 0.90 / 0.90s | 1.50 CL + 1.20 TP | Break / soft-control setup |
| Phá Quân Quyết | Active / Finisher | high | 11s | 0.65 / 1.05s | 1.80 CL + 1.40 TP | all-in finisher |
| Cửu Thiên Trấn Ngục Quyền | Ultimate / Finisher | 100 Gauge | 0 | 1.00 / 1.40s | 2.00 CL + 1.50 TP | unavoidable climax / domain |

Multi-hit skills generate core/passive events per root action, not once per visible hit unless an explicit mastery rule says otherwise.

---

## 6. Skill mastery — locked five milestones

### Khai Sơn Quyền Thức
- 100: 20% chance for 55% follow-up punch.
- 250: follow-up also generates +1 Quyền Thế.
- 500: at 5 Quyền Thế every third Basic creates 65% shockwave.
- 750: consecutive Basic hits reduce next Basic recovery by 0.15s.
- 1000: **Cực Ý · Tam Điệp Kình** — every third Basic becomes 100% + 65% + 65%.

### Tam Hoàn Liên Kình
- 100: hit 3 +20% damage.
- 250: at >=3 Quyền Thế add hit 4 = 40%.
- 500: hit 4 becomes 70% and may Hội Tâm.
- 750: at 5 Quyền Thế cast CD becomes 2.4s.
- 1000: **Tam Hoàn Hóa Tứ Kình** — four hits; final hit 125% and +25% Break.

### Chấn Mạch Khai Sơn
- 100: Break +20%.
- 250: target not Broken → +15% additional Break.
- 500: if this skill causes Broken, target receives +10% direct damage for 4s.
- 750: recovery 0.65s.
- 1000: at 5 Quyền Thế consume 2; damage ×1.4 and Break ×1.4.

### Tàng Kình Dưỡng Thế
- 100: cast 1.30s.
- 250: completed cast generates +3 Quyền Thế.
- 500: completed cast grants +18% Skill Quyền damage for 4s.
- 750: cast 1.05s.
- 1000: if starting at 0–1 Quyền Thế, completed cast reaches 5.

### Băng Sơn Trọng Quyền
- 100: damage +15%.
- 250: full 2-Thế spend → +20% Break.
- 500: at 5 Quyền Thế may spend 3 for additional 80% hit.
- 750: cast 0.75s.
- 1000: **Băng Sơn Song Trọng** — 265% + 130%; final hit +35% Break.

### Hồi Thân Phản Quyền
- 100: successful Counter +20% damage.
- 250: successful Counter heals 4% Max HP.
- 500: successful Counter generates +3 Quyền Thế.
- 750: recovery 0.50s.
- 1000: at <=30% HP successful Counter grants 12% Max-HP shield for 3s.

### Liệt Địa Liên Hoàn
- 100: final hit +20% damage.
- 250: at >=3 Quyền Thế final hit +20% Break.
- 500: at 5 Quyền Thế add 75% heavy hit.
- 750: recovery 0.70s.
- 1000: **Liệt Địa Ngũ Hoàn** — five hits; final hit 125%; preserves at least 2 Quyền Thế under authored behavior.

### Trấn Nhạc Áp Quyền
- 100: Break +15%.
- 250: target already Broken → +15% damage.
- 500: at >=4 Quyền Thế apply Defense -10% for 4s.
- 750: cast 0.70s.
- 1000: starting at 5 spends 2; Break ×1.5; Defense -18% for 5s and stronger authored Trấn Áp.

### Phá Quân Quyết
- 100: each Quyền Thế spent adds +5% coefficient.
- 250: Broken target → +20% damage.
- 500: spend >=4 → +15% skill-local Xuyên.
- 750: recovery 0.80s.
- 1000: **Phá Quân Tận Kình** — spend up to 5; final hit has 1.5× Hội Tâm power.

### Cửu Thiên Trấn Ngục Quyền
- 100: base coefficient 640% → 700%.
- 250: each current Quyền Thế adds +12% coefficient.
- 500: at 5 Quyền Thế add 160% finishing hit.
- 750: recovery 1.10s.
- 1000: open **Cửu Thiên Quyền Vực** for 4s: Quyền Thế cap +2 and successful root Quyền actions generate +1 additional Quyền Thế.

---

## 7. Eight passives — locked package

| Passive | Core purpose | Lv1 → Lv20 direction |
|---|---|---|
| Liên Kình Quyết | open Liên Kình engine | 10 stacks Break 5%→10%; 20 stacks direct damage 8%→15% |
| Dưỡng Kình Chân Kinh | chance for extra Liên Kình | 10%→30% per eligible damaging root |
| Liên Kình Trường Tồn | duration/decay | +2s→+8s; high level slows decay to 1 stack / 2s |
| Hùng Kình Hộ Thể | bruiser defense from sustained chain | Defense +0.15%→+0.50% per stack |
| Quyền Tâm Vô Cực | raise Liên Kình cap | +2→+10 cap |
| Áp Thế Chân Ý | sustained Break scaling | +4%→+12% Break per 10 stacks |
| Trọng Kình Lăng Thiên | high-stack pressure | at >=20 stacks direct damage +10%→+35% |
| Liên Kình Bất Tuyệt | at-cap peak state | damage +10%→+30%; up to +20% Gauge gain; root damage refreshes peak hold 1s→2s |

Event ownership is important: damaging-root events refresh/gain state. Merely reading a bonus must not mutate Liên Kình timers.

---

## 8. Five-stat identity

Locked archetype families:
- **CL + TP:** Basic, Nurture, Heavy, Pressure, Finisher, Ultimate.
- **CL + TPH:** Triple, Shock, Chain Heavy.
- **CL + TP + TPH:** Counter.

TT remains valuable through global Accuracy/Control/Resolve but is not a generic Quyền damage family. LL remains Max CN capacity unless another explicit system applies.

This is the golden example of using TP/TPH to create two real secondary build axes without granting either a hidden global damage/action-speed rule.

---

## 9. Control / Break contract

Quyền owns **brief disruption**, not sustained hard CC.

### Chấn Nhịp — Chấn Mạch Khai Sơn

When it lands while the target is casting/channeling:
- attempts to interrupt that action;
- authored short BodyControl stagger base 0.35s;
- still goes through canonical control immunity / Resolve / pressure rules.

### Phản Chấn — Hồi Thân Phản Quyền

On a real successful Counter:
- authored short stagger base 0.40s;
- same canonical control contest/pressure rules.

### Trấn Áp — Trấn Nhạc Áp Quyền

Soft control/setup:
- baseline -12% Mobility;
- +12% Recovery time;
- 3s;
- mastery may strengthen the authored effect.

It must not become root/stun/silence.

### Break

Quyền is Break-heavy, but **Thất Thế is not hard CC**. Break and disabling control remain separate mechanics.

---

## 10. Ultimate contract

**Cửu Thiên Trấn Ngục Quyền**:
- dedicated Ultimate slot;
- 100 Gauge;
- unavoidable hit;
- consumes current Quyền Thế under authored payoff;
- is a valid Trọng Thế payoff;
- does not add a new long hard CC;
- Cực Ý may open 4s Quyền Vực, temporary only;
- no recursive resource/proc multiplication.

Auto may briefly hold a 4-Thế Ultimate window in an attempt to reach the perfect 5-Thế state, but cannot hold indefinitely.

---

## 11. Main / Secondary ownership

Main Quyền:
- owns Quyền Thế core;
- owns Fist Active/Ultimate rotation;
- owns Trọng Thế payoff.

Secondary Quyền:
- no Fist Active/Ultimate Auto rotation;
- no Main-only Quyền Thế core;
- may contribute explicitly eligible Fist passive semantics under Bản Đạo V2 rules.

Liên Kình/passive semantics and Main-only core ownership must not be conflated.

---

## 12. Auto intent — locked behavior

Current priority shape:
1. target casting/channeling → Chấn Mạch first.
2. target casting/channeling → Counter opportunity if equipped.
3. Broken + >=4 Quyền Thế → Phá Quân finisher.
4. 5 Quyền Thế + target not Broken → Trấn Nhạc heavy setup.
5. 100 Gauge + 5 Quyền Thế → Ultimate.
6. 5 Quyền Thế → Băng Sơn heavy payoff.
7. fallback Ultimate at 4 Quyền Thế with bounded hold toward 5.
8. target not Broken → Chấn Mạch / Trấn Nhạc.
9. >=2 Quyền Thế → Heavy.
10. low Quyền Thế → Tàng Kình / Tam Hoàn.
11. Liệt Địa and other equipped pressure tools.
12. Basic fallback.

Counter is tactical-only. It must not fire blindly through generic fallback when the target is not in an authored counterable action state.

---

## 13. Three canonical production archetypes

Benchmark convention: 180s, 12 deterministic seeds, CombatKernel V3, equal **300-point** extra primary-stat budget, all eight passives Lv20, all Quyền skills mastery 1000, exactly five Actives + Basic + Ultimate.

### A. Trọng Quyền — `heavy` — reference 100%

Allocation:
- CL +160
- TP +70
- TPH +20
- LL +25
- TT +25

Actives:
- Tàng Kình Dưỡng Thế
- Chấn Mạch Khai Sơn
- Băng Sơn Trọng Quyền
- Trấn Nhạc Áp Quyền
- Phá Quân Quyết

Role: damage/reference heavy spender and Break-finisher path.

### B. Liên Hoàn — `chain` — target 92–98%

Allocation:
- CL +130
- TP +35
- TPH +85
- LL +25
- TT +25

Actives:
- Tam Hoàn Liên Kình
- Chấn Mạch Khai Sơn
- Tàng Kình Dưỡng Thế
- Liệt Địa Liên Hoàn
- Trấn Nhạc Áp Quyền

Role: TPH-backed sustained chain pressure.

### C. Phản Quyền — `counter` — target 85–92%

Allocation:
- CL +120
- TP +75
- TPH +55
- LL +25
- TT +25

Actives:
- Chấn Mạch Khai Sơn
- Tàng Kình Dưỡng Thế
- Băng Sơn Trọng Quyền
- Hồi Thân Phản Quyền
- Phá Quân Quyết

Role: reactive counter/bruiser utility. Lower raw target is intentional because real Counter/sustain/disruption has value.

These are benchmark anchors, not the only legal player builds.

---

## 14. Runtime transaction / edge rules

- V2 owns live Quyền Thế requirements/spend; legacy V1 resource paths must not shadow it.
- Heavy requires >=2 Quyền Thế; Finisher requires >=1 in V2 can-use ownership.
- Resource generation is tied to eligible root action outcome, not visual hit count.
- Counter payoff requires the target's real casting/channeling state and a successful Counter path.
- Chấn Mạch interrupt/brief stagger remains canonical-control routed; control immunity may prevent the disabling effect.
- Trọng Thế is consumed only by the authored heavy-payoff set, not by every damaging Active.
- Liên Kình timer refresh is event-owned; bonus reads do not refresh it.
- Ultimate domain cap changes are temporary and expire with the domain.
- generated mastery/follow-up hits remain bounded to root provenance/follow-up budget.

---

## 15. UI / readability reference

A production Quyền UI should make visible:
- Quyền Thế as 0–5 pips, with temporary domain overcap clearly distinguished;
- Trọng Thế armed state at 5;
- Liên Kình stack and peak/cap state;
- Broken target opportunity;
- real Counter/cast-window readability;
- Trấn Áp/short disruption feedback;
- Ultimate Gauge and temporary Cửu Thiên Quyền Vực.

Do not expose obsolete “Liên Quyền” wording or merge Liên Kình into the spendable Quyền Thế meter.

---

## 16. Benchmark / evidence contract

Quyền's golden harness proves:
- exactly three profiles: `heavy`, `chain`, `counter`;
- five Active slots each;
- equal allocation budget;
- production CombatKernel V3;
- Quyền Thế generated/requested/spent;
- Liên Kình stack progression/cap uptime;
- real Break events;
- Chấn Mạch interrupt events;
- Counter success/stagger events;
- soft-control and Defense-shred events;
- Ultimate/domain events;
- per-skill damage.

Identity evidence is mandatory: a `counter` benchmark with zero real Counter success is invalid even if the DPS number looks plausible.

---

## 17. Locked boundaries

Quyền is CLOSED / LOCKED.

Do not change from another Dao slice without a proven regression or explicit user request:
- ten-skill inventory;
- Quyền Thế / Liên Kình separation;
- control boundary;
- five-stat families/weights;
- mastery/passive package;
- three canonical archetypes and relative target ordering;
- Auto resource/Counter intent;
- Main/Secondary ownership.

A red locked-Quyền regression caused by a shared seam is blocking. A desire to improve Quyền while working on Thần Niệm is not.

---

## 18. Why Quyền is a golden reference

Quyền demonstrates the same standard with a fundamentally different identity from Sword:
- one short-cycle resource plus one non-spend long-cycle stack;
- heavy payoff eligibility rather than universal spender behavior;
- a real tactical Counter build whose benchmark must prove its mechanic fires;
- brief control that remains distinct from the future Thần Niệm hard-control identity;
- three build families driven by CL+TP vs CL+TPH vs hybrid CL+TP+TPH;
- mastery that changes chain/counter/heavy behavior rather than only adding generic damage;
- event-owned passive state and explicit Main/Secondary boundaries.
