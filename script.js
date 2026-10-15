const TONE={'GOOD':'ok','NORMAL':'ok','CLEAR':'ok','NO RAIN':'ok','SAFE':'ok','WATER RISING':'warn','SINKING':'bad',
  'SLIGHTLY ACIDIC':'warn','SLIGHTLY ALKALINE':'warn','MODERATE':'warn','SLIGHTLY CLOUDY':'warn','MUDDY':'warn',
  'LIGHT RAIN':'warn','MEDIUM RAIN':'warn','COLD':'warn',
  'ACIDIC':'bad','ALKALINE':'bad','POOR':'bad','VERY MUDDY':'bad','HEAVY RAIN':'bad','HOT':'bad'};
const $=id=>document.getElementById(id);
const NS='http://www.w3.org/2000/svg';
const fx=(v,d)=>(v===null||v===undefined||isNaN(v))?'--':Number(v).toFixed(d);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- IMU mounting (MPU6050 orientation on the boat) ---------- */
const IMU_MAP={
  swapRollPitch:true,   // sensor X/Y axes are turned 90° on the boat
  invertYaw:true,       // yaw turns the opposite way
  invertRoll:true,      // roll direction reversed
  invertPitch:true      // pitch direction reversed
};
function imuMap(g){
  let roll=+g.roll||0,pitch=+g.pitch||0,yaw=+g.yaw||0;
  if(IMU_MAP.swapRollPitch)[roll,pitch]=[pitch,roll];
  if(IMU_MAP.invertRoll)roll=-roll;
  if(IMU_MAP.invertPitch)pitch=-pitch;
  if(IMU_MAP.invertYaw)yaw=-yaw;
  return{roll,pitch,yaw};
}
function mk(tag,a,p){const e=document.createElementNS(NS,tag);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}

/* ---------- Sensor map (numbered points on the twin) ---------- */
const Z={top:'var(--z-top)',mid:'var(--z-mid)',uw:'var(--z-uw)',side:'var(--z-side)'};
const SPOTS=[
  {k:'ph',   n:'pH',          z:'uw',  c:'c-ph',   x:-87, y:172},
  {k:'temp', n:'Temperature', z:'uw',  c:'c-temp', x:-10, y:170},
  {k:'turb', n:'Turbidity',   z:'uw',  c:'c-turb', x:77,  y:128},
  {k:'gas',  n:'Gas',         z:'top', c:'c-gas',  x:-190,y:-96},
  {k:'rain', n:'Rain',        z:'top', c:'c-rain', x:206, y:-72},
  {k:'lcd',  n:'LCD',         z:'top', c:'c-sys',  x:-54, y:-106},
  {k:'esp',  n:'ESP32',       z:'top', c:'c-sys',  x:70,  y:-80},
  {k:'nano', n:'Nano',        z:'top', c:'c-sys',  x:132, y:-76},
  {k:'water',n:'Water level', z:'side',c:'c-water',x:243, y:102},
  {k:'drv',  n:'Motor driver',z:'mid', c:'ctl',    x:52,  y:27},
  {k:'motor',n:'Motors',      z:'mid', c:'ctl',    x:-205,y:21}
];
const HS={},LG={},LV={};
(function buildTwin(){
  const hsG=$('hsG'),leg=$('legend');
  SPOTS.forEach((s,i)=>{
    const g=mk('g',{class:'hs info',transform:`translate(${s.x} ${s.y})`,tabindex:0,role:'button','aria-label':s.n},hsG);
    mk('circle',{r:17,class:'ring'},g);mk('circle',{r:12,class:'core'},g);
    const t=mk('text',{},g);t.textContent=i+1;
    const b=document.createElement('button');b.className='lg';b.style.setProperty('--c',Z[s.z]);
    b.innerHTML=`<b>${i+1}</b>${s.n}<span class="lv" id="lv-${s.k}">—</span>`;leg.appendChild(b);
    const go=()=>jump(s.c);
    g.addEventListener('click',go);g.addEventListener('keydown',e=>{if(e.key==='Enter')go();});b.addEventListener('click',go);
    b.addEventListener('mouseenter',()=>g.classList.add('hl'));b.addEventListener('mouseleave',()=>g.classList.remove('hl'));
    HS[s.k]=g;LG[s.k]=b;
  });
  // waves
  function wavePath(y,amp,wl,x0,x1,bot){let d=`M${x0} ${y}`;for(let x=x0;x<x1;x+=wl)d+=` Q${x+wl/4} ${y-amp} ${x+wl/2} ${y} T${x+wl} ${y}`;return d+` L${x1} ${bot} L${x0} ${bot}Z`;}
  function lineWave(y,amp,wl,x0,x1){let d=`M${x0} ${y}`;for(let x=x0;x<x1;x+=wl)d+=` Q${x+wl/4} ${y-amp} ${x+wl/2} ${y} T${x+wl} ${y}`;return d;}
  const fw=document.querySelectorAll('#front .wave');
  fw[0].setAttribute('d',wavePath(262,6,120,-240,1080,440));
  fw[1].setAttribute('d',wavePath(270,5,90,-180,990,440));
  fw[2].setAttribute('d',lineWave(270,5,90,-180,990));
  const sw=document.querySelectorAll('#sidev .wave');
  sw[0].setAttribute('d',wavePath(114,3,60,-120,420,190));
  sw[1].setAttribute('d',wavePath(119,3,50,-100,400,190));
  sw[2].setAttribute('d',lineWave(119,3,50,-100,400));
  // rain drops
  const rf=$('rainFx');
  for(let i=0;i<34;i++){const x=Math.random()*800;mk('line',{x1:x,y1:-24,x2:x-3,y2:-8,stroke:'#9fd9f2','stroke-width':2,'stroke-linecap':'round',class:'drop',style:`--t:${(.55+Math.random()*.35).toFixed(2)}s;animation-delay:-${Math.random().toFixed(2)}s`},rf);}
  // paddle blades (edge-on, scrolling)
  const addBlades=(g,h,sp,w)=>{for(let y=-h-sp;y<=h+sp;y+=sp)mk('rect',{x:-w/2,y:y-2,width:w,height:4,rx:1.5,fill:'#46596a'},g);};
  addBlades($('bladeFL'),88,20,28);addBlades($('bladeFR'),88,20,28);
  addBlades($('bladeTL'),50,14,18);addBlades($('bladeTR'),50,14,18);
  // face-on wheel (side view)
  const ws=$('wheelS');
  for(let a=0;a<360;a+=45){const g=mk('g',{transform:`rotate(${a})`},ws);
    mk('rect',{x:-3,y:-60,width:6,height:44,fill:'#0e1419',stroke:'#3c4d59'},g);
    mk('rect',{x:-13,y:-66,width:26,height:9,rx:2,fill:'#0e1419',stroke:'#3c4d59'},g);}
  mk('circle',{r:17,fill:'#0e1419',stroke:'#3c4d59','stroke-width':2},ws);
  mk('circle',{r:6,fill:'#2a3a46'},ws);
  // compass ticks
  const ct=$('cticks');for(let a=0;a<360;a+=15){const r1=a%90?132:128,rad=a*Math.PI/180;
    mk('line',{x1:(Math.sin(rad)*r1).toFixed(1),y1:(-Math.cos(rad)*r1).toFixed(1),x2:(Math.sin(rad)*139).toFixed(1),y2:(-Math.cos(rad)*139).toFixed(1),stroke:a%45?'#244a5e':'#56778a','stroke-width':a%45?1:2},ct);}
  // rain drop segments & tank ticks
  $('r-d').innerHTML='<span></span>'.repeat(10);
  [25,50,75].forEach(v=>$('w-tank').insertAdjacentHTML('beforeend',`<s style="bottom:${v}%"></s>`));
  // stagger card entrance
  document.querySelectorAll('main .card').forEach((c,i)=>c.style.setProperty('--i',i));
})();
function jump(id){if(id==='ctl'){document.querySelector('.tabs button[data-pane=ctl]').click();return;}   // motors -> Control tab
  const c=$(id);c.scrollIntoView({behavior:RM?'auto':'smooth',block:'center'});c.classList.remove('flash');void c.offsetWidth;c.classList.add('flash');}
