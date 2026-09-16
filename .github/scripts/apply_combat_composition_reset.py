from pathlib import Path

PORTRAIT_ANCHOR = '/* One portrait policy for 360–430px. Height no longer selects a different composition. */'
INFO_BLOCK = r'''/* Combat composition reset candidate — 2026-09-16 visual audit.
   One portrait composition; battlefield first; runtime/gameplay remains locked. */
@media(max-width:430px){
  .huntv2-combat-v8{--v5-player-hud-top:clamp(226px,30vh,270px)}
  .huntv2-combat-v8 .huntv2-arena{top:92px!important;bottom:10px!important}
  .huntv2-combat-v8 .huntv2-actor.player{left:4%!important;bottom:20%!important;width:min(46%,190px)!important;height:min(48%,250px)!important}
  .huntv2-combat-v8 .huntv2-actor.enemy{right:4%!important;bottom:20%!important;width:min(50%,218px)!important;height:min(52%,276px)!important}
  .huntv2-combat-v8 .huntv2-player-hud{left:10px!important;top:var(--v5-player-hud-top)!important;bottom:auto!important;width:150px!important;height:61px!important}
  .huntv2-combat-v8 .huntv2-status-tray.player{left:11px!important;top:calc(var(--v5-player-hud-top) + 64px)!important;bottom:auto!important;max-width:132px!important}
  .huntv2-combat-v8 .huntv2-status-tray.enemy{right:8px!important;top:158px!important;max-width:132px!important}
  .huntv2-combat-v8 .huntv2-status-tray .status.status-hidden{display:none!important}
  .huntv2-combat-v8 .huntv2-status-tray :is(.status,.status-more){flex:0 0 28px!important;min-width:28px!important;width:28px!important;max-width:28px!important;height:28px!important}
  .huntv2-combat-v8 .huntv2-hud-extension-slots{left:11px!important;right:auto!important;top:calc(var(--v5-player-hud-top) + 99px)!important;bottom:auto!important;width:106px!important;height:34px!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:4px!important}
  .huntv2-combat-v8 :is(.huntv2-beast-companion-hud,.huntv2-confidant-hud,.huntv2-artifact-hud){position:relative!important;left:auto!important;bottom:auto!important;flex:0 0 32px!important;width:32px!important;height:32px!important}
  .huntv2-combat-v8 :is(.huntv2-beast-companion-hud>img,.huntv2-confidant-hud>img,.huntv2-artifact-hud .huntv2-support-crest){display:block!important;width:30px!important;height:30px!important}
  .huntv2-combat-v8 :is(.huntv2-beast-companion-hud,.huntv2-confidant-hud,.huntv2-artifact-hud)::after{display:none!important}
  .huntv2-combat-v8 .huntv2-quick-controls{top:172px!important;right:7px!important;width:37px!important;gap:5px!important;opacity:.72!important}
  .huntv2-combat-v8 .huntv2-rail-btn{width:36px!important;height:36px!important;box-shadow:0 3px 8px rgba(0,0,0,.22)!important}
  .huntv2-combat-v8 .huntv2-rail-btn i{font-size:11px!important}

  .huntv2-combat-v8 .v5-boss-briefing{bottom:7px!important;width:calc(100% - 18px)!important;gap:4px!important;padding:6px 7px!important;border-radius:10px!important}
  .huntv2-combat-v8 .v5-boss-briefing-head{grid-template-columns:minmax(0,1fr) 24px!important;gap:5px!important;min-height:23px!important}
  .huntv2-combat-v8 .v5-boss-briefing-head :is(small,span){display:none!important}
  .huntv2-combat-v8 .v5-boss-briefing-head strong{margin:0!important;font-size:12px!important;line-height:1.05!important}
  .huntv2-combat-v8 .v5-boss-detail{width:24px!important;height:24px!important}
  .huntv2-combat-v8 :is(.v5-boss-readiness,.v5-boss-reward){min-height:32px!important;padding:3px 6px!important}
  .huntv2-combat-v8 :is(.v5-boss-readiness,.v5-boss-reward) strong{font-size:10px!important}
  .huntv2-combat-v8 .v5-boss-mechanic-summary{min-height:22px!important;padding:2px 6px!important}
  .huntv2-combat-v8 .v5-boss-blocker{min-height:22px!important;padding:2px 6px!important}

  .huntv2-combat-v8.v5-combat-engaged :is(.v5-boss-briefing,.huntv2-action-deck,.huntv2-log-preview){display:none!important}
  .huntv2-combat-v8.v5-combat-engaged .v5-boss-mechanic-compact:not([hidden]){display:grid}
  .huntv2-combat-v8.v5-combat-engaged .huntv2-console{flex:0 0 92px!important;min-height:92px!important;padding:3px 8px!important}
  .huntv2-combat-v8.v5-combat-engaged .huntv2-skills{bottom:3px!important}

  .huntv2-combat-v8.is-prefight:not(.v5-combat-engaged) .huntv2-log-preview{display:none!important}
  .huntv2-combat-v8.is-prefight:not(.v5-combat-engaged) .huntv2-console{flex:0 0 126px!important;min-height:126px!important}
  .huntv2-combat-v8.is-prefight:not(.v5-combat-engaged) .huntv2-action-deck{display:flex!important;align-items:center!important;justify-content:center!important;min-height:36px!important;height:36px!important}
  .huntv2-combat-v8.is-prefight:not(.v5-combat-engaged) .huntv2-action-deck .huntv2-context-button{display:none!important}
  .huntv2-combat-v8.is-prefight:not(.v5-combat-engaged) .huntv2-fight{width:min(210px,72%)!important;min-height:34px!important;height:34px!important;margin:0 auto!important}

  .huntv2-combat-v8 .huntv2-skill-callout{left:50%!important;right:auto!important;top:auto!important;bottom:76px!important;transform:translateX(-50%)!important;max-width:min(70%,270px)!important;min-height:46px!important;padding:5px 8px!important}
  .huntv2-combat-v8 .huntv2-skill-callout:is(.tier-ultimate,.ultimate){bottom:74px!important;max-width:min(74%,286px)!important;min-height:52px!important;padding:6px 9px!important}
  .huntv2-combat-v8 .huntv2-skill-callout.enemy{left:auto!important;right:8px!important;top:174px!important;bottom:auto!important;transform:none!important;max-width:198px!important}
  .huntv2-combat-v8 .huntv2-status-callout{top:auto!important;bottom:132px!important;max-width:138px!important;min-height:24px!important;padding:3px 6px!important;font-size:10px!important}
  .huntv2-combat-v8 .huntv2-status-callout.player{left:12px!important}.huntv2-combat-v8 .huntv2-status-callout.enemy{right:12px!important}
  .huntv2-combat-v8 .huntv2-status-callout b{font-size:11px!important;line-height:1.1!important}
  .huntv2-combat-v8 .huntv2-combat-caption{bottom:118px!important;max-width:76%!important}
}
@media(max-width:360px){
  .huntv2-combat-v8 .huntv2-actor.player{width:min(48%,184px)!important}
  .huntv2-combat-v8 .huntv2-actor.enemy{width:min(52%,202px)!important}
  .huntv2-combat-v8 .huntv2-hud-extension-slots{width:98px!important}
  .huntv2-combat-v8 :is(.huntv2-beast-companion-hud,.huntv2-confidant-hud,.huntv2-artifact-hud){flex-basis:30px!important;width:30px!important;height:30px!important}
  .huntv2-combat-v8 :is(.huntv2-beast-companion-hud>img,.huntv2-confidant-hud>img,.huntv2-artifact-hud .huntv2-support-crest){width:28px!important;height:28px!important}
}
'''

