# THẦN NIỆM DAO PRODUCTION SPEC V1 — 2026-09-29

Status: **DESIGN LOCK / IMPLEMENTATION PENDING**

Repository: `vuanhtuan161094-byte/tutiennhandoi`  
Branch: `main`  
Source audit SHA: `33ae4da3d1262866929e58bea76517b74f550fbd`  
Feature id: `dao-mind`  
System standard: `docs/runtime/DAO_SYSTEM_DESIGN_STANDARD_V1_20260929.md`  
Execution workflow: `docs/runtime/DAO_PRODUCTION_WORKFLOW_V3_20260926.md`  
Opening contract: `docs/runtime/MIND_DAO_PRODUCTION_CONTRACT_20260929.md`  
Structural lock: `docs/runtime/MIND_DAO_SKILL_FORM_LOCK_20260929.md`

This document is the complete design target for bringing **Thần Niệm Đạo** to the same production standard as Kiếm and Quyền.

Important authority rule:

- current source/runtime remains the truth for what executes **today**;
- this spec defines the production target to be implemented and verified next;
- numerical values labelled **starting candidate** are implementation/balance starting points, not closure evidence;
- no coefficient becomes CLOSED / LOCKED until correctness, parity and identity-valid benchmark evidence pass;
- Sword, Fist, Combat V3 and Ngũ Hành retirement remain read-only regression locks.

---

## 1. Source audit snapshot

### 1.1 What already exists

Current source already contains:

- exactly **10 Thần Niệm skills**;
- exactly **8 V2 passives**;
- exactly **10 mastery rows**, each with `100 / 250 / 500 / 750 / 1000` milestones;
- 5 normal Active slots shared with the Bản Đạo V2 loadout system;
- target mark **Thần Ấn** with ordinary cap 5;
- self long-cycle stack **Niệm Lực** with base cap 20 / duration 12s / decay 1 stack per second after expiry;
- V2 core cadence **Niệm Ảnh**, currently `3 eligible Active -> delayed echo after 0.6s`, baseline coefficient 35%;
- `dao-mind` feature manifest registered with `closureReady:false`;
- fail-closed benchmark placeholder;
- existing Auto rotation lane;
- legacy V118 Mind passives/variants that predate the V2 production pass.

### 1.2 Current executable mismatches that must be repaired before tuning

The audit identifies these production blockers:

1. **Nhiễu Thần Chỉ ownership split** — the old V118 path owns Thần Ấn spend/interference, but V2 suppresses that legacy mutation path. The V2 owner does not yet execute the promised spend/control package.
2. **Auto Burst gates on the wrong state** — Auto currently gates Bạo Ấn on `mindEchoCounter >= 2` even though Bạo Ấn spends target-local Thần Ấn.
3. **Bạo Ấn has no V2 eligibility gate** — production must require at least one Thần Ấn for the normal Burst spender; otherwise its base consume packet can still produce a zero-mark cast.
4. **Nhiễu has no V2 mark eligibility gate** — production must require at least one Thần Ấn before the tactical spender is selected/resolved.
5. **Niệm Ảnh is not yet a real sanitized snapshot replay** — current runtime stores snapshot metadata and derives delayed damage from the just-resolved HP damage. It does not yet replay the authored whitelist packet.
6. **Tịch Niệm Quan Tâm grants +3 Thần Ấn up front** — current root effect awards the full mark package before the 5-hit channel completes, contradicting interruption semantics.
7. **Vạn Niệm Phân Lưu does not yet own its promised combat-state behavior** — current skill resolves marks + damage, while its mastery text assumes a persistent state.
8. **Five-stat migration is absent** — all 10 Mind skills currently fall back to Attack/CL because no `fiveStatScalingV5` is authored.
9. **Niệm Lực is still a generic damage stack** — current p1/p6/p7/p8 runtime trends toward generic damage/Armor Pen rather than mental pressure/control/echo identity.
10. **p8 peak refresh is still partly read-owned for non-Fist Dao** — Mind must move refresh mutation to eligible combat events, following the correctness lesson from Quyền.
11. **Legacy Mind passive lane still exists** — `passive.dao.mind.*` coexists with the V2 p1–p8 tree and must not become a second live passive progression family.
12. **Legacy Mind variants can mutate mark cap/trades** — `mind.multi`, `mind.focus`, `mind.interfere`, `mind.burst` are historical V118 variation knobs. Production V1 must not let them silently override the locked V2 cap/transaction rules unless they are deliberately migrated and tested.
13. **Many mastery descriptions are authored intent, not proven runtime behavior** — M1/M2 must implement the promised packages rather than treating text as evidence.

These are correctness/authority defects, not reasons to balance damage yet.

---

## 2. Production identity

**Thần Niệm Đạo is the mental-pressure / tactical-interference / control Dao.**

It wins by reading the opponent's action rhythm, placing mental marks, disrupting committed actions, and turning accumulated intent into delayed Niệm Ảnh or a controlled mark detonation.

### Primary role

- tactical interference / control;
- punish cast/channel commitment;
- manipulate timing rather than simply race raw DPS.

### Secondary roles

- delayed echo/follow-up pressure;
- target-mark burst/Break;
- limited mental defense through Tâm Kính.

### Strengths

- best access among current Main Dao to meaningful **mental control windows**;
- can interfere even when hard control is resisted through cast/recovery pressure;
- strong target-local decision making through Thần Ấn;
- distinctive delayed echo rhythm through Niệm Ảnh;
- TT has legitimate action-local value without becoming a global damage stat.

### Weaknesses / tradeoffs

