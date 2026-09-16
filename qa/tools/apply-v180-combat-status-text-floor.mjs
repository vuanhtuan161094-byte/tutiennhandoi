import fs from 'node:fs';

const file='ui-combat-camera-polish.css';
let source=fs.readFileSync(file,'utf8');
const before=`  body[data-game-screen="hunt"] .huntv2-status-callout,\n  body[data-game-screen="hunt"] .huntv2-stage-boss-telegraph small,\n  body[data-game-screen="hunt"] .huntv2-break-window small{font-size:10px!important}\n}`;
const after=`  body[data-game-screen="hunt"] .huntv2-status-callout,\n  body[data-game-screen="hunt"] .huntv2-stage-boss-telegraph small,\n  body[data-game-screen="hunt"] .huntv2-break-window small,\n  body[data-game-screen="hunt"] .huntv2-status-tray .status>b,\n  body[data-game-screen="hunt"] .huntv2-status-tray .status>em,\n  body[data-game-screen="hunt"] .huntv2-status-tray .status>strong,\n  body[data-game-screen="hunt"] .huntv2-status-tray .status>small,\n  body[data-game-screen="hunt"] .huntv2-status-tray .status-more{font-size:10px!important;line-height:1!important}\n}`;
if(!source.includes(before))throw new Error('V180 status text floor anchor missing');
if(source.includes('.huntv2-status-tray .status>em,\n  body[data-game-screen="hunt"] .huntv2-status-tray .status>strong'))throw new Error('V180 status text floor already applied');
source=source.replace(before,after);
fs.writeFileSync(file,source);
console.log('V180 combat status text floor applied');
