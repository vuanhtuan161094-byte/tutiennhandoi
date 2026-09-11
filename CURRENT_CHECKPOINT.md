# CURRENT CHECKPOINT — GAME TU TIÊN NHÀN DỖI

Date: 2026-09-11

## Canonical state

- Repository authority: **`main` only**.
- Git history is the archive. Do not keep duplicate legacy snapshots merely for backup.
- Locked baseline: **V161 CLOSED / LOCKED**.
- Latest executable closure SHA: `d7e917a8ebc77dce767412e8ffad94bd1f085bb7`.
- Canonical closure QA run: `34557869821` — **SUCCESS**.
- Gameplay/web version string remains `1.40.0-alpha.24.0` until versioning is deliberately changed.
- No next gameplay version is assumed until a new scoped task is selected.

## V161 final gate state

- B1 — Bế Quan contract audit: PASS.
- B2 — Early pacing classification: PASS.
- B3 — Bound Jade spend model: PASS.
- B4 — Manual acquisition-adjusted Công Pháp pacing: PASS.
- B5 — Linh Căn × Hunt pacing: PASS.
- B6 — Economy/source-sink review: PASS.
- V161 full closure: **PASS / LOCKED**.

## V161 B6 result

B6 reconciled the live economy without changing gameplay prices, reward rates or progression rules.

- Bound Jade daily gameplay cap: 140/day — reconciled to real award paths.
- PvP Bound Jade: 5 paid wins/day × 8 — reconciled.
- Weekly recurring Bound Jade: 300/week — reconciled.
- First-clear Bound Jade: 75/week cap — reconciled.
- Gacha: 160 single / 1,440 ten-pull — unchanged; real Bound Jade sink.
- Gacha, DongFu and acceleration shop remain competing Bound Jade sinks.
- Linh Thạch market buy/sell loop remains real with finite Phường Thị stock.
- Resource farming stays uncapped; specific collection fragments remain Gacha-only.
- Tiên Ngọc thường (`immortalJade`) remains a compatibility/optional spend channel with no authored recurring internal gameplay source and is explicitly excluded from V161 recurring-economy pacing.

Dedicated regression gate: `qa/tests/v161-economy-source-sink-test.js`.

## Closure evidence

Closure candidate: `d7e917a8ebc77dce767412e8ffad94bd1f085bb7`

GitHub Actions run `34557869821`:

- Fast QA: SUCCESS.
- V161 B1–B6: SUCCESS.
- V140–V151 locked baseline: SUCCESS.
- V152–V159 locked authorities: SUCCESS.
- V160 locked audit evidence: SUCCESS.
- Backend closure: SUCCESS.
- Frontend closure: SUCCESS.

## Repository consolidation state

- only `main` is used for development;
- `.github/workflows/` contains one workflow: `qa.yml`;
- obsolete branch-specific workflows and migration/patch tools were removed;
- stale duplicate checkpoints/handoff docs and proven unreferenced legacy snapshots were removed;
- current routing docs are `CHAT_MOI_START_HERE.md`, this checkpoint, `docs/DEVELOPMENT_PROTOCOL.md`, `docs/PROJECT_STRUCTURE.md`, and `docs/systems/INDEX.md`;
- delete/rename further runtime files only after proving their live consumers and authority.

## Minimal-context protocol

For every new task read only:

1. `CURRENT_CHECKPOINT.md`
2. latest relevant version/system note only when needed
3. `docs/systems/INDEX.md` only when routing is unclear
4. exact live source/tests for the affected subsystem

Do not preload old reports, old chats, raw simulations, complete CI logs, or unrelated source.

## Execution rules

- Search → narrow → read exact authority → patch → targeted test.
- Small normal commits go directly to `main`.
- Normal executable pushes to `main` run Fast QA.
- Markdown/docs-only pushes do not run QA.
- A commit message containing `[closure]` runs Fast QA then Canonical QA.
- Read CI status first; inspect job/log details only on failure.
- Current user instruction > live `main` source/tests > current system/version note > Git history.

## Next work

Choose the next scoped gameplay/UI task. If repository consolidation continues, consolidate runtime authority **one subsystem at a time** (prove imports/consumers, migrate responsibility, run targeted tests, then delete/rename legacy files) rather than performing a bulk rename.