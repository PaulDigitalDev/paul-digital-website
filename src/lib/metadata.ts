/* Browser-local metadata reader and remover for JPEG, PNG and WebP.
   Reading decodes common EXIF tags only; anything else is reported as "present, not decoded", never guessed.
   Removal works on the file's container structure (segments / chunks), so the picture data is copied untouched. */

export type MetaFormat = "jpeg" | "png" | "webp";

export interface MetaField {
  group: string;
  label: string;
  value: string;
}

export type Presence = "present" | "absent";

export interface MetaReport {
  format: MetaFormat;
  fields: MetaField[];
  /** Which kinds of metadata container the file holds. */
  exif: Presence;
  xmp: Presence;
  iptc: Presence;
  icc: Presence;
  comments: Presence;
  /** EXIF tags that exist in the file but this viewer does not decode. */
  undecodedExifTags: number;
  hasEmbeddedThumbnail: boolean;
  /** EXIF Orientation (1–8) if present. Removing it can change how some viewers display the picture. */
  orientation?: number;
  notes: string[];
  /** Metadata-like blocks kept or ignored by name, for transparency. */
  otherBlocks: string[];
}

export interface StripResult {
  bytes: Uint8Array;
  removed: string[];
  kept: string[];
}

const enc = (text: string) => Array.from(text, (c) => c.charCodeAt(0));
const ascii = (b: Uint8Array, from: number, to: number) => {
  let s = "";
  for (let i = from; i < Math.min(to, b.length); i++) s += String.fromCharCode(b[i]);
  return s;
};
const startsWith = (b: Uint8Array, at: number, text: string) => {
  const t = enc(text);
  if (at + t.length > b.length) return false;
  return t.every((v, i) => b[at + i] === v);
};
const be32 = (b: Uint8Array, at: number) => ((b[at] << 24) | (b[at + 1] << 16) | (b[at + 2] << 8) | b[at + 3]) >>> 0;
const le32 = (b: Uint8Array, at: number) => (b[at] | (b[at + 1] << 8) | (b[at + 2] << 16) | (b[at + 3] << 24)) >>> 0;

export function detectMetaFormat(b: Uint8Array): MetaFormat | null {
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpeg";
  if (b.length > 8 && b[0] === 0x89 && ascii(b, 1, 4) === "PNG") return "png";
  if (b.length > 12 && ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 12) === "WEBP") return "webp";
  return null;
}

/* ---------------- Container walking ---------------- */

interface Block {
  /** Short name such as "EXIF", "XMP", "ICC", "COM", "APP13". */
  name: string;
  kind: "exif" | "xmp" | "iptc" | "icc" | "comment" | "text" | "time" | "structure" | "other";
  /** Byte range of the whole block in the file. */
  start: number;
  end: number;
  /** Byte range of the payload (EXIF TIFF data, text, ...), where meaningful. */
  dataStart: number;
  dataEnd: number;
}

function walkJpeg(b: Uint8Array): { blocks: Block[]; scanStart: number } {
  const blocks: Block[] = [];
  let i = 2;
  while (i + 4 <= b.length) {
    if (b[i] !== 0xff) break;
    while (i < b.length && b[i] === 0xff) i++; // fill bytes
    const marker = b[i++];
    if (marker === 0xda) return { blocks, scanStart: i - 2 };
    if (marker === 0xd9) break;
    if ((marker >= 0xd0 && marker <= 0xd8) || marker === 0x01) continue;
    if (i + 2 > b.length) break;
    const len = (b[i] << 8) | b[i + 1];
    const start = i - 2;
    const end = Math.min(b.length, i + len);
    const dataStart = i + 2;
    let name = `0x${marker.toString(16).toUpperCase()}`;
    let kind: Block["kind"] = "structure";
    let ds = dataStart;
    if (marker === 0xe1 && startsWith(b, dataStart, "Exif\0\0")) {
      name = "EXIF";
      kind = "exif";
      ds = dataStart + 6;
    } else if (marker === 0xe1 && startsWith(b, dataStart, "http://ns.adobe.com/xap/1.0/\0")) {
      name = "XMP";
      kind = "xmp";
      ds = dataStart + 29;
    } else if (marker === 0xe1) {
      name = "APP1 (other)";
      kind = "other";
    } else if (marker === 0xe2 && startsWith(b, dataStart, "ICC_PROFILE\0")) {
      name = "ICC";
      kind = "icc";
    } else if (marker === 0xed) {
      name = startsWith(b, dataStart, "Photoshop 3.0") ? "IPTC/Photoshop (APP13)" : "APP13";
      kind = "iptc";
    } else if (marker === 0xfe) {
      name = "Comment (COM)";
      kind = "comment";
    } else if (marker >= 0xe0 && marker <= 0xef) {
      const n = marker - 0xe0;
      name = n === 0 ? "JFIF (APP0)" : n === 14 ? "Adobe (APP14)" : `APP${n}`;
      kind = n === 0 || n === 14 ? "structure" : "other";
    }
    blocks.push({ name, kind, start, end, dataStart, dataEnd: end });
    blocks[blocks.length - 1].dataStart = ds;
    i = end;
  }
  return { blocks, scanStart: -1 };
}

