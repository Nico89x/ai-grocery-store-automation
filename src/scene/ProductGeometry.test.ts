import { expect,it } from 'vitest';
import { createBagGeometry } from './ProductGeometry';

it('renders bag edges with finite vertices, normals and picking bounds',()=>{
  const geometry=createBagGeometry();
  expect(Array.from(geometry.attributes.position.array).every(Number.isFinite)).toBe(true);
  expect(Array.from(geometry.attributes.normal.array).every(Number.isFinite)).toBe(true);
  geometry.computeBoundingSphere();
  expect(Number.isFinite(geometry.boundingSphere?.radius)).toBe(true);
  expect(geometry.boundingSphere!.radius).toBeGreaterThan(.3);
  geometry.dispose();
});
