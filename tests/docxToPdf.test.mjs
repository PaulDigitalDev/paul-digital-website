import test from "node:test";
import assert from "node:assert/strict";
import { PDFDocument } from "pdf-lib";
import { convertDocxToPdf, DocxError } from "../src/lib/docxToPdf.ts";
import { docx, zip, png, para, run, table, image, listItem } from "./helpers/docxFixtures.mjs";

const textOf = async (bytes) => {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(bytes), useSystemFonts: false, verbosity: 0 }).promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const content = await (await pdf.getPage(i)).getTextContent();
    pages.push(content.items.map((it) => it.str).join(" "));
  }
  return pages;
};
const fail = (promise, code) =>
  assert.rejects(promise, (e) => e instanceof DocxError && e.code === code, `expected DocxError ${code}`);

test("converts a normal document to a valid PDF with accented text", async () => {
  const file = docx(
    para(run("Informe de ação"), '<w:pStyle w:val="Heading1"/>') +
      para(run("Niño pequeño, ¿cómo estás? ¡Qué canción! Ação, coração, pão, você, über, Ç ") + run("negrita", "<w:b/>") + run(" cursiva", "<w:i/>")) +
      listItem("Primer punto", 1) +
      listItem("Segundo punto", 1) +
      listItem("Viñeta", 2),
  );
  const out = await convertDocxToPdf(file, "informe.docx");
  assert.equal(out.pages, 1);
  assert.equal(new TextDecoder().decode(out.bytes.slice(0, 5)), "%PDF-");
  const reloaded = await PDFDocument.load(out.bytes);
  assert.equal(reloaded.getPageCount(), 1);
  assert.deepEqual(reloaded.getPage(0).getSize(), { width: 595.3, height: 841.9 });
  const [text] = await textOf(out.bytes);
  for (const word of ["Informe de ação", "Niño pequeño", "¿cómo estás?", "¡Qué canción!", "coração", "você", "über", "negrita", "cursiva", "1.", "2.", "Primer punto", "•"])
    assert.ok(text.includes(word), `missing "${word}" in: ${text}`);
  assert.equal(out.replacedChars, 0);
});

test("paginates long text and honours explicit page breaks", async () => {
  const long = Array.from({ length: 120 }, (_, i) => para(run(`Párrafo ${i + 1}: ` + "texto de relleno con acentuación ".repeat(8)))).join("");
  const out = await convertDocxToPdf(docx(long + para('<w:r><w:br w:type="page"/></w:r>') + para(run("Última página"))), "largo.docx");
  assert.ok(out.pages >= 4, `pages=${out.pages}`);
  const pages = await textOf(out.bytes);
  assert.ok(pages.at(-1).includes("Última página"));
  assert.ok(!pages.at(-2).includes("Última página"));
  assert.ok(pages[0].includes("Párrafo 1:"));
});

test("renders tables (with wrapped cell text) and images", async () => {
  const body =
    para(run("Antes")) +
    table(
      [
        ["Nombre", "Descripción"],
        ["Ñandú", "Una celda con bastante texto para que tenga que saltar de línea dentro de la columna estrecha ".repeat(2)],
      ],
      [2000, 3000],
    ) +
    para(image("rId10")) +
    para(run("Después"));
  const out = await convertDocxToPdf(docx(body, { media: { "logo.png": png() } }), "tabla.docx");
  assert.equal(out.tables, 1);
  assert.equal(out.images, 1);
  const [text] = await textOf(out.bytes);
  for (const w of ["Nombre", "Descripción", "Ñandú", "Antes", "Después"]) assert.ok(text.includes(w), w);
  const latin1 = Buffer.from(out.bytes).toString("latin1");
  assert.equal((latin1.match(/\/Subtype\s*\/Image/g) ?? []).length, 1);
});

test("splits tall table rows across pages instead of losing content", async () => {
  const big = Array.from({ length: 90 }, (_, i) => para(run(`línea ${i}`))).join("");
  const out = await convertDocxToPdf(docx(table([["fila", big]], [1500, 5000])), "alta.docx");
  assert.ok(out.pages >= 2);
  const all = (await textOf(out.bytes)).join(" ");
  assert.ok(all.includes("línea 0") && all.includes("línea 89"));
});

test("wraps very long words and flags unsupported characters", async () => {
  const out = await convertDocxToPdf(docx(para(run("x".repeat(400))) + para(run("日本語 emoji 😀 ok"))), "raros.docx");
  assert.ok(out.replacedChars >= 4);
  assert.ok(out.notices.includes("replacedChars"));
  assert.ok(out.pages >= 1);
});

