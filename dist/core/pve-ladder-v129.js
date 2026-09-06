import { REALM_MAP_FLOORS_PER_MAJOR_REALM } from '../content/realm-maps.js';
import { huntBossScalarPowerV128, huntEncountersToClearThroughFloorV128 } from './pve-depth-v128.js';
/**
 * V1.29 PvE ladder policy.
 *
 * Player overperformance is valid progression, not a balance failure. If a mature build clears an
 * existing ladder, content should expand rather than secretly scale enemies to the player's score
 * or nerf the build solely to preserve an arbitrary floor target.
 */
export const PVE_LADDER_POLICY_V129 = {
    version: 'pve-ladder.v129',
    fixedEnemyPower: true,
    noHiddenPlayerScaling: true,
    allowOverclear: true,
    overclearIsTelemetryNotFailure: true,
    preferContentExpansionOverPlayerNerf: true,
    // V77: one authoritative CombatKernel encounter per floor (the Boss). Virtual farm mobs are batch-only.
    encountersPerFloor: 1,
    floorsPerMajorRealm: REALM_MAP_FLOORS_PER_MAJOR_REALM,
};
/** Integrity-only gate: never fails because a player can clear "too deep". */
export function auditPveLadderIntegrityV129(fromFloor = 1, toFloor = REALM_MAP_FLOORS_PER_MAJOR_REALM) {
    const from = Math.max(1, Math.floor(fromFloor));
    const to = Math.max(from, Math.floor(toFloor));
    const failures = [];
    let previous = 0;
    let monotonicBossPower = true, finiteBossPower = true, positiveBossPower = true;
    for (let floor = from; floor <= to; floor++) {
        const power = huntBossScalarPowerV128(floor);
        if (!Number.isFinite(power)) {
            finiteBossPower = false;
            failures.push(`Boss power không hữu hạn tại tầng ${floor}.`);
            break;
        }
        if (power <= 0) {
            positiveBossPower = false;
            failures.push(`Boss power <=0 tại tầng ${floor}.`);
            break;
        }
        if (floor > from && power + 1e-9 < previous) {
            monotonicBossPower = false;
            failures.push(`Boss power tụt tại tầng ${floor}: ${power} < ${previous}.`);
            break;
        }
        previous = power;
    }
    const encounters1 = huntEncountersToClearThroughFloorV128(1);
    const encounters2 = huntEncountersToClearThroughFloorV128(2);
    const encountersPerFloor = encounters2 - encounters1;
    if (encountersPerFloor !== PVE_LADDER_POLICY_V129.encountersPerFloor)
        failures.push(`Encounter/tầng lệch ${encountersPerFloor}, cần ${PVE_LADDER_POLICY_V129.encountersPerFloor}.`);
    return { fromFloor: from, toFloor: to, monotonicBossPower, finiteBossPower, positiveBossPower, encountersPerFloor, failures };
}
//# sourceMappingURL=pve-ladder-v129.js.map