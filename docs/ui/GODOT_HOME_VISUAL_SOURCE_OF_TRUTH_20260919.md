# GODOT HOME — VISUAL SOURCE OF TRUTH

Date: 2026-09-19  
Status: DESIGN / IMPLEMENTATION SPEC — NOT RUNTIME APPROVAL  
Primary viewport: **390 × 844**  
Scope: Godot Home / Động Phủ presentation migration only

## 1. Authority order

For this Godot Home slice, resolve conflicts in this order:

1. current `main` canonical runtime / bridge data and action authority;
2. this document for Godot Home composition and visual grammar;
3. the user-provided Home target image from 2026-09-19 for visual silhouette / art direction;
4. existing approved production Godot assets;
5. current Godot Home candidate only as implementation material, never as visual authority.

This specification does **not** reopen V160–V179 runtime authority and does **not** invalidate the previously approved web Home closure. It supersedes the current Godot Home candidate **only for Godot presentation direction**.

The user-provided Combat target image from the same conversation is the companion visual reference for later Combat work, not a Home data contract.

## 2. Visual target in one sentence

A **chibi/manhua xianxia cultivation home scene** where the immortal world and meditating character dominate the screen, while cultivation data floats around the scene as light plaques, chips, medallions and action orbs instead of dashboard cards.

## 3. Non-negotiable visual hierarchy

The eye must read the Home in this order:

1. **Central meditating cultivator**
2. **Realm / current-life identity**
3. **Cultivation progress**
4. **Primary advancement state when available**
5. **Four major Home actions**
6. **Bottom navigation**
7. **Resources / root / lifespan / secondary context**

The screen must never read as a business dashboard.

## 4. Reference adaptation rule

The supplied Home reference is wider than the production Godot viewport. Do **not** scale the full reference uniformly into 390 × 844.

Preserve instead:

- the vertical hierarchy;
- centered hero composition;
- floating top identity/resource language;
- open scenic negative space around the hero;
- cultivation plaque immediately below the hero;
- four glowing action destinations;
- heavy, stable bottom navigation.

On 390 px width, secondary edge rails from the reference are **reserved/deferred** unless there is a real route and a non-duplicated purpose. Never create dead or fake menu buttons merely to imitate the screenshot.

## 5. 390 × 844 screen bands

Coordinates below are composition targets, not permission to hard-code every child position. Use anchors/containers for production layout.

| Band | Y target | Purpose |
| --- | ---: | --- |
| A. Top shell | 0–52 | logo/brand + resource chips + optional system affordance |
| B. Identity | 52–138 | current-life identity left; root/lifespan right |
| C. Scenic hero | 128–528 | world art, aura, meditating cultivator; primary focal area |
| D. Cultivation plaque | 500–590 | Tu Vi progress, rate, ETA/status |
| E. Conditional advancement | 585–636 | Thăng Cảnh / Thiên Kiếp only when canonical says ready |
| F. Major actions | 628–746 | four circular action destinations |
| G. Bottom nav | 754–844 | six persistent destinations |

Bands may overlap visually by 8–20 px when the overlap improves depth, but hit targets may not overlap.

## 6. Background / world composition

### Required

Use a full-bleed immortal mountain/cave world with:

- blue/cyan mountain depth;
- cloud/fog layers;
- waterfall / pavilion silhouettes where the production background provides them;
- darker lower foreground to support action/nav readability;
- central open light pocket behind the cultivator.

Current production source:

- `godot/art/approved/home/home_background.webp` via `home_runtime_atlas.json`

The background must stay visible. HUD opacity must not cover more than roughly one third of the scenic surface with dark plates at once.

### Prohibited

- full-width opaque dashboard rows over the center;
- large rectangular cards behind every statistic;
- flat monochrome page background;
- debug transport/version text as persistent player-facing content.

## 7. Central hero

Current approved asset:

- `godot/art/approved/home/home_hero_standing.webp`

Portrait asset for identity medallion:

- `godot/art/approved/home/home_portrait_standing.webp`

### Hero target

- horizontal center = viewport center;
- visual body center approximately X 195;
- main visible body target approximately Y 250–500;
- aura may extend to approximately 250–290 px diameter;
- character must remain the single largest high-detail object on the page;
- bottom of the seated figure should visually connect to the cultivation plaque/pedestal area.

### Motion

Presentation-only:

- breathing vertical drift: about 1.5–2.5 px;
- breathing scale: <= 0.5%;
- outer aura slow pulse;
- inner aura asynchronous pulse;
- sparse qi/spark drift;
- no combat-like screen shake or aggressive VFX on Home.

