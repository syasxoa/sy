// 同一批线框单元仅改变位置和透明度，连续切换可从当前状态反向。
function mountHomeStage(node){
 if(!node.querySelector('.home-unit')){
  node.innerHTML='<span class="structure-note">结构示意</span><div class="home-guides" aria-hidden="true"></div>'+Array.from({length:8},(_,i)=>'<i class="home-unit" aria-hidden="true" data-unit-index="'+i+'"></i>').join('');
 }
 updateHomeStage(node);
}
function updateHomeStage(node=document.querySelector('.home-stage')){
 if(!node)return;
 node.dataset.mode=state.homeView;
 node.querySelectorAll('.home-unit').forEach((unit,i)=>{
  let x,y,r=0,scale=1,opacity=1;
  if(state.homeView==='whole'){
   const angle=(i*45-90)*Math.PI/180;x='calc('+Math.cos(angle)+' * var(--orbit))';y='calc('+Math.sin(angle)+' * var(--orbit))';r=i*45;
  }else if(state.homeView==='unit'){x='0px';y='0px';scale=i===0?1.7:1;opacity=i===0?1:0;}
  else{x='calc('+((i%4)-1.5)+' * var(--spacing))';y='calc('+(Math.floor(i/4)-.5)+' * var(--spacing))';}
  unit.style.transform='translate('+x+','+y+') rotate('+r+'deg) scale('+scale+')';unit.style.opacity=opacity;
 });
 document.querySelectorAll('[data-home-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.homeView===state.homeView)));
 const label={whole:'整体',unit:'单元',array:'排列'}[state.homeView];
 node.setAttribute('aria-label','结构示意：当前'+label+'视图');
 const status=document.querySelector('.home-status');if(status)status.textContent='当前'+label+'视图';
}
document.addEventListener('click',event=>{
 const button=event.target.closest('[data-home-view]');if(!button)return;
 state.homeView=button.dataset.homeView;updateHomeStage();
});
