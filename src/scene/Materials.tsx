import { createContext,useContext,useEffect,useMemo,type ReactNode } from 'react';
import * as THREE from 'three';

type Surface='wood'|'stone'|'plaster'|'crust'|'cloth';
type Maps={map:THREE.CanvasTexture;bumpMap:THREE.CanvasTexture};
const Materials=createContext<Partial<Record<Surface,Maps>>>({});

/** Deterministische eigene Texturen. Kein Asset-Download und keine Fremdlizenzen. */
function makeSurface(kind:Surface):Maps {
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
  const c=canvas.getContext('2d')!;let seed=kind.length*1949;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  c.fillStyle=kind==='stone'?'#d2cabc':kind==='crust'?'#cd914e':'#eee8df';c.fillRect(0,0,512,512);
  if(kind==='cloth') {
    c.fillStyle='#faf7f0';c.fillRect(0,0,512,512);
    for(let i=0;i<512;i+=4){c.strokeStyle=i%8?'#d6d0c1':'#efebe2';c.lineWidth=1;c.beginPath();c.moveTo(i,0);c.lineTo(i,512);c.moveTo(0,i);c.lineTo(512,i);c.stroke();}
    for(let i=0;i<11000;i++){c.fillStyle=`rgba(110,104,88,${random()*.12})`;c.fillRect(random()*512,random()*512,1,1);}
  } else if(kind==='wood') {
    for(let i=0;i<680;i++){const y=random()*512;c.strokeStyle=`rgba(83,56,29,${.035+random()*.11})`;c.lineWidth=.4+random()*1.3;c.beginPath();c.moveTo(0,y);for(let x=0;x<=512;x+=8)c.lineTo(x,y+Math.sin(x*.018+i*.33)*(2+random()*3));c.stroke();}
    for(let i=0;i<5;i++){c.strokeStyle='#8f765319';c.lineWidth=1.5;c.beginPath();c.ellipse(random()*512,random()*512,42+random()*55,3+random()*5,0,0,Math.PI*2);c.stroke();}
  } else {
    for(let i=0;i<19000;i++){const v=Math.floor(random()*80+120);c.fillStyle=kind==='crust'?`rgba(${v+40},${v-30},${v-80},${random()*.35})`:`rgba(${v},${v},${v},${random()*.12})`;const size=.3+random()*(kind==='stone'?2.2:1.4);c.fillRect(random()*512,random()*512,size,size);}
    if(kind==='stone'){c.strokeStyle='#928e8070';c.lineWidth=2;c.strokeRect(1,1,510,510);}
    if(kind==='crust')for(let i=0;i<60;i++){c.fillStyle='#f5e1ad60';c.beginPath();c.ellipse(random()*512,random()*512,2,1,random()*Math.PI,0,Math.PI*2);c.fill();}
  }
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.anisotropy=4;
  const bumpMap=map.clone();bumpMap.colorSpace=THREE.NoColorSpace;bumpMap.needsUpdate=true;
  if(kind==='stone'){map.repeat.set(8,9);bumpMap.repeat.copy(map.repeat);}
  return {map,bumpMap};
}
export function MaterialLibrary({children}:{children:ReactNode}) {
  const maps=useMemo(()=>Object.fromEntries((['wood','stone','plaster','crust','cloth'] as Surface[]).map(name=>[name,makeSurface(name)])) as Record<Surface,Maps>,[]);
  useEffect(()=>()=>Object.values(maps).forEach(m=>{m.map.dispose();m.bumpMap.dispose();}),[maps]);
  return <Materials.Provider value={maps}>{children}</Materials.Provider>;
}
export const useSurface=(name:Surface)=>useContext(Materials)[name];
const woodColors=new Set(['#b08b62','#dcc6a6','#9a734c','#b99164','#b18d63','#9b7954','#ba956c','#b59b75','#967c57','#ad9267','#987b55','#bd9d6b','#9f845b']);
const plasterColors=new Set(['#ded8c7','#e8e0ce','#c7c4b1','#c6c0aa','#d6d0bb','#d2c9b5','#c3c7b6','#c4bcaa']);
export const surfaceForColor=(color:string):Surface|undefined=>woodColors.has(color)?'wood':plasterColors.has(color)?'plaster':undefined;
