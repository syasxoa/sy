// 首次跟随系统；手动选择在绘制界面前读取，避免刷新时闪白。
(()=>{
 const root=document.documentElement;
 let saved=null;
 try{saved=localStorage.getItem('wenjing-theme');}catch{}
 const manual=saved==='light'||saved==='dark';
 root.dataset.theme=manual?saved:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
 root.dataset.themeSource=manual?'manual':'system';
 root.style.colorScheme=root.dataset.theme;
})();
