import {
  createHybridSceneRuntimeController,
  resolveHybridFxProfile,
  measureHybridDomAnchor,
} from './hybrid-pixi-runtime-v139.js';
import {fxRecipeForSkill,FX_DAO_THEMES} from './combat-fx-runtime-v138.js';

const COMBAT_FX_PROFILES={
  off:{motion:0,particles:0,shake:0,flash:0},
  low:{motion:.45,particles:.45,shake:.55,flash:.65},
  normal:{motion:1,particles:1,shake:1,flash:1},
  high:{motion:1.2,particles:1.25,shake:1.15,flash:1.08},
};

const controller=createHybridSceneRuntimeController({
  sceneId:'combat',
  rendererQueryParam:'combatRenderer',
  rendererDataset:'combatRenderer',
  fxDataset:'combatPixiFx',
  sourceDataset:'combatPixiSource',
  canvasClass:'huntv2-pixi-canvas',
});

const FX_COLORS={
  lightning:0x8fdcff,fire:0xffa04f,ice:0xa8e8ff,water:0x78cfff,poison:0x7ee07f,wood:0x7ee07f,
  sword:0xbdeeff,metal:0xdcefff,support:0x8ee7b8,earth:0xe0c177,arcane:0xa99cff,
};

function poseFromDom(actor){
  if(!actor)return 'idle';
  const c=actor.classList;
  if(c.contains('state-dead'))return 'defeat';
  if(c.contains('state-ultimate'))return 'ultimate';
  if(c.contains('state-hit'))return 'hit';
  if(c.contains('state-attack')||c.contains('state-sword')||c.contains('state-dash')||c.contains('state-counter'))return 'attack';
  if(c.contains('state-cast')||c.contains('state-heal')||c.contains('state-channel')||c.contains('state-brace')||c.contains('state-summon'))return 'cast';
  return 'idle';
}

function actorStateKey(actor){
  if(!actor)return 'idle';
  const c=actor.classList;
  const names=['state-dead','state-ultimate','state-hit','state-dodge','state-attack','state-sword','state-dash','state-counter','state-cast','state-heal','state-channel','state-brace','state-summon','boss-state-phase2','boss-state-phase3','boss-state-cast','boss-state-hit','boss-state-defeat'];
  return names.filter(name=>c.contains(name)).join('|')||'idle';
}

function uniqueAssets(values){return [...new Set(values.filter(Boolean).map(String))];}
function textureMap(paths,textures){const map=new Map();paths.forEach((path,index)=>map.set(path,textures[index]));return map;}
const clamp01=value=>Math.max(0,Math.min(1,value));
const easeOut=value=>1-Math.pow(1-clamp01(value),2);
const pulse=(value,peak=.45)=>value<=peak?clamp01(value/peak):clamp01(1-(value-peak)/(1-peak));
const lerp=(a,b,t)=>a+(b-a)*clamp01(t);
const skillSuffix=skill=>String(skill?.id||'').split('.').at(-1)||'';
const GOLDEN_SWORD_G2_SKILLS=new Set(['nurture','flow_slash','break_mark','chain','myriad']);

function hexColor(value,fallback=0x8fdcff){
  if(Number.isFinite(Number(value)))return Number(value);
  const raw=String(value||'').trim().replace('#','');
  if(/^[0-9a-f]{6}$/i.test(raw))return Number.parseInt(raw,16);
  return fallback;
}

function visualElementFromSkill(skill={}){
  const raw=[skill?.name,skill?.description,skill?.primaryElement,...(skill?.tags||[])].filter(Boolean).join(' ').toLowerCase();
  if(/lôi|lightning|thunder|sét/.test(raw))return'lightning';
  if(/hỏa|fire|flame|viêm/.test(raw))return'fire';
  if(/thủy|water|băng|ice/.test(raw))return'water';
  if(/mộc|wood|độc|poison/.test(raw))return'wood';
  if(/kim|metal/.test(raw))return'metal';
  if(/thổ|earth|địa/.test(raw))return'earth';
  return'';
}
function colorFor({kind='',skill={},fallbackDao='spell'}={}){
  const element=visualElementFromSkill(skill);
  if(element&&FX_COLORS[element])return FX_COLORS[element];
  const key=String(kind||'').toLowerCase();
  if(FX_COLORS[key])return FX_COLORS[key];
  const recipe=fxRecipeForSkill(skill||{},fallbackDao||'spell');
  return hexColor(FX_DAO_THEMES[recipe.dao]?.main,0x8fdcff);
}

function applySpriteFit(sprite,texture,anchor,{mirror=false,scale=1,offsetX=0,offsetY=0,bob=0,dx=0,dy=0,alpha=1,tint=0xffffff}={}){
  if(!sprite||!texture||!anchor)return;
  const tw=Math.max(1,Number(texture.width)||1),th=Math.max(1,Number(texture.height)||1);
  const fit=Math.min(Math.max(1,anchor.width)/tw,Math.max(1,anchor.height)/th)*Math.max(.1,Number(scale)||1);
  sprite.texture=texture;
  sprite.position.set(anchor.x+anchor.width*offsetX+dx,anchor.y+anchor.height*.5+anchor.height*offsetY+bob+dy);
  sprite.scale.set((mirror?-1:1)*fit,fit);
  sprite.alpha=alpha;
  sprite.tint=tint;
}

function actorMotion(actor,stateAge,motion,isEnemy=false){
  if(!actor||motion<=0)return {dx:0,dy:0,scale:1,alpha:1};
  const c=actor.classList;
  if(c.contains('state-dead')){
    const t=easeOut(stateAge/.85);
    return {dx:0,dy:14*t*motion,scale:1,alpha:1-.58*t};
  }
  if(c.contains('state-ultimate')){
    const t=pulse(clamp01(stateAge/.82),.35);
    return {dx:0,dy:0,scale:1+.06*t*motion,alpha:1};
  }
  if(c.contains('state-hit')){
    const t=clamp01(stateAge/.34);
    const dx=t<.3?7*(t/.3):t<.55?7+(-12)*((t-.3)/.25):-5+5*((t-.55)/.45);
    return {dx:dx*motion*(isEnemy?-1:1),dy:0,scale:1,alpha:1};
  }
  if(c.contains('state-dodge')){
    const t=clamp01(stateAge/.4),p=Math.sin(Math.PI*t);
    return {dx:-18*p*motion*(isEnemy?-1:1),dy:0,scale:1,alpha:1-.45*p};
  }
  if(c.contains('state-cast')||c.contains('state-channel')||c.contains('state-brace')||c.contains('state-summon')){
    const duration=c.contains('state-channel')?.72:c.contains('state-brace')?.52:.62;
    const t=clamp01(stateAge/duration),p=pulse(t,.34),settle=Math.sin(Math.PI*t);
    return {dx:(isEnemy?3:-4)*p*motion,dy:(3*p-2*settle)*motion,scale:1+.022*p*motion,alpha:1};
  }
  if(c.contains('state-attack')||c.contains('state-sword')||c.contains('state-dash')||c.contains('state-counter')){
    const duration=isEnemy?.48:.45,t=clamp01(stateAge/duration),p=pulse(t,.45);
    return {dx:(isEnemy?-24:28)*p*motion,dy:isEnemy?0:-2*p*motion,scale:1+(isEnemy?.03:.035)*p*motion,alpha:1};
  }
  return {dx:0,dy:0,scale:1,alpha:1};
}

function bossVisualState(actor,elapsed,motion){
  if(!actor)return {dx:0,dy:0,scale:1,alpha:1,tint:0xffffff};
  const c=actor.classList;
  if(c.contains('boss-state-defeat'))return {dx:4,dy:12,scale:.96,alpha:.38,tint:0xb9b9b9};
  if(c.contains('boss-state-phase3'))return {dx:Math.sin(elapsed*8)*1.5,dy:-2,scale:1.025,alpha:1,tint:0xe0c8ff};
  if(c.contains('boss-state-phase2'))return {dx:0,dy:Math.sin(elapsed*2.2)*2*motion,scale:1.015,alpha:1,tint:0xc7e7ff};
  if(c.contains('boss-state-cast'))return {dx:0,dy:-3,scale:1.04,alpha:1,tint:0xd7efff};
  if(c.contains('boss-state-hit'))return {dx:4,dy:0,scale:1,alpha:1,tint:0xffffff};
  return {dx:0,dy:0,scale:1,alpha:1,tint:0xffffff};
}

function createRing(PIXI,color=0x8fdcff,{radius=34,width=2,alpha=.8}={}){
  return new PIXI.Graphics().circle(0,0,radius).stroke({color,width,alpha});
}
function createDisc(PIXI,color=0xffffff,{radius=5,alpha=1}={}){
  return new PIXI.Graphics().circle(0,0,radius).fill({color,alpha});
}
function createRay(PIXI,color=0xffffff,{length=34,width=2,alpha=.85}={}){
  return new PIXI.Graphics().roundRect(0,-width/2,length,width,width/2).fill({color,alpha});
}

