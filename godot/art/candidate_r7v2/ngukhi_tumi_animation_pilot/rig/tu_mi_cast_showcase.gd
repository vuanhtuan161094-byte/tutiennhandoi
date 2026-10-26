extends Control

const RIG_SCENE := preload("res://art/candidate_r7v2/ngukhi_tumi_animation_pilot/rig/tu_mi_cast_rig.tscn")
const FRAME_DIR := "res://art/candidate_r7v2/ngukhi_tumi_animation_pilot/frames"
const EVIDENCE_DIR := "res://art/candidate_r7v2/ngukhi_tumi_animation_pilot/evidence"
const CAPTURE_SIZE := Vector2i(320, 480)
const FPS := 8
const FRAME_COUNT := 12

func _ready() -> void:
	if OS.get_cmdline_user_args().has("--motion-reference"):
		_build_motion_reference()
		return
	_build_showcase()
	if OS.get_cmdline_user_args().has("--capture-pilot"):
		call_deferred("_capture_pilot")

func _build_motion_reference() -> void:
	var background := ColorRect.new()
	background.color = Color(0.035, 0.026, 0.07, 1.0)
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(background)
	var rig := RIG_SCENE.instantiate()
	rig.name = "MotionReferenceRig"
	rig.position = Vector2(160.0, 270.0)
	rig.scale = Vector2(0.20, 0.20)
	add_child(rig)

func _build_showcase() -> void:
	var background := ColorRect.new()
	background.color = Color(0.035, 0.026, 0.07, 1.0)
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(background)

	var rig := RIG_SCENE.instantiate()
	rig.name = "LiveRig"
	rig.position = Vector2(195.0, 435.0)
	rig.scale = Vector2(0.35, 0.35)
	add_child(rig)

	var title := Label.new()
	title.position = Vector2(12.0, 18.0)
	title.size = Vector2(366.0, 28.0)
	title.text = "TỬ MỊ LINH CHỦ  ·  A / 2D RIG"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 16)
	title.add_theme_color_override("font_color", Color(0.94, 0.86, 1.0))
	add_child(title)

	var footer := Label.new()
	footer.position = Vector2(14.0, 802.0)
	footer.size = Vector2(362.0, 28.0)
	footer.text = "CAST LOOP  ·  12 FRAMES  ·  8 FPS  ·  CANDIDATE"
	footer.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	footer.add_theme_font_size_override("font_size", 12)
	footer.add_theme_color_override("font_color", Color(0.72, 0.68, 0.82))
	add_child(footer)

func _capture_pilot() -> void:
	var frames_path := ProjectSettings.globalize_path(FRAME_DIR)
	var evidence_path := ProjectSettings.globalize_path(EVIDENCE_DIR)
	DirAccess.make_dir_recursive_absolute(frames_path)
	DirAccess.make_dir_recursive_absolute(evidence_path)

	await get_tree().process_frame
	await RenderingServer.frame_post_draw
	var live_animation := get_node("LiveRig/AnimationPlayer") as AnimationPlayer
	live_animation.seek(0.875, true)
	await get_tree().process_frame
	await RenderingServer.frame_post_draw
	var runtime_image := get_viewport().get_texture().get_image()
	var runtime_path := evidence_path.path_join("runtime-a-390x844.png")
	var runtime_error := runtime_image.save_png(runtime_path)
	print("RUNTIME_SCREENSHOT path=%s size=%s error=%s" % [runtime_path, runtime_image.get_size(), runtime_error])

	var frame_viewport := SubViewport.new()
	frame_viewport.name = "FrameExportViewport"
	frame_viewport.size = CAPTURE_SIZE
	frame_viewport.transparent_bg = true
	frame_viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	add_child(frame_viewport)

	var centered_rig := Node2D.new()
	centered_rig.position = Vector2(160.0, 270.0)
	centered_rig.scale = Vector2(0.20, 0.20)
	frame_viewport.add_child(centered_rig)
	var export_rig := RIG_SCENE.instantiate()
	centered_rig.add_child(export_rig)
	await get_tree().process_frame
	await RenderingServer.frame_post_draw

	var animation_player := export_rig.get_node("AnimationPlayer") as AnimationPlayer
	for frame_index in range(FRAME_COUNT):
		animation_player.seek(float(frame_index) / float(FPS), true)
		export_rig._process(0.0)
		await get_tree().process_frame
		await RenderingServer.frame_post_draw
		var frame_image := frame_viewport.get_texture().get_image()
		var frame_path := frames_path.path_join("frame_%02d.png" % frame_index)
		var error := frame_image.save_png(frame_path)
		print("FRAME_EXPORT index=%d path=%s size=%s error=%s" % [frame_index, frame_path, frame_image.get_size(), error])

	print("PILOT_CAPTURE_COMPLETE frames=%d fps=%d" % [FRAME_COUNT, FPS])
	get_tree().quit()
