// Regenera la lista de archivos de sw.js a partir de lo que hay en disco (npm run pwa).
const fs=require('fs'),path=require('path');const root=path.join(__dirname,'..');let sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const files=['./','index.html','styles.css','manifest.webmanifest',...fs.readdirSync(path.join(root,'icons')).sort().map(f=>'icons/'+f),...fs.readdirSync(path.join(root,'src')).sort().map(f=>'src/'+f)];
sw=sw.replace(/ASSETS=\[.*?\];/s,'ASSETS='+JSON.stringify(files)+';');fs.writeFileSync(path.join(root,'sw.js'),sw);console.log('sw.js actualizado con '+files.length+' archivos');
