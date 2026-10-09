import type { ImageKind, OutputKind } from "../lib/imageFormats";

export type FormatToolKind = "convert" | "word" | "ocr" | "ico" | "favicon";

export interface Faq {
  q: string;
  a: string;
}

export interface FormatTool {
  slug: string;
  h1: string;
  title: string;
  description: string;
  /** One-line description used on cards and the category page. */
  summary: string;
  kind: FormatToolKind;
  /** Input kinds the tool accepts (checked against the file signature, not the extension). */
  inputs: ImageKind[];
  /** Value for the file input's accept attribute. */
  accept: string;
  /** Human-readable input list. */
  inputLabel: string;
  /** Fixed output, or "choose" to let the user pick (Image Converter). */
  output?: OutputKind | "choose";
  /** File extension of converted output when fixed. */
  outExt?: string;
  actionLabel: string;
  intro: string;
  explanation: string[];
  compatibility: string[];
  useCases: string[];
  tips: string[];
  faqs: Faq[];
  related: string[];
}

const RASTER: ImageKind[] = ["jpeg", "png", "webp", "avif", "heic", "gif", "bmp"];
const RASTER_ACCEPT = ".jpg,.jpeg,.jfif,.png,.webp,.avif,.heic,.heif,.gif,.bmp,image/*";

