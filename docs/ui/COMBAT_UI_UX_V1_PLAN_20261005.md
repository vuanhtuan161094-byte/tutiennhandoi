# COMBAT UI/UX V1 — EXECUTION PLAN

Status: **ACTIVE PLAN — C0A DESIGN COMPLETE**  
Owner: Presentation  
Gameplay authority: read-only locked Combat Backend + 8 Main Dao  
Primary viewport: 390×844, responsive rather than fixed-canvas

## Product goal

Combat must feel like an actual xianxia battle rather than a debug dashboard.

The UI must make the combat loop legible without requiring the player to understand backend terminology.

Core question:

> At any moment, can the player tell what is happening, what is about to happen, and what their Dao is preparing?

## C0 — Architecture / presentation-data contract

C0A source audit + data-contract design is complete. See docs/ui/COMBAT_UI_C0_ARCHITECTURE_AUDIT_20261005.md. C0B implementation is intentionally deferred until an executable bridge/Godot gate is available.

Before visual changes:

1. audit current Combat Presentation Model / DOM/Pixi owners;
2. audit Godot combat bridge/projection;
3. define one presentation-safe combat snapshot for the production client;
4. map locked backend fields rather than recomputing them;
5. map all eight Main Dao UI projections;
6. define transient-event contract for hit/heal/shield/interrupt/consume/counter/Break/etc.;
7. define pre-fight / active / result state ownership;
8. identify legacy duplicate geometry/state owners to retire later.

C0 output must include an explicit field map and ownership table.

No gameplay change.

## C1 — Combat screen shell

Logical layout is pre-specified in docs/ui/COMBAT_UI_LAYOUT_WIREFRAME_V1_20261005.md; exact runtime geometry remains subject to real screenshot review.

Create stable portrait composition:

- upper enemy/Boss combat zone;
- lower player combat zone;
- central action/readability lane;
- safe zones for telegraph and transient text;
- bottom combat controls/skill zone.

Requirements:
- battlefield remains visually dominant;
- character/enemy art is not buried by cards;
- no viewport-specific MutationObserver geometry owner;
- no new CSS/Godot patch layer merely to override the previous one.

## C2 — Vital HUD

Always-readable authoritative state:

Player:
- HP;
- Chân Nguyên;
- Ultimate Gauge;
- essential defensive/status state.

Enemy:
- identity;
- HP;
- Break/Thất Thế;
- boss phase/mechanic only when authoritative.

Rules:
- bar geometry uses authoritative magnitude/ratio;
- formatted display values are display-only;
- hierarchy must survive combat chaos.

## C3 — Skill rail

Display exactly the equipped production combat kit:

- Basic;
- 5 Active;
- Ultimate as a distinct high-priority control/state.

Show:
- icon;
- cooldown;
- insufficient CN;
- cast/channel state;
- disabled reason where available;
- Auto-selected/queued feedback;
- Ultimate ready state.

Do not create fake manual-cast behavior if runtime does not support it.

## C4 — Main Dao widget

One shared widget frame, eight Dao-specific projections.

### Kiếm
Show the locked short-cycle sword resource and spend/readiness state.

### Quyền
Show Quyền Thế / chain-heavy readiness as authored by the locked runtime.

### Thể
Show Phản Thế and retaliation readiness.

### Thần Niệm
Show Thần Ấn and the relevant Nhiễu / Ảnh / Kích readiness states without inventing a new resource.

### Pháp
Show Pháp Luân form progress and Diễn Pháp readiness.

### Độc
Target-owned Độc Chủng 0–4, Công Tâm state, plus long-cycle context only when useful.

### Trận
Show:
- deployed/absent;
- Dưỡng Độ;
- Độ Bền;
- Đại Thành readiness.

### Ngự Khí
Show:
- 1–3 internal Khí Linh;
- Merge / Đại Khí Linh window;
- never imply external collection artifacts are these sources.

Acceptance:
a player can identify the current Dao loop from the widget without opening a detail sheet.

## C5 — Combat feedback

Define visual hierarchy for:

- normal damage;
- strong/critical-style authored events;
- DoT;
- heal;
- shield;
- dodge/miss;
- Break;
- Thất Thế;
- counter;
- interrupt;
- consume/payoff;
- major Dao transitions;
- Ultimate.

Do not show every backend event with equal prominence.

Use tiers:
1. lethal/tactical;
2. identity payoff;
3. normal damage;
4. background ticks.

## C6 — Enemy / Boss telegraph

Make cast/channel mechanics visually actionable.

Show:
- enemy cast progress;
- channel progress;
- dangerous move warning;
- interruptible window where authoritative;
- Break opportunity;
- Boss phase/mechanic signal.

This is required so mechanics such as interruption, Nhiễu and counterplay are understandable.

## C7 — Auto Combat UX

Auto must appear intentional rather than random.

Show concise presentation feedback such as:
- next/selected skill highlight;
- major held readiness state;
- why a signature payoff is being held when that reason is already runtime-authored or safely mapped.

Examples of state presentation:
- Độc: Công Tâm → Consume readiness;
- Trận: Đại Thành → Full activation readiness;
- Ngự Khí: 3 Khí Linh / Merge window.

Do not expose internal debug scoring.

## C8 — Boss / prefight / detail UX

Separate:

### Prefight
Compact decision surface:
- Boss identity;
- readiness;
- important mechanic;
- blocker;
- progression purpose.

### Active combat
Prefight block collapses.
Battlefield becomes primary.

### Detail sheet
Deeper information:
- mechanic explanation;
- counters;
- contextual stats that are actually authoritative.

Do not invent loot or power-score truth.

## C9 — Polish

Only after C0–C8 are structurally stable:

- skill-button animation;
- hit flash;
- screen shake;
- camera punch;
- aura;
- Dao-state transitions;
- VFX;
- sound hooks;
- final xianxia ornament.

Effects must reinforce information, not hide layout defects.

## Visual direction

- portrait/mobile first;
- xianxia;
- art-first battlefield;
- restrained HUD;
- dark translucent information surfaces;
- ivory/gold structure;
- danger accents only where meaningful;
- readable, thumb-safe controls;
- avoid dashboard/card-wall appearance.

## Slice acceptance

Every implementation slice must declare:
- paths it owns;
- paths it must not change;
- authoritative input fields;
- target viewport(s);
- technical gate;
- required runtime screenshot states.

UI closure requires explicit user visual approval.

## Deferred until after Combat UI

- Core Balance 8 Đạo;
- equipment rework;
- Tri Kỷ rework;
- Linh Thú rework;
- Pháp Bảo/Chí Bảo collection rework;
- global auxiliary balance.
