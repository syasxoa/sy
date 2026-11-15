from pathlib import Path

source = Path(__file__).resolve().parent
root = source.parents[1]
page = (source / '页面.html').read_text(encoding='utf-8')
page = page.replace('{{CSS}}', (source / '样式.css').read_text(encoding='utf-8'))
page = page.replace('{{JS}}', (source / '交互.js').read_text(encoding='utf-8'))
(root / '04_交付成果' / '纹境_低保真交互网页_v004.html').write_text(page, encoding='utf-8')
