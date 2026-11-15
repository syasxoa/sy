const one=(selector,root=main)=>root.querySelector(selector);
const many=(selector,root=main)=>Array.from(root.querySelectorAll(selector));
const quiet=matchMedia('(prefers-reduced-motion: reduce)');
function move(node,frames,duration=200,delay=0){
  if(!node||quiet.matches)return Promise.resolve();
  return node.animate(frames,{duration,delay,easing:'cubic-bezier(.2,.7,.25,1)',fill:'backwards'}).finished.catch(()=>{});
}
function enter(node,delay=0){return move(node,[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],300,delay);}
function flip(node,from,duration=350){
  if(!node||!from||!from.width)return;
  const to=node.getBoundingClientRect();
  if(to.width&&to.height)move(node,[{transformOrigin:'0 0',transform:'translate('+(from.x-to.x)+'px,'+(from.y-to.y)+'px) scale('+from.width/to.width+','+from.height/to.height+')'},{transformOrigin:'0 0',transform:'none'}],duration);
}
function choose(button,selector){
  const old=one(selector+'.active'),from=old?.getBoundingClientRect();
  many(selector).forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});
  if(old&&old!==button&&from&&!quiet.matches){
    const marker=document.createElement('i'),to=button.getBoundingClientRect();
    marker.className='moving-ring';Object.assign(marker.style,{left:to.left+'px',top:to.top+'px',width:to.width+'px',height:to.height+'px'});
    document.body.append(marker);flip(marker,from,160);setTimeout(()=>marker.remove(),180);
  }
}
Object.assign(state,{era:0,region:0,file:'',source:'',highlight:false,zoom:100,ranges:{},favorites:new Set(),logged:false,drafts:{},exportChoice:'透明提取图',draftName:'',task:'',markId:0});
let catalogReturn=null,sourcePicker='',dialogKey='',opener=null,modalSerial=0,tourStep=0,wireObserver,processing=0;
const exportKeys=['export','exportAI','exportPhoto'];
function fragment(html){const template=document.createElement('template');template.innerHTML=html;return template.content;}
function renderCatalog(){
 const list=byId('catalog-list');if(!list)return;
 const old=new Map(many('[data-name]',list).map(b=>[b.dataset.name,[b,b.getBoundingClientRect()]]));
 const found=patternNames.filter((name,i)=>name.includes(state.query)&&(state.filter==='全部'||category[i+1]===state.filter)&&(!state.era||state.era===1+i%2)&&(!state.region||state.region===1+Math.floor(i/2)%2));
 list.replaceChildren(...found.map(name=>old.get(name)?.[0]||fragment(card(name)).firstElementChild));
 many('[data-name]',list).forEach((b,i)=>old.has(b.dataset.name)?flip(b,old.get(b.dataset.name)[1],220):enter(b,Math.min(i,4)*35));
 byId('result-count').textContent='共 '+found.length+' 项示例';byId('no-results').hidden=!!found.length;
}
function wires(){
 const grid=one('.match-grid');if(!grid)return;
 let svg=one('svg',grid);
 if(!svg){svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','wires');svg.setAttribute('aria-hidden','true');grid.append(svg);}
 const rect=grid.getBoundingClientRect();
 for(const path of [...svg.children])if(state.pairs[path.dataset.id]!==path.dataset.name&&!path.dataset.leaving){
   path.dataset.leaving='1';move(path,[{strokeDashoffset:0},{strokeDashoffset:1}],140).then(()=>path.remove());
 }
 many('[data-picture]').forEach((b,i)=>{
   const id=b.dataset.picture,name=state.pairs[id];b.setAttribute('aria-pressed',String(id===state.selectedPicture));
   one('small',b).textContent=name?'第 '+id+' 组 · '+name:'待配对';
   if(!name)return;
   const end=many('[data-pair]').find(n=>n.dataset.pair===name),a=b.getBoundingClientRect(),z=end.getBoundingClientRect();
   let path=[...svg.children].find(p=>!p.dataset.leaving&&p.dataset.id===id&&p.dataset.name===name);
   const fresh=!path;if(fresh){path=document.createElementNS(svg.namespaceURI,'path');path.dataset.id=id;path.dataset.name=name;path.setAttribute('pathLength','1');svg.append(path);}
   path.setAttribute('d','M '+(a.right-rect.left)+' '+(a.y+a.height/2-rect.y)+' L '+(z.left-rect.left)+' '+(z.y+z.height/2-rect.y));
   if(fresh)move(path,[{strokeDashoffset:1},{strokeDashoffset:0}],300);
 });
 many('[data-pair]').forEach(b=>{const id=Object.keys(state.pairs).find(k=>state.pairs[k]===b.dataset.pair);b.textContent=(id?'第 '+id+' 组 · ':'')+b.dataset.pair;});
}
function syncCanvas(){
 const paper=one('.canvas-paper');if(!paper)return;
 let surface=one('.surface',paper);if(!surface){surface=document.createElement('span');surface.className='surface';paper.append(surface);}
 surface.style.transform='scale('+state.zoom/100+')';byId('zoom-label').textContent=state.zoom+'%';
 const layers=one('.layers');
 for(const mark of state.marks){
   let chip=one('[data-object="'+mark.id+'"]',surface);
   if(!chip){chip=document.createElement('span');chip.className='canvas-mark';chip.dataset.object=mark.id;chip.textContent=mark.name;surface.append(chip);move(chip,[{scale:'.85',opacity:0},{scale:'1',opacity:1}]);}
   Object.assign(chip.style,{left:mark.x+'%',top:mark.y+'%',scale:String(mark.size||1)});chip.classList.toggle('picked',state.layer===mark.id);
   if(!one('[data-layer="'+mark.id+'"]',layers)){const b=document.createElement('button');b.dataset.layer=mark.id;b.className='option';b.textContent=mark.name+' · '+mark.id.slice(1);layers.append(b);enter(b);}
 }
 many('[data-layer]').forEach(b=>b.classList.toggle('active',b.dataset.layer===state.layer));
 const selected=state.marks.find(m=>m.id===state.layer);
 one('.layers').parentElement.querySelector('p').textContent=selected?selected.name:state.layer;
 if(selected){one('[data-range=size]').value=((selected.size||1)-.5)*100;one('[data-range=position]').value=selected.x;}
}
function potUpdate(){
 const stage=one('.stage-inner')||one('.two>.placeholder');if(!stage)return;
 let band=one('.band',stage);if(!band){band=document.createElement('span');band.className='band';stage.append(band);}
 const val=k=>Number(state.ranges[k]??50);
 band.textContent=(state.source||'纹带占位')+' · '+(1+Math.round(val('pot-repeat')/10))+' 次';
 Object.assign(band.style,{width:(30+val('pot-size')*.55)+'%',top:(43+val('pot-position')*.38)+'%',transform:current==='photo'?'translateX('+(val('photo-position')-50)*.5+'%) rotate('+(val('angle')-50)*.5+'deg) scale('+(.6+val('zoom')*.008)+')':'none'});
}
function sliders(){many('[data-range]').forEach(input=>{
 let out=input.parentElement.querySelector('output');if(!out){out=document.createElement('output');input.before(out);}
 out.textContent=input.value+'%';
});}
function answerState(){const b=one('[data-modal=answer]');b.disabled=!state.answer;many('[data-answer]').forEach(a=>a.classList.toggle('active',a.dataset.answer===state.answer));}
function aiPreview(){const p=one('.two>.placeholder');p.textContent=state.file||'演示参考图';const desc=one('#complete').parentElement.nextElementSibling;desc.hidden=!state.complete;if(!desc.hidden)enter(desc);}
function resultState(){const result=one('.split-actions>div:last-child .placeholder');result.textContent=state.scene+'位置';result.classList.toggle('outlined',state.highlight);if(state.highlight)result.append(' · 补齐范围示意');enter(result);
 many('[data-scene]').forEach(b=>b.classList.toggle('active',b.dataset.scene===state.scene||(b.dataset.scene==='显示补齐区域'&&state.highlight)));}
function initView(){
 if(current==='home'){const hero=one('.hero-visual');for(let i=0;i<4;i++)hero.insertAdjacentHTML('beforeend','<i class="corner c'+i+'"></i>');}
 if(current==='explore'){byId('era').selectedIndex=state.era;byId('region').selectedIndex=state.region;renderCatalog();}
 if(current==='detail'){const b=one('[data-modal=login]');b.textContent=state.favorites.has(state.name)?'✓ 已收藏':'＋ 收藏纹样';one('.page-head').insertAdjacentHTML('afterbegin','<a href="#explore" class="link">← 返回图录</a><br>');if(sourcePicker)b.after(fragment(action('选用此纹样','data-action="use-source"',true)));}
 if(current==='match'){wires();wireObserver=new ResizeObserver(wires);wireObserver.observe(one('.match-grid'));}
 if(current==='recognize')answerState();
 if(current==='aiUpload')aiPreview();if(current==='aiResult')resultState();
 if(current==='workbench'){syncCanvas();if(state.source){const b=document.createElement('button');b.dataset.unit=state.source;b.textContent=state.source;one('.asset-grid').prepend(b);}}
 if(current==='pottery'||current==='photo'){many('[data-range]').forEach(i=>i.value=state.ranges[i.dataset.range]??50);potUpdate();}sliders();
 if(['workbench','pottery'].includes(current)&&state.draftName)one('.work-head h1').textContent=state.draftName;
 if(current==='account'){for(const n of state.favorites)if(!many('[data-name]').some(b=>b.dataset.name===n))one('.cards').prepend(fragment(card(n,'本次收藏')));}
 if(current==='drafts')many('.side-list .panel h3').forEach((h,i)=>{if(state.drafts[i?'pottery':'workbench'])h.textContent=state.drafts[i?'pottery':'workbench'].title;});
}
function navigate(){
 const previous=current,next=location.hash.slice(1),group=['account','works','drafts'];
 const oldNav=one('#main-nav .active',document)?.getBoundingClientRect();
 const shared=previous==='home'&&next==='gesture'?one('.hero-visual'):previous==='create'&&next==='workbench'?one('.create-grid .placeholder'):null;
 const bounds=shared?.getBoundingClientRect();wireObserver?.disconnect();clearTimeout(processing);
 if(group.includes(previous)&&group.includes(next)&&one('.account-layout')){
   const fresh=fragment(views[next]());one('.account-layout>div').replaceWith(fresh.querySelector('.account-layout>div'));
   many('.account-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+next));current=next;one('.page').dataset.view=next;document.title=pages[next]+'｜纹境';enter(one('.account-layout>div'));dismiss();
 }else{renderPage();}
 initView();const nav=one('#main-nav a.active',document);
 if(nav){const line=byId('nav-line'),r=nav.getBoundingClientRect();line.hidden=false;Object.assign(line.style,{left:nav.offsetLeft+'px',width:r.width+'px'});if(oldNav)flip(line,{x:oldNav.x,y:r.bottom-2,width:oldNav.width,height:2},220);}else byId('nav-line').hidden=true;
 if(shared){const dest=one(next==='gesture'?'.immersive .placeholder':'.canvas-paper');if(dest){shared.className=dest.className;shared.replaceChildren(...dest.childNodes);if(dest.tagName==='BUTTON'){dest.prepend(shared);shared.className='travel-sheet';flip(shared,bounds,460);setTimeout(()=>{if(shared.isConnected)shared.replaceWith(...shared.childNodes);},470);}else{dest.replaceWith(shared);flip(shared,bounds,480);}}}
 if(previous==='detail'&&current==='explore'&&catalogReturn){window.scrollTo({top:catalogReturn.y,behavior:'instant'});many('[data-name]').find(b=>b.dataset.name===catalogReturn.name)?.focus({preventScroll:true});}
}

function closeIndex(){
 const panel=byId('index');if(!panel.hidden){retirePanel(panel,[{transform:'none'},{transform:'translateX(100%)'}],()=>panel.hidden=true);byId('index-toggle').textContent='查看页面索引';byId('index-toggle').setAttribute('aria-expanded','false');}
}
function dismiss(){
 if(!dialog.open)return;
 const serial=++modalSerial;
 move(dialog,[{opacity:1,transform:'none'},{opacity:0,transform:'translateY('+ (innerWidth<681?'65%':'12px') +')'}],150).then(()=>{if(serial!==modalSerial)return;dialog.close();opener?.focus({preventScroll:true});document.querySelector('.guided')?.classList.remove('guided');});
}
function openModal(key,trigger){
 if(!modals[key])return;
 modalSerial++;dialogKey=key;
 if(!dialog.open)opener=trigger||document.activeElement;
 if(exportKeys.includes(key))lastExport=key;
 const wasOpen=dialog.open;
 byId('dialog-title').textContent=modals[key];
 dialogBody.innerHTML=modalViews[key]();
 const put=(message)=>{const p=document.createElement('p');p.textContent=message;dialogBody.prepend(p);};
 if(key==='answer')put('你的选择　'+(state.answer||'尚未选择')+'　／　示例答案　莲花纹');
 if(key==='matchAnswer')for(let i=3;i>=1;i--){const correct=['莲花纹','回纹','云纹'][i-1];put('第 '+i+' 组　'+(state.pairs[i]||'未配对')+'　'+(state.pairs[i]===correct?'对应正确':'需调整'));enter(dialogBody.firstElementChild,(i-1)*65);}
 if(key==='exportAI')many('[data-export-choice]',dialog).forEach(b=>b.classList.toggle('active',b.dataset.exportChoice===state.exportChoice));
 if(key==='exportHD'||key==='vip'||exportKeys.includes(key)){
  put('导出对象　'+({export:state.draftName||'当前平面作品',exportAI:(state.file||'演示参考图')+' · '+state.exportChoice,exportPhoto:state.pot+' · 当前取景'}[lastExport]));
  if(state.vip&&exportKeys.includes(key)){const b=one('[data-modal=vip]',dialog);b.dataset.modal='exportHD';b.textContent='高清导出 · 已解锁';}
 }
 if(key==='onboarding'){
  const targets=['.toolrow','.asset-grid','.layers','.work-head'];
  const labels=['选择绘制工具','选择素材，再点击画布放置','选择图层，调整对象','保存草稿或导出图片'];
  document.querySelector('.guided')?.classList.remove('guided');one(targets[tourStep])?.classList.add('guided');
  dialogBody.innerHTML='<p>第 '+(tourStep+1)+' / 4 步　'+labels[tourStep]+'</p>'+action(tourStep<3?'下一步':'结束入门','data-action="tour-next"',true);
 }
 if(!wasOpen)dialog.showModal();else move(dialogBody,[{opacity:0,transform:'translateX(16px)'},{opacity:1,transform:'none'}]);
 one('input,button',dialogBody)?.focus();
}
function validFields(){
 many('.field-error',dialog).forEach(e=>e.remove());
 const inputs=many('input',dialogBody);const bad=inputs.find(i=>!i.value.trim())||(dialogKey==='register'&&inputs[1].value!==inputs[2].value?inputs[2]:null);
 if(!bad)return true;const msg=document.createElement('span');msg.className='field-error';msg.textContent=bad.value?'两次密码需要一致':'请填写此项';bad.after(msg);enter(msg);bad.focus();return false;
}
function finishTask(){
 if(state.task==='收藏'){state.favorites.add(state.name);one('main [data-modal=login]',document).textContent='✓ 已收藏';toast('已收藏 '+state.name);}
 if(state.task==='草稿'){const title=state.draftName||(current==='workbench'?'自由创作草稿':'陶罐装饰草稿');state.drafts[current]={title,marks:structuredClone(state.marks),pot:state.pot,ranges:{...state.ranges},source:state.source};toast('已保存本次草稿');}
 if(state.task==='找草稿')route('drafts');if(state.task==='个人中心')route('account');state.task='';
}
function processDemo(button){
 if(button.disabled)return;button.disabled=true;button.textContent='模拟处理中…';
 processing=setTimeout(()=>{if(current==='aiUpload'){dismiss();route('aiResult');}},quiet.matches?40:650);
}
function switchMenu(on){const nav=byId('main-nav');if(on){nav.dataset.motion=String(Number(nav.dataset.motion||0)+1);nav.classList.add('open');}else if(nav.classList.contains('open')){retirePanel(nav,[{opacity:1,transform:'none'},{opacity:0,transform:'translateY(-8px)'}],()=>nav.classList.remove('open'));}byId('menu-toggle').setAttribute('aria-expanded',String(on));byId('menu-toggle').textContent=on?'收起菜单 ×':'菜单 ☰';}
byId('index-toggle').onclick=()=>{const panel=byId('index');if(byId('index-toggle').getAttribute('aria-expanded')==='true')return closeIndex();panel.dataset.motion=String(Number(panel.dataset.motion||0)+1);panel.hidden=false;byId('index-toggle').setAttribute('aria-expanded','true');byId('index-toggle').textContent='收起索引';move(panel,[{transform:'translateX(100%)'},{transform:'none'}],250);byId('index-close').focus();};
byId('index-close').onclick=()=>{closeIndex();byId('index-toggle').focus();};
byId('menu-toggle').onclick=()=>switchMenu(!byId('main-nav').classList.contains('open'));
byId('dialog-close').onclick=dismiss;
dialog.oncancel=e=>{e.preventDefault();dismiss();};
dialog.onclick=e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dismiss();}};
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeIndex();switchMenu(false);}if(e.key==='Enter'&&e.target.id==='search'){state.query=e.target.value.trim();renderCatalog();}});
document.addEventListener('change',e=>{
 if(e.target.id==='complete'){state.complete=e.target.checked;aiPreview();}
 if(e.target.id==='upload'&&e.target.files.length){state.file=e.target.files[0].name;aiPreview();}
 if(['era','region'].includes(e.target.id)){state[e.target.id]=e.target.selectedIndex;renderCatalog();}
});
document.addEventListener('input',e=>{
 const input=e.target,key=input.dataset.range;
 if(!key){if(current==='workbench'&&input.type==='search')many('[data-unit]').forEach(b=>b.hidden=!b.textContent.replaceAll(' ','').includes(input.value.trim()));return;}
 state.ranges[key]=input.value;sliders();
 if(current==='workbench'){const obj=state.marks.find(m=>m.id===state.layer);if(obj){if(key==='size')obj.size=.5+input.value/100;else obj.x=Number(input.value);syncCanvas();}}else potUpdate();
});
document.addEventListener('click',async e=>{
 const b=e.target.closest('button,a');if(!b)return;
 const d=b.dataset,href=b.getAttribute('href')||'';
 if(d.indexPage){closeIndex();return;}
 if(href.startsWith('#')){
  if(byId('main-nav').contains(b))switchMenu(false);
  if(href==='#explore')sourcePicker=['aiUpload','gesture','gestureActive','workbench','pottery'].includes(current)?current:'';
  if(current==='aiResult'&&['#workbench','#pottery'].includes(href))state.source=(state.file||'演示参考图')+' · '+state.scene;
  if(current==='drafts'&&['#workbench','#pottery'].includes(href)){const save=state.drafts[href.slice(1)];state.draftName=one('h3',b.closest('.panel')).textContent;if(save)Object.assign(state,{marks:structuredClone(save.marks),pot:save.pot,ranges:{...save.ranges},source:save.source});}
  if(current==='create'&&href==='#workbench'){state.draftName='';state.marks=[];state.source='';state.layer='纹样图层';state.unit='';}
  return;
 }
 if(d.modal){
  if(d.modal==='login'&&!dialog.contains(b)){state.task=b.closest('header')?'个人中心':current==='detail'?'收藏':current==='create'?'找草稿':'草稿';if(state.logged){finishTask();return;}}
  if(dialogKey==='recover'&&dialog.contains(b)&&d.modal==='login'&&!validFields())return;
  if(d.modal==='exportHD')state.vip=true;
  if(d.modal==='onboarding')tourStep=0;
  if(d.modal==='exportPhoto')await move(one('.two>.placeholder'),[{outline:'1px solid #555'},{outline:'5px solid #222'}],130);
  closeIndex();openModal(d.modal,b);return;
 }
 if(d.goto){if(dialogKey==='aiError'&&d.goto==='aiResult'){dismiss();if(current==='aiUpload'){processDemo(one('[data-action=process]'));return;}}dismiss();route(d.goto);return;}
 if(d.name||d.detail){if(current==='explore')catalogReturn={name:d.name,y:scrollY};state.name=d.name||d.detail;state.tab='图形观察';dismiss();route('detail');return;}
 if(d.filter){state.filter=d.filter;choose(b,'[data-filter]');renderCatalog();return;}
 if(d.detailTab){state.tab=d.detailTab;choose(b,'[data-detail-tab]');const panel=one('.tabs-content');fadeReplace(panel,()=>panel.innerHTML=fragment(views.detail()).querySelector('.tabs-content').innerHTML);return;}
 if(d.answer){state.answer=d.answer;choose(b,'[data-answer]');answerState();return;}
 if(d.picture){state.selectedPicture=d.picture;choose(b,'[data-picture]');byId('pair-status').textContent='已选择第 '+d.picture+' 组，请选名称';return;}
 if(d.pair){const id=state.selectedPicture;if(!id)return toast('请先选择图形');for(const key of Object.keys(state.pairs))if(state.pairs[key]===d.pair)delete state.pairs[key];state.pairs[id]=d.pair;state.selectedPicture='';many('[data-picture]').forEach(n=>n.classList.remove('active'));wires();byId('pair-status').textContent='第 '+id+' 组已连接';return;}
 if(d.scene){if(d.scene==='显示补齐区域')state.highlight=!state.highlight;else state.scene=d.scene;resultState();return;}
 if(d.tool==='撤销'){
  const mark=state.marks.pop();if(!mark)return toast('没有可撤销的放置');
  const chip=one('[data-object="'+mark.id+'"]'),row=one('[data-layer="'+mark.id+'"]');if(state.layer===mark.id)state.layer='纹样图层';
  await Promise.all([chip,row].map(n=>move(n,[{opacity:1,scale:'1'},{opacity:0,scale:'.85'}],150)));chip?.remove();row?.remove();if(current==='workbench')syncCanvas();return;
 }
 if(d.tool){state.tool=d.tool;state.unit='';choose(b,'[data-tool]');many('[data-unit]').forEach(n=>n.classList.remove('active'));one('.work-stage>.row>.hint').textContent='当前工具：'+d.tool;one('.canvas-paper .hint').textContent='当前工具：'+d.tool;return;}
 if(d.unit){state.unit=d.unit;state.tool='纹样';many('[data-tool]').forEach(n=>n.classList.remove('active'));one('.work-stage>.row>.hint').textContent='当前工具：纹样';choose(b,'[data-unit]');one('.canvas-paper .hint').textContent='待放置　'+d.unit;return;}
 if(d.layer||e.target.dataset.object){state.layer=d.layer||e.target.dataset.object;syncCanvas();return;}
 if(d.pot){state.pot=d.pot;choose(b,'[data-pot]');one('.stage-inner p').textContent='当前器形：'+d.pot;enter(one('.stage-inner strong'));return;}
 if(d.exportChoice){state.exportChoice=d.exportChoice;openModal('exportAI');return;}
 switch(d.action){
 case 'search':state.query=byId('search').value.trim();renderCatalog();break;
 case 'clear-filter':state.filter='全部';state.query='';state.era=state.region=0;byId('search').value='';byId('era').selectedIndex=byId('region').selectedIndex=0;choose(one('[data-filter]'),'[data-filter]');renderCatalog();break;
 case 'next-question':state.answer='';answerState();break;
 case 'reset-match':state.pairs={};state.selectedPicture='';many('[data-picture]').forEach(n=>n.classList.remove('active'));wires();byId('pair-status').textContent='选择一张图形开始配对。';break;
 case 'process':processDemo(b);break;
 case 'use-source':if(sourcePicker==='aiUpload')state.file=state.name;else state.source=state.name;route(sourcePicker||'create');sourcePicker='';break;
 case 'canvas':{
  if(!state.unit)return toast('当前工具：'+state.tool);
  const rect=one('.surface').getBoundingClientRect(),percent=(xy,start,len)=>Math.min(100,Math.max(0,(xy-start)*100/len));
  const mark={id:'m'+(++state.markId),name:state.unit,x:e.detail?percent(e.clientX,rect.x,rect.width):50,y:e.detail?percent(e.clientY,rect.y,rect.height):50};state.marks.push(mark);state.layer=mark.id;syncCanvas();sliders();break;
 }
 case 'zoom-in':case 'zoom-out':state.zoom=Math.min(180,Math.max(40,state.zoom+(d.action==='zoom-in'?20:-20)));syncCanvas();break;
 case 'reset-pot':case 'reset-photo':many('[data-range]').forEach(i=>{state.ranges[i.dataset.range]=50;i.value=50;});sliders();potUpdate();break;
 case 'close':dismiss();break;
 case 'sms-code':if(!one('input',dialogBody).value.trim()){validFields();break;}b.textContent='验证码已模拟发送';break;
 case 'demo-login':if(validFields()){state.logged=true;document.querySelector('.account-entry').textContent='我的空间';dismiss();finishTask();}break;
 case 'simulate-save':if(validFields()){dismiss();toast('已模拟绑定');}break;
 case 'simulate-export':b.disabled=true;b.textContent='✓ 已模拟保存';{const serial=modalSerial;setTimeout(()=>{if(serial===modalSerial)dismiss();},450);}break;
 case 'previous-export':openModal(lastExport);break;
 case 'tour-next':if(++tourStep<4)openModal('onboarding');else dismiss();break;
 }
});
byId('main-nav').insertAdjacentHTML('beforeend','<i id="nav-line" hidden></i>');
window.addEventListener('hashchange',navigate);
navigate();

function safeText(s){const node=document.createElement('span');node.textContent=s;return node.innerHTML;}

function fadeReplace(panel,update){
 const version=String(Number(panel.dataset.change||0)+1);
 panel.dataset.change=version;
 panel.getAnimations().forEach(animation=>animation.cancel());
 move(panel,[{opacity:1},{opacity:.25}],65).then(()=>{
  if(panel.dataset.change!==version||!panel.isConnected)return;
  update();move(panel,[{opacity:.25,transform:'translateX(4px)'},{opacity:1,transform:'none'}],130);
 });
}
function retirePanel(panel,frames,finish){
 const currentToken=String(Number(panel.dataset.motion||0)+1);
 panel.dataset.motion=currentToken;
 if(quiet.matches){finish();return;}
 move(panel,frames,140).then(()=>{if(panel.dataset.motion===currentToken)finish();});
}


