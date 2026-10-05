# COMBAT UI C0 — ARCHITECTURE / DATA-CONTRACT AUDIT

Status: **C0A DESIGN COMPLETE — C0B IMPLEMENTATION NOT YET STARTED**
Audit HEAD: ffe863d800937dc969f7c91424f20b0c0d8a2a19
Date: 2026-10-05

## 1. Decision

The production Combat UI must consume **one presentation contract**.

Target flow:

~~~text
Locked CombatKernel / Session / Hunt
        |
        +-- authoritative battle state
        +-- v2ResourceProjection / Dao-specific read helpers
        +-- canonical Combat event stream
                    |
                    v
       Combat Presentation Snapshot V2
       Combat Presentation Events V2
                    |
          +---------+---------+
          v                   v
   Web DOM/Pixi          Godot Bridge
                              |
                              v
                     CombatViewModel
                              |
                              v
                     Godot Combat Scene
~~~

No GDScript formula may reconstruct damage, cooldown, Dao resources, Boss outcomes or rewards.

## 2. Current source owners found

### Gameplay/read authority

- dist/core/combat-kernel-v2.js and production consumers remain gameplay authority.
- dist/core/hunt-combat-stream.js already adapts real CombatKernel logs into a typed presentation event stream.
- dist/core/battle-dao-v2-runtime-base.js::v2ResourceProjection() exposes a substantial part of Main-Dao runtime state.

### Web presentation

- modules/combat-presentation-architecture-v140.js is the intended canonical presentation boundary.
- modules/combat-dom-renderer-v1.js applies presentation-only DOM changes.
- modules/combat-presentation-runtime-v140.js is the renderer facade.
- ui-combat-target-v1.js still observes DOM/transient state and remains a migration/containment seam.
- modules/hunt-combat-v2.js still contains substantial legacy presentation ownership.

### Godot presentation

- godot/backend/bridge_server.mjs currently exposes only /home, /character and actions.
- godot/scripts/core/backend_bridge.gd only knows Home and Character DTOs.
- There is **no canonical Godot Combat DTO, CombatViewModel, combat poll/event route or combat scene authority yet**.
- godot/scripts/combat/combat_feedback.gd already provides presentation-only shake/flash/punch/damage-number helpers and correctly refuses to own gameplay timing.

This missing Combat DTO is the main C0 implementation gap.

## 3. Current presentation-model gap

buildCombatPresentationModelV1() currently focuses on:

- enemy identity;
- Boss readiness/mechanic;
- challenge state;
- Săn Ảo context;
- post-combat result.

It does **not** own a complete active-combat snapshot for:

- player vitals;
- enemy vitals;
- skill rail state;
- cast/channel progress;
- cooldown state;
- Auto selection;
- full eight-Dao resource/readiness state.

Those are still supplied through other live Hunt/DOM/runtime paths.

Production Godot UI must not copy that fragmentation.

## 4. Existing Dao projection that can be reused

The locked runtime already exposes these presentation-safe values through v2ResourceProjection() or an adjacent locked read helper.

| Dao | Authoritative display state already available / derivable without formula |
|---|---|
| Kiếm | swordQi, swordIntentV2, intent cap |
| Quyền | fistForce, force cap, passive stack, active domain timestamp |
| Thể | counterForce, passive stack |
| Pháp | lawWheel, lawWheelExpectedForm, dienPhapReady, passive stack |
| Độc | target-owned poisonSeedStage, passive stack |
| Trận | formationDeployedV2, formationNurtureV2, formationIntegrityV2, formationGrandReadyV1, passive stack |
| Ngự Khí | artifactSourcesV2, artifactMergeActiveV1, artifactMergedFromV1, passive stack |
| Thần Niệm | passive stack / flow timing exists; target Thần Ấn must be projected from the locked target mark owner rather than guessed in presentation |

### Important stale presentation debt

Current web static meter metadata is not fully production-canonical:

- Ngự Khí still has a legacy display label equivalent to **Nguồn Pháp Bảo** in some presentation metadata. Production copy must say internal **Khí Linh / Nguồn Khí Linh**.
- Mind's current generic meter metadata still emphasizes older mindEchoCounter / “Niệm Ảnh” presentation while the locked production identity is **ẤN → NHIỄU → ẢNH / KÍCH**. The target-owned Thần Ấn count needs an explicit presentation projection.
- Static meter definitions do not surface key readiness flags such as Diễn Pháp, Đại Thành or Đại Khí Linh.

Do not fix this by deriving new truth in UI. Extend the presentation projection.

## 5. Combat Presentation Snapshot V2 — proposed contract

Schema: combat-presentation.v2

Top-level:

~~~text
schema
version
encounterId
snapshotSeq
authorityTime
mode
mainDaoId
player
enemy
skills
dao
auto
boss
result
eventCursor
~~~

### player

Authoritative display fields only:

- id/name;
- HP current/max/ratio;
- shield current/ratio when canonical;
- CN current/max/ratio;
- Ultimate Gauge current/max/ready;
- Break/poise only when the player side owns such an authoritative field;
- current cast/channel state;
- essential statuses.

### enemy

- id/name/level/grade/element;
- Boss flag;
- HP current/max/ratio;
- shield;
- Break/Thất Thế magnitude/state;
- current cast/channel;
- essential statuses.

