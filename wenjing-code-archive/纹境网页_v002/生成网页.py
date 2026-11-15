from pathlib import Path
from base64 import b64encode
root = Path(__file__).resolve().parents[2]
source = Path(__file__).resolve().parent
page = (source/'页面.html').read_text(encoding='utf-8')
page = page.replace('href="#catalog">探索纹样','href="#explore">探索纹样').replace('href="#play">趣味互动','href="#interact">趣味互动').replace('href="#studio">纹样创作','href="#create">纹样创作')
page = page.replace('</nav></div></header>','<a href="#account">个人中心</a></nav></div></header>')
page = page.replace('</div></section>\n<section class="studio"','</div><div class="catalog-more"><a href="#explore">查看纹样图录　↗</a><a href="#interact">试试辨认与配对　↗</a><a href="#create">探索更多创作　↗</a></div></section>\n<section class="studio"')
extra = (source/'补充页面.html').read_text(encoding='utf-8')
page = page.replace('<section id="immersive"',extra+'<section id="immersive"')
css = (source/'页面.css').read_text(encoding='utf-8') + '\n' + (source/'补充样式.css').read_text(encoding='utf-8') + '\n.catalog-more{display:flex;gap:30px;flex-wrap:wrap;margin-top:25px}.catalog-more a{border-bottom:1px solid #a7aa9c;padding:5px 0;font-size:14px}'
page = page.replace('{{CSS}}',css)
page = page.replace('{{JS}}',(source/'交互.js').read_text(encoding='utf-8')+'\n'+(source/'补充交互.js').read_text(encoding='utf-8'))
page = page.replace('{{MOTIF}}',(source/'团花母版.svg').read_text(encoding='utf-8'))
photo = (root/'01_资料/大都会_莲池纹盘_25.35.5.jpg').read_bytes()
page = page.replace('{{DISH}}','data:image/jpeg;base64,'+b64encode(photo).decode('ascii'))
(root/'04_交付成果/纹境_响应式网页_v002.html').write_text(page,encoding='utf-8')

