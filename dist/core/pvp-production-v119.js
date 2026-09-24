export function pvpProductionSummaryV119(pvp){
 if(!pvp)return{schema:'pvp-production.v119',active:false,engine:'CombatKernel V3',historicalReplayEngine:'CombatKernel V2'};
 const paidCap=Number(pvp?.rewards?.dailyWinCap??pvp?.daily?.paidWinCap??5);const perWin=Number(pvp?.rewards?.boundJadePerWin??pvp?.daily?.rewardPerWin??8);
 return{schema:'pvp-production.v119',active:true,engine:'CombatKernel V3',historicalReplayEngine:'CombatKernel V2',rules:{unlimitedMatches:true,paidWinsPerDay:paidCap||5,boundJadePerPaidWin:perWin||8,noTrueDeath:true,noInjury:true,noLifespanLoss:true},policy:'Trận PvP mới dùng CombatKernel V3; replay lịch sử combat.v2 tiếp tục dùng CombatKernel V2 để giữ tương thích deterministic.'};
}
