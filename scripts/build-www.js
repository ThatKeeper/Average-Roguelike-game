// Prepara la carpeta www/ (contenido estático) para empaquetar con Capacitor. No usa dependencias.
const fs=require('fs'),path=require('path');const root=path.join(__dirname,'..'),out=path.join(root,'www');
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
for(const f of['index.html','styles.css','manifest.webmanifest','sw.js'])fs.copyFileSync(path.join(root,f),path.join(out,f));
for(const d of['src','icons']){fs.mkdirSync(path.join(out,d));for(const f of fs.readdirSync(path.join(root,d)))fs.copyFileSync(path.join(root,d,f),path.join(out,d,f))}
console.log('www/ listo ('+fs.readdirSync(path.join(out,'src')).length+' scripts)');
