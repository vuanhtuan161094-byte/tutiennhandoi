extends Node2D
class_name ArtifactCombatVfx
## Contact/aura helper only. Persistent actors own motion; painted V3 is retired.
signal effect_finished(skill_id: String, phase: String)
const PHASE_CAST := "cast"
const PHASE_TRAVEL := "travel"
const PHASE_IMPACT := "impact"
const PHASE_SELF := "self"
const STYLES := ["basic","deploy","guard","strike","sync","recall","split","merge","suppress","ultimate"]
var _skill_id := ""
var _phase := ""
var _style := ""
var _elapsed := 0.0
var _duration := 0.45

static func supports_skill(skill_id: String) -> bool:
	return skill_id.begins_with("skill.dao.artifact.") and skill_id.trim_prefix("skill.dao.artifact.") in STYLES

static func profile_for_skill(skill_id: String) -> Dictionary:
	if not supports_skill(skill_id):
		return {}
	return {"style":style_for_skill(skill_id),"impact":impact_kind(skill_id),"duration":0.55,"role":"contact-helper"}

static func impact_kind(skill_id: String) -> String:
	var style := style_for_skill(skill_id)
	return "break" if style in ["suppress","ultimate"] else ("heavy" if style in ["strike","sync","merge"] else "light")

static func style_for_skill(skill_id: String) -> String:
	return skill_id.trim_prefix("skill.dao.artifact.") if supports_skill(skill_id) else ""

func play(skill_id: String, phase: String, from_global: Vector2, target_global: Vector2) -> void:
	if not supports_skill(skill_id):
		queue_free()
		return
	_skill_id = skill_id
	_style = style_for_skill(skill_id)
	_phase = phase
	global_position = target_global if phase == PHASE_IMPACT else from_global
	z_index = 40

func _process(delta: float) -> void:
	_elapsed += maxf(0,delta)
	queue_redraw()
	if _elapsed >= _duration:
		effect_finished.emit(_skill_id,_phase)
		queue_free()

func _draw() -> void:
	var t := clampf(_elapsed/_duration,0,1)
	var alpha := sin(t*PI)
	var gold := Color(0.9,0.73,0.42,alpha*0.65)
	var cyan := Color(0.38,0.81,0.8,alpha*0.45)
	if _phase == PHASE_IMPACT:
		var heavy := _style in ["strike","suppress","ultimate"]
		draw_arc(Vector2.ZERO,lerpf(8,52 if heavy else 28,t),0,TAU,36,gold,3.5,true)
		if t < 0.18:
			draw_circle(Vector2.ZERO,8 if heavy else 4,Color(1,1,0.9,(1-t/0.18)*0.85))
		for i in range(6):
			var ray := Vector2.from_angle(TAU*i/6)
			var center := ray*(10+t*25)
			draw_colored_polygon(PackedVector2Array([center+ray*5,center+ray.orthogonal()*2,center-ray*3,center-ray.orthogonal()*2]),gold)
	elif _phase == PHASE_SELF and _style == "guard":
		draw_arc(Vector2(32,-8),34+t*12,-1.7,1.7,30,cyan,5,true)
	elif _phase == PHASE_SELF and _style == "recall":
		for i in range(5):
			draw_circle(Vector2.from_angle(TAU*i/5)*(28*(1-t)),3,cyan)
	elif _phase == PHASE_CAST and _style in ["deploy","merge","ultimate"]:
		# Small floor portal with a clear center; no full-screen compositing.
		draw_set_transform(Vector2(0,26),0,Vector2(1,0.35))
		draw_arc(Vector2.ZERO,34+t*10,0,TAU,36,gold,3,true)
		draw_set_transform(Vector2.ZERO)
