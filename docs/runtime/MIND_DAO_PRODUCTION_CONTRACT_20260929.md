# THẦN NIỆM DAO PRODUCTION CONTRACT — 2026-09-29

Status: **CLOSED / LOCKED — M0–M6 COMPLETE; exact verified gameplay/closure SHA d69b33c80b874fb28471855324afbdf95712b730**

Repository: `vuanhtuan161094-byte/tutiennhandoi`  
Branch: `main` only  
Feature id: `dao-mind`  
Opening source SHA: `71bfb42b89294f94244d4d766d67165afd5b11f5`

Parent locks:
- Combat Backend V3 — CLOSED / LOCKED.
- Sword Dao Production V1 — CLOSED / LOCKED.
- Fist / Quyền Dao Production V1 — CLOSED / LOCKED.
- Dao Production Workflow V3 — ACTIVE / LOCKED.
- Ngũ Hành Equipment Retirement — CLOSED / LOCKED.

Thần Niệm remains under the V3 sequence: **correctness → parity → identity-valid deterministic benchmark → minimal tuning → scoped closure**. The feature manifest remains `closureReady:false`. M4 identity evidence is accepted. M5 tuning follows one-new-lever-per-benchmark iteration and does not authorize whole-feature closure.

## 1. Production identity

Thần Niệm is the **mental pressure / tactical interference / control Dao**.

Canonical readable loop:

**`ẤN → NHIỄU → ẢNH / KÍCH`**

Forbidden drift:
- no generic `TT → all damage` multiplier;
- no permanent control chain;
- no recursive echo/proc engine;
- no third independent resource;
- no reopening Sword/Quyền/Ngũ Hành equipment balance to tune Mind.

## 2. Canonical resources and state

### Thần Ấn — target-local short cycle

- owner: current target;
- hard cap: **5**;
- built by authored Main-Mind skills only;
- spend commits exactly once at root resolution;
- switching target never transfers marks;
- Niệm Ảnh may never repeat add/consume transactions.

### Niệm Lực — self long cycle

- base cap: **20**;
- P5 candidate maximum cap: **30**;
- base hold: **12s**;
- base decay: **1 stack/s** after hold expiry;
- carries across Hunt kills under current V2 semantics;
- reads/UI projections may synchronize elapsed timers but may not refresh the P8 peak hold.

### Niệm Ảnh — cadence mechanic, not a third resource

- Main-only;
- baseline every **3 eligible normal Mind Active roots**;
- canonical echo delay **0.6s**;
- baseline replay coefficient **35%**;
- safety ceiling **70%** after authored additions;
- stores only sanitized damage/heal/shield/Break packets;
- no Chân Nguyên/Gauge/Thần Ấn/Niệm Lực replay;
- no channel/deploy/summon duplication;
- no recursion;
- shared follow-up budget remains authoritative.

Basic and Ultimate do not advance the ordinary cadence except where an implemented mastery explicitly modifies cadence behavior without creating a second counter.

## 3. Ten-skill inventory

1. `skill.dao.mind.basic` — Linh Tê Niệm Châm.
2. `skill.dao.mind.mark` — Lạc Niệm Thành Ấn.
3. `skill.dao.mind.split` — Phân Thần Truy Niệm.
4. `skill.dao.mind.interfere` — Nhiễu Thần Chỉ.
5. `skill.dao.mind.guard` — Tâm Kính Hộ Thức.
6. `skill.dao.mind.chase` — Truy Hồn Niệm Ấn.
7. `skill.dao.mind.burst` — Bạo Ấn Phá Thức.
8. `skill.dao.mind.observe` — Tịch Niệm Quan Tâm.
9. `skill.dao.mind.flow` — Vạn Niệm Phân Lưu.
10. `skill.dao.mind.ultimate` — Vạn Niệm Quy Nhất · Tịch Chiếu.

No extra production skill may be added without reopening the contract.

## 4. Five-stat ownership — M2A CLOSED

All ten Mind skills carry explicit `fiveStatScalingV5` families.

Locked direction:
- **CL / power** — direct-damage anchor;
- **TT / sense** — Accuracy / Control / Resolve authority plus explicitly authored mental-skill scaling;
- **TPH / agility** — selected split/chase/echo-local scaling only;
- **TP / body** — Tâm Kính defensive/shield contribution only where authored;
- **LL / spirit** — Max Chân Nguyên capacity, not hidden damage.

There is no global TT damage multiplier.

## 5. Passive ownership — M2B CLOSED

Canonical V2 progression remains exactly P1–P8.

