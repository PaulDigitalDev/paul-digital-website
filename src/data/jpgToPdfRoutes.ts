import type { SizeUnit } from "./imageSizeRoutes";

export interface JpgToPdfRoute {
  slug: string;
  /** Route segment after the prefix, e.g. "50kb". */
  size: string;
  prefix: "jpg" | "jpeg";
  label: "JPG" | "JPEG";
  target: number;
  unit: SizeUnit;
  title: string;
  h1: string;
  description: string;
  intro: string;
  /** Route-specific paragraph about what this budget means for a PDF. */
  explanation: string;
  useCases: string[];
  tips: string[];
  /** Extra route-specific FAQ appended to the shared ones. */
  faq: { q: string; a: string };
  /** Slug of the closest Image Compressor route, and its anchor text. */
  compressor: { slug: string; text: string };
  canonical: string;
}

const SITE = "https://pauldigital.dev";

type Entry = Omit<JpgToPdfRoute, "slug" | "size" | "prefix" | "label" | "title" | "h1" | "canonical"> & {
  size: string;
  prefix?: "jpg" | "jpeg";
};

function build(entry: Entry): JpgToPdfRoute {
  const prefix = entry.prefix ?? "jpg";
  const label = prefix === "jpeg" ? "JPEG" : "JPG";
  const display = `${entry.target}${entry.unit}`;
  const slug = `${prefix}-to-pdf-under-${entry.size}`;
  const h1 = `${label} to PDF Under ${display}`;
  return {
    ...entry,
    prefix,
    label,
    slug,
    h1,
    title: `${h1} Online — Paul Digital`,
    canonical: `${SITE}/${slug}/`,
  };
}

