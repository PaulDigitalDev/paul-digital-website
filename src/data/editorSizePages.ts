import type { EditorTool } from "./editorTools";
import type { Faq } from "./formatTools";
import type { SizePreset } from "./photoPresets";
import { examPhotoPages } from "./examPhotoPages";

/* Search-intent landing pages for the Image Resizer and the crop-to-size tools. Each page opens the same working tool with a goal
   already filled in (a unit, or an exact output size). The text on every page is written for that size: the pixel counts are
   computed here, and the sections about use and mistakes differ page by page. Nothing here claims that an organisation accepts a size. */

const DPI = 300;
const mmToPx = (mm: number, dpi = DPI) => Math.round((mm / 25.4) * dpi);
const fmt = (n: number, digits = 1) => String(Number(n.toFixed(digits)));
const NOTICE = "Resizing produces the size you choose. It cannot make an organisation accept the file, because forms and offices also set rules for background, head position, file type and file size.";

type Start = NonNullable<EditorTool["start"]>;

interface Fixed {
  w: number;
  h: number;
  /** Short human label such as "35 × 45 mm". */
  label: string;
  /** Millimetres the pixels were worked out from, when the size is a printed one. */
  mm?: { w: number; h: number };
}

interface Page {
  slug: string;
  mode: EditorTool["mode"];
  h1: string;
  title: string;
  description: string;
  summary: string;
  intro: string;
  keywords: string[];
  start?: Start;
  fixed?: Fixed;
  /** Paragraphs written for this page only. */
  about: string[];
  uses: string[];
  tips: string[];
  faqs: Faq[];
  related: string[];
}

const pixelTable = (mmW: number, mmH: number) =>
  [150, 300, 600].map((d) => `${mmToPx(mmW, d)} × ${mmToPx(mmH, d)} px at ${d} DPI`).join("; ");

function fixedPreset(f: Fixed): SizePreset {
  return {
    id: `fixed-${f.w}x${f.h}`,
    label: `${f.label} — ${f.w} × ${f.h} px`,
    region: "This page's size",
    w: f.w,
    h: f.h,
    physical: f.mm ? `${fmt(f.mm.w)} × ${fmt(f.mm.h)} mm at ${DPI} DPI` : undefined,
    note: "The crop box is locked to this shape, so the picture is cropped rather than stretched.",
  };
}

const cropSteps = (f: Fixed) => [
  "Choose a photo, or drag it onto the drop area. It stays on your device.",
  `The size is already set to ${f.label} (${f.w} × ${f.h} pixels). You can switch to a custom pixel size if your form asks for something else.`,
  "Drag the crop box over the part of the picture you want to keep. It stays locked to the right shape, so nothing is stretched.",
  "If the form has a file-size limit, type the maximum in KB. The tool lowers JPG quality until the file fits and shows the real size.",
  "Press Create, check the preview and the pixel size, then download the file.",
];

const resizeSteps = (unitWord: string) => [
  "Choose an image, or drag it onto the drop area. It stays on your device.",
  `Pick ${unitWord}, then enter the width and height you need. With Lock aspect ratio on, the second value follows the first so the picture is not squashed.`,
  "Check the DPI. It only decides how many pixels each unit holds, so the same size at a higher DPI gives a bigger, sharper file.",
  "Choose JPG, PNG or WebP and, for JPG or WebP, the quality. The preview shows the new pixel size before you save.",
  "Press Resize image, then download the result. The original file is never changed.",
];

