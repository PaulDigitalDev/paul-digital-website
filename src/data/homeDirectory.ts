import { availableTools, toolById } from "./toolRegistry";

export type DirectoryIcon = "pdf" | "docx" | "text" | "image" | "convert" | "photo" | "social";

export interface DirectoryEntry {
  name: string;
  href: string;
}

export interface DirectoryGroup {
  id: string;
  title: string;
  icon: DirectoryIcon;
  tools: DirectoryEntry[];
  lang?: string;
  dir?: "rtl";
}

interface GroupSpec {
  id: string;
  title: string;
  icon: DirectoryIcon;
  /** Registry tool ids, in display order. */
  ids: string[];
  /** Working tools that live outside the registry (localized pages), shown after the registry tools. */
  extra?: DirectoryEntry[];
  /** Language and direction of a localized group, when it differs from the page. */
  lang?: string;
  dir?: "rtl";
}

/**
 * Homepage grouping. Every available registry tool must appear in exactly one group;
 * the build fails otherwise, so a new tool cannot silently go missing from the homepage.
 * Target-size landing pages (compress-*, ...) share an engine with a listed tool and are reached
 * from that tool, so they are not listed again. The jpg-to-pdf-under-* pages are the exception:
 * they are listed explicitly under PDF Tools.
 */
