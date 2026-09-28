# SWORD DAO REFERENCE SPEC V1 — 2026-09-29

Status: **GOLDEN REFERENCE / CLOSED / LOCKED**

Dao: **Kiếm Đạo (`sword`)**  
System standard: `docs/runtime/DAO_SYSTEM_DESIGN_STANDARD_V1_20260929.md`  
Historical production contract: `docs/runtime/SWORD_DAO_PRODUCTION_CONTRACT_20260925.md`

This reference reflects the current locked Sword production model. It is documentation for future Dao design and regression comparison; it does **not** reopen Sword balance.

---

## 1. Authority / identity

Kiếm is the **precision / burst / finisher Dao**.

It wins by:
1. building and routing **Kiếm Khí**;
2. converting real Kiếm Khí spend into long-cycle **Kiếm Ý**;
3. creating a Break / Thất Thế window;
4. cashing the window into a heavy slash, finisher or channel spectacle.

Primary strengths:
- strong concentrated damage;
- clear spender/finisher windows;
- high-value Break routing;
- viable fast, heavy and channel/TT archetypes.

Tradeoffs:
- not the primary sustained hard-control Dao;
- not a tank/mitigation identity;
- large spends create meaningful low-Khí downtime;
- channel identity accepts commitment risk.

Forbidden drift:
- no generic TPH → Action Speed;
- no generic TT → damage;
- no hidden Crit from CL;
- no permanent Kiếm Khí cap inflation to solve balance;
- no recursive Ý Kiếm/follow-up loops.

---

## 2. Core loop

**`KHÍ → Ý → TRẢM`**

- **KHÍ:** Basic/Actives establish short-cycle Kiếm Khí.
- **Ý:** real Kiếm Khí spend and bounded overflow conversion establish long-cycle Kiếm Ý.
- **TRẢM:** Break/Finisher/channel windows convert the built state into Sword's signature payoff.

This loop is measurable through Kiếm Khí generation/spend, Kiếm Ý stack progression, Break events and spender/finisher casts.

---

## 3. Resource / state model

### 3.1 Kiếm Khí — Main-only core

Player-facing: **Kiếm Khí**.  
Normal cap: **5**.  
Temporary high-realm Sword Domain may raise cap to **7** for the authored window only.

Core rules:
- short-cycle fuel;
- Main Sword only;
- individual skills decide whether they generate, preserve or spend;
- refunds are bounded post-spend mechanics, never an infinite loop;
- the normal cap must not be permanently raised above 5.

Locked skill routing:
- Basic: successful damaging root → +1.
- Lưu Quang: below cap builds; at cap may spend 2 for Kiếm Khí Trảm.
- Tàng Phong: deliberate generator; mastery strengthens generation.
- Phá Vọng: low Khí builds; from 3+ spends the amount above 2.
- Liên Kiếm: mastery can spend 1–2 to open extra hits.
- Hồi Phong: successful Counter generates; full-Khí logic may spend 1 for bounded follow-up before generation.
- Đoạn Cương: heavy spender 2; Cực Ý can use 3.
- Quyết Sinh: spender up to 3; Cực Ý up to 5.
- Vạn Kiếm: high mastery can spend 2 for enhanced channel form.
- Ultimate: spends up to 5.

### 3.2 Kiếm Ý — long-cycle passive stack

Player-facing states:
- 0–9: **Tụ Ý**;
- 10–19: **Ngưng Ý**;
- 20+: **Kiếm Tâm**;
- at current cap with p8: **Ý Hóa Kiếm**.

Primary generation:
- spend 1–2 Kiếm Khí in one root action → +1 Kiếm Ý;
- spend >=3 → +2 Kiếm Ý.

Dưỡng Ý overflow conversion is bounded to once per root and an internal cooldown.

Kiếm Ý is not a second short-cycle spender. It is sustained state that changes Sword quality, Crit/Hội Tâm/Xuyên and capstone behavior.

