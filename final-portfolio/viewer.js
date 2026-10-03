(() => {
  'use strict';
  const $=selector=>document.querySelector(selector),status=$('#status');
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x101418);
  const camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,.1,80);
  const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);
  renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;document.body.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xb5d7f5,0x18202c,.8));
  const key=new THREE.DirectionalLight(0xd8eaff,2);key.position.set(3,8,6);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-6,right:6,top:6,bottom:-6});key.shadow.bias=-.0004;key.shadow.normalBias=.025;scene.add(key);
  const fill=new THREE.DirectionalLight(0x75bbd4,.8);fill.position.set(-4,4,2);scene.add(fill);
  const workLight=new THREE.PointLight(0x92dbe9,2.5,8,2);workLight.position.set(1.6,3,-2.4);scene.add(workLight);
  const rim=new THREE.PointLight(0xa3c5ff,2,9,2);rim.position.set(-2,3,-1.5);scene.add(rim);
  const garage=createDarkGarage(THREE);scene.add(garage.room);
  const reflectionTarget=new THREE.WebGLCubeRenderTarget(128,{generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter});
  const reflectionCamera=new THREE.CubeCamera(.1,40,reflectionTarget);reflectionCamera.position.set(.5,1.8,.3);reflectionCamera.update(renderer,scene);
  const pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromCubemap(reflectionTarget.texture);scene.environment=environment.texture;pmrem.dispose();reflectionTarget.dispose();
  const models={},originalBarry=new Map();let loaded=0,failed=0,barryToon=false;
  function report(){status.textContent=failed?'บางโมเดลเปิดไม่สำเร็จ — ดูข้อความด้านล่าง':loaded===2?'พร้อมสำรวจ · คลิกวัตถุที่มีป้าย':'กำลังเตรียมโมเดล '+loaded+'/2';}
  function addModel(action,name,base64,fit,position){
    try{
      if(!base64)throw new Error('ไม่พบข้อมูลโมเดล');
      const binary=atob(base64),bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
      new THREE.GLTFLoader().parse(bytes.buffer,'',gltf=>{
        const model=gltf.scene;model.name=name;model.userData={action,label:name};
        const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
        const scale=fit.axis==='height'?fit.size/size.y:fit.size/Math.max(size.x,size.z);
        model.scale.setScalar(scale);model.position.set(position[0]-center.x*scale,-bounds.min.y*scale,position[2]-center.z*scale);
        model.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;if(action==='barry')originalBarry.set(o,o.material);}});
        garage.room.add(model);models[action]=model;loaded++;report();
      },error=>modelError(name,error));
    }catch(error){modelError(name,error);}
  }
  function modelError(name,error){failed++;report();$('#error').style.display='block';$('#error').textContent='เปิด '+name+' ไม่สำเร็จ: '+error.message;}
  addModel('car','McLaren F1 GTR Longtail',window.MCLAREN_GLB_BASE64,{axis:'length',size:4.2},[-.95,0,.1]);
  addModel('barry','Barry Burton',window.CHARACTER_GLB_BASE64,{axis:'height',size:1.75},[1.4,0,1.6]);
  const controls=new THREE.OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=2.4;controls.maxDistance=24;controls.maxPolarAngle=Math.PI/2-.02;
  function home(){camera.position.set(9.5,7.3,11.5);controls.target.set(0,1,.1);controls.update();}
  home();$('#home').addEventListener('click',home);
  $('#top').addEventListener('click',()=>{camera.position.set(0,15,.001);controls.target.set(0,0,0);controls.update();});
  const labels=new THREE.Group();labels.visible=false;scene.add(labels);
  garage.labels.forEach(item=>{
    const canvas=document.createElement('canvas');canvas.width=640;canvas.height=100;const ctx=canvas.getContext('2d');
    ctx.fillStyle='rgba(17,26,36,.96)';ctx.fillRect(0,0,640,100);ctx.strokeStyle='#7dcbd8';ctx.lineWidth=3;ctx.strokeRect(2,2,636,96);ctx.fillStyle='#dcebf1';ctx.font='30px Tahoma,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(item.text,320,50);
    const texture=new THREE.CanvasTexture(canvas);texture.encoding=THREE.sRGBEncoding;
    const label=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false,depthWrite:false}));label.position.set(...item.position);label.scale.set(1.8,.28,1);labels.add(label);
  });
  $('#labels').addEventListener('click',event=>{labels.visible=!labels.visible;event.currentTarget.textContent=labels.visible?'ซ่อนป้าย':'แสดงป้าย';event.currentTarget.setAttribute('aria-pressed',String(labels.visible));});
  const dialog=$('#detail');let previousFocus=null;
  const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const projectsHTML='<p class="project-intro">ผลงานด้านกราฟิก 2D, โปรแกรมวาดภาพ และการแสดงโมเดล 3D</p>'+(window.PORTFOLIO_PROJECTS||[]).map((project,index)=>'<article class="project-card"><div class="project-top"><span class="project-number">0'+(index+1)+'</span><span class="project-category">'+escapeHTML(project.category)+'</span></div><h3>'+escapeHTML(project.title)+'</h3><p>'+escapeHTML(project.description)+'</p><div class="project-tools">'+escapeHTML(project.tools)+'</div><a class="project-link" href="'+escapeHTML(project.url)+'" target="_blank" rel="noopener noreferrer" aria-label="เปิดผลงาน '+escapeHTML(project.title)+' ในแท็บใหม่">เปิดผลงาน ↗</a></article>').join('')+'<p class="project-note">เปิดผลงานในแท็บใหม่ ต้องเชื่อมต่ออินเทอร์เน็ตเพื่อดูเว็บไซต์ปลายทาง</p>';
  const content={
    profile:{kicker:'01 / ABOUT ME',title:'สิทธิศักดิ์ บุษบก',html:'<img class="portrait" id="profile-image" alt="รูปโปรไฟล์ของสิทธิศักดิ์"><p>Sittisak Busabuk<br>Computer Science Student</p><div class="dialog-clear"></div><dl><dt>รหัสนักศึกษา</dt><dd>6621650469</dd><dt>สาขา</dt><dd>วิทยาการคอมพิวเตอร์</dd><dt>คณะ</dt><dd>ศิลปศาสตร์และวิทยาศาสตร์</dd><dt>มหาวิทยาลัย</dt><dd>มหาวิทยาลัยเกษตรศาสตร์</dd></dl><p>ชื่อ รหัส สาขา คณะ และมหาวิทยาลัยบนผนังสร้างเป็น geometry 3D มีความหนาและเงา รูปถ่ายเป็น texture ในฉาก</p>'},
    projects:{kicker:'02 / SELECTED WORK',title:'Portfolio / 3 Projects',html:projectsHTML},
    car:{kicker:'03 / PHYSICALLY BASED RENDERING',title:'McLaren F1 GTR Longtail',html:'<p class="material-tag">PBR · Environment reflection · Real-time lighting</p><p>ใช้โมเดล McLaren ที่เตรียมผ่าน Blender ผิวสีรถ โลหะและยางตอบสนองต่อแสงและ environment ของโรงรถ หมุนกล้องเพื่อดูความแตกต่างของผิวแต่ละชนิด</p><p>โมเดลโดย vecarz · CC BY-NC-SA 4.0<br>ส่วนโรงรถและสิ่งปลูกสร้างสร้างเองทั้งหมด</p><a href="credits.html" target="_blank" rel="noopener">ดูเครดิตและเงื่อนไขการใช้โมเดล</a>'},
    barry:{kicker:'04 / CHARACTER',title:'Barry Burton',html:'<p>โมเดลตัวละครเดิมที่คุณเลือก เตรียมเป็น static mesh ผ่าน Blender และวางข้างรถ ท่าทางเป็น T-pose ของโมเดล ไม่ได้เพิ่ม animation เดิน</p><p>สลับดูระหว่างวัสดุ PBR ต้นฉบับและ cel shading ที่ยังเก็บ texture เดิม</p><button id="barry-style" aria-pressed="false">เปลี่ยนเป็น Cel shading</button>'},
    cel:{kicker:'05 / CEL SHADING',title:'Garage Bot',html:'<p>หุ่นโรงรถสร้างเองจาก geometry ใช้ MeshToonMaterial ร่วมกับ gradient map แบบ 4 ระดับและ NearestFilter จึงเห็นแถบสีของแสงชัดเจน พร้อมเส้นขอบสีดำแบบ inverted hull</p><p>สีไม่ได้ไล่แสงต่อเนื่องแบบวัสดุ PBR ลองสลับ Barry เป็น cel shading เพื่อเปรียบเทียบได้ด้วย</p>'},
    shader:{kicker:'06 / REAL-TIME VERTEX SHADER',title:'Garage Signal',html:'<p>ธงลายกราฟิกบนผนังซ้ายเป็นระนาบแบ่งย่อย 40 × 24 ช่อง vertex shader ขยับตำแหน่ง vertex ด้วยเวลาแบบ realtime โดยตรึงขอบบนไว้กับคาน</p><div class="settings"><button id="motion-toggle">หยุดการเคลื่อนไหว</button><label for="amplitude">แรงลม <output id="amplitude-value">0.12</output></label><input id="amplitude" type="range" min="0" max="0.20" step="0.01" value="0.12"></div>'}
  };
  function showDetail(action){
    const item=content[action];if(!item)return;
    previousFocus=document.activeElement;$('#detail-kicker').textContent=item.kicker;$('#detail-title').textContent=item.title;$('#detail-body').innerHTML=item.html;
    if(action==='profile')$('#profile-image').src=window.PROFILE_PORTRAIT;
    if(action==='barry'){const button=$('#barry-style');updateBarryButton(button);button.addEventListener('click',()=>{if(!models.barry){status.textContent='รอ Barry โหลดเสร็จก่อนครับ';return;}barryToon=!barryToon;originalBarry.forEach((material,mesh)=>{
      if(barryToon){const convert=m=>new THREE.MeshToonMaterial({color:m.color?m.color.clone():new THREE.Color(0xffffff),map:m.map||null,gradientMap:garage.gradientMap,side:m.side,transparent:m.transparent,opacity:m.opacity,alphaTest:m.alphaTest});mesh.material=Array.isArray(material)?material.map(convert):convert(material);}else{(Array.isArray(mesh.material)?mesh.material:[mesh.material]).forEach(m=>m.dispose());mesh.material=material;}
    });updateBarryButton(button);});}
    if(action==='shader'){const button=$('#motion-toggle');button.textContent=motion?'หยุดการเคลื่อนไหว':'เล่นการเคลื่อนไหว';button.addEventListener('click',()=>{motion=!motion;button.textContent=motion?'หยุดการเคลื่อนไหว':'เล่นการเคลื่อนไหว';});const range=$('#amplitude');range.value=garage.shaderUniforms.uAmplitude.value;$('#amplitude-value').value=range.value;range.addEventListener('input',()=>{garage.shaderUniforms.uAmplitude.value=Number(range.value);$('#amplitude-value').value=range.value;});}
    if(!dialog.open)dialog.showModal();document.body.classList.add('inspecting');controls.enabled=false;$('#tooltip').style.display='none';
  }
  function updateBarryButton(button){button.textContent=barryToon?'กลับเป็น PBR':'เปลี่ยนเป็น Cel shading';button.setAttribute('aria-pressed',String(barryToon));}
  $('#close-detail').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{document.body.classList.remove('inspecting');controls.enabled=true;if(previousFocus&&previousFocus.focus)previousFocus.focus();});
  document.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>showDetail(button.dataset.action)));
  // Raycast real meshes, then resolve their interactive ancestor.
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),tooltip=$('#tooltip');let pointerStart=null;
  function pick(event){const rect=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(garage.room.children,true)[0];if(!hit)return null;let object=hit.object;while(object){if(object.userData.action)return object;object=object.parent;}return null;}
  renderer.domElement.addEventListener('pointerdown',event=>{if(event.button!==0)return;pointerStart={x:event.clientX,y:event.clientY,id:event.pointerId,time:performance.now()};});
  renderer.domElement.addEventListener('pointerup',event=>{if(!pointerStart||pointerStart.id!==event.pointerId)return;const tap=Math.hypot(event.clientX-pointerStart.x,event.clientY-pointerStart.y)<7&&performance.now()-pointerStart.time<800;pointerStart=null;if(tap&&!dialog.open){const object=pick(event);if(object)showDetail(object.userData.action);}});
  renderer.domElement.addEventListener('pointercancel',()=>{pointerStart=null;});
  renderer.domElement.addEventListener('pointermove',event=>{if(dialog.open||event.pointerType==='touch'||event.buttons)return;const object=pick(event);renderer.domElement.style.cursor=object?'pointer':'grab';tooltip.style.display=object?'block':'none';if(object){tooltip.textContent=object.userData.label+' · คลิก';tooltip.style.left=Math.min(event.clientX+16,innerWidth-260)+'px';tooltip.style.top=Math.min(event.clientY+16,innerHeight-55)+'px';}});
  renderer.domElement.addEventListener('pointerleave',()=>{tooltip.style.display='none';});
  let motion=!matchMedia('(prefers-reduced-motion: reduce)').matches,shaderTime=0;const clock=new THREE.Clock();
  addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
  renderer.setAnimationLoop(()=>{const dt=Math.min(clock.getDelta(),.05);if(motion)shaderTime+=dt;garage.shaderUniforms.uTime.value=shaderTime;controls.update();renderer.render(scene,camera);});
  // Diagnostics for geometry and interaction tests; not required by the UI.
  window.GARAGE_DEBUG={scene,garage,camera,models,renderer,controls,showDetail,pick,home,getLoaded:()=>loaded};
})();
