import { productById } from './products';
import type { Customer,CustomerPhase } from './simulation';

export type Point=[number,number,number];
const distance=(a:Point,b:Point)=>Math.hypot(b[0]-a[0],b[2]-a[2]);
export const walkingSpeed=(customer:Pick<Customer,'id'>)=>1.18+(customer.id%3)*.09;
export function customerRoute(c:Pick<Customer,'id'|'productId'>,phase:CustomerPhase):Point[] {
  const p=productById[c.productId],side=Math.sign(p.position[0])*2.85,aisleZ=Math.max(p.position[2],-1.8);
  const door:Point=[(c.id%3-1)*.17,0,5.15],shelf:Point=[side,0,p.position[2]],checkout:Point=[1.1+(c.id%2)*.72,0,-1.85];
  if(phase==='entering')return [[door[0],0,10.6],door,[door[0],0,aisleZ],[side,0,aisleZ],shelf];
  if(phase==='to-checkout')return [shelf,[side,0,-1.8],checkout];
  if(phase==='leaving')return [checkout,door,[door[0],0,10.6]];
  return [phase==='browsing'?shelf:checkout];
}
export function phaseDuration(c:Pick<Customer,'id'|'productId'>,phase:CustomerPhase):number {
  if(phase==='browsing')return 4.6;
  const route=customerRoute(c,phase);
  return route.slice(1).reduce((sum,p,i)=>sum+distance(route[i],p),0)/walkingSpeed(c);
}
export function customerPosition(c:Customer):Point {
  const route=customerRoute(c,c.phase);let remaining=Math.max(0,c.elapsed)*walkingSpeed(c);
  for(let i=1;i<route.length;i++){const a=route[i-1],b=route[i],length=distance(a,b);if(length<.0001)continue;
    if(remaining<=length){const t=remaining/length;return [a[0]+(b[0]-a[0])*t,0,a[2]+(b[2]-a[2])*t];}remaining-=length;}
  return route.at(-1)!;
}
export function customerHeading(c:Customer):number {
  if(c.phase==='browsing')return Math.sign(productById[c.productId].position[0])*Math.PI/2;
  if(c.phase==='checkout')return Math.PI;
  const a=customerPosition(c),b=customerPosition({...c,elapsed:c.elapsed+.1});
  if(Math.hypot(b[0]-a[0],b[2]-a[2])<.001)return c.phase==='leaving'?0:Math.PI;
  return Math.atan2(b[0]-a[0],b[2]-a[2]);
}
