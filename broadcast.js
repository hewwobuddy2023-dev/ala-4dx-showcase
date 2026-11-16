/* Academy broadcast: a deterministic editorial clock over the original replay engine. */
window.ALABroadcastCore=(()=>{
 const segments=[['identity','Academy introduction',30],['momentum','Class competition',180],['measures','Eight Lead Measures',75],['certifications','Certification preparation',60],['academy','Inside IT & Cyber',90],['leaderboard','Competition finale',45]];
 function at(elapsed){let n=((elapsed%480)+480)%480;for(let i=0;i<segments.length;i++){const s=segments[i];if(n<s[2])return{index:i,id:s[0],name:s[1],seconds:n,duration:s[2]};n-=s[2]}return{index:0,id:'identity',seconds:0}}
 return{segments,at,total:480};
})();
(()=>{
 const original=window.startScoreboardDemo;
 window.startScoreboardDemo=async api=>{
 const broadcast=window.SCOREBOARD_EVENT&&!window.ALAPathname().includes('/display/')&&!new URLSearchParams(location.search).has('competition');window.ALA_BROADCAST=broadcast;
 if(broadcast)window.ALA_REPLAY_NAMESPACE='broadcast-render-'+(crypto.randomUUID?.()||Math.random().toString(36).slice(2));
 await original(api);if(!window.ALAReplay)return;
 const sharedKey='ala-4dx-showcase::ala-academy-broadcast-v1'+(new URLSearchParams(location.search).has('qa')?'-qa-'+new URLSearchParams(location.search).get('qa'):'');
 const validShared=d=>!!d&&Number.isFinite(d.elapsed)&&d.elapsed>=0&&[1,4,20].includes(d.speed)&&typeof d.playing==='boolean'&&typeof d.owner==='string'&&d.owner.length>0&&Number.isFinite(d.stamp);
 if(!broadcast){if(window.SCOREBOARD_EVENT){let follower;const receive=data=>{if(!data||!Number.isFinite(data.elapsed))return;const s=window.ALABroadcastCore.at(data.elapsed),r=window.ALAReplay,index=s.index===0?0:s.id==='momentum'?Math.floor(s.seconds/180*r.events.length):r.events.length;if(r.state().index!==index||r.state().playing)r.jump(index)};try{follower=new BroadcastChannel(sharedKey);follower.onmessage=ev=>receive(ev.data);receive(JSON.parse(localStorage.getItem(sharedKey)||'null'))}catch(_){}addEventListener('pagehide',()=>follower?.close(),{once:true})}return}
 const replay=window.ALAReplay,core=window.ALABroadcastCore;
 // Derive the finale narrative from the same chronological approved demo records.
 const raceTotals=Object.fromEntries(replay.source.classes.map(c=>[c.class_id,0]));let priorLeader='',leadChanges=0;
 for(const record of replay.events.filter(r=>r.kind==='result')){raceTotals[record.class_id]+=Number(record.points)||0;const ranked=Object.entries(raceTotals).sort((a,b)=>b[1]-a[1]);if(ranked.length>1&&ranked[0][1]>ranked[1][1]&&ranked[0][0]!==priorLeader){if(priorLeader)leadChanges++;priorLeader=ranked[0][0]}}
 const entry=Number(new URLSearchParams(location.search).get('segment'))||0;
 let elapsed=core.segments.slice(0,Math.max(0,Math.min(5,entry))).reduce((n,s)=>n+s[2],0),playing=true,speed=1,last=Date.now(),timer=0,closed=false,scene='',lastResult=-1,paintKey='',cycles=0;
 const identity=crypto.randomUUID?.()||Math.random().toString(36).slice(2);let owner=identity,stamp=Date.now(),lastSent=0,channel=null;
 try{const saved=JSON.parse(localStorage.getItem(sharedKey)||'null');if(validShared(saved)&&Date.now()-saved.stamp<5000&&!entry){elapsed=saved.elapsed;playing=saved.playing;speed=saved.speed;owner=saved.owner;stamp=saved.stamp}}catch(_){}
 const bar=document.querySelector('.replay-bar');bar.classList.add('broadcast-bar');bar.querySelector('.presenter-toggle').hidden=true;bar.querySelector('.replay-controls').hidden=true;
 const controls=document.createElement('details');controls.className='broadcast-controls';controls.innerHTML='<summary>Presenter controls</summary><div><button data-broadcast="play">Pause</button><button data-broadcast="restart">Restart</button><select aria-label="Broadcast segment" id="broadcastSegment">'+core.segments.map((s,i)=>'<option value="'+i+'">'+s[1]+'</option>').join('')+'</select><select aria-label="Broadcast speed" id="broadcastSpeed"><option value="1">Event · 8 minutes</option><option value="4">Rehearsal · 2 minutes</option><option value="20">Fast QA · 24 seconds</option></select><a href="/ala-4dx-showcase/operator/" target="_blank" rel="noopener">Operator workspace</a><a href="/ala-4dx-showcase/">Visitor website</a></div></details>';bar.append(controls);const quickPause=document.createElement('button');quickPause.className='quick-pause';quickPause.textContent='Pause';quickPause.setAttribute('aria-label','Pause broadcast');bar.append(quickPause);quickPause.onclick=()=>controls.querySelector('[data-broadcast=play]').click();
 if(location.protocol==='file:')controls.querySelectorAll('a').forEach(a=>a.remove());
 const caption=document.createElement('div');caption.className='broadcast-caption';bar.append(caption);
 const e=window.ALAUI.escape;
 function header(label){return '<div class="show-header"><div class="show-brand"><img src="'+e(window.ALA_LOGO_URL||'/ala-4dx-showcase/pathfinder.png')+'" alt="ALA Pathfinder"><div><strong>ALA APPLIED TECHNOLOGIES</strong><span>IT & CYBERSECURITY ACADEMY</span></div></div><div class="show-period"><b>'+label+'</b><span>Academy showcase</span></div></div>'}
 function custom(s){const lesson=s.id==='identity'?{title:'IT & Cybersecurity Academy',html:window.ALAAcademy.intro()}:window.ALAAcademy.scene(s.seconds,cycles);document.querySelector('#app').innerHTML='<div class="ala-show tv-show broadcast-custom">'+header(lesson.title)+'<div class="show-content">'+lesson.html+'</div><div class="event-strip"><span>ACADEMY LEARNING</span><strong>'+(s.id==='identity'?'Computer systems · networks · defensive security':'Hardware knowledge. Structured troubleshooting. Evidence-based decisions.')+'</strong></div></div>';document.body.classList.add('display-mode');document.querySelector('#siteHeader').hidden=true;document.querySelector('#siteFooter').hidden=true;}
 function draw(force=false){const s=core.at(elapsed);cycles=Math.floor(elapsed/480);const result=s.index===0?0:s.id==='momentum'?Math.min(replay.events.length,Math.floor(s.seconds/180*replay.events.length)):replay.events.length;
 const changed=s.id!==scene;scene=s.id;window.ALA_BROADCAST_VIEW=s.id;
 if(changed||force){if(!['identity','academy'].includes(s.id)){location.hash=s.id;window.ALAUI.render(api,false)}paintKey=''}
 if(result!==lastResult||changed||force){replay.jump(result);lastResult=result}
 const key=s.id+'-'+(s.id==='academy'?Math.floor(s.seconds/10)+'-'+cycles:'');if(['identity','academy'].includes(s.id)&&(paintKey!==key||force)){custom(s);paintKey=key}
 if(s.id==='certifications'&&!document.querySelector('.cert-pathway')){const note=document.createElement('div');note.className='cert-pathway';note.innerHTML='<span><b>Prepare</b>Study core concepts</span><span><b>Practice</b>Labs &amp; practice tests</span><span><b>Validate</b>Pass the required exams</span>';document.querySelector('.show-content')?.prepend(note)}
 if(s.id==='leaderboard'){if(changed){document.querySelector('[data-scope=cumulative]')?.click()}window.ALA_FINALE_NOTICE=leadChanges+' lead changes across 10 reporting weeks · certifications tracked separately.';const strip=document.querySelector('.event-strip strong');if(strip)strip.textContent=leadChanges+' lead changes across 10 reporting weeks · certifications tracked separately.'}
 quickPause.textContent=playing?'Pause':'Resume';quickPause.setAttribute('aria-label',playing?'Pause broadcast':'Resume broadcast');caption.textContent=(s.index+1)+' / 6 · '+s.name+' · '+Math.ceil(s.duration-s.seconds)+'s'+(!playing?' · PAUSED':'');controls.querySelector('[data-broadcast=play]').textContent=playing?'Pause':'Resume';controls.querySelector('#broadcastSegment').value=String(s.index);controls.querySelector('#broadcastSpeed').value=String(speed);
 }
 function publish(){stamp=Math.max(Date.now(),stamp+1);const data={elapsed,playing,speed,owner,stamp};try{localStorage.setItem(sharedKey,JSON.stringify(data))}catch(_){}channel?.postMessage(data);lastSent=Date.now()}
 function take(){owner=identity;last=Date.now()}
 try{channel=new BroadcastChannel(sharedKey);channel.onmessage=ev=>{const data=ev.data;if(!validShared(data)||data.stamp<=stamp||data.owner===identity)return;elapsed=data.elapsed;playing=data.playing;speed=data.speed;owner=data.owner;stamp=data.stamp;last=Date.now();draw()}}catch(_){}
 function tick(){if(closed||document.hidden){last=Date.now();return}const now=Date.now();if(owner!==identity&&now-stamp<=5000){last=now;return}if(owner!==identity)take();if(playing)elapsed+=Math.min(1,(now-last)/1000)*speed;last=now;draw();if(now-lastSent>=1000)publish()}
 controls.addEventListener('click',ev=>{if(closed)return;const a=ev.target.dataset.broadcast;if(!a)return;take();if(a==='play')playing=!playing;if(a==='restart'){elapsed=0;playing=true;lastResult=-1;draw(true)}publish();draw()});
 controls.querySelector('#broadcastSegment').onchange=ev=>{if(closed)return;take();elapsed=cycles*480+core.segments.slice(0,Number(ev.target.value)).reduce((n,s)=>n+s[2],0);publish();draw(true)};
 controls.querySelector('#broadcastSpeed').onchange=ev=>{if(closed)return;take();speed=Number(ev.target.value);publish()};
 const visibility=()=>{last=Date.now();if(!document.hidden)draw(true)};document.addEventListener('visibilitychange',visibility);
 function stop(){closed=true;clearInterval(timer);timer=0;replay.stop();channel?.close();channel=null;document.removeEventListener('visibilitychange',visibility)}addEventListener('pagehide',stop,{once:true});
 draw(true);timer=setInterval(tick,250);
 window.ALABroadcast={state:()=>({elapsed,playing,speed,cycles,segment:scene,timer:!!timer,channel:!!channel,owner:owner===identity}),seek(seconds){if(closed)return;take();elapsed=Math.max(0,Number(seconds)||0);publish();draw(true)},stop};
 };
})();

