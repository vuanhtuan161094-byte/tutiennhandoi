/* DEV Test Harness V1 — dev-origin only fixture controls.
   Uses the existing isolated /api/dev/* runtime. Never calls production mutation endpoints. */
const SAVE_KEY='tutien.web.save.v1';
const BEFORE_FIXTURE_KEY='tutien.dev.before-fixture.v1';
let mounted=null;

function isDevTools(){
  try{const p=new URLSearchParams(location.search);return p.get('dev')==='1'&&(p.get('tools')==='1'||p.get('devtools')==='1');}catch{return false;}
}
async function request(path,{method='GET',body}={}){
  if(!String(path).startsWith('/api/dev/'))throw new Error('DEV Harness chỉ được gọi /api/dev/*.');
  const response=await fetch(path,{method,cache:'no-store',headers:body?{'content-type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined});
  const data=await response.json();
  if(!response.ok||data?.ok===false)throw new Error(data?.error||`HTTP ${response.status}`);
  return data;
}
const post=(path,body)=>request(path,{method:'POST',body});

function backupBeforeFixture(){
  if(sessionStorage.getItem(BEFORE_FIXTURE_KEY)!==null)return;
  const current=localStorage.getItem(SAVE_KEY);
  sessionStorage.setItem(BEFORE_FIXTURE_KEY,current??'');
}
async function syncCurrentIntoDevRuntime(){
  const raw=localStorage.getItem(SAVE_KEY);if(!raw)return;
  let save;try{save=JSON.parse(raw);}catch{return;}
  await post('/api/dev/action',{action:'devSandboxSyncSave',save});
}
async function persistDevRuntime(){
  const data=await request('/api/dev/save');
  if(!data?.save)throw new Error('DEV save không khả dụng.');
  localStorage.setItem(SAVE_KEY,JSON.stringify(data.save));
}
function reloadSoon(){setTimeout(()=>location.reload(),80);}

export async function mountDevTestHarnessV1(gui){
  if(!isDevTools()||!gui)return {ok:false,reason:'dev-tools-only'};
  if(mounted)return mounted;
  const state={realmOrder:117,dao:'sword',secondaryDao:'poison',forceBoss:true,maxProgress:true,statPreset:'balanced',status:'Sẵn sàng'};
  let busy=false;
  const run=async(label,fn)=>{
    if(busy)return;busy=true;state.status=`Đang chạy: ${label}`;
    try{backupBeforeFixture();await fn();state.status=`OK: ${label}`;reloadSoon();}
    catch(error){state.status=`Lỗi: ${error?.message||error}`;console.error('[DEV harness]',error);busy=false;}
  };
  const applyAction=async(action,body={})=>{await syncCurrentIntoDevRuntime();await post('/api/dev/action',{action,...body});await persistDevRuntime();};
  const actions={
    allSystems:()=>run('Toàn hệ thống',()=>applyAction('devSkillLabV12317',{realmOrder:117,mainDao:state.dao,secondaryDao:state.secondaryDao,forceBoss:true,maxProgress:true,statPreset:state.statPreset})),
    bossCombat:()=>run('Boss Combat',()=>applyAction('devSandboxPreset',{realmOrder:state.realmOrder,dao:state.dao,forceBoss:true})),
    customLab:()=>run('Preset tùy chỉnh',()=>applyAction('devSkillLabV12317',{realmOrder:state.realmOrder,mainDao:state.dao,secondaryDao:state.secondaryDao,forceBoss:state.forceBoss,maxProgress:state.maxProgress,statPreset:state.statPreset})),
    foundation:()=>run('Trúc Cơ baseline',()=>applyAction('devSandboxPreset',{realmOrder:10,dao:state.dao,forceBoss:false})),
    resetDev:()=>run('Reset DEV',async()=>{await post('/api/dev/new',{seed:Date.now()>>>0});await persistDevRuntime();}),
    restoreBeforeFixture(){const raw=sessionStorage.getItem(BEFORE_FIXTURE_KEY);if(raw===null){state.status='Không có snapshot để hoàn tác';return;}if(raw)localStorage.setItem(SAVE_KEY,raw);else localStorage.removeItem(SAVE_KEY);sessionStorage.removeItem(BEFORE_FIXTURE_KEY);state.status='Đã hoàn tác fixture';reloadSoon();},
    async inspect(){try{const data=await request('/api/dev/state');state.status='Đã log DEV state';console.info('[DEV harness state]',data);}catch(error){state.status=`Lỗi: ${error?.message||error}`;}}
  };

  const folder=gui.addFolder('Test Harness · DEV');
  folder.add(state,'realmOrder',10,117,1).name('Cảnh giới order');
  folder.add(state,'dao',{Kiếm:'sword',Quyền:'fist',Thể:'body',Pháp:'spell',Độc:'poison','Ngự Khí':'artifact',Trận:'formation','Thần Niệm':'mind'}).name('Chính Đạo');
  folder.add(state,'secondaryDao',{Không:'',Kiếm:'sword',Quyền:'fist',Thể:'body',Pháp:'spell',Độc:'poison','Ngự Khí':'artifact',Trận:'formation','Thần Niệm':'mind'}).name('Phụ Đạo');
  folder.add(state,'forceBoss').name('Ép ngữ cảnh Boss');
  folder.add(state,'maxProgress').name('Max tiến độ');
  folder.add(state,'statPreset',{Cân_bằng:'balanced',Công:'power',Thể:'body',Thủ:'defense'}).name('Build stat');
  folder.add(actions,'allSystems').name('⚡ Toàn hệ thống MAX');
  folder.add(actions,'bossCombat').name('⚔ Boss Combat');
  folder.add(actions,'customLab').name('🧪 Nạp preset tùy chỉnh');
  folder.add(actions,'foundation').name('🌱 Trúc Cơ baseline');
  folder.add(actions,'resetDev').name('↺ Reset sandbox');
  folder.add(actions,'restoreBeforeFixture').name('↶ Hoàn tác fixture');
  folder.add(actions,'inspect').name('⌕ Log DEV state');
  const status=folder.add(state,'status').name('Trạng thái').listen();status.disable?.();
  folder.open();
  mounted={ok:true,state,actions,folder,destroy(){try{folder.destroy?.();}catch{}mounted=null;}};
  globalThis.__TUTIEN_DEV_TEST_HARNESS_V1__=mounted;
  return mounted;
}

export function destroyDevTestHarnessV1(){try{mounted?.destroy?.();}catch{}mounted=null;delete globalThis.__TUTIEN_DEV_TEST_HARNESS_V1__;}
