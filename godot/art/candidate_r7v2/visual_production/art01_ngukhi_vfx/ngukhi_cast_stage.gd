# ART-01 candidate showcase: actual Tử Mị rig + separate, deterministic Godot VFX.
# Not a production battle: dummy target is purely decorative.
extends Control

const RIG_SCENE := preload("res://art/candidate_r7v2/ngukhi_tumi_animation_pilot/rig/tu_mi_cast_rig.tscn")
const VFX_SCRIPT := preload("res://art/candidate_r7v2/visual_production/art01_ngukhi_vfx/ngukhi_cast_vfx.gd")

var rig: Node2D
var vfx: Node2D
var _clock: float = 0.0

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_STOP
	_set_stage()
	rig = RIG_SCENE.instantiate()
	rig.position = Vector2(131.0, 499.0)
	rig.scale = Vector2(0.26, 0.26)
	add_child(rig)
	# Old pilot FX and prop are hidden; new VFX carries both independently.
	rig.get_node("CastVFX").visible = false
	rig.get_node("TreasureVFX").visible = false
	rig.get_node("Treasure").visible = false
	vfx = Node2D.new()
	vfx.set_script(VFX_SCRIPT)
	vfx.name = "NgukhiCastVFX"
	add_child(vfx)
	vfx.call("set_anchors", Vector2(155.0, 349.0), Vector2(325.0, 375.0))
	queue_redraw()

func _set_stage() -> void:
	var title := Label.new()
	title.text = "NGỰ KHÍ ĐẠO  ·  PHÁ KHÔNG NGỰ KÍCH"
	title.position = Vector2(18.0, 54.0)
	title.size = Vector2(354.0, 38.0)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 17)
	title.add_theme_color_override("font_color", Color(0.94, 0.88, 1.0))
	add_child(title)
	var subtitle := Label.new()
	subtitle.text = "ART-01 CANDIDATE  ·  TAP TO REPLAY"
	subtitle.position = Vector2(18.0, 790.0)
	subtitle.size = Vector2(354.0, 32.0)
	subtitle.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	subtitle.add_theme_font_size_override("font_size", 12)
	subtitle.add_theme_color_override("font_color", Color(0.70, 0.73, 0.82))
	add_child(subtitle)

func _process(delta: float) -> void:
	_clock += delta
	queue_redraw()

func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, size), Color(0.026, 0.021, 0.074), true)
	# Decorative ground and clearly non-gameplay dummy target.
	for i in range(5):
		var r := 62.0 + float(i) * 28.0
		draw_arc(Vector2(152.0, 691.0), r, PI, TAU, 54, Color(0.19, 0.36, 0.53, 0.09), 1.0, true)
	draw_arc(Vector2(325.0, 375.0), 35.0, 0.0, TAU, 46, Color(0.64, 0.47, 0.87, 0.23), 2.0, true)
	draw_circle(Vector2(325.0, 375.0), 15.0, Color(0.39, 0.19, 0.64, 0.12))
	for i in range(21):
		var x := fposmod(float(i) * 41.7 + sin(float(i) * 1.7) * 11.0, 390.0)
		var y := fposmod(float(i) * 97.3 + _clock * (3.0 + float(i % 4)), 844.0)
		draw_circle(Vector2(x, y), 0.8 + float(i % 3) * 0.4, Color(0.49, 0.71, 0.94, 0.11))

func _gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed:
		vfx.call("replay")
		var ap := rig.get_node("AnimationPlayer") as AnimationPlayer
		ap.play(&"cast")
		ap.seek(0.0, true)
