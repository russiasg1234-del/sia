/* Adapted scene structure: PBR character + controls + material panel + construction background. */
(() => {
  document.body.style.cssText = 'margin:0;overflow:hidden;background:#111820;font-family:Arial,sans-serif';

  const loading = document.createElement('div');
  loading.textContent = 'Preparing character PBR scene…';
  loading.style.cssText = 'position:fixed;top:18px;left:18px;color:#fff;z-index:5;font-size:14px;text-shadow:0 1px 6px #000';
  // Render the scene directly; no loading screen or file-selection step.

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x819ab0);
  scene.fog = new THREE.Fog(0x819ab0, 22, 76);
  const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, .1, 200);
  camera.position.set(11, 9, 22);
  const renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(innerWidth, innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = .05;
  controls.maxPolarAngle = Math.PI / 2 - .02; controls.minDistance = 3; controls.maxDistance = 45;
  controls.target.set(0, 5, -3);

  const sky = new THREE.HemisphereLight(0xdcecff, 0x263027, 2.2); scene.add(sky);
  const sun = new THREE.DirectionalLight(0xfff3d8, 2.4); sun.position.set(8, 12, 6); sun.castShadow = true; sun.shadow.mapSize.set(2048,2048); sun.shadow.camera.left=-9; sun.shadow.camera.right=9; sun.shadow.camera.top=9; sun.shadow.camera.bottom=-9; sun.shadow.bias=-.0003; scene.add(sun);
  const cyan = new THREE.PointLight(0x70c9ff, 10, 22, 2); cyan.position.set(-7,5,4); scene.add(cyan);
  const warm = new THREE.PointLight(0xff934d, 8, 20, 2); warm.position.set(7,3,-7); scene.add(warm);

  const groundMat = new THREE.MeshStandardMaterial({color:0x29333a, roughness:.38, metalness:.55});
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(100,100), groundMat); ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
  const grid = new THREE.GridHelper(100, 100, 0x6d8fa5, 0x3c5361); grid.position.y=.012; grid.material.transparent=true; grid.material.opacity=.28; scene.add(grid);

  // Simple self-built five-storey building and a separate guard booth.
  const construction = new THREE.Group(); scene.add(construction);
  const concrete = new THREE.MeshStandardMaterial({color:0xc0c3c4,roughness:.85,metalness:0});
  const wall = new THREE.MeshStandardMaterial({color:0xe0e0d8,roughness:.9,metalness:0});
  const glass = new THREE.MeshStandardMaterial({color:0x506f82,roughness:.3,metalness:.25});
  const dark = new THREE.MeshStandardMaterial({color:0x414951,roughness:.7,metalness:.15});
  function box(parent, name, dimensions, position, material) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...dimensions), material);
    mesh.name=name; mesh.position.set(...position); mesh.castShadow=true; mesh.receiveShadow=true; parent.add(mesh); return mesh;
  }
  const building = new THREE.Group(); building.name='Five-storey building'; construction.add(building);
  const storeyHeight=2.5;
  for(let level=0;level<=5;level++) {
    box(building,'Floor slab '+level,[11.4,.18,5.4],[0,level*storeyHeight+.09,-7],concrete);
  }
  for(let floor=0;floor<5;floor++) {
    const base=floor*storeyHeight;
    box(building,'Storey '+(floor+1)+' rear wall',[11,2.32,.18],[0,base+1.34,-9.5],wall);
    for(const x of [-5.4,5.4]) {
      box(building,'Storey '+(floor+1)+' side wall',[.18,2.32,5],[x,base+1.34,-7],wall);
    }
    box(building,'Storey '+(floor+1)+' front wall',[11,2.32,.18],[0,base+1.34,-4.5],wall);
    for(const x of [-3.7,0,3.7]) {
      box(building,'Storey '+(floor+1)+' window',[2,1.3,.08],[x,base+1.45,-4.35],glass);
      box(building,'Window divider',[.07,1.3,.1],[x,base+1.45,-4.29],concrete);
    }
  }
  box(building,'Main entrance',[1.4,2,.12],[0,1.1,-4.24],dark);
  const booth = new THREE.Group(); booth.name='Guard booth'; booth.position.set(-2,0,1); construction.add(booth);
  box(booth,'Booth base',[2.6,.16,2.4],[0,.08,0],concrete);
  box(booth,'Booth front lower wall',[2.4,.95,.15],[0,.635,1.05],wall);
  box(booth,'Booth rear wall',[2.4,2.2,.15],[0,1.26,-1.05],wall);
  box(booth,'Booth left wall',[.15,2.2,2.1],[-1.125,1.26,0],wall);
  box(booth,'Booth right wall',[.15,2.2,2.1],[1.125,1.26,0],wall);
  box(booth,'Guard window',[2.08,.9,.08],[0,1.56,1.05],glass);
  for(const x of [-1.125,1.125])box(booth,'Window post',[.15,1.25,.15],[x,1.735,1.05],concrete);
  box(booth,'Booth roof',[2.8,.2,2.6],[0,2.46,0],dark);
  box(booth,'Booth door',[.08,1.95,.8],[1.22,1.14,-.3],dark);

  // Capture the self-built environment for PBR reflections on the character.
  const reflectionTarget = new THREE.WebGLCubeRenderTarget(128, {generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter});
  const reflectionCamera = new THREE.CubeCamera(.1,100,reflectionTarget);
  reflectionCamera.position.set(0,2,0); reflectionCamera.update(renderer,scene);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const reflectionMap = pmrem.fromCubemap(reflectionTarget.texture);
  scene.environment = reflectionMap.texture;
  reflectionTarget.dispose(); pmrem.dispose();


  const loader = new THREE.GLTFLoader();
  const characterMaterials = [];
  const materialOptions = {roughnessScale:1,metalnessScale:1};
  function updateCharacterMaterials() {
    characterMaterials.forEach(item=>{item.material.roughness=Math.min(1,item.roughness*materialOptions.roughnessScale);item.material.metalness=Math.min(1,item.metalness*materialOptions.metalnessScale);});
  }
  const encoded = window.CHARACTER_GLB_BASE64;
  const raw = atob(encoded); const bytes = new Uint8Array(raw.length); for(let i=0;i<raw.length;i++) bytes[i]=raw.charCodeAt(i);
  loader.parse(bytes.buffer, '', (gltf) => {
    const model=gltf.scene;
    const box=new THREE.Box3().setFromObject(model), size=box.getSize(new THREE.Vector3());
    const scale=1.85/size.y, center=box.getCenter(new THREE.Vector3());
    model.scale.setScalar(scale);
    model.position.set(1-center.x*scale,-box.min.y*scale,1.4-center.z*scale);
    model.name='Barry beside guard booth';
    const seen=new Set();
    model.traverse(n=>{if(n.isMesh){n.castShadow=true;n.receiveShadow=true;(Array.isArray(n.material)?n.material:[n.material]).forEach(material=>{if(material.isMeshStandardMaterial&&!seen.has(material)){seen.add(material);characterMaterials.push({material,roughness:material.roughness,metalness:material.metalness});}});}}); scene.add(model);
  }, (error) => { const box=document.getElementById('error');box.style.display='block';box.textContent='ไม่สามารถอ่านโมเดล Barry: '+error.message; });

  const gui = new dat.GUI({width:310}); gui.domElement.style.marginTop='10px';
  const lights = gui.addFolder('PBR Properties & Lighting'); lights.add(sun.position,'x',-15,15,.1).name('Main light X'); lights.add(sun.position,'y',0,20,.1).name('Main light Y'); lights.add(sun,'intensity',0,8,.1).name('Main intensity'); lights.add(renderer,'toneMappingExposure',.2,2.5,.05).name('Exposure');
  const floor = gui.addFolder('Building ground PBR'); floor.add(groundMat,'roughness',0,1,.05).name('Roughness'); floor.add(groundMat,'metalness',0,1,.05).name('Metalness');
  const characterFolder=gui.addFolder('Character PBR'); characterFolder.add(materialOptions,'roughnessScale',0,2,.05).name('Roughness scale').onChange(updateCharacterMaterials); characterFolder.add(materialOptions,'metalnessScale',0,2,.05).name('Metalness scale').onChange(updateCharacterMaterials);
  lights.open();
  const views={
    overview(){camera.position.set(11,9,22);controls.target.set(0,5,-3);controls.update();},
    guardBooth(){camera.position.set(5,3.3,8);controls.target.set(-.5,1.2,1);controls.update();}
  };
  const viewFolder=gui.addFolder('Camera views');viewFolder.add(views,'overview').name('ตึก 5 ชั้นทั้งหมด');viewFolder.add(views,'guardBooth').name('ป้อมยามและ Barry');viewFolder.open();

  function animate(){ requestAnimationFrame(animate); controls.update(); renderer.render(scene,camera); } animate();
  addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
})();
