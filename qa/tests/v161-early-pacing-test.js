import assert from 'node:assert/strict';
import { buildEarlyPacingAuditV161, EARLY_PACING_V161_SCHEMA } from '../../dist/core/early-pacing-v161.js';

let passed=0;
const test=(name,fn)=>{fn();passed++;console.log(`✓ ${name}`)};
const audit=buildEarlyPacingAuditV161();

test('V161 early pacing audit covers the two V160 cliffs',()=>{
  assert.equal(audit.schema,EARLY_PACING_V161_SCHEMA);
  assert.deepEqual(audit.findings.map(x=>x.order),[1,10]);
});

test('V161 Luyện Khí entry stays a short first engagement gate',()=>{
  const row=audit.findings.find(x=>x.id==='qi-entry');
  assert(row.previousDurationRatio>5);
  assert(row.targetMinutes>28&&row.targetMinutes<29);
  assert.deepEqual(row.newSystems.sort(),['dungeons','hunt','social'].sort());
  assert.equal(row.classification,'keep-authored-duration');
});

test('V161 Trúc Cơ preserves cultivation timing but records onboarding density',()=>{
  const row=audit.findings.find(x=>x.id==='foundation-entry');
  assert(row.previousDurationRatio>3);
  assert(row.targetHours>2.6&&row.targetHours<2.8);
  assert.equal(row.majorRealmTotalHours,18);
  assert.equal(row.newSystems.length,6);
  assert(row.newSystems.includes('reincarnation'));
  assert(row.newSystems.includes('collection'));
  assert.equal(row.classification,'keep-duration-sequence-onboarding');
});

test('V161 B2 applies no blind V140 cultivation-number change',()=>{
  assert.match(audit.action,/No V140 cultivation-number change/);
});

console.log('\nV161 EARLY PACING AUDIT');
console.log(JSON.stringify(audit,null,2));
console.log(`\nV161 EARLY PACING — ${passed}/${passed} PASS`);