### 3.3 Follow-up/capstone state

Ý Kiếm / kiếm ảnh are **bounded generated follow-ups**, not a third stored resource. They must remain under canonical followUpBudget/procDepth and may not regenerate their own resources/procs recursively.

---

## 4. Realm unlock tree

| Order | Active | Passive |
|---:|---|---|
| 10 | Lưu Quang Nhất Trảm | Kiếm Ý Quyết |
| 18 | Tàng Phong Dưỡng Kiếm | Dưỡng Ý Chân Kinh |
| 34 | Phá Vọng Kiếm Ấn | Kiếm Ý Trường Tồn |
| 46 | Lưu Quang Liên Kiếm | Phá Vọng Chân Ý |
| 62 | Hồi Phong Thủ Kiếm | Kiếm Tâm Vô Cực |
| 74 | Đoạn Cương Phá Thế | Kiếm Uy Lăng Thiên |
| 90 | Nhất Kiếm Quyết Sinh | Kiếm Tâm Sát Ý |
| 102 | Vạn Kiếm Quy Tông | Kiếm Ý Bất Diệt |

Basic and Ultimate are separate from the eight Active/passive rows. Endgame loadout still equips only **5 Actives**.

---

## 5. Ten-skill production table

Sword intentionally uses explicit fixed CN costs from its locked contract rather than generic standard-percent costs.

| Skill | Slot / Form | CN | CD | Cast / Recovery | Five-stat production scaling | Loop role |
|---|---|---:|---:|---|---|---|
| Thanh Minh Kiếm Thức | Basic / Instant | 0 | 0 | 0 / 1.00s | 2.70 CL | steady generator |
| Lưu Quang Nhất Trảm | Active / Instant | 3 | 3s | 0 / 0.70s | 1.35 CL + 1.55 TPH | fast generate / cap payoff |
| Tàng Phong Dưỡng Kiếm | Active / Charge | 0 | 6s | 1.50 / 0.80s | 1.50 CL | deliberate generation |
| Phá Vọng Kiếm Ấn | Active / Cast | 5 | 6s | 0.80 / 0.70s | 1.60 CL + 2.00 TT | Break setup / dynamic spend |
| Lưu Quang Liên Kiếm | Active / Combo | 5 | 7s | 0.35 / 0.90s | 1.00 CL + 1.85 TPH | fast multihit / small spend |
| Hồi Phong Thủ Kiếm | Active / Counter | 3 | 8s | 0 / 0.70s | 1.20 CL + 1.50 TPH | reactive defense / generator |
| Đoạn Cương Phá Thế | Active / Cast | 8 | 9s | 1.00 / 0.90s | 3.00 CL | heavy spend / Break |
| Nhất Kiếm Quyết Sinh | Active / Finisher | 9 | 10s | 0.60 / 1.00s | 2.10 CL + 2.00 TT | signature finisher |
| Vạn Kiếm Quy Tông | Active / Channel | 12 | 14s | 0.50 / 1.10s | 1.60 CL + 8.00 TT | channel / Ngự Kiếm archetype |
| Thái Hư Nhất Kiếm · Đoạn Thiên | Ultimate / Finisher | 0 + 100 Gauge | 0 | 1.20 / 1.40s | 2.10 CL + 2.00 TT | unavoidable climax / Break |

Authored Gauge generation is skill-specific for Sword: `4 / 3 / 8 / 5 / 4 / 3 / 6 / 5 / 15 / 0` in the table order above.

Multi-hit/channel packages remain one root action for resource/proc ownership unless an explicit mastery effect says otherwise.

---

## 6. Skill mastery — locked five milestones

### Thanh Minh Kiếm Thức
- 100: 15% chance for a 55% follow-up slash.
- 250: follow-up also generates +1 Kiếm Khí.
- 500: at 5 Khí follow-up is guaranteed and becomes 65% ranged Kiếm Khí.
- 750: Hội Tâm reduces next Basic recovery by 0.15s.
- 1000: **Cực Ý · Song Ảnh** — every third Basic becomes 100% + 75%.

