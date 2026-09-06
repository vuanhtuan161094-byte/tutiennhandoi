import {daoFromSkill,FX_DAO_THEMES,fxRecipeForSkill,skillVisualIdentity} from './combat-fx-runtime-v138.js';

export const COMBAT_PRESENTATION_FINAL_VERSION='1.38.0-alpha.17.0';

export const PRESENTATION_TIERS={
  normal:{hold:700,focus:360,impact:280,shake:false,label:'THI TRIỂN'},
  heavy:{hold:880,focus:460,impact:390,shake:true,label:'TRỌNG KÍCH'},
  support:{hold:760,focus:390,impact:300,shake:false,label:'VẬN CHUYỂN'},
  ultimate:{hold:1260,focus:760,impact:560,shake:true,label:'TUYỆT KỸ'},
};

export function presentationProfile(skill={},fallbackDao=''){
  const recipe=fxRecipeForSkill(skill,fallbackDao); const identity=skillVisualIdentity(skill,fallbackDao);
  const raw=[skill?.id,skill?.name,skill?.description,skill?.delivery,...(skill?.tags||[])].filter(Boolean).join(' ').toLowerCase();
  const support=recipe.support||/heal|hồi|shield|guard|buff|hộ thể|dưỡng|restore|recover/.test(raw);
  const heavy=recipe.heavy||/heavy|finisher|burst|break|phá|trấn|bạo|đoạn|quyết/.test(raw);
  const tier=recipe.ultimate?'ultimate':support?'support':heavy?'heavy':'normal';
  return {tier,dao:recipe.dao,recipe,identity,motion:identity.motion,pattern:identity.pattern,shots:identity.shots,hitStopMs:identity.hitStopMs,camera:identity.camera,...PRESENTATION_TIERS[tier]};
}

export function applyPresentationTheme(root,skill={},fallbackDao=''){
  const stage=root?.querySelector?.('#huntV2Stage'); if(!stage)return presentationProfile(skill,fallbackDao);
  const profile=presentationProfile(skill,fallbackDao); const theme=FX_DAO_THEMES[profile.dao]||FX_DAO_THEMES.spell;
  stage.dataset.presentationDao=profile.dao;stage.dataset.presentationTier=profile.tier;stage.dataset.presentationPattern=profile.pattern;
  stage.style.setProperty('--presentation-main',theme.main);stage.style.setProperty('--presentation-hot',theme.hot);stage.style.setProperty('--presentation-soft',theme.soft);stage.style.setProperty('--hit-stop-ms',`${profile.hitStopMs}ms`);
  return profile;
}
export function clearPresentationTheme(root){
  const stage=root?.querySelector?.('#huntV2Stage');if(!stage)return;
  delete stage.dataset.presentationDao;delete stage.dataset.presentationTier;delete stage.dataset.presentationPattern;
  stage.style.removeProperty('--presentation-main');stage.style.removeProperty('--presentation-hot');stage.style.removeProperty('--presentation-soft');stage.style.removeProperty('--hit-stop-ms');
}

export function presentationCaption(skill={},side='player',fallbackDao=''){
  const profile=presentationProfile(skill,fallbackDao);
  if(side==='enemy')return profile.tier==='ultimate'?'Yêu lực bạo phát · sát chiêu giáng xuống':'Yêu lực ngưng tụ · khí cơ khóa mục tiêu';
  if(profile.tier==='ultimate')return 'Đạo ý bộc phát · tuyệt kỹ khai phong';
  if(profile.tier==='support')return 'Khí cơ vận chuyển · trạng thái được gia trì';
  if(profile.dao==='sword')return 'Kiếm ý dẫn thế · phong mang xuất trận';
  if(profile.dao==='fist')return 'Kình lực hợp nhất · quyền thế áp trận';
  if(profile.dao==='body')return 'Khí huyết vận chuyển · cương thể hộ thân';
  if(profile.dao==='poison')return 'Độc tức tụ mạch · âm kình nhập thể';
  if(profile.dao==='formation')return 'Trận văn giao hội · trận thế khai mở';
  if(profile.dao==='artifact')return 'Ngự khí thành hình · pháp bảo ứng niệm';
  if(profile.dao==='mind')return 'Thần niệm ngưng tụ · ý niệm khóa hồn';
  return 'Linh lực hội tụ · pháp quyết thành hình';
}
export function shouldUseFieldFx(skill={},fallbackDao=''){const p=presentationProfile(skill,fallbackDao);return Boolean(p.recipe.field||p.recipe.support);}
export function impactIsStrong(event={},skill={},fallbackDao=''){if(event?.crit)return true;const p=presentationProfile(skill,fallbackDao);return p.tier==='heavy'||p.tier==='ultimate';}
export function calloutMeta(skill={},side='player',fallbackDao=''){
  const p=presentationProfile(skill,fallbackDao);return {label:side==='enemy'?(p.tier==='ultimate'?'YÊU THUẬT · SÁT CHIÊU':p.tier==='support'?'YÊU THUẬT':'YÊU KÍCH'):p.label,tier:p.tier,dao:p.dao,pattern:p.pattern};
}
export function isMajorStatus(event={}){const name=String(event?.statusName||event?.message||'').toLowerCase();return /choáng|stun|phong linh|silence|độc|poison|giáp liệt|mất thế|bất động|cuồng huyết|kiếm vực|lôi khải|bạo tẩu/.test(name);}
