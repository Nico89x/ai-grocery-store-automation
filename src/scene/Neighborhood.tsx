import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { HumanFigure } from "./HumanShopper";
import { LeafPlant, Lettering, Rod, Solid, type Point } from "./SceneDetails";
import { useSurface } from "./Materials";

const clothes = [
  "#8f6753",
  "#66787e",
  "#b29b77",
  "#596a5b",
  "#a37a78",
  "#5d627d",
  "#ae9270",
  "#6c7470",
];

function Pedestrian({ id, running }: { id: number; running: boolean }) {
  const root = useRef<THREE.Group>(null),
    time = useRef(id * 4.81);
  const lane = id % 3,
    z = 8.65 + lane * 0.75,
    direction = id % 2 ? 1 : -1,
    pace = 0.8 + (id % 4) * 0.11;
  useFrame((_, dt) => {
    if (!running || !root.current) return;
    time.current += Math.min(dt, 0.08);
    root.current.position.x =
      direction * (((time.current * pace + id * 3.1) % 46) - 23);
  });
  const initialX = direction * (((time.current * pace + id * 3.1) % 46) - 23);
  return (
    <group ref={root} position={[initialX, 0, z]}>
      <HumanFigure
        person={{ id: id + 30, color: clothes[id % clothes.length] }}
        position={[0, 0, 0]}
        heading={(direction * Math.PI) / 2}
        walking
        running={running}
        speed={pace}
      />
    </group>
  );
}

