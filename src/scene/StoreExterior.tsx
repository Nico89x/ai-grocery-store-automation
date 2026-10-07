import { useEffect,useMemo,useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Customer } from '../domain/simulation';
import { customerPosition } from '../domain/customerJourney';
import { useSurface,surfaceForColor } from './Materials';

type Point=[number,number,number];
function Block({at,size,color='#d7d2c4',map,metal=0,shadow=true}:{at:Point;size:Point;color?:string;map?:THREE.Texture;metal?:number;shadow?:boolean}) {
  const surface=surfaceForColor(color),maps=useSurface(surface??'plaster');
  return <mesh position={at} castShadow={shadow} receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={color} {...(surface?maps:{})} map={map??(surface?maps?.map:undefined)} bumpScale={surface==='wood'?.018:.008} roughness={metal?.3:.79} metalness={metal}/></mesh>;
}
function Plaque({text,sub='',at,width,height,color='#173e35'}:{text:string;sub?:string;at:Point;width:number;height:number;color?:string}) {
  const map=useMemo(()=>{
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;
    const ctx=canvas.getContext('2d')!;ctx.fillStyle=color;ctx.fillRect(0,0,1024,256);
    ctx.textAlign='center';ctx.fillStyle='#f7f3df';ctx.font='bold 106px Arial';ctx.fillText(text,512,sub?138:163);
    if(sub){ctx.fillStyle='#c7d5b9';ctx.font='29px Arial';ctx.fillText(sub,512,206);}
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;return texture;
  },[text,sub,color]);
  useEffect(()=>()=>map.dispose(),[map]);
  return <mesh position={at}><planeGeometry args={[width,height]}/><meshStandardMaterial map={map} roughness={.6} emissive="#c3d6a1" emissiveIntensity={.13}/></mesh>;
}
function Tree({at}:{at:Point}) {
  const foliage=useRef<THREE.InstancedMesh>(null);
  useEffect(()=>{
    const mesh=foliage.current;if(!mesh)return;const dummy=new THREE.Object3D();
    for(let i=0;i<1600;i++){const a=i*2.39996,r=Math.pow(((i*71)%1601)/1601,1/3)*1.4,v=((i*137)%1607)/1607*2-1;
      dummy.position.set(Math.cos(a)*r*Math.sqrt(1-v*v),3.25+v*r*.68,Math.sin(a)*r*Math.sqrt(1-v*v));dummy.rotation.set(i*.17,a,i*.31);dummy.scale.set(.085,.022,.16);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,new THREE.Color(['#587739','#6b8946','#436332','#7b9753'][i%4]));}
    mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
  },[]);
  return <group position={at}>
    <Block at={[0,.24,0]} size={[1.6,.5,1.6]} color="#b8b7a5"/>
    <Block at={[0,.49,0]} size={[1.44,.015,1.44]} color="#5b6440"/>
    <mesh position={[0,1.75,0]} castShadow><cylinderGeometry args={[.10,.16,2.7,10]}/><meshStandardMaterial color="#77664e" roughness={1}/></mesh>
    {[-1,1].map(side=><mesh key={side} position={[side*.28,2.65,0]} rotation={[0,0,side*-.55]} castShadow><cylinderGeometry args={[.035,.08,1.6,7]}/><meshStandardMaterial color="#74604b" roughness={.95}/></mesh>)}
    <instancedMesh ref={foliage} args={[undefined,undefined,1600]} castShadow><sphereGeometry args={[1,6,4]}/><meshStandardMaterial color="#ffffff" roughness={.9}/></instancedMesh>
  </group>;
}
function Glass({at,size}:{at:Point;size:Point}) {
  return <mesh position={at} raycast={()=>null}><boxGeometry args={size}/><meshPhysicalMaterial color="#bad8d6" roughness={.055} metalness={.3} clearcoat={1} transparent opacity={.19} depthWrite={false} side={THREE.DoubleSide}/></mesh>;
}
function Door({customers,onEnter}:{customers:Customer[];onEnter:()=>void}) {
  const left=useRef<THREE.Group>(null),right=useRef<THREE.Group>(null),opening=useRef(0);
  const shouldOpen=customers.some(c=>{const [x,,z]=customerPosition(c);return Math.abs(x)<1&&z>4.5&&z<7.6;});
  useFrame((_,dt)=>{
    opening.current=THREE.MathUtils.damp(opening.current,shouldOpen?1:0,6,dt);
    if(left.current)left.current.position.x=-.57-opening.current*1.06;
    if(right.current)right.current.position.x=.57+opening.current*1.06;
  });
  return <group position={[0,0,5.85]} onClick={event=>{event.stopPropagation();onEnter();}}>
    <Block at={[0,3.12,0]} size={[2.55,.18,.22]} color="#263c34" metal={.5}/>
    {[-1,1].map((side,i)=><group key={side} ref={i===0?left:right} position={[side*.57,0,0]}>
      <Glass at={[0,1.49,0]} size={[1.08,2.88,.025]}/>
      {[-.55,.55].map(x=><Block key={x} at={[x,1.49,.01]} size={[.046,2.98,.07]} color="#304138" metal={.6}/>)}
      {[.025,2.97].map(y=><Block key={y} at={[0,y,.01]} size={[1.15,.052,.07]} color="#304138" metal={.6}/>)}
      <Block at={[side*-.43,1.3,.09]} size={[.026,.5,.035]} color="#c5d0c6" metal={.9}/>
      <Block at={[0,1.14,.029]} size={[1.08,.045,.01]} color="#e0e9d7" shadow={false}/>
      <mesh position={[0,1.7,.08]}><planeGeometry args={[.35,.4]}/><meshBasicMaterial transparent opacity={0}/></mesh>
    </group>)}
    <mesh position={[0,1.5,.1]}><boxGeometry args={[2.3,3,.08]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/></mesh>
    <Block at={[0,.015,.03]} size={[2.45,.025,.35]} color="#69786a" metal={.3}/>
  </group>;
}

/** Selbst modellierte Fassade und Umgebung. Die bestehenden Regale sind durch die Fenster sichtbar. */
export default function StoreExterior({outside,enclosed,customers,onEnter}:{outside:boolean;enclosed:boolean;customers:Customer[];onEnter:()=>void}) {
  const paving=useMemo(()=>{
    const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;
    const c=canvas.getContext('2d')!;c.fillStyle='#cecaba';c.fillRect(0,0,256,256);
    for(let i=0;i<1600;i++){c.fillStyle=i%2?'#d5d1c020':'#7c7f6d16';c.fillRect(i*71%256,i*137%256,2,2);}
    c.strokeStyle='#aaa995';c.lineWidth=2;c.strokeRect(0,0,256,256);c.beginPath();c.moveTo(128,0);c.lineTo(128,256);c.moveTo(0,128);c.lineTo(256,128);c.stroke();
    const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(15,10);return t;
  },[]);
  useEffect(()=>()=>paving.dispose(),[paving]);
  return <group>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.075,0]} receiveShadow><planeGeometry args={[55,45]}/><meshStandardMaterial color="#b8beaa" roughness={1}/></mesh>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.005,8.65]} receiveShadow><planeGeometry args={[31,5.9]}/><meshStandardMaterial map={paving} roughness={.87}/></mesh>
    <Block at={[0,-.15,11.58]} size={[31,.30,.22]} color="#b5b8a7"/>
    <Block at={[0,-.23,17]} size={[55,.08,10.5]} color="#666d67" shadow={false}/>
    {[-18,-12,-6,0,6,12,18].map(x=><Block key={x} at={[x,-.184,18.4]} size={[2.8,.006,.12]} color="#e3e2cf" shadow={false}/>)}
    <Tree at={[-7.5,0,7.45]}/><Tree at={[7.5,0,7.45]}/>
    <group position={[6.1,0,9.35]}>
      {[.45,.62,.79].map(z=><Block key={z} at={[0,.48,z]} size={[1.6,.07,.12]} color="#967c57"/>)}
      {[.8,1.0].map(y=><Block key={y} at={[0,y,.9]} size={[1.6,.12,.06]} color="#ad9267"/>)}
      {[-.62,.62].map(x=><Block key={x} at={[x,.28,.64]} size={[.07,.5,.55]} color="#35463a" metal={.5}/>)}
    </group>
    <group position={[-6,0,10.4]}><Block at={[0,2.15,0]} size={[.085,4.3,.085]} color="#344539" metal={.5}/><Block at={[.34,4.25,0]} size={[.74,.09,.25]} color="#344539"/><mesh position={[.34,4.20,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[.61,.18]}/><meshBasicMaterial color="#fff3d1"/></mesh></group>
    {[-3.25,3.25].map(x=><group key={x}><Block at={[x,.43,10.85]} size={[.10,.86,.10]} color="#3d5041" metal={.6}/><Block at={[x,.66,10.85]} size={[.115,.09,.115]} color="#dbdfce"/></group>)}
    <group visible={enclosed}>
      {/* Außen und auf Augenhöhe geschlossen; die beiden Überblickskameras zeigen den offenen Grundriss. */}
      <Block at={[0,4.27,0]} size={[10.75,.22,11.8]} color="#686f60"/>
      <Block at={[0,4.44,0]} size={[10.65,.16,11.65]} color="#d3d3c1"/>
      {[-5.23,5.23].map(x=><Block key={x} at={[x,4.38,0]} size={[.09,.35,11.7]} color="#415648" metal={.45}/>)}
      <Block at={[5.2,2.05,0]} size={[.12,4.1,11.55]} color="#c6c0aa"/>
      {[.65,1.35,2.05,2.75,3.45].map(y=><Block key={y} at={[5.27,y,0]} size={[.01,.016,11.5]} color="#aba58e" shadow={false}/>)}
      <group position={[5.34,0,-4.9]}><mesh position={[0,2.04,0]} castShadow><cylinderGeometry args={[.055,.055,4.08,12]}/><meshStandardMaterial color="#778175" metalness={.65} roughness={.3}/></mesh>{[.4,2.1,3.8].map(y=><Block key={y} at={[0,y,0]} size={[.13,.045,.13]} color="#4a584c" metal={.6}/>)}</group>
      <Block at={[-5.22,3.96,0]} size={[.10,.5,11.55]} color="#d6d0bb"/>
      <Block at={[0,3.76,5.72]} size={[10.55,.83,.22]} color="#1e4236"/>
      <Plaque text="AI GROCERY" sub="FRISCHE LEBENSMITTEL · SNACKS · SMARTER SERVICE" at={[0,3.77,5.847]} width={5.8} height={.72}/>
      <Block at={[0,3.25,6.12]} size={[10.5,.10,1.05]} color="#45634b"/>
      <Block at={[0,3.19,6.63]} size={[10.5,.10,.07]} color="#233e30"/>
      <mesh position={[0,3.18,6.34]} rotation={[Math.PI/2,0,0]}><planeGeometry args={[9.9,.024]}/><meshBasicMaterial color="#ffedbd" side={THREE.DoubleSide}/></mesh>
      {[-5.03,-1.29,1.29,5.03].map(x=><group key={x}><Block at={[x,1.65,5.73]} size={[.24,3.3,.30]} color="#987b55"/>{[-.07,0,.07].map(dx=><Block key={dx} at={[x+dx,1.65,5.90]} size={[.023,3.3,.035]} color="#bd9d6b"/>)}</group>)}
      {[-3.17,3.17].map(x=><group key={x}>
        <Block at={[x,.23,5.73]} size={[3.53,.45,.28]} color="#c4bcaa"/>
        <Glass at={[x,1.81,5.81]} size={[3.50,2.66,.018]}/>
        {[.45,3.14].map(y=><Block key={y} at={[x,y,5.84]} size={[3.53,.055,.08]} color="#2b4336" metal={.55}/>)}
        <Block at={[x,1.81,5.85]} size={[.045,2.7,.055]} color="#2b4336" metal={.55}/>
        <Block at={[x,1.03,5.86]} size={[3.5,.035,.012]} color="#e8ece0" shadow={false}/>
      </group>)}
      <Door customers={customers} onEnter={outside?onEnter:()=>{}}/>
      <Plaque text="FRISCH. JEDEN TAG." sub="OBST · BROT · GETRÄNKE" at={[-3.2,2.65,5.9]} width={2.3} height={.46} color="#506f4e"/>
      <Plaque text="WILLKOMMEN" sub="DEIN SMARTER NACHBARSCHAFTSLADEN" at={[3.2,2.65,5.9]} width={2.3} height={.46} color="#506f4e"/>
      <group position={[-3.1,0,7.35]} rotation={[0,.15,0]}>
        <Block at={[0,.8,0]} size={[.82,1.16,.06]} color="#263e31"/>
        {[-.43,.43].map(x=><Block key={x} at={[x,.68,.08]} size={[.055,1.35,.08]} color="#9f845b"/>)}
        <Plaque text="OFFEN" sub="WILLKOMMEN BEI NOA" at={[0,.96,.04]} width={.74} height={.36}/>
        <Plaque text="FRISCH & SMART" sub="PORTFOLIO-DEMO" at={[0,.58,.04]} width={.74} height={.30}/>
      </group>
      {/* Neutrale Nachbargebäude schaffen Maßstab und Straßenraum. */}
      {[-1,1].map(side=><group key={side} position={[side*12.3,0,-1.5]}>
        <Block at={[0,2.9,0]} size={[7.0,5.8,10.6]} color={side===1?'#d2c9b5':'#c3c7b6'}/>
        <Block at={[0,5.91,0]} size={[7.15,.15,10.7]} color="#9ba591"/>
        {[-2,0,2].map(x=><group key={x}>{[1.6,4.05].map(y=><group key={y}><Block at={[x,y,5.32]} size={[1.15,1.45,.04]} color="#758f87" shadow={false}/><Block at={[x,y,5.36]} size={[.045,1.48,.03]} color="#d6d8c4"/><Block at={[x,y,5.36]} size={[1.2,.045,.03]} color="#d6d8c4"/></group>)}</group>)}
      </group>)}
    </group>
  </group>;
}
