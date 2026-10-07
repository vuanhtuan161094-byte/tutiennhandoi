extends Node
class_name ArtifactCombatDirector
const GROUP := preload("res://scripts/combat/artifact_actor_group.gd")
const VFX := preload("res://scripts/combat/artifact_combat_vfx.gd")
var group: ArtifactActorGroup
var _screen: Control
var _dao: Dictionary = {}
var _enabled := false
var _skill_id := ""
var _settle_after := 0.0
var _echoes: Array[ArtifactActor] = []
var _beat := "idle"
var _clock := 0.0
var _ultimate_pending := false

func setup(screen: Control, battlefield: Control) -> void:
	_screen = screen
	group = GROUP.new()
	group.name = "ArtifactActorGroup"
	battlefield.add_child(group)
	for i in range(8):
		var echo := ArtifactActor.new()
		echo.name = "ArtifactCosmeticEcho%d" % i
		echo.kind = i%3
		echo.scale = Vector2.ONE*0.55
		echo.modulate = Color(0.7,0.9,1,0.28)
		echo.visible = false
		group.add_child(echo)
		_echoes.append(echo)

func bind(dao_id: String, projection: Dictionary) -> void:
	_enabled = dao_id == "artifact"
	group.visible = _enabled
	_dao = projection.duplicate(true) if _enabled else {}
	_skill_id = ""
	_ultimate_pending = false
	_clear_echoes()
	_layout()
	_reconcile()

func _layout() -> void:
	group.set_layout(group.to_local(_screen._player_actor.body_center_global()),_screen.size)

func _reconcile() -> void:
	var count := 0
	var merged := false
	for meter in _dao.get("meters",[]):
		if str(meter.get("id","")) == "artifactSourcesV2":
			count = int(meter.get("value",0))
	for flag in _dao.get("flags",[]):
		if str(flag.get("id","")) == "artifactMergeActive":
			merged = bool(flag.get("active",false))
	if count != group.source_count or merged != group.merged:
		_clear_echoes()
		_ultimate_pending = false
		_settle_after = 0
	group.reconcile(count,merged)

func _clear_echoes() -> void:
	for echo in _echoes:
		echo.visible = false
	_beat = "idle"

func present(event: Dictionary) -> void:
	if not _enabled:
		return
	var type := str(event.get("type",""))
	var actor := str(event.get("actor",""))
	var payload: Dictionary = event.get("payload",{})
	if type in ["battle.start","battle.end"]:
		cancel_motion()
		return
	if type == "combat.interrupt" and str(event.get("target","")) == "player":
		cancel_motion()
		return
	if actor != "player":
		return
	if type == "combat.daoProjection":
		_dao = payload.get("dao",{}).duplicate(true)
		_reconcile()
		return
	if type == "combat.resource" and str(payload.get("resourceId","")) == "artifactSourcesV2":
		for meter in _dao.get("meters",[]):
			if meter.get("id","") == "artifactSourcesV2":
				meter["value"] = payload.get("resourceValue",0)
		_reconcile()
		if _skill_id.ends_with("split") or _skill_id.ends_with("deploy"):
			_clear_echoes()
		return
	var skill := str(event.get("skill_id",""))
	if type == "skill.cast.start":
		cancel_motion()
		_skill_id = skill
	elif skill.is_empty():
		skill = _skill_id
	if not VFX.supports_skill(skill):
		return
	var phase := ""
	match type:
		"skill.cast.start": phase = "cast"
		"skill.travel":
			if event.get("target","") == "enemy": phase = "travel"
		"combat.damage":
			if event.get("target","") == "enemy": phase = "impact"
		"combat.shield", "combat.heal": phase = "self"
	if phase.is_empty():
		return
	var style := VFX.style_for_skill(skill)
	var target := group.to_local(_screen._enemy_actor.global_position+_screen._enemy_actor.size*Vector2(0.52,0.54))
	if not (style == "ultimate" and phase == "travel"):
		group.command(style,phase,target)
	_settle_after = 1.4
	if style in ["split","deploy"] and phase == "cast":
		for i in range(2):
			var echo := _echoes[i]
			echo.visible = true
			echo.position = group.home(0)
			echo.move_to(group.safe_point(group.home(0)+Vector2((i*2-1)*34,-30)),0.55,12,style)
	if style == "ultimate" and phase in ["cast","travel"]:
		_clock = 0.81 if phase == "travel" else 0.0
		_ultimate_pending = phase == "travel"
		_beat = "still"
		_settle_after = 2.3
	if phase == "impact":
		_ultimate_pending = false
		_clear_echoes()

func cancel_motion() -> void:
	_settle_after = 0
	_ultimate_pending = false
	_clear_echoes()
	group.restore()

func _process(delta: float) -> void:
	if not _enabled:
		return
	_layout()
	if _settle_after > 0:
		_settle_after -= maxf(0,delta)
		if _settle_after <= 0:
			cancel_motion()
	if _beat == "idle":
		return
	_clock += maxf(0,delta)
	var target := group.to_local(_screen._enemy_actor.global_position+_screen._enemy_actor.size*Vector2(0.52,0.54))
	if _clock > 0.22 and _beat == "still":
		_beat = "summon"
		for i in range(_echoes.size()):
			var echo := _echoes[i]
			echo.visible = true
			echo.position = group.safe_point(group.home(0)+Vector2((i%4-1.5)*34,-35-float(i/4)*36))
			echo.move_to(echo.position,0.01,0,"summon")
	if _clock > 0.58 and _beat == "summon":
		_beat = "command"
		for echo in _echoes:
			echo.rotation = (target-echo.position).angle()+PI/2
	if _ultimate_pending and _clock > 0.8:
		if _beat != "volley":
			group.command("ultimate","travel",target)
		_beat = "volley"
		for i in range(_echoes.size()):
			var echo := _echoes[i]
			if echo.pose != "launch" and _clock > 0.8+i*0.07:
				echo.move_to(group.safe_point(target+Vector2((i%3-1)*28,-30)),0.38,15,"launch")
