/* Combat Readability Target V1 — orchestration-only bridge.
   Canonical Boss/challenge/farm data comes from Combat Presentation Model V1.
   This file owns lifecycle + transient visual observation only; DOM mutation lives in the renderer. */
(() => {
  const COMBAT_PRESENTATION_EVENT='tutien:combat-presentation';
  const params=(()=>{try{return new URLSearchParams(location.search);}catch{return new URLSearchParams();}})();
  const devMode=params.get('dev')==='1'||globalThis.__TUTIEN_DEV_FORCE__===true;
  const toolsOptIn=params.get('tools')==='1'||params.get('devtools')==='1';
  const animeOptIn=params.get('anime')==='1'||(devMode&&toolsOptIn);
  let activeScreen=null,activeObserver=null,shellObserver=null,scheduled=false,rendererPromise=null;

  function bootPresentationTools(){
    if(animeOptIn)import('./modules/combat-motion-anime-v1.js').then(mod=>mod.initCombatAnimeMotionV1?.()).catch(()=>{try{document.body.dataset.combatMotionEngine='css-fallback';}catch{}});
    if(devMode&&toolsOptIn)import('./modules/dev-third-party-tools-v1.js').then(mod=>mod.initDevThirdPartyToolsV1?.()).catch(()=>{try{document.body.dataset.devThirdPartyTools='fallback';}catch{}});
  }
  function renderer(){return rendererPromise||(rendererPromise=import('./modules/combat-dom-renderer-v1.js'));}
  function presentationModel(){try{return globalThis.__TUTIEN_COMBAT_PRESENTATION_MODEL_V1__||null;}catch{return null;}}
  function transientModel(screen){
    const stage=screen?.querySelector('#huntV2Stage, .huntv2-stage');if(!stage)return {criticalSignal:false,engaged:false};
    const criticalSignal=Boolean(screen.querySelector('.huntv2-stage-boss-telegraph.visible, .huntv2-stage-boss-telegraph.show, .huntv2-enemy-intent.visible, .huntv2-enemy-intent.show, .huntv2-break-window.visible, .huntv2-break-window.show, .huntv2-stage-skill-callout.visible, .huntv2-skill-callout.show'));
    const transientSignal=Boolean(screen.querySelector('.huntv2-float.show, .huntv2-status-callout.show, .huntv2-result-pop.show'));
    return {criticalSignal,engaged:screen.classList.contains('is-active-combat')||stage.classList.contains('presentation-active')||criticalSignal||transientSignal};
  }

  const scheduleSync=()=>{
    if(scheduled||!activeScreen)return;scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;const screen=activeScreen,model=presentationModel();if(!screen?.isConnected||!model)return;renderer().then(mod=>{if(screen===activeScreen&&screen.isConnected)mod.renderCombatPresentationV1?.(screen,model,transientModel(screen));}).catch(()=>{});});
  };
  function detachCombatScreen(){if(activeScreen)activeScreen.removeEventListener(COMBAT_PRESENTATION_EVENT,scheduleSync);activeObserver?.disconnect();activeObserver=null;activeScreen=null;scheduled=false;}
  function attachCombatScreen(screen){if(screen===activeScreen)return;detachCombatScreen();if(!screen)return;activeScreen=screen;activeScreen.addEventListener(COMBAT_PRESENTATION_EVENT,scheduleSync);activeObserver=new MutationObserver(scheduleSync);activeObserver.observe(activeScreen,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden','data-boss-phase']});scheduleSync();}
  function refreshCombatMount(){const content=document.querySelector('#content');const next=content?.querySelector('.huntv2-screen')||null;if(next!==activeScreen)attachCombatScreen(next);}
  function destroy(){shellObserver?.disconnect();shellObserver=null;detachCombatScreen();}
  function start(){const content=document.querySelector('#content');if(!content)return;bootPresentationTools();shellObserver=new MutationObserver(refreshCombatMount);shellObserver.observe(content,{childList:true});refreshCombatMount();addEventListener('pagehide',destroy,{once:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
