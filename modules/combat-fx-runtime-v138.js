export const COMBAT_FX_RUNTIME_VERSION='1.38.0-alpha.17.0';

export const FX_DAO_THEMES={
  sword:{label:'Kiếm',main:'#79d7ff',hot:'#f7fbff',soft:'#2f7dff',motif:'slash'},
  fist:{label:'Quyền',main:'#ffb95f',hot:'#fff2c7',soft:'#e05d2f',motif:'shockwave'},
  body:{label:'Thể',main:'#f2d27a',hot:'#fff8d8',soft:'#8b7440',motif:'aura'},
  spell:{label:'Pháp',main:'#78cfff',hot:'#e8fbff',soft:'#6b5cff',motif:'sigil'},
  poison:{label:'Độc',main:'#77e47b',hot:'#d9ff9f',soft:'#7e3bc9',motif:'mist'},
  artifact:{label:'Ngự Khí',main:'#8fdcff',hot:'#fff4c2',soft:'#b27cff',motif:'orbit'},
  formation:{label:'Trận',main:'#e8c66d',hot:'#fff5c8',soft:'#67a6ff',motif:'field'},
  mind:{label:'Thần Niệm',main:'#d18cff',hot:'#fff1ff',soft:'#7357ff',motif:'pulse'},
};

export const FX_PRIMITIVES=['cast','travel','impact','field','ultimate'];
const AUTHORED_ASSETS={
  spell:Object.fromEntries(FX_PRIMITIVES.map(type=>[type,`/assets/huntv2/fx/spell-${type}.png`])),
  poison:Object.fromEntries(FX_PRIMITIVES.map(type=>[type,`/assets/huntv2/fx/poison-${type}.png`])),
};

const VISUAL_IDENTITY={
  sword:{basic:['slash','dash',1],flow_slash:['dash-slash','dash',1],nurture:['charge','charge',1],break_mark:['sigil-slash','cast',1],chain:['combo-slash','dash',3],counter:['counter-slash','counter',1],sever:['heavy-slash','charge',1],finisher:['finisher-slash','dash',1],myriad:['sword-rain','channel',5],ultimate:['ultimate-slash','ultimate',1]},
  fist:{basic:['punch','dash',1],triple:['combo-punch','dash',3],shock:['shockwave','dash',1],nurture:['charge','charge',1],heavy:['heavy-punch','charge',1],counter:['counter-punch','counter',1],chain_heavy:['combo-punch','dash',3],pressure:['pressure-wave','charge',1],finisher:['finisher-punch','dash',1],ultimate:['ultimate-punch','ultimate',1]},
  body:{basic:['body-strike','dash',1],guard:['shield-aura','brace',1],transform:['counter-wave','counter',1],immovable:['fortress','channel',1],counter:['counter-wave','counter',1],elephant:['heavy-body','charge',1],break:['break-body','charge',1],recover:['heal-aura','brace',1],finisher:['finisher-body','dash',1],ultimate:['ultimate-aura','ultimate',1]},
  spell:{basic:['bolt','cast',1],light:['beam','cast',1],channel:['orb-volley','channel',4],restore:['channel-aura','channel',1],shield:['shield-sigil','brace',1],seal:['sigil','cast',1],burst:['burst','charge',1],break:['break-sigil','charge',1],transform:['converge','cast',3],ultimate:['ultimate-field','ultimate',5]},
  poison:{basic:['needle','cast',1],bone:['splash','cast',2],heart:['poison-sigil','cast',1],insects:['swarm','channel',5],mist:['mist-field','summon',3],transform:['consume','cast',2],guard:['poison-shield','brace',1],consume:['consume-burst','charge',1],calamity:['poison-rain','channel',4],ultimate:['ultimate-mist','ultimate',5]},
  artifact:{basic:['artifact-bolt','cast',1],deploy:['summon','summon',3],guard:['mirror-shield','brace',1],strike:['artifact-dash','dash',1],sync:['orbit','summon',3],recall:['return','summon',3],split:['split-summon','summon',3],merge:['converge','charge',3],suppress:['artifact-rain','channel',5],ultimate:['ultimate-summon','ultimate',5]},
  formation:{basic:['rune','cast',1],deploy:['formation-deploy','summon',1],nourish:['formation-channel','channel',1],fortify:['formation-shield','brace',1],small_activate:['formation-pulse','cast',1],full_activate:['formation-burst','charge',1],seal:['formation-seal','cast',1],convert:['formation-shift','cast',2],break:['formation-break','cast',1],ultimate:['ultimate-formation','ultimate',5]},
  mind:{basic:['needle','cast',1],mark:['mind-mark','cast',1],split:['mind-split','cast',3],interfere:['mind-interfere','cast',1],guard:['mind-shield','brace',1],chase:['mind-chase','cast',1],burst:['consume-burst','charge',1],observe:['mind-channel','channel',4],flow:['mind-field','summon',3],ultimate:['ultimate-mind','ultimate',5]},
};

