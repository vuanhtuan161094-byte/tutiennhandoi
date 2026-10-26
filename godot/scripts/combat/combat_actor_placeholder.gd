extends Control
class_name CombatActorPlaceholder
const ASSETS := preload("res://scripts/combat/combat_asset_resolver.gd")
const R7V2_BOSS_ART_CANDIDATES := {
	"serpent": "res://art/candidate_r7v2/um_minh_xa/um_minh_xa_boss.png",
	"demon": "res://art/candidate_r7v2/vo_dien_yeu/vo_dien_yeu_boss.png",
}
var asset_config: Dictionary = {}
## Native silhouette placeholder; replace this surface with a sprite later.
var enemy := false
var _texture: Texture2D
var _idle_clock := 0.0
var _action_tween: Tween

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	resized.connect(queue_redraw)
	resized.connect(_sync_pivot)
	_sync_pivot()

func _process(delta: float) -> void:
	if _texture == null:
		return
	_idle_clock += maxf(0.0, delta)
	queue_redraw()

func _sync_pivot() -> void:
	pivot_offset = size * Vector2(0.5, 0.84)

func present_cast_windup() -> void:
	if _action_tween != null and _action_tween.is_running():
		_action_tween.kill()
	rotation = 0.0
	_action_tween = create_tween()
	var lean := 0.035 if enemy else -0.035
	_action_tween.tween_property(self, "rotation", lean, 0.12).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
	_action_tween.tween_property(self, "rotation", 0.0, 0.20).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)

func _shape(points: Array, fill: Color, edge: Color) -> void:
	var polygon := PackedVector2Array()
	for point in points:
		polygon.append(Vector2(point.x * size.x, point.y * size.y))
	draw_colored_polygon(polygon, fill)
	polygon.append(polygon[0])
	draw_polyline(polygon, edge, 1.2, true)

func _draw() -> void:
	if _texture != null:
		_draw_grounding_shadow()
		var source_size := _texture.get_size()
		if source_size.x > 0.0 and source_size.y > 0.0:
			var available := size * Vector2(0.98, 0.86)
			var fit := minf(available.x / source_size.x, available.y / source_size.y)
			var target_size := source_size * fit
			var idle_bob := sin(_idle_clock * 1.7) * size.y * 0.006
			var target_origin := Vector2((size.x - target_size.x) * 0.5, size.y - target_size.y - size.y * 0.02 + idle_bob)
			draw_texture_rect(_texture, Rect2(target_origin, target_size), false)
		return
	var visual_scale := clampf(float(asset_config.get("layout", {}).get("scale", 1.0)), 0.25, 2.0) if enemy else 1.0
	draw_set_transform(size * Vector2(0.5, 0.9) * (1.0 - visual_scale), 0.0, Vector2.ONE * visual_scale)
	var authored_shadow := ASSETS.texture_for_path(str(asset_config.get("shadowPath", "")))
	if authored_shadow != null:
		draw_texture_rect(authored_shadow, Rect2(size * Vector2(.1,.85), size * Vector2(.8,.1)), false)
	var rim := Color(str(asset_config.get("accent", "799b83"))) if enemy else Color("75c7cc")
	var texture := ASSETS.texture_for_path(str(asset_config.get("spritePath", ""))) if enemy else null
	if texture != null:
		draw_texture_rect(texture, Rect2(Vector2.ZERO, size), false)
		return
	var shadow := PackedVector2Array()
	for i in range(49):
		var angle := TAU * i / 48.0
		shadow.append(size * Vector2(.5 + cos(angle) * .34, .91 + sin(angle) * .035))
	draw_colored_polygon(shadow, Color(0, .02, .03, .42))
	if enemy and _draw_archetype(rim):
		return
	if enemy:
		# Abstract horned beast: a curved body, heavy neck and grounded claws.
		_shape([Vector2(.08,.79), Vector2(.15,.74), Vector2(.21,.61), Vector2(.29,.54), Vector2(.40,.52), Vector2(.50,.55), Vector2(.56,.49), Vector2(.60,.37), Vector2(.57,.29), Vector2(.55,.13), Vector2(.64,.23), Vector2(.77,.16), Vector2(.72,.29), Vector2(.83,.31), Vector2(.88,.37), Vector2(.84,.42), Vector2(.75,.44), Vector2(.71,.54), Vector2(.72,.65), Vector2(.81,.83), Vector2(.89,.87), Vector2(.74,.89), Vector2(.66,.81), Vector2(.60,.72), Vector2(.54,.79), Vector2(.55,.86), Vector2(.63,.89), Vector2(.46,.90), Vector2(.42,.81), Vector2(.35,.73), Vector2(.30,.80), Vector2(.29,.88), Vector2(.37,.91), Vector2(.20,.91), Vector2(.18,.85), Vector2(.20,.74), Vector2(.14,.80), Vector2(.07,.83)], Color("10252a"), Color(rim,.55))
		_shape([Vector2(.25,.62), Vector2(.33,.57), Vector2(.44,.56), Vector2(.55,.60), Vector2(.60,.53), Vector2(.64,.42), Vector2(.70,.44), Vector2(.66,.65), Vector2(.55,.73), Vector2(.40,.70), Vector2(.31,.72)], Color("193338"), Color(rim,.22))
		_shape([Vector2(.61,.30), Vector2(.65,.26), Vector2(.73,.30), Vector2(.79,.32), Vector2(.78,.37), Vector2(.70,.40), Vector2(.64,.37)], Color("24373a"), Color("936962"))
		draw_line(size * Vector2(.71,.33), size * Vector2(.76,.34), Color("b78c71"), 2.0, true)
		draw_line(size * Vector2(.78,.40), size * Vector2(.85,.39), Color(rim,.40), 1.0, true)
	else:
		# Hood, layered robe and a plain blade: silhouette only, no final art.
		_shape([Vector2(.22,.90), Vector2(.33,.59), Vector2(.29,.39), Vector2(.43,.29), Vector2(.43,.18), Vector2(.51,.10), Vector2(.61,.19), Vector2(.60,.30), Vector2(.73,.41), Vector2(.67,.62), Vector2(.81,.90), Vector2(.55,.86), Vector2(.43,.92)], Color("122832"), Color(rim,.65))
		_shape([Vector2(.44,.30), Vector2(.58,.30), Vector2(.64,.64), Vector2(.58,.87), Vector2(.42,.87), Vector2(.38,.63)], Color("1a3b43"), Color(rim,.25))
		_shape([Vector2(.46,.20), Vector2(.52,.15), Vector2(.58,.21), Vector2(.56,.28), Vector2(.49,.27)], Color("07161f"), Color(rim,.20))
		draw_line(size * Vector2(.66,.59), size * Vector2(.86,.16), Color("b2ccc7"), 1.5, true)
		draw_line(size * Vector2(.61,.57), size * Vector2(.72,.62), Color("bd9c65"), 2.0, true)
		draw_line(size * Vector2(.40,.52), size * Vector2(.61,.55), Color("bd9c65"), 1.5, true)

