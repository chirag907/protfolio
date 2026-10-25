(()=>{
const $=s=>document.querySelector(s),still=matchMedia('(prefers-reduced-motion: reduce)').matches,N=10,SP=9,TOT=(N+2)*SP;
const S=window.Sfx||{hover(){},click(){},glass(){},whoosh(){},chime(){}};
const Th=window.Theme||{cur:{accent:'#8fb1ff',bg:'#0e1013'},rgb:()=>[143,177,255],mix:a=>a};
const T=window.SITE_TEXT||[],PH=['ph1','ph2','ph3','ph4'].map(k=>(T.find(r=>r[0]===k)||[0,0,''])[2]);
$('#year').textContent=new Date().getFullYear();

/* ---- cinematic loader: smoky title sequence, opens by itself ---- */
const LFS='precision highp float;uniform float uT;uniform vec2 uR;uniform vec3 uA,uB;varying vec2 vUv;float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+7.1;a*=.5;}return v;}void main(){vec2 s=vec2(uR.x/uR.y,1.);vec2 uv=(vUv-.5)*s;float t=uT*.07;vec2 q=vec2(fbm(uv*1.5+t),fbm(uv*1.5-t+4.));vec2 r=vec2(fbm(uv*2.+q*2.+vec2(1.7,9.2)+t*1.4),fbm(uv*2.+q*2.+vec2(8.3,2.8)-t));float f=smoothstep(.12,.88,fbm(uv*1.3+r*2.3));vec3 c=mix(uB*.35,mix(uB,uA,.24)*1.25,smoothstep(.2,.65,f));c=mix(c,mix(uA,vec3(1.),.35)*.7,smoothstep(.62,.92,f)*.55);float v=1.-abs(2.*f-1.);c+=mix(uA,vec3(1.),.6)*pow(v,12.)*.45;c*=.4+.6*smoothstep(1.3,0.,length(uv));c+=(h(gl_FragCoord.xy+uT)-.5)*.045;gl_FragColor=vec4(c,1.);}';
function loaderFx(){
  const cv=$('#ldc');if(!cv||!window.THREE)return null;let r;try{r=new THREE.WebGLRenderer({canvas:cv})}catch(e){return null}
  r.setPixelRatio(Math.min(devicePixelRatio,1.25));
  const sc=new THREE.Scene(),cam=new THREE.OrthographicCamera(-1,1,1,-1,0,1),u={uT:{value:0},uR:{value:new THREE.Vector2(1,1)},uA:{value:new THREE.Vector3()},uB:{value:new THREE.Vector3()}};
  const col=()=>{u.uA.value.set(...Th.rgb(Th.cur.accent).map(v=>v/255));u.uB.value.set(...Th.rgb(Th.cur.bg).map(v=>v/255))};col();addEventListener('themechange',col);
  sc.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({uniforms:u,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:LFS})));
  const size=()=>{r.setSize(innerWidth,innerHeight,false);u.uR.value.set(innerWidth,innerHeight)};size();addEventListener('resize',size);
  let run=true,raf;const t0=performance.now();(function loop(){if(!run)return;raf=requestAnimationFrame(loop);u.uT.value=(performance.now()-t0)/1000;r.render(sc,cam)})();
  return {stop(){run=false;cancelAnimationFrame(raf);r.dispose();r.forceContextLoss&&r.forceContextLoss()}};
}
const ld=$('#loader'),cnt=$('#count');let ready=false,done=false,n=0,lfx=loaderFx();
function finish(){if(done)return;done=true;ld.classList.add('done');document.body.classList.add('ready');S.whoosh();setTimeout(()=>S.chime(),900);setTimeout(()=>{lfx&&lfx.stop();ld.remove()},2800)}
function setP(v){cnt.textContent=String(Math.round(v)).padStart(3,'0');ld.style.setProperty('--p',v)}
(function tick(){n=Math.min(ready?100:90,n+Math.random()*2.4+.6);setP(n);if(n>=100)setTimeout(finish,700);else setTimeout(tick,50)})();
setTimeout(()=>{ready=true},12000);