test("uses the section page size and reports unsupported features", async () => {
  const sect = '<w:sectPr><w:pgSz w:w="15840" w:h="12240" w:orient="landscape"/><w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720"/></w:sectPr>';
  const textbox =
    '<w:r><w:drawing><wp:anchor><wp:extent cx="100" cy="100"/><a:graphic><a:graphicData><wps:wsp><w:txbxContent><w:p/></w:txbxContent></wps:wsp></a:graphicData></a:graphic></wp:anchor></w:drawing></w:r>';
  const out = await convertDocxToPdf(
    docx(para(run("Paisaje") + textbox), {
      sect,
      extra: { "word/header1.xml": '<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:r><w:t>Encabezado</w:t></w:r></w:p></w:hdr>' },
    }),
    "p.docx",
  );
  assert.deepEqual((await PDFDocument.load(out.bytes)).getPage(0).getSize(), { width: 792, height: 612 });
  assert.ok(out.notices.includes("headerFooter") && out.notices.includes("textbox"));
});

test("rejects invalid, legacy, corrupt, foreign and empty files", async () => {
  await fail(convertDocxToPdf(new TextEncoder().encode("hola, esto no es un docx"), "a.docx"), "invalid");
  await fail(convertDocxToPdf(new Uint8Array(0), "a.docx"), "invalid");
  await fail(convertDocxToPdf(new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0, 0, 0, 0]), "a.docx"), "legacy");
  await fail(convertDocxToPdf(zip({ "xl/workbook.xml": "<x/>", "[Content_Types].xml": "<x/>" }), "a.docx"), "invalid");
  const good = docx(para(run("Hola")));
  await fail(convertDocxToPdf(good.slice(0, good.length - 40), "a.docx"), "corrupt");
  const flipped = good.slice();
  flipped[Buffer.from(good).indexOf("word/document.xml") + 17 + 12] ^= 0xff; // inside the compressed body
  await assert.rejects(convertDocxToPdf(flipped, "a.docx"), (e) => e instanceof DocxError && e.code === "corrupt");
  await fail(convertDocxToPdf(zip({ "[Content_Types].xml": "<x/>", "word/document.xml": "<w:document><w:body></w:document>" }), "a.docx"), "corrupt");
  await fail(convertDocxToPdf(docx(para("")), "vacio.docx"), "empty");
  await fail(convertDocxToPdf(zip({ "word/document.xml": '<!DOCTYPE x [<!ENTITY a "b">]><w:document xmlns:w="x"><w:body/></w:document>' }), "a.docx"), "corrupt");
});

test("refuses archives whose declared size is a zip bomb", async () => {
  const bytes = docx(para(run("Hola")));
  const view = new DataView(bytes.buffer);
  const dir = view.getUint32(bytes.length - 22 + 16, true);
  view.setUint32(dir + 24, 0x7fffffff, true);
  await fail(convertDocxToPdf(bytes, "bomba.docx"), "too-large");
});

test("makes no network requests while converting", async () => {
  const calls = [];
  const originals = { fetch: globalThis.fetch, xhr: globalThis.XMLHttpRequest, ws: globalThis.WebSocket };
  globalThis.fetch = (...a) => (calls.push(["fetch", a[0]]), Promise.reject(new Error("network blocked")));
  globalThis.XMLHttpRequest = class { constructor() { calls.push(["xhr"]); } };
  globalThis.WebSocket = class { constructor() { calls.push(["ws"]); } };
  try {
    await convertDocxToPdf(docx(para(run("Privado")) + para(image("rId10")), { media: { "a.png": png() } }), "x.docx");
  } finally {
    Object.assign(globalThis, { fetch: originals.fetch, XMLHttpRequest: originals.xhr, WebSocket: originals.ws });
  }
  assert.deepEqual(calls, []);
});

test("draws Cyrillic text with supplied Unicode fonts instead of replacing it", async () => {
  const { readFileSync } = await import("node:fs");
  const dir = "node_modules/pdfjs-dist/standard_fonts/";
  const loadUnicodeFonts = async () =>
    ["Regular", "Bold", "Italic", "BoldItalic"].map((n) => new Uint8Array(readFileSync(`${dir}LiberationSans-${n}.ttf`)));
  const file = docx(para(run("Привет, мир! Договор №5 ") + run("жирный", "<w:b/>")));
  const out = await convertDocxToPdf(file, "dokument.docx", undefined, { loadUnicodeFonts });
  assert.equal(out.replacedChars, 0);
  const [text] = await textOf(out.bytes);
  for (const word of ["Привет, мир!", "Договор", "жирный"]) assert.ok(text.includes(word), `missing "${word}" in: ${text}`);

  // Latin-only documents do not load the fonts at all.
  let loaded = false;
  await convertDocxToPdf(docx(para(run("Hello"))), "a.docx", undefined, { loadUnicodeFonts: async () => ((loaded = true), loadUnicodeFonts()) });
  assert.equal(loaded, false);
  // Without fonts, Cyrillic is still replaced (and reported).
  const plain = await convertDocxToPdf(file, "dokument.docx");
  assert.ok(plain.replacedChars > 0);
});
