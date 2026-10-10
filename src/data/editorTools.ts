import type { Faq } from "./formatTools";

export type EditorMode = "resize" | "crop" | "metadata" | "passport" | "signature" | "government" | "ukdigital";

export interface OfficialSource {
  label: string;
  url: string;
  verified: string;
  /** What the source does and does not say, shown on the page. */
  says: string[];
}

export interface EditorTool {
  slug: string;
  mode: EditorMode;
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
  /** Official source for requirement claims, with the date it was checked. */
  sources?: OfficialSource[];
}

export const editorTools: EditorTool[] = [
  {
    slug: "image-resizer",
    mode: "resize",
    h1: "Image Resizer",
    title: "Image Resizer — Pixels, Percent or Centimetres | Paul Digital",
    description:
      "Resize an image by pixels, percentage or centimetres with a DPI setting. Keep or unlock the aspect ratio, preview the new size and download JPG, PNG or WebP. Private, in your browser.",
    summary: "Resize an image by pixels, percentage or centimetres at a DPI you choose, and see the real result.",
    intro: "Change an image's size in pixels, as a percentage, or in centimetres at a DPI you choose. The new dimensions and the real file size are shown before you download.",
    keywords: ["resize", "pixels", "percentage", "cm", "dpi", "scale", "dimensions"],
    steps: [
      "Choose an image, or drag it onto the drop area.",
      "Pick how to resize: pixels, percentage, or centimetres with a DPI.",
      "Enter the new size. Leave “Lock aspect ratio” on to keep the original proportions.",
      "Check the comparison of the original and new dimensions, and choose a format.",
      "Press Resize image, then download the file. The result shows its real size and dimensions.",
    ],
    explanation: [
      "Resizing changes how many pixels an image has. Making an image smaller discards detail; making it larger cannot add detail that was never captured, so enlarged images look softer. This tool halves large images in steps when reducing them so fine detail holds up better than a single jump.",
      "Centimetres only describe a print size once you decide how many pixels fit in each inch. At 300 DPI, 10 cm is about 1181 pixels; at 150 DPI it is about 591. The tool works out the pixel size as centimetres ÷ 2.54 × DPI. The saved file does not store a DPI value, so the size on paper still depends on the printer or software, and changing pixel dimensions alone does not guarantee a particular printed size.",
      "Locking the aspect ratio keeps the picture's proportions by updating one side when you change the other. Unlock it only when you want to stretch or squash the picture. The tool warns you when the new proportions differ from the original.",
      "Output formats are the ones your browser can really save. JPG and WebP are lossy and have a quality setting; PNG is lossless and usually larger for photographs. If a format is missing from the list, your browser cannot save it. Very large outputs are refused (each side up to 12,000 pixels and 50 megapixels) because browsers and phones can run out of memory.",
    ],
    useCases: [
      "Making a photo fit a form or website that states a width and height in pixels.",
      "Shrinking a large camera photo before emailing it.",
      "Preparing an image for print at a stated size in centimetres and DPI.",
    ],
    tips: [
      "Start from the largest original you have, and avoid resizing the same file repeatedly.",
      "For a target file size in KB or MB, use the Image Compressor, which measures the real size as it goes.",
      "Use JPG or WebP for photographs and PNG for screenshots, logos and graphics with sharp edges.",
    ],
    faqs: [
      { q: "Will resizing reduce the file size?", a: "Usually, if you make the picture smaller, but not always. A PNG can be bigger than the original JPG, and a high quality setting can keep a file large. The result panel shows the real size of the file you get." },
      { q: "Does the file remember the DPI I typed?", a: "No. DPI is used only to work out the pixel size from centimetres. The downloaded file does not carry a DPI value, so printing software may assume its own." },
      { q: "Why was my size refused?", a: "Sizes are limited to 12,000 pixels per side and 50 megapixels in total, because larger canvases often fail in browsers. Choose a smaller size." },
      { q: "Is my image uploaded?", a: "No. The picture is processed in your browser and never leaves your device." },
    ],
    related: ["image-compressor", "crop-rotate-flip-image", "image-converter", "passport-photo-resizer"],
  },
  {
    slug: "crop-rotate-flip-image",
    mode: "crop",
    h1: "Crop, Rotate and Flip Image",
    title: "Crop, Rotate and Flip Image Online | Paul Digital",
    description:
      "Crop an image with a draggable box, rotate it in 90-degree steps and flip it horizontally or vertically. Preview the edit and download JPG, PNG or WebP. Nothing is uploaded.",
    summary: "Crop with a draggable box, rotate in 90-degree steps and flip, then export the edited image.",
    intro: "Crop with a draggable box, rotate in 90-degree steps and flip horizontally or vertically. What you see inside the crop box is exactly what is exported.",
    keywords: ["crop", "rotate", "flip", "mirror", "trim", "edit"],
    steps: [
      "Choose an image, or drag it onto the drop area.",
      "Rotate or flip it if needed. The preview updates straight away.",
      "Drag the crop box and its handles, or type exact values. Optionally lock the box to a shape such as 1:1 or 16:9.",
      "Choose a format and press Export.",
      "Check the result, then download it. Press Start again to edit another image.",
    ],
    explanation: [
      "The crop box is applied to the exported file: only the pixels inside it are saved, at their original resolution. The tool will not let the box become empty or leave the image, and it shows the selection size in pixels as you work.",
      "Rotation turns the whole picture by 90 degrees at a time, and flips mirror it left to right or top to bottom. Rotating changes the picture's shape, so the crop box starts again from the largest allowed box. Photos taken sideways on a phone are shown the way a modern browser displays them, using the orientation stored by the camera.",
      "Your original file is never modified. The edited picture is created only when you press Export, and you can go back and adjust it before downloading.",
      "Keyboard users can focus the crop box or any handle and use the arrow keys (hold Shift for larger steps), or type the left, top, width and height values. JPG and WebP exports are recompressed once at the quality you choose; PNG is lossless.",
    ],
    useCases: [
      "Trimming a screenshot or scan down to the part that matters.",
      "Straightening a photo that was saved sideways.",
      "Mirroring a picture or cropping it to a square or 16:9 shape.",
    ],
    tips: [
      "Pick the crop shape first, then position the box, so it keeps its proportions as you resize it.",
      "Use PNG when you want to keep the cropped area exactly as it is, without recompression.",
      "After cropping, use the Image Resizer if the result must also be an exact size.",
    ],
    faqs: [
      { q: "Does the crop box really change the saved image?", a: "Yes. The exported file contains only what is inside the box, and the dimensions in the result panel match the selection." },
      { q: "Does the tool change my original file?", a: "No. It works on a copy in your browser and offers a new file to download." },
      { q: "Why does rotating reset the crop box?", a: "Rotating changes the shape of the picture, so the old box no longer lines up. The box restarts at the largest area available." },
      { q: "Is my image uploaded?", a: "No. Everything happens in your browser." },
    ],
    related: ["image-resizer", "passport-photo-resizer", "image-compressor", "zoom-out-image"],
  },
  {
    slug: "image-metadata",
    mode: "metadata",
    h1: "Image Metadata Viewer and Remover",
    title: "Image Metadata Viewer and Remover (EXIF) | Paul Digital",
    description:
      "See the EXIF and other metadata inside a JPG, PNG or WebP, then remove it into a new file and verify the result. Works in your browser; the image is never uploaded.",
    summary: "See what metadata a JPG, PNG or WebP contains, then save a copy with it removed and checked.",
    intro: "Find out what hidden data a picture carries, such as camera details, dates or GPS location, then save a copy with that metadata removed. Everything stays on your device.",
    keywords: ["exif", "metadata", "gps", "privacy", "remove exif", "strip metadata", "xmp", "iptc"],
    steps: [
      "Choose an image. JPG, PNG and WebP are read directly from the file.",
      "Read the list of metadata found, grouped by type. Fields that cannot be decoded are counted but not shown.",
      "Choose a method: remove the metadata blocks and keep the picture untouched, or redraw the picture into a new file.",
      "Press Create file without metadata.",
      "Read the result, which lists what was removed and how the new file was checked, then download it.",
    ],
    explanation: [
      "Metadata is information stored alongside the pixels. Cameras and phones often write EXIF data, which can include the device model, the date and time, and sometimes GPS coordinates. Editing software can add XMP or IPTC blocks, and some formats allow free text comments.",
      "The viewer reads common EXIF tags, PNG text chunks and similar blocks directly from the file. It only shows values it actually found. If a block exists but cannot be decoded (for example maker notes, XMP or IPTC contents), the tool says it is present and not decoded, rather than guessing. A file type the viewer does not read, such as HEIC or AVIF, is reported as unsupported, which is different from having no metadata.",
      "The default remover copies the picture data unchanged and leaves out the metadata blocks around it, so quality does not change. It then re-reads the new file, checks that no EXIF, XMP, IPTC or comment blocks remain and that no marker text for them appears anywhere in the bytes, and confirms the picture opens at its original size. The alternative method redraws the picture into a new file, which also works for formats the viewer cannot read but recompresses JPG and WebP once.",
      "Limits matter. Removal depends on the file format and on what this tool recognises, so it cannot promise that nothing identifying remains. It does not touch what is visible in the picture, such as faces, street signs or documents, and it cannot remove information from the original file or from copies you already shared. An ICC colour profile is kept by default because removing it can change colours; you can choose to remove it.",
    ],
    useCases: [
      "Checking whether a photo includes a GPS location before you post it.",
      "Sending a picture without its camera, software or date details.",
      "Seeing what a screenshot or exported graphic stored about its origin.",
    ],
    tips: [
      "If the viewer shows an orientation value, removing it can make some apps show the picture sideways. The redraw method applies the rotation for you.",
      "Keep the original file if you need its metadata later; this tool always produces a new file.",
      "Social networks and messaging apps often strip or change metadata themselves, but you should not rely on that.",
    ],
    faqs: [
      { q: "Does this remove all hidden information?", a: "No tool can promise that. It removes the metadata types it recognises (EXIF, XMP, IPTC, comments and text chunks, plus an ICC profile if you choose) and verifies the new file against them. The result panel lists what was removed." },
      { q: "Why does it say my format is not supported?", a: "The viewer reads JPG, PNG and WebP. For other formats it cannot say whether metadata is present, but you can redraw the picture into a new JPG, PNG or WebP, which does not copy the original metadata." },
      { q: "Does the tool need my location?", a: "No. It never asks for location or any other permission. Any GPS data it shows was already inside the file." },
      { q: "Is my image uploaded?", a: "No. The file is read and rewritten in your browser." },
    ],
    related: ["image-converter", "image-compressor", "image-resizer", "crop-rotate-flip-image"],
  },
  {
    slug: "passport-photo-resizer",
    mode: "passport",
    h1: "Passport Photo Resizer",
    title: "Passport Photo Resizer — Crop to Common Sizes | Paul Digital",
    description:
      "Crop and resize a photo to common passport and visa sizes such as 2×2 in, 35×45 mm and 50×70 mm, or a custom size. Preview, set a file-size limit and download. Private, in your browser.",
    summary: "Crop and resize a photo to a common passport or visa size, or your own, and check the real file.",
    intro: "Crop a portrait to a common passport or visa photo size, or enter your own, and export it at exactly that pixel size. You can also aim for a maximum file size.",
    keywords: ["passport", "visa", "id photo", "35x45", "2x2", "photo size", "crop face"],
    steps: [
      "Choose a photo, or drag it onto the drop area.",
      "Pick a size from the list, or choose Custom size and enter pixels.",
      "Move and resize the crop box. It stays locked to the shape of the chosen size.",
      "Optionally set a maximum file size in KB, and choose JPG or PNG.",
      "Press Create, check the preview and dimensions, then download.",
    ],
    explanation: [
      "Each preset names the country or use it is commonly associated with and shows how the pixel size was worked out, for example 35 × 45 mm at 300 DPI is 413 × 531 pixels. These are commonly published sizes, not an official rulebook, and this site is not affiliated with any government.",
      "A photo that is the right size can still be rejected. Authorities and websites also set rules for background colour, head size and position, lighting, expression, glasses, file type and file size, and those rules change. This tool only crops and resizes. It does not check any of those requirements, so compare the result with the official instructions before you submit it.",
      "The crop box is locked to the output shape so the photo is not stretched. If the area you select has fewer pixels than the output size, the photo is enlarged and the tool tells you, because enlarged photos can look soft.",
      "If you enter a maximum file size, the tool lowers JPG or WebP quality step by step until the file fits, and reports the real size. If it cannot get under your limit, it says so rather than pretending. PNG cannot be tuned this way.",
    ],
    useCases: [
      "Preparing a passport, visa or ID photo at a commonly published size.",
      "Cropping a phone photo to a portrait shape for an application form.",
      "Producing a photo at a pixel size an upload form asks for.",
    ],
    tips: [
      "Take the photo against a plain background in even light, facing the camera, before you crop.",
      "Leave room around the head when positioning the box, and check the issuer's head-size rules.",
      "Keep the original photo; this tool never changes it.",
    ],
    faqs: [
      { q: "Will my passport photo be accepted?", a: "This tool cannot promise that. It produces a photo at the size you pick, but acceptance depends on the organisation's current requirements, which include more than size." },
      { q: "Are these the official sizes?", a: "They are sizes commonly published for each country or use. Requirements can change and can differ by application type, so check the official source. You can always use a custom size." },
      { q: "Can I set a file-size limit?", a: "Yes. Enter a maximum in KB and use JPG or WebP. The tool lowers quality until the file fits and shows the actual size, or tells you if it could not fit." },
      { q: "Is my photo uploaded?", a: "No. It is processed in your browser and never leaves your device." },
    ],
    related: ["signature-resizer", "crop-rotate-flip-image", "image-resizer", "image-compressor"],
  },
  {
    slug: "signature-resizer",
    mode: "signature",
    h1: "Signature Resizer",
    title: "Signature Resizer — Crop and Resize a Signature Image | Paul Digital",
    description:
      "Crop a photographed or scanned signature and resize it to a width and height in pixels, with an optional file-size limit. Preview and download JPG or PNG. Private, in your browser.",
    summary: "Crop a signature image and resize it to a pixel size and optional file-size limit.",
    intro: "Crop a photographed or scanned signature and export it at the exact pixel size a form asks for, with an optional maximum file size. Nothing is uploaded.",
    keywords: ["signature", "resize signature", "crop signature", "form upload", "kb"],
    steps: [
      "Choose a picture of your signature, or drag it onto the drop area.",
      "Pick a pixel size, or choose Custom size and type the width and height your form states.",
      "Move and resize the crop box around the signature. It stays locked to the output shape.",
      "Optionally set a maximum file size in KB, and choose JPG or PNG.",
      "Press Create, check the preview and file size, then download.",
    ],
    explanation: [
      "The sizes in the list are example sizes that appear on some online forms. They are not official requirements for any organisation, so use Custom size and type exactly what your form states.",
      "For the cleanest result, sign with a dark pen on plain white paper, photograph or scan it in even light, and crop close to the signature. This tool crops, rotates and resizes; it does not remove backgrounds or fix a shadow.",
      "Because the crop box is locked to the output shape, the signature is never stretched. If the area you select has fewer pixels than the output, it is enlarged and the tool says so.",
      "With a maximum file size set, the tool lowers JPG or WebP quality in steps until the file fits and reports the real size. It tells you plainly when it could not reach your limit. Resizing does not guarantee that a particular website or institution will accept the file.",
    ],
    useCases: [
      "Uploading a signature to an application or exam form that asks for a set size.",
      "Preparing a signature image for a document or email footer.",
      "Reducing a scanned signature to a small file.",
    ],
    tips: [
      "Crop tightly but leave a small margin so strokes are not clipped.",
      "Use JPG with a KB limit for tiny files, or PNG for a crisp signature when size does not matter.",
      "Use Rotate if the photo is sideways before you position the crop box.",
    ],
    faqs: [
      { q: "What size does my form need?", a: "Use the exact size and file-size limit stated by the form or organisation. The listed sizes are only examples." },
      { q: "Can it get my signature under a KB limit?", a: "Often, using JPG or WebP at a modest pixel size. The tool reports the real file size, and says when the limit could not be met." },
      { q: "Does it remove the background?", a: "No. It crops and resizes only. Use a clean white background when you capture the signature." },
      { q: "Is my signature uploaded?", a: "No. It is processed in your browser and never leaves your device." },
    ],
    related: ["passport-photo-resizer", "image-compressor", "image-resizer", "crop-rotate-flip-image"],
  },
  {
    slug: "government-job-photo-signature-resizer",
    mode: "government",
    h1: "Government Job Photo and Signature Resizer",
    title: "Government Job Photo and Signature Resizer | Paul Digital",
    description:
      "Crop and resize a photo or signature to the exact pixel size and minimum and maximum file size in your application notice. Reports the real result. Private, in your browser.",
    summary: "Crop a photo or signature to the pixel size and KB range your application notice states, and check the real file.",
    intro: "Type the width, height and file-size range from your recruitment or exam notice, crop the picture, and get a file that is measured against those numbers. Nothing is uploaded.",
    keywords: ["government job", "recruitment", "application photo", "signature", "kb range", "min kb", "exam form"],
    steps: [
      "Open your application notice or form instructions and note the required width, height, minimum KB and maximum KB for the photo or signature.",
      "Choose your picture, or drag it onto the drop area.",
      "Enter the width and height in pixels, and the minimum and maximum file size in KB. Leave either size box empty if the notice does not give that limit.",
      "Move and resize the crop box. It stays locked to the output shape, so the picture is not stretched.",
      "Press Create, read the measured size and any warnings, then download.",
    ],
    explanation: [
      "Every recruitment body, exam and even each notification can set its own pixel size, file-size range and file type, and they change between cycles. Because of that, this page deliberately has no built-in presets for named exams. You enter the numbers from the notice that applies to you.",
      "With a maximum, the tool lowers JPG or WebP quality in steps until the file fits. With a minimum, it raises quality in steps while the file stays under the maximum. The size shown at the end is the real size of the file you download. If a limit could not be met, the result panel says so instead of presenting the file as correct.",
      "A small or very simple picture can stay below a minimum even at full quality, and a detailed one can stay above a maximum at the lowest quality tried. In those cases change the pixel size if your notice allows it, or start from a better original. PNG is lossless, so its size cannot be tuned.",
      "This tool changes pixel size and file size only. It does not check background colour, face position, ink colour, capital letters, dates on the photo or whether a portal will accept the file, and resizing never guarantees acceptance.",
    ],
    useCases: [
      "Preparing a photo for a government job or exam form that gives a pixel size and a KB range.",
      "Preparing a signature image for the same form.",
      "Checking the real size of a file before you upload it.",
    ],
    tips: [
      "Copy the numbers from the current notice, not from an older year or a third-party site.",
      "Use a photo taken against a plain background in even light, and sign with dark ink on plain white paper.",
      "Keep the original files. This tool always creates a new file.",
    ],
    faqs: [
      { q: "Does this have SSC, UPSC, NEET or railway presets?", a: "No. Those requirements are set per notification and change, and this site has not confirmed them from the official notices, so you enter the numbers yourself." },
      { q: "Can I set only a maximum, or only a minimum?", a: "Yes. Either box can be left empty if your notice does not state that limit." },
      { q: "What if the file is still outside my limits?", a: "The result panel shows a warning with the real size. Adjust the pixel size or use a different original and try again." },
      { q: "Is my photo uploaded?", a: "No. It is processed in your browser and never leaves your device." },
    ],
    related: ["passport-photo-resizer", "signature-resizer", "image-compressor", "jpg-to-pdf"],
  },
  {
    slug: "uk-passport-photo-digital",
    mode: "ukdigital",
    h1: "UK Digital Passport Photo Checker",
    title: "UK Digital Passport Photo Checker — Size and File Size | Paul Digital",
    description:
      "Check a photo against the GOV.UK digital passport photo size rules: at least 600 × 750 pixels and 50 KB to 10 MB. Private, in your browser, and it never crops.",
    summary: "Check a photo against GOV.UK's digital pixel-size and file-size rules for online passport applications.",
    intro: "Find out whether your photo is at least 600 × 750 pixels and between 50 KB and 10 MB, the digital rules GOV.UK states for online passport applications. Nothing is uploaded and nothing is cropped.",
    keywords: ["uk passport", "gov.uk", "digital photo", "600x750", "passport photo upload", "hm passport office"],
    steps: [
      "Choose the photo you plan to upload, or drag it onto the drop area.",
      "Read the measured pixel size and file size against the GOV.UK limits.",
      "If the file is over 10 MB and large enough, make a smaller copy. It is not cropped.",
      "If the pixel size is too small, or the file is under 50 KB, use a different original photo.",
    ],
    explanation: [
      "GOV.UK sets rules for the digital photo you upload with an online passport application. On the page checked on the date below, the photo must be at least 600 pixels wide and 750 pixels tall, and the file at least 50 KB and no more than 10 MB. This tool measures exactly those two things.",
      "Digital and printed photos have different rules. The 35 mm × 45 mm size belongs to printed photos, which GOV.UK covers on a separate page. Converting 35 × 45 mm at 300 DPI gives 413 × 531 pixels, which is below the digital minimum, so a printed-size crop is not a valid digital upload.",
      "GOV.UK says not to crop your digital photo, because it will be done for you. For that reason this page never crops and never enlarges. A copy is made only when a file is over 10 MB, by scaling the whole picture down while keeping it at or above 600 × 750 pixels.",
      "GOV.UK has other rules this tool cannot check: a plain light-coloured background, a photo taken in the last month, no alteration by computer software, and what the photo must show. The page we read does not state a required file format or aspect ratio, so this tool makes no claim about them. Always read the current GOV.UK rules before you apply.",
    ],
    useCases: [
      "Checking a phone photo before an online UK passport application.",
      "Finding out why an upload was refused for being too small or too large.",
      "Making a copy under 10 MB when a camera photo is too big.",
    ],
    tips: [
      "Use the original photo from your camera or phone rather than a copy sent through a messaging app, which is often compressed.",
      "Do not crop or edit the photo yourself.",
      "Stand against a plain light-coloured background in even light.",
    ],
    faqs: [
      { q: "Will my photo be accepted?", a: "This tool cannot promise that. It checks pixel size and file size only; GOV.UK also judges background, lighting, how recent the photo is and what it shows." },
      { q: "Why does this page not crop to 35 × 45 mm?", a: "That is the printed photo size. For digital uploads GOV.UK states a minimum pixel size and says not to crop your photo, so cropping here could cause problems." },
      { q: "What file format is required?", a: "The GOV.UK page we read does not state one, so this tool does not claim one. A smaller copy is saved as a JPG." },
      { q: "Is my photo uploaded?", a: "No. It is measured in your browser and never leaves your device." },
    ],
    related: ["passport-photo-resizer", "image-compressor", "image-resizer", "image-metadata"],
    sources: [
      {
        label: "GOV.UK: Photos for passports",
        url: "https://www.gov.uk/photos-for-passports",
        verified: "10 October 2026",
        says: [
          "Digital photo: at least 600 pixels wide and 750 pixels tall.",
          "File size: at least 50KB and no more than 10MB.",
          "Do not crop your photo - it will be done for you.",
          "Your photo must have been taken in the last month; plain light-coloured background; unaltered by computer software.",
          "Not stated on this page: file format and aspect ratio.",
        ],
      },
      {
        label: "GOV.UK: Printed passport photo requirements",
        url: "https://www.gov.uk/photos-for-passports/photo-requirements",
        verified: "10 October 2026",
        says: ["Printed photos are 45 mm high by 35 mm wide. This is a print rule and does not set the digital pixel size."],
      },
    ],
  },
];

export const editorToolBySlug = new Map(editorTools.map((tool) => [tool.slug, tool]));
