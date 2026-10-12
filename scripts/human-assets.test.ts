import { describe, it, expect } from "vitest";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const directory = path.resolve("public/assets/humans");
const names = ["casual-light", "casual-dark", "casual-female"];
function model(name: string) {
  const bytes = readFileSync(path.join(directory, `${name}.glb`));
  expect(bytes.readUInt32LE(0)).toBe(0x46546c67);
  expect(bytes.readUInt32LE(4)).toBe(2);
  expect(bytes.readUInt32LE(8)).toBe(bytes.length);
  const size = bytes.readUInt32LE(12),
    json = JSON.parse(bytes.toString("utf8", 20, 20 + size));
  const bin = bytes.subarray(28 + size);
  return { json, bin };
}
describe("Locally bundled CC0 human models", () => {
  it("contains clothed meshes, a compact independent rig and local textures in all variants", () => {
    for (const name of names) {
      const { json } = model(name);
      expect(json.skins[0].joints).toHaveLength(20);
      expect(json.meshes.map((m: { name: string }) => m.name)).toEqual(
        expect.arrayContaining(["Skin", "Clothing", "Hair", "Eyes", "Shoes"]),
      );
      expect(
        json.meshes.some((m: { name: string }) => /helper|joint/.test(m.name)),
      ).toBe(false);
      for (const image of json.images) {
        expect(image.uri).not.toMatch(/https?:|\.\./);
        expect(existsSync(path.join(directory, image.uri))).toBe(true);
      }
      for (const node of json.nodes.filter(
        (n: { mesh?: number }) => n.mesh !== undefined,
      ))
        expect(node.skin).toBe(0);
    }
    expect(
      readFileSync(path.join(directory, "CC0-LICENSE.txt"), "utf8"),
    ).toContain("CC0");
    // Shared textures + all three geometry variants stay below a 6 MB download budget.
    expect(
      readdirSync(directory).reduce(
        (n, file) => n + statSync(path.join(directory, file)).size,
        0,
      ),
    ).toBeLessThan(6_000_000);
  });
  it("has finite metre-scaled geometry and normalized skinning weights for every UV-split vertex", () => {
    for (const name of names) {
      const { json, bin } = model(name);
      for (const mesh of json.meshes)
        for (const primitive of mesh.primitives) {
          const positions = json.accessors[primitive.attributes.POSITION];
          expect(positions.min[1]).toBeGreaterThan(-0.12);
          expect(positions.max[1]).toBeLessThan(2);
          for (const field of ["POSITION", "NORMAL", "WEIGHTS_0"]) {
            const a = json.accessors[primitive.attributes[field]],
              view = json.bufferViews[a.bufferView],
              data = bin.subarray(
                view.byteOffset,
                view.byteOffset + view.byteLength,
              );
            let finite = true;
            for (let i = 0; i < data.length; i += 4)
              if (!Number.isFinite(data.readFloatLE(i))) finite = false;
            expect(finite, `${name}/${mesh.name}/${field}: finite data`).toBe(
              true,
            );
            if (field === "WEIGHTS_0") {
              let valid = true;
              for (let i = 0; i < data.length; i += 16) {
                let sum = 0;
                for (let k = 0; k < 4; k++) {
                  const value = data.readFloatLE(i + k * 4);
                  if (value < 0) valid = false;
                  sum += value;
                }
                if (Math.abs(sum - 1) > 0.00001) valid = false;
              }
              expect(
                valid,
                `${name}/${mesh.name}: normalized nonnegative weights`,
              ).toBe(true);
            }
          }
          const a = json.accessors[primitive.attributes.JOINTS_0],
            view = json.bufferViews[a.bufferView];
          let valid = true;
          for (
            let i = view.byteOffset;
            i < view.byteOffset + view.byteLength;
            i += 2
          )
            if (bin.readUInt16LE(i) >= 20) valid = false;
          expect(valid, `${name}/${mesh.name}: valid bone indices`).toBe(true);
        }
    }
  });
});
