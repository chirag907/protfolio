window.Board=(()=>{
const h=(t,p={},...k)=>{const e=Object.assign(document.createElement(t),p);e.append(...k);return e};
const web=u=>/^https?:\/\//i.test(u||'')?u:'';
const host=u=>{try{return new URL(u).hostname.replace(/^www\./,'')}catch(e){return ''}};
const embed=u=>{const m=/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([\w-]{11})/.exec(u||'');return m?'https://www.youtube-nocookie.com/embed/'+m[1]:''};
const COL={YouTube:'#ff0033',Netflix:'#e50914','Prime Video':'#00a8e1',Spotify:'#1db954',Instagram:'#e1306c',GitHub:'#c9d1d9',LinkedIn:'#0a66c2',X:'#e9edf2'};
const btn=(u,t)=>h('a',{className:'bt',href:web(u),target:'_blank',rel:'noopener noreferrer',textContent:t||'Open'});
function content(it){
  switch(it.kind){
    case 'link':return [h('i',{className:'dot',style:'background:'+(COL[it.title]||'var(--hot)')}),h('b',{},it.title||host(it.url)),h('small',{},host(it.url)),btn(it.url)];
    case 'contact':return [h('b',{},it.title||'Contact'),h('small',{},it.body||''),...(it.url?[h('a',{className:'bt',href:'tel:'+it.url.replace(/[^\d+*#]/g,''),textContent:'Call'})]:[])];
    case 'note':return [h('b',{},it.title||''),h('p',{},it.body||'')];
    case 'image':return [h('img',{src:web(it.media),alt:it.title||'',loading:'lazy'})];
    case 'video':return [h('video',{src:web(it.media),controls:true,preload:'metadata'})];
    case 'yt':return [h('iframe',{src:embed(it.url),title:it.title||'Video',allowFullscreen:true,loading:'lazy'})];
    default:return [h('b',{},it.title||'File'),h('small',{},'File'),btn(it.media,'Open file')];
  }
}
function mount(root,o={}){
  const world=h('div',{className:'bw'}),v={x:40,y:60,k:1};let items=[],drag=null,sel=null;root.classList.add('board');root.append(world);
  const apply=()=>{world.style.transform=`translate(${v.x}px,${v.y}px) scale(${v.k})`;root.style.backgroundPosition=`${v.x}px ${v.y}px`;root.style.backgroundSize=`${28*v.k}px ${28*v.k}px`};
  function render(){world.replaceChildren(...items.map(it=>{
    const d=h('div',{className:'bi k-'+it.kind+(it.id===sel?' sel':'')},...(o.edit?[h('div',{className:'hd'},it.kind)]:[]),h('div',{className:'bc'},...content(it)),...(o.edit?[h('i',{className:'rz'})]:[]));
    d.dataset.id=it.id;d.style.cssText=`left:${it.x}px;top:${it.y}px;width:${it.w}px;height:${it.h}px;z-index:${it.z||0}`;return d}))}
  const pick=id=>{sel=id;world.querySelectorAll('.bi').forEach(e=>e.classList.toggle('sel',+e.dataset.id===id));o.onSelect&&o.onSelect(id)};
  root.addEventListener('wheel',e=>{e.preventDefault();if(e.ctrlKey||e.metaKey){const k=Math.min(2.5,Math.max(.25,v.k*Math.exp(-e.deltaY*.01))),r=root.getBoundingClientRect(),cx=e.clientX-r.left,cy=e.clientY-r.top;v.x=cx-(cx-v.x)*(k/v.k);v.y=cy-(cy-v.y)*(k/v.k);v.k=k}else{v.x-=e.deltaX;v.y-=e.deltaY}apply()},{passive:false});
  root.addEventListener('pointerdown',e=>{
    const t=e.target,bi=t.closest&&t.closest('.bi'),it=bi&&items.find(i=>i.id===+bi.dataset.id);
    if(o.edit&&bi&&(t.closest('.hd')||t.closest('.rz'))){pick(it.id);drag={it,el:bi,rz:!!t.closest('.rz'),sx:e.clientX,sy:e.clientY,ox:it.x,oy:it.y,ow:it.w,oh:it.h}}
    else if(!bi){if(o.edit)pick(null);drag={pan:1,sx:e.clientX,sy:e.clientY}}
    else{if(o.edit)pick(it.id);return}
    root.setPointerCapture(e.pointerId);
  });
  root.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.sx,dy=e.clientY-drag.sy;
    if(drag.pan){v.x+=dx;v.y+=dy;drag.sx=e.clientX;drag.sy=e.clientY;apply()}
    else if(drag.rz){drag.it.w=Math.max(140,drag.ow+dx/v.k);drag.it.h=Math.max(90,drag.oh+dy/v.k);drag.el.style.width=drag.it.w+'px';drag.el.style.height=drag.it.h+'px'}
    else{drag.it.x=drag.ox+dx/v.k;drag.it.y=drag.oy+dy/v.k;drag.el.style.left=drag.it.x+'px';drag.el.style.top=drag.it.y+'px'}});
  const end=()=>{if(drag&&!drag.pan&&o.onSave){const i=drag.it;o.onSave(i.id,{x:Math.round(i.x),y:Math.round(i.y),w:Math.round(i.w),h:Math.round(i.h)})}drag=null};
  root.addEventListener('pointerup',end);root.addEventListener('pointercancel',end);
  if(o.onOpen)world.addEventListener('click',e=>{const im=e.target.closest('.k-image img');if(im){const bi=im.closest('.bi');o.onOpen(items.find(i=>i.id===+bi.dataset.id))}});
  apply();
  return {set(a){items=a;render()},get:id=>items.find(i=>i.id===id),reset(){v.x=40;v.y=60;v.k=1;apply()}};
}
return {mount,embed,web};
})();
