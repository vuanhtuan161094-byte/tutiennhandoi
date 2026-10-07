# Curated Godot VFX Library subset

Upstream: https://github.com/haowg/GODOT-VFX-LIBRARY

License: MIT. The upstream LICENSE is preserved in this directory.

This project vendors only self-contained, texture-free 2D particle scenes that
are useful for the Ngự Khí combat presentation and work without enabling the
upstream plugin/autoloads:

- summon_circle.tscn
- portal_vortex.tscn
- energy_burst.tscn
- combo_ring.tscn
- shield_break.tscn
- lightning_chain.tscn

The original scenes are kept structurally intact. Tu Tiên Nhàn Dỗi composes
and recolors them at runtime; canonical combat authority remains in JS.