/* ---- editable site text (showcase slots, statement, links) ---- */
const st=document.querySelector('.statement p');let ws=[];
function upd(){if(!ws.length)return;const r=st.getBoundingClientRect(),p=Math.min(1,Math.max(0,(innerHeight*.85-r.top)/(r.height+innerHeight*.3)));ws.forEach((w,i)=>w.classList.toggle('on',still||i/ws.length<p))}
function split(){if(!st)return;const words=st.textContent.trim().split(/\s+/);st.replaceChildren(...words.flatMap((w,i)=>{const s=document.createElement('span');s.className='w';s.textContent=w;return i?[document.createTextNode(' '),s]:[s]}));ws=[...st.querySelectorAll('.w')];upd()}
addEventListener('scroll',upd,{passive:true});split();
const pr=document.querySelector('.projects');if(pr)pr.addEventListener('click',e=>{const a=e.target.closest('a');if(a&&a.getAttribute('href')==='#')e.preventDefault()});
(async()=>{const c=window.CONFIG||{};if(!c.SUPABASE_URL||!window.supabase)return;
  try{const sb=supabase.createClient(c.SUPABASE_URL,c.SUPABASE_ANON_KEY),{data}=await sb.from('site_text').select('key,value');if(!data)return;const m=Object.fromEntries(data.map(r=>[r.key,r.value]));
    document.querySelectorAll('[data-k]').forEach(el=>{const v=m[el.dataset.k];if(v){el.textContent=v;if(el.dataset.k==='email')el.href='mailto:'+v}});
    document.querySelectorAll('[data-kh]').forEach(el=>{const v=m[el.dataset.kh];if(v&&/^https?:\/\//i.test(v)){el.href=v;el.target='_blank';el.rel='noopener noreferrer'}});
    ['ph1','ph2','ph3','ph4'].forEach((k,i)=>{if(m[k])PH[i]=m[k]});split()}catch(e){}})();

/* ---- 3D tunnel ---- */
function bgTex(){const A=Th.cur.accent,B=Th.cur.bg,ac=Th.rgb(A).join(','),c=document.createElement('canvas');c.width=256;c.height=512;const x=c.getContext('2d');
  const g=x.createLinearGradient(0,0,0,512);g.addColorStop(0,Th.mix(B,A,.16));g.addColorStop(.45,Th.mix(B,'#000000',.12));g.addColorStop(1,Th.mix(B,'#000000',.6));x.fillStyle=g;x.fillRect(0,0,256,512);
  [[40,110,130,.4],[225,300,150,.24],[120,470,200,.32],[200,40,90,.2]].forEach(([cx,cy,r,al],i)=>{const q=x.createRadialGradient(cx,cy,0,cx,cy,r);q.addColorStop(0,i%2?`rgba(233,237,242,${al*.6})`:`rgba(${ac},${al})`);q.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=q;x.fillRect(0,0,256,512)});
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.wrapS=t.wrapT=THREE.MirroredRepeatWrapping;return t}
const bf=v=>{const k=1+.28*Math.sin(v.x*2.1+1.3)*Math.sin(v.y*1.7+.4)+.16*Math.sin(v.z*3.1+2.2)*Math.cos(v.x*2.6)+.07*Math.sin(v.y*6+v.z*4);return v.clone().multiplyScalar(k)};
function blob(){const g=new THREE.SphereGeometry(1,96,64),p=g.attributes.position,nm=g.attributes.normal,v=new THREE.Vector3(),t1=new THREE.Vector3(),t2=new THREE.Vector3(),a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).normalize();t1.set(0,1,0).cross(v);if(t1.lengthSq()<1e-4)t1.set(1,0,0).cross(v);t1.normalize();t2.crossVectors(v,t1);
    const P0=bf(v);a.copy(v).addScaledVector(t1,.01).normalize();b.copy(v).addScaledVector(t2,.01).normalize();const P1=bf(a),P2=bf(b);
    c.subVectors(P1,P0).cross(b.subVectors(P2,P0)).normalize();if(c.dot(P0)<0)c.negate();p.setXYZ(i,P0.x,P0.y,P0.z);nm.setXYZ(i,c.x,c.y,c.z)}return g}
function vase(){const pts=[];for(let i=0;i<=40;i++){const t=i/40;pts.push(new THREE.Vector2(.12+.7*Math.pow(Math.sin(Math.PI*t),.8)*(1-.3*t)+.07*Math.sin(t*10),(t-.5)*3))}return new THREE.LatheGeometry(pts,72)}
function slab(w,h,r){const s=new THREE.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);const g=new THREE.ExtrudeGeometry(s,{depth:.12,bevelEnabled:true,bevelThickness:.06,bevelSize:.06,bevelSegments:6,curveSegments:16});g.center();return g}
const frost=o=>new THREE.MeshPhysicalMaterial(Object.assign({color:0xe4ecff,transmission:1,roughness:.5,thickness:1.8,ior:1.4,clearcoat:.5,clearcoatRoughness:.3,envMapIntensity:1.7,attenuationColor:new THREE.Color(0xa9bfe8),attenuationDistance:3.5,emissive:new THREE.Color(Th.cur.accent),emissiveIntensity:0},o));
const TYPES=[[()=>new THREE.SphereGeometry(1,64,48),()=>frost({})],[blob,()=>frost({roughness:.42})],[()=>slab(1.7,2.3,.25),()=>frost({roughness:.62,thickness:.9})],[vase,()=>frost({roughness:.45,color:0xdfe9ff})],[()=>new THREE.CapsuleGeometry(.5,1.5,16,32),()=>frost({roughness:.55})],[()=>{const g=new THREE.IcosahedronGeometry(1.1,1);g.scale(1,1.5,1);return g},()=>frost({roughness:.38,thickness:2.4})],[()=>new THREE.CylinderGeometry(.6,.6,2.4,6),()=>frost({roughness:.5})]];

