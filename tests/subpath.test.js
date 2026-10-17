// Sirve el proyecto bajo /nombre-del-repo/ (como GitHub Pages) y comprueba que index.html y todos sus recursos cargan
// con rutas relativas, sin rutas absolutas ni recursos externos, y respetando may\u00fasculas/min\u00fasculas.
const http=require('http'),fs=require('fs'),path=require('path');const root=path.join(__dirname,'..'),BASE='/mi-repo-de-prueba/';let fail=0;
const ok=(n,c)=>{console.log((c?'OK   ':'FAIL ')+n);if(!c)fail++};
const srv=http.createServer((q,r)=>{if(!q.url.startsWith(BASE)){r.writeHead(404);return r.end()}const rel=decodeURIComponent(q.url.slice(BASE.length).split('?')[0])||'index.html';const f=path.join(root,rel);
 // sensible a may\u00fasculas (como el servidor de GitHub): comprueba el nombre real en disco
 const real=fs.existsSync(f)&&fs.readdirSync(path.dirname(f)).includes(path.basename(f));if(!real){r.writeHead(404);return r.end()}r.writeHead(200);r.end(fs.readFileSync(f))});
srv.listen(0,async()=>{const u=`http://127.0.0.1:${srv.address().port}${BASE}`;try{
 const h=await (await fetch(u)).text();ok('index.html carga bajo /mi-repo-de-prueba/',h.includes('<canvas'));
 const refs=[...h.matchAll(/(?:src|href)="([^"]+)"/g)].map(m=>m[1]);ok('hay recursos locales ('+refs.length+')',refs.length>=10);
 ok('sin rutas absolutas ni recursos externos',refs.every(x=>!x.startsWith('/')&&!/^https?:/.test(x)));
 let allok=true;for(const x of refs){const r=await fetch(u+x);if(r.status!=200){allok=false;console.log('   falta '+x)}}ok('todos los scripts y estilos responden 200',allok);
 const bad=await fetch(u+'SRC/10b-jefes.js');ok('las rutas respetan may\u00fasculas (SRC/ no existe)',bad.status==404);
 const js=refs.filter(x=>x.endsWith('.js')).map(x=>fs.readFileSync(path.join(root,x),'utf8')).join('\n');
 ok('el c\u00f3digo no usa fetch/XHR ni servidor',!/fetch\(|XMLHttpRequest|WebSocket|require\(/.test(js));
 ok('el guardado usa localStorage con try/catch',/localStorage/.test(js)&&/try\{S=Object\.assign\(S,JSON\.parse/.test(js));
}catch(e){ok('error: '+e.message,false)}srv.close();process.exit(fail?1:0)});
