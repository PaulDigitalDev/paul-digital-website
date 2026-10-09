import type { Faq } from "./formatTools";

export type SocialMode = "instagram" | "whatsapp" | "youtube" | "zoomout" | "grid";

export interface SocialTool {
  slug: string;
  mode: SocialMode;
  h1: string;
  title: string;
  description: string;
  summary: string;
  intro: string;
  steps: string[];
  explanation: string[];
  useCases: string[];
  tips: string[];
  faqs: Faq[];
  related: string[];
}

export const socialTools: SocialTool[] = [
  {
    slug: "resize-image-for-instagram",
    mode: "instagram",
    h1: "Resize Image for Instagram (No Crop)",
    title: "Resize Image for Instagram Without Cropping | Paul Digital",
    description:
      "Fit a whole photo into an Instagram square, portrait, landscape or story size without cropping. Choose a background, preview it and download. Runs in your browser.",
    summary: "Fit a whole photo into an Instagram size with a background instead of cropping it.",
    intro: "Fit your whole picture into an Instagram-friendly frame. Nothing is cut off; spare space is filled with the background you choose.",
    steps: [
      "Choose a photo, or drag it onto the drop area.",
      "Pick an output size: square, portrait, landscape or story.",
      "Choose white, black, a custom colour or a blurred copy of your photo as the background.",
      "Check the live preview, which shows exactly how the whole image sits in the frame.",
      "Press Create image, then download the file.",
    ],
    explanation: [
      "Fitting and cropping are different. Cropping cuts away the edges of your picture so it fills the frame. Fitting scales the entire picture down until all of it is visible, then fills the leftover space with a background. This tool only fits, so faces, text and edges stay in the image.",
      "The output sizes use 1080 pixels on the long side or width, which are commonly recommended for Instagram: 1080×1080 (square), 1080×1350 (4:5 portrait), 1080×566 (about 1.91:1 landscape) and 1080×1920 (9:16 stories and reels). Instagram's rules and compression change over time, so treat these as sensible targets, not guarantees.",
      "A blurred background uses an enlarged, blurred copy of your own photo. It needs a browser that supports canvas filters; if yours does not, the option is hidden rather than faked.",
    ],
    useCases: [
      "Posting a landscape photo to a square or portrait feed without losing the sides.",
      "Posting a vertical photo as a story or reel cover with clean borders.",
      "Keeping product shots, screenshots and text graphics fully visible.",
    ],
    tips: [
      "Use a background colour that matches your photo's edges for the cleanest look.",
      "4:5 portrait uses the most feed space for tall photos.",
      "Start from the largest original you have. Small photos are enlarged to fit the frame and can look soft.",
    ],
    faqs: [
      { q: "Does this crop my photo?", a: "No. The whole image is scaled to fit inside the frame, and the remaining space is filled with the background. The preview shows the same result you download." },
      { q: "Which size should I choose?", a: "Square (1080×1080) is the safest all-rounder. Use 4:5 for tall photos in the feed, and 9:16 for stories and reels." },
      { q: "Will Instagram recompress the image?", a: "Probably. Instagram processes uploads on its own servers, so the file you see afterwards may differ from the file you upload." },
    ],
    related: ["instagram-grid", "zoom-out-image", "resize-image-for-whatsapp-dp"],
  },
  {
    slug: "instagram-grid",
    mode: "grid",
    h1: "Instagram Grid Maker",
    title: "Instagram Grid Maker — Split a Photo into Tiles | Paul Digital",
    description:
      "Split one image into an Instagram-style grid of numbered tiles. Choose columns, rows and tile shape, preview every tile and download them individually or as a ZIP.",
    summary: "Split one image into an ordered grid of tiles and download them one by one or as a ZIP.",
    intro: "Split a single picture into a grid of tiles. Preview the whole grid, then download the tiles in order or as one ZIP.",
    steps: [
      "Choose a photo, or drag it onto the drop area.",
      "Pick a grid preset, or set your own columns and rows.",
      "Choose the tile shape, and whether to crop the photo to the grid or fit it with a background.",
      "Check the grid preview and the numbered tiles.",
      "Press Create tiles, then download tiles individually or all as a ZIP.",
    ],
    explanation: [
      "The photo is divided into equal tiles. Tiles are numbered in reading order, left to right and top to bottom, and the numbers are part of the file names so they sort correctly.",
      "Instagram shows the newest post at the top left of a profile grid. To build the picture, post the tiles in reverse reading order: the last tile first and tile 1 last. The result panel lists the suggested posting order.",
      "Instagram changes how it crops profile-grid thumbnails and how it displays posts, so a split image will not stay perfectly aligned in every layout, app version or device. Check the result on your own profile.",
      "If the grid shape differs from the photo's shape, the tool either crops the photo to fill the grid (you choose which part stays) or fits the whole photo and fills the rest with a background. The preview shows which you will get.",
    ],
    useCases: [
      "Panoramas split across three posts.",
      "A large poster or artwork shown as a 3×3 profile mosaic.",
      "Carousel slides cut from one wide picture.",
    ],
    tips: [
      "3 columns match the usual profile grid width.",
      "Use a high-resolution original so each tile stays sharp.",
      "Keep important details away from tile borders.",
    ],
    faqs: [
      { q: "In what order should I post the tiles?", a: "Post them in reverse reading order, the last tile first, so tile 1 ends up at the top left of your profile." },
      { q: "Will the grid line up perfectly on Instagram?", a: "Not always. Instagram changes its thumbnail cropping and layouts, so alignment can differ between versions and devices." },
      { q: "Are tiles uploaded anywhere?", a: "No. Splitting and the ZIP are created in your browser." },
    ],
    related: ["resize-image-for-instagram", "zoom-out-image", "image-compressor"],
  },
  {
    slug: "resize-image-for-whatsapp-dp",
    mode: "whatsapp",
    h1: "Resize Image for WhatsApp DP",
    title: "Resize Image for WhatsApp DP — Fit Without Cropping | Paul Digital",
    description:
      "Fit a photo inside a square WhatsApp profile picture canvas with padding and a background. Preview a circle guide and download. Runs in your browser.",
    summary: "Fit a profile picture inside a square canvas with a circular preview guide.",
    intro: "Place your picture in the centre of a square canvas, set padding and background, and preview how a circular avatar may show it.",
    steps: [
      "Choose a photo, or drag it onto the drop area.",
      "Pick a square output size, a background and the padding around your picture.",
      "Turn the circle guide on to see roughly what a round avatar will show.",
      "Press Create image and download the square file.",
    ],
    explanation: [
      "WhatsApp profile pictures are square images that the app displays in a circle. If your picture is not square, WhatsApp asks you to crop it. Fitting it inside a square canvas first lets you keep the whole picture and choose the background yourself.",
      "The circle guide is only an overlay on the preview. It is not part of the exported file, and the file is not cut into a circle unless you tick the option to export a circular PNG.",
      "Parts of the picture near the square's corners fall outside the circle, so keep faces and logos towards the centre or add padding.",
    ],
    useCases: ["Profile pictures that keep a full-body photo or logo visible.", "Business accounts with a logo on a brand-coloured background.", "Making any photo square without cropping."],
    tips: ["Add 10–20% padding for logos so nothing touches the circle edge.", "A square source image needs no padding.", "Transparent backgrounds need PNG output."],
    faqs: [
      { q: "What size should a WhatsApp profile picture be?", a: "A square image is best. The default of 640×640 is comfortably larger than the minimum WhatsApp accepts; WhatsApp may resize it." },
      { q: "Does the download come out round?", a: "Only if you tick the circular export option, which saves a transparent PNG. By default the file is a full square and the circle is just a preview guide." },
      { q: "Is my photo uploaded?", a: "No. Everything runs in your browser." },
    ],
    related: ["resize-image-for-instagram", "zoom-out-image", "favicon-generator"],
  },
  {
    slug: "resize-image-for-youtube-banner",
    mode: "youtube",
    h1: "Resize Image for YouTube Banner",
    title: "YouTube Banner Resizer — 2560×1440 with Safe Area | Paul Digital",
    description:
      "Place an image on a 2560×1440 YouTube channel-art canvas with safe-area, tablet and desktop guides. Fit without cropping, position it and download. Runs in your browser.",
    summary: "Fit and position an image on a 2560×1440 channel-art canvas with safe-area guides.",
    intro: "Fit and position your image on a YouTube channel-art canvas, with guides that show where text and logos stay visible.",
    steps: [
      "Choose an image, or drag it onto the drop area.",
      "Pick the recommended 2560×1440 canvas, or the 2048×1152 minimum.",
      "Fit the whole image or fill the canvas, then adjust zoom and position.",
      "Use the guides to keep text and logos inside the safe area. They are overlays and are not exported.",
      "Press Create image and download the file.",
    ],
    explanation: [
      "YouTube's channel branding help recommends a banner of 2560×1440 pixels, accepts a minimum of 2048×1152 at 16:9, caps the file at 6 MB, and gives a safe area for text and logos of 1235×338 pixels measured at the minimum size. At 2560×1440 that scales to about 1544×423 pixels. Guidance can change, so check YouTube's help page before uploading.",
      "The safe-area guide uses that official figure. YouTube does not publish exact desktop and tablet crops, so the tablet and desktop guides are approximations based on commonly cited widths (about 1855 and 2560 pixels wide by 423 high). The mobile view shows roughly the safe area.",
      "Guides are drawn over the preview only. They are left out of the downloaded file unless you tick the option to include them, which is rarely what you want.",
      "By default the whole image is fitted without cropping and the rest is filled with your background. You can switch to fill mode, which crops the edges, and the tool will tell you when anything is cut off.",
    ],
    useCases: ["Channel art from a logo or wide graphic.", "Turning a photo into a banner with a branded background.", "Checking text placement before uploading."],
    tips: ["Keep text and logos inside the safe area.", "Use a background colour that continues your image's edges.", "If the JPG exceeds 6 MB the tool lowers quality and tells you."],
    faqs: [
      { q: "What size is a YouTube banner?", a: "YouTube recommends 2560×1440 pixels, with a 2048×1152 minimum at 16:9 and a 6 MB file limit." },
      { q: "Where should I put text and logos?", a: "Inside the safe area, about 1544×423 pixels in the centre of a 2560×1440 canvas." },
      { q: "Are the guides saved into my banner?", a: "No, not unless you choose to include them. They are preview overlays." },
    ],
    related: ["zoom-out-image", "resize-image-for-instagram", "image-compressor"],
  },
  {
    slug: "zoom-out-image",
    mode: "zoomout",
    h1: "Zoom Out Image",
    title: "Zoom Out Image — Make the Subject Smaller | Paul Digital",
    description:
      "Make a subject look smaller by placing your whole image on a larger canvas. Set scale, padding, background and output size. Runs in your browser.",
    summary: "Place your image on a larger canvas so the subject appears smaller.",
    intro: "Place your whole image on a larger canvas so it looks zoomed out. Choose the scale, padding, background and output size.",
    steps: [
      "Choose an image, or drag it onto the drop area.",
      "Pick an output size, or leave it matching your image's shape.",
      "Lower the image scale to shrink the picture on the canvas, and add padding if you want more room.",
      "Choose the background and check the preview.",
      "Press Create image and download the file.",
    ],
    explanation: [
      "Zooming out here means making your original picture smaller and surrounding it with extra canvas. The original pixels are kept as they are; nothing outside the original frame is invented or recovered.",
      "Because the image is only scaled down and placed on a background, the full original is always preserved. This tool does not crop.",
      "If you need the surroundings extended with generated content, that requires different software. This tool only adds a plain colour, white, black, transparent or blurred background.",
    ],
    useCases: ["Making room around a subject for text or captions.", "Fitting a photo into a wider layout.", "Creating borders or a smaller product shot."],
    tips: ["A blurred background feels more natural than flat colour for photos.", "Transparent backgrounds need PNG.", "Use a larger output size if the shrunken image looks small."],
    faqs: [
      { q: "Does this show what was outside my photo?", a: "No. It only shrinks your existing image onto a larger canvas. It cannot recover or create details outside the original frame." },
      { q: "Does it crop my image?", a: "No. The whole original image is always kept." },
      { q: "Can I keep a transparent background?", a: "Yes, choose Transparent and PNG output." },
    ],
    related: ["resize-image-for-instagram", "resize-image-for-youtube-banner", "image-converter"],
  },
];

export const socialToolBySlug = new Map(socialTools.map((tool) => [tool.slug, tool]));