const PNG_TEXT = new Set(["tEXt", "zTXt", "iTXt"]);
const PNG_STRUCTURAL = new Set(["IHDR", "PLTE", "IDAT", "IEND", "tRNS", "gAMA", "cHRM", "sRGB", "sBIT", "bKGD", "hIST", "pHYs", "sPLT", "acTL", "fcTL", "fdAT", "cICP", "mDCV", "cLLI"]);

function walkPng(b: Uint8Array): Block[] {
  const blocks: Block[] = [];
  let i = 8;
  while (i + 12 <= b.length) {
    const len = be32(b, i);
    const type = ascii(b, i + 4, i + 8);
    const end = i + 12 + len;
    if (end > b.length) break;
    let kind: Block["kind"] = "other";
    if (PNG_TEXT.has(type)) kind = "text";
    else if (type === "eXIf") kind = "exif";
    else if (type === "tIME") kind = "time";
    else if (type === "iCCP") kind = "icc";
    else if (PNG_STRUCTURAL.has(type)) kind = "structure";
    blocks.push({ name: type, kind, start: i, end, dataStart: i + 8, dataEnd: i + 8 + len });
    i = end;
    if (type === "IEND") break;
  }
  return blocks;
}

function walkWebp(b: Uint8Array): Block[] {
  const blocks: Block[] = [];
  let i = 12;
  while (i + 8 <= b.length) {
    const type = ascii(b, i, i + 4);
    const len = le32(b, i + 4);
    const end = Math.min(b.length, i + 8 + len + (len & 1));
    let kind: Block["kind"] = "structure";
    if (type === "EXIF") kind = "exif";
    else if (type === "XMP ") kind = "xmp";
    else if (type === "ICCP") kind = "icc";
    blocks.push({ name: type.trim(), kind, start: i, end, dataStart: i + 8, dataEnd: Math.min(b.length, i + 8 + len) });
    i = end;
  }
  return blocks;
}

/* ---------------- EXIF ---------------- */

const TYPE_SIZE: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };

interface Entry {
  tag: number;
  type: number;
  count: number;
  /** Absolute offset of the value bytes within the TIFF data. */
  at: number;
}

