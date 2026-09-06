export const CHARACTER_EXPRESSION_RIG_VERSION='1.38.0-alpha.7.6';

export const EXPRESSION_PRESET_IDS=[
  'neutral','happy','smile','confident','cold','angry','bloodlust','contempt',
  'confused','panic','sad','crying','shy','excited','tired','berserk'
];

export const DEFAULT_FACE_RIG={
  schema:'character-face-rig.v1',
  mode:'flat-base-expression-overlay',
  // Current production portrait already contains hair/outfit. These optional slots are
  // deliberately present so future hair/outfit assets can be added without changing UI/save logic.
  layers:{headBase:'',hairBack:'',hairFront:'',accessory:''},
  faceAnchor:{xPct:20.6,yPct:38.0,widthPct:37.0,heightPct:29.0},
  expressionId:'neutral',
};

const esc=value=>String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const preset=id=>EXPRESSION_PRESET_IDS.includes(String(id))?String(id):'neutral';

function expressionSvg(id){
  const p=preset(id);
  const common='fill="none" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"';
  const dark='#2d2630',blue='#4b8fd4',red='#e44545',tearColor='#72c9ff',skin='#f6e8df';
  const brow=(l,r,stroke=dark,w=2.1)=>`<path d="${l}" stroke="${stroke}" stroke-width="${w}" ${common}/><path d="${r}" stroke="${stroke}" stroke-width="${w}" ${common}/>`;
  const mouth=(d,stroke=dark,w=1.8,fill='none')=>`<path d="${d}" stroke="${stroke}" stroke-width="${w}" fill="${fill}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const eyeGlow=(x,y,color=red)=>`<circle cx="${x}" cy="${y}" r="7" fill="${color}" opacity=".18"/><circle cx="${x}" cy="${y}" r="2.3" fill="${color}" opacity=".95"/>`;
  const tear=(x)=>`<path d="M${x} 55 C${x-2} 62 ${x-2} 70 ${x} 77 C${x+3} 70 ${x+3} 62 ${x} 55Z" fill="${tearColor}" opacity=".86"/>`;
  const blush=`<ellipse cx="30" cy="65" rx="11" ry="5" fill="#ff849d" opacity=".22"/><ellipse cx="70" cy="65" rx="11" ry="5" fill="#ff849d" opacity=".22"/>`;
  const eyeCover=`<ellipse cx="31" cy="43" rx="14" ry="8" fill="${skin}" opacity=".82"/><ellipse cx="69" cy="43" rx="14" ry="8" fill="${skin}" opacity=".82"/>`;
  const mouthCover=`<ellipse cx="50" cy="75" rx="12" ry="7" fill="${skin}" opacity=".88"/>`;
  const closedEyes=`<path d="M19 44 Q31 34 43 44" stroke="${dark}" stroke-width="2.3" ${common}/><path d="M57 44 Q69 34 81 44" stroke="${dark}" stroke-width="2.3" ${common}/>`;
  const narrowedEyes=`<path d="M19 43 Q31 39 43 42" stroke="${dark}" stroke-width="2.2" ${common}/><path d="M57 42 Q69 39 81 43" stroke="${dark}" stroke-width="2.2" ${common}/>`;
  const wideEyes=`<ellipse cx="31" cy="44" rx="8.5" ry="7.6" fill="#fff" stroke="${dark}" stroke-width="1.5"/><ellipse cx="69" cy="44" rx="8.5" ry="7.6" fill="#fff" stroke="${dark}" stroke-width="1.5"/><circle cx="31" cy="44" r="3.1" fill="${blue}"/><circle cx="69" cy="44" r="3.1" fill="${blue}"/>`;
  let body='';
  switch(p){
    case'happy': body=`${eyeCover}${closedEyes}${blush}${mouthCover}${mouth('M39 72 Q50 84 61 72',dark,2.2)}`; break;
    case'smile': body=`${blush}${mouthCover}${mouth('M41 74 Q50 80 59 74',dark,1.9)}`; break;
    case'confident': body=`${brow('M18 34 Q30 29 42 34','M58 35 Q70 28 82 31')}${mouthCover}${mouth('M42 75 Q51 80 61 72',dark,2)}`; break;
    case'cold': body=`${narrowedEyes}${brow('M19 34 L42 34','M58 34 L81 34', '#334a63',1.9)}${mouthCover}${mouth('M43 76 L57 76','#334a63',1.7)}<rect x="13" y="20" width="74" height="62" rx="24" fill="#6bbcff" opacity=".05"/>`; break;
    case'angry': body=`${brow('M18 36 L42 29','M58 29 L82 36',red,2.5)}${mouthCover}${mouth('M41 78 Q50 68 60 78',red,2.2)}<path d="M82 18 l5 5 -4 1 3 5 -7-3 1-4 -5-1 7-3Z" fill="${red}" opacity=".8"/>`; break;
    case'bloodlust': body=`${eyeGlow(31,44)}${eyeGlow(69,44)}${brow('M18 36 L42 29','M58 29 L82 36',red,2.4)}${mouthCover}${mouth('M42 74 Q52 81 62 71',red,2.1)}<path d="M8 16 Q16 9 24 16M76 16 Q84 9 92 16" stroke="${red}" stroke-width="2" opacity=".75" ${common}/>`; break;
    case'contempt': body=`${brow('M18 35 Q30 30 42 34','M59 33 Q71 37 82 31',dark,2.1)}${mouthCover}${mouth('M43 76 Q52 72 61 75',dark,1.8)}`; break;
    case'confused': body=`${brow('M18 33 Q30 27 42 34','M59 36 Q70 40 81 34',dark,2)}${mouthCover}${mouth('M45 76 Q50 73 55 76',dark,1.7)}<text x="83" y="26" font-size="18" font-weight="800" fill="#5bb8e8">?</text>`; break;
    case'panic': body=`${eyeCover}${wideEyes}${mouthCover}<ellipse cx="50" cy="76" rx="6" ry="8" fill="#6a3340" opacity=".85"/><path d="M84 33 C91 44 88 50 83 50 C78 50 78 42 84 33Z" fill="${tearColor}" opacity=".9"/>`; break;
    case'sad': body=`${brow('M18 35 Q30 41 42 34','M58 34 Q70 41 82 35',dark,2)}${mouthCover}${mouth('M42 80 Q50 72 58 80',dark,1.8)}`; break;
    case'crying': body=`${brow('M18 35 Q30 41 42 34','M58 34 Q70 41 82 35',dark,2)}${tear(31)}${tear(69)}${mouthCover}${mouth('M40 79 Q50 68 60 79',dark,2)}`; break;
    case'shy': body=`${blush}${mouthCover}${mouth('M44 76 Q50 79 56 76',dark,1.6)}<path d="M22 64 l8-4M25 68 l8-4M67 60 l8 4M65 64 l8 4" stroke="#ff6f91" stroke-width="1.5" opacity=".65" ${common}/>`; break;
    case'excited': body=`${blush}${mouthCover}${mouth('M39 71 Q50 86 61 71',dark,2.3)}<path d="M28 39 l2 4 4 1-4 2-2 4-2-4-4-2 4-1 2-4ZM72 39 l2 4 4 1-4 2-2 4-2-4-4-2 4-1 2-4Z" fill="#ffd85c" opacity=".95"/>`; break;
    case'tired': body=`${narrowedEyes}${brow('M18 35 Q30 37 42 35','M58 35 Q70 37 82 35','#4c5564',1.8)}${mouthCover}${mouth('M44 77 Q50 79 56 77','#4c5564',1.5)}<text x="78" y="25" font-size="14" font-weight="800" fill="#7793ae">Z</text>`; break;
    case'berserk': body=`${eyeGlow(31,44)}${eyeGlow(69,44)}${brow('M17 37 L42 27','M58 27 L83 37',red,2.8)}${mouthCover}<path d="M39 72 Q50 66 61 72 L58 82 Q50 88 42 82Z" fill="#64222b" stroke="${red}" stroke-width="1.8"/><path d="M15 20 l5 4 -4 2 4 5M85 20 l-5 4 4 2-4 5" stroke="${red}" stroke-width="2.2" opacity=".85" ${common}/>`; break;
    default: body=`${mouthCover}${mouth('M45 76 L55 76',dark,1.5)}`;
  }
  return `<svg class="v138-face-rig-svg" viewBox="0 0 100 100" aria-hidden="true">${body}</svg>`;
}

function layerImg(path,cls,alt=''){
  if(!path)return '';
  return `<img class="${cls}" src="${esc(path)}" alt="${esc(alt)}" draggable="false">`;
}

/**
 * Reusable portrait compositor.
 * Current character uses flatBase until true hair/head modules exist; expression SVG stays independent.
 * When headBase/hairBack/hairFront/accessory paths are supplied later, no UI/save rewrite is needed.
 */
export function expressionPortraitMarkup({
  expressionId='neutral',avatar='',alt='',className='',rig=null,badge='',label='',
}={}){
  const id=preset(expressionId);
  const r={...DEFAULT_FACE_RIG,...(rig||{}),layers:{...DEFAULT_FACE_RIG.layers,...(rig?.layers||{})},faceAnchor:{...DEFAULT_FACE_RIG.faceAnchor,...(rig?.faceAnchor||{})}};
  const modular=Boolean(r.layers.headBase||r.layers.hairBack||r.layers.hairFront);
  const flatBase=String(r.flatBase||avatar||'');
  const stack=modular
    ? `${layerImg(r.layers.hairBack,'v138-face-rig-layer hair-back')}${layerImg(r.layers.headBase,'v138-face-rig-layer head-base',alt)}${layerImg(r.layers.hairFront,'v138-face-rig-layer hair-front')}${layerImg(r.layers.accessory,'v138-face-rig-layer accessory')}`
    : layerImg(flatBase,'v138-face-rig-layer flat-base',alt);
  const a=r.faceAnchor;
  return `<span class="v138-face-rig ${esc(className)}" data-expression="${esc(id)}" data-rig-mode="${modular?'modular':'flat-base'}" style="--face-x:${Number(a.xPct)||20.6}%;--face-y:${Number(a.yPct)||38}%;--face-w:${Number(a.widthPct)||37}%;--face-h:${Number(a.heightPct)||29}%">${stack}<span class="v138-face-rig-expression">${expressionSvg(id)}</span>${badge?`<i class="v138-face-rig-badge">${esc(badge)}</i>`:''}${label?`<span class="v138-face-rig-label">${esc(label)}</span>`:''}</span>`;
}

export function expressionSvgMarkup(value){return expressionSvg(preset(value));}
export function expressionPresetId(value){return preset(value);}
