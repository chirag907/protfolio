(()=>{
let ctx,master,fxg,mg,padG,music=false,custom=null,lastH=0;
const get=k=>{try{return localStorage.getItem(k)}catch(e){return null}},put=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const pref=()=>{const v=get('mus');return v==='1'||(v===null&&document.body.dataset.snd==='on')};
function init(){
  if(ctx)return true;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;ctx=new AC();
  master=ctx.createGain();master.connect(ctx.destination);fxg=ctx.createGain();fxg.connect(master);mg=ctx.createGain();mg.gain.value=0;mg.connect(master);padG=ctx.createGain();padG.connect(mg);
  const d=ctx.createDelay(1);d.delayTime.value=.37;const fb=ctx.createGain();fb.gain.value=.45;d.connect(fb);fb.connect(d);
  const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=900;lp.connect(padG);lp.connect(d);d.connect(padG);
  [110,164.81,220,329.63].forEach((f,i)=>{const o=ctx.createOscillator(),g=ctx.createGain(),l=ctx.createOscillator(),lg=ctx.createGain();
    o.type=i%2?'sine':'triangle';o.frequency.value=f;o.detune.value=(i-1.5)*7;g.gain.value=.045;l.frequency.value=.04+i*.025;lg.gain.value=.025;l.connect(lg);lg.connect(g.gain);o.connect(g);g.connect(lp);o.start();l.start()});
  if(window.MUSIC_URL)load(window.MUSIC_URL);if(music)mg.gain.setTargetAtTime(.7,ctx.currentTime,.6);return true;
}
function load(url){
  if(custom){custom.pause();custom=null}
  if(!url){padG.gain.setTargetAtTime(1,ctx.currentTime,.4);return}
  const a=new Audio();a.crossOrigin='anonymous';a.loop=true;a.src=url;a.onerror=()=>{custom=null;padG.gain.setTargetAtTime(1,ctx.currentTime,.4)};
  try{ctx.createMediaElementSource(a).connect(mg)}catch(e){}custom=a;padG.gain.setTargetAtTime(0,ctx.currentTime,.4);if(music&&ctx.state==='running')a.play().catch(()=>{});
}
function tone(f,dur,vol,type,f2,delay){if(!ctx||ctx.state!=='running')return;const t=ctx.currentTime+(delay||0),o=ctx.createOscillator(),g=ctx.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(fxg);o.start(t);o.stop(t+dur+.05)}
function noise(dur,vol,f1,f2){if(!ctx||ctx.state!=='running')return;const t=ctx.currentTime,len=Math.floor(ctx.sampleRate*dur),b=ctx.createBuffer(1,len,ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;const s=ctx.createBufferSource();s.buffer=b;const f=ctx.createBiquadFilter();f.type='bandpass';f.Q.value=1.2;f.frequency.setValueAtTime(f1,t);f.frequency.exponentialRampToValueAtTime(f2,t+dur);const g=ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+dur*.4);g.gain.linearRampToValueAtTime(0,t+dur);s.connect(f);f.connect(g);g.connect(fxg);s.start(t)}
const label=()=>document.querySelectorAll('.snd').forEach(b=>{b.textContent=music?'Music on':'Music off';b.setAttribute('aria-pressed',music)});
const S=window.Sfx={
  setMusic(v){music=!!v;put('mus',music?'1':'0');if(init()){ctx.resume().catch(()=>{});mg.gain.setTargetAtTime(music?.7:0,ctx.currentTime,music?.6:.25);if(custom){music?custom.play().catch(()=>{}):custom.pause()}}label()},
  setSource(u){window.MUSIC_URL=u||null;if(ctx)load(u||null)},
  hover(){const n=performance.now();if(n-lastH<90)return;lastH=n;tone(2200,.06,.025,'sine')},
  click(){tone(900,.12,.05,'triangle',600)},
  glass(){tone(1568,.9,.04,'sine');tone(2349,1.1,.025,'sine',0,.06)},
  whoosh(){noise(1.4,.12,300,2400)},
  chime(){[523.25,659.25,783.99,1046.5].forEach((f,i)=>tone(f,1.6,.05,'sine',0,i*.09))}
};
S.set=S.setMusic;
addEventListener('DOMContentLoaded',()=>{
  music=pref();label();init();if(music)S.setMusic(true);
  document.querySelectorAll('.snd').forEach(b=>b.addEventListener('click',()=>S.setMusic(!music)));
  const wake=()=>{if(!init())return;if(ctx.state!=='running')ctx.resume().catch(()=>{});if(music&&custom&&custom.paused)custom.play().catch(()=>{})};
  ['pointerdown','keydown','touchstart'].forEach(ev=>addEventListener(ev,wake,{passive:true}));
  document.addEventListener('pointerover',e=>{if(e.target.closest&&e.target.closest('a,button,.file'))S.hover()});
  document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('a,button:not(.snd)'))S.click()});
});
})();
