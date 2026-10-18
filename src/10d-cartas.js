// ===== CARTAS DE HECHIZO (solo Mago), PROGRESO PERMANENTE Y HUD =====
// Progreso PERMANENTE (localStorage, S): mejor profundidad, jefes derrotados en partidas normales, cartas desbloqueadas y espacios equipados.
// Progreso TEMPORAL (P, se reinicia en cada run): vida, man\u00e1, nivel, equipo, reliquias, talentos. La pr\u00e1ctica (Arena) no escribe nada permanente.
const ETIER={fire:0,ice:0,light:0,water:1,plant:1,wind:1,rock:2,dark:2,blood:3,corr:3},EFORM={fire:'bolt',ice:'nova',light:'bolt',water:'zone',plant:'zone',wind:'cone',rock:'bolt',dark:'cone',blood:'bolt',corr:'zone'},STARTERS=['fire','ice','light'];
const EREQ={water:[['depth',2]],plant:[['depth',3]],wind:[['depth',4]],rock:[['boss',0]],dark:[['boss',2]],blood:[['boss',4]],corr:[['boss',6]]},FN={bolt:'Proyectil',nova:'Nova',cone:'Cono',zone:'Zona'};
const tsum=k=>k.split('+').reduce((s,z)=>s+ETIER[z],0),CARDS={},CORDER=[];
Object.keys(EL).sort((a,b)=>ETIER[a]-ETIER[b]).forEach(k=>{CARDS[k]={k,a:k,b:'',f:EFORM[k],n:EL[k].n,req:EREQ[k]||[]};CORDER.push(k)});
Object.keys(CB).sort((p,q)=>tsum(p)-tsum(q)||p.localeCompare(q)).forEach(k=>{const[a,b]=k.split('+'),t=tsum(k),req=[['card',a],['card',b],['depth',2+t]];if(t>=4)req.push(['boss',t-2]);CARDS[k]={k,a,b,f:CB[k].f||'bolt',n:CB[k].n,req};CORDER.push(k)});
const reqOK=r=>r[0]=='depth'?S.best>=r[1]:r[0]=='boss'?!!S.bosses[r[1]]:!!S.cards.unlocked[r[1]];
const reqTxt=r=>r[0]=='depth'?`Alcanzar la profundidad ${r[1]} (tu mejor: ${S.best})`:r[0]=='boss'?`Derrotar a ${BD[r[1]].n} en una partida normal`:`Tener la carta de ${EL[r[1]].n}`;
function checkUnlocks(){const nu=[];let ch=1;while(ch){ch=0;for(const k of CORDER)if(!S.cards.unlocked[k]&&CARDS[k].req.every(reqOK)){S.cards.unlocked[k]=1;nu.push(CARDS[k].n);ch=1}}return nu}
// Guardado: tolera datos inexistentes, incompletos, corruptos o antiguos (v1 sin cartas \u2192 v2; los jefes de profundidades superadas se dan por derrotados)
function normS(){const o=v=>v&&typeof v=='object'&&!Array.isArray(v)?v:{};S.best=+S.best||0;S.souls=+S.souls||0;S.pw=+S.pw||0;S.bosses=o(S.bosses);S.cards=o(S.cards);S.cards.unlocked=o(S.cards.unlocked);const sl=Array.isArray(S.cards.slots)?S.cards.slots.slice(0,4):[];while(sl.length<4)sl.push(null);
if(S.v!==2){S.v=2;for(let i=0;i<7;i++)if(S.best>i+1)S.bosses[i]=1;STARTERS.forEach((k,i)=>{S.cards.unlocked[k]=1;sl[i]=k})}
checkUnlocks();for(const k in S.cards.unlocked)if(!CARDS[k])delete S.cards.unlocked[k];S.cards.slots=sl.map(k=>CARDS[k]&&S.cards.unlocked[k]?k:null);save()}
normS();
function equipCard(k,sl){if(!P||P.cls!='g'||!CARDS[k]||sl<0||sl>3)return false;if(!S.cards.unlocked[k]){flash('Carta bloqueada: '+CARDS[k].req.filter(r=>!reqOK(r)).map(reqTxt)[0]);return false}const s=S.cards.slots,o=s.indexOf(k);if(o>=0)s[o]=s[sl];s[sl]=k;save();return true}
function unequipCard(sl){S.cards.slots[sl]=null;save()}
function castCard(i){const k=S.cards.slots[i];if(!k||!S.cards.unlocked[k]||!P||P.cls!='g')return;const c=CARDS[k];castSp({a:c.a,b:c.b,f:c.f},4+i)}
// ---- ventana de cartas: arrastrar (rat\u00f3n y t\u00e1ctil) o tocar carta y luego espacio ----
function slotAt(ev){const el=document.elementFromPoint(ev.clientX,ev.clientY),s=el&&el.closest&&el.closest('[data-slot]');return s?+s.dataset.slot:-1}
function drop(k,s,from){if(s>=0){if(!S.cards.unlocked[k])flash('Carta bloqueada');else equipCard(k,s)}else if(from>=0)unequipCard(from);book(1)}
function dragify(el,k,from){el.style.touchAction='none';el.onpointerdown=e=>{const sx=e.clientX,sy=e.clientY;let g=null;const mv=ev=>{if(!g&&Math.hypot(ev.clientX-sx,ev.clientY-sy)>6){g=el.cloneNode(true);g.style.cssText+=';position:fixed;pointer-events:none;opacity:.85;z-index:99';ov.appendChild(g);el.style.opacity=.4}if(g){g.style.left=ev.clientX-60+'px';g.style.top=ev.clientY-40+'px'}},up=ev=>{window.removeEventListener('pointermove',mv);window.removeEventListener('pointerup',up);if(g){g.remove();el.style.opacity=1;drop(k,slotAt(ev),from)}else{G.csel=k;book(1)}};window.addEventListener('pointermove',mv);window.addEventListener('pointerup',up)}}
function book(f){if(G.st!='play'||!P||P.cls!='g'||(G.ov&&!G.bk))return;if(G.bk&&!f){hide();return}G.bk=1;G.pz=1;G.ov=1;ov.style.display='flex';
const FL=G.cel||'',PS=6,mkb=(t,fn,on,c)=>{const e=document.createElement('button');e.textContent=t;e.style.cssText=`padding:4px 9px;font-size:12px;border-color:${c||'#c9a24a'};`+(on?'background:#4a3d60;border-color:#fff':'');e.onclick=fn;return e},row=()=>{const r=document.createElement('div');r.style.cssText='display:flex;flex-wrap:wrap;gap:8px;justify-content:center;max-width:96%';ov.appendChild(r);return r};
ov.innerHTML=`<h2>Cartas de hechizo</h2><p>Arrastra una carta desbloqueada a un espacio, o toca la carta y luego el espacio. Se lanzan con las teclas 1\u20134. Lo desbloqueado es permanente.</p>`;
let r=row();r.appendChild(mkb('Cerrar (B)',hide));
r=row();for(let i=0;i<4;i++){const k=S.cards.slots[i],d=document.createElement('div');d.dataset.slot=i;d.style.cssText=`min-width:118px;min-height:58px;border:2px ${k?'solid':'dashed'} ${k?EL[CARDS[k].a].c:'#888'};border-radius:8px;padding:6px;font-size:12px;background:#1a1722;${G.csel&&!k?'box-shadow:0 0 8px #fff8':''}`;d.innerHTML=`<small>Espacio ${i+1} \u00b7 tecla ${KL(KY['c'+(i+1)])}</small><br><b>${k?CARDS[k].n:'(vac\u00edo)'}</b>`;
 d.onclick=()=>{if(G.csel&&equipCard(G.csel,i)){G.csel=null;book(1)}else if(!G.csel&&k){unequipCard(i);book(1)}};if(k)dragify(d,k,i);r.appendChild(d)}
ov.insertAdjacentHTML('beforeend',`<small>${G.csel?'Seleccionada: '+CARDS[G.csel].n+' \u2192 toca un espacio':'Toca un espacio ocupado para vaciarlo'}</small>`);
r=row();[['','Todas'],['*','Desbloqueadas'],...Object.keys(EL).map(k=>[k,EL[k].n])].forEach(([k,n])=>r.appendChild(mkb(n,()=>{G.cel=k;G.cpg=0;book(1)},FL==k,EL[k]&&EL[k].c)));
const L=CORDER.filter(k=>!FL||(FL=='*'?S.cards.unlocked[k]:CARDS[k].a==FL||CARDS[k].b==FL)),pg=Math.min(G.cpg||0,Math.max(0,Math.ceil(L.length/PS)-1)),un=CORDER.filter(k=>S.cards.unlocked[k]).length;
ov.insertAdjacentHTML('beforeend',`<b>Colecci\u00f3n: ${un}/${CORDER.length} desbloqueadas</b>`);
r=row();L.slice(pg*PS,pg*PS+PS).forEach(k=>{const c=CARDS[k],e=EL[c.a],u=!!S.cards.unlocked[k],sp=build(c.a,c.b,c.f),sl=S.cards.slots.indexOf(k),d=document.createElement('div');
 d.style.cssText=`width:170px;text-align:left;border:2px solid ${u?e.c:'#555'};border-radius:10px;padding:8px;font-size:12px;background:linear-gradient(160deg,#1a1722,${e.c}33);${u?'':'opacity:.72;'}${G.csel==k?'box-shadow:0 0 10px #fff;':''}`;
 d.innerHTML=`<b style="color:${e.c}">${c.n}</b><br><small>${EL[c.a].n}${c.b?' + '+EL[c.b].n:''} \u00b7 ${FN[sp.f]}</small><p style="margin:4px 0;font-size:11px">${c.b?CB[k].d:e.d}</p><small>Coste ${Math.ceil(sp.cost)} \u00b7 Enfr. ${sp.cd.toFixed(1)}s \u00b7 Da\u00f1o ${Math.round(sp.dmg)} \u00b7 Radio ${Math.round(sp.r)}</small><br>`+
 (u?`<small style="color:#8c8">${sl>=0?'EQUIPADA (espacio '+(sl+1)+')':'Desbloqueada'}</small>`:`<small style="color:#e88">BLOQUEADA \u2014 requisitos:</small>${c.req.map(q=>`<br><small style="color:${reqOK(q)?'#8c8':'#e88'}">${reqOK(q)?'\u2713':'\u2717'} ${reqTxt(q)}</small>`).join('')}`);
 if(u)dragify(d,k,-1);else d.onclick=()=>{G.csel=null;flash('Bloqueada: '+c.req.filter(q=>!reqOK(q)).map(reqTxt).join(' \u00b7 '))};r.appendChild(d)});
if(L.length>PS){r=row();const pv=mkb('\u2039 Anterior',()=>{G.cpg=pg-1;book(1)},0);pv.disabled=pg<=0;r.appendChild(pv);const nx=mkb('Siguiente \u203a',()=>{G.cpg=pg+1;book(1)},0);nx.disabled=(pg+1)*PS>=L.length;r.appendChild(nx);ov.insertAdjacentHTML('beforeend',`<small>P\u00e1gina ${pg+1}/${Math.ceil(L.length/PS)}</small>`)}}
// ---- HUD: casillas con icono, tecla, estado (listo, enfriamiento, sin man\u00e1, seleccionado) y etiqueta contextual al pasar el rat\u00f3n ----
const KL=c=>(c||'').replace('Key','').replace('Digit','').replace('Space','ESP').replace('Arrow','');
function rr(px,py,w,h,r){x.beginPath();x.moveTo(px+r,py);x.arcTo(px+w,py,px+w,py+h,r);x.arcTo(px+w,py+h,px,py+h,r);x.arcTo(px,py+h,px,py,r);x.arcTo(px,py,px+w,py,r);x.closePath()}
function ico(id,cx,cy,s,c){x.save();x.translate(cx,cy);x.strokeStyle=c;x.fillStyle=c;x.lineWidth=2;const r=s/2;switch(id){
case'whirl':x.beginPath();x.arc(0,0,r*.7,0,4.7);x.stroke();x.beginPath();x.moveTo(r*.7,-r*.1);x.lineTo(r*.4,-r*.5);x.lineTo(r*.95,-r*.45);x.fill();break;
case'leap':x.beginPath();x.moveTo(-r*.7,r*.6);x.quadraticCurveTo(0,-r,r*.7,r*.6);x.stroke();x.fillRect(-r*.8,r*.6,r*1.6,3);break;
case'guard':x.beginPath();x.moveTo(0,-r*.8);x.lineTo(r*.7,-r*.4);x.lineTo(r*.5,r*.5);x.lineTo(0,r*.85);x.lineTo(-r*.5,r*.5);x.lineTo(-r*.7,-r*.4);x.closePath();x.stroke();break;
case'volley':for(let i=-1;i<=1;i++){x.beginPath();x.moveTo(-r*.7,i*r*.45);x.lineTo(r*.7,i*r*.45);x.lineTo(r*.45,i*r*.45-4);x.stroke()}break;
case'bomb':x.beginPath();x.arc(0,r*.1,r*.5,0,7);x.fill();x.beginPath();x.moveTo(0,-r*.4);x.lineTo(r*.3,-r*.8);x.stroke();break;
case'drop':x.beginPath();x.moveTo(0,-r*.8);x.quadraticCurveTo(r*.7,r*.2,0,r*.8);x.quadraticCurveTo(-r*.7,r*.2,0,-r*.8);x.fill();break;
case'orb':x.beginPath();x.arc(0,0,r*.55,0,7);x.fill();break;
case'nova':for(let i=0;i<8;i++){x.beginPath();x.moveTo(Math.cos(i*.785)*r*.3,Math.sin(i*.785)*r*.3);x.lineTo(Math.cos(i*.785)*r*.85,Math.sin(i*.785)*r*.85);x.stroke()}break;
case'bolt':x.beginPath();x.moveTo(r*.2,-r*.9);x.lineTo(-r*.4,r*.1);x.lineTo(0,r*.1);x.lineTo(-r*.2,r*.9);x.lineTo(r*.5,-r*.2);x.lineTo(r*.1,-r*.2);x.closePath();x.fill();break;
case'cone':x.beginPath();x.moveTo(-r*.8,0);x.lineTo(r*.8,-r*.6);x.lineTo(r*.8,r*.6);x.closePath();x.stroke();break;
case'zone':x.setLineDash([3,3]);x.beginPath();x.arc(0,0,r*.7,0,7);x.stroke();x.setLineDash([]);break;
case'rage':x.beginPath();for(let i=0;i<10;i++){const q=i*.628-1.57,rr2=i%2?r*.35:r*.85;x.lineTo(Math.cos(q)*rr2,Math.sin(q)*rr2)}x.closePath();x.fill();break;
case'reload':x.beginPath();x.arc(0,0,r*.65,.5,5.8);x.stroke();x.beginPath();x.moveTo(r*.6,-r*.5);x.lineTo(r*.9,-r*.1);x.lineTo(r*.3,-r*.05);x.fill();break;
case'dodge':for(let i=0;i<2;i++){x.beginPath();x.moveTo(-r*.6+i*r*.5,-r*.6);x.lineTo(-r*.1+i*r*.5,0);x.lineTo(-r*.6+i*r*.5,r*.6);x.stroke()}break;
default:x.beginPath();x.arc(0,0,r*.4,0,7);x.fill()}x.restore()}
let HT=null;
function slot(px,py,s,o){const hov=M.x>=px&&M.x<=px+s&&M.y>=py&&M.y<=py+s;x.save();rr(px,py,s,s,7);x.fillStyle=o.off?'#0c0a10dd':'#161120dd';x.fill();x.lineWidth=o.sel?3:2;x.strokeStyle=o.sel?'#fff':o.col||'#6a5d80';if(o.empty)x.setLineDash([4,3]);x.stroke();x.setLineDash([]);
if(o.ico)ico(o.ico,px+s/2,py+s/2+2,s*.8,o.off?'#666':o.col||'#ddd');else if(o.em)spr(o.em,px+s/2,py+s/2+1,s*.6);
if(o.cd>0){x.fillStyle='#000b';x.fillRect(px+2,py+2,s-4,(s-4)*cl(o.cd/(o.cdm||1),0,1));x.fillStyle='#fff';x.font='bold 13px Georgia';x.textAlign='center';x.fillText(o.cd.toFixed(o.cd<10?1:0),px+s/2,py+s/2+5)}else if(o.nomp){x.fillStyle='#2a4cc088';x.fillRect(px+2,py+2,s-4,s-4)}
if(o.key){x.font='bold 10px Georgia';const w=x.measureText(o.key).width+8;rr(px-2,py-4,w,13,4);x.fillStyle='#c9a24a';x.fill();x.fillStyle='#000';x.textAlign='left';x.fillText(o.key,px+2,py+6)}
if(o.mp){x.fillStyle='#8cf';x.font='9px Georgia';x.textAlign='right';x.fillText(o.mp,px+s-3,py+s-3)}x.restore();if(hov&&o.tip)HT=o.tip}
function hudSlots(){const s=42,g=7,y=H-s-14,w=P.w.s,A=AB[w],mg=P.cls=='g',IC={m:['whirl','leap','guard'],r:['volley','bomb','drop'],g:['orb','nova','bolt']},NM={m:['Remolino','Salto con impacto','Guardia (mantener)'],r:['Andanada','Flecha explosiva','Flecha venenosa'],g:['Bola de fuego','Nova de hielo','Rayo en cadena']},EC2={m:'#d8b36a',r:'#7fd08a',g:'#8aa8ff'}[w];HT=null;tcSync();let px=TOUCH?Math.max(12,(W-(5+(mg?4:0))*(s+g))/2):12;
for(let i=0;i<3;i++){const a=A[i],ok=a&&a.f;slot(px,y,s,{ico:IC[w][i],key:i<2?KL(KY[i?'e':'q']):'CLIC D',col:EC2,off:!ok,cd:ok?P.cd[i]:0,cdm:a.cd,nomp:a.mp&&P.mp<a.mp,sel:i==2&&P.g,mp:a.mp||'',tip:[NM[w][i],ok?`Enfriamiento ${a.cd||0}s${a.mp?' \u00b7 '+a.mp+' man\u00e1':''}`:'Mant\u00e9n el clic derecho para guardia']});px+=s+g}
const tm=P.tm,rI=tm?{shield:'guard',trap:'zone',summon:'orb',beam:'bolt',cone:'cone'}[tm]:w=='m'?(P.w.bleed?'drop':'rage'):w=='r'?'reload':'orb';slot(px,y,s,{ico:rI,key:KL(KY.r),col:'#c9a24a',cd:P.cd[3],cdm:tm?10:14,tip:[tm?TM[tm]:'Acci\u00f3n de clase','Tecla '+KL(KY.r)]});px+=s+g;
slot(px,y,s,{ico:'dodge',key:KL(KY.dodge),col:'#9cf',cd:P.dcd,cdm:.8,tip:['Esquivar','Breve invulnerabilidad']});px+=s+g*2;
if(mg)for(let i=0;i<4;i++){const k=S.cards.slots[i],c=k&&CARDS[k];if(!c){slot(px,y,s,{empty:1,key:KL(KY['c'+(i+1)]),tip:['Espacio de carta vac\u00edo','Pulsa B para equipar una carta']})}else{const sp=build(c.a,c.b,c.f);slot(px,y,s,{ico:{bolt:'orb',nova:'nova',cone:'cone',zone:'zone'}[sp.f],key:KL(KY['c'+(i+1)]),col:EL[c.a].c,cd:P[('cd')][4+i],cdm:sp.cd,nomp:P.mp<sp.cost,mp:Math.ceil(sp.cost),tip:[c.n,`Coste ${Math.ceil(sp.cost)} \u00b7 Enfr. ${sp.cd.toFixed(1)}s \u00b7 Da\u00f1o ${Math.round(sp.dmg)}`]})}px+=s+g}
if(TOUCH)return;
// equipo visible a la derecha
const eq=[['w',{i:WI[P.w.n]||'\u2694\ufe0f',n:P.w.n,r:RN.indexOf(P.w.rn),st:{}}],...['h','b','g','f','a'].map(k=>[k,P.eq[k]])];let ex=W-12-eq.length*(s-4+g);
eq.forEach(([k,it])=>{slot(ex,y,s-4,{em:it&&it.i,col:it?RC[it.r||0]:'#4a4258',empty:!it,key:'',tip:it?[it.n,it.st&&Object.keys(it.st).length?stT(it.st):`${SLOT[k]}`]:[SLOT[k]+' vac\u00edo','Abre el inventario (I)']});ex+=s-4+g});
x.fillStyle='#fffb';x.font='11px Georgia';x.textAlign='center';x.fillText(`[${KL(KY.inv)}] Inventario   [${KL(KY.tal)}] Talentos${mg?'   ['+KL(KY.book)+'] Cartas':''}   [${KL(KY.map)}] Mapa`,W/2,H-2);
if(HT){x.font='12px Georgia';const w1=Math.max(x.measureText(HT[0]).width,x.measureText(HT[1]).width)+16,tx=cl(M.x-w1/2,6,W-w1-6),ty=y-46;rr(tx,ty,w1,40,6);x.fillStyle='#000d';x.fill();x.strokeStyle='#c9a24a';x.stroke();x.fillStyle='#fff';x.textAlign='left';x.fillText(HT[0],tx+8,ty+16);x.fillStyle='#bbb';x.fillText(HT[1],tx+8,ty+32)}}
