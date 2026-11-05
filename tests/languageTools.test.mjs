import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { languageTools, languages, englishToolNames, alternatesFor } from "../src/data/languageTools.ts";

test("every translated and English page has a route", () => {
  for (const t of languageTools) {
    assert.ok(existsSync(`src/pages/${t.slug}/index.astro`), t.slug);
    assert.ok(existsSync(`src/pages/${t.en}/index.astro`), t.en);
    assert.ok(languages.some((l) => l.code === t.lang), t.lang);
    assert.ok(t.en in englishToolNames, t.en);
  }
  assert.equal(new Set(languageTools.map((t) => t.slug)).size, languageTools.length);
});

test("one primary page per language and English tool", () => {
  const seen = new Set();
  for (const t of languageTools.filter((x) => !x.secondary)) {
    const key = `${t.en}|${t.lang}`;
    assert.ok(!seen.has(key), key);
    seen.add(key);
  }
});

test("every language link on the home directory is in the language map", () => {
  const src = readFileSync("src/data/homeDirectory.ts", "utf8");
  const block = src.slice(src.indexOf('id: "portuguese"'));
  const hrefs = [...block.matchAll(/href: "\/([a-z0-9-]+)\/"/g)].map((m) => m[1]);
  assert.ok(hrefs.length > 30);
  const known = new Set(languageTools.map((t) => t.slug));
  for (const h of hrefs) assert.ok(known.has(h), h);
});

test("hreflang sets are reciprocal and consistent", () => {
  for (const t of languageTools.filter((x) => !x.secondary)) {
    const own = alternatesFor(`/${t.slug}/`);
    const english = alternatesFor(`/${t.en}/`);
    assert.deepEqual(own, english, t.slug);
    assert.ok(own.some((a) => a.hreflang === t.lang && a.href === `/${t.slug}/`));
    assert.ok(own.some((a) => a.hreflang === "en" && a.href === `/${t.en}/`));
    assert.ok(own.some((a) => a.hreflang === "x-default"));
  }
  assert.deepEqual(alternatesFor("/imagem-para-pdf/"), []);
  assert.deepEqual(alternatesFor("/tools/"), []);
});
