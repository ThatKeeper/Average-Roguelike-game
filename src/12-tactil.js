// ===== CONTROLES T\u00c1CTILES (Android/iOS), MODO LIGERO Y PWA =====
// Los controles se dibujan como HTML encima del juego y reutilizan exactamente las mismas acciones que el teclado (K[...], M.d/M.r, dodge(), interact()...).
// Cada control captura su propio puntero (setPointerCapture): un dedo no activa dos botones y soltar o cancelar siempre libera la acci\u00f3n.
const TOUCH_AUTO=(typeof matchMedia=='function'&&matchMedia('(pointer:coarse)').matches)||(typeof navigator!='undefined'&&navigator.maxTouchPoints>0);
let TOUCH=S.touch=='on'||(S.touch!='off'&&TOUCH_AUTO),LOW=TOUCH&&!S.hq,ROT=false;
const TC={ah:0,am:0,ap:null,jp:null,els:{},wasOv:0,box:null};
if(LOW)Object.defineProperty(x,'shadowBlur',{set(){},get(){return 0},configurable:true});
function tcReset(){for(const k of['up','down','left','right','q','e','r','c1','c2','c3','c4'])K[KY[k]]=0;M.d=0;M.r=0;TC.ah=0;TC.am=0;TC.ap=null;TC.jp=null;if(TC.els.knob)TC.els.knob.style.transform='translate(0,0)';for(const id in TC.els){const el=TC.els[id];if(el._pid!=null)el._pid=null}}
function tcAim(){if(TC.am||!P)return;let b=null,bd=420;for(const e of E)if(e.hp>0&&e.sp<=0&&e.t!='decoy'){const d=dist(P,e);if(d<bd){bd=d;b=e}}if(b){M.x=b.x;M.y=b.y}else{const a=Math.hypot(P.vx,P.vy)>20?Math.atan2(P.vy,P.vx):P.face;M.x=P.x+Math.cos(a)*200;M.y=P.y+Math.sin(a)*200}}
function bind(el,down,up){el.style.touchAction='none';el.onpointerdown=e=>{if(el._pid!=null)return;el._pid=e.pointerId;el.setPointerCapture&&el.setPointerCapture(e.pointerId);el.classList&&el.classList.add('p');down(e)};const end=e=>{if(el._pid!==e.pointerId)return;el._pid=null;el.classList&&el.classList.remove('p');up&&up(e)};el.onpointerup=end;el.onpointercancel=end;el.onlostpointercapture=end}
function mkBtn(id,label,cls,css){const b=document.createElement('div');b.className='tb '+cls;b.textContent=label;b.style.cssText=css;TC.box.appendChild(b);TC.els[id]=b;return b}
const hold=k=>[()=>{K[KY[k]]=1},()=>{K[KY[k]]=0}];
function buildTouch(){if(TC.box)return;TC.box=document.createElement('div');TC.box.className='tc';$('w').appendChild(TC.box);
 const jb=document.createElement('div');jb.className='tj';TC.box.appendChild(jb);TC.els.joy=jb;const knob=document.createElement('div');knob.className='tk';jb.appendChild(knob);TC.els.knob=knob;
 const jv=e=>{const r=jb.getBoundingClientRect(),m=r.width/2,dx=e.clientX-(r.left+m),dy=e.clientY-(r.top+m),l=Math.hypot(dx,dy)||1,k=Math.min(1,l/m),vx=dx/l*k,vy=dy/l*k;knob.style.transform=`translate(${vx*m*.6}px,${vy*m*.6}px)`;K[KY.right]=vx>.35?1:0;K[KY.left]=vx<-.35?1:0;K[KY.down]=vy>.35?1:0;K[KY.up]=vy<-.35?1:0};
 jb.style.touchAction='none';jb.onpointerdown=e=>{if(TC.jp!=null)return;TC.jp=e.pointerId;jb.setPointerCapture&&jb.setPointerCapture(e.pointerId);jv(e)};jb.onpointermove=e=>{if(e.pointerId===TC.jp)jv(e)};
 const jend=e=>{if(e.pointerId!==TC.jp)return;TC.jp=null;for(const k of['up','down','left','right'])K[KY[k]]=0;knob.style.transform='translate(0,0)'};jb.onpointerup=jend;jb.onpointercancel=jend;jb.onlostpointercapture=jend;
 const at=mkBtn('atk','ATACAR','big','right:30px;bottom:30px');at.onpointermove=e=>{if(e.pointerId!==TC.ap)return;const r=at.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),l=Math.hypot(dx,dy);if(l>14&&P){TC.am=1;M.x=P.x+dx/l*300;M.y=P.y+dy/l*300}};
 bind(at,e=>{TC.ap=e.pointerId;TC.ah=1;M.d=1;TC.am=0;tcFS()},()=>{TC.ah=0;M.d=0;TC.am=0;TC.ap=null});
 const B=(id,t,css,d,u)=>bind(mkBtn(id,t,'',css),d,u);
 B('skill','HAB','right:138px;bottom:40px',()=>{M.r=1},()=>{M.r=0});B('q','Q','right:120px;bottom:112px',...hold('q'));B('e','E','right:120px;bottom:176px',...hold('e'));B('r','R','right:200px;bottom:112px',...hold('r'));
 B('dodge','ESQ','right:30px;bottom:138px',()=>{if(!G.ov&&G.st=='play')dodge()});B('use','F','right:30px;bottom:206px',()=>interact());
 B('pause','II','right:12px;top:10px;--z:.7',()=>pause());B('inv','INV','right:66px;top:10px;--z:.7',()=>inv());B('map','MAPA','right:120px;top:10px;--z:.7',()=>{bigmap^=1});B('tal','T','right:174px;top:10px;--z:.7',()=>tal());B('book','B','right:228px;top:10px;--z:.7',()=>book());
 for(let i=0;i<4;i++)B('c'+(i+1),String(i+1),`left:calc(50% + ${(i-2)*58+4}px);bottom:8px;--z:.85`,...hold('c'+(i+1)));
 const rot=document.createElement('div');rot.className='rot';rot.textContent='Gira el tel\u00e9fono: se juega en horizontal';TC.box.appendChild(rot);TC.els.rot=rot;tcApply()}
