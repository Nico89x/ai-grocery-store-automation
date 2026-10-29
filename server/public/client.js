const form = document.querySelector("#order-form");
const productList = document.querySelector("#products");
const history = document.querySelector("#orders");
const status = document.querySelector("#status");
const submit = document.querySelector("#submit");
const repeat = document.querySelector("#repeat");
const refresh = document.querySelector("#refresh");
const money = (cents) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(
    cents / 100,
  );
let pending = null,
  busy = false,
  uncertain = false;

const messages = {
  insufficient_stock:
    "Der Bestand reicht nicht mehr. Bitte Mengen prüfen und Daten neu laden.",
  idempotency_conflict:
    "Dieser Anfrageschlüssel gehört zu einer anderen Bestellung.",
  invalid_item:
    "Bitte gültige Artikel und ganze Mengen zwischen 1 und 99 auswählen.",
  invalid_items: "Bitte mindestens einen Artikel auswählen.",
};
function element(tag, text) {
  const node = document.createElement(tag);
  node.textContent = text;
  return node;
}
function setBusy(value) {
  busy = value;
  submit.disabled = value || uncertain || !productList.querySelector("input");
  repeat.disabled = value || !pending;
  refresh.disabled = value;
}
async function load() {
  const response = await fetch("/api/store", {
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error("Daten konnten nicht geladen werden.");
  const snapshot = await response.json();
  const chosen = new Map(
    [...productList.querySelectorAll("input")].map((input) => [
      input.dataset.product,
      input.value,
    ]),
  );
  productList.replaceChildren();
  for (const product of snapshot.products) {
    const label = document.createElement("label"),
      info = document.createElement("span");
    label.className = "product";
    info.append(
      element("strong", product.name),
      element(
        "small",
        money(product.price) + " · " + product.stock + " auf Lager",
      ),
    );
    const input = document.createElement("input");
    Object.assign(input, {
      type: "number",
      min: "0",
      max: String(Math.min(99, product.stock)),
      step: "1",
      value: chosen.get(product.id) ?? "0",
      disabled: product.stock === 0,
    });
    input.dataset.product = product.id;
    input.setAttribute("aria-label", "Menge: " + product.name);
    label.append(info, input);
    productList.append(label);
  }
  document.querySelector("#count").textContent =
    snapshot.orderCount + " Bestellung(en) insgesamt";
  history.replaceChildren();
  for (const order of snapshot.orders) {
    const item = document.createElement("li");
    item.append(
      element(
        "strong",
        money(order.totalCents) +
          " · " +
          new Date(order.createdAt).toLocaleString("de-DE"),
      ),
    );
    item.append(
      element(
        "p",
        order.lines.map((line) => line.quantity + " × " + line.name).join(", "),
      ),
    );
    item.append(element("code", order.id));
    history.append(item);
  }
  if (!snapshot.orders.length)
    history.append(element("li", "Noch keine Demo-Bestellung gespeichert."));
}
async function submitOrder(payload) {
  if (busy) return;
  setBusy(true);
  status.textContent = "Anfrage wird geprüft …";
  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
    const result = await response.json();
    if (!response.ok) {
      if (response.status < 500) {
        uncertain = false;
        pending = null;
      } else uncertain = true;
      throw new Error(
        messages[result.error] ??
          "Die Bestellung konnte nicht bestätigt werden.",
      );
    }
    uncertain = false;
    status.textContent = result.replayed
      ? "Bereits gespeichert: derselbe Beleg. Keine weitere Bestandsbuchung."
      : "Demo-Bestellung dauerhaft gespeichert: " +
        money(result.order.totalCents);
    for (const input of productList.querySelectorAll("input"))
      input.value = "0";
    try {
      await load();
    } catch {
      status.textContent +=
        " Die Ansicht konnte nicht aktualisiert werden; bitte Daten neu laden.";
    }
  } catch (error) {
    if (
      error.name === "TimeoutError" ||
      error instanceof TypeError ||
      error instanceof SyntaxError
    ) {
      uncertain = true;
      status.textContent =
        "Keine bestätigte Antwort. Bitte dieselbe Anfrage wiederholen; der Anfrageschlüssel bleibt erhalten.";
    } else status.textContent = error.message;
  } finally {
    setBusy(false);
  }
}
form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (busy || uncertain || !form.reportValidity()) return;
  const items = [...productList.querySelectorAll("input")]
    .filter((input) => !input.disabled && Number(input.value) > 0)
    .map((input) => ({
      productId: input.dataset.product,
      quantity: Number(input.value),
    }));
  if (!items.length) {
    status.textContent = "Bitte mindestens einen Artikel auswählen.";
    return;
  }
  pending = { idempotencyKey: crypto.randomUUID(), items };
  void submitOrder(pending);
});
repeat.addEventListener("click", () => {
  if (pending) void submitOrder(pending);
});
refresh.addEventListener("click", async () => {
  if (busy) return;
  setBusy(true);
  try {
    await load();
    status.textContent = uncertain
      ? "Daten geladen. Eine Anfrage ist noch unbestätigt; bitte dieselbe Anfrage wiederholen."
      : "Gespeicherte Daten neu geladen.";
  } catch {
    status.textContent =
      "Server nicht erreichbar. Bitte lokalen Server prüfen.";
  } finally {
    setBusy(false);
  }
});
setBusy(true);
load()
  .catch(() => {
    status.textContent = "Daten nicht erreichbar. Bitte lokalen Server prüfen.";
  })
  .finally(() => setBusy(false));