function setFxTelemetry(stats={}){
  try{
    document.body.dataset.combatPixiFxLayer='a178';
    document.body.dataset.combatPixiFxActive=String(stats.active||0);
    document.body.dataset.combatPixiFxEvents=String(stats.events||0);
    document.body.dataset.combatPixiProjectiles=String(stats.projectiles||0);
    document.body.dataset.combatPixiImpacts=String(stats.impacts||0);
    document.body.dataset.combatPixiCamera=String(stats.camera||0);
    document.body.dataset.combatPixiFields=String(stats.fields||0);
    document.body.dataset.combatPixiParticles=String(stats.particles||0);
    document.body.dataset.combatPixiVolleys=String(stats.volleys||0);
    document.body.dataset.combatPixiViewport=String(stats.viewport||'');
    document.body.dataset.combatPixiHitStops=String(stats.hitStops||0);
    document.body.dataset.combatPixiPoseBlends=String(stats.poseBlends||0);
    document.body.dataset.combatPixiSfxHooks=String(stats.sfxHooks||0);
    document.body.dataset.combatPixiSwordBursts=String(stats.swordBursts||0);
    document.body.dataset.combatPixiGoldenSwordSkills=String(stats.goldenSwordSkills||0);
  }catch{}
}
function clearFxTelemetry(){
  try{
    delete document.body.dataset.combatPixiFxLayer;
    delete document.body.dataset.combatPixiFxActive;
    delete document.body.dataset.combatPixiFxEvents;
    delete document.body.dataset.combatPixiProjectiles;
    delete document.body.dataset.combatPixiImpacts;
    delete document.body.dataset.combatPixiCamera;
    delete document.body.dataset.combatPixiFields;
    delete document.body.dataset.combatPixiParticles;
    delete document.body.dataset.combatPixiVolleys;
    delete document.body.dataset.combatPixiViewport;
    delete document.body.dataset.combatPixiHitStops;
    delete document.body.dataset.combatPixiPoseBlends;
    delete document.body.dataset.combatPixiSfxHooks;
    delete document.body.dataset.combatPixiSwordBursts;
    delete document.body.dataset.combatPixiGoldenSwordSkills;
    delete document.body.dataset.combatPixiGoldenSword;
    delete document.body.dataset.combatPixiSwordQi;
    delete document.body.dataset.combatPixiSwordQiMax;
  }catch{}
}

export function destroyCombatPixiScene(){controller.destroy();clearFxTelemetry();}
export function requestCombatPixiLayout(){try{controller.current?.combatLayout?.();}catch{}}
export async function updateCombatPixiEnemyAsset(asset=''){
  try{return await controller.current?.setCombatEnemyAsset?.(String(asset||''));}catch{return false;}
}
export function playCombatPixiFx(event={}){
  try{return Boolean(controller.current?.playCombatFx?.(event));}catch{return false;}
}
export function setCombatPixiFxState(state={}){
  try{return Boolean(controller.current?.setCombatFxState?.(state));}catch{return false;}
}
export function setCombatPixiSwordQi(state={}){
  try{return Boolean(controller.current?.setSwordQiVisual?.(state));}catch{return false;}
}

