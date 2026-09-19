# Tu Tiên Nhàn Dỗi — Godot Bootstrap

Godot 4.7.2 project for the staged migration of the current web game.

## Open

1. Pull the latest repository.
2. Start Godot 4.7.2.
3. Import `godot/project.godot`.
4. Press **F5** to run the portrait bootstrap scene.

The existing web implementation remains the gameplay/reference authority while systems are ported in controlled slices.

## Bootstrap V1 owns

- Godot project configuration.
- Portrait 390×844 shell.
- Main scene and interaction wiring.
- Minimal `AppState` autoload for route/action events.
- Visual target documentation.

It does **not** yet own combat, save/load, offline progression or any V160–V179 gameplay authority.