Respect reduced-motion policy when added globally.

## 8. Top shell

The target image uses a decorative game mark plus economy chips. For Godot:

### Left

Brand mark / title:

- `Tu Tiên Nhàn Dỗi`
- decorative, compact, no runtime/debug subtitle below it;
- should occupy roughly 92–115 px width.

A production logo asset is preferred when available. Plain text is acceptable only as an implementation fallback and is not sufficient reason to block data/layout work.

### Right

Only canonical resources exposed by current HomeViewModel:

1. **Linh Thạch** ← `resources.spirit_stone`
2. **Luân Hồi** ← `resources.reincarnation_cp`

Visual grammar:

- small pill/chip;
- icon + compact formatted value;
- translucent blue-black glass;
- gold/cyan accent;
- no third economy resource unless backend adds one.

System/settings affordance is app-shell scope. Do not fake it in Home data.

## 9. Identity cluster — upper left

This cluster visually replaces the broad rectangular identity card of the current candidate.

### Always visible

- portrait medallion;
- `Đời {life_number}`;
- `{realm}`;
- compact `Tu Vi current / required` may appear as a thin sub-bar only if it does not duplicate the main cultivation plaque excessively.

Data:

- `identity.name`
- `identity.life_number`
- `identity.realm`
- `progression.tu_vi`
- `progression.required_tu_vi`

### Interaction

Tap the identity cluster:

- emits existing `identity_pressed`;
- opens current-life profile sheet;
- UI never mutates character/life state.

### Name visibility

The reference displays the character name. Godot may display `identity.name` in this cluster when it fits cleanly. Name is secondary to realm/life and must truncate rather than widen the cluster.

## 10. Linh Căn / lifespan cluster — upper right

This is the compact counterpart of the reference image's Linh Căn panel.

### Show

- `Linh Căn: {root_name}`
- optional small grade indicator from `root_level`;
- `Thọ nguyên còn: {remaining_life_years}` as the lifespan summary.

Data:

- `identity.root_name`
- `identity.root_level`
- `progression.remaining_life_years`

### Do not show

The supplied reference contains individual Ngũ Hành element chips. Current Godot Home bridge does **not** expose the element list here. Therefore:

- do not invent Kim/Mộc/Thủy/Hỏa/Thổ values;
- do not infer them from root name;
- add element chips only after the bridge/view model exposes canonical element data.

### Injury

If `progression.injury_pct > 0`:

- show a small warning badge associated with this cluster or identity cluster;
- detailed injury stays in the profile sheet;
- do not replace central cultivation information with injury text.

## 11. Scenic secondary rails

The reference contains left/right vertical shortcut rails.

For current Godot Home these are **DEFERRED BY DEFAULT**.

A side medallion may be rendered only when all are true:

1. it maps to a real current route/action;
2. it is not a dead placeholder;
3. it does not simply duplicate a bottom-nav destination without a Home-specific purpose;
4. Stagehand can prove the interaction.

Until then, preserve the reference's edge rhythm using environmental decoration, lanterns, cliff/pavilion silhouettes or empty scenic space rather than fake buttons.

Explicitly forbidden placeholder labels include unsupported Home shortcuts such as fake `Nhiệm Vụ`, `Túi Đồ`, `Công Pháp`, `Cửa Hàng`, `Sự Kiện`, or `Phúc Lợi` unless their canonical route is actually wired in this Godot client.

## 12. Cultivation plaque — directly below hero

This is the most important information block after the hero.

### Required visible content

- state header: `Đang tu luyện…` or equivalent calm cultivation wording;
- `Tu Vi current / required`;
- progress bar;
- `+rate / 15s`;
- ETA.

Data:

- `progression.tu_vi`
- `progression.required_tu_vi`
- `progression.progress_pct`
- `progression.rate_per_15s`
- `progression.eta_seconds`
- `progression.ready`
- `progression.transition`
- `progression.next_realm`

### Visual grammar

- one translucent dark-glass plaque;
- width target around 300–338 px;
- center aligned;
- thin cyan cultivation bar;
- rate in cyan/mint;
- ETA in neutral pale text;
- plate opacity low enough to keep world art visible.

### Interaction

Tap:

- emits existing `cultivation_pressed`;
- opens cultivation details sheet;
- detailed rate sources/hints stay in overlay, not Home surface.

## 13. Conditional advancement CTA

This is **not permanently visible**.

### Visibility

Show only when:

- `progression.ready == true`, and
- `transition` is `ascend` or `tribulation`.

### Mapping

- `ascend` → **THĂNG CẢNH** → `ascendRealmV140`
- `tribulation` → **DẪN THIÊN KIẾP** → `tribulationV140`

