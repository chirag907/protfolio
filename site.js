(()=>{
const $=s=>document.querySelector(s),still=matchMedia('(prefers-reduced-motion: reduce)').matches,N=22,SP=6,TOT=(N+2)*SP;
$('#year').textContent=new Date().getFullYear();
const ld=$('#loader'),cnt=$('#count');let ready=false,done=false,n=0;
function finish(){if(done)return;done=true;ld.classList.add('done');document.body.classList.add('ready');setTimeout(()=>ld.remove(),1100)}
(function tick(){n=Math.min(ready?100:92,n+Math.ceil(Math.random()*5)+1);cnt.textContent=n;if(n>=100)setTimeout(finish,250);else setTimeout(tick,45)})();
setTimeout(finish,9000);

/* smoky background: higher contrast, luminous veins, drifts and surges with scroll */
const FLUID='precision highp float;uniform float uT,uDim,uS,uV;uniform vec2 uR,uM;varying vec2 vUv;float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+7.1;a*=.5;}return v;}void main(){vec2 s=vec2(uR.x/uR.y,1.);vec2 uv=(vUv-.5)*s,m=(uM-.5)*s;float t=uT*.05+uS*.35;vec2 w=uv*(1.-uS*.012)+vec2(uS*.04,uS*.28);vec2 q=vec2(fbm(w*1.6+t),fbm(w*1.6-t+4.));vec2 r=vec2(fbm(w*2.+q*(2.+uV*2.)+vec2(1.7,9.2)+t*1.5),fbm(w*2.+q*(2.+uV*2.)+vec2(8.3,2.8)-t));float f=fbm(w*1.4+r*2.2)+exp(-3.*length(uv-m))*.22;f=smoothstep(.12,.88,f);vec3 c=mix(vec3(.02,.025,.035),vec3(.12,.15,.2),smoothstep(.2,.65,f));c=mix(c,vec3(.4,.48,.6),smoothstep(.6,.92,f)*.6);float v=1.-abs(2.*f-1.);c+=vec3(.65,.78,1.)*pow(v,12.)*.5;c+=vec3(.9,.95,1.)*smoothstep(.88,1.,f)*.14;c*=.45+.55*smoothstep(1.35,0.,length(uv));c+=(h(gl_FragCoord.xy+uT)-.5)*.04;gl_FragColor=vec4(c*uDim,1.);}';

/* glass and chrome forms */
const bf=v=>{const k=1+.28*Math.sin(v.x*2.1+1.3)*Math.sin(v.y*1.7+.4)+.16*Math.sin(v.z*3.1+2.2)*Math.cos(v.x*2.6)+.07*Math.sin(v.y*6+v.z*4);return v.clone().multiplyScalar(k)};
function blob(){
  const g=new THREE.SphereGeometry(1,96,64),p=g.attributes.position,nm=g.attributes.normal,v=new THREE.Vector3(),t1=new THREE.Vector3(),t2=new THREE.Vector3(),a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
  for(let i=0;i<p.count;i++){
    v.fromBufferAttribute(p,i).normalize();t1.set(0,1,0).cross(v);if(t1.lengthSq()<1e-4)t1.set(1,0,0).cross(v);t1.normalize();t2.crossVectors(v,t1);
    const P0=bf(v);a.copy(v).addScaledVector(t1,.01).normalize();b.copy(v).addScaledVector(t2,.01).normalize();const P1=bf(a),P2=bf(b);
    c.subVectors(P1,P0).cross(b.subVectors(P2,P0)).normalize();if(c.dot(P0)<0)c.negate();p.setXYZ(i,P0.x,P0.y,P0.z);nm.setXYZ(i,c.x,c.y,c.z);
  }
  return g;
}
function vase(){const pts=[];for(let i=0;i<=40;i++){const t=i/40;pts.push(new THREE.Vector2(.12+.7*Math.pow(Math.sin(Math.PI*t),.8)*(1-.3*t)+.07*Math.sin(t*10),(t-.5)*3))}return new THREE.LatheGeometry(pts,72)}
function slab(w,h,r){const s=new THREE.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);const g=new THREE.ExtrudeGeometry(s,{depth:.12,bevelEnabled:true,bevelThickness:.06,bevelSize:.06,bevelSegments:6,curveSegments:16});g.center();return g}
const chrome=(c,r)=>new THREE.MeshStandardMaterial({color:c,metalness:1,roughness:r,emissive:0x8fb1ff,emissiveIntensity:0});
const glass=o=>new THREE.MeshPhysicalMaterial(Object.assign({color:0xffffff,transmission:1,roughness:.04,thickness:1.4,ior:1.5,clearcoat:1,clearcoatRoughness:.05,attenuationColor:new THREE.Color(0x9db8ff),attenuationDistance:2.6,emissive:0x8fb1ff,emissiveIntensity:0},o));
const TYPES=[
  [blob,()=>chrome(0xe9eef7,.05)],
  [()=>new THREE.SphereGeometry(1,64,48),()=>glass({})],
  [()=>slab(1.7,2.3,.25),()=>glass({roughness:.42,thickness:.6,color:0xd6e4ff})],
  [vase,()=>chrome(0xaec4ee,.08)],
  [()=>new THREE.CapsuleGeometry(.5,1.5,16,32),()=>glass({iridescence:1,iridescenceIOR:1.3,iridescenceThicknessRange:[120,420]})],
  [()=>{const g=new THREE.IcosahedronGeometry(1.1,1);g.scale(1,1.5,1);return g},()=>glass({iridescence:.8,thickness:2})],
  [blob,()=>chrome(0x2a313c,.07)]
];

function world(){
  if(THREE.ColorManagement&&'legacyMode' in THREE.ColorManagement)THREE.ColorManagement.legacyMode=false;
  const cv=$('#scene'),r=new THREE.WebGLRenderer({canvas:cv,antialias:true});
  r.setPixelRatio(Math.min(devicePixelRatio,matchMedia('(pointer:coarse)').matches?1.25:1.75));
  r.outputEncoding=THREE.sRGBEncoding;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.05;
  const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(50,1,.1,120);scene.fog=new THREE.Fog(0x0e1013,12,72);

  const env=new THREE.Scene(),soft=(c,i,x,y,z,w,h)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(c).multiplyScalar(i),side:2}));m.position.set(x,y,z);m.lookAt(0,0,0);env.add(m)};
  soft(0xffffff,9,6,6,5,7,3);soft(0x9db8ff,5,-7,2,3,4,8);soft(0xdfe8ff,3,0,-6,4,10,2);soft(0xffffff,3,-5,-3,-5,3,6);soft(0xffffff,14,-3,8,2,.6,10);soft(0xffffff,10,8,-2,1,.5,9);soft(0x202838,1.2,0,0,-9,26,26);
  scene.environment=new THREE.PMREMGenerator(r).fromScene(env,.03).texture;
  const dl=new THREE.DirectionalLight(0xcfe0ff,1.1);dl.position.set(4,5,6);scene.add(dl,new THREE.AmbientLight(0x6f7f99,.35));

  const fu={uT:{value:0},uDim:{value:1},uS:{value:0},uV:{value:0},uR:{value:new THREE.Vector2(1,1)},uM:{value:new THREE.Vector2(.5,.5)}};
  const bg=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({uniforms:fu,depthTest:false,depthWrite:false,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:FLUID}));
  bg.frustumCulled=false;bg.renderOrder=-1;scene.add(bg);

  const rm=new THREE.LineBasicMaterial({color:0xaab8cf,transparent:true,opacity:.3}),pts=[];
  for(let i=0;i<8;i++){const t=i/8*Math.PI*2;pts.push(7*Math.cos(t),7*Math.sin(t),0)}
  const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));const rings=[];
  for(let k=1;k*5<TOT+10;k++){const l=new THREE.LineLoop(rg,rm);l.position.z=-k*5;l.userData.k=k;scene.add(l);rings.push(l)}
  const dn=2000,dp=new Float32Array(dn*3);for(let i=0;i<dn;i++){const d=Math.sqrt(Math.random())*11,a=Math.random()*6.283;dp.set([d*Math.cos(a),d*Math.sin(a)*.8,2-Math.random()*(TOT+8)],i*3)}
  const dg=new THREE.BufferGeometry();dg.setAttribute('position',new THREE.BufferAttribute(dp,3));
  scene.add(new THREE.Points(dg,new THREE.PointsMaterial({size:.09,color:0xcfd9ea,transparent:true,opacity:.65,depthWrite:false,blending:THREE.AdditiveBlending})));

  const G=new THREE.Group(),geo={};scene.add(G);
  const meshes=[...Array(N)].map((_,i)=>{
    const ti=i%7,T=TYPES[ti];geo[ti]=geo[ti]||T[0]();
    const m=new THREE.Mesh(geo[ti],T[1]()),th=i*2.4,rad=3+(i%3)*.9,s=.95+((i*37)%10)/14;
    m.scale.setScalar(s);m.position.set(rad*Math.cos(th),rad*Math.sin(th)*.6,-(i+2)*SP);m.rotation.set(i,i*2,0);
    m.userData={i,y:m.position.y,s,spin:0,k:(i%2?1:-1)*(.6+(i%5)*.15)};G.add(m);return m;
  });

  const mouse={x:0,y:0},cs={x:0,y:0},fm={x:.5,y:.5},ray=new THREE.Raycaster(),jr=$('#journey'),phrases=['Built with care.','Made to be used.','Detail is the design.','Everything, in one place.'],chap=$('#chap');
  let hov=-1,over=false,sp=0,ph=-1,down=null,sS=0,sV=0,prevY=0;
  addEventListener('pointermove',e=>{mouse.x=e.clientX/innerWidth*2-1;mouse.y=e.clientY/innerHeight*2-1;over=!!(e.target.closest&&e.target.closest('.hero,#journey'))});
  addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY}});
  addEventListener('pointerup',e=>{if(down&&hov>=0&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<6)meshes[hov].userData.spin=.3;down=null});
  function size(){r.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.fov=cam.aspect<1?72:50;cam.updateProjectionMatrix();fu.uR.value.set(innerWidth,innerHeight)}
  addEventListener('resize',size);size();ready=true;
  const t0=performance.now();
  (function loop(){
    requestAnimationFrame(loop);
    const t=(performance.now()-t0)/1000,end=jr.offsetTop+jr.offsetHeight-innerHeight,p=Math.min(1,Math.max(0,scrollY/end)),sy=Math.min(20,scrollY/innerHeight);
    sV+=(Math.min(1.5,Math.abs(sy-prevY)*25)-sV)*.08;prevY=sy;sS+=(sy-sS)*.06;
    sp+=(p-sp)*(still?1:.07);cs.x+=(mouse.x-cs.x)*.05;cs.y+=(mouse.y-cs.y)*.05;fm.x+=(mouse.x*.5+.5-fm.x)*.06;fm.y+=(.5-mouse.y*.5-fm.y)*.06;
    cam.position.set(cs.x*.5,-cs.y*.3,-sp*TOT);cam.rotation.set(-cs.y*.05,-cs.x*.09,0);
    fu.uT.value=still?3:t;fu.uS.value=still?0:sS;fu.uV.value=still?0:sV;fu.uM.value.set(fm.x,fm.y);fu.uDim.value=1-.4*Math.min(1,Math.max(0,(scrollY-end)/innerHeight));
    G.visible=scrollY<end+innerHeight;
    rings.forEach(l=>l.rotation.z=l.userData.k*.35+(still?0:t*.05*(l.userData.k%2?1:-1)));
    if(G.visible){
      ray.setFromCamera({x:mouse.x,y:-mouse.y},cam);const hit=over?ray.intersectObjects(meshes)[0]:null;hov=hit?hit.object.userData.i:-1;
      document.body.classList.toggle('view',hov>=0);
      meshes.forEach(m=>{const d=m.userData,on=d.i===hov,rs=still?0:1;d.spin*=.95;m.rotation.x+=rs*.004*d.k+d.spin*.6;m.rotation.y+=rs*.006*d.k+d.spin;
        m.position.y=d.y+(still?0:Math.sin(t*.6+d.i)*.18);const ts=d.s*(on?1.12:1);m.scale.setScalar(m.scale.x+(ts-m.scale.x)*.12);m.material.emissiveIntensity+=((on?.3:0)-m.material.emissiveIntensity)*.12});
      const k=Math.min(3,Math.floor(p*4));if(k!==ph&&p<1){ph=k;chap.classList.add('off');setTimeout(()=>{chap.textContent=phrases[k];chap.classList.remove('off')},350)}
      $('#idx').textContent=String(Math.round(sp*100)).padStart(2,'0');
    }
    r.render(scene,cam);
  })();
}
addEventListener('load',()=>{try{world()}catch(e){console.warn('3D unavailable',e);document.body.classList.add('nogl');finish()}});

if(matchMedia('(pointer:fine)').matches){
  const c=document.createElement('div');c.className='cur';document.body.append(c);document.body.classList.add('hascur');
  addEventListener('pointermove',e=>{c.style.transform='translate('+e.clientX+'px,'+e.clientY+'px)';c.classList.toggle('big',!!e.target.closest('a,button')||document.body.classList.contains('view'))});
}
const st=document.querySelector('.statement p');
if(st){
  st.innerHTML=st.textContent.trim().split(/\s+/).map(w=>'<span class="w">'+w+'</span>').join(' ');
  const ws=st.querySelectorAll('.w'),upd=()=>{const r=st.getBoundingClientRect(),p=Math.min(1,Math.max(0,(innerHeight*.85-r.top)/(r.height+innerHeight*.3)));ws.forEach((w,i)=>w.classList.toggle('on',still||i/ws.length<p))};
  addEventListener('scroll',upd,{passive:true});upd();
}
})();
