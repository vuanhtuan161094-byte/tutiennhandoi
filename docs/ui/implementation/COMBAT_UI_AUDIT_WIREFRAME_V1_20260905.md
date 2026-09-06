# COMBAT UI — FORENSIC AUDIT + REFERENCE SPEC + WIREFRAME V1

Date: 2026-09-05  
Baseline: V129 Audit Closure R1  
Scope: UI/UX only. Combat/backend truth is unchanged.

## 1. Source audit

### DOM / renderer owner
Primary screen renderer: `modules/hunt-combat-v2.js`.

Current screen owns these visible surfaces:
- environmental stage/background;
- top resource row;
- floor/map metadata;
- player HUD;
- enemy HUD + HP + Phá Thế;
- buff/debuff status trays;
- boss telegraph / Thất Thế window;
- combat arena + DOM actor anchors;
- Pixi host;
- quick control rail;
- skill/read-only loadout strip;
- action deck;
- expandable combat log;
- combat intelligence meters;
- companion/artifact extension HUD;
- floor/loot/monster controls;
- skill/floor/map/loot/monster/help sheets.

### Pixi presentation
`modules/combat-presentation-runtime-v140.js` mounts the production presentation façade.  
`modules/combat-pixi-scene-v140.js` renders actors/VFX when Pixi is available and measures the DOM actor anchors. Therefore repositioning `.huntv2-actor.player` / `.huntv2-actor.enemy` in CSS also moves the Pixi render anchors without changing combat state.

### CSS owner
`combat-v2.css` is the combat presentation stylesheet. Historical sections have accumulated multiple layout passes. Wireframe V1 is intentionally scoped under `.huntv2-wireframe-v1` rather than deleting prior rules during the first UX iteration.

### Read-model used by combat UI
Primary data comes from:
- `model.endlessHunt`;
- `model.overview`;
- `model.character` and `model.character.combatStats`;
- `model.specialization`;
- `model.inventory`;
- `model.reincarnation`;
- `model.visuals`;
- `live` combat/farm state.

The UI also reads registered presentation HUD extensions for companion/artifact and Bản Đạo combat intelligence.

### Player actions / transport
The screen exposes existing actions only:
- `endlessFight`;
- `endlessBoss`;
- `endlessFloor`;
- `endlessAutoAdvance`;
- `huntAutoCombat`;
- sheet/detail navigation.

Skill icons remain **read-only tactical state/detail controls**. They do not dispatch a manual cast action.

## 2. Functional inventory

Player goal on this screen:
1. understand current opponent and encounter/floor;
2. watch combat state without reading a dashboard;
3. understand HP/CN, Bản Đạo resource, cooldown/proc/status;
4. decide whether to challenge the available Boss or use Auto Hunt;
5. inspect details/log/loot only when needed.

Primary action by state:
- pre-fight Boss available: `KHIÊU CHIẾN BOSS`;
- farm/field state: no large CTA; combat/Auto Hunt is the focus.

Secondary actions:
- toggle Auto Hunt;
- open map/help;
- inspect skill detail;
- open combat log;
- open floor/loot/monster detail.

## 3. Reference decomposition

Reference: `docs/ui/reference/REFERENCE_COMBAT_TARGET_20260905.png` (864×1536, 9:16).

Coordinates below are approximate design measurements, not pixel-perfect tracing.

| Zone | Approx. Y on reference | Height share | Rule extracted |
|---|---:|---:|---|
| Identity/resources | 0–100 px | 0–6.5% | Edge-mounted, transparent; does not create a header bar |
| Encounter/round label | 125–190 px | ~4% | Small centered plaque/status only |
| Enemy identity/HP | 300–405 px | ~7% | Attached to enemy field, not global full-width HUD |
| Enemy art | 390–720 px | ~21% | Upper-right visual anchor |
| Player identity/HP | 610–750 px | ~9% | Attached above/near player field |
| Player art | 700–1210 px | ~33% | Lower-left dominant visual anchor |
| Auto/utility rail | 870–1080 px | ~14% | Small edge controls; no dashboard panel |
| Skill cluster | 1050–1250 px | ~13% | 3 major circular skill/state icons, high visual priority |
| Resource meter | 1230–1285 px | ~3.5% | Directly beneath skill cluster |
| Compact log | 1260–1390 px | ~8.5% | 3 latest lines; full detail is secondary |
| Persistent nav | 1390–1536 px | ~9.5% | Separate navigation rhythm |

