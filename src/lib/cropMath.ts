/* Pure geometry for the interactive crop box. All values are pixels of the rotated/flipped image. */

export interface PxRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Which edges a drag handle moves. A corner sets two of them. */
export interface Handle {
  l?: boolean;
  r?: boolean;
  t?: boolean;
  b?: boolean;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function moveRect(r: PxRect, dx: number, dy: number, W: number, H: number): PxRect {
  return { ...r, x: clamp(r.x + dx, 0, Math.max(0, W - r.w)), y: clamp(r.y + dy, 0, Math.max(0, H - r.h)) };
}

/** Moves the handle's edges by (dx, dy). With an aspect ratio (w/h) the box keeps that shape, anchored at the opposite side. */
export function resizeRect(start: PxRect, h: Handle, dx: number, dy: number, W: number, H: number, aspect: number | null, min: number): PxRect {
  const m = Math.min(min, W, H);
  let left = start.x;
  let top = start.y;
  let right = start.x + start.w;
  let bottom = start.y + start.h;
  if (h.l) left = clamp(left + dx, 0, right - m);
  if (h.r) right = clamp(right + dx, left + m, W);
  if (h.t) top = clamp(top + dy, 0, bottom - m);
  if (h.b) bottom = clamp(bottom + dy, top + m, H);
  let w = right - left;
  let hh = bottom - top;
  if (!aspect) return { x: left, y: top, w, h: hh };

  const horizontal = Boolean(h.l || h.r);
  const vertical = Boolean(h.t || h.b);
  let x = start.x;
  let y = start.y;
  if (horizontal && vertical) {
    if (Math.abs(w / start.w - 1) >= Math.abs(hh / start.h - 1)) hh = w / aspect;
    else w = hh * aspect;
    const maxW = h.l ? start.x + start.w : W - start.x;
    const maxH = h.t ? start.y + start.h : H - start.y;
    const f = Math.min(1, maxW / w, maxH / hh);
    w *= f;
    hh *= f;
    x = h.l ? start.x + start.w - w : start.x;
    y = h.t ? start.y + start.h - hh : start.y;
  } else if (horizontal) {
    hh = w / aspect;
    const cy = start.y + start.h / 2;
    const maxH = 2 * Math.min(cy, H - cy);
    if (hh > maxH) {
      hh = maxH;
      w = hh * aspect;
    }
    x = h.l ? start.x + start.w - w : start.x;
    y = cy - hh / 2;
  } else {
    w = hh * aspect;
    const cx = start.x + start.w / 2;
    const maxW = 2 * Math.min(cx, W - cx);
    if (w > maxW) {
      w = maxW;
      hh = w / aspect;
    }
    y = h.t ? start.y + start.h - hh : start.y;
    x = cx - w / 2;
  }
  return { x: clamp(x, 0, W - w), y: clamp(y, 0, H - hh), w, h: hh };
}

/** The box with the requested shape that has about the same area, centred on the old box and kept inside the image. */
export function fitAspectRect(r: PxRect, aspect: number, W: number, H: number): PxRect {
  let w = Math.sqrt(r.w * r.h * aspect);
  let h = w / aspect;
  if (w > W) {
    w = W;
    h = w / aspect;
  }
  if (h > H) {
    h = H;
    w = h * aspect;
  }
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  return { x: clamp(cx - w / 2, 0, W - w), y: clamp(cy - h / 2, 0, H - h), w, h };
}

/** The largest centred box of a given shape, for a fresh image or after a rotation. */
export function largestAspectRect(aspect: number | null, W: number, H: number): PxRect {
  const full = { x: 0, y: 0, w: W, h: H };
  return aspect ? fitAspectRect(full, aspect, W, H) : full;
}
