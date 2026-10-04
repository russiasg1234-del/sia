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
  status.textContent='พร้อมสำรวจ · คลิกวัตถุเพื่อดูข้อมูล';
  const controls=new THREE.OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=2.4;controls.maxDistance=24;controls.maxPolarAngle=Math.PI/2-.02;
  function home(){camera.position.set(9.5,7.3,11.5);controls.target.set(0,1,.1);controls.update();}
  home();$('#home').addEventListener('click',home);
  $('#top').addEventListener('click',()=>{camera.position.set(0,15,.001);controls.target.set(0,0,0);controls.update();});
  const dialog=$('#detail');let previousFocus=null;
  const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const projectsHTML='<p class="project-intro">ผลงานด้านกราฟิก 2D, โปรแกรมวาดภาพ และการแสดงโมเดล 3D</p>'+(window.PORTFOLIO_PROJECTS||[]).map((project,index)=>'<article class="project-card"><div class="project-top"><span class="project-number">0'+(index+1)+'</span><span class="project-category">'+escapeHTML(project.category)+'</span></div><h3>'+escapeHTML(project.title)+'</h3><p>'+escapeHTML(project.description)+'</p><div class="project-tools">'+escapeHTML(project.tools)+'</div><a class="project-link" href="'+escapeHTML(project.url)+'" target="_blank" rel="noopener noreferrer" aria-label="เปิดผลงาน '+escapeHTML(project.title)+' ในแท็บใหม่">เปิดผลงาน ↗</a></article>').join('')+'<p class="project-note">เปิดผลงานในแท็บใหม่ ต้องเชื่อมต่ออินเทอร์เน็ตเพื่อดูเว็บไซต์ปลายทาง</p>';
  const content={
    equipment:{kicker:'04 / SIMPLE WORKSHOP PROPS',title:'อุปกรณ์โรงรถ',html:'<p>ของใช้โรงรถแบบเรียบง่าย: ยางอะไหล่ กรวยจราจร แม่แรง แผ่นนอนซ่อมรถ ถังดับเพลิง และนาฬิกาผนัง</p><p>ประกอบเองจากกล่อง ทรงกระบอก วงแหวนและท่อใน Three.js ไม่ได้ดาวน์โหลดโมเดลสำเร็จรูป ชั้นวางยังโล่ง และไม่มีรถ ตัวละคร หรือตู้เครื่องมือ</p><p class="material-tag">PBR: ยาง โลหะ และผิวอุปกรณ์<br>Cel shading: กรวยสีส้ม / แถบขาว</p><p>กรวยใช้ MeshToonMaterial กับ gradient map 4 ระดับแบบ NearestFilter ให้แสงเป็นแถบสี แทนการใช้ตัวละคร</p>'},
    profile:{kicker:'01 / ABOUT ME',title:'สิทธิศักดิ์ บุษบก',html:'<img class="portrait" id="profile-image" alt="รูปโปรไฟล์ของสิทธิศักดิ์"><p>Sittisak Busabuk<br>Computer Science Student</p><div class="dialog-clear"></div><dl><dt>รหัสนักศึกษา</dt><dd>6621650469</dd><dt>สาขา</dt><dd>วิทยาการคอมพิวเตอร์</dd><dt>คณะ</dt><dd>ศิลปศาสตร์และวิทยาศาสตร์</dd><dt>มหาวิทยาลัย</dt><dd>มหาวิทยาลัยเกษตรศาสตร์</dd></dl><p>ชื่อ รหัส สาขา คณะ และมหาวิทยาลัยบนผนังสร้างเป็น geometry 3D มีความหนาและเงา รูปถ่ายเป็น texture ในฉาก</p>'},
    projects:{kicker:'02 / SELECTED WORK',title:'Portfolio / 3 Projects',html:projectsHTML},
    shader:{kicker:'03 / REAL-TIME VERTEX SHADER',title:'Garage Signal',html:'<p>ธงลายกราฟิกบนผนังซ้ายเป็นระนาบแบ่งย่อย 40 × 24 ช่อง vertex shader ขยับตำแหน่ง vertex ด้วยเวลาแบบ realtime โดยตรึงขอบบนไว้กับคาน</p><div class="settings"><button id="motion-toggle">หยุดการเคลื่อนไหว</button><label for="amplitude">แรงลม <output id="amplitude-value">0.12</output></label><input id="amplitude" type="range" min="0" max="0.20" step="0.01" value="0.12"></div>'}
  };
  function showDetail(action){
    const item=content[action];if(!item)return;
    previousFocus=document.activeElement;$('#detail-kicker').textContent=item.kicker;$('#detail-title').textContent=item.title;$('#detail-body').innerHTML=item.html;
    if(action==='profile')$('#profile-image').src=window.PROFILE_PORTRAIT;
    if(action==='shader'){const button=$('#motion-toggle');button.textContent=motion?'หยุดการเคลื่อนไหว':'เล่นการเคลื่อนไหว';button.addEventListener('click',()=>{motion=!motion;button.textContent=motion?'หยุดการเคลื่อนไหว':'เล่นการเคลื่อนไหว';});const range=$('#amplitude');range.value=garage.shaderUniforms.uAmplitude.value;$('#amplitude-value').value=range.value;range.addEventListener('input',()=>{garage.shaderUniforms.uAmplitude.value=Number(range.value);$('#amplitude-value').value=range.value;});}
    if(!dialog.open)dialog.showModal();document.body.classList.add('inspecting');controls.enabled=false;$('#tooltip').style.display='none';
  }
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
  window.GARAGE_DEBUG={scene,garage,camera,renderer,controls,showDetail,pick,home};
})();
