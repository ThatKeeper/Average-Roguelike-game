const fs=require('fs'),vm=require('vm');

const D=__dirname+'/../src/';const js=fs.readdirSync(D).sort().map(f=>fs.readFileSync(D+f,'utf8')).join('\n');
const ctx=new Proxy({},{get:(t,k)=>k=='measureText'?()=>({width:10}):(k=='createRadialGradient'||k=='createLinearGradient')?()=>({addColorStop(o,c){if(typeof c=='string'&&c[0]=='#'&&![4,5,7,9].includes(c.length))throw new SyntaxError('color invalido '+c)}}):(k in t?t[k]:()=>{}),set:(t,k,v)=>{if(['fillStyle','strokeStyle','shadowColor'].includes(k)&&typeof v=='string'&&v[0]=='#'&&![4,5,7,9].includes(v.length))throw new SyntaxError('color invalido '+v);t[k]=v;return true}});
const mk=()=>({style:{},kids:[],appendChild(c){this.kids.push(c)},set innerHTML(v){this.kids=[];this._h=v},get innerHTML(){return this._h||''},getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:960,height:600}),insertAdjacentHTML(){},dataset:{},cloneNode(){return mk()},remove(){},closest(){return null}});
const els={};global.document={getElementById:i=>els[i]||(els[i]=mk()),createElement:()=>mk()};
global.window=global;global.performance={now:()=>0};global.requestAnimationFrame=()=>{};global.localStorage={getItem:()=>null,setItem(){}};global.setInterval=()=>0;global.AudioContext=function(){throw 1};
let errs=[];console.error=e=>errs.push(String(e&&e.stack||e).split('\n').slice(0,2).join(' | '));
vm.runInThisContext(js);const R=c=>vm.runInThisContext(c);const ov=els.ov;let out=[];const ok=(n,c)=>out.push((c?'OK   ':'FAIL ')+n);
const fresh=()=>{R('run(9);E=[];P.mp=P.mmp=500;P.hp=P.mhp;P.stcd=0;P.cd[4]=0;P.cc=0');R('window.e=spawn("tank",P.x+60,P.y);e.sp=0;e.hp=e.mhp=100000;e.cd=99')};

