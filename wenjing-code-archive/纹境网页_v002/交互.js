const get = id => document.getElementById(id);
const quiet = matchMedia('(prefers-reduced-motion: reduce)');
const art = get('traveler');
const room = get('immersive');
const roomDock = get('room-dock');
const home = get('home');
const entry = get('bloom');
const header = document.querySelector('.site-head');
const nav = get('navigation');
const menu = document.querySelector('.menu-toggle');
const turn = get('art-turn');
const turnAnimation = turn.animate([{transform:'rotate(0turn)'},{transform:'rotate(1turn)'}],{duration:18000,iterations:Infinity});
turnAnimation.pause();
function toggleMenu(open) {
  nav.classList.toggle('open',open);
  menu.setAttribute('aria-expanded',String(open));
}
menu.addEventListener('click',()=>toggleMenu(!nav.classList.contains('open')));
nav.addEventListener('click',()=>toggleMenu(false));
document.addEventListener('keydown',event=>{if(event.key==='Escape' && nav.classList.contains('open')){toggleMenu(false);menu.focus();}});
function graphic(name) {
  const svg = get(name).content.firstElementChild.cloneNode(true);
  svg.removeAttribute('aria-hidden');
  svg.setAttribute('role','img');
  svg.setAttribute('aria-label',name==='motif'?'八向团花构成习作':'方折回纹构成习作');
  if(name==='motif') svg.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
  return svg;
}
document.querySelector('.close-flower').append(graphic('motif'));
document.querySelector('.fret-field').append(graphic('fret'));

// 花心始终留在原位，三个色层按各自的轴心收拢、旋开。
function bloom() {
  if(quiet.matches) return;
  art.querySelectorAll('.layer').forEach((layer,index)=>{
    layer.getAnimations().forEach(animation=>animation.cancel());
    const rotation=index===1?-1:1;
    layer.animate([
      {transform:'rotate(0deg) scale(1)'},
      {transform:'rotate('+(-38*rotation)+'deg) scale(.55)',offset:.24},
      {transform:'rotate('+(16*rotation)+'deg) scale(1.07)',offset:.74},
      {transform:'rotate(0deg) scale(1)'}
    ],{duration:1200,delay:index*68,easing:'cubic-bezier(.22,.67,.18,1)'});
  });
}
entry.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse') bloom();});
entry.addEventListener('focus',()=>{if(entry.matches(':focus-visible')) bloom();});
let roomOpen=false;
let angle=0;
function stopEffects(){
  turnAnimation.pause();
  turnAnimation.currentTime=0;
  art.classList.remove('breathing','separated');
  angle=0;
  art.querySelector('svg').style.transform='';
  document.querySelectorAll('[data-mode]').forEach(button=>button.setAttribute('aria-pressed','false'));
}
function renderRoute(){
  const open=location.hash==='#play';
  if(open===roomOpen)return;
  const before=art.getBoundingClientRect();
  art.getAnimations().forEach(animation=>animation.cancel());
  roomOpen=open;
  header.hidden=open;home.hidden=open;room.hidden=!open;
  (open?roomDock:get('hero-dock')).append(art);
  window.scrollTo({top:0,behavior:'instant'});
  const after=art.getBoundingClientRect();
  if(!quiet.matches && before.width && after.width){
    const dx=before.left+before.width/2-after.left-after.width/2;
    const dy=before.top+before.height/2-after.top-after.height/2;
    const scale=Math.min(before.width,before.height)/Math.min(after.width,after.height);
    art.animate([{transform:'translate('+dx+'px,'+dy+'px) scale('+scale+')'},{transform:'none'}],{duration:680,easing:'cubic-bezier(.2,.72,.18,1)'});
  }
  if(open){roomDock.focus({preventScroll:true});}
  else{stopEffects();entry.focus({preventScroll:true});}
}
window.addEventListener('hashchange',renderRoute);
renderRoute();
document.querySelector('.room-controls').addEventListener('click',event=>{
  const button=event.target.closest('button');
  if(!button)return;
  const mode=button.dataset.mode;
  if(!mode){bloom();return;}
  const on=button.getAttribute('aria-pressed')!=='true';
  button.setAttribute('aria-pressed',String(on));
  if(mode==='spin'){if(on) turnAnimation.play();else turnAnimation.pause();}
  if(mode==='breathe') art.classList.toggle('breathing',on);
  if(mode==='split') art.classList.toggle('separated',on);
});
quiet.addEventListener('change',()=>{stopEffects();art.getAnimations({subtree:true}).filter(a=>a!==turnAnimation).forEach(a=>a.cancel());});
let drag=null;
function turnArt(delta){
  angle=(angle+delta)%360;
  art.querySelector('svg').style.transform='rotate('+angle+'deg)';
}
roomDock.addEventListener('pointerdown',event=>{
  if(!event.isPrimary||event.button!==0)return;
  drag={x:event.clientX,distance:0};
  roomDock.setPointerCapture(event.pointerId);
});
roomDock.addEventListener('pointermove',event=>{
  if(!drag||!event.isPrimary)return;
  const delta=event.clientX-drag.x;drag.x=event.clientX;drag.distance+=Math.abs(delta);
  turnArt(delta*.55);
});
roomDock.addEventListener('pointerup',()=>{if(drag&&drag.distance<5)bloom();drag=null;});
roomDock.addEventListener('pointercancel',()=>{drag=null;});
roomDock.addEventListener('keydown',event=>{
  if(['Enter',' ','ArrowLeft','ArrowRight'].includes(event.key)){
    event.preventDefault();
    if(event.key.startsWith('Arrow'))turnArt(event.key==='ArrowLeft'?-12:12);else bloom();
  }
});

