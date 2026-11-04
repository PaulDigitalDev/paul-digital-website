import type { Faq } from "./formatTools";

export type DensityToolMode = "check" | "convert" | "increase";

export interface DensityToolData {
  slug: string;
  mode: DensityToolMode;
  h1: string;
  title: string;
  description: string;
  summary: string;
  intro: string;
  keywords: string[];
  steps: string[];
  explanation: string[];
  useCases: string[];
  tips: string[];
  faqs: Faq[];
  related: string[];
}

export const densityTools: DensityToolData[] = [
  {
    slug: "dpi-checker",
    mode: "check",
    h1: "Image DPI Checker",
    title: "Image DPI Checker: See the DPI of a JPG or PNG | Paul Digital",
    description: "Check the DPI stored in a JPG or PNG file, plus its pixel size and print size in cm and inches. Runs in your browser, nothing is uploaded.",
    summary: "See the DPI, pixel size and print size stored in a JPG or PNG file.",
    intro: "Find out what DPI a picture says it has, and how large it would print at that DPI. The file never leaves your device.",
    keywords: ["dpi", "check dpi", "image resolution", "ppi"],
    steps: [
      "Choose a JPG or PNG picture, or drag it onto the page.",
      "Read the DPI stored in the file, its pixel size and the print size at that DPI.",
      "If the file has no DPI, use the Convert DPI tool to set one.",
    ],
    explanation: [
      "DPI means dots per inch. In a picture file it is a small number saved in the file's header that tells a printer how many pixels to place in each inch of paper. It does not change how many pixels the picture contains, so two pictures with the same pixels can carry different DPI values and look identical on a screen.",
      "This checker reads that number straight from the file. JPG files can store it in a JFIF header or in EXIF data, and PNG files store it in a pHYs chunk, which holds pixels per metre. Where a file has more than one value, the EXIF value is shown for JPG, because most programs use it. The tool also shows where the value was found.",
      "The print size is simple arithmetic: pixels divided by DPI gives inches, and multiplying by 2.54 gives centimetres. A picture 2400 pixels wide at 300 DPI prints 8 inches, or about 20.32 cm, wide.",
    ],
    useCases: [
      "Checking a photo before an online form or print shop asks for 300 DPI.",
      "Finding out why a picture imports at an unexpected size in a design program.",
      "Comparing the DPI of several scans.",
    ],
    tips: [
      "If a form asks for a DPI, it usually also asks for pixel dimensions. Check both.",
      "A missing DPI is common in screenshots and pictures saved from web pages.",
      "Changing only the DPI number never improves sharpness. More pixels are needed for that.",
    ],
    faqs: [
      { q: "Does DPI affect picture quality?", a: "Not by itself. Quality depends on the pixel count. DPI only sets the print size that those pixels are spread across." },
      { q: "Why does it say Not set?", a: "The file has no density information. Many programs then assume 72 or 96 DPI." },
      { q: "Which formats work?", a: "JPG and PNG. Other formats such as HEIC or WebP are not read by this tool." },
    ],
    related: ["convert-dpi", "image-resizer", "image-compressor", "increase-image-size-in-kb"],
  },
  {
    slug: "convert-dpi",
    mode: "convert",
    h1: "Convert DPI of an Image (72, 96, 150, 300)",
    title: "Convert Image DPI Online: Set 72, 150, 300 DPI | Paul Digital",
    description: "Change the DPI stored in a JPG or PNG to 72, 96, 150, 300 or any value, without changing its pixels or quality. Free, in your browser, no upload.",
    summary: "Set the DPI stored in a JPG or PNG to 72, 96, 150, 300 or any value, without touching the pixels.",
    intro: "Change the DPI saved in your picture to 300, 150, 72 or any whole number. The pixels are not touched, so quality stays exactly the same.",
    keywords: ["convert dpi", "change dpi", "300 dpi", "72 dpi"],
    steps: [
      "Choose a JPG or PNG picture, or drag it onto the page.",
      "Pick a DPI preset or type your own whole number.",
      "Check the print size shown for that DPI.",
      "Press Set DPI and download the picture.",
    ],
    explanation: [
      "This tool rewrites only the density label inside the file. The picture data is copied byte for byte, so there is no re-compression and no loss of quality, and the pixel width and height stay the same. The new file is checked by reading the DPI back out before it is offered for download.",
      "That also explains what the tool cannot do. Setting 300 DPI on a small picture does not make it a 300 DPI print-quality picture, because it still has the same number of pixels. What changes is the size at which programs and printers place it: more DPI means a smaller print from the same pixels, and less DPI means a larger one.",
      "If a form needs a specific pixel size as well, resize the picture first with the Image Resizer and set the DPI afterwards, because resizing in other tools can reset the DPI.",
    ],
    useCases: [
      "Meeting a form or print shop that asks for a picture saved at 300 DPI.",
      "Changing a 72 DPI screen picture to 150 or 300 before printing.",
      "Making several pictures print at the same size in a layout program.",
    ],
    tips: [
      "Do your resizing first and set the DPI last.",
      "For printing, check the print size shown. If it is too small, you need a picture with more pixels.",
      "JPG and PNG only. Convert other formats first.",
    ],
    faqs: [
      { q: "Does this make my image sharper?", a: "No. Only the number saved in the file changes. The pixels are identical, so sharpness is unchanged." },
      { q: "Will the file size change?", a: "Only by a few bytes. For a PNG without a density chunk, a 21 byte chunk is added." },
      { q: "Is 300 DPI required?", a: "It depends on who asks. Some print shops and forms require 300 DPI, but websites and screens ignore it." },
    ],
    related: ["dpi-checker", "image-resizer", "image-compressor", "increase-image-size-in-kb"],
  },
  {
    slug: "increase-image-size-in-kb",
    mode: "increase",
    h1: "Increase Image Size in KB",
    title: "Increase Image Size in KB (JPG or PNG) Online | Paul Digital",
    description: "Make a JPG or PNG reach a minimum file size in KB by adding invisible padding. Pixels and quality stay the same. Free, in your browser, no upload.",
    summary: "Raise a JPG or PNG to a minimum file size in KB by adding invisible padding.",
    intro: "Some forms need a picture of at least a certain size in KB. Enter the size you need and this tool pads the file to it without changing the picture.",
    keywords: ["increase image size", "increase kb", "minimum file size", "enlarge file size"],
    steps: [
      "Choose a JPG or PNG picture, or drag it onto the page.",
      "Pick a size preset or type the minimum size in KB.",
      "Press Increase file size.",
      "Download the picture and check its size in your file manager.",
    ],
    explanation: [
      "Some upload forms reject pictures that are too small as well as too large. Making a picture bigger in KB honestly means storing more data in the file. This tool does that without changing what you see: it adds a block of blank padding, stored as comments inside the file, until the file reaches your target size.",
      "The picture itself is not re-compressed, resized or altered, so its pixels and quality are exactly the same. The tool checks that the padded file still opens at the same pixel size before offering it. The size is exact in most cases. If it ends up a few bytes over, that is because padding is added in blocks of at least 4 bytes.",
      "Be aware of what this is not. It does not improve the picture, and it will not survive a site that recompresses uploads, because the padding is discarded when the picture is re-encoded. Some websites also inspect uploaded files for other reasons, so this cannot guarantee acceptance. If the picture is small in pixels, a larger picture with more detail is a real fix.",
    ],
    useCases: [
      "Meeting a minimum size such as 20 KB or 50 KB on an upload form.",
      "Making a very small signature or photo scan reach a required size.",
      "Testing how a site handles files of a certain size.",
    ],
    tips: [
      "If you need both a minimum and a maximum, pad to a size comfortably inside the range.",
      "Check the file size in your file manager, which usually shows KB as 1,024 bytes.",
      "If the file already exceeds your target, it is kept as it is.",
    ],
    faqs: [
      { q: "Does the image quality improve?", a: "No. The picture is unchanged. Only invisible padding is added." },
      { q: "Will the picture look different?", a: "No. The file is checked to open at the same pixel size, and the picture data is not touched." },
      { q: "Can I make the file smaller?", a: "Not with this tool. Use the Image Compressor to reduce a file size." },
    ],
    related: ["image-compressor", "dpi-checker", "convert-dpi", "image-resizer"],
  },
];

export const densityToolBySlug = new Map(densityTools.map((tool) => [tool.slug, tool]));
