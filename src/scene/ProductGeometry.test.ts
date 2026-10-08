import { expect,it } from 'vitest';
import { createBagGeometry,createAppleGeometry } from './ProductGeometry';

it('renders bag edges with finite vertices, normals and picking bounds',()=>{
  const geometry=createBagGeometry();
  expect(Array.from(geometry.attributes.position.array).every(Number.isFinite)).toBe(true);
  expect(Array.from(geometry.attributes.normal.array).every(Number.isFinite)).toBe(true);
  geometry.computeBoundingSphere();
  expect(Number.isFinite(geometry.boundingSphere?.radius)).toBe(true);
  expect(geometry.boundingSphere!.radius).toBeGreaterThan(.3);
  geometry.dispose();
});
it('keeps natural apple lobes and stem indentation finite and pickable',()=>{
  const geometry=createAppleGeometry();
  expect(Array.from(geometry.attributes.position.array).every(Number.isFinite)).toBe(true);
  expect(Array.from(geometry.attributes.normal.array).every(Number.isFinite)).toBe(true);
  geometry.computeBoundingSphere();expect(geometry.boundingSphere!.radius).toBeGreaterThan(.16);
  expect(geometry.boundingSphere!.radius).toBeLessThan(.2);geometry.dispose();
});
