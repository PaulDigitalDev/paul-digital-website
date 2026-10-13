import test from "node:test";
import assert from "node:assert/strict";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { layoutPages } from "../src/lib/pdfTextLayout.ts";
import { buildTextDocx } from "../src/lib/textDocx.ts";
import { convertPdfToDocx, extractPages, PdfToWordError } from "../src/lib/pdfToWord.ts";

const frag = (text, x, y, size = 12, extra = {}) => ({ text, x, y, width: text.length * size * 0.5, size, bold: false, italic: false, ...extra });
const page = (fragments) => ({ width: 595, height: 842, fragments });

test("groups lines into paragraphs by gap and detects a heading by size", () => {
  const blocks = layoutPages([
    page([
      frag("Título do documento", 72, 760, 24),
      frag("Primeira linha do parágrafo que continua", 72, 720),
      frag("na segunda linha do mesmo parágrafo.", 72, 706),
      frag("Segundo parágrafo bem separado.", 72, 660),
    ]),
  ]);
  assert.equal(blocks.length, 3);
  assert.equal(blocks[0].kind, "heading");
  assert.equal(blocks[0].level, 1); // 24pt over 12pt body (ratio 2.0)
  assert.equal(blocks[1].kind, "paragraph");
  assert.equal(blocks[1].runs.map((r) => r.text).join(""), "Primeira linha do parágrafo que continua na segunda linha do mesmo parágrafo.");
  assert.equal(blocks[2].runs[0].text, "Segundo parágrafo bem separado.");
});

test("keeps bold and italic runs and spaces words from separate fragments", () => {
  const blocks = layoutPages([
    page([frag("Texto ", 72, 700), frag("negrito", 72 + 36, 700, 12, { bold: true }), frag("itálico", 72 + 36 + 50, 700, 12, { italic: true })]),
  ]);
  const runs = blocks[0].runs;
  assert.deepEqual(runs.map((r) => [r.text.trim(), r.bold, r.italic]), [["Texto", false, false], ["negrito", true, false], ["itálico", false, true]]);
  assert.match(runs.map((r) => r.text).join(""), /Texto negrito itálico/);
});

test("removes a hyphen at a line break and strips XML-invalid characters", () => {
  const blocks = layoutPages([
    page([frag("uma frase longa com uma palavra parti-", 72, 700), frag("da no meio\u0001 da linha longa o suficiente aqui", 72, 686)]),
  ]);
  assert.equal(blocks[0].runs.map((r) => r.text).join(""), "uma frase longa com uma palavra partida no meio da linha longa o suficiente aqui");
});

test("builds a DOCX package with the expected parts and escaped text", async () => {
  const blob = buildTextDocx(
    [
      { kind: "heading", level: 1, runs: [{ text: "Título & <teste>", bold: false, italic: false }] },
      { kind: "paragraph", align: "left", runs: [{ text: "Olá ", bold: false, italic: false }, { text: "mundo", bold: true, italic: true }] },
    ],
    "a4",
    "doc",
  );
  const files = readStoredZip(new Uint8Array(await blob.arrayBuffer()));
  assert.deepEqual(Object.keys(files).sort(), ["[Content_Types].xml", "_rels/.rels", "docProps/core.xml", "word/_rels/document.xml.rels", "word/document.xml", "word/styles.xml"]);
  const xml = files["word/document.xml"];
  assert.match(xml, /Título &amp; &lt;teste&gt;/);
  assert.match(xml, /<w:pStyle w:val="Heading1"\/>/);
  assert.match(xml, /<w:rPr><w:b\/><w:i\/><\/w:rPr><w:t xml:space="preserve">mundo/);
  for (const [name, content] of Object.entries(files)) assert.ok(isBalanced(content), `${name} is not well-formed`);
});

async function textPdf(draw, pages = 1) {
  const doc = await PDFDocument.create();
  const fonts = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
    italic: await doc.embedFont(StandardFonts.HelveticaOblique),
  };
  for (let i = 0; i < pages; i++) draw(doc.addPage([595, 842]), fonts, i);
  return new Uint8Array(await doc.save());
}

test("converts a real text PDF end to end with headings and styles", async () => {
  const bytes = await textPdf((p, f) => {
    p.drawText("Relatorio Anual", { x: 72, y: 760, size: 26, font: f.bold });
    p.drawText("Este paragrafo explica o conteudo", { x: 72, y: 720, size: 12, font: f.regular });
    p.drawText("principal do documento de teste.", { x: 72, y: 706, size: 12, font: f.regular });
    p.drawText("Ênfase em itálico", { x: 72, y: 660, size: 12, font: f.italic });
  });
  const pages = await extractPages(bytes);
  assert.equal(pages.length, 1);
  const result = await convertPdfToDocx(bytes, "relatorio.pdf");
  assert.equal(result.pages, 1);
  assert.equal(result.headings, 1);
  assert.equal(result.paragraphs, 2);
  const xml = readStoredZip(new Uint8Array(await result.blob.arrayBuffer()))["word/document.xml"];
  assert.match(xml, /Relatorio Anual/);
  assert.match(xml, /<w:i\/>/);
  assert.match(xml, /Este paragrafo explica o conteudo principal do documento de teste\./);
});

