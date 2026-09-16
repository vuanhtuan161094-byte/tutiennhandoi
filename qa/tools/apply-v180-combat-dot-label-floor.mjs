import fs from 'node:fs';

const file='ui-combat-camera-polish.css';
let source=fs.readFileSync(file,'utf8');
const before=`  body[data-game-screen="hunt"] .huntv2-float.damage-main small.show,\n  body[data-game-screen="hunt"] .huntv2-skill-callout small,`;
const after=`  body[data-game-screen="hunt"] .huntv2-float.damage-main small.show,\n  body[data-game-screen="hunt"] .huntv2-float.damage-main span,\n  body[data-game-screen="hunt"] .huntv2-skill-callout small,`;
if(!source.includes(before))throw new Error('V180 DoT label floor anchor missing');
if(source.includes('.huntv2-float.damage-main span,\n  body[data-game-screen="hunt"] .huntv2-skill-callout small'))throw new Error('V180 DoT label floor already applied');
source=source.replace(before,after);
fs.writeFileSync(file,source);
console.log('V180 combat DoT label floor applied');
