// Controles t\u00e1ctiles: se simulan los eventos de puntero que enviar\u00eda el navegador (no es un dispositivo real).
const fs=require('fs'),vm=require('vm');const D=__dirname+'/../src/';const js=fs.readdirSync(D).sort().map(f=>fs.readFileSync(D+f,'utf8')).join('\n');
const bad=c=>typeof c=='string'&&c[0]=='#'&&![4,5,7,9].includes(c.length);
function env(store,w=800,h=360){const ctx=new Proxy({},{get:(t,k)=>k=='measureText'?()=>({width:10}):(k=='createRadialGradient'||k=='createLinearGradient')?()=>({addColorStop(o,c){if(bad(c))throw new SyntaxError('color invalido '+c)}}):(k in t?t[k]:()=>{}),set:(t,k,v)=>{if(['fillStyle','strokeStyle','shadowColor'].includes(k)&&bad(v))throw new SyntaxError('color invalido '+v);t[k]=v;return true}});
 const mk=()=>({style:{setProperty(){}},kids:[],className:'',classList:{add(){},remove(){}},appendChild(c){this.kids.push(c)},set innerHTML(v){this.kids=[];this._h=v},get innerHTML(){return this._h||''},getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:960,height:600}),insertAdjacentHTML(a,h2){this._h=(this._h||'')+h2},dataset:{},cloneNode(){return mk()},remove(){},closest(){return null},setPointerCapture(){}});
 const els={},errs=[],sb={errs,innerWidth:w,innerHeight:h,document:{getElementById:i=>els[i]||(els[i]=mk()),createElement:()=>mk()},performance:{now:()=>0},requestAnimationFrame(){},localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v)}},setInterval(){},AudioContext:function(){throw 1},console:{error(e){errs.push(String(e&&e.stack||e).split('\n')[0])},log:console.log}};sb.window=sb;vm.createContext(sb);vm.runInContext(js,sb);return{R:c=>vm.runInContext(c,sb),els,errs,sb}}
