import fs from 'node:fs';

function read(path){return fs.readFileSync(path,'utf8');}
function write(path,text){fs.writeFileSync(path,text);}
function replaceOne(path,from,to,label){
  const src=read(path);
  if(!src.includes(from))throw new Error(`${label}: source anchor not found in ${path}`);
  if(src.indexOf(from)!==src.lastIndexOf(from))throw new Error(`${label}: source anchor is not unique in ${path}`);
  write(path,src.replace(from,to));
}
function replaceRegex(path,re,to,label){
  const src=read(path),matches=[...src.matchAll(new RegExp(re.source,re.flags.includes('g')?re.flags:re.flags+'g'))];
  if(matches.length!==1)throw new Error(`${label}: expected 1 match in ${path}, got ${matches.length}`);
  write(path,src.replace(re,to));
}

const spirit='dist/core/spirit-beast-v147.js';
replaceOne(spirit,
`export const SPIRIT_BEAST_DUPLICATE_FRAGMENT_V147 = 10;\nexport const SPIRIT_BEAST_SPECIES = SPIRIT_BEAST_SPECIES_V147;`,
`export const SPIRIT_BEAST_DUPLICATE_FRAGMENT_V147 = 10;\n// Every owned beast contributes a bounded share of its authored raw HP/Attack/Defense.\n// Percent Linh Khế is handled separately and only applies to the equipped beast.\nexport const SPIRIT_BEAST_COLLECTION_RAW_SHARE_V147 = .10;\nexport const SPIRIT_BEAST_SPECIES = SPIRIT_BEAST_SPECIES_V147;`,
'raw share constant');

replaceRegex(spirit,
/export function spiritBeastBondContributionV147\(species,progress\)\{[\s\S]*?\n\}\nexport function spiritBeastBondSummaryV147\(state\)\{[\s\S]*?\n\}/,
`export function spiritBeastRawContributionV147(species,progress){\n  if(!progress?.owned)return {attackFlat:0,hpFlat:0,defenseFlat:0};\n  const stats=spiritBeastStatsV147(species,progress);\n  return {\n    attackFlat:Math.round(stats.attack*SPIRIT_BEAST_COLLECTION_RAW_SHARE_V147),\n    hpFlat:Math.round(stats.hp*SPIRIT_BEAST_COLLECTION_RAW_SHARE_V147),\n    defenseFlat:Math.round(stats.defense*SPIRIT_BEAST_COLLECTION_RAW_SHARE_V147)\n  };\n}\nexport function spiritBeastBondContributionV147(species,progress){\n  const max=SPIRIT_BEAST_BOND_MAX_BUDGET_V147[species.id]??{powerPct:0,bodyPct:0,defensePct:0};\n  const stars=spiritBeastStarsV147(progress);\n  // Level never increases percentage. 0★ has no Linh Khế percent; 20★ reaches the authored cap.\n  const factor=Math.min(stars/SPIRIT_BEAST_LEGACY_FULL_STAR_V147,1);\n  return {powerPct:Number((max.powerPct*factor).toFixed(3)),bodyPct:Number((max.bodyPct*factor).toFixed(3)),defensePct:Number((max.defensePct*factor).toFixed(3))};\n}\nexport function spiritBeastBondSummaryV147(state){\n  let powerPct=0,bodyPct=0,defensePct=0,attackFlat=0,hpFlat=0,defenseFlat=0,owned=0; const rows=[];\n  for(const species of SPIRIT_BEAST_SPECIES_V147){\n    const p=state?.items?.[species.id]; if(!p?.owned)continue;\n    owned++;\n    const stats=spiritBeastStatsV147(species,p),raw=spiritBeastRawContributionV147(species,p),active=state?.activePetId===species.id;\n    const potentialBond=spiritBeastBondContributionV147(species,p);\n    const bond=active?potentialBond:{powerPct:0,bodyPct:0,defensePct:0};\n    attackFlat+=raw.attackFlat;hpFlat+=raw.hpFlat;defenseFlat+=raw.defenseFlat;\n    powerPct+=bond.powerPct;bodyPct+=bond.bodyPct;defensePct+=bond.defensePct;\n    rows.push({id:species.id,name:species.name,stats,raw,bond,bondPotential:potentialBond,active,level:p.level,stars:spiritBeastStarsV147(p),levelCap:spiritBeastLevelCapV147(p)});\n  }\n  return {schema:SPIRIT_BEAST_SCHEMA_V147,owned,total:SPIRIT_BEAST_SPECIES_V147.length,attackFlat,hpFlat,defenseFlat,powerPct:Number(powerPct.toFixed(3)),bodyPct:Number(bodyPct.toFixed(3)),defensePct:Number(defensePct.toFixed(3)),rows};\n}`,
'active-only bond and collection raw');

