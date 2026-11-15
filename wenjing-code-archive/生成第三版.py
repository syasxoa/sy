from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
out=root/'04_交付成果'
base=(root/'01_资料/纹境_既有低保真基准_v002.html').read_text(encoding='utf-8')
def change(old,new):
    global base
    if base.count(old)!=1:
        raise ValueError('版式基准不一致：'+old[:65])
    base=base.replace(old,new)
art=(root/'03_工作文件/临时/团纹.svg').read_text(encoding='utf-8')
setup="""
const masterMotif = new DOMParser().parseFromString(MOTIF_DATA,'image/svg+xml').documentElement;
function mountedMotif(parent,centerX,centerY,size,dark=false){
  const svg=document.importNode(masterMotif,true);
  svg.setAttribute('class','hero-motif');
  svg.setAttribute('x',centerX-size/2); svg.setAttribute('y',centerY-size/2);
  svg.setAttribute('width',size); svg.setAttribute('height',size);
  svg.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
  svg.querySelectorAll('.layer').forEach(part=>{part.style.transformOrigin='center';part.style.transformBox='fill-box';});
  if(dark) svg.querySelectorAll('[stroke="#959786"]').forEach(node=>node.setAttribute('stroke','#adb59e'));
  parent.el.append(svg);
}
""".replace('MOTIF_DATA',json.dumps(art,ensure_ascii=False))
change('// 首页：左侧主张',setup+'\n// 首页：左侧主张')
change("button(f,'开启互动　→',76,568,200,'gesture',true);","button(f,'让纹样绽开　↗',76,568,200,'gesture',true).el.dataset.bloom='true';text(f,'悬停预览，点击进入手势交互区。',76,642,600,15,'次文');")
change("el('circle',{cx:296,cy:280,r:234,fill:'#e4e7dc'},art.el);pattern(art,30,10,540);","mountedMotif(art,296,572*.47,502);")
change("pattern(f,420,120,600,'radial',true);el('circle',{cx:720,cy:420,r:320,fill:'none',stroke:'#697663','stroke-width':1,opacity:.2},f.el);","mountedMotif(f,720,398,620,true);link(f,'回到首页',48,96,190,'home','页面');")
change("const stage=box(f,'画布区域',318,182,852,752,'#e4e7df');","const stage=box(f,'画布区域',294,182,876,752,'#e4e7df');")
change("const assets=box(f,'纹样素材',76,182,242,752,","const assets=box(f,'纹样素材',76,182,218,752,")
change("16+i%2*110,288+Math.floor(i/2)*156,100,136","12+i%2*102,288+Math.floor(i/2)*156,92,136")
change("field(assets,'','搜索纹样',16,84,210)","field(assets,'','搜索纹样',16,84,186)")
change("rule(assets,16,254,210)","rule(assets,16,254,186)")
change("const paper=box(stage,'画布',44,72,764,578,'#fff');pattern(paper,179,72,410);text(paper,'自由拼合 · 排列 · 绘制',236,522,500,15,'次文');","const paper=box(stage,'画布',28,64,820,600,'#fff');mountedMotif(paper,410,600*.47,450);text(paper,'自由拼合 · 排列 · 绘制',320,549,450,15,'次文');")
mobile=(root/'02_源文件/手机线框.js').read_text(encoding='utf-8')
behavior=(root/'02_源文件/入口交互.js').read_text(encoding='utf-8')
change("const menu=document.querySelector('#menu')",mobile+"\nconst menu=document.querySelector('#menu')")
change('function copySvg(key){const svg=allScreens[key].el.cloneNode(true);',behavior+'\nfunction copySvg(key){const svg=selectedScreen(key).el.cloneNode(true);')
change('serializeToString(allScreens[key].el)','serializeToString(selectedScreen(key).el)')
change('第二版已重新设计内容层级、留白与画布比例。少量朱砂色仅标记核心操作；图形均为构成示意。Figma 版仍待同步。','第三版重点调整首页、手势体验和自由工作台。缩窄窗口可看这三个页面的窄屏线框。')
change('电脑端布局 · 第 2 版 · 层级重排<br>2026年11月1日','第三版 · 桌面与窄屏线框<br>2026年11月2日')
change('纹境｜低保真原型 V2','纹境｜低保真原型 V3')
change('</style>','''
@media(max-width:760px){
  aside{display:none}main{margin:0;padding:64px 0 20px}body>header{left:0;padding:8px;min-height:52px;gap:5px}header strong{font-size:12px;min-width:0;max-width:25%;text-overflow:ellipsis;overflow:hidden;white-space:nowrap}header button{font-size:12px;padding:7px 5px}.gallery{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.preview{min-width:0}#overview{padding:10px}.gallery p{font-size:12px}
}
[data-panel][aria-pressed="true"]>rect{stroke:#9b4338;stroke-width:2}
</style>''')
(out/'纹境_低保真原型_v003.html').write_text(base,encoding='utf-8')
# 新版动效样稿直接进入本次优化的手势页。
sample=out/'纹境_UI案例参考板与响应式动效样稿_v003.html'
sample.write_text(sample.read_text(encoding='utf-8').replace('../01_资料/纹境_既有低保真基准_v002.html#gesture','纹境_低保真原型_v003.html#gesture'),encoding='utf-8')