// 观察点以原图的比例坐标记录，窗口变窄时仍对准同一处。
const entries={
 dish:{type:'馆藏实物　01',title:'莲池纹盘',intro:'清雍正时期的景德镇瓷盘。莲花和水纹由釉下青花勾线，再以釉上彩填色。',spots:[
  ['全形',.5,.5,1,'从蓝色双圈向内看，荷叶、花和水鸟共同构成盘心画面。'],
  ['莲花',.466,.366,3.25,'沿花瓣边缘看青色勾线，再看线内的彩色填绘。'],
  ['鸳鸯',.625,.60,3.35,'右侧鸳鸯位于莲茎旁，短而平的水纹衬出鸟身。']
 ]},
 flower:{type:'原创构成习作　02',title:'八向团花',intro:'让同一个瓣形绕中心每次转过 45°。外轮廓保持对称，内外色层通过错位显出节奏。',spots:[
  ['全形',.5,.5,1,'先沿外圈缓慢数一周，八个单元共同围住花心。'],
  ['花心',.5,.5,2.8,'朱砂色的内瓣环抱花心，内外的小圆把视线收回中心。'],
  ['瓣尖',.49,.19,2.8,'比较相邻两层的尖端位置，观察色层如何错开。']
 ]},
 fret:{type:'原创构成习作　03',title:'方折回纹',intro:'追踪一条折线，观察直角、间隔和重复方向。相邻单元排成连续纹带。',spots:[
  ['全形',.5,.5,1,'把每个单元看作一个方格，再沿同一方向寻找下一个方格。'],
  ['方折',.46,.48,2.6,'转折处的内外间距清晰可见，线条的宽度基本一致。']
 ]}
};
const dialog=get('detail');
const inspect=get('inspect-art');
function openDetail(key){
  const item=entries[key];if(!item)return;
  get('item-type').textContent=item.type;get('item-title').textContent=item.title;get('item-intro').textContent=item.intro;
  inspect.replaceChildren(key==='dish'?document.querySelector('.dish img').cloneNode():graphic(key==='flower'?'motif':'fret'));
  get('inspect-window').style.aspectRatio=key==='dish'?'1200 / 899':key==='flower'?'1':'480 / 280';
  get('credit').replaceChildren();
  if(key==='dish'){
    const source=document.createElement('a');
    source.href='https://www.metmuseum.org/art/collection/search/42303';source.target='_blank';source.rel='noreferrer';
    source.textContent='大都会艺术博物馆 · 藏品 25.35.5 ↗';
    get('credit').append(source,document.createTextNode('　公共领域图像'));
  }else get('credit').textContent='纹境 · 自绘构成习作';
  const spots=get('spots');
  spots.replaceChildren();
  function focusSpot(index){
    const [,x,y,k,note]=item.spots[index];
    inspect.style.transform='translate('+((.5-x)*100*k)+'%,'+((.5-y)*100*k)+'%) scale('+k+')';
    get('spot-note').textContent=note;
    [...spots.children].forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
  }
  item.spots.forEach(([name],i)=>{
    const button=document.createElement('button');button.textContent=name;button.addEventListener('click',()=>focusSpot(i));spots.append(button);
  });
  focusSpot(0);dialog.showModal();
}
document.querySelector('.gallery').addEventListener('click',event=>{
  const tile=event.target.closest('[data-entry]');if(tile)openDetail(tile.dataset.entry);
});
get('close-detail').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{
  if(event.target!==dialog)return;
  const rect=dialog.getBoundingClientRect();
  if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom) dialog.close();
});