### Reference hierarchy rules locked for V1
- background + combatants must dominate the viewport;
- enemy upper-right, player lower-left create a strong diagonal;
- actor HUD follows actor location;
- skill icons are visual state indicators, not fake cast buttons;
- only a few major skill icons should dominate;
- latest combat events stay visible in compact form;
- detailed log and formulas use progressive disclosure;
- unsupported speed control must not be fabricated.

## 4. Current-to-target gap matrix

| Surface | Current V129 issue | Target | V1 action |
|---|---|---|---|
| Stage | Reduced by 154–170 px skill console | Near full-height battlefield | Make console absolute overlay; stage gets full body height |
| Actor layout | Player/enemy both bottom-anchored | Enemy upper-right / player lower-left | Re-anchor enemy upward; preserve player low-left |
| Enemy HUD | Large central/top card with portrait | Compact HUD near enemy | Remove portrait/card silhouette; move to upper-right actor field |
| Player HUD | Large card with portrait/meta | Compact HP/CN near player | Remove portrait/meta from field HUD; move near player |
| Status | Full lane near top | Small chips near actors | Reposition trays next to each actor |
| Quick controls | Auto + FX + Log equally prominent | Only real frequent controls | Keep Auto; remove FX/Log from prominent rail |
| Skill dock | 6–7 icons + names + CD + CN + role copy | 3–4 major icons | Show 3 loaded skills + Ultimate in compact HUD; keep all DOM slots for runtime truth |
| Skill interaction | Already detail-only | Detail-only | Preserve; no manual cast action added |
| Action deck | Two large bottom CTAs always occupy space | One primary CTA only when relevant | Show only Boss CTA in pre-fight state; hide context CTA from main field |
| Bản Đạo meter | Separate tactical lane | Directly under skills | Move under compact skill cluster |
| Combat log | Hidden large panel | 3 latest events always visible | Add compact 3-line preview; expanded log remains available |
| Floor footer | Full-width footer | Small secondary edge tools | Collapse to 3 small secondary controls |
| Resources | Small top chips | Edge-mounted | Retain, enlarge readability slightly |
| Map/help | Tiny 22–24 px | Touch-safe edge utility | Increase to 40 px circular controls |
| Boss telegraph | Mechanically correct | Preserve visual priority | Keep authoritative center telegraph |

## 5. Wireframe V1 implementation

Changed source:
- `modules/hunt-combat-v2.js`
- `combat-v2.css`

Implementation details:
- root gets `.huntv2-wireframe-v1` and `data-combat-ui="wireframe-v1"`;
- stage consumes the full combat body;
- DOM/Pixi actor anchors form the target diagonal;
- actor HUDs are visually detached from dashboard-card treatment;
- major skill HUD is limited to at most four visible slots while hidden slots remain in the DOM for cooldown/state synchronization;
- skill labels and microcopy are removed from battlefield; tap still opens existing detail sheet;
- full log remains expandable;
- new compact log preview mirrors the latest three runtime log rows;
- FX quality remains functional but is not a prominent battle control;
- no x2/speed button was added because `COMBAT_PRESENTATION_SPEED` is still fixed at `1`;
- no combat/backend formula was changed.

## 6. Responsive intent

### 390×844 — canonical gate
Expected layout:
- no fixed console consuming battlefield height;
- four major skill/state icons fit in lower-right cluster;
- 40 px map/help/auto controls;
- 68 px compact combat log above bottom navigation;
- actor HUDs remain clear of main art anchors.

### 360×800
Intentional reductions:
- second top currency chip may be hidden;
- secondary realm/meta text may collapse;
- actor widths tighten;
- Bản Đạo meter labels may collapse before bars/numbers do.

No global scale-down is used.

### 412×915
Extra height should go to battlefield/art, not additional panels.

## 7. QA evidence

Frontend FAST after Wireframe V1:
- `node qa/runners/v129-frontend-gates.js fast`
- result: **7/7 PASS**.

Browser module syntax inside FAST:
- **22/22 PASS**.

No backend contract changed; backend suite was therefore intentionally not rerun.

## 8. Visual/device QA limitation

A real rendered screenshot still requires a functioning Chromium/browser pass. The current container can start the local web server, but headless Chromium does not complete local-page capture in this environment and times out before producing a screenshot. This is a tooling/environment limitation, not evidence that the visual gate passed.

Therefore current status is:
- source audit: PASS;
- reference spec: PASS;
- gap matrix: PASS;
- code wireframe V1: IMPLEMENTED;
- frontend FAST: PASS;
- real 390×844 visual gate: **PENDING USER/REAL BROWSER SCREENSHOT**.

Do not lock Combat Visual V1 or generate production art until that rendered gate is reviewed.
