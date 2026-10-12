import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  Component,
  type ReactNode,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  RoundedBox,
  Environment,
  Lightformer,
  useProgress,
} from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { products, productById, type Product } from "../domain/products";
import type { SimulationState } from "../domain/simulation";
import { Icon } from "../components/Icon";
import StoreExterior from "./StoreExterior";
import Shopper from "./HumanShopper";
import { customerPosition } from "../domain/customerJourney";
import Package, { ProductArtworkLibrary } from "./GroceryProduct";
import Neighborhood from "./Neighborhood";
import InteriorDetails from "./InteriorDetails";
import { MaterialLibrary, useSurface, surfaceForColor } from "./Materials";

type V3 = [number, number, number];
function Box({
  position = [0, 0, 0],
  size = [1, 1, 1],
  color = "#ffffff",
  roughness = 0.7,
  metalness = 0,
  shadow = true,
}: {
  position?: V3;
  size?: V3;
  color?: string;
  roughness?: number;
  metalness?: number;
  shadow?: boolean;
}) {
  const surface = surfaceForColor(color),
    maps = useSurface(surface ?? "plaster");
  return (
    <mesh position={position} castShadow={shadow} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
        {...(surface ? maps : {})}
        bumpScale={surface === "wood" ? 0.018 : 0.007}
      />
    </mesh>
  );
}
function Cylinder({
  position = [0, 0, 0],
  args = [0.1, 0.1, 1, 16],
  color = "#fff",
  rotation = [0, 0, 0],
  metalness = 0,
}: {
  position?: V3;
  args?: [number, number, number, number];
  color?: string;
  rotation?: V3;
  metalness?: number;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      <cylinderGeometry args={args} />
      <meshStandardMaterial
        color={color}
        roughness={0.42}
        metalness={metalness}
      />
    </mesh>
  );
}