- control is contestable by Resolve, Control Pressure, chain limits and boss rules;
- target-local marks are lost when that target dies and do not transfer;
- Nhiễu spends marks for utility, lowering immediate burst throughput;
- Niệm Ảnh has delayed payoff and can fizzle if its target is no longer valid;
- channel/deploy setup creates commitment windows;
- Bạo Ấn reference damage requires mark setup and is not free burst.

### Forbidden drift

Thần Niệm must never become:

- Kiếm burst with TT labels;
- Quyền Counter/Break bruiser;
- permanent stun/root/silence/suppression chaining;
- a bypass around canonical Control vs Resolve;
- a generic `TT -> all damage` conversion;
- a generic `TPH -> Action Speed` conversion;
- a third elemental combat system;
- a reason to restore equipment Ngũ Hành combat;
- a recursive echo/proc engine.

---

## 3. Core combat loop

Canonical readable loop:

**`ẤN -> NHIỄU -> ẢNH / KÍCH`**

### ẤN — establish target pressure

Use Basic/build skills to place **Thần Ấn** on the current target.

Measurable state:
- target mark count `0..5`;
- marks generated / capped / spent.

### NHIỄU — choose tactical conversion

When the target commits to a cast/channel, **Nhiễu Thần Chỉ** may spend 1–3 marks to distort cast/recovery timing and, at the strongest authored window, attempt a bounded canonical mental interrupt/stagger.

Measurable events:
- marks spent on Nhiễu;
- cast/channel interference events;
- successful interrupts;
- resisted/immune control outcomes.

### ẢNH / KÍCH — choose delayed or immediate payoff

- **Niệm Ảnh** is the delayed cadence payoff after every 3 eligible Active roots.
- **Bạo Ấn / Ultimate** convert target marks into immediate damage/Break payoff.

Measurable events:
- eligible Active counter;
- snapshot creation;
- echo scheduled/resolved/suppressed;
- Bạo Ấn/Ultimate mark spend;
- Break contribution.

### Parallel long-cycle lane — Niệm Lực

**Niệm Lực** grows over sustained action and reinforces mental precision/control/echo efficiency. It is not another short-cycle spender.

---

## 4. Resource and state contract

## 4.1 Thần Ấn — target-local short-cycle resource

Player-facing: **Thần Ấn**  
Owner: target  
Normal hard cap: **5**  
Main-only generation/spend: yes  
Encounter persistence: no  
Target transfer: no

### Generation

Production rules:

- Linh Tê Niệm Châm: +1 on successful authored root contact;
- Lạc Niệm Thành Ấn: +2 on successful root resolution/contact;
- Phân Thần Truy Niệm: +2 once per root action;
- Truy Hồn Niệm Ấn: +1 once per resolved cast;
- Tịch Niệm Quan Tâm: up to +3 by completed channel progress;
- Vạn Niệm Phân Lưu: +2 on successful Deploy resolution.

Ordinary overcap is discarded; there is no hidden bank.

### Spend commit timing

A Thần Ấn spender commits exactly once at its **root resolution/commit event**, before damage/control outcome rolls.

Therefore:

- interrupted/cancelled before resolution -> spend 0;
- target invalid/dead before resolution -> spend 0;
- root resolves then damage is Dodged -> no refund;
- root resolves then control is resisted -> no refund;
- boss reduction does not refund;
- Niệm Ảnh may never spend the same marks again.

### Target lifecycle

- switching target does not move marks;
- old target keeps its own marks while alive;
- target death deletes its combat-local mark state naturally;
- a delayed Niệm Ảnh bound to a dead/invalid target fizzles rather than retargeting another enemy.

## 4.2 Niệm Lực — long-cycle passive stack

Player-facing: **Niệm Lực**  
Owner: self  
Base cap: **20**  
P5 maximum candidate cap: **30**  
Base hold: **12s**  
Base decay after expiry: **1 stack/s**  
Hunt kill carry: **yes**, preserving current V2 semantics

### Gain

- eligible successful normal Active root: +1;
- Ultimate root: +2;
- p2 may grant one additional stack;
- Basic does not generate Niệm Lực by default;
- generated Niệm Ảnh/follow-ups do not generate Niệm Lực.

For Secondary Mind, passive-stack observation may remain eligible on the character's own normal Active/Ultimate roots, but **Secondary may not receive Thần Ấn generation, Niệm Ảnh core, Mind Active skills or Mind Ultimate**.

### Refresh / decay

- gaining stack refreshes hold duration;
- p3 extends hold and slows decay;
- p8 peak refresh must be event-owned;
- read functions/UI projections may never mutate the timer.

## 4.3 Niệm Ảnh — cadence mechanic, not a third resource bar

Main-only core.  
Baseline cadence: **every 3 eligible normal Mind Actives**.  
Delay: **0.6s**.  
Baseline replay coefficient: **35%**.

`mindEchoCounter` is internal cadence state only.

### Eligible source

Default eligible snapshot source:

- normal Active Thần Niệm root;
- root/procDepth 0 only;
- source successfully reaches root resolution;
- Basic does not advance cadence;
- Ultimate does not advance ordinary cadence;
- generated echo/follow-up never advances cadence.

### Sanitized snapshot whitelist

The stored packet may replay only bounded post-resolution information:

- direct damage packet;
- Break packet;
- heal packet;
- shield packet;
- explicitly whitelisted non-disabling effect.

Never replay:

- Chân Nguyên cost;
- Ultimate Gauge gain/cost;
- Thần Ấn generation;
- Thần Ấn consume;
- Niệm Lực generation;
- channel/deploy creation;
- summon;
- Ultimate;
- control transaction by default;
- another snapshot/echo trigger.

Base Niệm Ảnh does **not** replay hard control. If a mastery later permits a soft-effect replay, it must still route through canonical control/boss rules and remain non-recursive.

### Snapshot target