const specs: GroupSpec[] = [
  {
    id: "pdf",
    title: "PDF Tools",
    icon: "pdf",
    ids: ["jpg-to-pdf", "merge-pdf", "split-pdf", "compress-pdf", "pdf-to-word", "word-to-pdf", "pdf-to-jpg"],
    extra: [
      { name: "JPG to PDF Under 50KB", href: "/jpg-to-pdf-under-50kb/" },
      { name: "JPG to PDF Under 100KB", href: "/jpg-to-pdf-under-100kb/" },
      { name: "JPG to PDF Under 150KB", href: "/jpg-to-pdf-under-150kb/" },
      { name: "JPEG to PDF Under 200KB", href: "/jpeg-to-pdf-under-200kb/" },
      { name: "JPG to PDF Under 250KB", href: "/jpg-to-pdf-under-250kb/" },
      { name: "JPG to PDF Under 300KB", href: "/jpg-to-pdf-under-300kb/" },
      { name: "JPG to PDF Under 400KB", href: "/jpg-to-pdf-under-400kb/" },
      { name: "JPG to PDF Under 500KB", href: "/jpg-to-pdf-under-500kb/" },
      { name: "JPG to PDF Under 1MB", href: "/jpg-to-pdf-under-1mb/" },
      { name: "JPG to PDF Under 2MB", href: "/jpg-to-pdf-under-2mb/" },
    ],
  },
  { id: "docx", title: "DOCX & Text Tools", icon: "docx", ids: ["image-to-word", "jpg-to-text", "png-to-text"] },
  {
    id: "image",
    title: "Image Tools",
    icon: "image",
    ids: ["image-compressor", "image-resizer", "crop-rotate-flip-image", "image-metadata", "favicon-generator"],
  },
  {
    id: "convert",
    title: "Image Converters",
    icon: "convert",
    ids: [
      "image-converter",
      "image-to-jpg",
      "jpeg-to-jpg",
      "jfif-to-jpg",
      "heic-to-jpg",
      "webp-to-jpg",
      "avif-to-jpg",
      "webp-to-png",
      "jpeg-to-png",
      "png-to-jpeg",
      "png-to-ico",
    ],
  },
  {
    id: "photo",
    title: "Photo & Form Resizers",
    icon: "photo",
    ids: ["passport-photo-resizer", "uk-passport-photo-digital", "signature-resizer", "government-job-photo-signature-resizer"],
  },
  {
    id: "effects",
    title: "Image Effects",
    icon: "image",
    ids: ["image-to-black-and-white", "add-border-to-image", "round-image-corners", "crop-image-to-circle"],
  },
  {
    id: "dpi",
    title: "DPI & File Size",
    icon: "image",
    ids: ["dpi-checker", "convert-dpi", "increase-image-size-in-kb"],
  },
  {
    id: "calculators",
    title: "Calculators",
    icon: "convert",
    ids: ["tvm-calculator", "future-value-calculator", "compound-interest-calculator", "salary-increase-calculator", "loan-calculator", "roi-calculator", "age-calculator", "date-calculator", "time-calculator", "hours-calculator", "percentage-calculator", "grade-calculator", "gpa-calculator", "hourly-to-salary-calculator", "amortization-calculator", "bmi-calculator", "superannuation-date-calculator", "service-length-calculator", "salary-increment-calculator", "leave-salary-encashment-calculator", "gratuity-calculator", "pension-calculator-ropa-2019", "commuted-value-of-pension-calculator", "emi-calculator", "fd-calculator", "rd-calculator", "ppf-calculator", "million-to-crore-converter", "gold-price-calculator", "discount-calculator", "tip-calculator", "sales-tax-calculator", "fuel-cost-calculator", "fraction-calculator", "average-calculator", "ratio-calculator", "percentage-change-calculator", "scientific-notation-converter", "gcf-lcm-calculator", "standard-deviation-calculator", "stamp-duty-calculator", "uk-take-home-pay-calculator", "25000-salary-after-tax-uk", "30000-salary-after-tax-uk", "35000-salary-after-tax-uk", "40000-salary-after-tax-uk", "45000-salary-after-tax-uk", "50000-salary-after-tax-uk", "60000-salary-after-tax-uk", "75000-salary-after-tax-uk", "100000-salary-after-tax-uk", "federal-income-tax-calculator", "paycheck-calculator", "mortgage-calculator", "uk-mortgage-calculator", "plot-area-calculator", "pond-excavation-calculator", "english-to-bangla-number-converter", "english-to-hindi-number-converter", "english-to-arabic-numerals-converter"],
  },
  {
    id: "calendars",
    title: "Calendars",
    icon: "convert",
    ids: ["bangla-date-converter", "bangla-date-today", "bangla-calendar"],
  },
  {
    id: "numbers",
    title: "Number to Words",
    icon: "convert",
    ids: ["number-to-words", "number-to-words-in-lakhs-and-crores", "rupees-in-words", "cheque-amount-in-words", "taka-in-words", "number-to-words-in-bangla", "number-to-words-in-hindi", "bulk-number-to-words", "dollars-in-words", "pounds-in-words", "euros-in-words", "australian-dollars-in-words", "canadian-dollars-in-words", "pakistani-rupees-in-words", "number-to-words-in-spanish", "number-to-words-in-french", "number-to-words-in-german", "number-to-words-in-portuguese", "number-to-words-in-turkish", "number-to-words-in-indonesian"],
  },
  {
    id: "land",
    title: "Land Converters",
    icon: "convert",
    ids: ["land-area-converter", "bangladesh-land-converter", "west-bengal-land-converter", "nepal-land-converter", "katha-to-square-feet", "decimal-to-square-feet", "bigha-to-square-feet", "bangla-land-converter", "square-feet-to-katha", "square-feet-to-decimal", "decimal-to-katha", "katha-to-decimal"],
  },
  {
    id: "text",
    title: "Text Tools",
    icon: "convert",
    ids: ["character-counter", "word-counter", "case-converter", "remove-line-breaks", "text-repeater", "reading-time-calculator", "sms-character-counter", "remove-duplicate-lines", "remove-extra-spaces", "bangla-word-counter"],
  },
  {
    id: "weight",
    title: "Weight Converters",
    icon: "convert",
    ids: ["gold-weight-converter", "vori-to-gram", "gram-to-vori", "tola-to-gram", "ana-to-gram", "bangla-gold-weight-converter"],
  },
  {
    id: "units",
    title: "Unit Converters",
    icon: "convert",
    ids: ["cm-to-inches", "inches-to-cm", "feet-to-cm", "cm-to-feet", "mm-to-inches", "inches-to-mm", "miles-to-km", "km-to-miles", "meters-to-feet", "feet-to-meters", "yards-to-meters", "kg-to-lbs", "lbs-to-kg", "oz-to-grams", "grams-to-oz", "stone-to-kg", "kg-to-stone", "celsius-to-fahrenheit", "fahrenheit-to-celsius", "liters-to-gallons", "gallons-to-liters", "ml-to-oz", "cups-to-ml", "square-feet-to-square-meters", "square-meters-to-square-feet", "acres-to-hectares", "hectares-to-acres", "acres-to-square-feet", "square-km-to-square-miles", "mph-to-kmh", "kmh-to-mph", "knots-to-mph", "meters-per-second-to-kmh", "mb-to-gb", "gb-to-mb", "gb-to-tb", "kb-to-mb", "hours-to-minutes", "minutes-to-hours", "days-to-hours", "psi-to-bar", "bar-to-psi", "kpa-to-psi", "kcal-to-kj", "kj-to-kcal", "calories-to-joules", "btu-to-kwh"],
  },
  {
    id: "math",
    title: "Math and Number Tools",
    icon: "convert",
    ids: ["binary-to-decimal", "decimal-to-binary", "hex-to-decimal", "decimal-to-hex", "binary-to-hex", "hex-to-binary", "octal-to-decimal", "roman-numeral-converter"],
  },
  {
    id: "color",
    title: "Color Tools",
    icon: "convert",
    ids: ["color-converter", "hex-to-rgb", "rgb-to-hex", "hex-to-hsl"],
  },
  {
    id: "social",
    title: "Social Media Tools",
    icon: "social",
    ids: [
      "resize-image-for-instagram",
      "instagram-grid",
      "resize-image-for-whatsapp-dp",
      "resize-image-for-youtube-banner",
      "zoom-out-image",
    ],
  },
  {
    id: "portuguese",
    title: "Ferramentas em Português",
    icon: "pdf",
    ids: [],
    extra: [
      { name: "Juntar PDF", href: "/juntar-pdf/" },
      { name: "JPG para PDF", href: "/jpg-para-pdf/" },
      { name: "Imagem para PDF", href: "/imagem-para-pdf/" },
      { name: "PDF para Word", href: "/pdf-para-word/" },
    ],
  },
  {
    id: "spanish",
    title: "Herramientas en Español",
    icon: "pdf",
    ids: [],
    extra: [
      { name: "JPG a PDF", href: "/jpg-a-pdf/" },
      { name: "Imagen a PDF", href: "/imagen-a-pdf/" },
      { name: "Unir PDF", href: "/unir-pdf/" },
      { name: "PDF a Word", href: "/pdf-a-word/" },
      { name: "Word a PDF", href: "/word-a-pdf/" },
      { name: "Comprimir PDF", href: "/comprimir-pdf/" },
      { name: "Dividir PDF", href: "/dividir-pdf/" },
    ],
  },
  {
    id: "indonesian",
    title: "Alat PDF Bahasa Indonesia",
    icon: "pdf",
    ids: [],
    extra: [
      { name: "JPG ke PDF", href: "/jpg-ke-pdf/" },
      { name: "PDF ke Word", href: "/pdf-ke-word/" },
      { name: "Word ke PDF", href: "/word-ke-pdf/" },
      { name: "Kompres PDF", href: "/kompres-pdf/" },
      { name: "Gabung PDF", href: "/gabung-pdf/" },
      { name: "Pisah PDF", href: "/pisah-pdf/" },
    ],
  },
  {
    id: "french",
    title: "Outils PDF en français",
    icon: "pdf",
    ids: [],
    extra: [
      { name: "PDF en Word", href: "/pdf-en-word/" },
      { name: "Word en PDF", href: "/word-en-pdf/" },
      { name: "Compresser PDF", href: "/compresser-pdf/" },
      { name: "Fusionner PDF", href: "/fusionner-pdf/" },
    ],
  },
  {
    id: "german",
    title: "PDF-Tools auf Deutsch",
    icon: "pdf",
    ids: [],
    extra: [
      { name: "PDF in Word", href: "/pdf-in-word/" },
      { name: "Word in PDF", href: "/word-in-pdf/" },
      { name: "PDF komprimieren", href: "/pdf-komprimieren/" },
      { name: "PDF zusammenfügen", href: "/pdf-zusammenfugen/" },
    ],
  },
  {
    id: "italian",
    title: "Strumenti PDF in Italiano",
    icon: "pdf",
    ids: [],
    extra: [
      { name: "Convertire PDF in Word", href: "/convertire-pdf-in-word/" },
      { name: "Convertire Word in PDF", href: "/convertire-word-in-pdf/" },
      { name: "Comprimi PDF", href: "/comprimi-pdf/" },
      { name: "Unisci PDF", href: "/unisci-pdf/" },
    ],
  },
  {
    id: "russian",
    title: "PDF-инструменты на русском",
    icon: "pdf",
    ids: [],
    extra: [
      { name: "PDF в Word", href: "/pdf-v-word/" },
      { name: "Сжать PDF", href: "/szhat-pdf/" },
      { name: "Объединить PDF", href: "/obedinit-pdf/" },
      { name: "Word в PDF", href: "/word-v-pdf/" },
      { name: "Разделить PDF", href: "/razdelit-pdf/" },
    ],
  },
  {
    id: "arabic",
    title: "أدوات PDF باللغة العربية",
    icon: "pdf",
    lang: "ar",
    dir: "rtl",
    ids: [],
    extra: [
      { name: "تحويل PDF إلى Word", href: "/tahwil-pdf-ila-word/" },
      { name: "ضغط PDF", href: "/daght-pdf/" },
      { name: "دمج PDF", href: "/damj-pdf/" },
      { name: "تقسيم PDF", href: "/taqsim-pdf/" },
    ],
  },
  {
    id: "turkish",
    title: "Türkçe PDF Araçları",
    icon: "pdf",
    ids: [],
    extra: [
      { name: "PDF'den Word'e Dönüştür", href: "/pdf-word-donustur/" },
      { name: "PDF Sıkıştır", href: "/pdf-sikistir/" },
      { name: "PDF Birleştir", href: "/pdf-birlestir/" },
      { name: "PDF Böl", href: "/pdf-bol/" },
      { name: "JPG'den PDF'ye", href: "/jpg-pdf/" },
    ],
  },
];