- P1 unlocks Niệm Lực; Main converts 10-stack groups into echo/control quality; Secondary-safe lane is Resolve only.
- P2 allows one bounded extra-stack chance per eligible gain event.
- P3 owns hold/decay; reads do not refresh peak timing.
- P4 gives Main action-local Accuracy + Control Power; Secondary-safe Resolve only.
- P5 increases Niệm Lực cap only.
- P6 gives Main Nhiễu potency + Niệm Ảnh Break quality; no generic Skill Damage.
- P7 gives action-local Armor Pen only under current mental pressure and only on procDepth-0 Main-Mind direct packets.
- P8 peak refresh is event-owned; Main gains echo/Nhiễu/control quality, Secondary gets bounded Resolve.

M2B runtime candidate: `24c608f1764c9e5a34c65e5c66602e3e30d3a499`. Detailed audit: `docs/runtime/MIND_DAO_M2B_CLOSURE_AUDIT_20260929.md`.

## 6. M1 correctness state — CLOSED

Regression guards retain:
- V2-owned Thần Ấn generation/spend;
- mark-based Nhiễu eligibility/transaction;
- zero-mark normal Bạo Ấn rejection;
- Observe mark gain by resolved channel progress;
- Phân Lưu bounded state and bonus-mark cadence;
- sanitized Niệm Ảnh replay with shared follow-up budget and non-recursion;
- Ultimate excluded from ordinary snapshot/cadence authority;
- P8 timer refresh outside passive/stat reads;
- Ultimate 3+ mark soft Nhiễu and 5-mark canonical mental-control pulse.

## 7. M2C — Mastery architecture CLOSED

All ten mastery rows in `mind-dao-v2.js` own exactly the authored 100 / 250 / 500 / 750 / 1000 milestones through the Mind runtime owner and narrow combat/decision hooks.

Closed ownership classes:
- pure numeric skill-local modifier;
- root-action behavior change;
- snapshot/echo modifier;
- Thần Ấn transaction-safe modifier;
- Niệm Lực event modifier;
- control/Break modifier;
- timing/cast/recovery modifier.

M2C locks:
- mastery authority is Main-Mind-only unless an existing passive-safe Secondary lane explicitly says otherwise;
- root extra-hit packages are procDepth-0 and once/root;
- no mastery replays Thần Ấn consume/gain through Niệm Ảnh;
- no second echo counter or third resource lane;
- all echoes remain sanitized, non-recursive, capped at 70% coefficient and subject to the shared follow-up budget;
- Observe 1000 sixth-hit behavior occurs only on completed channel resolution;
- Flow 1000 reuses the existing state/cadence owner rather than creating independent recursion;
- Ultimate may schedule only a bounded echo of a pre-existing snapshot and does not create a normal snapshot;
- Nhiễu/Ultimate control remains under canonical control/boss rules;
- Nhiễu mastery 500 applies authored echo-Break bonus based on the **current target being under Nhiễu**, independent of which eligible Mind skill produced the snapshot;
- Ultimate mastery 1000 improves ordinary Niệm Ảnh cadence interval by 25% during Tịch Chiếu Niệm Vực while preserving the canonical **0.6s** echo delay and fractional cadence credit.

M2C semantic-alignment candidate: `17ec773bb057e7e6145bea10de91e532bff0efdf`. Detailed audit: `docs/runtime/MIND_DAO_M2C_CLOSURE_AUDIT_20260929.md`.

M5 may tune numeric values inside these already-owned mastery behaviors, but may not change their ownership class, transaction semantics, cadence architecture, recursion rules, or safety ceilings.

## 8. M3 production-path parity — CLOSED

Parity has been audited across:
- manual/shared CombatKernel V3 authority;
- Auto/tactical rotation inputs;
- PvE/Boss consumers;
- PvP;
- Hunt/offline representative combat;
- save/restore/carry state where applicable;
- Secondary Mind passive-only behavior;
- locked Sword and Quyền regressions after shared-seam changes.

Production consumers converge on canonical CombatKernel V3 / `CombatEngine`; no alternate Mind mechanic engine was found. Hunt carry preserves durable `battleDaoStateV2`; action-local Thần Ấn/Niệm Ảnh transactions remain combat-owned. Auto/tactical layers choose actions but do not resolve Mind mechanics independently.

Registered gate: `qa/tests/mind-dao-m3-consumer-parity-test.js`.  
Detailed audit: `docs/runtime/MIND_DAO_M3_CLOSURE_AUDIT_20260929.md`.

M3 made no coefficient or balance changes.

## 9. Deterministic benchmark — M4 CLOSED

Feature command:

`tools\web\RUN_MIND_M5_BENCHMARK.cmd`

