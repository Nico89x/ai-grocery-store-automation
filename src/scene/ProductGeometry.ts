import { PlaneGeometry } from 'three';

export function createBagGeometry() {
  const geometry=new PlaneGeometry(.43,.65,20,26),positions=geometry.attributes.position;
  for(let i=0;i<positions.count;i++) {
    const x=positions.getX(i),y=positions.getY(i);
    // Float32 boundary coordinates can lie a few ulps outside [0, 1].
    // Clamp before taking a fractional power to avoid NaN mesh positions.
    const u=Math.max(0,Math.min(1,x/.43+.5)),v=Math.max(0,Math.min(1,y/.65+.5));
    const bulge=Math.pow(Math.max(0,Math.sin(Math.PI*u)*Math.sin(Math.PI*v)),.55)*.105;
    positions.setXYZ(i,x*(.88+.12*Math.sin(Math.PI*v)),y,bulge+.012*Math.sin(u*48+v*10)*Math.pow(Math.abs(v-.5)*2,3));
  }
  geometry.computeVertexNormals();return geometry;
}
