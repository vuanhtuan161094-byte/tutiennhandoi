import { BATTLE_DAO_V2_MAIN_DAMAGE_TUNING_V108 } from './battle-dao-v2-runtime.js';
import { LIVE_EQUIPMENT_SET_CATALOG_V12310 } from './equipment-set-v116.js';

export const GLOBAL_BUILD_BALANCE_SCHEMA_V108 = 'global-build-balance.v108';
export const GLOBAL_BUILD_BALANCE_REVISION_V108 = 'alpha.23.58';
export const GLOBAL_BUILD_DAO_IDS_V108 = Object.freeze(['sword','fist','body','spell','poison','artifact','formation','mind']);
export const GLOBAL_BUILD_ROLE_V108 = Object.freeze({
  sword:'burst / kiếm ý', fist:'bruiser / liên quyền', body:'tank / phản kích', spell:'burst-control / pháp luân',
  poison:'DoT / độc chủng', artifact:'pháp khí / bạo phát', formation:'fortify-control / trận thế', mind:'control-burst / thần niệm',
});
export const GLOBAL_BUILD_BALANCE_POLICY_V108 = Object.freeze({
  potentialAxes:Object.freeze({power:'1 điểm = +1 Công Lực',body:'1 điểm = +1 Thể Phách',defense:'1 điểm = +3 Phòng Ngự'}),
  potentialGridStepPct:10,
  potentialGridBuilds:66,
  liveElementSets:5,
  liveSetMechanics:15,
  standardizedDuelSeedsPerPair:20,
  targetAggregateMatchPointPct:Object.freeze({min:35,max:65}),
  setBalancedSpreadTargetPct:10,
  noModeSpecificDaoTuning:true,
  sharedCombatEngine:'CombatKernel V2',
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
    sets:LIVE_EQUIPMENT_SET_CATALOG_V12310.map(set=>({id:set.id,name:set.name,element:(set.tags||[]).find(x=>['Metal','Wood','Water','Fire','Earth'].includes(x)),mechanics:set.mechanics.map(x=>({pieces:x.pieces,name:x.name,mechanic:x.mechanic}))})),
    conclusions:[
      'Tiềm Năng Phòng Ngự dùng hệ số +3 hiện hành; V108 không buff thêm vì đã xuất hiện trong build tối ưu/tank thật.',
      'Hệ số 8 Chủ Đạo chỉ áp một lần tại shared CombatKernel V2; không có hệ số riêng cho PvP/Boss.',
      '5 Set Ngũ Hành giữ trade-off theo vai trò; V108 không tạo một Set best-in-slot bắt buộc cho mọi Đạo.',
      'Linh Thú, Tri Kỷ và Pháp Bảo tiếp tục dùng trigger/runtime canonical đã closure ở V86/V87/V107.',
    ],
  };
}
