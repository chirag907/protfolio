(async()=>{
const $=s=>document.querySelector(s),cfg=window.CONFIG||{};
const b=Board.mount($('#board'),{onOpen:it=>{$('#pv-img').src=Board.web(it.media);$('#pv-img').alt=it.title||'';$('#pv').hidden=false}});
$('#pv-x').onclick=()=>$('#pv').hidden=true;$('#pv').onclick=e=>{if(e.target.id==='pv')$('#pv').hidden=true};addEventListener('keydown',e=>{if(e.key==='Escape')$('#pv').hidden=true});
if(!cfg.SUPABASE_URL||!window.supabase){$('#bhint').textContent='Pinboard coming soon.';return}
const sb=supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
const {data,error}=await sb.from('pinboard').select('*').order('z');
if(error||!data||!data.length){$('#bhint').textContent='Pinboard coming soon.';return}
b.set(data);
})();