- hostile packet keeps the original resolved target id;
- self-heal/shield keeps self as target;
- no auto-retarget if original target dies;
- the snapshot stores sanitized outcome data, not a pointer to rerun the source skill.

### Budget / recursion

- uses the shared follow-up budget;
- `procDepth` increments as canonical generated follow-up provenance;
- one echo may not produce another echo;
- if the follow-up budget is unavailable, the proc is logged/suppressed and is not banked into an unlimited future burst.

### Coefficient ceiling

Starting production safety cap: **70% snapshot coefficient** after all mastery/state/passive additions. This is a safety ceiling, not a target to reach routinely.

---

## 5. Control contract

Thần Niệm is the primary control-oriented Dao, but it still uses the shared control system.

### 5.1 Soft interference — canonical baseline

**Nhiễu** is a non-disabling mental debuff that may:

- lengthen remaining cast/channel completion timing where the engine supports authored cast interference;
- increase next/active recovery timing;
- apply visible `Nhiễu` feedback.

Soft interference remains useful against bosses even when hard control is heavily reduced or immune.

### 5.2 Bounded hard-control window

Production target:

- consuming **3 Thần Ấn** with Nhiễu against a target that is currently casting/channeling may attempt one short mental interrupt/stagger;
- the interrupt/stagger must use the canonical control status path and a mental-control group, not a Dao-local disable timer;
- baseline disabling duration candidate: **0.35s** before Control-vs-Resolve scaling;
- Cực Ý may raise the authored base window to **0.50s**;
- Control Pressure, chain limit, immunity and boss rules remain authoritative;
- when hard control is immune/resisted, the soft interference package still resolves at its canonical reduced effectiveness.

### 5.3 Ultimate control

At **5 consumed Thần Ấn**, Ultimate may attempt one stronger but still bounded mental-control pulse:

- starting candidate base disable: **0.60s** before canonical scaling;
- never bypass Resolve/boss immunity merely because the Ultimate hit is `unavoidable`;
- the damage hit is Tất Trúng; the control outcome is not guaranteed.

### 5.4 Break separation

Bạo Ấn and Ultimate may contribute Break. Break/Thất Thế is not renamed to mental stun and does not bypass control rules.

---

## 6. Five-stat production ownership

Primary stats remain exactly CL / TP / TPH / LL / TT.

### Dao-level ownership

- **CL / power** — direct-damage anchor, especially Bạo Ấn reference build.
- **TT / sense** — Accuracy / Control / Resolve base authority and explicit mental-skill specialization.
- **TPH / agility** — only selected chase/split/echo-oriented skill-local scaling; never global Action Speed.
- **TP / body** — Tâm Kính shield/defensive contribution only where authored.
- **LL / spirit** — Max Chân Nguyên capacity; not a hidden damage stat.

No generic TT damage multiplier is allowed.

### Starting candidate per-skill scaling families

These are M2 implementation starting values and must be benchmarked before closure:

| Skill | Candidate five-stat weights | Design purpose |
| --- | --- | --- |
| Linh Tê Niệm Châm | `2.00 CL + 0.55 TT` | stable generator; CL still matters |
| Lạc Niệm Thành Ấn | `1.15 CL + 1.20 TT` | mark/mental setup |
| Phân Thần Truy Niệm | `0.95 CL + 1.05 TPH + 1.00 TT` | split/echo hybrid |
| Nhiễu Thần Chỉ | `0.65 CL + 1.30 TT` | deliberately low direct damage; TT owns control effectiveness separately |
| Tâm Kính Hộ Thức | `0.75 TP + 1.55 TT` effect family | shield/mental defense, not DPS |
| Truy Hồn Niệm Ấn | `1.20 CL + 0.80 TPH + 1.15 TT` | snapshot/chase |
| Bạo Ấn Phá Thức | `2.35 CL + 1.15 TT` | damage-reference spender |
| Tịch Niệm Quan Tâm | `0.80 CL + 2.10 TT` | channel/echo setup |
| Vạn Niệm Phân Lưu | `0.95 CL + 0.75 TPH + 1.60 TT` | persistent mental state |
| Vạn Niệm Quy Nhất · Tịch Chiếu | `2.10 CL + 1.90 TT` | ultimate damage + mental payoff |

Implementation may require separate effect scaling for shield/control rather than using the direct-damage formula. The family map is the lock; exact final weights remain benchmark-owned until M5.

---

## 7. Ten-skill production kit

Shared cost classes remain `zero=0% / low=8% / medium=16% / high=28%` standard Chân Nguyên. Normal Active Gauge generation defaults to +6 unless explicitly authored; Basic remains +4; Ultimate costs 100 Gauge and generates 0.

## 7.1 Linh Tê Niệm Châm — Basic

Id: `skill.dao.mind.basic`  
Slot/Form: Basic / Instant  
Cost: zero  
CD: 0  
Cast: 0  
Recovery: 1.10s  
Gauge: +4  
Role: stable contact / +1 Thần Ấn generator

Base target:
- current 72% packet remains starting coefficient;
- +1 Thần Ấn on successful root contact;
- does not advance ordinary Niệm Ảnh cadence;
- does not generate Niệm Lực.

Mastery target:
- 100: 15% chance for one bounded 50% Niệm Châm follow-up;
- 250: that follow-up gives +1 Gauge, but still does not count as Active or generate mark/resource again;
- 500: after a Niệm Ảnh resolves, next Basic gets +20% direct damage once;
- 750: Recovery 0.95s;
- 1000: **Cực Ý · Song Niệm Châm** — every third Basic becomes 72% + 60%; second hit gets +15% action-local Armor Pen; still one root action.

## 7.2 Lạc Niệm Thành Ấn

Id: `skill.dao.mind.mark`  
Slot/Form: Active / Instant  
Cost: low  
CD: 4s  
Cast: 0  
Recovery: 0.75s  
Gauge: +6  
Role: fastest ordinary Thần Ấn builder

