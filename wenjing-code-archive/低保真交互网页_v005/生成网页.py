from pathlib import Path
source = Path(__file__).resolve().parent
page = (source/'页面.html').read_text(encoding='utf-8-sig')
def read(name):
    return (source/name).read_text(encoding='utf-8-sig')
page = page.replace('{{CSS}}',read('样式.css')).replace('{{JS}}',read('交互.js')+chr(10)+read('动效.js'))
(source.parents[1]/'04_交付成果'/'纹境_低保真交互网页_v005.html').write_text(page,encoding='utf-8')
