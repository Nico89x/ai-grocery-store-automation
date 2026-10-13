import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useSurface } from "./Materials";

export type Point = [number, number, number];
export function Solid({
  at = [0, 0, 0],
  size,
  color,
  metal = 0,
  rotation = [0, 0, 0],
}: {
  at?: Point;
  size: Point;
  color: string;
  metal?: number;
  rotation?: Point;
}) {
  return (
    <mesh position={at} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        metalness={metal}
        roughness={metal ? 0.32 : 0.77}
      />
    </mesh>
  );
}
export function Rod({
  a,
  b,
  radius = 0.025,
  color = "#454c45",
  metal = 0.35,
}: {
  a: Point;
  b: Point;
  radius?: number;
  color?: string;
  metal?: number;
}) {
  const { mid, q, length } = useMemo(() => {
    const start = new THREE.Vector3(...a),
      end = new THREE.Vector3(...b),
      delta = end.clone().sub(start);
    return {
      mid: start.add(end).multiplyScalar(0.5),
      q: new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        delta.clone().normalize(),
      ),
      length: delta.length(),
    };
  }, [a[0], a[1], a[2], b[0], b[1], b[2]]);
  return (
    <mesh position={mid} quaternion={q} castShadow>
      <cylinderGeometry args={[radius, radius, length, 10]} />
      <meshStandardMaterial color={color} metalness={metal} roughness={0.42} />
    </mesh>
  );
}
export function Lettering({
  text,
  sub = "",
  at,
  width = 2,
  height = 0.5,
  color = "#343b35",
  background = "#eee4cb",
}: {
  text: string;
  sub?: string;
  at: Point;
  width?: number;
  height?: number;
  color?: string;
  background?: string;
}) {
  const map = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 256;
    const c = canvas.getContext("2d")!;
    c.fillStyle = background;
    c.fillRect(0, 0, 1024, 256);
    c.textAlign = "center";
    c.fillStyle = color;
    c.font = "600 90px Arial";
    c.fillText(text, 512, sub ? 127 : 160);
    if (sub) {
      c.font = "28px Arial";
      c.fillText(sub, 512, 201);
    }
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [text, sub, color, background]);
  useEffect(() => () => map.dispose(), [map]);
  return (
    <mesh position={at}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial map={map} roughness={0.82} />
    </mesh>
  );
}
export function LeafPlant({ at, scale = 1 }: { at: Point; scale?: number }) {
  const wood = useSurface("wood");
  return (
    <group position={at} scale={scale}>
      <mesh position={[0, 0.14, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.14, 0.28, 20]} />
        <meshStandardMaterial
          color="#a88d6d"
          roughness={0.9}
          {...wood}
          bumpScale={0.005}
        />
      </mesh>
      <mesh position={[0, 0.278, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.165, 20]} />
        <meshStandardMaterial color="#494033" roughness={1} />
      </mesh>
      {Array.from({ length: 11 }, (_, i) => {
        const angle = i * 2.4,
          r = 0.16 + (i % 3) * 0.035;
        return (
          <group key={i}>
            <Rod
              a={[0, 0.28, 0]}
              b={[
                Math.sin(angle) * r,
                0.53 + (i % 4) * 0.09,
                Math.cos(angle) * r,
              ]}
              radius={0.007}
              color="#53764a"
              metal={0}
            />
            <mesh
              position={[
                Math.sin(angle) * r,
                0.56 + (i % 4) * 0.09,
                Math.cos(angle) * r,
              ]}
              rotation={[0.5, angle, -0.4]}
              scale={[0.075, 0.19, 0.022]}
              castShadow
            >
              <sphereGeometry args={[1, 10, 8]} />
              <meshStandardMaterial
                color={["#41613b", "#678348", "#4b713c"][i % 3]}
                roughness={0.91}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