### Lưu Quang Nhất Trảm
- 100: Hội Tâm grants +1 extra Khí while in generator mode.
- 250: at >=3 Khí add 35% hit.
- 500: extra hit becomes 60% and may Hội Tâm.
- 750: at 5 Khí cast CD becomes 2.4s.
- 1000: **Lưu Quang Song Trảm** — 155% + 90%.

### Tàng Phong Dưỡng Kiếm
- 100: cast 1.35s.
- 250: completed cast generates +3 Khí.
- 500: completed cast grants +15% Sword-skill damage for 4s.
- 750: cast 1.10s.
- 1000: if starting at 0–1 Khí, completed cast reaches 5.

### Phá Vọng Kiếm Ấn
- 100: Break +20%.
- 250: target not Broken → +15% additional Break.
- 500: if the action causes Broken, apply Phá Vọng 4s: +10% direct damage taken.
- 750: cast 0.60s.
- 1000: at 5 Khí spend 3 and magnify Break/Xuyên through its passive package.

### Lưu Quang Liên Kiếm
- 100: hit 3 +20% damage.
- 250: each hit rolls Crit/Hội Tâm independently while remaining one root action.
- 500: at >=3 Khí spend 1 for hit 4 = 60%.
- 750: recovery 0.70s.
- 1000: at 5 Khí spend 2, become five hits; final hit gains +100% coefficient.

### Hồi Phong Thủ Kiếm
- 100: successful Counter +20% damage.
- 250: successful Counter heals 5% Max HP.
- 500: successful Counter generates +2 Kiếm Khí.
- 750: recovery 0.50s.
- 1000: at <=30% HP successful Counter grants 12% Max-HP shield for 3s.

### Đoạn Cương Phá Thế
- 100: Break +15%.
- 250: full 2-Khí spend → +20% damage.
- 500: already-Broken target may waive Khí spend as authored.
- 750: cast 0.75s.
- 1000: spend 3 if available; damage ×1.4, Break ×1.35, +25% skill-local Xuyên.

### Nhất Kiếm Quyết Sinh
- 100: each Khí spent adds +5% coefficient.
- 250: Broken target → +20% damage.
- 500: spend >=3 → +15% skill-local Xuyên.
- 750: recovery 0.75s.
- 1000: at 5 Khí may spend all five; final hit gets 1.5× Crit/Hội Tâm power.

### Vạn Kiếm Quy Tông
- 100: final hit +50%.
- 250: completed channel generates +3 Kiếm Khí.
- 500: at >=4 Khí spend 2 to enter 8-hit Ngự Kiếm form.
- 750: channel duration 2.6s.
- 1000: **Vạn Kiếm Triều Tông** — 14 hits, final hit 150%, +20% Break across channel.

### Thái Hư Nhất Kiếm · Đoạn Thiên
- 100: base coefficient 680% → 720%.
- 250: each Khí spent +15% coefficient.
- 500: at 5 Khí add 180% finishing hit.
- 750: recovery 1.10s.
- 1000: reinforces the final Đoạn Thiên / Ý Kiếm payoff; high-realm Thái Hư Kiếm Vực is **not** unlocked solely by mastery.

---

## 7. Eight passives — locked package

