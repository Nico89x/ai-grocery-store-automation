import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import { products } from "../src/domain/products.ts";

const catalog = new Map(products.map((product) => [product.id, product]));

export class OrderError extends Error {
  constructor(code, status = 422) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

function normalize(input) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new OrderError("invalid_order");
  if (
    Object.keys(input).some((key) => !["idempotencyKey", "items"].includes(key))
  )
    throw new OrderError("unknown_field");
  if (
    typeof input.idempotencyKey !== "string" ||
    !/^[a-zA-Z0-9_-]{8,100}$/.test(input.idempotencyKey)
  )
    throw new OrderError("invalid_idempotency_key");
  if (
    !Array.isArray(input.items) ||
    input.items.length < 1 ||
    input.items.length > products.length
  )
    throw new OrderError("invalid_items");
  const seen = new Set();
  const items = input.items.map((item) => {
    if (
      !item ||
      typeof item !== "object" ||
      Array.isArray(item) ||
      Object.keys(item).some(
        (key) => !["productId", "quantity"].includes(key),
      ) ||
      typeof item.productId !== "string" ||
      !catalog.has(item.productId) ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 99 ||
      seen.has(item.productId)
    )
      throw new OrderError("invalid_item");
    seen.add(item.productId);
    return { productId: item.productId, quantity: item.quantity };
  });
  items.sort((a, b) => a.productId.localeCompare(b.productId, "en"));
  return {
    key: input.idempotencyKey,
    items,
    fingerprint: JSON.stringify(items),
  };
}

export function openStore(filename = ":memory:") {
  const db = new DatabaseSync(filename);
  db.exec(`
    PRAGMA busy_timeout = 2000;
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = FULL;
    CREATE TABLE IF NOT EXISTS inventory (
      product_id TEXT PRIMARY KEY,
      quantity INTEGER NOT NULL CHECK (quantity >= 0)
    ) STRICT;
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      request_key TEXT NOT NULL UNIQUE,
      fingerprint TEXT NOT NULL,
      created_at TEXT NOT NULL,
      receipt TEXT NOT NULL
    ) STRICT;
  `);
  const seed = db.prepare(
    "INSERT OR IGNORE INTO inventory (product_id, quantity) VALUES (?, ?)",
  );
  db.exec("BEGIN IMMEDIATE");
  try {
    for (const product of products) seed.run(product.id, product.initialStock);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    db.close();
    throw error;
  }
  const lookup = db.prepare(
    "SELECT fingerprint, receipt FROM orders WHERE request_key = ?",
  );
  const stock = db.prepare(
    "SELECT quantity FROM inventory WHERE product_id = ?",
  );
  const deduct = db.prepare(
    "UPDATE inventory SET quantity = quantity - ? WHERE product_id = ? AND quantity >= ?",
  );
  const insert = db.prepare(
    "INSERT INTO orders (id, request_key, fingerprint, created_at, receipt) VALUES (?, ?, ?, ?, ?)",
  );
  const recent = db.prepare(
    "SELECT receipt FROM orders ORDER BY rowid DESC LIMIT 20",
  );
  const count = db.prepare("SELECT COUNT(*) AS count FROM orders");
  return {
    placeOrder(input) {
      const normalized = normalize(input);
      db.exec("BEGIN IMMEDIATE");
      try {
        const existing = lookup.get(normalized.key);
        if (existing) {
          if (existing.fingerprint !== normalized.fingerprint)
            throw new OrderError("idempotency_conflict", 409);
          db.exec("COMMIT");
          return { order: JSON.parse(existing.receipt), replayed: true };
        }
        const lines = normalized.items.map(({ productId, quantity }) => {
          const product = catalog.get(productId);
          if (stock.get(productId).quantity < quantity)
            throw new OrderError("insufficient_stock", 409);
          return {
            productId,
            name: product.name,
            quantity,
            unitPrice: product.price,
          };
        });
        for (const line of lines) {
          if (
            deduct.run(line.quantity, line.productId, line.quantity).changes !==
            1
          )
            throw new OrderError("insufficient_stock", 409);
        }
        const order = {
          id: randomUUID(),
          demo: true,
          createdAt: new Date().toISOString(),
          totalCents: lines.reduce(
            (sum, line) => sum + line.quantity * line.unitPrice,
            0,
          ),
          lines,
        };
        insert.run(
          order.id,
          normalized.key,
          normalized.fingerprint,
          order.createdAt,
          JSON.stringify(order),
        );
        db.exec("COMMIT");
        return { order, replayed: false };
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },
    snapshot() {
      return {
        demo: true,
        storage: "sqlite",
        orderCount: count.get().count,
        products: products.map((product) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          minStock: product.minStock,
          stock: stock.get(product.id).quantity,
        })),
        orders: recent.all().map((row) => JSON.parse(row.receipt)),
      };
    },
    close() {
      db.close();
    },
  };
}