const dt='1/60',stp=n=>{for(let k=0;k<n;k++)R(`P.hp=P.mhp;P.inv=1;upP(${dt});upE(${dt});upPR(${dt});upMisc(${dt})`)};
// ---- puertas ----
let noDoor=0,hiddenWrong=0;for(let d=1;d<=12;d++)for(let seed=1;seed<=25;seed++){R(`run(0);G.seed=${seed};G.d=${d};genLevel()`);const r=R(`(()=>{let nd=0,hw=0;G.R.forEach((r,i)=>{for(const k in r.nb){const n=G.R[r.nb[k]],v=doorVis(r,k);if(!v&&!n.sec)nd++;if(v&&n.sec&&!G.seen[r.nb[k]])hw++}});return[nd,hw]})()`);noDoor+=r[0];hiddenWrong+=r[1]}
ok('ninguna puerta normal queda oculta ('+noDoor+') y las secretas siguen ocultas hasta descubrirlas',noDoor==0&&hiddenWrong==0);
R('run(0);G.seed=7;G.d=4;genLevel()');const si=R('G.R.findIndex(r=>r.sec)');if(si>=0){const par=R(`G.R.findIndex(r=>Object.values(r.nb).includes(${si}))`);R(`enter(${si},0)`);ok('al descubrir la sala secreta su puerta pasa a verse',R(`G.seen[${si}]`)==1&&R(`doorVis(G.R[${par}],Object.keys(G.R[${par}].nb).find(k=>G.R[${par}].nb[k]==${si}))`))}else ok('(sin secreta en esa semilla)',true);
errs.length=0;R('run(0);G.seed=3;G.d=2;genLevel();enter(0,4);draw()');ok('el renderizado con puertas no lanza errores',errs.length==0);
// ---- escalado de vida ----
const hp=d=>R(`G.d=${d};hpM()`);const hs=[1,2,3,4,5,8,10,15,20,30].map(hp);ok('vida enemiga creciente: '+hs.map(v=>v.toFixed(1)).join(', '),hs.every((v,i)=>!i||v>hs[i-1]));
ok('primeros niveles suaves (d1=1\u00d7, d3<2\u00d7) y d30 acotado (<45\u00d7; valor a ajustar con partidas reales)',hs[0]==1&&hs[2]<2&&hs[9]<45);
// ---- l\u00edmite de proyectiles ----
const capAt=(d,ne,np)=>{R(`G.d=${d};PR=[];for(let i=0;i<${ne};i++)PR.push({f:"e",n:i,l:1});for(let i=0;i<${np};i++)PR.push({f:"p",n:i,l:1});capPR()`);return[R('PR.filter(p=>p.f=="e").length'),R('PR.filter(p=>p.f=="p").length'),R('Math.min(...PR.filter(p=>p.f=="e").map(p=>p.n))')]};
const c1=capAt(1,500,400),c20=capAt(20,500,400),c8=capAt(8,500,10);ok(`l\u00edmite enemigo: d1=${c1[0]}, d8=${c8[0]}, d20=${c20[0]}; jugador independiente (${c1[1]})`,c1[0]==120&&c8[0]==95&&c20[0]==48&&c1[1]==220&&c8[1]==10);
ok('al llegar al l\u00edmite se descartan los m\u00e1s antiguos (quedan los nuevos)',c1[2]==380&&c20[2]==452);
R('run(0);G.d=20;E=[];PR=[];window.bb=spawn("boss",480,150);bb.sp=0;brs(bb,36,200,1);capPR()');ok('un patr\u00f3n de jefe completo (36) cabe bajo el l\u00edmite m\u00e1s bajo',R('PR.filter(p=>p.f=="e").length')==36);
// ---- IA progresiva ----
const probe=d=>{R(`run(0);G.d=${d};E=[];RM_.obs=[];P.x=100;P.y=100;window.g=spawn("grunt",700,400);g.sp=0;g.al=1;g.cd=3;window.x0=g.x;window.y0=g.y`);stp(60);return[R('g.cd'),Math.hypot(R('g.x')-700,R('g.y')-400)]};
const a1=probe(1),a13=probe(13);ok(`mayor agresividad en niveles altos: enfriamiento restante ${a1[0].toFixed(2)} \u2192 ${a13[0].toFixed(2)}, avance ${a1[1].toFixed(0)} \u2192 ${a13[1].toFixed(0)} px`,a13[0]<a1[0]&&a13[1]>a1[1]);
const flank=d=>{R(`run(0);G.d=${d};E=[];RM_.obs=[];P.x=480;P.y=300;for(let i=0;i<6;i++){const q=spawn("grunt",120+i*10,100+i*50);q.sp=0;q.al=1}`);R('slots()');return R('E.filter(q=>q.sl).map(q=>[q.sl.x,q.sl.y])')};
const f1=flank(1),f6=flank(6),f4=flank(4);ok(`sin coordinaci\u00f3n en niveles bajos (${f1.length}), parcial d4 (${f4.length}), total d6 (${f6.length})`,f1.length==0&&f4.length==3&&f6.length==6);
const dd=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);let minSep=1e9;for(let i=0;i<f6.length;i++)for(let j=i+1;j<f6.length;j++)minSep=Math.min(minSep,dd(f6[i],f6[j]));ok('los puestos de flanqueo no se solapan (separaci\u00f3n m\u00ednima '+minSep.toFixed(0)+' px) y rodean al jugador',minSep>40&&Math.max(...f6.map(p=>p[0]))>480&&Math.min(...f6.map(p=>p[0]))<480);
// grupos grandes en pasillo estrecho: no se atascan ni dan errores
errs.length=0;R('run(0);G.d=8;E=[];RM_.obs=[{x:50,y:50,w:860,h:200},{x:50,y:350,w:860,h:200}];P.x=860;P.y=300;for(let i=0;i<10;i++){const q=spawn("grunt",110+i*12,300+(i%3-1)*30);q.sp=0;q.al=1}');stp(900);const dist=R('E.filter(q=>q.hp>0).map(q=>Math.hypot(q.x-P.x,q.y-P.y))');ok('10 enemigos en un pasillo estrecho avanzan sin atascarse (m\u00e1s cercano a '+Math.min(...dist).toFixed(0)+' px) y sin errores',Math.min(...dist)<120&&errs.length==0);
// ---- revancha ----
const SN=()=>R('JSON.stringify({b:S.best,s:S.souls,p:S.pw,bo:S.bosses||{}})');
R('S.best=99;S.souls=10;S.pw=0;S.bosses={}');const s0=SN();R('menu();arena(1)');ok('la pr\u00e1ctica empieza contra Gorgrim',R('G.arena')==1&&R('E.some(e=>e.t=="boss"&&e.bi==1)'));
R('E.forEach(e=>{if(e.t=="boss")e.sp=0});P.gold=500;P.dm=500;const bz=E.find(e=>e.t=="boss");hit(bz,1e12,"p")');for(let k=0;k<20;k++)stp(1);ok('derrotar al jefe de pr\u00e1ctica despeja la sala',R('G.R[G.cur].cl&&E.length==0'));
R('P.pend=0;hide();P.x=480;P.y=300;interact()');ok('el portal devuelve al men\u00fa principal',R('G.st')=='menu'&&els.ov.innerHTML.includes('INFINITE'));ok('sin recompensas, almas, profundidad ni desbloqueos tras la pr\u00e1ctica',SN()==s0);
R('interact()');ok('segunda interacci\u00f3n no registra otra finalizaci\u00f3n',SN()==s0&&R('G.st')=='menu');
R('menu();arena(2)');R('P.gold=800;P.hp=1;P.inv=0;P.dash=null;hurtP(9999)');ok('morir en pr\u00e1ctica no concede almas ni mejor profundidad',SN()==s0&&R('G.st')=='over');
R('menu();arena(3);pause()');const ab=[];(function w(n){(n.kids||[]).forEach(c=>{if(c.onclick)ab.push(c);w(c)})})(els.ov);ab.find(b=>(b.innerHTML||b.textContent||'').includes('Abandonar')).onclick();ok('abandonar la pr\u00e1ctica no concede nada',SN()==s0&&R('G.st')=='over');
R('menu();arena(0)');ok('se puede iniciar otra pr\u00e1ctica desde el men\u00fa y empieza limpia',R('G.st')=='play'&&R('E.filter(e=>e.t=="boss").length')==1&&R('P.hp==P.mhp'));
// ---- run normal intacta ----
R('S.best=0;S.souls=0;S.bosses={};run(0);G.d=1;genLevel();enter(G.R.findIndex(r=>r.tp=="boss"),4);E.forEach(e=>e.sp=0);P.gold=100;P.dm=500;hit(E.find(e=>e.t=="boss"),1e12,"p")');for(let k=0;k<20;k++)stp(1);ok('run normal: el jefe registra el progreso permanente (S.bosses)',R('!!(S.bosses&&S.bosses[0])'));
R('P.pend=0;hide();P.x=480;P.y=300;interact()');ok('run normal: el portal desciende al nivel 2 y sigue jugando',R('G.d')==2&&R('G.st')=='play');
R('P.gold=100;P.hp=1;P.inv=0;P.dash=null;hurtP(9999)');ok('run normal: al morir conserva mejor profundidad y mitad del oro',R('S.best')==2&&R('S.souls')==50);
console.log(out.join('\n'));console.log('errores consola:',errs.length);