class Tiff {
  readonly le: boolean;
  constructor(readonly b: Uint8Array, readonly base: number, readonly limit: number) {
    this.le = b[base] === 0x49;
  }
  u16(at: number) {
    return this.le ? this.b[at] | (this.b[at + 1] << 8) : (this.b[at] << 8) | this.b[at + 1];
  }
  u32(at: number) {
    return this.le ? le32(this.b, at) : be32(this.b, at);
  }
  s32(at: number) {
    return this.u32(at) | 0;
  }
  valid(): boolean {
    return this.limit - this.base >= 8 && (this.b[this.base] === 0x49 || this.b[this.base] === 0x4d) && this.u16(this.base + 2) === 42;
  }
  ifd(offset: number): { entries: Entry[]; next: number } | null {
    const at = this.base + offset;
    if (at + 2 > this.limit) return null;
    const n = this.u16(at);
    if (n > 500 || at + 2 + n * 12 > this.limit) return null;
    const entries: Entry[] = [];
    for (let k = 0; k < n; k++) {
      const e = at + 2 + k * 12;
      const type = this.u16(e + 2);
      const count = this.u32(e + 4);
      const size = (TYPE_SIZE[type] ?? 0) * count;
      const valueAt = size <= 4 ? e + 8 : this.base + this.u32(e + 8);
      if (!TYPE_SIZE[type] || valueAt + size > this.limit || valueAt < this.base) {
        entries.push({ tag: this.u16(e), type: 0, count: 0, at: 0 });
        continue;
      }
      entries.push({ tag: this.u16(e), type, count, at: valueAt });
    }
    const nextAt = at + 2 + n * 12;
    return { entries, next: nextAt + 4 <= this.limit ? this.u32(nextAt) : 0 };
  }
  str(e: Entry) {
    return ascii(this.b, e.at, e.at + e.count).replace(/\0.*$/s, "").replace(/[^\x20-\x7e]/g, "").trim();
  }
  num(e: Entry, index = 0): number | null {
    const sz = TYPE_SIZE[e.type];
    if (!sz || index >= e.count) return null;
    const p = e.at + index * sz;
    switch (e.type) {
      case 1:
      case 7:
        return this.b[p];
      case 3:
        return this.u16(p);
      case 4:
        return this.u32(p);
      case 9:
        return this.s32(p);
      case 5: {
        const d = this.u32(p + 4);
        return d ? this.u32(p) / d : null;
      }
      case 10: {
        const d = this.s32(p + 4);
        return d ? this.s32(p) / d : null;
      }
      default:
        return null;
    }
  }
}

const ORIENTATION: Record<number, string> = {
  1: "Normal",
  2: "Mirrored horizontally",
  3: "Rotated 180°",
  4: "Mirrored vertically",
  5: "Mirrored, rotated 90° clockwise",
  6: "Rotated 90° clockwise",
  7: "Mirrored, rotated 90° counter-clockwise",
  8: "Rotated 90° counter-clockwise",
};

const trim = (n: number, digits = 6) => String(Number(n.toFixed(digits)));

