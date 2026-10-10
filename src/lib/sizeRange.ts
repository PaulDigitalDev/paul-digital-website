/* File-size targeting without any DOM dependency, so it can be tested with a fake encoder.
 *
 * Unit: the whole site shows sizes with formatBytes(), which uses 1 KB = 1,024 bytes, so the
 * minimum/maximum fields use the same unit (kbToBytes). */

export const BYTES_PER_KB = 1024;
export const kbToBytes = (kb: number) => Math.round(kb * BYTES_PER_KB);

export const MAX_KB = 100000;

/** Parses a KB field (decimals allowed, e.g. "25.5"). Empty means "not set". Returns bytes or an error message. */
export function parseKb(raw: string, label: "minimum" | "maximum"): { bytes: number | null; error: string } {
  const text = raw.trim();
  if (text === "") return { bytes: null, error: "" };
  const kb = /^[+]?(\d+\.?\d*|\.\d+)$/.test(text) ? Number(text) : NaN;
  const bad = `Enter a ${label} file size in KB greater than 0 and up to ${MAX_KB}, for example 25 or 25.5, or leave it empty.`;
  if (!Number.isFinite(kb) || kb > MAX_KB) return { bytes: null, error: bad };
  const bytes = kbToBytes(kb);
  if (bytes < 1) return { bytes: null, error: bad };
  return { bytes, error: "" };
}

export const MIN_QUALITY = 0.1;
export const MAX_QUALITY = 1;
/** Hard cap on encode calls for one export, so a bad range can never freeze the browser. */
export const MAX_ATTEMPTS = 24;

export type Encode = (quality: number) => Promise<Blob>;

export interface SizedBlob {
  blob: Blob;
  quality: number;
  /** True when the file is at or under the requested maximum. */
  met: boolean;
}

export interface RangedBlob extends SizedBlob {
  /** True when the file is still under the requested minimum. */
  belowMin: boolean;
  /** Number of encode calls used. */
  attempts: number;
}

/** Returns an error message for an unusable range, or "" when it is fine. Values are in bytes; null means "not set". */
export function validateRange(minBytes: number | null, maxBytes: number | null): string {
  if (minBytes !== null && !(Number.isFinite(minBytes) && minBytes >= 1)) return "The minimum file size must be a positive number.";
  if (maxBytes !== null && !(Number.isFinite(maxBytes) && maxBytes >= 1)) return "The maximum file size must be a positive number.";
  if (minBytes !== null && maxBytes !== null && minBytes > maxBytes) return "The minimum file size is larger than the maximum. Check both values.";
  return "";
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Lowers JPEG/WebP quality in steps until the file fits maxBytes. PNG is lossless here, so it cannot be tuned. */
export async function fitWithin(encode: Encode, lossless: boolean, maxBytes: number, startQuality = 0.92): Promise<SizedBlob & { attempts: number }> {
  let quality = startQuality;
  let blob = await encode(quality);
  let attempts = 1;
  if (lossless) return { blob, quality: 1, met: blob.size <= maxBytes, attempts };
  while (blob.size > maxBytes && quality > MIN_QUALITY && attempts < MAX_ATTEMPTS) {
    quality = Math.max(MIN_QUALITY, round2(quality - 0.07));
    blob = await encode(quality);
    attempts++;
  }
  return { blob, quality, met: blob.size <= maxBytes, attempts };
}

/**
 * Fits maxBytes when given (existing behaviour: highest step that fits), then, if the file is under
 * minBytes, searches quality upward (bisection, 0.01 resolution) for a file inside [min, max].
 * Only quality changes: pixel dimensions and image content are never altered to inflate the size.
 * The returned blob is always one that was really encoded, and belowMin/met describe that exact blob.
 */
export async function encodeInRangeWith(
  encode: Encode,
  lossless: boolean,
  minBytes: number | null,
  maxBytes: number | null,
  startQuality = 0.92,
): Promise<RangedBlob> {
  const invalid = validateRange(minBytes, maxBytes);
  if (invalid) throw new Error(invalid);

  let result: SizedBlob;
  let attempts: number;
  if (maxBytes !== null) {
    const fitted = await fitWithin(encode, lossless, maxBytes, startQuality);
    result = fitted;
    attempts = fitted.attempts;
  } else {
    result = { blob: await encode(startQuality), quality: startQuality, met: true };
    attempts = 1;
  }

  if (minBytes !== null && !lossless && result.met && result.blob.size < minBytes) {
    let lo = result.quality; // known: size below the minimum
    let best = result; // largest file seen that is still within the maximum
    let hi = MAX_QUALITY;
    if (lo < MAX_QUALITY && attempts < MAX_ATTEMPTS) {
      const top = await encode(MAX_QUALITY);
      attempts++;
      const topOk = maxBytes === null || top.size <= maxBytes;
      if (topOk) {
        best = { blob: top, quality: MAX_QUALITY, met: true };
      } else {
        // Full quality overshoots the maximum, so the target (if reachable) lies between lo and 1.
        while (hi - lo > 0.011 && attempts < MAX_ATTEMPTS) {
          const mid = round2((lo + hi) / 2);
          if (mid <= lo || mid >= hi) break;
          const blob = await encode(mid);
          attempts++;
          if (maxBytes !== null && blob.size > maxBytes) hi = mid;
          else {
            best = { blob, quality: mid, met: true };
            if (blob.size >= minBytes) {
              break;
            }
            lo = mid;
          }
        }
      }
    }
    result = best;
  }
  return { ...result, belowMin: minBytes !== null && result.blob.size < minBytes, attempts };
}

export type RangeOutcome = "in-range" | "below-min" | "above-max";

export function rangeOutcome(size: number, minBytes: number | null, maxBytes: number | null): RangeOutcome {
  if (maxBytes !== null && size > maxBytes) return "above-max";
  if (minBytes !== null && size < minBytes) return "below-min";
  return "in-range";
}
