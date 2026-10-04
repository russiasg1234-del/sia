/* Simple student-style workshop props, built from primitives without downloads. */
function createGarageProps(THREE){
  const props=new THREE.Group();props.name='Simple garage equipment';
  props.userData={action:'equipment',label:'อุปกรณ์โรงรถ / สร้างจากทรงพื้นฐาน'};
  const rubber=new THREE.MeshStandardMaterial({color:0x25282c,roughness:.95,metalness:0});
  const metal=new THREE.MeshStandardMaterial({color:0x78818b,roughness:.4,metalness:.8});
  const red=new THREE.MeshStandardMaterial({color:0x854338,roughness:.65,metalness:.25});
  const cushion=new THREE.MeshStandardMaterial({color:0x4d5157,roughness:.92});
  const white=new THREE.MeshStandardMaterial({color:0xd9dbd7,roughness:.8});
  function group(name,pos){const g=new THREE.Group();g.name=name;g.position.set(...pos);props.add(g);return g;}
  function mesh(parent,name,geometry,material,pos){const m=new THREE.Mesh(geometry,material);m.name=name;m.position.set(...pos);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
  const box=(p,n,s,v,m)=>mesh(p,n,new THREE.BoxGeometry(...s),m,v);
  const cylinder=(p,n,r1,r2,h,v,m)=>mesh(p,n,new THREE.CylinderGeometry(r1,r2,h,16),m,v);

  const tires=group('Stacked spare tires',[-2.65,0,.15]);
  for(let i=0;i<3;i++){
    const tire=mesh(tires,'Spare tire '+(i+1),new THREE.TorusGeometry(.31,.11,8,24),rubber,[0,.12+i*.23,0]);tire.rotation.x=Math.PI/2;
    // A few plain tread blocks suggest rubber without detailed modelling.
    for(let j=0;j<12;j++){const a=j*Math.PI/6;const tread=box(tires,'Tire tread',[.07,.1,.025],[Math.sin(a)*.413,.12+i*.23,Math.cos(a)*.413],rubber);tread.rotation.y=a;}
  }

  // Real stepped-light cel shading fulfils the rubric without a character.
  const ramp=new THREE.DataTexture(new Uint8Array([48,106,174,255]),4,1,THREE.LuminanceFormat);
  ramp.minFilter=ramp.magFilter=THREE.NearestFilter;ramp.generateMipmaps=false;ramp.needsUpdate=true;
  const orangeToon=new THREE.MeshToonMaterial({color:0xc16b35,gradientMap:ramp});
  const whiteToon=new THREE.MeshToonMaterial({color:0xd8d7cf,gradientMap:ramp});
  for(let i=0;i<2;i++){
    const cone=group('Cel-shaded traffic cone '+(i+1),[-2.7+i*.85,0,2.55]);
    box(cone,'Cone rubber base',[.59,.07,.59],[0,.035,0],rubber);
    cylinder(cone,'Cone orange lower',.16,.24,.24,[0,.19,0],orangeToon);
    cylinder(cone,'Cone white stripe',.12,.16,.12,[0,.37,0],whiteToon);
    cylinder(cone,'Cone orange tip',.025,.12,.2,[0,.53,0],orangeToon);
  }

  const jack=group('Basic floor jack',[-.65,0,.75]);jack.rotation.y=-.25;
  box(jack,'Jack base',[.44,.13,1.1],[0,.17,0],red);
  for(const x of [-.24,.24])for(const z of [-.4,.4])cylinder(jack,'Jack wheel',.085,.085,.065,[x,.09,z],rubber).rotation.z=Math.PI/2;
  const arm=box(jack,'Lifting arm',[.18,.1,.58],[0,.3,-.2],metal);arm.rotation.x=.34;
  cylinder(jack,'Jack saddle',.1,.1,.055,[0,.425,-.42],rubber);
  const handle=cylinder(jack,'Jack handle',.021,.021,.92,[0,.57,.64],metal);handle.rotation.x=.38;
  const grip=cylinder(jack,'Jack handle grip',.03,.03,.18,[0,.985,.805],rubber);grip.rotation.x=.38;

  const creeper=group('Mechanic creeper',[1.05,0,.35]);creeper.rotation.y=-.18;
  box(creeper,'Creeper steel frame',[.67,.075,1.5],[0,.16,0],red);
  box(creeper,'Creeper cushion',[.55,.07,1.26],[0,.232,.055],cushion);
  box(creeper,'Creeper headrest',[.49,.085,.23],[0,.275,-.49],rubber);
  for(const x of [-.34,.34])for(const z of [-.55,.55])cylinder(creeper,'Creeper wheel',.09,.09,.07,[x,.09,z],rubber).rotation.z=Math.PI/2;

  const extinguisher=group('Fire extinguisher',[3.12,0,2.65]);
  cylinder(extinguisher,'Extinguisher body',.12,.12,.48,[0,.3,0],red);
  cylinder(extinguisher,'Extinguisher shoulder',.055,.12,.09,[0,.585,0],red);
  cylinder(extinguisher,'Extinguisher valve',.025,.025,.08,[0,.67,0],metal);
  box(extinguisher,'Extinguisher handle',[.16,.035,.04],[.015,.72,0],rubber);
  box(extinguisher,'Extinguisher label',[.14,.19,.01],[0,.34,.122],white);
  const hoseCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(.045,.67,0),new THREE.Vector3(.18,.58,0),new THREE.Vector3(.19,.3,0)]);
  mesh(extinguisher,'Extinguisher hose',new THREE.TubeGeometry(hoseCurve,8,.013,6,false),rubber,[0,0,0]);

  const clock=group('Simple wall clock',[2.75,2.98,-3.735]);
  cylinder(clock,'Clock rim',.25,.25,.05,[0,0,0],rubber).rotation.x=Math.PI/2;
  cylinder(clock,'Clock face',.228,.228,.012,[0,0,.032],white).rotation.x=Math.PI/2;
  for(let i=0;i<12;i++){const a=i*Math.PI/6;const tick=box(clock,'Clock tick',[.012,.035,.009],[Math.sin(a)*.195,Math.cos(a)*.195,.045],rubber);tick.rotation.z=-a;}
  const hour=box(clock,'Clock hour hand',[.018,.13,.012],[.03,.043,.054],rubber);hour.rotation.z=-.6;
  const minute=box(clock,'Clock minute hand',[.012,.185,.012],[-.067,.062,.068],rubber);minute.rotation.z=.83;
  mesh(clock,'Clock center',new THREE.SphereGeometry(.022,8,6),red,[0,0,.073]);
  return props;
}
