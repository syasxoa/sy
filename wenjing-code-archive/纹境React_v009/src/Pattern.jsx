import React,{useId} from 'react';
export function FlowerLayer({part=0}){
  const petals=(count,radius,path)=>Array.from({length:count},(_,i)=><g key={i} transform={`rotate(${i*360/count}) translate(0 ${-radius})`}><path d={path}/></g>);
  return <svg viewBox="-240 -240 480 480" fill="none" aria-hidden="true" className={`flower-part part-${part}`}>
    {part===2&&<g>{petals(16,146,'M0 -72 C-37 -36 -29 9 0 30 C29 9 37 -36 0 -72Z')}<circle r="192" className="hair-circle"/>{petals(16,207,'M0 -5 L5 0 0 5 -5 0Z')}</g>}
    {part===1&&<g>{petals(8,92,'M0 -88 C-48 -54 -49 4 0 42 C49 4 48 -54 0 -88Z')}{petals(8,112,'M0 -46 C-17 -22 -17 1 0 18 C17 1 17 -22 0 -46Z')}<circle r="90" className="hair-circle"/></g>}
    {part===0&&<g>{petals(8,34,'M0 -45 C-27 -27 -28 0 0 26 C28 0 27 -27 0 -45Z')}<circle r="24"/><circle r="12" className="core"/>{petals(8,65,'M0 -5 L4 0 0 5 -4 0Z')}</g>}
  </svg>;
}
export function Pattern({variant=0,part, className=''}){
  if(part!==undefined)return <FlowerLayer part={part}/>;
  if(variant===1)return <svg className={`pattern ${className}`} viewBox="0 0 240 240" fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth="9" strokeLinejoin="miter"><path d="M43 44h154v153H43V82h116v77H82v-39h38"/><path d="M43 44v38m154 115h-38"/></g></svg>;
  if(variant===2)return <svg className={`pattern ${className}`} viewBox="0 0 240 240" fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth="5" strokeLinecap="round"><path d="M26 155c-20-55 61-94 85-42 15 34-45 43-43 12 1-18 27-18 24-1M109 111c26-76 110-52 102-3-6 33-48 28-46 4 1-15 23-16 22-2M26 155c28-4 33 26 73 16 41-11 54-36 93-28M47 184c40 14 71-15 104-11"/></g></svg>;
  if(variant===4)return <svg className={`pattern ${className}`} viewBox="0 0 240 240" aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth="4"><path d="M36 120c50-75 105-64 143 0-38 64-93 75-143 0Zm143 0 37-33v66Z"/><circle cx="72" cy="110" r="5"/><path d="M104 72q-28 48 0 96M125 78q-28 42 0 84M145 90q-20 30 0 60"/></g></svg>;
  return <div className={`pattern flower-flat variant-${variant} ${className}`}>{[2,1,0].map(p=><FlowerLayer key={p} part={p}/>)}</div>;
}
export function Pot({variant=0,repeat=6,size=30,position=50,angle=0,patternVariant=3,composition=null}){
  const id=useId().replace(/:/g,'');
  const shapes=['M87 31Q120 20 153 31L150 60C210 91 218 156 177 209Q120 227 63 209C22 156 30 91 90 60Z','M76 25H164L153 65Q210 88 201 166L181 214H59L39 166Q30 88 87 65Z','M94 25H146L143 61Q194 102 180 184L163 215H77L60 184Q46 102 97 61Z'];
  return <svg className="pot" viewBox="0 0 240 240" role="img" aria-label={`陶罐款式${variant+1}的平面装饰示意`}><defs><clipPath id={id}><path d={shapes[variant]}/></clipPath></defs><path className="pot-body" d={shapes[variant]}/><g clipPath={`url(#${id})`}><g transform={`translate(120 120) rotate(${angle}) translate(-120 -120)`}>{Array.from({length:repeat},(_,i)=><g key={i} transform={`translate(${24+i*190/Math.max(1,repeat-1)} ${60+position}) scale(${size/480})`}><foreignObject x="-240" y="-240" width="480" height="480">{composition?.length?<Artwork marks={composition}/>:<Pattern variant={patternVariant}/>}</foreignObject></g>)}</g></g><path d="M87 31Q120 44 153 31M67 206Q120 215 173 206" fill="none" stroke="currentColor" strokeWidth="1.3"/></svg>;
}

// 与画布共用对象坐标，将整份创作作为一组装饰单元传到陶罐和取景。
export function Artwork({marks}){
 return <svg className="artwork" viewBox="0 0 600 440" aria-hidden="true">{marks.map(m=><g key={m.id} transform={`translate(${m.x} ${m.y}) scale(${m.scale})`}>{m.kind==='pattern'?<foreignObject x="-48" y="-48" width="96" height="96"><Pattern variant={m.variant}/></foreignObject>:m.kind==='text'?<text textAnchor="middle" fontSize="26" fill="currentColor">{m.text}</text>:<polyline points={m.points.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>}</g>)}</svg>;
}
