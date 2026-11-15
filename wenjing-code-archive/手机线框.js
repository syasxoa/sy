// 手机版本共用桌面稿的控件和导航目标。
const narrowScreens = {};
function mobilePage(key, height, dark=false) {
  const svg = el('svg',{xmlns:ns,viewBox:'0 0 390 '+height,width:390,height,'data-key':key,'data-title':allScreens[key].el.dataset.title},sources);
  el('rect',{width:390,height,fill:dark?colors['暗底']:colors['页面']},svg);
  const frame = wrap(svg,390,height);
  narrowScreens[key] = frame;
  return frame;
}
function mobileHeader(f) {
  text(f,'纹境',18,12,64,22,'正文',true).name='跳转→home｜纹境';
  [['探索纹样','explore'],['趣味互动','interact'],['纹样创作','create']].forEach(([label,key],i)=>{
    text(f,label,110+90*i,19,88,16).name='跳转→'+key+'｜'+label;
  });
  rule(f,18,54,354);
}
{
  const f=mobilePage('home',1218);
  mobileHeader(f);
  text(f,'传统纹样科普与趣味互动',20,78,350,14,'次文');
  text(f,'一纹一世界\n一触见新生',18,108,354,41,'正文',true);
  text(f,'从花心向外看，感受三重花瓣的回旋。',20,218,350,16,'次文');
  const plate=box(f,'纹样主视觉',18,264,354,306,'#eeeee6');
  mountedMotif(plate,177,306*.47,252);
  text(plate,'团花习作 · 八向构成',12,278,325,13,'次文');
  button(f,'让纹样绽开　↗',18,590,202,'gesture',true).el.dataset.bloom='true';
  button(f,'探索纹样',230,590,142,'explore');
  text(f,'轻点进入独立手势体验。',20,650,350,14,'次文');
  rule(f,18,702,354);
  text(f,'从一种纹样开始',18,730,352,26,'正文',true);
  for(const [i,[name,kind]] of [['莲花纹','radial'],['回纹','geometry']].entries()){
    const card=box(f,name,18+i*183,793,171,204,'#eeeee6');
    pattern(card,14,6,143,kind);
    text(card,name,14,156,140,20,'正文',true);
    card.name='跳转→detail｜'+name;
  }
  button(f,'浏览纹样图录　→',18,1023,354,'explore');
  text(f,'把纹样带入创作',18,1100,354,24,'正文',true);
  link(f,'打开自由工作台　→',18,1158,354,'workbench');
}
for(const key of ['gesture','gestureActive']){
  const active=key==='gestureActive', f=mobilePage(key,770,true);
  link(f,'← 首页',18,18,100,'home','页面');
  link(f,'切换纹样',288,18,90,'explore','页面');
  text(f,'手势体验',18,80,340,31,'页面',true);
  text(f,'旋转 ／ 自旋 ／ 呼吸 ／ 颜色分层',18,137,360,15,'#c4c9bc');
  mountedMotif(f,195,342,322,true);
  const feedback=box(f,'摄像头反馈',18,533,354,68,'#323a33');
  text(feedback,active?'摄像头已开启 · 状态示意':'摄像头尚未开启',16,10,322,17,'页面',true);
  text(feedback,active?'将手放入识别范围。':'开启后，可跟随提示互动。',16,40,322,14,'#c4c9bc');
  button(f,active?'关闭摄像头':'开启摄像头',18,625,206,active?'gesture':'camera',true);
  button(f,'操作说明',236,625,136,'gestureHelp');
  link(f,'返回趣味互动　→',18,707,330,'interact','页面');
}
{
  const f=mobilePage('workbench',1098);
  mobileHeader(f);
  text(f,'未命名作品',18,78,190,23,'正文',true);
  button(f,'导出图片',245,70,127,'export',true);
  link(f,'保存草稿',18,136,120,'login');
  link(f,'工具入门',147,136,105,'onboarding','次文');
  const stage=box(f,'画布区域',0,183,390,362,'#e4e7df');
  const sheet=box(stage,'自由画布',17,19,356,324,'#fff');
  mountedMotif(sheet,178,324*.47,244);
  ['画笔','橡皮','文字','撤销'].forEach((label,i)=>button(f,label,18+i*91,563,80));
  rule(f,18,637,354);
  const assetsTab=button(f,'纹样素材',18,660,167);
  const layersTab=button(f,'图层与属性',197,660,175);
  assetsTab.el.dataset.panel='assets';layersTab.el.dataset.panel='layers';
  const assets=box(f,'素材面板',18,726,354,226,'#f0f1ea');
  assets.el.dataset.content='assets';
  ['radial','geometry','cloud'].forEach((kind,i)=>pattern(assets,9+i*116,12,103,kind));
  link(assets,'＋ 从纹样库添加',15,145,200,'explore');
  link(assets,'AI 提取',247,145,100,'aiUpload');
  const layersPanel=box(f,'属性面板',18,726,354,226,'#f0f1ea');
  layersPanel.el.dataset.content='layers';layersPanel.el.setAttribute('visibility','hidden');
  ['纹样图层　·　已选中','文字图层','背景图层'].forEach((label,i)=>text(layersPanel,label,16,12+i*41,322,16));
  rule(layersPanel,16,148,322);
  text(layersPanel,'选中对象　／　大小 · 位置',16,171,322,15,'次文');
  button(f,'应用到陶罐　→',18,980,354,'pottery');
  link(f,'返回创作入口',18,1052,330,'create','次文');
}

