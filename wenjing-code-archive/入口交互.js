const narrow=window.matchMedia('(max-width:760px)');
function selectedScreen(key){return narrow.matches && narrowScreens[key] ? narrowScreens[key] : allScreens[key];}
function previewBloom(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const parts=viewer.querySelectorAll('.hero-motif .layer');
  parts.forEach((part,i)=>{
    part.getAnimations().forEach(a=>a.cancel());
    part.animate([
      {transform:'scale(1) rotate(0deg)'},
      {transform:'scale(.58) rotate('+(i===1?-36:36)+'deg)',offset:.23},
      {transform:'scale(1.06) rotate('+(i===1?12:-12)+'deg)',offset:.73},
      {transform:'scale(1) rotate(0deg)'}
    ],{duration:1150,delay:i*65,easing:'ease-in-out'});
  });
}
viewer.addEventListener('pointerover',event=>{
  const trigger=event.target.closest('[data-bloom]');
  if(event.pointerType==='mouse'&&trigger&&!trigger.contains(event.relatedTarget)) previewBloom();
});
viewer.addEventListener('focusin',event=>{
  if(event.target.closest('[data-bloom]')&&event.target.matches(':focus-visible')) previewBloom();
});
viewer.addEventListener('click',event=>{
  const tab=event.target.closest('[data-panel]');
  if(!tab)return;
  viewer.querySelectorAll('[data-content]').forEach(panel=>panel.setAttribute('visibility',panel.dataset.content===tab.dataset.panel?'visible':'hidden'));
  viewer.querySelectorAll('[data-panel]').forEach(button=>button.setAttribute('aria-pressed',String(button===tab)));
});
narrow.addEventListener('change',()=>{
  if(!viewer.hidden)viewer.replaceChildren(copySvg(current));
});

