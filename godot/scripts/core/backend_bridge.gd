extends Node

signal home_updated(home: Dictionary)
signal character_updated(character_view: Dictionary)
signal bridge_status_changed(online: bool, message: String)
signal action_failed(message: String)
signal action_completed(action_id: String, result: Dictionary)

const PORT := 4192
const BASE_URL := "http://127.0.0.1:4192"
const POLL_SECONDS := 1.0
const EXPECTED_HOME_SCHEMA := "godot-home-bridge.v1"
const EXPECTED_CHARACTER_SCHEMA := "godot-character-bridge.v1"
const EXPECTED_BRIDGE_VERSION := "godot-bridge.v2"

var _poll_http: HTTPRequest
var _character_http: HTTPRequest
var _action_http: HTTPRequest
var _timer: Timer
var _bridge_pid: int = -1
var _online := false
var _status_message := ""
var _poll_inflight := false
var _character_inflight := false
var _action_inflight := false
var _pending_action_id := ""

func _ready() -> void:
	_poll_http = HTTPRequest.new()
	_poll_http.name = "PollHttp"
	add_child(_poll_http)
	_poll_http.request_completed.connect(_on_poll_completed)

	_character_http = HTTPRequest.new()
	_character_http.name = "CharacterHttp"
	add_child(_character_http)
	_character_http.request_completed.connect(_on_character_completed)

	_action_http = HTTPRequest.new()
	_action_http.name = "ActionHttp"
	add_child(_action_http)
	_action_http.request_completed.connect(_on_action_completed)

	_timer = Timer.new()
	_timer.wait_time = POLL_SECONDS
	_timer.autostart = true
	_timer.timeout.connect(refresh_home)
	add_child(_timer)

	_start_local_bridge()
	await get_tree().create_timer(0.45).timeout
	refresh_home()

func _exit_tree() -> void:
	if _bridge_pid > 0:
		OS.kill(_bridge_pid)

func _start_local_bridge() -> void:
	if not OS.is_debug_build():
		return
	var node_executable := _resolve_node_executable()
	if node_executable.is_empty():
		_set_online(false, "Không tìm thấy Node.js")
		return
	var bridge_path := ProjectSettings.globalize_path("res://backend/bridge_server.mjs")
	_bridge_pid = OS.create_process(node_executable, [bridge_path, str(PORT)], false)
	if _bridge_pid <= 0:
		_set_online(false, "Không khởi động được Node bridge")

func _resolve_node_executable() -> String:
	var output: Array = []
	var finder := "where" if OS.get_name() == "Windows" else "which"
	var exit_code := OS.execute(finder, ["node"], output, true)
	if exit_code != 0 or output.is_empty():
		return ""
	for chunk in output:
		for line in str(chunk).split("\n"):
			var candidate := line.strip_edges()
			if not candidate.is_empty():
				return candidate
	return ""

func refresh_home() -> void:
	if _poll_inflight:
		return
	_poll_inflight = true
	var err := _poll_http.request(BASE_URL + "/home")
	if err != OK:
		_poll_inflight = false
		_set_online(false, "Bridge chưa sẵn sàng")

func refresh_character() -> void:
	if _character_inflight:
		return
	_character_inflight = true
	var err := _character_http.request(BASE_URL + "/character")
	if err != OK:
		_character_inflight = false
		_set_online(false, "Không tải được Character DTO")

func perform_action(action_id: String, payload: Dictionary = {}) -> void:
	if _action_inflight:
		action_failed.emit("Đang xử lý hành động trước")
		return
	_action_inflight = true
	_pending_action_id = action_id
	var body := payload.duplicate(true)
	body["action"] = action_id
	var headers := PackedStringArray(["Content-Type: application/json"])
	var err := _action_http.request(
		BASE_URL + "/action",
		headers,
		HTTPClient.METHOD_POST,
		JSON.stringify(body)
	)
	if err != OK:
		_action_inflight = false
		_pending_action_id = ""
		action_failed.emit("Không gửi được action tới backend bridge")

func _on_poll_completed(_result: int, response_code: int, _headers: PackedStringArray, body: PackedByteArray) -> void:
	_poll_inflight = false
	var data := _decode_response(response_code, body)
	if data.is_empty():
		return
	if not _validate_home(data):
		return
	_set_online(true, "Canonical backend connected")
	home_updated.emit(data)

func _on_character_completed(_result: int, response_code: int, _headers: PackedStringArray, body: PackedByteArray) -> void:
	_character_inflight = false
	var data := _decode_response(response_code, body)
	if data.is_empty():
		return
	if not _validate_character(data):
		return
	_set_online(true, "Canonical backend connected")
	character_updated.emit(data)

func _on_action_completed(_result: int, response_code: int, _headers: PackedStringArray, body: PackedByteArray) -> void:
	_action_inflight = false
	var action_id := _pending_action_id
	_pending_action_id = ""
	var data := _decode_response(response_code, body)
	if data.is_empty():
		action_failed.emit("Backend bridge trả lỗi")
		return

	var home = data.get("home", {})
	if typeof(home) != TYPE_DICTIONARY:
		_set_online(false, "Action thiếu Home DTO")
		action_failed.emit("Action trả dữ liệu không hợp lệ")
		return
	if not _validate_home(home):
		action_failed.emit("Action trả sai canonical schema")
		return

	_set_online(true, "Canonical backend connected")
	home_updated.emit(home)
	var result = data.get("result", {})
	action_completed.emit(action_id, result if typeof(result) == TYPE_DICTIONARY else {})

func _decode_response(response_code: int, body: PackedByteArray) -> Dictionary:
	var parsed = JSON.parse_string(body.get_string_from_utf8())
	if response_code < 200 or response_code >= 300 or typeof(parsed) != TYPE_DICTIONARY:
		_set_online(false, "Backend bridge offline")
		return {}
	var data: Dictionary = parsed
	if data.get("ok", false) != true:
		_set_online(false, str(data.get("error", "Backend bridge lỗi")))
		return {}
	return data

func _validate_home(home: Dictionary) -> bool:
	if str(home.get("schema", "")) != EXPECTED_HOME_SCHEMA:
		_set_online(false, "Sai Home schema")
		return false
	if str(home.get("bridgeVersion", "")) != EXPECTED_BRIDGE_VERSION:
		_set_online(false, "Bridge version không khớp")
		return false
	var authority = home.get("authority", {})
	if typeof(authority) != TYPE_DICTIONARY or str(authority.get("cultivation", "")) != "character-cultivation.v140":
		_set_online(false, "Sai cultivation authority")
		return false
	return true

func _validate_character(view: Dictionary) -> bool:
	if str(view.get("schema", "")) != EXPECTED_CHARACTER_SCHEMA:
		_set_online(false, "Sai Character schema")
		return false
	if str(view.get("bridgeVersion", "")) != EXPECTED_BRIDGE_VERSION:
		_set_online(false, "Bridge version không khớp")
		return false
	var authority = view.get("authority", {})
	if typeof(authority) != TYPE_DICTIONARY:
		_set_online(false, "Character thiếu authority")
		return false
	if str(authority.get("equipment", "")) != "equipment.v142" or str(authority.get("stats", "")) != "combat-stat.v168":
		_set_online(false, "Character authority không khớp V165/V168")
		return false
	return true

func _set_online(value: bool, message: String) -> void:
	if _online == value and _status_message == message:
		return
	_online = value
	_status_message = message
	bridge_status_changed.emit(value, message)
