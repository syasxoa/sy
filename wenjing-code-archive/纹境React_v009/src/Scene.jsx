import React,{useLayoutEffect,useRef,useState} from 'react';
import {FlowerLayer} from './Pattern.jsx';
import {gsap,ScrollTrigger} from './motion.js';
import {useApp} from './ui.jsx';
export function Scene({model,home=false,reduced,modal,onHelp}){
  const {keyboard}=useApp();
  const root=useRef(null),api=useRef({}),[active,setActive]=useState(model.current.activated),[spinning,setSpinning]=useState(false),[stage,setStage]=useState(0);
  useLayoutEffect(()=>{
    const element=root.current,m=model.current,zoom=element.querySelector('.scene-zoom'),orient=element.querySelector('.scene-orient'),spin=element.querySelector('.scene-spin'),layers=[...element.querySelectorAll('.scene-layer')];
    let timer,activationDelay,rotationTick,opening=false,pressId=null,firstPress=false,inside=false,latest={x:0,y:0};
    const animate=(node,values,duration=.18)=>gsap.to(node,{...values,duration:reduced||keyboard.current?0:duration,ease:duration===.28?'wenjingMiddle':'wenjingOut',overwrite:true});
    const paint=()=>{gsap.set(zoom,{scale:reduced?1:m.scale,rotation:reduced?0:m.base});gsap.set(orient,{rotationX:reduced?0:m.pitch,rotationY:reduced?0:m.yaw});gsap.set(spin,{rotation:m.spin})};
    const face=()=>{m.pitch=latest.y*-8;m.yaw=latest.x*10;animate(orient,{rotationX:reduced?0:m.pitch,rotationY:reduced?0:m.yaw},.12)};
    const spread=value=>{m.spread=value;layers.forEach((layer,i)=>animate(layer,{z:reduced?0:(i-1)*32*value},value?.28:.22))};
    const cancel=()=>{clearTimeout(timer);timer=null;if(rotationTick)gsap.ticker.remove(rotationTick);rotationTick=null;setSpinning(false);element.dataset.spinning='false';if(pressId!==null&&element.hasPointerCapture(pressId))element.releasePointerCapture(pressId);pressId=null};
    const activate=()=>{m.activated=true;setActive(true);opening=true;spread(1);activationDelay?.kill();activationDelay=gsap.delayedCall(reduced||keyboard.current?0:.28,()=>{opening=false;if(inside&&m.activated&&element.isConnected)face()})};
    const move=e=>{const box=element.getBoundingClientRect();latest={x:Math.max(-1,Math.min(1,(e.clientX-box.left)/box.width*2-1)),y:Math.max(-1,Math.min(1,(e.clientY-box.top)/box.height*2-1))};if(m.activated&&!opening)face()};
    const enter=e=>{inside=true;move(e);if(m.activated)spread(1)};
    const leave=()=>{inside=false;cancel();spread(0);m.pitch=m.yaw=0;animate(orient,{rotationX:0,rotationY:0})};
    const down=e=>{
      if(e.button!==0||!e.isPrimary||pressId!==null)return;pressId=e.pointerId;inside=true;move(e);firstPress=!m.activated;
      if(firstPress){activate();return}
      timer=setTimeout(()=>{if(pressId===null)return;if(reduced){m.spin+=15;gsap.set(spin,{rotation:m.spin});return}element.setPointerCapture(pressId);element.dataset.spinning='true';setSpinning(true);rotationTick=(_time,delta)=>{m.spin+=Math.min(delta,50)*.03;gsap.set(spin,{rotation:m.spin})};gsap.ticker.add(rotationTick)},350);
    };
    const key=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();if(!m.activated)activate();else{m.spin+=15;gsap.set(spin,{rotation:m.spin})}}};
    const visibility=()=>{if(document.hidden)cancel()};
    element.addEventListener('pointerenter',enter);element.addEventListener('pointermove',move);element.addEventListener('pointerleave',leave);element.addEventListener('pointerdown',down);element.addEventListener('keydown',key);
    window.addEventListener('pointerup',cancel);window.addEventListener('pointercancel',cancel);window.addEventListener('blur',cancel);window.addEventListener('wheel',cancel,{passive:true});window.addEventListener('scroll',cancel,{passive:true});window.addEventListener('scene-cancel',cancel);document.addEventListener('visibilitychange',visibility);
    if(home&&!reduced&&m.progress===0){m.scale=3.2;m.base=0}paint();spread(m.spread);
    const ctx=gsap.context(()=>{
      if(home&&!reduced)ScrollTrigger.create({trigger:element.closest('.home-story'),start:'top top+=72',end:'bottom bottom',onUpdate:self=>{
        m.progress=self.progress;const p=self.progress;m.scale=p<.35?3.2-1.6*p/.35:p<.75?1.6-.6*(p-.35)/.4:1;m.base=p>.75?(p-.75)/.25*60:0;
        gsap.set(zoom,{scale:m.scale,rotation:m.base});setStage(p<.35?0:p<.75?1:2);
      }});
    },element);
    api.current={cancel,split:()=>{cancel();m.activated=true;setActive(true);spread(m.spread?0:1)},reset:()=>{cancel();activationDelay?.kill();opening=false;gsap.killTweensOf([orient,spin]);Object.assign(m,{activated:false,spread:0,pitch:0,yaw:0,spin:0});setActive(false);spread(0);paint()},faceReset:()=>{m.pitch=m.yaw=0;animate(orient,{rotationX:0,rotationY:0})},step:()=>{m.activated=true;setActive(true);m.spin+=15;animate(spin,{rotation:m.spin},.18)},whole:()=>{m.scale=1;m.base=0;gsap.set(zoom,{scale:1,rotation:0});if(home&&!reduced){const trigger=ScrollTrigger.getAll().find(t=>t.trigger===element.closest('.home-story'));if(trigger)window.scrollTo({top:trigger.start+(trigger.end-trigger.start)*.75,behavior:'instant'})}}};
    return()=>{cancel();activationDelay?.kill();ctx.revert();gsap.killTweensOf([zoom,orient,spin,...layers]);element.removeEventListener('pointerenter',enter);element.removeEventListener('pointermove',move);element.removeEventListener('pointerleave',leave);element.removeEventListener('pointerdown',down);element.removeEventListener('keydown',key);window.removeEventListener('pointerup',cancel);window.removeEventListener('pointercancel',cancel);window.removeEventListener('blur',cancel);window.removeEventListener('wheel',cancel);window.removeEventListener('scroll',cancel);window.removeEventListener('scene-cancel',cancel);document.removeEventListener('visibilitychange',visibility)};
  },[home,reduced]);
  useLayoutEffect(()=>{if(modal)api.current.cancel?.()},[modal]);
  return <div className={`scene-wrap ${home?'scene-home':'scene-full'}`}>
    <div className="scene-topline"><span>灰阶结构示意</span><span>{home?['花心近景','完整团花','旋转观察'][stage]:'与首页共用同一团花'}</span></div>
    <div className="scene-surface" ref={root} tabIndex="0" role="button" aria-label="团花展示面，首次按压激活，随后移动朝向，后续长按旋转；键盘回车分步操作" data-active={active} data-spinning="false">
      <div className="scene-grid" aria-hidden="true"/><div className="scene-zoom"><div className="scene-orient"><div className="scene-spin">{[2,1,0].map(part=><div className="scene-layer" key={part}><FlowerLayer part={part}/></div>)}</div></div></div>
      <span className="axis-label axis-left" aria-hidden="true">—</span><span className="axis-label axis-right" aria-hidden="true">—</span>
    </div>
    <div className="scene-controlbar" role="group" aria-label="团花操作"><button onClick={()=>api.current.split()}>分层 / 收拢</button><button onClick={()=>api.current.faceReset()}>朝向复位</button><button onClick={()=>api.current.step()}>旋转 15°</button><button onClick={()=>api.current.whole()}>查看完整团花</button><button onClick={()=>api.current.reset()}>重置体验</button><button className="icon-button" onClick={onHelp} aria-label="查看鼠标操作说明">?</button></div>
    <p className="scene-instruction" role="status">{spinning?'旋转中，松开鼠标即停止':active?'移动鼠标改变朝向 · 再次长按旋转':'首次点击或长按，展开纹样层次'}</p>
  </div>;
}
