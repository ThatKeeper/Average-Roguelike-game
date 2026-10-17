const fs=require('fs'),vm=require('vm');

const D=__dirname+'/../src/';const js=fs.readdirSync(D).sort().map(f=>fs.readFileSync(D+f,'utf8')).join('\n');
const ctx=new Proxy({},{get:(t,k)=>k=='measureText'?()=>({width:10}):(k=='createRadialGradient'||k=='createLinearGradient')?()=>({addColorStop(o,c){if(typeof c=='string'&&c[0]=='#'&&![4,5,7,9].includes(c.length))throw new SyntaxError('color invalido '+c)}}):(k in t?t[k]:()=>{}),set:(t,k,v)=>{if(['fillStyle','strokeStyle','shadowColor'].includes(k)&&typeof v=='string'&&v[0]=='#'&&![4,5,7,9].includes(v.length))throw new SyntaxError('color invalido '+v);t[k]=v;return true}});
const mk=()=>({style:{},kids:[],appendChild(c){this.kids.push(c)},set innerHTML(v){this.kids=[];this._h=v},get innerHTML(){return this._h||''},getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:960,height:600}),insertAdjacentHTML(){}});
const els={};global.document={getElementById:i=>els[i]||(els[i]=mk()),createElement:()=>mk()};
global.window=global;global.performance={now:()=>0};global.requestAnimationFrame=()=>{};global.localStorage={getItem:()=>null,setItem(){}};global.setInterval=()=>0;global.AudioContext=function(){throw 1};
let errs=[];console.error=e=>errs.push(String(e&&e.stack||e).split('\n').slice(0,2).join(' | '));
vm.runInThisContext(js);const R=c=>vm.runInThisContext(c);const ov=els.ov;let out=[];const ok=(n,c)=>out.push((c?'OK   ':'FAIL ')+n);
const fresh=()=>{R('run(9);E=[];P.mp=P.mmp=500;P.hp=P.mhp;P.stcd=0;P.cd[4]=0;P.cc=0');R('window.e=spawn("tank",P.x+60,P.y);e.sp=0;e.hp=e.mhp=100000;e.cd=99')};

const allB=(n=ov,a=[])=>{(n.kids||[]).forEach(c=>{if(c.onclick)a.push(c);allB(c,a)});return a};const txt=b=>b.textContent||b.innerHTML||'';
const EK=R('Object.keys(EL)');let pairs=0,bad=[],noCombo=[];
for(let i=0;i<EK.length;i++)for(let j=i+1;j<EK.length;j++){const key=[EK[i],EK[j]].sort().join('+');pairs++;if(!R(`!!CB["${key}"]`)){noCombo.push(key);continue}
 try{R(`run(9);E=[];P.mp=P.mmp=999;P.hp=P.mhp;P.cd=[0,0,0,0];P.stcd=0;P.face=0;P.cc=0;window.e=spawn("tank",P.x+70,P.y);e.sp=0;e.al=1;e.cd=99;e.hp=e.mhp=1e6;window.q=spawn("grunt",P.x+120,P.y+30);q.sp=0;q.hp=q.mhp=1e6;q.cd=99;P.sp={a:"${EK[i]}",b:"${EK[j]}",f:"nova"};M.x=P.x+70;M.y=P.y;castSp();for(let k=0;k<6;k++){zn(.7);upPR(.1)}`);
  const hurt=1e6-R('e.hp')>0||Object.keys(R('e.st')).length>0;if(!hurt)bad.push(key)}catch(er){bad.push(key+':'+er.message)}}
