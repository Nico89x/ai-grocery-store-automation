import { useEffect,useMemo } from 'react';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import type { Product } from '../domain/products';
import { useSurface } from './Materials';
import { createBagGeometry,createAppleGeometry } from './ProductGeometry';

function packaging(p:Product) {
  const canvas=document.createElement('canvas');canvas.width=384;canvas.height=512;const c=canvas.getContext('2d')!;
  c.fillStyle=p.color;c.fillRect(0,0,384,512);
  const g=c.createLinearGradient(0,0,384,0);g.addColorStop(0,'#ffffff05');g.addColorStop(.38,'#ffffff38');g.addColorStop(.65,'#00000005');g.addColorStop(1,'#00000026');c.fillStyle=g;c.fillRect(0,0,384,512);
  c.fillStyle='#f8edda';c.fillRect(22,50,340,42);c.textAlign='center';c.fillStyle='#263b31';c.font='bold 21px Arial';c.fillText('GROCERY / SELECTION',192,78);
  c.fillStyle=p.kind==='bag'?'#28392c':'#fff2dc';c.font='bold 36px Arial';p.shortName.split(' ').forEach((word,i)=>c.fillText(word.toUpperCase(),192,160+i*42));
  // Eigene Produktillustrationen anstelle bloßer einfarbiger Packungen.
  if(p.kind==='bag')for(let i=0;i<5;i++){c.save();c.translate(110+(i%3)*74,320+Math.floor(i/3)*46);c.rotate((i-2)*.24);c.fillStyle=i%2?'#eacb83':'#f4d997';c.strokeStyle='#b98939';c.lineWidth=2;c.beginPath();c.ellipse(0,0,49,29,0,0,Math.PI*2);c.fill();c.stroke();for(let k=-18;k<=18;k+=6){c.strokeStyle='#b9893930';c.beginPath();c.moveTo(-35,k);c.lineTo(35,k);c.stroke();}c.restore();}
  else if(p.kind==='bar')for(let x=0;x<3;x++)for(let y=0;y<2;y++){c.fillStyle='#351e18';c.fillRect(90+x*68,295+y*51,61,43);c.strokeStyle='#bd93736b';c.strokeRect(94+x*68,299+y*51,53,35);}
  else {c.fillStyle='#ffffff45';c.beginPath();c.arc(192,330,56,0,Math.PI*2);c.fill();c.font='bold 23px Arial';c.fillStyle='#fff';c.fillText(p.id==='water'?'STILL':p.id==='juice'?'100 %':'ZITRONE',192,337);}
  c.fillStyle='#faf2dc';c.font='bold 23px Arial';c.fillText(p.size,192,463);c.font='13px Arial';c.fillText('NEUTRALES DEMOPRODUKT',192,488);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;return texture;
}
function Shape({p,texture}:{p:Product;texture:THREE.Texture}) {
  const crust=useSurface('crust');
  const bag=useMemo(()=>p.kind==='bag'?createBagGeometry():null,[p.kind]);
  const apple=useMemo(()=>p.kind==='apple'?createAppleGeometry():null,[p.kind]);
  const curved=useMemo(()=> {
    if(p.kind==='banana')return new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-.24,-.04,0),new THREE.Vector3(-.12,.07,0),new THREE.Vector3(.08,.09,0),new THREE.Vector3(.23,-.02,0)]),18,.047,8,false);
    if(p.kind==='croissant')return new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-.3,0,.12),new THREE.Vector3(-.22,.06,-.05),new THREE.Vector3(0,.11,-.15),new THREE.Vector3(.22,.06,-.05),new THREE.Vector3(.3,0,.12)]),26,.09,12,false);
    return null;
  },[p.kind]);
  useEffect(()=>()=>{bag?.dispose();apple?.dispose();curved?.dispose();},[bag,apple,curved]);
  if(bag)return <group>{[1,-1].map(side=><mesh key={side} geometry={bag} scale={[1,1,side]} castShadow><meshPhysicalMaterial map={texture} roughness={.31} metalness={.12} clearcoat={.5} clearcoatRoughness={.35} side={THREE.DoubleSide}/></mesh>)}{[-.316,.316].map(y=><mesh key={y} position={[0,y,.006]}><boxGeometry args={[.38,.025,.025]}/><meshStandardMaterial color={p.color} roughness={.35}/></mesh>)}</group>;
  if(p.kind==='bar')return <RoundedBox args={[.28,.43,.046]} radius={.012} smoothness={3} castShadow><meshPhysicalMaterial map={texture} roughness={.48} clearcoat={.16}/></RoundedBox>;
  if(p.kind==='bottle')return <group>
    <mesh position={[0,-.18,0]} castShadow><latheGeometry args={[[[0,0],[.102,0],[.124,.027],[.124,.32],[.116,.37],[.062,.43],[.05,.46],[.05,.56]].map(([x,y])=>new THREE.Vector2(x,y)),28]}/><meshPhysicalMaterial color={p.color} roughness={.13} metalness={.02} clearcoat={1} transmission={p.id==='water'?.42:0} thickness={.1} ior={1.46}/></mesh>
    <mesh position={[0,.06,0]} rotation={[0,-.96,0]}><cylinderGeometry args={[.126,.126,.23,28,1,true,0,1.92]}/><meshStandardMaterial map={texture} roughness={.5} side={THREE.DoubleSide}/></mesh>
    <mesh position={[0,.385,0]}><cylinderGeometry args={[.055,.055,.056,24]}/><meshStandardMaterial color="#eff0e5" roughness={.36}/></mesh>
    {[.28,.3,.32].map(y=><mesh key={y} position={[0,y,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.052,.004,6,24]}/><meshStandardMaterial color="#b9c2b5"/></mesh>)}
  </group>;
  if(p.kind==='can')return <group><mesh position={[0,.075,0]} castShadow><cylinderGeometry args={[.118,.12,.35,28]}/><meshPhysicalMaterial map={texture} roughness={.28} metalness={.55} clearcoat={.3}/></mesh>{[-.103,.253].map(y=><mesh key={y} position={[0,y,0]}><cylinderGeometry args={[.117,.117,.012,28]}/><meshStandardMaterial color="#d5d8d6" metalness={.88} roughness={.2}/></mesh>)}<mesh position={[.025,.262,0]} rotation={[-Math.PI/2,0,0]}><torusGeometry args={[.035,.008,6,18]}/><meshStandardMaterial color="#85918b" metalness={.8}/></mesh></group>;
  if(p.kind==='apple')return <group>{[[-.18,0,.07],[.17,0,.02],[0,.2,-.08]].map((position,i)=><group key={i} position={position as [number,number,number]} rotation={[0,i*1.3,.12]}><mesh geometry={apple!} scale={[1,.96,1]} castShadow><meshPhysicalMaterial color={i===1?'#c4543c':p.color} roughness={.32} clearcoat={.5} {...crust} map={null} bumpScale={.004}/></mesh><mesh position={[0,.175,0]} rotation={[0,0,.22]}><cylinderGeometry args={[.01,.015,.09,7]}/><meshStandardMaterial color="#725b3b"/></mesh><mesh position={[.045,.19,0]} rotation={[.7,0,-.5]} scale={[.8,.25,1]}><sphereGeometry args={[.065,12,8]}/><meshStandardMaterial color="#45663b"/></mesh></group>)}</group>;
  if(p.kind==='banana')return <group>{[-.1,0,.1].map((z,i)=><group key={z} position={[0,i*.018,z]} rotation={[.15,0,i*.12]}><mesh geometry={curved!} castShadow><meshStandardMaterial color={p.color} roughness={.48}/></mesh>{[-.24,.23].map(x=><mesh key={x} position={[x,-.028,0]}><sphereGeometry args={[.025,8,6]}/><meshStandardMaterial color="#786438"/></mesh>)}</group>)}</group>;
  if(p.kind==='croissant')return <group><mesh geometry={curved!} castShadow><meshStandardMaterial {...crust} roughness={.73} bumpScale={.012}/></mesh>{[-2,-1,0,1,2].map(i=><mesh key={i} position={[i*.082,.06,-.11+Math.abs(i)*.02]} rotation={[Math.PI/2,0,i*.2]}><torusGeometry args={[.097,.009,8,18,Math.PI*1.7]}/><meshStandardMaterial color="#d3a060" roughness={.8}/></mesh>)}</group>;
  return <group><mesh scale={[.42,.18,.25]} castShadow><sphereGeometry args={[1,36,24]}/><meshStandardMaterial {...crust} roughness={.87} bumpScale={.015}/></mesh>{[-.18,0,.18].map(x=><mesh key={x} position={[x,.168,0]} rotation={[Math.PI/2,.2,.4]}><capsuleGeometry args={[.012,.29,3,8]}/><meshStandardMaterial color="#efd7a2" roughness={.95}/></mesh>)}</group>;
}
export default function GroceryProduct({p}:{p:Product}) {
  const texture=useMemo(()=>packaging(p),[p]);useEffect(()=>()=>texture.dispose(),[texture]);
  return <Shape p={p} texture={texture}/>;
}
