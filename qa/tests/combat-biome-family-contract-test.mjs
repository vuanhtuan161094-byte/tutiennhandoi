import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildCombatAssetManifest} from '../../tools/godot/Build-CombatAssetManifest.mjs';
const source=JSON.parse(readFileSync(new URL('../../godot/data/combat_biome_families.json',import.meta.url),'utf8'));
const catalog=buildCombatAssetManifest(source);
assert.equal(Object.keys(catalog.biomes).length,28);
assert.equal(Object.keys(catalog.biomeFamilies).length,8);
const missing=structuredClone(source);
delete missing.mapping['Thanh Hư Sơn Mạch'];
assert.throws(()=>buildCombatAssetManifest(missing),/Every canonical biome/);
const unknown=structuredClone(source);
unknown.mapping['Thanh Hư Sơn Mạch']='unmapped';
assert.throws(()=>buildCombatAssetManifest(unknown));
for(const row of [...Object.values(catalog.zones),...Object.values(catalog.elements)]) {
  assert.ok(!Object.keys(row).some(key=>/path|layer/i.test(key)));
}
console.log('COMBAT BIOME FAMILY CONTRACT: PASS (28 mappings; missing/unknown rejected; metadata only)');
