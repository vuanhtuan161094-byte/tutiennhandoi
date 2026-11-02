"""HG-06 RC1 browser acceptance with real Chromium rendering and test-only storage shim.
Run: python qa-browser.py. Browser file:// and localhost are blocked by the sandbox, so
set_content is used. This tests actual HTML/CSS/JS behavior but not physical file launch.
"""
from pathlib import Path
import json, os, shutil, sys

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("BLOCKED: Playwright not installed. Run: python -m pip install playwright")
    print("Then run: python -m playwright install chromium")
    sys.exit(2)

def chromium_launch_options():
    # Offline test: about:blank + set_content, never an unknown browser URL.
    explicit = os.getenv("HOG_CHROMIUM_PATH", "").strip().strip('"')
    if explicit:
        if not Path(explicit).is_file():
            raise RuntimeError("HOG_CHROMIUM_PATH does not point to a browser executable")
        candidate = explicit
    else:
        candidate = next((found for cmd in
                          ("chromium", "chromium-browser", "google-chrome", "msedge", "chrome")
                          if (found := shutil.which(cmd))), None)
        if not candidate and os.name == 'nt':
            roots = [os.getenv('PROGRAMFILES'), os.getenv('PROGRAMFILES(X86)'), os.getenv('LOCALAPPDATA')]
            choices = [
                ('Google', 'Chrome', 'Application', 'chrome.exe'),
                ('Microsoft', 'Edge', 'Application', 'msedge.exe'),
                ('Chromium', 'Application', 'chrome.exe'),
            ]
            candidate = next((str(p) for root in roots if root
                              for parts in choices
                              if (p := Path(root).joinpath(*parts)).is_file()), None)
    options = {'headless': True, 'args': ['--disable-dev-shm-usage']}
    if os.name != 'nt' and hasattr(os, 'geteuid') and os.geteuid() == 0:
        options['args'].append('--no-sandbox')
    if candidate:
        options['executable_path'] = candidate
    return options

folder=Path(__file__).parent
html=(folder/'Play-Heoofgaia-HG07.html').read_text(encoding='utf-8')
checks=[];errors=[]
def check(name,expr):
    try:
        assert expr(),name
        print('PASS',name);checks.append((name,True))
    except Exception as e:
        print('FAIL',name,str(e));checks.append((name,False))
