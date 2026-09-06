export function pvpProductionSummaryV119(pvp){
 if(!pvp)return{schema:'pvp-production.v119',active:false,engine:'CombatKernel V2'};
 const paidCap=Number(pvp?.rewards?.dailyWinCap??pvp?.daily?.paidWinCap??5);const perWin=Number(pvp?.rewards?.boundJadePerWin??pvp?.daily?.rewardPerWin??8);
 return{schema:'pvp-production.v119',active:true,engine:'CombatKernel V2',rules:{unlimitedMatches:true,paidWinsPerDay:paidCap||5,boundJadePerPaidWin:perWin||8,noTrueDeath:true,noInjury:true,noLifespanLoss:true},policy:'PvP giữ resolver CombatKernel V2; V119 không đổi PvE formula để ép meta PvP.'};
}
