from pathlib import Path
import re

# Reuse the already-reviewed lifecycle patch body from the temporary workflow.
workflow = Path('.github/workflows/reincarnation-v4-lifecycle-patch.yml')
lines = workflow.read_text().splitlines()
start = next(i for i, line in enumerate(lines) if line.strip() == "python3 <<'PY'") + 1
end = next(i for i in range(start, len(lines)) if lines[i].strip() == 'PY')
body = []
for line in lines[start:end]:
    body.append(line[10:] if line.startswith('          ') else line)
exec(compile('\n'.join(body) + '\n', '<reincarnation-v4-lifecycle-patch>', 'exec'))

# Remove the last Mệnh Thai wrappers from session combat/power ownership.
p = Path('dist/core/session.js')
s = p.read_text()
pattern = r"(?P<indent>[ \t]*)const immortalPlayer = applyImmortalToEntity\(greatPlayer, this\.stateValue\.immortal, this\.stateValue\.realm, effectiveManifestationCapacity\(this\.stateValue\.immortal\.manifestationCapacity, this\.stateValue\.fateEmbryo\)\);\s*const fatePlayer = applyFateEmbryoToEntity\(immortalPlayer, this\.stateValue\.fateEmbryo, this\.fateEmbryoSummary\(\)\);\s*const talentedPlayer = applyReincarnationCombatTalents\(fatePlayer, this\.stateValue\.inheritedOrigins\);"
def replace_combat(match):
    indent = match.group('indent')
    return (
        f"{indent}const immortalPlayer = applyImmortalToEntity(greatPlayer, this.stateValue.immortal, this.stateValue.realm, this.stateValue.immortal.manifestationCapacity);\n"
        f"{indent}const talentedPlayer = applyReincarnationCombatTalents(immortalPlayer, this.stateValue.inheritedOrigins);"
    )
s, _ = re.subn(pattern, replace_combat, s)
s = s.replace(
    "        const capacity = effectiveManifestationCapacity(this.stateValue.immortal.manifestationCapacity, this.stateValue.fateEmbryo);",
    "        const capacity = this.stateValue.immortal.manifestationCapacity;"
)
s = s.replace(
    "        const fate = applyFateEmbryoToEntity(immortal, this.stateValue.fateEmbryo, this.fateEmbryoSummary());\n        const talents = applyReincarnationCombatTalents(fate, this.stateValue.inheritedOrigins);",
    "        const talents = applyReincarnationCombatTalents(immortal, this.stateValue.inheritedOrigins);"
)
s = s.replace("            { id: 'fate_embryo', name: 'Mệnh Thai / Mệnh Cơ', entity: fate },\n", "")
p.write_text(s)

# Rebuild player-facing rebirth output. Do not read removed CP/Mệnh Thai/Seal-XP fields.
p = Path('dist/core/gameplay-dispatch.js')
g = p.read_text()
g = g.replace("import { bundleSummaryLines } from './birth-origins-v101.js';\n", "")
block = re.compile(r"\n\s*case 'reincarnate': \{.*?\n\s*case 'recoverArtifactRelic': \{", re.S)
replacement = """
                case 'reincarnate': {
                    const report = this.session.reincarnate(command.plan ?? {});
                    const progress = this.session.meta.reincarnationProgress;
                    return this.result(command.type, beforeYear, [
                        `Chuyển sinh sang đời ${report.currentLife.lifeNumber}.`,
                        `Xuất Thân: ${report.currentLife.birth.family}.`,
                        `Điểm Luân Hồi tích lũy: ${Math.floor(progress?.tree?.lifetimePointsEarned ?? 0)} RP.`,
                        `Năng Lượng Luân Hồi: ${Math.floor(progress?.energy?.current ?? 0)}/300.`,
                    ], report, 'reincarnated');
                }
                case 'recoverArtifactRelic': {"""
g, count = block.subn(replacement, g, count=1)
if count != 1:
    raise SystemExit(f'expected one reincarnate dispatch block, replaced {count}')
