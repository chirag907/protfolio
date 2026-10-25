(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],cfg=window.CONFIG||{},B='files',PBK='pinboard',DEF='Chirag Lakhera',TR=['contacts','links','notes'];
const h=(t,p={},...k)=>{const e=Object.assign(document.createElement(t),p);e.append(...k);return e};
const sb=cfg.SUPABASE_URL&&cfg.SUPABASE_ANON_KEY&&window.supabase?supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY):null;
const am=$('#auth-msg'),home=location.href.split('#')[0];let uid,user,mode='in',admin=false;
const fmt=n=>n>1048576?(n/1048576).toFixed(1)+' MB':Math.max(1,Math.round((n||0)/1024))+' KB';
const num=p=>(p||'').replace(/[^\d+*#]/g,''),web=u=>/^https?:\/\//i.test(u||'')?u:'#',empty=t=>h('p',{className:'empty'},t),btn=(t,f)=>h('button',{className:'sm',type:'button',textContent:t,onclick:f});
$('#year').textContent=new Date().getFullYear();

/* ---- auth ---- */
if(!sb){am.textContent='Not connected yet. Fill in config.js (see DEPLOY.md).';$('#auth-btn').disabled=true}
else{
  sb.auth.getSession().then(({data})=>data.session&&start(data.session.user));
  sb.auth.onAuthStateChange(async ev=>{if(ev==='PASSWORD_RECOVERY'){const p=prompt('Choose a new password (10+ characters)');if(p&&p.length>=10){const {error}=await sb.auth.updateUser({password:p});alert(error?error.message:'Password updated.')}}});
}
$('#swap').onclick=()=>{mode=mode==='in'?'up':'in';const up=mode==='up';$('#auth-btn').textContent=up?'Create account':'Sign in';$('#swap').textContent=up?'I already have an account':'Create an account';$('#pass').autocomplete=up?'new-password':'current-password';$('#name-in').hidden=!up;$('#auth-note').hidden=!up};
$('#reset').onclick=async()=>{const e=$('#email').value.trim();if(!e||!sb){am.textContent='Enter your email first.';return}await sb.auth.resetPasswordForEmail(e,{redirectTo:home});am.textContent='If that account exists, a reset link has been emailed.'};
$('#auth-form').onsubmit=async e=>{
  e.preventDefault();if(!sb)return;am.textContent='';const c={email:$('#email').value.trim(),password:$('#pass').value};
  const {data,error}=mode==='in'?await sb.auth.signInWithPassword(c):await sb.auth.signUp({...c,options:{emailRedirectTo:home,data:{display_name:$('#name-in').value.trim()}}});
  $('#pass').value='';if(error){am.textContent=error.message;return}
  if(data.session)start(data.user);else am.textContent='Check your email to confirm your account, then sign in.';
};
$('#out').onclick=async()=>{try{await sb.auth.signOut({scope:'local'})}catch(e){}try{Object.keys(localStorage).filter(k=>k.startsWith('sb-')).forEach(k=>localStorage.removeItem(k))}catch(e){}location.reload()};
const myName=()=>((user.user_metadata||{}).display_name||'').trim()||DEF;
function applyName(){$('#who').textContent=myName();$('#logo').textContent=myName()}
async function start(u){user=u;uid=u.id;$('#auth').hidden=true;$('#app').hidden=false;applyName();const {data}=await sb.rpc('is_admin');admin=data===true;$$('.adm').forEach(b=>b.hidden=!admin);show('home')}

/* ---- navigation ---- */
const L={};
function show(s){$$('main section').forEach(x=>x.hidden=x.dataset.s!==s);$$('.nav [data-s]').forEach(b=>b.classList.toggle('on',b.dataset.s===s));L[s]&&L[s]()}
$$('.nav [data-s]').forEach(b=>b.onclick=()=>show(b.dataset.s));
async function sel(t,o,asc=true){let q=sb.from(t).select('*').order(o,{ascending:asc});if(TR.includes(t))q=q.is('deleted_at',null);const {data,error}=await q;return error?[]:data}
const toBin=(t,id)=>sb.from(t).update({deleted_at:new Date().toISOString()}).eq('id',id);
async function pinTo(table,o,pub,quiet){
  if(pub&&!quiet&&!confirm('This will be visible to everyone on your public Pinboard. Continue?'))return;
  const w={link:[260,150],note:[260,190],image:[320,240],video:[400,260],yt:[400,260],file:[260,130]}[o.kind];
  const {error}=await sb.from(table).insert({x:Math.round(60+Math.random()*420),y:Math.round(60+Math.random()*260),w:w[0],h:w[1],...o});
  if(!quiet)alert(error?error.message:'Pinned. Open the '+(pub?'Public pinboard':'Board')+' tab to arrange it.');else if(error)alert(error.message);
}
const pinBoard=(o,pub)=>pinTo('pinboard',o,pub);

/* ---- generic add / edit forms ---- */
function fill(sel,row){const f=$(sel);[...f.elements].forEach(el=>{if(!el.name||!(el.name in row))return;if(el.type==='checkbox')el.checked=!!row[el.name];else el.value=row[el.name]??''});f.scrollIntoView({behavior:'smooth',block:'center'})}
const clear=f=>{f.reset();if(f.elements.id)f.elements.id.value=''};
$$('[data-clear]').forEach(b=>b.onclick=()=>clear(b.closest('form')));
$$('form[data-t]').forEach(f=>f.onsubmit=async e=>{
  e.preventDefault();const o={};new FormData(f).forEach((v,k)=>o[k]=String(v).trim());f.querySelectorAll('input[type=checkbox]').forEach(c=>o[c.name]=c.checked);
  const id=o.id,t=f.dataset.t;delete o.id;
  if(t==='links'&&!/^https?:\/\//i.test(o.url)){alert('Links must start with http:// or https://');return}
  const {error}=id?await sb.from(t).update(o).eq('id',id):await sb.from(t).insert(o);if(error){alert(error.message);return}
  clear(f);L[t]();
});

/* ---- contacts, links, notes ---- */
L.contacts=async()=>{
  const q=$('#q').value.toLowerCase(),rows=(await sel('contacts','name')).filter(c=>[c.name,c.phone,c.email,c.note].join(' ').toLowerCase().includes(q));
  $('#contacts').replaceChildren(...(rows.length?rows:[null]).map(c=>c?h('li',{},h('span',{className:'av'},c.name[0].toUpperCase()),h('div',{className:'who'},h('b',{},c.name),h('small',{},[c.phone,c.email,c.note].filter(Boolean).join(' · '))),
    h('div',{className:'acts'},...(c.phone?[h('a',{className:'sm',href:'tel:'+num(c.phone),textContent:'Call'}),h('a',{className:'sm',href:'sms:'+num(c.phone),textContent:'Text'})]:[]),btn('Edit',()=>fill('#f-contacts',c)),
      btn(c.starred?'★ Emergency':'☆ Emergency',async()=>{await sb.from('contacts').update({starred:!c.starred}).eq('id',c.id);L.contacts()}),btn('Bin',async()=>{await toBin('contacts',c.id);L.contacts()}))):h('li',{},empty('No contacts yet.'))));
};
$('#q').oninput=()=>L.contacts();
L.links=async()=>{
  const rows=await sel('links','created_at',false);
  $('#links').replaceChildren(...(rows.length?rows:[null]).map(l=>l?h('li',{},h('div',{className:'who'},h('a',{href:web(l.url),target:'_blank',rel:'noopener noreferrer',textContent:l.title}),h('small',{},l.url)),
    h('div',{className:'acts'},btn('Edit',()=>fill('#f-links',l)),btn('To my board',()=>pinTo('my_board',{kind:'link',title:l.title,url:l.url})),...(admin?[btn('Pin to public board',()=>pinBoard({kind:'link',title:l.title,url:l.url},true))]:[]),btn('Bin',async()=>{await toBin('links',l.id);L.links()}))):h('li',{},empty('No links yet.'))));
};
L.notes=async()=>{
  const rows=await sel('notes','created_at',false);
  $('#notes').replaceChildren(...(rows.length?rows:[null]).map(n=>n?h('div',{className:'card'},h('h4',{},n.title),h('p',{},n.body||''),h('div',{className:'acts'},btn('Edit',()=>fill('#f-notes',n)),btn('To my board',()=>pinTo('my_board',{kind:'note',title:n.title,body:n.body||''})),
    btn(n.pinned?'Unpin':'Pin',async()=>{await sb.from('notes').update({pinned:!n.pinned}).eq('id',n.id);L.notes()}),...(admin?[btn('Pin to public board',()=>pinBoard({kind:'note',title:n.title,body:n.body||''},true))]:[]),btn('Bin',async()=>{await toBin('notes',n.id);L.notes()}))):empty('No notes yet.')));
};

/* ---- files (thumbnails only; details appear when opened) ---- */
const ext=n=>(n.split('.').pop()||'').toLowerCase();
const kind=(n,m)=>m.startsWith('image/')||['png','jpg','jpeg','gif','webp','svg','avif'].includes(ext(n))?'img':m.startsWith('video/')||['mp4','webm','mov'].includes(ext(n))?'vid':m.startsWith('audio/')||['mp3','wav','ogg','m4a'].includes(ext(n))?'aud':m==='application/pdf'||ext(n)==='pdf'?'pdf':m.startsWith('text/')||['txt','md','json','csv','xml','yml','js','py','html','css'].includes(ext(n))?'txt':'';
async function loadFiles(){
  const {data,error}=await sb.storage.from(B).list(uid,{limit:500,sortBy:{column:'created_at',order:'desc'}});
  const fl=(error?[]:data).filter(f=>f.id).map(f=>({path:uid+'/'+f.name,raw:f.name,name:f.name.replace(/^\d+-/,''),size:f.metadata&&f.metadata.size,mime:(f.metadata&&f.metadata.mimetype)||''}));
  if(!fl.length)return fl;
  const [{data:urls},pins]=await Promise.all([sb.storage.from(B).createSignedUrls(fl.map(f=>f.path),3600),sel('file_pins','path')]),ps=new Set(pins.map(p=>p.path));
  fl.forEach((f,i)=>{f.url=urls&&urls[i]&&urls[i].signedUrl;f.pinned=ps.has(f.path);f.k=kind(f.name,f.mime)});return fl;
}
const tile=f=>{const t=h('span',{style:'display:contents'});
  if(f.url&&f.k==='img')t.append(h('img',{src:f.url,alt:'',loading:'lazy'}));else if(f.url&&f.k==='vid')t.append(h('video',{src:f.url+'#t=0.1',muted:true,preload:'metadata'}));else t.append(h('span',{className:'badge'},ext(f.name).slice(0,4)||'file'));
  return h('button',{className:'file',type:'button','aria-label':'Open file',onclick:()=>view(f)},t,...(f.pinned?[h('span',{className:'pinmark'},'★')]:[]))};
L.files=async()=>{const fl=await loadFiles();$('#files').replaceChildren(...(fl.length?fl.map(tile):[empty('No files yet.')]))};
async function view(f){
  const b=$('#vbody');b.replaceChildren();
  if(f.k==='img')b.append(h('img',{src:f.url,alt:f.name}));else if(f.k==='vid')b.append(h('video',{src:f.url,controls:true}));else if(f.k==='aud')b.append(h('audio',{src:f.url,controls:true}));else if(f.k==='pdf')b.append(h('iframe',{src:f.url,title:f.name}));
  else if(f.k==='txt'){try{b.append(h('pre',{},(await (await fetch(f.url)).text()).slice(0,50000)))}catch(e){b.append(empty('No preview.'))}}else b.append(empty('No preview for this file type.'));
  $('#vname').textContent=f.name;$('#vmeta').textContent=[fmt(f.size),f.mime||ext(f.name).toUpperCase()].filter(Boolean).join(' · ');
  $('#vacts').replaceChildren(
    btn(f.pinned?'Unpin':'Pin',async()=>{f.pinned?await sb.from('file_pins').delete().eq('path',f.path):await sb.from('file_pins').insert({path:f.path});close();show($$('main section').find(s=>!s.hidden).dataset.s)}),
    h('a',{className:'sm',href:f.url,target:'_blank',rel:'noopener',textContent:'Open'}),
    btn('Download',async()=>{const {data}=await sb.storage.from(B).createSignedUrl(f.path,60,{download:f.name});data&&(location.href=data.signedUrl)}),
    btn('To my board',()=>pinTo('my_board',{kind:f.k==='img'?'image':f.k==='vid'?'video':'file',title:f.name,media:f.path})),...(admin?[btn('Pin to public board',()=>pinFile(f))]:[]),
    btn('Bin',async()=>{await sb.storage.from(B).move(f.path,uid+'/_trash/'+f.raw);await sb.from('file_pins').delete().eq('path',f.path);close();show($$('main section').find(s=>!s.hidden).dataset.s)}),
    btn('Close',close));
  $('#viewer').hidden=false;
}
const close=()=>{$('#viewer').hidden=true;$('#vbody').replaceChildren()};
$('#viewer').addEventListener('click',e=>{if(e.target.id==='viewer')close()});addEventListener('keydown',e=>{if(e.key==='Escape')close()});
async function pinFile(f){
  if(!confirm('This makes a public copy of the file on your Pinboard, visible to everyone. Continue?'))return;
  const dest=uid+'/'+Date.now()+'-'+f.raw,{error}=await sb.storage.from(B).copy(f.path,dest,{destinationBucket:PBK});if(error){alert(error.message);return}
  const url=sb.storage.from(PBK).getPublicUrl(dest).data.publicUrl;pinBoard({kind:f.k==='img'?'image':f.k==='vid'?'video':'file',title:f.name,media:url});
}
async function upload(list){for(const f of list){const {error}=await sb.storage.from(B).upload(uid+'/'+Date.now()+'-'+f.name.replace(/[^\w.\-]+/g,'_'),f);if(error)alert('Could not upload '+f.name+': '+error.message)}L.files()}
$('#file-in').onchange=e=>{upload(e.target.files);e.target.value=''};
const dz=$('#drop');['dragenter','dragover'].forEach(v=>dz.addEventListener(v,e=>{e.preventDefault();dz.classList.add('over')}));['dragleave','drop'].forEach(v=>dz.addEventListener(v,e=>{e.preventDefault();dz.classList.remove('over')}));dz.addEventListener('drop',e=>upload(e.dataTransfer.files));

/* ---- workspace home ---- */
L.home=async()=>{
  const [cs,ns,fl]=await Promise.all([sel('contacts','name'),sel('notes','created_at',false),loadFiles()]);
  const s=cs.filter(c=>c.starred),n=ns.filter(x=>x.pinned),f=fl.filter(x=>x.pinned);
  $('#h-c').replaceChildren(...(s.length?s.map(c=>h('div',{className:'card'},h('h4',{},c.name),h('p',{},[c.phone,c.note].filter(Boolean).join(' · ')),...(c.phone?[h('a',{className:'call',href:'tel:'+num(c.phone),textContent:'Call '+c.name})]:[]))):[empty('Mark contacts as emergency contacts and they appear here with one-tap call buttons.')]));
  $('#h-n').replaceChildren(...(n.length?n.map(x=>h('div',{className:'card'},h('h4',{},x.title),h('p',{},x.body||''))):[empty('Pin a note and it appears here.')]));
  $('#h-f').replaceChildren(...(f.length?f.map(tile):[empty('Open a file and press Pin to keep it here.')]));
};

/* ---- bin ---- */
const row=(label,meta,restore,gone)=>h('div',{className:'row'},h('span',{},label,h('br'),h('small',{},meta)),btn('Restore',restore),btn('Delete forever',()=>{if(confirm('Delete "'+label+'" forever? This cannot be undone.'))gone()}));
L.bin=async()=>{
  const box=$('#bin');box.replaceChildren();let n=0;
  for(const t of TR){const {data}=await sb.from(t).select('*').not('deleted_at','is',null).order('deleted_at',{ascending:false});
    (data||[]).forEach(r=>{n++;box.append(row(r.name||r.title,t.slice(0,-1),async()=>{await sb.from(t).update({deleted_at:null}).eq('id',r.id);L.bin()},async()=>{await sb.from(t).delete().eq('id',r.id);L.bin()}))})}
  const {data:fs}=await sb.storage.from(B).list(uid+'/_trash',{limit:500});
  (fs||[]).filter(f=>f.id).forEach(f=>{n++;const p=uid+'/_trash/'+f.name,nm=f.name.replace(/^\d+-/,'');box.append(row(nm,'file',async()=>{await sb.storage.from(B).move(p,uid+'/'+f.name);L.bin()},async()=>{await sb.storage.from(B).remove([p]);L.bin()}))});
  if(!n)box.append(empty('The bin is empty.'));
};
$('#empty').onclick=async()=>{if(!confirm('Delete everything in the bin forever?'))return;
  for(const t of TR)await sb.from(t).delete().not('deleted_at','is',null);
  const {data:fs}=await sb.storage.from(B).list(uid+'/_trash',{limit:500});const ps=(fs||[]).filter(f=>f.id).map(f=>uid+'/_trash/'+f.name);if(ps.length)await sb.storage.from(B).remove(ps);L.bin()};

/* ---- settings ---- */
L.settings=()=>{$('#nm-form').elements.name.value=(user.user_metadata||{}).display_name||''};
$('#nm-form').onsubmit=async e=>{e.preventDefault();const {data,error}=await sb.auth.updateUser({data:{display_name:e.target.elements.name.value.trim()}});if(error){alert(error.message);return}user=data.user;applyName();alert('Saved.')};

/* ---- admin: portfolio ---- */
const pff=()=>$('#pf-form').elements;
L.portfolio=async()=>{
  const rows=await sel('portfolio','sort_order'),prof=rows.find(r=>r.kind==='profile'),pe=$('#pf-profile').elements;pe.title.value=prof?prof.title:'';pe.summary.value=prof&&prof.summary||'';
  const ps=rows.filter(r=>r.kind==='project');
  $('#pf-list').replaceChildren(...(ps.length?ps.map(p=>h('div',{className:'card'},...(p.image?[h('img',{className:'pfimg',src:web(p.image),alt:''})]:[]),h('h4',{},p.title),h('p',{},[p.tags,p.published?'Published':'Hidden'].filter(Boolean).join(' · ')),
    h('div',{className:'acts'},btn('Edit',()=>{const f=pff();f.id.value=p.id;f.title.value=p.title;f.url.value=p.url||'';f.tags.value=p.tags||'';f.sort_order.value=p.sort_order;f.summary.value=p.summary||'';f.published.checked=p.published;$('#pf-form').scrollIntoView({behavior:'smooth'})}),
      btn(p.published?'Hide':'Publish',async()=>{await sb.from('portfolio').update({published:!p.published}).eq('id',p.id);L.portfolio()}),btn('Delete',async()=>{if(confirm('Delete "'+p.title+'" permanently?')){await sb.from('portfolio').delete().eq('id',p.id);L.portfolio()}})))):[empty('No projects yet.')]));
};
$('#pf-profile').onsubmit=async e=>{e.preventDefault();const f=e.target.elements,o={kind:'profile',title:f.title.value.trim()||'Portfolio',summary:f.summary.value.trim(),published:true};
  const {data:ex}=await sb.from('portfolio').select('id').eq('kind','profile').limit(1),{error}=ex&&ex[0]?await sb.from('portfolio').update(o).eq('id',ex[0].id):await sb.from('portfolio').insert(o);alert(error?error.message:'Profile saved.')};
$('#pf-clear').onclick=()=>clear($('#pf-form'));
$('#pf-form').onsubmit=async e=>{e.preventDefault();const f=pff(),o={kind:'project',title:f.title.value.trim(),summary:f.summary.value.trim(),url:f.url.value.trim(),tags:f.tags.value.trim(),sort_order:parseInt(f.sort_order.value)||0,published:f.published.checked};
  if(o.url&&!/^https?:\/\//i.test(o.url)){alert('Links must start with http:// or https://');return}
  const file=f.img.files[0];if(file){if(file.size>5e6){alert('Image must be under 5 MB.');return}const path=uid+'/'+Date.now()+'-'+file.name.replace(/[^\w.\-]+/g,'_'),{error:ue}=await sb.storage.from('portfolio').upload(path,file);if(ue){alert(ue.message);return}o.image=sb.storage.from('portfolio').getPublicUrl(path).data.publicUrl}
  const id=f.id.value,{error}=id?await sb.from('portfolio').update(o).eq('id',id):await sb.from('portfolio').insert(o);if(error){alert(error.message);return}clear($('#pf-form'));L.portfolio()};

/* ---- boards: public pinboard (owner) and private board (everyone) ---- */
const BASE={YouTube:'https://www.youtube.com',Netflix:'https://www.netflix.com','Prime Video':'https://www.primevideo.com',Spotify:'https://open.spotify.com',Instagram:'https://www.instagram.com',GitHub:'https://github.com',LinkedIn:'https://www.linkedin.com',X:'https://x.com'},eds={};
function editor(root,{table,pub}){
  let bd=null,cur=null;const bucket=pub?PBK:B,say=h('span',{},'Select an item to edit it.');
  const inp=(name,ph,type,req)=>h('input',{name,placeholder:ph,type:type||'text',required:!!req});
  const mk=(fields,label,fn)=>{const f=h('form',{className:'form'},...fields,h('button',{className:'pri',type:'submit'},label));f.onsubmit=async e=>{e.preventDefault();await fn(f.elements);f.reset();load()};return f};
  const preset=h('select',{name:'preset'},...['Custom',...Object.keys(BASE)].map(o=>h('option',{textContent:o})));
  const add=o=>pinTo(table,o,pub,true);
  const fLink=mk([preset,inp('title','Title'),inp('url','https://…','url',1)],'Add link or app',f=>{if(!/^https?:\/\//i.test(f.url.value))return alert('Links must start with http:// or https://');return add({kind:'link',title:f.title.value.trim()||f.preset.value,url:f.url.value.trim()})});
  preset.onchange=()=>{const f=fLink.elements;if(preset.value!=='Custom'){f.title.value=preset.value;f.url.value=BASE[preset.value]}};
  const fYt=mk([inp('url','YouTube video link','url',1)],'Add YouTube video',f=>Board.embed(f.url.value)?add({kind:'yt',title:'Video',url:f.url.value.trim()}):alert('Please paste a YouTube video link.'));
  const fUp=mk([h('label',{className:'fl'},'Upload an image or your own video ',h('input',{type:'file',name:'f',accept:'image/*,video/*',required:true}))],'Upload and pin',async f=>{
    const file=f.f.files[0];if(!file)return;if(file.size>5e7)return alert('File must be under 50 MB.');
    const path=uid+(pub?'/':'/board/')+Date.now()+'-'+file.name.replace(/[^\w.\-]+/g,'_'),{error}=await sb.storage.from(bucket).upload(path,file);if(error)return alert(error.message);
    await add({kind:file.type.startsWith('video/')?'video':'image',title:file.name,media:pub?sb.storage.from(PBK).getPublicUrl(path).data.publicUrl:path})});
  const fNote=mk([inp('title','Note title','text',1),h('textarea',{name:'body',rows:2,placeholder:'Text'})],'Add note',f=>add({kind:'note',title:f.title.value.trim(),body:f.body.value.trim()}));
  const box=h('div',{className:'boardbox'});
  root.replaceChildren(fLink,fYt,fUp,fNote,h('div',{className:'bar2'},say,btn('Bring to front',async()=>{if(!cur)return;const rows=await sel(table,'z',false);await sb.from(table).update({z:((rows[0]||{}).z||0)+1}).eq('id',cur);load()}),btn('Remove',async()=>{if(!cur||!confirm('Remove this item from the board?'))return;await sb.from(table).delete().eq('id',cur);cur=null;load()})),box);
  bd=Board.mount(box,{edit:true,onSelect:id=>{cur=id;const it=id&&bd.get(id);say.textContent=it?'Selected: '+(it.title||it.kind):'Select an item to edit it.'},onSave:(id,p)=>sb.from(table).update(p).eq('id',id)});
  async function load(){
    const rows=await sel(table,'z');
    if(!pub){const ps=rows.filter(r=>r.media&&!/^https?:/i.test(r.media));if(ps.length){const {data}=await sb.storage.from(B).createSignedUrls(ps.map(r=>r.media),3600);ps.forEach((r,i)=>{r.media=data&&data[i]&&data[i].signedUrl||''})}}
    bd.set(rows);
  }
  return {load};
}
L.pinboard=()=>(eds.pb=eds.pb||editor($('#pb-root'),{table:'pinboard',pub:true})).load();
L.board=()=>(eds.mb=eds.mb||editor($('#mb-root'),{table:'my_board',pub:false})).load();

/* ---- admin: site content (hero, showcase slots, statement, links) ---- */
L.texts=async()=>{
  const m=Object.fromEntries((await sel('site_text','key')).map(r=>[r.key,r.value])),els=[];let last='';
  (window.SITE_TEXT||[]).forEach(([k,label,def,g])=>{if(g!==last){els.push(h('h3',{},g));last=g}const long=def.length>70,el=h(long?'textarea':'input',{name:k,value:m[k]||def});if(long)el.rows=3;els.push(h('label',{},label,el))});
  $('#tx-form').replaceChildren(...els,h('button',{className:'pri',type:'submit'},'Save changes'));
};
$('#tx-form').onsubmit=async e=>{e.preventDefault();const ups=[],dels=[];(window.SITE_TEXT||[]).forEach(([k,,def])=>{const v=e.target.elements[k].value.trim();v&&v!==def?ups.push({key:k,value:v,updated_at:new Date().toISOString()}):dels.push(k)});
  if(ups.length){const {error}=await sb.from('site_text').upsert(ups);if(error){alert(error.message);return}}
  if(dels.length)await sb.from('site_text').delete().in('key',dels);alert('Saved. Reload the homepage to see it.')};

/* ---- admin: look (accent + background colours) and site music ---- */
const PA=[['Ice','#8fb1ff'],['Ember','#ff8a5c'],['Mint','#6fe3b5'],['Violet','#b49bff'],['Rose','#ff7fa8'],['Gold','#e6c068']],PB=[['Graphite','#0e1013'],['Midnight','#0a1020'],['Forest','#0b1411'],['Plum','#130b17'],['Ink','#08090c']];
const lum=c=>{const [r,g,b]=Theme.rgb(c);return(.299*r+.587*g+.114*b)/255};
const prev=()=>{const f=$('#th-form').elements;Theme.apply({accent:f.accent.value,bg:f.bg.value})};
L.look=async()=>{
  const m=Object.fromEntries((await sel('site_text','key')).map(r=>[r.key,r.value])),f=$('#th-form').elements;
  f.accent.value=m.theme_accent||Theme.D.accent;f.bg.value=m.theme_bg||Theme.D.bg;
  $('#th-pre').replaceChildren(h('span',{className:'empty'},'Accent:'),...PA.map(([n,c])=>btn(n,()=>{f.accent.value=c;prev()})),h('br'),h('span',{className:'empty'},'Background:'),...PB.map(([n,c])=>btn(n,()=>{f.bg.value=c;prev()})));
  $('#mu-now').textContent=m.music_url?'Your custom music is playing on the site.':'The default ambient music is playing on the site.';
};
$('#th-form').oninput=prev;
$('#th-form').onsubmit=async e=>{e.preventDefault();const f=e.target.elements;if(lum(f.bg.value)>.35){alert('Please choose a darker background so the text stays readable.');return}
  const {error}=await sb.from('site_text').upsert([{key:'theme_accent',value:f.accent.value},{key:'theme_bg',value:f.bg.value}]);alert(error?error.message:'Colours saved for everyone.')};
$('#th-reset').onclick=async()=>{await sb.from('site_text').delete().in('key',['theme_accent','theme_bg']);Theme.apply({});L.look()};
$('#mu-form').onsubmit=async e=>{e.preventDefault();const file=e.target.elements.f.files[0];if(!file)return;if(file.size>2e7){alert('Music must be under 20 MB.');return}
  const path='music/'+Date.now()+'-'+file.name.replace(/[^\w.\-]+/g,'_'),{error}=await sb.storage.from(PBK).upload(path,file);if(error){alert(error.message);return}
  const url=sb.storage.from(PBK).getPublicUrl(path).data.publicUrl,{error:e2}=await sb.from('site_text').upsert({key:'music_url',value:url});if(e2){alert(e2.message);return}
  window.Sfx&&Sfx.setSource(url);e.target.reset();L.look()};
$('#mu-reset').onclick=async()=>{await sb.from('site_text').delete().eq('key','music_url');window.Sfx&&Sfx.setSource(null);L.look()};

/* ---- admin: users (no passwords exist or are shown) ---- */
L.users=async()=>{
  const {data,error}=await sb.rpc('admin_list_users'),ul=$('#us-list');if(error){ul.replaceChildren(h('li',{},empty(error.message)));return}
  const d=x=>x?new Date(x).toLocaleDateString():'never';
  ul.replaceChildren(...data.map(u=>h('li',{},h('span',{className:'av'},(u.name||u.email||'?')[0].toUpperCase()),h('div',{className:'who'},h('b',{},u.name||'(no name)'),h('small',{},u.email+' · joined '+d(u.created_at)+' · last sign-in '+d(u.last_sign_in_at))),
    btn('Send password reset',async()=>{const {error}=await sb.auth.resetPasswordForEmail(u.email,{redirectTo:home});alert(error?error.message:'Reset email sent.')}))));
};
})();