info = Path('ui-combat-information-v1.css')
s = info.read_text(encoding='utf-8')
if PORTRAIT_ANCHOR not in s:
    raise SystemExit('portrait information block anchor not found')
s = s[:s.index(PORTRAIT_ANCHOR)].rstrip() + '\n\n' + INFO_BLOCK
info.write_text(s, encoding='utf-8')
if len(s.encode('utf-8')) >= 13000:
    raise SystemExit(f'consolidated information CSS still exceeds 13 KB: {len(s.encode("utf-8"))}')

bridge = Path('ui-combat-target-v1.js')
s = bridge.read_text(encoding='utf-8')
old = """    const criticalSignal = Boolean(screen.querySelector('.huntv2-stage-boss-telegraph.visible, .huntv2-enemy-intent.visible, .huntv2-break-window.visible, .huntv2-stage-skill-callout.visible, .huntv2-skill-callout.show'));\n    screen.classList.toggle('v5-critical-signal-active', criticalSignal);\n\n    const phase = screen.querySelector('.huntv2-phase-badge, .huntv2-boss-phase, [data-boss-phase]');"""
new = """    const phase = screen.querySelector('.huntv2-phase-badge, .huntv2-boss-phase, [data-boss-phase]');"""
if old not in s:
    raise SystemExit('critical-signal bridge anchor not found')