function Sign({
  text,
  sub = "",
  position,
  rotation = [0, 0, 0],
  width = 2,
  height = 0.55,
  color = "#244b3d",
}: {
  text: string;
  sub?: string;
  position: V3;
  rotation?: V3;
  width?: number;
  height?: number;
  color?: string;
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 768;
    canvas.height = 192;
    const c = canvas.getContext("2d")!;
    c.fillStyle = color;
    c.fillRect(0, 0, 768, 192);
    c.fillStyle = color === "#f4eee0" ? "#263b31" : "#f4f3e8";
    c.textAlign = "center";
    c.font = "bold 65px Arial";
    c.fillText(text, 384, sub ? 92 : 119);
    if (sub) {
      c.font = "26px Arial";
      c.fillText(sub, 384, 145);
    }
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [text, sub, color]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial
        map={texture}
        roughness={0.7}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
function ProductDisplay({
  p,
  count,
  onSelect,
}: {
  p: Product;
  count: number;
  onSelect: (p: Product) => void;
}) {
  const [hover, setHover] = useState(false);
  const right = p.position[0] > 0;
  const shelfRise = p.position[1] > 1 ? 0.98 : 0.77;
  return (
    <group
      position={p.position}
      rotation={[0, right ? -Math.PI / 2 : Math.PI / 2, 0]}
    >
      <group
        onClick={(e) => {
          e.stopPropagation();
          onSelect(p);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHover(false);
          document.body.style.cursor = "";
        }}
      >
        {Array.from({ length: Math.min(9, count) }, (_, i) => (
          <group
            key={i}
            position={[
              ((i % 3) - 1) * 0.46,
              i >= 6 ? shelfRise : 0,
              -Math.floor((i % 6) / 3) * 0.26,
            ]}
            rotation={[0, ((i % 3) - 1) * 0.035, 0]}
          >
            <Package p={p} />
          </group>
        ))}
        <mesh position={[0, 0, -0.17]} visible={hover}>
          <boxGeometry args={[1.0, 0.8, 0.8]} />
          <meshBasicMaterial
            color="#c5ed99"
            transparent
            opacity={0.14}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0, 0, 0]} visible={false}>
          <boxGeometry args={[1, 0.85, 1]} />
          <meshBasicMaterial />
        </mesh>
      </group>
      <Sign
        text={`${(p.price / 100).toFixed(2).replace(".", ",")} €`}
        position={[
          0,
          (p.position[1] > 1 ? 1.055 : 0.285) - p.position[1],
          0.31,
        ]}
        width={0.65}
        height={0.16}
        color="#f4eee0"
      />
    </group>
  );
}
function Plant({ position, scale = 1 }: { position: V3; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <Cylinder
        position={[0, 0.15, 0]}
        args={[0.2, 0.15, 0.3, 16]}
        color="#b59b75"
      />
      {Array.from({ length: 7 }, (_, i) => {
        const a = i * 2.4;
        return (
          <mesh
            key={i}
            position={[
              Math.sin(a) * 0.18,
              0.42 + (i % 3) * 0.08,
              Math.cos(a) * 0.15,
            ]}
            rotation={[0.5, a, 0.5]}
            scale={[0.11, 0.29, 0.06]}
          >
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial
              color={i % 2 ? "#4f7041" : "#668645"}
              roughness={0.85}
            />
          </mesh>
        );
      })}
    </group>
  );
}
function Shelves() {
  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 4.2, 0, 0]}>
          <Box
            position={[side * 0.38, 1.35, -0.75]}
            size={[0.16, 2.7, 7.5]}
            color="#444f49"
            metalness={0.45}
          />
          {[-4.4, -2.6, -0.7, 1.25, 3].map((z) => (
            <Box
              key={z}
              position={[0, 1.35, z]}
              size={[0.07, 2.7, 0.07]}
              color="#27362f"
              metalness={0.6}
            />
          ))}
          {[0.35, 1.12, 2.1, 2.9].map((y) => (
            <group key={y}>
              <Box
                position={[0, y, -0.7]}
                size={[1.05, 0.075, 7.4]}
                color={side === 1 ? "#b08b62" : "#dcc6a6"}
              />
              <Box
                position={[-side * 0.49, y - 0.05, -0.7]}
                size={[0.045, 0.12, 7.4]}
                color="#59645a"
                metalness={0.45}
              />
              <Box
                position={[0, y - 0.065, -0.7]}
                size={[0.82, 0.014, 7.2]}
                color="#fff2cc"
              />
              <mesh
                position={[0, y - 0.074, -0.7]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <planeGeometry args={[0.8, 7.1]} />
                <meshBasicMaterial color="#f6d69b" />
              </mesh>
            </group>
          ))}
          {[0.35, 1.12, 2.1].map((y) => (
            <group key={`rail-${y}`}>
              <Cylinder
                position={[-side * 0.49, y + 0.13, -0.7]}
                args={[0.012, 0.012, 7.4, 6]}
                rotation={[Math.PI / 2, 0, 0]}
                color="#56645b"
                metalness={0.8}
              />
              {[-4.2, -2.5, -0.7, 1.1, 2.9].map((z) => (
                <Box
                  key={z}
                  position={[-side * 0.49, y + 0.065, z]}
                  size={[0.018, 0.13, 0.018]}
                  color="#56645b"
                  metalness={0.8}
                />
              ))}
            </group>
          ))}
          {side === 1 &&
            [1.7, 0.1, -1.5].map((z) => (
              <group key={z} position={[0, 1.12, z]}>
                <Box
                  position={[0, 0.04, 0]}
                  size={[0.95, 0.09, 1.25]}
                  color="#9a734c"
                />
                <Box
                  position={[-0.46, 0.15, 0]}
                  size={[0.04, 0.28, 1.25]}
                  color="#b99164"
                />
                <Box
                  position={[0.46, 0.15, 0]}
                  size={[0.04, 0.28, 1.25]}
                  color="#b99164"
                />
              </group>
            ))}
        </group>
      ))}
      <Sign
        text="SNACKS & GETRÄNKE"
        position={[-3.6, 3.25, 0]}
        rotation={[0, Math.PI / 2, 0]}
        width={3.9}
      />
      <Sign
        text="FRISCH & GEBACKEN"
        position={[3.65, 3.25, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        width={3.9}
      />
      {/* Kühlung aus eigener Geometrie; keine geladenen Modelle oder Texturen. */}
      <group position={[-3.6, 0, -4.8]}>
        <Box
          position={[0, 1.4, 0]}
          size={[2.3, 2.8, 0.65]}
          color="#253731"
          metalness={0.4}
        />
        <Box
          position={[0, 1.4, 0.34]}
          size={[2.15, 2.58, 0.02]}
          color="#edf1e9"
        />
        {[-0.72, 0.02, 0.72].map((x) => (
          <group key={`cooling-${x}`}>
            <mesh position={[x, 1.4, 0.72]} raycast={() => null}>
              <boxGeometry args={[0.68, 2.5, 0.016]} />
              <meshPhysicalMaterial
                color="#d6e5e7"
                transparent
                opacity={0.16}
                metalness={0.18}
                roughness={0.05}
                clearcoat={1}
                depthWrite={false}
              />
            </mesh>
            <mesh position={[x - 0.3, 1.4, 0.44]}>
              <boxGeometry args={[0.012, 2.45, 0.018]} />
              <meshBasicMaterial color="#e5f4ff" />
            </mesh>
          </group>
        ))}
        {[-0.68, 0, 0.68].map((x) => (
          <group key={x}>
            <Box
              position={[x, 1.4, 0.46]}
              size={[0.035, 2.65, 0.03]}
              color="#394944"
            />
            {[0.55, 1.08, 1.61, 2.14].map((y) => (
              <group key={y}>
                <Box
                  position={[x, y - 0.22, 0.5]}
                  size={[0.65, 0.03, 0.36]}
                  color="#dfe8df"
                />
                {[-0.19, 0, 0.19].map((dx, i) => (
                  <Cylinder
                    key={dx}
                    position={[x + dx, y, 0.55]}
                    args={[0.057, 0.06, 0.34, 12]}
                    color={i % 2 ? "#e5a747" : "#74a6ad"}
                  />
                ))}
              </group>
            ))}
            <Cylinder
              position={[x + 0.25, 1.4, 0.66]}
              args={[0.02, 0.02, 0.48, 8]}
              color="#d3d7cf"
              metalness={0.8}
            />
          </group>
        ))}
        <Sign
          text="GUT GEKÜHLT"
          position={[0, 2.95, 0.38]}
          width={2.25}
          height={0.3}
        />
      </group>
    </group>
  );
}
function Robot() {
  const head = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (head.current)
      head.current.rotation.y = Math.sin(clock.elapsedTime * 0.7) * 0.12;
  });
  return (
    <group position={[1.4, 0, -4.1]} scale={1.12}>
      <Cylinder
        position={[0, 0.27, 0]}
        args={[0.28, 0.37, 0.35, 24]}
        color="#dce3db"
      />
      <Cylinder
        position={[0, 0.65, 0]}
        args={[0.19, 0.24, 0.6, 24]}
        color="#eceee4"
      />
      <RoundedBox
        position={[0, 1.15, 0]}
        args={[0.62, 0.63, 0.42]}
        radius={0.17}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial
          color="#ecf0e6"
          metalness={0.18}
          roughness={0.27}
        />
      </RoundedBox>
      <Box
        position={[0, 1.18, 0.225]}
        size={[0.16, 0.06, 0.012]}
        color="#57d8ce"
      />
      <Cylinder
        position={[0, 1.54, 0]}
        args={[0.1, 0.1, 0.18, 16]}
        color="#263a37"
        metalness={0.6}
      />
      <group ref={head} position={[0, 1.82, 0]}>
        <RoundedBox
          args={[0.7, 0.57, 0.54]}
          radius={0.2}
          smoothness={5}
          castShadow
        >
          <meshStandardMaterial
            color="#f4f3e8"
            metalness={0.22}
            roughness={0.23}
          />
        </RoundedBox>
        <RoundedBox
          position={[0, 0, 0.27]}
          args={[0.55, 0.34, 0.032]}
          radius={0.13}
          smoothness={4}
        >
          <meshStandardMaterial
            color="#10292c"
            metalness={0.3}
            roughness={0.18}
          />
        </RoundedBox>
        {[-0.13, 0.13].map((x) => (
          <mesh key={x} position={[x, 0.045, 0.296]} rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[0.047, 0.009, 6, 14, Math.PI]} />
            <meshBasicMaterial color="#7be6e1" />
          </mesh>
        ))}
        <mesh position={[0, -0.06, 0.296]}>
          <torusGeometry args={[0.058, 0.006, 6, 16, Math.PI]} />
          <meshBasicMaterial color="#7be6e1" />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh
            key={s}
            position={[s * 0.355, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.12, 0.12, 0.04, 24]} />
            <meshStandardMaterial color="#284f4c" metalness={0.6} />
          </mesh>
        ))}
      </group>
      {[-1, 1].map((s) => (
        <group
          key={s}
          position={[s * 0.38, 1.28, 0]}
          rotation={[0, 0, s * 0.35]}
        >
          <mesh>
            <sphereGeometry args={[0.11, 14, 10]} />
            <meshStandardMaterial color="#2b3d39" />
          </mesh>
          <Cylinder
            position={[0, -0.2, 0.07]}
            args={[0.1, 0.085, 0.36, 16]}
            color="#e7ebe1"
            rotation={[0.4, 0, 0]}
          />
          <mesh position={[0, -0.41, 0.19]}>
            <sphereGeometry args={[0.105, 12, 8]} />
            <meshStandardMaterial color="#344640" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
function Checkout() {
  return (
    <group>
      <group position={[1.4, 0, -3.3]}>
        <Box
          position={[0, 0.58, 0]}
          size={[3.5, 1.16, 1.08]}
          color="#b18d63"
          shadow
        />
        {Array.from({ length: 25 }, (_, i) => (
          <Box
            key={i}
            position={[-1.68 + i * 0.14, 0.62, 0.55]}
            size={[0.055, 1.04, 0.055]}
            color={i % 2 ? "#9b7954" : "#ba956c"}
          />
        ))}
        <Box
          position={[0, 0.1, 0.57]}
          size={[3.55, 0.2, 0.05]}
          color="#283b32"
        />
        <Box
          position={[0, 1.22, 0]}
          size={[3.65, 0.13, 1.2]}
          color="#343e37"
          roughness={0.28}
          shadow
        />
        <Box
          position={[0, 1.155, 0.62]}
          size={[3.55, 0.02, 0.012]}
          color="#f6d1a0"
        />
        <Cylinder
          position={[0.9, 1.45, -0.2]}
          args={[0.055, 0.08, 0.43, 12]}
          color="#293b36"
        />
        <RoundedBox
          position={[0.9, 1.72, -0.2]}
          rotation={[-0.18, 0, 0]}
          args={[0.65, 0.42, 0.06]}
          radius={0.035}
          smoothness={3}
        >
          <meshStandardMaterial color="#1f302b" />
        </RoundedBox>
        <Sign
          text="DEMO-KASSE"
          sub="KEINE ECHTE ZAHLUNG"
          position={[0.9, 1.72, -0.159]}
          width={0.6}
          height={0.36}
        />
        <Box
          position={[-0.8, 1.31, 0.13]}
          size={[0.38, 0.05, 0.32]}
          color="#213e34"
        />
        <Plant position={[-1.45, 1.29, -0.25]} scale={0.6} />
      </group>
      <Robot />
      <Sign
        text="AI GROCERY"
        sub="FRESH FOOD. SMART FLOW."
        position={[1.35, 3.22, -5.25]}
        width={4}
        height={0.83}
      />
    </group>
  );
}
function Room() {
  const floor = useSurface("stone");
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.015, 0]}
        receiveShadow
      >
        <planeGeometry args={[10.4, 11.8]} />
        <meshPhysicalMaterial
          {...floor}
          color="#e6dfd2"
          bumpScale={0.009}
          roughness={0.26}
          metalness={0.015}
          clearcoat={0.25}
          clearcoatRoughness={0.38}
        />
      </mesh>
      <Box position={[0, -0.15, 0]} size={[10.4, 0.25, 11.8]} color="#758075" />
      <Box position={[0, 2, -5.55]} size={[10.4, 4, 0.15]} color="#ded8c7" />
      <Box
        position={[5.1, 1.85, -0.2]}
        size={[0.12, 3.7, 10.6]}
        color="#e8e0ce"
      />
      <Box
        position={[-5.1, 0.6, -0.2]}
        size={[0.12, 1.2, 10.6]}
        color="#c7c4b1"
      />
      {[-4.5, -2, 0.5, 3].map((z) => (
        <group key={z}>
          <Box
            position={[-5.08, 2.35, z]}
            size={[0.06, 2.5, 0.075]}
            color="#36473f"
          />
          <mesh position={[-5.15, 2.35, z + 1.15]} raycast={() => null}>
            <boxGeometry args={[0.015, 2.45, 2.15]} />
            <meshPhysicalMaterial
              color="#dce8e4"
              transparent
              opacity={0.19}
              roughness={0.08}
              metalness={0.2}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
      <Box
        position={[-5.08, 3.65, -0.2]}
        size={[0.06, 0.08, 10.6]}
        color="#36473f"
      />
      <Box
        position={[0, 0.1, -5.43]}
        size={[10.15, 0.2, 0.06]}
        color="#36473f"
      />
      <Sign
        text="FRISCHE IST UNSER HANDWERK"
        sub="NEUTRALE PRODUKTE · LOKALE DEMO"
        position={[1.2, 2.4, -5.45]}
        width={2.5}
        height={0.46}
        color="#6b7050"
      />
      {[
        [-1.7, -4.8],
        [-0.8, -4.8],
        [0.1, -4.8],
      ].map(([x, z], i) => (
        <Plant key={i} position={[x, 3.38, z]} scale={0.9 + i * 0.16} />
      ))}
      <Box
        position={[-0.8, 3.36, -4.98]}
        size={[3, 0.09, 0.65]}
        color="#b08b62"
      />
      {[-3, 0, 3].map((x) => (
        <group key={x}>
          <Box
            position={[x, 3.8, -0.7]}
            size={[0.035, 0.035, 9.1]}
            color="#303d34"
          />
          {[-3.9, -0.8, 2.4].map((z) => (
            <group key={z}>
              <Cylinder
                position={[x, 3.6, z]}
                args={[0.09, 0.13, 0.25, 12]}
                color="#293b33"
              />
              <mesh position={[x, 3.455, z]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.1, 12]} />
                <meshBasicMaterial color="#fff1c8" />
              </mesh>
            </group>
          ))}
        </group>
      ))}
      <Plant position={[4.2, 2.95, -3.7]} scale={1.3} />
      <Plant position={[4.2, 2.95, 2.2]} />
      <Plant position={[-4.1, 2.95, 2.2]} />
      <Plant position={[-1, 0, -5.1]} scale={1.4} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.007, 4.9]}>
        <planeGeometry args={[2.6, 0.8]} />
        <meshStandardMaterial color="#526b54" roughness={1} />
      </mesh>
      <Sign
        text="WILLKOMMEN"
        position={[0, 0.013, 4.9]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={2.4}
        height={0.5}
      />
    </group>
  );
}
function CameraController({
  view,
  walk,
  onMoving,
}: {
  view: number;
  walk: string | null;
  onMoving: (value: boolean) => void;
}) {
  const controls = useRef<OrbitControlsImpl>(null),
    keys = useRef(new Set<string>());
  const { camera, invalidate, size } = useThree();
  const firstView = useRef(true),
    transition = useRef<{
      from: THREE.Vector3;
      to: THREE.Vector3;
      fromTarget: THREE.Vector3;
      toTarget: THREE.Vector3;
      startedAt: number;
    } | null>(null);
  const outside = view % 6 >= 3;
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement).closest("input,textarea,select,dialog,button")
      )
        return;
      if (
        [
          "w",
          "a",
          "s",
          "d",
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
        ].includes(e.key)
      ) {
        keys.current.add(e.key);
        invalidate();
        e.preventDefault();
      }
    };
    const onUp = (e: KeyboardEvent) => keys.current.delete(e.key),
      clear = () => keys.current.clear();
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", clear);
    };
  }, [invalidate]);
  useEffect(() => {
    invalidate();
  }, [walk, invalidate]);
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const poses: V3[] = [
      [0.5, 3.4, 8.8],
      [9, 8, 12],
      [0.2, 1.75, 5.35],
      [8, 5.6, 17.5],
      [0, 7.8, 28],
      [-2.05, 1.48, 9.5],
    ];
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov =
        (view % 6 === 2 ? 62 : view % 6 === 4 ? 58 : view % 6 === 5 ? 44 : 49) +
        (size.width / size.height < 1.1 ? 24 : 0);
      camera.updateProjectionMatrix();
    }
    // Restliche Orbit-Trägheit vor einem festen Ansichtswechsel vollständig auflösen.
    c.enableDamping = false;
    c.update();
    const to = new THREE.Vector3(...poses[view % 6]),
      toTarget =
        view % 6 === 5
          ? new THREE.Vector3(-2.05, 0.96, 7.5)
          : outside
            ? new THREE.Vector3(0, 2.0, 3.8)
            : new THREE.Vector3(0, view % 6 === 2 ? 1.35 : 1, -1.1);
    if (
      firstView.current ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      camera.position.copy(to);
      c.target.copy(toTarget);
      c.update();
      c.enableDamping = true;
      firstView.current = false;
      transition.current = null;
      c.enabled = true;
      onMoving(false);
    } else {
      transition.current = {
        from: camera.position.clone(),
        to,
        fromTarget: c.target.clone(),
        toTarget,
        startedAt: performance.now(),
      };
      c.enabled = false;
      onMoving(true);
    }
    invalidate();
  }, [camera, view, onMoving, invalidate, size.width, size.height]);
  useFrame((_, dt) => {
    const c = controls.current;
    if (!c) return;
    const trip = transition.current;
    if (trip) {
      invalidate();
      const t = THREE.MathUtils.smoothstep(
        (performance.now() - trip.startedAt) / 850,
        0,
        1,
      );
      camera.position.lerpVectors(trip.from, trip.to, t);
      c.target.lerpVectors(trip.fromTarget, trip.toTarget, t);
      c.update();
      if (t === 1) {
        transition.current = null;
        c.enabled = true;
        c.enableDamping = true;
        onMoving(false);
      }
      return;
    }
    const forward =
      (keys.current.has("w") ||
      keys.current.has("ArrowUp") ||
      walk === "forward"
        ? 1
        : 0) -
      (keys.current.has("s") || keys.current.has("ArrowDown") || walk === "back"
        ? 1
        : 0);
    const sideways =
      (keys.current.has("d") ||
      keys.current.has("ArrowRight") ||
      walk === "right"
        ? 1
        : 0) -
      (keys.current.has("a") || keys.current.has("ArrowLeft") || walk === "left"
        ? 1
        : 0);
    if (!forward && !sideways) return;
    invalidate();
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    dir.y = 0;
    dir.normalize();
    const side = new THREE.Vector3().crossVectors(
      dir,
      new THREE.Vector3(0, 1, 0),
    );
    const movement = dir
      .multiplyScalar(forward)
      .add(side.multiplyScalar(sideways))
      .multiplyScalar(Math.min(dt, 0.04) * 3);
    const next = camera.position.clone().add(movement);
    if (
      Math.abs(next.x) < (outside ? 22 : 10) &&
      next.z > (outside ? -16 : -6) &&
      next.z < (outside ? 25 : 16)
    ) {
      camera.position.add(movement);
      c.target.add(movement);
      c.update();
    }
  });
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={1.2}
      maxDistance={outside ? 38 : 22}
      minPolarAngle={0.18}
      maxPolarAngle={Math.PI / 2 - 0.035}
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      }}
      touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
    />
  );
}
class SceneBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? this.props.fallback : this.props.children;
  }
}
type OverlayRefs = React.MutableRefObject<
  Record<string, HTMLDivElement | null>