| Passive | Core purpose | Lv1 → Lv20 direction |
|---|---|---|
| Kiếm Ý Quyết | build Kiếm Ý from real Khí spend | Crit per Ý 0.20%→0.40%; 10 Ý Hội Tâm 3%→6%; 20 Ý Xuyên 4%→8% |
| Dưỡng Ý Chân Kinh | overflow Khí → bounded Ý | 40%→100%; internal CD 8s→6s |
| Kiếm Ý Trường Tồn | duration/decay ownership | +2s→+8s; high level slows decay; large spend delays decay |
| Phá Vọng Chân Ý | local Break/Xuyên on spend | per-Khí Break 2%→4%; Xuyên 0.5%→1.25%; bounded refund on self-caused Broken |
| Kiếm Tâm Vô Cực | raise Ý cap + small-spend refund | cap +2→+10; refund chance 8%→24% |
| Kiếm Uy Lăng Thiên | reward sustained Ý + heavy spend | direct damage per 10 Ý 1%→3%; large-spend effect +2%→+5% |
| Kiếm Tâm Sát Ý | Broken-window burst | damage +8%→+15%; Crit/Hội Tâm power +10%→+20% |
| Kiếm Ý Bất Diệt | at-cap capstone expression | bounded image 20%→30%; heavy spender +damage/Break; Vạn Kiếm extra finite wave |

Passive reads must not create state mutation. Resource/timer changes remain event-owned.

---

## 8. Five-stat identity

Locked Sword families demonstrate three valid production archetypes without global stat hacks:
- **CL-heavy**: Thanh Minh, Tàng Phong, Đoạn Cương.
- **CL + TPH**: Lưu Quang, Liên Kiếm, Hồi Phong.
- **CL + TT**: Phá Vọng, Quyết Sinh, Vạn Kiếm, Ultimate.

The extreme TT coefficient on Vạn Kiếm is a **skill-local archetype correction**, not permission for generic TT damage.

---

## 9. Control / Break boundary

Sword owns meaningful Break setup and finisher exploitation, but not sustained hard-control identity.

- Phá Vọng and Đoạn Cương are major Break tools.
- Broken is a vulnerability state, not stun.
- Hồi Phong is a tactical Counter, not a generic hard-control engine.
- TT use in Sword supports explicit skill scaling plus global Accuracy/Control/Resolve; it does not create a Sword-only parallel control system.

---

## 10. Ultimate contract

**Thái Hư Nhất Kiếm · Đoạn Thiên**:
- dedicated Ultimate slot;
- 100 Gauge;
- 0 CN;
- unavoidable hit;
- spends up to 5 Kiếm Khí;
- high Break payoff;
- cannot recursively generate Gauge/resource from its own generated finishers;
- Cực Ý does not independently grant permanent/high-realm Sword Domain.

Auto may hold Gauge briefly for a better Sword state but cannot hold indefinitely.

---

## 11. Main / Secondary ownership

Main Sword:
- owns Kiếm Khí core and Sword Active/Ultimate rotation.

Secondary Sword:
- no Sword Active/Ultimate Auto rotation;
- no Main-only Kiếm Khí core lane;
- may contribute explicitly eligible Sword passive semantics under Bản Đạo V2 rules.

Do not infer Secondary Active access from learned skills.

---

## 12. Auto intent — locked behavior

Current priority shape:
1. Broken + low target + strong state → **Nhất Kiếm Quyết Sinh** kill window.
2. perfect 5 Khí + 20 Ý + 100 Gauge → Ultimate window.
3. fallback Ultimate at 100 Gauge, with bounded hold handled by AI.
4. tactical Counter when equipped/available.
5. low Khí → Tàng Phong.
6. Broken + >=3 Khí → Finisher.
7. >=2 Khí → Đoạn Cương.
8. target not Broken → Phá Vọng.
9. then Chain / Flow / Myriad according to equipped kit and resource state.
10. Basic fallback.

Sword Auto must not blindly dump all resources on cooldown.

---

## 13. Three canonical production archetypes

Benchmark convention: 180s, 12 deterministic seeds, CombatKernel V3, equal **300-point** extra primary-stat budget, all eight passives Lv20, all Sword skills mastery 1000, exactly five Actives + Basic + Ultimate.

### A. Trọng Trảm — `heavy` — reference 100%

