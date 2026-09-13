import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const args=new Map();for(let i=2;i<process.argv.length;i+=2)args.set(process.argv[i],process.argv[i+1]);
const baseUrl=String(args.get('--base')||process.env.TUTIEN_VISUAL_BASE_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const outDir=resolve(args.get('--out')||process.env.TUTIEN_VISUAL_OUT_DIR||'artifacts/ui-visual');
const chromePath=args.get('--chrome')||process.env.CHROME_PATH||process.env.GOOGLE_CHROME_BIN||'google-chrome';
const cdpPort=Number(args.get('--cdp-port')||9223);
const profileDir=resolve('.tmp/ui-combat-visual-chrome-profile');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
await mkdir(outDir,{recursive:true});await rm(profileDir,{recursive:true,force:true});await mkdir(profileDir,{recursive:true});
const chrome=spawn(chromePath,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--hide-scrollbars','--mute-audio',`--remote-debugging-port=${cdpPort}`,`--user-data-dir=${profileDir}`,'about:blank'],{stdio:['ignore','pipe','pipe']});
let chromeLog='';chrome.stdout.on('data',x=>chromeLog+=x);chrome.stderr.on('data',x=>chromeLog+=x);
async function poll(url,timeout=15000){const started=Date.now();let last;while(Date.now()-started<timeout){try{const r=await fetch(url);if(r.ok)return await r.json();last=new Error(`HTTP ${r.status}`)}catch(e){last=e}await sleep(150)}throw new Error(`CDP unavailable: ${last?.message||'timeout'}`)}
class CDP{constructor(ws){this.wsUrl=ws;this.id=1;this.pending=new Map()}async connect(){this.ws=new WebSocket(this.wsUrl);await new Promise((res,rej)=>{const t=setTimeout(()=>rej(new Error('CDP connect timeout')),10000);this.ws.addEventListener('open',()=>{clearTimeout(t);res()},{once:true});this.ws.addEventListener('error',()=>{clearTimeout(t);rej(new Error('CDP connect error'))},{once:true})});this.ws.addEventListener('message',e=>{const m=JSON.parse(String(e.data));if(!m.id)return;const p=this.pending.get(m.id);if(!p)return;this.pending.delete(m.id);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result||{})})}send(method,params={}){const id=this.id++;return new Promise((resolve,reject)=>{this.pending.set(id,{resolve,reject});this.ws.send(JSON.stringify({id,method,params}))})}async eval(expression){const r=await this.send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true,userGesture:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text||'evaluate failed');return r.result?.value}close(){try{this.ws?.close()}catch{}}}
async function waitFor(c,expr,label,timeout=20000){const started=Date.now();while(Date.now()-started<timeout){try{if(await c.eval(`Boolean(${expr})`))return}catch{}await sleep(180)}throw new Error(`Timeout waiting for ${label}`)}
async function navigate(c,url){await c.send('Page.navigate',{url});await waitFor(c,`document.readyState==='complete'`,'document ready')}
let c;try{
  await poll(`http://127.0.0.1:${cdpPort}/json/version`);
  let target=null;
  try{const r=await fetch(`http://127.0.0.1:${cdpPort}/json/new?about:blank`,{method:'PUT'});if(r.ok)target=await r.json()}catch{}
  if(!target){const list=await poll(`http://127.0.0.1:${cdpPort}/json/list`);target=list.find(x=>x.type==='page')}
  if(!target?.webSocketDebuggerUrl)throw new Error('No page target');
  c=new CDP(target.webSocketDebuggerUrl);await c.connect();await c.send('Page.enable');await c.send('Runtime.enable');await c.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true,screenWidth:390,screenHeight:844,screenOrientation:{type:'portraitPrimary',angle:0}});
  await navigate(c,`${baseUrl}/?dev=1&tab=cultivation&visualqa=1`);
  await waitFor(c,`document.body.dataset.uxShell==='p0' && document.querySelector('#content')?.children.length>0`,'canonical DEV runtime bootstrap');
  await c.eval(`(async()=>{const headers={'content-type':'application/json'};const post=async(path,body)=>{const response=await fetch(path,{method:'POST',headers,body:JSON.stringify(body)});const data=await response.json();if(!response.ok||data.ok===false)throw new Error(data.error||('HTTP '+response.status));return data;};await post('/api/dev/new',{seed:20260913});await post('/api/dev/action',{action:'devSandboxPreset',realmOrder:62,dao:'sword',forceBoss:true});const response=await fetch('/api/dev/save',{cache:'no-store'});const data=await response.json();if(!response.ok||data.ok===false||!data.save)throw new Error(data.error||'DEV save unavailable');localStorage.setItem('tutien.web.save.v1',JSON.stringify(data.save));return true})()`);
  await navigate(c,`${baseUrl}/?dev=1&tab=hunt&visualqa=1`);await waitFor(c,`document.body.dataset.uxShell==='p0' && document.querySelector('.huntv2-screen')`,'Combat runtime');await waitFor(c,`document.querySelector('[data-dev-auto-tour]')`,'Combat DEV Auto Tour');
  await c.eval(`(()=>{const b=document.querySelector('[data-dev-auto-tour]');b.click();return true})()`);await waitFor(c,`document.body.classList.contains('combat-dev-tour-running')`,'Combat Auto Tour running');await sleep(1650);
  await c.eval(`(async()=>{if(document.fonts?.ready)await document.fonts.ready;await Promise.all([...document.images].map(img=>img.complete?Promise.resolve():new Promise(r=>{img.addEventListener('load',r,{once:true});img.addEventListener('error',r,{once:true});setTimeout(r,2500)})));return true})()`);
  const metrics=await c.eval(`({screen:document.body.dataset.gameScreen,width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,hasHorizontalOverflow:document.documentElement.scrollWidth>innerWidth+1,hasCombat:!!document.querySelector('.huntv2-screen'),hasPlayerHud:!!document.querySelector('.huntv2-player-hud'),hasEnemyHud:!!document.querySelector('.huntv2-enemy-hud'),skillCount:document.querySelectorAll('.huntv2-skill').length,visibleText:[...document.querySelectorAll('.huntv2-screen *')].filter(e=>{const s=getComputedStyle(e);const r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0&&e.children.length===0&&e.textContent.trim()}).map(e=>({text:e.textContent.trim().slice(0,48),font:parseFloat(getComputedStyle(e).fontSize)||0})).filter(x=>x.font>0&&x.font<10).slice(0,80)})`);
  if(metrics.hasHorizontalOverflow)throw new Error(`Combat horizontal overflow ${metrics.scrollWidth}px`);
  const shot=await c.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});await writeFile(resolve(outDir,'combat-runtime-390x844.png'),Buffer.from(shot.data,'base64'));await writeFile(resolve(outDir,'combat-runtime-metrics.json'),JSON.stringify(metrics,null,2));
  console.log(`COMBAT VISUAL PASS · combat-runtime-390x844.png · skills=${metrics.skillCount} · tinyText=${metrics.visibleText.length}`);
}catch(e){console.error(`[combat-visual] ${e?.stack||e}`);console.error(chromeLog.slice(-4000));process.exitCode=1}finally{c?.close();try{chrome.kill('SIGTERM')}catch{}await sleep(200);try{if(!chrome.killed)chrome.kill('SIGKILL')}catch{}}
