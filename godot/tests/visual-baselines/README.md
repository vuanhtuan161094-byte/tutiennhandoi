# Godot visual baselines

This directory stores **user-approved** Stagehand golden screenshots.

Do not create or replace a baseline merely because a candidate renders without errors.

Workflow:
1. run `VERIFY_GODOT_LOCAL.cmd`;
2. inspect `artifacts/godot-tools/stagehand-visual/screenshots/home-390x844.png`;
3. obtain explicit user approval of that exact runtime image;
4. run `APPROVE_GODOT_HOME_BASELINE.cmd`;
5. review the new/changed PNG in Git;
6. commit it deliberately.

When `home-390x844.png` exists here, `VERIFY_GODOT_LOCAL.cmd` switches from capture-only mode to Stagehand screenshot diff mode.

Current Home diff tolerance:
- threshold: 0.005
- pixel_sensitivity: 0.03

The deterministic visual harness uses the real production Home components with fixed data and paused decorative animation so visual diffs are meaningful rather than driven by realtime Tu Vi or particle timing.
