extends Node

signal home_updated(home: Dictionary)
signal bridge_status_changed(online: bool, message: String)
signal action_failed(message: String)

const HOST := "127.0.0.1"
const PORT := 4190
const BASE_URL := "http://127.0.0.1:4190"
const POLL_SECONDS := 1.0
const EXPECTED_HOME_SCHEMA := "godot-home-bridge.v1"
const EXPECTED_BRIDGE_VERSION := "godot-bridge.v2"

var _http: HTTPRequest
var _timer: Timer
var _bridge_pid: int = -1
var _online := false
var _status_message := ""
var _busy := false
var _pending_kind := ""

func _ready() -> void:
	_http = HTTPRequest.new()
	add_child(_http)
	_http.request_completed.connect(_on_request_completed)

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
	if not OS.has_feature("editor"):
		return
	var bridge_path := ProjectSettings.globalize_path("res://backend/bridge_server.mjs")
	_bridge_pid = OS.create_process("node", [bridge_path, str(PORT)], false)
	if _bridge_pid <= 0:
		_set_online(false, "Không khởi động được Node bridge")

func refresh_home() -> void:
	if _busy:
		return
	_busy = true
	_pending_kind = "home"
	var err := _http.request(BASE_URL + "/home")
	if err != OK:
		_busy = false
		_set_online(false, "Bridge chưa sẵn sàng")

func perform_action(action_id: String, payload: Dictionary = {}) -> void:
	if _busy:
		return
	_busy = true
	_pending_kind = "action"
	var body := payload.duplicate(true)
	body["action"] = action_id
	var headers := PackedStringArray(["Content-Type: application/json"])
	var err := _http.request(
		BASE_URL + "/action",
		headers,
		HTTPClient.METHOD_POST,
		JSON.stringify(body)
	)
	if err != OK:
		_busy = false
		action_failed.emit("Không gửi được action tới backend bridge")

func _on_request_completed(_result: int, response_code: int, _headers: PackedStringArray, body: PackedByteArray) -> void:
	_busy = false
	var parsed = JSON.parse_string(body.get_string_from_utf8())
	if response_code < 200 or response_code >= 300 or typeof(parsed) != TYPE_DICTIONARY:
		_set_online(false, "Backend bridge offline")
		if _pending_kind == "action":
			action_failed.emit("Backend bridge trả lỗi")
		return

	var data: Dictionary = parsed
	if data.get("ok", false) != true:
		_set_online(false, str(data.get("error", "Backend bridge lỗi")))
		if _pending_kind == "action":
			action_failed.emit(str(data.get("error", "Action thất bại")))
		return

	if _pending_kind == "home":
		if str(data.get("schema", "")) != EXPECTED_HOME_SCHEMA:
			_set_online(false, "Sai Home schema")
			return
		if str(data.get("bridgeVersion", "")) != EXPECTED_BRIDGE_VERSION:
			_set_online(false, "Bridge version không khớp")
			return
		var authority = data.get("authority", {})
		if typeof(authority) != TYPE_DICTIONARY or str(authority.get("cultivation", "")) != "character-cultivation.v140":
			_set_online(false, "Sai cultivation authority")
			return
		_set_online(true, "Canonical backend connected")
		home_updated.emit(data)
	elif _pending_kind == "action":
		var home = data.get("home", {})
		if typeof(home) != TYPE_DICTIONARY:
			_set_online(false, "Action thiếu Home DTO")
			action_failed.emit("Action trả dữ liệu không hợp lệ")
			return
		if str(home.get("schema", "")) != EXPECTED_HOME_SCHEMA or str(home.get("bridgeVersion", "")) != EXPECTED_BRIDGE_VERSION:
			_set_online(false, "Action trả sai bridge schema")
			action_failed.emit("Action trả sai bridge schema")
			return
		_set_online(true, "Canonical backend connected")
		home_updated.emit(home)

func _set_online(value: bool, message: String) -> void:
	if _online == value and _status_message == message:
		return
	_online = value
	_status_message = message
	bridge_status_changed.emit(value, message)
