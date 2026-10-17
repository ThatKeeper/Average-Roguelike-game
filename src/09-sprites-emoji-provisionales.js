// ===== SPRITES (emoji provisionales: sustituir aquí por PNG/SVG sin tocar la lógica) =====
const ET_I={grunt:'🧟',runner:'🐺',archer:'👺',mage:'🧙',tank:'🗿',bomber:'💣',summoner:'🔮',guardian:'🛡️',stalker:'🦇',elite:'👹',boss:'🐉'};
const WI={Espada:'⚔️',Dagas:'🗡️','Gran espada':'⚔️',Martillo:'🔨',Lanza:'🔱',Arco:'🏹',Ballesta:'🏹','Arma rúnica':'🔫',Chakram:'💿','Báculo arcano':'🪄','Báculo ígneo':'🪄','Báculo helado':'🪄','Báculo de tormenta':'🪄',Hacha:'🪓','Hachas dobles':'🪓','Báculo venenoso':'🪄'};
const PI={'#f60':'🔥','#ff8a30':'🔥','#9fe8ff':'❄️','#fff27a':'⚡','#c8a0ff':'🔮','#7e4':'🧪','#6e4':'🧪','#fa4':'💥','#8fe':'✨'},AI={m:['🌀','🦘','🛡️'],r:['🏹','💥','🧪'],g:['🔥','❄️','⚡']};
function spr(i,px,py,s,f){x.save();x.font=`${s}px serif`;x.textAlign='center';x.textBaseline='middle';x.shadowColor=f?'#fff':'#0008';x.shadowBlur=f?14:3;x.fillText(i,px,py+1);x.restore()}
