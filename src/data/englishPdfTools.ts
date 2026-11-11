import type { Faq } from "./formatTools";

/* English PDF tool pages. The working tools are the same engines as the localized pages (everything runs in the browser).
   Limits quoted here match the limits in the components: merge 30 files / 100 MB each / 300 MB total, split 100 MB / 1000 pages,
   compress 100 MB, PDF to Word 50 MB / 500 pages (text PDFs only, no OCR), Word to PDF 25 MB / 300 pages (.docx only). */

export type PdfToolKind = "merge" | "split" | "compress" | "pdf-to-word" | "word-to-pdf" | "pdf-to-jpg";

export interface EnglishPdfTool {
  slug: string;
  kind: PdfToolKind;
  accent: "pdf" | "word";
  h1: string;
  title: string;
  description: string;
  summary: string;
  intro: string;
  /** Compress size pages only: the KB the page aims for. The tool never promises it. */
  targetKb?: number;
  keywords: string[];
  steps: string[];
  about: string[];
  limits: string[];
  tips: string[];
  faqs: Faq[];
  related: string[];
}

const PRIVACY = "Is my file uploaded?";
const PRIVACY_A = "No. The file is read and processed in your browser on your own device. It is not sent to Paul Digital or any other server, and nothing is kept when you close the page.";

const compressSteps = (kb: number) => [
  "Select your PDF, or drag it onto the drop area. It stays on your device.",
  `The tool opens on Maximum reduction, the strongest level, because you are aiming for about ${kb} KB. You can pick a gentler level if quality matters more.`,
  "Press Compress PDF. The tool re-saves the file and shrinks JPEG images inside it.",
  `Read the result. It shows the real size and tells you whether the file is under ${kb} KB. Download it, or keep the original if the saving is small.`,
];

const sizePage = (kb: number, about: string[], tips: string[], faqExtra: Faq[], related: string[]): EnglishPdfTool => ({
  slug: `compress-pdf-to-${kb}kb`,
  kind: "compress",
  accent: "pdf",
  h1: `Compress PDF to ${kb}KB`,
  title: `Compress PDF to ${kb}KB — Free, Private, in Your Browser | Paul Digital`,
  description: `Compress a PDF toward ${kb} KB. The tool shrinks images and file structure in your browser and reports the real size, so you know if it is under ${kb} KB.`,
  summary: `Compress a PDF toward ${kb} KB and see whether the real file got under it.`,
  intro: `Aim for ${kb} KB. The tool opens on its strongest level and then shows the real size, so you can see if the PDF is under ${kb} KB before you download.`,
  targetKb: kb,
  keywords: [`compress pdf to ${kb}kb`, `reduce pdf size to ${kb} kb`, `pdf under ${kb}kb`],
  steps: compressSteps(kb),
  about,
  limits: [
    "Files up to 100 MB. The size in KB is a goal, not a promise: some PDFs cannot reach it without changing their content.",
    "Only JPEG images inside the PDF are shrunk. Pages that are drawn as other image types stay as they are.",
    "A digitally signed PDF loses its signature when it is compressed.",
  ],
  tips,
  faqs: [
    ...faqExtra,
    { q: `Can every PDF be compressed to ${kb} KB?`, a: `No. A text-only PDF can often be very small, but a PDF made of scanned pages or many photos may stay larger because the images carry most of the size. The tool reports the real result and says if it is still above ${kb} KB.` },
    { q: "Will the PDF look worse?", a: "At the strongest level JPEG images are reduced to medium quality and at most 1400 pixels per side, which can show in photos and scans. Text and drawn lines are not reduced." },
    { q: PRIVACY, a: PRIVACY_A },
  ],
  related,
});

