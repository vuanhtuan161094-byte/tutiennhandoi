export const HUNT_PRODUCTION_V110_VERSION='1.0.0';

function uniqueRows(rows=[]){
  const seen=new Set();
  return rows.filter(row=>row&&row.available&&row.floor>0&&!seen.has(row.floor)&&(seen.add(row.floor),true));
}
function lane(rows,metric,label,description){
  const sorted=[...rows].sort((a,b)=>(Number(b?.[metric])||0)-(Number(a?.[metric])||0)||(Number(b.floor)||0)-(Number(a.floor)||0));
  const best=sorted[0];
  return best?{id:metric,label,description,floor:best.floor,zoneName:best.zoneName,floorName:best.floorName,value:Number(best[metric])||0}:undefined;
}
function powerBand(deltaLog10){
  if(deltaLog10>=.16)return {id:'advantage',label:'Trên cơ',tone:'good',description:'Telemetry sức mạnh đang nghiêng về bạn; vẫn phải xử lý mechanic Boss.'};
  if(deltaLog10>=.02)return {id:'close',label:'Cân sức',tone:'neutral',description:'Sức mạnh gần nhau; counter mechanic và nhịp build sẽ quyết định nhiều.'};
  if(deltaLog10>=-.12)return {id:'challenge',label:'Khiêu chiến',tone:'warn',description:'Boss nhỉnh hơn; nên bù counter hoặc tăng build trước khi kỳ vọng thắng ổn định.'};
  return {id:'wall',label:'Tường lực chiến',tone:'danger',description:'Khoảng cách sức mạnh đang lớn; đây là progression wall hợp lệ.'};
}
function counterRows(mechanic){
  if(!mechanic)return [];
  const active=new Set(mechanic.activeRoles||[]);
  return (mechanic.counterGroups||[]).map(group=>({
    label:group.label,
    roles:[...(group.roles||[])],
    covered:(group.roles||[]).some(role=>active.has(role)),
  }));
}
export function buildHuntProductionV110({bossReady=true,canFight=true,injury=0,currentFloor=1,highestClearedFloor=0,playerPowerLog10=0,enemyPowerLog10=0,bossMechanic,map,farm,currentFarmCandidates=[]}={}){
  const delta=Number(playerPowerLog10||0)-Number(enemyPowerLog10||0);
  const counters=counterRows(bossMechanic);
  const covered=counters.filter(x=>x.covered).length;
  const missing=counters.filter(x=>!x.covered);
  const coverage=counters.length?Math.round(covered/counters.length*100):100;
  let readiness=powerBand(delta);
  if(!canFight)readiness={id:'blocked',label:'Bị chặn',tone:'danger',description:`Thương Thế ${Math.round(Number(injury)||0)}/100 đang quá cao để khiêu chiến.`};
  else if(!bossReady)readiness={id:'cleared',label:'Đã vượt',tone:'good',description:'Boss tầng đã hạ; tầng này có thể dùng làm bãi Săn Ảo.'};
  else if(coverage===0&&counters.length)readiness={...readiness,description:`${readiness.description} Build hiện chưa có counter trực tiếp cho mechanic Boss.`};
  const rows=uniqueRows(currentFarmCandidates);
  const recommendations=[
    lane(rows,'killsPerHour','Nhanh','Ưu tiên số yêu thú/giờ; hợp săn milestone và throughput tổng.'),
    lane(rows,'spiritStonesPerHour','Linh Thạch','Ưu tiên Linh Thạch/giờ.'),
    lane(rows,'equipmentRollsPerHour','Trang bị','Ưu tiên số lượt trang bị/giờ.'),
  ].filter(Boolean);
  const zoneFloor=Number(map?.zoneFloor||1);
  const nextElementMilestone=Math.min(100,Math.ceil(zoneFloor/20)*20+(zoneFloor%20===0?20:0));
  const milestone=zoneFloor>=100
    ?{kind:'zone',label:'Kết vực',floor:100,description:'Vượt Boss tầng 100 để hoàn tất vực và mở vực kế tiếp.'}
    :{kind:'element',label:'Đổi chủ hệ',floor:Math.min(100,nextElementMilestone),description:`Mỗi 20 tầng đổi chủ hệ; chuẩn bị counter cho mốc T${Math.min(100,nextElementMilestone)}.`};
  const reasonToClimb=bossReady
    ?`Hạ Boss T${zoneFloor} để mở tầng kế và biến T${zoneFloor} thành bãi Săn Ảo. Tầng sâu tăng giá trị mỗi kill nhưng cũng tăng HP quái; throughput thực được tính theo DPS build.`
    :`T${zoneFloor} đã là bãi Săn Ảo. Chọn Boss chưa vượt để tiếp tục đẩy tiến độ, hoặc giữ tầng farm hiệu quả hơn cho build hiện tại.`;
  return {
    schema:'hunt-production.v110',version:HUNT_PRODUCTION_V110_VERSION,
    boss:{
      floor:currentFloor,zoneFloor,ready:Boolean(bossReady),readiness,powerDeltaLog10:Number(delta.toFixed(4)),
      mechanic:bossMechanic?{id:bossMechanic.id,name:bossMechanic.name,description:bossMechanic.description,counterHint:bossMechanic.counterHint,coveragePct:coverage,counters,missing:missing.map(x=>x.label)}:undefined,
      reasonToClimb,milestone,
    },
    farm:{
      available:Boolean(farm?.available),currentFloor:Number(farm?.floor||0),highestClearedFloor:Number(highestClearedFloor||0),
      rule:'Boss thật để mở tầng; Săn Ảo theo thời gian để farm. Tu Luyện vẫn chạy 100% song song.',
      recommendations,
      candidates:rows.map(row=>({floor:row.floor,zoneName:row.zoneName,floorName:row.floorName,killsPerHour:row.killsPerHour,spiritStonesPerHour:row.spiritStonesPerHour,demonCoresPerHour:row.demonCoresPerHour,equipmentRollsPerHour:row.equipmentRollsPerHour,current:Number(row.floor)===Number(farm?.floor)})),
    },
  };
}
