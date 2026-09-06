# QA Simulations

These executables are diagnostic/lab tools unless a corresponding file in `qa/tests/` owns the result as a release gate.

Generated files go to `docs/simulations/`.

Important: `v129-dao-secondary-simulation.js` is currently a diagnostic. It now applies the selected secondary Dao and secondary passives, but it does not model every max-progression collection/root/heart-method layer. Do not use it alone to tune production balance. Historical pre-cleanup artifacts are preserved under `docs/archive/simulations/`.
