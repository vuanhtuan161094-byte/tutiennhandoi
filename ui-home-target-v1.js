/* UI HOME TARGET V1 · CANONICAL SIDE RAIL
   Presentation-only adapter. It never mutates gameplay/navigation authority.
   Each rail button proxies a click to an already-rendered canonical data-tab-jump control. */
(()=>{
  const content=document.getElementById('content');
  if(!content)return;

  const routes=[
    {side:'left',route:'overview',label:'Tổng Quan',glyph:'⟡'},
    {side:'left',route:'roots',label:'Linh Căn',glyph:'◇'},
    {side:'left',route:'path',label:'Định Đạo',glyph:'☯'},
    {side:'right',route:'build',label:'Phối Đồ',glyph:'✦'},
    {side:'right',route:'automation',label:'Tự Động',glyph:'⌘'},
  ];

  function canonicalJump(route){
    const home=content.querySelector('.ui-home');
    if(!home)return;
    const candidate=[...home.querySelectorAll('[data-tab-jump]')]
      .find(node=>!node.closest('[data-home-target-side-rail]')&&node.dataset.tabJump===route);
    candidate?.click();
  }

  function makeRail(side){
    const nav=document.createElement('nav');
    nav.className=`ui-home-target-side-rail ${side}`;
    nav.dataset.homeTargetSideRail=side;
    nav.setAttribute('aria-label',side==='left'?'Lối tắt hệ thống bên trái':'Lối tắt hệ thống bên phải');
    for(const item of routes.filter(entry=>entry.side===side)){
      const button=document.createElement('button');
      button.type='button';
      button.dataset.homeTargetRoute=item.route;
      button.setAttribute('aria-label',item.label);
      button.title=item.label;
      button.innerHTML=`<i aria-hidden="true">${item.glyph}</i><span>${item.label}</span>`;
      button.addEventListener('click',()=>canonicalJump(item.route));
      nav.append(button);
    }
    return nav;
  }

  function fitHeroTitle(hero){
    const identity=hero.querySelector('.ui-home-identity');
    const title=identity?.querySelector('strong');
    if(identity)identity.style.width='min(66%, 250px)';
    if(title)title.style.fontSize='clamp(27px, 7.5vw, 34px)';
  }

  function ensureRails(){
    if(document.body.dataset.gameScreen!=='cultivation')return;
    const hero=content.querySelector('.ui-home-hero');
    if(!hero)return;
    fitHeroTitle(hero);
    if(hero.querySelector('[data-home-target-side-rail]'))return;
    hero.append(makeRail('left'),makeRail('right'));
  }

  const observer=new MutationObserver(()=>queueMicrotask(ensureRails));
  observer.observe(content,{childList:true});
  ensureRails();
})();
