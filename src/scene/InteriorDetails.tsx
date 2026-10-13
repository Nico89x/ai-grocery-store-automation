import { LeafPlant, Lettering, Rod, Solid } from "./SceneDetails";
import { useSurface } from "./Materials";

/** Background display jars and shop fixtures; sellable products remain stock-bound. */
export default function InteriorDetails() {
  const wood = useSurface("wood");
  return (
    <group>
      <group position={[1.25, 0, -5.13]}>
        <mesh position={[0, 1.45, -0.03]} receiveShadow>
          <boxGeometry args={[5.7, 2.9, 0.15]} />
          <meshStandardMaterial
            color="#bfa982"
            {...wood}
            bumpScale={0.008}
            roughness={0.84}
          />
        </mesh>
        {[0.56, 1.13, 1.7, 2.27, 2.88].map((y) => (
          <group key={y}>
            <mesh position={[0, y, 0.16]} castShadow receiveShadow>
              <boxGeometry args={[5.65, 0.05, 0.38]} />
              <meshStandardMaterial
                color="#93734f"
                {...wood}
                roughness={0.76}
              />
            </mesh>
            <mesh
              position={[0, y - 0.027, 0.07]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[5.4, 0.035]} />
              <meshBasicMaterial color="#edc68e" />
            </mesh>
          </group>
        ))}
        {[1.38, 1.95, 2.51].flatMap((y, row) =>
          Array.from({ length: 17 }, (_, i) => (
            <group key={`${row}-${i}`} position={[-2.53 + i * 0.316, y, 0.14]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.093, 0.091, 0.28, 16]} />
                <meshPhysicalMaterial
                  color={
                    ["#c39154", "#987b58", "#bd9c59", "#7c8760", "#ad7750"][
                      (i + row) % 5
                    ]
                  }
                  roughness={0.33}
                  clearcoat={0.48}
                />
              </mesh>
              <mesh position={[0, 0.155, 0]}>
                <cylinderGeometry args={[0.094, 0.094, 0.038, 16]} />
                <meshStandardMaterial
                  color="#777159"
                  metalness={0.35}
                  roughness={0.4}
                />
              </mesh>
              <mesh position={[0, 0.005, 0.094]}>
                <planeGeometry args={[0.135, 0.105]} />
                <meshStandardMaterial color="#e6dfc9" roughness={0.85} />
              </mesh>
              <mesh position={[0, 0.005, 0.097]}>
                <planeGeometry args={[0.077, 0.016]} />
                <meshStandardMaterial color="#576648" />
              </mesh>
            </group>
          )),
        )}
      </group>
      {[-1.3, -0.5, 0.3, 1.1, 1.9, 2.7, 3.5].map((x) => (
        <mesh key={x} position={[x, 0.8, -4.905]}>
          <boxGeometry args={[0.018, 0.5, 0.025]} />
          <meshStandardMaterial color="#755e44" />
        </mesh>
      ))}
      <LeafPlant at={[-1.95, 2.92, -5.08]} scale={0.86} />
      <LeafPlant at={[3.9, 2.92, -5.08]} scale={0.75} />
      <group position={[4.28, 2.91, -1.25]}>
        {[-0.57, 0.3, 1.13].map((z) => (
          <group key={z}>
            <mesh position={[0, 0.22, z]} castShadow>
              <boxGeometry args={[0.56, 0.43, 0.66]} />
              <meshStandardMaterial
                color="#d2c0a0"
                roughness={0.95}
                {...wood}
                bumpScale={0.003}
              />
            </mesh>
            <Solid
              at={[-0.289, 0.22, z]}
              size={[0.01, 0.17, 0.32]}
              color="#edf0dd"
            />
            <Solid
              at={[-0.297, 0.22, z]}
              size={[0.01, 0.019, 0.2]}
              color="#7d836b"
            />
          </group>
        ))}
      </group>
      <group position={[-4.2, 2.92, 0.2]}>
        {[-2.4, -1.6, -0.8, 0, 0.8, 1.6, 2.4].map((z, i) => (
          <mesh key={z} position={[0, 0.18, z]} castShadow>
            <boxGeometry args={[0.4, 0.34, 0.3]} />
            <meshStandardMaterial
              color={["#b5996c", "#77846b", "#b68761"][i % 3]}
              roughness={0.91}
            />
          </mesh>
        ))}
      </group>
      <group position={[3.27, 0, -2.88]}>
        <mesh position={[0, 0.73, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.2, 1.4, 18]} />
          <meshStandardMaterial color="#9e8b6b" roughness={0.82} />
        </mesh>
        {Array.from({ length: 5 }, (_, i) => (
          <group key={i}>
            <Solid
              at={[0, 0.24 + i * 0.045, 0]}
              size={[0.43, 0.035, 0.33]}
              color="#596957"
            />
            <Rod
              a={[-0.2, 0.25 + i * 0.045, 0]}
              b={[-0.2, 0.4 + i * 0.045, 0]}
              radius={0.007}
            />
            <Rod
              a={[0.2, 0.25 + i * 0.045, 0]}
              b={[0.2, 0.4 + i * 0.045, 0]}
              radius={0.007}
            />
          </group>
        ))}
      </group>
      <Solid
        at={[1.38, 1.298, -3.07]}
        size={[0.32, 0.018, 0.26]}
        color="#1a2520"
        metal={0.5}
      />
      <Solid
        at={[1.39, 1.31, -3.07]}
        size={[0.16, 0.005, 0.08]}
        color="#b34339"
      />
      <group position={[2.98, 1.3, -3.26]} rotation={[-0.32, 0, 0]}>
        <Solid size={[0.17, 0.055, 0.27]} color="#35433b" />
        <Solid
          at={[0, 0.029, -0.034]}
          size={[0.126, 0.003, 0.1]}
          color="#7b9d8c"
        />
        {[-0.044, 0, 0.044].flatMap((x) =>
          [0.025, 0.06, 0.095].map((z) => (
            <Solid
              key={`${x}-${z}`}
              at={[x, 0.031, z]}
              size={[0.025, 0.008, 0.02]}
              color="#999e8e"
            />
          )),
        )}
      </group>
      <Lettering
        text="FRISCHE AUSWAHL"
        sub="KLEINE PAUSE. GUTER GESCHMACK."
        at={[-1.03, 2.95, -4.79]}
        width={1.7}
        height={0.25}
        background="#64755a"
        color="#f7ebd1"
      />
      {/* The floor and wall joints give the room believable scale. */}
      {[-1, 1].map((side) => (
        <Solid
          key={side}
          at={[side * 4.97, 0.09, -0.13]}
          size={[0.045, 0.18, 10.7]}
          color="#71796a"
        />
      ))}
      {[-2.9, -0.2, 2.5].map((z) => (
        <Solid
          key={z}
          at={[0, 0.001, z]}
          size={[9.8, 0.004, 0.008]}
          color="#b0ae9f"
        />
      ))}
    </group>
  );
}
