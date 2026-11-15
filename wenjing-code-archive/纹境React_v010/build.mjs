import fs from 'node:fs';
const out=new URL('../../04_交付成果/纹境React_v010/',import.meta.url);
let html=fs.readFileSync(new URL('index.html',out),'utf8');
html=html.replace(/<script type="module" crossorigin src="([^"]+)"><\/script>/g,(_,src)=>'<script type="module">'+fs.readFileSync(new URL(src,out),'utf8').replace(/<\/script/gi,'<\\/script')+'</script>');
html=html.replace(/<link rel="stylesheet" crossorigin href="([^"]+)">/g,(_,src)=>'<style>'+fs.readFileSync(new URL(src,out),'utf8')+'</style>');
fs.writeFileSync(new URL('../纹境_React交互网页_v010.html',out),html);
console.log('已生成React构建目录与可直接打开的单文件网页。');
