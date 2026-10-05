# COMBAT UI — LOGICAL WIREFRAME V1

Status: **DESIGN READY — NOT RUNTIME-APPROVED**
Primary reference: portrait 390×844
Rule: proportions are layout intent, not hard-coded pixel coordinates.

## 1. Core composition

~~~text
+---------------------------------+
| Safe area / compact top actions |
+---------------------------------+
| ENEMY HUD                       |
| Name · Lv · HP · Break          |
| Boss phase / mechanic affordance|
+---------------------------------+
|                                 |
|          ENEMY ACTOR            |
|      target marks nearby        |
|                                 |
+-------- TACTICAL LANE -----------+
| cast / channel / telegraph      |
| BREAK · interrupt · big payoff  |
+---------------------------------+
|                                 |
|          PLAYER ACTOR           |
|   source/field VFX around actor |
|                                 |
+---------------------------------+
| PLAYER VITALS + DAO WIDGET      |
| HP · CN · Gauge                 |
| Dao core/readiness              |
+---------------------------------+
|  Active 1 2 3 4 5              |
| Basic   AUTO/status   ULTIMATE  |
+---------------------------------+
~~~

Battlefield/art must occupy more visual weight than UI chrome.

## 2. Information anchors

Do not force every Dao into the same bottom progress bar.

There are four presentation anchors.

### A. Self anchor

Near player HUD.

Use for:
- Kiếm Khí / Kiếm Ý;
- Quyền Thế;
- Phản Thế;
- Pháp Luân;
- player-owned long-cycle stacks.

### B. Target anchor

Near enemy HUD/actor.

Use for target-owned state:
- Độc Chủng / Công Tâm;
- Thần Ấn.

This visually explains that changing target changes the state.

### C. Field anchor

Near the tactical lane/battlefield floor.

Use for:
- Trận deployed field;
- Đại Thành state;
- field integrity emphasis when critical.

The detailed Dưỡng/Bền meters can remain near player HUD while field readiness receives a battlefield cue.

### D. Source anchor

Around/near player actor with a compact HUD fallback.

Use for:
- Ngự Khí 1–3 Khí Linh;
- Đại Khí Linh Merge state.

The orbit/source VFX is presentation; the count comes from backend authority.

## 3. Enemy HUD

Keep compact.

Always:
- name;
- level;
- HP;
- Break/Thất Thế if active in this encounter.

Conditional:
- BOSS tag;
- phase;
- mechanic info affordance;
- dangerous cast.

Do not keep large prefight briefing over active combat.

## 4. Tactical lane

Reserved for the highest-value time-sensitive information.

Priority:

1. lethal Boss telegraph;
2. interrupt/counter window;
3. Break / Thất Thế window;
4. major Dao payoff;
5. ordinary skill callout.

Only one dominant tactical message at a time.

## 5. Player vitals

Compact horizontal hierarchy:

~~~text
HP  █████████████
CN  ███████
ULT ◇ 73/100
~~~

Ultimate ready:
- strong but controlled visual emphasis;
- no continuous screen-filling glow.

## 6. Skill rail

This is an **Auto-combat information rail**, not a fake manual-control bar.

### Upper row

Five Active slots:
- equal footprint;
- icon;
- cooldown ring/mask;
- cast/channel progress;
- unavailable state;
- Auto-selected highlight.

### Lower row

Left:
- Basic.

Center:
- Auto state;
- speed control only if runtime supports it;
- compact battle status.

Right:
- Ultimate, larger than ordinary slots.

All seven equipped production skills remain visible.

## 7. Dao widget behaviour

The widget frame is shared; its internal grammar changes by Dao.

### Kiếm
- 5 Kiếm Khí pips;
- thin Kiếm Ý line/stack indicator;
- spend-ready cue.

### Quyền
- Quyền Thế pips;
- heavy/payoff readiness cue;
- long-cycle stack kept secondary.

### Thể
- prominent 0–100 Phản Thế bar/ring;
- retaliation readiness pulse only on real state.

### Pháp
- 3-segment Pháp Luân;
- expected next form label;
- Diễn Pháp readiness changes the ring state.

### Độc
Enemy-side:
- 4 Độc Chủng pips;
- stage 4 becomes **Công Tâm**.

Player-side:
- compact Độc Tức long-cycle indicator.

### Trận
- Dưỡng horizontal meter;
- Bền thinner structural meter;
- deployed/absent state;
- Dưỡng100 = **Đại Thành**;
- field VFX reinforces but does not replace numeric readability.

### Ngự Khí
- 1–3 source pips/orbs;
- matching actor orbit if assets/VFX exist;
- Merge state replaces ordinary source cue with **Đại Khí Linh** and an authoritative duration indicator.

### Thần Niệm
Enemy-side:
- Thần Ấn pips.

Player-side:
- compact Ảnh/flow/readiness cue only from real exported state;
- do not display a fabricated all-purpose Mind mana bar.

## 8. Combat feedback hierarchy

### Tier 1 — tactical
- Break;
- interrupt;
- counter success/failure;
- lethal telegraph;
- death.

### Tier 2 — Dao identity payoff
- Công Tâm consume;
- Đại Thành activation;
- Đại Khí Linh;
- Diễn Pháp;
- major retaliation/echo payoff.

### Tier 3 — strong hit
- large damage;
- authored crit/Hội Tâm style result;
- shield break.

### Tier 4 — background
- ordinary hit;
- DoT tick;
- small heal/shield;
- passive stack tick.

Tier 4 must never obscure Tier 1.

## 9. Prefight state

Before battle, the active battlefield may show a compact decision surface:

- Boss;
- readiness;
- one mechanic summary;
- blocker;
- challenge action.

When combat begins it collapses automatically.

## 10. Result state

Result overlay is short:

- thắng/thua;
- progression result;
- one next action.

Detailed combat log remains optional/expandable.

Do not imply Boss direct loot when the canonical result is progression-only.

## 11. Responsive constraints

At minimum later verify:
- 360×800;
- 390×844;
- 412×915;
- 430×932.

Rules:
- no horizontal overflow;
- 44px minimum meaningful touch target;
- actor art does not collide with skill rail;
- target marks do not collide with enemy HP;
- tactical lane remains free from persistent metadata;
- skill rail never hides equipped slots.

## 12. What is intentionally not decided yet

Until real runtime screenshots exist, do not hard-lock:
- exact pixel coordinates;
- exact font sizes;
- final icon art;
- final VFX color/intensity;
- character sprite scale;
- camera offset;
- animation durations.

Those require executable Godot evidence and user visual approval.
