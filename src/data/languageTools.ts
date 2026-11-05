/* Translated PDF tool pages and the English tool each one matches. One source for three things: hreflang links between language
   versions, a "this tool in other languages" list on the English pages, and the /languages/ page. */

export interface LanguageInfo {
  /** BCP 47 tag used for hreflang and the lang attribute. */
  code: string;
  /** The language's own name. */
  name: string;
  dir?: "rtl";
}

export const languages: LanguageInfo[] = [
  { code: "pt-BR", name: "Português" },
  { code: "es", name: "Español" },
  { code: "id", name: "Bahasa Indonesia" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "it", name: "Italiano" },
  { code: "ru", name: "Русский" },
  { code: "ar", name: "العربية", dir: "rtl" },
  { code: "tr", name: "Türkçe" },
];

export interface LanguageTool {
  slug: string;
  lang: string;
  /** Link text in the page's own language. */
  name: string;
  /** Slug of the matching English tool. */
  en: string;
  /** A second page in the same language for the same English tool: linked, but not part of the hreflang set. */
  secondary?: boolean;
}

export const languageTools: LanguageTool[] = [
  { slug: "juntar-pdf", lang: "pt-BR", name: "Juntar PDF", en: "merge-pdf" },
  { slug: "jpg-para-pdf", lang: "pt-BR", name: "JPG para PDF", en: "jpg-to-pdf" },
  { slug: "imagem-para-pdf", lang: "pt-BR", name: "Imagem para PDF", en: "jpg-to-pdf", secondary: true },
  { slug: "pdf-para-word", lang: "pt-BR", name: "PDF para Word", en: "pdf-to-word" },

  { slug: "jpg-a-pdf", lang: "es", name: "JPG a PDF", en: "jpg-to-pdf" },
  { slug: "imagen-a-pdf", lang: "es", name: "Imagen a PDF", en: "jpg-to-pdf", secondary: true },
  { slug: "unir-pdf", lang: "es", name: "Unir PDF", en: "merge-pdf" },
  { slug: "pdf-a-word", lang: "es", name: "PDF a Word", en: "pdf-to-word" },
  { slug: "word-a-pdf", lang: "es", name: "Word a PDF", en: "word-to-pdf" },
  { slug: "comprimir-pdf", lang: "es", name: "Comprimir PDF", en: "compress-pdf" },
  { slug: "dividir-pdf", lang: "es", name: "Dividir PDF", en: "split-pdf" },

  { slug: "jpg-ke-pdf", lang: "id", name: "JPG ke PDF", en: "jpg-to-pdf" },
  { slug: "pdf-ke-word", lang: "id", name: "PDF ke Word", en: "pdf-to-word" },
  { slug: "word-ke-pdf", lang: "id", name: "Word ke PDF", en: "word-to-pdf" },
  { slug: "kompres-pdf", lang: "id", name: "Kompres PDF", en: "compress-pdf" },
  { slug: "gabung-pdf", lang: "id", name: "Gabung PDF", en: "merge-pdf" },
  { slug: "pisah-pdf", lang: "id", name: "Pisah PDF", en: "split-pdf" },

  { slug: "pdf-en-word", lang: "fr", name: "PDF en Word", en: "pdf-to-word" },
  { slug: "word-en-pdf", lang: "fr", name: "Word en PDF", en: "word-to-pdf" },
  { slug: "compresser-pdf", lang: "fr", name: "Compresser PDF", en: "compress-pdf" },
  { slug: "fusionner-pdf", lang: "fr", name: "Fusionner PDF", en: "merge-pdf" },

  { slug: "pdf-in-word", lang: "de", name: "PDF in Word", en: "pdf-to-word" },
  { slug: "word-in-pdf", lang: "de", name: "Word in PDF", en: "word-to-pdf" },
  { slug: "pdf-komprimieren", lang: "de", name: "PDF komprimieren", en: "compress-pdf" },
  { slug: "pdf-zusammenfugen", lang: "de", name: "PDF zusammenfügen", en: "merge-pdf" },

  { slug: "convertire-pdf-in-word", lang: "it", name: "Convertire PDF in Word", en: "pdf-to-word" },
  { slug: "convertire-word-in-pdf", lang: "it", name: "Convertire Word in PDF", en: "word-to-pdf" },
  { slug: "comprimi-pdf", lang: "it", name: "Comprimi PDF", en: "compress-pdf" },
  { slug: "unisci-pdf", lang: "it", name: "Unisci PDF", en: "merge-pdf" },

  { slug: "pdf-v-word", lang: "ru", name: "PDF в Word", en: "pdf-to-word" },
  { slug: "szhat-pdf", lang: "ru", name: "Сжать PDF", en: "compress-pdf" },
  { slug: "obedinit-pdf", lang: "ru", name: "Объединить PDF", en: "merge-pdf" },
  { slug: "word-v-pdf", lang: "ru", name: "Word в PDF", en: "word-to-pdf" },
  { slug: "razdelit-pdf", lang: "ru", name: "Разделить PDF", en: "split-pdf" },

  { slug: "tahwil-pdf-ila-word", lang: "ar", name: "تحويل PDF إلى Word", en: "pdf-to-word" },
  { slug: "daght-pdf", lang: "ar", name: "ضغط PDF", en: "compress-pdf" },
  { slug: "damj-pdf", lang: "ar", name: "دمج PDF", en: "merge-pdf" },
  { slug: "taqsim-pdf", lang: "ar", name: "تقسيم PDF", en: "split-pdf" },

  { slug: "pdf-word-donustur", lang: "tr", name: "PDF'den Word'e Dönüştür", en: "pdf-to-word" },
  { slug: "pdf-sikistir", lang: "tr", name: "PDF Sıkıştır", en: "compress-pdf" },
  { slug: "pdf-birlestir", lang: "tr", name: "PDF Birleştir", en: "merge-pdf" },
  { slug: "pdf-bol", lang: "tr", name: "PDF Böl", en: "split-pdf" },
  { slug: "jpg-pdf", lang: "tr", name: "JPG'den PDF'ye", en: "jpg-to-pdf" },
];