func bind_archetype(archetype_id: String, candidate_boss: bool = false) -> void:
	asset_config = ASSETS.enemy(archetype_id)
	_texture = null
	if enemy and candidate_boss:
		var candidate_path := str(R7V2_BOSS_ART_CANDIDATES.get(archetype_id, ""))
		if not candidate_path.is_empty():
			_texture = ResourceLoader.load(candidate_path) as Texture2D
	if enemy and _texture == null:
		_texture = ASSETS.texture_for_path(str(asset_config.get("spritePath", "")))
	set_process(enemy and _texture != null)
	queue_redraw()

func _draw_grounding_shadow() -> void:
	var shadow_center := size * Vector2(0.52, 0.94)
	for layer in range(3):
		var ring := PackedVector2Array()
		for point in range(32):
			var angle := TAU * float(point) / 32.0
			ring.append(shadow_center + Vector2(cos(angle) * size.x * (0.25 - layer * 0.025), sin(angle) * size.y * (0.035 - layer * 0.004)))
		draw_colored_polygon(ring, Color(0.005, 0.018, 0.022, 0.11 - layer * 0.025))

func _draw_archetype(rim: Color) -> bool:
	var id := str(asset_config.get("fallbackKey", "generic"))
	var ink := Color(rim, 0.65)
	match id:
		"wolf", "dragon":
			if id == "dragon":
				_shape([Vector2(.15,.31),Vector2(.53,.54),Vector2(.30,.69)], Color("193338"), ink)
			return false
		"serpent":
			var curve := Curve2D.new()
			curve.add_point(size * Vector2(.18,.87), Vector2.ZERO, size * Vector2(.5,-.15))
			curve.add_point(size * Vector2(.55,.65), size * Vector2(.25,.18), size * Vector2(-.25,-.18))
			curve.add_point(size * Vector2(.60,.27), size * Vector2(-.4,.1))
			draw_polyline(curve.get_baked_points(), ink, 15.0, true)
			draw_polyline(curve.get_baked_points(), Color("193338"), 12.0, true)
			_shape([Vector2(.52,.28),Vector2(.67,.20),Vector2(.81,.28),Vector2(.67,.36)], Color("193338"), ink)
		"golem":
			_shape([Vector2(.20,.88),Vector2(.26,.42),Vector2(.42,.39),Vector2(.41,.20),Vector2(.63,.20),Vector2(.66,.39),Vector2(.79,.43),Vector2(.84,.88),Vector2(.62,.87),Vector2(.51,.65),Vector2(.39,.88)], Color("23383c"), ink)
		"spirit":
			_shape([Vector2(.5,.12),Vector2(.80,.49),Vector2(.5,.84),Vector2(.20,.49)], Color("193338"), ink)
			draw_arc(size * Vector2(.5,.49), size.x * .2, 0, TAU, 32, ink, 1.0, true)
		"demon":
			_shape([Vector2(.18,.87),Vector2(.38,.42),Vector2(.33,.16),Vector2(.50,.31),Vector2(.69,.16),Vector2(.62,.42),Vector2(.84,.87),Vector2(.51,.72)], Color("193338"), ink)
		_:
			_shape([Vector2(.50,.22),Vector2(.74,.54),Vector2(.50,.85),Vector2(.26,.54)], Color("193338"), ink)
	return true
