extends Node

signal route_changed(route_id: StringName)
signal cultivation_action_requested(action_id: StringName)

const BOOTSTRAP_VERSION := "GODOT_BOOTSTRAP_V1"
const WEB_RUNTIME_AUTHORITY := "V160-V179 CLOSED / LOCKED"

var current_route: StringName = &"home"
var cultivation_status := "Đang tu luyện..."

func request_route(route_id: StringName) -> void:
	current_route = route_id
	route_changed.emit(route_id)

func request_cultivation_action(action_id: StringName) -> void:
	cultivation_action_requested.emit(action_id)
