// Copies the PDF.js worker into public/vendor so PDF para Word runs without a third-party CDN.
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", "vendor", "pdfjs");
mkdirSync(out, { recursive: true });

const source = join(root, "node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs");
if (!existsSync(source)) throw new Error("Missing pdfjs-dist worker. Run npm install first.");
cpSync(source, join(out, "pdf.worker.min.mjs"));
console.log("Copied PDF.js worker to public/vendor/pdfjs");

// Liberation Sans (SIL OFL, shipped with pdfjs-dist) covers Latin and Cyrillic; Word to PDF loads it only for text the standard PDF fonts cannot draw.
const fontOut = join(out, "..", "fonts");
mkdirSync(fontOut, { recursive: true });
for (const name of ["Regular", "Bold", "Italic", "BoldItalic"]) {
  const file = `LiberationSans-${name}.ttf`;
  const fontSource = join(root, "node_modules/pdfjs-dist/standard_fonts", file);
  if (!existsSync(fontSource)) throw new Error(`Missing ${file}. Run npm install first.`);
  cpSync(fontSource, join(fontOut, file));
}
console.log("Copied Liberation Sans fonts to public/vendor/fonts");
