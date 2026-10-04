# ĐỘC ĐẠO PRODUCTION CONTRACT — 2026-10-05

Status: READY FOR EXACT-SHA USER CLOSURE — NOT YET CLOSED/LOCKED. Feature `dao-poison`; initial SHA `d1573bdf046a734c7493a4a3f45aaedc5faf4805`.

Identity: **GIEO → DƯỠNG → CÔNG TÂM → GIỮ HOẶC PHỆ**. Attrition and target erosion with conditional cash-out; no hard CC, generic armor shred, generic damage stack or global stat conversion.

Scope: Poison content, feature-owned helpers/class in the existing contract/combat files, five-stat/mastery/Auto integration seams, scoped QA and evidence. Combat V3, Sword, Fist, Body, Mind, Spell and retired elemental equipment remain regression locks. Collection, equipment balance, alchemy, economy and reincarnation/global balance are deferred.

Độc Chủng is Main-only, bound to exactly one current target, stage 0–4 (Nhiễm Độc / Thực Cốt / Nhập Mạch / Công Tâm). Explicit successful application events bind/reset; reads never change target ownership. A new binding discards old stage permanently. Hunt carry resets core and pending target packets; rebases only remaining Độc Tức hold. Death/battle reset clears target state. No target dictionary.

Consume snapshots target, stage, Công Tâm, intended maximum and root provenance at prepare. Commit once only after canonical landed payoff on the same bound target, including shield absorption. Dodge, interrupted cast, dead target and generated callbacks do not spend. Full Công Tâm has exactly one 1.5 coefficient authority; Transform has no Công Tâm multiplier and spends at most two. Full consume retains stage 1, never stage 4.

Targeted applications require a landed direct root. Mist is explicitly a deployed field exception; scheduled finite ticks never reroll Dodge. Insects has no upfront stage: completed channel with a landed tick grants stage once; interruption preserves resolved damage only. Calamity adds two stages, never 0→4. Ordinary mastery cannot bypass setup.

DoT snapshots source skill/root/proc depth, coefficient, five-stat packet/baseline/power, finite ticks and interval. Ticks read live stage only for the exact currently bound target; old-target packets finish without retargeting. Roots may overlap, but each packet is scheduled once, never recursively. Accounting is not a third resource.

Ten stable skills/families: Basic CL; Bone CL+TPH; Heart CL+TT; Insects CL+LL; Mist CL+TT+TPH; Transform CL+TPH; Guard TP; Consume CL+TT; Calamity CL+LL; Ultimate CL+TT. Exactly Basic + eight Actives + Ultimate, maximum five equipped Actives. Ultimate uses canonical Gauge 100, zero CN and unavoidable damage, with bounded four-second Auto hold.

Eight passives: p1 real root generation (every three eligible roots); p2 one extra roll/root; p3 hold/decay; p4 bounded DoT duration; p5 cap; p6 DoT threshold efficiency; p7 Main-only high-stack full consume retention/quality; p8 Main-only real Công Tâm transition peak hold. Secondary owns eligible Độc Tức and bounded utility for actual Main DoTs, never core/actives/rotation/generic damage/armor penetration/Gauge.

Mastery: all ten rows have executable cumulative 100/250/500/750/1000 local deltas; skill-local effects, CN/timing, finite DoT/completion/defense/payoff. No synthetic full stage, recursion, free Ultimate or generic stat law.

Auto: emergency Guard, stage-four full Consume for equipped consume kits, conditional partial Transform with active Mist and sufficient dwell, setup and finite DoT refresh, safe channel, bounded Ultimate hold, Basic fallback. Sustain kit holds stage four between Ultimates. Manual shares all authority.

Fixed benchmark: CombatKernel V3; seeds 64001,64019,64033,64051,64067,64081,64109,64123,64151,64171,64189,64217; 180 seconds; base 100 each primary axis +300 allocation; all eight passives Lv20 and ten mastery tiers1000; Basic + exactly five Actives + Ultimate. Neutral target HP50m, Defense200, ordinary basic incoming pressure; correctness scenarios separately cover Guard/interrupt/swap/death.

| Archetype | CL/TP/TPH/LL/TT | Five Actives | Band |
|---|---|---|---|
| Công Tâm | 155/25/15/30/75 | bone,heart,insects,consume,calamity | 100% reference |
| Vạn Độc | 105/25/20/90/60 | bone,heart,insects,mist,calamity | 90–97% |
| Độc Vụ | 85/30/60/30/95 | bone,heart,mist,transform,guard | 85–92% |

Identity gates: all runs genuinely reach stage four; Công Tâm successful full consume and real setup; Vạn Độc DoT share ≥50%, leading tick/application/uptime and stage-four hold, fewer normal consumes; Độc Vụ real Mist and partial Transform, setup/DoT and local TT/TPH contribution. Stage leaks and duplicate transactions zero. One Poison-owned tuning lever at a time after valid correctness/parity/identity; stop inside bands.

The feature stayed `closureReady:false` until all44prerequisites, Fast and identity-valid benchmark bands passed. It is now `closureReady:true`. Exact-SHA user Windows FULL CLEAN + scoped closure is required before CLOSED/LOCKED.
