# Decisions and protected boundaries

## Applied

- Audit work continues in an isolated C clone. E is read-only; no launcher update/reset; existing Godot processes were not closed.
- WIP art binaries with unknown rights remain local and untracked. Only textual metadata/hash index may be published.
- QA uses a synthetic state saved only to an explicitly supplied disposable path.
- `endgame-boss` is gated by diagnostic + QA flags, uses canonical realm/floor selection and CombatKernel V3, and does not inject an outcome.
- A tactical-lane position adjustment is allowed as a narrow layout correction. It does not change aura, art style, skill behavior or combat authority.
- Documentation commits may advance `main`; runtime/UI/QA source changes stay on `codex/tnd-recovery-r2-r5-20261026`; no merge.
- CI/Actions remain untriggered.

## Not decided / not implied

- Rights, original source location and redistribution license for WIP clips/images.
- Approval of Home/Character/Combat screenshots as visual baseline.
- Any edit to baked character aura or project art direction.
- Correct Boss name when prefight preview and actual playback names differ.
- Meaning of Auto UX (AI skill rotation vs hunt automation) and whether a user toggle is required.
- Core Balance or auxiliary rework activation.
- Android/physical-device acceptance.