Accepted canonical identity baseline:
- engine: production CombatKernel V3;
- matrix: **12 seeds × 180 seconds × 3 archetypes = 36 runs**;
- canonical Section-12 allocation/loadout matrix;
- all 36 runs identity-valid;
- `invalidRuns = []`;
- all Mind passives Lv20 and all ten mastery tiers 1000;
- equal five-stat allocation budget: 300 points/profile.

Accepted aggregate evidence before tuning:
- **Bạo Ấn:** DPS **1004.046**, normalized **100%**, 12/12 valid;
- **Niệm Ảnh:** DPS **740.728**, **73.77%** of Bạo Ấn, echo contribution **12.62%**, 12/12 valid;
- **Nhiễu Thức:** DPS **556.468**, **55.42%** of Bạo Ấn, interference metric **19.565**, 12/12 valid;
- Nhiễu Thức is the highest real interference/control profile in the matrix.

Identity correctness therefore passes M4. Numerical target bands do not yet pass, so M5 is required.

Benchmark target bands remain:
- **Bạo Ấn** — normalized damage reference 100%;
- **Niệm Ảnh** — 88–98% of Bạo Ấn with 15–30% real echo contribution;
- **Nhiễu Thức** — 75–90% of Bạo Ấn and highest real interference/control metric.

## 10. Minimal tuning — M5 ACTIVE

M5 rules:
- tune only Mind-owned local coefficients;
- add exactly one new tuning lever between deterministic benchmark runs;
- retain a prior lever only after its measured effect is reviewed;
- no change to the canonical archetype matrix;
- no reopening M1/M2/M3 structural ownership;
- no generic `TT → all damage` multiplier;
- no Sword/Quyền/equipment rebalance to make Mind pass.

### M5-1 — MEASURED / RETAINED

Lever:
- `Tịch Niệm Quan Tâm` / `skill.dao.mind.observe` channel damage coefficient: **0.28 → 1.10 per resolved channel hit**.

Exact local benchmark evidence on source HEAD `93e8b6dcc6e65c325d2619ac389a6263fe670cfd`:
- all 36 runs identity-valid; `invalidRuns = []`;
- **Bạo Ấn:** DPS **1004.046**, **100%**, echo contribution **10.45%**;
- **Niệm Ảnh:** DPS **890.397**, **88.68%**, echo contribution **10.49%**;
- **Nhiễu Thức:** DPS **675.563**, **67.28%**, interference metric **19.565**, still highest.

Decision:
- retain Observe **1.10** because Niệm Ảnh moved into its 88–98% DPS band and Nhiễu also improved without changing the Burst reference;
- M5 is not complete because Niệm Ảnh echo contribution remains below 15% and Nhiễu remains below its 75% DPS floor.

M5-1 did not change:
- skill id/name;
- form/cost/CD/cast/recovery/channel timing;
- channel hit count/mastery behavior;
- Thần Ấn generation/progress semantics;
- Niệm Ảnh cadence, sanitation and recursion limits;
- Nhiễu/control rules;
- five-stat family.

### M5-2 — MEASURED / RETAINED

Lever measured on exact source HEAD `4c842a1ed9e7efa047c468e0031c7e47c90ad6e0`:
- `Bạo Ấn Phá Thức · Cực` mastery-1000 sanitized snapshot retention: **40% → 70% of the already-resolved Burst damage/Break packet**.

Exact deterministic evidence:
- all **36/36** runs identity-valid; `invalidRuns = []`;
- **Bạo Ấn:** DPS **1011.576**, **100%**, echo contribution **11.27%**, Burst-sourced echo damage **4048.269/run**;
- **Niệm Ảnh:** DPS **906.994**, **89.66%**, echo contribution **12.13%**, Burst-sourced echo damage **6971.022/run**;
- **Nhiễu Thức:** DPS **675.563**, **66.78%**, interference metric **19.565**, still highest.

Decision:
- retain the snapshot-local direction because Niệm Ảnh stays safely inside its 88–98% DPS band and real echo contribution rises from **10.49% → 12.13%**;
- M5-2 is not sufficient for closure because Niệm Ảnh still misses the 15% echo floor;
- Nhiễu is intentionally unaffected by this lever because its canonical loadout does not use Bạo Ấn; it remains below the 75% DPS floor and will receive its own feature-local tuning only after Niệm Ảnh passes.

M5-2 did **not** change baseline echo cadence/coefficient, direct Burst damage, Thần Ấn transactions, Nhiễu/control rules or the benchmark matrix.

### M5-3 — MEASURED / RETAINED · NIỆM ẢNH FROZEN

