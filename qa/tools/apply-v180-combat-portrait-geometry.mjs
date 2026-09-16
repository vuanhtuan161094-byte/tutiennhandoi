import fs from 'node:fs';

const file = 'ui-combat-camera-polish.css';
let css = fs.readFileSync(file, 'utf8');

const replaceOnce = (before, after, label) => {
  const first = css.indexOf(before);
  if (first < 0) throw new Error(`[V180 portrait] missing ${label}`);
  if (css.indexOf(before, first + before.length) >= 0) throw new Error(`[V180 portrait] ambiguous ${label}`);
  css = css.replace(before, after);
};

replaceOnce('@media(max-width:430px) and (max-height:860px){', '@media(max-width:430px){', '430 portrait geometry gate');
replaceOnce('@media(max-width:360px) and (max-height:860px){', '@media(max-width:360px){', '360 portrait geometry gate');

if (!css.includes('/* V180 portrait tactical text floor */')) {
  css += `\n\n/* V180 portrait tactical text floor — transient/action text may not shrink below 10px. */\n@media(max-width:430px){\n  body[data-game-screen="hunt"] .huntv2-float.damage-main small.show,\n  body[data-game-screen="hunt"] .huntv2-skill-callout small,\n  body[data-game-screen="hunt"] .huntv2-enemy-intent span,\n  body[data-game-screen="hunt"] .huntv2-enemy-intent small,\n  body[data-game-screen="hunt"] .huntv2-enemy-intent>b,\n  body[data-game-screen="hunt"] .huntv2-combat-caption strong,\n  body[data-game-screen="hunt"] .huntv2-combat-caption span,\n  body[data-game-screen="hunt"] .huntv2-result-pop span,\n  body[data-game-screen="hunt"] .huntv2-status-callout,\n  body[data-game-screen="hunt"] .huntv2-stage-boss-telegraph small,\n  body[data-game-screen="hunt"] .huntv2-break-window small{font-size:10px!important}\n}\n`;
}

if (/max-width:430px\) and \(max-height:860px/.test(css)) throw new Error('[V180 portrait] height-gated 430 layout survived');
if (/max-width:360px\) and \(max-height:860px/.test(css)) throw new Error('[V180 portrait] height-gated 360 layout survived');
if (!css.includes('grid-template-columns:repeat(7,minmax(0,1fr))!important')) throw new Error('[V180 portrait] seven-slot rail lock missing');

fs.writeFileSync(file, css);
console.log('V180 unified portrait geometry applied');
