const fs=require('fs'),vm=require('vm');

const D=__dirname+'/../src/';const js=fs.readdirSync(D).sort().map(f=>fs.readFileSync(D+f,'utf8')).join('\n');
const ctx=new Proxy({},{get:(t,k)=>k=='measureText'?()=>({width:10}):(k=='createRadialGradient'||k=='createLinearGradient')?()=>({addColorStop(o,c){if(typeof c=='string'&&c[0]=='#'&&![4,5,7,9].includes(c.length))throw new SyntaxError('color invalido '+c)}}):(k in t?t[k]:()=>{}),set:(t,k,v)=>{if(['fillStyle','strokeStyle','shadowColor'].includes(k)&&typeof v=='string'&&v[0]=='#'&&![4,5,7,9].includes(v.length))throw new SyntaxError('color invalido '+v);t[k]=v;return true}});
const mk=()=>({style:{},kids:[],appendChild(c){this.kids.push(c)},set innerHTML(v){this.kids=[];this._h=v},get innerHTML(){return this._h||''},getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:960,height:600}),insertAdjacentHTML(){},dataset:{},cloneNode(){return mk()},remove(){},closest(){return null}});
const els={};global.document={getElementById:i=>els[i]||(els[i]=mk()),createElement:()=>mk()};
global.window=global;global.performance={now:()=>0};global.requestAnimationFrame=()=>{};global.localStorage={getItem:()=>null,setItem(){}};global.setInterval=()=>0;global.AudioContext=function(){throw 1};
let errs=[];console.error=e=>errs.push(String(e&&e.stack||e).split('\n').slice(0,2).join(' | '));
vm.runInThisContext(js);const R=c=>vm.runInThisContext(c);const ov=els.ov;let out=[];const ok=(n,c)=>out.push((c?'OK   ':'FAIL ')+n);
const fresh=()=>{R('run(9);E=[];P.mp=P.mmp=500;P.hp=P.mhp;P.stcd=0;P.cd[4]=0;P.cc=0');R('window.e=spawn("tank",P.x+60,P.y);e.sp=0;e.hp=e.mhp=100000;e.cd=99')};