// 将器物的纵剖线绕中轴旋转成曲面，按深度绘制四边形。
const profiles=[
 [[-1,.38],[-.93,.48],[-.65,.65],[-.18,.81],[.22,.84],[.53,.72],[.72,.49],[.83,.32],[.94,.31],[.98,.36],[1,.35]],
 [[-1,.32],[-.92,.44],[-.65,.66],[-.36,.78],[.03,.7],[.35,.45],[.55,.21],[.9,.17],[.99,.24],[1,.24]],
 [[-1,.45],[-.84,.52],[-.5,.64],[-.1,.55],[.24,.61],[.55,.76],[.72,.68],[.9,.4],[.96,.41],[1,.43]]
];
const pot=get('pot');
const ctx=pot.getContext('2d');
let yaw=.34,pitch=.16,pending=0;
function radiusAt(y,profile){
  let j=1;
  while(j<profile.length-1&&profile[j][0]<y)j++;
  const [y0,r0]=profile[j-1],[y1,r1]=profile[j];
  return r0+(r1-r0)*(y-y0)/(y1-y0);
}
function renderPot(){
  pending=0;
  const bounds=pot.getBoundingClientRect();
  if(!bounds.width||!bounds.height)return;
  const density=Math.min(devicePixelRatio||1,2);
  const width=Math.round(bounds.width*density),height=Math.round(bounds.height*density);
  if(pot.width!==width||pot.height!==height){pot.width=width;pot.height=height;}
  ctx.fillStyle='#303a32';ctx.fillRect(0,0,width,height);
  const size=Math.min(width*.38,height*.37)*Number(get('scale').value)/100;
  const cx=width*.5,cy=height*.49;
  const count=Number(get('repeat').value),bandCenter=Number(get('height').value)/100;
  get('repeat-value').textContent=String(count);
  const profile=profiles[Number(get('shape').value)];
  function point(y,r,theta){
    const z=r*Math.sin(theta+yaw);
    return [cx+size*r*Math.cos(theta+yaw),cy-size*(y*Math.cos(pitch)-z*Math.sin(pitch)),z*Math.cos(pitch)+y*Math.sin(pitch)];
  }
  ctx.fillStyle='#1f2923';
  ctx.beginPath();ctx.ellipse(cx,cy+size*1.02,size*.64,size*.10,0,0,Math.PI*2);ctx.fill();
  const faces=[],columns=112,rows=56;
  let previous=[];
  for(let j=0;j<=rows;j++){
    const y=j*2/rows-1,r=radiusAt(y,profile);
    const row=Array.from({length:columns+1},(_,i)=>point(y,r,i*2*Math.PI/columns));
    if(j){
      const middle=y-1/rows;
      const slope=(radiusAt(y,profile)-radiusAt(y-2/rows,profile))*rows/2;
      for(let i=0;i<columns;i++){
        const theta=(i+.5)*2*Math.PI/columns;
        const light=(Math.cos(theta+yaw)*(-.48)+Math.sin(theta+yaw)*.74-slope*.46)/Math.sqrt(1+slope*slope);
        const v=(middle-bandCenter)/.245;
        const u=Math.abs(((theta/(Math.PI*2)*count)%1)*2-1);
        let tint=[202,177,134];
        if(Math.abs(v)<1){tint=[72,79,63];if(Math.abs(v)>.84)tint=[181,144,102];else if(Math.abs(v)+u<.91)tint=[186,108,76];if(Math.abs(v)+u<.39)tint=[216,192,144];}
        const shade=.76+light*.25;
        faces.push({vertices:[previous[i],previous[i+1],row[i+1],row[i]],depth:(previous[i][2]+row[i+1][2])/2,color:'rgb('+tint.map(c=>Math.round(c*shade)).join(',')+')'});
      }
    }
    previous=row;
  }
  faces.sort((a,b)=>a.depth-b.depth);
  function paint(vertices,color,edge){
    ctx.beginPath();ctx.moveTo(vertices[0][0],vertices[0][1]);
    for(let i=1;i<vertices.length;i++)ctx.lineTo(vertices[i][0],vertices[i][1]);
    ctx.closePath();ctx.fillStyle=color;ctx.fill();
    if(edge){ctx.lineWidth=.68;ctx.strokeStyle=color;ctx.stroke();}
  }
  for(const face of faces)paint(face.vertices,face.color,true);
  const lip=profile.at(-1)[1];
  paint(previous,'#b5a180',false);
  paint(Array.from({length:80},(_,i)=>point(1,lip*.84,i*2*Math.PI/80)),'#403b32',false);
}
function schedulePot(){if(!pending)pending=requestAnimationFrame(renderPot);}
for(const id of ['shape','repeat','height','scale'])get(id).addEventListener('input',schedulePot);
new ResizeObserver(schedulePot).observe(pot);
let pointer=null;
pot.addEventListener('pointerdown',event=>{if(event.isPrimary&&event.button===0){pointer=[event.clientX,event.clientY];pot.setPointerCapture(event.pointerId);}});
pot.addEventListener('pointermove',event=>{if(!pointer||!event.isPrimary)return;
 yaw+=(event.clientX-pointer[0])*.012;pitch=Math.max(.06,Math.min(.55,pitch+(event.clientY-pointer[1])*.004));
 pointer=[event.clientX,event.clientY];schedulePot();
});
pot.addEventListener('pointerup',()=>pointer=null);pot.addEventListener('pointercancel',()=>pointer=null);
pot.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();yaw+=e.key==='ArrowLeft'?-.15:.15;schedulePot();}});
pot.addEventListener('wheel',e=>{e.preventDefault();get('scale').value=String(Number(get('scale').value)+(e.deltaY>0?-5:5));schedulePot();},{passive:false});
get('reset-pot').addEventListener('click',()=>{yaw=.34;pitch=.16;get('scale').value='100';schedulePot();});
get('photo').addEventListener('click',()=>{
  renderPot();
  const image=document.createElement('canvas');const ratio=Math.min(1,800/Math.max(pot.width,pot.height));
  image.width=Math.round(pot.width*ratio);image.height=Math.round(pot.height*ratio);
  image.getContext('2d').drawImage(pot,0,0,image.width,image.height);
  image.toBlob(blob=>{if(!blob)return;const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='纹境-陶罐取景.png';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),2000);});
});