p.write_text(g)

# Align V129 tests with V4 ownership while preserving First Clear for hunt telemetry only.
p = Path('qa/tests/v129-gameplay-consistency-test.js')
t = p.read_text()
t = t.replace("test('legacy Săn Yêu FirstClearLike event unlocks Tọa Hóa', () => {\n  const ev = { id:'legacy.hunt.first', worldTimeYears:20, ageYears:30, type:'combat', significance:34, message:'Boss cleared', tags:['EndlessHunt','Victory','FloorBoss','FirstClearLike'] };\n  assert.equal(session(1299101, readyState(), [ev]).voluntaryPassingEligibility().ok, true);\n});",
"test('legacy Săn Yêu FirstClearLike event is no longer a Tọa Hóa requirement', () => {\n  const ev = { id:'legacy.hunt.first', worldTimeYears:20, ageYears:30, type:'combat', significance:34, message:'Boss cleared', tags:['EndlessHunt','Victory','FloorBoss','FirstClearLike'] };\n  assert.equal(session(1299101, readyState(), [ev]).voluntaryPassingEligibility().ok, true);\n  assert.equal(session(1299105, readyState(), []).voluntaryPassingEligibility().ok, true);\n});")
t = t.replace("test('Săn Yêu boss-clear state repairs old saves even when history tag is missing', () => {\n  const state = readyState();\n  state.endlessHunt = createEndlessHuntState();\n  state.endlessHunt.totalBossKills = 1;\n  state.endlessHunt.highestClearedFloor = 1;\n  state.endlessHunt.highestClearedByMajor = { '1': 1 };\n  const gate = session(1299102, state, []).voluntaryPassingEligibility();\n  assert.equal(gate.ok, true);\n  assert.ok(gate.firstClears >= 1);\n});",
"test('Săn Yêu clear state is independent from voluntary Tọa Hóa eligibility', () => {\n  const state = readyState();\n  state.endlessHunt = createEndlessHuntState();\n  state.endlessHunt.totalBossKills = 1;\n  state.endlessHunt.highestClearedFloor = 1;\n  state.endlessHunt.highestClearedByMajor = { '1': 1 };\n  const gate = session(1299102, state, []).voluntaryPassingEligibility();\n  assert.equal(gate.ok, true);\n  assert.equal(gate.firstClears, undefined);\n});")
t = t.replace("test('Phó Bản cleared-state evidence also repairs an old missing-history save', () => {\n  const state = readyState();\n  state.dungeons.highestClearedFloor['dungeon.spirit_gathering_cave'] = 2;\n  const gate = session(1299103, state, []).voluntaryPassingEligibility();\n  assert.equal(gate.ok, true);\n  assert.ok(gate.firstClears >= 2);\n});",
"test('Phó Bản clear state is independent from voluntary Tọa Hóa eligibility', () => {\n  const state = readyState();\n  state.dungeons.highestClearedFloor['dungeon.spirit_gathering_cave'] = 2;\n  const gate = session(1299103, state, []).voluntaryPassingEligibility();\n  assert.equal(gate.ok, true);\n  assert.equal(gate.firstClears, undefined);\n});")
t = t.replace("test('Tọa Hóa blocker message names concrete player actions instead of unexplained First Clear jargon', () => {\n  const gate = session(1299104, readyState(), []).voluntaryPassingEligibility();\n  assert.equal(gate.ok, false);\n  assert.match(gate.reason, /Boss Săn Yêu|Phó Bản/);\n  assert.doesNotMatch(gate.reason, /First Clear/);\n});",
"test('Tọa Hóa V4 has no age, realm or First Clear blocker when energy is sufficient', () => {\n  const state=createPlayableAdventureState();\n  state.ageYears=1; state.realm.maxRealmOrder=0; state.realm.realmId='realm.mortal';\n  const gate=session(1299104,state,[]).voluntaryPassingEligibility();\n  assert.equal(gate.ok,true);\n  assert.equal(gate.reason,undefined);\n  assert.ok(gate.energyCost>0);\n});")
t = t.replace("test('Luân Hồi read-model exposes Tọa Hóa as available after a legacy Săn Yêu clear', () => {", "test('Luân Hồi read-model exposes Tọa Hóa from energy, independent of First Clear', () => {")
t = t.replace("  assert.ok(hub.lifeEnd.firstClears >= 1);", "  assert.equal(hub.lifeEnd.firstClears, undefined);")
t = t.replace("test('player-facing perform path can actually execute Tọa Hóa once the repaired gate is satisfied', () => {", "test('player-facing perform path executes voluntary Tọa Hóa without a First Clear gate', () => {")
t = t.replace("test('legacy Săn Yêu clear survives the complete Tọa Hóa → Thí Luyện → Chuyển Sinh player flow', () => {", "test('complete V4 flow is Tọa Hóa → Tổng Kết Nhất Kiếp → Chuyển Sinh without synthetic trials', () => {")
t = t.replace("  const offense = api.runReincarnationTrialV2('offense', 1_000);\n  const survival = api.runReincarnationTrialV2('survival', 2_000);\n  assert.equal(offense.durationSeconds, 60);\n  assert.equal(survival.durationSeconds, 60);\n", "")
t = t.replace("test('a new life must earn its own first clear before voluntary Tọa Hóa becomes available again', () => {", "test('a new life can voluntarily Tọa Hóa without First Clear once Energy is sufficient', () => {")
t = t.replace("  api.runReincarnationTrialV2('offense', 1_000);\n  api.runReincarnationTrialV2('survival', 2_000);\n", "")
old_tail = """  // Recreate the non-clear requirements in life 2; prior-life clears must not leak through meta/history.
  ss.stateValue.realm.realmId = 'realm.foundation.early';
  ss.stateValue.realm.maxRealmOrder = 10;
  ss.stateValue.ageYears = 60;
  ss.stateValue.lifespanYears = Math.max(240, ss.stateValue.lifespanYears ?? 0);
  const gate = ss.voluntaryPassingEligibility();
  assert.equal(gate.ok, false);
  assert.equal(gate.firstClears, 0);
  assert.match(gate.reason, /Boss Săn Yêu|Phó Bản/);"""
