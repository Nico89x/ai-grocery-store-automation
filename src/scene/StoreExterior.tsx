import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Customer } from "../domain/simulation";
import { customerPosition } from "../domain/customerJourney";
import { useSurface, surfaceForColor } from "./Materials";

type Point = [number, number, number];
function Block({
  at,
  size,
  color = "#d7d2c4",
  map,
  metal = 0,
  shadow = true,
}: {
  at: Point;
  size: Point;
  color?: string;
  map?: THREE.Texture;
  metal?: number;
  shadow?: boolean;
}) {
  const surface = surfaceForColor(color),
    maps = useSurface(surface ?? "plaster");
  return (
    <mesh position={at} castShadow={shadow} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        {...(surface ? maps : {})}
        map={map ?? (surface ? maps?.map : undefined)}
        bumpScale={surface === "wood" ? 0.018 : 0.008}
        roughness={metal ? 0.3 : 0.79}
        metalness={metal}
      />
    </mesh>
  );
}
function Plaque({
  text,
  sub = "",
  at,
  width,
  height,
  color = "#173e35",
}: {
  text: string;
  sub?: string;
  at: Point;
  width: number;
  height: number;
  color?: string;
}) {
  const map = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1024, 256);
    ctx.textAlign = "center";
    ctx.fillStyle = "#f7f3df";
    ctx.font = "bold 106px Arial";
    ctx.fillText(text, 512, sub ? 138 : 163);
    if (sub) {
      ctx.fillStyle = "#c7d5b9";
      ctx.font = "29px Arial";
      ctx.fillText(sub, 512, 206);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }, [text, sub, color]);
  useEffect(() => () => map.dispose(), [map]);
  return (
    <mesh position={at}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial
        map={map}
        roughness={0.6}
        emissive="#c3d6a1"
        emissiveIntensity={0.13}
      />
    </mesh>
  );
}
function Tree({ at }: { at: Point }) {
  const foliage = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const mesh = foliage.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 1600; i++) {
      const a = i * 2.39996,
        r = Math.pow(((i * 71) % 1601) / 1601, 1 / 3) * 1.4,
        v = (((i * 137) % 1607) / 1607) * 2 - 1;
      dummy.position.set(
        Math.cos(a) * r * Math.sqrt(1 - v * v),
        3.25 + v * r * 0.68,
        Math.sin(a) * r * Math.sqrt(1 - v * v),
      );
      dummy.rotation.set(i * 0.17, a, i * 0.31);
      dummy.scale.set(0.085, 0.022, 0.16);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(
        i,
        new THREE.Color(["#587739", "#6b8946", "#436332", "#7b9753"][i % 4]),
      );
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, []);
  return (
    <group position={at}>
      <Block at={[0, 0.24, 0]} size={[1.6, 0.5, 1.6]} color="#b8b7a5" />
      <Block at={[0, 0.49, 0]} size={[1.44, 0.015, 1.44]} color="#5b6440" />
      <mesh position={[0, 1.75, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.16, 2.7, 10]} />
        <meshStandardMaterial color="#77664e" roughness={1} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.28, 2.65, 0]}
          rotation={[0, 0, side * -0.55]}
          castShadow
        >
          <cylinderGeometry args={[0.035, 0.08, 1.6, 7]} />
          <meshStandardMaterial color="#74604b" roughness={0.95} />
        </mesh>
      ))}
      <instancedMesh
        ref={foliage}
        args={[undefined, undefined, 1600]}
        castShadow
      >
        <sphereGeometry args={[1, 6, 4]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </instancedMesh>
    </group>
  );
}
function Glass({ at, size }: { at: Point; size: Point }) {
  return (
    <mesh position={at} raycast={() => null}>
      <boxGeometry args={size} />
      <meshPhysicalMaterial
        color="#bad8d6"
        roughness={0.055}
        metalness={0.3}
        clearcoat={1}
        transparent
        opacity={0.19}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
function Door({
  customers,
  onEnter,
}: {
  customers: Customer[];
  onEnter: () => void;
}) {
  const left = useRef<THREE.Group>(null),
    right = useRef<THREE.Group>(null),
    opening = useRef(0);
  const shouldOpen = customers.some((c) => {
    const [x, , z] = customerPosition(c);
    return Math.abs(x) < 1 && z > 4.5 && z < 7.6;
  });
  useFrame((_, dt) => {
    opening.current = THREE.MathUtils.damp(
      opening.current,
      shouldOpen ? 1 : 0,
      6,
      dt,
    );
    if (left.current) left.current.position.x = -0.57 - opening.current * 1.06;
    if (right.current) right.current.position.x = 0.57 + opening.current * 1.06;
  });
  return (
    <group
      position={[0, 0, 5.85]}
      onClick={(event) => {
        event.stopPropagation();
        onEnter();
      }}
    >
      <Block
        at={[0, 3.12, 0]}
        size={[2.55, 0.18, 0.22]}
        color="#263c34"
        metal={0.5}
      />
      {[-1, 1].map((side, i) => (
        <group
          key={side}
          ref={i === 0 ? left : right}
          position={[side * 0.57, 0, 0]}
        >
          <Glass at={[0, 1.49, 0]} size={[1.08, 2.88, 0.025]} />
          {[-0.55, 0.55].map((x) => (
            <Block
              key={x}
              at={[x, 1.49, 0.01]}
              size={[0.046, 2.98, 0.07]}
              color="#304138"
              metal={0.6}
            />
          ))}
          {[0.025, 2.97].map((y) => (
            <Block
              key={y}
              at={[0, y, 0.01]}
              size={[1.15, 0.052, 0.07]}
              color="#304138"
              metal={0.6}
            />
          ))}
          <Block
            at={[side * -0.43, 1.3, 0.09]}
            size={[0.026, 0.5, 0.035]}
            color="#c5d0c6"
            metal={0.9}
          />
          <Block
            at={[0, 1.14, 0.029]}
            size={[1.08, 0.045, 0.01]}
            color="#e0e9d7"
            shadow={false}
          />
          <mesh position={[0, 1.7, 0.08]}>
            <planeGeometry args={[0.35, 0.4]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 1.5, 0.1]}>
        <boxGeometry args={[2.3, 3, 0.08]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <Block
        at={[0, 0.015, 0.03]}
        size={[2.45, 0.025, 0.35]}
        color="#69786a"
        metal={0.3}
      />
    </group>
  );
}

/** Selbst modellierte Fassade und Umgebung. Die bestehenden Regale sind durch die Fenster sichtbar. */
export default function StoreExterior({
  outside,
  enclosed,
  customers,
  onEnter,
}: {
  outside: boolean;
  enclosed: boolean;
  customers: Customer[];
  onEnter: () => void;
}) {
  const asphalt = useSurface("asphalt"),
    sidewalk = useSurface("paving");
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.075, -5]}
        receiveShadow
      >
        <planeGeometry args={[65, 33]} />
        <meshStandardMaterial color="#b2b4a5" roughness={1} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.005, 25.2]}
        receiveShadow
      >
        <planeGeometry args={[65, 5.7]} />
        <meshStandardMaterial {...sidewalk} bumpScale={0.012} roughness={0.9} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.005, 8.65]}
        receiveShadow
      >
        <planeGeometry args={[55, 5.9]} />
        <meshStandardMaterial {...sidewalk} bumpScale={0.014} roughness={0.9} />
      </mesh>
      <Block at={[0, -0.15, 11.58]} size={[55, 0.3, 0.22]} color="#b5b8a7" />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.186, 17]}
        receiveShadow
      >
        <planeGeometry args={[65, 10.5]} />
        <meshStandardMaterial {...asphalt} roughness={0.95} bumpScale={0.012} />
      </mesh>
      {[-18, -12, -6, 0, 6, 12, 18].map((x) => (
        <Block
          key={x}
          at={[x, -0.184, 18.4]}
          size={[2.8, 0.006, 0.12]}
          color="#e3e2cf"
          shadow={false}
        />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <Block
          key={`cross-${i}`}
          at={[-4.5, -0.18, 12.45 + i * 0.65]}
          size={[2.5, 0.006, 0.34]}
          color="#d8d7c9"
          shadow={false}
        />
      ))}
      {Array.from({ length: 27 }, (_, i) => (
        <Block
          key={`curb-${i}`}
          at={[-26 + i * 2, -0.028, 11.58]}
          size={[0.014, 0.035, 0.235]}
          color="#7e8178"
          shadow={false}
        />
      ))}
      <Tree at={[-7.5, 0, 7.45]} />
      <Tree at={[7.5, 0, 7.45]} />
      <group position={[6.1, 0, 9.35]}>
        {[0.45, 0.62, 0.79].map((z) => (
          <Block
            key={z}
            at={[0, 0.48, z]}
            size={[1.6, 0.07, 0.12]}
            color="#967c57"
          />
        ))}
        {[0.8, 1.0].map((y) => (
          <Block
            key={y}
            at={[0, y, 0.9]}
            size={[1.6, 0.12, 0.06]}
            color="#ad9267"
          />
        ))}
        {[-0.62, 0.62].map((x) => (
          <Block
            key={x}
            at={[x, 0.28, 0.64]}
            size={[0.07, 0.5, 0.55]}
            color="#35463a"
            metal={0.5}
          />
        ))}
      </group>
      <group position={[-6, 0, 10.4]}>
        <Block
          at={[0, 2.15, 0]}
          size={[0.085, 4.3, 0.085]}
          color="#344539"
          metal={0.5}
        />
        <Block at={[0.34, 4.25, 0]} size={[0.74, 0.09, 0.25]} color="#344539" />
        <mesh position={[0.34, 4.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.61, 0.18]} />
          <meshBasicMaterial color="#fff3d1" />
        </mesh>
      </group>
      {[-3.25, 3.25].map((x) => (
        <group key={x}>
          <Block
            at={[x, 0.43, 10.85]}
            size={[0.1, 0.86, 0.1]}
            color="#3d5041"
            metal={0.6}
          />
          <Block
            at={[x, 0.66, 10.85]}
            size={[0.115, 0.09, 0.115]}
            color="#dbdfce"
          />
        </group>
      ))}
      <group visible={enclosed}>
        {/* Außen und auf Augenhöhe geschlossen; die beiden Überblickskameras zeigen den offenen Grundriss. */}
        <Block at={[0, 4.27, 0]} size={[10.75, 0.22, 11.8]} color="#686f60" />
        <Block at={[0, 4.44, 0]} size={[10.65, 0.16, 11.65]} color="#d3d3c1" />
        {[-5.23, 5.23].map((x) => (
          <Block
            key={x}
            at={[x, 4.38, 0]}
            size={[0.09, 0.35, 11.7]}
            color="#415648"
            metal={0.45}
          />
        ))}
        <Block at={[5.2, 2.05, 0]} size={[0.12, 4.1, 11.55]} color="#c6c0aa" />
        {[0.65, 1.35, 2.05, 2.75, 3.45].map((y) => (
          <Block
            key={y}
            at={[5.27, y, 0]}
            size={[0.01, 0.016, 11.5]}
            color="#aba58e"
            shadow={false}
          />
        ))}
        <group position={[5.34, 0, -4.9]}>
          <mesh position={[0, 2.04, 0]} castShadow>
            <cylinderGeometry args={[0.055, 0.055, 4.08, 12]} />
            <meshStandardMaterial
              color="#778175"
              metalness={0.65}
              roughness={0.3}
            />
          </mesh>
          {[0.4, 2.1, 3.8].map((y) => (
            <Block
              key={y}
              at={[0, y, 0]}
              size={[0.13, 0.045, 0.13]}
              color="#4a584c"
              metal={0.6}
            />
          ))}
        </group>
        <Block at={[-5.22, 3.96, 0]} size={[0.1, 0.5, 11.55]} color="#d6d0bb" />
        <Block
          at={[0, 3.76, 5.72]}
          size={[10.55, 0.83, 0.22]}
          color="#1e4236"
        />
        <Plaque
          text="AI GROCERY"
          sub="FRISCHE LEBENSMITTEL · SNACKS · SMARTER SERVICE"
          at={[0, 3.77, 5.847]}
          width={5.8}
          height={0.72}
        />
        <Block at={[0, 3.25, 6.12]} size={[10.5, 0.1, 1.05]} color="#45634b" />
        <Block at={[0, 3.19, 6.63]} size={[10.5, 0.1, 0.07]} color="#233e30" />
        <mesh position={[0, 3.18, 6.34]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[9.9, 0.024]} />
          <meshBasicMaterial color="#ffedbd" side={THREE.DoubleSide} />
        </mesh>
        {[-5.03, -1.29, 1.29, 5.03].map((x) => (
          <group key={x}>
            <Block
              at={[x, 1.65, 5.73]}
              size={[0.24, 3.3, 0.3]}
              color="#987b55"
            />
            {[-0.07, 0, 0.07].map((dx) => (
              <Block
                key={dx}
                at={[x + dx, 1.65, 5.9]}
                size={[0.023, 3.3, 0.035]}
                color="#bd9d6b"
              />
            ))}
          </group>
        ))}
        {[-3.17, 3.17].map((x) => (
          <group key={x}>
            <Block
              at={[x, 0.23, 5.73]}
              size={[3.53, 0.45, 0.28]}
              color="#c4bcaa"
            />
            <Glass at={[x, 1.81, 5.81]} size={[3.5, 2.66, 0.018]} />
            {[0.45, 3.14].map((y) => (
              <Block
                key={y}
                at={[x, y, 5.84]}
                size={[3.53, 0.055, 0.08]}
                color="#2b4336"
                metal={0.55}
              />
            ))}
            <Block
              at={[x, 1.81, 5.85]}
              size={[0.045, 2.7, 0.055]}
              color="#2b4336"
              metal={0.55}
            />
            <Block
              at={[x, 1.03, 5.86]}
              size={[3.5, 0.035, 0.012]}
              color="#e8ece0"
              shadow={false}
            />
          </group>
        ))}
        <Door customers={customers} onEnter={outside ? onEnter : () => {}} />
        <Plaque
          text="FRISCH. JEDEN TAG."
          sub="OBST · BROT · GETRÄNKE"
          at={[-3.2, 2.65, 5.9]}
          width={2.3}
          height={0.46}
          color="#506f4e"
        />
        <Plaque
          text="WILLKOMMEN"
          sub="DEIN SMARTER NACHBARSCHAFTSLADEN"
          at={[3.2, 2.65, 5.9]}
          width={2.3}
          height={0.46}
          color="#506f4e"
        />
        <group position={[-3.1, 0, 7.35]} rotation={[0, 0.15, 0]}>
          <Block at={[0, 0.8, 0]} size={[0.82, 1.16, 0.06]} color="#263e31" />
          {[-0.43, 0.43].map((x) => (
            <Block
              key={x}
              at={[x, 0.68, 0.08]}
              size={[0.055, 1.35, 0.08]}
              color="#9f845b"
            />
          ))}
          <Plaque
            text="OFFEN"
            sub="WILLKOMMEN BEI NOA"
            at={[0, 0.96, 0.04]}
            width={0.74}
            height={0.36}
          />
          <Plaque
            text="FRISCH & SMART"
            sub="PORTFOLIO-DEMO"
            at={[0, 0.58, 0.04]}
            width={0.74}
            height={0.3}
          />
        </group>
      </group>
    </group>
  );
}
