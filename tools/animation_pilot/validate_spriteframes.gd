extends SceneTree

const SPRITEFRAMES_PATH := "res://art/candidate_r7v2/ngukhi_tumi_animation_pilot/cast_spriteframes.tres"
const EXPECTED_FRAMES := 12
const EXPECTED_FPS := 8.0

func _initialize() -> void:
	call_deferred("_validate")

func _validate() -> void:
	var sprite_frames := load(SPRITEFRAMES_PATH) as SpriteFrames
	assert(sprite_frames != null, "SpriteFrames resource did not load")
	assert(sprite_frames.has_animation(&"cast"), "cast animation is missing")
	assert(sprite_frames.get_animation_loop(&"cast"), "cast animation must loop")
	assert(sprite_frames.get_frame_count(&"cast") == EXPECTED_FRAMES, "wrong Cast frame count")
	assert(is_equal_approx(sprite_frames.get_animation_speed(&"cast"), EXPECTED_FPS), "wrong Cast FPS")
	for index in range(EXPECTED_FRAMES):
		assert(sprite_frames.get_frame_texture(&"cast", index) != null, "missing texture at frame %d" % index)
	print("SPRITEFRAMES_PASS animation=cast frames=%d fps=%d loop=true" % [EXPECTED_FRAMES, int(EXPECTED_FPS)])
	quit(0)
