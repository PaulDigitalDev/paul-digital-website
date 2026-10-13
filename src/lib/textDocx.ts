import { buildZip } from "./zip.ts";
import type { ZipEntry } from "./zip.ts";
import type { Block, Run } from "./pdfTextLayout.ts";

/* Builds a standards-based .docx (Office Open XML) from headings and paragraphs, reusing the project's ZIP writer. */

export type TextDocxPage = "a4" | "letter";

const PAGES: Record<TextDocxPage, { w: number; h: number }> = {
  a4: { w: 11906, h: 16838 },
  letter: { w: 12240, h: 15840 },
};
const MARGIN = 1440; // 1 inch in twips
const XML_HEAD = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`;
const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

const escapeXml = (value: string) => value.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c] as string);

function runXml(run: Run, rtl = false): string {
  if (!run.text) return "";
  const props =
    (rtl ? "<w:rtl/>" : "") +
    (run.bold ? (rtl ? "<w:b/><w:bCs/>" : "<w:b/>") : "") +
    (run.italic ? (rtl ? "<w:i/><w:iCs/>" : "<w:i/>") : "");
  return `<w:r>${props ? `<w:rPr>${props}</w:rPr>` : ""}<w:t xml:space="preserve">${escapeXml(run.text)}</w:t></w:r>`;
}

function blockXml(block: Block): string {
  const rtl = block.rtl === true;
  const runs = block.runs.map((run) => runXml(run, rtl)).join("");
  // Right-to-left paragraphs are marked <w:bidi/> so Word aligns them to the right and orders mixed text correctly.
  const bidi = rtl ? "<w:bidi/>" : "";
  if (block.kind === "heading") return `<w:p><w:pPr><w:pStyle w:val="Heading${block.level}"/>${bidi}</w:pPr>${runs}</w:p>`;
  const jc = block.align === "center" ? `<w:jc w:val="center"/>` : "";
  return `<w:p>${bidi || jc ? `<w:pPr>${bidi}${jc}</w:pPr>` : ""}${runs}</w:p>`;
}

export function buildTextDocx(blocks: Block[], page: TextDocxPage = "a4", title = ""): Blob {
  if (blocks.length === 0) throw new Error("There is no text to write.");
  const encoder = new TextEncoder();
  const size = PAGES[page];

  const documentXml =
    `${XML_HEAD}<w:document xmlns:w="${W_NS}"><w:body>` +
    blocks.map(blockXml).join("") +
    `<w:sectPr><w:pgSz w:w="${size.w}" w:h="${size.h}"/>` +
    `<w:pgMar w:top="${MARGIN}" w:right="${MARGIN}" w:bottom="${MARGIN}" w:left="${MARGIN}" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr>` +
    `</w:body></w:document>`;

  const heading = (level: number, sizeHalfPts: number) =>
    `<w:style w:type="paragraph" w:styleId="Heading${level}"><w:name w:val="heading ${level}"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/>` +
    `<w:pPr><w:keepNext/><w:spacing w:before="${level === 1 ? 360 : 240}" w:after="120"/><w:outlineLvl w:val="${level - 1}"/></w:pPr>` +
    `<w:rPr><w:b/><w:bCs/><w:sz w:val="${sizeHalfPts}"/><w:szCs w:val="${sizeHalfPts}"/></w:rPr></w:style>`;
  const styles =
    `${XML_HEAD}<w:styles xmlns:w="${W_NS}">` +
    `<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Calibri" w:cs="Arial"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:rPrDefault>` +
    `<w:pPrDefault><w:pPr><w:spacing w:after="160" w:line="264" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>` +
    `<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>` +
    heading(1, 36) +
    heading(2, 30) +
    heading(3, 26) +
    `</w:styles>`;

  const contentTypes =
    `${XML_HEAD}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
    `<Default Extension="xml" ContentType="application/xml"/>` +
    `<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>` +
    `<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>` +
    `<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>` +
    `</Types>`;
  const rootRels =
    `${XML_HEAD}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>` +
    `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>` +
    `</Relationships>`;
  const docRels =
    `${XML_HEAD}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
    `</Relationships>`;
  const core =
    `${XML_HEAD}<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" ` +
    `xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">` +
    `<dc:title>${escapeXml(title)}</dc:title><dc:creator>Paul Digital - PDF para Word</dc:creator>` +
    `<dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString().replace(/\.\d+Z$/, "Z")}</dcterms:created></cp:coreProperties>`;

  const entries: ZipEntry[] = [
    { name: "[Content_Types].xml", data: encoder.encode(contentTypes) },
    { name: "_rels/.rels", data: encoder.encode(rootRels) },
    { name: "word/document.xml", data: encoder.encode(documentXml) },
    { name: "word/_rels/document.xml.rels", data: encoder.encode(docRels) },
    { name: "word/styles.xml", data: encoder.encode(styles) },
    { name: "docProps/core.xml", data: encoder.encode(core) },
  ];
  return buildZip(entries, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
}
