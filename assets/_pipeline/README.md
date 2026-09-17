# Asset Pipeline V2

This directory is the control plane for generated/edited visual assets. Production binaries stay in semantic runtime folders such as `assets/huntv2/`, `assets/runtime/`, `assets/dongphu/`, etc.

## Lifecycle

`draft -> candidate -> approved -> integrated -> locked`

Optional terminal state: `retired`.

- `draft`: a machine-readable brief exists under `assets/_pipeline/briefs/`.
- `candidate`: generated/edited options exist and are referenced by the brief.
- `approved`: the user explicitly selected one candidate.
- `integrated`: the approved winner exists at its real production path and is wired into runtime code/CSS.
- `locked`: exact-SHA runtime smoke/evidence is green and the owning UI slice has been approved/closed.
- `retired`: intentionally no longer used.

## Required workflow

1. Copy `brief.template.json` to `assets/_pipeline/briefs/<asset-id>.json` and complete it.
2. Add an index entry to `registry.json` with `id`, `briefPath`, and matching `status`.
3. Generate multiple candidates when art direction is not already mechanically determined. Prefer 3–4 materially different options in one generation round.
4. Record candidate references in the brief and move status to `candidate`.
5. User explicitly selects/approves one option. Record `selectedCandidateRef`, `approvedByUser: true`, and `approvalNote`; move to `approved`.
6. Put the selected binary in a semantic production asset folder, wire it into the actual runtime, record `productionPath`, and move to `integrated`.
7. Production changes are checked by the normal `Game CI` fast/runtime-smoke path. Deep visual tooling is run only when the change actually needs it.
8. After the exact integration SHA is green and the user approves the real runtime visual result, record `runtimeProofSha` + `runtimeProofRunId` and move to `locked`.

Generated concept art is never implementation proof. A file is not production-ready merely because it looks good outside the game.

## Sprite sheet creator

The repo uses `free-tex-packer-core@0.3.9` through the small wrapper in `assets/_pipeline/tools/sprite-sheet.mjs`.

Install the asset-tool dependency once:

```bash
cd assets/_pipeline/tools
npm install
```

Create a Pixi-compatible atlas from an ordered frame directory:

```bash
npm run sprites -- \
  --input ../candidates/kiem-khi/frames \
  --output ../../combat/vfx/kiem-khi \
  --name kiem-khi \
  --fps 12
```

Default behavior is deliberately conservative for VFX animation:

- Pixi JSON exporter;
- deterministic source-file ordering;
- no rotation;
- no transparent trimming unless `--trim` is explicitly requested;
- 2 px padding + 1 px extrusion to reduce texture bleeding;
- 2048×2048 max atlas;
- PNG output;
- `OptimalPacker` packing;
- sidecar `<name>.tutien.json` with source frame order, fps and loop metadata.

Useful optional flags:

```text
--format webp
--width 4096 --height 4096
--trim
--rotate
--pot
--once
```

Do not commit `node_modules/`; it is already ignored by the repository root `.gitignore`.

## CI enforcement

`qa/playtest/validate-contracts.mjs` rejects invalid lifecycle transitions, missing briefs, missing production files, duplicate production paths, and `locked` entries without exact runtime proof metadata.

`qa/playtest/summarize-report.mjs` is the strict runtime-health gate for production candidates: no horizontal overflow, missing runtime images, browser/runtime console errors, or non-cancelled network failures are allowed in the deterministic journeys.

## Registry shape

The registry is intentionally small. Each entry should be an index, not a duplicate copy of the brief:

```json
{
  "id": "combat-boss-portrait-01",
  "briefPath": "assets/_pipeline/briefs/combat-boss-portrait-01.json",
  "status": "candidate"
}
```

Do not store binary blobs, secrets, external API keys, or base64 payloads in pipeline metadata.
