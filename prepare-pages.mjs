import fs from 'node:fs';
import path from 'node:path';
const out='_site';fs.mkdirSync(out,{recursive:true});
const files=["academy-content.js","app.js","broadcast.js","config.js","demo-original.json","demo-race.json","event-offline.html","index.html","operator.html","pathfinder.png","playback-core.js","presentation.css","presentation.js","replay-controller.js"];
for(const f of files){if(f==='operator.html')continue;fs.copyFileSync(f,path.join(out,f))}
const routes=['event','measures','trends','certifications','history','display/momentum','display/measures','display/leaderboard','display/certifications','display/activity'];
for(const route of routes){fs.mkdirSync(path.join(out,route),{recursive:true});fs.copyFileSync('index.html',path.join(out,route,'index.html'))}
fs.mkdirSync(path.join(out,'operator'),{recursive:true});fs.copyFileSync('operator.html',path.join(out,'operator/index.html'));fs.writeFileSync(path.join(out,'.nojekyll'),'');
console.log('Prepared 26 public files, including visitor, event, operator and five TV routes.');
