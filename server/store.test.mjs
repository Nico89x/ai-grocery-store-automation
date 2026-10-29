import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { request as httpRequest } from "node:http";
import { openStore } from "./store.mjs";
import { createApp } from "./app.mjs";

const order = (
  key = "request-0001",
  items = [{ productId: "chips", quantity: 1 }],
) => ({ idempotencyKey: key, items });

test("order, stock and replay survive a database restart", async () => {
  const dir = await mkdtemp(join(tmpdir(), "store-test-"));
  let store;
  try {
    const file = join(dir, "store.sqlite");
    store = openStore(file);
    const first = store.placeOrder(order());
    assert.equal(first.order.totalCents, 249);
    assert.equal(
      store.snapshot().products.find((p) => p.id === "chips").stock,
      3,
    );
    store.close();
    store = openStore(file);
    assert.deepEqual(store.placeOrder(order()), {
      order: first.order,
      replayed: true,
    });
    assert.equal(store.snapshot().orderCount, 1);
    assert.equal(
      store.snapshot().products.find((p) => p.id === "chips").stock,
      3,
    );
  } finally {
    store?.close();
    await rm(dir, { recursive: true, force: true });
  }
});
test("normalized line order is idempotent; changed content conflicts", () => {
  const store = openStore();
  try {
    const items = [
      { productId: "chips", quantity: 1 },
      { productId: "water", quantity: 2 },
    ];
    const first = store.placeOrder(order("request-0002", items));
    assert.equal(first.order.totalCents, 427);
    assert.deepEqual(
      store.placeOrder(order("request-0002", [...items].reverse())).order,
      first.order,
    );
    assert.throws(
      () =>
        store.placeOrder(
          order("request-0002", [{ productId: "chips", quantity: 2 }]),
        ),
      { code: "idempotency_conflict" },
    );
    assert.equal(store.snapshot().orderCount, 1);
  } finally {
    store.close();
  }
});
test("insufficient stock rolls back all items and leaves the key retryable", () => {
  const store = openStore();
  try {
    const before = store.snapshot();
    assert.throws(
      () =>
        store.placeOrder(
          order("request-0003", [
            { productId: "water", quantity: 1 },
            { productId: "chips", quantity: 5 },
          ]),
        ),
      { code: "insufficient_stock" },
    );
    assert.deepEqual(store.snapshot(), before);
    store.placeOrder(order("request-0003"));
    store.placeOrder(
      order("request-0004", [{ productId: "chips", quantity: 3 }]),
    );
    assert.throws(() => store.placeOrder(order("request-0005")), {
      code: "insufficient_stock",
    });
    assert.equal(
      store.snapshot().products.find((p) => p.id === "chips").stock,
      0,
    );
  } finally {
    store.close();
  }
});
test("price injection, customer data, malformed quantities and duplicate items are rejected", () => {
  const store = openStore();
  try {
    for (const input of [
      null,
      [],
      {},
      { ...order(), email: "not-accepted@example.test" },
      { ...order(), idempotencyKey: "short" },
      { ...order(), items: [] },
      order("request-0006", [
        { productId: "chips", quantity: 1, unitPrice: 1 },
      ]),
      order("request-0006", [{ productId: "constructor", quantity: 1 }]),
      ...["1", 1.5, -1, 0, 100, NaN, Infinity].map((quantity) =>
        order("request-0006", [{ productId: "chips", quantity }]),
      ),
      order("request-0006", [null]),
      order("request-0006", [
        { productId: "chips", quantity: 1 },
        { productId: "chips", quantity: 1 },
      ]),
    ])
      assert.throws(() => store.placeOrder(input));
    assert.equal(store.snapshot().orderCount, 0);
  } finally {
    store.close();
  }
});
test("two connections cannot oversell a shared database", async () => {
  const dir = await mkdtemp(join(tmpdir(), "store-connections-"));
  const a = openStore(join(dir, "store.sqlite")),
    b = openStore(join(dir, "store.sqlite"));
  try {
    a.placeOrder(order("request-0007", [{ productId: "chips", quantity: 4 }]));
    assert.throws(() => b.placeOrder(order("request-0008")), {
      code: "insufficient_stock",
    });
    assert.equal(b.snapshot().orderCount, 1);
    assert.equal(b.snapshot().products.find((p) => p.id === "chips").stock, 0);
  } finally {
    a.close();
    b.close();
    await rm(dir, { recursive: true, force: true });
  }
});
test("HTTP boundary handles parallel retries, malformed bodies, origin and host", async () => {
  const store = openStore(),
    server = createApp(store);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = "http://127.0.0.1:" + server.address().port;
  const post = (body, extra = {}) =>
    fetch(base + "/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...extra },
      body: typeof body === "string" ? body : JSON.stringify(body),
    });
  const rawPost = (body, headers = {}) =>
    new Promise((resolve, reject) => {
      const request = httpRequest(
        base + "/api/orders",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
        },
        (response) => {
          response.resume();
          response.on("end", () => resolve(response.statusCode));
        },
      );
      request.on("error", reject);
      request.write(body);
      request.end();
    });
  try {
    const responses = await Promise.all([post(order()), post(order())]);
    assert.deepEqual(responses.map((r) => r.status).sort(), [200, 201]);
    assert.deepEqual(
      (await responses[0].json()).order,
      (await responses[1].json()).order,
    );
    assert.equal(
      (await (await fetch(base + "/api/store")).json()).orderCount,
      1,
    );
    assert.equal((await post("{")).status, 400);
    assert.equal((await post("{}" + " ".repeat(9000))).status, 413);
    assert.equal(
      (await post(order("request-0009"), { "Content-Type": "text/plain" }))
        .status,
      415,
    );
    assert.equal(
      (
        await post(order("request-0009"), {
          Origin: "https://untrusted.example",
        })
      ).status,
      403,
    );
    assert.equal(
      (await post(order("request-0009"), { Origin: "null" })).status,
      403,
    );
    assert.equal(
      await rawPost(JSON.stringify(order("request-0009")), {
        Host: "untrusted.example",
      }),
      403,
    );
    assert.equal(await rawPost("{}" + " ".repeat(9000)), 413);
    const home = await fetch(base);
    assert.match(await home.text(), /Persistente Bestell-Demo/);
    assert.match(
      home.headers.get("content-security-policy"),
      /frame-ancestors 'none'/,
    );
    for (const file of ["/client.js", "/styles.css"])
      assert.equal((await fetch(base + file)).status, 200);
    assert.equal((await fetch(base + "/missing")).status, 404);
    assert.equal(store.snapshot().orderCount, 1);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    store.close();
  }
});
