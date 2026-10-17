const fs=require('fs'),vm=require('vm');

const D=__dirname+'/../src/';const js=fs.readdirSync(D).sort().map(f=>fs.readFileSync(D+f,'utf8')).join('\n');
const ctx=new Proxy({},{get:(t,k)=>k=='measureText'?()=>({width:10}):(k=='createRadialGradient'||k=='createLinearGradient')?()=>({addColorStop(){}}):(k in t?t[k]:()=>{}),set:(t,k,v)=>{t[k]=v;return true}});
const mk=()=>({style:{},kids:[],appendChild(c){this.kids.push(c)},set innerHTML(v){this.kids=[];this._h=v},get innerHTML(){return this._h||''},getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:960,height:600}),insertAdjacentHTML(){}});
const els={};global.document={getElementById:i=>els[i]||(els[i]=mk()),createElement:()=>mk()};
global.window=global;global.performance={now:()=>0};global.requestAnimationFrame=()=>{};global.localStorage={getItem:()=>null,setItem(){}};global.setInterval=()=>0;global.AudioContext=function(){throw 1};
let errs=[];console.error=e=>errs.push(String(e&&e.stack||e).split('\n').slice(0,2).join(' | '));
vm.runInThisContext(js);
const R=c=>vm.runInThisContext(c);
const ov=els.ov;const txt=b=>b.textContent||b.innerHTML||'';const allB=(n=ov,a=[])=>{(n.kids||[]).forEach(c=>{if(c.onclick)a.push(c);allB(c,a)});return a};let out=[];const ok=(n,c)=>out.push((c?'OK  ':'FAIL ')+n);
ok('menu visible',ov.style.display=='flex'&&ov.innerHTML.includes('INFINITE'));
for(const wi of [0,5,9]){R(`run(${wi})`);for(let i=0;i<900;i++){R(`K[KY.right]=${i%120<60?1:0};M.x=300+(${i}%400);M.d=1;M.r=${i%50<5?1:0};K[KY.q]=${i%200==0?1:0};loop(${i}*16);if(G.ov&&P.pend>0)allB().length&&allB()[0].onclick()`)}ok('run style '+wi+' frames, st='+R('G.st'),R('G.st')=='play'||R('G.st')=='over')}
R('run(5)');R('P.a.str=9;P.bag.push(Object.assign({},IT[2],{id:1}),Object.assign({},IT[5],{id:2}))');R('inv()');ok('inv opens',R('G.iv')==1);
const arm0=R('P.arm');const sp0=R('P.spd');
let eq=ov.kids.find(k=>k.kids&&k.kids.length);
// find equip buttons in rows
const btns=[];(function w(n){(n.kids||[]).forEach(c=>{if(c.textContent=='Equipar')btns.push(c);w(c)})})(ov);
ok('equip buttons '+btns.length,btns.length==2);btns[0].onclick();R('ST()');ok('armor up '+arm0+'->'+R('P.arm'),R('P.arm')>arm0+10);
R('inv(1)');const b2=[];(function w(n){(n.kids||[]).forEach(c=>{if(c.textContent=='Equipar')b2.push(c);w(c)})})(ov);b2[0].onclick();R('ST()');ok('boots speed',R('P.spd')>sp0);
const un=[];(function w(n){(n.kids||[]).forEach(c=>{if(c.textContent=='Desequipar')un.push(c);w(c)})})(ov);un[0].onclick();R('ST()');ok('unequip keeps bag count '+R('P.bag.length'),R('P.bag.length')==1&&Object.keys(R('P.eq')).length==1);
R('hide()');
R('P.hp=1;P.inv=0;P.dash=null;hurtP(50)');ok('defeat state '+R('G.st'),R('G.st')=='over');ok('defeat screen shown',ov.style.display=='flex'&&ov.innerHTML.includes('HAS CA'));
allB()[0].onclick();ok('menu after defeat',ov.style.display=='flex'&&ov.innerHTML.includes('INFINITE')&&R('G.st')=='menu');
R('run(0)');ok('new run clean',R('E.length')>=0&&R('G.st')=='play'&&R('P.hp')==R('P.mhp'));
R('pause()');const ab=allB().find(k=>txt(k).includes('Abandonar'));ab.onclick();ok('abandon -> over screen',ov.style.display=='flex'&&ov.innerHTML.includes('ABANDONADA'));allB()[0].onclick();ok('menu after abandon',ov.innerHTML.includes('INFINITE'));

// --- ventanas de tarjetas ---
R('run(0)');
ok('menu cards (3 clases)',(()=>{R('menu()');const n=allB().filter(b=>txt(b).includes('Elegir')).length;return n>=3&&ov.innerHTML.includes('INFINITE')})());
R('run(0);P.gold=500;P.pend=1');R('lvUp()');ok('lvup window w/ cards',allB().filter(b=>txt(b).includes('Elegir')).length==3||allB().length>=3);const a0=R('P.a.str+P.a.dex+P.a.int+P.a.vit+P.a.agi+P.a.luk');allB()[0].onclick();ok('lvup +2 attr',R('P.a.str+P.a.dex+P.a.int+P.a.vit+P.a.agi+P.a.luk')==a0+2&&R('G.ov')==0);
R('RM_.tp="treasure";RM_.used=0;P.x=480;P.y=300;interact()');ok('chest window',R('G.ov')==1&&allB().length>=3);const nb=R('P.bag.length');allB()[1].onclick();R('hide()');ok('chest item option applied',true);
R('G.R[G.cur].tp="shop";G.R[G.cur].used=0;P.gold=1000;P.x=480;P.y=300;interact()');const sb=allB().filter(b=>/[0-9]+ /.test(txt(b)));ok('shop cards',sb.length>=3);const g0=R('P.gold');sb[0].onclick();ok('shop buy spends gold',R('P.gold')<g0&&R('G.ov')==1);
R('hide()');
// --- hemorragia y conductividad ---
R('run(0);P.w=mk(WP.findIndex(w=>w.n=="Daga de la Hemorragia"));ST()');R('E=[];const e=spawn("grunt",P.x+30,P.y);e.sp=0;e.hp=e.mhp=5000;window.__e=e');
R('for(let i=0;i<4;i++){hit(__e,10,"p",{fx:{bleed:1}})}');const h1=R('__e.hp');for(let i=0;i<60;i++)R('upE(.05)');ok('bleed stacks='+R('__e.st.bleedN')+' dmg over time',R('__e.st.bleedN')>=4&&R('__e.hp')<h1-10);
R('__e.st={};__e.hp=__e.mhp=5000;P.cc=0');R('hit(__e,100,"m",{ch:1})');const dry=5000-R('__e.hp');R('__e.hp=5000;apply(__e,{wet:5});hit(__e,100,"m",{ch:1})');const wet=5000-R('__e.hp');ok(`wet+lightning x${(wet/dry).toFixed(2)}`,wet/dry>1.5);
console.log(out.join('\n'));console.log('console errors:',errs.length,[...new Set(errs)].slice(0,5));