### Visual target

Use the reference's luminous advancement language:

- centered;
- gold/amber;
- ritual plaque / seal / glowing medallion, not a generic rectangular app button;
- stronger than ordinary quick actions but smaller than the hero.

When hidden, the major-action band reclaims the vertical space. Do not leave an empty blank CTA row.

## 14. Four major Home actions

Preserve the supplied reference's four large circular glowing destinations.

Order left → right:

1. **Bế Quan**
2. **Nhân Vật**
3. **Linh Căn**
4. **Chiến Đấu**

Production action art resolves from `godot/art/approved/home/home_icons.webp` via `home_runtime_atlas.json`. The small SVG icons remain fallback-only.

### Style

- circular/orb silhouette, approximately 64–76 px visual diameter;
- icon dominant;
- caption below orb or integrated in lower rim;
- gold, violet/cyan, mint and blue accent families may distinguish the four destinations;
- no four rectangular cards.

### Bế Quan canonical rule

Canonical source:

- `progression.retreat.enabled`
- `bank_hours`
- `cap_hours`
- `daily_hours`
- reward values.

If `enabled == true`:

- action active;
- tap opens 1h / 3h / 6h / 9h chooser, bounded by canonical cap/bank.

If `enabled == false`:

- keep the first orb position to preserve the four-orb composition;
- render it visually locked/disabled;
- it must not emit `retreat_pressed`;
- no reward estimate may be fabricated.

This is a presentation lock state derived from canonical false, not a new gameplay state.

### Other mappings

- Nhân Vật → existing `identity_pressed`
- Linh Căn → route `roots`
- Chiến Đấu → route `dungeons`

## 15. Bottom navigation

Persistent six-destination dock:

1. Động Phủ → `home`
2. Nhân Vật → `character`
3. Pháp Bảo → `artifacts`
4. Linh Thú → `pets`
5. Bản Đồ → `world`
6. Tông Môn → `faction`

### Visual target

- dark blue-black carved dock;
- active Home destination in warm gold;
- inactive destinations cool gray/blue;
- icon above caption;
- selected state may have subtle raised plate/glow;
- 44 px minimum touch target;
- dock anchored to bottom/safe area.

Do not change route authority in the nav component.

## 16. Overlays

The reference image is Home surface only. Detail belongs in overlays.

### Identity sheet

Contains existing canonical fields:

- name / life number;
- realm;
- Linh Căn;
- age / lifespan / remaining lifespan;
- injury if non-zero;
- active technique when present;
- build identity / strongest axis / bottleneck when present.

### Cultivation sheet

Contains:

- Tu Vi;
- rate;
- ETA;
- canonical rate sources;
- hints;
- Bế Quan bank/cap details when enabled.

### Bế Quan chooser

Required choices:

- 1h
- 3h
- 6h
- 9h

Rules:

- only open if canonical `retreat.enabled == true`;
- disable a choice when bank/cap cannot support it;
- dispatch existing `retreatV140` only;
- no client-side reward settlement.

Visual direction:

- ritual / meditation sheet;
- dark translucent glass + gold trim;
- bottom-sheet behavior preferred;
- must not visually resemble a desktop modal.

## 17. State matrix

### Loading / bridge connecting

- keep world/hero shell visible if assets are loaded;
- resource/data values use neutral placeholders;
- a compact connection status may appear;
- never show raw schema/version strings.

### Online normal cultivation

- bridge status hidden;
- normal scenic Home composition.

### Bridge offline/error

- show one compact player-readable status;
- do not dump backend exception/debug metadata;
- disable authoritative actions as needed.

### Phàm Nhân / Bế Quan unavailable

- Bế Quan orb locked;
- no chooser;
- no fake reward.

### Ready to ascend

- gold Thăng Cảnh CTA appears between cultivation plaque and action orbs.

### Ready for tribulation

- stronger amber/gold Thiên Kiếp CTA;
- may increase aura intensity slightly;
- no combat VFX before action is actually dispatched.

### Injury

- small visible warning marker;
- detail on profile sheet.

## 18. Existing Godot component ownership

### `home_stage.gd`

Owns only:

- background;
- foreground scenic wash/shade;
- central hero;
- aura;
- qi/spark presentation animation.

Must not own gameplay data or action availability.

### `home_hud.gd`

Owns:

- brand;
- resources;
- identity cluster;
- root/lifespan cluster;
- cultivation plaque;
- advancement CTA;
- four major action orbs;
- readable transient action status.

Must consume the HomeViewModel only.

### `home_nav.gd`

