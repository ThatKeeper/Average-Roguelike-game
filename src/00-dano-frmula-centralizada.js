// ===== DAÑO (fórmula centralizada) =====
// final = 10*dañoArma*rareza * (1+0.06*(nivel-1)) * (1+0.045*atributoEscalado) * modHabilidad * dmPermanente/reliquias
//         * crítico(×cm) * (1 - resistenciaObjetivo[tipo]) * (escudo?0.5)   | físico 'p', mágico 'm'
// Escalado enemigo por profundidad d: vida=(1+.22(d-1))*(1+.35*floor((d-1)/4)) ; daño=1+.09(d-1)+.12*floor((d-1)/4)
// Más allá de los números: d>=3 oleadas dobles, campeones con modificadores, más tipos de enemigo y patrones de jefe.
const $=i=>document.getElementById(i),cv=$('c'),x=cv.getContext('2d'),W=960,H=600,ov=$('ov');
const rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.random()*a.length|0],cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const ang=(a,b)=>Math.atan2(b.y-a.y,b.x-a.x),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),nrm=v=>Math.atan2(Math.sin(v),Math.cos(v));
const rngS=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
let S={best:0,souls:0,pw:0};try{S=Object.assign(S,JSON.parse(localStorage.getItem('idv1')))}catch(e){}
const save=()=>{try{localStorage.setItem('idv1',JSON.stringify(S))}catch(e){}};
let AC;function snd(f,d,t='sine',v=.04){try{AC=AC||new AudioContext();const o=AC.createOscillator(),g=AC.createGain(),n=AC.currentTime;o.type=t;o.frequency.value=f;g.gain.setValueAtTime(v*(S.vol??1),n);g.gain.exponentialRampToValueAtTime(.001,n+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(n+d)}catch(e){}}
const BI=[['Catacumbas','#26222e','#4a4257','#8a7fa3'],['Criptas malditas','#221828','#432a52','#b05fd0'],['Minas abandonadas','#2b2218','#52402a','#c9964a'],['Bosque subterráneo','#14241a','#2c4a30','#5fd078'],['Ruinas arcanas','#18203a','#2e3f6a','#5f9bd0'],['Cavernas de lava','#2e1410','#5a2a1c','#ff7a3a'],['Abismos helados','#142830','#2f5566','#8fe3ff'],['Dimensión corrupta','#2a0e20','#5a1f45','#ff4fa0']];
const RN=['Común','Rara','Épica','Legendaria'],RMU=[1,1.2,1.5,1.9];
const WP=[
{n:'Espada',s:'m',cd:.38,rng:78,arc:2.1,dmg:1,crit:.08,sc:'str'},{n:'Dagas',s:'m',cd:.2,rng:48,arc:1.7,dmg:.5,crit:.28,sc:'dex'},
{n:'Gran espada',s:'m',cd:.75,rng:100,arc:3.2,dmg:2.3,crit:.06,sc:'str'},{n:'Martillo',s:'m',cd:.95,rng:76,arc:1.8,dmg:2.5,crit:.05,sc:'str',stun:1},
{n:'Lanza',s:'m',cd:.5,rng:135,arc:.55,dmg:1.25,crit:.1,sc:'dex'},
{n:'Arco',s:'r',cd:.34,dmg:.9,crit:.12,sc:'dex',sp:640,pierce:0,spread:.03},{n:'Ballesta',mag:3,s:'r',cd:.85,dmg:2.3,crit:.1,sc:'dex',sp:900,pierce:2,spread:0},
{n:'Arma rúnica',mag:18,s:'r',cd:.14,dmg:.35,crit:.08,sc:'dex',sp:700,spread:.14,fx:'poison'},{n:'Chakram',s:'r',cd:.55,dmg:1.1,crit:.1,sc:'dex',sp:520,pierce:99,bounce:3,spread:0,ret:1},
{n:'Báculo arcano',s:'g',cd:.3,dmg:.8,crit:.1,sc:'int',sp:620,pierce:2,mp:5,el:'arc'},{n:'Báculo ígneo',s:'g',cd:.4,dmg:.9,crit:.08,sc:'int',sp:520,pierce:0,mp:6,el:'fire'},
{n:'Báculo helado',s:'g',cd:.35,dmg:.8,crit:.08,sc:'int',sp:480,pierce:0,mp:6,el:'ice'},{n:'Báculo de tormenta',s:'g',cd:.45,dmg:.8,crit:.1,sc:'int',sp:800,pierce:0,mp:7,el:'light'},{n:'Hacha',s:'m',cd:.5,rng:80,arc:2.6,dmg:1.5,crit:.1,sc:'str'},{n:'Hachas dobles',s:'m',cd:.15,rng:54,arc:1.9,dmg:.42,crit:.12,sc:'dex'},{n:'Báculo venenoso',s:'g',cd:.4,dmg:.8,crit:.08,sc:'int',sp:500,pierce:1,mp:6,el:'poison'},{n:'Daga de la Hemorragia',s:'m',cd:.2,rng:46,arc:1.7,dmg:.55,crit:.25,sc:'dex',bleed:1},{n:'Báculo de marea',s:'g',cd:.38,dmg:.7,crit:.08,sc:'int',sp:520,pierce:1,mp:6,el:'water'}];
const EC={arc:'#c8a0ff',fire:'#ff8a30',ice:'#9fe8ff',light:'#fff27a',poison:'#7e4',water:'#4af'};
const mk=(i,rar=0)=>Object.assign({},WP[i],{rm:RMU[rar],rn:RN[rar]});
const RL=[['Anillo de furia','+12% daño',p=>p.dm*=1.12],['Amuleto de vida','+30 vida máx.',p=>p.bhp+=30],['Botas de viento','+8% velocidad',p=>p.bsp+=.08],['Ojo certero','+8% crítico',p=>p.ccb+=.08],
['Hoja sedienta','roba 3% del daño',p=>p.ls+=.03],['Cristal arcano','+25 maná, +2 regen.',p=>{p.bmp+=25;p.bmr+=2}],['Garra letal','+0.4 mult. crítico',p=>p.cm+=.4],['Coraza rúnica','+10 armadura',p=>p.barm+=10],
['Moneda de la suerte','+5 Suerte',p=>p.a.luk+=5],['Brasas eternas','tus golpes queman',p=>p.bn=1],['Escarcha viva','tus golpes ralentizan',p=>p.fz=1],['Escudo torre','+12 armadura, guardia reforzada',p=>{p.barm+=12;p.gr=1}],['Vial de maná','+3 regen. de maná',p=>p.bmr+=3],['Venas abiertas','+4 acumulaciones máx. de hemorragia',p=>p.bl=(p.bl||0)+4],['Hoja envenenada','tus golpes envenenan',p=>p.pzn=1],['Resonancia carmesí','los críticos detonan 50% de la hemorragia',p=>p.det=1]];
const ET={grunt:{hp:40,sp:70,dm:8,r:13,c:'#b55',ai:'melee'},runner:{hp:25,sp:125,dm:7,r:10,c:'#e94',ai:'flank'},archer:{hp:28,sp:60,dm:7,r:11,c:'#9c6',ai:'range'},
mage:{hp:30,sp:55,dm:12,r:11,c:'#a6f',ai:'cast',res:{p:0,m:.4}},tank:{hp:130,sp:42,dm:16,r:20,c:'#789',ai:'melee',res:{p:.4}},bomber:{hp:22,sp:105,dm:30,r:11,c:'#fb3',ai:'bomb'},
summoner:{hp:45,sp:50,dm:0,r:12,c:'#6cf',ai:'sum'},guardian:{hp:60,sp:60,dm:9,r:14,c:'#4a8',ai:'shield'},stalker:{hp:38,sp:80,dm:14,r:12,c:'#d4a',ai:'leap'},
elite:{hp:220,sp:70,dm:15,r:18,c:'#f44',ai:'elite'},boss:{hp:1000,sp:55,dm:14,r:34,c:'#ff2d6a',ai:'boss',res:{p:.15,m:.15}}};
const BN=['Rey Exhumado','Devoradora de Luz','Coloso de Mena','Madre Raíz','Arconte Roto','Señor del Magma','Reina Escarcha','Voz del Vacío'];
const DIR=[[0,-1],[1,0],[0,1],[-1,0]];
let G={st:'menu'},P,E=[],PR=[],Z=[],FX=[],NM=[],O=[],K={},M={x:480,y:300,d:0,r:0},shake=0,bigmap=0,RM_,msg=['',0];
