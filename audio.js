(()=>{
let ctx,master,on=false,lastH=0;
const store={get:()=>{try{const v=localStorage.getItem('snd');return v==='1'||(v===null&&document.body.dataset.snd==='on')}catch(e){return false}},set:v=>{try{localStorage.setItem('snd',v?'1':'0')}catch(e){}}};
function init(){
  if(ctx)return;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;ctx=new AC();
  master=ctx.createGain();master.gain.value=0;
  const d=ctx.createDelay(1);d.delayTime.value=.37;const fb=ctx.createGain();fb.gain.value=.45;d.connect(fb);fb.connect(d);
  const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=900;lp.connect(master);lp.connect(d);d.connect(master);master.connect(ctx.destination);
  [110,164.81,220,329.63].forEach((f,i)=>{const o=ctx.createOscillator(),g=ctx.createGain(),l=ctx.createOscillator(),lg=ctx.createGain();
    o.type=i%2?'sine':'triangle';o.frequency.value=f;o.detune.value=(i-1.5)*7;g.gain.value=.045;l.frequency.value=.04+i*.025;lg.gain.value=.025;
    l.connect(lg);lg.connect(g.gain);o.connect(g);g.connect(lp);o.start();l.start()});
}
function tone(f,dur,vol,type,f2,delay){if(!on||!ctx||ctx.state!=='running')return;const t=ctx.currentTime+(delay||0),o=ctx.createOscillator(),g=ctx.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.05)}
function noise(dur,vol,f1,f2){if(!on||!ctx||ctx.state!=='running')return;const t=ctx.currentTime,len=Math.floor(ctx.sampleRate*dur),b=ctx.createBuffer(1,len,ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;const s=ctx.createBufferSource();s.buffer=b;const f=ctx.createBiquadFilter();f.type='bandpass';f.Q.value=1.2;f.frequency.setValueAtTime(f1,t);f.frequency.exponentialRampToValueAtTime(f2,t+dur);const g=ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+dur*.4);g.gain.linearRampToValueAtTime(0,t+dur);s.connect(f);f.connect(g);g.connect(master);s.start(t)}
function label(){document.querySelectorAll('.snd').forEach(b=>{b.textContent=on?'Sound on':'Sound off';b.setAttribute('aria-pressed',on)})}
const S=window.Sfx={
  set(v){on=!!v;store.set(on);if(on){init();if(ctx){ctx.resume().catch(()=>{});master.gain.setTargetAtTime(.7,ctx.currentTime,.6)}}else if(master)master.gain.setTargetAtTime(0,ctx.currentTime,.2);label()},
  hover(){const n=performance.now();if(n-lastH<90)return;lastH=n;tone(2200,.06,.025,'sine')},
  click(){tone(900,.12,.05,'triangle',600)},
  glass(){tone(1568,.9,.04,'sine');tone(2349,1.1,.025,'sine',0,.06)},
  whoosh(){noise(1.4,.12,300,2400)},
  chime(){[523.25,659.25,783.99,1046.5].forEach((f,i)=>tone(f,1.6,.05,'sine',0,i*.09))}
};
addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.snd').forEach(b=>b.addEventListener('click',()=>S.set(!on)));label();
  document.addEventListener('pointerover',e=>{if(e.target.closest&&e.target.closest('a,button,.file'))S.hover()});
  document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('a,button:not(.snd)'))S.click()});
  if(store.get()){S.set(true);['pointerdown','keydown','touchstart'].forEach(ev=>addEventListener(ev,()=>{if(ctx&&ctx.state!=='running')ctx.resume().catch(()=>{})},{passive:true}))}
});
})();
