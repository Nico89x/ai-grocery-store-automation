import { PlaneGeometry, SphereGeometry } from 'three';

export function createAppleGeometry() {
  const geometry=new SphereGeometry(.175,28,22),positions=geometry.attributes.position;
  for(let i=0;i<positions.count;i++) {
    const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i);
    const angle=Math.atan2(z,x),height=y/.175;
    const lobe=1+.035*Math.cos(angle*5)*(1-height*height);
    const dimple=Math.max(0,(height-.65)/.35);
    positions.setXYZ(i,x*lobe*(1+.06*height),y-.018*dimple*dimple,z*lobe*(1+.06*height));
  }
  geometry.computeVertexNormals();return geometry;
}

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
