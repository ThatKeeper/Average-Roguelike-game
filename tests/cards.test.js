// Cartas de hechizo (solo Mago), persistencia entre "reinicios" (contextos nuevos), migraci\u00f3n de guardados y HUD.
const fs=require('fs'),vm=require('vm');const D=__dirname+'/../src/';const js=fs.readdirSync(D).sort().map(f=>fs.readFileSync(D+f,'utf8')).join('\n');
const bad=c=>typeof c=='string'&&c[0]=='#'&&![4,5,7,9].includes(c.length);
function env(store){const ctx=new Proxy({},{get:(t,k)=>k=='measureText'?()=>({width:10}):(k=='createRadialGradient'||k=='createLinearGradient')?()=>({addColorStop(o,c){if(bad(c))throw new SyntaxError('color invalido '+c)}}):(k in t?t[k]:()=>{}),set:(t,k,v)=>{if(['fillStyle','strokeStyle','shadowColor'].includes(k)&&bad(v))throw new SyntaxError('color invalido '+v);t[k]=v;return true}});
 const mk=()=>({style:{},kids:[],appendChild(c){this.kids.push(c)},set innerHTML(v){this.kids=[];this._h=v},get innerHTML(){return this._h||''},getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:960,height:600}),insertAdjacentHTML(a,h){this._h=(this._h||'')+h},dataset:{},cloneNode(){return mk()},remove(){},closest(){return null}});
 const els={},errs=[],sb={errs,document:{getElementById:i=>els[i]||(els[i]=mk()),createElement:()=>mk()},performance:{now:()=>0},requestAnimationFrame(){},localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v)}},setInterval(){},AudioContext:function(){throw 1},console:{error(e){errs.push(String(e&&e.stack||e).split('\n')[0])},log:console.log}};sb.window=sb;vm.createContext(sb);vm.runInContext(js,sb);return{R:c=>vm.runInContext(c,sb),els,errs}}
