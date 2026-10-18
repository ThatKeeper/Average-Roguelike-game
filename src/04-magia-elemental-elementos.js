// ===== MAGIA ELEMENTAL: 10 elementos, combinaciones por tabla, grimorio =====
// Reglas de estados: bleed/burn/poison/cor causan da\u00f1o por segundo (fuente: arma o hechizo, escalado con wd()); stun/root/slow se acortan
// un 30% en \u00e9lites y 50% en jefes; wet+hielo=congelaci\u00f3n, wet+rayo=+60%, wet apaga burn; frac=+20% da\u00f1o recibido; cor acumula (m\u00e1x 10, decae 1/3s).
// Al morir el enemigo se elimina de E, as\u00ed que sus estados no persisten. A\u00f1adir un hechizo = a\u00f1adir una entrada a CB.
let ZN=[];
const EL={fire:{n:'Fuego',c:'#ff8a30',d:'Quemadura; consume ra\u00edces (+40%).',h:(e,s)=>{apply(e,{burn:3});if(e.st.root>0){e.st.root=0;hit(e,s.dmg*.4,'m',{el:'fire'})}}},
water:{n:'Agua',c:'#4af',d:'Empapa: la electricidad hace +60%; apaga quemaduras.',h:e=>apply(e,{wet:5})},
plant:{n:'Planta',c:'#6c4',d:'Ra\u00edces (1.5 s) y veneno.',h:e=>apply(e,{root:1.5,poison:4})},
light:{n:'Electricidad',c:'#fff27a',d:'25% de aturdir; interrumpe.',h:e=>{if(Math.random()<.25)apply(e,{stun:.5})}},
wind:{n:'Viento',c:'#cfe',d:'Empuje fuerte y +30% de radio.',h:(e,s,x0,y0)=>{const a=Math.atan2(e.y-y0,e.x-x0);if(e.t!='boss'){e.vx+=Math.cos(a)*350;e.vy+=Math.sin(a)*350}}},
rock:{n:'Roca',c:'#b98',d:'Fractura: +20% de da\u00f1o recibido (6 s).',h:e=>apply(e,{frac:6})},
ice:{n:'Hielo',c:'#9fe8ff',d:'Ralentiza; congela si est\u00e1 empapado.',h:e=>{if(e.st.wet>0){e.st.wet=0;apply(e,{freeze:1.2})}else apply(e,{slow:2.5})}},
dark:{n:'Oscuridad',c:'#a4f',d:'Maldici\u00f3n (\u221225% da\u00f1o enemigo), drena man\u00e1; +30% contra afectados.',h:e=>{apply(e,{curse:6});P.mp=Math.min(P.mmp,P.mp+2)}},
blood:{n:'Sangre',c:'#d22',d:'Cuesta 6% de vida; +35% poder, hemorragia y robo de vida.',h:(e,s)=>{apply(e,{bleed:1});P.hp=Math.min(P.mhp,P.hp+s.dmg*.05)}},
corr:{n:'Corrupci\u00f3n',c:'#c2a',d:'Acumula deterioro (m\u00e1x. 10). Riesgo: +25% coste y enfriamiento.',h:e=>apply(e,{cor:2})}};
const CB={'fire+light':{n:'Sobrecarga de plasma',f:'nova',m:1.5,r:1.2,cdm:1.4,cap:1,d:'Explosi\u00f3n el\u00e9ctrica: aturde (m\u00e1x. una vez cada 6 s) y quema brevemente.',h:(e,s)=>{if(s.st)apply(e,{stun:.8});apply(e,{burn:1.5})}},
'light+water':{n:'Conductividad',m:1.2,d:'El agua potencia la descarga, que salta a 4 objetivos.',h:(e,s)=>chain(e,s.dmg*.5,4)},
'ice+water':{n:'Prisi\u00f3n glacial',f:'zone',m:.8,d:'Zona que congela (2 s) a los enemigos empapados.',h:e=>apply(e,{freeze:2})},
'corr+plant':{n:'Putrefacci\u00f3n',m:1.1,d:'Ra\u00edces (2.5 s) y 4 acumulaciones de corrupci\u00f3n.',h:e=>apply(e,{root:2.5,cor:4})},
'fire+wind':{n:'Tormenta \u00edgnea',f:'zone',r:1.6,m:.9,d:'Zona persistente de llamas ampliada.',h:e=>apply(e,{burn:3})},
'light+rock':{n:'Fractura conductora',m:1.1,d:'Fractura la defensa; si ya estaba fracturado, la descarga salta a 3.',h:(e,s)=>{const f=e.st.frac>0;apply(e,{frac:6});if(f)chain(e,s.dmg*.6,3)}},
'blood+dark':{n:'Pacto carmes\u00ed',m:1.8,rk:'Sacrifica el 15% de tu vida.',d:'Maldice y desangra, robando vida.',h:(e,s)=>{apply(e,{curse:8,bleed:2});P.hp=Math.min(P.mhp,P.hp+s.dmg*.12)}},
'ice+plant':{n:'Jard\u00edn de espinas',f:'zone',m:.9,d:'Zona de espinas heladas: ralentiza y enraiza.',h:e=>apply(e,{slow:3,root:1})},
'corr+fire':{n:'Incineraci\u00f3n impura',f:'nova',m:1,d:'Consume la corrupci\u00f3n del objetivo: +50% de da\u00f1o por acumulaci\u00f3n.',h:(e,s)=>{const n=e.st.cor||0;if(n){e.st.cor=0;hit(e,s.dmg*.5*n,'m',{el:'fire'})}}},
'plant+water':{n:'Crecimiento acelerado',f:'zone',m:.7,d:'Zona de ra\u00edces que ralentiza y te regenera.',h:e=>{apply(e,{root:1.2,slow:3});P.hp=Math.min(P.mhp,P.hp+P.mhp*.01)}},
'fire+water':{n:'Vapor',m:.65,d:'Se anulan parcialmente: menos da\u00f1o, pero ralentiza.',h:e=>apply(e,{slow:2})},
'fire+ice':{n:'Choque t\u00e9rmico',m:.7,d:'Fractura al enemigo a costa de da\u00f1o.',h:e=>apply(e,{frac:5})}};
const mc=(n,d,o)=>Object.assign({n,d,h:(e,s)=>{if(o.vs&&e.st[o.vs]>0)hit(e,s.dmg*(o.vb||.5),'m',{el:'dark'});if(o.fx){const f=Object.assign({},o.fx);if(o.cap&&!s.st)delete f.stun;apply(e,f)}if(o.ch)chain(e,s.dmg*.5,o.ch);if(o.sh&&e.st.stun>0){e.st.stun=0;hit(e,s.dmg*o.sh,'m',{el:'ice'})}
if(o.cons&&e.st[o.cons]>0){const k=e.st[o.cons];e.st[o.cons]=0;hit(e,s.dmg*.3*Math.min(k,10),'m',{el:'dark'})}if(o.sp)for(const q of E)if(q!=e&&q.hp>0&&dist(q,e)<130)apply(q,o.sp);if(o.heal)P.hp=Math.min(P.mhp,P.hp+s.dmg*o.heal);if(o.mp)P.mp=Math.min(P.mmp,P.mp+o.mp)}},o);
Object.assign(CB,{
'blood+fire':mc('Sangre ardiente','Quema y desangra; recuperas vida.',{fx:{burn:3,bleed:1},heal:.1,m:1.1}),
'blood+ice':mc('Hemorrag\u00eda g\u00e9lida','Ralentiza y desangra (2 acumulaciones).',{fx:{slow:3,bleed:2},m:.9}),
'blood+light':mc('Sangre el\u00e9ctrica','Descarga en cadena (3) que desangra.',{fx:{bleed:1},ch:3,sp:{bleed:1}}),
'blood+plant':mc('Savia carmes\u00ed','Veneno y ra\u00edz; te cura un 15% del da\u00f1o.',{fx:{poison:4,bleed:1,root:1},heal:.15,m:.9}),
'blood+rock':mc('Sangre petrificada','Fractura y desangra.',{fx:{frac:6,bleed:2},m:1.1}),
'blood+water':mc('Sangr\u00eda','Empapa y desangra: +50% si ya sangraba.',{vs:'bleed',fx:{wet:5,bleed:2}}),
'blood+wind':mc('Remolino carmes\u00ed','Contagia la hemorragia a enemigos cercanos.',{f:'nova',r:1.3,fx:{bleed:1},sp:{bleed:1}}),
'blood+corr':mc('Sangre corrupta','Consume las hemorragias en da\u00f1o y corrompe.',{cons:'bleedN',fx:{cor:2},m:.9}),
'corr+dark':mc('Ruina','Corrupci\u00f3n y maldici\u00f3n; +50% si ya est\u00e1 corrupto.',{vs:'cor',fx:{cor:3,curse:6},m:1.1}),
'corr+ice':mc('Congelaci\u00f3n necr\u00f3tica','Ralentiza y corrompe.',{fx:{slow:3,cor:2}}),
'corr+light':mc('Cortocircuito corrupto','Consume la corrupci\u00f3n en da\u00f1o y aturde (m\u00e1x. 1 vez/6 s).',{cons:'cor',fx:{stun:.6},cap:1}),
'corr+rock':mc('Petrificaci\u00f3n corrupta','Fractura y corrompe.',{fx:{frac:6,cor:3},m:1.1}),
'corr+water':mc('Charca t\u00f3xica','Zona que empapa, envenena y corrompe.',{f:'zone',fx:{wet:5,cor:1,poison:3},m:.9}),
'corr+wind':mc('Plaga voladora','La corrupci\u00f3n salta a enemigos cercanos.',{r:1.3,fx:{cor:2},sp:{cor:1}}),
'dark+fire':mc('Llama negra','Quema y maldice; +50% si ya estaba maldito.',{vs:'curse',fx:{burn:4,curse:6},m:1.1}),
'dark+ice':mc('Escarcha del vac\u00edo','Ralentiza, maldice y drena man\u00e1.',{fx:{slow:3,curse:6},mp:3}),
'dark+light':mc('Eclipse','+80% contra malditos; aturde brevemente (m\u00e1x. 1 vez/6 s).',{vs:'curse',vb:.8,fx:{curse:3,stun:.5},cap:1}),
'dark+plant':mc('Ra\u00edces del abismo','Ra\u00edces (2 s), veneno y maldici\u00f3n.',{fx:{root:2,curse:6,poison:3}}),
'dark+rock':mc('L\u00e1pida maldita','Fractura y maldice.',{fx:{frac:6,curse:8},m:1.1}),
'dark+water':mc('Marea negra','Zona que empapa y maldice, drenando man\u00e1.',{f:'zone',fx:{wet:5,curse:4},mp:2,m:.9}),
'dark+wind':mc('Vendaval umbr\u00edo','Extiende la maldici\u00f3n a los enemigos cercanos.',{f:'nova',r:1.3,fx:{curse:5},sp:{curse:5}}),
'fire+plant':mc('Incendio forestal','Zona ardiente; +60% contra enra\u00edzados.',{f:'zone',vs:'root',vb:.6,fx:{burn:3,poison:3}}),
'fire+rock':mc('Magma','Quema y fractura; +60% contra fracturados.',{vs:'frac',vb:.6,fx:{burn:3,frac:6}}),
'ice+light':mc('Escarcha conductiva','Cadena (2); rompe congelados con +120% de da\u00f1o.',{ch:2,sh:1.2,fx:{slow:2}}),
'ice+rock':mc('Rompehielos','Fractura; destroza a los congelados (+150%).',{sh:1.5,fx:{frac:6,slow:3}}),
'ice+wind':mc('Ventisca','Zona amplia de ralentizaci\u00f3n; +80% si est\u00e1n empapados.',{f:'zone',r:1.4,vs:'wet',vb:.8,fx:{slow:3},m:.8}),
'light+plant':mc('Descarga vegetal','Cadena (3) con veneno y ra\u00edz.',{ch:3,fx:{poison:3,root:1}}),
'light+wind':mc('Tormenta el\u00e9ctrica','Cadena (3) en \u00e1rea ampliada.',{ch:3,r:1.3,fx:{stun:.4},cap:1}),
'plant+rock':mc('Ra\u00edces p\u00e9treas','Ra\u00edces (3 s) y fractura.',{fx:{root:3,frac:6}}),
'plant+wind':mc('Polen venenoso','Zona que envenena y contagia el veneno.',{f:'zone',r:1.3,fx:{poison:4},sp:{poison:3},m:.8}),
'rock+water':mc('Lodo','Zona que empapa, ralentiza y fractura.',{f:'zone',fx:{wet:5,slow:3,frac:4},m:.8}),
'rock+wind':mc('Tormenta de arena','Zona que ralentiza y fractura.',{f:'zone',r:1.3,fx:{slow:3,frac:5},m:.8}),
'water+wind':mc('Tromba','Gran nova que empapa a todos.',{f:'nova',r:1.5,fx:{wet:5},sp:{wet:4},m:.8})});
// doorVis: una puerta se dibuja siempre salvo la de una sala secreta aun no descubierta (mecanica intencional)
function doorVis(r,k){const n=G.R[r.nb[k]];return !(n.sec&&!G.seen[r.nb[k]])}
function build(a,b,f){const k=[a,b].filter(Boolean).sort().join('+'),c=CB[k],f2=c?.f||f,F={bolt:[20,2.5,1,0],nova:[28,5,.85,120],cone:[22,3,1.1,170],zone:[30,7,.55,90]}[f2],has=z=>a==z||b==z,els=b&&b!=a?[[a,.6],[b,.4]]:[[a,1]];
let cost=F[0]*(b&&b!=a?1.2:1)*(1-.08*(P.tal.alch||0)),cd=F[1],hpc=has('blood')?P.mhp*(k=='blood+dark'?.15:.06):0;const dmg=wd(1)*F[2]*(c?.m||1)*(has('blood')?1.35:1);if(has('corr')){cost*=1.25;cd*=1.25}
return{a,b,f:f2,c,els,name:c?c.n:EL[a].n+(b&&b!=a?' + '+EL[b].n:''),cost,cd:cd*(c?.cdm||1),hpc,dmg,r:F[3]*(c?.r||1)*(has('wind')?1.3:1),dur:4,k:1,desc:els.map(([z])=>EL[z].d).join(' ')+(c?' \u2605 '+c.d:''),risk:[hpc?`Sacrificas ${Math.ceil(hpc)} de vida.`:'',has('corr')?'+25% coste y enfriamiento.':'',c&&c.rk||'',(k=='fire+water'||k=='fire+ice')?'Los elementos se contrarrestan.':''].filter(Boolean).join(' ')||'Sin riesgos.'}}
function spHit(e,s,x0,y0){if(e.hp<=0||e.sp>0)return;for(const [k,sh] of s.els){hit(e,s.dmg*sh,'m',{el:k,ch:k=='light',a:Math.atan2(e.y-y0,e.x-x0)});if(e.hp>0)EL[k].h(e,s,x0,y0)}if(s.c&&e.hp>0)s.c.h(e,s)}
function castSp(spec,ci=4){const s=spec||P.sp;if(!s||P.cd[ci]>0||P.dash)return;const sp=build(s.a,s.b,s.f);if(P.mp<sp.cost||P.hp<=sp.hpc+1){flash(P.mp<sp.cost?'Man\u00e1 insuficiente':'Vida insuficiente');return}
P.mp-=sp.cost;P.hp-=sp.hpc;P.cd[ci]=sp.cd;sp.st=!(P.stcd>0);const col=EL[sp.a].c;
if(sp.f=='bolt')shoot(P.face,560,sp.dmg,'m',{sf:sp,c:col,r:8,pierce:sp.c?1:0});
else if(sp.f=='zone'){const d=Math.min(300,dist(P,M)),a=P.face;ZN.push({x:P.x+Math.cos(a)*d,y:P.y+Math.sin(a)*d,r:sp.r,t:sp.dur,k:0,sp})}
else{FX.push({k:'ring',x:P.x,y:P.y,r:sp.r,t:.3,m:.3,c:col});for(const e of E)if(e.hp>0&&dist(P,e)<sp.r+e.r&&(sp.f=='nova'||Math.abs(nrm(ang(P,e)-P.face))<.65))spHit(e,sp,P.x,P.y)}
if(sp.c&&sp.c.cap)P.stcd=6;snd(500,.12,'sine')}
function zn(dt){for(const z of ZN){z.t-=dt;z.k-=dt;if(z.k<=0){z.k=.6;for(const e of E)if(e.hp>0&&dist(z,e)<z.r+e.r)spHit(e,z.sp,z.x,z.y)}}ZN=ZN.filter(z=>z.t>0)}

