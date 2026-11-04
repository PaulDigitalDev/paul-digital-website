// Takes design-review screenshots of the built site (served by `astro preview` on :4321).
// Run in CI only: npm i --no-save playwright && npx playwright install --with-deps chromium
// Usage: node scripts/screenshots.mjs <outDir>
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const out = process.argv[2] ?? "screenshots";
fs.mkdirSync(out, { recursive: true });
const base = "http://localhost:4321";
const fixture = path.resolve("scripts/fixture-photo.jpg");

const pages = [
  { name: "home", url: "/" },
  { name: "image-compressor", url: "/image-compressor/", upload: true },
  { name: "compress-50kb", url: "/compress-image-to-50kb/", upload: true },
  { name: "jpg-to-pdf", url: "/jpg-to-pdf/", upload: true },
  { name: "jpg-to-pdf-100kb", url: "/jpg-to-pdf-under-100kb/" },
  { name: "webp-to-jpg", url: "/webp-to-jpg/" },
];
const viewports = [
  { tag: "desktop", width: 1366, height: 900, isMobile: false },
  { tag: "mobile", width: 390, height: 844, isMobile: true },
];

const browser = await chromium.launch();
for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.isMobile ? 2 : 1,
    isMobile: vp.isMobile,
  });
  // Hide the analytics banner so it does not cover the page.
  await context.addInitScript(() => {
    try {
      localStorage.setItem("pd_analytics_consent", "denied");
    } catch {}
  });
  const page = await context.newPage();
  for (const p of pages) {
    await page.goto(base + p.url, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${out}/${p.name}-${vp.tag}-top.png` });
    await page.screenshot({ path: `${out}/${p.name}-${vp.tag}-full.png`, fullPage: true });
    if (p.upload) {
      const input = page.locator('input[type="file"]').first();
      if (await input.count()) {
        await input.setInputFiles(fixture);
        await page.waitForTimeout(1500);
        const action = page.locator("main button.button-primary, main .tool-action").first();
        await page.screenshot({ path: `${out}/${p.name}-${vp.tag}-loaded.png` });
        if (await action.count()) {
          await action.click().catch(() => {});
          await page.waitForTimeout(4000);
          await page.screenshot({ path: `${out}/${p.name}-${vp.tag}-result.png`, fullPage: false });
        }
      }
    }
  }
  await context.close();
}
await browser.close();
console.log("screenshots written to", out);
