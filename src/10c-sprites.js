// ===== SPRITES PROCEDURALES (formas por capas con animaci\u00f3n) Y SONIDOS DE JEFE =====
// Los enemigos normales y el jugador se dibujan con siluetas propias, orientadas hacia su objetivo, con balanceo al moverse,
// anticipaci\u00f3n de ataque (pulso), estiramiento en embestidas, destello al recibir da\u00f1o y animaci\u00f3n de muerte (FX 'dead').
const star=(n,r1,r2,o)=>{x.beginPath();for(let i=0;i<n*2;i++){const q=o+i*Math.PI/n,rr=i%2?r2:r1;x.lineTo(Math.cos(q)*rr,Math.sin(q)*rr)}x.closePath();x.fill();x.stroke()};
function drawEnemy(e){const T=ET[e.t],r=e.r,a=Math.atan2(P.y-e.y,P.x-e.x),t=e.tm||0,F=e.fl>0?'#fff':T.c,mvs=e.sp>0?0:1,bob=Math.sin(t*7+e.x)*1.6*mvs;
x.save();x.fillStyle='#0005';x.beginPath();x.ellipse(e.x,e.y+r*.85,r*.95,r*.35,0,0,7);x.fill();x.translate(e.x,e.y+bob);
const pw=e.wind>0?1+.12*Math.sin(t*35):1,st=e.lu>0?1.25:1;x.scale(pw*st,pw/(st*.95+.05));x.rotate(a);
x.strokeStyle=e.mod?'#ffd34a':'#000';x.lineWidth=e.mod?3:2;x.fillStyle=F;
const C=(q,f=1)=>{x.beginPath();x.arc(0,0,q,0,7);if(f)x.fill();x.stroke()},L=(x1,y1,x2,y2,c,w)=>{x.save();x.strokeStyle=c;x.lineWidth=w;x.beginPath();x.moveTo(x1,y1);x.lineTo(x2,y2);x.stroke();x.restore()},eye=(ex,ey)=>{x.save();x.fillStyle='#fff';x.beginPath();x.arc(ex,ey,r*.16,0,7);x.fill();x.fillStyle='#000';x.beginPath();x.arc(ex+r*.05,ey,r*.07,0,7);x.fill();x.restore()};
switch(e.t){
case'grunt':C(r*.9);L(r*.3,r*.6,r*1.5,-r*.4,'#7a5a3a',4);x.save();x.fillStyle='#7a5a3a';x.beginPath();x.arc(r*1.5,-r*.4,r*.28,0,7);x.fill();x.restore();eye(r*.45,-r*.25);eye(r*.45,r*.25);break;
case'runner':x.beginPath();x.ellipse(0,0,r*1.2,r*.7,0,0,7);x.fill();x.stroke();L(r*.6,-r*.45,r*1.7,-r*.2,'#fff',3);L(r*.6,r*.45,r*1.7,r*.2,'#fff',3);eye(r*.6,0);break;
case'archer':x.beginPath();x.moveTo(r*1.1,0);x.lineTo(-r*.8,-r*.95);x.lineTo(-r*.8,r*.95);x.closePath();x.fill();x.stroke();x.save();x.strokeStyle='#cb8';x.lineWidth=3;x.beginPath();x.arc(r*.5,0,r*1.05,-1.1,1.1);x.stroke();x.restore();eye(r*.3,0);break;
case'mage':C(r);x.save();x.rotate(-a);x.beginPath();x.moveTo(-r*.7,-r*.7);x.lineTo(0,-r*1.9);x.lineTo(r*.7,-r*.7);x.closePath();x.fill();x.stroke();x.restore();L(r*.2,r*.9,r*1.4,-r*.9,'#8a6a4a',3);x.save();x.fillStyle='#e8a8ff';x.shadowColor='#c8f';x.shadowBlur=10;x.beginPath();x.arc(r*1.4,-r*.9,r*.28+Math.sin(t*8)*1.5,0,7);x.fill();x.restore();eye(r*.45,0);break;
case'tank':x.fillRect(-r,-r,2*r,2*r);x.strokeRect(-r,-r,2*r,2*r);x.save();x.fillStyle='#9ab';x.fillRect(r*.45,-r*1.05,r*.45,r*2.1);x.strokeRect(r*.45,-r*1.05,r*.45,r*2.1);x.restore();eye(r*.1,-r*.3);eye(r*.1,r*.3);break;
case'bomber':C(r);L(-r*.6,-r*.6,-r*1.2,-r*1.1,'#a85',2);x.save();x.fillStyle=Math.sin(t*25)>0?'#ff0':'#f80';x.beginPath();x.arc(-r*1.25,-r*1.15,r*.2,0,7);x.fill();x.restore();eye(r*.4,-r*.2);eye(r*.4,r*.2);break;
case'summoner':star(4,r*1.3,r*.55,t);for(let i=0;i<3;i++){const q=t*2+i*2.09;x.save();x.fillStyle='#8df';x.beginPath();x.arc(Math.cos(q)*r*1.7,Math.sin(q)*r*1.7,r*.2,0,7);x.fill();x.restore()}C(r*.35);break;
case'guardian':C(r*.85);x.save();x.strokeStyle='#8fc';x.lineWidth=6;x.beginPath();x.arc(0,0,r*1.2,-1,1);x.stroke();x.restore();eye(r*.3,-r*.25);eye(r*.3,r*.25);break;
case'stalker':x.beginPath();x.ellipse(-r*.2,0,r*1.3,r*.65,0,0,7);x.fill();x.stroke();for(let i=-1;i<=1;i++)L(r*.9,i*r*.3,r*1.7,i*r*.45,'#fff',2);x.beginPath();x.moveTo(r*.5,-r*.5);x.lineTo(r*.9,-r*1.1);x.lineTo(r*.9,-r*.4);x.fill();x.beginPath();x.moveTo(r*.5,r*.5);x.lineTo(r*.9,r*1.1);x.lineTo(r*.9,r*.4);x.fill();eye(r*.7,-r*.15);eye(r*.7,r*.15);break;
case'elite':star(7,r*1.3,r*.85,t*.6);C(r*.6);x.save();x.fillStyle='#fd4';x.rotate(-a);x.translate(0,-r*1.5);star(3,r*.4,r*.2,-1.57);x.restore();eye(r*.3,-r*.2);eye(r*.3,r*.2);break;
default:C(r)}
x.restore();if(e.al&&e.nl>1.5&&e.lk){x.save();x.fillStyle='#ff0';x.font='bold 16px Georgia';x.textAlign='center';x.fillText('?',e.x,e.y-r-14);x.restore()}}
function drawP(){const s=P.w.s,a=P.face,mv=Math.min(1,Math.hypot(P.vx,P.vy)/P.spd),bob=Math.sin(Date.now()/85)*2.2*mv,col=P.fl>0?'#fff':{m:'#d8b36a',r:'#7fd08a',g:'#8aa8ff'}[s],dk={m:'#6b5530',r:'#3c6a44',g:'#3a4a8a'}[s];
x.save();x.fillStyle='#0006';x.beginPath();x.ellipse(P.x,P.y+11,12,4.5,0,0,7);x.fill();x.translate(P.x,P.y+bob);
x.fillStyle=dk;x.beginPath();x.moveTo(-Math.cos(a)*6,-Math.sin(a)*6-8);x.lineTo(-Math.cos(a)*(20+mv*9)+Math.sin(a)*8,-Math.sin(a)*(20+mv*9)-Math.cos(a)*8);x.lineTo(-Math.cos(a)*(20+mv*9)-Math.sin(a)*8,-Math.sin(a)*(20+mv*9)+Math.cos(a)*8);x.closePath();x.fill();
x.fillStyle=col;x.strokeStyle='#000';x.lineWidth=2;x.beginPath();x.arc(0,0,P.r,0,7);x.fill();x.stroke();
x.save();x.rotate(a);x.fillStyle=dk;if(s=='m'){x.fillRect(P.r*.2,-P.r*.55,P.r*.7,P.r*1.1);x.fillStyle='#000';x.fillRect(P.r*.55,-P.r*.2,P.r*.3,P.r*.4)}else if(s=='r'){x.beginPath();x.moveTo(P.r*.9,0);x.lineTo(-P.r*.4,-P.r*1.1);x.lineTo(-P.r*.4,P.r*1.1);x.closePath();x.fill()}else{x.save();x.rotate(-a);x.beginPath();x.moveTo(-P.r*.8,-P.r*.6);x.lineTo(0,-P.r*2.1);x.lineTo(P.r*.8,-P.r*.6);x.closePath();x.fill();x.stroke();x.restore()}
const sw=P.at>0?(P.at/(s=='m'?.2:.12)-.5)*2.4:0;x.rotate(s=='m'?sw:0);
if(s=='m'){x.strokeStyle='#dde';x.lineWidth=4;x.beginPath();x.moveTo(P.r*.6,0);x.lineTo(P.r+Math.min(46,P.w.rng*.45),0);x.stroke();x.strokeStyle='#864';x.lineWidth=5;x.beginPath();x.moveTo(P.r*.4,-5);x.lineTo(P.r*.4,5);x.stroke()}
else if(s=='r'){x.strokeStyle='#cb8';x.lineWidth=3;x.beginPath();x.arc(P.r*.9,0,P.r*1.3,-1.2,1.2);x.stroke();x.strokeStyle='#eee';x.lineWidth=1;x.beginPath();x.moveTo(P.r*.9+Math.cos(1.2)*P.r*1.3,Math.sin(1.2)*P.r*1.3);x.lineTo(P.r*.9-(P.at>0?7:0)+Math.cos(1.2)*P.r*1.3-P.r*.1,0);x.lineTo(P.r*.9+Math.cos(1.2)*P.r*1.3,-Math.sin(1.2)*P.r*1.3);x.stroke()}
else{x.strokeStyle='#8a6a4a';x.lineWidth=3;x.beginPath();x.moveTo(P.r*.2,P.r*.5);x.lineTo(P.r*1.7,0);x.stroke();x.fillStyle=EC[P.w.el]||'#c8a0ff';x.shadowColor=x.fillStyle;x.shadowBlur=P.at>0?18:8;x.beginPath();x.arc(P.r*1.8,0,4.5+(P.at>0?3:0),0,7);x.fill()}
x.restore();x.fillStyle='#fff';x.beginPath();x.arc(Math.cos(a)*P.r*.45,Math.sin(a)*P.r*.45,2.2,0,7);x.fill();
if(P.g){x.strokeStyle='#8cf';x.lineWidth=4;x.beginPath();x.arc(0,0,P.r+5,a-1,a+1);x.stroke()}if(P.sh>0){x.strokeStyle='#6cf';x.lineWidth=2;x.beginPath();x.arc(0,0,P.r+6,0,7);x.stroke()}x.restore()}
let bsT=0;function bsnd(i,k){const n=Date.now();if(k=='atk'){if(n-bsT<140)return;bsT=n}const f=90+i*32,w=['sawtooth','square','triangle','sine'][i%4];
if(k=='in'){snd(f,.9,w,.08);snd(f*1.5,.6,w,.05)}else if(k=='ph'){snd(f*.5,.7,w,.1);snd(f*2,.4,w,.06)}else if(k=='die')for(let j=0;j<4;j++)snd(f*(1+j*.25),.6+j*.1,'triangle',.06);else snd(f*3,.08,w,.03)}