const pages: Page[] = [
  {
    slug: "resize-image-in-cm",
    mode: "resize",
    h1: "Resize Image in cm",
    title: "Resize Image in cm — Set Width and Height in Centimetres | Paul Digital",
    description: "Resize an image to a width and height in centimetres. Choose the DPI, keep the proportions, see the exact pixel size and download. Free and private, in your browser.",
    summary: "Resize an image to a size in centimetres at a DPI you choose, and see the pixel size it produces.",
    intro: "Type a width and height in centimetres, choose a DPI, and get an image with exactly the matching number of pixels. The conversion is shown so you can check it.",
    keywords: ["resize image in cm", "image size in centimetres", "cm to pixels", "photo size in cm"],
    start: { mode: "cm", unit: "cm", dpi: 300 },
    about: [
      "A picture file does not have a printed size on its own. It is a grid of pixels, and centimetres only appear once you decide how many pixels fit in an inch. This page does that sum for you: pixels = centimetres ÷ 2.54 × DPI. A 6 cm × 4 cm image at 300 DPI is 709 × 472 pixels, and the same 6 × 4 cm at 72 DPI is only 170 × 113 pixels.",
      "Forms that ask for a size in centimetres usually expect the picture to look right when printed or placed in a template, not a specific DPI tag. That is why the tool lets you pick the DPI yourself. Use 300 for anything that will be printed, and 96 or 150 when the image only has to look correct on a screen or fit under a size limit.",
      "The saved file does not carry a DPI value that every program respects, so a viewer may still describe it by its pixel count. The pixel count is the part that is exact, and it is shown before you download.",
    ],
    uses: [
      "Making a photo that prints at a stated width and height, such as 9 × 13 cm.",
      "Filling a template or document box that is specified in centimetres.",
      "Matching a form that says a picture must be, for example, 3.5 cm wide.",
    ],
    tips: ["Leave Lock aspect ratio on unless you really want to stretch the picture.", "If you need an exact shape that differs from the photo, crop to that shape instead, so nothing is distorted.", "Raise the DPI, not the centimetres, if the result looks too small or soft."],
    faqs: [
      { q: "How do I convert centimetres to pixels?", a: "Divide the centimetres by 2.54 to get inches, then multiply by the DPI. At 300 DPI, 1 cm is about 118 pixels." },
      { q: "What DPI should I use?", a: "300 DPI is the usual choice for print. For a screen or an upload with a file-size limit, 96 to 150 DPI is usually enough." },
      { q: "Will the image be stretched?", a: "Not while Lock aspect ratio is on. If you turn it off and enter a shape that differs from the original, the tool warns you that the picture will look stretched." },
    ],
    related: ["image-resizer", "resize-image-in-mm", "resize-image-in-inch", "image-compressor"],
  },
  {
    slug: "resize-image-in-mm",
    mode: "resize",
    h1: "Resize Image in mm",
    title: "Resize Image in mm — Millimetre Width and Height to Pixels | Paul Digital",
    description: "Resize an image by width and height in millimetres. Pick the DPI, see the exact pixel size and download JPG, PNG or WebP. Free, private and done in your browser.",
    summary: "Resize an image to a size in millimetres at a DPI you choose, and see the pixel size it produces.",
    intro: "Enter a width and height in millimetres and a DPI, and the tool works out the pixel size, resizes the picture and shows the result before you download.",
    keywords: ["resize image in mm", "mm to pixels", "image size in millimetres", "photo size mm"],
    start: { mode: "cm", unit: "mm", dpi: 300 },
    about: [
      "Millimetres are the unit most photo and ID sizes are written in, for example 35 × 45 mm. To turn that into pixels you need a DPI: pixels = millimetres ÷ 25.4 × DPI. At 300 DPI, 35 × 45 mm is 413 × 531 pixels, at 150 DPI it is 207 × 265 pixels, and at 600 DPI it is 827 × 1063 pixels.",
      "Because the conversion divides by 25.4, small rounding differences are normal: a size that does not land on a whole pixel is rounded to the nearest one. The tool shows the exact pixel width and height it will use, so you can see the rounding instead of guessing.",
      "If your goal is a fixed shape such as 35 × 45 mm from a larger photo, the better route is to crop to that shape first so the face or subject is not stretched. This page is for scaling a whole picture to a size in millimetres.",
    ],
    uses: ["Scaling a picture to the millimetre size a template or print shop gives you.", "Checking how many pixels a printed size needs at a given DPI.", "Producing a small image for a label, badge or card layout."],
    tips: ["Write the size the same way the form does (width first, then height).", "Use 300 DPI if the image will be printed and 96 DPI if it only has to fit a screen.", "Check the pixel size in the preview, not just the millimetres."],
    faqs: [
      { q: "How many pixels is 1 mm?", a: "At 300 DPI, 1 mm is about 11.8 pixels. At 150 DPI it is about 5.9 pixels. The value depends on the DPI." },
      { q: "Is a larger DPI always better?", a: "No. A higher DPI gives more pixels and a bigger file. It helps for printing but does nothing for a form that only checks pixel size or KB." },
      { q: "Can I keep the proportions?", a: "Yes. Lock aspect ratio is on by default, so changing one side changes the other to match the picture." },
    ],
    related: ["image-resizer", "resize-image-in-cm", "resize-image-to-35mmx45mm", "passport-photo-resizer"],
  },
  {
    slug: "resize-image-in-inch",
    mode: "resize",
    h1: "Resize Image in Inches",
    title: "Resize Image in Inches — Inch Size to Pixels at Any DPI | Paul Digital",
    description: "Resize an image to a width and height in inches. Choose the DPI, see the pixel size and download. Works for print sizes like 4×6 and 5×7. Private, in your browser.",
    summary: "Resize an image to a size in inches at a DPI you choose, and see the pixel size it produces.",
    intro: "Enter the width and height in inches, set the DPI, and get an image with the matching pixel size. It works for standard print sizes such as 4 × 6 or 8 × 10.",
    keywords: ["resize image in inches", "inches to pixels", "image size in inches", "4x6 pixels"],
    start: { mode: "cm", unit: "in", dpi: 300 },
    about: [
      "Inches are the simplest case because DPI is already pixels per inch: pixels = inches × DPI. A 4 × 6 inch print is 1200 × 1800 pixels at 300 DPI, 600 × 900 at 150 DPI, and 2400 × 3600 at 600 DPI. A 5 × 7 inch print is 1500 × 2100 pixels at 300 DPI.",
      "Most print labs ask for roughly 300 DPI for a sharp photo, although many accept less for large prints viewed from a distance. If you only need the picture to fit a screen or an upload limit, you do not need 300 DPI, and a lower value keeps the file small.",
      "Print sizes also have an aspect ratio. A 4 × 6 print is 3:2, an 8 × 10 print is 5:4, and a phone photo is often 4:3 or 16:9. Forcing a different shape squashes the picture, so crop first if the shapes do not match.",
    ],
    uses: ["Getting a photo to the pixel size a print lab suggests for a 4 × 6, 5 × 7 or 8 × 10 print.", "Preparing artwork for a frame or card of a known size.", "Checking how big a print an existing image can support."],
    tips: ["Compare the shape of your photo with the print shape before you resize.", "Do not enlarge a small image a lot and expect a sharp print. Resizing cannot add detail.", "Keep the original file in case you want a different size later."],
    faqs: [
      { q: "How do I convert inches to pixels?", a: "Multiply the inches by the DPI. For example, 6 inches at 300 DPI is 1800 pixels." },
      { q: "How many pixels do I need for a 4×6 photo?", a: "1200 × 1800 pixels gives 300 DPI. 600 × 900 pixels is enough for 150 DPI, which still looks fine for many casual prints." },
      { q: "Does resizing change the quality?", a: "Shrinking an image is safe. Enlarging it cannot add detail, so the tool warns you when the new size is larger than the original." },
    ],
    related: ["image-resizer", "resize-image-to-4x6", "resize-image-in-cm", "resize-image-to-2x2"],
  },
  {
    slug: "resize-image-pixel",
    mode: "resize",
    h1: "Resize Image in Pixels",
    title: "Resize Image in Pixels — Exact Width and Height | Paul Digital",
    description: "Resize an image to an exact width and height in pixels, or by percentage. Keep the proportions, choose JPG, PNG or WebP, and download. Free, private, in your browser.",
    summary: "Resize an image to an exact pixel width and height, or scale it by a percentage.",
    intro: "Set an exact width and height in pixels, or scale by a percentage. Lock the aspect ratio to avoid stretching, then choose the format and download the result.",
    keywords: ["resize image pixel", "change image dimensions", "image width height pixels", "resize photo pixels"],
    start: { mode: "pixels" },
    about: [
      "Pixel size is the number that matters for most websites and uploads: social platforms, application forms and content systems check the width and height in pixels, not the print size. This page changes exactly that, and the result is verified by re-reading the saved file, so the size you see is the size you get.",
      "There are three common situations. If a form says an image must be, say, 800 × 600 pixels, enter those numbers and turn off Lock aspect ratio only if the picture is already that shape. If you just need a smaller copy, use the percentage mode, where 50 percent halves both sides and leaves a quarter of the pixels. If you need one side only, such as a 1200 px wide banner, enter the width with the lock on and the height follows.",
      "Making an image smaller keeps it sharp, while making it larger cannot add detail. Doubling the width of a small picture mostly makes the same detail bigger, so it may look soft. The tool tells you when the new size is larger than the original.",
    ],
    uses: ["Making an image fit an upload field that states a width and height.", "Shrinking a large photo before you email it or post it.", "Creating a thumbnail or a fixed-width banner."],
    tips: ["Resize to the largest size you need, then keep that copy, rather than resizing repeatedly.", "If the shape you need is different from the photo, crop to that shape first so the picture is not squashed.", "To also meet a size in KB, use the image compressor afterwards."],
    faqs: [
      { q: "How do I resize without losing quality?", a: "Make the image smaller rather than larger, save as PNG for graphics or at a high JPG quality for photos, and avoid repeated resaves." },
      { q: "How do I keep the proportions?", a: "Keep Lock aspect ratio on. Changing the width then sets the height automatically." },
      { q: "What if the form needs a size in KB as well?", a: "Resize here first, then use the image compressor to bring the file under the KB limit, since the two limits are separate." },
    ],
    related: ["image-resizer", "image-compressor", "crop-rotate-flip-image", "resize-image-to-600x600-pixel"],
  },
  {
    slug: "resize-image-to-3.5cmx4.5cm",
    mode: "passport",
    h1: "Resize Image to 3.5cm x 4.5cm",
    title: "Resize Image to 3.5cm x 4.5cm — Crop a Photo to 413×531 px | Paul Digital",
    description: "Crop and resize a photo to 3.5 cm × 4.5 cm (413 × 531 pixels at 300 DPI) without stretching. Set a KB limit and download. Free, private, in your browser.",
    summary: "Crop a photo to 3.5 cm × 4.5 cm, exported at 413 × 531 pixels, with an optional file-size limit.",
    intro: "Crop a photo to the 3.5 cm × 4.5 cm shape and export it at 413 × 531 pixels. The crop box is locked to the shape, so the face is never stretched.",
    keywords: ["3.5cm x 4.5cm photo", "35x45 mm photo size", "3.5 x 4.5 cm pixels", "passport photo 3.5cm"],
    fixed: { w: mmToPx(35), h: mmToPx(45), label: "3.5 × 4.5 cm", mm: { w: 35, h: 45 } },
    about: [
      "3.5 cm × 4.5 cm is the same size as 35 × 45 mm. At 300 DPI it is 413 × 531 pixels, which is what this page produces. The other common settings work out to " + pixelTable(35, 45) + ".",
      "The shape is a tall rectangle with a ratio of about 7:9. A square or landscape photo has to be cropped to fit it, and the crop box here is locked to that shape for exactly that reason: stretching a face to fit is the usual mistake that gets a photo rejected.",
      "A correct size is only one rule of several. Offices and websites also set the background colour, how large the head must be, and sometimes a maximum file size in KB. This page only handles the crop, the pixel size and the KB limit, so check the other rules in the instructions you were given.",
    ],
    uses: ["Cropping a portrait to a commonly used 3.5 × 4.5 cm photo shape.", "Producing a 413 × 531 px image for a form that asks for that size.", "Preparing a print file where the photo will be placed at 3.5 × 4.5 cm."],
    tips: ["Take the original with the face centred and some space around the head.", "Add a KB limit only if your form states one, and read the real size in the result.", NOTICE],
    faqs: [
      { q: "How many pixels is 3.5 cm x 4.5 cm?", a: "At 300 DPI it is 413 × 531 pixels. At 150 DPI it is 207 × 265 pixels and at 600 DPI it is 827 × 1063 pixels." },
      { q: "Is 3.5 x 4.5 cm the same as 35 x 45 mm?", a: "Yes. 3.5 cm is 35 mm and 4.5 cm is 45 mm, so the two are the same size written in different units." },
      { q: "Will this photo be accepted?", a: "Size is only one requirement. Check the background, head size and file rules from the organisation that asked for it." },
    ],
    related: ["resize-image-to-35mmx45mm", "passport-photo-resizer", "image-compressor", "resize-image-in-mm"],
  },
  {
    slug: "resize-image-to-35mmx45mm",
    mode: "passport",
    h1: "Resize Image to 35mm x 45mm",
    title: "Resize Image to 35mm x 45mm — Photo Crop for 413×531 px | Paul Digital",
    description: "Resize and crop a photo to 35 mm × 45 mm, exported at 413 × 531 pixels (300 DPI). Lock the shape, set a KB limit and download. Free and private, in your browser.",
    summary: "Crop a photo to 35 mm × 45 mm at 413 × 531 pixels, with an optional file-size limit.",
    intro: "Crop and resize a picture to 35 mm × 45 mm. The result is 413 × 531 pixels at 300 DPI, and you can set a maximum file size in KB before you download.",
    keywords: ["35mm x 45mm photo", "35x45 mm in pixels", "resize image 35x45mm", "passport 35x45"],
    fixed: { w: mmToPx(35), h: mmToPx(45), label: "35 × 45 mm", mm: { w: 35, h: 45 } },
    about: [
      "35 × 45 mm is a printed photo size used by many countries for identity documents and visas. This page works at 300 DPI, so the output is 413 × 531 pixels. If your form asks for a different resolution, the same size is " + pixelTable(35, 45) + ".",
      "Pixels and millimetres are two ways of describing the same photo. Printed at 300 DPI, 413 × 531 pixels measures 35 × 45 mm, while the same pixels printed at 150 DPI would measure about 70 × 90 mm. That is why a form that only asks for pixels and a print shop that asks for millimetres can both be satisfied by the same file.",
      "The crop box locks the shape. If you move it, the face is cropped, not stretched, and the tool shows a warning if the area you chose is smaller than the output so the picture had to be enlarged. For a sharp result, start from a photo that is at least the output size.",
    ],
    uses: ["Making a 35 × 45 mm photo for an identity or visa application, where that size is requested.", "Preparing the file you send to a print shop for 35 × 45 mm prints.", "Checking what 35 × 45 mm means in pixels."],
    tips: ["Keep the head centred and leave room above it before cropping.", "Use the KB limit only when the form gives one, and use JPG for it.", NOTICE],
    faqs: [
      { q: "What is 35mm x 45mm in pixels?", a: "413 × 531 pixels at 300 DPI. At 150 DPI it is 207 × 265 pixels, and at 600 DPI it is 827 × 1063 pixels." },
      { q: "Can I get this under 100 KB?", a: "Yes. Enter 100 as the maximum KB, choose JPG, and the tool lowers the quality until the file fits, or tells you it could not." },
      { q: "Is the face stretched?", a: "No. The crop box keeps the 35:45 shape, so the picture is cropped rather than distorted." },
    ],
    related: ["resize-image-to-3.5cmx4.5cm", "passport-photo-resizer", "image-compressor", "resize-image-in-mm"],
  },
  {
    slug: "resize-image-to-2x2",
    mode: "passport",
    h1: "Resize Image to 2x2 Inches",
    title: "Resize Image to 2x2 Inches — Square Photo at 600×600 px | Paul Digital",
    description: "Crop and resize a photo to 2 × 2 inches, exported at 600 × 600 pixels (300 DPI). Square crop, optional KB limit, free and private in your browser.",
    summary: "Crop a photo to a 2 × 2 inch square, exported at 600 × 600 pixels, with an optional file-size limit.",
    intro: "Crop a photo to a 2 × 2 inch square and export it at 600 × 600 pixels at 300 DPI. A square crop box keeps the face from being stretched.",
    keywords: ["2x2 photo", "resize image to 2x2 inch", "2x2 inch in pixels", "600x600 photo"],
    fixed: { w: 600, h: 600, label: "2 × 2 in (square)", mm: { w: 50.8, h: 50.8 } },
    about: [
      "A 2 × 2 inch photo is a square of 50.8 mm on each side. At 300 DPI it is exactly 600 × 600 pixels, which is also the pixel size many online forms ask for. At other resolutions the same size is 300 × 300 px at 150 DPI and 1200 × 1200 px at 600 DPI.",
      "Because the shape is a square, almost every phone photo has to be cropped, and you decide which part to keep. The crop box here stays square as you resize it. If you use a rectangular photo without cropping, a tool that squashes it would make faces look wide or narrow, which is a common reason photos are rejected.",
      "The 600 × 600 result is also useful for profile pictures and avatars, where a square image is expected. For those uses the print size does not matter, only the pixel count does.",
    ],
    uses: ["Producing a 2 × 2 inch square photo where an application asks for that size.", "Making a 600 × 600 pixel square image for an upload field or avatar.", "Preparing a square print file at 300 DPI."],
    tips: ["Frame the face in the middle of the square, with space above the head.", "If the form lists a KB limit, enter it and use JPG.", NOTICE],
    faqs: [
      { q: "How many pixels is 2x2 inches?", a: "600 × 600 pixels at 300 DPI. At 150 DPI it is 300 × 300 pixels, and at 600 DPI it is 1200 × 1200 pixels." },
      { q: "Is 2x2 inches the same as 51 x 51 mm?", a: "Yes, 2 inches is 50.8 mm, which is usually rounded to 51 mm." },
      { q: "Can I make a larger square?", a: "Yes. Choose a custom size in pixels. If the source photo is smaller than the output, the tool warns that the picture was enlarged." },
    ],
    related: ["resize-image-to-600x600-pixel", "passport-photo-resizer", "resize-image-in-inch", "image-compressor"],
  },
  {
    slug: "resize-image-to-3x4-cm",
    mode: "passport",
    h1: "Resize Image to 3x4 cm",
    title: "Resize Image to 3x4 cm — Crop a Photo to 354×472 px | Paul Digital",
    description: "Crop and resize a photo to 3 cm × 4 cm, exported at 354 × 472 pixels (300 DPI). Locked 3:4 shape, optional KB limit, free and private in your browser.",
    summary: "Crop a photo to 3 cm × 4 cm at 354 × 472 pixels, with an optional file-size limit.",
    intro: "Crop a photo to 3 cm × 4 cm and export it at 354 × 472 pixels at 300 DPI. The crop box stays in the 3:4 shape so the face is not stretched.",
    keywords: ["3x4 cm photo", "resize image 3x4 cm", "3 cm x 4 cm in pixels", "3x4 photo size"],
    fixed: { w: mmToPx(30), h: mmToPx(40), label: "3 × 4 cm", mm: { w: 30, h: 40 } },
    about: [
      "3 × 4 cm is a small portrait size with a 3:4 shape, the same shape as many phone photos in portrait mode. At 300 DPI it is 354 × 472 pixels. The same size is " + pixelTable(30, 40) + ".",
      "This page uses centimetres. A 3 × 4 inch photo is a different and much bigger size (900 × 1200 pixels at 300 DPI), so check which unit your form means before you save. If you need the larger one, choose Custom size and enter 900 and 1200.",
      "Because the 3:4 shape is close to a typical portrait photo, the crop usually removes only a little from the edges, which keeps most of the picture.",
    ],
    uses: ["Making a 3 × 4 cm photo for a form or printed card that asks for that size.", "Preparing a small portrait file at 354 × 472 pixels.", "Cropping a phone portrait to a clean 3:4 shape."],
    tips: ["Read the unit on the form: cm and inches are very different here.", "Leave a little space around the head before you set the crop.", NOTICE],
    faqs: [
      { q: "How many pixels is 3x4 cm?", a: "354 × 472 pixels at 300 DPI. At 150 DPI it is 177 × 236 pixels." },
      { q: "Is 3x4 cm the same as 3x4 inches?", a: "No. 3 × 4 inches is about 7.6 × 10.2 cm, which is far larger. Check which unit your form uses." },
      { q: "Can I add a KB limit?", a: "Yes. Enter the maximum KB, choose JPG, and the tool lowers the quality until the file fits." },
    ],
    related: ["resize-image-to-3.5cmx4.5cm", "passport-photo-resizer", "resize-image-in-cm", "image-compressor"],
  },
  {
    slug: "resize-image-to-4x6",
    mode: "passport",
    h1: "Resize Image to 4x6 Inches",
    title: "Resize Image to 4x6 Inches — Photo Print Size at 1200×1800 px | Paul Digital",
    description: "Crop and resize a photo to a 4 × 6 inch print, exported at 1200 × 1800 pixels (300 DPI). Locked 2:3 shape, free and private in your browser.",
    summary: "Crop a photo to a 4 × 6 inch print shape, exported at 1200 × 1800 pixels.",
    intro: "Crop a photo to the 4 × 6 inch print shape and export it at 1200 × 1800 pixels at 300 DPI. The crop box keeps the 2:3 ratio so nothing is stretched.",
    keywords: ["4x6 photo size", "resize image to 4x6", "4x6 inches in pixels", "4x6 print"],
    fixed: { w: 1200, h: 1800, label: "4 × 6 in", mm: { w: 101.6, h: 152.4 } },
    about: [
      "4 × 6 inches is the standard small print. At 300 DPI it is 1200 × 1800 pixels, and the same print is 600 × 900 pixels at 150 DPI or 2400 × 3600 pixels at 600 DPI. The shape is 2:3, the same as most camera sensors, so photos from a camera need little cropping, while phone photos (often 3:4) lose a little at the sides.",
      "Print shops usually tell you the pixel size they prefer, and most are happy with 1200 × 1800. A bigger file does not give a better 4 × 6 print once you pass about 300 DPI, so there is rarely a reason to go higher.",
      "For a landscape print, rotate the photo first with the rotate buttons so that the longer side runs the right way, then set the crop.",
    ],
    uses: ["Preparing photos for a 4 × 6 print order.", "Making a postcard-sized image at 1200 × 1800 pixels.", "Checking how the shape of a photo changes when it is cropped to 2:3."],
    tips: ["Rotate first if the photo is landscape, so the long side is the tall side.", "Keep the original; print sizes are easy to recreate from it.", "Avoid enlarging a small photo to reach 1200 × 1800, because it will print soft."],
    faqs: [
      { q: "How many pixels is a 4x6 photo?", a: "1200 × 1800 pixels at 300 DPI. That is the usual size for a sharp 4 × 6 print." },
      { q: "Why is my photo cropped?", a: "A 4 × 6 print is 2:3. If your photo has a different shape, part of it must be cut off to fill the print, and you choose which part." },
      { q: "Can I do a landscape 6x4?", a: "Yes. Rotate the photo with the rotate buttons first, then crop." },
    ],
    related: ["resize-image-in-inch", "resize-image-to-2x2", "image-resizer", "crop-rotate-flip-image"],
  },
  {
    slug: "resize-image-to-6cmx2cm",
    mode: "signature",
    h1: "Resize Image to 6cm x 2cm",
    title: "Resize Image to 6cm x 2cm — Crop to 709×236 px | Paul Digital",
    description: "Crop and resize an image to 6 cm × 2 cm, exported at 709 × 236 pixels (300 DPI). Locked 3:1 shape, optional KB limit. Free and private, in your browser.",
    summary: "Crop an image to 6 cm × 2 cm at 709 × 236 pixels, with an optional file-size limit.",
    intro: "Crop a picture to a wide 6 cm × 2 cm strip and export it at 709 × 236 pixels at 300 DPI. The crop box is locked to the 3:1 shape.",
    keywords: ["6cm x 2cm image", "resize image 6x2 cm", "6cm x 2cm in pixels", "signature 6x2 cm"],
    fixed: { w: mmToPx(60), h: mmToPx(20), label: "6 × 2 cm", mm: { w: 60, h: 20 } },
    about: [
      "6 × 2 cm is a wide strip with a 3:1 shape, a size often used for signatures and name strips on forms. At 300 DPI it is 709 × 236 pixels. The same size is " + pixelTable(60, 20) + ".",
      "A signature scan is usually a different shape from the box it has to fit. Cropping to 3:1 first, with a little blank space around the writing, gives a cleaner result than squeezing the whole page into the box, which flattens the letters.",
      "Signature uploads often come with a file-size limit as well. Enter it as the maximum KB, choose JPG, and the tool shows the real size after saving.",
    ],
    uses: ["Making a 6 × 2 cm signature or name strip for a form.", "Cropping a scanned signature into a wide, clean rectangle.", "Producing a 709 × 236 px banner-shaped image."],
    tips: ["Sign in dark ink on plain white paper and photograph it in even light.", "Keep a small margin around the signature when you place the crop box.", NOTICE],
    faqs: [
      { q: "How many pixels is 6cm x 2cm?", a: "709 × 236 pixels at 300 DPI. At 150 DPI it is 354 × 118 pixels." },
      { q: "Can I use this for a signature?", a: "Yes, where a form asks for a signature at this size. The tool only crops and resizes; check the form for background and file-type rules." },
      { q: "How do I keep the file small?", a: "Use JPG and enter a maximum KB. The tool lowers the quality until the file fits and shows the actual size." },
    ],
    related: ["resize-signature-to-50mmx20mm", "signature-resizer", "image-compressor", "resize-image-in-cm"],
  },
  {
    slug: "resize-image-to-600x600-pixel",
    mode: "passport",
    h1: "Resize Image to 600x600 Pixels",
    title: "Resize Image to 600x600 Pixels — Square Crop for Uploads | Paul Digital",
    description: "Crop and resize any image to exactly 600 × 600 pixels. Square crop box, optional KB limit, JPG, PNG or WebP. Free and private, done in your browser.",
    summary: "Crop any image to exactly 600 × 600 pixels, with an optional file-size limit.",
    intro: "Crop an image to a square and export it at exactly 600 × 600 pixels. Choose JPG, PNG or WebP and add a KB limit if the upload field needs one.",
    keywords: ["600x600 pixel image", "resize image 600x600", "square image 600 px", "600 x 600 photo"],
    fixed: { w: 600, h: 600, label: "600 × 600 px" },
    about: [
      "600 × 600 pixels is a square that many upload forms and marketplaces accept. Because it is stated in pixels, the size is exact regardless of any DPI. If you measure it in print terms, it is 2 × 2 inches at 300 DPI or 5.1 × 5.1 cm at 300 DPI.",
      "The square shape means a landscape or portrait photo has to be cropped. The crop box here stays square, so you choose which part of the picture to keep. A small source image can be enlarged to reach 600 pixels, but the tool warns you when that happens because enlarged pictures look soft.",
      "If the platform also limits the file size, enter the maximum in KB. For photos JPG is the best format, while PNG is better for logos and flat graphics.",
    ],
    uses: ["Making a 600 × 600 px profile picture or product image.", "Meeting an upload field that asks for an exact square.", "Producing a square thumbnail from a larger photo."],
    tips: ["Place the main subject near the centre of the square.", "Use JPG for photos and PNG for logos with sharp edges.", "Start from an image at least 600 pixels wide for a sharp result."],
    faqs: [
      { q: "Does it stretch my picture?", a: "No. The crop box is a square, so the picture is cropped and not distorted." },
      { q: "Can I make it 600x600 and under 100 KB?", a: "Yes. Enter 100 as the maximum KB with JPG and the tool lowers the quality until it fits." },
      { q: "What if my image is smaller than 600 pixels?", a: "It is enlarged, and the tool tells you. For a sharper result use a bigger original." },
    ],
    related: ["resize-image-to-2x2", "resize-image-pixel", "image-compressor", "crop-rotate-flip-image"],
  },
  {
    slug: "resize-image-to-a4-size",
    mode: "passport",
    h1: "Resize Image to A4 Size",
    title: "Resize Image to A4 Size — 2480×3508 px at 300 DPI | Paul Digital",
    description: "Crop and resize an image to A4 (210 × 297 mm), exported at 2480 × 3508 pixels at 300 DPI. Locked page shape, free and private, done in your browser.",
    summary: "Crop an image to A4 proportions (210 × 297 mm), exported at 2480 × 3508 pixels.",
    intro: "Crop an image to the A4 page shape and export it at 2480 × 3508 pixels at 300 DPI, the size a full-page print at 300 DPI needs.",
    keywords: ["resize image to a4", "a4 size in pixels", "a4 image 300 dpi", "210x297 mm image"],
    fixed: { w: mmToPx(210), h: mmToPx(297), label: "A4 (210 × 297 mm)", mm: { w: 210, h: 297 } },
    about: [
      "A4 is 210 × 297 mm. At 300 DPI that is 2480 × 3508 pixels, at 150 DPI 1240 × 1754 pixels, and at 72 DPI 595 × 842 pixels. The 300 DPI size is about 8.7 megapixels, so a phone photo is usually large enough to fill it.",
      "A4 has a shape of roughly 1 : 1.414, which is narrower than most photos. Cropping to that shape removes part of the picture, and you decide which part. If you want the whole photo on an A4 page with white around it, place it in a document and print instead of resizing.",
      "For a scan or a form to be uploaded as an image, 150 DPI (1240 × 1754) is often enough and gives a much smaller file. Choose Custom size if you want that instead.",
    ],
    uses: ["Making a full-page A4 image for printing.", "Preparing a document image that must be A4 in proportion.", "Finding out how many pixels A4 needs at a chosen DPI."],
    tips: ["Check the picture is at least about 2000 pixels on the short side for a sharp print.", "Use a lower DPI if you only need A4 proportions for a screen or upload.", "Rotate the picture first if you need A4 landscape."],
    faqs: [
      { q: "How many pixels is A4?", a: "2480 × 3508 at 300 DPI, 1240 × 1754 at 150 DPI, and 595 × 842 at 72 DPI." },
      { q: "Will my whole photo fit?", a: "Only if its shape matches A4. Otherwise part of it is cropped so nothing is stretched." },
      { q: "Can I make A4 under a KB limit?", a: "Yes, but a 2480 × 3508 image can be large. Lower the DPI to reduce the size, or set a maximum KB and use JPG." },
    ],
    related: ["resize-image-in-mm", "image-resizer", "image-compressor", "jpg-to-pdf"],
  },
  {
    slug: "resize-signature-to-50mmx20mm",
    mode: "signature",
    h1: "Resize Signature to 50mm x 20mm",
    title: "Resize Signature to 50mm x 20mm — 591×236 px Crop | Paul Digital",
    description: "Crop and resize a signature image to 50 mm × 20 mm, exported at 591 × 236 pixels (300 DPI). Optional KB limit, free and private in your browser.",
    summary: "Crop a signature image to 50 mm × 20 mm at 591 × 236 pixels, with an optional file-size limit.",
    intro: "Crop a scanned or photographed signature to 50 mm × 20 mm and export it at 591 × 236 pixels at 300 DPI. Add a KB limit if the form has one.",
    keywords: ["signature 50mm x 20mm", "resize signature 50x20 mm", "signature size 591x236", "signature resizer mm"],
    fixed: { w: mmToPx(50), h: mmToPx(20), label: "50 × 20 mm", mm: { w: 50, h: 20 } },
    about: [
      "50 × 20 mm is a 5:2 strip, a size that signature boxes on forms and certificates commonly use. At 300 DPI it is 591 × 236 pixels. The same size is " + pixelTable(50, 20) + ".",
      "A signature photo has the same problem as a passport photo: the box has a fixed shape, and a whole page does not. Crop tightly around the writing, leaving a thin margin, and the signature will fill the box instead of becoming a tiny mark in a lot of white.",
      "Dark ink on white paper in even light gives the cleanest result. If the form asks for a very small file, JPG with a KB limit is the best choice, because PNG cannot be reduced by lowering quality.",
    ],
    uses: ["Making a 50 × 20 mm signature image for a form.", "Trimming a signature scan to a tidy 5:2 strip.", "Producing a 591 × 236 px signature file."],
    tips: ["Write the signature large on plain white paper before photographing.", "Keep the camera straight above the paper to avoid slanted lines.", NOTICE],
    faqs: [
      { q: "How many pixels is 50mm x 20mm?", a: "591 × 236 pixels at 300 DPI. At 150 DPI it is 295 × 118 pixels." },
      { q: "Is my signature uploaded?", a: "No. It is processed in your browser and never leaves your device." },
      { q: "How do I keep it under a KB limit?", a: "Enter the maximum KB and choose JPG. The tool lowers the quality until the file fits or tells you if it could not." },
    ],
    related: ["resize-image-to-6cmx2cm", "signature-resizer", "government-job-photo-signature-resizer", "image-compressor"],
  },
];

const sizePages: EditorTool[] = pages.map((page) => {
  const unitWord = page.start?.unit === "mm" ? "Millimetres" : page.start?.unit === "in" ? "Inches" : page.start?.unit === "cm" ? "Centimetres" : "Pixels";
  return {
    slug: page.slug,
    mode: page.mode,
    h1: page.h1,
    title: page.title,
    description: page.description,
    summary: page.summary,
    intro: page.intro,
    keywords: page.keywords,
    steps: page.fixed ? cropSteps(page.fixed) : resizeSteps(unitWord),
    explanation: page.about,
    useCases: page.uses,
    tips: page.tips,
    faqs: [...page.faqs, { q: "Is my image uploaded?", a: "No. The file is read and rewritten in your browser, and it never leaves your device." }],
    related: page.related,
    start: page.start,
    fixed: page.fixed ? fixedPreset(page.fixed) : undefined,
  };
});

/** Resize pages plus the exam photo pages, which are cited to official notices. */
export const editorSizePages: EditorTool[] = [...sizePages, ...examPhotoPages];
