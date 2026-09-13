# UI/UX Phase Audit & Architecture — 2026-09-13

## Scope and source of truth

- Audited from `main` at `dcb93a8b03b6bf6f19ed34af9499b86617a3db6e`.
- `CURRENT_CHECKPOINT.md` keeps V160–V179 runtime authority locked.
- The UI remains a projection over canonical `web-client-snapshot.v1` data and sends commands through the existing `/api/action`, `/api/view`, `/api/live`, and save/load transports.
- No UI-owned gameplay state, save schema, reward calculation, or combat-stat calculation is proposed.

## Current UI map

| Area | Current implementation | Assessment |
| --- | --- | --- |
| Entry | `index.html` → `standalone-entry.js` → runtime bridges → `app.js` | Keep. Boot failure and cache clearing are explicit. |
| Shell | top player/resource bar, one viewport, five-destination bottom dock, sheets | Keep architecture; normalize visuals and accessibility. |
| Navigation | Five primary groups with many secondary destinations in sheets/system menu | Keep grouping; fix destination discovery and context labels. |
| Home / cultivation | Default route is `cultivation`; previously rendered a sequence of generic cards | Full redesign first. It is the first impression and primary idle loop. |
| Character | Art-led character stage, equipment ring, core stats, quick actions | Keep and refine after Home. Strongest non-combat pattern. |
| Combat / hunt | Dedicated lazy Pixi presentation and compact combat HUD | Keep. Audit separately for feedback/readability regressions only. |
| Inventory / equipment | Strong visual item grid and sheets, but dense filters/workshop modes | Keep structure; simplify progressive disclosure. |
| Collection | Functional catalogue/gacha/read models | Redesign presentation; too card/catalogue-led. |
| Alchemy | Functional recipe, garden and production actions | Redesign workshop flow after shared components exist. |
| Faction / social | Functional secondary pages built from generic cards/lists | Redesign completely as world/relationship experiences. |
| Dungeon hub | Dedicated hub plus hunt route | Keep grouping; unify scene transitions and goal hierarchy. |
| Reincarnation | Complete functional flow with phases and confirmations | Keep flow; redesign phase visualization and consequence clarity. |
| Automation | Complete policy form and rule builder | Keep authority; redesign from “settings form” to guarded strategy presets + advanced rules. |
| Loading/empty/error | Boot fatal state, lazy hunt state, local empty/error fragments | Fix globally. No unified skeleton, empty-state grammar, retry pattern or stale-data signal. |

## Main findings

1. **The product has multiple visual generations in one cascade.** At the audit commit, `styles.css` is about 0.89 MB and contains 24 `:root` blocks, roughly 3,600 `!important` declarations, and many version-prefixed component families. This makes local polish unpredictable and encourages another override layer.
2. **The strongest screens and the weakest screens use different composition models.** Character, Hunt and Dong Phu are scene/art-led. Most secondary systems still use `page → grid → card → form`, which reads as an administration dashboard.
3. **The default screen did not sell the fantasy.** Cultivation showed correct numbers and actions, but character/world art was absent and the primary progression action did not dominate.
4. **Navigation grouping is sound, discovery is not yet coherent.** Five bottom destinations are appropriate for portrait play, but secondary routes are split between “more”, system menu, contextual buttons and screen-specific tabs.
5. **Information is complete but insufficiently layered.** Formula explanations and system truth often sit beside the decision the player must make. Summary, decision, detail and audit information need distinct depths.
6. **Typography and spacing are not one system.** Several historical token families coexist; some legacy microcopy reaches 5–9 px. Touch-target remediation exists but is selector-by-selector.
7. **Interaction continuity is a strength.** Scroll/sheet restoration, lazy hydration, delegated listeners, save status and guarded confirmation flows should be retained.
8. **Responsive intent is already portrait-client-first.** Desktop centers a 9:16 client while phones fill the viewport. This is consistent with the current source direction; component internals still need container-aware behavior.

## Keep / fix / remove / redesign

### Keep

