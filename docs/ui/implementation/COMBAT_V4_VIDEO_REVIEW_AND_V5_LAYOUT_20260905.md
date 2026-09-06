# Combat V4 Video Review → V5 Bottom-Anchored Layout

Date: 2026-09-05  
Canonical mobile review size: 390×844  
Source baseline: V129 + cumulative Combat V1/R1/V2/R3/V3/V4 patches supplied/tested in this UI phase.

## 1. Evidence reviewed

The 92.6s one-click DEV Auto QA recording was reviewed across the pre-fight state, all 8 Dao passes, Phá Thế/Thất Thế, dense status stress, counter window, actor/boss states, FX primitives, and the final real backend fight/replay.

Representative observations from the recording:

- 0–42s: the top ~100–220px is visually underused. Boss HUD is high, but the Boss actor begins much lower because the arena starts below the HUD and V4 adds `top:20%` again to the Boss actor.
- 0–42s: the bottom has no visual foundation because V2 R2 hides the global bottom navigation. Skills/resources therefore read as floating ornaments instead of a deliberate HUD dock.
- 48s: `CỬA PHẢN CÔNG` is presented as a large central caption and competes with Boss art. This is a hierarchy problem, not an asset problem.
- 66–72s: real backend replay shows that telegraph + skill callout + damage numbers + actor art can all be active together. Central text treatment scales poorly under real combat density.
- 78s+: defeat presentation confirms the need for a stable bottom skeleton across transient states; the scene should not recompose vertically every time one overlay appears/disappears.

## 2. Root causes

### 2.1 Double vertical offset on the Boss

Before V5:

- Arena begins at roughly 76px from top.
- V4 Boss actor then starts at 20% of the arena.

At 390×844 this creates roughly another 110–140px of empty scene before the Boss art begins. That is the largest source of the "top is empty" impression.

### 2.2 V2 immersive-shell decision removed the screen's visual base

`styles.css` V2 R2 explicitly set Hunt to one grid row and `display:none` on `.bottom-nav`. The older canonical Hunt shell already had a purpose-built bottom navigation. Removing it made the lower combat area visually unanchored.

### 2.3 Combat information was split between actor-space and screen-space without a stable final dock

V4 improved telemetry density, but Dao meters, skill rail and CTA/log did not share a permanent vertical rhythm. The screen therefore changed balance between pre-fight and combat states.

### 2.4 Generic captions were too prominent

Counter windows, pose QA labels and ordinary skill callouts used the same central visual region that should belong to actors and VFX. Important information was technically visible but visually expensive.

## 3. V5 layout model

V5 uses four visual bands while preserving backend/gameplay truth.

### Band A — Encounter header (~0–14%)

Always / near-always:

- Exit to Phiêu Lưu
- Area/floor/Boss context
- Auto state
- Boss name
- Boss HP
- Phá Thế

Conditional:

- Phase
- Boss status icons
- Telegraph
- Thất Thế/Ổn Thế window

### Band B — Battlefield (~11–79% of combat viewport)

World-space only:

- Player actor
- Boss actor
- projectiles / impacts / fields
- damage/heal numbers
- actor state animation

The Boss no longer receives a second 20% top offset. Player is also raised by allowing the actor to terminate at the arena floor immediately above the bottom HUD dock.

### Band C — Combat dock (~79–100% of combat viewport)

Stable order:

1. Dao resource(s) + Ultimate gauge
2. Auto skill timeline
3. Compact combat report OR pre-fight CTA

The slot used by compact report during combat is reused by `KHIÊU CHIẾN BOSS` during pre-fight. This prevents the entire layout from shifting between states.

### Band D — Global bottom navigation

The app's existing 6-route canonical navigation is restored as a real shell row. Hunt remains grouped under `Phiêu Lưu` for now; navigation information architecture is not redesigned inside the Combat task. That should be reviewed in the Home/vertical-slice phase.

## 4. 390×844 geometry target

With a 64px app navigation row, the Combat viewport is approximately 780px high.

| Element | V5 target |
|---|---|
| Top controls | 8–36px |
| Boss core HUD | 42–96px |
| Boss status / telegraph | ~97–140px when present |
| Arena | 84px → 672px |
| Boss actor | starts ~96px; up to ~341px tall |
| Player actor | ends at ~672px; up to ~347px tall |
| Player HUD | ~452–500px |
| Player statuses | ~507px |
| Dao/Ultimate meters | ~672–689px |
| Skill rail | ~691–741px |
| Combat report / pre-fight CTA | ~743–777px |
| App bottom nav | final ~64px |

This geometry deliberately uses the previously empty top/middle area while still reserving a deterministic bottom dock.

## 5. Information hierarchy after V5

### Tier 1 — persistent combat truth

- Boss HP
- Phá Thế
- Player HP
- CN readout (subject to the existing authoritative-stream limitation already documented)
- Dao resources
- Ultimate gauge
- Auto skill rotation/cooldown state
- Bottom navigation

### Tier 2 — contextual only

- Buff/debuff/marks
- Phase
- Telegraph
- Thất Thế / Ổn Thế
- Counter window
- shield cue

### Tier 3 — progressive disclosure

- Full combat report
- Monster details
- Floor/farm details
- internal/debug explanation

## 6. Combat report behavior

V5 restores a 34px compact report row in active/field combat.

- Tap report → full combat report expands upward.
- `×` → compact row hides.
- Small `Chiến báo` pill → restores it.
- Visibility preference is stored locally; it does not mutate the game save.
- Pre-fight hides the report and uses that exact row for the single Boss CTA.

## 7. One-click DEV QA

The existing one-button Auto QA remains the required visual review workflow. V5 adds an explicit `CHIẾN BÁO` segment:

- compact
- expanded
- hidden
- restored

It still covers all 8 Dao and ends with a real `endlessFight` + authoritative event replay.

## 8. Backend / gameplay boundaries

V5 does not change:

- CombatKernel
- skill AI / rotation
- damage/heal formulas
- Phá Thế mechanics
- rewards
- Boss progression
- backend actions

Known presentation-contract gaps from the earlier backend audit remain separate work items and are not faked by V5 (notably continuous authoritative CN streaming and full Phá Thế lifecycle parity between event paths).

## 9. Asset decision

No new render is required for V5 geometry validation.

The current player, Boss and environment assets are sufficient to determine layout quality. New art should only be produced after V5 visual QA locks geometry. The previously identified background with baked-in text remains an asset-cleanup item, not a layout blocker.

## 10. Acceptance criteria for V5 visual QA

At 390×844, one Auto QA video should confirm:

1. Bottom navigation is always a stable visual base.
2. Skills sit immediately above the combat report/nav stack and never float in empty space.
3. Boss art begins close to Boss HUD; no large dead top band remains.
4. Player art occupies lower battlefield without colliding with skill/report/nav.
5. Phá Thế is readable in normal, pressure, broken and recovering states.
6. Dense status + P3 + telegraph does not cover actor silhouettes.
7. Counter/caption treatment no longer dominates the center.
8. Full log expands upward and can be hidden/restored.
9. Pre-fight uses the same lower skeleton with CTA replacing report.
10. 8 Dao, including Formation's larger meter set, fit without horizontal overflow.
