# MODULE — PRESENTATION / UI

Status: **ACTIVE**

## Purpose

Present authoritative game state clearly without becoming a gameplay authority.

## Platforms / surfaces

- Existing web/DOM/Pixi presentation remains a live reference/regression surface.
- Godot 4.7.2 is the production presentation/client target currently tracked by the project.
- Primary mobile reference viewport: 390×844; responsive behavior must not hard-code one canvas.

## Submodules

| Submodule | State |
|---|---|
| App shell/navigation | LIVE / audit when reopened |
| Home | LIVE / existing Godot production spec |
| Character | LIVE / existing presentation |
| Combat UI/UX | **ACTIVE C0** |
| Inventory | LIVE / audit when reopened |
| Other screens | MIXED / future redesign |

## Authority boundary

Presentation may:
- format;
- order;
- hide/show;
- animate;
- hold ephemeral UI state.

Presentation may not:
- calculate damage/outcomes;
- mutate Dao resources;
- invent Boss rewards;
- write gameplay state except through canonical actions.

## Current action

`docs/systems/combat-ui/MODULE.md`
