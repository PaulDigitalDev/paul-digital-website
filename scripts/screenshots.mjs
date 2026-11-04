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
  { name: "resize-mm", url: "/resize-image-in-mm/", upload: true },
  { name: "photo-35x45", url: "/resize-image-to-35mmx45mm/", upload: true },
  { name: "a4", url: "/resize-image-to-a4-size/", upload: true },
  { name: "reduce-kb", url: "/reduce-image-size-in-kb/", upload: true },
  { name: "signature-50x20", url: "/resize-signature-to-50mmx20mm/" },
];
const viewports = [
  { tag: "desktop", width: 1366, height: 900, isMobile: false },
  { tag: "mobile", width: 390, height: 844, isMobile: true },
];

const browser = await chromium.launch();
// A small two-page PDF for the PDF tools, printed by Chromium itself.
const pdfFixture = path.resolve(out, "fixture.pdf");
{
  const tmp = await browser.newPage();
  await tmp.setContent("<h1>Paul Digital sample</h1><p>Page one.</p><div style='page-break-after:always'></div><h1>Page two</h1><p>More text.</p>");
  await tmp.pdf({ path: pdfFixture });
  await tmp.close();
}
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
  page.on("pageerror", (err) => console.log(`[pageerror ${vp.tag}] ${page.url()} ${err.message}\n${err.stack ?? ""}`));
  page.on("console", (msg) => msg.type() === "error" && console.log(`[console ${vp.tag}] ${page.url()} ${msg.text()}`));
  for (const p of pages) {
    await page.goto(base + p.url, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${out}/${p.name}-${vp.tag}-top.png` });
    await page.screenshot({ path: `${out}/${p.name}-${vp.tag}-full.png`, fullPage: true });
    if (p.upload) {
      const input = page.locator('input[type="file"]').first();
      if (await input.count()) {
        await input.setInputFiles(p.file === "pdf" ? pdfFixture : fixture);
        await page.waitForTimeout(1500);
        const action = page.locator("main .pt-action, main .ic-submit, main button.button-primary").first();
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