function textOf(skill={}){
  return [skill.id,skill.name,skill.description,skill.delivery,skill?.runtimeV117?.form,...(skill?.runtimeV117?.domains||[]),...(skill.tags||[])].filter(Boolean).join(' ').toLowerCase();
}
function suffixOf(skill={}){return String(skill?.id||'').split('.').at(-1)||'';}

export function daoFromSkill(skill={},fallback=''){
  const id=String(skill?.id||'');
  const m=id.match(/^skill\.dao\.(sword|fist|body|spell|poison|artifact|formation|mind)\./);
  if(m)return m[1];
  const raw=textOf(skill);
  if(/kiếm|sword/.test(raw))return 'sword';
  if(/quyền|fist/.test(raw))return 'fist';
  if(/thể đạo|body|kim cang|thiết cốt/.test(raw))return 'body';
  if(/độc|poison/.test(raw))return 'poison';
  if(/ngự khí|pháp bảo|artifact/.test(raw))return 'artifact';
  if(/trận|formation/.test(raw))return 'formation';
  if(/thần niệm|mind|niệm/.test(raw))return 'mind';
  if(/pháp|spell/.test(raw))return 'spell';
  return FX_DAO_THEMES[fallback]?fallback:'spell';
}

function fallbackPattern(skill={},dao='spell'){
  const raw=textOf(skill);
  if(/counter|phản/.test(raw))return 'counter-wave';
  if(/channel|dẫn|triều|vạn/.test(raw))return 'channel';
  if(/deploy|triệu|gọi|bố trận/.test(raw))return 'summon';
  if(/shield|guard|hộ|khiên/.test(raw))return 'shield-aura';
  if(/trảm|slash|kiếm|blade/.test(raw))return 'slash';
  if(/liên|multi|rain|vũ/.test(raw))return 'volley';
  if(/orbit|hồi nguyên|quy khí|artifact|pháp bảo|ngự khí/.test(raw))return 'orbit';
  if(/trận|formation|seal|ấn|kính|sigil/.test(raw))return 'sigil';
  if(/độc|poison|vụ|mist|hủ cốt/.test(raw))return 'mist';
  if(/burst|bạo|phá|break|finisher|trấn/.test(raw))return 'burst';
  return FX_DAO_THEMES[dao]?.motif||'pulse';
}

export function skillVisualIdentity(skill={},fallbackDao=''){
  const dao=daoFromSkill(skill,fallbackDao); const suffix=suffixOf(skill); const row=VISUAL_IDENTITY[dao]?.[suffix];
  const raw=textOf(skill); const ultimate=skill?.slot==='ultimate'||skill?.slotClass==='ultimate'||skill?.runtimeV117?.slotClass==='ultimate'||/ultimate|tuyệt kỹ/.test(raw);
  const pattern=row?.[0]||fallbackPattern(skill,dao); const motion=row?.[1]||(ultimate?'ultimate':/channel/.test(raw)?'channel':/counter/.test(raw)?'counter':/shield|guard|hộ/.test(raw)?'brace':'cast');
  const shots=Math.max(1,Math.min(5,Number(row?.[2])||1));
  const weight=ultimate?'ultimate':/heavy|burst|break|finisher|phá|trấn|bạo|đoạn/.test(raw)?'heavy':/shield|guard|hộ|heal|hồi|restore/.test(raw)?'support':'normal';
  const hitStopMs=weight==='ultimate'?82:weight==='heavy'?58:weight==='normal'?34:26;
  const camera=weight==='ultimate'?'heavy':weight==='heavy'?'medium':weight==='normal'?'light':'none';
  return {dao,suffix,pattern,motion,shots,weight,ultimate,hitStopMs,camera};
}