export async function mountCombatPixiScene({host,playerDom,enemyDom,playerVisual={},enemyAsset='',force=false}={}){
  const profile=resolveHybridFxProfile({paramName:'combatFx',profiles:COMBAT_FX_PROFILES,defaultLevel:'normal',reducedLevel:'off',lowMemoryLevel:'low',memoryThreshold:4});
  return controller.mount({
    host,force,fxProfile:profile,
    setup:async session=>{
      const {PIXI,app}=session;
      const poses=playerVisual?.poses||{};
      const allPaths=uniqueAssets([...Object.values(poses),enemyAsset]);
      const loaded=await session.loadAssets(allPaths);
      if(!session.isCurrent())return;
      const textures=textureMap(allPaths,loaded);
      const fallbackPlayer=textures.get(poses.idle)||textures.get(allPaths[0]);
      let enemyTexture=textures.get(enemyAsset);
      if(!fallbackPlayer||!enemyTexture)throw new Error('combat actor texture missing');

      const camera=new PIXI.Container();camera.sortableChildren=true;app.stage.addChild(camera);
      const fxBack=new PIXI.Container();fxBack.zIndex=4;camera.addChild(fxBack);
      const actorLayer=new PIXI.Container();actorLayer.zIndex=10;actorLayer.sortableChildren=true;camera.addChild(actorLayer);
      const fxFront=new PIXI.Container();fxFront.zIndex=20;camera.addChild(fxFront);
      const swordQiLayer=new PIXI.Container();swordQiLayer.zIndex=8;camera.addChild(swordQiLayer);
      const overlay=new PIXI.Container();overlay.zIndex=30;app.stage.addChild(overlay);

      const playerGhost=new PIXI.Sprite(fallbackPlayer);playerGhost.anchor.set(.5,1);playerGhost.zIndex=9;playerGhost.alpha=0;actorLayer.addChild(playerGhost);
      const player=new PIXI.Sprite(fallbackPlayer);player.anchor.set(.5,1);player.zIndex=10;actorLayer.addChild(player);
      const enemy=new PIXI.Sprite(enemyTexture);enemy.anchor.set(.5,1);enemy.zIndex=11;actorLayer.addChild(enemy);

      let fxPaused=false,fxSpeed=1;
      let playerAnchor=null,enemyAnchor=null;
      let elapsed=0;
      let playerState=actorStateKey(playerDom),enemyState=actorStateKey(enemyDom);
      let playerStateAt=0,enemyStateAt=0;
      let playerFlashUntil=0,enemyFlashUntil=0;
      let swordQiValue=0,swordQiMax=5;
      let hitStopRemaining=0;
      let lastPlayerTexture=fallbackPlayer,poseBlendAt=-10;
      const poseBlendLife=.14;
      const effects=[];
      const stats={active:0,events:0,projectiles:0,impacts:0,camera:0,fields:0,particles:0,volleys:0,hitStops:0,poseBlends:0,sfxHooks:0,swordBursts:0,goldenSwordSkills:0,viewport:(globalThis.innerWidth||app.screen.width)>=700?'web':'mobile'};
      const cameraImpulse={started:0,duration:0,strength:0,seed:0};
      const screenFlash={started:0,duration:0,strength:0};
      const flashSprite=new PIXI.Sprite(PIXI.Texture.WHITE);flashSprite.alpha=0;flashSprite.tint=0xffffff;overlay.addChild(flashSprite);

      const geometry=playerVisual?.geometry||{};
      const playerScale=Number(geometry.combatScale||1);
      const offsetX=Number(geometry.offset?.x||0),offsetY=Number(geometry.offset?.y||0);
      const facing=playerVisual?.facingPolicy||{};
      const mirrorPlayer=String(facing.leftSlotFaces||'right')==='right'&&String(facing.defaultAuthoredFacing||'left')==='left';

      const anchorFor=side=>side==='player'?playerAnchor:enemyAnchor;
      const otherSide=side=>side==='enemy'?'player':'enemy';
      const actorPoint=(side,where='center')=>{
        const a=anchorFor(side);
        if(!a)return {x:0,y:0};
        if(where==='ground')return {x:a.x,y:a.y+a.height*.42};
        if(where==='cast')return {x:a.x+(side==='player'?a.width*.18:-a.width*.18),y:a.y-a.height*.02};
        if(where==='impact')return {x:a.x+(side==='player'?a.width*.18:-a.width*.18),y:a.y-a.height*.04};
        return {x:a.x,y:a.y};
      };

      const emitSfxHook=(cue,detail={})=>{
        stats.sfxHooks+=1;setFxTelemetry(stats);
        try{
          if(typeof globalThis.dispatchEvent==='function'&&typeof globalThis.CustomEvent==='function')globalThis.dispatchEvent(new CustomEvent('tutien:combat-sfx',{detail:{cue,...detail}}));
        }catch{}
        return true;
      };
      const addEffect=(display,{life=.7,update,type='fx'}={})=>{
        if(!display)return false;
        const item={display,age:0,life:Math.max(.08,Number(life)||.7),update,type};
        effects.push(item);stats.active=effects.length;setFxTelemetry(stats);return true;
      };
      const removeEffect=item=>{
        try{item.display?.removeFromParent?.();item.display?.destroy?.({children:true});}catch{}
      };
      const clearEffects=()=>{while(effects.length)removeEffect(effects.pop());stats.active=0;setFxTelemetry(stats);};
      session.addCleanup(()=>{clearEffects();clearFxTelemetry();});

      const playCast=({side='player',color=0x8fdcff,strong=false,ultimate=false,dao='spell',pattern='cast'}={})=>{
        const p=actorPoint(side,'ground');const root=new PIXI.Container();root.position.set(p.x,p.y);fxBack.addChild(root);
        const anchor=anchorFor(side);const baseRadius=Math.max(26,(anchor?.width||90)*.34);
        const ring=createRing(PIXI,color,{radius:baseRadius,width:ultimate?3:2,alpha:.86});ring.scale.set(.35);root.addChild(ring);
        const core=createDisc(PIXI,0xffffff,{radius:ultimate?6:4,alpha:.78});core.position.y=-Math.max(12,(anchor?.height||100)*.34);root.addChild(core);
        const motifs=[];
        const addMotif=node=>{motifs.push(node);root.addChild(node);return node;};
        if(dao==='sword'){
          for(let i=-1;i<=1;i++){const blade=addMotif(createRay(PIXI,i===0?0xffffff:color,{length:ultimate?54:38,width:i===0?2.4:1.7,alpha:.78}));blade.position.set(i*12,-baseRadius*.42-Math.abs(i)*4);blade.rotation=-Math.PI/2+i*.12;blade._kind='blade';blade._lane=i;}
        }else if(dao==='fist'){
          for(let i=0;i<2+(strong?1:0);i++){const shock=addMotif(createRing(PIXI,i===0?0xffffff:color,{radius:baseRadius*(.3+i*.18),width:2.4-i*.35,alpha:.62}));shock.scale.set(1,.38);shock._kind='shock';shock._lane=i;}
        }else if(dao==='body'){
          for(let i=-2;i<=2;i++){const pillar=addMotif(createRay(PIXI,i===0?0xffffff:color,{length:ultimate?44:30,width:i===0?5:3.2,alpha:.52}));pillar.position.set(i*9,-baseRadius*.12);pillar.rotation=-Math.PI/2+(i*.04);pillar._kind='pillar';pillar._lane=i;}
        }else if(dao==='poison'){
          for(let i=0;i<(ultimate?9:6);i++){const mote=addMotif(createDisc(PIXI,i%3===0?0xffffff:color,{radius:1.8+(i%3)*.6,alpha:.62}));mote._theta=(Math.PI*2*i)/(ultimate?9:6);mote._kind='mist';mote._lane=i;}
        }else if(dao==='artifact'){
          for(let i=0;i<(ultimate?6:4);i++){const gem=addMotif(new PIXI.Graphics().roundRect(-3,-3,6,6,1).fill({color:i%2?color:0xffffff,alpha:.82}));gem.rotation=Math.PI*.25;gem._theta=(Math.PI*2*i)/(ultimate?6:4);gem._kind='orbit';gem._lane=i;}
        }else if(dao==='formation'){
          const square=addMotif(new PIXI.Graphics().roundRect(-baseRadius*.48,-baseRadius*.18,baseRadius*.96,baseRadius*.36,3).stroke({color,width:ultimate?2.6:1.8,alpha:.66}));square.rotation=Math.PI*.25;square._kind='rune';
          for(let i=0;i<4;i++){const node=addMotif(createDisc(PIXI,i===0?0xffffff:color,{radius:2.2,alpha:.72}));node._theta=Math.PI*.25+i*Math.PI*.5;node._kind='runeDot';node._lane=i;}
        }else if(dao==='mind'){
          for(let i=0;i<(ultimate?4:3);i++){const wave=addMotif(createRing(PIXI,i===0?0xffffff:color,{radius:baseRadius*(.28+i*.16),width:1.5,alpha:.5}));wave.scale.set(.45,1);wave.position.y=-baseRadius*.34;wave._kind='mindWave';wave._lane=i;}
          const needle=addMotif(createRay(PIXI,0xffffff,{length:ultimate?38:26,width:1.2,alpha:.82}));needle.position.set(0,-baseRadius*.34);needle.rotation=-Math.PI/2;needle._kind='mindNeedle';
        }else{
          const sigil=addMotif(createRing(PIXI,color,{radius:baseRadius*.58,width:1.2,alpha:.52}));sigil.scale.set(1,.48);sigil._kind='sigil';
          for(let i=0;i<4;i++){const dot=addMotif(createDisc(PIXI,i===0?0xffffff:color,{radius:1.8,alpha:.7}));dot._theta=i*Math.PI*.5;dot._kind='sigilDot';dot._lane=i;}
        }
        stats.particles+=motifs.length;
        return addEffect(root,{life:ultimate?1.16:strong?.78:.68,type:'cast',update:(item,t)=>{
          const e=easeOut(t);ring.scale.set(lerp(.35,1.16,e));ring.alpha=(1-t)*.86;ring.rotation+=(dao==='formation'?.018:dao==='mind'?.045:.032)*profile.motion;
          core.alpha=(1-t)*.78;core.scale.set(1+pulse(t,.3)*.85);
          motifs.forEach((m,i)=>{
            if(m._kind==='blade'){m.position.y=-baseRadius*(.3+e*.46)-Math.abs(m._lane)*4;m.alpha=(1-t)*.8;m.rotation+=m._lane*.0015*profile.motion;}
            else if(m._kind==='shock'){const k=1+e*(.45+m._lane*.18);m.scale.set(k,k*.38);m.alpha=(1-t)*(.68-m._lane*.1);}
            else if(m._kind==='pillar'){m.position.y=-baseRadius*.08-e*(14+Math.abs(m._lane)*3);m.alpha=(1-t)*.58;}
            else if(m._kind==='mist'){const theta=m._theta+elapsed*(.65+(m._lane%3)*.11);const rr=baseRadius*(.28+e*.62);m.position.set(Math.cos(theta)*rr,Math.sin(theta)*rr*.22-e*(18+(m._lane%2)*8));m.alpha=(1-t)*.64;}
            else if(m._kind==='orbit'){const theta=m._theta+elapsed*(1.55+(m._lane%2)*.2);const rr=baseRadius*(.35+e*.38);m.position.set(Math.cos(theta)*rr,Math.sin(theta)*rr*.35-baseRadius*.18);m.rotation+=.04*profile.motion;m.alpha=(1-t)*.84;}
            else if(m._kind==='rune'){m.scale.set(.72+e*.34,.72+e*.34);m.rotation+=.014*profile.motion;m.alpha=(1-t)*.7;}
            else if(m._kind==='runeDot'){const rr=baseRadius*(.45+e*.35);m.position.set(Math.cos(m._theta+elapsed*.5)*rr,Math.sin(m._theta+elapsed*.5)*rr*.34);m.alpha=(1-t)*.72;}
            else if(m._kind==='mindWave'){const k=1+e*(.32+m._lane*.12);m.scale.set(.45*k,k);m.alpha=(1-t)*(.58-m._lane*.08);}
            else if(m._kind==='mindNeedle'){m.position.y=-baseRadius*.34-e*12;m.alpha=(1-t)*.86;}
            else if(m._kind==='sigil'){m.rotation-=.02*profile.motion;m.scale.set(1+e*.22,.48+e*.08);m.alpha=(1-t)*.56;}
            else if(m._kind==='sigilDot'){const rr=baseRadius*(.42+e*.36);m.position.set(Math.cos(m._theta+elapsed)*rr,Math.sin(m._theta+elapsed)*rr*.32);m.alpha=(1-t)*.72;}
          });
        }});
      };

      const playField=({side='player',color=0x8fdcff,strong=false,ultimate=false,dao='spell',pattern='field',support=false}={})=>{
        const anchor=anchorFor(side);if(!anchor)return false;
        const p=actorPoint(side,'ground');const root=new PIXI.Container();root.position.set(p.x,p.y);fxBack.addChild(root);
        const radius=Math.max(34,(anchor.width||96)*(ultimate?.58:strong?.5:.43));
        const ringA=createRing(PIXI,color,{radius,width:ultimate?3.2:2.2,alpha:.72});root.addChild(ringA);
        const ringB=createRing(PIXI,0xffffff,{radius:radius*.68,width:1.4,alpha:.38});root.addChild(ringB);
        const core=createDisc(PIXI,color,{radius:Math.max(8,radius*.18),alpha:support?.16:.1});core.scale.set(1,.42);root.addChild(core);
        const motifCount=Math.max(4,Math.min(10,(ultimate?8:strong?6:4)+(profile.particles>1?2:0)));
        const motifs=[];
        for(let i=0;i<motifCount;i++){
          const theta=(Math.PI*2*i)/motifCount;
          const dot=createDisc(PIXI,i%3===0?0xffffff:color,{radius:ultimate?2.4:1.8,alpha:.58});dot._theta=theta;dot.position.set(Math.cos(theta)*radius*.72,Math.sin(theta)*radius*.24);motifs.push(dot);root.addChild(dot);
        }
        if(dao==='formation'){
          for(let i=0;i<4;i++){const ray=createRay(PIXI,color,{length:radius*.72,width:1.25,alpha:.24});ray.rotation=Math.PI*.25+i*Math.PI*.5;ray.position.set(Math.cos(ray.rotation)*radius*.08,Math.sin(ray.rotation)*radius*.04);root.addChild(ray);}
        }
        stats.fields+=1;stats.particles+=motifCount;
        const life=ultimate?1.5:strong?1.15:support?1.05:.92;
        return addEffect(root,{life,type:'field',update:(item,t)=>{
          const e=easeOut(t);root.alpha=t<.18?easeOut(t/.18):Math.max(0,1-(t-.72)/.28);
          ringA.rotation+=(dao==='formation'?.018:.028)*profile.motion;ringB.rotation-=(dao==='mind'?.036:.021)*profile.motion;
          ringA.scale.set(lerp(.72,1.08,e),lerp(.82,1,e));ringB.scale.set(lerp(1.08,.9,e),lerp(.9,1,e));
          core.alpha=(support?.2:.12)*(1-pulse(t,.62)*.25);
          motifs.forEach((dot,i)=>{const theta=dot._theta+elapsed*(dao==='artifact'?.85:dao==='mind'?1.25:.55)+(i%2?.08:-.05)*Math.sin(elapsed*2.4);const rr=radius*(.62+.14*Math.sin(elapsed*1.7+i));dot.position.set(Math.cos(theta)*rr,Math.sin(theta)*rr*.27);dot.alpha=.32+.28*pulse((t+i*.03)%1,.5);});
          if(pattern.includes('mist')||dao==='poison')root.position.y=p.y-Math.sin(elapsed*1.4)*3;
        }});
      };

      const buildTravelVisual=(container,{dao='spell',color=0x8fdcff,strong=false,index=0}={})=>{
        const parts={dao};
        if(dao==='sword'){
          const blade=createRay(PIXI,0xffffff,{length:strong?46:34,width:strong?3.2:2.2,alpha:.96});blade.rotation=-.18;blade.position.set(-12,0);container.addChild(blade);
          const edge=createRay(PIXI,color,{length:strong?54:41,width:1.3,alpha:.72});edge.rotation=-.18;edge.position.set(-17,4);container.addChild(edge);
          parts.spin=.04;
        }else if(dao==='fist'){
          const ring=createRing(PIXI,color,{radius:strong?12:9,width:strong?3:2,alpha:.88});ring.scale.set(1,.48);container.addChild(ring);
          const core=createDisc(PIXI,0xffffff,{radius:strong?4.2:3,alpha:.82});container.addChild(core);parts.pulse=ring;
        }else if(dao==='body'){
          for(let i=0;i<3;i++){const shard=createRay(PIXI,i===0?0xffffff:color,{length:strong?24:18,width:strong?5:3.5,alpha:.78});shard.rotation=(i-1)*.26;shard.position.set(-6,(i-1)*5);container.addChild(shard);}parts.spin=.015;
        }else if(dao==='poison'){
          const count=strong?6:4;for(let i=0;i<count;i++){const dot=createDisc(PIXI,i%2?color:0xffffff,{radius:strong?3.2:2.4,alpha:.72});dot._theta=(Math.PI*2*i)/count;dot.position.set(Math.cos(dot._theta)*7,Math.sin(dot._theta)*5);container.addChild(dot);}parts.orbit=true;
        }else if(dao==='artifact'){
          const core=new PIXI.Graphics().roundRect(-5,-5,10,10,2).fill({color:0xffffff,alpha:.92});core.rotation=Math.PI*.25;container.addChild(core);
          const ring=createRing(PIXI,color,{radius:strong?15:11,width:1.5,alpha:.62});ring.scale.set(1,.55);container.addChild(ring);
          for(let i=0;i<3;i++){const dot=createDisc(PIXI,color,{radius:2,alpha:.8});dot._theta=(Math.PI*2*i)/3;container.addChild(dot);}parts.orbit=true;
        }else if(dao==='formation'){
          const rune=new PIXI.Graphics().roundRect(-10,-10,20,20,2).stroke({color,width:strong?2.5:1.7,alpha:.84});rune.rotation=Math.PI*.25;container.addChild(rune);
          const inner=createRing(PIXI,0xffffff,{radius:strong?7:5,width:1.2,alpha:.52});container.addChild(inner);parts.spin=.06;
        }else if(dao==='mind'){
          const needle=createRay(PIXI,0xffffff,{length:strong?34:25,width:1.5,alpha:.95});needle.position.set(-12,0);container.addChild(needle);
          const wave=createRing(PIXI,color,{radius:strong?12:9,width:1.4,alpha:.62});wave.scale.set(.55,1);wave.position.x=-4;container.addChild(wave);parts.pulse=wave;
        }else{
          const core=createDisc(PIXI,0xffffff,{radius:strong?5.5:4,alpha:1});container.addChild(core);
          const ring=createRing(PIXI,color,{radius:strong?12:9,width:1.8,alpha:.55});container.addChild(ring);parts.pulse=ring;parts.spin=.03;
        }
        container._travelParts=parts;container.rotation=(index%2?-.04:.04);return container;
      };
      const animateTravelVisual=(node,t)=>{
        const parts=node?._travelParts||{};
        if(parts.spin)node.rotation+=parts.spin*profile.motion;
        if(parts.pulse){const p=1+pulse(t,.5)*.28;parts.pulse.scale.set(parts.dao==='fist'?p:p,parts.dao==='fist'?.48*p:parts.dao==='mind'?p:.72*p);}
        if(parts.orbit){node.children.forEach((child,i)=>{if(child._theta!==undefined){const theta=child._theta+elapsed*(parts.dao==='artifact'?3.1:2.2);const r=parts.dao==='artifact'?12:7;child.position.set(Math.cos(theta)*r,Math.sin(theta)*r*(parts.dao==='artifact'?.55:.72));}});}
      };

      const playVolley=({side='player',kind='arcane',color=0x8fdcff,strong=false,shots=3,pattern='volley',dao='spell'}={})=>{
        const target=otherSide(side),start=actorPoint(side,'cast'),end=actorPoint(target,'impact');
        const root=new PIXI.Container();fxFront.addChild(root);const count=Math.max(2,Math.min(5,Number(shots)||3));const nodes=[];
        for(let i=0;i<count;i++){
          const node=buildTravelVisual(new PIXI.Container(),{dao,color,strong,index:i});node.sortableChildren=true;node._offset=(i-(count-1)/2);nodes.push(node);root.addChild(node);
        }
        stats.projectiles+=count;stats.volleys+=1;stats.particles+=count;
        return addEffect(root,{life:strong?.72:.64,type:'volley',update:(item,t)=>{
          nodes.forEach((node,i)=>{
            const stagger=i*.055;const local=clamp01((t-stagger)/(1-stagger));const e=easeOut(local);const sideSign=side==='player'?1:-1;
            const arc=Math.sin(Math.PI*local)*(-(strong?30:21)+node._offset*3);const lane=node._offset*(pattern.includes('rain')?12:7);
            node.position.set(lerp(start.x,end.x,e)+lane*(1-e)*sideSign,lerp(start.y,end.y,e)+arc+node._offset*4);
            node.alpha=t<stagger?0:Math.max(0,1-(local-.86)/.14);node.scale.set(1+pulse(local,.55)*.18);animateTravelVisual(node,local);
          });
        }});
      };

      const playProjectile=({side='player',kind='arcane',color=0x8fdcff,strong=false,shots=1,pattern='',dao='spell'}={})=>{
        const target=otherSide(side),start=actorPoint(side,'cast'),end=actorPoint(target,'impact');
        const root=buildTravelVisual(new PIXI.Container(),{dao,color,strong});fxFront.addChild(root);root.sortableChildren=true;
        const trail=[];const count=profile.particles>0?(strong?5:3):1;stats.particles+=count;
        for(let i=0;i<count;i++){const d=createDisc(PIXI,color,{radius:Math.max(1,2.6-i*.35),alpha:.28});trail.push(d);root.addChild(d);}
        const life=kind==='lightning'?.38:strong?.58:.5;
        stats.projectiles+=1;
        return addEffect(root,{life,type:'projectile',update:(item,t)=>{
          const e=easeOut(t);const arc=Math.sin(Math.PI*t)*-(strong?24:16);
          const x=lerp(start.x,end.x,e),y=lerp(start.y,end.y,e)+arc;root.position.set(x,y);
          animateTravelVisual(root,t);
          trail.forEach((d,i)=>{const lag=(i+1)*7*(side==='player'?-1:1);d.position.set(lag,(i%2?1:-1)*2);d.alpha=.3*(1-t);});
        }});
      };

      const playSlash=({side='player',color=0xbdeeff,strong=false}={})=>{
        const target=otherSide(side);const p=actorPoint(target,'impact');const root=new PIXI.Container();root.position.set(p.x,p.y);fxFront.addChild(root);
        const rays=[];for(let i=0;i<(strong?3:2);i++){const ray=createRay(PIXI,i===0?0xffffff:color,{length:strong?78:58,width:strong?3:2,alpha:.92});ray.pivot.set(0,1);ray.rotation=(side==='player'?-0.62:2.52)+(i-1)*.24;rays.push(ray);root.addChild(ray);}
        return addEffect(root,{life:strong?.44:.34,type:'slash',update:(item,t)=>{const e=easeOut(t);root.scale.set(lerp(.4,1.15,e));root.alpha=1-t;rays.forEach((r,i)=>r.rotation+=(side==='player'?-.02:.02)*profile.motion*(i+1));}});
      };

      const playLightning=({target='enemy',color=0x8fdcff,strong=false}={})=>{
        const p=actorPoint(target,'impact');const root=new PIXI.Container();root.position.set(p.x,p.y-42);fxFront.addChild(root);
        const bolts=[];const count=strong?4:3;
        for(let i=0;i<count;i++){
          const g=new PIXI.Graphics().moveTo((i-count/2)*9,-42).lineTo((i-count/2)*8+6,-18).lineTo((i-count/2)*8-2,3).lineTo((i-count/2)*7+7,37).stroke({color:i===0?0xffffff:color,width:i===0?3:2,alpha:.9});
          bolts.push(g);root.addChild(g);
        }
        return addEffect(root,{life:.46,type:'lightning',update:(item,t)=>{root.alpha=(1-t)*(.78+.22*Math.sin(t*40));root.scale.set(1+pulse(t,.3)*.08);}});
      };

      const playImpact=({target='enemy',color=0xffd36e,strong=false,camera='light',hitStopMs=34,dao='spell',pattern='impact'}={})=>{
        const p=actorPoint(target,'impact');const root=new PIXI.Container();root.position.set(p.x,p.y);fxFront.addChild(root);
        const ring=createRing(PIXI,color,{radius:strong?34:24,width:strong?4:3,alpha:.92});ring.scale.set(.25);root.addChild(ring);
        const core=createDisc(PIXI,0xffffff,{radius:strong?12:8,alpha:.92});root.addChild(core);
        const motifs=[];const add=node=>{motifs.push(node);root.addChild(node);return node;};
        if(dao==='sword'){
          for(let i=0;i<(strong?4:3);i++){const slash=add(createRay(PIXI,i===0?0xffffff:color,{length:strong?74:52,width:i===0?3.2:2,alpha:.88}));slash.rotation=-.72+i*.46;slash._kind='slash';slash._theta=slash.rotation;}
        }else if(dao==='fist'){
          for(let i=0;i<3;i++){const shock=add(createRing(PIXI,i===0?0xffffff:color,{radius:strong?22+i*7:16+i*5,width:3-i*.5,alpha:.62}));shock.scale.set(.3,.12);shock._kind='shock';shock._lane=i;}
        }else if(dao==='body'){
          for(let i=-2;i<=2;i++){const shard=add(createRay(PIXI,i===0?0xffffff:color,{length:strong?42:30,width:strong?5:3.4,alpha:.76}));shard.rotation=-Math.PI/2+i*.34;shard.position.set(i*6,8);shard._kind='groundShard';shard._lane=i;}
        }else if(dao==='poison'){
          for(let i=0;i<(strong?10:7);i++){const drop=add(createDisc(PIXI,i%3===0?0xffffff:color,{radius:2+(i%3)*.7,alpha:.74}));drop._theta=(Math.PI*2*i)/(strong?10:7);drop._kind='toxic';drop._lane=i;}
        }else if(dao==='artifact'){
          for(let i=0;i<5;i++){const gem=add(new PIXI.Graphics().roundRect(-3,-3,6,6,1).fill({color:i%2?color:0xffffff,alpha:.84}));gem.rotation=Math.PI*.25;gem._theta=(Math.PI*2*i)/5;gem._kind='artifactHit';gem._lane=i;}
        }else if(dao==='formation'){
          const seal=add(new PIXI.Graphics().roundRect(-22,-22,44,44,3).stroke({color,width:strong?3:2,alpha:.78}));seal.rotation=Math.PI*.25;seal._kind='seal';
          for(let i=0;i<4;i++){const ray=add(createRay(PIXI,i===0?0xffffff:color,{length:strong?46:34,width:1.8,alpha:.62}));ray.rotation=i*Math.PI*.5;ray._kind='sealRay';}
        }else if(dao==='mind'){
          for(let i=0;i<3;i++){const wave=add(createRing(PIXI,i===0?0xffffff:color,{radius:strong?20+i*8:15+i*6,width:1.6,alpha:.58}));wave.scale.set(.38,.38);wave._kind='mindBurst';wave._lane=i;}
          const needle=add(createRay(PIXI,0xffffff,{length:strong?58:42,width:1.4,alpha:.9}));needle.rotation=.06;needle._kind='mindPierce';
        }else{
          const count=strong?9:6;for(let i=0;i<count;i++){const ray=add(createRay(PIXI,i%3===0?0xffffff:color,{length:strong?42:28,width:2,alpha:.82}));ray.rotation=(Math.PI*2*i)/count;ray._kind='arcaneRay';ray._theta=ray.rotation;}
        }
        const sparks=[];if(profile.particles>0){const sparkCount=strong?10:6;for(let i=0;i<sparkCount;i++){const sp=createDisc(PIXI,i%3===0?0xffffff:color,{radius:strong?2.2:1.5,alpha:.8});sp._theta=(Math.PI*2*i)/sparkCount+(i%2)*.16;sparks.push(sp);root.addChild(sp);}stats.particles+=sparkCount;}
        stats.particles+=motifs.length;
        if(target==='enemy')enemyFlashUntil=Math.max(enemyFlashUntil,elapsed+(strong?.16:.1));else playerFlashUntil=Math.max(playerFlashUntil,elapsed+(strong?.16:.1));
        stats.impacts+=1;
        const cameraStrength=camera==='heavy'?8:camera==='medium'?5.5:camera==='light'?3:0;
        if(cameraStrength>0&&profile.shake>0){cameraImpulse.started=elapsed;cameraImpulse.duration=camera==='heavy'?.24:camera==='medium'?.19:.13;cameraImpulse.strength=cameraStrength*profile.shake;cameraImpulse.seed=stats.events+1;stats.camera+=1;}
        if(profile.flash>0){screenFlash.started=elapsed;screenFlash.duration=strong?.11:.065;screenFlash.strength=(strong?.24:.12)*profile.flash;}
        const stopSeconds=Math.max(0,Math.min(.11,(Number(hitStopMs)||0)/1000))*Math.max(.45,profile.motion);
        if(stopSeconds>0){hitStopRemaining=Math.max(hitStopRemaining,stopSeconds);stats.hitStops+=1;}
        if(dao==='sword')emitSfxHook('sword.impact',{strong,pattern,target});
        return addEffect(root,{life:strong?.48:.36,type:'impact',update:(item,t)=>{const e=easeOut(t);ring.scale.set(lerp(.25,1.35,e));ring.alpha=(1-t)*.92;core.scale.set(1+pulse(t,.25)*1.4);core.alpha=1-t;
          motifs.forEach((m,i)=>{
            if(m._kind==='slash'){m.position.set(Math.cos(m._theta)*(4+e*18),Math.sin(m._theta)*(4+e*18));m.scale.set(.55+e*.65);m.alpha=1-t;}
            else if(m._kind==='shock'){const k=.3+e*(1.15+m._lane*.18);m.scale.set(k,k*.38);m.alpha=(1-t)*(.72-m._lane*.12);}
            else if(m._kind==='groundShard'){m.position.y=8-e*(strong?35:24)-Math.abs(m._lane)*3;m.position.x=m._lane*(6+e*5);m.alpha=(1-t)*.78;}
            else if(m._kind==='toxic'){const d=e*(strong?58:40);m.position.set(Math.cos(m._theta)*d,Math.sin(m._theta)*d*.65-e*(8+(m._lane%3)*4));m.alpha=(1-t)*.76;}
            else if(m._kind==='artifactHit'){const rr=(1-e)*(strong?34:26)+e*8;const th=m._theta+elapsed*3.2;m.position.set(Math.cos(th)*rr,Math.sin(th)*rr*.58);m.rotation+=.07*profile.motion;m.alpha=(1-t)*.86;}
            else if(m._kind==='seal'){m.scale.set(.5+e*.72);m.rotation+=.035*profile.motion;m.alpha=(1-t)*.8;}
            else if(m._kind==='sealRay'){m.position.set(Math.cos(m.rotation)*e*18,Math.sin(m.rotation)*e*18);m.alpha=(1-t)*.66;}
            else if(m._kind==='mindBurst'){const k=.38+e*(.9+m._lane*.24);m.scale.set(k,k);m.alpha=(1-t)*(.65-m._lane*.1);}
            else if(m._kind==='mindPierce'){m.position.x=lerp(-22,18,e);m.alpha=1-t;}
            else if(m._kind==='arcaneRay'){m.position.set(Math.cos(m._theta)*(8+e*(strong?28:20)),Math.sin(m._theta)*(8+e*(strong?28:20)));m.alpha=1-t;}
          });
          sparks.forEach(sp=>{const d=e*(strong?62:40);sp.position.set(Math.cos(sp._theta)*d,Math.sin(sp._theta)*d*.72);sp.alpha=(1-t)*.8;});
        }});
      };


      const playGoldenSwordSkillPhase=({phase='cast',side='player',target='enemy',skill={}}={})=>{
        const suffix=skillSuffix(skill);if(!GOLDEN_SWORD_G2_SKILLS.has(suffix))return false;
        const color=0xbdeeff;const hot=0xffffff;const start=actorPoint(side,'center'),end=actorPoint(target,'impact');
        const countProfile=profile.particles>=1?1:profile.particles>.4?.78:.58;
        const markHandled=()=>{stats.goldenSwordSkills+=1;setFxTelemetry(stats);return true;};
        if(phase==='impact'){
          emitSfxHook(`sword.${suffix}.impact`,{phase,skillId:skill?.id,target});
          const strong=['break_mark','chain','myriad'].includes(suffix);
          playImpact({target,color,strong,camera:strong?'medium':'light',hitStopMs:strong?64:42,dao:'sword',pattern:`g2-${suffix}`});
          return markHandled();
        }
        if(suffix==='nurture'&&phase==='cast'){
          const root=new PIXI.Container();root.position.set(start.x,start.y+14);fxBack.addChild(root);const blades=[];
          const n=Math.max(3,Math.round(5*countProfile));for(let i=0;i<n;i++){const b=new PIXI.Container();const ray=createRay(PIXI,i===0?hot:color,{length:34,width:i===0?2.3:1.6,alpha:.88});ray.position.x=-17;b.addChild(ray);b._theta=(Math.PI*2*i)/n;blades.push(b);root.addChild(b);}const ring=createRing(PIXI,color,{radius:42,width:1.8,alpha:.52});ring.scale.set(1,.42);root.addChild(ring);
          emitSfxHook('sword.nurture.charge',{phase,skillId:skill?.id});stats.particles+=n;
          addEffect(root,{life:.86,type:'g2-sword-nurture',update:(item,t)=>{const e=easeOut(t);ring.rotation+=.018*profile.motion;ring.alpha=(1-t)*.54;ring.scale.set(1-.28*e,.42-.08*e);blades.forEach((b,i)=>{const th=b._theta+elapsed*(1.25+i*.03);const r=54*(1-e)+18;b.position.set(Math.cos(th)*r,Math.sin(th)*r*.42-18*(1-e));b.rotation=th+Math.PI/2;b.alpha=.42+.58*e;});}});return markHandled();
        }
        if(suffix==='flow_slash'&&phase==='travel'){
          const root=new PIXI.Container();fxFront.addChild(root);const streaks=[];for(let i=0;i<3;i++){const ray=createRay(PIXI,i===0?hot:color,{length:88-i*14,width:i===0?3:1.5,alpha:.92-i*.16});ray.pivot.set(0,1);streaks.push(ray);root.addChild(ray);}emitSfxHook('sword.flow.release',{phase,skillId:skill?.id});stats.particles+=3;
          addEffect(root,{life:.42,type:'g2-sword-flow',update:(item,t)=>{const e=easeOut(t),arc=Math.sin(Math.PI*t)*-18;root.position.set(lerp(start.x,end.x,e),lerp(start.y,end.y,e)+arc);const angle=Math.atan2(end.y-start.y,end.x-start.x);root.rotation=angle;root.alpha=t<.82?1:Math.max(0,1-(t-.82)/.18);streaks.forEach((r,i)=>{r.position.set(-i*10,(i-1)*4);r.scale.set(1+pulse(t,.45)*(.18-i*.03));});}});return markHandled();
        }
        if(suffix==='break_mark'&&(phase==='cast'||phase==='travel')){
          const root=new PIXI.Container();root.position.set(end.x,end.y);fxFront.addChild(root);const outer=new PIXI.Graphics().roundRect(-24,-24,48,48,4).stroke({color,width:2.2,alpha:.75});outer.rotation=Math.PI*.25;root.addChild(outer);const inner=createRing(PIXI,hot,{radius:15,width:1.4,alpha:.65});root.addChild(inner);const needle=createRay(PIXI,hot,{length:phase==='travel'?62:34,width:1.5,alpha:.92});needle.position.set(phase==='travel'?-62:-17,0);root.addChild(needle);emitSfxHook(phase==='cast'?'sword.break_mark.lock':'sword.break_mark.release',{phase,skillId:skill?.id});
          addEffect(root,{life:phase==='cast'?.62:.38,type:'g2-sword-break-mark',update:(item,t)=>{const e=easeOut(t);outer.rotation+=.045*profile.motion;outer.scale.set(.72+e*.35);outer.alpha=(1-t)*.76;inner.scale.set(.6+e*.62);inner.alpha=(1-t)*.68;if(phase==='travel')needle.position.x=lerp(-62,-5,e);needle.alpha=1-t;}});return markHandled();
        }
        if(suffix==='chain'&&phase==='travel'){
          const root=new PIXI.Container();root.position.set(end.x,end.y);fxFront.addChild(root);const slashes=[];const n=Math.max(3,Math.round(5*countProfile));for(let i=0;i<n;i++){const ray=createRay(PIXI,i===n-1?hot:color,{length:58+(i%2)*16,width:i===n-1?3.2:2,alpha:.9});ray.rotation=-.9+i*.38;ray._delay=i*.09;slashes.push(ray);root.addChild(ray);}emitSfxHook('sword.chain.release',{phase,skillId:skill?.id});stats.particles+=n;
          addEffect(root,{life:.66,type:'g2-sword-chain',update:(item,t)=>{slashes.forEach((r,i)=>{const local=clamp01((t-r._delay)/(1-r._delay));const p=pulse(local,.28);r.alpha=local<=0?0:(1-local)*.94;r.scale.set(.45+p*.9);r.position.set(Math.cos(r.rotation)*p*18,Math.sin(r.rotation)*p*18);});}});return markHandled();
        }
        if(suffix==='myriad'&&(phase==='cast'||phase==='travel')){
          const root=new PIXI.Container();fxFront.addChild(root);const blades=[];const n=Math.max(5,Math.round(9*countProfile));for(let i=0;i<n;i++){const b=new PIXI.Container();const ray=createRay(PIXI,i%3===0?hot:color,{length:42+(i%3)*5,width:i%3===0?2.4:1.5,alpha:.9});ray.position.x=-22;b.addChild(ray);b._lane=i-(n-1)/2;b._delay=i*.035;blades.push(b);root.addChild(b);}emitSfxHook(phase==='cast'?'sword.myriad.gather':'sword.myriad.rain',{phase,skillId:skill?.id});stats.projectiles+=phase==='travel'?n:0;stats.volleys+=phase==='travel'?1:0;stats.particles+=n;
          addEffect(root,{life:phase==='cast'?.82:.86,type:'g2-sword-myriad',update:(item,t)=>{blades.forEach((b,i)=>{const lane=b._lane,delay=b._delay;if(phase==='cast'){const e=easeOut(t);b.position.set(end.x+lane*10,end.y-88-Math.abs(lane)*4+Math.sin(elapsed*2+i)*3);b.rotation=Math.PI/2+lane*.025;b.alpha=.25+.65*e;}else{const local=clamp01((t-delay)/(1-delay));const e=easeOut(local);const sx=end.x+lane*10,sy=end.y-98-Math.abs(lane)*5;b.position.set(lerp(sx,end.x+lane*2,e),lerp(sy,end.y+lane*1.5,e));b.rotation=Math.PI/2+lane*.02;b.alpha=local<=0?0:Math.max(0,1-(local-.86)/.14);}});}});return markHandled();
        }
        return false;
      };

      const playSwordCore=({side='player',strong=false,life=5}={})=>{
        const root=new PIXI.Container();fxBack.addChild(root);
        const count=strong?7:5;const blades=[];
        for(let i=0;i<count;i++){
          const blade=new PIXI.Container();
          const edge=createRay(PIXI,i===Math.floor(count/2)?0xffffff:0xbdeeff,{length:strong?50:40,width:i===Math.floor(count/2)?2.6:1.7,alpha:.9});
          edge.position.x=-(strong?25:20);blade.addChild(edge);const glow=createRay(PIXI,0x79cfff,{length:strong?58:47,width:1,alpha:.34});glow.position.set(-(strong?29:23.5),3);blade.addChild(glow);blade.rotation=-Math.PI/2;blade._lane=i-(count-1)/2;blade._phase=i*.73;blades.push(blade);root.addChild(blade);
        }
        stats.fields+=1;stats.particles+=count;
        return addEffect(root,{life:Math.max(1.5,Number(life)||5),type:'sword-core',update:(item,t)=>{
          const p=actorPoint(side,'center');root.position.set(p.x,p.y+8);
          const appear=Math.min(1,t/.12),fade=t>.82?Math.max(0,1-(t-.82)/.18):1;root.alpha=appear*fade;
          blades.forEach((blade,i)=>{
            const lane=blade._lane;const theta=-Math.PI/2+lane*.18+Math.sin(elapsed*.92+blade._phase)*.035;
            const radius=(strong?58:48)+Math.abs(lane)*5;const drift=Math.sin(elapsed*1.65+blade._phase);
            blade.position.set(Math.cos(theta)*radius+drift*2.2,Math.sin(theta)*radius*.52-18-Math.abs(lane)*3+Math.sin(elapsed*1.35+i)*2.4);
            blade.rotation=theta+Math.PI/2+.07*Math.sin(elapsed*1.45+blade._phase);
            const k=.9+.07*Math.sin(elapsed*1.8+i);blade.scale.set(k);blade.alpha=.72+.22*(.5+.5*Math.sin(elapsed*1.55+blade._phase));
          });
        }});
      };

      const playGoldenSwordUltimate=({side='player',target='enemy'}={})=>{
        try{document.body.dataset.combatPixiGoldenSword='g2';}catch{}
        const root=new PIXI.Container();fxFront.addChild(root);
        const bladeCount=profile.particles>=1?12:8;const blades=[];
        for(let i=0;i<bladeCount;i++){
          const blade=new PIXI.Container();
          const main=createRay(PIXI,i%3===0?0xffffff:0xbdeeff,{length:54,width:i%3===0?2.8:1.9,alpha:.96});main.position.x=-27;blade.addChild(main);
          const glow=createRay(PIXI,0x79cfff,{length:64,width:1.1,alpha:.58});glow.position.set(-34,4);blade.addChild(glow);
          blade._lane=i-(bladeCount-1)/2;blade._delay=i*.035;blades.push(blade);root.addChild(blade);
        }
        const playerRing=createRing(PIXI,0xbdeeff,{radius:52,width:2.4,alpha:.7});playerRing.scale.set(1,.38);root.addChild(playerRing);
        const targetRing=createRing(PIXI,0xffffff,{radius:34,width:2.2,alpha:.62});targetRing.scale.set(.25,.1);root.addChild(targetRing);
        const crown=createRing(PIXI,0xffffff,{radius:26,width:1.4,alpha:.42});root.addChild(crown);
        stats.volleys+=1;stats.projectiles+=bladeCount;stats.fields+=1;stats.particles+=bladeCount;emitSfxHook('sword.ultimate.gather',{skillId:'skill.dao.sword.ultimate'});
        return addEffect(root,{life:1.92,type:'golden-sword-ultimate',update:(item,t)=>{
          const start=actorPoint(side,'center'),end=actorPoint(target,'impact'),ground=actorPoint(side,'ground');
          playerRing.position.set(ground.x,ground.y);playerRing.rotation+=.028*profile.motion;playerRing.alpha=(1-t)*.72;playerRing.scale.set(1+.18*Math.sin(elapsed*2.4),.38+.04*Math.sin(elapsed*2.4));
          crown.position.set(start.x,start.y-22);crown.rotation-=.04*profile.motion;crown.scale.set(.65+pulse(t,.28)*.9,.3+pulse(t,.28)*.35);crown.alpha=t<.54?(1-t*.7)*.52:Math.max(0,1-(t-.54)/.18)*.52;
          targetRing.position.set(end.x,end.y);const hitPulse=clamp01((t-.68)/.16);targetRing.scale.set(.25+hitPulse*1.45,.1+hitPulse*.55);targetRing.alpha=t<.62?0:(1-t)*.9;
          blades.forEach((blade,i)=>{
            const lane=blade._lane,delay=blade._delay;
            if(t<.34+delay){
              const gather=easeOut(clamp01(t/(.34+delay)));
              const theta=-Math.PI/2+lane*.115;
              const rr=58+Math.abs(lane)*4;
              blade.position.set(start.x+Math.cos(theta)*rr,start.y-12+Math.sin(theta)*rr*.5*(.65+.35*gather));
              blade.rotation=theta+Math.PI/2;blade.alpha=.35+.65*gather;
              return;
            }
            const flight=clamp01((t-(.34+delay))/.46);const e=easeOut(flight);
            const sx=start.x+lane*5,sy=start.y-38-Math.abs(lane)*2;
            const ex=end.x+lane*2,ey=end.y+lane*1.4;
            blade.position.set(lerp(sx,ex,e),lerp(sy,ey,e)-Math.sin(Math.PI*e)*(26+Math.abs(lane)*2));
            blade.rotation=Math.atan2(ey-sy,ex-sx);blade.alpha=flight>=1?Math.max(0,1-(flight-1)*8):1;
          });
          if(t>=.70&&!item._hit){
            item._hit=true;enemyFlashUntil=Math.max(enemyFlashUntil,elapsed+.2);
            cameraImpulse.started=elapsed;cameraImpulse.duration=.28;cameraImpulse.strength=8.5*profile.shake;cameraImpulse.seed=stats.events+17;stats.camera+=1;
            screenFlash.started=elapsed;screenFlash.duration=.13;screenFlash.strength=.28*profile.flash;stats.impacts+=1;hitStopRemaining=Math.max(hitStopRemaining,.09*Math.max(.45,profile.motion));stats.hitStops+=1;emitSfxHook('sword.ultimate.impact',{target});setFxTelemetry(stats);
          }
        }});
      };

      const playCombatFx=event=>{
        if(fxPaused||profile.motion<=0)return false;
        const type=String(event?.type||event?.phase||'').toLowerCase();
        const side=event?.side==='enemy'?'enemy':'player';const target=event?.target==='player'?'player':'enemy';
        const skill=event?.skill||{};const fallbackDao=String(event?.fallbackDao||'spell');
        const recipe=fxRecipeForSkill(skill,fallbackDao);const kind=String(event?.kind||event?.delivery||'');
        const color=colorFor({kind,skill,fallbackDao});const strong=Boolean(event?.strong||recipe.heavy||recipe.ultimate);
        stats.events+=1;
        const g2Phase=['cast','travel','impact'].includes(type)?type:'';
        if(recipe.dao==='sword'&&g2Phase&&playGoldenSwordSkillPhase({phase:g2Phase,side,target,skill})){setFxTelemetry(stats);return true;}
        let handled=false;
        if(type==='cast'){
          if(recipe.field||recipe.support||['formation','artifact','mind','poison'].includes(recipe.dao)&&/field|mist|orbit|formation|mind-field|summon/.test(recipe.pattern))handled=playField({side,color,strong,dao:recipe.dao,pattern:recipe.pattern,support:recipe.support});
          else handled=playCast({side,color,strong,ultimate:false,dao:recipe.dao,pattern:recipe.pattern});
        }
        else if(type==='field')handled=playField({side,color,strong,ultimate:false,dao:recipe.dao,pattern:recipe.pattern,support:recipe.support});
        else if(type==='ultimate'){const a=playCast({side,color,strong:true,ultimate:true,dao:recipe.dao,pattern:recipe.pattern});const b=playField({side,color,strong:true,ultimate:true,dao:recipe.dao,pattern:recipe.pattern,support:recipe.support});handled=Boolean(a||b);}
        else if(type==='sword-core')handled=playSwordCore({side,strong:Boolean(event?.strong),life:Number(event?.life)||5});
        else if(type==='golden-sword-ultimate'){const a=playGoldenSwordUltimate({side,target:event?.target==='player'?'player':'enemy'});const b=playField({side,color:0xbdeeff,strong:true,ultimate:true,dao:'sword',pattern:'sword-domain',support:false});handled=Boolean(a||b);}
        else if(type==='travel'||type==='phase-travel'||type==='phase-impact')handled=true;
        else if(type==='projectile')handled=(Number(event?.shots||recipe.shots)>1||/volley|rain|swarm|split|multi|orb-volley/.test(recipe.pattern))?playVolley({side,kind,color,strong,shots:event?.shots||recipe.shots,pattern:recipe.pattern,dao:recipe.dao}):playProjectile({side,kind,color,strong,shots:1,pattern:recipe.pattern,dao:recipe.dao});
        else if(type==='slash'||type==='sword')handled=playSlash({side,color,strong});
        else if(type==='lightning')handled=playLightning({target:event?.target||otherSide(side),color,strong});
        else if(type==='impact')handled=playImpact({target,color,strong,camera:event?.camera||recipe.camera,hitStopMs:event?.hitStopMs||recipe.hitStopMs,dao:recipe.dao,pattern:recipe.pattern});
        if(handled)setFxTelemetry(stats);return Boolean(handled);
      };
      session.playCombatFx=playCombatFx;
      session.setCombatFxState=state=>{fxPaused=Boolean(state?.paused);fxSpeed=1;if(fxPaused)clearEffects();return true;};
      const playSwordQiDelta=(delta=0)=>{
        if(!delta||profile.motion<=0)return false;const p=actorPoint('player','center');const root=new PIXI.Container();root.position.set(p.x,p.y+4);fxFront.addChild(root);const ring=createRing(PIXI,delta>0?0xbdeeff:0xffffff,{radius:34,width:2,alpha:.62});ring.scale.set(.55,.28);root.addChild(ring);const sparks=[];const n=Math.max(3,Math.round((delta>0?6:4)*Math.max(.55,profile.particles)));for(let i=0;i<n;i++){const sp=createDisc(PIXI,i%2?0xbdeeff:0xffffff,{radius:1.5,alpha:.72});sp._theta=(Math.PI*2*i)/n;sparks.push(sp);root.addChild(sp);}stats.swordBursts+=1;stats.particles+=n;emitSfxHook(delta>0?'sword.qi.gain':'sword.qi.spend',{delta});
        return addEffect(root,{life:.46,type:'sword-qi-delta',update:(item,t)=>{const e=easeOut(t);ring.scale.set(.55+e*.75,.28+e*.34);ring.alpha=(1-t)*.62;sparks.forEach(sp=>{const r=10+e*(delta>0?38:24);sp.position.set(Math.cos(sp._theta)*r,Math.sin(sp._theta)*r*.6);sp.alpha=(1-t)*.72;});}});
      };
      const rebuildSwordQiVisual=()=>{
        const old=swordQiLayer.removeChildren?.()||[];for(const node of old)node?.destroy?.({children:true});
        const count=Math.max(0,Math.min(7,Math.floor(Number(swordQiValue)||0)));
        for(let i=0;i<count;i++){
          const blade=new PIXI.Container();
          const main=createRay(PIXI,i===Math.floor(count/2)?0xffffff:0xbdeeff,{length:34,width:i===Math.floor(count/2)?2.2:1.5,alpha:.9});main.position.x=-17;blade.addChild(main);const glow=createRay(PIXI,0x79cfff,{length:41,width:.9,alpha:.3});glow.position.set(-20.5,3);blade.addChild(glow);blade._lane=i-(count-1)/2;blade._phase=i*.83;swordQiLayer.addChild(blade);
        }
        swordQiLayer.visible=count>0;
      };
      session.setSwordQiVisual=state=>{
        const prev=swordQiValue;swordQiValue=Math.max(0,Number(state?.value)||0);swordQiMax=Math.max(1,Number(state?.max)||5);rebuildSwordQiVisual();if(Math.floor(prev)!==Math.floor(swordQiValue))playSwordQiDelta(swordQiValue-prev);
        try{document.body.dataset.combatPixiSwordQi=String(Math.floor(swordQiValue));document.body.dataset.combatPixiSwordQiMax=String(Math.floor(swordQiMax));}catch{}
        return true;
      };

      session.setCombatEnemyAsset=async path=>{
        if(!path)return false;
        const texture=await session.loadAsset(path);
        if(!session.isCurrent()||!texture)return false;
        enemyTexture=texture;enemy.texture=texture;return true;
      };

      const layout=()=>{
        playerAnchor=measureHybridDomAnchor(host,playerDom);
        enemyAnchor=measureHybridDomAnchor(host,enemyDom);
        flashSprite.width=Math.max(1,app.screen.width);flashSprite.height=Math.max(1,app.screen.height);
      };
      const renderSwordQi=()=>{
        if(!playerAnchor||!swordQiLayer.visible)return;
        const p=actorPoint('player','center');swordQiLayer.position.set(p.x,p.y+8);
        const count=swordQiLayer.children.length;
        swordQiLayer.children.forEach((blade,i)=>{
          const lane=Number(blade._lane)||0;const phase=Number(blade._phase)||0;const theta=-Math.PI/2+lane*.175+Math.sin(elapsed*.85+phase)*.032;const rr=46+Math.abs(lane)*4;const drift=Math.sin(elapsed*1.35+phase);
          blade.position.set(Math.cos(theta)*rr+drift*2.4,Math.sin(theta)*rr*.5-18-Math.abs(lane)*2+Math.sin(elapsed*1.18+i)*2.2);
          blade.rotation=theta+Math.PI/2+.055*Math.sin(elapsed*1.3+phase);const depth=.88+.08*(.5+.5*Math.sin(elapsed*.9+phase));blade.scale.set(depth);blade.alpha=.62+.3*(.5+.5*Math.sin(elapsed*1.15+phase));
        });
      };
      const renderActors=()=>{
        if(!playerAnchor||!enemyAnchor)return;
        const nextPlayerState=actorStateKey(playerDom),nextEnemyState=actorStateKey(enemyDom);
        if(nextPlayerState!==playerState){playerState=nextPlayerState;playerStateAt=elapsed;}
        if(nextEnemyState!==enemyState){enemyState=nextEnemyState;enemyStateAt=elapsed;}

        const pose=poseFromDom(playerDom);
        const playerTexture=textures.get(poses[pose])||fallbackPlayer;
        if(playerTexture!==lastPlayerTexture){playerGhost.texture=lastPlayerTexture;poseBlendAt=elapsed;lastPlayerTexture=playerTexture;stats.poseBlends+=1;setFxTelemetry(stats);}
        const idle=pose==='idle';
        const bob=idle&&profile.motion?Math.sin(elapsed*1.8)*1.4*profile.motion:0;
        const pm=actorMotion(playerDom,elapsed-playerStateAt,profile.motion,false);
        const playerTint=elapsed<playerFlashUntil?0xffe7a3:0xffffff;const blend=clamp01((elapsed-poseBlendAt)/poseBlendLife);const blendIn=easeOut(blend);
        applySpriteFit(player,playerTexture,playerAnchor,{mirror:mirrorPlayer,scale:playerScale*pm.scale,offsetX,offsetY,bob,dx:pm.dx,dy:pm.dy,alpha:pm.alpha*(.28+.72*blendIn),tint:playerTint});
        if(blend<1){applySpriteFit(playerGhost,playerGhost.texture,playerAnchor,{mirror:mirrorPlayer,scale:playerScale*pm.scale*(1.01-.01*blend),offsetX,offsetY,bob,dx:pm.dx-2*(1-blend)*(mirrorPlayer?-1:1),dy:pm.dy,alpha:pm.alpha*(1-blend)*.62,tint:playerTint});}else playerGhost.alpha=0;

        const em=actorMotion(enemyDom,elapsed-enemyStateAt,profile.motion,true);
        const boss=bossVisualState(enemyDom,elapsed,profile.motion);
        const enemyTint=elapsed<enemyFlashUntil?0xffdf9a:boss.tint;
        applySpriteFit(enemy,enemyTexture,enemyAnchor,{scale:em.scale*boss.scale,dx:em.dx+boss.dx,dy:em.dy+boss.dy,alpha:Math.min(em.alpha,boss.alpha),tint:enemyTint});
        renderSwordQi();
      };
      const renderFx=(dt)=>{
        if(fxPaused){camera.position.set(0,0);flashSprite.alpha=0;return;}
        for(let i=effects.length-1;i>=0;i--){
          const item=effects[i];item.age+=dt*Math.max(.5,fxSpeed);const t=clamp01(item.age/item.life);
          try{item.update?.(item,t);}catch{}
          if(t>=1){removeEffect(item);effects.splice(i,1);}
        }
        stats.active=effects.length;
        const camAge=elapsed-cameraImpulse.started;
        if(cameraImpulse.duration>0&&camAge>=0&&camAge<cameraImpulse.duration){
          const t=camAge/cameraImpulse.duration,fade=1-t;const phase=(elapsed*93+cameraImpulse.seed*7.17);
          camera.position.set(Math.sin(phase)*cameraImpulse.strength*fade,Math.cos(phase*1.37)*cameraImpulse.strength*.62*fade);
        }else camera.position.set(0,0);
        const flashAge=elapsed-screenFlash.started;
        if(screenFlash.duration>0&&flashAge>=0&&flashAge<screenFlash.duration)flashSprite.alpha=screenFlash.strength*(1-flashAge/screenFlash.duration);else flashSprite.alpha=0;
      };

      session.combatLayout=()=>{layout();renderActors();};
      session.observeResize(session.combatLayout);
      layout();renderActors();setFxTelemetry(stats);
      session.addTicker(ticker=>{
        const dt=Math.min(.05,Math.max(.001,(ticker.deltaMS||16.7)/1000));
        if(hitStopRemaining>0){hitStopRemaining=Math.max(0,hitStopRemaining-dt);renderActors();return;}
        elapsed+=dt;renderActors();renderFx(dt);
      });
    },
  });
}