ok(`las ${pairs} parejas de elementos tienen combinaci\u00f3n propia`+(noCombo.length?' (faltan '+noCombo.join(',')+')':''),noCombo.length==0&&pairs==45);
ok('todas las combinaciones lanzan, da\u00f1an o aplican estados'+(bad.length?' FALLAN:'+bad.join(','):''),bad.length==0);
// cada elemento tiene al menos 4 sinergias
ok('cada elemento participa en \u22654 combinaciones',EK.every(k=>R(`Object.keys(CB).filter(c=>c.split("+").includes("${k}")).length`)>=4));
// efectos concretos
const fr2=()=>{R('run(9);E=[];P.mp=P.mmp=999;P.hp=P.mhp;P.cd=[0,0,0,0];P.stcd=0;P.face=0;P.cc=0;window.e=spawn("tank",P.x+70,P.y);e.sp=0;e.al=1;e.cd=99;e.hp=e.mhp=1e6;window.q=spawn("grunt",P.x+110,P.y);q.sp=0;q.al=1;q.cd=99;q.hp=q.mhp=1e6')};
fr2();R('P.sp={a:"blood",b:"wind",f:"nova"};castSp()');ok('Remolino carmes\u00ed contagia hemorragia',R('e.st.bleedN')>0&&R('q.st.bleedN')>0);
fr2();R('apply(e,{cor:6});P.sp={a:"corr",b:"light",f:"nova"};castSp()');ok('Cortocircuito consume corrupci\u00f3n',R('e.st.cor')===0);
fr2();R('apply(e,{stun:3});e.hp=1e6;P.sp={a:"ice",b:"rock",f:"nova"};const h0=e.hp;castSp()');ok('Rompehielos destroza congelados (consume aturdimiento)',!(R('e.st.stun')>0));
fr2();R('P.sp={a:"dark",b:"wind",f:"nova"};castSp()');ok('Vendaval umbr\u00edo maldice a los cercanos',R('e.st.curse')>0&&R('q.st.curse')>0);
fr2();R('P.sp={a:"light",b:"wind",f:"nova"};castSp()');ok('Tormenta el\u00e9ctrica aturde 1\u00aa vez',R('e.st.stun')>0);const mr=Math.random;Math.random=()=>.99;R('P.cd[4]=0;e.st.stun=0;castSp()');Math.random=mr;ok('...pero no en el siguiente lanzamiento (l\u00edmite)',!(R('e.st.stun')>0));
fr2();R('P.sp={a:"fire",b:"rock",f:"nova"};apply(e,{frac:6});const h1=e.hp;castSp()');const dF=1e6-R('e.hp');fr2();R('P.sp={a:"fire",b:"rock",f:"nova"};castSp()');ok('Magma +da\u00f1o contra fracturados',dF>(1e6-R('e.hp')));
// grimorio muestra solo sinergias del elemento
R('run(9);P.sp={a:"rock",b:"",f:"bolt"};book()');ok('grimorio lista sinergias del elemento principal',ov.innerHTML.includes('Sinergias de Roca')&&!ov.innerHTML.includes('Sinergias de Fuego'));R('hide()');
// ---- ventanas: sin desbordamiento
const css=fs.readFileSync(__dirname+'/../styles.css','utf8');ok('CSS: la ventana desplaza (overflow) y no centra recortando',/overflow:auto/.test(css)&&/justify-content:flex-start/.test(css)&&/first-child\{margin-top:auto/.test(css));
R('run(0);P.gold=50');R('for(let i=0;i<14;i++)P.bag.push(Object.assign({},IT[i%IT.length],{id:i}))');R('inv()');let cards=ov.kids.filter(k=>k.kids).reduce((n,r)=>n+r.kids.filter(c=>c.kids&&c.kids.length>2).length,0);
ok('inventario con 14 objetos muestra solo una p\u00e1gina (6)',allB().filter(b=>b.textContent=='Equipar'||b.textContent=='Equipar').length<=6&&allB().filter(b=>b.textContent=='Equipar').length==6);
allB().find(b=>b.textContent=='Siguiente \u203a').onclick();ok('paginaci\u00f3n avanza (6 m\u00e1s)',R('G.ipg')==1&&allB().filter(b=>b.textContent=='Equipar').length==6);
allB().find(b=>b.textContent=='Siguiente \u203a').onclick();ok('\u00faltima p\u00e1gina con el resto (2)',allB().filter(b=>b.textContent=='Equipar').length==2&&allB().find(b=>b.textContent=='Siguiente \u203a').disabled===true);
allB().find(b=>b.textContent=='Casco').onclick();ok('filtro por ranura: solo cascos',R('G.ipg')==0&&R('P.bag.filter(i=>i.s=="h").length')>0&&allB().filter(b=>b.textContent=='Equipar').length==R('Math.min(6,P.bag.filter(i=>i.s=="h").length)'));
allB().find(b=>b.textContent=='Todo').onclick();allB().find(b=>b.textContent=='Orden: Rareza').onclick();const rs=[];(function w(n){(n.kids||[]).forEach(c=>{if(c.textContent=='Equipar')rs.push(c);w(c)})})(ov);ok('orden por rareza no pierde objetos',R('P.bag.length')==14);
const n0=R('P.bag.length');allB().find(b=>b.textContent=='Descartar').onclick();ok('descartar quita exactamente 1 objeto',R('P.bag.length')==n0-1);
R('G.ifl="";G.iso="x";hide()');
// controles en cuadr\u00edcula (botones dentro de un contenedor flex-wrap)
R('menu();run(0);pause();hide();G.st="menu";ctrls()');const wrap=ov.kids.find(k=>k.style&&/flex-wrap:wrap/.test(k.style.cssText||'')&&k.kids.length>=10);ok('controles: 14 botones agrupados en cuadr\u00edcula con salto de l\u00ednea',!!wrap);
console.log(out.join('\n'));console.log('errores consola:',errs.length,[...new Set(errs)].slice(0,4));