function hide(){ov.style.display='none';ov.innerHTML='';G.ov=0;G.pz=0;G.iv=0;G.bk=0;G.tl=0}
function flash(t){msg=[t,2.5]}
function menu(){G.st='menu';show(`<h1>INFINITE DEPTHS</h1><p>Mazmorra infinita de fantasía oscura. Cada nivel termina con un jefe; después, un descenso más profundo y peligroso.</p><p><b>Si mueres pierdes:</b> nivel, armas, reliquias y botín de la expedición. <b>Conservas:</b> tu mejor profundidad y la mitad del oro como almas, con las que compras mejoras permanentes.</p><p>WASD mover · Ratón apuntar · Clic izq. atacar · Clic der. habilidad/guardia · Espacio esquivar · Q/E habilidades · F interactuar · I inventario · M mapa · Esc pausa</p><p>Mejor profundidad: <b>${S.best}</b> · Almas: <b>${S.souls}</b></p>`,
[{t:'⚔ Guerrero (cuerpo a cuerpo)',i:'⚔️',n:'Guerrero',tp:'Clase · cuerpo a cuerpo',r:0,d:'Espada, guardia con parada perfecta, remolino y salto. Resistente y letal de cerca.',stx:'FUE +4 · Espada',f:()=>run(0)},{t:'🏹 Cazador (a distancia)',i:'🏹',n:'Cazador',tp:'Clase · a distancia',r:0,d:'Arco, andanada, flecha explosiva y flecha venenosa. Movilidad y crítico.',stx:'DES +4 · Arco',f:()=>run(5)},{t:'✦ Mago (magia)',i:'🪄',n:'Mago',tp:'Clase · magia',r:0,d:'Báculo arcano, bola de fuego, nova de hielo y rayo en cadena. Usa maná.',stx:'INT +4 · Báculo',f:()=>run(9)},{t:`Forja de almas: +6% daño permanente (nivel ${S.pw}, ${40*(S.pw+1)} almas)`,i:'🔨',n:'Forja de almas',tp:'Mejora permanente',r:2,d:'+6% de daño permanente en todas tus partidas.',stx:`Nivel ${S.pw} · coste ${40*(S.pw+1)} almas`,nc:1,f:()=>{const c=40*(S.pw+1);if(S.souls>=c){S.souls-=c;S.pw++;save()}menu()}},{t:'Controles',nc:1,f:ctrls},{t:'Música: '+(S.mute?'apagada':'encendida'),nc:1,f:()=>{S.mute=!S.mute;save();menu()}},{t:'Volumen: '+Math.round((S.vol??1)*100)+'%',nc:1,f:()=>{S.vol=[1,.6,.3,0][([1,.6,.3,0].indexOf(S.vol??1)+1)%4];save();menu()}},{t:'Temblor de pantalla: '+(S.nosh?'no':'sí'),nc:1,f:()=>{S.nosh=!S.nosh;save();menu()}},{t:'Controles táctiles: '+({on:'siempre',off:'nunca'}[S.touch]||'automático'),nc:1,f:()=>{S.touch={on:'off',off:'auto'}[S.touch]||'on';save();TOUCH=S.touch=='on'||(S.touch!='off'&&TOUCH_AUTO);if(TOUCH)buildTouch();tcApply();menu()}},{t:'Tamaño de controles táctiles: '+Math.round((S.tscale||1)*100)+'%',nc:1,f:()=>{S.tscale=[1,1.25,.8][([1,1.25,.8].indexOf(S.tscale||1)+1)%3];save();tcApply();menu()}},{t:'Gráficos: '+(S.hq?'altos':'ligeros (recomendado en móvil)'),nc:1,f:()=>{S.hq=!S.hq;save();LOW=TOUCH&&!S.hq;menu()}},{t:'Arena de jefes',nc:1,f:arenaMenu}])}
function pause(){if(G.pz){hide();return}if(G.ov)return;G.pz=1;show('<h2>Pausa</h2>',[{t:'Reanudar',f:()=>{}},{t:'Abandonar expedición',nc:1,f:()=>{G.pz=0;die(1)}}])}
const fmt=n=>n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(1)+'k':Math.round(n);
