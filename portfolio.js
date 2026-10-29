(async()=>{
const $=s=>document.querySelector(s),cfg=window.CONFIG||{};
const h=(t,p={},...k)=>{const e=Object.assign(document.createElement(t),p);e.append(...k);return e};
const web=u=>/^https?:\/\//i.test(u||'')?u:'';
$('#year').textContent=new Date().getFullYear();
const root=$('#pf'),say=t=>root.append(h('p',{className:'pf-empty'},t));
function open(p){
  const img=web(p.image),link=web(p.url),i=$('#pv-img');
  i.hidden=!img;if(img){i.src=img;i.alt=p.title}
  $('#pv-t').textContent=p.title;$('#pv-s').textContent=p.summary||'';
  $('#pv-tags').replaceChildren(...(p.tags||'').split(',').map(t=>t.trim()).filter(Boolean).map(t=>h('span',{},t)));
  const a=$('#pv-a');a.hidden=!link;if(link)a.href=link;
  $('#pv').hidden=false;$('#pv-x').focus();document.body.style.overflow='hidden';
}
const close=()=>{$('#pv').hidden=true;document.body.style.overflow=''};
$('#pv-x').onclick=close;$('#pv').addEventListener('click',e=>{if(e.target.id==='pv')close()});addEventListener('keydown',e=>{if(e.key==='Escape')close()});
if(!cfg.SUPABASE_URL||!cfg.SUPABASE_ANON_KEY||!window.supabase){say('Portfolio coming soon.');return}
const sb=supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);window.Theme&&Theme.load(sb);
const {data,error}=await sb.from('portfolio').select('*').eq('published',true).order('sort_order');
if(error||!data||!data.length){say('Portfolio coming soon.');return}
const prof=data.find(r=>r.kind==='profile');
if(prof){$('#pf-head').textContent=prof.title;$('#pf-bio').textContent=prof.summary||''}
const ps=data.filter(r=>r.kind==='project');
if(!ps.length)say('Projects coming soon.');
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.08});
ps.forEach(p=>{const img=web(p.image),t=h('button',{className:'pt'+(img?'':' noimg'),type:'button',onclick:()=>open(p)},...(img?[h('img',{src:img,alt:'',loading:'lazy'})]:[]),h('span',{className:'pt-t'},p.title));root.append(t);io.observe(t)});
})();
