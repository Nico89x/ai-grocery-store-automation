import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { Customer } from '../domain/simulation';
import { customerHeading,customerPosition } from '../domain/customerJourney';
import { productById } from '../domain/products';
import GroceryProduct from './GroceryProduct';
import { useSurface } from './Materials';

type Point=[number,number,number];
const profiles=[
  {skin:'#d9aa87',hair:'#42332c',height:1.04,style:0},
  {skin:'#b67d59',hair:'#262724',height:1,style:1},
  {skin:'#ebc3a3',hair:'#7d5836',height:.97,style:2},
  {skin:'#88593f',hair:'#252a29',height:1.06,style:0},
  {skin:'#d1a386',hair:'#7e8078',height:1.01,style:1},
  {skin:'#bc8c68',hair:'#51382d',height:.99,style:2},
];
function Ball({at,scale=[1,1,1],radius=.1,color,roughness=.65}:{at:Point;scale?:Point;radius?:number;color:string;roughness?:number}) {
  return <mesh position={at} scale={scale} castShadow><sphereGeometry args={[radius,18,12]}/><meshStandardMaterial color={color} roughness={roughness}/></mesh>;
}
function Limb({at,length,top=.055,bottom=.05,color}:{at:Point;length:number;top?:number;bottom?:number;color:string}) {
  const fabric=useSurface('cloth');
  return <mesh position={at} castShadow><cylinderGeometry args={[top,bottom,length,18]}/><meshStandardMaterial color={color} roughness={.82} bumpMap={fabric?.bumpMap} bumpScale={.0015}/></mesh>;
}
function Hand({skin}:{skin:string}) {
  return <group><Ball at={[0,-.035,0]} radius={.048} scale={[.72,1.18,.6]} color={skin}/>{[-.025,-.009,.008,.024].map((x,i)=><Limb key={x} at={[x,-.098,i%2*.006]} length={.055-i%2*.009} top={.008} bottom={.006} color={skin}/>)}<Ball at={[-.036,-.025,.02]} radius={.012} scale={[1,1.8,1]} color={skin}/></group>;
}

