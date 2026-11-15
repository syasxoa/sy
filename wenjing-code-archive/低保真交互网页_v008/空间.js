// 用同一个展示面完成进场与回程。每次改向先读取屏幕上的实际位置。
let cameraMotion;
const flights=new Map();
function stageFace(node,label){
  if(node.classList.contains('home-stage')){mountHomeStage(node);return;}
  node.replaceChildren();
  const inner=document.createElement('span');
  inner.className='lens-face';
  inner.textContent=label;
  node.append(inner);
  for(let i=0;i<4;i++)node.insertAdjacentHTML('beforeend','<i aria-hidden="true" class="corner c'+i+'"></i>');
}
function cameraTransfer(surface,from,next){
  cameraMotion?.cancel();
  const homeward=next==='home';
  const dest=one(homeward?'.hero-visual':'.immersive .placeholder');
  surface.getAnimations().forEach(a=>a.cancel());
  surface.className=dest.className+' camera-surface';
  stageFace(surface,homeward?'首页主视觉位置':'互动展示区域');
  dest.replaceWith(surface);
  const scene=one('.page');
  scene.classList.add('camera-route');
  const to=surface.getBoundingClientRect();
  if(!to.width||!to.height)return;
  if(quiet.matches||keyboardInput)return;
  const base=getComputedStyle(surface).transform;
  const end=base==='none'?1:new DOMMatrix(base).a;
  const dx=from.left-to.left,dy=from.top-to.top;
  const w=surface.offsetWidth,h=surface.offsetHeight;
  cameraMotion=surface.animate([
    {transformOrigin:'0 0',transform:'translate('+dx+'px,'+dy+'px) scale('+from.width/w+','+from.height/h+')'},
    {transformOrigin:'0 0',transform:'scale('+end+')'}
  ],{duration:500,easing:'cubic-bezier(0.77,0,0.175,1)'});
  for(const sign of [-1,1]){
    const rail=document.createElement('i');
    rail.className='foreground-rail';
    rail.style.left=(sign<0?'3%':'97%');surface.append(rail);
    const near={transform:'translateX(0) scaleY(.65)',opacity:.7},far={transform:'translateX('+sign*95+'px) scaleY(1.45)',opacity:0};
    const sweep=rail.animate(homeward?[far,near]:[near,far],{duration:360,easing:'ease-out'});
    sweep.finished.catch(()=>{}).finally(()=>rail.remove());
  }
  for(const item of many(homeward?'.hero>div:first-child':'.page-head,.immersive>.row')){
    move(item,[{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'none'}],160,180);
  }
}
function flyMaterial(mark){
 const chip=one('[data-object="'+mark.id+'"]'),row=one('[data-layer="'+mark.id+'"]');
 const source=many('[data-unit]').find(b=>b.dataset.unit===mark.name);
 if(!chip||!source||quiet.matches||keyboardInput)return;
 const a=source.getBoundingClientRect(),b=chip.getBoundingClientRect();
 const dx=a.x+a.width/2-b.x-b.width/2,dy=a.y+a.height/2-b.y-b.height/2;
 const ghost=document.createElement('span');ghost.className='flying-label';ghost.textContent=mark.name;
 Object.assign(ghost.style,{left:b.x+'px',top:b.y+'px',width:b.width+'px'});document.body.append(ghost);
 chip.classList.add('landing-target');
 const at=(x,y,k)=>'translate('+x+'px,'+y+'px) scale('+k+')';
 const anim=ghost.animate([{transform:at(dx,dy,.89)},{transform:at(dx*.52,dy*.52-42,1.04),offset:.48},{transform:at(0,0,1)}],{duration:330,easing:'cubic-bezier(0.23,1,0.32,1)',fill:'both'});
 function finish(land){ghost.remove();chip.classList.remove('landing-target');flights.delete(mark.id);
 if(land&&chip.isConnected){move(chip,[{scale:'1.08'},{scale:'1'}],140);}}
 flights.set(mark.id,()=>{anim.cancel();finish(false);});
 anim.finished.then(()=>finish(true),()=>{});
}
function clearFlights(){for(const stop of [...flights.values()])stop();}
function linkPairs(){
 const grid=one('.match-grid');if(!grid)return;
 const ns='http://www.w3.org/2000/svg';
 let svg=one('svg',grid);
 if(!svg){svg=document.createElementNS(ns,'svg');svg.classList.add('wires');svg.setAttribute('aria-hidden','true');grid.append(svg);}
 grid.classList.toggle('awaiting-name',!!state.selectedPicture);
 const bounds=grid.getBoundingClientRect();
 const retiring=[];
 for(const old of [...svg.querySelectorAll('g')]){
  if(state.pairs[old.dataset.id]===old.dataset.name&&!old.dataset.leaving)continue;
  if(!old.dataset.leaving){
   old.dataset.leaving='1';const line=old.firstElementChild,offset=getComputedStyle(line).strokeDashoffset;
   old.querySelector('circle')?.remove();line.getAnimations().forEach(a=>a.cancel());
   old.retire=move(line,[{strokeDashoffset:offset},{strokeDashoffset:'1'}],120).then(()=>old.remove());
  }
  retiring.push(old.retire);
 }
 many('[data-pair]').forEach(b=>{if(!Object.values(state.pairs).includes(b.dataset.pair))b.textContent=b.dataset.pair;});
 for(const button of many('[data-picture]')){
  const id=button.dataset.picture,name=state.pairs[id],caption=one('small',button);
  button.setAttribute('aria-pressed',String(state.selectedPicture===id));
  if(!name){caption.textContent='待配对';continue;}
  const end=many('[data-pair]').find(b=>b.dataset.pair===name);
  let group=[...svg.querySelectorAll('g')].find(g=>g.dataset.id===id&&g.dataset.name===name&&!g.dataset.leaving);
  const fresh=!group;
  if(fresh){group=document.createElementNS(ns,'g');group.dataset.id=id;group.dataset.name=name;
   const line=document.createElementNS(ns,'path');line.setAttribute('pathLength','1');group.append(line);svg.append(group);}
  const a=button.getBoundingClientRect(),b=end.getBoundingClientRect(),x=a.right-bounds.x,y=a.y+a.height/2-bounds.y,dx=b.x-a.right,dy=b.y+b.height/2-(a.y+a.height/2);
  const line=group.firstElementChild;line.setAttribute('d','M '+x+' '+y+' l '+dx+' '+dy);
  if(!fresh)continue;
  caption.textContent='连接中';end.textContent=name;
  line.style.strokeDashoffset='1';
  async function connect(){
   await Promise.all(retiring);
   if(!group.isConnected||group.dataset.leaving)return;
   const head=document.createElementNS(ns,'circle');head.setAttribute('cx',x);head.setAttribute('cy',y);head.setAttribute('r',3.5);group.append(head);
   await Promise.all([move(line,[{strokeDashoffset:'1'},{strokeDashoffset:'0'}],300),move(head,[{transform:'none'},{transform:'translate('+dx+'px,'+dy+'px)'}],300)]);
   head.remove();if(!group.isConnected||group.dataset.leaving)return;
   line.style.strokeDashoffset='0';caption.textContent='第 '+id+' 组 · '+name;end.textContent='第 '+id+' 组 · '+name;
  }connect();
 }
}
function reviewPairs(){for(const b of many('[data-picture]')){
 const id=b.dataset.picture,expected=['莲花纹','回纹','云纹'][Number(id)-1];
 let note=one('.pair-review',b);if(!note){note=document.createElement('span');note.className='pair-review';b.append(note);}
 note.textContent=state.pairs[id]===expected?'✓ 对应正确':'需调整 · '+expected;enter(note);
}}