with sync_playwright() as p:
    try:
        browser=p.chromium.launch(**chromium_launch_options())
    except Exception as exc:
        print('BLOCKED: Chromium could not start:', str(exc)[:500])
        print('Install locally with: python -m playwright install chromium')
        print('Or set HOG_CHROMIUM_PATH to an installed Chrome/Edge executable.')
        sys.exit(2)
    def launch(viewport,store=None):
        page=browser.new_page(viewport=viewport,device_scale_factor=1)
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto('about:blank')
        init="""window.__qaStore=JSON.parse(arguments[0]);Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem(k){return Object.prototype.hasOwnProperty.call(window.__qaStore,k)?window.__qaStore[k]:null},setItem(k,v){window.__qaStore[k]=String(v)},removeItem(k){delete window.__qaStore[k]}}})"""
        page.evaluate('(seed) => {window.__qaStore=seed; Object.defineProperty(window,"localStorage",{configurable:true,value:{getItem(k){return Object.prototype.hasOwnProperty.call(window.__qaStore,k)?window.__qaStore[k]:null},setItem(k,v){window.__qaStore[k]=String(v)},removeItem(k){delete window.__qaStore[k]}}})}',store or {})
        page.set_content(html,wait_until='load',timeout=20000)
        return page
    d=launch({'width':1440,'height':900})
    check('Intro title',lambda:d.title().startswith('Hẻoofgaia HG-07'))
    check('No JS exception on intro',lambda:not errors)
    check('4 race selection buttons',lambda:d.locator('[data-action="race"]').count()==4)
    d.locator('[data-action="race"][data-race="elf"]').click()
    d.locator('[data-action="start"]').click()
    check('New game respects selected race',lambda:d.evaluate('HOG_APP_DEBUG.getState().race')=='elf')
    check('Top resource bar contains 5 resources',lambda:d.locator('#resources .resource').count()==5)
    check('World canvas visible',lambda:d.locator('#world-canvas').is_visible())
    check('World map 28 × 18',lambda:d.evaluate('HOG_ENGINE.WIDTH===28&&HOG_ENGINE.HEIGHT===18'))
    d.screenshot(path=str(folder/'screenshot-world-desktop.png'),full_page=True)
    d.locator('#nav [data-tab="city"]').click()
    check('City canvas visible',lambda:d.locator('#city-canvas').is_visible())
    check('Market selectable as construction',lambda:d.locator('[data-action="building"][data-key="market"]').count()==1)
    d.locator('[data-action="building"][data-key="market"]').click()
    d.locator('[data-action="upgrade"]').click()
    check('Build queue created, level not instant',lambda:d.evaluate('HOG_APP_DEBUG.getState().buildingQueue?.key==="market"&&HOG_APP_DEBUG.getState().buildings.market===0'))
    check('Construction progress shown',lambda:d.locator('progress').count()==1)
    d.screenshot(path=str(folder/'screenshot-construction-desktop.png'),full_page=True)
    d.evaluate('(()=>{const s=HOG_APP_DEBUG.getState();HOG_ENGINE.tick(s,s.lastTick+s.buildingQueue.remaining/s.speed*1000+1000);HOG_APP_DEBUG.render()})()')
    check('Market completes after tick',lambda:d.evaluate('HOG_APP_DEBUG.getState().buildings.market===1'))
    d.locator('#sell-qty').fill('10')
    d.locator('[data-action="sell"]').click()
    check('Market sale transaction works',lambda:d.evaluate('HOG_APP_DEBUG.getState().log[0].includes("Bán 10")'))
    d.locator('#nav [data-tab="heroes"]').click()
    check('Tavern candidate cards visible',lambda:d.locator('[data-action="hirecandidate"]').count()==2)
    old=d.evaluate('HOG_APP_DEBUG.getState().heroes.length')
    d.locator('[data-action="hirecandidate"]').first.click()
    check('Hire removes only selected candidate',lambda:d.evaluate('HOG_APP_DEBUG.getState().tavern.offers.length===1'))
    check('Hire adds hero to roster',lambda:d.evaluate('HOG_APP_DEBUG.getState().heroes.length')==old+1)
    d.locator('[data-action="castellan"]').last.click()
    check('Castellan can be appointed',lambda:d.evaluate('HOG_APP_DEBUG.getState().castellan!==null'))
    d.screenshot(path=str(folder/'screenshot-tavern-desktop.png'),full_page=True)
    d.locator('#save').click()
    check('Save stored under v06 key',lambda:d.evaluate('!!localStorage.getItem("heoofgaia_hg_only_v06")'))
    store=d.evaluate('window.__qaStore')
    d2=launch({'width':1440,'height':900},store)
    check('Reload restores race, buildings, heroes',lambda:d2.evaluate('(()=>{const s=HOG_APP_DEBUG.getState();return s?.race==="elf"&&s.buildings.market===1&&s.heroes.length===2})()'))
    check('Reload retains selected Castellan',lambda:d2.evaluate('HOG_APP_DEBUG.getState().castellan!==null'))
    with d2.expect_download(timeout=10000) as got:
        d2.locator('#export-save').click()
    download=got.value
    savefile=folder/'qa-export-temp.json'
    download.save_as(str(savefile))
    check('Browser exports valid JSON',lambda:json.loads(savefile.read_text(encoding='utf-8'))['state']['version']==6)
    d2.evaluate('HOG_APP_DEBUG.getState().res.gold=17;HOG_APP_DEBUG.render()')
    d2.on('dialog',lambda dialog:dialog.accept())
    d2.locator('#import-file').set_input_files(str(savefile))
    d2.wait_for_timeout(300)
    check('Browser import restores resources',lambda:d2.evaluate('HOG_APP_DEBUG.getState().res.gold>17'))
    check('Browser import restores Tavern roster',lambda:d2.evaluate('HOG_APP_DEBUG.getState().heroes.length===2'))
    savefile.unlink(missing_ok=True)
    d2.close()
    d.close()
    m=launch({'width':390,'height':844})
    check('Mobile intro readable',lambda:m.locator('[data-action="start"]').is_visible())
    m.locator('[data-action="start"]').click()
    check('Mobile world canvas visible',lambda:m.locator('#world-canvas').is_visible())
    m.screenshot(path=str(folder/'screenshot-world-mobile.png'),full_page=True)
    m.locator('#nav [data-tab="heroes"]').click()
    check('Mobile Tavern displays candidate controls',lambda:m.locator('[data-action="hirecandidate"]').count()==2)
    m.screenshot(path=str(folder/'screenshot-tavern-mobile.png'),full_page=True)
    m.locator('#nav [data-tab="city"]').click()
    check('Mobile city canvas visible',lambda:m.locator('#city-canvas').is_visible())
    m.locator('#nav [data-tab="army"]').click()
    check('7 formation slots render',lambda:m.locator('[id^="formation_count_"]').count()==7)
    check('HG07 cap visible in army UI',lambda:'11.500' in m.locator('#main').inner_text())
    check('HG07 library active',lambda:m.evaluate('typeof HOG_ENGINE.heroLimit==="function"'))
    check('No unhandled browser JS errors',lambda:not errors)
    m.close()
    browser.close()
passed=sum(ok for _,ok in checks);total=len(checks)
(folder/'QA-RC1-RESULTS.json').write_text(json.dumps({'total':total,'passed':passed,'failed':total-passed,'errors':errors,'checks':[{'name':n,'passed':b} for n,b in checks]},indent=2,ensure_ascii=False),encoding='utf-8')
print(f'BROWSER TOTAL {passed}/{total} PASS; JS exceptions={len(errors)}')
sys.exit(1 if passed!=total else 0)