function spot(k,tone,val){if(HS[k])HS[k].setAttribute('class','hs '+(tone||'info')+(HS[k].classList.contains('hl')?' hl':''));if(val!==undefined)$('lv-'+k).textContent=val;}

/* ---------- Animated twin state (single rAF loop) ---------- */
const TGT={roll:0,pitch:0,yaw:0,l:0,r:0},CUR={roll:0,pitch:0,yaw:0,l:0,r:0},PH={l:0,r:0,w:0};
let yawAcc=null;
function setYaw(y){if(yawAcc===null){yawAcc=y;CUR.yaw=y;}else yawAcc+=((y-yawAcc)%360+540)%360-180;TGT.yaw=yawAcc;}
const E={rollG:$('rollG'),hsG:$('hsG'),pitchG:$('pitchG'),yawG:$('yawG'),mv:$('mv'),FL:$('bladeFL'),FR:$('bladeFR'),TL:$('bladeTL'),TR:$('bladeTR'),W:$('wheelS')};
let lt=performance.now();
function frame(t){
  const dt=Math.min(.05,(t-lt)/1000);lt=t;const k=Math.min(1,dt*5);
  for(const q in TGT)CUR[q]+=(TGT[q]-CUR[q])*k;
  const bob=RM?0:Math.sin(t/650)*3.2,wob=RM?0:Math.sin(t/900)*.6;
  const rt=`translate(0 ${bob.toFixed(2)}) rotate(${(clamp(CUR.roll,-45,45)+wob).toFixed(2)})`;
  E.rollG.setAttribute('transform',rt);E.hsG.setAttribute('transform',rt);
  E.pitchG.setAttribute('transform',`translate(0 ${(bob*.7).toFixed(2)}) rotate(${(-clamp(CUR.pitch,-45,45)+wob*.6).toFixed(2)})`);
  E.yawG.setAttribute('transform',`rotate(${CUR.yaw.toFixed(2)})`);
  // wheels: blades per second at full throttle = 7
  PH.l+=CUR.l/255*dt*7;PH.r+=CUR.r/255*dt*7;PH.w+=(CUR.l+CUR.r)/2/255*dt*420;
  const fr=v=>((v%1)+1)%1;
  E.FL.setAttribute('transform',`translate(0 ${(-fr(PH.l)*20).toFixed(2)})`);
  E.FR.setAttribute('transform',`translate(0 ${(-fr(PH.r)*20).toFixed(2)})`);
  E.TL.setAttribute('transform',`translate(0 ${(-fr(PH.l)*14).toFixed(2)})`);
  E.TR.setAttribute('transform',`translate(0 ${(-fr(PH.r)*14).toFixed(2)})`);
  E.W.setAttribute('transform',`translate(0 4) rotate(${(PH.w%360).toFixed(1)})`);
  // motion arrow
  const avg=(CUR.l+CUR.r)/2,turn=clamp((CUR.l-CUR.r)/2/255*70,-70,70),mag=Math.min(1,(Math.abs(CUR.l)+Math.abs(CUR.r))/510);
  E.mv.setAttribute('opacity',mag<.03?0:(.35+.65*mag).toFixed(2));
  E.mv.setAttribute('transform',`rotate(${(avg<-2?180-turn:turn).toFixed(1)})`);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* ---------- Helpers ---------- */
let ALERTS=[];
const CHIPNAME={'ph-st':'pH','t-st':'Temp','tb-st':'Turbidity','g-st':'Gas','r-st':'Rain','w-st':'Water level','gps-st':'GPS','gy-st':'Motion'};
function chip(id,text,tone){const el=$(id),t=tone||TONE[text]||'';el.textContent=text||'—';el.className='chip '+t;
  if((t==='bad'||t==='warn')&&CHIPNAME[id])ALERTS.push({n:CHIPNAME[id],s:text,t});return t||'info';}
function off(card,chipId,keys){$(card).classList.add('off');const c=$(chipId);c.textContent='OFF';c.className='chip mute';(keys||[]).forEach(k=>spot(k,'off','off'));}
function on(card){$(card).classList.remove('off');}
function tw(id,v,d){const e=$(id);if(v===null||v===undefined||isNaN(v)){e.textContent='--';e._v=null;return;}
  v=+v;const from=e._v==null?v:e._v;e._v=v;cancelAnimationFrame(e._raf);
  if(RM||from===v){e.textContent=v.toFixed(d);return;}
  const t0=performance.now();const st=t=>{const q=Math.min(1,(t-t0)/500),z=1-Math.pow(1-q,3);e.textContent=(from+(v-from)*z).toFixed(d);if(q<1)e._raf=requestAnimationFrame(st);};e._raf=requestAnimationFrame(st);}
function hms(s){s=Math.floor(s||0);const d=Math.floor(s/86400),h=Math.floor(s/3600)%24,m=Math.floor(s/60)%60,x=s%60;return(d?d+'d ':'')+(d||h?h+'h ':'')+m+'m '+x+'s';}
function card8(deg){return['N','NE','E','SE','S','SW','W','NW'][Math.round((((deg%360)+360)%360)/45)%8];}
const HIST={},MAXH=120;
function push(k,v){if(v===null||v===undefined||isNaN(v))return;(HIST[k]=HIST[k]||[]).push(+v);if(HIST[k].length>MAXH)HIST[k].shift();}
function spark(k,d){const a=HIST[k]||[],svg=$(k+'-sp'),meta=$(k+'-sm');
  if(a.length<2){svg.innerHTML='';meta.innerHTML='<span>collecting trend…</span>';return;}
  const mn=Math.min(...a),mx=Math.max(...a);let lo=mn,hi=mx;if(hi-lo<1e-6){hi+=.5;lo-=.5;}
  const W=200,H=40,n=a.length,off=(MAXH-n)/(MAXH-1)*W;
  const p=a.map((v,i)=>[off+i/(MAXH-1)*W,H-3-((v-lo)/(hi-lo))*(H-6)]);
  const ln=p.map((q,i)=>(i?'L':'M')+q[0].toFixed(1)+' '+q[1].toFixed(1)).join('');
  svg.innerHTML=`<path class="sa" d="${ln}L${W} ${H}L${p[0][0].toFixed(1)} ${H}Z"/><path class="sl" d="${ln}"/>`;
  meta.innerHTML=`<span>min ${fx(mn,d)}</span><span>last ${n} s</span><span>max ${fx(mx,d)}</span>`;}
function mot(v){return Math.round(Math.min(Math.abs(v),255)/2.55)*(v<0?-1:1);}   // raw -255..255 -> %
function drive(l,r){if(!l&&!r)return['STOPPED','info'];if(l===r)return[l>0?'FORWARD':'REVERSE','ok'];
  if(l&&r&&(l>0)!==(r>0))return[l>r?'SPIN RIGHT':'SPIN LEFT','ok'];return[Math.abs(l)>Math.abs(r)?'TURN RIGHT':'TURN LEFT','ok'];}
const pad=(s,n)=>String(s).slice(0,n).padEnd(n,' ');

/* ---------- Water quality ---------- */
const Q_CLASS={'EXCELLENT':'q-excellent','GOOD':'q-good','MODERATE':'q-moderate','POOR':'q-poor','VERY BAD':'q-verybad'};
const WQ_P=[['ph','pH',2,''],['turb','Turbidity',1,' NTU'],['temp','Temperature',1,'°C'],['gas','Ammonia',1,' ppm']];
const scoreCol=s=>s>=85?'#3ee6b7':s>=70?'#46d68c':s>=50?'#f5b449':s>=30?'#ff9a57':'#ff6b6b';
let lastRating='';
function renderWQ(wq){
  const ok=!!(wq&&wq.ok),rt=ok?wq.rating:'NO DATA',sc=ok?+wq.score:0;
  Q_CLASS_ALL.forEach(c=>document.body.classList.remove(c));
  if(ok&&Q_CLASS[rt])document.body.classList.add(Q_CLASS[rt]);
  // Main gauge + control-page mini gauge
  $('wq-score').textContent=ok?sc:'--';$('cq-score').textContent=ok?sc:'--';
  $('wq-rt').textContent=ok?rt:'No sensor data';$('cq-rt').textContent=ok?rt:'--';
  const off=326.7*(1-sc/100);$('wq-arc').style.strokeDashoffset=off;$('cq-arc').style.strokeDashoffset=off;
  document.title=ok?rt+' '+sc+' · AQUA NEXUS':'AQUA NEXUS';
  // Parameter breakdown (score bar + real value + reason)
  $('wq-p').innerHTML=WQ_P.map(([k,label,dec,u])=>{const p=wq&&wq[k];
    if(!p||!p.ok)return`<div class="pr na"><span>${label}</span><div class="pb"><i style="width:0"></i></div><span class="pv">no data</span></div>`;
    return`<div class="pr"><span>${label}</span><div class="pb"><i style="width:${p.score}%;background:${scoreCol(p.score)}"></i></div>`+
      `<span class="pv">${fx(p.v,dec)}${u} <small>· ${esc(p.note)}</small></span></div>`;}).join('');
  // Alarm when water is bad
  const bad=ok&&(rt==='POOR'||rt==='VERY BAD');
  $('wq').classList.toggle('alarm',bad);
  if(ok&&rt!=='EXCELLENT'&&rt!=='GOOD'){
    const why=WQ_P.filter(([k])=>wq[k]&&wq[k].ok&&wq[k].score<50).map(([k,l])=>l+' '+wq[k].note.toLowerCase());
    ALERTS.push({n:'Water quality',s:rt+(why.length?' ('+why.join(', ')+')':''),t:bad?'bad':'warn'});
  }
  if(bad&&rt!==lastRating){toast('⚠ Water quality '+rt);if(navigator.vibrate)navigator.vibrate([200,100,200]);}
  lastRating=rt;
  // LCD on the twin shows the same as the real LCD
  $('lcd1').textContent=pad('Water Quality:',16);
  $('lcd2').textContent=pad(ok?rt+' '+sc+'%':'Reading sensors',16);
}
const Q_CLASS_ALL=Object.values(Q_CLASS);
// Water in the twin turns murky as turbidity rises
const mixHex=(a,b,t)=>'#'+[0,2,4].map(i=>Math.round(parseInt(a.substr(i+1,2),16)*(1-t)+parseInt(b.substr(i+1,2),16)*t).toString(16).padStart(2,'0')).join('');
function waterColour(ntu){const t=clamp((+ntu||0)/150,0,1);
  $('wg0').setAttribute('stop-color',mixHex('#1c8fbf','#8a7a45',t));$('wg1').setAttribute('stop-color',mixHex('#062638','#2a2210',t));}

/* ---------- Hazards: boat sinking (hull water level) + rain ---------- */
const vib=p=>{if(navigator.vibrate)navigator.vibrate(p);};
let hzPrev={sink:false,rise:false,rain:false},hzHtml='';
function renderHazards(d){
  const W=d.water&&d.water.on?d.water:null,R=d.rain&&d.rain.on?d.rain:null;
  const wp=W?clamp(+W.pct||0,0,100):0,warnAt=W&&W.warn!=null?+W.warn:40,sinkAt=W&&W.sink!=null?+W.sink:70;
  const sink=!!W&&(W.sinking===true||W.status==='SINKING');
  const rise=!!W&&!sink&&(W.status==='WATER RISING'||wp>=warnAt);
  const rp=R?clamp(+R.pct||0,0,100):0,rain=!!R&&(R.raining!=null?R.raining:rp>=10);
  const b=document.body;
  b.classList.toggle('hz-sink',sink);b.classList.toggle('hz-rise',rise);b.classList.toggle('hz-rain',rain);
  // Page fills with water as the hull level rises
  $('flood').style.height=(sink||rise)?(8+clamp((wp-warnAt)/(100-warnAt),0,1)*42).toFixed(1)+'vh':'0';
  setRain(rain?rp:0,!!R&&R.status==='HEAVY RAIN');
  // Banners (only rebuilt when the text changes, so the animation doesn't restart)
  let h='';
  if(sink)h+=`<div class="hz bad" role="alert"><span class="ico">⚠</span><div><b>BOAT SINKING</b><span>Water level ${fx(wp,0)}% on the hull — bring the boat back now</span></div></div>`;
  else if(rise)h+=`<div class="hz warn" role="alert"><span class="ico">🌊</span><div><b>BOAT GOING INTO THE WATER</b><span>Hull water level ${fx(wp,0)}% · sinking at ${sinkAt}%</span></div></div>`;
  if(rain)h+=`<div class="hz rain" role="status"><span class="ico">🌧</span><div><b>RAINING · ${esc(R.status)}</b><span>Rain sensor ${fx(rp,0)}% — keep electronics covered</span></div></div>`;
  if(h!==hzHtml){$('hazards').innerHTML=h;hzHtml=h;}
  // Toast + vibration when a hazard starts
  if(sink&&!hzPrev.sink){toast('⚠ BOAT SINKING');vib([400,150,400,150,400]);}
  else if(rise&&!hzPrev.rise&&!hzPrev.sink){toast('🌊 Water rising on the hull');vib([200,100,200]);}
  if(rain&&!hzPrev.rain&&!(sink&&!hzPrev.sink)){toast('🌧 It is raining');vib(120);}   // sinking message has priority
  hzPrev={sink,rise,rain};
}

// Full-page rain (canvas). Drop count follows rain sensor %, lightning on heavy rain
const rcv=$('rainCv'),rcx=rcv.getContext?rcv.getContext('2d'):null;
let drops=[],rainAmt=0,rainRun=false,heavyRain=false,boltT=null,rlt=0;
function sizeRain(){const r=Math.min(devicePixelRatio||1,2);rcv.width=innerWidth*r;rcv.height=innerHeight*r;if(rcx)rcx.setTransform(r,0,0,r,0,0);}
addEventListener('resize',sizeRain);sizeRain();
function newDrop(W,H,anyY){return{x:Math.random()*(W+120)-120,y:anyY?Math.random()*H:-20-Math.random()*H*.3,v:650+Math.random()*450,l:10+Math.random()*16};}
function setRain(pct,heavy){
  rainAmt=pct;heavyRain=heavy;
  if(pct>0&&!rainRun&&rcx&&!RM){rainRun=true;rlt=0;requestAnimationFrame(rainFrame);}
  if(heavy&&!boltT&&!RM)scheduleBolt();
}
function scheduleBolt(){boltT=setTimeout(()=>{boltT=null;if(!heavyRain)return;
  const b=$('bolt');b.classList.remove('go');void b.offsetWidth;b.classList.add('go');scheduleBolt();},4000+Math.random()*7000);}
function rainFrame(t){
  const dt=rlt?Math.min(.05,(t-rlt)/1000):0;rlt=t;
  const W=innerWidth,H=innerHeight,target=rainAmt>0?Math.round(30+rainAmt/100*270):0;
  while(drops.length<target)drops.push(newDrop(W,H,true));
  if(drops.length>target)drops.length=target;
  rcx.clearRect(0,0,W,H);
  rcx.strokeStyle='rgba(180,222,245,.55)';rcx.lineWidth=1.2;rcx.beginPath();
  for(const p of drops){
    p.y+=p.v*dt;p.x+=p.v*.18*dt;
    if(p.y-p.l>H)Object.assign(p,newDrop(W,H,false));
    rcx.moveTo(p.x,p.y);rcx.lineTo(p.x-p.l*.18,p.y-p.l);
  }
  rcx.stroke();
  if(drops.length)requestAnimationFrame(rainFrame);else{rainRun=false;rcx.clearRect(0,0,W,H);}
}
// Hazard banners stick just below the header
const setHdr=()=>document.documentElement.style.setProperty('--hdr',document.querySelector('.top').offsetHeight+'px');
addEventListener('resize',setHdr);setHdr();

/* ---------- Render ---------- */
let lastGps=null,packets=0;
function render(d){
  ALERTS=[];packets++;
  const L={};
  renderWQ(d.wq);

  // pH
  if(d.ph&&d.ph.on){on('c-ph');tw('ph-v',d.ph.ph,2);$('ph-m').style.left=(clamp(+d.ph.ph||0,0,14)/14*100)+'%';
    spot('ph',chip('ph-st',d.ph.status),fx(d.ph.ph,2));push('ph',d.ph.ph);spark('ph',2);L.ph=fx(d.ph.ph,1);
  }else off('c-ph','ph-st',['ph']);

  // Temperature
  if(d.temp&&d.temp.on){on('c-temp');const t=d.temp.t||[];
    if(!d.temp.count){$('t-v').textContent='--';spot('temp',chip('t-st','NO SENSOR','bad'),'no sensor');$('t-sub').textContent='Check wiring + 4.7k pull-up';}
    else{tw('t-v',t[0],1);const bad=t[0]===null;spot('temp',chip('t-st',bad?'ERROR':d.temp.status,bad?'bad':null),fx(t[0],1)+'°C');
      $('t-sub').innerHTML=t.length>1?t.map((v,i)=>'Probe '+(i+1)+': <b>'+fx(v,1)+'°C</b>').join(' · '):'&nbsp;';
      push('t',t[0]);spark('t',1);L.t=fx(t[0],1);}
  }else off('c-temp','t-st',['temp']);

  // Turbidity
  if(d.turb&&d.turb.on){on('c-turb');tw('tb-v',d.turb.ntu,1);$('tb-m').style.left=clamp((+d.turb.ntu||0)/200*100,0,100)+'%';
    $('tb-sub').textContent='sensor '+fx(d.turb.v,2)+' V';spot('turb',chip('tb-st',d.turb.status),fx(d.turb.ntu,0)+' NTU');
    push('tb',d.turb.ntu);spark('tb',1);L.tb=fx(d.turb.ntu,0);waterColour(d.turb.ntu);
  }else{off('c-turb','tb-st',['turb']);waterColour(0);}

  // Gas
  if(d.gas&&d.gas.on){on('c-gas');$('gasFx').style.display='';
    if(!d.gas.warm){$('g-list').innerHTML='<div class="sub">Sensor warming up… readings appear shortly.</div>';spot('gas',chip('g-st','WARM-UP','warn'),'warm-up');}
    else{const G=d.gas.list||[];
      $('g-list').innerHTML=G.length?G.map(g=>`<div class="row"><span>${esc(g.n)}</span><span>${fx(g.v,1)} <small style="color:var(--muted);font-weight:500">ppm</small></span></div>`).join(''):'<div class="sub">No gas readings</div>';
      spot('gas',chip('g-st',d.gas.status),d.gas.status||'—');}
  }else{off('c-gas','g-st',['gas']);$('gasFx').style.display='none';}

  // Rain
  if(d.rain&&d.rain.on){on('c-rain');const p=clamp(+d.rain.pct||0,0,100);tw('r-v',p,0);
    [...$('r-d').children].forEach((s,i)=>s.classList.toggle('on',p>i*10+2));
    spot('rain',chip('r-st',d.rain.status),fx(p,0)+'%');$('rainFx').setAttribute('opacity',p<3?0:(.25+p/100*.75).toFixed(2));
  }else{off('c-rain','r-st',['rain']);$('rainFx').setAttribute('opacity',0);}

  // Water level
  if(d.water&&d.water.on){on('c-water');const p=clamp(+d.water.pct||0,0,100);tw('w-v',p,0);$('w-b').style.height=p+'%';
    spot('water',chip('w-st',d.water.status,TONE[d.water.status]||'info'),fx(p,0)+'%');
    $('w-tank').style.borderColor=d.water.status==='SINKING'?'var(--bad)':d.water.status==='WATER RISING'?'var(--warn)':'';
  }else off('c-water','w-st',['water']);

  renderHazards(d);

  // Motors + driver (shown on the twin and the Control tab)
  let mode='STOPPED',mtone='info',lp=0,rp=0;
  if(d.motor&&d.motor.on){const m=d.motor,l=+m.l||0,r=+m.r||0;lp=mot(l);rp=mot(r);
    [mode,mtone]=drive(l,r);TGT.l=clamp(l,-255,255);TGT.r=clamp(r,-255,255);
    spot('motor',mtone,`${lp}% / ${rp}%`);spot('drv',mtone,mode.toLowerCase());
    // Nano link (motor values above are the ones the Nano reports back)
    const nano=m.nano!==false;
    spot('nano',nano?'ok':'bad',nano?'online':'offline');
    if(!nano)ALERTS.push({n:'Nano',s:'OFFLINE - motors cannot move',t:'bad'});
    // Control page
    $('cs-cmd').textContent=m.cmd||'S';$('cs-l').textContent=lp+'%';$('cs-r').textContent=rp+'%';
    const ns=$('nano-st');ns.textContent=nano?'NANO ONLINE':'NANO OFFLINE';ns.className='chip '+(nano?'ok':'bad');
    $('c-nano').textContent=nano?'online · cmd '+(m.cmd||'S'):'offline';
  }else{spot('motor','off','off');spot('drv','off','off');TGT.l=TGT.r=0;mode='MOTORS OFF';
    const ns=$('nano-st');ns.textContent='MOTORS OFF';ns.className='chip mute';$('c-nano').textContent='motors off';}
  $('mode').textContent=mode;$('mode').className='chip '+(mode==='MOTORS OFF'?'mute':mtone);
  $('gy-drv').textContent=mode;

  // GPS
  if(d.gps&&d.gps.on){on('c-gps');const g=d.gps,n=+g.sats||0,lit=n>=10?4:n>=7?3:n>=4?2:n>=1?1:0;
    $('gps-sat').textContent=g.sats??'--';[...$('gps-bars').children].forEach((b,i)=>b.classList.toggle('on',i<lit));
    if(g.nodata)chip('gps-st','NO DATA','bad');else if(!g.fix)chip('gps-st','SEARCHING','warn');else chip('gps-st','FIX','ok');
    if(g.fix){$('gps-lat').textContent=fx(g.lat,6);$('gps-lng').textContent=fx(g.lng,6);$('gps-spd').textContent=fx(g.speed,1)+' km/h';
      $('gps-map').href='https://maps.google.com/?q='+g.lat+','+g.lng;$('gps-act').style.display='flex';lastGps=fx(g.lat,6)+','+fx(g.lng,6);}
    else{$('gps-lat').textContent=$('gps-lng').textContent=$('gps-spd').textContent='--';$('gps-act').style.display='none';lastGps=null;}
  }else off('c-gps','gps-st');

  // Motion (gyro) - axes adjusted by IMU_MAP for how the MPU6050 is mounted
  if(d.gyro&&d.gyro.on){on('c-gyro');
    if(!d.gyro.ok){chip('gy-st','NOT FOUND','bad');['rd-roll','rd-pitch','rd-yaw'].forEach(i=>$(i).textContent='--');}
    else{const g=imuMap(d.gyro),r=g.roll,p=g.pitch,y=g.yaw;
      TGT.roll=r;TGT.pitch=p;setYaw(y);
      const tilt=Math.max(Math.abs(r),Math.abs(p));
      chip('gy-st',tilt>25?'TILTED':tilt>10?'ROCKING':'STABLE',tilt>25?'bad':tilt>10?'warn':'ok');
      $('gy-r').textContent=fx(r,1)+'° · '+(Math.abs(r)<1?'level':r>0?'right down':'left down');
      $('gy-p').textContent=fx(p,1)+'° · '+(Math.abs(p)<1?'level':p>0?'bow up':'bow down');
      const h=((y%360)+360)%360;$('gy-y').textContent=fx(h,1)+'°';$('gy-dir').textContent=card8(h);
      $('rd-roll').textContent=fx(r,1)+'°';$('rd-pitch').textContent=fx(p,1)+'°';$('rd-yaw').textContent=fx(h,0)+'° '+card8(h);
      $('c-hd').textContent=fx(h,0)+'° '+card8(h);$('c-rp').textContent=fx(r,1)+'° / '+fx(p,1)+'°';
      const ct=$('c-tilt');ct.textContent=tilt>25?'TILTED':tilt>10?'ROCKING':'STABLE';ct.className='chip '+(tilt>25?'bad':tilt>10?'warn':'ok');}
  }else{off('c-gyro','gy-st');TGT.roll=TGT.pitch=0;}
  $('c-gs').textContent=d.gps&&d.gps.on&&d.gps.fix?fx(d.gps.speed,1)+' km/h':'no fix';

  // Controller / LCD
  $('sys-up').textContent=hms(d.uptime);$('up').textContent=hms(d.uptime);$('sys-pk').textContent=packets;
  spot('lcd','info','on');

  renderAlerts();
}
function renderAlerts(){const box=$('alerts'),bad=ALERTS.filter(a=>a.t==='bad').length;
  if(!ALERTS.length){box.className='alerts ok';$('al-ttl').textContent='✓ All systems normal';$('al-list').innerHTML='';return;}
  box.className='alerts '+(bad?'bad':'warn');$('al-ttl').textContent=(bad?'⚠ ':'')+ALERTS.length+' alert'+(ALERTS.length>1?'s':'');
  $('al-list').innerHTML=ALERTS.sort((a,b)=>(a.t==='bad'?0:1)-(b.t==='bad'?0:1)).map(a=>`<span class="chip ${a.t}">${esc(a.n)}: ${esc(a.s)}</span>`).join('');}

/* ---------- Settings ---------- */
const DEFAULT_BOAT='192.168.4.1';
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const apiUrl=a=>{a=a.trim().replace(/\/+$/,'');if(!/^https?:\/\//.test(a))a='http://'+a;return a+'/api/data';};
let boatAddr=new URLSearchParams(location.search).get('boat')||store.get('boatAddr')||DEFAULT_BOAT;
$('boatAddr').value=boatAddr;
$('gear').onclick=()=>{const o=$('sheet').classList.toggle('open');$('gear').setAttribute('aria-expanded',o);};
$('settings').addEventListener('submit',e=>{e.preventDefault();boatAddr=$('boatAddr').value.trim()||DEFAULT_BOAT;store.set('boatAddr',boatAddr);
  for(const k in HIST)delete HIST[k];lastOk=0;setConn('conn');$('sheet').classList.remove('open');$('gear').setAttribute('aria-expanded',false);restart();});
$('clearHist').onclick=()=>{for(const k in HIST)delete HIST[k];spark('ph',2);spark('t',1);spark('tb',1);toast('Trends cleared');};
$('gps-copy').onclick=()=>{if(lastGps)copy(lastGps);};
function copy(txt){const ok=()=>toast('Copied '+txt);
  const fb=()=>{const t=document.createElement('textarea');t.value=txt;t.style.cssText='position:fixed;opacity:0';document.body.appendChild(t);t.select();try{document.execCommand('copy');ok();}catch(e){toast('Copy failed');}t.remove();};
  if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(txt).then(ok,fb);else fb();}
let toastT;function toast(m){const t=$('toast');t.textContent=m;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),1600);}

/* ---------- Connection: WebSocket live push, HTTP polling as fallback ---------- */
const hostOf=a=>a.trim().replace(/^(https?|wss?):\/\//,'').replace(/\/.*$/,'');
const httpBase=()=>'http://'+hostOf(boatAddr);
const wsUrl=()=>'ws://'+hostOf(boatAddr).replace(/:\d+$/,'')+':81/';
let fails=0,lastOk=0,lastMs=0,gen=0,timer=null,ws=null,wsOpen=false,wsRetry=null,link='';
function setConn(s){$('pill').className='pill '+s;$('connTxt').textContent=s==='live'?(wsOpen?'Live':'Live · HTTP'):s==='off'?'Offline':'Connecting…';
  document.body.classList.toggle('stale',s==='off');
  const tn=s==='live'?'ok':s==='off'?'bad':'warn';$('sys-st').textContent=s==='live'?'ONLINE':s==='off'?'OFFLINE':'CONNECTING';$('sys-st').className='chip '+tn;
  spot('esp',tn,s==='live'?lastMs+' ms':s);$('espLed').setAttribute('fill',s==='live'?'#46d68c':s==='off'?'#ff6b6b':'#f5b449');
  if(s==='off'){$('lcd2').textContent=pad('Link lost',16);}}
function tickMeta(){if(!lastOk){$('meta').textContent=boatAddr+' · waiting for data…';return;}
  const ago=(Date.now()-lastOk)/1000;$('meta').textContent=boatAddr+' · '+(ago<1.5?'updated just now':'updated '+(ago<60?ago.toFixed(0)+' s':Math.floor(ago/60)+' min')+' ago')+' · '+link;}
setInterval(tickMeta,500);
// Mark offline when nothing arrives for 3 s (either link)
setInterval(()=>{if(lastOk&&Date.now()-lastOk>3000)setConn('off');},1000);

function gotData(data){
  const now=Date.now();
  if(wsOpen){if(lastOk)$('sys-lat').textContent='push every '+(now-lastOk)+' ms';link='WebSocket live';}
  lastOk=now;render(data);fails=0;setConn('live');tickMeta();
}
function openWs(){
  const my=gen;
  try{ws=new WebSocket(wsUrl());}catch(e){return;}
  const giveUp=setTimeout(()=>{if(!wsOpen&&ws)ws.close();},4000);
  ws.onopen=()=>{if(my!==gen)return;clearTimeout(giveUp);wsOpen=true;clearTimeout(timer);link='WebSocket live';
    if(curCmd!=='S')sendCtl(curCmd+spd.value);};
  ws.onmessage=e=>{if(my!==gen)return;let d;try{d=JSON.parse(e.data);}catch(x){return;}gotData(d);};
  ws.onclose=()=>{clearTimeout(giveUp);if(my!==gen)return;wsOpen=false;
    poll(my);                                              // keep data flowing over HTTP
    wsRetry=setTimeout(()=>{if(my===gen)openWs();},5000);  // and try WebSocket again
  };
  ws.onerror=()=>{};
}
async function poll(my){
  if(wsOpen||my!==gen)return;
  const ctrl=new AbortController(),to=setTimeout(()=>ctrl.abort(),2500),t0=performance.now();
  try{const res=await fetch(apiUrl(boatAddr),{signal:ctrl.signal,cache:'no-store'});if(!res.ok)throw new Error('HTTP '+res.status);
    const data=await res.json();if(my!==gen||wsOpen)return;
    lastMs=Math.round(performance.now()-t0);$('sys-lat').textContent=lastMs+' ms (HTTP)';link='HTTP '+lastMs+' ms';
    gotData(data);
  }catch(e){if(my!==gen)return;if(++fails>=2&&!wsOpen)setConn('off');}
  finally{clearTimeout(to);}
  if(my===gen&&!wsOpen&&!document.hidden){clearTimeout(timer);timer=setTimeout(()=>poll(my),1000);}}
function restart(){
  clearTimeout(timer);clearTimeout(wsRetry);fails=0;gen++;
  if(ws){ws.onclose=null;try{ws.close();}catch(e){}}
  ws=null;wsOpen=false;link='connecting';
  openWs();poll(gen);
}
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){go('S');clearTimeout(timer);}    // safety: stop boat when page is hidden
  else if(!wsOpen)restart();
});

