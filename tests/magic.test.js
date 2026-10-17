const fs=require('fs'),vm=require('vm');

const D=__dirname+'/../src/';const js=fs.readdirSync(D).sort().map(f=>fs.readFileSync(D+f,'utf8')).join('\n');
const ctx=new Proxy({},{get:(t,k)=>k=='measureText'?()=>({width:10}):(k=='createRadialGradient'||k=='createLinearGradient')?()=>({addColorStop(){}}):(k in t?t[k]:()=>{}),set:(t,k,v)=>{t[k]=v;return true}});
const mk=()=>({style:{},kids:[],appendChild(c){this.kids.push(c)},set innerHTML(v){this.kids=[];this._h=v},get innerHTML(){return this._h||''},getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:960,height:600}),insertAdjacentHTML(){}});
const els={};global.document={getElementById:i=>els[i]||(els[i]=mk()),createElement:()=>mk()};
global.window=global;global.performance={now:()=>0};global.requestAnimationFrame=()=>{};global.localStorage={getItem:()=>null,setItem(){}};global.setInterval=()=>0;global.AudioContext=function(){throw 1};
let errs=[];console.error=e=>errs.push(String(e&&e.stack||e).split('\n').slice(0,2).join(' | '));
vm.runInThisContext(js);const R=c=>vm.runInThisContext(c);const ov=els.ov;let out=[];const ok=(n,c)=>out.push((c?'OK   ':'FAIL ')+n);
const fresh=()=>{R('run(9);E=[];P.mp=P.mmp=500;P.hp=P.mhp;P.stcd=0;P.cd[4]=0;P.cc=0');R('window.e=spawn("tank",P.x+60,P.y);e.sp=0;e.hp=e.mhp=100000;e.cd=99')};
// estabilidad: 3 estilos 600 frames con grimorio y hechizo propio
for(const w of [0,5,9]){R(`run(${w});P.sp={a:'fire',b:'light',f:'nova'}`);for(let i=0;i<600;i++)R(`K[KY.spell]=1;M.d=1;loop(${i}*16)`)}
ok('frames con hechizo propio sin errores',errs.length==0);
// 1 Sobrecarga de plasma
fresh();R('P.sp={a:"fire",b:"light",f:"nova"}');let mp0=R('P.mp');R('castSp()');ok('Sobrecarga: gasta man\u00e1 '+(mp0-R('P.mp')).toFixed(0),R('P.mp')<mp0);ok('Sobrecarga: da\u00f1a y quema',R('e.hp')<100000&&R('e.st.burn')>0);ok('Sobrecarga: aturde 1\u00aa vez',R('e.st.stun')>0);
let mp1=R('P.mp');R('castSp()');ok('enfriamiento impide recast sin gastar',R('P.mp')==mp1);
R('P.cd[4]=0;e.st.stun=0;castSp()');ok('l\u00edmite de aturdimiento (6 s)',!(R('e.st.stun')>0));
// 2 Conductividad
fresh();R('P.sp={a:"light",b:"water",f:"nova"}');R('castSp()');ok('Conductividad: empapa',R('e.st.wet')>0);
fresh();R('hit(e,100,"m",{ch:1})');const dry=100000-R('e.hp');R('e.hp=100000;apply(e,{wet:5});hit(e,100,"m",{ch:1})');ok('empapado +60% '+((100000-R('e.hp'))/dry).toFixed(2),(100000-R('e.hp'))/dry>1.5);
// 3 hielo+agua congela
fresh();R('apply(e,{wet:5});EL.ice.h(e,{dmg:1})');ok('hielo sobre empapado congela',R('e.st.stun')>=1.1);
// 4 ra\u00edces detienen
fresh();R('e.cd=99;e.al=1;apply(e,{root:2})');const x0=R('e.x');for(let i=0;i<20;i++)R('upE(.05)');ok('ra\u00edz inmoviliza',Math.abs(R('e.x')-x0)<.01);
// 5 Incineraci\u00f3n impura consume corrupci\u00f3n
fresh();R('apply(e,{cor:5});P.sp={a:"corr",b:"fire",f:"nova"}');const c5=R('e.st.cor');R('castSp()');ok('Incineraci\u00f3n consume corrupci\u00f3n '+c5+'->'+R('e.st.cor'),R('e.st.cor')===0||R('e.st.cor')<c5);
// 6 corrupci\u00f3n tope y da\u00f1o
fresh();R('for(let i=0;i<9;i++)apply(e,{cor:2})');ok('corrupci\u00f3n tope 10',R('e.st.cor')==10);const hc=R('e.hp');for(let i=0;i<20;i++)R('upE(.05)');ok('corrupci\u00f3n da\u00f1o periódico',R('e.hp')<hc);
// 7 Pacto carmes\u00ed: coste vida y no consume si no puede
fresh();R('P.sp={a:"blood",b:"dark",f:"nova"}');const hp0=R('P.hp');R('castSp()');ok('Pacto carmes\u00ed sacrifica vida '+(hp0-R('P.hp')).toFixed(0),R('P.hp')<hp0&&R('e.st.curse')>0);
R('P.hp=5;P.cd[4]=0');const m2=R('P.mp');R('castSp()');ok('sin vida suficiente NO consume man\u00e1',R('P.mp')==m2&&R('P.cd[4]')==0);
fresh();R('P.mp=1;P.sp={a:"fire",b:"",f:"bolt"}');R('castSp()');ok('sin man\u00e1 no lanza ni gasta enfriamiento',R('P.cd[4]')==0);
// 8 zona
fresh();R('P.sp={a:"ice",b:"plant",f:"zone"};P.face=0;M.x=P.x+60;M.y=P.y;castSp()');ok('zona creada',R('ZN.length')==1);const hz=R('e.hp');R('zn(.7)');ok('zona da\u00f1a y ralentiza/enraiza',R('e.hp')<hz&&R('e.st.root')>0);for(let i=0;i<10;i++)R('zn(.5)');ok('zona expira',R('ZN.length')==0);
// 9 proyectil con elemento
fresh();R('P.sp={a:"rock",b:"light",f:"bolt"};P.face=0;castSp()');for(let i=0;i<30;i++)R('upPR(.016)');ok('proyectil elemental impacta (fractura)',R('e.st.frac')>0);
// 10 roca fractura +20%
fresh();R('hit(e,100,"m")');const n0=100000-R('e.hp');R('e.hp=100000;apply(e,{frac:6});hit(e,100,"m")');ok('fractura +20% '+((100000-R('e.hp'))/n0).toFixed(2),(100000-R('e.hp'))/n0>1.15);
// 11 jefe: duraci\u00f3n de control reducida
R('E=[];window.b=spawn("boss",480,160);b.sp=0;apply(b,{root:2})');ok('jefe: ra\u00edz reducida a 1s',Math.abs(R('b.st.root')-1)<.01);
// 12 muerte limpia estados
fresh();R('apply(e,{burn:5,cor:3,bleed:2,root:3});e.hp=1;hit(e,50,"m")');R('upE(.016)');ok('muerte elimina enemigo con estados',R('E.indexOf(e)')==-1);
// 13 daga: hemorragia, detonaci\u00f3n y reliquias
fresh();R('P.w=mk(WP.findIndex(w=>w.n=="Daga de la Hemorragia"));ST();for(let i=0;i<5;i++)apply(e,{bleed:1})');ok('hemorragia acumula '+R('e.st.bleedN'),R('e.st.bleedN')==5);
R('P.cd[3]=0;P.mp=999;K[KY.r]=1;rk(.016);K[KY.r]=0');ok('R detona hemorragia',R('e.st.bleedN')==0);
fresh();R('RL.find(r=>r[0]=="Venas abiertas")[2](P);for(let i=0;i<12;i++)apply(e,{bleed:1})');ok('Venas abiertas: tope 12',R('e.st.bleedN')==12);
fresh();R('RL.find(r=>r[0]=="Hoja envenenada")[2](P);hit(e,10,"p")');ok('Hoja envenenada aplica veneno',R('e.st.poison')>0);
// 14 grimorio UI
R('run(9);book()');ok('grimorio abre',R('G.bk')==1&&ov.innerHTML.includes('Grimorio'));R('book()');ok('grimorio cierra con B',R('G.bk')==0&&R('G.ov')==0);
// 15 reinicio limpio
R('P.sp={a:"fire",b:"light",f:"zone"};M.x=P.x;castSp()');R('hurtP(9999)');ok('derrota con zona activa',R('G.st')=='over');R('menu()');R('run(0)');ok('nueva partida sin zonas ni estados previos',R('ZN.length')==0&&R('G.st')=='play'&&R('P.cd[4]')===undefined);
console.log(out.join('\n'));console.log('errores consola:',errs.length,[...new Set(errs)].slice(0,4));
