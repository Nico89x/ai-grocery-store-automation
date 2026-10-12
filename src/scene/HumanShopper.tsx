import { useMemo, useRef, useEffect, Suspense } from "react";
import { useFrame, createPortal } from "@react-three/fiber";
import { RoundedBox, useGLTF } from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";
import type { Customer } from "../domain/simulation";
import { customerHeading, customerPosition } from "../domain/customerJourney";
import { productById } from "../domain/products";
import GroceryProduct from "./GroceryProduct";
import { useSurface } from "./Materials";

type Point = [number, number, number];
type FigureProps = {
  person: Pick<Customer, "id" | "color"> &
    Partial<Pick<Customer, "phase" | "elapsed" | "productId">>;
  position: Point;
  heading?: number;
  walking?: boolean;
  chosen?: boolean;
  running: boolean;
  speed?: number;
  seated?: boolean;
  basket?: boolean;
  cycling?: boolean;
};
const variants = ["casual-light", "casual-dark", "casual-female"];
const sizes = [1.02, 1.04, 0.97, 1.0, 0.99, 1.06];

/** Fictional, locally bundled CC0 MakeHuman characters. Each visitor owns their rig. */
function RiggedHuman({
  person: c,
  position: pose,
  heading = 0,
  walking = false,
  chosen = false,
  running,
  speed = 1,
  seated = false,
  basket = false,
  cycling = false,
}: FigureProps) {
  const index = (c.id - 1) % 6,
    variant = variants[index % 3];
  const fabric = useSurface("cloth");
  const { scene } = useGLTF(
    `${import.meta.env.BASE_URL}assets/humans/${variant}.glb`,
  );
  const actor = useMemo(() => {
    const object = clone(scene),
      materials: THREE.Material[] = [];
    object.traverse((item) => {
      if (item instanceof THREE.Mesh) {
        const material = (item.material as THREE.MeshStandardMaterial).clone();
        materials.push(material);
        item.material = material;
        item.castShadow = true;
        item.receiveShadow = true;
        // A conservative local bound covers the procedural poses without
        // skinning every vertex just to decide whether an off-screen person draws.
        if (!item.geometry.boundingSphere)
          item.geometry.computeBoundingSphere();
        if (item instanceof THREE.SkinnedMesh && item.geometry.boundingSphere) {
          item.boundingSphere = item.geometry.boundingSphere.clone();
          item.boundingSphere.radius = item.boundingSphere.radius * 1.4 + 0.25;
        }
        item.frustumCulled = true;
        if (material.name === "Clothing")
          material.color.set(
            index % 3 === 2
              ? index > 2
                ? "#cfc0a5"
                : "#c4dbe6"
              : index > 2
                ? "#c1cbc5"
                : "#ece5da",
          );
        if (material.name === "Top") {
          material.color.set(index > 2 ? "#637c71" : "#725366");
          material.bumpMap = fabric?.bumpMap ?? null;
          material.bumpScale = 0.0015;
        }
        if (material.name === "Hair")
          material.color.set(index > 2 ? "#9b806a" : "#bdb0a1");
        if (material.map) material.map.anisotropy = 4;
      }
    });
    const bone = (name: string) => object.getObjectByName(name) as THREE.Bone;
    const arms = ["L", "R"].map((s) => bone(`upperarm01_${s}`));
    const forearms = ["L", "R"].map((s) => bone(`lowerarm01_${s}`));
    const hands = ["L", "R"].map((s) => bone(`wrist_${s}`));
    const legs = ["L", "R"].map((s) => bone(`upperleg01_${s}`));
    const knees = ["L", "R"].map((s) => bone(`lowerleg01_${s}`));
    // Fit the lowered arm pose to each model's rest anatomy, rather than a T-pose.
    const restArms = forearms.map(
      (b, i) =>
        -Math.atan2(b.position.x, -b.position.y) + (i === 0 ? 0.12 : -0.12),
    );
    const restForearms = hands.map((b, i) => {
      const v = b.position
        .clone()
        .applyAxisAngle(new THREE.Vector3(0, 0, 1), restArms[i]);
      return Math.atan2(v.z, -v.y);
    });
    const restLegs = knees.map((b) => -Math.atan2(b.position.x, -b.position.y));
    return {
      object,
      materials,
      bone,
      arms,
      forearms,
      hands,
      legs,
      knees,
      restArms,
      restForearms,
      restLegs,
    };
  }, [scene, index, c.color, fabric]);
  useEffect(() => () => actor.materials.forEach((m) => m.dispose()), [actor]);
  const root = useRef<THREE.Group>(null),
    body = useRef<THREE.Group>(null);
  const target = useRef(new THREE.Vector3()),
    initial = useRef(pose),
    clock = useRef(c.id * 0.47);
  function animate(dt: number) {
    if (running) clock.current += Math.min(dt, 0.06) * speed;
    const t = clock.current,
      gait = t * 6.5,
      swing = walking ? Math.sin(gait) * 0.32 : 0;
    const reach =
      c.phase === "browsing"
        ? Math.sin(Math.PI * Math.min(1, (c.elapsed ?? 0) / 4.6))
        : 0;
    if (root.current) {
      target.current.set(...pose);
      root.current.position.lerp(target.current, 1 - Math.exp(-dt * 13));
      const angle =
        THREE.MathUtils.euclideanModulo(
          heading - root.current.rotation.y + Math.PI,
          Math.PI * 2,
        ) - Math.PI;
      root.current.rotation.y += angle * (1 - Math.exp(-dt * 9));
    }
    if (body.current) {
      body.current.position.y = seated
        ? -0.44
        : cycling
          ? -0.12
          : walking
            ? Math.abs(Math.sin(gait)) * 0.012
            : Math.sin(t * 0.9 + c.id) * 0.002;
      body.current.rotation.z = walking ? Math.sin(gait) * 0.01 : 0;
    }
    actor
      .bone("head")
      .rotation.set(
        c.phase === "browsing" ? reach * 0.08 : Math.sin(t * 0.8) * 0.018,
        c.phase === "checkout"
          ? Math.sin(t * 0.6) * 0.06
          : Math.sin(t * 0.45 + c.id) * 0.04,
        0,
      );
    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? 1 : -1;
      actor.legs[i].rotation.set(
        cycling
          ? -1.0 + Math.sin(gait) * side * 0.27
          : seated
            ? -Math.PI / 2
            : swing * side,
        0,
        actor.restLegs[i],
      );
      actor.knees[i].rotation.x = cycling
        ? 1.1 + Math.sin(gait - 0.5) * side * 0.25
        : seated
          ? Math.PI / 2
          : walking
            ? Math.max(0, -Math.sin(gait) * side) * 0.48
            : 0.025;
      actor.arms[i].rotation.set(
        cycling
          ? -0.75
          : seated
            ? -0.2
            : i === 1
              ? -reach * 0.82 +
                (walking ? -swing * 0.6 : Math.sin(t * 0.8) * 0.02)
              : chosen
                ? -0.15
                : walking
                  ? swing * 0.6
                  : 0,
        0,
        actor.restArms[i],
      );
      actor.forearms[i].rotation.x =
        actor.restForearms[i] +
        (cycling
          ? -0.45
          : seated
            ? -0.55
            : i === 1
              ? -reach * 0.65
              : chosen
                ? -0.2
                : -0.06);
    }
  }
  // A paused simulation still has the correct lowered-arm pose on first render.
  useEffect(() => {
    animate(1);
  }, [actor]); // eslint-disable-line react-hooks/exhaustive-deps
  useFrame((_, dt) => {
    if (running) animate(dt);
  });
  return (
    <group
      ref={root}
      position={initial.current}
      rotation={[0, heading, 0]}
      scale={[sizes[index], sizes[index], sizes[index]]}
    >
      <group ref={body}>
        <primitive object={actor.object} dispose={null} />
      </group>
      {basket &&
        createPortal(
          <group position={[0, -0.18, 0.03]} rotation={[0, 0, -0.06]}>
            <RoundedBox
              args={[0.28, 0.19, 0.21]}
              radius={0.018}
              smoothness={2}
              castShadow
            >
              <meshStandardMaterial color="#b6a17d" roughness={0.9} />
            </RoundedBox>
            {[-0.09, -0.045, 0, 0.045, 0.09].map((x) => (
              <mesh key={x} position={[x, 0, 0.109]}>
                <boxGeometry args={[0.007, 0.18, 0.012]} />
                <meshStandardMaterial color="#8c7e62" />
              </mesh>
            ))}
            <mesh position={[0, 0.15, 0]}>
              <torusGeometry args={[0.1, 0.012, 8, 22, Math.PI]} />
              <meshStandardMaterial color="#716956" />
            </mesh>
            {chosen && c.productId && (
              <group position={[0, 0.13, 0]} scale={0.32}>
                <GroceryProduct p={productById[c.productId]} />
              </group>
            )}
          </group>,
          actor.hands[0],
        )}
      {c.phase === "browsing" &&
        (c.elapsed ?? 0) > 2.6 &&
        c.productId &&
        createPortal(
          <group position={[0, -0.05, 0.065]} scale={0.28}>
            <GroceryProduct p={productById[c.productId]} />
          </group>,
          actor.hands[1],
        )}
    </group>
  );
}

// Keep the rest of the store interactive while character files load asynchronously.
export function HumanFigure(props: FigureProps) {
  return (
    <Suspense fallback={null}>
      <RiggedHuman {...props} />
    </Suspense>
  );
}
export default function HumanShopper({
  customer,
  running,
  speed,
}: {
  customer: Customer;
  running: boolean;
  speed: number;
}) {
  return (
    <HumanFigure
      person={customer}
      position={customerPosition(customer)}
      heading={customerHeading(customer)}
      walking={
        running &&
        ["entering", "to-checkout", "leaving"].includes(customer.phase)
      }
      chosen={["to-checkout", "checkout", "leaving"].includes(customer.phase)}
      running={running}
      speed={speed}
      basket
    />
  );
}
