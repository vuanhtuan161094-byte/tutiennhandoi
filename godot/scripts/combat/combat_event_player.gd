extends Node
class_name CombatEventPlayer

signal event_ready(event: Dictionary)
signal playback_started(encounter_id: String)
signal playback_finished(encounter_id: String)

var _encounter_id := ""
var _elapsed := 0.0
var _playing := false
var _queue: Array = []
var _seen_cursors: Dictionary = {}


func _ready() -> void:
	set_process(false)


func reset(encounter_id: String = "") -> void:
	_encounter_id = encounter_id
	_elapsed = 0.0
	_playing = false
	_queue.clear()
	_seen_cursors.clear()
	set_process(false)


func append_events(encounter_id: String, events: Array) -> int:
	if encounter_id != _encounter_id:
		reset(encounter_id)

	var added := 0
	for raw in events:
		if typeof(raw) != TYPE_DICTIONARY:
			continue
		var event: Dictionary = raw
		var cursor := int(event.get("cursor", 0))
		if cursor <= 0 or _seen_cursors.has(cursor):
			continue
		_seen_cursors[cursor] = true
		_queue.append(event.duplicate(true))
		added += 1

	if added > 0:
		_queue.sort_custom(_event_before)
		if not _playing:
			_playing = true
			_elapsed = 0.0
			set_process(true)
			playback_started.emit(_encounter_id)
	return added


func _process(delta: float) -> void:
	if not _playing:
		return
	_elapsed += maxf(0.0, delta)

	while not _queue.is_empty():
		var next: Dictionary = _queue[0]
		if float(next.get("time", 0.0)) > _elapsed + 0.0001:
			break
		_queue.pop_front()
		event_ready.emit(next)

	if _queue.is_empty():
		_playing = false
		set_process(false)
		playback_finished.emit(_encounter_id)


func is_playing() -> bool:
	return _playing


func pending_count() -> int:
	return _queue.size()


func _event_before(a, b) -> bool:
	var time_a := float(a.get("time", 0.0))
	var time_b := float(b.get("time", 0.0))
	if not is_equal_approx(time_a, time_b):
		return time_a < time_b
	return int(a.get("cursor", 0)) < int(b.get("cursor", 0))
