import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const roots=['dist','modules','web']; const singles=['app.js','standalone-runtime.js','standalone-entry.js','styles.css'];
const exts=new Set(['.js','.mjs','.html','.css']);
const forbidden=[
 ['foundationQuality',/\bfoundationQuality\b/i],['foundationDamageLevel',/\bfoundationDamageLevel\b/i],['meridianHealth',/\bmeridianHealth\b/i],['impurity state',/\bimpurity\b/i],
 ['breakthroughPreparation',/\bbreakthroughPreparation\b/i],['BreakthroughEngine',/\bBreakthroughEngine\b/],['breakthroughRequirementReductionPct',/\bbreakthroughRequirementReductionPct\b/i],['breakthroughRequirementProfile',/\bbreakthroughRequirementProfile\b/i],
 ['cultivationMethodId',/\bcultivationMethodId\b/i],['setCultivationMethod',/\bsetCultivationMethod\b/i],['useBreakthroughPill',/\buseBreakthroughPill\b/i],['lifespanBurn',/\blifespanBurn(?:edYears)?\b/i],
 ['Thiêu Thọ',/Thiêu Thọ/i],['Tạp Chất',/Tạp Chất/i],['Kinh Mạch',/Kinh Mạch/i],['Phá Cảnh Đan',/Phá Cảnh Đan/i],['Dưỡng Mạch Đan',/Dưỡng Mạch Đan/i],['Bồi Căn Đan',/Bồi Căn Đan/i],['Tịnh Hóa Đan',/Tịnh Hóa Đan/i],
 ['old meridian offline stops',/stopWhenMeridianBelow|stopWhenOverloadAbove/i],['old retreat cycle constant',/RETREAT_CULTIVATION_CYCLES_PER_YEAR/],
];
function filesIn(dir){const out=[];for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())out.push(...filesIn(p));else if(exts.has(path.extname(e.name)))out.push(p);}return out;}
const files=[...roots.flatMap(r=>fs.existsSync(r)?filesIn(r):[]),...singles.filter(fs.existsSync)];
const hits=[];let assertions=0;
for(const file of files){const text=fs.readFileSync(file,'utf8');for(const [label,re] of forbidden){assertions++;if(re.test(text))hits.push(`${file}: ${label}`);}}
assert.deepEqual(hits,[],`legacy cultivation references remain:\n${hits.join('\n')}`);
console.log(`V140 ZERO LEGACY — ${assertions}/${assertions} PASS · files=${files.length}`);
