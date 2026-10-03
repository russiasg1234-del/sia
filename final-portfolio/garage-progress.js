/* Original garage geometry and procedural textures. Work-in-progress scene. */
function createGarageProgress(THREE) {
  const room=new THREE.Group();room.name='Garage portfolio progress';room.userData={width:8,depth:8,stage:'progress',importedModels:2};
  function texture(kind){
    if(typeof document==='undefined')return null;
    const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');
    let seed=41;function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
    ctx.fillStyle=kind==='wood'?'#b79b76':kind==='wall'?'#e1dfd6':'#969b9e';ctx.fillRect(0,0,512,512);
    for(let i=0;i<16000;i++){const v=Math.floor(100+random()*120);ctx.fillStyle='rgba('+v+','+v+','+v+','+(kind==='wood'?.07:.1)+')';ctx.fillRect(random()*512,random()*512,1+random()*3,1+random()*3);}
    if(kind==='wood'){for(let i=0;i<75;i++){ctx.strokeStyle='rgba(80,45,20,.12)';ctx.beginPath();const y=random()*512;ctx.moveTo(0,y);ctx.bezierCurveTo(180,y+8,350,y-7,512,y);ctx.stroke();}}
    if(kind==='concrete'){ctx.strokeStyle='#80878b';ctx.lineWidth=2;ctx.strokeRect(0,0,512,512);}
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(kind==='concrete'?4:2,kind==='concrete'?4:2);t.encoding=THREE.sRGBEncoding;return t;
  }
  const concreteTex=texture('concrete'),wallTex=texture('wall'),woodTex=texture('wood');
  const mat={
    concrete:new THREE.MeshStandardMaterial({color:0xd0d1cf,map:concreteTex,bumpMap:concreteTex,bumpScale:.018,roughness:.9,metalness:0}),
    plaster:new THREE.MeshStandardMaterial({color:0xf2f0e7,map:wallTex,bumpMap:wallTex,bumpScale:.008,roughness:.92}),
    dark:new THREE.MeshStandardMaterial({color:0x34454e,roughness:.66,metalness:.3}),
    metal:new THREE.MeshStandardMaterial({color:0x8b979e,roughness:.35,metalness:.82}),
    white:new THREE.MeshStandardMaterial({color:0xe7e8e1,roughness:.58,metalness:.12}),
    wood:new THREE.MeshStandardMaterial({color:0xffffff,map:woodTex,roughness:.76}),
    car:new THREE.MeshPhysicalMaterial({color:0xb94d35,roughness:.3,metalness:.55,clearcoat:.6,clearcoatRoughness:.2}),
    glass:new THREE.MeshPhysicalMaterial({color:0x263f4b,roughness:.16,metalness:.28,clearcoat:1}),
    tire:new THREE.MeshStandardMaterial({color:0x20272b,roughness:.96,metalness:0}),
    yellow:new THREE.MeshStandardMaterial({color:0xe4b358,roughness:.66,metalness:.05}),
    lamp:new THREE.MeshStandardMaterial({color:0xffe7b0,emissive:0xffd692,emissiveIntensity:.6,roughness:.7}),
    red:new THREE.MeshStandardMaterial({color:0xa6332c,emissive:0x36100c,roughness:.35}),
  };
  function group(name){const g=new THREE.Group();g.name=name;room.add(g);return g;}
  function mesh(parent,name,geometry,material,pos){const m=new THREE.Mesh(geometry,material);m.name=name;m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function box(parent,name,size,pos,material=mat.dark){return mesh(parent,name,new THREE.BoxGeometry(...size),material,pos);}
  function cylinder(parent,name,r1,r2,h,pos,material=mat.metal){return mesh(parent,name,new THREE.CylinderGeometry(r1,r2,h,24),material,pos);}
  function sphere(parent,name,r,pos,material=mat.white,scale){const m=mesh(parent,name,new THREE.SphereGeometry(r,24,16),material,pos);if(scale)m.scale.set(...scale);return m;}
  function rounded(parent,name,size,pos,material=mat.dark,r=.04){
    r=Math.min(r,...size.map(s=>s/4));const w=size[0]-2*r,h=size[1]-2*r,d=size[2]-2*r;
    const shape=new THREE.Shape();shape.moveTo(-w/2,-h/2);shape.lineTo(w/2,-h/2);shape.lineTo(w/2,h/2);shape.lineTo(-w/2,h/2);shape.closePath();
    const geo=new THREE.ExtrudeGeometry(shape,{depth:d,steps:1,bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:3,curveSegments:4});geo.translate(0,0,-d/2);return mesh(parent,name,geo,material,pos);
  }
  function beam(parent,name,a,b,width,material=mat.metal){const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),delta=q.clone().sub(p);const m=box(parent,name,[width,delta.length(),width],p.clone().add(q).multiplyScalar(.5).toArray(),material);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return m;}
  function sign(parent,name,text,w,h,pos,bg='#34454e',fg='#eee8dc'){
    let material=mat.white;
    if(typeof document!=='undefined'){
      const c=document.createElement('canvas');c.width=768;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,768,256);ctx.fillStyle=fg;ctx.font='bold 52px system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';text.split('\n').forEach((line,i,list)=>ctx.fillText(line,384,128+(i-(list.length-1)/2)*70));const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;material=new THREE.MeshStandardMaterial({map:t,roughness:.85});
    }
    return mesh(parent,name,new THREE.PlaneGeometry(w,h),material,pos);
  }

  const shell=group('Garage architecture');
  box(shell,'Floor 8x8',[8,.18,8],[0,-.09,0],mat.concrete);
  box(shell,'Back plaster wall',[8,3.6,.14],[0,1.8,-3.93],mat.plaster);
  box(shell,'Left plaster wall',[.14,3.6,7.86],[-3.93,1.8,.07],mat.plaster);
  box(shell,'Right cutaway wall',[.14,.9,7.86],[3.93,.45,.07],mat.plaster);
  box(shell,'Back dark lower wall',[7.86,.82,.035],[.07,.41,-3.84],mat.dark);
  box(shell,'Left dark lower wall',[.035,.82,7.7],[-3.84,.41,.05],mat.dark);
  box(shell,'Back skirting',[7.85,.08,.04],[.075,.04,-3.81],mat.metal);
  for(const x of [-3.69,3.69]){
    box(shell,'Opening column',[.22,3.55,.25],[x,1.775,3.68],mat.dark);
    box(shell,'Roller guide',[.07,3.05,.08],[x,1.525,3.49],mat.metal);
    box(shell,'Roof side frame',[.14,.18,7.42],[x,3.42,-.05],mat.dark);
  }
  box(shell,'Garage lintel',[7.6,.24,.3],[0,3.49,3.68],mat.dark);
  for(let i=0;i<6;i++)box(shell,'Raised roller shutter slat',[7.08,.115,.095],[0,2.77+i*.126,3.53],mat.metal);
  box(shell,'Shutter lower edge',[7.14,.05,.13],[0,2.69,3.54],mat.dark);
  sign(shell,'Garage sign','GARAGE / STUDIO',3,.42,[0,3.02,-3.83]);
  box(shell,'Back ceiling light housing',[2.4,.09,.35],[.15,3.44,-2.98],mat.dark);
  box(shell,'Back ceiling light',[2.15,.03,.23],[.15,3.378,-2.98],mat.lamp);
  const parking=group('Parking markings');
  for(const x of [-2.2,.34])box(parking,'Parking stripe',[.052,.008,4.66],[x,.006,.15],mat.yellow);
  box(parking,'Parking rear stripe',[2.59,.008,.052],[-.93,.006,-2.17],mat.yellow);

  const car=group('Original terracotta coupe');car.position.set(-.95,0,.1);
  rounded(car,'Lower body',[1.65,.4,3.84],[0,.6,0],mat.car,.07);
  rounded(car,'Front hood',[1.6,.21,1.22],[0,.88,1.25],mat.car,.055);
  rounded(car,'Rear trunk',[1.59,.18,.78],[0,.86,-1.46],mat.car,.05);
  const v=[[-.7,.94,-1.2],[.7,.94,-1.2],[.7,.94,.66],[-.7,.94,.66],[-.58,1.43,-.89],[.58,1.43,-.89],[.58,1.43,.31],[-.58,1.43,.31]];
  const cabin=new THREE.BufferGeometry();cabin.setAttribute('position',new THREE.Float32BufferAttribute(v.flat(),3));cabin.setIndex([0,1,5,0,5,4,3,7,6,3,6,2,0,4,7,0,7,3,1,2,6,1,6,5,4,5,6,4,6,7].reverse());cabin.computeVertexNormals();mesh(car,'Cabin glass',cabin,mat.glass,[0,0,0]);
  rounded(car,'Roof',[1.24,.1,1.33],[0,1.48,-.28],mat.car,.035);
  for(const side of [-1,1]){
    beam(car,'Front pillar',[side*.7,.94,.66],[side*.58,1.43,.31],.045,mat.car);
    beam(car,'Rear pillar',[side*.7,.94,-1.2],[side*.58,1.43,-.89],.052,mat.car);
    beam(car,'Middle pillar',[side*.69,.94,-.34],[side*.585,1.43,-.34],.045,mat.dark);
    rounded(car,'Door handle',[.025,.03,.19],[side*.833,.81,-.35],mat.metal,.008);
    rounded(car,'Side mirror',[.15,.105,.2],[side*.87,1.06,.54],mat.car,.025);
    box(car,'Door seam',[.011,.37,.012],[side*.829,.67,-.74],mat.dark);
    box(car,'Lower side trim',[.015,.036,2.58],[side*.831,.48,0],mat.dark);
  }
  for(const x of [-.83,.83])for(const z of [-1.25,1.25]){
    const tire=mesh(car,'Rubber tire',new THREE.TorusGeometry(.231,.086,12,32),mat.tire,[x,.34,z]);tire.rotation.y=Math.PI/2;
    const wheel=cylinder(car,'Rim',.19,.19,.14,[x,.34,z],mat.metal);wheel.rotation.z=Math.PI/2;
    const hub=cylinder(car,'Wheel hub',.055,.055,.155,[x,.34,z],mat.dark);hub.rotation.z=Math.PI/2;
    for(let i=0;i<5;i++){const a=i*Math.PI*2/5,side=x<0?-1:1;beam(car,'Wheel spoke',[x+side*.081,.34+Math.sin(a)*.05,z+Math.cos(a)*.05],[x+side*.081,.34+Math.sin(a)*.17,z+Math.cos(a)*.17],.025,mat.white);}
  }
  rounded(car,'Front bumper',[1.64,.09,.12],[0,.42,1.93],mat.dark,.025);
  rounded(car,'Rear bumper',[1.64,.09,.12],[0,.42,-1.93],mat.dark,.025);
  box(car,'Front grille',[.61,.14,.04],[0,.62,1.944],mat.dark);
  for(let i=0;i<7;i++)box(car,'Grille fin',[.013,.12,.025],[-.25+i*.083,.62,1.97],mat.metal);
  for(const x of [-.57,.57]){
    rounded(car,'Headlight',[.34,.145,.055],[x,.74,1.93],mat.lamp,.018);
    rounded(car,'Tail light',[.32,.13,.045],[x,.7,-1.934],mat.red,.016);
  }
  sign(car,'Registration plate','GARAGE 01',.43,.105,[0,.45,2.001],'#eee8dc','#34454e');
  // Replaced by the downloaded McLaren model in viewer.js.
  room.remove(car);

  const bench=group('Workbench and portfolio computer');
  rounded(bench,'Wood work surface',[1.93,.12,1.08],[2.63,1.04,-2.57],mat.wood,.018);
  for(const x of [1.82,3.45])for(const z of [-2.97,-2.17])box(bench,'Steel bench leg',[.07,.98,.07],[x,.49,z],mat.dark);
  box(bench,'Bench lower shelf',[1.64,.06,.79],[2.635,.24,-2.57],mat.metal);
  rounded(bench,'Monitor foot',[.46,.035,.28],[2.5,1.126,-2.72],mat.dark,.015);
  box(bench,'Monitor stem',[.075,.22,.07],[2.5,1.235,-2.75],mat.metal);
  rounded(bench,'Monitor frame',[.99,.63,.085],[2.5,1.59,-2.76],mat.dark,.03);
  sign(bench,'Portfolio screen','PORTFOLIO\nPROJECTS / COMING SOON',.89,.52,[2.5,1.59,-2.71],'#1b2931','#c4d3d5');
  rounded(bench,'Keyboard',[.65,.035,.22],[2.5,1.125,-2.2],mat.dark,.008);
  for(let row=0;row<3;row++)for(let col=0;col<9;col++)box(bench,'Keyboard key',[.049,.011,.041],[2.236+col*.064,1.149,-2.263+row*.053],mat.metal);
  sphere(bench,'Mouse',.06,[2.98,1.144,-2.2],mat.dark,[.8,.45,1.25]);
  cylinder(bench,'Tool holder',.1,.1,.2,[3.31,1.2,-2.75],mat.metal);
  for(let i=0;i<3;i++)beam(bench,'Screwdriver in holder',[3.25+i*.055,1.25,-2.75],[3.25+i*.055,1.57,-2.75],.018,mat.yellow);
  const stool=cylinder(bench,'Mechanic stool cushion',.26,.26,.1,[2.18,.66,-1.5],mat.dark);
  cylinder(bench,'Stool stem',.055,.055,.58,[2.18,.31,-1.5],mat.metal);
  cylinder(bench,'Stool base',.3,.3,.035,[2.18,.025,-1.5],mat.dark);
  box(bench,'Pegboard',[1.93,.65,.05],[2.61,2.29,-3.79],mat.dark);
  for(let row=0;row<3;row++)for(let col=0;col<13;col++){
    const hole=cylinder(bench,'Pegboard hole',.012,.012,.008,[1.77+col*.14,2.1+row*.16,-3.755],mat.metal);hole.rotation.x=Math.PI/2;
  }
  for(let i=0;i<3;i++){
    box(bench,'Hanging wrench handle',[.027,.28,.02],[2.05+i*.28,2.24,-3.72],mat.metal);
    cylinder(bench,'Wrench head',.052,.052,.022,[2.05+i*.28,2.41,-3.72],mat.metal).rotation.x=Math.PI/2;
  }

  const shelf=group('Open tool shelf');
  for(const x of [-3.37,-1.92])box(shelf,'Shelf steel post',[.05,2.05,.05],[x,1.025,-3.22],mat.dark);
  for(const y of [.1,.76,1.42,2.03])box(shelf,'Wood shelf',[1.55,.055,.58],[-2.645,y,-3.18],mat.wood);
  // Leave all shelf levels empty.
  // No tool cabinet: this side of the garage stays open.

  const profile=group('Reserved portfolio information');
  rounded(profile,'Profile frame',[.78,.95,.055],[-1.2,2.28,-3.77],mat.wood,.012);
  sign(profile,'Portrait placeholder','PROFILE\nรูปโปรไฟล์',.66,.82,[-1.2,2.28,-3.736],'#dbded8','#52616a');
  rounded(profile,'Information frame',[2.1,.65,.05],[.5,2.23,-3.77],mat.metal,.01);
  sign(profile,'Student details placeholder','STUDENT PROFILE\nข้อมูลนักศึกษา / เตรียมใส่ภายหลัง',1.98,.54,[.5,2.23,-3.735],'#e5e5dd','#52616a');

  const helper=group('Workshop helper character');const cx=1.02,cz=1.63;
  for(const dx of [-.12,.12]){
    rounded(helper,'Work shoe',[.18,.12,.29],[cx+dx,.07,cz+.045],mat.dark,.035);
    cylinder(helper,'Character leg',.065,.065,.43,[cx+dx,.345,cz],mat.dark);
  }
  rounded(helper,'Coverall torso',[.44,.5,.26],[cx,.78,cz],mat.car,.055);
  box(helper,'Coverall belt',[.46,.05,.27],[cx,.605,cz],mat.dark);
  sphere(helper,'Character head',.19,[cx,1.205,cz],mat.white,[1,1.12,1]);
  sphere(helper,'Helmet dome',.205,[cx,1.34,cz],mat.yellow,[1,.62,1]);
  cylinder(helper,'Helmet brim',.233,.233,.025,[cx,1.305,cz],mat.yellow);
  for(const dx of [-.29,.29]){
    const arm=cylinder(helper,'Coverall sleeve',.066,.066,.4,[cx+dx,.81,cz],mat.car);arm.rotation.z=dx<0?-.2:.2;
    sphere(helper,'Work glove',.075,[cx+dx*1.11,.59,cz],mat.dark);
  }
  // Replaced by the same baked Barry model used in the Character PBR project.
  room.remove(helper);
  return {room,labels:[
    {text:'McLaren F1 GTR',position:[-.95,1.98,.6]},
    {text:'โต๊ะช่าง / Portfolio',position:[2.63,2.8,-2.4]},
    {text:'ชั้นเครื่องมือ',position:[-2.645,2.37,-3]},
    {text:'พื้นที่ข้อมูลโปรไฟล์',position:[-.3,2.7,-3.65]},
    {text:'Barry Burton',position:[1.4,2.05,1.6]},
    {text:'8 × 8 หน่วย',position:[0,.18,4.3]},
  ]};
}
