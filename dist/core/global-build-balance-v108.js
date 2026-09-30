import { BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V108 } from './battle-dao-v2-runtime.js';
import { LIVE_EQUIPMENT_SET_CATALOG_V12310 } from './equipment-set-v116.js';

export const GLOBAL_BUILD_BALANCE_SCHEMA_V108 = 'global-build-balance.v108';
export const GLOBAL_BUILD_BALANCE_REVISION_V108 = 'alpha.23.76';
export const GLOBAL_BUILD_DAO_IDS_V108 = Object.freeze(['sword','fist','body','spell','poison','artifact','formation','mind']);
export const GLOBAL_BUILD_ROLE_V108 = Object.freeze({
  sword:'burst / kiếm ý', fist:'bruiser / quyền thế', body:'tank / phản kích', spell:'burst-control / pháp luân',
  poison:'DoT / độc chủng', artifact:'pháp khí / bạo phát', formation:'fortify-control / trận thế', mind:'control-burst / thần niệm',
});
export const GLOBAL_BUILD_BALANCE_POLICY_V108 = Object.freeze({
  potentialAxisVersion:5,
  potentialAxes:Object.freeze({
    power:'1 điểm = +1 Công Lực',
    body:'1 điểm = +1 Thể Phách, +20 Sinh Mệnh chuẩn, +1 Phòng Ngự',
    agility:'1 điểm = +1 Thân Pháp / Mobility',
    spirit:'1 điểm = +1 Linh Lực / Chân Nguyên tối đa',
    sense:'1 điểm = +1 Thần Thức / Accuracy / Control / Resolve',
  }),
  potentialGridStepPct:10,
  potentialGridBuilds:1001,
  liveElementSets:0,
  liveSetMechanics:0,
  standardizedDuelSeedsPerPair:20,
  targetAggregateMatchPointPct:Object.freeze({min:35,max:65}),
  setBalancedSpreadTargetPct:0,
  noModeSpecificDaoTuning:true,
  sharedCombatEngine:'CombatKernel V3',
});
export const GLOBAL_BUILD_BALANCE_FINAL_TUNING_V108 = BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V108;

export function globalBuildBalanceSummaryV108(){
  return {
    schema:GLOBAL_BUILD_BALANCE_SCHEMA_V108,
    revision:GLOBAL_BUILD_BALANCE_REVISION_V108,
    engine:GLOBAL_BUILD_BALANCE_POLICY_V108.sharedCombatEngine,
    policy:{...GLOBAL_BUILD_BALANCE_POLICY_V108,potentialAxes:{...GLOBAL_BUILD_BALANCE_POLICY_V108.potentialAxes},targetAggregateMatchPointPct:{...GLOBAL_BUILD_BALANCE_POLICY_V108.targetAggregateMatchPointPct}},
    daoTuning:{...GLOBAL_BUILD_BALANCE_FINAL_TUNING_V108},
    daoRoles:GLOBAL_BUILD_DAO_IDS_V108.map(id=>({id,role:GLOBAL_BUILD_ROLE_V108[id]})),
    sets:LIVE_EQUIPMENT_SET_CATALOG_V12310.map(set=>({id:set.id,name:set.name,mechanics:(set.mechanics??[]).map(x=>({pieces:x.pieces,name:x.name,mechanic:x.mechanic}))})),
    conclusions:[
      'Tiềm Năng live dùng 5 trục Công Lực / Thể Phách / Thân Pháp / Linh Lực / Thần Thức; Defense không còn là trục phân bổ.',
      'Hệ số 8 Chủ Đạo chỉ áp một lần trong shared CombatKernel V3; không có bảng hệ số riêng cho PvP/Boss.',
      'Ngũ Hành Equipment Set đã retire khỏi live power; id lịch sử chỉ còn phục vụ save/migration compatibility.',
      'Linh Thú, Tri Kỷ và Pháp Bảo tiếp tục dùng trigger/runtime canonical của Collection/Combat hiện hành.',
    ],
  };
}
