const fs=require('fs'),vm=require('vm');

const D=__dirname+'/../src/';const js=fs.readdirSync(D).sort().map(f=>fs.readFileSync(D+f,'utf8')).join('\n');
const ctx=new Proxy({},{get:(t,k)=>k=='measureText'?()=>({width:10}):(k=='createRadialGradient'||k=='createLinearGradient')?()=>({addColorStop(o,c){if(typeof c=='string'&&c[0]=='#'&&![4,5,7,9].includes(c.length))throw new SyntaxError('color invalido '+c)}}):(k in t?t[k]:()=>{}),set:(t,k,v)=>{if(['fillStyle','strokeStyle','shadowColor'].includes(k)&&typeof v=='string'&&v[0]=='#'&&![4,5,7,9].includes(v.length))throw new SyntaxError('color invalido '+v);t[k]=v;return true}});
const mk=()=>({style:{},kids:[],appendChild(c){this.kids.push(c)},set innerHTML(v){this.kids=[];this._h=v},get innerHTML(){return this._h||''},getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:960,height:600}),insertAdjacentHTML(){},dataset:{},cloneNode(){return mk()},remove(){},closest(){return null}});
const els={};global.document={getElementById:i=>els[i]||(els[i]=mk()),createElement:()=>mk()};
global.window=global;global.performance={now:()=>0};global.requestAnimationFrame=()=>{};global.localStorage={getItem:()=>null,setItem(){}};global.setInterval=()=>0;global.AudioContext=function(){throw 1};
let errs=[];console.error=e=>errs.push(String(e&&e.stack||e).split('\n').slice(0,2).join(' | '));
vm.runInThisContext(js);const R=c=>vm.runInThisContext(c);const ov=els.ov;let out=[];const ok=(n,c)=>out.push((c?'OK   ':'FAIL ')+n);
const fresh=()=>{R('run(9);E=[];P.mp=P.mmp=500;P.hp=P.mhp;P.stcd=0;P.cd[4]=0;P.cc=0');R('window.e=spawn("tank",P.x+60,P.y);e.sp=0;e.hp=e.mhp=100000;e.cd=99')};

// Render estricto: el contexto simulado rechaza colores inv\u00e1lidos como un navegador real
const draws=[];for(let i=0;i<12;i++){errs.length=0;R(`run(0);E=[];G.bo=${i};G.d=bossDepth(${i});genLevel();enter(G.R.findIndex(r=>r.tp=="boss"),4)`);for(let k=0;k<5;k++)R('draw()');R('E.forEach(e=>{e.sp=0;e.fl=.1});draw()');R('window.q=spawn("decoy",300,200);q.bi=2;q.r=24;draw()');draws.push([i,errs.length])}
const bad=draws.filter(d=>d[1]>0).map(d=>d[0]);ok('dibujar cada uno de los 12 jefes (y copias) no lanza errores de render'+(bad.length?' \u2014 FALLAN: '+bad.join(','):''),bad.length==0);
ok('todos los colores de jefe son v\u00e1lidos al a\u00f1adir transparencia',R('BD.every(b=>[4,7].includes(b.c.length))'));
errs.length=0;R('run(0);E=[];window.__tt=["grunt","runner","archer","mage","tank","bomber","summoner","guardian","stalker","elite"];__tt.forEach((t,i)=>{const q=spawn(t,100+i*80,200);q.sp=0});draw()');ok('dibujar los 10 enemigos normales no lanza errores',errs.length==0);
errs.length=0;R('hurtP(1);P.fl=.1;P.g=1;P.sh=9;draw()');ok('dibujar jugador con guardia, escudo y golpe',errs.length==0);
console.log(out.join('\n'));console.log('errores consola:',errs.length);
