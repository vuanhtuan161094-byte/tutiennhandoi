class_name HomeCultivationAnimationTest
extends GdUnitTestSuite

const HOME_HUD := preload("res://scripts/home/home_hud.gd")

func test_rate_per_second_is_one_fifteenth_of_canonical_quantum() -> void:
	var rate := HOME_HUD.cultivation_rate_per_second(100.0)
	assert_bool(absf(rate - (100.0 / 15.0)) < 0.0001).is_true()
	assert_float(HOME_HUD.cultivation_rate_per_second(0.0)).is_equal(0.0)
	assert_float(HOME_HUD.cultivation_rate_per_second(-50.0)).is_equal(0.0)

func test_rate_uses_canonical_commit_interval() -> void:
	assert_float(HOME_HUD.cultivation_rate_per_second(120.0, 12.0)).is_equal(10.0)

func test_home_rate_label_is_integer_only() -> void:
	assert_str(HOME_HUD.cultivation_rate_label(100.0)).is_equal("+7 Tu Vi/s")
	assert_str(HOME_HUD.cultivation_rate_label(90.0)).is_equal("+6 Tu Vi/s")

func test_ling_quang_event_copy_has_distinct_rarity_tiers() -> void:
	assert_str(str(HOME_HUD.ling_quang_event_copy(2)["title"])).is_equal("LINH QUANG ×2")
	assert_str(str(HOME_HUD.ling_quang_event_copy(3)["title"])).is_equal("LINH QUANG ×3")
	assert_str(str(HOME_HUD.ling_quang_event_copy(4)["title"])).is_equal("LINH QUANG ×4")
	assert_str(str(HOME_HUD.ling_quang_event_copy(6)["title"])).is_equal("ĐẠI LINH QUANG ×6")
	assert_str(str(HOME_HUD.ling_quang_event_copy(10)["title"])).is_equal("THIÊN ĐỊA CỘNG MINH ×10")

func test_gain_pulse_tracks_visible_integer_advance_only() -> void:
	assert_int(HOME_HUD.cultivation_gain_pulse_amount(10.0, 11.1)).is_equal(1)
	assert_int(HOME_HUD.cultivation_gain_pulse_amount(10.2, 12.2)).is_equal(2)
	assert_int(HOME_HUD.cultivation_gain_pulse_amount(12.0, 11.0)).is_equal(0)
	assert_int(HOME_HUD.cultivation_gain_pulse_amount(5.1, 5.4)).is_equal(0)
