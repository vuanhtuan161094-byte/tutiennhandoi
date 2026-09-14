# Asset Pipeline V1

This directory stores **metadata and approval state**, not production asset binaries.

Production assets stay in semantic folders such as `assets/huntv2/`, `assets/runtime/`, etc.

## Lifecycle

`draft -> candidate -> approved -> integrated -> locked`

Optional terminal state: `retired`.

- `draft`: brief exists; not ready for review.
- `candidate`: generated/edited options exist for review.
- `approved`: user explicitly selected/approved the visual.
- `integrated`: approved asset has been wired into the real runtime.
- `locked`: runtime result was approved/closed; replacement requires an explicit new slice.
- `retired`: intentionally no longer used.

## Required workflow

1. Create a brief conforming to `brief.schema.json`.
2. Generate multiple candidates when the direction is not already locked.
3. Record candidate references in `registry.json`.
4. User selects/approves.
5. Move the winner into the correct production asset folder.
6. Integrate it in code/CSS.
7. Run Browser Playtester + real runtime visual proof.
8. Only after approved closure may the registry state become `locked`.

Generated concept art must never be described as already implemented.

## Registry rule

`approved`, `integrated`, and `locked` entries require `approvedByUser: true`.

Do not put secrets, external API keys, or huge binary payloads in registry metadata.
