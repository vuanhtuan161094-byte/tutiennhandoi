extends GdUnitTestSuite
const CAPTURE := preload("res://addons/stagehand/core/screenshot_capture.gd")

func test_rejects_empty_image() -> void:
	assert_bool(bool(CAPTURE.image_content_metrics(Image.new()).valid)).is_false()

func test_rejects_black_transparent_and_uniform_frames() -> void:
	# In-memory validator fixtures only; these are never exported as runtime proof.
	for color in [Color.BLACK, Color.TRANSPARENT, Color(1, 1, 1, 0), Color("050c12")]:
		var image := Image.create(64, 64, false, Image.FORMAT_RGBA8)
		image.fill(color)
		assert_bool(bool(CAPTURE.image_content_metrics(image).valid)).is_false()