Formatted K/M/B strings remain display-only and are never parsed back into gameplay magnitude.

### skills

Exactly the equipped production kit:

- Basic;
- five Active;
- Ultimate.

Per slot:

~~~text
id
name
slotClass
form
iconKey
cooldownRemaining
cooldownTotal
ready
spiritCost
blockedReason
castState
channelState
autoSelected
~~~

The DTO maps runtime truth. It does not decide which skill should be used.

### auto

Presentation-safe Auto state only:

- enabled;
- selected/next skill id if the runtime already exposes it;
- optional authored reason code;
- held-signature/readiness state when explicitly exported.

Never expose hidden AI score as player-facing truth.

## 6. Dao projection V2

Use one generic envelope:

~~~text
dao: {
  id,
  label,
  anchorKind,
  primary,
  secondary,
  readiness[],
  timers[]
}
~~~

anchorKind is presentation metadata, not gameplay:

- self
- target
- field
- sources

### Kiếm — self

Primary:
- Kiếm Khí / cap.

Secondary:
- Kiếm Ý / cap.

### Quyền — self

Primary:
- Quyền Thế / cap.

Secondary:
- Liên Kình/passive stack where learned.

Readiness:
- authored domain/heavy state only when exported.

### Thể — self

Primary:
- Phản Thế 0–100.

Secondary:
- passive long-cycle stack if currently learned.

### Pháp — self

Primary:
- Pháp Luân stage;
- expected next form.

Readiness:
- Diễn Pháp ready.

Secondary:
- Pháp Ý stack.

### Độc — target

Primary:
- current target Độc Chủng 0–4.

Readiness:
- Công Tâm when stage reaches authored stage 4.

Secondary:
- Độc Tức remains player-owned long cycle.

Target swap/death must come from runtime target ownership.

### Trận — field

Primary:
- deployed;
- Dưỡng;
- Bền.

Readiness:
- Đại Thành.

Secondary:
- Trận Văn.

### Ngự Khí — sources

Primary:
- Khí Linh source count 1–3.

Readiness:
- Đại Khí Linh Merge window;
- merged-from count where active.

Secondary:
- Khí Cảm.

Never label these sources as external collection Pháp Bảo.

### Thần Niệm — target + self

Target:
- Thần Ấn count from locked target mark authority.

Self:
- Niệm Ảnh / flow / snapshot readiness only where an authoritative read exists.

Secondary:
- locked long-cycle passive stack.

Do not manufacture a new “Mind resource” to make the HUD symmetrical.

## 7. Presentation Events V2

The existing canonical Hunt combat stream is a strong base.

Normalize at least:

- battle.start;
- battle.end;
- skill.cast.start;
- skill.channel.start;
- skill.channel.tick;
- skill.channel.complete;
- skill.channel.interrupt;
- skill.travel;
- combat.damage;
- combat.dot;
- combat.heal;
- combat.shield;
- combat.shield.break;
- combat.dodge / combat.miss when authoritative;
- combat.interrupt;
- combat.break;
- combat.status;
- combat.mark;
- combat.resource;
- dao.readiness;
- boss.phase;
- boss.telegraph;
- boss.counter.open/success/failure;
- actor.death.

If the source runtime does not emit an event, presentation omits it rather than inferring it.

## 8. Godot bridge transport design

C0B should add a read-only combat lane.

Proposed route:

GET /combat?after=<eventCursor>

Response:

~~~text
{
  ok: true,
  schema: "godot-combat-bridge.v1",
  bridgeVersion: "...",
  snapshot: CombatPresentationSnapshotV2,
  events: CombatPresentationEventsV2[],
  eventCursor: number
}
~~~

Rules:

- poll only while a Combat screen is mounted;
- eventCursor is monotonic within the encounter;
- replaying the same cursor must be idempotent;
- UI may skip old purely cosmetic events after reconnect, but must render the newest authoritative snapshot;
- pending presentation callbacks are never gameplay authority;
- bridge transport failure may freeze/recover presentation but must not mutate CombatKernel.

Exact poll frequency is an implementation/performance decision, not gameplay timing.

## 9. Web/Godot parity rule

Web and Godot may have different renderers.

They must share semantic contract for:

- HP;
- CN;
- Gauge;
- Break;
- skill states;
- Dao resources/readiness;
- Boss telegraph;
- results.

Do not port DOM geometry into Godot.

## 10. C0B implementation tasks

When an executable environment is available:

1. add canonical Combat Presentation Snapshot V2 builder;
2. add/extend event adapter without changing CombatKernel outcomes;
3. add bridge /combat;
4. add Godot combat_updated / event signal path;
5. add CombatViewModel;
6. add bridge fixture/smoke tests;
7. add GdUnit mapping tests;
8. verify reconnect/idempotence;
9. run KIEM_TRA_GAME.cmd;
10. only then start C1 visual implementation.

## 11. C0 acceptance

C0A design: **COMPLETE**.

C0B is complete only when:
- no gameplay authority moved;
- all eight Dao have truthful UI projections;
- Godot consumes a canonical Combat DTO;
- duplicate event delivery is guarded;
- bridge/unit tests pass;
- Godot executable gate passes.

No visual approval is claimed by C0.
