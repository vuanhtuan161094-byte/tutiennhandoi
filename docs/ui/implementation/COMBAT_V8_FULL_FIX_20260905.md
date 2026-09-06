# COMBAT V8 FULL FIX — 2026-09-05

## Scope
Frontend/UI only. V129 gameplay/backend formulas, CombatKernel, rewards, AI and progression are unchanged.

This pass replaces the repeated V2–V7 patching approach with one current portrait HUD contract. It is based on:
- the current V129 source tree;
- the latest one-click Combat Auto QA video;
- `docs/ui/reference/REFERENCE_COMBAT_TARGET_20260905.png` for hierarchy/composition grammar;
- the latest user requirements: portrait-only on web/mobile, numeric HP, whole-second visible timers, five-item bottom navigation, hideable combat report, and permission to delete superseded UI.

## Root problems found in the latest video
1. Web portrait client was capped too narrowly, making the whole game feel small.
2. Internal rows overflowed horizontally, especially navigation, Dao resources and the skill rail.
3. Six-plus primary bottom destinations were too dense for portrait play.
4. DEV Auto QA labels covered the HUD it was supposed to test.
5. Top identity/resources/Boss metadata competed for the same space.
6. Boss metadata was duplicated; Phase I added noise.
7. Phá Thế existed but needed a cleaner persistent hierarchy.
8. Player HP/CN crossed character focal art and displayed percentage-oriented state.
9. Fixed actor max sizes made actors look too small when the portrait client grew on web.
10. Skill/resource rows inherited old min-width/font rules and could clip.
11. Several combat text classes still relied on legacy 5–9px styles before V8 overrides.
12. Old source documentation still described 390×844 as the main target rather than a QA case.

## V8 decisions
### Portrait Client Shell V2
- Mobile: fills the device viewport.
- Web: centered 9:16 portrait client; no separate desktop game layout.
- Width derives from available viewport height.
- Maximum portrait width raised to 680px; not hard-coded to 390/430px.
- Compact / standard / tall profiles recover space through geometry, not tiny text.

### Five-destination primary navigation
Bottom navigation is now:
1. Nhân Vật
2. Tu Luyện
3. Chiến Đấu
4. Động Phủ
5. Thế Giới

Existing subsystems are not deleted. `primaryTabGroup()` maps Inventory/Skills/Build/etc. to their owning hub so active-state and route access remain coherent.

### Combat information hierarchy
Always visible / Tier 1:
- player identity;
- essential top resources;
- encounter/tầng;
- Boss name + HP + Phá Thế;
- Player name + HP + CN;
- Dao resource / Ultimate when present;
- learned Auto Skill rail;
- compact combat report / pre-fight CTA.

Contextual only:
- P2/P3;
- buffs/debuffs/Ấn;
- Thương Thế when non-zero;
- shield/heal/control cues;
- telegraph;
- Thất Thế / Ổn Thế;
- counter windows;
- companion/artifact runtime cues.

Removed from persistent Combat top HUD:
- unspent Potential;
- duplicate Boss Lv/CP metadata;
- Phase I badge;
- fake/empty skill slots;
- layout-consuming `AUTO` pseudo-label.

### Numeric HP / CN
Bar length communicates percentage. Text communicates absolute values:
- `2.85K / 2.85K`
- `1.13K / 2.85K`

Player HP is no longer presented as `100%` as the primary text.

### Whole-second live timers
Visible live countdowns use integer seconds only:
- `3 → 2 → 1`

Applied to:
- skill cooldown display;
- Boss telegraph;
- Thất Thế window;
- status duration chips.

Backend/runtime precision remains unchanged.

### Typography
Combat V8 has a portrait-client-responsive type scale using `clamp()` + container width:
- floor: 10px;
- Boss/player names grow with larger web portrait clients;
- HP/CN/Phá Thế/resource/status/log labels scale without falling below the floor.

Any information that cannot deserve readable text should be hidden/progressive-disclosure rather than shrunk to 5–8px.

### Actor scaling
Player and Boss safe bounds retain percentage-based composition but higher max dimensions, so a 600px-wide web portrait client does not keep mobile-sized actors.

### DEV Auto QA
One-click workflow is retained.

Improvements:
- QA tour HUD is outside the collapsed DEV panel DOM width.
- synthetic center-screen `POSE / BOSS / FX` captions are removed from the one-click tour;
- current substate is shown in the compact QA badge instead;
- each QA step automatically checks key HUD geometry, root/nav horizontal overflow and visible combat text below 10px;
- result is exposed as `globalThis.__TUTIEN_COMBAT_QA_LAYOUT__`;
- the badge adds `⚠N` if the automated layout audit sees issues.

## Cleanup
Superseded V7 runtime/cache tokens are removed from active source.
The old V7 targeted QA test is replaced by `ui-foundation-combat-v8-test.js`.
Historical V5–V7 implementation notes are listed for deletion so they do not look like current source-of-truth.

## Automated verification
- UI Foundation + Combat V8 targeted: 69/69 PASS.
- Frontend FAST: 7/7 PASS.
- Frontend closure/transport: 23/23 PASS.
- Browser module syntax: 22/22 PASS.
- Web surface: 28/28 PASS after replacing the obsolete desktop-layout assertion with the portrait-client contract.
- Backend gameplay: unchanged, so backend regression was not rerun for this UI-only pass.

## Remaining gate
Real-browser visual QA is still required before Combat is visually locked. Headless Chromium in the current execution environment still hangs at Linux DBus/zygote and cannot provide trustworthy screenshots.

Canonical visual check is now one action:
`CHOI_UI_DEV.cmd` → DEV → `CHẠY TOÀN BỘ COMBAT QA` → record one video.