/* ---------- Control: F B L R S ---------- */
// Boat also stops by itself if the page stops sending (ESP32 1.5 s timeout)
let curCmd='S',held=false,cmode='hold';
const spd=$('speed');
function sendCtl(msg){
  if(wsOpen&&ws&&ws.readyState===1){ws.send(msg);return;}
  fetch(httpBase()+'/api/cmd?c='+encodeURIComponent(msg),{cache:'no-store'})
    .then(r=>r.json()).then(gotData).catch(()=>{});
}
function padUI(){document.querySelectorAll('#dpad button').forEach(b=>b.classList.toggle('on',b.dataset.c===curCmd&&curCmd!=='S'));}
function go(cmd){
  if(cmd==='S'&&curCmd==='S'&&!held){sendCtl('S');return;}
  curCmd=cmd;sendCtl(cmd==='S'?'S':cmd+spd.value);padUI();
}
setInterval(()=>{if(curCmd!=='S')sendCtl(curCmd+spd.value);},400);   // keep-alive while moving

document.querySelectorAll('#dpad button').forEach(btn=>{
  const c=btn.dataset.c;
  btn.addEventListener('pointerdown',e=>{
    e.preventDefault();btn.setPointerCapture(e.pointerId);
    if(cmode==='tap'){go(c===curCmd?'S':c);return;}
    held=c!=='S';go(c);
  });
  const release=()=>{if(cmode==='hold'&&held){held=false;go('S');}};
  btn.addEventListener('pointerup',release);btn.addEventListener('pointercancel',release);
  btn.addEventListener('contextmenu',e=>e.preventDefault());
});
document.querySelectorAll('#cmode button').forEach(b=>b.addEventListener('click',()=>{
  cmode=b.dataset.m;document.querySelectorAll('#cmode button').forEach(x=>x.classList.toggle('active',x===b));
  $('cm-hint').textContent=cmode==='hold'?'Boat moves while you hold a button · release = stop':'Tap a direction to start · tap again or STOP to stop';
  held=false;go('S');
}));
function showSpeed(){$('spd-out').textContent=spd.value;$('spd-pc').textContent=Math.round(spd.value/2.55)+'%';}
spd.value=store.get('boatSpeed')||spd.value;showSpeed();
spd.addEventListener('input',()=>{showSpeed();if(curCmd!=='S')sendCtl(curCmd+spd.value);});
spd.addEventListener('change',()=>store.set('boatSpeed',spd.value));

