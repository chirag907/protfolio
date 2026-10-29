(()=>{
const D={accent:'#8fb1ff',bg:'#0e1013'},ok=h=>/^#[0-9a-f]{6}$/i.test(h||'');
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),hex=a=>'#'+a.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
const mix=(a,b,t)=>{const x=rgb(a),y=rgb(b);return hex(x.map((v,i)=>v+(y[i]-v)*t))};
const T=window.Theme={D,rgb,hex,mix,cur:{...D},
  apply(t){t=t||{};const sm=['tunnel','all','off'].includes(t.smoke)?t.smoke:'tunnel';const a=ok(t.accent)?t.accent:D.accent,b=ok(t.bg)?t.bg:D.bg,s=document.documentElement.style;
    s.setProperty('--hot',a);s.setProperty('--hot-rgb',rgb(a).join(' '));s.setProperty('--bg',b);s.setProperty('--bg2',mix(b,a,.14));
    T.cur={accent:a,bg:b,smoke:sm};try{localStorage.setItem('theme',JSON.stringify(T.cur))}catch(e){}dispatchEvent(new Event('themechange'))}};
try{const c=JSON.parse(localStorage.getItem('theme')||'null');if(c)T.apply(c)}catch(e){}
addEventListener('DOMContentLoaded',async()=>{const c=window.CONFIG||{};if(!c.SUPABASE_URL||!window.supabase)return;
  try{const sb=supabase.createClient(c.SUPABASE_URL,c.SUPABASE_ANON_KEY),{data}=await sb.from('site_text').select('key,value').in('key',['theme_accent','theme_bg','theme_smoke','music_url']);
    const m=Object.fromEntries((data||[]).map(r=>[r.key,r.value]));T.apply({accent:m.theme_accent,bg:m.theme_bg,smoke:m.theme_smoke});window.MUSIC_URL=m.music_url||null;window.Sfx&&Sfx.setSource&&Sfx.setSource(window.MUSIC_URL)}catch(e){}});
})();
