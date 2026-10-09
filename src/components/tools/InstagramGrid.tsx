import { useEffect, useMemo, useRef, useState } from "react";
import type { SocialTool } from "../../data/socialTools";
import { EXT, canvasToBlob, drawScene, makePreviewSource, releaseCanvas, supportsBlur, verifyExport } from "../../lib/canvasLayout";
import type { BgKind, ExportFormat } from "../../lib/canvasLayout";
import { KIND_LABEL, MAX_FILE_BYTES, MAX_PIXELS, baseName, decodeImage, formatBytes, sniffKind } from "../../lib/imageFormats";
import { DropArea, ResultPanel, StatusArea, ZipButton, makeOutput } from "./shared";
import type { OutputFile } from "./shared";

/* Splits one image into cols×rows tiles. The grid is drawn once, then sliced, so tile edges line up exactly. */

const ACCEPT = ".jpg,.jpeg,.jfif,.png,.webp,.avif,.heic,.heif,.gif,.bmp,image/*";
const TILE_W = 1080;
const MAX_COLS = 6;
const MAX_ROWS = 10;
const MAX_TILES = 30;

const SHAPES = [
  { id: "square", label: "Square 1:1 — 1080×1080", h: 1080 },
  { id: "portrait", label: "Portrait 4:5 — 1080×1350", h: 1350 },
  { id: "landscape", label: "Landscape 1.91:1 — 1080×566", h: 566 },
] as const;
const GRID_PRESETS = [
  { id: "3x1", label: "3 × 1", cols: 3, rows: 1 },
  { id: "3x2", label: "3 × 2", cols: 3, rows: 2 },
  { id: "3x3", label: "3 × 3", cols: 3, rows: 3 },
  { id: "3x4", label: "3 × 4", cols: 3, rows: 4 },
  { id: "2x1", label: "2 × 1", cols: 2, rows: 1 },
  { id: "custom", label: "Custom", cols: 0, rows: 0 },
] as const;

interface Tile extends OutputFile {
  row: number;
  col: number;
  index: number;
  post: number;
  previewUrl: string;
}
interface Made {
  tiles: Tile[];
  w: number;
  h: number;
  tileW: number;
  tileH: number;
  format: ExportFormat;
  notes: string[];
}

