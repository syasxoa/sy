// 独立内容页沿用同一套导航，原首页与沉浸互动继续保留。
const extraPages=get('extra-pages');
const pageNames=['explore','interact','create','workbench','ai','account'];
function showPage(){
  const name=location.hash.slice(1);
  const isExtra=pageNames.includes(name);
  extraPages.hidden=!isExtra;
  extraPages.querySelectorAll('[data-page]').forEach(page=>page.hidden=page.dataset.page!==name);
  if(isExtra){home.hidden=true;header.hidden=false;window.scrollTo({top:0,behavior:'instant'});}
  else if(name!=='play'){home.hidden=false;header.hidden=false;if(name==='studio'||name==='catalog')requestAnimationFrame(()=>get(name).scrollIntoView());}
}
window.addEventListener('hashchange',showPage);showPage();
document.querySelector('.explore-flower').append(graphic('motif'));
document.querySelector('.explore-fret').append(graphic('fret'));
document.querySelector('.activity-flower').append(graphic('motif'));
document.querySelector('.match-flower').append(graphic('motif'));
document.querySelector('.create-art').append(graphic('motif'));
get('explore-grid').addEventListener('click',event=>{const item=event.target.closest('[data-entry]');if(item)openDetail(item.dataset.entry);});
get('search-pattern').addEventListener('input',event=>{
  const query=event.target.value.trim().toLowerCase();let count=0;
  document.querySelectorAll('#explore-grid [data-entry]').forEach(card=>{card.hidden=!card.dataset.search.toLowerCase().includes(query);if(!card.hidden)count++;});
  get('search-count').textContent='共 '+count+' 项';get('search-empty').hidden=count!==0;
});
get('quiz-start').addEventListener('click',()=>{get('quiz').hidden=false;get('quiz-start').hidden=true;});
get('quiz').addEventListener('click',event=>{const choice=event.target.closest('[data-answer]');if(!choice)return;get('quiz-result').textContent=choice.dataset.answer==='correct'?'答对了：团花的单元围绕中心重复。':'再观察一下：题目强调围绕中心排列。';});
get('match-start').addEventListener('click',()=>{get('matching').hidden=false;get('match-start').hidden=true;});
get('matching').addEventListener('click',event=>{const choice=event.target.closest('[data-match]');if(!choice)return;get('match-result').textContent=choice.dataset.match==='correct'?'配对成功：这是团花的构成方式。':'再试一次：回纹更常见连续的方折线条。';});
document.querySelector('.account-tabs').addEventListener('click',event=>{const tab=event.target.closest('[data-tab]');if(!tab)return;document.querySelectorAll('[data-tab]').forEach(item=>item.setAttribute('aria-selected',String(item===tab)));get('account-title').textContent='我的'+tab.dataset.tab;});
let previewUrl='';
get('reference-image').addEventListener('change',event=>{if(previewUrl)URL.revokeObjectURL(previewUrl);const file=event.target.files[0];const preview=get('reference-preview');if(!file){preview.hidden=true;return;}previewUrl=URL.createObjectURL(file);preview.src=previewUrl;preview.hidden=false;});

// 简易画布保存为普通图片；图层与文字仍保留为后续功能。
const drawing=get('drawing'),paint=drawing.getContext('2d');let tool='brush',drawingNow=false,history=[];
function blankCanvas(){paint.globalCompositeOperation='source-over';paint.fillStyle='#fff';paint.fillRect(0,0,drawing.width,drawing.height);}
function remember(){history.push(paint.getImageData(0,0,drawing.width,drawing.height));if(history.length>12)history.shift();}
blankCanvas();remember();
document.querySelector('.work-toolbar').addEventListener('click',event=>{const button=event.target.closest('[data-tool]');if(!button)return;tool=button.dataset.tool;document.querySelectorAll('[data-tool]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));});
function position(event){const rect=drawing.getBoundingClientRect();return [(event.clientX-rect.left)*drawing.width/rect.width,(event.clientY-rect.top)*drawing.height/rect.height];}
drawing.addEventListener('pointerdown',event=>{if(!event.isPrimary||event.button!==0)return;event.preventDefault();drawing.setPointerCapture(event.pointerId);drawingNow=true;const [x,y]=position(event);paint.globalCompositeOperation='source-over';paint.strokeStyle=tool==='eraser'?'#fff':get('paint-color').value;paint.fillStyle=get('paint-color').value;paint.lineWidth=tool==='eraser'?38:7;paint.lineCap='round';paint.lineJoin='round';if(tool==='stamp'){for(let i=0;i<8;i++){paint.save();paint.translate(x,y);paint.rotate(i*Math.PI/4);paint.beginPath();paint.ellipse(0,-26,9,24,0,0,Math.PI*2);paint.fill();paint.restore();}paint.beginPath();paint.arc(x,y,10,0,Math.PI*2);paint.fill();}else{paint.beginPath();paint.moveTo(x,y);paint.lineTo(x+.01,y+.01);paint.stroke();}});
drawing.addEventListener('pointermove',event=>{if(!drawingNow||tool==='stamp')return;const [x,y]=position(event);paint.lineTo(x,y);paint.stroke();});
function endDraw(){if(drawingNow){drawingNow=false;remember();}}
drawing.addEventListener('pointerup',endDraw);drawing.addEventListener('pointercancel',endDraw);
get('undo-paint').addEventListener('click',()=>{if(history.length>1){history.pop();paint.putImageData(history[history.length-1],0,0);}});
get('clear-paint').addEventListener('click',()=>{blankCanvas();remember();});
get('save-drawing').addEventListener('click',()=>{drawing.toBlob(blob=>{if(!blob)return;const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='纹境-自由创作.png';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),2000);});});
