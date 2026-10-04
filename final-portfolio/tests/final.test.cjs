/* Logic/geometry test: real Three and GLTFLoader, mocked browser/GPU/raster. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const html=read('index.html');
for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){if(!/^(https?:|data:)/.test(match[1]))assert(fs.existsSync(path.join(root,match[1])),match[1]);}
const elements=new Map(),nav=[];
function element(id){return {id,style:{},dataset:{},listeners:{},attributes:{},textContent:'',value:'',open:false,
  addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);},emit(type,event={}){for(const fn of this.listeners[type]||[])fn({currentTarget:this,...event});},
  setAttribute(k,v){this.attributes[k]=v;},focus(){document.activeElement=this;},showModal(){this.open=true;},close(){this.open=false;this.emit('close');},
  getBoundingClientRect(){return {left:0,top:0,width:1200,height:800};},
  set innerHTML(value){this.html=value;for(const m of value.matchAll(/id="([^"]+)"/g))elements.set(m[1],element(m[1]));},get innerHTML(){return this.html||'';}};}
for(const m of html.matchAll(/id="([^"]+)"/g))elements.set(m[1],element(m[1]));
for(const m of html.matchAll(/data-action="([^"]+)"/g)){const b=element(m[1]);b.dataset.action=m[1];nav.push(b);}
function canvas(){const el=element('canvas');el.width=512;el.height=512;const ctx={fillRect(){},strokeRect(){},beginPath(){},moveTo(){},lineTo(){},bezierCurveTo(){},stroke(){},fillText(){},measureText(text){return {width:text.length*42};},
  // Synthetic strokes exercise mesh extrusion, not Thai font rendering.
  getImageData(x,y,w,h){const data=new Uint8ClampedArray(w*h*4);for(let yy=35;yy<85;yy++)for(let xx=8;xx<w-8;xx++)if(xx%34<18)data[(yy*w+xx)*4+3]=255;return {data};}};el.getContext=()=>ctx;return el;}
const document={activeElement:null,body:{appendChild(){},classList:{add(){},remove(){}}},querySelector(selector){return elements.get(selector.slice(1));},querySelectorAll(){return nav;},createElement:()=>canvas()};
const context=vm.createContext({console,document,innerWidth:1200,innerHeight:800,devicePixelRatio:1,Uint8Array,Uint8ClampedArray,ArrayBuffer,TextDecoder,TextEncoder,Blob,URL,performance,setTimeout,clearTimeout,queueMicrotask,atob,addEventListener(){},matchMedia:()=>({matches:false})});context.window=context;context.self=context;
vm.runInContext(read('vendor/three.min.js'),context);
const T=context.THREE;
T.TextureLoader.prototype.load=function(url,onLoad){const tex=new T.Texture();tex.image={width:1,height:1};queueMicrotask(()=>onLoad?.(tex));return tex;};
T.WebGLRenderer=class{constructor(){this.domElement=canvas();this.shadowMap={};}setPixelRatio(){}setSize(){}setAnimationLoop(fn){this.frame=fn;}render(scene,camera){scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);}};
T.CubeCamera.prototype.update=function(){};
T.PMREMGenerator=class{fromCubemap(){return {texture:new T.Texture()};}dispose(){}};
T.OrbitControls=class{constructor(camera){this.camera=camera;this.target=new T.Vector3();this.enabled=true;}update(){this.camera.lookAt(this.target);this.camera.updateMatrixWorld(true);}};
for(const file of ['portrait-data.js','projects-data.js','garage-progress.js','garage-props.js','garage-final.js','viewer.js'])vm.runInContext(read(file),context,{filename:file});
(async()=>{
  const debug=context.GARAGE_DEBUG;
  assert(!html.includes('src="barry-data.js"'));assert(!html.includes('src="mclaren-data.js"'));assert(!html.includes('data-action="car"'));assert(!html.includes('data-action="barry"'));assert(!html.includes('data-action="equipment"'));
  const room=debug.garage.room;room.updateMatrixWorld(true);
  const bounds=new T.Box3().setFromObject(room),size=bounds.getSize(new T.Vector3());assert(size.x<=10&&size.z<=10,'Within assignment footprint');
  const shelf=room.getObjectByName('Open tool shelf');assert.equal(shelf.children.length,6,'Shelf only posts and boards');
  assert(!room.getObjectByName('Original terracotta coupe'));assert(!room.getObjectByName('Workshop helper character'));
  const text=[];room.traverse(o=>{if(o.name.startsWith('3D text:'))text.push(o);if(o.isMesh){assert(o.geometry.attributes.position);for(const v of o.geometry.attributes.position.array)assert(Number.isFinite(v));}});
  assert.equal(text.length,5);for(const mesh of text){assert(mesh.geometry.attributes.position.count>100);assert(mesh.geometry.boundingBox.max.z-mesh.geometry.boundingBox.min.z>.02);}
  assert.equal(room.getObjectByName('Student portrait texture').material.map.encoding,T.sRGBEncoding);
  assert.equal(room.getObjectByName('Floor 8x8').material.color.getHex(),0x444e59);
  assert(!room.getObjectByName('Original cel-shaded garage robot'));assert(!room.getObjectByName('Robot body'));
  assert(!room.getObjectByName('McLaren F1 GTR Longtail'));assert(!room.getObjectByName('Barry Burton'));assert(!html.includes('id="labels"'));assert(!html.includes('data-action="cel"'));
  room.traverse(o=>assert(!['car','barry'].includes(o.userData.action)));
  assert(room.getObjectByName('Floor 8x8').material.isMeshStandardMaterial);
  for(const name of ['Stacked spare tires','Basic floor jack','Mechanic creeper','Fire extinguisher','Simple wall clock'])assert(room.getObjectByName(name),name);
  assert(!room.getObjectByName('Simple garage equipment').userData.action,'Garage props are decorative, not a detail popup');
  assert(!room.getObjectByName('Cel-shaded traffic cone 1'));assert(!room.getObjectByName('Cel-shaded traffic cone 2'));
  const extinguisher=room.getObjectByName('Fire extinguisher');
  const toonMaterial=extinguisher.getObjectByName('Extinguisher body').material;assert(toonMaterial.isMeshToonMaterial);assert.equal(toonMaterial.gradientMap.magFilter,T.NearestFilter);assert.equal(toonMaterial.gradientMap.image.data.length,4);
  const lightSwitch=room.getObjectByName('Wall light switch');assert.equal(lightSwitch.userData.action,'light');
  assert(room.getObjectByName('Back ceiling light'));assert(room.getObjectByName('Switch rocker'));
  const lightButton=elements.get('light-toggle');assert.equal(lightButton.attributes['aria-pressed'],undefined);
  lightButton.emit('click');assert.equal(debug.garage.ceilingLamp.material.emissiveIntensity,0);assert.equal(debug.garage.accent.emissiveIntensity,0);assert.equal(debug.garage.switchIndicator.material.emissiveIntensity,0);assert.equal(lightButton.attributes['aria-pressed'],'false');
  lightButton.emit('click');assert.equal(debug.garage.ceilingLamp.material.emissiveIntensity,1.7);assert.equal(lightButton.attributes['aria-pressed'],'true');
  assert(!debug.scene.children.some(o=>o.isSprite));assert(!read('viewer.js').includes('new THREE.Sprite'));
  const flag=room.getObjectByName('GPU-deformed cloth');assert.equal(flag.geometry.attributes.position.count,41*25);assert(flag.material.vertexShader.includes('p.z+='));
  debug.renderer.frame();const before=debug.garage.shaderUniforms.uTime.value;debug.renderer.frame();assert(debug.garage.shaderUniforms.uTime.value>=before);
  const dialog=elements.get('detail');
  for(const action of ['profile','projects','shader']){debug.showDetail(action);assert(dialog.open);assert(elements.get('detail-title').textContent);assert.equal(debug.controls.enabled,false);dialog.close();assert.equal(debug.controls.enabled,true);}
  debug.showDetail('projects');const projectHTML=elements.get('detail-body').innerHTML;
  const expectedURLs=['https://www.desmos.com/calculator/ii0ryabjgz','https://russiasg1234-del.github.io/sia/paint-assignment/','https://russiasg1234-del.github.io/sia/character-pbr/'];
  assert.equal(context.PORTFOLIO_PROJECTS.length,3);assert.equal((projectHTML.match(/class="project-card"/g)||[]).length,3);
  for(const url of expectedURLs)assert(projectHTML.includes('href="'+url+'"'));
  assert.equal((projectHTML.match(/rel="noopener noreferrer"/g)||[]).length,3);assert(!projectHTML.includes('รอรูป'));dialog.close();
  debug.showDetail('shader');assert(!elements.get('detail-body').innerHTML.includes('<p>'));assert(elements.get('detail-body').innerHTML.includes('id="amplitude"'));elements.get('amplitude').value='0.20';elements.get('amplitude').emit('input');assert.equal(debug.garage.shaderUniforms.uAmplitude.value,.2);elements.get('motion-toggle').emit('click');const paused=debug.garage.shaderUniforms.uTime.value;debug.renderer.frame();assert.equal(debug.garage.shaderUniforms.uTime.value,paused);elements.get('motion-toggle').emit('click');dialog.close();
  const targets=[['profile',[-1.54,2.19,-3.735],[-1.54,2.19,-1]],['projects',[2.5,1.59,-2.71],[2.5,1.59,-1.8]],['shader',[-3.48,2.76,-1],[-2.5,2.76,-1]]];
  const picks=[];
  for(const [action,target,eye]of targets){debug.camera.position.set(...eye);debug.camera.lookAt(new T.Vector3(...target));debug.camera.updateMatrixWorld(true);room.updateMatrixWorld(true);const picked=debug.pick({clientX:600,clientY:400});assert.equal(picked?.userData.action,action,`Raycast ${action}`);picks.push(action);}
  debug.camera.position.set(-2.7,1.4,1.75);debug.camera.lookAt(new T.Vector3(-3.76,1.4,1.75));debug.camera.updateMatrixWorld(true);room.updateMatrixWorld(true);
  assert.equal(debug.pick({clientX:600,clientY:400})?.userData.action,'light','Wall switch is pickable');
  const surface=debug.renderer.domElement;
  surface.emit('pointerdown',{button:0,pointerId:1,clientX:600,clientY:400});surface.emit('pointerup',{pointerId:1,clientX:600,clientY:400});
  assert.equal(debug.garage.ceilingLamp.material.emissiveIntensity,0);assert(!dialog.open,'Switch toggles directly without an info dialog');
  lightButton.emit('click');assert.equal(debug.garage.ceilingLamp.material.emissiveIntensity,1.7);
  debug.camera.position.set(-2.5,2.76,-1);debug.camera.lookAt(new T.Vector3(-3.48,2.76,-1));debug.camera.updateMatrixWorld(true);room.updateMatrixWorld(true);
  // Re-use the flag-facing camera to verify click, drag rejection and cancellation.
  surface.emit('pointerdown',{button:0,pointerId:1,clientX:600,clientY:400});surface.emit('pointerup',{pointerId:1,clientX:600,clientY:400});assert(dialog.open);assert.equal(elements.get('detail-title').textContent,'ปรับแรงลมของธง');dialog.close();
  surface.emit('pointerdown',{button:0,pointerId:1,clientX:600,clientY:400});surface.emit('pointerup',{pointerId:1,clientX:630,clientY:400});assert(!dialog.open,'Dragging must not open a modal');
  surface.emit('pointerdown',{button:0,pointerId:1,clientX:600,clientY:400});surface.emit('pointercancel');surface.emit('pointerup',{pointerId:1,clientX:600,clientY:400});assert(!dialog.open);
  debug.home();debug.renderer.frame();
  for(const button of nav){button.emit('click');assert(dialog.open);dialog.close();}
  console.log(JSON.stringify({result:'PASS',importedModels:0,footprint:[size.x,size.z],textMeshes:text.length,picking:picks,shelfChildren:shelf.children.length,limitations:'DOM, canvas glyph raster, image decoding and GPU rendering mocked; visual QA and shader compile still require a real browser.'},null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
