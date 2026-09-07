import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
let pass=0;
const ok=(name,fn)=>{fn();pass++;console.log(`PASS ${String(pass).padStart(2,'0')} ${name}`)};
const app=read('app.js');
const runtime=read('standalone-runtime.js');

function staticImportSpecs(src){
  const out=[];
  const re=/(?:^|\n)\s*import\s+(?:[^'"\n]*?\s+from\s+)?['"]([^'"]+)['"]/g;
  let m;while((m=re.exec(src)))out.push(m[1]);
  return out;
}
function staticGraph(entries){
  const seen=new Set(),stack=entries.map(x=>path.join(root,x));
  while(stack.length){
    const file=path.resolve(stack.pop());
    if(seen.has(file)||!fs.existsSync(file))continue;
    seen.add(file);
    const src=fs.readFileSync(file,'utf8');
    for(const spec of staticImportSpecs(src)){
      if(!spec.startsWith('.'))continue;
      let target=path.resolve(path.dirname(file),spec);
      if(!path.extname(target))target+='.js';
      stack.push(target);
    }
  }
  return [...seen];
}

ok('production runtime creates only one eager LocalWebGameRuntime',()=>{
  assert.match(runtime,/const runtime=new LocalWebGameRuntime\(\);\s*let devRuntime=null;/s);
  assert.doesNotMatch(runtime,/const devRuntime=new LocalWebGameRuntime\(\)/);
});
ok('DEV runtime is lazy-created only through runtimeFor(dev)',()=>{
  assert.match(runtime,/function runtimeFor\(dev=false\)[\s\S]*if\(!devRuntime\)devRuntime=new LocalWebGameRuntime\(\)/);
  assert.match(runtime,/const rt=runtimeFor\(dev\);/);
});
ok('background heartbeat is adaptive and skips absent DEV runtime',()=>{assert.match(runtime,/runtimeHeartbeatDelayV129\(\)/);assert.match(runtime,/document\?\.hidden\?5000:1000/);assert.match(runtime,/setTimeout\(\(\)=>\{/);assert.match(runtime,/if\(devRuntime\)devRuntime\.maybeTick\(\)/);assert.doesNotMatch(runtime,/setInterval\(\(\)=>\{runtime\.maybeTick/);});
ok('Hunt presentation is not a static app import',()=>assert.doesNotMatch(app,/^import[^\n]*hunt-combat-v2\.js/m));
ok('DongFu Pixi is not a static app import',()=>assert.doesNotMatch(app,/^import[^\n]*dongfu-pixi-scene-v139\.js/m));
ok('Hunt presentation is route-lazy imported',()=>assert.match(app,/import\('\.\/modules\/hunt-combat-v2\.js'\)/));
ok('DongFu Pixi is route-lazy imported',()=>assert.match(app,/import\('\.\/modules\/dongfu-pixi-scene-v139\.js'\)/));
const graph=staticGraph(['standalone-runtime.js','app.js']);
const rel=graph.map(f=>path.relative(root,f).replaceAll('\\','/'));
const bytes=graph.reduce((n,f)=>n+fs.statSync(f).size,0);
ok('initial static graph excludes Hunt module',()=>assert.ok(!rel.includes('modules/hunt-combat-v2.js')));
ok('initial static graph excludes DongFu Pixi module',()=>assert.ok(!rel.includes('modules/dongfu-pixi-scene-v139.js')));
ok('initial static graph stays under 4.40 MiB',()=>assert.ok(bytes<=4.40*1024*1024,`initial graph ${(bytes/1024/1024).toFixed(2)} MiB`));
// V142 deliberately decomposes the equipment economy into five small domain modules
// (ranked fragments, Hunt bridge, crafting, Set fragments, dungeon bridge). Keep the
// byte budget unchanged; allow exactly that modularity increase over the V129 baseline.
ok('initial static graph stays at or below 190 modules',()=>assert.ok(graph.length<=190,`initial graph ${graph.length} modules`));
const hunt=await import('../../modules/hunt-combat-v2.js');
const dongfu=await import('../../modules/dongfu-pixi-scene-v139.js');
ok('lazy Hunt module exports full route contract',()=>{for(const k of ['renderHuntCombatV2','mountHuntCombatV2','syncHuntCombatV2','stopHuntCombatV2'])assert.equal(typeof hunt[k],'function',k)});
ok('lazy DongFu module exports full scene contract',()=>{for(const k of ['mountDongFuPixiScene','destroyDongFuPixiScene','updateDongFuPixiSelection','requestDongFuPixiLayout','bindDongFuLayoutEditor'])assert.equal(typeof dongfu[k],'function',k)});
console.log(`V129 FRONTEND PERFORMANCE: ${pass}/${pass} PASS · initial=${graph.length} modules ${(bytes/1024).toFixed(1)} KiB`);