Base target:
- current 70% packet starting coefficient;
- +2 Thần Ấn once per root;
- eligible Niệm Ảnh snapshot source.

Mastery target:
- 100: +15% direct damage;
- 250: this skill's sanitized snapshot coefficient +10% relative;
- 500: its Niệm Ảnh adds one bounded 40% secondary echo hit inside the same follow-up budget;
- 750: Recovery 0.55s;
- 1000: **Lạc Niệm Song Ấn** — 70% + 70%; both visuals remain one root/snapshot transaction.

## 7.3 Phân Thần Truy Niệm

Id: `skill.dao.mind.split`  
Slot/Form: Active / Instant  
Cost: medium  
CD: 6s  
Cast: 0  
Recovery: 0.80s  
Gauge: +6  
Role: hybrid mark builder / Niệm Ảnh skill

Base target:
- 115% starting direct packet;
- +2 Thần Ấn once per root;
- eligible snapshot source.

Mastery target:
- 100: +15% direct damage;
- 250: at procDepth 0, add a bounded second 45% hit; still one root action and no second mark gain;
- 500: Niệm Ảnh coefficient for this skill becomes 45% baseline instead of 35%;
- 750: Recovery 0.60s;
- 1000: **Phân Thần Tam Niệm** — 115% + 55% + 55%; one root / one snapshot / one Gauge event.

## 7.4 Nhiễu Thần Chỉ

Id: `skill.dao.mind.interfere`  
Slot/Form: Active / Instant  
Cost: medium  
CD: 7s  
Cast: 0  
Recovery: 0.80s  
Gauge: +6  
Role: signature tactical interference spender

Eligibility:
- requires target Thần Ấn >=1;
- highest Auto priority when target is casting/channeling and marks are available.

Spend:
- consume `min(3, current marks)` at root resolution;
- no refund on Dodge/resist/boss reduction.

Starting effect ladder:
- 1 mark: light Nhiễu, cast/recovery pressure;
- 2 marks: stronger Nhiễu and larger timing penalty;
- 3 marks: strongest soft Nhiễu; if target is currently casting/channeling, attempt canonical interrupt + 0.35s mental stagger before Resolve scaling.

Niệm Ảnh:
- snapshot may keep sanitized direct-damage packet only by default;
- it never repeats mark spend or disabling control.

Mastery target:
- 100: Nhiễu potency +15%;
- 250: consuming >=2 marks grants +1 Niệm Lực once on resolved root;
- 500: Niệm Ảnh against a target currently under Nhiễu gains +20% Break, not a generic global damage buff;
- 750: Recovery 0.60s;
- 1000: **Nhiễu Thần Phong Thức** — 3-mark interrupt base mental-stagger window becomes 0.50s and the root gains +25% Break; canonical boss/control caps still apply.

## 7.5 Tâm Kính Hộ Thức

Id: `skill.dao.mind.guard`  
Slot/Form: Active / Instant  
Cost: medium  
CD: 9s  
Cast: 0  
Recovery: 0.85s  
Gauge: +6  
Role: mental defense / survival stabilizer

Base target:
- shield uses explicit TP + TT effect family;
- base current shield value remains starting calibration input;
- shield snapshot is allowed only as a sanitized reduced shield packet;
- no Thần Ấn transaction.

Mastery target:
- 100: shield +20%;
- 250: if this shield is actually broken by incoming damage, +1 Niệm Lực once;
- 500: next resolved Mind Active within 4s receives +10% authored skill-effect potency; one use only;
- 750: Recovery 0.60s;
- 1000: **Tâm Kính Chân Giới** — shield +45%; for first 3s, Niệm Ảnh coefficient +10 percentage points, respecting global echo cap.

## 7.6 Truy Hồn Niệm Ấn

Id: `skill.dao.mind.chase`  
Slot/Form: Active / Cast  
Cost: low  
CD: 6s  
Cast: 0.80s  
Recovery: 0.75s  
Gauge: +6  
Role: high-quality snapshot setup / chase

Base target:
- 120% starting direct packet;
- +1 Thần Ấn at successful cast resolution;
- high-priority snapshot source for the Niệm Ảnh archetype.

Mastery target:
- 100: Cast 0.65s;
- 250: when it resolves as an eligible source, it may replace the current snapshot even if another eligible action resolved earlier in the same bounded cadence window;
- 500: its Niệm Ảnh receives +20% Break;
- 750: Recovery 0.55s;
- 1000: **Truy Hồn Định Ấn** — 120% + 80%; its snapshot coefficient becomes 50%, still non-recursive.

## 7.7 Bạo Ấn Phá Thức

Id: `skill.dao.mind.burst`  
Slot/Form: Active / Finisher  
Cost: medium  
CD: 8s  
Cast: 0.45s  
Recovery: 0.85s  
Gauge: +6  
Role: damage-reference mark spender / Break payoff

Eligibility:
- requires target Thần Ấn >=1.

Spend:
- consume all current target marks, max 5, at root resolution;
- marks spent exactly once;
- zero-mark normal Burst is invalid.

Starting packet:
- preserve current `base 1.00 + 0.48 per consumed mark` as the first correctness baseline;
- Break retains current per-mark structure as starting baseline;
- final balance comes only after valid benchmark.

Niệm Ảnh:
- snapshot stores sanitized post-spend damage/Break outcome;
- echo may never rerun Consume.

Mastery target:
- 100: each consumed mark adds +8% authored coefficient;
- 250: target Thất Thế -> +20% direct damage;
- 500: explicit guarantee that Niệm Ảnh snapshots only sanitized damage/Break and never Consume;
- 750: Recovery 0.65s;
- 1000: **Bạo Ấn Phá Thức · Cực** — damage x1.4, Break x1.3; snapshot stores only 40% of the post-spend damage packet before other echo-state additions.