>;
function OverlayProjector({
  state,
  refs,
  outside,
}: {
  state: SimulationState;
  refs: OverlayRefs;
  outside: boolean;
}) {
  const { camera, size } = useThree();
  useFrame(() => {
    const entries: [string, V3][] = [
      ["robot", [1.4, 2.65, -4.1]],
      ...products.map(
        (p) =>
          [
            p.id,
            [p.position[0] * 0.82, p.position[1] - 0.46, p.position[2]],
          ] as [string, V3],
      ),
      ...state.customers.map((c) => {
        const v = customerPosition(c);
        return [`customer-${c.id}`, [v[0], 2.12, v[2]]] as [string, V3];
      }),
    ];
    for (const [id, position] of entries) {
      const element = refs.current[id];
      if (!element) continue;
      const point = new THREE.Vector3(...position),
        distance = camera.position.distanceTo(point);
      point.project(camera);
      const visible =
        (!outside || (id.startsWith("customer-") && position[2] > 5.45)) &&
        point.z < 1 &&
        point.z > -1 &&
        Math.abs(point.x) < 1.1 &&
        Math.abs(point.y) < 1.1;
      element.style.display = visible ? "block" : "none";
      element.style.transform = `translate(${((point.x + 1) * size.width) / 2}px,${((1 - point.y) * size.height) / 2}px) translate(-50%,-50%) scale(${Math.min(1.15, 8.3 / distance)})`;
    }
  });
  return null;
}
function Content({
  state,
  onSelect,
  view,
  walk,
  overlayRefs,
  onEnter,
  moving,
  onMoving,
  streetRunning,
  portraitId,
}: {
  state: SimulationState;
  onSelect: (p: Product) => void;
  view: number;
  walk: string | null;
  overlayRefs: OverlayRefs;
  onEnter: () => void;
  moving: boolean;
  onMoving: (value: boolean) => void;
  streetRunning: boolean;
  portraitId: number;
}) {
  const outside = view % 6 >= 3;
  return (
    <>
      <color attach="background" args={["#c7d5da"]} />
      <fog attach="fog" args={["#c7d5da", outside ? 45 : 25, 75]} />
      <ambientLight intensity={0.16} />
      <hemisphereLight args={["#c9e0ef", "#7d6953", 0.46]} />
      <Environment resolution={128} frames={1} environmentIntensity={0.65}>
        <Lightformer
          position={[0, 9, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[16, 12, 1]}
          intensity={1.7}
          color="#fff3df"
        />
        <Lightformer
          position={[-10, 4, 1]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[10, 7, 1]}
          intensity={2.5}
          color="#d7e8f6"
        />
        <Lightformer
          position={[5, 3, -5]}
          rotation={[0, -Math.PI / 3, 0]}
          scale={[7, 4, 1]}
          intensity={1.5}
          color="#ffdfa7"
        />
      </Environment>
      <directionalLight
        position={[-10, 15, 10]}
        intensity={3.0}
        color="#ffe4bc"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
        shadow-camera-far={65}
        shadow-normalBias={0.035}
        shadow-bias={-0.00012}
        shadow-radius={2}
      />
      <pointLight
        position={[0, 3.3, -2]}
        intensity={16}
        color="#ffe6bb"
        distance={10}
        decay={2}
      />
      <pointLight
        position={[3, 2.8, 2]}
        intensity={8}
        color="#fff4de"
        distance={8}
      />
      <Room />
      <Shelves />
      <Checkout />
      <InteriorDetails />
      <StoreExterior
        outside={outside}
        enclosed={outside || view % 6 === 2}
        customers={state.customers}
        onEnter={onEnter}
      />
      <Neighborhood
        running={streetRunning}
        active={(outside && view % 6 !== 5) || view % 6 === 2}
        portrait={view % 6 === 5}
        portraitId={portraitId}
      />
      {products.map((p) => (
        <ProductDisplay
          key={`${state.session}-${p.id}`}
          p={p}
          count={state.inventory[p.id]}
          onSelect={outside || moving ? () => {} : onSelect}
        />
      ))}
      {state.customers.map((c) => (
        <Shopper
          key={`${state.session}-${c.id}`}
          customer={c}
          running={state.running}
          speed={state.speed}
        />
      ))}
      <CameraController view={view} walk={walk} onMoving={onMoving} />
      <OverlayProjector state={state} refs={overlayRefs} outside={outside} />
    </>
  );
}
export default function StoreScene({
  state,
  onSelect,
}: {
  state: SimulationState;
  onSelect: (p: Product) => void;
}) {
  const [view, setView] = useState(3),
    [walk, setWalk] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [wide, setWide] = useState(false);
  const [portraitId, setPortraitId] = useState(61);
  // Begin cheaply until the renderer is known; software GPUs otherwise block
  // interaction while compiling and drawing large shadow maps.
  const [automaticEconomy, setAutomaticEconomy] = useState(true);
  const [graphics, setGraphics] = useState("auto");
  const economy =
    graphics === "economy" || (graphics === "auto" && automaticEconomy);
  const { active: loadingFigures } = useProgress();
  const [streetRunning, setStreetRunning] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const outside = view % 6 >= 3;
  const overlayRefs = useRef<Record<string, HTMLDivElement | null>>({});
  return (
    <div
      className={`scene-wrap${wide ? " scene-wide" : ""}`}
      tabIndex={0}
      aria-label="3D-Kamerasteuerung: WASD oder Pfeiltasten zum Bewegen"
      onContextMenu={(e) => e.preventDefault()}
    >
      <SceneBoundary
        fallback={
          <div className="scene-fallback">
            <Icon name="store" size={40} />
            <h3>3D ist auf diesem Gerät nicht verfügbar.</h3>
            <p>
              Nutze die Produktliste darunter. Warenkorb und Automation
              funktionieren vollständig weiter.
            </p>
          </div>
        }
      >
        <Suspense
          fallback={
            <div className="scene-loading">
              <span className="spinner" />
              3D-Laden wird vorbereitet …
            </div>
          }
        >
          <Canvas
            frameloop={
              state.running || (streetRunning && (outside || view % 6 === 2))
                ? "always"
                : "demand"
            }
            aria-label="Interaktiver 3D-Laden: belebte Nachbarschaft und anklickbare Produkte im Laden"
            shadows={!economy}
            dpr={economy ? 1 : [1, 1.5]}
            camera={{ position: [8, 5.6, 17.5], fov: 49, near: 0.1, far: 200 }}
            onCreated={({ gl }) => {
              const context = gl.getContext();
              const debug = context.getExtension("WEBGL_debug_renderer_info");
              const renderer = String(
                context.getParameter(
                  debug?.UNMASKED_RENDERER_WEBGL ?? context.RENDERER,
                ),
              );
              setAutomaticEconomy(
                window.matchMedia("(max-width: 650px)").matches ||
                  /swiftshader|llvmpipe|softpipe|software|microsoft basic/i.test(
                    renderer,
                  ),
              );
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 0.97;
              gl.shadowMap.type = THREE.PCFSoftShadowMap;
            }}
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: "high-performance",
            }}
            fallback={
              <div className="scene-fallback" aria-hidden="true">
                WebGL ist nicht verfügbar. Bitte nutze die Produktliste.
              </div>
            }
          >
            <MaterialLibrary>
              <ProductArtworkLibrary>
                <Content
                  state={state}
                  onSelect={onSelect}
                  view={view}
                  walk={walk}
                  overlayRefs={overlayRefs}
                  onEnter={() => setView(2)}
                  moving={moving}
                  onMoving={setMoving}
                  streetRunning={streetRunning}
                  portraitId={portraitId}
                />
              </ProductArtworkLibrary>
            </MaterialLibrary>
          </Canvas>
        </Suspense>
      </SceneBoundary>
      <div
        className={`scene-overlays${moving ? " camera-moving" : ""}${showLabels ? "" : " hide-product-labels"}`}
        aria-hidden={moving}
      >
        <div
          ref={(element) => {
            overlayRefs.current.robot = element;
          }}
          className="projected-label"
          style={{ display: "none" }}
        >
          <div className="robot-bubble">
            <span>NOA · Demo-Assistent</span>Willkommen im
            <br />
            <strong>AI Grocery Store</strong>
            <i />
          </div>
        </div>
        {products.map((p) => (
          <div
            className="projected-label"
            style={{ display: "none" }}
            key={p.id}
            ref={(element) => {
              overlayRefs.current[p.id] = element;
            }}
          >
            <button
              className={`shelf-label ${state.inventory[p.id] < p.minStock ? "low" : ""}`}
              onClick={() => onSelect(p)}
              aria-label={`${p.name} ansehen`}
            >
              <span>{p.shortName}</span>
              <strong>{(p.price / 100).toFixed(2).replace(".", ",")} €</strong>
              {!state.inventory[p.id] && <em>Ausverkauft</em>}
            </button>
          </div>
        ))}
        {state.customers.map((c) => (
          <div
            className="projected-label"
            key={c.id}
            ref={(element) => {
              overlayRefs.current[`customer-${c.id}`] = element;
            }}
          >
            <div className="customer-tag">
              Kund:in {String(c.id).padStart(2, "0")}
              <span>
                {c.phase === "entering"
                  ? "Betritt den Laden"
                  : c.phase === "browsing"
                    ? "Wählt ein Produkt"
                    : c.phase === "to-checkout"
                      ? "Geht zur Kasse"
                      : c.phase === "checkout"
                        ? "Demo-Kauf"
                        : "Einkauf abgeschlossen"}
              </span>
            </div>
          </div>
        ))}
      </div>
      {loadingFigures && (
        <div className="character-loading" role="status">
          Figuren werden geladen …
        </div>
      )}
      {view % 6 === 5 && (
        <button
          className="portrait-control"
          onClick={() => setPortraitId((id) => 61 + ((id - 60) % 6))}
        >
          Andere Person ansehen →
        </button>
      )}
      <div className="scene-corner">
        <span className="live-dot" />
        {outside ? "AUSSENANSICHT · AI GROCERY" : "INTERAKTIVER 3D-LADEN"}
      </div>
      <button
        className="product-label-toggle"
        aria-pressed={showLabels}
        onClick={() => setShowLabels((v) => !v)}
      >
        {showLabels ? "Produktinfos ausblenden" : "Produktinfos anzeigen"}
      </button>
      <div className="camera-views" aria-label="Kameraansicht">
        {[
          "Laden",
          "Übersicht",
          "Augenhöhe",
          "Außenansicht",
          "Straßenblick",
          "Menschen",
        ].map((label, index) => (
          <button
            key={label}
            aria-pressed={view % 6 === index}
            className={view % 6 === index ? "active" : ""}
            onClick={() => setView((v) => (v % 6 === index ? v + 6 : index))}
          >
            {label}
          </button>
        ))}
      </div>
      <button
        className="street-life-control"
        aria-label={
          streetRunning ? "Straßenleben pausieren" : "Straßenleben starten"
        }
        aria-pressed={streetRunning}
        onClick={() => setStreetRunning((v) => !v)}
      >
        <Icon name={streetRunning ? "pause" : "play"} size={13} />
        <span>
          {streetRunning ? "Nachbarschaft lebt" : "Straßenleben pausiert"}
        </span>
      </button>
      <button
        className="scene-size-control"
        aria-label={wide ? "3D-Ansicht verkleinern" : "3D-Ansicht vergrößern"}
        aria-pressed={wide}
        onClick={() => setWide((v) => !v)}
      >
        <Icon name="expand" size={13} />
        {wide ? "Kompakte Ansicht" : "3D groß ansehen"}
      </button>
      <button className="scene-entry" onClick={() => setView(outside ? 2 : 3)}>
        <Icon name="store" size={16} />
        {outside ? "Laden betreten" : "Nach draußen"}
        <span aria-hidden="true">→</span>
      </button>
      <div className="scene-help">
        <span>Ziehen: drehen · Scrollen: zoomen · WASD / Pfeile: bewegen</span>
        <span className="touch-help">
          1 Finger: drehen · 2 Finger: zoomen / verschieben
        </span>
      </div>
      <label className="scene-quality">
        Grafik
        <select
          aria-label="Grafikqualität"
          value={graphics}
          onChange={(event) => setGraphics(event.target.value)}
        >
          <option value="auto">
            Automatisch · {automaticEconomy ? "sparsam" : "detailreich"}
          </option>
          <option value="detail">Detailreich</option>
          <option value="economy">Sparsam</option>
        </select>
      </label>
      <div className="touch-pad" aria-label="Durch den Laden bewegen">
        {[
          ["forward", "↑"],
          ["left", "←"],
          ["back", "↓"],
          ["right", "→"],
        ].map(([key, label]) => (
          <button
            key={key}
            aria-label={
              key === "forward"
                ? "Vorwärts"
                : key === "back"
                  ? "Rückwärts"
                  : key === "left"
                    ? "Nach links"
                    : "Nach rechts"
            }
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              setWalk(key);
            }}
            onPointerUp={() => setWalk(null)}
            onPointerCancel={() => setWalk(null)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