test("reports a PDF without text as scanned", async () => {
  const bytes = await textPdf(() => {}, 2);
  await assert.rejects(convertPdfToDocx(bytes, "x.pdf"), (e) => e instanceof PdfToWordError && e.code === "no-text");
});

test("rejects non-PDF and corrupt input", async () => {
  await assert.rejects(extractPages(new TextEncoder().encode("hello world")), (e) => e.code === "invalid");
  const good = await textPdf((p, f) => p.drawText("abc", { x: 10, y: 10, size: 12, font: f.regular }));
  const broken = good.slice(0, 40);
  await assert.rejects(extractPages(broken), (e) => e instanceof PdfToWordError && e.code === "corrupt");
});

// Tiny RC4-40 password-protected PDF (user password "secret"), generated once with pypdf.
const ENCRYPTED_PDF = "JVBERi0xLjMKJeLjz9MKMSAwIG9iago8PAovUHJvZHVjZXIgPGFkMjhmZjg1MTY+Cj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovQ291bnQgMQovS2lkcyBbIDQgMCBSIF0KPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDIgMCBSCj4+CmVuZG9iago0IDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9SZXNvdXJjZXMgPDwKPj4KL01lZGlhQm94IFsgMC4wIDAuMCAyMDAgMjAwIF0KL1BhcmVudCAyIDAgUgo+PgplbmRvYmoKNSAwIG9iago8PAovViAxCi9SIDIKL0xlbmd0aCA0MAovUCA0Mjk0OTY3MjkyCi9GaWx0ZXIgL1N0YW5kYXJkCi9PIDxlNWE4ZDI2ODdiZDlkMGNmZjk0NmI3YWM1NWY1MTA4MWRjZjBkMTE2NTU0YzRiZmNiMGE1ZTQ0NmY2OWVhNDhhPgovVSA8ZTg2ZmUxNTJjMDE0NGNjOGYwNzBkZTc0ZTQyZTQ2ZWJkODBkMzA5NWVkOWNkMjkwY2RiMjZlOTY2MzU1MjJlMT4KPj4KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDU5IDAwMDAwIG4gCjAwMDAwMDAxMTggMDAwMDAgbiAKMDAwMDAwMDE2NyAwMDAwMCBuIAowMDAwMDAwMjYxIDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNgovUm9vdCAzIDAgUgovSW5mbyAxIDAgUgovSUQgWyA8MzUzOTYzMzIzMDYyNjI2MTY1NjMzODMyNjUzMTYyMzU2MzM2MzM2MzYxNjI2NTY2MzU2MTY2NjE2NTY2MzEzMT4gPDM1Mzk2MzMyMzA2MjYyNjE2NTYzMzgzMjY1MzE2MjM1NjMzNjMzNjM2MTYyNjU2NjM1NjE2NjYxNjU2NjMxMzE+IF0KL0VuY3J5cHQgNSAwIFIKPj4Kc3RhcnR4cmVmCjQ3NQolJUVPRgo=";

test("rejects password-protected PDFs", async () => {
  const bytes = new Uint8Array(Buffer.from(ENCRYPTED_PDF, "base64"));
  await assert.rejects(extractPages(bytes), (e) => e instanceof PdfToWordError && e.code === "encrypted");
});

/* helpers */
function readStoredZip(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const out = {};
  let offset = 0;
  while (view.getUint32(offset, true) === 0x04034b50) {
    const size = view.getUint32(offset + 18, true);
    const nameLength = view.getUint16(offset + 26, true);
    const name = new TextDecoder().decode(bytes.subarray(offset + 30, offset + 30 + nameLength));
    const start = offset + 30 + nameLength;
    out[name] = new TextDecoder().decode(bytes.subarray(start, start + size));
    offset = start + size;
  }
  return out;
}
function isBalanced(xml) {
  const stack = [];
  for (const m of xml.replace(/<\?[^>]*\?>/g, "").matchAll(/<(\/?)([\w:.-]+)[^>]*?(\/?)>/g)) {
    if (m[3]) continue;
    if (m[1]) {
      if (stack.pop() !== m[2]) return false;
    } else stack.push(m[2]);
  }
  return stack.length === 0;
}
