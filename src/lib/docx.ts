import { buildZip } from "./zip";
import type { ZipEntry } from "./zip";

/* Builds a standards-based .docx (Office Open XML) with one image per page. No external library. */

export interface DocxImage {
  bytes: Uint8Array;
  ext: "png" | "jpeg";
  width: number;
  height: number;
  alt: string;
}

export type DocxPage = "a4" | "letter";

const EMU_PER_INCH = 914400;
const PAGES: Record<DocxPage, { w: number; h: number }> = {
  a4: { w: 11906, h: 16838 }, // twips
  letter: { w: 12240, h: 15840 },
};
const MARGIN = 1080; // 0.75 inch in twips

const escapeXml = (value: string) =>
  value.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c] as string);

const fileExt = (image: DocxImage) => (image.ext === "jpeg" ? "jpg" : "png");

export function buildDocx(images: DocxImage[], page: DocxPage): Blob {
  if (images.length === 0) throw new Error("Add at least one image.");
  const encoder = new TextEncoder();
  const base = PAGES[page];
  const entries: ZipEntry[] = [];

  const paragraphs = images.map((image, index) => {
    // Landscape pages for wide images keep them large without shrinking.
    const landscape = image.width > image.height * 1.15;
    const pageW = landscape ? base.h : base.w;
    const pageH = landscape ? base.w : base.h;
    const maxW = ((pageW - MARGIN * 2) / 1440) * EMU_PER_INCH;
    const maxH = ((pageH - MARGIN * 2) / 1440) * EMU_PER_INCH;
    // 96 dpi natural size, shrunk to fit, never enlarged.
    const natural = { w: (image.width / 96) * EMU_PER_INCH, h: (image.height / 96) * EMU_PER_INCH };
    const scale = Math.min(1, maxW / natural.w, maxH / natural.h);
    const cx = Math.max(1, Math.round(natural.w * scale));
    const cy = Math.max(1, Math.round(natural.h * scale));
    const id = index + 1;
    const sect = `<w:sectPr><w:pgSz w:w="${pageW}" w:h="${pageH}"${landscape ? ' w:orient="landscape"' : ""}/><w:pgMar w:top="${MARGIN}" w:right="${MARGIN}" w:bottom="${MARGIN}" w:left="${MARGIN}" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr>`;
    const drawing =
      `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/>` +
      `<wp:docPr id="${id}" name="Picture ${id}" descr="${escapeXml(image.alt)}"/>` +
      `<wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr>` +
      `<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic>` +
      `<pic:nvPicPr><pic:cNvPr id="${id}" name="image${id}.${fileExt(image)}"/><pic:cNvPicPr/></pic:nvPicPr>` +
      `<pic:blipFill><a:blip r:embed="rId${id + 1}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>` +
      `<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>` +
      `</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
    // Each image sits in its own section (one page each); the last section is the body-level sectPr.
    const isLast = index === images.length - 1;
    return { xml: `<w:p><w:pPr><w:spacing w:before="0" w:after="0"/>${isLast ? "" : sect}</w:pPr>${drawing}</w:p>`, sect };
  });

  const bodySect = paragraphs[paragraphs.length - 1].sect;
  const documentXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" ` +
    `xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ` +
    `xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" ` +
    `xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" ` +
    `xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">` +
    `<w:body>${paragraphs.map((p) => p.xml).join("")}${bodySect}</w:body></w:document>`;

  const hasPng = images.some((i) => i.ext === "png");
  const hasJpeg = images.some((i) => i.ext === "jpeg");
  const contentTypes =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
    `<Default Extension="xml" ContentType="application/xml"/>` +
    (hasPng ? `<Default Extension="png" ContentType="image/png"/>` : "") +
    (hasJpeg ? `<Default Extension="jpg" ContentType="image/jpeg"/>` : "") +
    `<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>` +
    `<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>` +
    `</Types>`;

  const rootRels =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>` +
    `</Relationships>`;

  const docRels =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
    images
      .map(
        (image, index) =>
          `<Relationship Id="rId${index + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image${index + 1}.${fileExt(image)}"/>`,
      )
      .join("") +
    `</Relationships>`;

  const styles =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">` +
    `<w:docDefaults><w:rPrDefault><w:rPr><w:sz w:val="22"/></w:rPr></w:rPrDefault></w:docDefaults>` +
    `<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>` +
    `</w:styles>`;

  entries.push({ name: "[Content_Types].xml", data: encoder.encode(contentTypes) });
  entries.push({ name: "_rels/.rels", data: encoder.encode(rootRels) });
  entries.push({ name: "word/document.xml", data: encoder.encode(documentXml) });
  entries.push({ name: "word/_rels/document.xml.rels", data: encoder.encode(docRels) });
  entries.push({ name: "word/styles.xml", data: encoder.encode(styles) });
  images.forEach((image, index) => {
    entries.push({ name: `word/media/image${index + 1}.${fileExt(image)}`, data: image.bytes });
  });

  return buildZip(entries, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
}
