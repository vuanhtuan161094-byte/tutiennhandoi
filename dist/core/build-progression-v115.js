import { mortalMajorStageV113 } from './progression-closure-v113.js';
import { immortalMajorStageV114 } from './immortal-progression-v114.js';

const AXIS_LABEL={offense:'Sát thương',survival:'Sinh tồn',resource:'Tài nguyên / Chân Nguyên',tempo:'Nhịp chiến đấu',control:'Tài nguyên / Chân Nguyên',mobility:'Nhịp chiến đấu'};
export function buildProgressionSummaryV115({state,buildOverview,integration,greatVehicle}){
  const order=Number(state?.realm?.maxRealmOrder||0);
  const stage=mortalMajorStageV113(order)||immortalMajorStageV114(order);
  const systems=[];
  const bottleneck=buildOverview?.bottleneckAxis;
  if(bottleneck)systems.push({id:'combat-axis',name:`Bù ${AXIS_LABEL[bottleneck]||bottleneck}`,route:'build',reason:'Build Overview canonical xác định đây là trục yếu nhất; không cộng stat mù theo lực chiến.'});
  if(order>=26)systems.push({id:'dao',name:'Chủ Đạo / Đạo Vực',route:'dao',reason:'Giữ bản sắc rotation và modifier của Chủ Đạo; Phụ Đạo chỉ bổ sung passive theo luật canonical.'});
  if(order>=34&&Number(integration?.harmony||0)<75)systems.push({id:'integration',name:'Cân thân–hồn–đạo–pháp bảo',route:'character',reason:`Harmony ${Number(integration?.harmony||0).toFixed(1)}/75; nút thắt ${integration?.bottleneck||'chưa xác định'}.`});
  if(order>=38&&Number(greatVehicle?.domainScale||0)<65)systems.push({id:'domain',name:'Mở rộng Đạo Vực',route:'dao',reason:`Quy mô ${Number(greatVehicle?.domainScale||0).toFixed(1)}/65; ưu tiên mechanic Đạo thay vì chỉ tăng Công.`});
  if(order>=62)systems.push({id:'manifestations',name:'Manifestation theo build',route:'character',reason:'Huyền Tiên+ dùng manifestation để chọn lớp sức mạnh đang mang vào combat; không cần bật mọi hệ.'});
  return {schema:'build-progression.v115',active:order>=26,stage:stage?{id:stage.id,name:stage.name}:undefined,bottleneckAxis:bottleneck,bottleneckLabel:AXIS_LABEL[bottleneck]||bottleneck,priorities:systems.slice(0,4),policy:['Không có một stat thắng mọi content.','Không sửa PvE chỉ để cân PvP.','Mỗi hệ giữ quyền sở hữu mechanic/stat riêng; Build Overview dùng CombatEntity canonical.']};
}