/** Eigene artikulierte Figuren: keine gescannten Personen oder fremden Charaktermodelle. */
export default function HumanShopper({customer:c,running,speed}:{customer:Customer;running:boolean;speed:number}) {
  const profile=profiles[(c.id-1)%profiles.length],skin=profile.skin;
  const fabric=useSurface('cloth'),targetPosition=useRef(new THREE.Vector3());
  const pose=customerPosition(c),root=useRef<THREE.Group>(null),torso=useRef<THREE.Group>(null),head=useRef<THREE.Group>(null);
  const legs=[useRef<THREE.Group>(null),useRef<THREE.Group>(null)],knees=[useRef<THREE.Group>(null),useRef<THREE.Group>(null)];
  const arms=[useRef<THREE.Group>(null),useRef<THREE.Group>(null)],forearms=[useRef<THREE.Group>(null),useRef<THREE.Group>(null)];
  const eyes=useRef<THREE.Group>(null),clock=useRef(0),initial=useRef(pose),heading=customerHeading(c);
  const walking=running&&['entering','to-checkout','leaving'].includes(c.phase),chosen=['to-checkout','checkout','leaving'].includes(c.phase);
  useFrame((_,dt)=>{
    if(running)clock.current+=Math.min(dt,.06)*speed;
    const gait=clock.current*5.2,swing=walking?Math.sin(gait)*.32:0,reach=c.phase==='browsing'?Math.sin(Math.PI*Math.min(1,c.elapsed/4.6)):0;
    if(root.current){targetPosition.current.set(...pose);root.current.position.lerp(targetPosition.current,1-Math.exp(-dt*13));const difference=THREE.MathUtils.euclideanModulo(heading-root.current.rotation.y+Math.PI,Math.PI*2)-Math.PI;root.current.rotation.y+=difference*(1-Math.exp(-dt*9));}
    if(torso.current){torso.current.position.y=(walking?Math.abs(Math.sin(gait))*.018:Math.sin(clock.current*.9+c.id)*.004);torso.current.rotation.z=walking?Math.sin(gait)*.014:0;}
    if(head.current){head.current.rotation.x=c.phase==='browsing'?reach*.1:Math.sin(clock.current*.8)*.025;head.current.rotation.y=c.phase==='checkout'?Math.sin(clock.current*.6)*.08:Math.sin(clock.current*.45+c.id)*.055;}
    for(let i=0;i<2;i++){const side=i===0?1:-1;if(legs[i].current)legs[i].current!.rotation.x=swing*side;if(knees[i].current)knees[i].current!.rotation.x=walking?Math.max(0,-Math.sin(gait)*side)*.43:.025;
      if(arms[i].current)arms[i].current!.rotation.x=i===1?-reach*.95+(walking?-swing*.62:0):chosen?-.22:walking?swing*.62:0;
      if(forearms[i].current)forearms[i].current!.rotation.x=i===1?-reach*.7:chosen?-.28:-.12;}
    if(eyes.current){const blink=(clock.current+c.id*.73)%4.7;eyes.current.scale.y=blink>4.53?.12:1;}
  });
  const pants=c.id%3===0?'#51606b':'#363e3d',shirtShade=new THREE.Color(c.color).multiplyScalar(.78).getStyle();
  return <group ref={root} position={initial.current} rotation={[0,heading,0]} scale={profile.height}>
    {/* Hosenbeine mit Kniegelenken, Schuhe und sichtbarer Sohle. */}
    {[-1,1].map((side,i)=><group key={side} ref={legs[i]} position={[side*.105,.78,0]}>
      <Limb at={[0,-.18,0]} length={.35} top={.086} bottom={.067} color={pants}/>
      <group ref={knees[i]} position={[0,-.37,0]}><Ball at={[0,0,0]} radius={.065} color={pants}/><Limb at={[0,-.17,0]} length={.33} top={.062} bottom={.047} color={pants}/>
        <RoundedBox position={[0,-.347,.055]} args={[.13,.1,.25]} radius={.037} smoothness={3} castShadow><meshStandardMaterial color={c.id%2?'#e4ddd1':'#56534c'} roughness={.75}/></RoundedBox><RoundedBox position={[0,-.394,.06]} args={[.136,.022,.255]} radius={.01} smoothness={2}><meshStandardMaterial color="#b0aca1"/></RoundedBox>
      </group>
    </group>)}
    <group ref={torso}>
      <RoundedBox position={[0,.87,0]} args={[.33,.16,.24]} radius={.07} smoothness={4}><meshStandardMaterial color={pants} roughness={.85}/></RoundedBox>
      <mesh position={[0,.92,0]} scale={[1,1,.64]} castShadow><latheGeometry args={[[[.155,0],[.165,.04],[.163,.12],[.185,.25],[.212,.36],[.195,.42],[.08,.47]].map(([x,y])=>new THREE.Vector2(x,y)),28]}/><meshStandardMaterial color={c.color} roughness={.92} bumpMap={fabric?.bumpMap} bumpScale={.003}/></mesh>
      <Limb at={[0,1.42,0]} length={.14} top={.052} bottom={.058} color={skin}/>
      {[-1,1].map(side=><mesh key={`collar-${side}`} position={[side*.064,1.348,.121]} rotation={[0,0,side*-.45]}><boxGeometry args={[.073,.075,.018]}/><meshStandardMaterial color={shirtShade} roughness={.95}/></mesh>)}
      <mesh position={[0,1.12,.143]}><boxGeometry args={[.012,.3,.006]}/><meshStandardMaterial color={shirtShade}/></mesh>
      {[1.05,1.16,1.27].map(y=><Ball key={y} at={[0,y,.151]} radius={.006} color="#e4e0d4"/>)}
      <group ref={head} position={[0,1.58,.002]} scale={[.72,.68,.72]}>
        <Ball at={[0,0,0]} radius={.178} scale={[.92,1.22,.95]} color={skin} roughness={.55}/>
        {[-1,1].map(side=><Ball key={`ear-${side}`} at={[side*.161,-.005,-.01]} radius={.035} scale={[.55,1,.7]} color={skin}/>)}
        <Ball at={[0,-.018,.165]} radius={.024} scale={[.65,1.45,1]} color={skin}/>
        <Ball at={[0,.025,.151]} radius={.02} scale={[.65,2.1,.8]} color={skin}/>
        {[-1,1].map(side=><group key={`face-${side}`}><Ball at={[side*.022,-.042,.165]} radius={.012} scale={[1,.6,.9]} color={skin}/><Ball at={[side*.072,-.042,.13]} radius={.041} scale={[1,.7,.42]} color={skin}/><Ball at={[side*.013,-.047,.17]} radius={.004} color="#7a5140"/></group>)}
        <group ref={eyes} position={[0,.04,.15]}>{[-1,1].map(side=><group key={side} position={[side*.061,0,0]}><Ball at={[0,0,0]} radius={.025} scale={[1,.55,.35]} color="#f4eee6" roughness={.25}/><Ball at={[0,0,.009]} radius={.010} color={c.id%2?'#604b36':'#354d45'}/><Ball at={[0,0,.016]} radius={.0045} color="#182622"/><Ball at={[-.003,.004,.018]} radius={.0025} color="#fff"/></group>)}</group>
        {[-1,1].map(side=><mesh key={`brow-${side}`} position={[side*.061,.078,.145]} rotation={[0,0,Math.PI/2-side*.1]}><capsuleGeometry args={[.006,.035,3,8]}/><meshStandardMaterial color={profile.hair}/></mesh>)}
        <Ball at={[0,-.084,.148]} radius={.026} scale={[1,.15,.18]} color="#a56e5d"/>
        <Ball at={[0,-.092,.148]} radius={.025} scale={[1,.19,.19]} color="#b97c69"/>
        <mesh position={[0,-.088,.154]}><boxGeometry args={[.047,.0015,.002]}/><meshStandardMaterial color="#754c3d" roughness={.85}/></mesh>
        <Ball at={[0,-.135,.09]} radius={.044} scale={[1.3,.68,.64]} color={skin}/>
        <mesh position={[0,.008,-.012]} scale={[.92,1.22,.95]} castShadow><sphereGeometry args={[.182,24,18,0,Math.PI*2,0,profile.style===2?1.7:1.3]}/><meshStandardMaterial color={profile.hair} roughness={.9}/></mesh>
        {profile.style===1&&[-.1,-.04,.025,.09].map((x,i)=><Ball key={x} at={[x,.182-i*.009,.035]} radius={.065} scale={[.8,.62,1.3]} color={profile.hair}/>)}
        {profile.style===2&&<><Ball at={[0,-.03,-.17]} radius={.09} scale={[.65,1.6,.8]} color={profile.hair}/><Ball at={[0,-.18,-.175]} radius={.072} scale={[.65,1.5,.7]} color={profile.hair}/></>}
        {c.id%3===0&&<group position={[0,.04,.166]}>{[-1,1].map(side=><mesh key={side} position={[side*.062,0,0]}><torusGeometry args={[.031,.0035,6,22]}/><meshStandardMaterial color="#413e38" metalness={.55}/></mesh>)}<mesh><boxGeometry args={[.062,.005,.005]}/><meshStandardMaterial color="#413e38"/></mesh></group>}
      </group>
      {/* Arm- und Handgelenke ermöglichen Auswahl und Tragen statt starrer Zylinder. */}
      {[-1,1].map((side,i)=><group key={`arm-${side}`} ref={arms[i]} position={[side*.242,1.33,0]} rotation={[0,0,side*.085]}>
        <Ball at={[0,-.025,0]} radius={.08} color={c.color}/><Limb at={[0,-.13,0]} length={.22} top={.072} bottom={.06} color={c.color}/>
        <group ref={forearms[i]} position={[0,-.25,0]}><Ball at={[0,0,0]} radius={.051} color={skin}/><Limb at={[0,-.11,0]} length={.2} top={.048} bottom={.034} color={skin}/><group position={[0,-.23,0]}><Hand skin={skin}/></group>
          {i===0&&<group position={[0,-.4,.065]}><RoundedBox args={[.28,.19,.21]} radius={.02} smoothness={2}><meshStandardMaterial color="#b6a17d" roughness={.9}/></RoundedBox>{[-.09,-.045,0,.045,.09].map(x=><mesh key={x} position={[x,0,.109]}><boxGeometry args={[.007,.18,.012]}/><meshStandardMaterial color="#8c7e62"/></mesh>)}<mesh position={[0,.15,0]}><torusGeometry args={[.1,.012,8,22,Math.PI]}/><meshStandardMaterial color="#716956"/></mesh>{chosen&&<group position={[0,.13,0]} scale={.32}><GroceryProduct p={productById[c.productId]}/></group>}</group>}
          {i===1&&c.phase==='browsing'&&c.elapsed>2.6&&<group position={[0,-.28,.065]} scale={.28}><GroceryProduct p={productById[c.productId]}/></group>}
        </group>
      </group>)}
    </group>
  </group>;
}