export const englishToolNames: Record<string, string> = {
  "merge-pdf": "Merge PDF",
  "split-pdf": "Split PDF",
  "compress-pdf": "Compress PDF",
  "pdf-to-word": "PDF to Word",
  "word-to-pdf": "Word to PDF",
  "jpg-to-pdf": "JPG to PDF",
};

const norm = (path: string) => (path.endsWith("/") ? path : `${path}/`);
const languageByCode = new Map(languages.map((l) => [l.code, l]));

export const languageName = (code: string) => languageByCode.get(code)?.name ?? code;
export const languageDir = (code: string) => languageByCode.get(code)?.dir;

/** Tools that have a translated version, grouped for the languages page. */
export const toolsByLanguage = () =>
  languages.map((language) => ({ language, tools: languageTools.filter((t) => t.lang === language.code) })).filter((g) => g.tools.length > 0);

/** Every translated page for an English tool, secondary pages included. */
export const translationsOf = (englishSlug: string) => languageTools.filter((t) => t.en === englishSlug);

export interface Alternate {
  hreflang: string;
  href: string;
}

/** The hreflang set for a page: the English tool, one page per language, and x-default. Empty if the page is outside the set. */
export function alternatesFor(path: string): Alternate[] {
  const p = norm(path);
  const translated = languageTools.find((t) => `/${t.slug}/` === p);
  const englishSlug = translated?.en ?? Object.keys(englishToolNames).find((slug) => `/${slug}/` === p);
  if (!englishSlug) return [];
  if (translated?.secondary) return [];
  const members: Alternate[] = [
    { hreflang: "en", href: `/${englishSlug}/` },
    ...languageTools.filter((t) => t.en === englishSlug && !t.secondary).map((t) => ({ hreflang: t.lang, href: `/${t.slug}/` })),
  ];
  if (members.length < 2) return [];
  return [...members, { hreflang: "x-default", href: `/${englishSlug}/` }];
}
