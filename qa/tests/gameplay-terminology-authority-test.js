import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  FATE_BUILD_DEFINITIONS_V4,
  FATE_BUILD_PATHS_V4,
} from '../../dist/core/reincarnation-fate-build-v4.js';

let passed=0;
const test=(name,fn)=>{fn();passed++;console.log(`✓ ${name}`);};

const authority=fs.readFileSync(new URL('../../docs/runtime/GAMEPLAY_TERMINOLOGY_AUTHORITY_20260929.md',import.meta.url),'utf8');
const barrel=fs.readFileSync(new URL('../../dist/core/reincarnation-fate-build-v4.js',import.meta.url),'utf8');

test('Linh Căn gameplay authority is locked to V145',()=>{
  assert(authority.includes('Live gameplay authority: `dist/core/spiritual-root-v145.js` only.'));
  for(const legacy of ['spiritual-root-progression-v131.js','root-origin-combat-v132.js','spiritual-root-milestones-v133.js']){
    assert(authority.includes(legacy));
  }
  assert(authority.includes('LEGACY / FROZEN COMPATIBILITY ONLY'));
});

test('Mệnh Lộ retains exactly five canonical paths',()=>{
  const expected=[
    ['cultivation','Tu Mệnh'],
    ['combat','Chiến Mệnh'],
    ['body','Thể Mệnh'],
    ['wealth','Tài Mệnh'],
    ['idle','Nhàn Mệnh'],
  ];
  assert.deepEqual(FATE_BUILD_PATHS_V4.map(x=>[x.id,x.name]),expected);
  assert.equal(FATE_BUILD_DEFINITIONS_V4.length,25);
});

test('Mệnh Lộ remains distinct from Mệnh Thai and Mệnh Cách',()=>{
  assert(authority.includes('**Mệnh Lộ**'));
  assert(authority.includes('**Mệnh Thai**'));
  assert(authority.includes('**Mệnh Cách**'));
  assert(barrel.includes('Do not confuse Mệnh Lộ with Mệnh Cách'));
});

test('five Mệnh internal IDs remain compatibility-stable',()=>{
  const starterIds=FATE_BUILD_DEFINITIONS_V4.filter(x=>x.tier==='mortal').map(x=>x.id).sort();
  assert.deepEqual(starterIds,[
    'fate.v4.body.strong_body',
    'fate.v4.combat.fighter',
    'fate.v4.cultivation.diligent',
    'fate.v4.idle.idle_cultivator',
    'fate.v4.wealth.small_fortune',
  ]);
});

console.log(`GAMEPLAY TERMINOLOGY AUTHORITY — ${passed}/${passed} PASS`);
