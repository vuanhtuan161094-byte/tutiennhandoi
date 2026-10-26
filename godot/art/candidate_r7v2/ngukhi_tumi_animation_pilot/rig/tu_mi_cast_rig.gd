extends Node2D

const ARM_HAND_TIP_LOCAL := Vector2(-410.5, 635.5)

@onready var animation_player: AnimationPlayer = $AnimationPlayer
@onready var arm_pivot: Node2D = $ArmPivot
@onready var arm: Sprite2D = $ArmPivot/Arm
@onready var treasure: Sprite2D = $Treasure
@onready var cast_vfx: Node2D = $CastVFX
@onready var treasure_vfx: Node2D = $TreasureVFX

func _ready() -> void:
	_configure_cast_animation()
	animation_player.play(&"cast")

func _process(_delta: float) -> void:
	var hand_offset := arm.position + ARM_HAND_TIP_LOCAL * arm.scale
	cast_vfx.position = arm_pivot.position + hand_offset.rotated(arm_pivot.rotation)
	treasure_vfx.position = treasure.position

func _configure_cast_animation() -> void:
	var animation := Animation.new()
	animation.resource_name = "cast"
	animation.length = 1.5
	animation.loop_mode = Animation.LOOP_LINEAR

	_add_track(animation, Animation.TYPE_VALUE, "ArmPivot:rotation_degrees",
		[0.0, -3.0, 8.0, 28.0, 58.0, 95.0, 130.0, 150.0, 165.0, 145.0, 102.0, 42.0, 0.0])
	_add_track(animation, Animation.TYPE_VALUE, "Treasure:position",
		[Vector2(368.5, -594.0), Vector2(366.0, -604.0), Vector2(362.0, -620.0),
		Vector2(362.0, -646.0), Vector2(366.0, -667.0), Vector2(374.0, -652.0),
		Vector2(385.0, -623.0), Vector2(384.0, -592.0), Vector2(378.0, -580.0),
		Vector2(370.0, -586.0), Vector2(366.0, -600.0), Vector2(368.0, -600.0),
		Vector2(368.5, -594.0)])
	_add_track(animation, Animation.TYPE_VALUE, "Treasure:rotation_degrees",
		[0.0, -7.0, -14.0, -20.0, -14.0, 0.0, 18.0, 28.0, 20.0, 10.0, 2.0, -4.0, 0.0])
	_add_track(animation, Animation.TYPE_VALUE, "CastVFX:energy",
		[0.02, 0.05, 0.10, 0.24, 0.40, 0.60, 0.82, 1.0, 0.92, 0.70, 0.42, 0.12, 0.02])
	_add_track(animation, Animation.TYPE_VALUE, "CastVFX:rotation",
		[0.0, 0.12, 0.22, 0.40, 0.62, 0.82, 1.02, 1.24, 1.42, 1.58, 1.72, 1.86, 2.0])
	_add_track(animation, Animation.TYPE_VALUE, "TreasureVFX:energy",
		[0.04, 0.08, 0.14, 0.24, 0.40, 0.62, 0.84, 1.0, 0.88, 0.60, 0.34, 0.12, 0.04])
	_add_track(animation, Animation.TYPE_VALUE, "TreasureVFX:rotation",
		[0.0, -0.08, -0.18, -0.28, -0.38, -0.48, -0.58, -0.68, -0.78, -0.88, -0.98, -1.08, -1.18])

	var library := AnimationLibrary.new()
	library.add_animation(&"cast", animation)
	animation_player.root_node = NodePath("..")
	animation_player.add_animation_library(&"", library)

func _add_track(animation: Animation, track_type: Animation.TrackType, path: String, values: Array) -> void:
	var track := animation.add_track(track_type)
	animation.track_set_path(track, NodePath(path))
	animation.track_set_interpolation_type(track, Animation.INTERPOLATION_LINEAR)
	for index in range(values.size()):
		animation.track_insert_key(track, float(index) / 8.0, values[index])