function parseExif(b: Uint8Array, start: number, end: number, out: MetaReport) {
  const tiff = new Tiff(b, start, end);
  if (!tiff.valid()) {
    out.notes.push("An EXIF block is present but its structure could not be read, so no EXIF fields are shown.");
    return;
  }
  const ifd0 = tiff.ifd(tiff.u32(start + 4));
  if (!ifd0) {
    out.notes.push("An EXIF block is present but its first directory is damaged, so no EXIF fields are shown.");
    return;
  }
  let total = 0;
  const add = (group: string, label: string, value: string | null | undefined) => {
    if (value == null || value === "") return;
    out.fields.push({ group, label, value });
  };
  const text = (group: string, label: string, e?: Entry) => e && e.type === 2 && add(group, label, tiff.str(e));

  const camera = "Camera";
  const find = (list: Entry[], tag: number) => list.find((e) => e.tag === tag && e.type !== 0);
  const POINTERS = [0x8769, 0x8825, 0xa005];
  // Tags this viewer reads. Everything else in a directory (except pointers to other directories) is counted as present but not decoded.
  const countable = (list: Entry[], known: number[]) => list.filter((e) => !POINTERS.includes(e.tag) && !known.includes(e.tag)).length;
  total += countable(ifd0.entries, [0x010f, 0x0110, 0x0131, 0x013b, 0x8298, 0x010e, 0x0132, 0x0112]);
  text(camera, "Make", find(ifd0.entries, 0x010f));
  text(camera, "Model", find(ifd0.entries, 0x0110));
  text("Software and authorship", "Software", find(ifd0.entries, 0x0131));
  text("Software and authorship", "Artist", find(ifd0.entries, 0x013b));
  text("Software and authorship", "Copyright", find(ifd0.entries, 0x8298));
  text("Software and authorship", "Description", find(ifd0.entries, 0x010e));
  text("Date and time", "Modified", find(ifd0.entries, 0x0132));
  const orient = find(ifd0.entries, 0x0112);
  if (orient) {
    const v = tiff.num(orient);
    if (v != null) {
      out.orientation = v;
      add("Image", "Orientation", `${v} — ${ORIENTATION[v] ?? "unknown value"}`);
    }
  }

  const exifPtr = find(ifd0.entries, 0x8769);
  if (exifPtr) {
    const sub = tiff.ifd(tiff.num(exifPtr) ?? 0);
    if (sub) {
      total += countable(sub.entries, [0x9003, 0x9004, 0x829a, 0x829d, 0x8827, 0x920a, 0xa433, 0xa434, 0xa430, 0xa431, 0xa435, 0xa002, 0xa003]);
      text("Date and time", "Taken", find(sub.entries, 0x9003));
      text("Date and time", "Digitised", find(sub.entries, 0x9004));
      const exp = find(sub.entries, 0x829a);
      const expV = exp && tiff.num(exp);
      if (expV) add("Exposure", "Exposure time", expV >= 1 ? `${trim(expV, 2)} s` : `1/${Math.round(1 / expV)} s`);
      const f = find(sub.entries, 0x829d);
      const fV = f && tiff.num(f);
      if (fV) add("Exposure", "Aperture", `f/${trim(fV, 1)}`);
      const iso = find(sub.entries, 0x8827);
      const isoV = iso && tiff.num(iso);
      if (isoV) add("Exposure", "ISO", String(isoV));
      const fl = find(sub.entries, 0x920a);
      const flV = fl && tiff.num(fl);
      if (flV) add("Exposure", "Focal length", `${trim(flV, 1)} mm`);
      text(camera, "Lens make", find(sub.entries, 0xa433));
      text(camera, "Lens model", find(sub.entries, 0xa434));
      text("Identifying fields", "Camera owner", find(sub.entries, 0xa430));
      text("Identifying fields", "Camera body serial number", find(sub.entries, 0xa431));
      text("Identifying fields", "Lens serial number", find(sub.entries, 0xa435));
      const px = find(sub.entries, 0xa002);
      const py = find(sub.entries, 0xa003);
      const pxV = px && tiff.num(px);
      const pyV = py && tiff.num(py);
      if (pxV && pyV) add("Image", "Dimensions recorded in EXIF", `${pxV} × ${pyV} px`);
    }
  }

  const gpsPtr = find(ifd0.entries, 0x8825);
  if (gpsPtr) {
    const gps = tiff.ifd(tiff.num(gpsPtr) ?? 0);
    if (gps) {
      total += countable(gps.entries, [1, 2, 3, 4, 5, 6, 0x1d]);
      const dms = (tag: number, refTag: number) => {
        const v = find(gps.entries, tag);
        const r = find(gps.entries, refTag);
        if (!v || v.type !== 5 || v.count < 3) return null;
        const d = tiff.num(v, 0);
        const m = tiff.num(v, 1);
        const s = tiff.num(v, 2);
        if (d == null || m == null || s == null) return null;
        const ref = r ? tiff.str(r) : "";
        const sign = ref === "S" || ref === "W" ? -1 : 1;
        return { value: sign * (d + m / 60 + s / 3600), ref };
      };
      const lat = dms(2, 1);
      const lon = dms(4, 3);
      if (lat && lon) add("GPS location", "Coordinates", `${trim(lat.value)}, ${trim(lon.value)}`);
      const alt = find(gps.entries, 6);
      const altV = alt && tiff.num(alt);
      if (altV != null) add("GPS location", "Altitude", `${trim(altV, 1)} m`);
      text("GPS location", "GPS date", find(gps.entries, 0x1d));
      if (!(lat && lon) && gps.entries.length > 0) out.notes.push("A GPS block is present but contains no readable coordinates.");
    }
  }

  // IFD1 holds the embedded thumbnail, which is a second copy of the picture and can outlive edits.
  if (ifd0.next) {
    const ifd1 = tiff.ifd(ifd0.next);
    if (ifd1) {
      if (find(ifd1.entries, 0x0201)) out.hasEmbeddedThumbnail = true;
    }
  }
  out.undecodedExifTags = total;
}

/* ---------------- Reading ---------------- */

const stripNulls = (s: string) => s.replace(/\0/g, "").replace(/[^\x09\x0a\x0d\x20-\x7e -￿]/g, "");

