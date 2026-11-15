from pathlib import Path
source = Path(__file__).resolve().parent
def read(name):
    return (source/name).read_text(encoding='utf-8-sig')
page=read('页面.html').replace('{{THEME_INIT}}',read('主题初始化.js'))
page=page.replace('{{CSS}}',read('样式.css')+'\n'+read('空间.css'))
page=page.replace('{{JS}}','\n'.join(read(name) for name in ['交互.js','首页.js','空间.js','动效.js','主题.js']))
assert '{{CSS}}' not in page and '{{JS}}' not in page and '{{THEME_INIT}}' not in page
(source.parents[1]/'04_交付成果'/'纹境_低保真交互网页_v008.html').write_text(page,encoding='utf-8')
