/* Size presets for the passport-photo and signature tools.
   These are commonly published or commonly seen sizes, not an official rulebook. Each preset says where it comes from,
   and every page tells the user to confirm the current requirement with the organisation that asked for the image. */

export interface SizePreset {
  id: string;
  label: string;
  /** Country, authority or use case the size is associated with. */
  region: string;
  /** Output size in pixels. */
  w: number;
  h: number;
  /** Printed size the pixels were derived from, when the source states one. */
  physical?: string;
  note: string;
}

const PX_PER_INCH = 300;
const mmToPx = (mm: number) => Math.round((mm / 25.4) * PX_PER_INCH);

const mm = (id: string, label: string, region: string, wMm: number, hMm: number, note: string): SizePreset => ({
  id,
  label,
  region,
  w: mmToPx(wMm),
  h: mmToPx(hMm),
  physical: `${wMm} × ${hMm} mm at ${PX_PER_INCH} DPI`,
  note,
});

const PASSPORT_NOTE = "Printed size commonly published for this document. Rules for head size, background, lighting and file type are separate and can change, so confirm with the issuing authority.";

/** GOV.UK digital-photo rules for online passport applications. Source and date are shown on /uk-passport-photo-digital/. */
export const UK_DIGITAL = {
  minW: 600,
  minH: 750,
  minKb: 50,
  maxMb: 10,
  sourceUrl: "https://www.gov.uk/photos-for-passports",
  printedUrl: "https://www.gov.uk/photos-for-passports/photo-requirements",
  verified: "10 October 2026",
} as const;

const UK_PRINT_NOTE =
  "PRINT SIZE ONLY (35 × 45 mm printed photo). This 413 × 531 px output is below the 600 × 750 px minimum GOV.UK sets for digital photos uploaded online, and GOV.UK says not to crop a digital photo yourself. For an online application, use the UK digital passport photo checker instead.";

export const passportPresets: SizePreset[] = [
  mm("us", "United States passport and visa — 2 × 2 in", "United States", 50.8, 50.8, PASSPORT_NOTE),
  mm("uk", "United Kingdom printed photo — 35 × 45 mm (print size only)", "United Kingdom", 35, 45, UK_PRINT_NOTE),
  mm("eu", "EU / Schengen ID and visa — 35 × 45 mm", "European Union / Schengen", 35, 45, PASSPORT_NOTE),
  mm("au", "Australia passport — 35 × 45 mm", "Australia", 35, 45, PASSPORT_NOTE),
  mm("ca", "Canada passport — 50 × 70 mm", "Canada", 50, 70, PASSPORT_NOTE),
  mm("cn", "China passport and visa — 33 × 48 mm", "China", 33, 48, PASSPORT_NOTE),
];

export const signaturePresets: SizePreset[] = [
  { id: "140x60", label: "140 × 60 px", region: "Example web-form size", w: 140, h: 60, note: "A small wide size that some online forms ask for. Your form may use a different size." },
  { id: "200x80", label: "200 × 80 px", region: "Example web-form size", w: 200, h: 80, note: "A common 5:2 signature box. Check the size your form states." },
  { id: "300x100", label: "300 × 100 px", region: "Example web-form size", w: 300, h: 100, note: "A 3:1 signature box with more detail than the smaller sizes." },
  { id: "600x200", label: "600 × 200 px", region: "Example web-form size", w: 600, h: 200, note: "A larger 3:1 size for documents and e-signature fields." },
];

export const ACCEPTANCE_NOTICE =
  "Resizing makes a file the size you choose; it does not guarantee that a government office, employer, exam board or website will accept it. Always compare the result with that organisation's current instructions.";