function tcApply(){if(!TC.box)return;TC.box.className='tc'+(TOUCH?' on':'');TC.box.style.setProperty&&TC.box.style.setProperty('--s',S.tscale||1);const w=typeof window=='object'?window:{},ro=TOUCH&&(w.innerHeight||0)>(w.innerWidth||1e9);ROT=!!ro;if(TC.els.rot)TC.els.rot.style.display=ROT?'flex':'none'}
function tcSync(){if(!TOUCH)return;if(!TC.box)buildTouch();const mg=P&&P.cls=='g';for(let i=1;i<=4;i++)TC.els['c'+i].style.display=mg?'flex':'none';TC.els.book.style.display=mg?'flex':'none';if(G.ov&&!TC.wasOv)tcReset();TC.wasOv=G.ov?1:0;TC.box.style.display=G.st=='play'||ROT?'block':'none'}
function tcFS(){try{const d=document.documentElement;if(d&&d.requestFullscreen&&!document.fullscreenElement)d.requestFullscreen().then(()=>screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{})).catch(()=>{})}catch(e){}}
if(typeof window=='object'&&window.addEventListener){window.addEventListener('blur',tcReset);window.addEventListener('resize',tcApply);window.addEventListener('orientationchange',tcApply);if(document.addEventListener)document.addEventListener('visibilitychange',()=>{if(document.hidden)tcReset()})}
if(typeof navigator!='undefined'&&navigator.serviceWorker&&typeof location!='undefined'&&/^https?:/.test(location.protocol))navigator.serviceWorker.register('sw.js').catch(()=>{});
if(TOUCH)buildTouch();
