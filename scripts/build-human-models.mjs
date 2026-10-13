/** Own OBJ/MHCLO importer and glTF writer. Only CC0 data, no MakeHuman program code. */
import fs from "node:fs/promises";
import path from "node:path";
import { BufferGeometry, BufferAttribute } from "three";

const source = path.resolve("work/makehuman"),
  output = path.resolve("public/assets/humans");
await fs.mkdir(output, { recursive: true });
const read = (p) => fs.readFile(path.join(source, p), "utf8");
function obj(text) {
  const vertices = [],
    uv = [],
    faces = [];
  let group = "";
  for (const line of text.split(/\r?\n/)) {
    const [key, ...values] = line.trim().split(/\s+/);
    if (key === "v") vertices.push(values.map(Number));
    if (key === "vt") uv.push(values.map(Number));
    if (key === "g") group = values.join(" ");
    if (key === "f")
      faces.push({
        group,
        corners: values.map((v) =>
          v
            .split("/")
            .slice(0, 2)
            .map((n) => Number(n) - 1),
        ),
      });
  }
  return { vertices, uv, faces };
}
function mapping(text) {
  const rows = [],
    hidden = new Set();
  let mode = "";
  const scale = {};
  for (const line of text.split(/\r?\n/)) {
    const clean = line.trim();
    if (!clean || clean.startsWith("#")) continue;
    const a = clean.split(/\s+/);
    if (/^[xyz]_scale$/.test(a[0])) scale[a[0][0]] = a.slice(1).map(Number);
    if (a[0] === "verts") {
      mode = "verts";
      continue;
    }
    if (a[0] === "delete_verts") {
      mode = "hidden";
      continue;
    }
    if (!/^\d/.test(clean)) continue;
    if (mode === "verts") rows.push(a.map(Number));
    if (mode === "hidden")
      for (let i = 0; i < a.length; i++) {
        if (a[i + 1] === "-") {
          for (let n = +a[i]; n <= +a[i + 2]; n++) hidden.add(n);
          i += 2;
        } else hidden.add(+a[i]);
      }
  }
  return { rows, hidden, scale };
}
const base = obj(await read("base.obj"));
const rig = JSON.parse(await read("default.mhskel"));
const sourceWeights = JSON.parse(await read("default_weights.mhw")).weights;
// Collapse finger/face/twist bones into their anatomical parent: 20 bones per visitor.
const kept = [
  "root",
  "spine05",
  "spine03",
  "spine01",
  "neck01",
  "head",
  ...["L", "R"].flatMap((s) =>
    [
      "upperarm01",
      "lowerarm01",
      "wrist",
      "upperleg01",
      "lowerleg01",
      "foot",
      "eye",
    ].map((n) => `${n}.${s}`),
  ),
];
const boneIndex = new Map(kept.map((n, i) => [n, i]));
function ancestor(name) {
  while (name && !boneIndex.has(name)) name = rig.bones[name]?.parent;
  return name ?? "root";
}
const weights = base.vertices.map(() => new Map());
for (const [name, entries] of Object.entries(sourceWeights))
  for (const [vertex, weight] of entries) {
    const b = boneIndex.get(ancestor(name));
    weights[vertex].set(b, (weights[vertex].get(b) ?? 0) + weight);
  }
