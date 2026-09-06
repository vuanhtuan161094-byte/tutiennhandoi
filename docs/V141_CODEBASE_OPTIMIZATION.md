# V141 CODEBASE OPTIMIZATION

Branch: `refactor/v141-codebase-optimization`

Goals:
- keep V140 gameplay behavior green while reducing repository/code debt;
- remove dead runtime versions and stale compatibility-only code;
- reduce monolithic hotspots (`session.js`, `app.js`, `gameplay.js`, `combat.js`, CSS bundles);
- add repeatable dependency/health tooling so later system audits are faster;
- merge to `main` only after canonical backend/frontend closure passes.

First pass already removes runtime files proven unused by canonical QA and adds CI + codebase/system-surface scanners.