replaceRegex(spirit,
/export function spiritBeastViewV147\(state,speciesId\)\{[\s\S]*?\n\}/,
`export function spiritBeastViewV147(state,speciesId){\n  const species=spiritBeastSpeciesV147(speciesId),p=state?.items?.[speciesId]; if(!species)return undefined;\n  const progress=p??{owned:false,level:1,stars:0,specificFragments:0},stars=spiritBeastStarsV147(progress),stats=spiritBeastStatsV147(species,progress),active=state?.activePetId===speciesId;\n  const raw=progress.owned?spiritBeastRawContributionV147(species,progress):{attackFlat:0,hpFlat:0,defenseFlat:0};\n  const bondPotential=progress.owned?spiritBeastBondContributionV147(species,progress):{powerPct:0,bodyPct:0,defensePct:0};\n  const bond=active?bondPotential:{powerPct:0,bodyPct:0,defensePct:0};\n  return {schema:SPIRIT_BEAST_SCHEMA_V147,speciesId:species.id,name:species.name,role:species.role,roleLabel:species.roleLabel,asset:species.asset,stats,raw,bond,bondPotential,levelCap:spiritBeastLevelCapV147(progress),stars,starUpCost:SPIRIT_BEAST_FRAGMENT_PER_STAR_V147,starEssenceCost:spiritBeastStarEssenceCostV147(stars),passive:{...species.passive,unlocked:true},actives:species.actives.map(x=>({...x,unlockBloodline:x.unlockStars,unlocked:stars>=(x.unlockStars??0)})),active};\n}`,
'view effective/potential bond');

const collection='dist/core/collection-progression-v12316.js';
replaceOne(collection,
`    const bond = spiritBeastBondSummaryV86(state);\n    total.powerPct += bond.powerPct;\n    total.bodyPct += bond.bodyPct;\n    total.defensePct += bond.defensePct;`,
`    const bond = spiritBeastBondSummaryV86(state);\n    // V147: every owned beast contributes raw stats; only activePetId contributes percentage Linh Khế.\n    total.attackFlat += bond.attackFlat ?? 0;\n    total.hpFlat += bond.hpFlat ?? 0;\n    total.defenseFlat += bond.defenseFlat ?? 0;\n    total.powerPct += bond.powerPct;\n    total.bodyPct += bond.bodyPct;\n    total.defensePct += bond.defensePct;`,
'collection raw + active percent consumer');

const ui='modules/spirit-beast-ui-v147.js';
replaceOne(ui,
`    .replace(/Huyết Mạch\\s+(\\d+)\\s*\\/\\s*(?:\\d+|Infinity)/g,'$1★');`,
`    .replace(/Huyết Mạch\\s+(\\d+)\\s*\\/\\s*(?:\\d+|Infinity)/g,'$1★')\n    .replace(/Linh Khế luôn có hiệu lực/g,'Linh Khế chỉ có hiệu lực khi Trợ Chiến')\n    .replace(/Kể cả khi không trợ chiến\\.?\\s*Mỗi species chỉ tính một lần\\.?/gi,'Tất cả Linh Thú sở hữu cộng raw; chỉ Linh Thú Trợ Chiến kích hoạt % Linh Khế.');`,
'player-facing active bond wording');

const v147='qa/tests/v147-spirit-beast-progression-test.js';
replaceRegex(v147,
/test\('V147 bond percent budget caps at Lv1000 \+ 20 stars and cannot scale infinitely',[\s\S]*?\n\}\);/,
`test('V147 all owned beasts add raw while only active pet contributes star-derived percentage',()=>{\n  const items=Object.fromEntries(SPIRIT_BEAST_SPECIES.map(x=>[x.id,pet(x.id,{level:1000,stars:20})]));\n  const inactive=spiritBeastBondSummaryV147({items});\n  assert.equal(inactive.owned,8);\n  assert.deepEqual({p:inactive.powerPct,b:inactive.bodyPct,d:inactive.defensePct},{p:0,b:0,d:0});\n  assert.deepEqual({a:inactive.attackFlat,h:inactive.hpFlat,d:inactive.defenseFlat},{a:1685,h:20187,d:1532});\n  const active=spiritBeastBondSummaryV147({items,activePetId:'pet.1'});\n  assert.deepEqual({p:active.powerPct,b:active.bodyPct,d:active.defensePct},{p:5.6,b:2.6,d:2.3});\n  assert.deepEqual({a:active.attackFlat,h:active.hpFlat,d:active.defenseFlat},{a:1685,h:20187,d:1532},'equipping must not double raw');\n});\n\ntest('V147 percentage is star-only: 0★ gives zero and Level cannot inflate Linh Khế',()=>{\n  const species=SPIRIT_BEAST_SPECIES[0];\n  const zero=spiritBeastBondContributionV147(species,pet(species.id,{level:1000,stars:0}));\n  assert.deepEqual(zero,{powerPct:0,bodyPct:0,defensePct:0});\n  const low=spiritBeastBondContributionV147(species,pet(species.id,{level:1,stars:10}));\n  const high=spiritBeastBondContributionV147(species,pet(species.id,{level:50000,stars:10}));\n  assert.deepEqual(low,high);assert.deepEqual(low,{powerPct:2.8,bodyPct:1.3,defensePct:1.15});\n  const capped=spiritBeastBondContributionV147(species,pet(species.id,{level:50000,stars:1000}));\n  assert.deepEqual(capped,{powerPct:5.6,bodyPct:2.6,defensePct:2.3});\n});`,
'V147 bond regression test');
replaceOne(v147,
`  spiritBeastBondSummaryV147,`,
`  spiritBeastBondContributionV147,\n  spiritBeastBondSummaryV147,`,
'V147 bond contribution import');