// Keyboard (only on Control tab)
const KEYS={ArrowUp:'F',w:'F',W:'F',ArrowDown:'B',s:'B',S:'B',ArrowLeft:'L',a:'L',A:'L',ArrowRight:'R',d:'R',D:'R',' ':'S'};
const keysDown=new Set();
document.addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||!$('pane-ctl').classList.contains('active'))return;
  const c=KEYS[e.key];if(!c)return;e.preventDefault();
  if(keysDown.has(e.key))return;keysDown.add(e.key);
  held=c!=='S';go(c);
});
document.addEventListener('keyup',e=>{
  if(!keysDown.delete(e.key))return;
  if(cmode==='hold'&&KEYS[e.key]!=='S'&&!keysDown.size){held=false;go('S');}
});
window.addEventListener('blur',()=>{if(curCmd!=='S'){held=false;go('S');}});

/* ---------- Tabs ---------- */
document.querySelectorAll('.tabs button').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.tabs button').forEach(x=>x.classList.toggle('active',x===b));
  document.querySelectorAll('.pane').forEach(p=>p.classList.toggle('active',p.id==='pane-'+b.dataset.pane));
  if(b.dataset.pane!=='ctl'&&curCmd!=='S'){held=false;go('S');}   // leaving Control = stop
  window.scrollTo({top:0,behavior:RM?'auto':'smooth'});
}));

restart();
