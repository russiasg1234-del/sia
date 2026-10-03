(() => {
  const scene=new THREE.Scene();scene.background=new THREE.Color(0xd8d7d2);
  const camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,.1,80);
  const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;document.body.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xf3f6ff,0x6c6c62,.7));
  const light=new THREE.DirectionalLight(0xffecd5,1.3);light.position.set(3,8,6);light.castShadow=true;light.shadow.mapSize.set(2048,2048);Object.assign(light.shadow.camera,{left:-6,right:6,top:6,bottom:-6});light.shadow.bias=-.0004;light.shadow.normalBias=.025;scene.add(light);
  const fillLight=new THREE.DirectionalLight(0xc8d9ef,.45);fillLight.position.set(-2,5,3);scene.add(fillLight);
  const workLight=new THREE.PointLight(0xffd6a1,1.4,6,2);workLight.position.set(1.6,3,-2.4);scene.add(workLight);
  const blockout=createGarageProgress(THREE);scene.add(blockout.room);
  function addEmbeddedModel(name,base64,fit,position) {
    const binary=atob(base64),bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
    new THREE.GLTFLoader().parse(bytes.buffer,'',gltf=>{
      const model=gltf.scene;model.name=name;
      const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
      const scale=fit.axis==='height'?fit.size/size.y:fit.size/Math.max(size.x,size.z);
      model.scale.setScalar(scale);model.position.set(position[0]-center.x*scale,-bounds.min.y*scale,position[2]-center.z*scale);
      model.traverse(child=>{if(child.isMesh){child.castShadow=true;child.receiveShadow=true;}});
      blockout.room.add(model);
    },error=>{const box=document.querySelector('#error');box.style.display='block';box.textContent='เปิดโมเดล '+name+' ไม่สำเร็จ: '+error.message;});
  }
  addEmbeddedModel('McLaren F1 GTR Longtail',window.MCLAREN_GLB_BASE64,{axis:'length',size:4.2},[-.95,0,.1]);
  addEmbeddedModel('Barry Burton',window.CHARACTER_GLB_BASE64,{axis:'height',size:1.75},[1.4,0,1.6]);
  // Reflect the original garage geometry in the car paint and metal materials.
  const reflectionTarget=new THREE.WebGLCubeRenderTarget(128,{generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter});
  const reflectionCamera=new THREE.CubeCamera(.1,40,reflectionTarget);reflectionCamera.position.set(.5,1.8,.3);reflectionCamera.update(renderer,scene);
  const pmrem=new THREE.PMREMGenerator(renderer);const environment=pmrem.fromCubemap(reflectionTarget.texture);scene.environment=environment.texture;pmrem.dispose();reflectionTarget.dispose();
  const controls=new THREE.OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=6;controls.maxDistance=24;controls.maxPolarAngle=Math.PI/2-.02;
  function home(){camera.position.set(9.5,7.3,11.5);controls.target.set(0,1,.1);controls.update();}
  home();document.querySelector('#home').addEventListener('click',home);
  document.querySelector('#top').addEventListener('click',()=>{camera.position.set(0,15,.001);controls.target.set(0,0,0);controls.update();});
  const labels=new THREE.Group();labels.visible=false;scene.add(labels);
  blockout.labels.forEach(item=>{
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=90;
    const ctx=canvas.getContext('2d');ctx.fillStyle='rgba(255,255,255,.94)';ctx.fillRect(0,0,512,90);ctx.strokeStyle='#b7c1cb';ctx.lineWidth=3;ctx.strokeRect(1.5,1.5,509,87);ctx.fillStyle='#435260';ctx.font='30px system-ui, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(item.text,256,45);
    const texture=new THREE.CanvasTexture(canvas);texture.encoding=THREE.sRGBEncoding;
    const label=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false,depthWrite:false}));label.position.set(...item.position);label.scale.set(1.65,.29,1);labels.add(label);
  });
  document.querySelector('#labels').addEventListener('click',event=>{labels.visible=!labels.visible;event.currentTarget.textContent=labels.visible?'ซ่อนป้าย':'แสดงป้าย';});
  addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
  renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera);});
})();
