import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {pages,modals,patterns} from './data.js';
import {AppContext,Icon} from './ui.jsx';
import {Home,Explore,Detail,Interact,Immersive,Recognize,Match,Create,AIUpload,AIResult,Workbench,Pottery,Account} from './Pages.jsx';
import {Dialog} from './Dialog.jsx';
import {gsap,ScrollTrigger,useReducedMotion,useHomeScroll} from './motion.js';
import './style.css';
function Photo(){return <Pottery photo/>}
function App(){
 const route=()=>Object.hasOwn(pages,location.hash.slice(1))?location.hash.slice(1):'home';
 const [page,setPage]=useState(route),[modal,setModal]=useState(null),[theme,setTheme]=useState(document.documentElement.dataset.theme),[toast,setToast]=useState('');
 const [state,setState]=useState({pattern:3,query:'',filter:'全部',tab:'图形观察',answer:'',pairs:{},selectedPicture:null,complete:false,scene:'提取纹样',upload:null,uploadName:'',marks:[],history:[],logged:false,pot:{variant:0,size:36,repeat:6,position:50,angle:0,zoom:100}});
 const reduced=useReducedMotion(),keyboard=useRef(false),scrollRef=useRef(null),positions=useRef({}),previousScene=useRef(null),current=useRef(page),manualTheme=useRef(false),timer=useRef(),main=useRef();
 const model=useRef({activated:false,spread:0,pitch:0,yaw:0,spin:0,scale:1,base:0,progress:0});
 useHomeScroll(page,reduced,modal,scrollRef);
 const close=()=>setModal(null),notify=message=>{setToast(message);clearTimeout(timer.current);timer.current=setTimeout(()=>setToast(''),2400)};
 const open=id=>{document.querySelector('.page-index')?.removeAttribute('open');setModal(id)};
 const navigate=key=>{if(!Object.hasOwn(pages,key))return;close();document.querySelector('.page-index')?.removeAttribute('open');if(current.current===key)return;positions.current[current.current]=window.scrollY;const scene=document.querySelector('.scene-wrap');previousScene.current=scene&&['home','gesture','gestureActive'].includes(key)?scene.getBoundingClientRect():null;location.hash=key};
 useEffect(()=>{const change=()=>{positions.current[current.current]=window.scrollY;current.current=route();setPage(current.current);close()};const key=e=>{keyboard.current=true;document.documentElement.dataset.keyboard='true';if(e.key==='Escape')document.querySelector('.page-index')?.removeAttribute('open')};const pointer=()=>{keyboard.current=false;document.documentElement.dataset.keyboard='false'};window.addEventListener('hashchange',change);document.addEventListener('keydown',key,true);document.addEventListener('pointerdown',pointer);return()=>{window.removeEventListener('hashchange',change);document.removeEventListener('keydown',key,true);document.removeEventListener('pointerdown',pointer);clearTimeout(timer.current)}},[]);
 useLayoutEffect(()=>{
  document.title=pages[page]+'｜纹境';document.body.dataset.page=page;
  window.scrollTo({top:positions.current[page]||0,behavior:'instant'});
  const frame=requestAnimationFrame(()=>{ScrollTrigger.refresh();ScrollTrigger.update();main.current?.focus({preventScroll:true})});
  const ctx=gsap.context(()=>{if(reduced||keyboard.current)return;const scene=main.current.querySelector('.scene-wrap'),from=previousScene.current;if(scene&&from){const to=scene.getBoundingClientRect();gsap.fromTo(scene,{x:from.left-to.left,y:from.top-to.top,scaleX:from.width/to.width,scaleY:from.height/to.height,transformOrigin:'top left'},{x:0,y:0,scaleX:1,scaleY:1,duration:.5,ease:'wenjingMiddle',clearProps:'transform,transformOrigin'})}const title=main.current.querySelector('.page-heading,.work-heading');if(title)gsap.from(title,{opacity:0,y:4,duration:.18,ease:'wenjingOut',clearProps:'transform,opacity'})},main);
  previousScene.current=null;return()=>{cancelAnimationFrame(frame);ctx.revert()};
 },[page,reduced]);
 useEffect(()=>{try{manualTheme.current=!!localStorage.getItem('wenjing-theme')}catch{}const media=matchMedia('(prefers-color-scheme:dark)');const change=()=>{if(!manualTheme.current)setTheme(media.matches?'dark':'light')};media.addEventListener('change',change);return()=>media.removeEventListener('change',change)},[]);
 useLayoutEffect(()=>{document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme},[theme]);
 const toggleTheme=()=>{manualTheme.current=true;setTheme(t=>{const next=t==='dark'?'light':'dark';try{localStorage.setItem('wenjing-theme',next)}catch{}return next})};
 const selectPattern=id=>{setState(s=>({...s,pattern:id}));navigate('detail')};
 const active=['detail','explore'].includes(page)?'explore':['interact','gesture','gestureActive','recognize','match'].includes(page)?'interact':['create','aiUpload','aiResult','workbench','pottery','photo'].includes(page)?'create':page;
 const Page={home:Home,explore:Explore,detail:Detail,interact:Interact,gesture:Immersive,gestureActive:Immersive,recognize:Recognize,match:Match,create:Create,aiUpload:AIUpload,aiResult:AIResult,workbench:Workbench,pottery:Pottery,photo:Photo,account:Account,works:Account,drafts:Account}[page];
 return <AppContext.Provider value={{page,state,setState,model,reduced,keyboard,modal,open,close,navigate,notify,selectPattern}}>
 <header className="site-header"><a href="#content" className="skip-link" onClick={e=>{e.preventDefault();main.current.focus()}}>跳到正文</a><a className="wordmark" href="#home" onClick={e=>{e.preventDefault();navigate('home')}}><span className="brand-glyph" aria-hidden="true">✳</span>纹境<span className="brand-sub">纹样的观察与创作</span></a><nav aria-label="主导航">{[['explore','探索纹样'],['interact','趣味互动'],['create','纹样创作']].map(([key,name])=><a key={key} href={'#'+key} aria-current={active===key?'page':undefined} onClick={e=>{e.preventDefault();navigate(key)}}>{name}</a>)}</nav><div className="header-controls"><button id="theme-toggle" className="theme-button" onClick={toggleTheme} aria-label={theme==='dark'?'切换到白天':'切换到黑夜'} aria-pressed={theme==='dark'}><span className="theme-symbol" key={theme}><Icon name={theme==='dark'?'moon':'sun'}/></span>{theme==='dark'?'黑夜':'白天'}</button><button className="login-button" onClick={()=>state.logged?navigate('account'):open('login')}><Icon name="user"/>{state.logged?'我的空间':'登录'}</button></div></header>
 <main id="content" tabIndex="-1" ref={main} className={page==='home'?'home-page':'content-shell'} data-view={page}><Page/></main>
 <footer className="site-footer"><a href="#home" onClick={e=>{e.preventDefault();navigate('home')}}>纹境</a><p>观察形态，理解结构，自由创作。</p><span>灰阶交互原型 · 电脑端 · V009</span></footer>
 <details className="page-index" data-lenis-prevent><summary>原型索引 <span>17 页 / 16 弹窗</span></summary><div className="index-panel"><h2>页面与状态</h2><div>{Object.entries(pages).map(([k,n])=><a key={k} href={'#'+k} onClick={e=>{e.preventDefault();navigate(k)}}>{n}</a>)}</div><h2>弹窗与反馈</h2><div>{Object.entries(modals).map(([k,n])=><button key={k} onClick={()=>open(k)}>{n}</button>)}</div></div></details>
 <Dialog/><div className={'toast '+(toast?'show':'')} role="status">{toast}</div>
 </AppContext.Provider>;
}
createRoot(document.getElementById('root')).render(<App/>);