export default function InstagramGrid({ tool }: { tool: SocialTool }) {
  const blurOk = useMemo(() => (typeof document === "undefined" ? false : supportsBlur()), []);
  const [file, setFile] = useState<File | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [preset, setPreset] = useState("3x3");
  const [customCols, setCustomCols] = useState("3");
  const [customRows, setCustomRows] = useState("3");
  const [shape, setShape] = useState<(typeof SHAPES)[number]["id"]>("square");
  const [mode, setMode] = useState<"cover" | "contain">("cover");
  const [focusX, setFocusX] = useState(0);
  const [focusY, setFocusY] = useState(0);
  const [bg, setBg] = useState<BgKind>("white");
  const [color, setColor] = useState("#ffffff");
  const [format, setFormat] = useState<ExportFormat>("jpeg");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [made, setMade] = useState<Made | null>(null);

  const bitmapRef = useRef<ImageBitmap | null>(null);
  const previewSrcRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const madeRef = useRef<Made | null>(null);

  const freeMade = () => {
    madeRef.current?.tiles.forEach((tile) => {
      URL.revokeObjectURL(tile.url);
      URL.revokeObjectURL(tile.previewUrl);
    });
    madeRef.current = null;
    setMade(null);
  };
  const releaseImage = () => {
    bitmapRef.current?.close();
    bitmapRef.current = null;
    releaseCanvas(previewSrcRef.current);
    previewSrcRef.current = null;
  };
  useEffect(
    () => () => {
      madeRef.current?.tiles.forEach((tile) => {
        URL.revokeObjectURL(tile.url);
        URL.revokeObjectURL(tile.previewUrl);
      });
      bitmapRef.current?.close();
      releaseCanvas(previewSrcRef.current);
    },
    [],
  );

  const grid = useMemo(() => {
    const p = GRID_PRESETS.find((item) => item.id === preset)!;
    const cols = p.id === "custom" ? Number(customCols) : p.cols;
    const rows = p.id === "custom" ? Number(customRows) : p.rows;
    let error = "";
    if (!Number.isInteger(cols) || !Number.isInteger(rows) || cols < 1 || rows < 1) error = "Enter whole numbers of at least 1 for columns and rows.";
    else if (cols > MAX_COLS || rows > MAX_ROWS) error = `Use at most ${MAX_COLS} columns and ${MAX_ROWS} rows.`;
    else if (cols * rows > MAX_TILES) error = `Use at most ${MAX_TILES} tiles in total.`;
    else if (cols * rows < 2) error = "A grid needs at least 2 tiles.";
    return { cols, rows, error };
  }, [preset, customCols, customRows]);

  const tileH = SHAPES.find((item) => item.id === shape)!.h;
  const gridW = grid.cols * TILE_W;
  const gridH = grid.rows * tileH;

  const scene = () => ({
    bg,
    color,
    placement: { fit: mode, zoom: 100, offX: mode === "cover" ? focusX : 0, offY: mode === "cover" ? focusY : 0, padding: 0 },
  });

  /* Cover mode: focus sliders move the photo within the grid; clamp so the grid stays fully covered. */
  const previewSize = useMemo(() => {
    if (grid.error) return null;
    const k = Math.min(1, 640 / gridW, 640 / gridH);
    return { w: Math.max(1, Math.round(gridW * k)), h: Math.max(1, Math.round(gridH * k)) };
  }, [grid.error, gridW, gridH]);

  const coverRange = useMemo(() => {
    if (!dims || grid.error) return { x: 0, y: 0 };
    const s = Math.max(gridW / dims.w, gridH / dims.h);
    return { x: Math.floor(((dims.w * s - gridW) / 2 / gridW) * 100), y: Math.floor(((dims.h * s - gridH) / 2 / gridH) * 100) };
  }, [dims, gridW, gridH, grid.error]);
  const fx = Math.max(-coverRange.x, Math.min(coverRange.x, focusX));
  const fy = Math.max(-coverRange.y, Math.min(coverRange.y, focusY));

  useEffect(() => {
    const canvas = canvasRef.current;
    const src = previewSrcRef.current;
    if (!canvas || !src || !previewSize) return;
    const sc = scene();
    sc.placement.offX = mode === "cover" ? fx : 0;
    sc.placement.offY = mode === "cover" ? fy : 0;
    try {
      drawScene(canvas, src, previewSize.w, previewSize.h, sc);
    } catch {
      /* reported on export */
    }
  });

  const onFiles = async (incoming: File[]) => {
    const next = incoming[0];
    if (!next || busy) return;
    freeMade();
    setStatus("");
    if (next.size === 0) return setErrors([`${next.name}: the file is empty.`]);
    if (next.size > MAX_FILE_BYTES) return setErrors([`${next.name}: ${formatBytes(next.size)} is over the ${formatBytes(MAX_FILE_BYTES)} limit.`]);
    const kind = await sniffKind(next);
    if (kind === "unknown") return setErrors([`${next.name}: this is not a recognised image format. Use JPG, PNG, WebP, AVIF, HEIC, GIF or BMP.`]);
    setBusy(true);
    setProgress("Reading the image…");
    try {
      const bitmap = await decodeImage(next, kind);
      if (bitmap.width * bitmap.height > MAX_PIXELS) {
        bitmap.close();
        throw new Error(`${next.name} is too large to process safely.`);
      }
      releaseImage();
      bitmapRef.current = bitmap;
      previewSrcRef.current = makePreviewSource(bitmap);
      setDims({ w: bitmap.width, h: bitmap.height });
      setFile(next);
      setFocusX(0);
      setFocusY(0);
      setErrors([]);
      setStatus(`${next.name} added (${KIND_LABEL[kind]}, ${bitmap.width}×${bitmap.height}).`);
    } catch (caught) {
      setErrors([caught instanceof Error && caught.message ? caught.message : "The image could not be read."]);
    } finally {
      setBusy(false);
      setProgress("");
    }
  };

  const reset = () => {
    freeMade();
    releaseImage();
    setFile(null);
    setDims(null);
    setErrors([]);
    setStatus("");
  };

  const run = async () => {
    const bitmap = bitmapRef.current;
    if (!file || !bitmap) return setErrors(["Add an image first."]);
    if (grid.error) return setErrors([grid.error]);
    setErrors([]);
    freeMade();
    setBusy(true);
    const full = document.createElement("canvas");
    const tileCanvas = document.createElement("canvas");
    const created: Tile[] = [];
    try {
      setProgress("Drawing the grid…");
      const sc = scene();
      sc.placement.offX = mode === "cover" ? fx : 0;
      sc.placement.offY = mode === "cover" ? fy : 0;
      const layout = drawScene(full, bitmap, gridW, gridH, sc);
      const stem = baseName(file.name);
      const pad = String(grid.cols * grid.rows).length;
      const total = grid.cols * grid.rows;

      tileCanvas.width = TILE_W;
      tileCanvas.height = tileH;
      const tctx = tileCanvas.getContext("2d");
      if (!tctx) throw new Error("Your browser could not create a drawing surface.");

      for (let row = 0; row < grid.rows; row++) {
        for (let col = 0; col < grid.cols; col++) {
          const index = row * grid.cols + col + 1;
          setProgress(`Creating tile ${index} of ${total}…`);
          tctx.clearRect(0, 0, TILE_W, tileH);
          // Slicing the single rendered grid guarantees neighbouring tiles share an exact edge.
          tctx.drawImage(full, col * TILE_W, row * tileH, TILE_W, tileH, 0, 0, TILE_W, tileH);
          const blob = await canvasToBlob(tileCanvas, format, 0.92);
          await verifyExport(blob, format, TILE_W, tileH);
          const name = `${stem}-tile-${String(index).padStart(pad, "0")}-r${row + 1}c${col + 1}.${EXT[format]}`;
          const out = makeOutput(name, blob);
          created.push({ ...out, row, col, index, post: total - index + 1, previewUrl: URL.createObjectURL(blob) });
        }
      }

      const notes = [
        "Tiles are numbered in reading order. To build the picture on a profile, post them in reverse: the last tile first and tile 1 last.",
        "Instagram changes how it crops profile-grid thumbnails, so alignment on your profile is not guaranteed in every app version or layout.",
      ];
      if (mode === "cover" && layout.overflow) notes.push("The photo was cropped to fill the grid. Use the position sliders to choose which part stays, or switch to fitting with a background.");
      if (mode === "contain") notes.push("The whole photo was fitted inside the grid, and the rest was filled with the background.");
      if (layout.dw > bitmap.width * 1.001) notes.push(`The photo was enlarged ${(layout.dw / bitmap.width).toFixed(2)}× to fill the grid, so tiles may look soft. A larger original gives sharper tiles.`);

      const result: Made = { tiles: created, w: gridW, h: gridH, tileW: TILE_W, tileH, format, notes };
      madeRef.current = result;
      setMade(result);
      setStatus(`Done. ${total} tiles are ready.`);
    } catch (caught) {
      created.forEach((tile) => {
        URL.revokeObjectURL(tile.url);
        URL.revokeObjectURL(tile.previewUrl);
      });
      setStatus("");
      setErrors([caught instanceof Error && caught.message ? caught.message : "The tiles could not be created."]);
    } finally {
      releaseCanvas(full);
      releaseCanvas(tileCanvas);
      setBusy(false);
      setProgress("");
    }
  };

  const totalSize = made ? made.tiles.reduce((sum, tile) => sum + tile.blob.size, 0) : 0;

  return (
    <div className="ic st">
      <DropArea
        title={file ? file.name : ""}
        hasFiles={Boolean(file)}
        emptyTitle="Drag and drop an image here"
        emptySub="JPG, PNG, WebP, AVIF, HEIC, GIF or BMP · one file · up to 50 MB"
        filledSub={file && dims ? `${formatBytes(file.size)} · ${dims.w}×${dims.h} · choose another to replace it` : ""}
        buttonLabel="Choose image"
        moreLabel="Choose a different image"
        accept={ACCEPT}
        multiple={false}
        busy={busy}
        ariaLabel={`${tool.h1} drop area`}
        onFiles={(files) => void onFiles(files)}
      />
      <p className="ic-hint">Your image stays on this device and is never uploaded.</p>

      {file && dims && (
        <form
          className="st-form"
          onSubmit={(event) => {
            event.preventDefault();
            void run();
          }}
        >
          <div className="ic-controls">
            <div className="ic-field">
              <label htmlFor="gr-preset">Grid (columns × rows)</label>
              <select
                id="gr-preset"
                value={preset}
                onChange={(e) => {
                  freeMade();
                  setPreset(e.target.value);
                }}
                disabled={busy}
              >
                {GRID_PRESETS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            {preset === "custom" && (
              <>
                <div className="ic-field ic-field-unit">
                  <label htmlFor="gr-cols">Columns</label>
                  <input id="gr-cols" type="number" inputMode="numeric" min={1} max={MAX_COLS} value={customCols} onChange={(e) => { freeMade(); setCustomCols(e.target.value); }} disabled={busy} />
                </div>
                <div className="ic-field ic-field-unit">
                  <label htmlFor="gr-rows">Rows</label>
                  <input id="gr-rows" type="number" inputMode="numeric" min={1} max={MAX_ROWS} value={customRows} onChange={(e) => { freeMade(); setCustomRows(e.target.value); }} disabled={busy} />
                </div>
              </>
            )}
            <div className="ic-field">
              <label htmlFor="gr-shape">Tile shape</label>
              <select id="gr-shape" value={shape} onChange={(e) => { freeMade(); setShape(e.target.value as typeof shape); }} disabled={busy}>
                {SHAPES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="ic-field">
              <label htmlFor="gr-mode">If the photo&apos;s shape differs</label>
              <select id="gr-mode" value={mode} onChange={(e) => { freeMade(); setMode(e.target.value as "cover" | "contain"); }} disabled={busy}>
                <option value="cover">Crop the photo to fill the grid</option>
                <option value="contain">Fit the whole photo with a background</option>
              </select>
            </div>
            {mode === "contain" && (
              <>
                <div className="ic-field">
                  <label htmlFor="gr-bg">Background</label>
                  <select id="gr-bg" value={bg} onChange={(e) => { freeMade(); setBg(e.target.value as BgKind); }} disabled={busy}>
                    <option value="white">White</option>
                    <option value="black">Black</option>
                    <option value="color">Custom colour</option>
                    {blurOk && <option value="blur">Blurred copy of the photo</option>}
                  </select>
                </div>
                {bg === "color" && (
                  <div className="ic-field ic-field-unit">
                    <label htmlFor="gr-color">Colour</label>
                    <input id="gr-color" type="color" value={color} onChange={(e) => { freeMade(); setColor(e.target.value); }} disabled={busy} />
                  </div>
                )}
              </>
            )}
            <div className="ic-field ic-field-unit">
              <label htmlFor="gr-format">Format</label>
              <select id="gr-format" value={format} onChange={(e) => { freeMade(); setFormat(e.target.value as ExportFormat); }} disabled={busy}>
                <option value="jpeg">JPG</option>
                <option value="png">PNG</option>
              </select>
            </div>
          </div>

          {mode === "cover" && (coverRange.x > 0 || coverRange.y > 0) && (
            <div className="st-sliders">
              {coverRange.x > 0 && (
                <div className="ic-field st-slider">
                  <label htmlFor="gr-fx">Horizontal position</label>
                  <input id="gr-fx" type="range" min={-coverRange.x} max={coverRange.x} value={fx} onChange={(e) => { freeMade(); setFocusX(Number(e.target.value)); }} disabled={busy} />
                </div>
              )}
              {coverRange.y > 0 && (
                <div className="ic-field st-slider">
                  <label htmlFor="gr-fy">Vertical position</label>
                  <input id="gr-fy" type="range" min={-coverRange.y} max={coverRange.y} value={fy} onChange={(e) => { freeMade(); setFocusY(Number(e.target.value)); }} disabled={busy} />
                </div>
              )}
            </div>
          )}

          {grid.error ? (
            <div className="ic-error" role="alert">
              <p style={{ margin: 0 }}>{grid.error}</p>
            </div>
          ) : (
            previewSize && (
              <figure className="st-figure">
                <figcaption className="st-caption">
                  Grid preview · {grid.cols} × {grid.rows} = {grid.cols * grid.rows} tiles · full image {gridW}×{gridH} px · each tile {TILE_W}×{tileH} px
                </figcaption>
                <div className="st-stage" style={{ aspectRatio: `${gridW} / ${gridH}`, maxWidth: `${previewSize.w}px` }}>
                  <canvas ref={canvasRef} className="st-canvas" aria-label="Preview of the full grid" />
                  <div className="st-grid-lines" style={{ gridTemplateColumns: `repeat(${grid.cols}, 1fr)`, gridTemplateRows: `repeat(${grid.rows}, 1fr)` }} aria-hidden="true">
                    {Array.from({ length: grid.cols * grid.rows }, (_, i) => (
                      <span key={i}>{i + 1}</span>
                    ))}
                  </div>
                </div>
                <p className="ic-hint">The lines and numbers are preview overlays and are not drawn into the tiles.</p>
              </figure>
            )
          )}

          <button type="submit" className="button button-primary ic-submit" disabled={!file || busy || Boolean(grid.error)}>
            {busy ? "Working…" : "Create tiles"}
          </button>
        </form>
      )}

      <StatusArea busy={busy} progress={progress} status={status} errors={errors} />

      {made && (
        <ResultPanel
          ariaLabel="Result"
          tone="success"
          title={`Your ${made.tiles.length} tiles are ready`}
          details={[
            { label: "Tiles", value: `${made.tiles.length}`, hint: `${made.tiles[made.tiles.length - 1].col + 1} × ${made.tiles[made.tiles.length - 1].row + 1} grid` },
            { label: "Each tile", value: `${made.tileW} × ${made.tileH}`, hint: "pixels" },
            { label: "Total size", value: formatBytes(totalSize) },
            { label: "Format", value: made.format === "jpeg" ? "JPG" : "PNG" },
          ]}
          notes={made.notes}
          primary={<ZipButton primary files={made.tiles} zipName={`${baseName(file?.name ?? "image")}-instagram-grid.zip`} />}
          resetLabel="Process another image"
          onReset={reset}
          secondary={
            <button type="button" className="button" onClick={freeMade}>
              Edit settings
            </button>
          }
        >
          <ul className="st-tiles" aria-label="Tiles in reading order" style={{ gridTemplateColumns: `repeat(${Math.min(made.tiles[made.tiles.length - 1].col + 1, 3)}, minmax(0, 1fr))` }}>
            {made.tiles.map((tile) => (
              <li key={tile.name} className="st-tile">
                <img src={tile.previewUrl} alt={`Tile ${tile.index}, row ${tile.row + 1} column ${tile.col + 1}`} width={made.tileW} height={made.tileH} />
                <small>
                  Tile {tile.index} · post #{tile.post} · {formatBytes(tile.blob.size)}
                </small>
                <a className="button button-download" href={tile.url} download={tile.name}>
                  Download
                </a>
              </li>
            ))}
          </ul>
        </ResultPanel>
      )}
    </div>
  );
}