let out=[],fail=0;const ok=(n,c)=>{out.push((c?'OK   ':'FAIL ')+n);if(!c)fail++};
const ev=(id,type,pid,cx=0,cy=0)=>({pointerId:pid,clientX:cx,clientY:cy,type});
let A=env({});ok('sin pantalla t\u00e1ctil el juego de escritorio no crea controles t\u00e1ctiles',A.R('TOUCH')===false&&A.R('TC.box')===null);
const st={idv1:'{"touch":"on"}'};A=env(st);const R=A.R,els=()=>R('TC.els');
ok('con modo t\u00e1ctil se crean joystick y todos los botones ('+R('Object.keys(TC.els).length')+' controles)',R('TOUCH')&&['joy','atk','skill','q','e','r','dodge','use','pause','inv','map','tal','book','c1','c4','rot'].every(k=>R(`!!TC.els.${k}`)));
ok('modo ligero activo en m\u00f3vil (sin sombras difusas; menos part\u00edculas)',R('LOW')===true&&(R('x.shadowBlur=20;x.shadowBlur')===0));
const t=(id,m,...a)=>R(`TC.els.${id}.${m}(${a.map(v=>JSON.stringify(v)).join(',')})`);
// ---- joystick ----
R('run(0)');t('joy','onpointerdown',ev('joy','d',1,480+400,300));ok('joystick: empujar a la derecha activa el movimiento a la derecha',R('K[KY.right]')==1&&!R('K[KY.left]'));
t('joy','onpointermove',ev('joy','m',1,480,300-400));ok('joystick: cambiar de direcci\u00f3n actualiza sin quedarse bloqueado',R('K[KY.up]')==1&&!R('K[KY.right]'));
t('joy','onpointerdown',ev('joy','d',2,0,0));t('joy','onpointermove',ev('joy','m',2,480-400,300));ok('un segundo dedo no secuestra el joystick',!R('K[KY.left]'));
t('joy','onpointerup',ev('joy','u',2));ok('soltar con otro dedo no lo libera',R('K[KY.up]')==1);
t('joy','onpointerup',ev('joy','u',1));ok('soltar libera todas las direcciones',!R('K[KY.up]||K[KY.down]||K[KY.left]||K[KY.right]'));
t('joy','onpointerdown',ev('joy','d',5,480+400,300));t('joy','onpointercancel',ev('joy','c',5));ok('cancelar el toque (llamada, gesto del sistema) libera el movimiento',!R('K[KY.right]'));
// ---- ataque con auto-apuntado y apuntado manual ----
R('E=[];RM_.obs=[];P.x=300;P.y=300;const a=spawn("grunt",600,300);a.sp=0;const b=spawn("grunt",420,300);b.sp=0;window.bn=b');t('atk','onpointerdown',ev('atk','d',7,0,0));R('upP(1/60)');
ok('mantener ATACAR activa el ataque continuo y apunta al enemigo m\u00e1s cercano',R('M.d')==1&&R('Math.abs(M.x-bn.x)<1&&Math.abs(M.y-bn.y)<1'));
t('atk','onpointermove',ev('atk','m',7,480,300-100));R('upP(1/60)');ok('arrastrar el dedo desde ATACAR apunta manualmente',R('TC.am')==1&&R('M.y<P.y-100'));
t('atk','onpointerup',ev('atk','u',7));ok('soltar ATACAR detiene el ataque',R('M.d')==0&&R('TC.ah')==0);
// ---- botones de mantener / varios dedos / cancelaci\u00f3n ----
R('E=[];P.cd=[0,0,0,0];P.mp=P.mmp');t('q','onpointerdown',ev('q','d',10));t('e','onpointerdown',ev('e','d',11));ok('dos dedos pulsan dos botones a la vez (Q y E)',R('K[KY.q]')==1&&R('K[KY.e]')==1);
t('q','onpointerup',ev('q','u',11));ok('un puntero ajeno no suelta el bot\u00f3n',R('K[KY.q]')==1);t('q','onpointerup',ev('q','u',10));t('e','onlostpointercapture',ev('e','l',11));ok('soltar o perder la captura libera Q y E',!R('K[KY.q]||K[KY.e]'));
t('q','onpointerdown',ev('q','d',12));R('upP(1/60)');ok('Q mantenido ejecuta la habilidad (enfriamiento activo)',R('P.cd[0]')>0);t('q','onpointercancel',ev('q','c',12));
t('skill','onpointerdown',ev('skill','d',13));ok('HAB act\u00faa como clic derecho mientras se mantiene',R('M.r')==1);t('skill','onpointerup',ev('skill','u',13));ok('...y se libera al soltar',R('M.r')==0);
t('dodge','onpointerdown',ev('dodge','d',14));ok('ESQ esquiva con un toque',R('!!P.dash'));
R('P.dash=null;RM_.tp="treasure";RM_.used=0;P.x=480;P.y=300');t('use','onpointerdown',ev('use','d',15));ok('F interact\u00faa con cofres',R('G.ov')==1);R('hide()');
t('pause','onpointerdown',ev('pause','d',16));ok('II abre la pausa',R('G.pz')==1);R('hide()');t('inv','onpointerdown',ev('inv','d',17));ok('INV abre el inventario',R('G.iv')==1);R('hide()');
// ---- cartas del Mago por toque ----
R('run(9);S.cards.slots=["fire","ice","light",null];P.mp=P.mmp;P.cd=[0,0,0,0];draw()');ok('el Mago ve los botones 1-4 y B',R('TC.els.c1.style.display')=='flex'&&R('TC.els.book.style.display')=='flex');
const mp0=R('P.mp');t('c1','onpointerdown',ev('c1','d',20));R('upP(1/60)');t('c1','onpointerup',ev('c1','u',20));ok('tocar 1 lanza la carta equipada',R('P.mp')<mp0&&R('P.cd[4]')>0);
t('book','onpointerdown',ev('book','d',21));ok('B abre la colecci\u00f3n de cartas',R('G.bk')==1);R('hide()');
R('run(0);draw()');ok('otras clases no ven botones de cartas',R('TC.els.c1.style.display')=='none'&&R('TC.els.book.style.display')=='none');
// ---- seguridad ante estados atascados ----
t('q','onpointerdown',ev('q','d',30));R('show("x",[{t:"a",f(){}}]);tcSync()');ok('abrir un men\u00fa libera las acciones mantenidas',!R('K[KY.q]'));R('hide()');
t('joy','onpointerdown',ev('joy','d',31,480+400,300));R('tcReset()');ok('perder el foco/segundo plano libera todo',!R('K[KY.right]')&&R('TC.jp')===null);
// ---- orientaci\u00f3n ----
R('run(0);E=[];window.gg=spawn("grunt",700,400);gg.sp=0;gg.al=1');A.sb.innerWidth=360;A.sb.innerHeight=800;R('tcApply()');const gx=R('gg.x');for(let i=0;i<60;i++)R('loop(1000+'+i+'*17)');ok('en vertical se muestra el aviso y la partida se pausa',R('ROT')===true&&R('TC.els.rot.style.display')=='flex'&&R('gg.x')==gx);
A.sb.innerWidth=800;A.sb.innerHeight=360;R('tcApply()');for(let i=0;i<120;i++)R('loop('+(5000+i*17)+')');ok('al girar a horizontal la partida contin\u00faa',R('ROT')===false&&R('gg.x')!=gx);
// ---- rendimiento m\u00f3vil ----
R('run(0);FX=[];for(let i=0;i<600;i++)FX.push({k:"p",x:0,y:0,vx:0,vy:0,t:9,m:9,c:"#fff"});upMisc(1/60)');const fxm=R('FX.length');const D2=env({});D2.R('run(0);FX=[];for(let i=0;i<600;i++)FX.push({k:"p",x:0,y:0,vx:0,vy:0,t:9,m:9,c:"#fff"});upMisc(1/60)');ok(`l\u00edmite de efectos: m\u00f3vil ${fxm} frente a escritorio ${D2.R('FX.length')}`,fxm<=120&&D2.R('FX.length')==250);
R('AMB=[];for(let i=0;i<100;i++)amb(.01)');ok('part\u00edculas ambientales reducidas en m\u00f3vil',R('AMB.length')<=16);
// ---- HUD compacto y ajustes ----
A.errs.length=0;for(const w of[0,5,9])R(`run(${w});draw()`);ok('el HUD compacto t\u00e1ctil se dibuja en las 3 clases sin errores',A.errs.length==0);
R('menu()');const bt=[];(function w(n){(n.kids||[]).forEach(c=>{if(c.onclick)bt.push(c);w(c)})})(A.els.ov);const tb=bt.find(b=>(b.innerHTML||'').includes('Controles t\u00e1ctiles'));tb.onclick();ok('ajuste: controles t\u00e1ctiles siempre \u2192 nunca',JSON.parse(st.idv1).touch=='off'&&R('TOUCH')===false);
R('menu()');const sz=[];(function w(n){(n.kids||[]).forEach(c=>{if(c.onclick)sz.push(c);w(c)})})(A.els.ov);sz.find(b=>(b.innerHTML||'').includes('Tama\u00f1o')).onclick();ok('ajuste: escala de controles t\u00e1ctiles se guarda',JSON.parse(st.idv1).tscale==1.25);
const css=fs.readFileSync(__dirname+'/../styles.css','utf8');ok('CSS: zonas seguras, dvh y bloqueo de gestos',/safe-area-inset-bottom/.test(css)&&/160dvh/.test(css)&&/touch-action:none/.test(css)&&/overscroll-behavior:none/.test(css));
console.log(out.join('\n'));console.log('errores de consola:',A.errs.length);process.exit(fail?1:0);
