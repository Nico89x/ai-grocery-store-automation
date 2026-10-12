import { chromium, expect } from "@playwright/test";
import { mkdir, copyFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
const target = process.env.DEMO_URL ?? "http://127.0.0.1:4175/";
let preview;
if (!process.env.DEMO_URL) {
  try {
    await fetch(target, { signal: AbortSignal.timeout(1500) });
  } catch {
    preview = spawn(
      process.execPath,
      [
        "node_modules/vite/bin/vite.js",
        "preview",
        "--host",
        "127.0.0.1",
        "--port",
        "4175",
        "--strictPort",
      ],
      { stdio: "ignore", windowsHide: true },
    );
    let ready = false;
    for (let attempt = 0; attempt < 30; attempt++) {
      try {
        if ((await fetch(target, { signal: AbortSignal.timeout(1000) })).ok) {
          ready = true;
          break;
        }
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    if (!ready) {
      preview.kill();
      throw new Error(
        "Lokale Produktionsvorschau konnte nicht gestartet werden.",
      );
    }
  }
}
await mkdir("work/video", { recursive: true });
await mkdir("docs", { recursive: true });
const browser = await chromium.launch({
  channel: "chromium",
  args: ["--enable-unsafe-swiftshader"],
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  recordVideo: { dir: "work/video", size: { width: 1440, height: 1000 } },
});
const page = await context.newPage();
const started = performance.now(),
  chapters = [],
  errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
function chapter(text) {
  chapters.push({ time: (performance.now() - started) / 1000, text });
}
async function showScene() {
  await page.locator(".store-panel").scrollIntoViewIfNeeded();
}
async function purchase(name) {
  await page.getByRole("button", { name: new RegExp(`^${name} –`) }).click();
  await page.getByRole("button", { name: "In Warenkorb", exact: true }).click();
  await page.getByRole("button", { name: /Warenkorb ansehen/ }).click();
  await page
    .getByRole("button", { name: "Demo-Kauf auslösen", exact: true })
    .click();
}
try {
  chapter(
    "AI Grocery Store Automation · Portfolio-Demo – keine echte Bestellung und keine Zahlung.",
  );
  await page.goto(new URL("#/simulation", target).toString());
  await expect(page.locator("canvas")).toBeVisible({ timeout: 45000 });
  await expect(
    page.getByRole("button", { name: "Laden betreten", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".character-loading")).toHaveCount(0, {
    timeout: 45000,
  });
  await showScene();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "docs/store-exterior.png" });
  chapter(
    "Ein modelliertes Geschäft mit belebter Nachbarschaft und lokal geladenen CC0-Charakteren.",
  );
  await page.getByRole("button", { name: "Menschen", exact: true }).click();
  await page.waitForTimeout(1800);
  await page.screenshot({ path: "docs/store-humans.png" });
  await page
    .getByRole("button", { name: "Andere Person ansehen →", exact: true })
    .click();
  await page.waitForTimeout(1400);
  await page.getByRole("button", { name: "Straßenblick", exact: true }).click();
  await page.waitForTimeout(1800);
  await page
    .getByRole("button", { name: "Laden betreten", exact: true })
    .click();
  await page.getByRole("button", { name: "Laden", exact: true }).click();
  await page
    .getByRole("button", { name: "Simulation beschleunigen", exact: true })
    .click();
  chapter(
    "Produkte auswählen, Details ansehen und einen Demo-Warenkorb zusammenstellen.",
  );
  await page.getByRole("button", { name: /^Kesselchips Meersalz –/ }).click();
  await page.waitForTimeout(1800);
  await page.getByRole("button", { name: "In Warenkorb", exact: true }).click();
  await page.getByRole("button", { name: /Warenkorb ansehen/ }).click();
  await page.waitForTimeout(1800);
  chapter(
    "Der Kauf erzeugt eine Bestellung. Chips: 4 → 3. Mindestbestand 4: eine Lagerwarnung.",
  );
  await page
    .getByRole("button", { name: "Demo-Kauf auslösen", exact: true })
    .click();
  await expect(page.locator(".success-note")).toBeVisible({ timeout: 30000 });
  await expect(
    page
      .locator(".inventory-row")
      .filter({ hasText: "Kesselchips" })
      .locator("strong"),
  ).toHaveText("3");
  await expect(page.locator(".event-timeline .event.success")).toHaveCount(6);
  await showScene();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "docs/store-interior.png" });
  await page.screenshot({ path: "public/demo-poster.png" });
  await page.locator(".workflow-panel").scrollIntoViewIfNeeded();
  chapter(
    "Das Workflow-Panel protokolliert Status, Zeitstempel und verständliche Ereignisse.",
  );
  await page.waitForTimeout(2000);
  await page
    .getByLabel("Fehler beim Workflow simulieren", { exact: true })
    .check();
  chapter(
    "Ein absichtlicher Testfehler entsteht nach der Lagerbuchung eines Wasserkaufs.",
  );
  await purchase("Mineralwasser still");
  await expect(
    page.getByRole("button", { name: "Erneut versuchen", exact: true }),
  ).toBeVisible({ timeout: 30000 });
  await page.waitForTimeout(1800);
  chapter(
    "Retry führt nur den fehlgeschlagenen Abschluss erneut aus. Wasser bleibt bei 14 Stück.",
  );
  await page
    .getByRole("button", { name: "Erneut versuchen", exact: true })
    .click();
  await expect(page.locator(".success-note")).toBeVisible();
  await expect(
    page
      .locator(".inventory-row")
      .filter({ hasText: "Mineralwasser" })
      .locator("strong"),
  ).toHaveText("14");
  await page.waitForTimeout(1800);
  chapter(
    "Animierte Kund:innen wählen Produkte und verwenden dieselbe Bestellqueue. Keine echten Käufe.",
  );
  await page.getByRole("button", { name: "Augenhöhe", exact: true }).click();
  await page
    .getByRole("button", { name: "Kund:innen starten", exact: true })
    .click();
  await showScene();
  await page.waitForTimeout(7000);
  expect(errors).toEqual([]);
} finally {
  const duration = (performance.now() - started) / 1000;
  await context.close();
  await copyFile(
    await page.video().path(),
    path.resolve("work/video/demo-source.webm"),
  );
  await browser.close();
  preview?.kill();
  const stamp = (seconds) => {
    const ms = Math.max(0, Math.round(seconds * 1000));
    return `${String(Math.floor(ms / 60000)).padStart(2, "0")}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}.${String(ms % 1000).padStart(3, "0")}`;
  };
  await writeFile(
    "public/demo.vtt",
    "WEBVTT\n\n" +
      chapters
        .map(
          (c, i) =>
            `${stamp(c.time)} --> ${stamp(chapters[i + 1]?.time ?? duration)}\n${c.text}\n`,
        )
        .join("\n"),
  );
  await writeFile(
    "work/video/chapters.json",
    JSON.stringify({ duration, chapters, errors }, null, 2),
  );
}
console.log(
  "Echte Browseraufnahme und aktuelle Screenshots gespeichert; Untertitel aus gemessenen Kapiteln erzeugt.",
);