const allH=n=>(n._h||'')+(n.kids||[]).map(allH).join('');let out=[],fail=0;const ok=(n,c)=>{out.push((c?'OK   ':'FAIL ')+n);if(!c)fail++};const J=JSON.stringify;
// ---- guardado: nuevo, antiguo, corrupto ----
let st={};let A=env(st);ok('partida nueva: versi\u00f3n 2, 3 cartas iniciales desbloqueadas y equipadas',A.R('S.v')==2&&J(A.R('Object.keys(S.cards.unlocked).sort()'))==J(['fire','ice','light'])&&J(A.R('S.cards.slots'))==J(['fire','ice','light',null]));
let st2={idv1:'{"best":5,"souls":3,"pw":1}'};A=env(st2);ok('guardado antiguo (v1): se conserva y se migra; jefes de niveles superados cuentan como derrotados',A.R('S.best')==5&&A.R('S.souls')==3&&A.R('S.pw')==1&&J(Object.keys(A.R('S.bosses')))==J(['0','1','2','3'])&&A.R('!!S.cards.unlocked.water&&!!S.cards.unlocked.rock&&!!S.cards.unlocked.dark&&!S.cards.unlocked.blood&&!S.cards.unlocked.corr'));
for(const bad2 of['not json{','{"cards":"x","bosses":5,"best":"abc","v":2}','{"cards":{"unlocked":{"zzz":1,"fire":1},"slots":["zzz",3,null,"corr",9,9]},"v":2}','null']){const e=env({idv1:bad2});ok('guardado corrupto arranca sin errores: '+bad2.slice(0,22),e.errs.length==0&&e.R('S.v')==2&&e.R('S.cards.slots.length')==4&&e.R('S.cards.slots.every(k=>k===null||!!S.cards.unlocked[k])')&&!e.R('"zzz" in S.cards.unlocked'))}
// ---- requisitos exactos y alcanzables ----
A=env({});ok('hay 55 cartas (10 elementos + 45 combinaciones)',A.R('CORDER.length')==55);
ok('requisito exacto de una carta de elemento (Agua) y de jefe (Corrupci\u00f3n)',A.R('CARDS.water.req.map(reqTxt)[0]')=='Alcanzar la profundidad 2 (tu mejor: 0)'&&A.R('CARDS.corr.req.map(reqTxt)[0]')=='Derrotar a Zeth, el Arconte en una partida normal');
ok('requisito de combinaci\u00f3n: elementos previos + profundidad (Plasma: Fuego+Electricidad)',J(A.R('CARDS["fire+light"].req'))==J([['card','fire'],['card','light'],['depth',2]]));
A.R('S.best=8;S.bosses={0:1,1:1,2:1,3:1,4:1,5:1,6:1};checkUnlocks()');ok('todas las cartas son desbloqueables con la progresi\u00f3n normal (profundidad 8 y 7 jefes normales)',A.R('CORDER.every(k=>S.cards.unlocked[k])'));
A=env({});ok('desde cero solo las iniciales est\u00e1n desbloqueadas y ninguna lo est\u00e1 sin cumplir requisitos',A.R('CORDER.every(k=>!S.cards.unlocked[k]||CARDS[k].req.every(reqOK))')&&A.R('CORDER.filter(k=>S.cards.unlocked[k]).length')==3);
// ---- desbloqueo por juego real y persistencia tras "cerrar el juego" ----
st={};A=env(st);A.R('run(9);G.d=1;genLevel();enter(G.R.findIndex(r=>r.tp=="boss"),4);E.forEach(e=>e.sp=0);P.dm=500;hit(E.find(e=>e.t=="boss"),1e12,"p")');ok('derrotar a Valdris (partida normal) desbloquea Roca',A.R('!!S.cards.unlocked.rock'));
let B=env(st);ok('tras cerrar y reabrir el juego la carta sigue desbloqueada',B.R('!!S.cards.unlocked.rock&&!!S.bosses[0]'));
A.R('S.best=0;S.cards.unlocked={};S.bosses={}');st={};A=env(st);A.R('menu();arena(0)');A.R('E.forEach(e=>e.sp=0);P.dm=500;hit(E.find(e=>e.t=="boss"),1e12,"p")');ok('derrotar al jefe en pr\u00e1ctica NO desbloquea cartas ni guarda jefes',!A.R('S.cards.unlocked.rock')&&J(A.R('S.bosses'))=='{}');
st={};A=env(st);A.R('run(9);G.d=2;P.hp=1;P.inv=0;P.dash=null;S.best=0;G.d=3;hurtP(9999)');B=env(st);ok('al morir en profundidad 3 se guardan mejor profundidad y cartas (Agua, Planta)',B.R('S.best')==3&&B.R('!!S.cards.unlocked.water&&!!S.cards.unlocked.plant'));
// ---- equipar, mover, vaciar; persistencia de espacios ----
st={};A=env(st);A.R('run(9)');ok('una carta bloqueada no se puede equipar',A.R('equipCard("water",3)')===false&&A.R('S.cards.slots[3]')===null);
A.R('S.best=2;checkUnlocks()');ok('equipar una carta desbloqueada',A.R('equipCard("water",3)')===true&&J(A.R('S.cards.slots'))==J(['fire','ice','light','water']));
A.R('equipCard("fire",3)');ok('arrastrar a un espacio ocupado intercambia',J(A.R('S.cards.slots'))==J(['water','ice','light','fire']));
A.R('drop("light",-1,2)');ok('arrastrar una carta equipada fuera del espacio la retira',A.R('S.cards.slots[2]')===null);A.R('drop("light",2,-1)');ok('soltar una carta de la colecci\u00f3n sobre un espacio la equipa',A.R('S.cards.slots[2]')==='light');
B=env(st);ok('el equipamiento de cartas persiste entre partidas y reinicios',J(B.R('S.cards.slots'))==J(['water','ice','light','fire']));
// ---- exclusivo del Mago ----
for(const [w,n] of[[0,'Guerrero'],[5,'Cazador']]){A.R(`run(${w})`);ok(n+': sin sistema de cartas (no equipa, no abre ventana, teclas 1-4 sin efecto)',A.R('P.cls')!='g'&&A.R('equipCard("fire",0)')===false&&(A.R('book()'),A.R('!G.bk&&!G.ov'))&&(A.R('P.mp=P.mmp;K.Digit1=1;K.Digit2=1;upP(1/60);K={};P.mp==P.mmp')))}
A.R('run(9);P.w=mk(5);ST()');ok('el Mago conserva las cartas aunque cambie de arma',A.R('P.cls')=='g'&&A.R('equipCard("fire",0)')===true);
A.errs.length=0;for(const w of[0,5,9]){A.R(`run(${w});draw()`)}ok('el HUD se dibuja en las tres clases sin errores',A.errs.length==0);
// ---- lanzar cartas ----
A.R('run(9);E=[];P.mp=P.mmp=500;P.cd=[0,0,0,0];P.face=0;K={};S.cards.slots=["fire","ice","light",null]');const m0=A.R('P.mp');A.R('castCard(0)');const m1=A.R('P.mp');ok('lanzar la carta 1 gasta man\u00e1 una vez y activa su enfriamiento propio',m1<m0&&A.R('P.cd[4]')>0&&!(A.R('P.cd[5]')>0));A.R('castCard(0)');ok('relanzar durante el enfriamiento no gasta man\u00e1',A.R('P.mp')==m1);A.R('castCard(1)');ok('la carta 2 es independiente de la 1',A.R('P.mp')<m1&&A.R('P.cd[5]')>0);
A.R('castCard(3)');ok('un espacio vac\u00edo no lanza nada',A.R('P.mp')>0);
A.R('P.cd=[0,0,0,0];P.mp=1');const m2=A.R('P.mp');A.R('castCard(0)');ok('sin man\u00e1 suficiente no lanza ni gasta',A.R('P.mp')==m2&&!(A.R('P.cd[4]')>0));
// ---- ventana y HUD ----
A.errs.length=0;A.R('run(9);S.best=99;S.bosses={0:1,1:1,2:1,3:1,4:1,5:1,6:1};checkUnlocks();book()');ok('la ventana de cartas se abre',A.R('G.bk')==1&&A.els.ov.innerHTML.includes('Cartas de hechizo')&&A.els.ov.innerHTML.includes('55/55'));
for(const f of['','*','fire','corr','light'])A.R(`G.cel="${f}";G.cpg=0;book(1)`);A.R('G.cel="";G.cpg=3;book(1)');ok('filtros y paginaci\u00f3n sin errores',A.errs.length==0);
A.R('S.best=0;S.bosses={};S.cards.unlocked={fire:1,ice:1,light:1};G.cel="corr";G.cpg=0;book(1)');ok('una carta bloqueada muestra requisitos con \u2717 y el progreso actual',allH(A.els.ov).includes('BLOQUEADA')&&allH(A.els.ov).includes('\u2717 Derrotar a Zeth, el Arconte en una partida normal')&&allH(A.els.ov).includes('(tu mejor: 0)'));
A.R('book()');ok('B vuelve a cerrar la ventana',A.R('G.bk')==0&&A.R('G.ov')==0);
A.R('run(9);S.cards.slots=["fire","ice","light",null];M.x=12+4*49+10;M.y=600-42-14+10;draw()');ok('el HUD muestra informaci\u00f3n contextual al pasar el rat\u00f3n por una casilla',A.R('HT')!=null);
console.log(out.join('\n'));console.log('errores de consola:',A.errs.length);process.exit(fail?1:0);