## 7.8 Tịch Niệm Quan Tâm

Id: `skill.dao.mind.observe`  
Slot/Form: Active / Channel  
Cost: medium  
CD: 10s  
Cast: 0.40s  
Recovery: 0.90s  
Gauge: +6 once per root, not per tick  
Role: deliberate setup / channel / echo preparation

Base channel:
- 2.5s;
- 5 hits;
- current 28% per hit starting packet;
- total Thần Ấn reward +3 only through completed channel progress.

Mark progress formula:

`earnedMarks = floor(3 * resolvedTicks / totalTicks)`

For 5 ticks this yields mark increments at progress equivalent to ticks 2, 4 and 5.

Interruption:
- keeps already-earned marks;
- grants no unfinished marks;
- no duplicate channel-end award.

Mastery target:
- 100: Channel duration 2.2s with same authored tick package;
- 250: full completion +2 Niệm Lực once;
- 500: full completion makes next Niệm Ảnh +10 percentage points;
- 750: Recovery 0.70s;
- 1000: **Tịch Niệm Viên Mãn** — 6-hit authored form; on full completion, if a valid sanitized snapshot exists and follow-up budget permits, immediately fire one Niệm Ảnh; it still cannot recurse.

## 7.9 Vạn Niệm Phân Lưu

Id: `skill.dao.mind.flow`  
Slot/Form: Active / Deploy  
Cost: high  
CD: 12s  
Cast: 0.80s  
Recovery: 1.00s  
Gauge: +6  
Role: persistent mental-pressure / echo-state support

Base production state:
- successful Deploy resolution deals current 145% starting packet;
- +2 Thần Ấn;
- opens **Phân Lưu** for **5s**;
- while Phân Lưu is active, every third eligible resolved Mind Active gains +1 additional Thần Ấn, max once per root and still capped at 5;
- state creation itself never duplicates through Niệm Ảnh.

Mastery target:
- 100: state duration +20% -> 6s;
- 250: while state is active, every third eligible Mind Active also grants +1 Niệm Lực;
- 500: Niệm Ảnh during state +10 percentage points;
- 750: Cast 0.60s;
- 1000: **Vạn Niệm Phân Lưu · Cực** — 6s; every second eligible Mind Active may create a 25% sandbox echo using the shared echo/follow-up budget; this does not create a second independent echo counter and cannot recurse.

## 7.10 Vạn Niệm Quy Nhất · Tịch Chiếu — Ultimate

Id: `skill.dao.mind.ultimate`  
Slot/Form: Ultimate / Finisher  
CN: 0  
Gauge cost: 100  
Cast: 1.20s  
Recovery: 1.50s  
Unavoidable damage hit: yes  
Role: final mark conversion / mental climax

Eligibility:
- Gauge 100;
- Thần Ấn not required.

Spend:
- consume current target Thần Ấn up to 5 at root resolution;
- zero marks preserves base Ultimate damage;
- marks amplify damage/Break/interference.

Starting packet:
- preserve current `2.10 + 0.62 per consumed mark` consume packet as first correctness baseline;
- current per-mark Break remains starting baseline;
- 3+ marks apply strong soft Nhiễu;
- 5 marks additionally attempt one canonical 0.60s base mental-control pulse before Resolve/boss scaling.

Niệm Ảnh:
- Ultimate does not advance ordinary 3-Active cadence;
- Ultimate does not create a normal snapshot;
- mastery may explicitly schedule one bounded echo of the pre-existing snapshot.

Mastery target:
- 100: base authored damage coefficient +15%;
- 250: if a valid pre-existing snapshot exists, after Ultimate schedule one 50% snapshot echo subject to shared follow-up budget;
- 500: explicit non-snapshot/non-recursion guarantee for the Ultimate root;
- 750: Recovery 1.15s;
- 1000: **Tịch Chiếu Niệm Vực** for 5s — Niệm Ảnh coefficient +20 percentage points and echo cadence cooldown/interval support improves by 25%, but procDepth/follow-up budget/70% coefficient ceiling remain authoritative.

---

## 8. Eight-passive production tree

The stable ids remain `passive.v2.mind.p1` ... `p8`. Names are retained. Exact numeric interpolation is starting design authority and may receive minimal benchmark tuning later.

## P1 — Niệm Lực Quyết

Purpose: unlock long-cycle Niệm Lực and give it mental, not generic-DPS, identity.

Event:
- normal eligible Active root +1;
- Ultimate +2.

Target bonuses:
- every 10 Niệm Lực: Main Mind Niệm Ảnh coefficient +2 -> +4 percentage points;
- every 10 Niệm Lực: action-local Mind Control effectiveness +2% -> +5%;
- Secondary-safe lane: every 10 Niệm Lực grants +2% -> +5% Resolve effectiveness only; it does not grant Niệm Ảnh or Thần Ấn.

Retire current generic per-stack Skill Damage / Hội Tâm package from Mind production authority.

## P2 — Dưỡng Niệm Chân Kinh

Purpose: accelerate long-cycle buildup.

- eligible gain event has 10% -> 30% chance for +1 additional Niệm Lực;
- at most once per root action.

## P3 — Niệm Lực Trường Tồn

Purpose: sustain long fights.

- duration +2s -> +8s;
- high level slows decay from 1 stack/s toward 1 stack/2s;
- reads never refresh it.

## P4 — Minh Tâm Chân Ý

Purpose: mental precision / defensive clarity.

At every 10 Niệm Lực:
- Main Mind action-local Accuracy +2% -> +6%;
- Main Mind action-local Control Power effectiveness +2% -> +6%;
- Secondary-safe Resolve effectiveness +2% -> +6%.

