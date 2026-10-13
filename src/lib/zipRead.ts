/**
 * Minimal ZIP reader for DOCX packages. Uses the browser's built-in DecompressionStream, so it
 * adds no dependency. Guards against oversized or zip-bomb archives before inflating anything.
 */
import { crc32 } from "./zip.ts";

export class ZipError extends Error {
  code: "invalid" | "encrypted" | "unsupported" | "too-large" | "corrupt";
  constructor(code: ZipError["code"], message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

interface Entry {
  name: string;
  method: number;
  crc: number;
  compressedSize: number;
  size: number;
  offset: number;
}

export interface ZipArchive {
  has(name: string): boolean;
  names(): string[];
  read(name: string): Promise<Uint8Array | null>;
}

const MAX_ENTRIES = 5000;

export function isZip(bytes: Uint8Array): boolean {
  return bytes.length > 22 && bytes[0] === 0x50 && bytes[1] === 0x4b && (bytes[2] === 3 || bytes[2] === 5);
}

async function inflateRaw(data: Uint8Array, expected: number): Promise<Uint8Array> {
  if (typeof DecompressionStream === "undefined") throw new ZipError("unsupported", "DecompressionStream unavailable");
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    // Never trust the declared size: stop as soon as the real output exceeds it.
    if (total > expected) {
      await reader.cancel();
      throw new ZipError("corrupt", "entry larger than declared");
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let pos = 0;
  for (const chunk of chunks) {
    out.set(chunk, pos);
    pos += chunk.length;
  }
  return out;
}

/** Opens a ZIP. `maxTotalBytes` caps the sum of declared uncompressed sizes (zip-bomb guard). */
export function openZip(bytes: Uint8Array, maxTotalBytes: number): ZipArchive {
  if (!isZip(bytes)) throw new ZipError("invalid");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let eocd = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 22 - 65535); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new ZipError("corrupt", "no end of central directory");
  const count = view.getUint16(eocd + 10, true);
  const dirSize = view.getUint32(eocd + 12, true);
  const dirOffset = view.getUint32(eocd + 16, true);
  if (count === 0xffff || dirOffset === 0xffffffff) throw new ZipError("unsupported", "ZIP64");
  if (count > MAX_ENTRIES) throw new ZipError("too-large", "too many entries");
  if (dirOffset + dirSize > bytes.length) throw new ZipError("corrupt", "bad central directory");

  const decoder = new TextDecoder("utf-8");
  const entries = new Map<string, Entry>();
  let pos = dirOffset;
  let declaredTotal = 0;
  for (let n = 0; n < count; n++) {
    if (pos + 46 > bytes.length || view.getUint32(pos, true) !== 0x02014b50) throw new ZipError("corrupt", "bad directory entry");
    const flags = view.getUint16(pos + 8, true);
    const nameLength = view.getUint16(pos + 28, true);
    const extraLength = view.getUint16(pos + 30, true);
    const commentLength = view.getUint16(pos + 32, true);
    const entry: Entry = {
      name: decoder.decode(bytes.subarray(pos + 46, pos + 46 + nameLength)),
      method: view.getUint16(pos + 10, true),
      crc: view.getUint32(pos + 16, true),
      compressedSize: view.getUint32(pos + 20, true),
      size: view.getUint32(pos + 24, true),
      offset: view.getUint32(pos + 42, true),
    };
    if (flags & 1) throw new ZipError("encrypted");
    declaredTotal += entry.size;
    if (declaredTotal > maxTotalBytes) throw new ZipError("too-large", "uncompressed content too large");
    entries.set(entry.name, entry);
    pos += 46 + nameLength + extraLength + commentLength;
  }

  return {
    has: (name) => entries.has(name),
    names: () => [...entries.keys()],
    async read(name) {
      const entry = entries.get(name);
      if (!entry) return null;
      const o = entry.offset;
      if (o + 30 > bytes.length || view.getUint32(o, true) !== 0x04034b50) throw new ZipError("corrupt", "bad local header");
      const start = o + 30 + view.getUint16(o + 26, true) + view.getUint16(o + 28, true);
      if (start + entry.compressedSize > bytes.length) throw new ZipError("corrupt", "truncated entry");
      const raw = bytes.subarray(start, start + entry.compressedSize);
      let data: Uint8Array;
      if (entry.method === 0) data = raw.slice();
      else if (entry.method === 8) data = await inflateRaw(raw, entry.size);
      else throw new ZipError("unsupported", `compression method ${entry.method}`);
      if (data.length !== entry.size || crc32(data) !== entry.crc) throw new ZipError("corrupt", "checksum mismatch");
      return data;
    },
  };
}
