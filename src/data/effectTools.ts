import type { Faq } from "./formatTools";
import type { EffectMode } from "../lib/imageEffects";

export interface EffectTool {
  slug: string;
  mode: EffectMode;
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

export const effectTools: EffectTool[] = [
  {
    slug: "image-to-black-and-white",
    mode: "grayscale",
    h1: "Convert Image to Black and White",
    title: "Convert Image to Black and White (Grayscale) Online | Paul Digital",
    description:
      "Turn a colour photo into a black and white (grayscale) image in your browser. Choose JPG, PNG or WebP and download. Free, no upload, no watermark.",
    summary: "Turn a colour photo into black and white (grayscale) and download it as JPG, PNG or WebP.",
    intro: "Make a colour picture black and white in seconds. The conversion happens on your device, so the photo is never uploaded.",
    keywords: ["grayscale", "black and white", "greyscale", "monochrome"],
    steps: [
      "Choose a picture, or drag it onto the page.",
      "Check the live preview, which already shows the black and white result.",
      "Pick the output format: JPG for photos, PNG if you want to keep transparency.",
      "Press Convert to grayscale and download the file.",
    ],
    explanation: [
      "A grayscale image keeps only the brightness of each pixel and drops the colour. This tool works out each pixel's grey level with the standard luma weighting, which counts green most, red less and blue least, because the eye is more sensitive to green. That is why a bright green leaf turns out lighter than a blue sky of the same strength.",
      "The picture keeps its original width and height. Only the colour values change, so nothing is cropped or resized. If the original has transparent areas and you save as PNG or WebP, they stay transparent. JPG cannot store transparency, so those areas are filled with white.",
      "Grey images can compress slightly smaller than colour ones in some formats, but the difference is usually modest, so do not expect a large drop in file size.",
    ],
    useCases: [
      "Printing a document or form photo on a black and white printer.",
      "Giving a set of photos a consistent, classic look.",
      "Preparing scans or screenshots where colour is a distraction.",
    ],
    tips: [
      "Start from the original photo rather than one that was already compressed hard, so the grey tones stay smooth.",
      "Use PNG for graphics and screenshots, and JPG for photographs.",
      "If the result looks flat, the original probably had little contrast. A separate brightness and contrast edit can help.",
    ],
    faqs: [
      { q: "Is black and white the same as grayscale?", a: "In everyday use, yes. This tool produces a grayscale image: shades of grey from black to white, not just pure black and pure white dots." },
      { q: "Does it change the size of my picture?", a: "No. The width and height stay the same. Only the colour is removed." },
      { q: "Is my photo uploaded?", a: "No. The conversion runs in your browser on your own device." },
    ],
    related: ["add-border-to-image", "crop-image-to-circle", "image-compressor", "image-converter"],
  },
  {
    slug: "add-border-to-image",
    mode: "border",
    h1: "Add Border to Image",
    title: "Add a Border to an Image Online (Any Colour) | Paul Digital",
    description:
      "Add a solid colour border around any picture. Choose the thickness in pixels and the colour, preview it and download. Runs in your browser with no upload.",
    summary: "Add a solid colour border of any thickness around a picture.",
    intro: "Frame a picture with a border in the thickness and colour you choose. The preview shows exactly what you will download.",
    keywords: ["border", "frame", "outline", "add border"],
    steps: [
      "Choose a picture, or drag it onto the page.",
      "Enter the border thickness in pixels and pick a colour.",
      "Check the preview, which also shows the new size of the picture.",
      "Press Add border and download the framed image.",
    ],
    explanation: [
      "The border is added around the picture rather than painted over its edges. A 20 pixel border makes the image 40 pixels wider and 40 pixels taller, because 20 pixels are added on every side. Nothing from the original is hidden or cropped.",
      "The thickness is measured in pixels, so the same number looks thinner on a very large photo than on a small one. For a photo about 1000 pixels wide, 10 to 30 pixels gives a clear but gentle frame.",
      "A white border suits photos for printing or presentations, and a black border helps a light picture stand out on a white page. Enter any hex colour code if you need an exact match.",
    ],
    useCases: [
      "Adding a white frame to a photo before printing.",
      "Making a screenshot stand out on a white document or web page.",
      "Separating a picture from a busy background in a post.",
    ],
    tips: [
      "Scale the thickness to the picture: roughly 1 to 3 percent of the width is a natural frame.",
      "Use PNG when the picture is a screenshot or graphic, and JPG for photographs.",
      "If you need an exact final size, resize first and add the border last, or the border will change your dimensions.",
    ],
    faqs: [
      { q: "Does the border make the file bigger?", a: "The picture gets more pixels, so the file may grow slightly. A flat colour border compresses very well, so the increase is usually small." },
      { q: "Can I add different borders on each side?", a: "This tool adds the same thickness on every side." },
      { q: "Can the border be transparent?", a: "No. The border is a solid colour that you choose." },
    ],
    related: ["round-image-corners", "image-to-black-and-white", "image-resizer", "crop-rotate-flip-image"],
  },
  {
    slug: "round-image-corners",
    mode: "round",
    h1: "Round Image Corners",
    title: "Round Image Corners Online (Transparent PNG) | Paul Digital",
    description:
      "Round the corners of any picture with a slider, from slightly soft to fully round. Save as a transparent PNG or WebP. Free, in your browser, no upload.",
    summary: "Round the corners of a picture and save it with transparent corners.",
    intro: "Give a picture soft, rounded corners with a simple slider. Save it as a PNG or WebP to keep the corners transparent.",
    keywords: ["rounded corners", "round image", "border radius", "transparent corners"],
    steps: [
      "Choose a picture, or drag it onto the page.",
      "Move the Roundness slider until the preview looks right.",
      "Keep PNG or WebP as the format so the corners stay transparent.",
      "Press Round corners and download the image.",
    ],
    explanation: [
      "The corners are cut away in a smooth curve and the cut-off areas become transparent. The slider runs from 0 percent, which leaves square corners, to 100 percent, which rounds the shorter sides completely. On a square picture, 100 percent gives a circle.",
      "Transparent corners need a format that can store transparency. PNG and WebP can. JPG cannot, so if you choose JPG the corners are filled with white, which looks fine only on a white page.",
      "The picture keeps its original pixel size. Only the corners change, so you can drop the result straight onto a coloured background, a slide or a web page.",
    ],
    useCases: [
      "Profile pictures and thumbnails with a soft look.",
      "App store or social graphics with rounded tiles.",
      "Pictures placed on slides or web pages with a coloured background.",
    ],
    tips: [
      "Around 10 to 25 percent gives a modern, gentle rounding on most photos.",
      "Always choose PNG or WebP if the picture will sit on anything other than white.",
      "For a perfect circle, use the Crop Image to Circle tool, which cuts a centred square first.",
    ],
    faqs: [
      { q: "Why are my corners white?", a: "You saved as JPG, which cannot store transparency. Choose PNG or WebP." },
      { q: "Does it change the picture size?", a: "No. The width and height stay the same." },
      { q: "Can I round only some corners?", a: "This tool rounds all four corners equally." },
    ],
    related: ["crop-image-to-circle", "add-border-to-image", "image-to-black-and-white", "image-converter"],
  },
  {
    slug: "crop-image-to-circle",
    mode: "circle",
    h1: "Crop Image to Circle",
    title: "Crop Image to a Circle Online (Transparent PNG) | Paul Digital",
    description:
      "Crop any picture into a circle for a round profile photo. The circle is cut from the centre and saved with a transparent background. Free, no upload.",
    summary: "Crop a picture into a circle and save it with a transparent background.",
    intro: "Turn a photo into a round profile picture. The circle is cut from the centre and saved with a transparent background.",
    keywords: ["circle crop", "round profile picture", "circular image", "avatar"],
    steps: [
      "Choose a picture, or drag it onto the page.",
      "Check the preview. The circle is cut from the centre of the picture.",
      "Set the circle size in pixels if you need a specific size.",
      "Keep PNG or WebP as the format, press Crop to circle and download.",
    ],
    explanation: [
      "A circle needs a square to sit in, so the tool first takes the biggest centred square from your picture: a photo 1000 pixels wide and 600 tall gives a 600 by 600 square, taken from the middle. The circle is then cut from that square and everything outside it becomes transparent.",
      "By default the circle is the full size of that square, so no detail is lost. You can enter a smaller size, such as 400 or 512 pixels, for an avatar. Entering a larger size enlarges the picture, which can make it look soft.",
      "Transparent outside areas need PNG or WebP. In JPG the area outside the circle turns white. Because the crop is always centred, move the face or subject to the middle of the original first, or crop the picture with the Crop, Rotate and Flip tool.",
    ],
    useCases: [
      "Round profile pictures for social accounts, chat apps and forums.",
      "Team photos and avatars for a website or presentation.",
      "Circular logos and badges on a transparent background.",
    ],
    tips: [
      "Make sure the subject is near the centre of the original, because the crop is always centred.",
      "512 pixels is a common avatar size and keeps files small.",
      "Use PNG for the sharpest edge and full transparency.",
    ],
    faqs: [
      { q: "Can I choose which part of the picture is cropped?", a: "The circle is always cut from the centre. To change the area, crop the picture first with the Crop, Rotate and Flip tool." },
      { q: "Why is there a white background?", a: "JPG cannot store transparency. Choose PNG or WebP." },
      { q: "What size will the file be?", a: "The preview shows the output size. By default it is the shorter side of your picture." },
    ],
    related: ["round-image-corners", "crop-rotate-flip-image", "image-resizer", "add-border-to-image"],
  },
];

export const effectToolBySlug = new Map(effectTools.map((tool) => [tool.slug, tool]));