export function readMetadata(b: Uint8Array): MetaReport | null {
  const format = detectMetaFormat(b);
  if (!format) return null;
  const blocks = format === "jpeg" ? walkJpeg(b).blocks : format === "png" ? walkPng(b) : walkWebp(b);
  const has = (kind: Block["kind"]): Presence => (blocks.some((x) => x.kind === kind) ? "present" : "absent");
  const report: MetaReport = {
    format,
    fields: [],
    exif: has("exif"),
    xmp: has("xmp"),
    iptc: has("iptc"),
    icc: has("icc"),
    comments: blocks.some((x) => x.kind === "comment" || x.kind === "text") ? "present" : "absent",
    undecodedExifTags: 0,
    hasEmbeddedThumbnail: false,
    notes: [],
    otherBlocks: [],
  };

  for (const block of blocks) {
    if (block.kind === "exif") {
      let s = block.dataStart;
      if (format !== "jpeg" && startsWith(b, s, "Exif\0\0")) s += 6;
      parseExif(b, s, block.dataEnd, report);
    } else if (block.kind === "comment") {
      const t = stripNulls(ascii(b, block.dataStart, block.dataEnd)).trim();
      if (t) report.fields.push({ group: "Comments", label: "JPEG comment", value: t.slice(0, 500) });
    } else if (block.kind === "text") {
      readPngText(b, block, report);
    } else if (block.kind === "time") {
      if (block.dataEnd - block.dataStart === 7) {
        const y = (b[block.dataStart] << 8) | b[block.dataStart + 1];
        const p = (n: number) => String(b[block.dataStart + n]).padStart(2, "0");
        report.fields.push({ group: "Date and time", label: "PNG last-modified time", value: `${y}-${p(2)}-${p(3)} ${p(4)}:${p(5)}:${p(6)} UTC` });
      }
    } else if (block.kind === "other") {
      report.otherBlocks.push(block.name);
    }
  }
  if (report.xmp === "present") report.notes.push("XMP metadata is present. Its contents are not decoded by this viewer.");
  if (report.iptc === "present") report.notes.push("IPTC/Photoshop metadata is present. Its contents are not decoded by this viewer.");
  if (report.icc === "present") report.notes.push("An ICC colour profile is present. It describes colour, and can name the device or software that made it.");
  if (report.undecodedExifTags > 0) report.notes.push(`${report.undecodedExifTags} further EXIF tag${report.undecodedExifTags === 1 ? "" : "s"} exist but are not decoded here (for example maker notes).`);
  if (report.hasEmbeddedThumbnail) report.notes.push("The EXIF data contains an embedded thumbnail, which is a second small copy of the picture.");
  return report;
}

function readPngText(b: Uint8Array, block: Block, out: MetaReport) {
  const type = block.name;
  const s = block.dataStart;
  const e = block.dataEnd;
  let nul = s;
  while (nul < e && b[nul] !== 0) nul++;
  const keyword = stripNulls(ascii(b, s, nul));
  if (!keyword) return;
  if (type === "tEXt") {
    out.fields.push({ group: "PNG text", label: keyword, value: stripNulls(ascii(b, nul + 1, e)).slice(0, 500) });
  } else if (type === "zTXt") {
    out.fields.push({ group: "PNG text", label: keyword, value: "(compressed text — not decoded)" });
  } else if (type === "iTXt") {
    if (keyword === "XML:com.adobe.xmp") {
      out.xmp = "present";
      return;
    }
    const compressed = b[nul + 1] === 1;
    if (compressed) {
      out.fields.push({ group: "PNG text", label: keyword, value: "(compressed text — not decoded)" });
      return;
    }
    // keyword \0 flag method language \0 translated-keyword \0 text
    let p = nul + 3;
    while (p < e && b[p] !== 0) p++;
    p++;
    while (p < e && b[p] !== 0) p++;
    p++;
    const text = new TextDecoder("utf-8", { fatal: false }).decode(b.subarray(Math.min(p, e), e));
    out.fields.push({ group: "PNG text", label: keyword, value: stripNulls(text).slice(0, 500) });
  }
}

/* ---------------- Removal ---------------- */

export interface StripOptions {
  keepIcc: boolean;
}

