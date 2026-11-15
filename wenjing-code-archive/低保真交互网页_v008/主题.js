// 主题仅改变外观，不重建页面，因此画布、配对及弹窗状态会保留。
(()=>{
 const root=document.documentElement,button=byId('theme-toggle');
 const system=matchMedia('(prefers-color-scheme: dark)');
 const icons={light:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>',dark:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 15.2A8.5 8.5 0 0 1 8.8 4a8.5 8.5 0 1 0 11.2 11.2Z"/></svg>'};
 function apply(theme){
  root.dataset.theme=theme;root.style.colorScheme=theme;
  const night=theme==='dark';
  byId('theme-symbol').innerHTML=icons[theme];byId('theme-label').textContent=night?'黑夜':'白天';
  button.setAttribute('aria-label',night?'切换到白天':'切换到黑夜');
  button.setAttribute('aria-pressed',String(night));button.title=night?'当前黑夜，切换到白天':'当前白天，切换到黑夜';
 }
 button.addEventListener('click',()=>{
  const next=root.dataset.theme==='dark'?'light':'dark';root.dataset.themeSource='manual';
  try{localStorage.setItem('wenjing-theme',next);}catch{/* 浏览器禁用存储时，本次切换仍有效。 */}
  apply(next);
 });
 system.addEventListener('change',e=>{if(root.dataset.themeSource==='system')apply(e.matches?'dark':'light');});
 window.addEventListener('storage',e=>{if(e.key==='wenjing-theme'){
  if(e.newValue==='light'||e.newValue==='dark'){root.dataset.themeSource='manual';apply(e.newValue);}
  else if(e.newValue===null){root.dataset.themeSource='system';apply(system.matches?'dark':'light');}
 }});
 apply(root.dataset.theme);
})();
