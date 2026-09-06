const MANIFEST_URL='/assets/runtime/v138/combat-asset-manifest.json';
let manifestPromise=null;

export function loadCombatAssetManifestV138(){
  if(!manifestPromise){
    manifestPromise=fetch(MANIFEST_URL,{cache:'no-store'})
      .then(r=>{if(!r.ok)throw new Error(`Combat asset manifest HTTP ${r.status}`);return r.json();})
      .then(m=>{
        if(!m?.policy?.backendAuthoritative)throw new Error('Invalid combat asset manifest policy');
        if(m?.policy?.runtimeRequiresExplicitProductionApproval!==true)throw new Error('Combat asset approval policy missing');
        return m;
      });
  }
  return manifestPromise;
}

export const isProductionAsset=(entry)=>entry?.assetState==='production';

export function skillVisualById(manifest,skillId){
  return manifest?.skills?.find(x=>x.skillId===skillId)||null;
}

export function statusVisualById(manifest,statusId){
  return manifest?.statuses?.find(x=>x.statusId===statusId)||null;
}

export function bossVisualById(manifest,entityId,{allowFallback=false}={}){
  const entry=manifest?.bosses?.[entityId]||null;
  return entry&&(allowFallback||isProductionAsset(entry))?entry:null;
}

export function daoResourceVisual(manifest,dao,resourceId=''){
  const rows=manifest?.daoResources||[];
  return rows.find(x=>x.dao===dao&&(!resourceId||x.resourceId===resourceId))||rows.find(x=>x.dao===dao)||null;
}

export function resolvedAssetPath(entry,field='iconPath',{allowFallback=true}={}){
  if(isProductionAsset(entry)&&entry?.[field])return entry[field];
  if(!allowFallback)return '';
  return entry?.fallbackIconPath||entry?.fallbackPath||'';
}
