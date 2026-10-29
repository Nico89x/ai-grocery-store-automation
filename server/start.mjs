import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { openStore } from "./store.mjs";
import { createApp } from "./app.mjs";

const port = Number(process.env.PORT ?? 4180);
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw new Error("PORT must be an integer between 1024 and 65535");
const file = resolve(
  process.env.STORE_DB ??
    fileURLToPath(new URL("../data/store.sqlite", import.meta.url)),
);
await mkdir(dirname(file), { recursive: true });
const store = openStore(file);
const server = createApp(store);
server.on("error", (error) => {
  console.error(error.message);
  store.close();
  process.exitCode = 1;
});
server.listen(port, "127.0.0.1", () => {
  console.log(`Persistent demo: http://127.0.0.1:${port}`);
  console.log(`SQLite database: ${file}`);
});
let stopping = false;
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    if (stopping) return;
    stopping = true;
    server.close(() => store.close());
    server.closeIdleConnections();
  });