new_tail = """  // Energy remains the only voluntary Tọa Hóa gate in life 2.
  ss.metaValue.reincarnationProgress.energy.current = 300;
  const gate = ss.voluntaryPassingEligibility();
  assert.equal(gate.ok, true);
  assert.equal(gate.firstClears, undefined);
  assert.ok(gate.energyCost > 0);"""
t = t.replace(old_tail, new_tail)
# Idempotent upgrade if an earlier temporary patch already rewrote the tail without restoring Energy.
marker = "test('a new life can voluntarily Tọa Hóa without First Clear once Energy is sufficient', () => {"
if marker in t:
    a = t.index(marker)
    b = t.index("\n});", a)
    section = t[a:b]
    if "energy.current = 300" not in section:
        section = section.replace("  const gate = ss.voluntaryPassingEligibility();", "  ss.metaValue.reincarnationProgress.energy.current = 300;\n  const gate = ss.voluntaryPassingEligibility();")
        t = t[:a] + section + t[b:]
p.write_text(t)

# Hard structural assertions for this patch stage.
if re.search(r'applyFateEmbryoToEntity|effectiveManifestationCapacity', Path('dist/core/session.js').read_text()):
    raise SystemExit('Mệnh Thai entity wrapper remains in session.js')
if re.search(r'CP còn lại|Mệnh Cơ:|Mệnh Thai đời mới|bundleSummaryLines', Path('dist/core/gameplay-dispatch.js').read_text()):
    raise SystemExit('legacy reincarnation presentation remains in gameplay-dispatch.js')

print('REINCARNATION V4 FINALIZER PATCH — APPLIED')