function Bicycle({
  at = [0, 0, 0],
  color = "#627a70",
  rolling = false,
  time = 0,
}: {
  at?: Point;
  color?: string;
  rolling?: boolean;
  time?: number;
}) {
  const wheels = [useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  useFrame((_, dt) => {
    if (rolling)
      for (const ref of wheels)
        if (ref.current) ref.current.rotation.z -= Math.min(dt, 0.08) * 6;
  });
  return (
    <group position={at}>
      {[-0.56, 0.56].map((z, i) => (
        <group
          key={z}
          ref={wheels[i]}
          position={[0, 0.36, z]}
          rotation={[0, Math.PI / 2, time]}
        >
          <mesh castShadow>
            <torusGeometry args={[0.33, 0.026, 8, 36]} />
            <meshStandardMaterial color="#313735" roughness={0.94} />
          </mesh>
          <mesh>
            <torusGeometry args={[0.299, 0.012, 6, 36]} />
            <meshStandardMaterial
              color="#9aaba8"
              metalness={0.84}
              roughness={0.3}
            />
          </mesh>
          {Array.from({ length: 10 }, (_, s) => {
            const a = (s * Math.PI) / 5;
            return (
              <Rod
                key={s}
                a={[0, 0, 0]}
                b={[Math.cos(a) * 0.29, Math.sin(a) * 0.29, 0]}
                radius={0.003}
                color="#a8b1ad"
                metal={0.9}
              />
            );
          })}
        </group>
      ))}
      <Rod a={[0, 0.36, -0.56]} b={[0, 0.78, -0.21]} color={color} />
      <Rod a={[0, 0.78, -0.21]} b={[0, 0.35, 0]} color={color} />
      <Rod a={[0, 0.35, 0]} b={[0, 0.36, -0.56]} color={color} />
      <Rod a={[0, 0.78, -0.21]} b={[0, 0.79, 0.37]} color={color} />
      <Rod a={[0, 0.79, 0.37]} b={[0, 0.35, 0]} color={color} />
      <Rod a={[0, 0.36, 0.56]} b={[0, 0.95, 0.31]} color="#83958f" />
      <Rod a={[0, 0.78, -0.21]} b={[0, 0.96, -0.24]} color="#9ca9a2" />
      <Solid
        at={[0, 0.975, -0.24]}
        size={[0.19, 0.045, 0.25]}
        color="#423e37"
      />
      <Rod a={[0, 0.95, 0.31]} b={[0, 1.06, 0.31]} color="#9ba9a3" />
      <Rod a={[-0.22, 1.06, 0.31]} b={[0.22, 1.06, 0.31]} color="#a6ada5" />
      <Rod a={[-0.12, 0.35, 0]} b={[0.12, 0.35, 0]} color="#858e87" />
      <Solid
        at={[-0.15, 0.35, 0.05]}
        size={[0.1, 0.025, 0.13]}
        color="#454a40"
      />
      <Solid
        at={[0.15, 0.35, -0.05]}
        size={[0.1, 0.025, 0.13]}
        color="#454a40"
      />
      <mesh position={[0, 0.35, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.1, 0.012, 6, 24]} />
        <meshStandardMaterial color="#6f7c72" metalness={0.75} />
      </mesh>
    </group>
  );
}
function Cyclist({ running }: { running: boolean }) {
  const root = useRef<THREE.Group>(null),
    time = useRef(9);
  useFrame((_, dt) => {
    if (running && root.current) {
      time.current += Math.min(dt, 0.08);
      root.current.position.x = ((time.current * 1.6) % 48) - 24;
    }
  });
  return (
    <group ref={root} position={[-9.6, 0, 10.9]} rotation={[0, Math.PI / 2, 0]}>
      <Bicycle color="#7e9684" rolling={running} />
      <HumanFigure
        person={{ id: 42, color: "#917b64" }}
        position={[0, 0.22, -0.15]}
        seated
        cycling
        running={running}
      />
    </group>
  );
}
function Car({ id, running }: { id: number; running: boolean }) {
  const body = useRef<THREE.Group>(null),
    wheels = useRef<THREE.Group>(null),
    time = useRef(id === 0 ? 7 : 29),
    direction = id === 0 ? 1 : -1;
  useFrame((_, dt) => {
    if (!running) return;
    time.current += Math.min(dt, 0.08);
    if (body.current)
      body.current.position.x = direction * (((time.current * 2.1) % 62) - 31);
    if (wheels.current)
      for (const wheel of wheels.current.children)
        wheel.rotation.x -= Math.min(dt, 0.08) * 6;
  });
  const color = id ? "#777f73" : "#9b735a";
  return (
    <group
      ref={body}
      position={[
        direction * (((time.current * 2.1) % 62) - 31),
        -0.16,
        id ? 16.6 : 13.55,
      ]}
      rotation={[0, (direction * Math.PI) / 2, 0]}
    >
      <RoundedBox
        position={[0, 0.49, 0]}
        args={[1.67, 0.53, 3.65]}
        radius={0.19}
        smoothness={3}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color={color}
          metalness={0.38}
          roughness={0.27}
          clearcoat={0.8}
          clearcoatRoughness={0.18}
        />
      </RoundedBox>
      <RoundedBox
        position={[0, 0.93, -0.12]}
        args={[1.46, 0.7, 1.97]}
        radius={0.22}
        smoothness={3}
        castShadow
      >
        <meshPhysicalMaterial
          color={color}
          metalness={0.32}
          roughness={0.29}
          clearcoat={0.65}
        />
      </RoundedBox>
      <mesh position={[0, 0.99, 0.856]} rotation={[-0.34, 0, 0]}>
        <planeGeometry args={[1.22, 0.48]} />
        <meshPhysicalMaterial
          color="#344b51"
          metalness={0.43}
          roughness={0.08}
          clearcoat={1}
        />
      </mesh>
      <mesh position={[0, 0.99, -1.097]} rotation={[0.24, Math.PI, 0]}>
        <planeGeometry args={[1.2, 0.43]} />
        <meshPhysicalMaterial
          color="#344b51"
          metalness={0.43}
          roughness={0.08}
          clearcoat={1}
        />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <Solid
            at={[side * 0.734, 0.97, -0.13]}
            size={[0.008, 0.39, 1.31]}
            color="#31474a"
            metal={0.38}
          />
          <Solid
            at={[side * 0.75, 0.97, -0.13]}
            size={[0.018, 0.44, 0.06]}
            color={color}
          />
          <Solid
            at={[side * 0.753, 0.7, -0.37]}
            size={[0.012, 0.027, 0.14]}
            color="#bfc5bc"
            metal={0.9}
          />
          <RoundedBox
            position={[side * 0.835, 0.89, 0.58]}
            args={[0.17, 0.12, 0.21]}
            radius={0.04}
            smoothness={2}
          >
            <meshStandardMaterial color={color} metalness={0.5} />
          </RoundedBox>
          <mesh position={[side * 0.56, 0.55, 1.795]}>
            <boxGeometry args={[0.42, 0.13, 0.014]} />
            <meshStandardMaterial
              color="#fff1bc"
              emissive="#eedcb0"
              emissiveIntensity={0.7}
            />
          </mesh>
          <Solid
            at={[side * 0.59, 0.61, -1.795]}
            size={[0.33, 0.095, 0.019]}
            color="#933e32"
          />
        </group>
      ))}
      <Solid at={[0, 0.3, 1.72]} size={[1.25, 0.11, 0.09]} color="#454e49" />
      <Solid
        at={[0, 0.53, 1.819]}
        size={[0.59, 0.095, 0.016]}
        color="#384039"
      />
      <Solid
        at={[0, 0.42, -1.819]}
        size={[0.32, 0.07, 0.016]}
        color="#dbdbd1"
      />
      <group ref={wheels}>
        {[-1, 1].flatMap((side) =>
          [-1.12, 1.15].map((z) => (
            <group key={`${side}-${z}`} position={[side * 0.79, 0.33, z]}>
              <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.31, 0.31, 0.16, 24]} />
                <meshStandardMaterial color="#292e2b" roughness={0.92} />
              </mesh>
              <mesh
                position={[side * 0.09, 0, 0]}
                rotation={[0, 0, Math.PI / 2]}
              >
                <cylinderGeometry args={[0.19, 0.19, 0.025, 18]} />
                <meshStandardMaterial
                  color="#b0b7b0"
                  metalness={0.8}
                  roughness={0.3}
                />
              </mesh>
            </group>
          )),
        )}
      </group>
    </group>
  );
}
function CafeFurniture({ running }: { running: boolean }) {
  return (
    <group position={[-12.6, 0, 7.1]}>
      {[-1.6, 1.6].map((x, i) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.57, 0.57, 0.065, 24]} />
            <meshStandardMaterial color="#9f8665" roughness={0.68} />
          </mesh>
          <Rod a={[0, 0, 0]} b={[0, 0.72, 0]} radius={0.055} />
          <Solid at={[0, 0.03, 0]} size={[0.68, 0.045, 0.5]} color="#485149" />
          {[-1, 1].map((side) => (
            <group
              key={side}
              position={[side * 0.88, 0, 0]}
              rotation={[0, (-side * Math.PI) / 2, 0]}
            >
              <Solid
                at={[0, 0.46, 0]}
                size={[0.43, 0.055, 0.42]}
                color="#8b795b"
              />
              <Solid
                at={[0, 0.78, -0.19]}
                size={[0.43, 0.53, 0.04]}
                color="#8b795b"
              />
              {[-0.16, 0.16].flatMap((a) =>
                [-0.16, 0.16].map((b) => (
                  <Rod key={`${a}-${b}`} a={[a, 0, b]} b={[a, 0.46, b]} />
                )),
              )}
              <HumanFigure
                person={{
                  id: 45 + i * 2 + (side === 1 ? 1 : 0),
                  color: clothes[i * 2 + (side === 1 ? 1 : 0)],
                }}
                position={[0, 0, 0]}
                heading={0}
                seated
                running={running}
              />
            </group>
          ))}
          {[-0.21, 0.19].map((a) => (
            <mesh key={a} position={[a, 0.802, 0.15]}>
              <cylinderGeometry args={[0.045, 0.038, 0.11, 14]} />
              <meshStandardMaterial color="#e9dfc9" roughness={0.35} />
            </mesh>
          ))}
          <LeafPlant at={[0, 0.76, -0.19]} scale={0.38} />
        </group>
      ))}
      <Rod a={[0, 0, 0]} b={[0, 3.02, 0]} radius={0.04} color="#9c8b71" />
      <mesh position={[0, 2.9, 0]} castShadow receiveShadow>
        <coneGeometry args={[3.0, 0.55, 8, 1, true]} />
        <meshStandardMaterial
          color="#e3d4b7"
          side={THREE.DoubleSide}
          roughness={0.97}
        />
      </mesh>
    </group>
  );
}
function NeighborBuildings() {
  const brick = useSurface("brick");
  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 12.3, 0, -1.5]}>
          <mesh position={[0, 4.22, 0]} castShadow receiveShadow>
            <boxGeometry args={[7, 8.44, 10.6]} />
            <meshStandardMaterial
              {...brick}
              color={side === 1 ? "#ddd4bc" : "#d4c7bb"}
              bumpScale={0.015}
              roughness={0.94}
            />
          </mesh>
          {[3.05, 5.72, 8.45].map((y) => (
            <Solid
              key={y}
              at={[0, y, 5.38]}
              size={[7.14, 0.1, 0.24]}
              color="#cfc8b4"
            />
          ))}
          {[-2.25, 0, 2.25].flatMap((x) =>
            [4.36, 7.03].map((y) => (
              <group key={`${x}-${y}`} position={[x, y, 5.34]}>
                <Solid
                  at={[0, 0, 0.035]}
                  size={[1.35, 1.7, 0.07]}
                  color="#3c5154"
                  metal={0.32}
                />
                {[-0.7, 0.7].map((a) => (
                  <Solid
                    key={a}
                    at={[a, 0, 0.09]}
                    size={[0.075, 1.85, 0.16]}
                    color="#b8b6a4"
                  />
                ))}
                {[-0.88, 0.88, 0].map((a) => (
                  <Solid
                    key={a}
                    at={[0, a, 0.09]}
                    size={[1.46, 0.075, 0.16]}
                    color="#d2cdb7"
                  />
                ))}
                <Solid
                  at={[0, 0, 0.088]}
                  size={[0.045, 1.7, 0.08]}
                  color="#d2cdb7"
                />
                <Solid
                  at={[0, -0.98, 0.2]}
                  size={[1.64, 0.12, 0.45]}
                  color="#9d9c8b"
                />
                <mesh position={[0, 0, 0.08]}>
                  <planeGeometry args={[1.22, 1.55]} />
                  <meshPhysicalMaterial
                    color="#9aa8a8"
                    transparent
                    opacity={0.32}
                    roughness={0.12}
                    metalness={0.25}
                    depthWrite={false}
                  />
                </mesh>
              </group>
            )),
          )}
          <Solid
            at={[0, 1.55, 5.34]}
            size={[6.2, 2.65, 0.09]}
            color="#314a49"
            metal={0.17}
          />
          {[-2.2, 0, 2.2].map((x) => (
            <Solid
              key={x}
              at={[x, 1.52, 5.43]}
              size={[0.075, 2.8, 0.12]}
              color="#d6c7ac"
            />
          ))}
          <Lettering
            text={side === -1 ? "CAFÉ AM ECK" : "BLUMEN & GRÜN"}
            sub={
              side === -1
                ? "KAFFEE · GEBÄCK · GUTE GESPRÄCHE"
                : "PFLANZEN FÜR DEIN ZUHAUSE"
            }
            at={[0, 2.75, 5.48]}
            width={5.95}
            height={0.48}
            background={side === -1 ? "#735f4e" : "#4f6650"}
            color="#fff5df"
          />
          <Solid
            at={[0, 2.3, 6.08]}
            size={[6.6, 0.08, 1.35]}
            color={side === -1 ? "#b49873" : "#658471"}
            rotation={[-0.14, 0, 0]}
          />
          <Solid
            at={[0, 2.18, 6.72]}
            size={[6.6, 0.27, 0.04]}
            color={side === -1 ? "#9b7d59" : "#486e57"}
          />
          {side === 1 &&
            [-2.3, -0.8, 0.7, 2.2].map((x) => (
              <LeafPlant
                key={x}
                at={[x, 0, 6.27]}
                scale={1.4 + (x % 2) * 0.15}
              />
            ))}
          <Solid at={[0, 8.61, 0]} size={[7.27, 0.23, 10.85]} color="#7f837a" />
        </group>
      ))}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 22.7, 0, -4.0]}>
          <Solid
            at={[0, 5, 0]}
            size={[9, 10, 13]}
            color={side === 1 ? "#afa99b" : "#b5b9ad"}
          />
          {[-2.8, 0, 2.8].flatMap((x) =>
            [2, 5, 8].map((y) => (
              <group key={`${x}-${y}`}>
                <Solid
                  at={[x, y, 6.52]}
                  size={[1.25, 1.6, 0.05]}
                  color="#586d71"
                  metal={0.2}
                />
                <Solid
                  at={[x, y - 0.85, 6.62]}
                  size={[1.55, 0.1, 0.25]}
                  color="#d3cdba"
                />
              </group>
            )),
          )}
        </group>
      ))}
    </group>
  );
}
function StreetDetails() {
  return (
    <group>
      <group position={[4.95, 0, 10.0]}>
        <mesh position={[0, 0.38, 0]} castShadow>
          <cylinderGeometry args={[0.23, 0.21, 0.76, 20]} />
          <meshStandardMaterial
            color="#4c5850"
            roughness={0.57}
            metalness={0.3}
          />
        </mesh>
        <mesh position={[0, 0.77, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.195, 0.036, 8, 24]} />
          <meshStandardMaterial color="#313c32" />
        </mesh>
      </group>
      <group position={[-5.15, 0, 6.95]} rotation={[0, 0.14, 0]}>
        <Bicycle at={[0, 0, 0]} color="#9d6854" />
        <Bicycle at={[0.6, 0, 0.18]} color="#587476" />
        {[-0.15, 0.65].map((x) => (
          <group key={x}>
            <Rod a={[x, 0, -0.6]} b={[x, 0.85, -0.6]} radius={0.025} />
            <Rod a={[x, 0.85, -0.6]} b={[x, 0.85, 0.5]} radius={0.025} />
            <Rod a={[x, 0.85, 0.5]} b={[x, 0, 0.5]} radius={0.025} />
          </group>
        ))}
      </group>
      <group position={[9.0, 0, 10.0]}>
        <Rod a={[0, 0, 0]} b={[0, 2.8, 0]} radius={0.03} color="#9ba599" />
        <mesh position={[0, 2.35, 0]}>
          <circleGeometry args={[0.29, 36]} />
          <meshStandardMaterial color="#ece6d6" />
        </mesh>
        <mesh position={[0, 2.35, 0.004]}>
          <ringGeometry args={[0.23, 0.29, 36]} />
          <meshStandardMaterial color="#927759" />
        </mesh>
        <Lettering text="30" at={[0, 2.35, 0.01]} width={0.38} height={0.24} />
      </group>
      <mesh position={[-9.3, 0.006, 10.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.31, 24]} />
        <meshStandardMaterial
          color="#727971"
          roughness={0.72}
          metalness={0.25}
        />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => (
        <mesh
          key={i}
          position={[
            -0.65 + (i % 4) * 0.5,
            0.002,
            6.48 + Math.floor(i / 4) * 0.085,
          ]}
          rotation={[-Math.PI / 2, 0, i * 0.78]}
        >
          <planeGeometry args={[0.12, 0.052]} />
          <meshStandardMaterial
            color={i % 2 ? "#8f7c54" : "#c4a262"}
            side={THREE.DoubleSide}
            roughness={1}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Street life is visual only. Only domain customers can create orders. */
export default function Neighborhood({
  running,
  active,
  portrait = false,
  portraitId = 61,
}: {
  running: boolean;
  active: boolean;
  portrait?: boolean;
  portraitId?: number;
}) {
  const { size } = useThree(),
    small = size.width < 560;
  const sky = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          top: { value: new THREE.Color("#789db9") },
          bottom: { value: new THREE.Color("#e6e2cc") },
        },
        vertexShader:
          "varying vec3 vPosition; void main(){ vPosition=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
        fragmentShader:
          "varying vec3 vPosition; uniform vec3 top; uniform vec3 bottom; void main(){ float h=clamp(normalize(vPosition).y*1.35+0.13,0.0,1.0); gl_FragColor=vec4(mix(bottom,top,pow(h,0.55)),1.0); \n#include <tonemapping_fragment>\n #include <colorspace_fragment>\n }",
      }),
    [],
  );
  useEffect(() => () => sky.dispose(), [sky]);
  return (
    <group>
      <mesh material={sky} raycast={() => null}>
        <sphereGeometry args={[75, 24, 16]} />
      </mesh>
      <NeighborBuildings />
      <StreetDetails />
      <CafeFurniture running={running && active} />
      <group visible={!portrait}>
        {Array.from({ length: small ? 6 : 10 }, (_, i) => (
          <Pedestrian key={i} id={i + 1} running={running && active} />
        ))}
        <Cyclist running={running && active} />
        <Car id={0} running={running && active} />
        <Car id={1} running={running && active} />
      </group>
      <HumanFigure
        key={portraitId}
        person={{
          id: portraitId,
          color: clothes[(portraitId - 1) % clothes.length],
          phase: "checkout",
        }}
        position={[-2.05, 0, 7.5]}
        heading={0}
        running={running}
      />
      <group position={[6.45, 0, 10.07]}>
        <HumanFigure
          person={{ id: 57, color: "#9c8264" }}
          position={[0, 0, 0]}
          heading={0}
          seated
          running={running && active}
        />
      </group>
    </group>
  );
}
