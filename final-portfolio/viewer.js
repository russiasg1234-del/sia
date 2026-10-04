(() => {
  'use strict';
  const $=selector=>document.querySelector(selector),status=$('#status');
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x101418);
  const camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,.1,80);
  const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);
  renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;document.body.appendChild(renderer.domElement);
  const ambient=new THREE.HemisphereLight(0xb5d7f5,0x18202c,.8);scene.add(ambient);
  const key=new THREE.DirectionalLight(0xd8eaff,2);key.position.set(3,8,6);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-6,right:6,top:6,bottom:-6});key.shadow.bias=-.0004;key.shadow.normalBias=.025;scene.add(key);
  const fill=new THREE.DirectionalLight(0x75bbd4,.8);fill.position.set(-4,4,2);scene.add(fill);
  const workLight=new THREE.PointLight(0xc8f2ff,3.5,9,2);workLight.position.set(.15,3.15,-2.98);scene.add(workLight);
  const rim=new THREE.PointLight(0xa3c5ff,2,9,2);rim.position.set(-2,3,-1.5);scene.add(rim);
  const garage=createDarkGarage(THREE);scene.add(garage.room);
  const reflectionTarget=new THREE.WebGLCubeRenderTarget(128,{generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter});
  const reflectionCamera=new THREE.CubeCamera(.1,40,reflectionTarget);reflectionCamera.position.set(.5,1.8,.3);reflectionCamera.update(renderer,scene);
  const pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromCubemap(reflectionTarget.texture);scene.environment=environment.texture;pmrem.dispose();reflectionTarget.dispose();
  status.textContent='พร้อมสำรวจ · คลิกสวิตช์ไฟ กรอบรูป จอ หรือธง';
  const controls=new THREE.OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=2.4;controls.maxDistance=24;controls.maxPolarAngle=Math.PI/2-.02;
  function home(){camera.position.set(9.5,7.3,11.5);controls.target.set(0,1,.1);controls.update();}
  home();
  function top(){camera.position.set(0,15,.001);controls.target.set(0,0,0);controls.update();}
  let lightsOn=true;
  function setLights(on){
    lightsOn=on;
    ambient.intensity=on?.8:.28;key.intensity=on?2:.65;fill.intensity=on?.8:.25;workLight.intensity=on?3.5:0;rim.intensity=on?2:0;
    garage.ceilingLamp.material.emissiveIntensity=on?1.7:0;
    garage.ceilingLamp.material.color.setHex(on?0xe0f5ff:0x38444c);
    garage.accent.emissiveIntensity=on?.8:0;
    garage.accent.color.setHex(on?0x92dce7:0x34444b);
    garage.switchLever.position.y=on?.035:-.035;garage.switchLever.rotation.z=on?-.2:.2;
    garage.switchIndicator.material.emissiveIntensity=on?2:0;
    garage.switchIndicator.material.color.setHex(on?0x90e7f2:0x39454b);
    garage.lightSwitch.userData.label=on?'สวิตช์ไฟโรงรถ / คลิกเพื่อปิด':'สวิตช์ไฟโรงรถ / คลิกเพื่อเปิด';
  }
  const dialog=$('#detail');let previousFocus=null;
  const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const projectsHTML='<p class="project-intro">ผลงานด้านกราฟิก 2D, โปรแกรมวาดภาพ และการแสดงโมเดล 3D</p>'+(window.PORTFOLIO_PROJECTS||[]).map((project,index)=>'<article class="project-card"><div class="project-top"><span class="project-number">0'+(index+1)+'</span><span class="project-category">'+escapeHTML(project.category)+'</span></div><h3>'+escapeHTML(project.title)+'</h3><p>'+escapeHTML(project.description)+'</p><div class="project-tools">'+escapeHTML(project.tools)+'</div><a class="project-link" href="'+escapeHTML(project.url)+'" target="_blank" rel="noopener noreferrer" aria-label="เปิดผลงาน '+escapeHTML(project.title)+' ในแท็บใหม่">เปิดผลงาน ↗</a></article>').join('')+'<p class="project-note">เปิดผลงานในแท็บใหม่ ต้องเชื่อมต่ออินเทอร์เน็ตเพื่อดูเว็บไซต์ปลายทาง</p>';
  const content={
    profile:{kicker:'01 / ABOUT ME',title:'สิทธิศักดิ์ บุษบก',html:'<img class="portrait" id="profile-image" alt="รูปโปรไฟล์ของสิทธิศักดิ์"><p>Sittisak Busabuk<br>Computer Science Student</p><div class="dialog-clear"></div><dl><dt>รหัสนักศึกษา</dt><dd>6621650469</dd><dt>สาขา</dt><dd>วิทยาการคอมพิวเตอร์</dd><dt>คณะ</dt><dd>ศิลปศาสตร์และวิทยาศาสตร์</dd><dt>มหาวิทยาลัย</dt><dd>มหาวิทยาลัยเกษตรศาสตร์</dd></dl>'},
    projects:{kicker:'02 / SELECTED WORK',title:'Portfolio / 3 Projects',html:projectsHTML},
    shader:{kicker:'03 / REAL-TIME VERTEX SHADER',title:'ปรับแรงลมของธง',html:'<div class="settings"><button id="motion-toggle">หยุดการเคลื่อนไหว</button><label for="amplitude">แรงลม <output id="amplitude-value">0.12</output></label><input id="amplitude" type="range" min="0" max="0.20" step="0.01" value="0.12"></div>'}
  };
  function showDetail(action){
    const item=content[action];if(!item)return;
    previousFocus=document.activeElement;$('#detail-kicker').textContent=item.kicker;$('#detail-title').textContent=item.title;$('#detail-body').innerHTML=item.html;
    if(action==='profile')$('#profile-image').src=window.PROFILE_PORTRAIT;
    if(action==='shader'){const button=$('#motion-toggle');button.textContent=motion?'หยุดการเคลื่อนไหว':'เล่นการเคลื่อนไหว';button.addEventListener('click',()=>{motion=!motion;button.textContent=motion?'หยุดการเคลื่อนไหว':'เล่นการเคลื่อนไหว';});const range=$('#amplitude');range.value=garage.shaderUniforms.uAmplitude.value;$('#amplitude-value').value=range.value;range.addEventListener('input',()=>{garage.shaderUniforms.uAmplitude.value=Number(range.value);$('#amplitude-value').value=range.value;});}
    if(!dialog.open)dialog.showModal();document.body.classList.add('inspecting');controls.enabled=false;$('#tooltip').style.display='none';
  }
  $('#close-detail').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{document.body.classList.remove('inspecting');controls.enabled=true;if(previousFocus&&previousFocus.focus)previousFocus.focus();});
  addEventListener('keydown',event=>{
    if(dialog.open||/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName||''))return;
    const key=event.key.toLowerCase();
    if(key==='1')showDetail('profile');else if(key==='2')showDetail('projects');else if(key==='3')showDetail('shader');
    else if(key==='l')setLights(!lightsOn);else if(key==='h')home();else if(key==='t')top();
  });
  // Raycast real meshes, then resolve their interactive ancestor.
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),tooltip=$('#tooltip');let pointerStart=null;
  function pick(event){const rect=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(garage.room.children,true)[0];if(!hit)return null;let object=hit.object;while(object){if(object.userData.action)return object;object=object.parent;}return null;}
  renderer.domElement.addEventListener('pointerdown',event=>{if(event.button!==0)return;pointerStart={x:event.clientX,y:event.clientY,id:event.pointerId,time:performance.now()};});
  renderer.domElement.addEventListener('pointerup',event=>{if(!pointerStart||pointerStart.id!==event.pointerId)return;const tap=Math.hypot(event.clientX-pointerStart.x,event.clientY-pointerStart.y)<7&&performance.now()-pointerStart.time<800;pointerStart=null;if(tap&&!dialog.open){const object=pick(event);if(object){if(object.userData.action==='light')setLights(!lightsOn);else showDetail(object.userData.action);}}});
  renderer.domElement.addEventListener('pointercancel',()=>{pointerStart=null;});
  renderer.domElement.addEventListener('pointermove',event=>{if(dialog.open||event.pointerType==='touch'||event.buttons)return;const object=pick(event);renderer.domElement.style.cursor=object?'pointer':'grab';tooltip.style.display=object?'block':'none';if(object){tooltip.textContent=object.userData.label+' · คลิก';tooltip.style.left=Math.min(event.clientX+16,innerWidth-260)+'px';tooltip.style.top=Math.min(event.clientY+16,innerHeight-55)+'px';}});
  renderer.domElement.addEventListener('pointerleave',()=>{tooltip.style.display='none';});
  let motion=!matchMedia('(prefers-reduced-motion: reduce)').matches,shaderTime=0;const clock=new THREE.Clock();
  addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
  renderer.setAnimationLoop(()=>{const dt=Math.min(clock.getDelta(),.05);if(motion)shaderTime+=dt;garage.shaderUniforms.uTime.value=shaderTime;controls.update();renderer.render(scene,camera);});
  // Diagnostics for geometry and interaction tests; not required by the UI.
  window.GARAGE_DEBUG={scene,garage,camera,renderer,controls,showDetail,pick,home,top,setLights};
})();
