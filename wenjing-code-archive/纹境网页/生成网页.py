from pathlib import Path
from base64 import b64encode
root = Path(__file__).resolve().parents[2]
source = Path(__file__).resolve().parent
page = (source/'页面.html').read_text(encoding='utf-8')
page = page.replace('{{CSS}}',(source/'页面.css').read_text(encoding='utf-8'))
page = page.replace('{{JS}}',(source/'交互.js').read_text(encoding='utf-8'))
page = page.replace('{{MOTIF}}',(source/'团花母版.svg').read_text(encoding='utf-8'))
photo = (root/'01_资料/大都会_莲池纹盘_25.35.5.jpg').read_bytes()
page = page.replace('{{DISH}}','data:image/jpeg;base64,'+b64encode(photo).decode('ascii'))
(root/'04_交付成果/纹境_响应式网页_v001.html').write_text(page,encoding='utf-8')

