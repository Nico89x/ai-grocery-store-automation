import { cp, readdir, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const source = fileURLToPath(new URL("..", import.meta.url));
const destination = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(source, "work/github-checkout");
if (source === destination)
  throw new Error("Source and destination must differ.");
await mkdir(destination, { recursive: true });
const directories = new Set([
  "src",
  "public",
  "scripts",
  "docs",
  "e2e",
  "automation",
  ".github",
]);
for (const item of await readdir(source, { withFileTypes: true })) {
  if (item.isDirectory() && !directories.has(item.name)) continue;
  if (
    item.isFile() &&
    !(
      /\.(md|json|yaml|html|ts)$/.test(item.name) ||
      [
        ".gitignore",
        ".gitattributes",
        ".prettierignore",
        ".env.example",
        "LICENSE",
      ].includes(item.name)
    )
  )
    continue;
  if (item.name.endsWith(".tsbuildinfo")) continue;
  await cp(path.join(source, item.name), path.join(destination, item.name), {
    recursive: true,
  });
}
console.log(`Release source copied to ${destination}`);
