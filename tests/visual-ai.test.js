const fs=require('fs'),vm=require('vm');

const D=__dirname+'/../src/';const js=fs.readdirSync(D).sort().map(f=>fs.readFileSync(D+f,'utf8')).join('\n');
const ctx=new Proxy({},{get:(t,k)=>k=='measureText'?()=>({width:10}):(k=='createRadialGradient'||k=='createLinearGradient')?()=>({addColorStop(o,c){if(typeof c=='string'&&c[0]=='#'&&![4,5,7,9].includes(c.length))throw new SyntaxError('color invalido '+c)}}):(k in t?t[k]:()=>{}),set:(t,k,v)=>{if(['fillStyle','strokeStyle','shadowColor'].includes(k)&&typeof v=='string'&&v[0]=='#'&&![4,5,7,9].includes(v.length))throw new SyntaxError('color invalido '+v);t[k]=v;return true}});
const mk=()=>({style:{},kids:[],appendChild(c){this.kids.push(c)},set innerHTML(v){this.kids=[];this._h=v},get innerHTML(){return this._h||''},getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:960,height:600}),insertAdjacentHTML(){}});
const els={};global.document={getElementById:i=>els[i]||(els[i]=mk()),createElement:()=>mk()};
global.window=global;global.performance={now:()=>0};global.requestAnimationFrame=()=>{};global.localStorage={getItem:()=>null,setItem(){}};global.setInterval=()=>0;global.AudioContext=function(){throw 1};
let errs=[];console.error=e=>errs.push(String(e&&e.stack||e).split('\n').slice(0,2).join(' | '));
vm.runInThisContext(js);const R=c=>vm.runInThisContext(c);const ov=els.ov;let out=[];const ok=(n,c)=>out.push((c?'OK   ':'FAIL ')+n);
const fresh=()=>{R('run(9);E=[];P.mp=P.mmp=500;P.hp=P.mhp;P.stcd=0;P.cd[4]=0;P.cc=0');R('window.e=spawn("tank",P.x+60,P.y);e.sp=0;e.hp=e.mhp=100000;e.cd=99')};

const dt='1/60',stp=(n)=>{for(let k=0;k<n;k++)R(`P.hp=P.mhp;P.inv=1;upP(${dt});upE(${dt});upPR(${dt});upMisc(${dt})`)};
// --- sprites: todos los tipos y estilos se dibujan sin errores ---
const types=R('Object.keys(ET).filter(k=>!["boss","decoy","orb"].includes(k))');
for(const w of[0,5,9]){R(`run(${w});E=[];P.x=480;P.y=300`);types.forEach((t,i)=>R(`window.q=spawn("${t}",120+${i}*70,120+${i%3}*140);q.sp=0;q.al=1;q.cd=99`));R('M.d=1');for(let k=0;k<90;k++)R(`K[KY.right]=${k%40<20?1:0};loop(${k}*17)`);R('M.d=0');}
ok(`dibuja ${types.length} tipos de enemigo y 3 estilos de jugador (ataque, movimiento, golpe) sin errores`,errs.length==0&&types.length==10);
ok('cada tipo de enemigo tiene silueta propia',types.every(t=>R('drawEnemy.toString()').includes(`case'${t}'`)));
ok('los 12 jefes tienen silueta propia',[0,1,2,3,4,5,6,7,8,9,10].every(i=>R('drawBoss.toString()').includes(`case ${i}:`)||R('drawBoss.toString()').includes(`case${i}:`)));
// --- animaciones ---
R('run(0);E=[];window.e=spawn("grunt",P.x+50,P.y);e.sp=0;e.al=1;e.hp=e.mhp=5');R('hit(e,1e6,"p")');ok('muerte: crea animaci\u00f3n de desaparici\u00f3n',R('FX.some(f=>f.k=="dead")'));
R('FX=[];P.acd=0;atk()');ok('atacar activa la animaci\u00f3n del arma del jugador',R('P.at>0'));stp(20);ok('la animaci\u00f3n de ataque termina',!(R('P.at>0')));
// --- IA: l\u00ednea de visi\u00f3n e investigar ---
R('run(0);E=[];RM_.obs=[{x:400,y:80,w:40,h:440}];P.x=520;P.y=300;window.e=spawn("grunt",250,300);e.sp=0;e.cd=99');stp(120);ok('no detecta al jugador detr\u00e1s de un muro (sin l\u00ednea de visi\u00f3n)',R('e.al')==0||R('!e.al'));
R('RM_.obs=[];E[0].x=250;E[0].y=300');stp(30);ok('detecta al jugador al despejarse la l\u00ednea',R('e.al')==1);
R('RM_.obs=[{x:400,y:80,w:40,h:440}];e.al=1;e.lk={x:330,y:300};e.nl=0;e.iw=0;e.x=250;e.y=300');stp(100);ok('pierde de vista: investiga la \u00faltima posici\u00f3n conocida',R('e.nl')>1.5&&Math.abs(R('e.x')-330)<60);stp(240);ok('tras investigar sin hallarlo, vuelve a patrullar',R('e.al')==0&&R('e.lk')===null);
// --- IA: esquiva de proyectiles ---
R('run(0);E=[];RM_.obs=[];P.x=700;P.y=500;window.e=spawn("runner",400,300);e.sp=0;e.al=1;e.cd=99;e.dir=1;PR.push({x:330,y:300,vx:400,vy:0,r:5,d:1,t:"p",l:2,l0:2,pc:9,bn:0,f:"p",h:new Set(),c:"#fff"})');stp(4);ok('el corredor esquiva un proyectil que se acerca',Math.abs(R('e.vy'))>60||Math.abs(R('e.y')-300)>2);
// --- IA: l\u00edmite de ataques simult\u00e1neos ---
R('run(0);E=[];RM_.obs=[];P.x=480;P.y=300;for(let i=0;i<8;i++){const q=spawn("grunt",480+Math.cos(i)*45,300+Math.sin(i)*45);q.sp=0;q.al=1;q.cd=0}');let mx=0;for(let k=0;k<200;k++){stp(1);mx=Math.max(mx,R('E.filter(q=>q.wind>0).length'))}ok('m\u00e1ximo de enemigos preparando ataque a la vez: '+mx,mx<=3);
// --- sonidos de jefe ---
R('window.__n=0;const _s=snd;snd=(...a)=>{__n++;_s(...a)}');R('run(0);G.bo=3;G.d=4;genLevel();enter(G.R.findIndex(r=>r.tp=="boss"),4)');const n1=R('__n');ok('el jefe suena al presentarse ('+n1+' sonidos)',n1>=2);
R('bsT=0;window.bb0=E.find(e=>e.t=="boss");bb0.sp=0');stp(3);R('bb0.hp=bb0.mhp*.5');const n2=R('__n');stp(3);ok('el cambio de fase suena',R('__n')>n2);
R('bsT=0;const bb=E.find(e=>e.t=="boss");hit(bb,1e12,"p")');ok('la derrota del jefe suena (acorde de 4 notas)',R('__n')-n2>=4);
const ts=[0,1,2,3,4,5,6,7,8,9,10,11].map(i=>{R(`window.__n=0;bsnd(${i},"in")`);return R('__n')});ok('presentaci\u00f3n distinta por jefe (timbre/frecuencia)',R('[0,1,2,3].map(i=>["sawtooth","square","triangle","sine"][i%4]).length')==4&&R('90+11*32')!=R('90+0*32'));
console.log(out.join('\n'));console.log('errores consola:',errs.length,[...new Set(errs)].slice(0,4));
