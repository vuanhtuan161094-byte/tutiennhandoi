# HG-08 RESUME CONTRACT — no Computer Use blocker (2026-11-02)

Repo: `vuanhtuan161094-byte/tutiennhandoi`. Only work on `feature/heoofgaia-hg07-20261102` under `projects/heoofgaia/`. Re-read the live branch HEAD, root `AGENTS.md`, `CURRENT_CHECKPOINT.md`, `docs/DEVELOPMENT_PROTOCOL.md` and the Hẻoofgaia Master Contract before modifying runtime. Never merge or edit Tu Tiên main files.

## Observed checkpoint
Codex reported HG07 source syntax 8/8 PASS, Node engine 37/37 PASS and successful offline bundle, but Python Playwright was missing. Computer Use stopped because it could not safely identify the Chrome URL; this is NOT an HG07 gameplay failure. Codex explicitly reported HG08 not started, no commit, no screenshot. Do not invent completion.

An independent local Linux runner with installed Playwright+Chromium reran the HG07 source: `node qa-engine.cjs` 37/37 PASS; `python qa-browser.py` 31/31 PASS; 0 page JS errors. The runner is now changed to detect Chrome/Edge/Chromium on Windows instead of requiring `/usr/bin/chromium`. These results use a localStorage shim and do **not** validate physical Windows file:// launch or real profile persistence.

## Immediate work order (proceed without waiting for routine approval)
1. Refresh live branch HEAD and rerun Node tests + offline builder. No Computer Use or unknown external URL is needed to do this.
2. Where authorized to use local headless QA, install Python dependency in the user account (`py -m pip install --user playwright` or `python -m pip install --user playwright`). Run `py qa-browser.py`. The runner autodetects installed Chrome/Edge/Chromium; optionally specify `HOG_CHROMIUM_PATH` pointing to a verified executable, or use `py -m playwright install chromium` if no browser exists. Do not bypass any Computer Use safety restrictions. If browser installation or browser control isn't permitted, mark **BROWSER BLOCKED** and continue engine/data work.
3. Implement HG08 by evidence-first, test-first slices:
   - Troop unlock catalog for 4 races × 10 tiers, mapping Barracks levels, race-specific supporting buildings and researched skills. The contemporary Heroes of Gaia wiki confirms tier progression by barracks level but warns of additional requirements. Do not invent missing requirements; mark UNKNOWN and prioritize documented conditions.
   - Train queue atomic validation: invalid race/level/research/inventory returns error without resource or queue mutation; exact completion and save/reload regression.
   - Hero XP and level 1–100 progression: research genuine 2009 tables/equations, model quality and Hero Tower EXP bonus; if undocumented, isolate playable approximation explicitly as SIMULATED and test it. Preserve current base troop command cap.
4. Then proceed with HG09 tactical combat, HG10 economy/world, HG11 art/UI, HG12 offline release QA, HG13 optional MMO as stated in `CODEX_MASTER_EXECUTION_PLAN_20261102.md`. Do not stop after planning.
5. For each real slice, update Hẻoofgaia-only checkpoint containing exact SHA, executed commands and counts, real screenshots if available, PASS/FAIL/BLOCKED and the NEXT atomic task. Commit and push only to branch. Do not alter or merge main.

## Evidence
- https://heroesofgaia.wikidot.com/game-buildings (Barracks unlocks one unit per level; additional requirements; Hero Tower +1% EXP per level).
- https://heroesofgaia.fandom.com/wiki/Newbie_Guide (troops, Arena, buildings/research).
- https://heroesofgaia.wikidot.com/game-units (40 units).
- https://heroesofgaia.fandom.com/wiki/Orc_Barracks (race-specific level/building table).

## Windows non-admin commands
From a verified Hẻoofgaia source directory:
```cmd
node qa-engine.cjs
py build_offline.py
py -m pip install --user playwright
py qa-browser.py
```
When `py` is not available, use `python`. `qa-browser.py` loads `about:blank` and `set_content`, not an unknown external site. If its browser dependency is missing, treat that as an environment blocker, **not** a gameplay FAIL.

**Do not claim 1:1 Heroes of Gaia**, browser PASS on the actual user's Windows machine, or HG08 complete without evidence.