- Canonical five-group information architecture.
- Existing transport and runtime authority boundaries.
- Lazy-loaded Hunt/Dong Phu presentation modules.
- Scroll/sheet continuity and action confirmation behavior.
- Character art-stage and inventory item-grid patterns.
- Static module graph and bundle-size hard locks.

### Fix

- One token vocabulary for color, type, spacing, radius, elevation, motion and touch.
- One screen anatomy: scene/header → current goal → primary action → compact recommendations → progressive detail.
- Unified loading, empty, blocked, error and success feedback.
- Minimum readable text and focus-visible behavior.
- Consistent secondary navigation and back behavior.

### Remove over time

- Player-facing version/debug copy such as “V140”, “canonical”, “resolver”, “Production Closure”.
- Inline layout styles where a shared primitive exists.
- Decorative card borders around every information group.
- Duplicate historical CSS rules once each migrated screen is visually locked.
- Fake or unsupported affordances; every CTA must map to an existing action or route.

### Full redesign

- Home/Tu Luyện.
- Collection/Gacha presentation.
- Alchemy workshop.
- Faction/Social.
- Automation policy builder.
- Generic Overview/Guide/World pages after their information is folded into destination contexts.

## Proposed UI architecture

### Layer 1 — App shell

- Player/resource HUD
- Five destinations
- Global notices, confirmation and full-height sheets
- Safe-area, viewport and focus behavior

### Layer 2 — Screen frame

- Scene or identity header
- Current goal and progression
- Exactly one contextual primary action
- At most two recommendations above the fold
- Compact destination-specific shortcuts

### Layer 3 — Reusable game components

- `ProgressHero`
- `PrimaryAction`
- `ResourceChip`
- `StatusPill`
- `RecommendationRow`
- `ItemTile`
- `ChoiceCard`
- `BottomSheet`
- `StatePanel` for loading/empty/blocked/error

These are presentation patterns, not stateful gameplay controllers.

### Layer 4 — Feature presenters

Each feature reads only its existing snapshot slice, derives presentation-only labels/ordering, and dispatches existing commands. Feature-local UI state may hold selection, filter, open sheet and scroll position only.

## Design system V1

| Dimension | Rule |
| --- | --- |
| Color | Deep ink/navy foundation; restrained gold for progression/primary focus; jade for healthy/ready; vermilion only for danger. |
| Type | Serif for realm/identity moments; system sans for controls and dense data. No essential text below 10 px at phone reference widths. |
| Spacing | 4/8/12/16/24 px rhythm. Dense internals may use 6/10 px only when tied to a reusable component. |
| Shape | 10 px compact controls, 14 px cards/actions, 20 px scene/sheet landmarks. |
| Hierarchy | One dominant scene, one dominant CTA, up to two next actions, then optional detail. |
| Touch | 44 px minimum interactive target; bottom destination controls remain thumb-safe. |
| Motion | Slow ambient world motion and short state transitions; honor `prefers-reduced-motion`. |
| Density | Show decision inputs and consequences first; explanations/formulas move into sheets. |
| States | Loading, empty, blocked, ready, warning, error and success share a consistent visual and copy grammar. |

## Implementation order

1. Home/Tu Luyện vertical slice and Design System V1 tokens.
2. App shell/HUD/navigation normalization using the approved Home grammar.
3. Character and equipment alignment.
4. Combat readability/feedback audit without changing Combat authority.
5. Dungeon/Hunt destination cohesion.
6. Collection and Alchemy.
7. Reincarnation and Automation.
8. Faction/Social/World.
9. Remove superseded CSS only after migrated-screen visual gates exist.

## First patch

The first patch replaces the default Tu Luyện dashboard composition with an art-led cultivation home:

- existing selected character/background assets;
- current realm, life, spiritual root, injury and lifespan;
- canonical Tu Vi values, real-time gain and ETA;
- a contextual primary action that only uses existing actions;
- two canonical session-loop recommendations;
- compact links to Bế Quan, Tu Vi Đan, Linh Căn and Chiến Đấu;
- detailed source/status explanations moved into a sheet.

No runtime or save authority is changed.
