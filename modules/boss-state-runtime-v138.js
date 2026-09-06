export const BOSS_STATE_RUNTIME_VERSION='1.38.0-alpha.9.0';

export const BOSS_STATE_NAMES=['idle','attack','cast','hit','phase2','phase3','defeat'];

export const CANONICAL_BOSS_STATE_CONFIG={
  'entity.boss.thunder_horn_rhino':{
    entityId:'entity.boss.thunder_horn_rhino',
    name:'Lôi Giác Huyền Tê',
    phaseThresholds:{phase2:66,phase3:28},
    skillStateMap:{
      'skill.rhino_charge':'attack',
      'skill.iron_boar_charge':'attack',
      'skill.rhino_thunder_roar':'cast',
      'skill.rhino_thunder_armor':'phase2',
      'skill.rhino_overcharge':'phase3',
    },
    stateDurations:{attack:520,cast:680,hit:360,phase2:1050,phase3:1250,defeat:1200},
  },
};

const STATE_CLASSES=BOSS_STATE_NAMES.map(x=>`boss-state-${x}`);

export function bossStateFromSkill(entityId='',skillId=''){
  const config=CANONICAL_BOSS_STATE_CONFIG[String(entityId)]||null;
  return config?.skillStateMap?.[String(skillId)]||'';
}

export function bossPhaseState(entityId='',hpPct=100){
  const config=CANONICAL_BOSS_STATE_CONFIG[String(entityId)]||null;
  if(!config)return '';
  const hp=Number(hpPct);
  if(!Number.isFinite(hp))return '';
  if(hp<=Number(config.phaseThresholds?.phase3??28))return 'phase3';
  if(hp<=Number(config.phaseThresholds?.phase2??66))return 'phase2';
  return 'idle';
}

export function setBossState(root,state='idle',{entityId='',holdMs,sticky=false}={}){
  const actor=root?.querySelector?.('[data-huntv2-actor="enemy"]');
  if(!actor)return false;
  const next=BOSS_STATE_NAMES.includes(state)?state:'idle';
  if(sticky&&['phase2','phase3','defeat'].includes(next))actor.dataset.bossPersistentState=next;
  if(next==='idle'&&!sticky)delete actor.dataset.bossPersistentState;
  actor.classList.remove(...STATE_CLASSES);
  actor.classList.add(`boss-state-${next}`);
  actor.dataset.bossState=next;
  const stage=root.querySelector?.('#huntV2Stage');
  if(stage)stage.dataset.bossVisualState=next;
  const config=CANONICAL_BOSS_STATE_CONFIG[String(entityId)]||null;
  const duration=Math.max(0,Number(holdMs??config?.stateDurations?.[next]??0));
  clearTimeout(actor._bossStateTimer);
  if(!sticky&&next!=='idle'&&next!=='defeat'&&duration>0){
    actor._bossStateTimer=setTimeout(()=>{
      if(!actor.isConnected)return;
      const restore=actor.dataset.bossPersistentState||'idle';
      actor.classList.remove(...STATE_CLASSES);
      actor.classList.add(`boss-state-${restore}`);
      actor.dataset.bossState=restore;
      if(stage?.isConnected)stage.dataset.bossVisualState=restore;
    },duration);
  }
  return true;
}

export function resetBossState(root){
  return setBossState(root,'idle');
}