No generic Crit/Heart-damage stacking.

## P5 — Vạn Niệm Vô Cực

Purpose: long-cycle capacity.

- Niệm Lực cap +2 -> +10;
- base 20 therefore candidate maximum 30.

No Thần Ấn cap modification.

## P6 — Thần Niệm Lăng Thiên

Purpose: convert sustained mental state into core-mechanic quality.

Per 10 Niệm Lực, Main Mind only:
- Nhiễu soft-effect potency +3% -> +7%;
- Niệm Ảnh Break effectiveness +2% -> +5%.

No generic global Skill Damage multiplier.

## P7 — Nhất Niệm Phá Vọng

Purpose: reward established mental pressure.

At Niệm Lực >=20, Main Mind:
- Mind direct packets against a target currently carrying Thần Ấn or Nhiễu receive +5% -> +18% action-local Armor Pen;
- does not apply to unrelated Dao damage when Mind is Secondary.

This preserves the useful current Armor Pen theme while localizing it to Thần Niệm identity.

## P8 — Niệm Lực Bất Diệt

Purpose: bounded peak-state capstone.

At current Niệm Lực cap:
- eligible Active root refreshes peak hold by 1s -> 2s, event-owned;
- Main Mind Niệm Ảnh coefficient +5 -> +10 percentage points;
- Main Mind Nhiễu/control-effect potency +5% -> +12%;
- Secondary-safe lane receives bounded Resolve effectiveness +5% -> +10% while at cap;
- no generic +30% all-skill damage;
- no generic +20% Gauge gain.

Peak refresh cannot be triggered by UI/stat reads.

---

## 9. Realm progression pairing

Keep the existing Bản Đạo V2 tree:

| Realm row | Active | Passive |
| --- | --- | --- |
| mundane / 10 | Lạc Niệm Thành Ấn | P1 Niệm Lực Quyết |
| spirit / 18 | Phân Thần Truy Niệm | P2 Dưỡng Niệm Chân Kinh |
| mystic / 34 | Nhiễu Thần Chỉ | P3 Niệm Lực Trường Tồn |
| earth / 46 | Tâm Kính Hộ Thức | P4 Minh Tâm Chân Ý |
| heaven / 62 | Truy Hồn Niệm Ấn | P5 Vạn Niệm Vô Cực |
| immortal / 74 | Bạo Ấn Phá Thức | P6 Thần Niệm Lăng Thiên |
| extreme / 90 | Tịch Niệm Quan Tâm | P7 Nhất Niệm Phá Vọng |
| breaker / 102 | Vạn Niệm Phân Lưu | P8 Niệm Lực Bất Diệt |

Basic and Ultimate remain dedicated slots outside the 5 normal Active slots.

---

## 10. Main / Secondary ownership

### Main Mind owns

- all Mind Active skills;
- Mind Ultimate;
- Thần Ấn generation/spend;
- Niệm Ảnh core/snapshot/cadence;
- Phân Lưu state;
- Mind-specific control transactions.

### Secondary Mind may own

- learned p1–p8 passive semantics explicitly marked Secondary-safe;
- Niệm Lực long-cycle stack if p1 is learned;
- Resolve/mental-defense utility authored by those passives.

### Secondary Mind must never receive

- Mind Active or Ultimate rotation;
- Thần Ấn generation/spend;
- Niệm Ảnh cadence/snapshot;
- Phân Lưu;
- Nhiễu control action;
- target-mark state created merely by passive observation.

---

## 11. Auto-combat production contract

Auto must use the same resources and transaction semantics as manual CombatKernel play.

Priority intent:

1. **Emergency defense:** Tâm Kính when HP/shield condition is genuinely defensive.
2. **Reactive Nhiễu:** target casting/channeling + target Thần Ấn >=1 -> Nhiễu high priority.
3. **Echo-quality window:** if ordinary Niệm Ảnh cadence is at 2/3, prefer a high-quality eligible snapshot source such as Truy Hồn/Phân Thần according to equipped loadout; `mindEchoCounter` is valid for choosing the next snapshot source, never for authorizing a mark spender.
4. **Broken target / mark cash-out:** Bạo Ấn when target is Thất Thế and marks >=3; may also fire at 5 marks to avoid dead-cap waste.
5. **Ultimate preferred window:** Gauge 100 + marks >=3 is preferred; marks 5 is ideal.
6. **Ultimate bounded fallback:** Auto may hold at most **3s** waiting for marks/control window, then must cast if still valid so Gauge cannot deadlock forever.
7. **Observe setup:** use when marks are low and the action is not walking into an obvious urgent reaction window.
8. **Flow state:** establish Phân Lưu when its state is absent and the loadout/archetype benefits from it.
9. **Builders:** Split / Chase / Mark according to mark count and echo cadence.
10. **Basic:** final fallback.

Required new/adjusted AI conditions:

- target Thần Ấn at least N;
- target Thần Ấn below N;
- target has Nhiễu / not Nhiễu where needed;
- Mind echo cadence equals/at least N only for echo-quality choices;
- Phân Lưu active/inactive;
- bounded Ultimate hold state if not already expressible through current generic hold logic.

Counter/mark-spend logic must never be approximated by unrelated numeric states.

---

## 12. Three canonical production archetypes

Exactly three benchmark archetypes are used as production balance anchors. Players remain free to hybridize beyond them.

All builds use:
- exactly 5 normal Active slots;
- Basic + Ultimate separately;
- equal added primary-stat budget = 300;
- all 8 passives Lv20;
- all skill mastery 1000 for endgame benchmark;
- CombatKernel V3;
- 180s;
- 12 deterministic seeds;
- same benchmark target script unless an identity-specific paired target is explicitly required.

