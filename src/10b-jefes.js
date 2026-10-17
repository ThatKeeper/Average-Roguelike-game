// ===== JEFES: 7 normales + 5 finales. Cada uno tiene su propia funcion de comportamiento (BO[i].up) =====
// Infraestructura comun: vida, da\u00f1o, fases (por % de vida), inmunidad (imm), ventana de vulnerabilidad (vul, +60% da\u00f1o),
// zonas telegrafiadas (tz), proyectiles (bt/brs con curva cv o rastreo hm) y embestidas (dsh). Lo espec\u00edfico est\u00e1 en cada jefe.
Object.assign(ET,{decoy:{hp:1,sp:0,dm:0,r:24,c:'#999',ai:'x'},orb:{hp:40,sp:0,dm:0,r:12,c:'#a4f',ai:'x'}});
let AMB=[];function amb(dt){if(AMB.length<40)AMB.push({x:rnd(50,910),y:rnd(50,550),v:rnd(8,26),s:rnd(1,3),p:rnd(0,6)});for(const a of AMB){a.y-=a.v*dt;a.x+=Math.sin(a.p+=dt)*10*dt;if(a.y<50){a.y=550;a.x=rnd(50,910)}}}
function los(a,b){for(const o of RM_.obs)for(let i=1;i<12;i++){const px=a.x+(b.x-a.x)*i/12,py=a.y+(b.y-a.y)*i/12;if(px>o.x&&px<o.x+o.w&&py>o.y&&py<o.y+o.h)return false}return true}
function tz(x0,y0,r,t,d,c){bsnd((E.find(q=>q.t=='boss')||{bi:0}).bi,'atk');Z.push({x:x0,y:y0,r,t,m:t,d,c:c||'#f55'})}
function bt(e,a,sp,d,cv=0,c='#cf6',hm=0){PR.push({x:e.x,y:e.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:6,d,l:5,f:'e',c,cv,hm})}
function brs(e,n,sp,d,o=0,cv=0,c='#f5a'){for(let i=0;i<n;i++)bt(e,i/n*6.283+o,sp,d,cv,c)}
function dsh(e,t,sp){bsnd(e.bi||0,'atk');const a=Math.atan2(P.y-e.y,P.x-e.x);e.lu=t;e.lh=0;e.lvx=Math.cos(a)*sp;e.lvy=Math.sin(a)*sp;e.nr=1}
const ring=(e,r,c)=>FX.push({k:'ring',x:e.x,y:e.y,r,t:.5,m:.5,c});
const tp=(e,rg)=>{const a=rnd(0,6.28);e.x=cl(P.x+Math.cos(a)*rg,90,870);e.y=cl(P.y+Math.sin(a)*rg,90,510)};
const BD=[{n:'Valdris, el Duelista',c:'#d8d8f0',r:24,hp:.8},{n:'Gorgrim, el Coloso',c:'#b87',r:38,hp:1.4},{n:'Sylra, la Centinela',c:'#6cd',r:22,hp:.8},{n:'Mirax, Maestro de Espejos',c:'#ccc',r:26,hp:.9},{n:'Veyra, la Trampera',c:'#c6f',r:24,hp:.9},{n:'Nyx, la Mudable',c:'#f66',r:28,hp:1},{n:'Zeth, el Arconte',c:'#a4f',r:30,hp:1.1},
{n:'Soberano de Huesos',c:'#dcb',r:36,hp:2},{n:'Fulgor, Heraldo del Rayo',c:'#fe6',r:30,hp:2},{n:'Noctis, Devoradora de Luz',c:'#96c',r:34,hp:2},{n:'Cronos, el Reloj Roto',c:'#8cf',r:32,hp:2},{n:'El Vac\u00edo',c:'#556',r:36,hp:2.2}];
const bossDepth=i=>i<7?i+1:(i-6)*10,bossIdx=d=>d%10==0?7+((d/10-1)%5):(d-1)%7;
const BO=[
{up:(e,dt,c)=>{e.t1-=dt;if(e.wd>0){e.wd-=dt;if(e.fk&&P.dash&&e.wd>.1)e.wd=.05;if(e.wd<=0){if(e.fk){e.fk=0;e.wd=.35;e.x-=Math.cos(c.a)*45;e.y-=Math.sin(c.a)*45;return}dsh(e,.2,560+c.ph*60);e.wl=1}return}
if(e.wl&&!e.lu){e.wl=0;if(e.cmb>0){e.cmb--;e.wd=.28}else{e.st.stun=1.1;e.vul=1.1}return}if(c.d>110)c.mv(c.nx*c.sp,c.ny*c.sp);if(e.t1<=0){e.t1=2.2-c.ph*.4;e.cmb=2+c.ph;e.fk=Math.random()<.45;e.wd=.55}}},
{up:(e,dt,c)=>{e.t1-=dt;if(e.wl&&!e.lu){e.wl=0;const w=e.x<e.r+58||e.x>902-e.r||e.y<e.r+58||e.y>542-e.r;RM_.obs=RM_.obs.filter(b=>Math.hypot(b.x+b.w/2-e.x,b.y+b.h/2-e.y)>140);shake=14;if(w){e.st.stun=2.4;e.vul=2.4;flash('\u00a1Gorgrim se estrella! Ataca ahora')}else e.st.stun=.8;return}
if(e.wd>0){e.wd-=dt;if(e.wd<=0){if(e.md){dsh(e,.9,430);e.wl=1}else{tz(e.x,e.y,115,.2,e.dmg*1.3,'#f84');tz(e.x,e.y,205,.55,e.dmg,'#fa6');if(c.ph>0)for(let i=0;i<4;i++)tz(rnd(100,860),rnd(100,500),55,1.1,e.dmg,'#f84')}}return}
if(c.d>100)c.mv(c.nx*c.sp,c.ny*c.sp);if(e.t1<=0){e.t1=3.2-c.ph*.5;e.md=Math.random()<.45;e.wd=e.md?.8:1}}},
{up:(e,dt,c)=>{e.t1-=dt;if(e.vul>0)return;const d=c.d;if(d<260)c.mv(-c.nx*c.sp*1.3,-c.ny*c.sp*1.3);else if(d>340)c.mv(c.nx*c.sp,c.ny*c.sp);else c.mv(-c.ny*c.sp*.8,c.nx*c.sp*.8);
if(e.t1<=0){const k=(e.k=(e.k||0)+1)%4;e.t1=1.5-c.ph*.25;if(k==1)for(let i=-2;i<=2;i++)bt(e,c.a+i*.16,300,e.dmg*.6,i*.5,'#9cf');else if(k==2)brs(e,10+c.ph*4,200,e.dmg*.5,e.tm,.6,'#9cf');else if(k==3){bt(e,c.a,520,e.dmg,0,'#fff');bt(e,c.a+.08,520,e.dmg,0,'#fff')}else{e.vul=1.8;e.t1=1.8;flash('Sylra recarga')}}}},
{up:(e,dt,c)=>{if(!e.dc)e.dc=[];e.dc=e.dc.filter(q=>q.hp>0&&!q.dead);e.t1-=dt;e.t2=(e.t2||5)-dt;e.t3=(e.t3||3)-dt;if(e.t3<=0&&e.dc.length<2+c.ph){e.t3=3;const q=spawn('decoy',e.x+rnd(-150,150),e.y+rnd(-60,100));q.sp=0;q.al=1;q.bi=e.bi;q.r=e.r;q.hp=q.mhp=1;e.dc.push(q)}
for(const q of e.dc){q.tm+=dt;q.x+=Math.cos(q.tm*.7+q.y)*40*dt;q.y+=Math.sin(q.tm*.7+q.x)*30*dt;col(q)}c.mv(-c.ny*c.sp*e.dir,c.nx*c.sp*e.dir);
if(e.t2<=0&&e.dc.length){e.t2=6;const q=pick(e.dc),x0=e.x,y0=e.y;e.x=q.x;e.y=q.y;q.x=x0;q.y=y0;ring(e,60,'#fff');ring(q,60,'#fff')}
if(e.t1<=0){e.t1=2-c.ph*.3;for(const q of[e,...e.dc])bt(q,Math.atan2(P.y-q.y,P.x-q.x),260,e.dmg*.7,0,'#ddd')}}},
{up:(e,dt,c)=>{e.t1-=dt;if(e.vul>0)return;if(e.t1<=0){const k=(e.k=(e.k||0)+1)%3;e.t1=3.2-c.ph*.4;
if(k==1){for(let i=-3;i<=3;i++)tz(P.x+i*70,P.y,45,1.6,e.dmg,'#c6f');for(let i=-3;i<=3;i++)if(i)tz(P.x,P.y+i*70,45,1.6+Math.abs(i)*.05,e.dmg,'#c6f')}
else if(k==2){for(let i=1;i<=9;i++)tz(e.x+Math.cos(c.a)*i*70,e.y+Math.sin(c.a)*i*70,42,.8+i*.12,e.dmg,'#fc6')}
else{for(let i=0;i<5+c.ph*2;i++)tz(rnd(90,870),rnd(90,510),60,2.2,e.dmg*1.2,'#f6a');e.vul=2;e.t1=2.4;flash('Veyra rearma sus trampas: \u00a1es vulnerable!')}tp(e,260)}}},
{up:(e,dt,c)=>{e.t1-=dt;if(!e.tf&&e.hp<e.mhp*.5){e.tf=1;e.imm=1;e.col='#6cf';shake=16;ring(e,150,'#6cf');ring(e,90,'#fff');flash('\u00a1Nyx cambia de forma!');e.cmb=0;e.wd=0}
if(!e.tf){if(e.wd>0){e.wd-=dt;if(e.wd<=0){dsh(e,.25,500);e.wl=1}return}if(e.wl&&!e.lu){e.wl=0;if(e.cmb-->1)e.wd=.25;else e.st.stun=.9;return}if(c.d>70)c.mv(c.nx*c.sp*1.5,c.ny*c.sp*1.5);if(e.t1<=0){e.t1=1.8;e.cmb=3;e.wd=.4}}
else if(e.t1<=0){e.t1=1.5;const k=e.k=(e.k||0)+1;tp(e,280);if(k%2)for(let i=0;i<7;i++)bt(e,Math.atan2(P.y-e.y,P.x-e.x)+(i-3)*.2,280,e.dmg*.6,(i-3)*.4,'#6cf');else tz(P.x,P.y,70,.9,e.dmg,'#6cf')}}},
{up:(e,dt,c)=>{e.t1-=dt;e.t3=(e.t3||8)-dt;if(!e.orb)e.orb=[];const vivos=e.orb.some(q=>q.hp>0&&!q.dead);
if(!vivos&&!(e.vul>0)){if(e.orb.length&&!e.rs){e.rs=1;e.vul=5;flash('\u00a1Zeth queda expuesto!');}else{e.rs=0;e.orb=[];for(let i=0;i<3;i++){const q=spawn('orb',e.x,e.y);q.sp=0;q.al=1;q.hp=q.mhp=40*hpM();q.oi=i;e.orb.push(q)}}}
e.imm=vivos?1:0;e.orb.forEach(q=>{const a=e.tm*1.6+q.oi*2.094;q.x=e.x+Math.cos(a)*70;q.y=e.y+Math.sin(a)*70});if(c.d>150)c.mv(c.nx*c.sp,c.ny*c.sp);
if(e.t3<=0){e.t3=12;e.warn=1.2;flash('\u00a1Zeth va a invertir tus controles!')}if(e.warn>0){e.warn-=dt;if(e.warn<=0)P.invc=4}
if(e.wd>0){e.wd-=dt;if(e.wd<=0)dsh(e,.25,520)}if(e.t1<=0){e.t1=2.1-c.ph*.3;const k=(e.k=(e.k||0)+1)%3;if(k==0)brs(e,12,230,e.dmg*.6,e.tm);else if(k==1)e.wd=.5;else for(let i=0;i<3+c.ph;i++)tz(P.x+rnd(-90,90),P.y+rnd(-90,90),55,1,e.dmg,'#a4f')}}},
// ---- FINALES ----
{up:(e,dt,c)=>{e.t1-=dt;e.mn=(e.mn||[]).filter(q=>q.hp>0&&!q.dead);if(e.ph0!==c.ph){e.ph0=c.ph;for(let i=0;i<3+c.ph*2;i++){const q=spawn('grunt',e.x+rnd(-120,120),e.y+rnd(40,140));q.al=1;q.sp=.4;e.mn.push(q)}ring(e,160,'#dcb');flash('\u00a1El Soberano alza a sus huestes!')}
e.imm=e.mn.length?1:0;if(c.d>120)c.mv(c.nx*c.sp,c.ny*c.sp);if(e.wd>0){e.wd-=dt;if(e.wd<=0)dsh(e,.3,480)}
if(e.t1<=0){e.t1=2.4-c.ph*.3;const k=(e.k=(e.k||0)+1)%3;if(k==0)brs(e,14+c.ph*6,210,e.dmg*.6,e.tm,.4,'#dcb');else if(k==1&&c.ph>0)e.wd=.6;else if(c.ph==2){const s1={x:rnd(120,840),y:rnd(120,480)},s2={x:rnd(120,840),y:rnd(120,480)};for(let X=100;X<870;X+=100)for(let Y=100;Y<520;Y+=100)if(Math.hypot(X-s1.x,Y-s1.y)>115&&Math.hypot(X-s2.x,Y-s2.y)>115)tz(X,Y,60,1.5,e.dmg,'#cba');flash('\u00a1El suelo cede! Busca un refugio')}else brs(e,10,250,e.dmg*.6,-e.tm,0,'#dcb')}}},
{up:(e,dt,c)=>{e.t1-=dt;if(e.vt>0){e.vt-=dt;if(e.vt<=0){e.vul=2.2;flash('Fulgor se descarga: \u00a1ataca!')}}if(e.vul>0)return;
if(e.t1<=0){const k=(e.k=(e.k||0)+1)%3;e.t1=2.8-c.ph*.3;
if(k==1||k==2&&c.ph>0){const g=Math.random()*4|0,g2=Math.random()*4|0,hz=k==1;for(let i=0;i<4;i++){if(i==g&&hz)continue;for(let j=0;j<9;j++)tz(100+j*95,130+i*110,50,1.4,e.dmg,'#fe6')}if(c.ph>0)for(let i=0;i<4;i++){if(i==g2)continue;for(let j=0;j<5;j++)tz(150+i*210,110+j*95,50,1.4,e.dmg,'#fe6')}e.vt=2.2}
else if(k==2)brs(e,8,320,e.dmg*.6,0,0,'#fe6');else{tp(e,240);tz(e.x,e.y,130,.9,e.dmg*1.2,'#fe6');for(let i=-1;i<=1;i++)bt(e,Math.atan2(P.y-e.y,P.x-e.x)+i*.15,420,e.dmg*.7,0,'#fe6')}}}},
{up:(e,dt,c)=>{G.dk=[270,215,165][c.ph];e.t1-=dt;if(e.vul>0)return;c.mv(-c.ny*c.sp*e.dir,c.nx*c.sp*e.dir);
if(e.t1<=0){const k=(e.k=(e.k||0)+1)%3;e.t1=2.4-c.ph*.3;if(k==1)for(let i=0;i<4+c.ph*2;i++)bt(e,i*1.57+i,140,e.dmg*.8,0,'#a4f',1.1);else if(k==2){tp(e,300);tz(P.x,P.y,80,1,e.dmg,'#a4f')}else{e.vul=2.4;e.t1=2.4;flash('Noctis devora la luz... \u00a1ataca!')}}}},
{up:(e,dt,c)=>{e.t1-=dt;e.rc=e.rc||[];e.t4=(e.t4||.3)-dt;if(e.t4<=0){e.t4=.3;e.rc.push({x:P.x,y:P.y});if(e.rc.length>9)e.rc.shift()}e.t2=(e.t2||9)-dt;
if(e.ch>0){e.ch-=dt;if(e.ch<=0){if(e.hl0-e.hp<e.mhp*.04){e.hp=Math.min(e.mhp,e.hp+e.mhp*.08);flash('\u00a1Cronos retrocede el tiempo!')}else{e.st.stun=1.6;e.vul=1.6;flash('\u00a1Rebobinado interrumpido!')}}return}
if(c.d>150)c.mv(c.nx*c.sp,c.ny*c.sp);if(e.t2<=0){e.t2=10-c.ph*1.5;e.ch=2.2;e.hl0=e.hp;flash('Cronos rebobina: \u00a1interr\u00fampelo con da\u00f1o!');ring(e,100,'#8cf')}
if(e.t1<=0){const k=(e.k=(e.k||0)+1)%3;e.t1=1.3-c.ph*.2;const o=e.rc[0];if(o)tz(o.x,o.y,64,.9,e.dmg,'#8cf');if(k==0)brs(e,10,220,e.dmg*.6,e.tm,0,'#8cf');if(c.ph>0&&k==1)tz(P.x,P.y,50,.7,e.dmg,'#8cf')}}},
{up:(e,dt,c)=>{e.t1-=dt;e.t2=(e.t2||10)-dt;const s=P.w.s;if(c.ph>=1){if(!e.orb)e.orb=[];e.orb=e.orb.filter(q=>q.hp>0&&!q.dead);if(!e.o2&&c.ph>=1){e.o2=1;for(let i=0;i<2;i++){const q=spawn('orb',e.x,e.y);q.sp=0;q.al=1;q.hp=q.mhp=60*hpM();q.oi=i;e.orb.push(q)}}e.orb.forEach(q=>{const a=e.tm*1.8+q.oi*3.14;q.x=e.x+Math.cos(a)*75;q.y=e.y+Math.sin(a)*75});e.imm=e.orb.length?1:0}
if(c.ph==2&&e.t2<=0){e.t2=11;P.invc=3;flash('\u00a1El Vac\u00edo invierte tu mundo!')}if(e.wd>0){e.wd-=dt;if(e.wd<=0)dsh(e,.25,540)}
if(s=='r'&&c.d<240)c.mv(-c.nx*c.sp,-c.ny*c.sp);else if(c.d>130&&!(e.wd>0))c.mv(c.nx*c.sp,c.ny*c.sp);
if(e.t1<=0){e.t1=1.9-c.ph*.3;e.k=(e.k||0)+1;if(s=='m'){if(e.k%2)e.wd=.5;else tz(e.x,e.y,150,.8,e.dmg,'#99c')}else if(s=='r'){for(let i=0;i<5;i++)bt(e,c.a+(i-2)*.05,520,e.dmg*.6,0,'#99c')}else{for(let i=0;i<3;i++)tz(P.x+rnd(-100,100),P.y+rnd(-100,100),60,.9,e.dmg,'#99c');bt(e,c.a,200,e.dmg*.7,0,'#99c',1.5)}}}}];
function spawnBoss(){const i=G.bo??bossIdx(G.d),B=BD[i],b=spawn('boss',480,150);b.bi=i;b.nm=B.n;b.r=B.r;b.hp=b.mhp*=B.hp*(i>6?1.1:1);b.dmg*=i>6?1.25:1;b.al=1;b.sp=2.4;b.t1=2;b.dir=Math.random()<.5?1:-1;G.intro={n:B.n,i,t:2.4};bsnd(i,'in');ring(b,120,B.c);G.bo=undefined;return b}
function bossDie(e){(e.mn||[]).concat(e.dc||[],e.orb||[]).forEach(q=>{q.hp=0;q.dead=1});shake=18;bsnd(e.bi,'die');for(let i=0;i<4;i++)FX.push({k:'ring',x:e.x,y:e.y,r:80+i*50,t:.5+i*.2,m:.5+i*.2,c:BD[e.bi].c});G.dk=0;P.invc=0;flash('\u00a1'+e.nm+' derrotado!')}
function arenaMenu(){show(`<h2>Arena de jefes</h2><p>Se desbloquean al alcanzar su profundidad (tu mejor: ${S.best}). Empiezas con un personaje de nivel acorde.</p>`,BD.map((b,i)=>({i:`<span style="color:${b.c}">\u25c6</span>`,n:b.n,tp:i<7?'Jefe':'Jefe final',r:i<7?1:3,d:['Embestidas encadenadas y fintas.','Ondas de choque; sus embestidas destrozan el escenario.','Disparos curvos y espirales; recarga.','Copias id\u00e9nticas: halla al verdadero.','Trampas retardadas y barridos.','Cambia de forma al 50% de vida.','Orbes protectores e inversi\u00f3n de controles.','Invoca esqueletos; el suelo cede.','Franjas el\u00e9ctricas con carriles seguros.','Oscuridad y orbes rastreadores.','Rebobina el tiempo: interr\u00fampelo.','Imita tu estilo de combate.'][i],stx:'Profundidad '+bossDepth(i),dis:S.best<bossDepth(i),nc:1,f:()=>arena(i)})).concat([{t:'Volver',nc:1,f:menu}]))}
function arena(i){run(0);const d=bossDepth(i);G.d=d;G.bo=i;G.arena=1;genLevel();const L=Math.min(40,1+d*2);P.lv=L;for(let k=1;k<L;k++){P.a[P.w.sc]+=1;if(k%2)P.a.vit+=1;else P.a.agi+=1}ST();P.hp=P.mhp;P.mp=P.mmp;enter(G.R.findIndex(r=>r.tp=='boss'),4)}
// hx: añade transparencia a un color #RGB o #RRGGBB (concatenar '77' a '#b87' daba un color inválido y rompía el render)
const hx=(h,a)=>(h.length==4?'#'+h[1]+h[1]+h[2]+h[2]+h[3]+h[3]:h)+a;
function safe(f,e){x.save();try{f(e)}catch(er){console.error(er)}finally{x.restore()}}
function drawBoss(e){const B=BD[e.bi]||BD[0],r=e.r,c=e.col||B.c,t=e.tm||0,a=Math.atan2(P.y-e.y,P.x-e.x),F=e.fl>0?'#fff':c;x.save();x.translate(e.x,e.y);if(e.t=='decoy')x.globalAlpha=.78+.2*Math.sin(t*9);
const g=x.createRadialGradient(0,0,r*.2,0,0,r*1.8);g.addColorStop(0,hx(c,'77'));g.addColorStop(1,hx(c,'00'));x.fillStyle=g;x.beginPath();x.arc(0,0,r*1.8,0,7);x.fill();
const S2=(n,r1,r2,o)=>{x.beginPath();for(let i=0;i<n*2;i++){const q=o+i*Math.PI/n;x.lineTo(Math.cos(q)*(i%2?r2:r1),Math.sin(q)*(i%2?r2:r1))}x.closePath();x.fill();x.stroke()},C=(rr,fill)=>{x.beginPath();x.arc(0,0,rr,0,7);if(fill)x.fill();else x.stroke()};
x.fillStyle=F;x.strokeStyle='#000';x.lineWidth=3;
if(e.t=='orb'){x.fillStyle='#a4f';C(r,1);x.stroke()}else switch(e.bi){
case 0:x.save();x.rotate(a);x.beginPath();x.ellipse(0,0,r,r*.8,0,0,7);x.fill();x.stroke();x.strokeStyle='#fff';x.lineWidth=4;x.beginPath();x.moveTo(r*.4,-r*.5);x.lineTo(r*2,r*.2);x.moveTo(r*.4,r*.5);x.lineTo(r*2,-r*.2);x.stroke();x.restore();break;
case 1:x.fillRect(-r,-r,2*r,2*r);x.strokeRect(-r,-r,2*r,2*r);for(const s of[-1,1]){x.beginPath();x.arc(s*r*1.15,Math.sin(t*3)*5,r*.45,0,7);x.fill();x.stroke()}S2(8,r*1.25,r*.95,t*.2);break;
case 2:x.save();x.rotate(a);S2(4,r*1.4,r*.5,0);x.strokeStyle='#fff';x.lineWidth=3;x.beginPath();x.arc(0,0,r*1.7,-1,1);x.stroke();x.restore();break;
case 3:for(let i=0;i<3;i++){x.save();x.rotate(t+i*2.09);x.globalAlpha*=.75;S2(3,r*1.1,r*.5,0);x.restore()}break;
case 4:S2(6,r,r*.9,0);for(let i=0;i<4;i++){const q=t*1.5+i*1.57;x.fillRect(Math.cos(q)*r*1.6-4,Math.sin(q)*r*1.6-4,8,8)}break;
case 5:if(!e.tf)S2(8,r*1.35,r*.7,t);else{for(const s of[-1,1]){x.beginPath();x.moveTo(0,0);x.lineTo(s*r*2.2,-r*1.1+Math.sin(t*8)*6);x.lineTo(s*r*1.5,r*.6);x.closePath();x.fill();x.stroke()}C(r*.8,1);x.stroke()}break;
case 6:C(r,1);x.stroke();x.strokeStyle='#fff';C(r*1.3);C(r*1.55);x.strokeStyle='#000';x.save();x.translate(0,-r*.9);S2(5,r*.6,r*.3,-1.57);x.restore();break;
case 7:C(r,1);x.stroke();x.fillStyle='#000';x.beginPath();x.arc(-r*.35,-r*.1,r*.2,0,7);x.arc(r*.35,-r*.1,r*.2,0,7);x.fill();x.fillRect(-r*.3,r*.3,r*.6,r*.12);x.fillStyle='#fd4';x.save();x.translate(0,-r*1.05);S2(4,r*.5,r*.25,-1.57);x.restore();break;
case 8:S2(6,r*1.5,r*.45,t*3);x.fillStyle='#fff';C(r*.3,1);break;
case 9:x.fillStyle='#120818';C(r,1);x.strokeStyle=c;x.lineWidth=4;C(r);x.fillStyle='#fff';x.beginPath();x.arc(0,0,r*.5,0,7);x.fill();x.fillStyle='#000';x.beginPath();x.arc(Math.cos(a)*r*.2,Math.sin(a)*r*.2,r*.22,0,7);x.fill();break;
case 10:C(r,1);x.stroke();x.strokeStyle='#124';x.lineWidth=3;for(let i=0;i<12;i++){x.beginPath();x.moveTo(Math.cos(i*.524)*r*.85,Math.sin(i*.524)*r*.85);x.lineTo(Math.cos(i*.524)*r,Math.sin(i*.524)*r);x.stroke()}x.beginPath();x.moveTo(0,0);x.lineTo(Math.cos(t*(e.ch>0?-6:1))*r*.8,Math.sin(t*(e.ch>0?-6:1))*r*.8);x.moveTo(0,0);x.lineTo(Math.cos(t*.2)*r*.5,Math.sin(t*.2)*r*.5);x.stroke();break;
default:x.fillStyle='#050508';C(r,1);x.strokeStyle='#99c';x.lineWidth=3;for(let i=0;i<3;i++){x.beginPath();x.arc(0,0,r*(.4+i*.3),t*2+i,t*2+i+3.5);x.stroke()}}
if(e.t=='boss'){x.fillStyle=e.imm>0?'#999':e.vul>0?'#ffd34a':'#f33';x.beginPath();x.moveTo(0,-r-24);x.lineTo(7,-r-14);x.lineTo(0,-r-4);x.lineTo(-7,-r-14);x.fill();if(e.wd>0||e.ch>0){x.strokeStyle='#f33';x.lineWidth=2;x.setLineDash([6,6]);x.beginPath();x.moveTo(0,0);x.lineTo(Math.cos(a)*300,Math.sin(a)*300);x.stroke();x.setLineDash([]);x.beginPath();x.arc(0,0,r+14+Math.sin(t*20)*3,0,7);x.stroke()}if(e.imm>0){x.strokeStyle='#bbb';x.lineWidth=3;x.beginPath();x.arc(0,0,r+8,0,7);x.stroke()}}
x.restore()}