function world(){
  if(THREE.ColorManagement&&'legacyMode' in THREE.ColorManagement)THREE.ColorManagement.legacyMode=false;
  const cv=$('#scene'),r=new THREE.WebGLRenderer({canvas:cv,antialias:true});
  r.setPixelRatio(Math.min(devicePixelRatio,matchMedia('(pointer:coarse)').matches?1.25:1.75));
  r.outputEncoding=THREE.sRGBEncoding;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.05;
  const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(50,1,.1,120);scene.fog=new THREE.Fog(Th.mix(Th.cur.bg,'#000000',.35),12,72);scene.background=bgTex();
  const env=new THREE.Scene(),soft=(c,i,x,y,z,w,h)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(c).multiplyScalar(i),side:2}));m.position.set(x,y,z);m.lookAt(0,0,0);env.add(m)};
  soft(0xffffff,9,6,6,5,7,3);soft(0x9db8ff,5,-7,2,3,4,8);soft(0xdfe8ff,3,0,-6,4,10,2);soft(0xffffff,3,-5,-3,-5,3,6);soft(0xffffff,14,-3,8,2,.6,10);soft(0xffffff,10,8,-2,1,.5,9);soft(0x202838,1.2,0,0,-9,26,26);
  scene.environment=new THREE.PMREMGenerator(r).fromScene(env,.03).texture;
  const dl=new THREE.DirectionalLight(0xcfe0ff,1.1);dl.position.set(4,5,6);scene.add(dl,new THREE.AmbientLight(0x6f7f99,.35));
  const rm=new THREE.LineBasicMaterial({color:0xaab8cf,transparent:true,opacity:.18}),pts=[];
  for(let i=0;i<8;i++){const t=i/8*Math.PI*2;pts.push(7*Math.cos(t),7*Math.sin(t),0)}
  const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));const rings=[];
  for(let k=3;k*7<TOT+10;k++){const l=new THREE.LineLoop(rg,rm);l.position.z=-k*7;l.userData.k=k;scene.add(l);rings.push(l)}
  const dn=1200,dp=new Float32Array(dn*3);for(let i=0;i<dn;i++){const d=Math.sqrt(Math.random())*11,a=Math.random()*6.283;dp.set([d*Math.cos(a),d*Math.sin(a)*.8,2-Math.random()*(TOT+8)],i*3)}
  const dg=new THREE.BufferGeometry();dg.setAttribute('position',new THREE.BufferAttribute(dp,3));
  scene.add(new THREE.Points(dg,new THREE.PointsMaterial({size:.07,color:0xcfd9ea,transparent:true,opacity:.5,depthWrite:false,blending:THREE.AdditiveBlending})));
  const G=new THREE.Group(),geo={};scene.add(G);
  const meshes=[...Array(N)].map((_,i)=>{const ti=i%7,TT=TYPES[ti];geo[ti]=geo[ti]||TT[0]();
    const m=new THREE.Mesh(geo[ti],TT[1]()),th=i*2.4,rad=3.4+(i%3)*.8,s=1.3+((i*37)%10)/12;
    m.scale.setScalar(s);m.position.set(rad*Math.cos(th),rad*Math.sin(th)*.6,-(i+2)*SP);m.rotation.set(i,i*2,0);
    m.userData={i,y:m.position.y,s,spin:0,k:(i%2?1:-1)*(.6+(i%5)*.15)};G.add(m);return m});
  addEventListener('themechange',()=>{scene.background=bgTex();scene.fog.color.set(Th.mix(Th.cur.bg,'#000000',.35));meshes.forEach(m=>m.material.emissive.set(Th.cur.accent))});

  const mouse={x:0,y:0},cs={x:0,y:0},ray=new THREE.Raycaster(),jr=$('#journey'),chap=$('#chap'),nm=$('.namewrap');
  let hov=-1,lastHov=-1,over=false,sp=0,ph=-1,down=null,sS=0,prevY=0,lastW=0;
  addEventListener('pointermove',e=>{mouse.x=e.clientX/innerWidth*2-1;mouse.y=e.clientY/innerHeight*2-1;over=!!(e.target.closest&&e.target.closest('.hero,#journey,.namewrap'))});
  addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY}});
  addEventListener('pointerup',e=>{if(down&&hov>=0&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<6){meshes[hov].userData.spin=.3;S.glass()}down=null});
  function size(){r.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.fov=cam.aspect<1?72:50;cam.updateProjectionMatrix()}
  addEventListener('resize',size);size();ready=true;
  const t0=performance.now();
  (function loop(){
    requestAnimationFrame(loop);
    const t=(performance.now()-t0)/1000,end=jr.offsetTop+jr.offsetHeight-innerHeight,p=Math.min(1,Math.max(0,scrollY/end)),sy=Math.min(20,scrollY/innerHeight);
    const f=Math.max(0,1-scrollY/(innerHeight*.65));nm.style.opacity=f;nm.style.transform=`translateY(${-scrollY*.18}px) scale(${1+scrollY/innerHeight*.12})`;nm.style.visibility=f<=0?'hidden':'visible';
    if(Math.abs(sy-prevY)*60>1.4&&performance.now()-lastW>2500){lastW=performance.now();S.whoosh()}prevY=sy;sS+=(sy-sS)*.06;
    sp+=(p-sp)*(still?1:.07);cs.x+=(mouse.x-cs.x)*.05;cs.y+=(mouse.y-cs.y)*.05;
    cam.position.set(cs.x*.5,-cs.y*.3,-sp*TOT);cam.rotation.set(-cs.y*.05,-cs.x*.09,0);
    scene.background.offset.y=still?0:sS*.035;
    G.visible=scrollY<end+innerHeight;
    rings.forEach(l=>l.rotation.z=l.userData.k*.35+(still?0:t*.05*(l.userData.k%2?1:-1)));
    if(G.visible){
      ray.setFromCamera({x:mouse.x,y:-mouse.y},cam);const hit=over?ray.intersectObjects(meshes)[0]:null;hov=hit?hit.object.userData.i:-1;
      if(hov!==lastHov){if(hov>=0)S.glass();lastHov=hov}document.body.classList.toggle('view',hov>=0);
      meshes.forEach(m=>{const d=m.userData,on=d.i===hov,rs=still?0:1;d.spin*=.95;m.rotation.x+=rs*.004*d.k+d.spin*.6;m.rotation.y+=rs*.006*d.k+d.spin;
        m.position.y=d.y+(still?0:Math.sin(t*.6+d.i)*.18);const ts=d.s*(on?1.12:1);m.scale.setScalar(m.scale.x+(ts-m.scale.x)*.12);m.material.emissiveIntensity+=((on?.3:0)-m.material.emissiveIntensity)*.12});
      const k=Math.min(3,Math.floor(p*4));if(k!==ph&&p<1){ph=k;chap.classList.add('off');setTimeout(()=>{chap.textContent=PH[k];chap.classList.remove('off')},350)}
      $('#idx').textContent=String(Math.round(sp*100)).padStart(2,'0');
    }
    r.render(scene,cam);
  })();
}
addEventListener('load',()=>{try{world()}catch(e){console.warn('3D unavailable',e);document.body.classList.add('nogl');ready=true}});

if(matchMedia('(pointer:fine)').matches){
  const c=document.createElement('div');c.className='cur';document.body.append(c);document.body.classList.add('hascur');
  addEventListener('pointermove',e=>{c.style.transform='translate('+e.clientX+'px,'+e.clientY+'px)';c.classList.toggle('big',!!e.target.closest('a,button')||document.body.classList.contains('view'))});
}
})();
