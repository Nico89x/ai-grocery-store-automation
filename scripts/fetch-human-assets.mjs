import fs from "node:fs/promises";
import path from "node:path";
import { inflateRawSync } from "node:zlib";
const root = path.resolve("work/makehuman");
await fs.mkdir(root, { recursive: true });
const archive =
  "https://files.makehumancommunity.org/asset_packs/makehuman_system_assets/makehuman_system_assets_cc0.zip";
async function range(start, end) {
  const r = await fetch(archive, {
    headers: { Range: `bytes=${start}-${end}` },
  });
  if (r.status !== 206) throw new Error(`Range unsupported: ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}
const head = await fetch(archive, { method: "HEAD" });
const length = Number(head.headers.get("content-length"));
console.log("Archive bytes", length);
const tail = await range(length - 65536, length - 1);
let eocd = tail.length - 22;
while (eocd >= 0 && tail.readUInt32LE(eocd) !== 0x06054b50) eocd--;
if (eocd < 0) throw new Error("ZIP directory missing");
const cdSize = tail.readUInt32LE(eocd + 12),
  cdOffset = tail.readUInt32LE(eocd + 16),
  directory = await range(cdOffset, cdOffset + cdSize - 1);
const entries = [];
for (let offset = 0; offset < directory.length;) {
  if (directory.readUInt32LE(offset) !== 0x02014b50) break;
  const nameLength = directory.readUInt16LE(offset + 28),
    extra = directory.readUInt16LE(offset + 30),
    comment = directory.readUInt16LE(offset + 32);
  entries.push({
    name: directory.toString("utf8", offset + 46, offset + 46 + nameLength),
    method: directory.readUInt16LE(offset + 10),
    compressed: directory.readUInt32LE(offset + 20),
    offset: directory.readUInt32LE(offset + 42),
  });
  offset += 46 + nameLength + extra + comment;
}
await fs.writeFile(
  path.join(root, "archive-index.json"),
  JSON.stringify(entries, null, 2),
);
const selected = entries.filter(
  (e) =>
    /\/(male_casualsuit05|female_casualsuit01|short02|bob01|shoes01|low-poly)\//.test(
      e.name,
    ) ||
    /eyes\/materials\/brown_eye\.png/.test(e.name) ||
    /skins\/(young_caucasian_male|young_african_male|young_caucasian_female)\//.test(
      e.name,
    ),
);
for (const entry of selected) {
  if (!entry.compressed || entry.name.endsWith("/")) continue;
  const filename = path.resolve(root, entry.name);
  if (!filename.startsWith(root + path.sep))
    throw new Error("Unsafe asset path");
  try {
    await fs.stat(filename);
    continue;
  } catch {}
  await fs.mkdir(path.dirname(filename), { recursive: true });
  const localHeader = await range(entry.offset, entry.offset + 29),
    start =
      entry.offset +
      30 +
      localHeader.readUInt16LE(26) +
      localHeader.readUInt16LE(28);
  const payload = await range(start, start + entry.compressed - 1),
    data = entry.method === 8 ? inflateRawSync(payload) : payload;
  await fs.writeFile(filename, data);
  console.log("Saved", entry.name, data.length);
}
const repository =
  "https://raw.githubusercontent.com/makehumancommunity/makehuman/master/";
for (const file of [
  "makehuman/data/3dobjs/base.obj",
  "makehuman/data/rigs/default.mhskel",
  "makehuman/data/rigs/default_weights.mhw",
  "LICENSE.md",
  "LICENSE.ASSETS.md",
]) {
  const r = await fetch(repository + file);
  if (!r.ok) throw new Error(`${file}: ${r.status}`);
  await fs.writeFile(
    path.join(root, path.basename(file)),
    Buffer.from(await r.arrayBuffer()),
  );
  console.log("Saved", file);
}
