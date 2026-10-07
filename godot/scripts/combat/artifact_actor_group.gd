extends Node2D
class_name ArtifactActorGroup
const ACTOR := preload("res://scripts/combat/artifact_actor.gd")
var actors: Array[ArtifactActor] = []
var great: ArtifactActor
var source_count := 0
var merged := false
var _merge_transition := 0.0
var _prepared_merge_count := 0
var _player := Vector2.ZERO
var _bounds := Vector2(390,844)

func _ready() -> void:
	z_index = 30
	for i in range(3):
		var actor := ACTOR.new()
		actor.kind = i
		actor.name = "ArtifactSource%d" % (i+1)
		actor.visible = false
		add_child(actor)
		actors.append(actor)
	great = ACTOR.new()
	great.kind = 3
	great.name = "GreatArtifactActor"
	great.visible = false
	add_child(great)

func set_layout(player: Vector2, bounds: Vector2) -> void:
	if player.distance_to(_player) < 0.5 and bounds == _bounds:
		return
	_player = player
	_bounds = bounds
	restore()

func safe_point(point: Vector2) -> Vector2:
	return Vector2(clampf(point.x,24,_bounds.x-24),clampf(point.y,_bounds.y*0.19+34,_bounds.y*0.73-34))

func home(index: int) -> Vector2:
	var offsets := [Vector2(0.30,-0.14),Vector2(0.30,-0.03),Vector2(-0.18,-0.14)]
	if source_count == 1:
		return safe_point(_player + Vector2(0.30*_bounds.x,-0.15*_bounds.y))
	return safe_point(_player + offsets[index] * _bounds)

func reconcile(count: int, merge_active: bool) -> void:
	var next_count := clampi(count,0,3)
	var next_merge := merge_active and next_count > 0
	if next_count == source_count and next_merge == merged:
		return
	var previous_count := source_count
	var entering := next_merge and not merged
	source_count = next_count
	merged = next_merge
	_merge_transition = 0
	restore()
	if entering and maxi(previous_count,_prepared_merge_count) > 1:
		_merge_transition = 0.5
		great.visible = false
		for i in range(maxi(previous_count,_prepared_merge_count)):
			actors[i].visible = true
			actors[i].move_to(great._destination,0.48,18,"merge")

func _process(delta: float) -> void:
	if _merge_transition > 0:
		_merge_transition -= maxf(0,delta)
		if _merge_transition <= 0:
			restore()

func restore() -> void:
	_merge_transition = 0
	for i in range(actors.size()):
		if not actors[i].visible:
			actors[i].position = home(i)
		actors[i].visible = i < source_count and not merged
		actors[i].rotation = 0
		actors[i].modulate = Color.WHITE
		actors[i].move_to(home(i),0.42,12,"idle")
	if great != null:
		great.visible = merged
		great.rotation = 0
		great.modulate = Color.WHITE
		great.move_to(safe_point(_player+Vector2(_bounds.x*0.30,-_bounds.y*0.12)),0.48,18,"idle")

func active_actors() -> Array[ArtifactActor]:
	var result: Array[ArtifactActor] = []
	if merged and great != null:
		result.append(great)
	else:
		for i in range(mini(source_count,actors.size())):
			result.append(actors[i])
	return result

func selected() -> ArtifactActor:
	var active := active_actors()
	return active[0] if not active.is_empty() else null

func command(style: String, phase: String, target: Vector2) -> void:
	if style == "merge" and phase == "cast":
		_prepared_merge_count = source_count
	var active := active_actors()
	for i in range(active.size()):
		var actor := active[i]
		if style == "guard" and active.size() > 1:
			actor = active[1]
		var all_command := style in ["sync","suppress","ultimate","merge","split","deploy"]
		if not all_command and i > 0:
			continue
		if phase == "impact":
			actor.position = safe_point(target)
			actor.move_to(home(i) if not merged else safe_point(_player+Vector2(_bounds.x*0.30,-_bounds.y*0.12)),0.65,45,"return")
		elif style == "guard":
			actor.rotation = (target - _player).angle()+PI/2
			actor.move_to(safe_point(_player+Vector2(64,-24)),0.3,12,"guard")
		elif style == "recall":
			actor.move_to(safe_point(_player),0.52,24,"recall")
		elif style == "merge":
			actor.move_to(safe_point(_player+Vector2(72,-76)),0.6,20,"merge")
		elif style in ["split","deploy"]:
			var separation := Vector2((i-1)*30,-24) if style == "split" else Vector2(0,-44)
			actor.move_to(safe_point(home(i)+separation),0.38,15,style)
		elif style == "suppress" and phase == "cast":
			var angle := TAU*float(i)/maxi(1,active.size())
			actor.move_to(safe_point(target+Vector2.from_angle(angle)*70),0.6,28,"seal")
		elif phase == "travel":
			var offset := Vector2((i-1)*34,-30) if all_command else Vector2(-18,16)
			actor.move_to(safe_point(target+offset),0.36+i*0.06,16,"launch")
		else:
			actor.move_to(safe_point(actor.position+Vector2(-12,-12-i*8)),0.18,0,"charge")