## 12.1 Bạo Ấn — damage/reference

Purpose: mark generation -> mark detonation / Break.

Starting allocation:
- CL +150
- TP +30
- TPH +25
- LL +35
- TT +60
- total +300

Active loadout:
- Lạc Niệm Thành Ấn;
- Phân Thần Truy Niệm;
- Truy Hồn Niệm Ấn;
- Bạo Ấn Phá Thức;
- Vạn Niệm Phân Lưu.

Damage reference target: **100%**.

Identity validity requires:
- Thần Ấn generated >0;
- Bạo Ấn casts >0;
- Bạo Ấn consumed marks >0;
- mean marks consumed per Burst materially above 1;
- Break contribution >0;
- zero recursive Consume via echo.

## 12.2 Niệm Ảnh — core-mechanic archetype

Purpose: maximize useful sanitized echo cadence without becoming recursive burst.

Starting allocation:
- CL +100
- TP +25
- TPH +40
- LL +45
- TT +90
- total +300

Active loadout:
- Phân Thần Truy Niệm;
- Truy Hồn Niệm Ấn;
- Bạo Ấn Phá Thức;
- Tịch Niệm Quan Tâm;
- Vạn Niệm Phân Lưu.

Initial sustained target band: **90–98%** of Bạo Ấn.

Identity validity requires:
- ordinary Niệm Ảnh count >0;
- sanitized snapshot source count >0;
- completed Observe channels >0;
- Phân Lưu uptime >0;
- echo damage contribution target **15–30%** of total build damage after correctness;
- zero recursion / zero duplicate mark transaction;
- still generates and spends Thần Ấn.

## 12.3 Nhiễu Thức — utility/control archetype

Purpose: highest real interference/control pressure at a meaningful raw-DPS tradeoff.

Starting allocation:
- CL +70
- TP +35
- TPH +35
- LL +50
- TT +110
- total +300

Active loadout:
- Lạc Niệm Thành Ấn;
- Nhiễu Thần Chỉ;
- Tâm Kính Hộ Thức;
- Tịch Niệm Quan Tâm;
- Vạn Niệm Phân Lưu.

Initial sustained target band: **78–90%** of Bạo Ấn.

Identity validity requires:
- Nhiễu casts >0;
- marks spent on Nhiễu >0;
- target casting/channeling opportunities >0 in the benchmark script;
- real interference events >0;
- at least some canonical interrupt/control attempts occur;
- successful/resisted/immune outcomes are all measurable;
- this build exceeds both other archetypes on the agreed control/interference metric;
- no permanent lock/control-chain exploit.

### Benchmark target requirement

The benchmark dummy cannot be completely passive because Nhiễu identity would be invalid. Use a deterministic training target that periodically performs a real cast/channel while retaining stable defensive stats. All three archetypes fight the same target script so relative DPS remains comparable.

---

## 13. Benchmark metrics

Required per-run / aggregate metrics:

### Resource
- Thần Ấn generated;
- Thần Ấn spent by Nhiễu;
- Thần Ấn spent by Burst;
- Thần Ấn spent by Ultimate;
- mark-cap sample percentage;
- wasted/clamped generation;
- Niệm Lực first 10 / first 20 / first cap timing;
- Niệm Lực cap uptime.

### Niệm Ảnh
- eligible Active count;
- snapshot captures;
- ordinary echoes scheduled/resolved/suppressed;
- echo damage/heal/shield/Break by source skill;
- echo share of total damage;
- max procDepth / recursion violations;
- follow-up budget suppressions.

### Control
- Nhiễu applications;
- cast/recovery interference magnitude/count;
- interrupt attempts;
- successful interrupts;
- resisted/immune control;
- total disabling-control seconds;
- longest continuous control chain;
- boss-control effectiveness if boss-tag benchmark is used.

### Rotation
- casts per skill;
- Observe completion/interruption count;
- Flow uptime;
- Burst average marks consumed;
- Ultimate casts / average marks consumed;
- CN final/low-resource behavior;
- Gauge cadence.

### Numerical output
- damage / DPS mean, min, max;
- Break events;
- shield contribution for relevant builds;
- relative DPS normalized to Bạo Ấn = 100%.

Identity counters must be non-zero before any DPS band is accepted.

---

## 14. UI / player-facing contract

The runtime truth must be readable without turning the combat UI into a dashboard.

### Target display

**Thần Ấn:**
- 5 compact pips around/near the current target status area;
- clear fill/consume animation;
- no decimal stack count;
- switching target immediately shows that target's own marks.

**Nhiễu:**
- compact debuff icon;
- visually distinguish soft Nhiễu from actual hard-control/interrupt feedback;
- boss resistance/immune feedback should be explicit rather than silently doing nothing.

### Player display

**Niệm Lực:**
- compact `x/20` or `x/currentCap` stack presentation;
- peak/cap state visibly distinct;
- decay should be readable but not flash every frame.

**Niệm Ảnh cadence:**
- not a third large resource bar;
- may use a small 3-segment indicator / 0–2 cadence cue or subtle portrait/rune cue;
- echo fire receives one clear delayed visual pulse.

**Phân Lưu / Tịch Chiếu Niệm Vực:**
- state icon/timer only while active;
- no duplicate resource bar.

Tooltips must state:
- mark generation/spend;
- spend commit semantics;
- Niệm Ảnh cannot replay resource/control transactions by default;
- Ultimate Tất Trúng damage does not imply guaranteed control.

---

## 15. Legacy compatibility / migration decisions

### Old V118 passives

`passive.dao.mind.clear/nurture/interfere/guard/burst` are older content/compatibility definitions.

Production V1 rule:
- they must not stack as a second independent live passive progression on top of V2 p1–p8;
- M1 must identify any remaining consumer;
- if no required compatibility consumer remains, V2 production should neutralize their live Mind authority while preserving read compatibility as needed.