export const englishPdfTools: EnglishPdfTool[] = [
  {
    slug: "merge-pdf",
    kind: "merge",
    accent: "pdf",
    h1: "Merge PDF",
    title: "Merge PDF Files Online — Free, No Upload | Paul Digital",
    description: "Combine several PDF files into one, in the order you choose. Everything runs in your browser, so your documents are never uploaded to a server.",
    summary: "Combine several PDF files into one in the order you choose.",
    intro: "Combine two or more PDF files into a single document. Put them in the order you want and download the result. Your files never leave your device.",
    keywords: ["merge pdf", "combine pdf", "join pdf files", "pdf merger"],
    steps: [
      "Select your PDF files, or drag them onto the drop area. You can add several at once.",
      "Check the list. Each file shows its page count and size. Use the arrows to change the order and Remove to take a file out.",
      "Press Merge PDFs. The pages are joined in the order of the list, from the first file to the last.",
      "Download merged.pdf. To start again with other files, press Clear files.",
    ],
    about: [
      "Merge PDF joins separate PDF files into one document. It is useful when a form needs a single attachment but your documents are in pieces: a contract and its annexes, an invoice and a receipt, a CV and a cover letter, or scanned pages saved one by one.",
      "The pages are copied as they are, in the order shown in the list. Nothing is recompressed, so text, images and links look the same as in the originals. Interactive form fields and bookmarks may not carry over to the merged file.",
      "Because the work happens in your browser, there is no waiting for an upload and no copy of your documents on anyone else's server. For large files this uses your device's memory, so a phone merges fewer or smaller files more comfortably than a laptop.",
    ],
    limits: ["Up to 30 files, each up to 100 MB, and 300 MB in total.", "Password-protected, damaged or non-PDF files are rejected with a message that says why. Remove the password first in the program you use to open the file.", "Bookmarks and interactive form fields may not be kept in the merged file."],
    tips: ["Put the files in order before you press merge; changing the order afterwards means merging again.", "Merge from the originals, not from copies that were already merged, so you can fix the order cleanly.", "If the result is too large for a form, compress it afterwards."],
    faqs: [
      { q: "How do I merge PDF files?", a: "Add your PDFs, put them in the order you want with the arrows, and press Merge PDFs. The new file contains every page in that order and downloads straight away." },
      { q: "Is it free?", a: "Yes. There is no sign-up, no watermark and no limit on how often you use it, apart from the file limits listed on the page." },
      { q: "Can I change the order of the files?", a: "Yes. Use the up and down arrows next to each file. The file at the top of the list gives the first pages of the merged PDF." },
      { q: "Does merging reduce the quality?", a: "No. Pages are copied without recompression, so text, images and links stay as they were." },
      { q: PRIVACY, a: PRIVACY_A },
    ],
    related: ["split-pdf", "compress-pdf", "jpg-to-pdf", "word-to-pdf"],
  },
  {
    slug: "split-pdf",
    kind: "split",
    accent: "pdf",
    h1: "Split PDF",
    title: "Split PDF Online — Extract Pages Free, No Upload | Paul Digital",
    description: "Split a PDF by page ranges, pick the pages you want, or save every page as its own file. It runs in your browser and your PDF is never uploaded.",
    summary: "Extract pages or ranges from a PDF, or save every page as a separate file.",
    intro: "Take the pages you need out of a PDF. Type ranges like 1-3, 5, 8-10, click page numbers, or split every page into its own file. Everything stays on your device.",
    keywords: ["split pdf", "extract pages from pdf", "separate pdf pages", "pdf splitter"],
    steps: [
      "Select a PDF, or drag it onto the drop area. The tool shows how many pages it has.",
      "Choose how to split: one PDF for each range, one PDF with the selected pages, or every page as a separate PDF.",
      "For ranges, type pages such as 1-3, 5, 8-10 or click the page numbers. Choose whether to keep the order you typed or the order of the document.",
      "Press Split PDF. Download a single file, or download all the parts together as a ZIP.",
    ],
    about: [
      "Split PDF is for when you need only part of a document: the pages for one chapter, the signature page of a contract, a single invoice from a long statement, or just the pages a form asks for. The original file is not changed; the tool builds new PDFs from copies of the pages you choose.",
      "There are three ways to split. Ranges mode saves each comma-separated part as its own PDF, so 1-3, 5, 8-10 gives three files. Selected pages mode puts all the pages you choose into one new PDF, which is handy for pulling pages out of the middle of a document. Every page mode makes one PDF per page, and offers them all in a ZIP.",
      "Page numbers start at 1. If a range is backwards, repeated or beyond the end of the document, the tool tells you exactly which part to fix instead of guessing.",
    ],
    limits: ["PDF up to 100 MB and 1000 pages.", "At most 200 output files from one split, and 500 MB of output in total.", "Password-protected or damaged PDFs are rejected with a message that says why."],
    tips: ["Look at your page numbers in the PDF viewer first; the numbers printed on the pages may differ from the position in the file.", "Use Selected pages mode when you want one PDF in a custom order.", "If the parts are still large, compress them afterwards."],
    faqs: [
      { q: "How do I extract pages from a PDF?", a: "Select the PDF, choose One PDF with the selected pages, type the pages you need (for example 2-4, 9) and press Split PDF. You get a new PDF with only those pages." },
      { q: "Can I split every page into a separate file?", a: "Yes. Choose Every page as a separate PDF. For documents of up to 200 pages you can download all the files together as a ZIP." },
      { q: "Does the original PDF change?", a: "No. The tool reads your file and builds new ones. The original stays exactly as it was." },
      { q: "Why does it say my page range is not valid?", a: "Ranges must use numbers from 1 to the last page, with the smaller number first and no page listed twice. The message names the part that needs fixing." },
      { q: PRIVACY, a: PRIVACY_A },
    ],
    related: ["merge-pdf", "compress-pdf", "pdf-to-word", "jpg-to-pdf"],
  },
  {
    slug: "compress-pdf",
    kind: "compress",
    accent: "pdf",
    h1: "Compress PDF",
    title: "Compress PDF Online — Reduce PDF File Size, Free | Paul Digital",
    description: "Make a PDF smaller in your browser. Choose a compression level, see the real new size, and keep the original if the saving is small. No upload.",
    summary: "Reduce the file size of a PDF with three compression levels and see the real result.",
    intro: "Make a PDF smaller without uploading it. Choose how much to reduce, see the real before-and-after size, and keep the original if the saving is not worth it.",
    keywords: ["compress pdf", "reduce pdf size", "make pdf smaller", "pdf compressor"],
    steps: [
      "Select a PDF, or drag it onto the drop area. The tool reads it and shows its page count and size.",
      "Choose a level: No quality loss, Balanced (recommended), or Maximum reduction. You can also remove document metadata.",
      "Press Compress PDF. The tool re-saves the file and shrinks the JPEG images inside it, then checks that the result opens.",
      "Compare the sizes. Download the compressed PDF, or keep the original if the result is not clearly smaller.",
    ],
    about: [
      "Most of the size of a PDF is its images. Compress PDF works on those images and on the file structure. The first level, No quality loss, only reorganises and compresses the structure and does not touch images. Balanced also shrinks JPEG images to medium-high quality and at most 2000 pixels per side. Maximum reduction goes further, to medium quality and 1400 pixels, which can be visible in photos and scans.",
      "The tool measures the saved file and tells you the truth: if the processed PDF would be bigger than the original, or the change is tiny, it says so and does not offer a download. PDFs that were already optimised often cannot get much smaller, and no honest tool can guarantee a particular percentage.",
      "After compressing, the tool re-opens the new file to check it is a valid PDF. If the check fails, the result is not offered and your original is unchanged.",
    ],
    limits: ["PDF up to 100 MB.", "Only JPEG images inside the PDF are shrunk. Other image types and drawn text are kept as they are.", "A digitally signed PDF loses its signature in the compressed copy.", "Password-protected or damaged PDFs are rejected with a message that says why."],
    tips: ["Try Balanced first; use Maximum reduction only if you need the extra saving.", "Scanned documents shrink most, because each page is an image.", "Keep the original in case you need the full quality later."],
    faqs: [
      { q: "How do I reduce the size of a PDF?", a: "Select the PDF, choose a level and press Compress PDF. The tool shows the new size and the percentage saved." },
      { q: "Will compression make my PDF blurry?", a: "No Quality loss does not touch images. Balanced and Maximum reduction lower the quality of JPEG images a little, and Maximum reduction can be visible in photos and scans." },
      { q: "Why did my PDF not get smaller?", a: "It may already be optimised, or most of its size may be in images that are not JPEG. The tool says so and suggests keeping the original." },
      { q: "Can I compress to an exact size such as 100 KB?", a: "The tool cannot promise an exact size. For common goals there are pages for 50 KB, 100 KB, 200 KB and 500 KB that start on the strongest level and report whether the file got under the number." },
      { q: PRIVACY, a: PRIVACY_A },
    ],
    related: ["compress-pdf-to-100kb", "merge-pdf", "split-pdf", "image-compressor"],
  },
  {
    slug: "pdf-to-word",
    kind: "pdf-to-word",
    accent: "word",
    h1: "PDF to Word",
    title: "PDF to Word Converter — Free DOCX, No Upload | Paul Digital",
    description: "Convert a text PDF into an editable Word (.docx) document in your browser. No upload and no OCR: it works with PDFs that have selectable text.",
    summary: "Convert a PDF that contains text into an editable Word (.docx) document.",
    intro: "Turn a PDF that contains text into an editable Word document. Your file is converted in the browser and never uploaded. Scanned PDFs are not supported.",
    keywords: ["pdf to word", "convert pdf to docx", "pdf to word converter", "pdf to editable word"],
    steps: [
      "Select a PDF that has selectable text, or drag it onto the drop area.",
      "Wait while the tool reads each page and builds the Word document. It shows which page it is on.",
      "Check the summary: pages read, headings and paragraphs found, and any pages that were left out.",
      "Download the .docx file and open it in Word, Google Docs or LibreOffice. Check the layout before you use it.",
    ],
    about: [
      "PDF to Word pulls the text out of a PDF and rebuilds it as an editable .docx document. It uses the position of each piece of text on the page to join lines into paragraphs and to recognise headings, and it keeps bold and italic where it can tell them apart. It is meant for reusing the words of contracts, reports, articles, CVs and school work.",
      "It is a text converter, not a layout copier. Tables, columns, images and the exact look of the page may not be kept, so treat the result as a starting point that needs a quick read-through. If a PDF is a scan, the pages are pictures of text, not text, and this version cannot read them because it has no OCR; those pages are reported and left out.",
      "Conversion happens on your device, so a confidential document is never sent anywhere.",
    ],
    limits: ["PDF up to 50 MB and 500 pages.", "Only PDFs with selectable text. Scanned pages are left out, and a PDF with no text at all is rejected with a clear message.", "Tables, columns, images and exact page layout may not be kept.", "Password-protected or damaged PDFs are rejected."],
    tips: ["Check whether you can select text in the PDF. If you can, it will convert.", "Open the .docx and review headings and lists, which are the most likely to need a tidy.", "For a scanned page, use an OCR tool first to get text."],
    faqs: [
      { q: "How do I convert a PDF to Word?", a: "Select a PDF that has selectable text and wait a moment. The tool builds a .docx file, which you download and open in Word or another editor." },
      { q: "Does it work with scanned PDFs?", a: "No. A scanned PDF is made of page pictures, and this version has no OCR. It tells you which pages had no text instead of producing an empty file." },
      { q: "Will the layout match the PDF?", a: "Not exactly. Text, headings, bold and italic are kept where possible, but tables, columns and images may not be, so check the document before you use it." },
      { q: "Is the Word file editable?", a: "Yes. It is a normal .docx document that you can edit in Word, Google Docs or LibreOffice." },
      { q: PRIVACY, a: PRIVACY_A },
    ],
    related: ["word-to-pdf", "image-to-word", "split-pdf", "merge-pdf"],
  },
  {
    slug: "word-to-pdf",
    kind: "word-to-pdf",
    accent: "word",
    h1: "Word to PDF",
    title: "Word to PDF Converter — Free, No Upload | Paul Digital",
    description: "Convert a Word (.docx) document into a PDF in your browser. Text, basic formatting, lists, tables and in-line images are kept. No upload.",
    summary: "Convert a Word (.docx) document into a PDF.",
    intro: "Turn a Word (.docx) document into a PDF. The conversion runs in your browser, so the document is never uploaded. The layout can differ slightly from Word.",
    keywords: ["word to pdf", "docx to pdf", "convert word to pdf", "word to pdf converter"],
    steps: [
      "Select a .docx file, or drag it onto the drop area.",
      "Wait while the tool reads the document and formats it into pages.",
      "Read the notes under the result. They list anything that could not be included, such as headers or text boxes.",
      "Download the PDF and look it over before you send it.",
    ],
    about: [
      "Word to PDF converts a .docx document into a PDF so that it opens the same way for everyone. It keeps text, basic formatting such as bold, italic and headings, lists, tables and images that sit in line with the text.",
      "This is an approximate conversion done in the browser, not Word itself. The PDF uses standard PDF fonts instead of the fonts in your document, so line breaks and page breaks can differ from Word. Headers, footers, page numbers, footnotes, text boxes, shapes, charts and equations are not included, and the result tells you which of these your document contained. For a legal or print-critical document, export from Word or check the PDF page by page.",
      "Characters that do not exist in the standard PDF fonts, such as emoji and non-Latin alphabets, are replaced with a question mark, and the tool reports that too.",
    ],
    limits: ["Word .docx files up to 25 MB and 300 pages.", "Old .doc files cannot be read: open them in Word and save as .docx first.", "Password-protected files are rejected.", "Headers, footers, footnotes, text boxes, shapes, charts and equations are not included."],
    tips: ["Save older documents as .docx before converting.", "Check the PDF for line and page breaks, which may differ from Word.", "If your document relies on headers, footers or text boxes, export the PDF from Word instead."],
    faqs: [
      { q: "How do I convert Word to PDF?", a: "Select your .docx file and wait a moment. The tool creates a PDF that you can download and check." },
      { q: "Will the PDF look exactly like my Word document?", a: "Not always. It keeps text, formatting, lists, tables and in-line images, but it uses standard PDF fonts, so line and page breaks can differ. The tool lists what was left out." },
      { q: "Does it work with .doc files?", a: "No, only .docx. Open an older .doc file in Word and save it as .docx first." },
      { q: "Are headers and footers included?", a: "No. Headers, footers and page numbers are not included in this version, and the tool tells you if your document had them." },
      { q: PRIVACY, a: PRIVACY_A },
    ],
    related: ["pdf-to-word", "merge-pdf", "jpg-to-pdf", "compress-pdf"],
  },
  {
    slug: "pdf-to-jpg",
    kind: "pdf-to-jpg",
    accent: "pdf",
    h1: "PDF to JPG",
    title: "PDF to JPG Converter — Every Page as an Image, No Upload | Paul Digital",
    description: "Convert each page of a PDF into a JPG image at 72, 150, 200 or 300 DPI. Runs in your browser, nothing is uploaded, no watermark.",
    summary: "Convert every page of a PDF into a JPG image at the resolution you choose.",
    intro: "Turn each page of a PDF into a JPG picture. Choose the resolution, and download one image or a ZIP of all pages. Your file never leaves your device.",
    keywords: ["pdf to jpg", "convert pdf to jpg", "pdf to image", "pdf to jpeg"],
    steps: [
      "Select your PDF, or drag it onto the page.",
      "Choose a resolution: 72 DPI for small previews, 150 for screens and sharing, 300 for printing.",
      "Adjust the JPG quality if you need smaller files, then press Convert to JPG.",
      "Download the image, or the ZIP if the PDF has several pages. You can also tap a page preview to download just that page.",
    ],
    about: [
      "PDF to JPG draws each page of a PDF onto a white canvas and saves the result as a JPG image. Text, pictures and vector graphics are all turned into pixels, so the result looks like the printed page but can no longer be edited or searched as text.",
      "The resolution decides how many pixels each page gets. A page is measured in points, 72 to an inch, and the DPI you pick scales it up from there. An A4 page at 150 DPI comes out at about 1241 by 1754 pixels, and at 300 DPI at about 2481 by 3508 pixels. Higher DPI gives sharper images and much larger files. Each JPG also carries the DPI it was drawn at, which only affects the print size programs assume for it.",
      "Everything is done in your browser with the open-source PDF.js library, so confidential documents are never sent to a server. A PDF with one page gives a single JPG. A PDF with several pages gives one JPG per page, named in page order and packed into a ZIP.",
    ],
    limits: [
      "PDF up to 100 MB and 100 pages.",
      "Password-protected PDFs are rejected. Remove the protection first.",
      "Very large pages are drawn at a lower resolution to stay within browser memory limits, and the tool tells you when that happens.",
      "JPG has no transparency, so pages are drawn on a white background.",
    ],
    tips: [
      "Use 150 DPI for sharing and 300 DPI only when you need to print, as the files are much larger.",
      "For a text-heavy page, keep quality at 85% or higher so the letters stay crisp.",
      "If you need only some pages, split the PDF first with Split PDF and convert the part you need.",
    ],
    faqs: [
      { q: "How do I convert a PDF to JPG?", a: "Select the PDF, choose a resolution and press Convert to JPG. You download one image for a single page, or a ZIP with one image per page." },
      { q: "What DPI should I choose?", a: "150 DPI is a good all-round choice for screens and sharing. 300 DPI is better for printing. 72 DPI gives small previews." },
      { q: "Will the text still be selectable?", a: "No. Each page becomes a picture, so the text is pixels. Use PDF to Word if you need editable text." },
      { q: "Is there a page or size limit?", a: "Yes. PDFs up to 100 MB and 100 pages, so that your browser can handle the conversion." },
      { q: PRIVACY, a: PRIVACY_A },
    ],
    related: ["split-pdf", "compress-pdf", "jpg-to-pdf", "image-compressor"],
  },
  sizePage(
    50,
    [
      "50 KB is a very small PDF. A one-page text document can be this small, but a PDF with photos or scanned pages usually cannot, because each image carries most of the size. The tool starts on Maximum reduction and tells you what it really reached.",
      "For a scan, most of the size is one large image per page. Shrinking that image is the only way to save much, which is why scans react strongly to the strongest level. If the result is still above 50 KB, fewer pages, or scanning at a lower resolution, will do more than compressing again.",
      "A useful way to judge a 50 KB target is to count images: at the strongest level one photo or one scanned page is usually larger than 50 KB by itself. A PDF can only reach this size if it is mostly text or vector drawing, or if the page is re-created as a small black-and-white scan.",
    ],
    ["Remove pages you do not need first with Split PDF.", "Scan at 150 DPI instead of 300 if you control the scanner.", "A target this small is realistic only for short, mostly-text files."],
    [{ q: "How do I get a PDF under 50 KB?", a: "Select the PDF and press Compress PDF on Maximum reduction. If the result is still above 50 KB, remove pages with Split PDF or re-scan at a lower resolution." }, { q: "Why is my scanned PDF so much larger than 50 KB?", a: "A scanned page is one large picture, and pictures are the heavy part of a PDF. Scan at a lower resolution, scan in black and white if colour is not needed, or reduce the number of pages." }],
    ["compress-pdf-to-100kb", "compress-pdf", "split-pdf", "jpg-to-pdf-under-50kb"],
  ),
  sizePage(
    100,
    [
      "100 KB is a common limit on application forms and portals. A short text PDF is often far below it, while a multi-page scan is usually far above it. The tool starts on Maximum reduction and reports the real size so you do not have to guess.",
      "If your PDF came from photos, building it from images that are already small is more effective than squeezing the finished file. The JPG to PDF tool can make a PDF with a size target, and Split PDF can remove pages you do not need.",
      "Because the size check is done by the website you upload to, not by this tool, leave a small margin under 100 KB. A file of 96 or 97 KB passes whether the site counts 1 KB as 1,000 or 1,024 bytes, while a file of 100.5 KB may not.",
    ],
    ["Check the limit on the form: some count 1 KB as 1,000 bytes, so aim a little under.", "Remove extra pages before compressing.", "For photos, shrink them first and then make the PDF."],
    [{ q: "How do I reduce a PDF to under 100 KB?", a: "Select the PDF and press Compress PDF on Maximum reduction. If it is still above 100 KB, remove pages with Split PDF or use fewer or smaller images." }, { q: "Is 100 KB the same as 100,000 bytes?", a: "Some sites count 1 KB as 1,000 bytes and others as 1,024 bytes, so 100 KB is between 100,000 and 102,400 bytes. Aim a few KB below the limit to be safe." }],
    ["compress-pdf-to-50kb", "compress-pdf-to-200kb", "compress-pdf", "jpg-to-pdf-under-100kb"],
  ),
  sizePage(
    200,
    [
      "200 KB leaves room for a short document with a few images or a few pages of text. It is a frequent limit for supporting documents and certificates. The tool opens on Maximum reduction, then shows the real size.",
      "If the PDF is only slightly above 200 KB, the Balanced level may be enough and keeps images clearer. Try Balanced first, and move to Maximum reduction only if the file is still above the limit.",
      "At 200 KB a mixed document, such as a one-page form with a photo or a short certificate, usually fits with a gentle level of compression. Two or three scanned pages in colour usually do not, so convert only the pages you need or scan in grayscale.",
    ],
    ["Try Balanced first for clearer images.", "Merge only the pages you need into the file, then compress.", "Keep the original in case you need the full quality."],
    [{ q: "Should I use Balanced or Maximum reduction for 200 KB?", a: "Start with Balanced. If the file is still above 200 KB, use Maximum reduction. Balanced keeps images clearer, Maximum reduction saves more." }, { q: "Is 200 KB the same as 0.2 MB?", a: "In the decimal convention yes, 200 KB is 0.2 MB. In the binary convention 200 KB is about 0.195 MB. A limit written in KB is easier to check than one written in MB." }],
    ["compress-pdf-to-100kb", "compress-pdf-to-500kb", "compress-pdf", "merge-pdf"],
  ),
  sizePage(
    500,
    [
      "500 KB is a generous limit for a small document, and many PDFs are already under it. For a scan of a few pages, Balanced is often enough to get there while keeping the text readable. The tool starts on Maximum reduction and reports the real size, and you can choose a gentler level if the file is already close.",
      "If your PDF is much larger than 500 KB, the images are the likely cause. Compressing them is what saves space; text and drawn lines add very little.",
      "Half a megabyte is enough for a multi-page text document and for a few clear scanned pages. If a portal gives its limit in MB, 500 KB is about 0.5 MB, so the same file also meets a 1 MB limit with room to spare.",
    ],
    ["For scans of text, check readability after compressing.", "Pick Balanced if the file is already close to 500 KB.", "Split a long document into parts if a single file will not fit."],
    [{ q: "Will my text stay readable at 500 KB?", a: "Text in a PDF is not reduced. For a scanned page the text is part of an image, so check the result and use Balanced instead of Maximum reduction if it looks too soft." }, { q: "Is 500 KB the same as 0.5 MB?", a: "In the decimal convention yes, 500 KB is 0.5 MB. In the binary convention it is about 0.49 MB. Either way the file is under a 1 MB limit." }],
    ["compress-pdf-to-200kb", "compress-pdf", "split-pdf", "jpg-to-pdf-under-500kb"],
  ),
];

export const englishPdfToolBySlug = new Map(englishPdfTools.map((tool) => [tool.slug, tool]));
