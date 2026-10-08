import { Suspense,useEffect,useMemo,useRef,useState,Component,type ReactNode } from 'react';
import { Canvas,useFrame,useThree } from '@react-three/fiber';
import { OrbitControls,RoundedBox,Environment,Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { products,productById,type Product } from '../domain/products';
import type { SimulationState } from '../domain/simulation';
import { Icon } from '../components/Icon';
import StoreExterior from './StoreExterior';
import Shopper from './HumanShopper';
import { customerPosition } from '../domain/customerJourney';
import Package from './GroceryProduct';
import { MaterialLibrary,useSurface,surfaceForColor } from './Materials';

type V3=[number,number,number];
function Box({position=[0,0,0],size=[1,1,1],color='#ffffff',roughness=.7,metalness=0,shadow=true}:{position?:V3;size?:V3;color?:string;roughness?:number;metalness?:number;shadow?:boolean}) {
  const surface=surfaceForColor(color),maps=useSurface(surface??'plaster');
  return <mesh position={position} castShadow={shadow} receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={color} roughness={roughness} metalness={metalness} {...(surface?maps:{})} bumpScale={surface==='wood'?.018:.007}/></mesh>;
}
function Cylinder({position=[0,0,0],args=[.1,.1,1,16],color='#fff',rotation=[0,0,0],metalness=0}:{position?:V3;args?:[number,number,number,number];color?:string;rotation?:V3;metalness?:number}) {
  return <mesh position={position} rotation={rotation} castShadow><cylinderGeometry args={args}/><meshStandardMaterial color={color} roughness={.42} metalness={metalness}/></mesh>;
}

function Sign({text,sub='',position,rotation=[0,0,0],width=2,height=.55,color='#244b3d'}:{text:string;sub?:string;position:V3;rotation?:V3;width?:number;height?:number;color?:string}) {
  const texture=useMemo(()=>{
    const canvas=document.createElement('canvas');canvas.width=768;canvas.height=192;
    const c=canvas.getContext('2d')!;c.fillStyle=color;c.fillRect(0,0,768,192);c.fillStyle=color==='#f4eee0'?'#263b31':'#f4f3e8';c.textAlign='center';c.font='bold 65px Arial';c.fillText(text,384,sub?92:119);if(sub){c.font='26px Arial';c.fillText(sub,384,145);}
    const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;return t;
  },[text,sub,color]);
  useEffect(()=>()=>texture.dispose(),[texture]);
  return <mesh position={position} rotation={rotation}><planeGeometry args={[width,height]}/><meshStandardMaterial map={texture} roughness={.7} side={THREE.DoubleSide}/></mesh>;
}
function ProductDisplay({p,count,onSelect}:{p:Product;count:number;onSelect:(p:Product)=>void}) {
  const [hover,setHover]=useState(false);const right=p.position[0]>0;
  const shelfRise=p.position[1]>1?.98:.77;
  return <group position={p.position} rotation={[0,right?-Math.PI/2:Math.PI/2,0]}>
    <group onClick={e=>{e.stopPropagation();onSelect(p);}} onPointerOver={e=>{e.stopPropagation();setHover(true);document.body.style.cursor='pointer';}} onPointerOut={()=>{setHover(false);document.body.style.cursor='';}}>
      {Array.from({length:Math.min(9,count)},(_,i)=><group key={i} position={[(i%3-1)*.46,i>=6?shelfRise:0,-Math.floor((i%6)/3)*.26]} rotation={[0,(i%3-1)*.035,0]}><Package p={p}/></group>)}
      <mesh position={[0,0,-.17]} visible={hover}><boxGeometry args={[1.0,.8,.8]}/><meshBasicMaterial color="#c5ed99" transparent opacity={.14} depthWrite={false}/></mesh>
      <mesh position={[0,0,0]} visible={false}><boxGeometry args={[1,.85,1]}/><meshBasicMaterial/></mesh>
    </group>
    <Sign text={`${(p.price/100).toFixed(2).replace('.',',')} €`} position={[0,(p.position[1]>1?1.055:.285)-p.position[1],.31]} width={.65} height={.16} color="#f4eee0"/>
  </group>;
}
function Plant({position,scale=1}:{position:V3;scale?:number}) {
  return <group position={position} scale={scale}><Cylinder position={[0,.15,0]} args={[.2,.15,.3,16]} color="#b59b75"/>{Array.from({length:7},(_,i)=>{const a=i*2.4;return <mesh key={i} position={[Math.sin(a)*.18,.42+i%3*.08,Math.cos(a)*.15]} rotation={[.5,a,.5]} scale={[.11,.29,.06]}><sphereGeometry args={[1,8,6]}/><meshStandardMaterial color={i%2?'#4f7041':'#668645'} roughness={.85}/></mesh>;})}</group>;
}
function Shelves() {
  return <group>
    {[-1,1].map(side=><group key={side} position={[side*4.2,0,0]}>
      <Box position={[side*.38,1.35,-.75]} size={[.16,2.7,7.5]} color="#444f49" metalness={.45}/>
      {[-4.4,-2.6,-.7,1.25,3].map(z=><Box key={z} position={[0,1.35,z]} size={[.07,2.7,.07]} color="#27362f" metalness={.6}/>)}
      {[.35,1.12,2.1,2.9].map(y=><group key={y}><Box position={[0,y,-.7]} size={[1.05,.075,7.4]} color={side===1?'#b08b62':'#dcc6a6'}/><Box position={[-side*.49,y-.05,-.7]} size={[.045,.12,7.4]} color="#59645a" metalness={.45}/><Box position={[0,y-.065,-.7]} size={[.82,.014,7.2]} color="#fff2cc"/><mesh position={[0,y-.074,-.7]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[.8,7.1]}/><meshBasicMaterial color="#f6d69b"/></mesh></group>)}
      {[.35,1.12,2.1].map(y=><group key={`rail-${y}`}><Cylinder position={[-side*.49,y+.13,-.7]} args={[.012,.012,7.4,6]} rotation={[Math.PI/2,0,0]} color="#56645b" metalness={.8}/>{[-4.2,-2.5,-.7,1.1,2.9].map(z=><Box key={z} position={[-side*.49,y+.065,z]} size={[.018,.13,.018]} color="#56645b" metalness={.8}/>)}</group>)}
      {side===1&&[1.7,.1,-1.5].map(z=><group key={z} position={[0,1.12,z]}><Box position={[0,.04,0]} size={[.95,.09,1.25]} color="#9a734c"/><Box position={[-.46,.15,0]} size={[.04,.28,1.25]} color="#b99164"/><Box position={[.46,.15,0]} size={[.04,.28,1.25]} color="#b99164"/></group>)}
    </group>)}
    <Sign text="SNACKS & GETRÄNKE" position={[-3.6,3.25,0]} rotation={[0,Math.PI/2,0]} width={3.9}/>
    <Sign text="FRISCH & GEBACKEN" position={[3.65,3.25,0]} rotation={[0,-Math.PI/2,0]} width={3.9}/>
    {/* Kühlung aus eigener Geometrie; keine geladenen Modelle oder Texturen. */}
    <group position={[-3.6,0,-4.8]}><Box position={[0,1.4,0]} size={[2.3,2.8,.65]} color="#253731" metalness={.4}/>
      <Box position={[0,1.4,.34]} size={[2.15,2.58,.02]} color="#edf1e9"/>
      {[-.72,.02,.72].map(x=><group key={`cooling-${x}`}><mesh position={[x,1.4,.72]} raycast={()=>null}><boxGeometry args={[.68,2.5,.016]}/><meshPhysicalMaterial color="#d6e5e7" transparent opacity={.16} metalness={.18} roughness={.05} clearcoat={1} depthWrite={false}/></mesh><mesh position={[x-.3,1.4,.44]}><boxGeometry args={[.012,2.45,.018]}/><meshBasicMaterial color="#e5f4ff"/></mesh></group>)}
      {[-.68,0,.68].map(x=><group key={x}><Box position={[x,1.4,.46]} size={[.035,2.65,.03]} color="#394944"/>{[.55,1.08,1.61,2.14].map(y=><group key={y}><Box position={[x,y-.22,.5]} size={[.65,.03,.36]} color="#dfe8df"/>{[-.19,0,.19].map((dx,i)=><Cylinder key={dx} position={[x+dx,y,.55]} args={[.057,.06,.34,12]} color={i%2?'#e5a747':'#74a6ad'}/>)}</group>)}<Cylinder position={[x+.25,1.4,.66]} args={[.02,.02,.48,8]} color="#d3d7cf" metalness={.8}/></group>)}
      <Sign text="GUT GEKÜHLT" position={[0,2.95,.38]} width={2.25} height={.3}/>
    </group>
  </group>;
}
function Robot() {
  const head=useRef<THREE.Group>(null);useFrame(({clock})=>{if(head.current)head.current.rotation.y=Math.sin(clock.elapsedTime*.7)*.12;});
  return <group position={[1.4,0,-4.1]} scale={1.12}>
    <Cylinder position={[0,.27,0]} args={[.28,.37,.35,24]} color="#dce3db"/>
    <Cylinder position={[0,.65,0]} args={[.19,.24,.6,24]} color="#eceee4"/>
    <RoundedBox position={[0,1.15,0]} args={[.62,.63,.42]} radius={.17} smoothness={4} castShadow><meshStandardMaterial color="#ecf0e6" metalness={.18} roughness={.27}/></RoundedBox>
    <Box position={[0,1.18,.225]} size={[.16,.06,.012]} color="#57d8ce"/>
    <Cylinder position={[0,1.54,0]} args={[.1,.1,.18,16]} color="#263a37" metalness={.6}/>
    <group ref={head} position={[0,1.82,0]}>
      <RoundedBox args={[.7,.57,.54]} radius={.2} smoothness={5} castShadow><meshStandardMaterial color="#f4f3e8" metalness={.22} roughness={.23}/></RoundedBox>
      <RoundedBox position={[0,0,.27]} args={[.55,.34,.032]} radius={.13} smoothness={4}><meshStandardMaterial color="#10292c" metalness={.3} roughness={.18}/></RoundedBox>
      {[-.13,.13].map(x=><mesh key={x} position={[x,.045,.296]} rotation={[0,0,Math.PI]}><torusGeometry args={[.047,.009,6,14,Math.PI]}/><meshBasicMaterial color="#7be6e1"/></mesh>)}
      <mesh position={[0,-.06,.296]}><torusGeometry args={[.058,.006,6,16,Math.PI]}/><meshBasicMaterial color="#7be6e1"/></mesh>
      {[-1,1].map(s=><mesh key={s} position={[s*.355,0,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.12,.12,.04,24]}/><meshStandardMaterial color="#284f4c" metalness={.6}/></mesh>)}
    </group>
    {[-1,1].map(s=><group key={s} position={[s*.38,1.28,0]} rotation={[0,0,s*.35]}><mesh><sphereGeometry args={[.11,14,10]}/><meshStandardMaterial color="#2b3d39"/></mesh><Cylinder position={[0,-.2,.07]} args={[.1,.085,.36,16]} color="#e7ebe1" rotation={[.4,0,0]}/><mesh position={[0,-.41,.19]}><sphereGeometry args={[.105,12,8]}/><meshStandardMaterial color="#344640"/></mesh></group>)}
  </group>;
}
function Checkout() {
  return <group>
    <group position={[1.4,0,-3.3]}><Box position={[0,.58,0]} size={[3.5,1.16,1.08]} color="#b18d63" shadow/>
      {Array.from({length:25},(_,i)=><Box key={i} position={[-1.68+i*.14,.62,.55]} size={[.055,1.04,.055]} color={i%2?'#9b7954':'#ba956c'}/>)}
      <Box position={[0,.1,.57]} size={[3.55,.2,.05]} color="#283b32"/><Box position={[0,1.22,0]} size={[3.65,.13,1.2]} color="#343e37" roughness={.28} shadow/>
      <Box position={[0,1.155,.62]} size={[3.55,.02,.012]} color="#f6d1a0"/>
      <Cylinder position={[.9,1.45,-.2]} args={[.055,.08,.43,12]} color="#293b36"/><RoundedBox position={[.9,1.72,-.2]} rotation={[-.18,0,0]} args={[.65,.42,.06]} radius={.035} smoothness={3}><meshStandardMaterial color="#1f302b"/></RoundedBox>
      <Sign text="DEMO-KASSE" sub="KEINE ECHTE ZAHLUNG" position={[.9,1.72,-.159]} width={.6} height={.36}/>
      <Box position={[-.8,1.31,.13]} size={[.38,.05,.32]} color="#213e34"/><Plant position={[-1.45,1.29,-.25]} scale={.6}/>
    </group>
    <Robot/>
    <Sign text="AI GROCERY" sub="FRESH FOOD. SMART FLOW." position={[1.35,3.22,-5.25]} width={4} height={.83}/>
  </group>;
}
function Room() {
  const floor=useSurface('stone');
  return <group>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.015,0]} receiveShadow><planeGeometry args={[10.4,11.8]}/><meshPhysicalMaterial {...floor} color="#e6dfd2" bumpScale={.009} roughness={.26} metalness={.015} clearcoat={.25} clearcoatRoughness={.38}/></mesh>
    <Box position={[0,-.15,0]} size={[10.4,.25,11.8]} color="#758075"/>
    <Box position={[0,2,-5.55]} size={[10.4,4,.15]} color="#ded8c7"/>
    <Box position={[5.1,1.85,-.2]} size={[.12,3.7,10.6]} color="#e8e0ce"/>
    <Box position={[-5.1,.6,-.2]} size={[.12,1.2,10.6]} color="#c7c4b1"/>
    {[-4.5,-2,0.5,3].map(z=><group key={z}><Box position={[-5.08,2.35,z]} size={[.06,2.5,.075]} color="#36473f"/><mesh position={[-5.15,2.35,z+1.15]} raycast={()=>null}><boxGeometry args={[.015,2.45,2.15]}/><meshPhysicalMaterial color="#dce8e4" transparent opacity={.19} roughness={.08} metalness={.2} depthWrite={false}/></mesh></group>)}
    <Box position={[-5.08,3.65,-.2]} size={[.06,.08,10.6]} color="#36473f"/>
    <Box position={[0,.1,-5.43]} size={[10.15,.2,.06]} color="#36473f"/>
    <Sign text="FRISCHE IST UNSER HANDWERK" sub="NEUTRALE PRODUKTE · LOKALE DEMO" position={[1.2,2.4,-5.45]} width={2.5} height={.46} color="#6b7050"/>
    {[[-1.7,-4.8],[-.8,-4.8],[.1,-4.8]].map(([x,z],i)=><Plant key={i} position={[x,3.38,z]} scale={.9+i*.16}/>)}
    <Box position={[-.8,3.36,-4.98]} size={[3,.09,.65]} color="#b08b62"/>
    {[-3,0,3].map(x=><group key={x}><Box position={[x,3.8,-.7]} size={[.035,.035,9.1]} color="#303d34"/>{[-3.9,-.8,2.4].map(z=><group key={z}><Cylinder position={[x,3.6,z]} args={[.09,.13,.25,12]} color="#293b33"/><mesh position={[x,3.455,z]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[.1,12]}/><meshBasicMaterial color="#fff1c8"/></mesh></group>)}</group>)}
    <Plant position={[4.2,2.95,-3.7]} scale={1.3}/><Plant position={[4.2,2.95,2.2]}/><Plant position={[-4.1,2.95,2.2]}/><Plant position={[-1,0,-5.1]} scale={1.4}/>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,.007,4.9]}><planeGeometry args={[2.6,.8]}/><meshStandardMaterial color="#526b54" roughness={1}/></mesh>
    <Sign text="WILLKOMMEN" position={[0,.013,4.9]} rotation={[-Math.PI/2,0,0]} width={2.4} height={.5}/>
  </group>;
}
function CameraController({view,walk,onMoving}:{view:number;walk:string|null;onMoving:(value:boolean)=>void}) {
  const controls=useRef<OrbitControlsImpl>(null),keys=useRef(new Set<string>());const {camera,invalidate,size}=useThree();
  const firstView=useRef(true),transition=useRef<{from:THREE.Vector3;to:THREE.Vector3;fromTarget:THREE.Vector3;toTarget:THREE.Vector3;elapsed:number}|null>(null);
  const outside=view%4===3;
  useEffect(()=>{
    const onDown=(e:KeyboardEvent)=>{if((e.target as HTMLElement).closest('input,textarea,select,dialog,button'))return;if(['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){keys.current.add(e.key);e.preventDefault();}};
    const onUp=(e:KeyboardEvent)=>keys.current.delete(e.key),clear=()=>keys.current.clear();
    window.addEventListener('keydown',onDown);window.addEventListener('keyup',onUp);window.addEventListener('blur',clear);
    return()=>{window.removeEventListener('keydown',onDown);window.removeEventListener('keyup',onUp);window.removeEventListener('blur',clear);};
  },[]);
  useEffect(()=>{
    const c=controls.current;if(!c)return;
    const poses:V3[]=[[.5,3.4,8.8],[9,8,12],[.2,1.75,5.35],[8,5.6,17.5]];
    if(camera instanceof THREE.PerspectiveCamera){camera.fov=(view%4===2?62:49)+(size.width/size.height<1.1?24:0);camera.updateProjectionMatrix();}
    // Restliche Orbit-Trägheit vor einem festen Ansichtswechsel vollständig auflösen.
    c.enableDamping=false;c.update();
    const to=new THREE.Vector3(...poses[view%4]),toTarget=outside?new THREE.Vector3(0,1.8,2.8):new THREE.Vector3(0,view%4===2?1.35:1,-1.1);
    if(firstView.current||window.matchMedia('(prefers-reduced-motion: reduce)').matches){camera.position.copy(to);c.target.copy(toTarget);c.update();c.enableDamping=true;firstView.current=false;transition.current=null;c.enabled=true;onMoving(false);}
    else {transition.current={from:camera.position.clone(),to,fromTarget:c.target.clone(),toTarget,elapsed:0};c.enabled=false;onMoving(true);}
    invalidate();
  },[camera,view,onMoving,invalidate,size.width,size.height]);
  useFrame((_,dt)=>{
    const c=controls.current;if(!c)return;
    const trip=transition.current;
    if(trip){invalidate();trip.elapsed+=Math.min(dt,.05);const t=THREE.MathUtils.smoothstep(trip.elapsed/.85,0,1);camera.position.lerpVectors(trip.from,trip.to,t);c.target.lerpVectors(trip.fromTarget,trip.toTarget,t);c.update();if(t===1){transition.current=null;c.enabled=true;c.enableDamping=true;onMoving(false);}return;}
    const forward=(keys.current.has('w')||keys.current.has('ArrowUp')||walk==='forward'?1:0)-(keys.current.has('s')||keys.current.has('ArrowDown')||walk==='back'?1:0);
    const sideways=(keys.current.has('d')||keys.current.has('ArrowRight')||walk==='right'?1:0)-(keys.current.has('a')||keys.current.has('ArrowLeft')||walk==='left'?1:0);
    if(!forward&&!sideways)return;
    const dir=new THREE.Vector3();camera.getWorldDirection(dir);dir.y=0;dir.normalize();const side=new THREE.Vector3().crossVectors(dir,new THREE.Vector3(0,1,0));
    const movement=dir.multiplyScalar(forward).add(side.multiplyScalar(sideways)).multiplyScalar(Math.min(dt,.04)*3);
    const next=camera.position.clone().add(movement);
    if(Math.abs(next.x)<(outside?22:10) && next.z>(outside?-16:-6) && next.z<(outside?25:16)){camera.position.add(movement);c.target.add(movement);c.update();}
  });
  return <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={.08} minDistance={1.2} maxDistance={outside?38:22} minPolarAngle={.18} maxPolarAngle={Math.PI/2-.035} mouseButtons={{LEFT:THREE.MOUSE.ROTATE,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.PAN}} touches={{ONE:THREE.TOUCH.ROTATE,TWO:THREE.TOUCH.DOLLY_PAN}}/>;
}
class SceneBoundary extends Component<{children:ReactNode;fallback:ReactNode},{error:boolean}> {
  state={error:false};static getDerivedStateFromError(){return {error:true};}
  render(){return this.state.error?this.props.fallback:this.props.children;}
}
type OverlayRefs=React.MutableRefObject<Record<string,HTMLDivElement|null>>;
function OverlayProjector({state,refs,outside}:{state:SimulationState;refs:OverlayRefs;outside:boolean}) {
  const {camera,size}=useThree();
  useFrame(()=>{
    const entries:[string,V3][]=[['robot',[1.4,2.65,-4.1]],...products.map(p=>[p.id,[p.position[0]*.82,p.position[1]-.46,p.position[2]]] as [string,V3]),...state.customers.map(c=>{const v=customerPosition(c);return [`customer-${c.id}`,[v[0],2.12,v[2]]] as [string,V3];})];
    for(const [id,position] of entries) {
      const element=refs.current[id];if(!element)continue;
      const point=new THREE.Vector3(...position),distance=camera.position.distanceTo(point);point.project(camera);
      const visible=(!outside||(id.startsWith('customer-')&&position[2]>5.45))&&point.z<1&&point.z>-1&&Math.abs(point.x)<1.1&&Math.abs(point.y)<1.1;
      element.style.display=visible?'block':'none';
      element.style.transform=`translate(${(point.x+1)*size.width/2}px,${(1-point.y)*size.height/2}px) translate(-50%,-50%) scale(${Math.min(1.15,8.3/distance)})`;
    }
  });return null;
}
function Content({state,onSelect,view,walk,overlayRefs,onEnter,moving,onMoving}:{state:SimulationState;onSelect:(p:Product)=>void;view:number;walk:string|null;overlayRefs:OverlayRefs;onEnter:()=>void;moving:boolean;onMoving:(value:boolean)=>void}) {
  const outside=view%4===3;
  return <>
    <color attach="background" args={[outside?'#d6e3d9':'#c6cec2']}/><fog attach="fog" args={[outside?'#d6e3d9':'#c6cec2',outside?35:18,outside?65:37]}/>
    <ambientLight intensity={.32}/><hemisphereLight args={['#dce9ef','#927557',.65]}/>
    <Environment resolution={128} frames={1} environmentIntensity={.65}><Lightformer position={[0,9,0]} rotation={[Math.PI/2,0,0]} scale={[16,12,1]} intensity={1.7} color="#fff3df"/><Lightformer position={[-10,4,1]} rotation={[0,Math.PI/2,0]} scale={[10,7,1]} intensity={2.5} color="#d7e8f6"/><Lightformer position={[5,3,-5]} rotation={[0,-Math.PI/3,0]} scale={[7,4,1]} intensity={1.5} color="#ffdfa7"/></Environment>
    <directionalLight position={[-5,9,6]} intensity={2.5} color="#fff1d6" castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-18} shadow-camera-right={18} shadow-camera-top={18} shadow-camera-bottom={-18} shadow-camera-far={45} shadow-normalBias={.025} shadow-bias={-.00015} shadow-radius={3}/>
    <pointLight position={[0,3.3,-2]} intensity={16} color="#ffe6bb" distance={10} decay={2}/>
    <pointLight position={[3,2.8,2]} intensity={8} color="#fff4de" distance={8}/>
    <Room/><Shelves/><Checkout/>
    <StoreExterior outside={outside} enclosed={outside||view%4===2} customers={state.customers} onEnter={onEnter}/>
    {products.map(p=><ProductDisplay key={`${state.session}-${p.id}`} p={p} count={state.inventory[p.id]} onSelect={outside||moving?()=>{}:onSelect}/>)}
    {state.customers.map(c=><Shopper key={`${state.session}-${c.id}`} customer={c} running={state.running} speed={state.speed}/>)}
    <CameraController view={view} walk={walk} onMoving={onMoving}/>
    <OverlayProjector state={state} refs={overlayRefs} outside={outside}/>
  </>;
}
export default function StoreScene({state,onSelect}:{state:SimulationState;onSelect:(p:Product)=>void}) {
  const [view,setView]=useState(3),[walk,setWalk]=useState<string|null>(null);
  const [moving,setMoving]=useState(false);
  const [showLabels,setShowLabels]=useState(false);
  const outside=view%4===3;
  const overlayRefs=useRef<Record<string,HTMLDivElement|null>>({});
  return <div className="scene-wrap" tabIndex={0} aria-label="3D-Kamerasteuerung: WASD oder Pfeiltasten zum Bewegen" onContextMenu={e=>e.preventDefault()}>
    <SceneBoundary fallback={<div className="scene-fallback"><Icon name="store" size={40}/><h3>3D ist auf diesem Gerät nicht verfügbar.</h3><p>Nutze die Produktliste darunter. Warenkorb und Automation funktionieren vollständig weiter.</p></div>}>
      <Suspense fallback={<div className="scene-loading"><span className="spinner"/>3D-Laden wird vorbereitet …</div>}>
        <Canvas frameloop={state.running?'always':'demand'} aria-label="Interaktiver 3D-Laden: Außenansicht und anklickbare Produkte im Laden" shadows dpr={[1,1.5]} camera={{position:[8,5.6,17.5],fov:49,near:.1,far:90}} onCreated={({gl})=>{gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.12;gl.shadowMap.type=THREE.PCFSoftShadowMap;}} gl={{antialias:true,alpha:false,powerPreference:'high-performance'}} fallback={<div className="scene-fallback" aria-hidden="true">WebGL ist nicht verfügbar. Bitte nutze die Produktliste.</div>}><MaterialLibrary><Content state={state} onSelect={onSelect} view={view} walk={walk} overlayRefs={overlayRefs} onEnter={()=>setView(2)} moving={moving} onMoving={setMoving}/></MaterialLibrary></Canvas>
      </Suspense>
    </SceneBoundary>
    <div className={`scene-overlays${moving?' camera-moving':''}${showLabels?'':' hide-product-labels'}`} aria-hidden={moving}>
      <div ref={element=>{overlayRefs.current.robot=element;}} className="projected-label" style={{display:'none'}}><div className="robot-bubble"><span>NOA · Demo-Assistent</span>Willkommen im<br/><strong>AI Grocery Store</strong><i/></div></div>
      {products.map(p=><div className="projected-label" style={{display:'none'}} key={p.id} ref={element=>{overlayRefs.current[p.id]=element;}}><button className={`shelf-label ${state.inventory[p.id]<p.minStock?'low':''}`} onClick={()=>onSelect(p)} aria-label={`${p.name} ansehen`}><span>{p.shortName}</span><strong>{(p.price/100).toFixed(2).replace('.',',')} €</strong>{!state.inventory[p.id]&&<em>Ausverkauft</em>}</button></div>)}
      {state.customers.map(c=><div className="projected-label" key={c.id} ref={element=>{overlayRefs.current[`customer-${c.id}`]=element;}}><div className="customer-tag">Kund:in {String(c.id).padStart(2,'0')}<span>{c.phase==='entering'?'Betritt den Laden':c.phase==='browsing'?'Wählt ein Produkt':c.phase==='to-checkout'?'Geht zur Kasse':c.phase==='checkout'?'Demo-Kauf':'Einkauf abgeschlossen'}</span></div></div>)}
    </div>
    <div className="scene-corner"><span className="live-dot"/>{outside?'AUSSENANSICHT · AI GROCERY':'INTERAKTIVER 3D-LADEN'}</div>
    <button className="product-label-toggle" aria-pressed={showLabels} onClick={()=>setShowLabels(v=>!v)}>{showLabels?'Produktinfos ausblenden':'Produktinfos anzeigen'}</button>
    <div className="camera-views" aria-label="Kameraansicht">{['Laden','Übersicht','Augenhöhe','Außenansicht'].map((label,index)=><button key={label} aria-pressed={view%4===index} className={view%4===index?'active':''} onClick={()=>setView(v=>v%4===index?v+4:index)}>{label}</button>)}</div>
    <button className="scene-entry" onClick={()=>setView(outside?2:3)}><Icon name="store" size={16}/>{outside?'Laden betreten':'Nach draußen'}<span aria-hidden="true">→</span></button>
    <div className="scene-help"><span>Ziehen: drehen · Scrollen: zoomen · WASD / Pfeile: bewegen</span><span className="touch-help">1 Finger: drehen · 2 Finger: zoomen / verschieben</span></div>
    <div className="touch-pad" aria-label="Durch den Laden bewegen">{[['forward','↑'],['left','←'],['back','↓'],['right','→']].map(([key,label])=><button key={key} aria-label={key==='forward'?'Vorwärts':key==='back'?'Rückwärts':key==='left'?'Nach links':'Nach rechts'} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);setWalk(key);}} onPointerUp={()=>setWalk(null)} onPointerCancel={()=>setWalk(null)}>{label}</button>)}</div>
  </div>;
}
