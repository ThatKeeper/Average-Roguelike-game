// Genera infinite-depths.html (un solo archivo) uniendo styles.css y src/*.js
const fs=require('fs');let h=fs.readFileSync(__dirname+'/index.html','utf8');
const js=fs.readdirSync(__dirname+'/src').sort().map(f=>fs.readFileSync(__dirname+'/src/'+f,'utf8')).join('\n');
h=h.replace('<link rel="stylesheet" href="styles.css">','<style>'+fs.readFileSync(__dirname+'/styles.css','utf8')+'</style>').replace(/<!--SCRIPTS-->[\s\S]*<!--\/SCRIPTS-->/,()=>'<script>'+js+'</script>');
fs.writeFileSync(__dirname+'/infinite-depths.html',h);console.log('infinite-depths.html generado');
