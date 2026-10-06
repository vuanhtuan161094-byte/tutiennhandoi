import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildRegistry } from '../../dist/content/registry.js';
import { realmMapDefinitionForFloor, availableRealmMaps } from '../../dist/content/realm-maps.js';
import { endlessHuntArchetypes } from '../../dist/content/endless-hunt.js';

export function buildCombatAssetManifest() {
  const accents = { sword:'75c7cc', fist:'d3a46b', body:'b7b58c', spell:'92abd8', poison:'8bb87c', formation:'c5a36c', artifact:'88c9bb', mind:'b49cca' };
  const root = 'res://art/approved/combat';
  // The canonical map API clamps supported progression; one biome per major.
  const biomes = {};
  for (const map of availableRealmMaps(Number.MAX_SAFE_INTEGER).filter(map=>map.zone===1)) {
    const index=map.majorRealmIndex;
    biomes[String(index)] = { id:`biome.major.${index}`, majorRealmIndex:index, realmName:map.realmName, biomeName:map.biomeName,
      baseBackgroundPath:`${root}/battlefields/major-${index}/base.webp`, backgroundLayers:[], foregroundLayers:[],
      fallbackKey:'mountain-shell', tint:'193e43' };
  }
  const zones = {};
  for (let zone = 1; zone <= 8; zone++) {
    const map = realmMapDefinitionForFloor((zone - 1) * 100 + 1);
    zones[String(zone)] = { id:`zone.${zone}`, zone, zoneName:map.zoneName,
      layerPath:`${root}/battlefields/zones/zone-${zone}.webp`, intensity:(zone - 1) / 7, fallbackKey:'ground-ring' };
  }
  const colors = { Wood:'799b83', Fire:'ae7464', Earth:'af9975', Metal:'bdc3bd', Water:'75a9c1' };
  const elements = Object.fromEntries(Object.entries(colors).map(([id,tint])=>[id,{id,layerPath:`${root}/battlefields/elements/${id.toLowerCase()}.webp`,tint,vfxHint:'none',fallbackKey:'static-tint'}]));
  const enemies = Object.fromEntries([...endlessHuntArchetypes.map(a=>a.id),'generic'].map((id,index)=>[id,{
    id, spritePath:`${root}/enemies/${id}/actor.webp`, shadowPath:'', fallbackKey:id,
    layout:{scale:1}, anchors:{impact:[0.5,0.5],ground:[0.5,0.9]}, accent:colors.Wood, glyphIndex:index,
  }]));
  const families = Object.fromEntries(Object.entries(accents).map(([daoId,accent],index)=>[daoId,{
    daoId, accent, fallbackKey:`dao.${daoId}`, glyphIndex:index, iconPath:`${root}/skills/${daoId}/fallback.webp`,
  }]));
  const skills = {};
  for (const skill of buildRegistry().skills.values()) {
    const daoId = skill.runtimeV117?.daoBinding;
    if (!families[daoId]) continue;
    const category = skill.runtimeV117.slotClass;
    skills[skill.id] = { daoId, skillId:skill.id, category, iconPath:`${root}/skills/${daoId}/${skill.id}.webp`,
      fallbackKey:families[daoId].fallbackKey, accent:accents[daoId], glyphIndex:families[daoId].glyphIndex };
  }
  assert.equal(Object.keys(skills).length,80);
  for(const daoId of Object.keys(families)) {
    const rows=Object.values(skills).filter(s=>s.daoId===daoId);
    assert.equal(rows.filter(s=>s.category==='basic').length,1);
    assert.equal(rows.filter(s=>s.category==='active').length,8);
    assert.equal(rows.filter(s=>s.category==='ultimate').length,1);
  }
  return { schema:'combat-asset-manifest.v1', biomes,zones,elements,enemies,families,skills,
    generic:{ id:'generic', iconPath:'', fallbackKey:'generic', accent:'819b9f', glyphIndex:8, category:'active' } };
}

if(process.argv[1]===fileURLToPath(import.meta.url)) {
  const target=new URL('../../godot/data/combat_asset_manifest.json',import.meta.url);
  const data=JSON.stringify(buildCombatAssetManifest(),null,2)+'\n';
  if(process.argv.includes('--check')) assert.equal(readFileSync(target,'utf8').replace(/\r\n/g,'\n'),data,'Canonical catalog drift: regenerate combat manifest');
  else { mkdirSync(new URL('../../godot/data/',import.meta.url),{recursive:true}); writeFileSync(target,data); }
  console.log('COMBAT ASSET MANIFEST: PASS');
}
