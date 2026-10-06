import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildRegistry } from '../../dist/content/registry.js';
import { realmMapDefinitionForFloor, availableRealmMaps } from '../../dist/content/realm-maps.js';
import { endlessHuntArchetypes } from '../../dist/content/endless-hunt.js';

export function buildCombatAssetManifest(familySource = JSON.parse(readFileSync(new URL('../../godot/data/combat_biome_families.json', import.meta.url), 'utf8'))) {
  const accents = { sword:'75c7cc', fist:'d3a46b', body:'b7b58c', spell:'92abd8', poison:'8bb87c', formation:'c5a36c', artifact:'88c9bb', mind:'b49cca' };
  const root = 'res://art/approved/combat';
  const maps = availableRealmMaps(Number.MAX_SAFE_INTEGER).filter(map=>map.zone===1);
  const canonicalNames = maps.map(map=>map.biomeName).sort();
  assert.deepEqual(Object.keys(familySource.mapping).sort(),canonicalNames,'Every canonical biome must have exactly one explicit family mapping');
  assert.equal(Object.keys(familySource.families).length,8);
  assert.equal(new Set(Object.values(familySource.mapping)).size,8);
  const biomes = {};
  for (const map of maps) {
    const index = map.majorRealmIndex;
    const familyId = familySource.mapping[map.biomeName];
    assert.ok(familySource.families[familyId], 'Unknown biome family: '+familyId);
    assert.equal(familySource.families[familyId].familyId,familyId);
    biomes[String(index)] = {id:`biome.major.${index}`,majorRealmIndex:index,realmName:map.realmName,biomeName:map.biomeName,biomeFamilyId:familyId,biomeVariant:''};
  }
  const zones = {};
  for (let zone = 1; zone <= 8; zone++) {
    const map = realmMapDefinitionForFloor((zone - 1) * 100 + 1);
    zones[String(zone)] = { id:`zone.${zone}`, zone, zoneName:map.zoneName,
      intensityKey:`tier.${zone}`, intensityTier:zone, intensity:(zone - 1) / 7 };
  }
  const colors = { Wood:'799b83', Fire:'ae7464', Earth:'af9975', Metal:'bdc3bd', Water:'75a9c1' };
  const elements = Object.fromEntries(Object.entries(colors).map(([id,elementAccent])=>[id,{id,infoKey:`element.${id.toLowerCase()}`,elementAccent}]));
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
  return { schema:'combat-asset-manifest.v1', biomes,biomeFamilies:familySource.families,genericBiome:familySource.generic,zones,elements,enemies,families,skills,
    generic:{ id:'generic', iconPath:'', fallbackKey:'generic', accent:'819b9f', glyphIndex:8, category:'active' } };
}

if(process.argv[1]===fileURLToPath(import.meta.url)) {
  const target=new URL('../../godot/data/combat_asset_manifest.json',import.meta.url);
  const data=JSON.stringify(buildCombatAssetManifest(),null,2)+'\n';
  if(process.argv.includes('--check')) assert.equal(readFileSync(target,'utf8').replace(/\r\n/g,'\n'),data,'Canonical catalog drift: regenerate combat manifest');
  else { mkdirSync(new URL('../../godot/data/',import.meta.url),{recursive:true}); writeFileSync(target,data); }
  console.log('COMBAT ASSET MANIFEST: PASS');
}