Lever retained:
- `MIND_M5_BURST_SNAPSHOT_RETENTION`: **0.70 → 1.30**.
- This multiplier applies only to the sanitized Burst damage/Break packet before the normal Niệm Ảnh replay coefficient is applied.

Exact deterministic evidence on source HEAD `6673bb304f1987ae974edf42f35bab6584ab30a3`:
- all **36/36** runs identity-valid; `invalidRuns = []`;
- **Bạo Ấn:** DPS **1033.595**, **100%**, echo contribution **12.80%**, Burst-sourced echo damage **7095.883/run**;
- **Niệm Ảnh:** DPS **940.190**, **90.96%**, echo contribution **15.23%**, Burst-sourced echo damage **12946.185/run**;
- **Nhiễu Thức:** DPS **675.563**, **65.36%**, interference metric **19.565**, still highest.

Decision:
- M5-3 passes both locked Niệm Ảnh targets: **88–98% relative DPS** and **15–30% real echo contribution**;
- freeze the Niệm Ảnh tuning package at Observe **1.10** plus Burst snapshot multiplier **1.30**;
- do not retune Niệm Ảnh while opening the remaining Nhiễu-only miss;
- Nhiễu identity remains healthy and highest on real interference, but its **65.36%** relative DPS remains below the **75%** floor.

M5-3 did **not** change baseline echo coefficient/cadence/delay, the 70% echo replay-coefficient ceiling, recursion/follow-up safety, Thần Ấn transactions, direct Burst damage, Nhiễu/control rules or the benchmark matrix.

### M5-4 — MEASURED / RETAINED · M5 CLOSED

Lever retained:
- `Nhiễu Thần Chỉ` direct damage coefficient: **0.75 → 2.80**.

Exact deterministic evidence on source HEAD `8814c6c064478540496cfd92d7611156f62479fb`:
- all **36/36** runs identity-valid; `invalidRuns = []`;
- **Bạo Ấn:** DPS **1033.595**, normalized **100%**;
- **Niệm Ảnh:** DPS **940.190**, **90.96%**, echo contribution **15.23%** — both target bands pass;
- **Nhiễu Thức:** DPS **782.540**, **75.71%**, echo contribution **12.23%**, interference metric **19.565**, and remains the highest real interference/control profile.

Decision:
- retain `Nhiễu Thần Chỉ` direct damage coefficient **2.80**;
- M5 numerical targets are complete: Bạo Ấn reference 100%, Niệm Ảnh 88–98% with 15–30% real echo contribution, Nhiễu Thức 75–90% while leading real interference;
- freeze the full M5 tuning package: Observe channel damage **1.10**, Burst sanitized snapshot multiplier **1.30**, Nhiễu Thần Chỉ direct damage **2.80**;
- no additional Mind coefficient tuning is authorized before closure unless exact-SHA closure reveals a proven regression.

M5-4 did **not** change:
- Nhiễu Thần Ấn spend count or commit timing;
- interference potency, cast delay, recovery penalty, stagger duration or boss/control rules;
- Niệm Ảnh coefficient/cadence/delay/70% replay ceiling;
- five-stat families;
- Auto priorities/loadouts;
- canonical benchmark matrix;
- Sword, Quyền, Body, equipment or deferred/global balance.

M5 is therefore **CLOSED**. The feature may now set `closureReady:true` and enter M6 exact-SHA feature-scoped closure. This benchmark is acceptance evidence for balance; it is not itself the final closure proof.

## 11. Phase state

- **M0 — CLOSED** — scope / contract / registry.
- **M1 — CLOSED** — runtime correctness / ownership.
- **M2A — CLOSED** — explicit five-stat migration.
- **M2B — CLOSED** — passive architecture / ownership.
- **M2C — CLOSED** — mastery architecture / ownership; M5 numeric tuning may not reopen architecture.
- **M3 — CLOSED** — production-path parity.
- **M4 — CLOSED** — canonical deterministic identity baseline accepted: 36/36 valid.
- **M5 — CLOSED** — M5-1/M5-2/M5-3/M5-4 measured and retained; all three archetype target bands pass on deterministic evidence.
- **M6 — CLOSED** — exact clean local FULL CLEAN + registered `dao-mind` scoped closure PASS on `d69b33c80b874fb28471855324afbdf95712b730`.

`dao-mind` remains `closureReady:true` for regression/closure checks. Mind Dao Production V1 is now **CLOSED / LOCKED** on exact verified gameplay/closure SHA `d69b33c80b874fb28471855324afbdf95712b730`. Closure record: `docs/runtime/MIND_DAO_PRODUCTION_CLOSURE_20261004.md`. Later documentation/metadata commits do not replace that verified gameplay SHA.
