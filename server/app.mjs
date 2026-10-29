import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { OrderError } from "./store.mjs";

const root = new URL("./public/", import.meta.url);
const assets = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/client.js", ["client.js", "text/javascript; charset=utf-8"]],
  ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
]);
const limit = 8192;

function send(response, status, value) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(value));
}
function readBody(request) {
  return new Promise((resolve, reject) => {
    let size = 0,
      chunks = [],
      settled = false;
    request.on("data", (chunk) => {
      if (settled) return;
      size += chunk.length;
      if (size > limit) {
        settled = true;
        chunks = [];
        reject(new OrderError("body_too_large", 413));
      } else chunks.push(chunk);
    });
    request.on("end", () => {
      if (settled) return;
      settled = true;
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        reject(new OrderError("invalid_json", 400));
      }
    });
    request.on("error", reject);
    request.on("aborted", () => reject(new OrderError("request_aborted", 400)));
  });
}

export function createApp(store) {
  const server = createServer(async (request, response) => {
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Referrer-Policy", "no-referrer");
    response.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
    );
    try {
      const host = request.headers.host;
      if (host !== `127.0.0.1:${request.socket.localPort}`) {
        request.resume();
        send(response, 403, { error: "invalid_host" });
        return;
      }
      if (
        request.headers.origin &&
        request.headers.origin !== `http://${host}`
      ) {
        request.resume();
        send(response, 403, { error: "cross_origin_request" });
        return;
      }
      const pathname = new URL(request.url, `http://${host}`).pathname;
      if (request.method === "GET" && pathname === "/api/store") {
        send(response, 200, store.snapshot());
      } else if (request.method === "POST" && pathname === "/api/orders") {
        if (
          (request.headers["content-type"] ?? "")
            .split(";")[0]
            .trim()
            .toLowerCase() !== "application/json"
        ) {
          request.resume();
          send(response, 415, { error: "json_required" });
          return;
        }
        if (Number(request.headers["content-length"]) > limit) {
          request.resume();
          throw new OrderError("body_too_large", 413);
        }
        const result = store.placeOrder(await readBody(request));
        send(response, result.replayed ? 200 : 201, result);
      } else if (request.method === "GET" && assets.has(pathname)) {
        const [file, type] = assets.get(pathname);
        const contents = await readFile(new URL(file, root));
        response.writeHead(200, { "Content-Type": type });
        response.end(contents);
      } else {
        request.resume();
        send(response, 404, { error: "not_found" });
      }
    } catch (error) {
      if (response.destroyed) return;
      send(response, error instanceof OrderError ? error.status : 500, {
        error: error instanceof OrderError ? error.code : "internal_error",
      });
    }
  });
  server.requestTimeout = 10000;
  server.headersTimeout = 10000;
  return server;
}