### Old V118 variants

`variant.dao.mind.multi/focus/interfere/burst` are not the three canonical production archetypes.

Production V1 rule:
- ordinary Thần Ấn cap remains 5;
- `multi/focus` may not silently change V2 cap to 7/3 during the production slice;
- `interfere/burst` trade modifiers may not bypass the new V2 transaction/control owner;
- migration or retirement of those variant effects must be explicit and tested rather than inherited accidentally.

### Existing save/restore

- combat-local target Thần Ấn does not become permanent save data;
- Niệm Ảnh snapshot/counter is combat-local unless a current Hunt continuity contract explicitly owns it;
- Niệm Lực may carry across continuous Hunt kills as already authored, but ordinary new-encounter initialization remains deterministic;
- existing serialized historical fields must not be destructively migrated without separate evidence.

---

## 16. Implementation sequence

### M1 — correctness / ownership

Implement first, no tuning:

1. V2-owned target Thần Ấn read/gate/spend API;
2. Nhiễu spend + soft interference + canonical 3-mark interrupt window;
3. Bạo Ấn requires >=1 mark and spends exactly once;
4. Ultimate zero-mark baseline + optional mark spend;
5. Observe per-progress mark generation;
6. Flow persistent state ownership;
7. real sanitized Niệm Ảnh snapshot packet;
8. non-recursion/follow-up budget;
9. event-owned Niệm Lực p8 refresh;
10. legacy passive/variant authority de-duplication;
11. Auto mark projection conditions needed by correctness tests.

M1 exit:
- targeted tests green;
- no duplicate V1/V2 mutation owner;
- no known description/runtime contradiction for the core loop.

### M2 — skill/passive/five-stat migration

- implement explicit five-stat families;
- implement final 10-skill mastery semantics;
- migrate p1–p8 away from generic Mind damage-stack behavior;
- preserve TT as control/utility authority rather than global damage;
- add skill/passive contract gates.

### M3 — Auto / parity

Prove:
- manual CombatKernel V3;
- Auto;
- PvE/Boss;
- PvP snapshot/replay where applicable;
- Hunt/offline representative combat;
- Secondary-passive-only semantics;
- locked Sword/Fist regressions.

### M4 — deterministic benchmark harness

Replace `RUN_MIND_M5_BENCHMARK.cmd` fail-closed placeholder with a real harness only after correctness + parity.

### M5 — minimal tuning

- first valid baseline;
- validate or minimally adjust candidate target bands;
- tune only Mind-owned local coefficients;
- one lever at a time;
- stop as soon as all identity + target bands pass.

### M6 — exact closure

- set `closureReady:true` only after required evidence exists;
- run `DONG_BO_VA_TEST_FEATURE.cmd dao-mind`;
- record exact gameplay candidate SHA separately from later docs-only closure SHA;
- write closure record;
- update compact checkpoint;
- mark Thần Niệm CLOSED / LOCKED only after exact clean scoped evidence.

---

## 17. Required targeted test matrix

Minimum tests before benchmark:

### Structure
- 10 skills exact;
- 8 passives exact;
- 5 Active slots;
- mastery 100/250/500/750/1000;
- correct form/cost/CD/cast/recovery.

### Thần Ấn
- cap 5;
- separate marks per target;
- no target transfer;
- Nhiễu requires >=1;
- Burst requires >=1;
- Ultimate allows 0;
- pre-resolution interruption spends 0;
- post-resolution Dodge/resist refunds 0;
- no echo re-spend.

### Observe / Flow
- Observe no upfront +3;
- partial channel grants only earned marks;
- full channel grants exactly +3;
- no duplicated channel-end reward;
- Flow state starts once, expires deterministically and is not echo-recreated.

### Niệm Ảnh
- every 3 eligible Active roots;
- Basic excluded;
- Ultimate excluded from normal cadence;
- 0.6s delay;
- sanitized packet only;
- target binding preserved;
- target death fizzles;
- follow-up budget enforced;
- recursion impossible;
- no CN/Gauge/mark/Niệm Lực replay.

### Niệm Lực
- +1 Active / +2 Ultimate;
- p2 max once/root;
- p3 duration/decay;
- p5 cap;
- p8 event-owned refresh;
- Secondary may gain passive stack but not Main core.

### Control
- 1/2/3-mark Nhiễu ladder;
- 3-mark cast/channel interrupt attempt;
- canonical Control-vs-Resolve scaling;
- Control Pressure increments/reset;
- chain immunity respected;
- boss immunity/reduction respected;
- soft Nhiễu remains when disabling control is resisted where authored.

### Auto
- target casting + marks -> Nhiễu;
- no marks -> no Nhiễu/Burst;
- `mindEchoCounter` never gates Burst;
- echo counter may legitimately choose snapshot source;
- Gauge hold is bounded;
- fallback Basic remains reachable.

### Regression
- Sword contract/five-stat/harness gates remain green;
- Fist five-stat/counter/harness/Q5 gates remain green;
- Combat V3 shared gates remain green.

---

## 18. Definition of design-complete vs production-closed

This document makes Thần Niệm **design-complete** when accepted as the implementation target.

It does **not** make Thần Niệm production-closed.

Production closure additionally requires:

- M1 correctness complete;
- M2 skill/passive/five-stat authority complete;
- M3 parity complete;
- M4 benchmark identity valid;
- all three archetypes execute their defining mechanics;
- M5 target bands pass with deterministic evidence;
- no Sword/Fist regression;
- exact clean FULL CLEAN + `feature dao-mind` scoped closure;
- closure record + checkpoint update.

Until then:

**`dao-mind` remains `closureReady:false`.**
