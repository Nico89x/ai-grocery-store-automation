import { PlaneGeometry, SphereGeometry } from "three";

export function createAppleGeometry() {
  const geometry = new SphereGeometry(0.175, 28, 22),
    positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i),
      y = positions.getY(i),
      z = positions.getZ(i);
    const angle = Math.atan2(z, x),
      height = y / 0.175;
    const lobe = 1 + 0.035 * Math.cos(angle * 5) * (1 - height * height);
    const dimple = Math.max(0, (height - 0.65) / 0.35);
    positions.setXYZ(
      i,
      x * lobe * (1 + 0.06 * height),
      y - 0.018 * dimple * dimple,
      z * lobe * (1 + 0.06 * height),
    );
  }
  geometry.computeVertexNormals();
  return geometry;
}

export function createBagGeometry() {
  const geometry = new PlaneGeometry(0.43, 0.65, 20, 26),
    positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i),
      y = positions.getY(i);
    // Float32 boundary coordinates can lie a few ulps outside [0, 1].
    // Clamp before taking a fractional power to avoid NaN mesh positions.
    const u = Math.max(0, Math.min(1, x / 0.43 + 0.5)),
      v = Math.max(0, Math.min(1, y / 0.65 + 0.5));
    const bulge =
      Math.pow(
        Math.max(0, Math.sin(Math.PI * u) * Math.sin(Math.PI * v)),
        0.55,
      ) * 0.105;
    positions.setXYZ(
      i,
      x * (0.88 + 0.12 * Math.sin(Math.PI * v)),
      y,
      bulge +
        0.012 * Math.sin(u * 48 + v * 10) * Math.pow(Math.abs(v - 0.5) * 2, 3),
    );
  }
  geometry.computeVertexNormals();
  return geometry;
}