const normalize = (entries) => {
  const list = [...entries]
    .filter(([, w]) => w > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  if (!list.length) list.push([0, 1]);
  const total = list.reduce((n, [, w]) => n + w, 0);
  while (list.length < 4) list.push([0, 0]);
  return [list.map(([b]) => b), list.map(([, w]) => w / total)];
};
const repository =
  "https://raw.githubusercontent.com/makehumancommunity/makehuman/master/makehuman/data/targets/macrodetails/";
async function target(name) {
  const file = path.join(source, `${name}.target`);
  try {
    return await fs.readFile(file, "utf8");
  } catch {
    const r = await fetch(repository + `${name}.target`);
    if (!r.ok) throw new Error(`Target unavailable: ${name}`);
    const text = await r.text();
    await fs.writeFile(file, text);
    return text;
  }
}
const variants = [
  {
    name: "casual-light",
    target: "caucasian-male-young",
    skin: "skin-light.jpg",
    clothes: "male_casualsuit05",
    texture: "jacket.jpg",
    hair: "short02",
    hairTexture: "short-hair.png",
  },
  {
    name: "casual-dark",
    target: "african-male-young",
    skin: "skin-dark.jpg",
    clothes: "male_casualsuit05",
    texture: "jacket.jpg",
    hair: "short02",
    hairTexture: "short-hair.png",
  },
  {
    name: "casual-female",
    target: "caucasian-female-young",
    skin: "skin-female.jpg",
    clothes: "female_casualsuit01",
    texture: "female-tee.jpg",
    hair: "bob01",
    hairTexture: "bob-hair.png",
  },
];
for (const variant of variants) {
  const positions = base.vertices.map((p) => [...p]);
  for (const line of (await target(variant.target)).split(/\r?\n/)) {
    if (!/^\d/.test(line)) continue;
    const [index, ...delta] = line.trim().split(/\s+/).map(Number);
    for (let k = 0; k < 3; k++) positions[index][k] += delta[k];
  }
  const bodyIndices = new Set(
    base.faces
      .filter((f) => f.group === "body")
      .flatMap((f) => f.corners.map((c) => c[0])),
  );
  const floor = Math.min(...[...bodyIndices].map((i) => positions[i][1]));
  const top = Math.max(...[...bodyIndices].map((i) => positions[i][1]));
  const scale = 1.76 / (top - floor);
  const metres = (p) => p.map((v, k) => (v - (k === 1 ? floor : 0)) * scale);
  const average = (joint) =>
    rig.joints[joint].reduce(
      (p, i) => p.map((n, k) => n + positions[i][k] / rig.joints[joint].length),
      [0, 0, 0],
    );
  const bones = kept.map((name) => ({
    name,
    head: metres(average(rig.bones[name].head)),
    parent: rig.bones[name].parent ? ancestor(rig.bones[name].parent) : null,
  }));
  const hidden = new Set(),
    parts = [];
  for (const [folder, name, texture, label] of [
    ["clothes", variant.clothes, variant.texture, "Clothing"],
    ["clothes", "shoes01", "shoes.jpg", "Shoes"],
    ["hair", variant.hair, variant.hairTexture, "Hair"],
    ["eyes", "low-poly", "eyes.jpg", "Eyes"],
  ]) {
    const geometry = obj(await read(`${folder}/${name}/${name}.obj`)),
      map = mapping(await read(`${folder}/${name}/${name}.mhclo`));
    map.hidden.forEach((i) => hidden.add(i));
    const factors = [0, 1, 2].map((axis) => {
      const spec = map.scale["xyz"[axis]];
      return spec
        ? Math.abs(positions[spec[0]][axis] - positions[spec[1]][axis]) /
            spec[2]
        : 1;
    });
    const vertexWeights = map.rows.map((row) => {
      if (row.length === 1) return weights[row[0]];
      const entries = new Map();
      for (let j = 0; j < 3; j++)
        for (const [b, w] of weights[row[j]])
          entries.set(b, (entries.get(b) ?? 0) + Math.max(0, row[3 + j]) * w);
      return entries;
    });
    geometry.vertices = map.rows.map((row) =>
      row.length === 1
        ? metres(positions[row[0]])
        : metres(
            [0, 1, 2].map(
              (k) =>
                positions[row[0]][k] * row[3] +
                positions[row[1]][k] * row[4] +
                positions[row[2]][k] * row[5] +
                row[6 + k] * factors[k],
            ),
          ),
    );
    if (label === "Clothing" && variant.name === "casual-female") {
      // Use our own plain shirt material; no MakeHuman emblem is rendered.
      // Garments are separate connected components; keep the entire shirt hem plain.
      const parent = geometry.vertices.map((_, i) => i);
      const find = (i) => {
        while (parent[i] !== i) {
          parent[i] = parent[parent[i]];
          i = parent[i];
        }
        return i;
      };
      for (const f of geometry.faces)
        for (const [v] of f.corners) parent[find(v)] = find(f.corners[0][0]);
      const highest = geometry.vertices.reduce(
          (best, p, i) => (p[1] > geometry.vertices[best][1] ? i : best),
          0,
        ),
        shirtRoot = find(highest);
      const shirt = (f) => find(f.corners[0][0]) === shirtRoot;
      parts.push({
        geometry: { ...geometry, faces: geometry.faces.filter(shirt) },
        weights: vertexWeights,
        texture: null,
        label: "Top",
      });
      parts.push({
        geometry: {
          ...geometry,
          faces: geometry.faces.filter((f) => !shirt(f)),
        },
        weights: vertexWeights,
        texture,
        label,
      });
    } else parts.push({ geometry, weights: vertexWeights, texture, label });
  }
  // Remove covered body and all authoring helpers. Only clothed bodies are distributed.
  parts.unshift({
    geometry: {
      ...base,
      vertices: positions.map(metres),
      faces: base.faces.filter(
        (f) => f.group === "body" && !f.corners.some(([i]) => hidden.has(i)),
      ),
    },
    weights,
    texture: variant.skin,
    label: "Skin",
  });
  const gltf = {
    asset: {
      version: "2.0",
      generator: "AI Grocery Store: own CC0 asset converter",
      copyright: "MakeHuman CC0; see THIRD_PARTY_ASSETS.md",
    },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ name: "Human", children: [] }],
    skins: [],
    meshes: [],
    materials: [],
    textures: [],
    images: [],
    samplers: [
      { magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497 },
    ],
    buffers: [{ byteLength: 0 }],
    bufferViews: [],
    accessors: [],
  };
  const chunks = [];
  let length = 0;
  function accessor(array, type, count, componentType = 5126, bounds = false) {
    const bytes = Buffer.from(array.buffer, array.byteOffset, array.byteLength),
      padding = (4 - (length % 4)) % 4;
    if (padding) {
      chunks.push(Buffer.alloc(padding));
      length += padding;
    }
    const view =
      gltf.bufferViews.push({
        buffer: 0,
        byteOffset: length,
        byteLength: bytes.length,
      }) - 1;
    chunks.push(bytes);
    length += bytes.length;
    const value = { bufferView: view, componentType, count, type };
    if (bounds) {
      const width = type === "VEC3" ? 3 : 1;
      value.min = Array.from({ length: width }, (_, k) =>
        Math.min(
          ...Array.from({ length: count }, (_, i) => array[i * width + k]),
        ),
      );
      value.max = Array.from({ length: width }, (_, k) =>
        Math.max(
          ...Array.from({ length: count }, (_, i) => array[i * width + k]),
        ),
      );
    }
    return gltf.accessors.push(value) - 1;
  }
  const boneNodes = bones.map(
    (b) =>
      gltf.nodes.push({
        name: b.name.replace(/\./g, "_"),
        translation: b.parent
          ? b.head.map((v, k) => v - bones[boneIndex.get(b.parent)].head[k])
          : b.head,
        children: [],
      }) - 1,
  );
  for (let i = 0; i < bones.length; i++) {
    const b = bones[i];
    gltf.nodes[b.parent ? boneNodes[boneIndex.get(b.parent)] : 0].children.push(
      boneNodes[i],
    );
  }
  const inverse = Float32Array.from(
    bones.flatMap((b) => [
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      -b.head[0],
      -b.head[1],
      -b.head[2],
      1,
    ]),
  );
  gltf.skins.push({
    name: "HumanRig",
    joints: boneNodes,
    skeleton: boneNodes[0],
    inverseBindMatrices: accessor(inverse, "MAT4", bones.length),
  });
  for (const part of parts) {
    const seen = new Map(),
      p = [],
      uv = [],
      joints = [],
      w = [],
      indices = [];
    for (const f of part.geometry.faces) {
      const polygon = [];
      for (const [vi, ti] of f.corners) {
        const key = `${vi}/${ti}`;
        if (!seen.has(key)) {
          seen.set(key, p.length / 3);
          p.push(...part.geometry.vertices[vi]);
          const coord = part.geometry.uv[ti] ?? [0, 0];
          uv.push(coord[0], 1 - coord[1]);
          const [b, weight] = normalize(part.weights[vi]);
          joints.push(...b);
          w.push(...weight);
        }
        polygon.push(seen.get(key));
      }
      for (let i = 1; i < polygon.length - 1; i++)
        indices.push(polygon[0], polygon[i], polygon[i + 1]);
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute(
      "position",
      new BufferAttribute(Float32Array.from(p), 3),
    );
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    let baseColorTexture;
    if (part.texture) {
      const image = gltf.images.push({ uri: part.texture }) - 1,
        texture = gltf.textures.push({ sampler: 0, source: image }) - 1;
      baseColorTexture = { index: texture };
    }
    const mat = {
      name: part.label,
      pbrMetallicRoughness: {
        baseColorTexture,
        metallicFactor: 0,
        roughnessFactor:
          part.label === "Eyes" ? 0.23 : part.label === "Skin" ? 0.65 : 0.9,
      },
      doubleSided: part.label === "Hair",
    };
    if (part.label === "Hair") {
      mat.alphaMode = "MASK";
      mat.alphaCutoff = 0.38;
    }
    const material = gltf.materials.push(mat) - 1;
    const count = p.length / 3;
    const attributes = {
      POSITION: accessor(Float32Array.from(p), "VEC3", count, 5126, true),
      NORMAL: accessor(geometry.getAttribute("normal").array, "VEC3", count),
      TEXCOORD_0: accessor(Float32Array.from(uv), "VEC2", count),
      JOINTS_0: accessor(Uint16Array.from(joints), "VEC4", count, 5123),
      WEIGHTS_0: accessor(Float32Array.from(w), "VEC4", count),
    };
    const mesh =
      gltf.meshes.push({
        name: part.label,
        primitives: [
          {
            attributes,
            indices: accessor(
              Uint32Array.from(indices),
              "SCALAR",
              indices.length,
              5125,
            ),
            material,
          },
        ],
      }) - 1;
    const node = gltf.nodes.push({ name: part.label, mesh, skin: 0 }) - 1;
    gltf.nodes[0].children.push(node);
    geometry.dispose();
    console.log(variant.name, part.label, count, indices.length / 3);
  }
  const pad = (4 - (length % 4)) % 4;
  if (pad) chunks.push(Buffer.alloc(pad));
  length += pad;
  gltf.buffers[0].byteLength = length;
  let json = Buffer.from(JSON.stringify(gltf));
  json = Buffer.concat([json, Buffer.alloc((4 - (json.length % 4)) % 4, 32)]);
  const bin = Buffer.concat(chunks);
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + json.length + 8 + bin.length, 8);
  const jh = Buffer.alloc(8);
  jh.writeUInt32LE(json.length);
  jh.writeUInt32LE(0x4e4f534a, 4);
  const bh = Buffer.alloc(8);
  bh.writeUInt32LE(bin.length);
  bh.writeUInt32LE(0x004e4942, 4);
  await fs.writeFile(
    path.join(output, `${variant.name}.glb`),
    Buffer.concat([header, jh, json, bh, bin]),
  );
}
await fs.copyFile(
  path.join(source, "LICENSE.ASSETS.md"),
  path.join(output, "CC0-LICENSE.txt"),
);