export function stripMetadata(b: Uint8Array, options: StripOptions): StripResult | null {
  const format = detectMetaFormat(b);
  if (!format) return null;
  const removed: string[] = [];
  const kept: string[] = [];
  const parts: Uint8Array[] = [];
  const note = (list: string[], name: string) => {
    if (!list.includes(name)) list.push(name);
  };

  if (format === "jpeg") {
    const { blocks, scanStart } = walkJpeg(b);
    if (scanStart < 0) return null;
    parts.push(b.subarray(0, 2));
    for (const block of blocks) {
      const drop = block.kind === "exif" || block.kind === "xmp" || block.kind === "iptc" || block.kind === "comment" || block.kind === "other" || (block.kind === "icc" && !options.keepIcc);
      if (drop) note(removed, block.name);
      else {
        parts.push(b.subarray(block.start, block.end));
        if (block.kind === "icc") note(kept, "ICC colour profile");
      }
    }
    // Everything from the scan header to the end-of-image marker; anything after EOI (appended data) is dropped.
    let eoi = b.length;
    for (let i = scanStart + 2; i + 1 < b.length; i++) {
      if (b[i] === 0xff && b[i + 1] === 0xd9) {
        eoi = i + 2;
        break;
      }
    }
    if (eoi < b.length) note(removed, `${b.length - eoi} bytes of data after the end of the image`);
    parts.push(b.subarray(scanStart, eoi));
  } else if (format === "png") {
    parts.push(b.subarray(0, 8));
    for (const block of walkPng(b)) {
      const drop = block.kind === "text" || block.kind === "exif" || block.kind === "time" || (block.kind === "icc" && !options.keepIcc);
      if (drop) note(removed, block.name);
      else {
        parts.push(b.subarray(block.start, block.end));
        if (block.kind === "icc") note(kept, "ICC colour profile (iCCP)");
        if (block.kind === "other") note(kept, `${block.name} chunk (not recognised as metadata)`);
      }
    }
  } else {
    const blocks = walkWebp(b);
    const body: Uint8Array[] = [];
    for (const block of blocks) {
      const drop = block.kind === "exif" || block.kind === "xmp" || (block.kind === "icc" && !options.keepIcc);
      if (drop) {
        note(removed, block.name);
        continue;
      }
      let chunk = b.subarray(block.start, block.end);
      if (block.name === "VP8X" && chunk.length >= 18) {
        chunk = chunk.slice();
        let flags = chunk[8];
        flags &= ~0x08; // EXIF
        flags &= ~0x04; // XMP
        if (!options.keepIcc) flags &= ~0x20;
        chunk[8] = flags;
      }
      if (block.kind === "icc") note(kept, "ICC colour profile");
      body.push(chunk);
    }
    const size = 4 + body.reduce((n, p) => n + p.length, 0);
    const header = new Uint8Array(12);
    header.set(enc("RIFF"), 0);
    new DataView(header.buffer).setUint32(4, size, true);
    header.set(enc("WEBP"), 8);
    parts.push(header, ...body);
  }

  const total = parts.reduce((n, p) => n + p.length, 0);
  const bytes = new Uint8Array(total);
  let at = 0;
  for (const p of parts) {
    bytes.set(p, at);
    at += p.length;
  }
  return { bytes, removed, kept };
}

/* ---------------- Verification ---------------- */

const SIGNATURES: [string, string][] = [
  ["Exif\0\0", "an EXIF header"],
  ["http://ns.adobe.com/xap", "an XMP packet"],
  ["Photoshop 3.0", "an IPTC/Photoshop block"],
  ["XML:com.adobe.xmp", "an XMP text chunk"],
];

/** Re-reads the stripped bytes and searches them for leftover metadata markers. Returns a list of problems (empty = verified). */
export function verifyStripped(bytes: Uint8Array, options: StripOptions): string[] {
  const problems: string[] = [];
  const report = readMetadata(bytes);
  if (!report) return ["The output is not a recognisable JPEG, PNG or WebP file."];
  if (report.exif === "present") problems.push("an EXIF block");
  if (report.xmp === "present") problems.push("an XMP block");
  if (report.iptc === "present") problems.push("an IPTC block");
  if (report.comments === "present") problems.push("a comment or text block");
  if (!options.keepIcc && report.icc === "present") problems.push("an ICC profile");
  if (report.fields.length > 0) problems.push("readable metadata fields");
  const text = new TextDecoder("latin1").decode(bytes);
  for (const [needle, label] of SIGNATURES) if (text.includes(needle) && !problems.includes(label)) problems.push(label);
  return problems;
}
