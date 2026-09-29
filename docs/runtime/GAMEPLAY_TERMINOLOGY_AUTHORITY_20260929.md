# Gameplay Terminology Authority — 2026-09-29

Status: ACTIVE / LOCKED TERMINOLOGY CONTRACT

This document exists to prevent old compatibility code from being mistaken for current player-facing gameplay authority.

## 1. Linh Căn

**Live gameplay authority: `dist/core/spiritual-root-v145.js` only.**

The current Linh Căn system is the V145 infinite progression system: Linh Căn level, Linh Tủy, Tiến Cấp, Căn Mạch, Căn Ngộ and Bản Nguyên/Cực Căn progression.

The following older modules are **LEGACY / FROZEN COMPATIBILITY ONLY** and must not be presented, documented, balanced or extended as the current Linh Căn system:

- `dist/core/spiritual-root-progression-v131.js`
- `dist/core/root-origin-combat-v132.js`
- `dist/core/spiritual-root-milestones-v133.js`

Legacy root IDs, elemental affinity fields, `rootLevelsV133`, `activeRootOriginIdsV132` and similar fields may remain only where required by old-save migration or frozen combat compatibility. Their presence in source does not make them live Linh Căn gameplay.

Do not physically delete a legacy module until all callers and save/frozen-combat dependencies have been proven absent.

## 2. Mệnh Lộ

**Mệnh Lộ** is the player progression system containing exactly five persistent reincarnation paths:

1. `fate.cultivator` — **Tu Mệnh**
2. `fate.warrior` — **Chiến Mệnh**
3. `fate.body` — **Thể Mệnh**
4. `fate.wealth` — **Tài Mệnh**
5. `fate.idle` — **Nhàn Mệnh**

These five paths are live gameplay and must be retained.

Internal historical identifiers such as `FATE_BUILD_*`, `fateBuildV4`, save keys and API/function names remain unchanged for backward compatibility. New player-facing copy and new documentation must call the umbrella system **Mệnh Lộ**, not “Mệnh Cách V4”.

## 3. Mệnh Thai

**Mệnh Thai** is the next-life candidate/container used during the reincarnation flow. It is not Mệnh Lộ.

The current reincarnation presentation separates long-term progression from random next-life traits.

Long-term progression includes Linh Căn V145, Huyết Mạch and Thể Chất where their canonical systems define persistence.

## 4. Mệnh Cách

**Mệnh Cách** is a randomized next-life birth trait inside Mệnh Thai, alongside Thiên Tư and Xuất Thân.

Mệnh Cách must not be used as the umbrella name for the five Mệnh Lộ paths.

## 5. Naming lock

From this contract forward:

- `Linh Căn` means the V145 system unless a source line is explicitly marked legacy/frozen compatibility.
- `Mệnh Lộ` means the five persistent paths Tu/Chiến/Thể/Tài/Nhàn Mệnh.
- `Mệnh Thai` means the next-life candidate/container.
- `Mệnh Cách` means the randomized birth trait of a life.

Any new UI, design document, test description or gameplay copy that mixes these four concepts is a terminology regression.

## 6. Known reincarnation integrity requirement

The current UI declares Linh Căn V145 to be persistent across reincarnation. Runtime reincarnation must therefore preserve the canonical `character.spiritualRootV145` state rather than recreating V145 progression from legacy root IDs. Legacy root IDs may remain only as compatibility inputs for older character/build-foundation code.