/** Shorter labels where the registry heading is too long for a compact row. */
const shortNames: Record<string, string> = {
  "resize-image-for-instagram": "Resize for Instagram",
  "resize-image-for-whatsapp-dp": "Resize for WhatsApp DP",
  "resize-image-for-youtube-banner": "Resize for YouTube Banner",
  "crop-rotate-flip-image": "Crop, Rotate & Flip",
  "image-metadata": "Image Metadata",
  "uk-passport-photo-digital": "UK Passport Photo Check",
  "government-job-photo-signature-resizer": "Government Job Photo & Signature",
};

export function buildDirectory(): DirectoryGroup[] {
  const placed = new Map<string, string>();
  const hrefs = new Set<string>();
  const groups = specs.map((spec) => {
    const tools: DirectoryEntry[] = spec.ids.map((id) => {
      const tool = toolById.get(id);
      if (!tool || tool.status !== "available") throw new Error(`Home directory: "${id}" is not an available registry tool`);
      if (placed.has(id)) throw new Error(`Home directory: "${id}" is listed in both "${placed.get(id)}" and "${spec.id}"`);
      placed.set(id, spec.id);
      return { name: shortNames[id] ?? tool.name, href: tool.route };
    });
    tools.push(...(spec.extra ?? []));
    for (const entry of tools) {
      if (hrefs.has(entry.href)) throw new Error(`Home directory: duplicate link ${entry.href}`);
      hrefs.add(entry.href);
    }
    return { id: spec.id, title: spec.title, icon: spec.icon, tools, lang: spec.lang, dir: spec.dir };
  });
  const missing = availableTools.filter((tool) => !placed.has(tool.id)).map((tool) => tool.id);
  if (missing.length) throw new Error(`Home directory: registry tools missing from the homepage: ${missing.join(", ")}`);
  return groups;
}
