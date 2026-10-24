(async()=>{
const $=s=>document.querySelector(s),cfg=window.CONFIG||{};
const h=(t,p={},...k)=>{const e=Object.assign(document.createElement(t),p);e.append(...k);return e};
const web=u=>/^https?:\/\//i.test(u||'')?u:'';
$('#year').textContent=new Date().getFullYear();
const root=$('#pf');
if(!cfg.SUPABASE_URL||!cfg.SUPABASE_ANON_KEY||!window.supabase){root.append(h('p',{className:'pf-empty'},'Portfolio coming soon.'));return}
const sb=supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
const {data,error}=await sb.from('portfolio').select('*').eq('published',true).order('sort_order');
if(error||!data||!data.length){root.append(h('p',{className:'pf-empty'},'Portfolio coming soon.'));return}
const prof=data.find(r=>r.kind==='profile');
if(prof){$('#pf-head').textContent=prof.title;$('#pf-bio').textContent=prof.summary||''}
const ps=data.filter(r=>r.kind==='project');
if(!ps.length)root.append(h('p',{className:'pf-empty'},'Projects coming soon.'));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.1});
ps.forEach(p=>{
  const link=web(p.url),img=web(p.image);
  const card=h('article',{className:'pf-card'},
    ...(img?[h('img',{src:img,alt:'',loading:'lazy'})]:[]),
    h('div',{className:'pf-body'},h('h3',{},link?h('a',{href:link,target:'_blank',rel:'noopener noreferrer',textContent:p.title}):p.title),
      ...(p.summary?[h('p',{},p.summary)]:[]),
      ...(p.tags?[h('div',{className:'chips'},...p.tags.split(',').map(t=>t.trim()).filter(Boolean).map(t=>h('span',{},t)))]:[])));
  root.append(card);io.observe(card);
});
})();
