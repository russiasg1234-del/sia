/* All architecture, text geometry and cloth authored for this project. */
function createDarkGarage(THREE) {
  const base=createGarageProgress(THREE),room=base.room;
  room.name='Dark Garage Portfolio';room.userData.stage='final';
  const materials=new Set();room.traverse(o=>{if(o.isMesh)materials.add(o.material);});
  // Preserve the original surface maps but replace the light palette.
  materials.forEach(m=>{
    if(!m.color)return;
    const hex=m.color.getHex();
    const palette={0xd0d1cf:0x444e59,0xf2f0e7:0x353e49,0x34454e:0x151d27,0x8b979e:0x6c7c8c,0xe7e8e1:0xb1bbc5,0xffffff:0x6c6055,0xe4b358:0x7ccbd5};
    if(palette[hex]!==undefined)m.color.setHex(palette[hex]);
    if(hex===0xffe7b0){m.color.setHex(0xe0f5ff);m.emissive.setHex(0x91ddeb);m.emissiveIntensity=1.7;}
  });
  const steel=new THREE.MeshStandardMaterial({color:0x25313e,roughness:.42,metalness:.8});
  const accent=new THREE.MeshStandardMaterial({color:0x92dce7,emissive:0x347987,emissiveIntensity:.8,roughness:.35,metalness:.4});
  const textMat=new THREE.MeshStandardMaterial({color:0xd0e7ef,roughness:.45,metalness:.25});
  function mesh(parent,name,geo,material,pos){const m=new THREE.Mesh(geo,material);m.name=name;m.position.set(...pos);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
  function box(parent,name,size,pos,material=steel){return mesh(parent,name,new THREE.BoxGeometry(...size),material,pos);}
  function group(name,action,label){const g=new THREE.Group();g.name=name;if(action)g.userData={action,label};room.add(g);return g;}
  const find=name=>room.getObjectByName(name);
  // Replace the old flat information placeholders with real geometry and a photo.
  ['Portrait placeholder','Student details placeholder','Information frame','Profile frame'].forEach(name=>{const o=find(name);if(o)o.parent.remove(o);});
  const oldProfile=find('Reserved portfolio information');if(oldProfile)room.remove(oldProfile);
  const profile=group('Student profile','profile','โปรไฟล์ / สิทธิศักดิ์ บุษบก');
  box(profile,'Information backplate',[2.43,1.34,.055],[.2,2.05,-3.78]);
  box(profile,'Portrait backplate',[.81,1.05,.065],[-1.54,2.19,-3.78]);
  if(typeof document!=='undefined'&&window.PROFILE_PORTRAIT){
    // Embedded image URL works via file:// without external network requests.
    const photo=new THREE.TextureLoader().load(window.PROFILE_PORTRAIT);photo.encoding=THREE.sRGBEncoding;
    mesh(profile,'Student portrait texture',new THREE.PlaneGeometry(.73,.973),new THREE.MeshStandardMaterial({map:photo,roughness:.9}),[-1.54,2.19,-3.735]);
  }
  // Rasterize system-font glyphs into extruded horizontal strokes. Unlike a flat
  // text texture, every stroke has front/back/side faces and casts a real shadow.
  function text3D(text,width,pos){
    if(typeof document==='undefined')return null;
    const canvas=document.createElement('canvas');canvas.width=1800;canvas.height=120;
    const ctx=canvas.getContext('2d');ctx.font='bold 72px Tahoma, sans-serif';
    const measured=ctx.measureText(text).width;
    const rasterWidth=Math.min(1750,Math.ceil(measured)+12);canvas.width=rasterWidth;
    ctx.font='bold 72px Tahoma, sans-serif';ctx.fillStyle='#fff';ctx.textBaseline='alphabetic';ctx.fillText(text,6,85,rasterWidth-12);
    const image=ctx.getImageData(0,0,rasterWidth,120),vertices=[],normals=[];
    const pixel=width/rasterWidth,depth=.022,step=2;
    function quad(a,b,c,d,n){for(const p of [a,b,c,a,c,d]){vertices.push(...p);normals.push(...n);}}
    for(let y=0;y<120;y+=step){let x=0;while(x<rasterWidth){
      while(x<rasterWidth&&image.data[(y*rasterWidth+x)*4+3]<95)x++;
      const start=x;while(x<rasterWidth&&image.data[(y*rasterWidth+x)*4+3]>=95)x++;
      if(start===x)continue;
      const l=start*pixel-width/2,r=x*pixel-width/2,t=(60-y)*pixel,b=(60-y-step)*pixel;
      quad([l,b,depth],[r,b,depth],[r,t,depth],[l,t,depth],[0,0,1]);
      quad([r,b,0],[l,b,0],[l,t,0],[r,t,0],[0,0,-1]);
      quad([l,b,0],[l,b,depth],[l,t,depth],[l,t,0],[-1,0,0]);
      quad([r,b,depth],[r,b,0],[r,t,0],[r,t,depth],[1,0,0]);
      quad([l,t,depth],[r,t,depth],[r,t,0],[l,t,0],[0,1,0]);
      quad([l,b,0],[r,b,0],[r,b,depth],[l,b,depth],[0,-1,0]);
    }}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geo.computeBoundingBox();
    return mesh(profile,'3D text: '+text,geo,textMat,pos);
  }
  const rows=[['สิทธิศักดิ์ บุษบก',1.75],['6621650469',1.32],['สาขา วิทยาการคอมพิวเตอร์',2.09],['คณะ ศิลปศาสตร์และวิทยาศาสตร์',2.14],['มหาวิทยาลัยเกษตรศาสตร์',2.06]];
  rows.forEach((r,i)=>text3D(r[0],r[1],[.2,2.49-i*.23,-3.727]));
  find('Portfolio screen').userData={action:'projects',label:'Portfolio / ผลงาน 3 ชิ้น'};
  find('Monitor frame').userData={action:'projects',label:'Portfolio / ผลงาน 3 ชิ้น'};
  const screen=find('Portfolio screen').material;
  if(typeof document!=='undefined'){
    const c=document.createElement('canvas');c.width=768;c.height=448;const ctx=c.getContext('2d');
    ctx.fillStyle='#101c29';ctx.fillRect(0,0,768,448);
    ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillStyle='#8de1ee';ctx.font='bold 42px Tahoma,sans-serif';ctx.fillText('SELECTED WORK / 03',42,64);
    const names=['01 / Electrode — Desmos','02 / My Paint','03 / Character PBR'];
    ctx.font='30px Tahoma,sans-serif';names.forEach((name,i)=>{ctx.fillStyle='#233345';ctx.fillRect(34,108+i*80,700,62);ctx.fillStyle='#e0eef7';ctx.fillText(name,52,139+i*80);});
    ctx.fillStyle='#8de1ee';ctx.font='24px Tahoma,sans-serif';ctx.fillText('CLICK TO EXPLORE  >',42,403);
    screen.map.dispose();screen.map=new THREE.CanvasTexture(c);screen.map.encoding=THREE.sRGBEncoding;screen.needsUpdate=true;
  }
  screen.color.setHex(0xffffff);screen.emissive.setHex(0xffffff);
  screen.emissiveMap=screen.map;screen.emissiveIntensity=.55;
  const garageSign=find('Garage sign').material;
  garageSign.color.setHex(0xffffff);garageSign.emissive.setHex(0xffffff);
  garageSign.emissiveMap=garageSign.map;garageSign.emissiveIntensity=.12;
  const rails=group('Architectural light strips');
  box(rails,'Back light strip',[7.2,.028,.026],[0,3.25,-3.8],accent);
  box(rails,'Workbench light strip',[1.8,.02,.025],[2.63,.956,-2.04],accent);
  for(const x of [-3.55,3.55])box(rails,'Front marker light',[.025,1.5,.026],[x,1.15,3.48],accent);


  // GPU animation displaces vertices every frame, with the top edge anchored.
  const shaderUniforms={uTime:{value:0},uAmplitude:{value:.12}};
  const clothMat=new THREE.ShaderMaterial({uniforms:shaderUniforms,side:THREE.DoubleSide,
    vertexShader:'uniform float uTime; uniform float uAmplitude; varying vec2 vUv; varying float vWave; void main(){vUv=uv;vec3 p=position;float anchor=pow(1.0-uv.y,1.5);float wave=sin(p.x*7.0-uTime*2.2)+0.45*sin(p.y*10.0+uTime*1.7);p.z+=wave*uAmplitude*anchor;p.x+=sin(uTime*1.3+p.y*5.0)*uAmplitude*0.2*anchor;vWave=wave;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}',
    fragmentShader:'varying vec2 vUv; varying float vWave; void main(){float edge=step(0.035,vUv.x)*step(vUv.x,0.965)*step(0.045,vUv.y)*step(vUv.y,0.955);float stripe=step(0.12,mod(vUv.x*7.0+vUv.y*3.0,1.0));vec3 dark=vec3(0.06,0.10,0.15);vec3 cyan=vec3(0.27,0.7,0.78);vec3 col=mix(cyan,mix(dark,cyan*0.8,stripe*0.22),edge);col*=0.88+0.12*vWave;gl_FragColor=vec4(col,1.0);}'
  });
  const flag=group('Vertex shader cloth','shader','ธงโรงรถ / Vertex shader');
  mesh(flag,'GPU-deformed cloth',new THREE.PlaneGeometry(1.1,.65,40,24),clothMat,[-3.48,2.76,-1.0]).rotation.y=Math.PI/2;
  box(flag,'Cloth mounting bar',[.035,.045,1.18],[-3.48,3.105,-1],steel);
  return {room,shaderUniforms};
}