export function fxRecipeForSkill(skill={},fallbackDao=''){
  const identity=skillVisualIdentity(skill,fallbackDao); const {dao,ultimate,pattern}=identity; const raw=textOf(skill);
  const support=identity.weight==='support';
  const field=/field|formation|trận|mist|vụ|domain|vực|deploy|bố trận|sword-rain|rain|ultimate-field|ultimate-formation|ultimate-mist/.test(pattern+' '+raw);
  const heavy=identity.weight==='heavy'||identity.weight==='ultimate';
  const melee=/slash|punch|body|dash|counter/.test(pattern)||/melee|cận chiến/.test(raw);
  const cast=ultimate?'ultimate':support||field?'field':'cast';
  const travel=ultimate?'ultimate':field&&identity.motion!=='dash'?'field':'travel';
  const impact=ultimate?'ultimate':'impact';
  return {...identity,cast,travel,impact,support,field,heavy,melee};
}

function layerOf(root){return root?.querySelector?.('#huntv2VfxLayer')||null;}
function copyCountFor(type,pattern,shots){
  if(type==='field'||type==='ultimate')return Math.min(5,Math.max(1,shots));
  if(/volley|rain|swarm|summon|split|orbit|converge|combo|mind-split/.test(pattern))return Math.min(5,Math.max(2,shots));
  return 1;
}

export function playFxPrimitive(root,{dao='spell',type='cast',side='player',ultimate=false,lifeMs=0,pattern='',motifIcon='',shots=1}={}){
  const layer=layerOf(root);if(!layer)return false;
  const safeDao=FX_DAO_THEMES[dao]?dao:'spell'; const safeType=FX_PRIMITIVES.includes(type)?type:'cast';
  const fx=document.createElement('div'); const authored=AUTHORED_ASSETS[safeDao]?.[safeType]||'';
  const safePattern=String(pattern||FX_DAO_THEMES[safeDao]?.motif||'pulse').replace(/[^a-z0-9_-]/gi,'');
  const copies=copyCountFor(safeType,safePattern,shots); const visual=authored;
  fx.className=`huntv2-fx-primitive fx-dao-${safeDao} fx-type-${safeType} fx-pattern-${safePattern} from-${side==='enemy'?'enemy':'player'} ${ultimate?'is-ultimate':''} ${authored?'has-authored':'has-procedural'} copies-${copies}`;
  fx.dataset.pattern=safePattern;fx.style.setProperty('--fx-copies',String(copies));
  const images=visual?Array.from({length:copies},(_,i)=>`<img class="${authored?'fx-authored':'fx-motif'} fx-copy c${i+1}" src="${visual}" alt="" draggable="false" decoding="async">`).join(''):'';
  fx.innerHTML=`${images}<i class="fx-ring"></i><i class="fx-core"></i><i class="fx-line"></i><i class="fx-burst"></i><i class="fx-particle p1"></i><i class="fx-particle p2"></i><i class="fx-particle p3"></i><i class="fx-particle p4"></i>`;
  layer.append(fx);
  const defaultLife=safeType==='field'?1280:safeType==='ultimate'?1500:safeType==='impact'?720:780; const life=Math.max(300,Number(lifeMs)||defaultLife);
  fx._removeTimer=setTimeout(()=>fx.remove(),life);return true;
}

export function playSkillFxPhase(root,skill={},phase='cast',{side='player',fallbackDao=''}={}){
  const recipe=fxRecipeForSkill(skill,fallbackDao); const type=phase==='cast'?recipe.cast:phase==='travel'?recipe.travel:phase==='impact'?recipe.impact:phase;
  return playFxPrimitive(root,{dao:recipe.dao,type,side,ultimate:recipe.ultimate,pattern:recipe.pattern,shots:recipe.shots});
}

export function playDevFx(root,dao='sword',type='cast'){
  return playFxPrimitive(root,{dao:FX_DAO_THEMES[dao]?dao:'sword',type,side:'player',ultimate:type==='ultimate',pattern:FX_DAO_THEMES[dao]?.motif||'pulse',shots:type==='ultimate'?4:1});
}
