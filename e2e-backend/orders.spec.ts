import { test, expect } from "@playwright/test";

test("save, repeat and reload keep one receipt and one stock deduction", async ({
  page,
}) => {
  await page.goto("/");
  const quantity = page.getByRole("spinbutton", {
    name: "Menge: Kesselchips Meersalz",
  });
  await expect(quantity).toBeEnabled();
  const product = page.locator("label").filter({ has: quantity });
  const before = Number(
    (await product.locator("small").innerText()).match(/(\d+) auf Lager/)![1],
  );
  await quantity.fill("1");
  await page
    .getByRole("button", { name: "Demo-Bestellung speichern", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("dauerhaft gespeichert");
  const receipt = await page.locator("#orders code").first().innerText();
  const count = await page.locator("#count").innerText();
  await expect(product.locator("small")).toContainText(
    before - 1 + " auf Lager",
  );
  await page
    .getByRole("button", { name: "Letzte Anfrage wiederholen", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Keine weitere Bestandsbuchung",
  );
  await expect(page.locator("#count")).toHaveText(count);
  await page.reload();
  await expect(page.locator("#orders code").first()).toHaveText(receipt);
  await expect(product.locator("small")).toContainText(
    before - 1 + " auf Lager",
  );
});

test("mobile layout has no horizontal overflow and empty orders are explained", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const save = page.getByRole("button", {
    name: "Demo-Bestellung speichern",
    exact: true,
  });
  await expect(save).toBeEnabled();
  await save.click();
  await expect(page.getByRole("status")).toContainText(
    "mindestens einen Artikel",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("reloading clears unavailable quantities and keeps valid selections", async ({
  page,
  request,
}) => {
  await page.goto("/");
  const paprika = page.getByRole("spinbutton", {
    name: "Menge: Chips milde Paprika",
  });
  const chocolate = page.getByRole("spinbutton", {
    name: "Menge: Dunkle Schokolade 70 %",
  });
  await expect(paprika).toBeEnabled();
  await expect(chocolate).toBeEnabled();
  const previousMaximum = Number(await paprika.getAttribute("max"));
  expect(previousMaximum).toBeGreaterThan(1);
  await paprika.fill(String(previousMaximum));
  await chocolate.fill("1");

  const adjustment = await request.post("/api/orders", {
    data: {
      idempotencyKey: "qa-stock-refresh",
      items: [{ productId: "paprika", quantity: 1 }],
    },
  });
  expect(adjustment.status()).toBe(201);

  await page.getByRole("button", { name: "Daten neu laden" }).click();
  await expect(paprika).toHaveAttribute("max", String(previousMaximum - 1));
  await expect(paprika).toHaveValue("0");
  await expect(chocolate).toHaveValue("1");
  await expect(page.getByRole("status")).toContainText(
    "Bitte Menge neu wählen: Chips milde Paprika.",
  );

  await page
    .getByRole("button", { name: "Demo-Bestellung speichern", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("dauerhaft gespeichert");
  const newestOrder = page.locator("#orders li").first();
  await expect(newestOrder).toContainText("1 × Dunkle Schokolade 70 %");
  await expect(newestOrder).not.toContainText("Chips milde Paprika");
});
