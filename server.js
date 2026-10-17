// Servidor estático sin dependencias: npm start -> http://localhost:8080
const http=require('http'),fs=require('fs'),path=require('path');const T={'.html':'text/html','.js':'text/javascript','.css':'text/css'};
http.createServer((q,r)=>{const f=path.join(__dirname,q.url=='/'?'index.html':q.url.split('?')[0]);fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end('404');return}r.writeHead(200,{'Content-Type':T[path.extname(f)]||'text/plain'});r.end(d)})}).listen(8080,()=>console.log('Infinite Depths en http://localhost:8080'));