export const formatTools: FormatTool[] = [
  {
    slug: "image-converter",
    h1: "Image Converter",
    title: "Image Converter — JPG, PNG, WebP Online, Private | Paul Digital",
    description:
      "Convert JPG, PNG, WebP, AVIF, HEIC, GIF and BMP images to JPG, PNG or WebP in your browser. Nothing is uploaded, and transparency is handled honestly.",
    summary: "Choose an input and output format and convert images in your browser.",
    kind: "convert",
    inputs: RASTER,
    accept: RASTER_ACCEPT,
    inputLabel: "JPG, PNG, WebP, AVIF, HEIC, GIF or BMP",
    output: "choose",
    actionLabel: "Convert",
    intro: "Pick the format you have and the format you want, then convert one or many images in your browser. Nothing is uploaded.",
    explanation: [
      "This is the general-purpose converter. Select which input format you expect (or leave it on automatic) and choose JPG, PNG or WebP as the output. Every file is identified by its real contents rather than its file name, so a mislabelled file is reported instead of silently producing a broken result.",
      "Converting to JPG fills transparent areas with white because JPEG cannot store transparency. Converting to PNG or WebP keeps transparency. JPG and lossy WebP are lossy formats, so converting a file into them re-encodes the pixels; PNG output is lossless but often much larger for photos.",
    ],
    compatibility: [
      "JPG, PNG, GIF, BMP and WebP are decoded by every current browser. AVIF needs Chrome 85+, Edge 121+, Firefox 93+ or Safari 16.4+. HEIC is decoded natively in Safari and by a built-in decoder that loads only when you add a HEIC file. Animated GIF and WebP files are converted using their first frame.",
      "WebP output requires a browser that can encode WebP (Chrome, Edge, Firefox). Safari cannot encode WebP, and the tool will tell you so rather than hand you a different format under the wrong name.",
    ],
    useCases: [
      "Turn a WebP or AVIF download into a JPG or PNG that older software accepts.",
      "Convert a PNG screenshot to a smaller JPG for email.",
      "Batch-convert a folder of photos to one format before uploading.",
    ],
    tips: [
      "Use PNG when you need transparency or crisp text and line art; use JPG for photographs.",
      "Keep your original files. Converting to a lossy format discards detail you cannot get back.",
      "Lower the JPG or WebP quality slider to get a smaller file.",
    ],
    faqs: [
      { q: "Which formats can I convert between?", a: "You can read JPG, PNG, WebP, AVIF, HEIC, GIF and BMP files and write JPG, PNG or WebP. Support for AVIF, HEIC and WebP output depends on your browser, and the tool reports it when something is unavailable." },
      { q: "Why does my transparent PNG get a white background?", a: "Only when you convert to JPG. JPEG has no transparency, so transparent pixels are flattened onto white. Choose PNG or WebP to keep transparency." },
      { q: "Can it convert animated images?", a: "The converter outputs a single still image, using the first frame of an animated GIF or WebP." },
    ],
    related: ["image-to-jpg", "webp-to-png", "heic-to-jpg", "favicon-generator"],
  },
  {
    slug: "image-to-jpg",
    h1: "Image to JPG",
    title: "Image to JPG Converter — PNG, WebP, HEIC to JPG | Paul Digital",
    description:
      "Convert PNG, WebP, AVIF, HEIC, GIF or BMP images to JPG in your browser with adjustable quality. Nothing is uploaded.",
    summary: "Convert PNG, WebP, HEIC, AVIF, GIF and BMP images to JPG.",
    kind: "convert",
    inputs: RASTER,
    accept: RASTER_ACCEPT,
    inputLabel: "PNG, WebP, AVIF, HEIC, GIF, BMP or JPG",
    output: "jpeg",
    outExt: "jpg",
    actionLabel: "Convert to JPG",
    intro: "Turn almost any common image into a standard JPG file, right in your browser. Nothing is uploaded.",
    explanation: [
      "JPG is the most widely accepted photo format: forms, email clients, marketplaces and older software all take it. This tool decodes the image you provide and saves it as a baseline JPG with the quality you choose.",
      "Because JPG cannot store transparency, any transparent area becomes white. Because JPG is lossy, the pixels are re-encoded once; keep your original if you may need it later.",
    ],
    compatibility: [
      "Accepted input: PNG, WebP, AVIF, HEIC/HEIF, GIF, BMP and existing JPG files. WebP, GIF, BMP and PNG work in every current browser. AVIF needs Chrome 85+, Edge 121+, Firefox 93+ or Safari 16.4+. HEIC loads a small decoder on demand outside Safari.",
      "Animated GIF or WebP files become a single JPG from the first frame.",
    ],
    useCases: [
      "Upload a WebP product photo to a site that only accepts JPG.",
      "Convert iPhone HEIC pictures for sharing with someone on Windows.",
      "Prepare screenshots as JPG for email or messaging.",
    ],
    tips: [
      "Quality 85–92% looks identical to most eyes and is much smaller than 100%.",
      "Screenshots with sharp text can look soft in JPG; try PNG for those.",
      "Use the Image Compressor afterwards if you need a specific file size.",
    ],
    faqs: [
      { q: "Does it keep the original image quality?", a: "JPG is a lossy format, so a small amount of detail is lost in conversion. At the default 92% quality the difference is hard to see." },
      { q: "What happens to transparent areas?", a: "They are filled with white, since JPG cannot hold transparency. Use PNG or WebP output in the Image Converter if you must keep it." },
      { q: "Can I convert many images at once?", a: "Yes. Add several files, convert them together, and download each result or all of them as one ZIP." },
    ],
    related: ["png-to-jpeg", "webp-to-jpg", "heic-to-jpg", "image-converter"],
  },
  {
    slug: "jpeg-to-jpg",
    h1: "JPEG to JPG",
    title: "JPEG to JPG Converter — Rename and Re-export | Paul Digital",
    description:
      "Convert .jpeg files to valid .jpg files in your browser. The image is re-exported as a standard JPEG with a .jpg extension. Nothing is uploaded.",
    summary: "Export .jpeg files as standard .jpg files.",
    kind: "convert",
    inputs: ["jpeg"],
    accept: ".jpeg,.jpg,.jpe,.jfif,image/jpeg",
    inputLabel: "JPEG (.jpeg, .jpg)",
    output: "jpeg",
    outExt: "jpg",
    actionLabel: "Convert to JPG",
    intro: "Get a clean .jpg file from a .jpeg file. The image is decoded and re-exported as a valid JPEG in your browser.",
    explanation: [
      "JPEG and JPG are the same format; the shorter extension exists only because older Windows versions required three-letter extensions. Many upload forms nevertheless insist on .jpg, and this tool gives you exactly that.",
      "Rather than simply renaming the file, it decodes the picture and writes a fresh, standard JPEG. That also normalises files with an EXIF rotation flag so they appear upright everywhere, but it means the image is re-encoded once, which can change the file size slightly. Metadata such as camera details and GPS location is not carried over.",
    ],
    compatibility: [
      "Accepts files whose contents are JPEG, including .jpeg, .jpg, .jpe and .jfif. A file that only has a .jpeg name but is actually another format is rejected with a clear message.",
      "Works in every current browser.",
    ],
    useCases: [
      "Satisfy a form field that rejects the .jpeg extension.",
      "Normalise a batch of photos to one consistent extension.",
      "Strip camera and location metadata while exporting.",
    ],
    tips: [
      "Raise the quality to 95% or more to minimise re-encoding loss.",
      "If you only need a different extension and no re-encoding, you can rename the file yourself; the format is identical.",
      "Check the output size afterwards if an upload has a limit.",
    ],
    faqs: [
      { q: "Is JPEG different from JPG?", a: "No. They are the same format and open in exactly the same programs. Only the extension differs." },
      { q: "Does converting reduce quality?", a: "The image is re-encoded once, so there is a tiny quality cost. Choose a high quality setting to keep it negligible." },
      { q: "Is EXIF data kept?", a: "No. The browser re-draws the picture, so camera, date and GPS metadata are removed, though orientation is applied so the image looks right." },
    ],
    related: ["jfif-to-jpg", "jpeg-to-png", "image-to-jpg", "png-to-jpeg"],
  },
  {
    slug: "heic-to-jpg",
    h1: "HEIC to JPG",
    title: "HEIC to JPG Converter — iPhone Photos, Private | Paul Digital",
    description:
      "Convert HEIC and HEIF photos from iPhone to JPG in your browser using a built-in decoder. Nothing is uploaded and no software is needed.",
    summary: "Convert iPhone HEIC/HEIF photos to JPG.",
    kind: "convert",
    inputs: ["heic"],
    accept: ".heic,.heif,image/heic,image/heif",
    inputLabel: "HEIC / HEIF",
    output: "jpeg",
    outExt: "jpg",
    actionLabel: "Convert to JPG",
    intro: "Convert HEIC photos from an iPhone or iPad to JPG that opens anywhere. Decoding happens in your browser; nothing is uploaded.",
    explanation: [
      "HEIC is the default photo format on recent iPhones. It is efficient, but Windows, many websites and older apps cannot open it. This tool decodes the HEIC file and saves it as a standard JPG.",
      "Safari decodes HEIC natively. In other browsers a WebAssembly decoder (heic2any, built on libheif) is downloaded only when you choose a HEIC file, about 1.3 MB, so other pages stay light. The first conversion may take a few seconds on large photos.",
    ],
    compatibility: [
      "Works in current Chrome, Edge, Firefox and Safari. Decoding runs on your device and large photos can take several seconds and a fair amount of memory on phones.",
      "Some HEIF variants (certain HDR, depth or burst images and some Live Photo containers) may not decode. The tool will report that clearly instead of producing a broken file. Only the main still image is converted; depth maps and video parts are ignored, and metadata is not copied.",
    ],
    useCases: [
      "Send iPhone photos to someone using Windows or an older phone.",
      "Upload HEIC photos to a site that only accepts JPG.",
      "Free up compatibility for printing at a photo kiosk.",
    ],
    tips: [
      "You can also set an iPhone to capture as Most Compatible (JPG) in Camera settings.",
      "Convert in smaller batches on a phone to avoid running out of memory.",
      "Use quality 90% or higher for photos you may print.",
    ],
    faqs: [
      { q: "Are my photos uploaded?", a: "No. Decoding and conversion run entirely in your browser. Only the decoder code is downloaded, never your pictures." },
      { q: "Why did my HEIC file fail to convert?", a: "The file may be corrupt, protected or a HEIF variant the decoder does not support. Try exporting the photo again from your phone as a JPG or opening it in Photos first." },
      { q: "Does it work in every browser?", a: "It works in current Chrome, Edge, Firefox and Safari. Very old browsers without WebAssembly are not supported." },
    ],
    related: ["image-to-jpg", "image-converter", "avif-to-jpg", "webp-to-jpg"],
  },
  {
    slug: "webp-to-jpg",
    h1: "WebP to JPG",
    title: "WebP to JPG Converter — Online and Private | Paul Digital",
    description:
      "Convert WebP images to JPG in your browser. Adjust quality, convert many files at once, and keep everything on your device.",
    summary: "Decode WebP images and save them as JPG.",
    kind: "convert",
    inputs: ["webp"],
    accept: ".webp,image/webp",
    inputLabel: "WebP",
    output: "jpeg",
    outExt: "jpg",
    actionLabel: "Convert to JPG",
    intro: "Convert WebP images to widely supported JPG files in your browser. Nothing is uploaded.",
    explanation: [
      "WebP is common on the modern web, but many editors, printers and upload forms still ask for JPG. This tool decodes your WebP file and exports a standard JPG at the quality you choose.",
      "If the WebP has transparency, it is flattened onto a white background, because JPG cannot store it. Use WebP to PNG instead if you need to keep transparency.",
    ],
    compatibility: [
      "WebP decoding is built into Chrome, Edge, Firefox and Safari 14+. Animated WebP files are converted using their first frame only.",
      "Both lossy and lossless WebP files are accepted; the output is always an ordinary lossy JPG.",
    ],
    useCases: [
      "Save a downloaded WebP image in a format your editor opens.",
      "Upload a WebP picture to a form that only allows JPG.",
      "Share web images with people on older devices.",
    ],
    tips: [
      "A lossless WebP converted to JPG will lose some detail; use 92% or higher quality.",
      "If the WebP has a transparent background, convert to PNG instead.",
      "Check the size afterwards; a JPG can be larger than a lossy WebP of the same picture.",
    ],
    faqs: [
      { q: "Will the JPG be larger than the WebP?", a: "Often yes. WebP compresses more efficiently than JPG, so an equivalent-quality JPG is commonly bigger." },
      { q: "What happens to transparency?", a: "It is replaced with white. For transparency, use the WebP to PNG converter." },
      { q: "Does it work with animated WebP?", a: "Only the first frame is converted, producing a still JPG." },
    ],
    related: ["webp-to-png", "image-to-jpg", "avif-to-jpg", "image-converter"],
  },
  {
    slug: "webp-to-png",
    h1: "WebP to PNG",
    title: "WebP to PNG Converter — Keep Transparency | Paul Digital",
    description:
      "Convert WebP images to lossless PNG in your browser, preserving transparency. Nothing is uploaded and no software is needed.",
    summary: "Convert WebP to PNG and keep transparency.",
    kind: "convert",
    inputs: ["webp"],
    accept: ".webp,image/webp",
    inputLabel: "WebP",
    output: "png",
    outExt: "png",
    actionLabel: "Convert to PNG",
    intro: "Convert WebP images to PNG while keeping transparent areas intact. Everything runs in your browser.",
    explanation: [
      "PNG is lossless and fully supports transparency, which makes it the safest target when you need to edit a WebP image, place it in a document, or use it with software that does not read WebP yet.",
      "The conversion decodes every pixel of the WebP, including its alpha channel, and writes it to PNG exactly. A lossy WebP will not regain detail it already lost, and PNG files for photographs are usually much larger than the WebP.",
    ],
    compatibility: [
      "WebP decoding works in Chrome, Edge, Firefox and Safari 14+. PNG output works in every browser, so this converter does not depend on WebP encoding support.",
      "Animated WebP files are converted using their first frame.",
    ],
    useCases: [
      "Use a transparent WebP logo in an editor that lacks WebP support.",
      "Archive web images in a lossless format.",
      "Prepare assets for software that only reads PNG.",
    ],
    tips: [
      "PNG is best for logos, icons and screenshots; it can be very large for photos.",
      "Run the PNG through the Image Compressor if you need a smaller file.",
      "Keep the WebP original if file size matters for the web.",
    ],
    faqs: [
      { q: "Is transparency preserved?", a: "Yes. The alpha channel from the WebP is written into the PNG without flattening." },
      { q: "Why is the PNG so much bigger?", a: "PNG stores pixels losslessly and is less efficient than WebP for photographs. That is expected." },
      { q: "Does it improve a low-quality WebP?", a: "No. Conversion cannot restore detail that was already discarded when the WebP was created." },
    ],
    related: ["webp-to-jpg", "jpeg-to-png", "png-to-ico", "image-converter"],
  },
  {
    slug: "avif-to-jpg",
    h1: "AVIF to JPG",
    title: "AVIF to JPG Converter — Online and Private | Paul Digital",
    description:
      "Convert AVIF images to JPG in your browser when it supports AVIF decoding. Clear errors if it does not. Nothing is uploaded.",
    summary: "Convert AVIF images to JPG where your browser supports AVIF.",
    kind: "convert",
    inputs: ["avif"],
    accept: ".avif,image/avif",
    inputLabel: "AVIF",
    output: "jpeg",
    outExt: "jpg",
    actionLabel: "Convert to JPG",
    intro: "Convert AVIF pictures to ordinary JPG files. Decoding uses your browser, and nothing is uploaded.",
    explanation: [
      "AVIF produces very small files at good quality, but support in editors, printers and upload forms is still patchy. This tool decodes the AVIF file and saves a standard JPG.",
      "It uses the AVIF decoder built into your browser instead of shipping a heavy one, so it works only where your browser can open AVIF. If it cannot, the tool tells you, rather than pretending to convert. Transparency becomes white in the JPG.",
    ],
    compatibility: [
      "AVIF decoding is available in Chrome 85+, Edge 121+, Firefox 93+ and Safari 16.4+. Older browsers cannot decode AVIF and will show an error.",
      "Only still AVIF images are supported. Animated AVIF files produce a still image or an error depending on your browser. HDR and 10-bit images are tone-mapped to standard 8-bit colour by the browser.",
    ],
    useCases: [
      "Open a downloaded AVIF in software that only supports JPG.",
      "Upload an AVIF photo to a form that rejects it.",
      "Share AVIF images with people on older devices.",
    ],
    tips: [
      "If conversion fails, try the latest version of Chrome, Edge or Firefox.",
      "Expect the JPG to be larger than the AVIF at the same quality.",
      "Choose PNG in the Image Converter to keep transparency.",
    ],
    faqs: [
      { q: "Why does it say my browser cannot decode AVIF?", a: "Your browser has no AVIF decoder. Update to a current Chrome, Edge, Firefox or Safari 16.4+, then try again." },
      { q: "Is the file uploaded to be converted?", a: "No. The browser decodes the file on your device." },
      { q: "Will the JPG look identical?", a: "Very similar at high quality, but JPG is a different lossy codec, so some fine detail may differ." },
    ],
    related: ["webp-to-jpg", "image-to-jpg", "heic-to-jpg", "image-converter"],
  },
  {
    slug: "jfif-to-jpg",
    h1: "JFIF to JPG",
    title: "JFIF to JPG Converter — Online and Private | Paul Digital",
    description:
      "Convert .jfif files to standard .jpg files in your browser. Valid JFIF/JPEG input only, with clear errors for anything else. Nothing is uploaded.",
    summary: "Turn .jfif files into standard .jpg files.",
    kind: "convert",
    inputs: ["jpeg"],
    accept: ".jfif,.jpe,.jpg,.jpeg,image/jpeg",
    inputLabel: "JFIF (.jfif) or JPEG",
    output: "jpeg",
    outExt: "jpg",
    actionLabel: "Convert to JPG",
    intro: "Convert .jfif images to ordinary .jpg files that every program opens. Everything runs in your browser.",
    explanation: [
      "JFIF (JPEG File Interchange Format) is the container that most JPEG files use. Some browsers and Windows features save images with a .jfif extension, which many apps and websites do not recognise. The image data inside is normal JPEG.",
      "This tool checks that the file is really JPEG/JFIF data, decodes it, and exports a new .jpg. Files that are not JPEG, such as a WebP renamed to .jfif, are rejected with an explanation.",
    ],
    compatibility: [
      "Works in every current browser. Input must start with the JPEG signature; the tool tells you when a file does not contain a JFIF header but is still valid JPEG data, and converts it anyway.",
      "The picture is re-encoded once, and metadata is not copied.",
    ],
    useCases: [
      "Upload a downloaded .jfif image to a site that wants .jpg.",
      "Make .jfif images open in photo editors and phones.",
      "Normalise a mix of image extensions.",
    ],
    tips: [
      "Since JFIF is plain JPEG, you can often just rename the file to .jpg; use this tool when you want a verified, freshly written file.",
      "Use quality 92% or higher to avoid visible re-compression loss.",
      "Prevent Edge or Chrome from saving .jfif by saving images as PNG or using Save As.",
    ],
    faqs: [
      { q: "Is JFIF the same as JPG?", a: "Effectively yes. JFIF is the file wrapper used by JPEG images, and the pictures inside are identical in kind." },
      { q: "Why do I get .jfif files?", a: "Some browsers and Windows versions label downloaded JPEG images with the .jfif extension." },
      { q: "What if my file is not JPEG?", a: "The tool detects the real format and rejects it with a message naming what it found, so you can use the Image Converter instead." },
    ],
    related: ["jpeg-to-jpg", "image-to-jpg", "jpeg-to-png", "image-converter"],
  },
  {
    slug: "jpeg-to-png",
    h1: "JPEG to PNG",
    title: "JPEG to PNG Converter — Online and Private | Paul Digital",
    description:
      "Convert JPEG and JPG images to lossless PNG in your browser. Nothing is uploaded, and the result is verified before download.",
    summary: "Convert JPEG/JPG images to PNG.",
    kind: "convert",
    inputs: ["jpeg"],
    accept: ".jpg,.jpeg,.jfif,.jpe,image/jpeg",
    inputLabel: "JPG / JPEG",
    output: "png",
    outExt: "png",
    actionLabel: "Convert to PNG",
    intro: "Convert JPEG or JPG photos to PNG in your browser. Nothing is uploaded.",
    explanation: [
      "PNG stores every pixel without further loss, so it is a good working format for editing, annotating and archiving an image you already have. Converting a JPEG to PNG does not restore detail that JPEG compression already removed.",
      "Expect a larger file: PNG versions of photographs are typically several times bigger than the JPEG. The PNG will not have transparency, because a JPEG has no transparent pixels to carry over.",
    ],
    compatibility: [
      "Works in every current browser. Photos with an EXIF rotation flag are saved upright. Metadata such as camera model and GPS is not copied into the PNG.",
      "Very large photos need memory to decode; the tool limits input to 50 MB and 100 megapixels.",
    ],
    useCases: [
      "Edit a photo repeatedly without adding fresh JPEG compression each save.",
      "Use an image in software that requires PNG.",
      "Add transparency later in an image editor starting from a lossless file.",
    ],
    tips: [
      "Use JPEG for photographs you share, PNG for graphics, screenshots and editing.",
      "If the PNG is too large, compress it afterwards with the Image Compressor.",
      "Converting back to JPEG later will lose a little quality again.",
    ],
    faqs: [
      { q: "Does converting JPEG to PNG improve quality?", a: "No. It keeps what is in the JPEG exactly but cannot bring back detail that was already lost." },
      { q: "Why is the PNG larger?", a: "PNG compresses without loss and is less efficient than JPEG for photographs." },
      { q: "Will it be transparent?", a: "No. JPEG images have no transparency, so the PNG is fully opaque." },
    ],
    related: ["png-to-jpeg", "webp-to-png", "jpeg-to-jpg", "png-to-ico"],
  },
  {
    slug: "png-to-jpeg",
    h1: "PNG to JPEG",
    title: "PNG to JPEG Converter — Smaller Files, Private | Paul Digital",
    description:
      "Convert PNG images to JPEG in your browser with adjustable quality. Transparent areas are flattened onto white. Nothing is uploaded.",
    summary: "Convert PNG to JPEG; transparency is flattened onto white.",
    kind: "convert",
    inputs: ["png"],
    accept: ".png,image/png",
    inputLabel: "PNG",
    output: "jpeg",
    outExt: "jpeg",
    actionLabel: "Convert to JPEG",
    intro: "Convert PNG images to compact JPEG files. Transparent areas are filled with white. Nothing is uploaded.",
    explanation: [
      "A PNG photograph or screenshot can be many times larger than a JPEG of the same picture. Converting to JPEG is the quickest way to shrink it for email, forms and websites.",
      "JPEG cannot store transparency. The tool draws your PNG onto a white background before encoding, so transparent pixels become white. If your logo needs to stay transparent, keep the PNG or convert to WebP in the Image Converter. JPEG is lossy, so very sharp text and line art may show faint artifacts; raise the quality for those.",
    ],
    compatibility: [
      "Works in every current browser. The output uses the .jpeg extension; use the JPEG to JPG converter if a form needs .jpg.",
      "Semi-transparent pixels are blended with white, which can make soft shadows look slightly different from how they appear over a coloured page.",
    ],
    useCases: [
      "Make a large PNG screenshot small enough to email.",
      "Submit a PNG as a JPEG where only JPEG is allowed.",
      "Flatten a transparent graphic for printing on white paper.",
    ],
    tips: [
      "Use 90–95% quality for text-heavy images and 80–90% for photos.",
      "Do not convert logos you still need transparent; keep the PNG too.",
      "Run the Image Compressor afterwards if you need to hit an exact file size.",
    ],
    faqs: [
      { q: "What happens to the transparent parts of my PNG?", a: "They are filled with solid white, because JPEG has no transparency. That is a deliberate, disclosed choice, not an error." },
      { q: "Will the JPEG be smaller?", a: "Usually, for photographs and gradients. Simple flat graphics can occasionally be similar in size or larger." },
      { q: "Can I convert many PNG files at once?", a: "Yes. Add several PNGs, convert, and download each file or a ZIP of all of them." },
    ],
    related: ["image-to-jpg", "jpeg-to-png", "jpeg-to-jpg", "image-converter"],
  },
  {
    slug: "png-to-ico",
    h1: "PNG to ICO",
    title: "PNG to ICO Converter — Multi-size Icon Files | Paul Digital",
    description:
      "Convert a PNG image into a valid multi-size .ico icon file in your browser, with 16 to 256 px sizes. Nothing is uploaded.",
    summary: "Create a valid multi-size .ico file from a PNG.",
    kind: "ico",
    inputs: ["png"],
    accept: ".png,image/png",
    inputLabel: "PNG",
    actionLabel: "Create ICO",
    intro: "Turn a PNG into a Windows-style .ico icon with the sizes you choose. Created in your browser; nothing is uploaded.",
    explanation: [
      "An ICO file bundles several sizes of the same icon so that Windows, browsers and shortcuts can pick the sharpest one. This tool resizes your PNG to each size you select and packs them into a single valid .ico file, using PNG-compressed images inside the container. Transparency is preserved.",
      "For best results start with a square PNG at least 256 × 256 px. If your image is not square, choose whether to fit it with transparent padding or crop it from the centre. After creation the tool re-reads the file and lists the sizes it contains.",
    ],
    compatibility: [
      "PNG-in-ICO is supported by Windows Vista and later, macOS, and all current browsers for favicons. Very old software (Windows XP era) may not read 256 px PNG entries.",
      "Sizes from 16 to 256 px can be included. For a website favicon set with more files, use the Favicon Generator.",
    ],
    useCases: [
      "Create a favicon.ico for a website.",
      "Make an icon for a Windows shortcut or desktop application.",
      "Package one logo in several icon sizes.",
    ],
    tips: [
      "Start from a simple, high-contrast square design; tiny sizes lose detail quickly.",
      "Include at least 16, 32 and 48 px for broad compatibility.",
      "Check how the icon looks at 16 px before publishing it.",
    ],
    faqs: [
      { q: "Is the ICO file valid?", a: "Yes. It has the standard ICONDIR header, one directory entry per size, and PNG data for each image. The tool re-reads the file after building it to confirm this." },
      { q: "Which sizes should I include?", a: "16, 32 and 48 px cover most uses. Add 64, 128 or 256 px for desktop icons and high-resolution displays." },
      { q: "What if my PNG is not square?", a: "Choose fit with transparent padding to keep the whole picture, or crop to fill the square from the centre." },
    ],
    related: ["favicon-generator", "webp-to-png", "jpeg-to-png", "image-converter"],
  },
  {
    slug: "image-to-word",
    h1: "Image to Word",
    title: "Image to Word — Put Images in a DOCX | Paul Digital",
    description:
      "Place one or more images into a downloadable Word .docx document in your browser, one per page. Nothing is uploaded. Does not extract editable text.",
    summary: "Put images into a downloadable Word (.docx) document.",
    kind: "word",
    inputs: RASTER,
    accept: RASTER_ACCEPT,
    inputLabel: "JPG, PNG, WebP, AVIF, HEIC, GIF or BMP",
    actionLabel: "Create Word document",
    intro: "Place images into a real Word .docx document, one per page, in your browser. The pictures stay pictures: this does not turn them into editable text.",
    explanation: [
      "This tool builds a standard .docx file (Office Open XML) that contains your images, sized to fit an A4 or US Letter page with sensible margins. You can then add text around them, resize them or print the document from Word, LibreOffice or Google Docs.",
      "Embedding an image does not make its words editable. If you need the text from a picture or screenshot, use JPG to Text or PNG to Text, which run optical character recognition (OCR), then paste the result into your document.",
    ],
    compatibility: [
      "JPG and PNG files are embedded exactly as supplied (JPEG files that rely on an EXIF rotation flag are re-saved upright). WebP, AVIF, HEIC, GIF and BMP files are converted to PNG first, so they appear in every version of Word. Animated images use the first frame.",
      "The document opens in Microsoft Word 2007 or later, LibreOffice Writer, Google Docs and Apple Pages. Images are not scaled up beyond their natural 96 dpi size. Very large collections create large files, since images are stored as they are.",
    ],
    useCases: [
      "Insert a scanned form or receipt into a Word file for submission.",
      "Collect several screenshots into one document, one per page.",
      "Prepare images for annotation in Word.",
    ],
    tips: [
      "Use the arrows to put the pages in the order you need before creating the document.",
      "Wide images get a landscape page automatically.",
      "Compress very large photos first to keep the .docx small.",
    ],
    faqs: [
      { q: "Does this convert the image into editable text?", a: "No. The image is placed in the document as a picture. To extract text, use JPG to Text or PNG to Text, which perform OCR." },
      { q: "Can I add several images?", a: "Yes. Each image is placed on its own page in the order you choose." },
      { q: "Will it open in Word?", a: "Yes. The result is a standard .docx file that Word 2007+, LibreOffice and Google Docs can open." },
    ],
    related: ["jpg-to-text", "png-to-text", "image-to-jpg", "image-converter"],
  },
  {
    slug: "jpg-to-text",
    h1: "JPG to Text",
    title: "JPG to Text — Free OCR in Your Browser | Paul Digital",
    description:
      "Extract text from a JPG image with OCR running locally in your browser (English). Copy or download the result. Nothing is uploaded.",
    summary: "Extract text from a JPG using OCR in your browser (English).",
    kind: "ocr",
    inputs: ["jpeg"],
    accept: ".jpg,.jpeg,.jfif,.jpe,image/jpeg",
    inputLabel: "JPG / JPEG",
    actionLabel: "Extract text",
    intro: "Read the text out of a JPG photo or scan using OCR that runs on your device. English only. Nothing is uploaded.",
    explanation: [
      "This tool uses Tesseract, an open-source optical character recognition engine compiled to WebAssembly, to recognise printed text in your JPG. The image, the engine and the English language data all stay on your device. The OCR files are served from Paul Digital itself, not from a third-party CDN.",
      "OCR is never perfect. Accuracy is best with sharp, well-lit, straight printed text in English at a decent size. It is poor for handwriting, decorative fonts, tiny text, curved pages and low-contrast photos. If nothing is recognised the tool says so instead of showing an empty success. Always proofread the result.",
    ],
    compatibility: [
      "Needs a browser with WebAssembly and Web Workers (all current Chrome, Edge, Firefox and Safari). The first run downloads about 8 MB of OCR engine and language data, which the browser then caches. Large images take longer and use more memory; images over 25 megapixels are rejected.",
      "Only English is supported at present, so other languages and scripts will be recognised poorly or not at all.",
    ],
    useCases: [
      "Copy text from a photo of a printed page or sign.",
      "Pull text out of a screenshot saved as JPG.",
      "Digitise a receipt or letter for searching.",
    ],
    tips: [
      "Photograph text straight-on with even lighting and no glare.",
      "Crop to just the text area; extra background can add noise.",
      "Use a higher-resolution image; text should be at least about 20 px tall.",
    ],
    faqs: [
      { q: "Is my image uploaded for OCR?", a: "No. Recognition runs in your browser. The engine and language file are downloaded from this site, but your image never leaves your device." },
      { q: "Why is the text wrong or missing?", a: "OCR struggles with blur, small or stylised text, handwriting and low contrast. Try a sharper, higher-contrast, cropped image." },
      { q: "Does it support other languages?", a: "Not yet. Only English is installed, so other languages will not be read reliably." },
    ],
    related: ["png-to-text", "image-to-word", "image-to-jpg", "image-converter"],
  },
  {
    slug: "png-to-text",
    h1: "PNG to Text",
    title: "PNG to Text — Free OCR for Screenshots | Paul Digital",
    description:
      "Extract text from PNG screenshots and images with OCR running locally in your browser (English). Copy or download the text. Nothing is uploaded.",
    summary: "Extract text from a PNG or screenshot using OCR (English).",
    kind: "ocr",
    inputs: ["png"],
    accept: ".png,image/png",
    inputLabel: "PNG",
    actionLabel: "Extract text",
    intro: "Turn the words in a PNG screenshot or image into text you can copy, using OCR that runs on your device. English only.",
    explanation: [
      "PNG screenshots usually contain crisp, high-contrast text, which is where OCR works best. This tool runs the open-source Tesseract engine in your browser and shows the recognised text along with an average confidence score so you know how much to trust it.",
      "Transparent areas are placed on a white background before recognition, so text on a transparent PNG is still read. Results are never guaranteed: stylised fonts, light text on busy backgrounds, tiny type and non-English text are often wrong. If no text can be recognised you are told so, and no empty file is offered.",
    ],
    compatibility: [
      "Requires WebAssembly and Web Workers, available in all current Chrome, Edge, Firefox and Safari releases. The first run downloads roughly 8 MB of engine and English language data from this site and caches it.",
      "English only. Images above 25 megapixels are rejected to protect memory. Animated PNG is read from its first frame.",
    ],
    useCases: [
      "Copy an error message or code snippet from a screenshot.",
      "Extract text from a chat or document screenshot.",
      "Make a scanned PNG page searchable by pasting its text.",
    ],
    tips: [
      "Screenshot at 100% zoom or larger; very small text is unreliable.",
      "Dark mode screenshots can work, but light text on dark may lower accuracy.",
      "Crop out toolbars and menus to avoid stray characters.",
    ],
    faqs: [
      { q: "Does it work on screenshots of code?", a: "Often, but OCR can confuse similar characters such as 0/O and 1/l, and may lose indentation. Check the result before using it." },
      { q: "Is it private?", a: "Yes. Your PNG is processed locally. Nothing is sent to a server." },
      { q: "What does the confidence number mean?", a: "It is the engine's own average certainty across recognised words. A low value means you should proofread carefully." },
    ],
    related: ["jpg-to-text", "image-to-word", "image-converter", "webp-to-png"],
  },
  {
    slug: "favicon-generator",
    h1: "Favicon Generator",
    title: "Favicon Generator — favicon.ico and PNG Icons | Paul Digital",
    description:
      "Generate favicon.ico, PNG favicons, an Apple touch icon and Android icons from one image in your browser. Valid files and a ready-to-paste HTML snippet. Nothing is uploaded.",
    summary: "Generate favicon.ico, PNG, Apple touch and Android icons from one image.",
    kind: "favicon",
    inputs: RASTER,
    accept: RASTER_ACCEPT,
    inputLabel: "PNG, JPG, WebP, AVIF, HEIC, GIF or BMP",
    actionLabel: "Generate favicons",
    intro: "Create a complete favicon set, favicon.ico, PNG icons and touch icons, from a single image, plus the HTML to use them. All in your browser.",
    explanation: [
      "Browsers, phones and search results each look for icons at different sizes. This tool produces the common set: a multi-size favicon.ico (16, 32 and 48 px), favicon PNGs at 16 and 32 px, an Apple touch icon at 180 px, and Android/Chrome icons at 192 and 512 px. You can download each file separately or take everything as one ZIP.",
      "Start from a square image of at least 512 × 512 px for the sharpest results. The favicon.ico is a valid ICO file with PNG-compressed entries, checked after it is built. Transparency is kept in the PNG and ICO files; the Apple touch icon is placed on a solid background because iOS does not support transparent touch icons.",
    ],
    compatibility: [
      "The generated set works in all current browsers. Raster images only: SVG files are not accepted by this version. Non-square images can be fitted with padding or cropped from the centre.",
      "Very small sizes cannot hold much detail, so simple, bold designs work best. After uploading the files to your site, a browser may keep showing the old icon until its cache clears.",
    ],
    useCases: [
      "Add a favicon to a new website.",
      "Prepare home-screen icons for a progressive web app.",
      "Replace an outdated site icon with a crisp multi-size set.",
    ],
    tips: [
      "Use a bold, simple, square design with generous padding.",
      "Place favicon.ico at your site root and add the generated link tags to your <head>.",
      "Pick a background colour that matches your brand for the touch icon.",
    ],
    faqs: [
      { q: "Which files does it create?", a: "favicon.ico (16, 32, 48 px), favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png (180 px), android-chrome-192x192.png and android-chrome-512x512.png, plus an HTML snippet." },
      { q: "Is favicon.ico really needed?", a: "Modern browsers also accept PNG icons, but favicon.ico at the site root is still requested by many tools and older browsers, so including it is a safe choice." },
      { q: "Why does the touch icon have a background?", a: "iOS fills transparent areas of touch icons with black, so the tool places your image on a colour you choose instead." },
    ],
    related: ["png-to-ico", "webp-to-png", "image-converter", "jpeg-to-png"],
  },
];

export const formatToolBySlug = new Map(formatTools.map((tool) => [tool.slug, tool]));