const names=R('BD.map(b=>b.n)');ok('hay 12 jefes con nombre distinto (7 normales + 5 finales)',names.length==12&&new Set(names).size==12);
const srcs=R('BO.map(b=>b.up.toString())');ok('cada jefe tiene su propia implementaci\u00f3n de comportamiento',srcs.length==12&&new Set(srcs).size==12);
const idxs=R('[1,2,3,4,5,6,7,10,20,30,40,50].map(bossIdx)');ok('la progresi\u00f3n alcanza los 12 jefes: '+idxs.join(','),new Set(idxs).size==12);
const dt='1/60';const setup=i=>{R(`run(0);G.d=bossDepth(${i});G.bo=${i};genLevel();P.dm=1;ST();P.hp=P.mhp;enter(G.R.findIndex(r=>r.tp=="boss"),4);window.B=E.find(e=>e.t=="boss")`);};
const step=(n,mv=1)=>{for(let k=0;k<n;k++){R(`K[KY.right]=${mv&&(k%80<40)?1:0};K[KY.left]=${mv&&(k%80>=40)?1:0};P.hp=P.mhp;P.inv=1;P.mp=P.mmp;upP(${dt});upE(${dt});upPR(${dt});upMisc(${dt});${'obs.push(1)'.replace('obs.push(1)','OBS()')}`)}};
R(`window.SEEN={};window.OBS=()=>{const S=SEEN;if(!window.B)return;const b=B;S.lu=S.lu||b.lu>0;S.wd=S.wd||b.wd>0;S.zbig=Math.max(S.zbig||0,Z.length);S.zlong=S.zlong||Z.some(z=>z.m>1.4);S.cv=S.cv||PR.some(p=>p.cv);S.hm=S.hm||PR.some(p=>p.hm);S.dec=Math.max(S.dec||0,E.filter(q=>q.t=="decoy").length);S.imm=S.imm||b.imm>0;S.vul=S.vul||b.vul>0;S.inv=S.inv||P.invc>0;S.dk=S.dk||!!G.dk;S.ch=S.ch||b.ch>0;S.wl=S.wl||b.wl;S.big=S.big||Z.some(z=>z.r>=200);S.mn=Math.max(S.mn||0,(b.mn||[]).length);S.orb=Math.max(S.orb||0,E.filter(q=>q.t=="orb").length);S.fast=S.fast||PR.some(p=>Math.hypot(p.vx,p.vy)>=500&&p.f=="e")}`);
const seen=k=>R(`!!SEEN.${k}`),val=k=>R(`SEEN.${k}||0`);
const fails=[];const chk=(i,n,c)=>{if(!c)fails.push(i+':'+n)};
for(let i=0;i<12;i++){R('window.SEEN={}');setup(i);step(240);const alive=R('B.hp>0&&E.includes(B)');chk(i,'vivo tras presentaci\u00f3n',alive);
 if(i==0){step(2400);chk(i,'embiste',seen('lu'));chk(i,'amaga/prepara',seen('wd'))}
 if(i==1){step(3000);chk(i,'ondas de choque',seen('big'));chk(i,'embestida',seen('wl'))}
 if(i==2){step(2400);chk(i,'disparos curvos',seen('cv'));chk(i,'ventana de recarga',seen('vul'))}
 if(i==3){step(1200);chk(i,'copias',val('dec')>=1)}
 if(i==4){step(1500);chk(i,'trampas retardadas',seen('zlong'));chk(i,'rearme vulnerable',seen('vul'))}
 if(i==5){R('B.hp=B.mhp*.45');step(900);chk(i,'transformaci\u00f3n (imm 1s)',seen('imm'));chk(i,'nuevo estilo con proyectiles curvos',seen('cv'))}
 if(i==6){step(1800);chk(i,'inmune con orbes',seen('imm')&&val('orb')>=3);chk(i,'invierte controles',seen('inv'))}
 if(i==7){step(240);chk(i,'esqueletos e inmunidad',val('mn')>=3&&seen('imm'));R('B.hp=B.mhp*.2');step(900);chk(i,'fase 3: derrumbe (\u226520 zonas)',val('zbig')>=20)}
 if(i==8){step(1800);chk(i,'fase 1: franjas horizontales (\u226524 zonas)',val('zbig')>=24&&val('zbig')<30);chk(i,'vulnerable tras descarga',seen('vul'));R('B.hp=B.mhp*.6;window.SEEN={}');step(2400);chk(i,'fase 2: franjas cruzadas (\u226538 zonas)',val('zbig')>=38)}
 if(i==9){step(1800);chk(i,'oscuridad',seen('dk'));chk(i,'orbes rastreadores',seen('hm'));chk(i,'vulnerable al devorar',seen('vul'))}
 if(i==10){step(1500);chk(i,'rebobina',seen('ch'));R('B.hl0=B.hp;B.ch=.05;B.hp-=1');R('B.hp=B.mhp*.5;B.hl0=B.hp;B.ch=.05');const h0=R('B.hp');step(5,0);chk(i,'cura si no se interrumpe',R('B.hp')>h0);R('B.hp=B.mhp*.5;B.hl0=B.mhp*.5;B.ch=.05;B.hp-=B.mhp*.06');R('B.st={};B.vul=0');step(5,0);chk(i,'se interrumpe con da\u00f1o',R('B.vul')>0||R('B.st.stun')>0)}
 if(i==11){const sig={};for(const w of[0,5,9]){R(`P.w=mk(${w});ST();window.SEEN={};B.t1=0;B.wd=0;E=E.filter(q=>q===B)`);step(300);sig[w]=[seen('lu')||seen('wd'),seen('fast'),seen('hm')||seen('zlong')||val('zbig')>0].join('')}chk(i,'imita estilo: '+JSON.stringify(sig),new Set(Object.values(sig)).size>=2)}
 // muerte: todos pueden derrotarse y no quedan inmunes
 R('P.w=mk(0);ST()');R('window.SEEN={};B.sp=0');let stuck=0,dead=false;for(let k=0;k<30000&&!dead;k++){R(`K[KY.right]=0;P.hp=P.mhp;P.inv=1;upP(${dt});upE(${dt});upPR(${dt});upMisc(${dt});E.filter(q=>q!==B&&q.hp>0).forEach(q=>hit(q,1e9,"p"));if(${k}%12==0)hit(B,B.mhp*.02,"p")`);const imm=R('B.imm>0&&E.filter(q=>q!==B&&q.hp>0).length==0');stuck=imm?stuck+1:0;if(stuck>300){chk(i,'jefe atrapado en inmunidad',false);break}dead=R('B.hp<=0')}
 chk(i,'puede ser derrotado',dead);for(let k=0;k<30;k++)R(`upE(${dt});upMisc(${dt})`);chk(i,'sala despejada y sin restos',R('E.length==0&&G.R[G.cur].cl'))}
ok('mec\u00e1nicas propias de los 12 jefes verificadas'+(fails.length?' FALLAN: '+fails.join(' | '):''),fails.length==0);
// arena y reinicio sin restos
R('menu();run(0)');R('G.bo=undefined');R('arena(8)');ok('arena inicia a Fulgor con personaje de nivel '+R('P.lv'),R('E.some(e=>e.t=="boss"&&e.bi==8)')&&R('P.lv')>10);
R('P.hp=1;P.inv=0;P.dash=null;hurtP(9999)');ok('muerte en combate de jefe: derrota',R('G.st')=='over');R('menu();run(0)');ok('nueva partida sin jefes, proyectiles ni oscuridad',R('E.length==0&&PR.length==0&&Z.length==0&&!G.dk&&!(P.invc>0)'));
console.log(out.join('\n'));console.log('errores consola:',errs.length,[...new Set(errs)].slice(0,4));
