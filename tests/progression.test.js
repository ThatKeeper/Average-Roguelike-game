const fs=require('fs'),vm=require('vm');
const D=__dirname+'/../src/';const js=fs.readdirSync(D).sort().map(f=>fs.readFileSync(D+f,'utf8')).join('\n');
const ctx=new Proxy({},{get:(t,k)=>k=='measureText'?()=>({width:10}):(k=='createRadialGradient'||k=='createLinearGradient')?()=>({addColorStop(o,c){if(typeof c=='string'&&c[0]=='#'&&![4,5,7,9].includes(c.length))throw new SyntaxError('color invalido '+c)}}):(k in t?t[k]:()=>{}),set:(t,k,v)=>{if(['fillStyle','strokeStyle','shadowColor'].includes(k)&&typeof v=='string'&&v[0]=='#'&&![4,5,7,9].includes(v.length))throw new SyntaxError('color invalido '+v);t[k]=v;return true}});
const mk=()=>({style:{},kids:[],appendChild(c){this.kids.push(c)},set innerHTML(v){this.kids=[];this._h=v},get innerHTML(){return this._h||''},getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:960,height:600}),insertAdjacentHTML(){},dataset:{},cloneNode(){return mk()},remove(){},closest(){return null}});
const els={};global.document={getElementById:i=>els[i]||(els[i]=mk()),createElement:()=>mk()};
global.window=global;global.performance={now:()=>0};global.requestAnimationFrame=()=>{};global.localStorage={getItem:()=>null,setItem(){}};global.setInterval=()=>0;global.AudioContext=function(){throw 1};
let errs=[];console.error=e=>errs.push(String(e&&e.stack||e).split('\n').slice(0,2).join(' | '));
vm.runInThisContext(js);const R=c=>vm.runInThisContext(c);const ov=els.ov;let out=[];const ok=(n,c)=>out.push((c?'OK   ':'FAIL ')+n);
const fresh=()=>{R('run(9);E=[];P.mp=P.mmp=500;P.hp=P.mhp;P.stcd=0;P.cd[4]=0;P.cc=0');R('window.e=spawn("tank",P.x+60,P.y);e.sp=0;e.hp=e.mhp=100000;e.cd=99')};

const allB=(n=ov,a=[])=>{(n.kids||[]).forEach(c=>{if(c.onclick)a.push(c);allB(c,a)});return a};const txt=b=>b.textContent||b.innerHTML||'';
// talentos
R('run(0);P.pts=2;ST()');const arm0=R('P.arm');R('tal()');ok('talentos abre con tarjetas',R('G.tl')==1&&allB().length>=7);const skin=allB().find(b=>0)||null;
R('P.tal.skin=1;ST()');ok('talento Piel de piedra +6 armadura',Math.abs(R('P.arm')-arm0-6)<.01);R('P.tal.skin=1;ST()');ok('rango no se duplica al recalcular',Math.abs(R('P.arm')-arm0-6)<.01);
R('hide()');R('P.pts=1;P.tal={};tal()');allB()[0].onclick();ok('gastar punto: pts 1->'+R('P.pts')+', rango '+R('P.tal.bleed'),R('P.pts')==0&&R('P.tal.bleed')==1);allB()[0].onclick();ok('sin puntos no compra',R('P.tal.bleed')==1);R('hide()');
R('P.xp=P.nx;xp(1)');ok('subir de nivel da 1 punto',R('P.pts')>=1);
// resistencias
const tk=(eq,d)=>{R(`G.d=${d};P.eq=${eq};ST();P.hp=P.mhp;P.inv=0;P.dash=null;P.g=0`);const h0=R('P.hp');R('hurtP(20,null)');return h0-R('P.hp')};
R('run(0)');const dnoR=tk('{}',6),dR=tk('{b:Object.assign({},IT.find(i=>i.n=="Manto ign\u00edfugo"))}',6);ok(`resistencia al fuego en lava ${dnoR.toFixed(2)} -> ${dR.toFixed(2)}`,dR<dnoR*.85&&dR>0);
const dCat=tk('{b:Object.assign({},IT.find(i=>i.n=="Manto ign\u00edfugo"))}',1),dCat0=tk('{}',1);ok('en catacumbas la resistencia al fuego no aplica ('+dCat.toFixed(2)+' vs '+dCat0.toFixed(2)+')',dCat>=dCat0*.7&&dCat0>0);
R('P.eq={};ST()');ok('quitar el equipo quita la resistencia',!R('P.res.fire'));
// variantes por bioma
R('run(0);G.d=3;E=[];window.v=spawn("grunt",700,100)');ok('variante de bioma: '+R('v.vn'),R('v.vn')=='Minero'&&R('v.mhp')>40);
// victoria en profundidad 10
R('run(0);G.d=10;RM_.tp="boss";RM_.cl=1;RM_.vc=0;P.gold=100;P.x=480;P.y=300;interact()');ok('victoria ofrece retirarse o seguir',R('G.ov')==1&&allB().length>=2);
const souls0=R('S.souls');allB().find(b=>/Retirarte/.test(txt(b))||true);allB()[0].onclick();ok('retirarse: estado won, almas +150 ('+(R('S.souls')-souls0)+')',R('G.st')=='won'&&R('S.souls')-souls0==150);
allB()[0].onclick();ok('desde victoria vuelve al men\u00fa',R('G.st')=='menu'&&ov.innerHTML.includes('INFINITE'));R('run(0)');ok('nueva partida tras victoria',R('G.st')=='play'&&R('P.hp')==R('P.mhp'));
R('G.d=10;RM_.tp="boss";RM_.cl=1;RM_.vc=0;P.x=480;P.y=300;interact()');allB()[1].onclick();ok('seguir descendiendo: juego sigue',R('G.st')=='play'&&R('G.ov')==0);R('interact()');ok('segunda F desciende a 11',R('G.d')==11);
// recorrido de 12 niveles con sala de jefe: grafo conectado
let conn=true;for(let d=1;d<=14;d++){R(`run(0);G.d=${d};genLevel()`);const n=R('G.R.length');const seen=new Set([0]),q=[0];while(q.length){const i=q.pop();for(const k in R(`G.R[${i}].nb`)){const j=R(`G.R[${i}].nb[${k}]`);if(!seen.has(j)){seen.add(j);q.push(j)}}}if(seen.size!=n||!R('G.R.some(r=>r.tp=="boss")')||!R('G.R.some(r=>r.tp=="treasure")'))conn=false}ok('14 niveles: grafo conexo, con jefe y tesoro',conn);
// reproducible por semilla
R('run(0);G.seed=1234;G.d=4;genLevel()');const a1=R('JSON.stringify(G.R.map(r=>[r.gx,r.gy,r.tp,r.obs.length]))');R('G.seed=1234;G.d=4;genLevel()');ok('misma semilla = misma mazmorra',a1==R('JSON.stringify(G.R.map(r=>[r.gx,r.gy,r.tp,r.obs.length]))'));
console.log(out.join('\n'));console.log('errores consola:',errs.length,[...new Set(errs)].slice(0,4));