Owns only six-destination bottom dock and selected presentation.

### `home_overlay.gd`

Owns identity, cultivation and Bế Quan detail sheets.

### `home_view_model.gd`

Remains the data-shaping boundary. Presentation scripts must not query canonical JS runtime directly.

### `main.gd`

Orchestration only:

- instantiate;
- connect signals;
- bind VM;
- dispatch bridge actions/routes.

Do not move Home layout logic into `main.gd`.

## 19. Production asset policy

Production Home art is centralized by `godot/art/approved/home_runtime_atlas.json`:

- background: `home/home_background.webp`
- hero: `home/home_hero_standing.webp`
- portrait: `home/home_portrait_standing.webp`
- UI core: `home/home_ui_core.webp`
- nav/action atlas: `home/home_icons.webp`
- SVG icons under `godot/art/icons/` are fallback-only.

The user reference image is a **visual composition/art-direction authority**, not a license to crop UI graphics out of the screenshot.

Any new production art must match the same chibi/manhua family before replacing approved assets.

## 20. Typography / readability

- game title may use display/calligraphic treatment;
- gameplay labels must remain highly legible at 390 px;
- important numeric values should use stable-width or visually stable formatting where possible;
- minimum ordinary player-facing text target: roughly 11–12 logical px unless an icon/caption treatment clearly remains legible;
- outline/shadow may be used over scenic art;
- no thin pale text directly over bright waterfall/cloud without a local readability plate.

## 21. Color language

Primary families:

- deep blue-black: structural UI;
- cyan/ice-blue: Tu Vi / cultivation energy;
- jade/mint: root/life/supporting positive state;
- warm gold: selected state, advancement, high-priority cultivation affordance;
- muted gray-blue: secondary nav;
- amber/red: injury/warning only.

Avoid rainbow UI. The hero/world art should carry most of the color richness.

## 22. Acceptance criteria — screenshot visible

The 390 × 844 runtime screenshot is acceptable only if all are true:

1. central cultivator is unmistakably focal point #1;
2. scene reads as chibi/manhua xianxia, not dashboard SaaS;
3. top data does not form a heavy full-width card wall;
4. realm/life identity is readable without opening a sheet;
5. Linh Căn and remaining lifespan are readable but secondary;
6. Tu Vi, rate and ETA are visible without interaction;
7. action area reads as four glowing circular destinations;
8. Bế Quan lock/unlock is canonical;
9. advancement CTA appears only in canonical ready state;
10. bottom six-destination nav is stable and readable;
11. no raw backend/debug/version line is visible online;
12. no unsupported fake feature button is present;
13. no horizontal overflow at 390 × 844;
14. the hero is not covered by HUD or modal surfaces in normal state;
15. the screenshot has enough scenic negative space to visually match the supplied reference hierarchy.

## 23. Interaction acceptance criteria

Stagehand/runtime proof must preserve selectors or equivalent stable semantic selectors for at least:

- Home stage;
- Home HUD;
- Realm/identity;
- Cultivation progress;
- Identity tap;
- Cultivation tap;
- Bế Quan action;
- primary advancement CTA;
- active overlay sheet;
- bottom-nav destinations.

At minimum prove:

1. Home data populates from bridge;
2. identity opens/closes;
3. cultivation details opens/closes;
4. locked Bế Quan cannot dispatch;
5. enabled Bế Quan opens chooser;
6. a valid hour dispatches canonical action;
7. Linh Căn route request works;
8. Chiến Đấu route request works;
9. conditional primary CTA dispatches only its mapped canonical action.

## 24. Implementation sequence

Do not polish randomly. Implement in this order:

1. lock 390 × 844 structural bands;
2. central hero/pedestal/aura composition;
3. top shell + identity + root/lifespan;
4. cultivation plaque;
5. conditional advancement CTA;
6. four action orbs;
7. bottom nav refinement;
8. overlay visual language;
9. Stagehand selector/interaction update;
10. local verify;
11. deterministic screenshot;
12. visual self-audit against this spec and the user reference;
13. user approval;
14. only then approve/update visual baseline.

## 25. Current candidate status

Godot Home HEAD at the time this spec was authored:

- `4627cadaf6cd955b79d700fc0f7a633563ef61df`

That candidate improved anchoring/component structure but is **not visually approved** against this source-of-truth.

Implementation after this document must be described as:

- `STATIC CANDIDATE` before local Godot proof;
- `RUNTIME CANDIDATE` after import/parse/tests/smoke;
- `VISUAL CANDIDATE` after real 390 × 844 screenshot;
- `APPROVED` only after explicit user approval.

Never bless the visual baseline automatically.
