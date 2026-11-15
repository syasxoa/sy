import {useEffect,useState} from 'react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import {CustomEase} from 'gsap/CustomEase';
gsap.registerPlugin(ScrollTrigger,CustomEase);
CustomEase.create('wenjingOut','0.23,1,0.32,1');
CustomEase.create('wenjingMiddle','0.77,0,0.175,1');
export {gsap,ScrollTrigger};
export function useReducedMotion(){
  const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(media.matches);media.addEventListener('change',update);return()=>media.removeEventListener('change',update)},[]);
  return reduced;
}
export function useHomeScroll(page,reduced,modal,scrollRef){
  useEffect(()=>{
    if(page!=='home'||reduced)return;
    const lenis=new Lenis({autoRaf:false,lerp:.14,smoothWheel:true,prevent:node=>node.closest('[data-lenis-prevent]')});
    const tick=time=>lenis.raf(time*1000);
    lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(tick);gsap.ticker.lagSmoothing(0);scrollRef.current=lenis;
    return()=>{gsap.ticker.remove(tick);lenis.destroy();scrollRef.current=null};
  },[page,reduced]);
  useEffect(()=>{const lenis=scrollRef.current;if(modal)lenis?.stop();else lenis?.start()},[modal,page,reduced]);
}
