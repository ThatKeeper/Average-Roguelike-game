// ===== ENTRADA =====
const KD={up:'KeyW',down:'KeyS',left:'KeyA',right:'KeyD',q:'KeyQ',e:'KeyE',r:'KeyR',dodge:'Space',inv:'KeyI',map:'KeyM',use:'KeyF',spell:'KeyC',book:'KeyB',tal:'KeyT'},KY=Object.assign({},KD,S.keys);
onkeydown=e=>{if(G.rb){e.preventDefault();if(e.code!='Escape'){KY[G.rb]=e.code;S.keys=KY;save()}G.rb=0;ctrls();return}K[e.code]=1;if(G.st!='play')return;if(e.code=='Escape')pause();if(e.code==KY.map)bigmap^=1;if(e.code==KY.inv)inv();if(e.code==KY.use)interact();if(e.code==KY.book)book();if(e.code==KY.tal)tal();if(e.code==KY.dodge){e.preventDefault();if(!G.ov)dodge()}};onkeyup=e=>K[e.code]=0;
cv.onmousemove=e=>{const b=cv.getBoundingClientRect();M.x=(e.clientX-b.left)*W/b.width;M.y=(e.clientY-b.top)*H/b.height};
cv.onmousedown=e=>{e.button?M.r=1:M.d=1};onmouseup=e=>{e.button?M.r=0:M.d=0};cv.oncontextmenu=e=>e.preventDefault();