export const jpgToPdfRoutes: JpgToPdfRoute[] = (
  [
    {
      size: "50kb",
      target: 50,
      unit: "KB",
      description:
        "Convert a JPG to a PDF aimed at 50 KB or less, right in your browser. Nothing is uploaded and the real PDF size is measured and shown.",
      intro:
        "Turn a JPG into a PDF and aim for 50 KB. The conversion runs in your browser, and the actual size of the finished file is reported.",
      explanation:
        "Fifty kilobytes is a very small budget for a PDF that contains a photograph. The PDF wrapper itself costs well under 1 KB per page, so almost all of the size is the image. A single small, simple picture such as a signature, stamp or cropped ID can fit; a full-resolution phone photo almost never will. This tool first embeds your JPEG untouched, and only if the result is too large does it re-encode the image at lower quality and then smaller dimensions, measuring the PDF after every attempt. It will not go below a readable floor, so a large photo may honestly miss 50 KB.",
      useCases: [
        "A single signature, stamp or thumbnail attached to a strict upload form",
        "A cropped ID or certificate image for a portal with a 50 KB document cap",
        "Tiny proof-of-address or receipt scans where one small page is enough",
      ],
      tips: [
        "Crop away margins and backgrounds before converting; unused pixels still cost bytes.",
        "Use one image per PDF at this size. Several pages rarely fit in 50 KB.",
        "Black-and-white or low-detail scans compress far better than colour photos.",
      ],
      faq: {
        q: "Can a multi-page JPG PDF fit in 50 KB?",
        a: "Only if every image is already tiny. Each page adds its own image data, so two or more photographs usually exceed 50 KB. Try separate PDFs, or raise the target.",
      },
      compressor: { slug: "compress-image-to-50kb", text: "Compress an image to 50 KB first" },
    },
    {
      size: "100kb",
      target: 100,
      unit: "KB",
      description:
        "Convert JPG images to one PDF aimed at 100 KB or less, locally in your browser. The final PDF size is measured, not guessed.",
      intro:
        "Combine one or more JPG images into a PDF and aim for 100 KB. Everything stays on your device and the true file size is shown.",
      explanation:
        "One hundred kilobytes is a common ceiling for document uploads. It is comfortable for a single scan or a cropped photo and tight for several pages. The tool keeps your JPEGs as they are when they already fit, and otherwise lowers JPEG quality and then dimensions in small steps, checking the real byte size of the assembled PDF each time. If the images cannot reach 100 KB without becoming unreadable, you will see the actual size and the reason instead of a false success.",
      useCases: [
        "Single-page identity or address proof for an online application",
        "A short two- or three-page set of small scans for an email limit",
        "Signed forms photographed at modest resolution",
      ],
      tips: [
        "Photograph documents in good light at moderate resolution instead of the maximum your camera allows.",
        "Compress very large originals before combining them, then convert.",
        "Check the result zoomed in: text should stay readable at the chosen size.",
      ],
      faq: {
        q: "Will my images be recompressed to fit 100 KB?",
        a: "Only when needed. If your untouched JPEGs already produce a PDF within 100 KB they are embedded unchanged; otherwise quality and size are reduced gradually and the notes tell you what happened.",
      },
      compressor: { slug: "compress-image-to-100kb", text: "Compress an image to 100 KB first" },
    },
    {
      size: "150kb",
      target: 150,
      unit: "KB",
      description:
        "Make a PDF from JPG images aimed at 150 KB or less, entirely in your browser, with the actual output size reported.",
      intro:
        "Create a PDF from one or more JPG images and aim for 150 KB. The work happens locally and the real result size is displayed.",
      explanation:
        "At 150 KB you can usually fit one clean document page or a couple of small ones. It sits between the strict 100 KB form limits and the looser 200 KB attachment caps, so it is a handy target when a portal says only 'a few hundred KB'. The converter tries your original JPEGs first, then steps quality and dimensions down while never dropping an image, and verifies the finished PDF's byte size before telling you whether the goal was met.",
      useCases: [
        "Job and scholarship applications that cap each document at 150 KB",
        "Two-page forms such as front and back of a card",
        "Quick shareable PDFs of notes photographed on a phone",
      ],
      tips: [
        "Reorder pages with the arrows before converting; the PDF follows the list order.",
        "Pick A4 or Letter for printing, or 'Match image shape' for the least wasted space.",
        "If one page is much larger than the rest, compress it separately first.",
      ],
      faq: {
        q: "Is 150 KB enough for a photographed A4 page?",
        a: "Often yes at moderate resolution, but a sharp 12-megapixel photo can be several megabytes. The tool reduces quality and dimensions as needed and reports the actual size.",
      },
      compressor: { slug: "compress-jpeg-to-150kb", text: "Compress a JPEG to 150 KB first" },
    },
    {
      size: "200kb",
      prefix: "jpeg",
      target: 200,
      unit: "KB",
      description:
        "Convert a JPEG to a PDF aimed at 200 KB or less in your browser. No upload, and the final PDF size is measured and shown.",
      intro:
        "Convert JPEG files to a PDF and aim for 200 KB. The PDF is built on your device and its real size is reported.",
      explanation:
        "Two hundred kilobytes is a frequent attachment cap on government, school and recruitment portals. It leaves room for a few clean pages of scanned text or one good photograph. Both .jpg and .jpeg files are the same format, so either extension works. The converter embeds the JPEG data directly when it can, falls back to gentle re-encoding only if the PDF is too big, and states plainly when 200 KB cannot be reached with images that are still legible.",
      useCases: [
        "Multi-page application documents with a 200 KB total",
        "Marksheets, certificates and receipts photographed with a phone",
        "Short JPEG scans that need to become one tidy PDF for email",
      ],
      tips: [
        "Scan at 150–200 DPI rather than 600; text stays sharp and files stay small.",
        "Remove blank or duplicate pages with the Remove button before converting.",
        "Greyscale scans usually give smaller files than colour ones.",
      ],
      faq: {
        q: "Is a .jpeg file different from a .jpg file?",
        a: "No. JPEG and JPG are the same format; the shorter extension dates from older systems. This tool accepts both.",
      },
      compressor: { slug: "compress-image-to-200kb", text: "Compress an image to 200 KB first" },
    },
    {
      size: "250kb",
      target: 250,
      unit: "KB",
      description:
        "Convert JPG files into a PDF aimed at 250 KB or less. Runs in your browser; the real size of the PDF is checked and reported.",
      intro:
        "Make a PDF from JPG images aimed at 250 KB. It is created locally, and the actual file size is shown when it is ready.",
      explanation:
        "A quarter of a megabyte is a practical size for a short multi-page PDF of ordinary scans. It is more generous than 200 KB without approaching the 500 KB or 1 MB tiers. The tool embeds your JPEGs as they are when that fits, otherwise lowers quality in steps and then dimensions, and always keeps every page in your chosen order. After building, it measures the real byte size and reports whether 250 KB was met.",
      useCases: [
        "Three- or four-page forms with simple text and signatures",
        "Supporting documents for visa, bank or insurance portals with a 250 KB limit",
        "Photographed contracts or invoices that must go by email",
      ],
      tips: [
        "Straighten and crop each photo first so the page is not full of table or floor.",
        "Avoid flash glare; it adds detail the encoder must preserve.",
        "If you are close but over, remove one image or edit the target slightly.",
      ],
      faq: {
        q: "What if my PDF ends up slightly above 250 KB?",
        a: "The tool will say so and show the exact byte count. Remove a page, use smaller originals, or allow a slightly larger target.",
      },
      compressor: { slug: "compress-jpeg-to-300kb", text: "Compress a JPEG to 300 KB first" },
    },
    {
      size: "300kb",
      target: 300,
      unit: "KB",
      description:
        "Create a PDF from JPG images aimed at 300 KB or less, locally in your browser, with the actual PDF size measured for you.",
      intro:
        "Combine JPG images into a PDF and aim for 300 KB. No upload is involved, and the real size of the result is displayed.",
      explanation:
        "Three hundred kilobytes comfortably holds several pages of moderately sized scans. Many job portals and e-filing sites use it as a per-file limit. The converter begins with your untouched JPEGs, then, only when required, lowers quality and finally dimensions in measured steps until the assembled PDF fits or it reaches a readability floor. You always see the true byte size and a clear explanation of what changed.",
      useCases: [
        "Résumé pages, cover letters and reference scans in one file",
        "Bank statements or utility bills photographed page by page",
        "School assignments submitted as image-based PDFs",
      ],
      tips: [
        "Keep photographs of documents around 1,500–2,000 px on the long side.",
        "Use 'Match image shape' for pages with unusual proportions.",
        "Name files in order (page1, page2) so they sort correctly when you add them.",
      ],
      faq: {
        q: "How many pages fit in 300 KB?",
        a: "It depends on the images. Simple black-on-white scans may allow five or more pages; detailed colour photos may allow one or two. The tool reports the real result.",
      },
      compressor: { slug: "compress-jpeg-to-300kb", text: "Compress a JPEG to 300 KB first" },
    },
    {
      size: "400kb",
      target: 400,
      unit: "KB",
      description:
        "Convert JPG images to a PDF aimed at 400 KB or less in your browser. Files stay on your device and the final size is verified.",
      intro:
        "Turn JPG images into one PDF and aim for 400 KB. It runs locally and the resulting size is measured and reported.",
      explanation:
        "Four hundred kilobytes gives enough room for a handful of readable pages or a good-quality single photograph. It is an in-between limit seen on several application systems. The converter keeps your JPEG data as is when possible, applies small quality and size reductions when it must, and checks the final PDF's byte size so the reported result is real. If the images are too heavy to reach 400 KB without harming legibility, the tool says so.",
      useCases: [
        "Portal uploads that allow 'up to 400 KB' per attachment",
        "Four- to six-page document bundles made from phone photos",
        "A photo plus a signature combined for one form",
      ],
      tips: [
        "Shoot documents flat and well lit; noisy low-light photos compress poorly.",
        "Combine only pages you need, since every image adds to the total.",
        "Use the page-size menu to control layout; it does not change file size much.",
      ],
      faq: {
        q: "Does choosing A4 or Letter change the PDF size?",
        a: "Barely. Page size affects layout, not image data, so file size is driven by your images.",
      },
      compressor: { slug: "compress-jpeg-to-500kb", text: "Compress a JPEG to 500 KB first" },
    },
    {
      size: "500kb",
      target: 500,
      unit: "KB",
      description:
        "Convert JPG files to a PDF aimed at 500 KB or less. Everything runs in your browser and the actual PDF size is reported.",
      intro:
        "Create a PDF from JPG images and aim for 500 KB. It is processed locally and the true size of the finished PDF is shown.",
      explanation:
        "Half a megabyte is the sweet spot for many email systems and document portals. It fits multiple scanned pages at readable quality, and often a few ordinary photographs after light recompression. The tool starts with your original JPEGs, steps quality and dimensions down only as far as needed, and verifies the finished file's byte count. If your images are larger than a 500 KB PDF can reasonably hold, the report states the actual size and the limit that stopped it.",
      useCases: [
        "Application bundles with several scanned certificates",
        "Photographed handwritten notes or worksheets",
        "Property, insurance or medical paperwork for upload",
      ],
      tips: [
        "Phone photos often exceed 3 MB; expect the tool to recompress them noticeably.",
        "Preview the PDF after downloading and zoom into small text.",
        "Split very long documents into two PDFs if one cannot reach the target.",
      ],
      faq: {
        q: "Will text in my photographed pages stay readable?",
        a: "Quality is not reduced below about 50 percent, and images are not shrunk below roughly 800 px on the long side, to keep ordinary text legible. Always check the PDF before sending.",
      },
      compressor: { slug: "compress-jpeg-to-500kb", text: "Compress a JPEG to 500 KB first" },
    },
    {
      size: "1mb",
      target: 1,
      unit: "MB",
      description:
        "Convert JPG images to a PDF aimed at 1 MB or less in your browser. No upload, and the real PDF size is measured.",
      intro:
        "Combine JPG images into a PDF and aim for 1 MB. It is built on your device and the actual size is reported.",
      explanation:
        "One megabyte (1,024 KB) is one of the most common attachment limits online. It fits many pages of scanned text or several moderately sized photographs. Because well-compressed JPEGs go into the PDF unchanged, a set of already-optimised images may need no recompression at all. When they do, the tool lowers quality and dimensions in small steps and measures the finished PDF each time, never claiming success it has not verified.",
      useCases: [
        "Email attachments restricted to 1 MB",
        "Multi-page forms, receipts and statements",
        "Photo albums or portfolios sent as a single file",
      ],
      tips: [
        "Add pages in reading order, then use the arrows if you need to adjust.",
        "Use photos near 2,000 px wide; larger ones add bytes without visible benefit in a PDF.",
        "If you need more headroom for email overhead, aim slightly below 1 MB (for example 900 KB).",
      ],
      faq: {
        q: "Is 1 MB equal to 1,000 KB or 1,024 KB here?",
        a: "This tool uses 1 MB = 1,024 KB = 1,048,576 bytes. If your destination counts 1,000 KB, enter a slightly smaller target.",
      },
      compressor: { slug: "compress-image-to-1mb", text: "Compress an image to 1 MB first" },
    },
    {
      size: "2mb",
      target: 2,
      unit: "MB",
      description:
        "Convert JPG images to a PDF aimed at 2 MB or less, locally in your browser. The actual PDF size is measured and shown.",
      intro:
        "Turn JPG images into a PDF and aim for 2 MB. It happens in your browser, with the true file size reported afterwards.",
      explanation:
        "Two megabytes allows a sizeable document: many scanned pages, or several high-quality photographs. Typical phone photos are 2–6 MB each, so a multi-image set may still need recompression, which the tool applies gradually and only when required. Every image is kept, the order is preserved, and the measured byte size of the finished PDF decides whether the target is reported as met.",
      useCases: [
        "Support-ticket and form uploads with a 2 MB cap",
        "Longer documents such as contracts or multi-page reports",
        "Photo evidence for insurance, repairs or returns",
      ],
      tips: [
        "Pick the sharpest shots and delete duplicates before converting.",
        "Combine fewer pages per PDF if you want to preserve more detail.",
        "Open the downloaded PDF once to confirm orientation and order.",
      ],
      faq: {
        q: "Why is my PDF smaller than the sum of my JPG files?",
        a: "When the images alone exceed the target, the tool recompresses them. The notes under the result explain exactly what was done.",
      },
      compressor: { slug: "compress-image-to-2mb", text: "Compress an image to 2 MB first" },
    },
  ] as Entry[]
).map(build);

export const jpgToPdfBySlug = new Map(jpgToPdfRoutes.map((route) => [route.slug, route]));

export const targetText = (route: JpgToPdfRoute) => `${route.target} ${route.unit}`;