const statAudit='qa/tests/v129-stat-source-audit-test.js';
replaceRegex(statAudit,
/test\('Owning all eight maxed Linh Thú is a meaningful major-system bond',[\s\S]*?\n\}\);/,
`test('V147 Linh Thú collection gives owned raw but equipped-only percentage',()=>{\n  const items=Object.fromEntries(SPIRIT_BEAST_SPECIES_V86.map(x=>[x.id,{owned:true,level:1000,advance:5,stars:20,spiritBeastV147Migrated:true}]));\n  const inactive=spiritBeastBondSummaryV86({items});\n  assert.equal(inactive.owned,8);\n  assert.equal(inactive.powerPct,0);assert.equal(inactive.bodyPct,0);assert.equal(inactive.defensePct,0);\n  assert.ok(inactive.attackFlat>=1000&&inactive.hpFlat>=10000&&inactive.defenseFlat>=900,'all-owned raw collection must stay meaningful');\n  const active=spiritBeastBondSummaryV86({items,activePetId:'pet.7'});\n  assert.deepEqual({p:active.powerPct,b:active.bodyPct,d:active.defensePct},{p:5.3,b:3.1,d:2.5});\n});`,
'V129 stat source Spirit Beast expectation');

const budget='qa/tests/v129-power-budget-test.js';
replaceRegex(budget,
/test\('Owning all eight max Linh Thú stays in the major 25–35% collection band with identity-weighted budgets',[\s\S]*?\n\}\);/,
`test('V147 Linh Thú power budget separates collection raw from equipped-only percent',()=>{\n  const items=Object.fromEntries(SPIRIT_BEAST_SPECIES_V86.map(x=>[x.id,{owned:true,level:1000,advance:5,stars:20,spiritBeastV147Migrated:true}]));\n  const inactive=spiritBeastBondSummaryV86({items});\n  assert.equal(inactive.owned,8);\n  assert.deepEqual({p:inactive.powerPct,b:inactive.bodyPct,d:inactive.defensePct},{p:0,b:0,d:0});\n  assert.ok(inactive.attackFlat>=1000&&inactive.attackFlat<=2500,`attackFlat=${inactive.attackFlat}`);\n  assert.ok(inactive.hpFlat>=10000&&inactive.hpFlat<=30000,`hpFlat=${inactive.hpFlat}`);\n  assert.ok(inactive.defenseFlat>=900&&inactive.defenseFlat<=2200,`defenseFlat=${inactive.defenseFlat}`);\n  const rows=Object.values(SPIRIT_BEAST_BOND_MAX_BUDGET_V129);\n  assert.ok(new Set(rows.map(x=>`${x.powerPct}/${x.bodyPct}/${x.defensePct}`)).size>=6,'Linh Thú identities must not collapse into one generic bond');\n  for(const pet of SPIRIT_BEAST_SPECIES_V86){\n    const b=spiritBeastBondSummaryV86({items,activePetId:pet.id});\n    const authored=SPIRIT_BEAST_BOND_MAX_BUDGET_V129[pet.id];\n    assert.deepEqual({p:b.powerPct,b:b.bodyPct,d:b.defensePct},{p:authored.powerPct,b:authored.bodyPct,d:authored.defensePct},pet.id);\n    assert.ok(b.powerPct<=6&&b.bodyPct<=6&&b.defensePct<=6,'single equipped pet percentage must remain bounded');\n  }\n});`,
'V129 power budget Spirit Beast expectation');

console.log('V147 active-bond/raw patch applied.');