s = s.replace(old, new, 1)
anchor = """  function syncCombatContext() {\n    const screen = document.querySelector('.huntv2-screen');\n    const stage = screen?.querySelector('#huntV2Stage, .huntv2-stage');\n    const enemyHud = screen?.querySelector('.huntv2-enemy-hud');\n    if (!screen || !stage || !enemyHud) return;\n\n"""
insert = """  function syncEngagedPresentation(screen, stage) {\n    const criticalSignal = Boolean(screen.querySelector('.huntv2-stage-boss-telegraph.visible, .huntv2-stage-boss-telegraph.show, .huntv2-enemy-intent.visible, .huntv2-enemy-intent.show, .huntv2-break-window.visible, .huntv2-break-window.show, .huntv2-stage-skill-callout.visible, .huntv2-skill-callout.show'));\n    const transientSignal = Boolean(screen.querySelector('.huntv2-float.show, .huntv2-status-callout.show, .huntv2-result-pop.show'));\n    const engaged = screen.classList.contains('is-active-combat') || stage.classList.contains('presentation-active') || criticalSignal || transientSignal;\n    screen.classList.toggle('v5-critical-signal-active', criticalSignal);\n    screen.classList.toggle('v5-combat-engaged', engaged);\n  }\n\n  function syncCombatContext() {\n    const screen = document.querySelector('.huntv2-screen');\n    const stage = screen?.querySelector('#huntV2Stage, .huntv2-stage');\n    const enemyHud = screen?.querySelector('.huntv2-enemy-hud');\n    if (!screen || !stage || !enemyHud) return;\n\n    syncEngagedPresentation(screen, stage);\n\n"""
if anchor not in s:
    raise SystemExit('syncCombatContext anchor not found')
s = s.replace(anchor, insert, 1)
bridge.write_text(s, encoding='utf-8')

html = Path('index.html')
h = html.read_text(encoding='utf-8')
h = h.replace('combat-information-v2-20260916', 'combat-information-v3-20260916')
h = h.replace('combat-information-v5-20260916', 'combat-information-v6-20260916')
html.write_text(h, encoding='utf-8')

test = Path('qa/tests/ui-combat-readability-target-test.js')
t = test.read_text(encoding='utf-8')
t = t.replace('combat-information-v2-20260916', 'combat-information-v3-20260916')
t = t.replace('combat-information-v5-20260916', 'combat-information-v6-20260916')
extra = r'''
assert.match(info,/Combat composition reset candidate[\s\S]*?\.huntv2-actor\.player\{[\s\S]*?bottom:20%!important[\s\S]*?\.huntv2-actor\.enemy\{[\s\S]*?bottom:20%!important/,'Player and Boss must share the same portrait ground plane');
assert.match(info,/\.huntv2-status-tray \.status\.status-hidden\{display:none!important\}/,'Status overflow must never reveal runtime-hidden chips');
assert.match(info,/\.v5-combat-engaged :is\(\.v5-boss-briefing,\.huntv2-action-deck,\.huntv2-log-preview\)\{display:none!important\}/,'Engaged combat must remove pre-fight chrome');
assert.match(info,/\.v5-combat-engaged \.huntv2-console\{[\s\S]*?min-height:92px!important/,'Active combat must reclaim lower-console space for battlefield');
assert.match(bridge,/function syncEngagedPresentation\(screen, stage\)/,'Bridge must derive engaged presentation without gameplay authority');
assert.match(bridge,/stage\.classList\.contains\('presentation-active'\)/,'Engaged presentation must follow canonical presentation activity');
assert.match(bridge,/v5-combat-engaged/,'Engaged presentation class must drive state-specific UI');
'''
if 'Player and Boss must share the same portrait ground plane' not in t:
    needle = "assert.doesNotMatch(bridge,/battleEnd/,'Presentation bridge must not reinterpret battle outcome');"
    if needle not in t:
        raise SystemExit('readability test insertion anchor not found')
    t = t.replace(needle, needle + '\n' + extra, 1)
test.write_text(t, encoding='utf-8')

visual = Path('qa/visual/capture-combat-runtime.mjs')
v = visual.read_text(encoding='utf-8')
old_metrics = "activeCombat:root?.classList.contains('is-active-combat')||false,preFightVisible"
new_metrics = "activeCombat:root?.classList.contains('is-active-combat')||false,engagedCombat:root?.classList.contains('v5-combat-engaged')||false,preFightVisible"
if old_metrics not in v:
    raise SystemExit('visual engaged metric anchor not found')
v = v.replace(old_metrics, new_metrics, 1)
old_guard = "if(state.activeCombat&&(state.preFightVisible||state.actionDeckVisible))throw new Error(`Active Combat leaked pre-fight UI: ${JSON.stringify({preFightVisible:state.preFightVisible,actionDeckVisible:state.actionDeckVisible})}`);"
new_guard = "if(state.engagedCombat&&(state.preFightVisible||state.actionDeckVisible))throw new Error(`Engaged Combat leaked pre-fight UI: ${JSON.stringify({activeCombat:state.activeCombat,engagedCombat:state.engagedCombat,preFightVisible:state.preFightVisible,actionDeckVisible:state.actionDeckVisible})}`);\n  if((state.statusStress?.player?.visible||0)>4||(state.statusStress?.enemy?.visible||0)>4)throw new Error(`Combat status overflow leaked hidden chips: ${JSON.stringify(state.statusStress)}`);"
if old_guard not in v:
    raise SystemExit('visual engaged guard anchor not found')
v = v.replace(old_guard, new_guard, 1)
visual.write_text(v, encoding='utf-8')
