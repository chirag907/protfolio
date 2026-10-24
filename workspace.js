(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],cfg=window.CONFIG||{},B='files';
const h=(t,p={},...k)=>{const e=Object.assign(document.createElement(t),p);e.append(...k);return e};
const sb=cfg.SUPABASE_URL&&cfg.SUPABASE_ANON_KEY&&window.supabase?supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY):null;
const am=$('#auth-msg'),home=location.href.split('#')[0];let uid,mode='in';
const fmt=n=>n>1048576?(n/1048576).toFixed(1)+' MB':Math.max(1,Math.round((n||0)/1024))+' KB';
const tel=p=>'tel:'+(p||'').replace(/[^\d+*#]/g,''),sms=p=>'sms:'+(p||'').replace(/[^\d+*#]/g,''),web=u=>/^https?:\/\//i.test(u)?u:'#';
const empty=(t)=>h('p',{className:'empty'},t);

/* ---- auth ---- */
if(!sb){am.textContent='Not connected yet. Fill in config.js (see README).';$('#auth-btn').disabled=true}
else{
  sb.auth.getSession().then(({data})=>data.session&&start(data.session.user));
  sb.auth.onAuthStateChange(async ev=>{
    if(ev==='SIGNED_OUT')location.reload();
    if(ev==='PASSWORD_RECOVERY'){const p=prompt('Choose a new password (10+ characters)');if(p&&p.length>=10){const {error}=await sb.auth.updateUser({password:p});alert(error?error.message:'Password updated.')}}
  });
}
$('#swap').onclick=()=>{mode=mode==='in'?'up':'in';$('#auth-btn').textContent=mode==='in'?'Sign in':'Create account';$('#swap').textContent=mode==='in'?'Create an account':'I already have an account';$('#pass').autocomplete=mode==='in'?'current-password':'new-password'};
$('#reset').onclick=async()=>{const e=$('#email').value.trim();if(!e||!sb){am.textContent='Enter your email first.';return}await sb.auth.resetPasswordForEmail(e,{redirectTo:home});am.textContent='If that account exists, a reset link has been emailed.'};
$('#auth-form').onsubmit=async e=>{
  e.preventDefault();if(!sb)return;am.textContent='';
  const c={email:$('#email').value.trim(),password:$('#pass').value};
  const {data,error}=mode==='in'?await sb.auth.signInWithPassword(c):await sb.auth.signUp({...c,options:{emailRedirectTo:home}});
  $('#pass').value='';
  if(error){am.textContent=error.message;return}
  if(data.session)start(data.user);else am.textContent='Check your email to confirm your account, then sign in.';
};
$('#out').onclick=()=>sb.auth.signOut();
async function start(u){uid=u.id;$('#auth').hidden=true;$('#app').hidden=false;show('emergency');const {data}=await sb.rpc('is_admin');if(data===true)$('#nav-pf').hidden=false}

/* ---- navigation ---- */
const L={emergency,contacts,files,links,notes,portfolio};
function show(s){$$('main section').forEach(x=>x.hidden=x.dataset.s!==s);$$('.nav [data-s]').forEach(b=>b.classList.toggle('on',b.dataset.s===s));L[s]()}
$$('.nav [data-s]').forEach(b=>b.onclick=()=>show(b.dataset.s));
const sel=async(t,o,asc=true)=>{const {data,error}=await sb.from(t).select('*').order(o,{ascending:asc});return error?[]:data};
const del=async(t,id,name)=>{if(confirm('Delete '+name+'?')){await sb.from(t).delete().eq('id',id);return true}};

/* ---- generic add forms ---- */
$$('form[data-t]').forEach(f=>f.onsubmit=async e=>{
  e.preventDefault();const o={};new FormData(f).forEach((v,k)=>o[k]=String(v).trim());
  f.querySelectorAll('input[type=checkbox]').forEach(c=>o[c.name]=c.checked);
  if(f.dataset.t==='links'&&!/^https?:\/\//i.test(o.url)){alert('Links must start with http:// or https://');return}
  const {error}=await sb.from(f.dataset.t).insert(o);if(error){alert(error.message);return}
  f.reset();L[f.dataset.t]();
});

/* ---- contacts ---- */
const acts=(c,reload)=>[
  ...(c.phone?[h('a',{className:'sm',href:tel(c.phone),textContent:'Call'}),h('a',{className:'sm',href:sms(c.phone),textContent:'Text'})]:[]),
  h('button',{className:'sm',textContent:c.starred?'★ Emergency':'☆ Emergency',onclick:async()=>{await sb.from('contacts').update({starred:!c.starred}).eq('id',c.id);reload()}}),
  h('button',{className:'sm',textContent:'Delete',onclick:async()=>{if(await del('contacts',c.id,c.name))reload()}})];
async function contacts(){
  const q=$('#q').value.toLowerCase(),rows=(await sel('contacts','name')).filter(c=>[c.name,c.phone,c.email,c.note].join(' ').toLowerCase().includes(q));
  $('#contacts').replaceChildren(...(rows.length?rows:[null]).map(c=>c?h('li',{},h('span',{className:'av'},c.name[0].toUpperCase()),
    h('div',{className:'who'},h('b',{},c.name),h('small',{},[c.phone,c.email,c.note].filter(Boolean).join(' · '))),h('div',{className:'acts'},...acts(c,contacts))):h('li',{},empty('No contacts yet.'))));
}
$('#q').oninput=contacts;

/* ---- emergency ---- */
async function emergency(){
  const cs=(await sel('contacts','name')).filter(c=>c.starred),ns=(await sel('notes','created_at',false)).filter(n=>n.pinned);
  $('#em-c').replaceChildren(...(cs.length?cs.map(c=>h('div',{className:'card'},h('h4',{},c.name),h('p',{},[c.phone,c.note].filter(Boolean).join(' · ')),...(c.phone?[h('a',{className:'call',href:tel(c.phone),textContent:'Call '+c.name})]:[]))):[empty('Mark contacts as Emergency and they appear here with one-tap call buttons.')]));
  $('#em-n').replaceChildren(...(ns.length?ns.map(n=>h('div',{className:'card'},h('h4',{},n.title),h('p',{},n.body||''))):[empty('Pin a note and it appears here.')]));
}

/* ---- links ---- */
async function links(){
  const rows=await sel('links','created_at',false);
  $('#links').replaceChildren(...(rows.length?rows:[null]).map(l=>l?h('li',{},h('div',{className:'who'},h('a',{href:web(l.url),target:'_blank',rel:'noopener noreferrer',textContent:l.title}),h('small',{},l.url)),
    h('button',{className:'sm',textContent:'Delete',onclick:async()=>{if(await del('links',l.id,l.title))links()}})):h('li',{},empty('No links yet.'))));
}

/* ---- notes ---- */
async function notes(){
  const rows=await sel('notes','created_at',false);
  $('#notes').replaceChildren(...(rows.length?rows:[null]).map(n=>n?h('div',{className:'card'},h('h4',{},n.title),h('p',{},n.body||''),h('div',{className:'acts'},
    h('button',{className:'sm',textContent:n.pinned?'Unpin':'Pin to Emergency',onclick:async()=>{await sb.from('notes').update({pinned:!n.pinned}).eq('id',n.id);notes()}}),
    h('button',{className:'sm',textContent:'Delete',onclick:async()=>{if(await del('notes',n.id,n.title))notes()}}))):empty('No notes yet.')));
}

/* ---- files with previews ---- */
const ext=n=>(n.split('.').pop()||'').toLowerCase();
const kind=(n,m)=>m.startsWith('image/')||['png','jpg','jpeg','gif','webp','svg','avif'].includes(ext(n))?'img':m.startsWith('video/')||['mp4','webm','mov'].includes(ext(n))?'vid':m.startsWith('audio/')||['mp3','wav','ogg','m4a'].includes(ext(n))?'aud':m==='application/pdf'||ext(n)==='pdf'?'pdf':m.startsWith('text/')||['txt','md','json','csv','xml','yml','js','py','html','css'].includes(ext(n))?'txt':'';
async function files(){
  const {data,error}=await sb.storage.from(B).list(uid,{limit:500,sortBy:{column:'created_at',order:'desc'}});
  const fl=(error?[]:data).filter(f=>f.id).map(f=>({path:uid+'/'+f.name,name:f.name.replace(/^\d+-/,''),size:f.metadata&&f.metadata.size,mime:(f.metadata&&f.metadata.mimetype)||''}));
  const g=$('#files');
  if(!fl.length){g.replaceChildren(empty('No files yet.'));return}
  const {data:urls}=await sb.storage.from(B).createSignedUrls(fl.map(f=>f.path),3600);
  fl.forEach((f,i)=>f.url=urls&&urls[i]&&urls[i].signedUrl);
  g.replaceChildren(...fl.map(f=>{const k=kind(f.name,f.mime),t=h('div',{className:'thumb'});
    if(f.url&&k==='img')t.append(h('img',{src:f.url,alt:'',loading:'lazy'}));else if(f.url&&k==='vid')t.append(h('video',{src:f.url+'#t=0.1',muted:true,preload:'metadata'}));else t.append(h('span',{className:'badge'},ext(f.name).slice(0,4)||'file'));
    return h('button',{className:'file',onclick:()=>view(f,k)},t,h('span',{},f.name))}));
}
async function view(f,k){
  const b=$('#vbody');b.replaceChildren();
  if(k==='img')b.append(h('img',{src:f.url,alt:f.name}));else if(k==='vid')b.append(h('video',{src:f.url,controls:true}));else if(k==='aud')b.append(h('audio',{src:f.url,controls:true}));else if(k==='pdf')b.append(h('iframe',{src:f.url,title:f.name}));
  else if(k==='txt'){try{b.append(h('pre',{},(await (await fetch(f.url)).text()).slice(0,50000)))}catch(e){b.append(empty('No preview.'))}}else b.append(empty('No preview for this file type.'));
  $('#vname').textContent=f.name+'  ·  '+fmt(f.size);
  $('#vacts').replaceChildren(
    h('a',{className:'sm',href:f.url,target:'_blank',rel:'noopener',textContent:'Open'}),
    h('button',{className:'sm',textContent:'Download',onclick:async()=>{const {data}=await sb.storage.from(B).createSignedUrl(f.path,60,{download:f.name});data&&(location.href=data.signedUrl)}}),
    h('button',{className:'sm',textContent:'Delete',onclick:async()=>{if(confirm('Delete '+f.name+'?')){await sb.storage.from(B).remove([f.path]);close();files()}}}),
    h('button',{className:'sm',textContent:'Close',onclick:close}));
  $('#viewer').hidden=false;
}
const close=()=>{$('#viewer').hidden=true;$('#vbody').replaceChildren()};
$('#viewer').addEventListener('click',e=>{if(e.target.id==='viewer')close()});addEventListener('keydown',e=>{if(e.key==='Escape')close()});
async function upload(list){
  for(const f of list){const {error}=await sb.storage.from(B).upload(uid+'/'+Date.now()+'-'+f.name.replace(/[^\w.\-]+/g,'_'),f);if(error)alert('Could not upload '+f.name+': '+error.message)}
  files();
}
$('#file-in').onchange=e=>{upload(e.target.files);e.target.value=''};
const dz=$('#drop');['dragenter','dragover'].forEach(v=>dz.addEventListener(v,e=>{e.preventDefault();dz.classList.add('over')}));['dragleave','drop'].forEach(v=>dz.addEventListener(v,e=>{e.preventDefault();dz.classList.remove('over')}));
dz.addEventListener('drop',e=>upload(e.dataTransfer.files));

/* ---- portfolio editor (owner only; enforced by the database) ---- */
const PB='portfolio',pff=()=>$('#pf-form').elements;
function fillPf(p){const f=pff();f.id.value=p.id;f.title.value=p.title;f.url.value=p.url||'';f.tags.value=p.tags||'';f.sort_order.value=p.sort_order;f.summary.value=p.summary||'';f.published.checked=p.published;$('#pf-form').scrollIntoView({behavior:'smooth'})}
async function portfolio(){
  const rows=await sel('portfolio','sort_order'),prof=rows.find(r=>r.kind==='profile'),pe=$('#pf-profile').elements;
  pe.title.value=prof?prof.title:'';pe.summary.value=prof&&prof.summary||'';
  const ps=rows.filter(r=>r.kind==='project');
  $('#pf-list').replaceChildren(...(ps.length?ps.map(p=>h('div',{className:'card'},...(p.image?[h('img',{className:'pfimg',src:web(p.image),alt:''})]:[]),h('h4',{},p.title),h('p',{},[p.tags,p.published?'Published':'Hidden'].filter(Boolean).join(' · ')),
    h('div',{className:'acts'},h('button',{className:'sm',textContent:'Edit',onclick:()=>fillPf(p)}),h('button',{className:'sm',textContent:p.published?'Hide':'Publish',onclick:async()=>{await sb.from('portfolio').update({published:!p.published}).eq('id',p.id);portfolio()}}),h('button',{className:'sm',textContent:'Delete',onclick:async()=>{if(await del('portfolio',p.id,p.title))portfolio()}})))):[empty('No projects yet.')]));
}
$('#pf-profile').onsubmit=async e=>{
  e.preventDefault();const f=e.target.elements,o={kind:'profile',title:f.title.value.trim()||'Portfolio',summary:f.summary.value.trim(),published:true};
  const {data:ex}=await sb.from('portfolio').select('id').eq('kind','profile').limit(1);
  const {error}=ex&&ex[0]?await sb.from('portfolio').update(o).eq('id',ex[0].id):await sb.from('portfolio').insert(o);
  alert(error?error.message:'Profile saved.');
};
$('#pf-clear').onclick=()=>{$('#pf-form').reset();pff().id.value=''};
$('#pf-form').onsubmit=async e=>{
  e.preventDefault();const f=pff(),o={kind:'project',title:f.title.value.trim(),summary:f.summary.value.trim(),url:f.url.value.trim(),tags:f.tags.value.trim(),sort_order:parseInt(f.sort_order.value)||0,published:f.published.checked};
  if(o.url&&!/^https?:\/\//i.test(o.url)){alert('Links must start with http:// or https://');return}
  const file=f.img.files[0];
  if(file){if(file.size>5e6){alert('Image must be under 5 MB.');return}
    const path=uid+'/'+Date.now()+'-'+file.name.replace(/[^\w.\-]+/g,'_'),{error:ue}=await sb.storage.from(PB).upload(path,file);
    if(ue){alert(ue.message);return}o.image=sb.storage.from(PB).getPublicUrl(path).data.publicUrl}
  const id=f.id.value,{error}=id?await sb.from('portfolio').update(o).eq('id',id):await sb.from('portfolio').insert(o);
  if(error){alert(error.message);return}
  $('#pf-form').reset();f.id.value='';portfolio();
};
})();
