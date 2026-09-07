import { equipmentRankIndexFromRealmOrderV142 } from './equipment-v142.js';
import { grantEquipmentFragmentRankV142 } from './equipment-fragments-v142.js';
import {
  grantEquipmentSetFragmentV142,
  targetSetForDungeonFloorV142,
  equipmentSetFragmentDungeonRoleV142,
} from './equipment-set-fragments-v142.js';

/**
 * Dungeon equipment events no longer materialize finished gear in V142.
 * General equipment events become rank-targeted fragments.
 * Dedicated Set dungeons additionally grant Tàn Ấn for their V142 Set identity.
 */
export function dungeonEquipmentRankV142(requiredRealmOrder) {
  return equipmentRankIndexFromRealmOrderV142(requiredRealmOrder);
}

export function dungeonEquipmentFragmentAmountsV142({ firstClear = false, targetedSet = false } = {}) {
  return {
    genericPerEvent: firstClear ? 10 : 3,
    setPerEvent: targetedSet ? (firstClear ? 15 : 5) : 0,
  };
}

export function settleDungeonEquipmentEventsV142(state, input) {
  const dungeonId = String(input.dungeonId ?? 'unknown');
  const floor = Math.max(1, Math.floor(Number(input.floor) || 1));
  const requiredRealmOrder = Math.max(0, Math.floor(Number(input.requiredRealmOrder) || 0));
  const events = Math.max(0, Math.floor(Number(input.equipmentEvents) || 0));
  const firstClear = Boolean(input.firstClear);
  const rankIndex = dungeonEquipmentRankV142(requiredRealmOrder);
  const targetSet = targetSetForDungeonFloorV142(dungeonId, floor);
  const amounts = dungeonEquipmentFragmentAmountsV142({ firstClear, targetedSet: Boolean(targetSet) });
  if (events <= 0) {
    return { dungeonId, floor, rankIndex, equipmentEvents: 0, genericFragments: 0, setFragments: 0, drops: [], targetSetId: targetSet?.id ?? '', role: equipmentSetFragmentDungeonRoleV142(dungeonId) };
  }

  const drops = [];
  const genericAmount = events * amounts.genericPerEvent;
  if (genericAmount > 0) {
    const grant = grantEquipmentFragmentRankV142(state, rankIndex, genericAmount, input.source ?? `dungeon:${dungeonId}:${floor}`);
    drops.push({ kind: 'equipmentFragmentV142', ...grant });
  }
  let setAmount = 0;
  if (targetSet) {
    setAmount = events * amounts.setPerEvent;
    if (setAmount > 0) drops.push(grantEquipmentSetFragmentV142(state, targetSet.id, setAmount, input.source ?? `dungeon:${dungeonId}:${floor}`));
  }
  return {
    dungeonId,
    floor,
    rankIndex,
    equipmentEvents: events,
    genericFragments: genericAmount,
    setFragments: setAmount,
    targetSetId: targetSet?.id ?? '',
    targetSetName: targetSet?.name ?? '',
    role: equipmentSetFragmentDungeonRoleV142(dungeonId),
    drops,
  };
}

export function dungeonEquipmentFragmentSummaryV142(settlement) {
  const lines = [];
  if ((settlement?.genericFragments ?? 0) > 0) lines.push(`Mảnh Trang Bị bậc ${settlement.rankIndex} +${settlement.genericFragments}`);
  if ((settlement?.setFragments ?? 0) > 0) lines.push(`Tàn Ấn ${settlement.targetSetName} +${settlement.setFragments}`);
  return lines;
}
