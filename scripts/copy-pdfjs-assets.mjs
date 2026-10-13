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