Allocation:
- CL +180
- TP +40
- TPH +20
- LL +30
- TT +30

Actives:
- Tàng Phong Dưỡng Kiếm
- Phá Vọng Kiếm Ấn
- Hồi Phong Thủ Kiếm
- Đoạn Cương Phá Thế
- Nhất Kiếm Quyết Sinh

Role: damage/reference heavy spender and finisher.

### B. Lưu Quang — `flow` — target 90–95%

Allocation:
- CL +130
- TP +35
- TPH +80
- LL +25
- TT +30

Actives:
- Lưu Quang Nhất Trảm
- Tàng Phong Dưỡng Kiếm
- Phá Vọng Kiếm Ấn
- Lưu Quang Liên Kiếm
- Hồi Phong Thủ Kiếm

Role: TPH-backed fast/micro-payoff archetype.

### C. Ngự Kiếm — `myriad` — target 85–92%

Allocation:
- CL +100
- TP +35
- TPH +25
- LL +30
- TT +110

Actives:
- Tàng Phong Dưỡng Kiếm
- Phá Vọng Kiếm Ấn
- Hồi Phong Thủ Kiếm
- Nhất Kiếm Quyết Sinh
- Vạn Kiếm Quy Tông

Role: TT/channel identity with lower raw sustained target in exchange for channel/utility identity.

These are benchmark anchors, not the only legal player builds.

---

## 14. Runtime transaction / edge rules

- V2 owns the real Kiếm Khí core; old V1 resource names/metadata must not shadow it.
- Kiếm Khí spends for authored V2 spenders are prepared as root-action transactions; passive refunds are separate bounded post-root events, not generic free rollback.
- Multi-hit skills remain one root for generation/passive/proc accounting.
- Counter payoff requires a valid Counter outcome; fallback must not turn it into an unconditional attack.
- Channel completion bonuses only occur through the authored completion logic.
- Generated sword images use follow-up/provenance budget and do not recursively create new images/resources.
- temporary cap changes must expire with their authored domain/state.

---

## 15. UI / readability reference

A production Sword UI should make visible:
- Kiếm Khí as 0–5 pips, with temporary overcap clearly distinguished;
- Kiếm Ý as compact sustained stack/state;
- Kiếm Tâm / Ý Hóa Kiếm state;
- Broken target opportunity;
- spender readiness for Đoạn Cương / Quyết Sinh;
- Ultimate Gauge/readiness;
- Channel state for Vạn Kiếm.

Do not expose internal follow-up/proc counters as new Sword resources.

---

## 16. Benchmark / evidence contract

Sword's golden harness proves:
- exactly three profiles: `heavy`, `flow`, `myriad`;
- five Active slots each;
- equal allocation budget;
- production CombatKernel V3;
- real Kiếm Khí generation/spend/refund metrics;
- Kiếm Ý threshold/cap timing;
- Break events;
- Ultimate/domain events;
- channel resource failures;
- per-skill damage.

A future shared-combat change touching Sword must preserve these identity paths. It must not rebalance Sword merely because another Dao is being produced.

---

## 17. Locked boundaries

Sword is CLOSED / LOCKED.

Do not change from another Dao slice without a proven regression or explicit user request:
- ten-skill inventory;
- two-resource identity;
- five-stat families/weights;
- three canonical benchmark archetypes and their target ordering;
- mastery/passive package;
- Auto identity;
- control/Break ownership;
- fixed Sword CN contract.

---

## 18. Why Sword is a golden reference

Sword demonstrates the standard pattern without forcing other Daos to copy its mechanics:
- clear two-timescale resource model;
- 10-skill kit with multiple forms;
- 8 passives that reinforce resource identity;
- five meaningful mastery milestones per skill;
- three statistically distinct build archetypes;
- skill-local hybrid-stat tuning instead of global stat hacks;
- deterministic identity-aware benchmark;
- explicit Main/Secondary ownership and bounded follow-ups.
