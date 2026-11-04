/**
 * In-depth guides. Each guide is original, practical reading that stands on its own and links to the
 * tools it explains. Section bodies are trusted HTML written in this file (paragraphs, lists, tables
 * and internal links only) and are rendered by src/pages/guides/[slug].astro.
 */

export interface GuideSection {
  heading: string;
  html: string;
}

export interface Guide {
  slug: string;
  title: string;
  /** <title> text; keep under about 60 characters before the brand suffix. */
  metaTitle: string;
  description: string;
  /** One or two sentences shown under the H1 and on the guides index. */
  summary: string;
  category: "Images" | "PDF and documents" | "Privacy" | "Phones and apps";
  published: string;
  updated: string;
  sections: GuideSection[];
  faqs: { q: string; a: string }[];
  tools: { href: string; label: string }[];
}

export const guides: Guide[] = [
  {
    slug: "compress-image-to-specific-kb-size",
    title: "How to compress an image to an exact size in KB",
    metaTitle: "How to Compress an Image to 20 KB, 50 KB or 100 KB",
    description:
      "A practical guide to getting a photo under a KB limit: what controls file size, the order to change settings in, and how to keep the result readable.",
    summary:
      "Upload forms often reject a photo because it is a few kilobytes too big. Here is what actually controls image file size and the order to change things in so the picture stays clear.",
    category: "Images",
    published: "2026-11-04",
    updated: "2026-11-04",
    sections: [
      {
        heading: "Why a form says your photo is too large",
        html: `<p>Most online forms check two separate things: the <strong>file size</strong> in kilobytes (KB) and, sometimes, the <strong>dimensions</strong> in pixels. A phone photo is usually 2–6 MB and around 4000 × 3000 pixels, which is far more than a form needs. A limit such as "maximum 50 KB" is about storage and upload speed, not about how good the photo looks on screen.</p>
<p>The important point is that file size is not fixed by the picture alone. The same photo can be saved as 4 MB or as 40 KB depending on its pixel dimensions, the format, and the compression quality you choose. Getting under a limit is a matter of adjusting those three in a sensible order.</p>`,
      },
      {
        heading: "The three things that decide file size",
        html: `<ol>
<li><strong>Pixel dimensions.</strong> A 4000 × 3000 image has 12 million pixels. Halving both sides to 2000 × 1500 leaves 3 million, roughly a quarter of the data. For a passport-style photo on a form, 300–600 pixels on the long side is normally plenty.</li>
<li><strong>Compression quality.</strong> JPEG and WebP are lossy formats: they throw away detail your eye is unlikely to miss. Dropping the quality from 95 to 75 often halves the file with very little visible change. Below about 50, blockiness and smeared edges start to appear.</li>
<li><strong>Content.</strong> A plain background, even lighting and a sharp subject compress well. Grainy low-light shots, busy patterns, leaves and text compress poorly, because noise looks like detail to the encoder.</li>
</ol>
<p>Format matters too. PNG is lossless, so it cannot shrink much without reducing pixels; for photographs, JPEG is almost always the right choice when a form gives a KB limit.</p>`,
      },
      {
        heading: "A step-by-step method that keeps the photo readable",
        html: `<ol>
<li><strong>Read the full requirement first.</strong> Note the maximum (and minimum, if any) size in KB, the allowed formats, and any pixel or centimetre dimensions.</li>
<li><strong>Crop before you compress.</strong> Remove empty background so the face or signature fills the frame. Cropping cuts pixels you do not need and makes the important part larger in the final image. The <a href="/crop-rotate-flip-image/">crop, rotate and flip tool</a> does this in the browser.</li>
<li><strong>Resize to sensible dimensions.</strong> If the form states dimensions, use exactly those. If not, 600 pixels on the long side is a good starting point for a photo and 300 × 100 for a signature.</li>
<li><strong>Then lower quality to reach the target.</strong> Use a tool that measures the real output size, such as the <a href="/image-compressor/">Image Compressor</a>, which lowers quality first and only reduces dimensions further if that is not enough.</li>
<li><strong>Check the result at 100%.</strong> Zoom in on eyes, text and edges. If they look smeared, go back one step: crop tighter or reduce dimensions a little instead of pushing quality lower.</li>
</ol>`,
      },
      {
        heading: "Typical targets and what to expect",
        html: `<table>
<thead><tr><th>Target</th><th>Typical use</th><th>What to expect</th></tr></thead>
<tbody>
<tr><td><a href="/compress-image-to-20kb/">20 KB</a></td><td>Signatures, small ID photos</td><td>Fine for a face at about 300–400 px; small text may soften.</td></tr>
<tr><td><a href="/compress-image-to-50kb/">50 KB</a></td><td>Exam and job application photos</td><td>A clear portrait at 400–700 px with good lighting.</td></tr>
<tr><td><a href="/compress-image-to-100kb/">100 KB</a></td><td>Profile photos, document scans</td><td>Comfortable for a portrait or a single page of large text.</td></tr>
<tr><td><a href="/compress-image-to-200kb/">200 KB</a></td><td>Scanned certificates, ID cards</td><td>Readable scans at roughly 1200–1600 px wide.</td></tr>
<tr><td><a href="/compress-image-to-1mb/">1 MB</a></td><td>Email attachments, portals with generous limits</td><td>Close to the original quality for most photos.</td></tr>
</tbody></table>
<p>These are starting points, not promises. A noisy night-time photo may need smaller dimensions than the table suggests, while a clean studio shot may fit with room to spare.</p>`,
      },
      {
        heading: "Common mistakes",
        html: `<ul>
<li><strong>Taking a screenshot of the photo.</strong> It adds the phone's interface, changes the dimensions unpredictably and is often a PNG, which is larger.</li>
<li><strong>Compressing the same JPEG again and again.</strong> Every lossy save throws away more detail. Always start again from the original file.</li>
<li><strong>Going far below the limit.</strong> If the limit is 50 KB, a 45 KB file looks better than a 12 KB file and is just as acceptable. Some forms also set a minimum, such as 10 KB or 20 KB.</li>
<li><strong>Renaming a PNG to .jpg.</strong> Changing the extension does not change the format, and some portals detect the mismatch and reject the file. Convert it properly with <a href="/png-to-jpeg/">PNG to JPEG</a>.</li>
<li><strong>Confusing KB and kb.</strong> Forms mean kilobytes (KB). Some systems count 1 KB as 1000 bytes and others as 1024 bytes, so aim a few kilobytes under the limit to be safe.</li>
</ul>`,
      },
      {
        heading: "When the photo still will not fit",
        html: `<p>If you have cropped, resized and lowered quality and the file is still too big, the image itself is usually the problem. Retake it in daylight against a plain wall, hold the phone steady, and avoid digital zoom. A clean, evenly lit photo can be a third of the size of a dim, grainy one at the same quality setting. For signatures, sign with a dark pen on white paper and photograph it flat, without shadows, before using the <a href="/signature-resizer/">signature resizer</a>.</p>`,
      },
    ],
    faqs: [
      {
        q: "Does compressing an image reduce its quality?",
        a: "Lossy compression removes some detail, but at moderate settings the change is hard to see. Reducing oversized pixel dimensions first usually lets you keep a higher quality setting for the same file size.",
      },
      {
        q: "Why is my image still over the limit after compressing?",
        a: "Large dimensions, noise from low light, or a PNG source can all keep the size up. Crop and resize first, convert PNG photos to JPEG, and start from the original file rather than an already compressed copy.",
      },
      {
        q: "Is 1 KB 1000 or 1024 bytes?",
        a: "Both conventions are used. To avoid rejection at the boundary, aim a few kilobytes below the stated limit.",
      },
    ],
    tools: [
      { href: "/image-compressor/", label: "Image Compressor (any target size)" },
      { href: "/compress-image-to-50kb/", label: "Compress image to 50 KB" },
      { href: "/compress-image-to-20kb/", label: "Compress image to 20 KB" },
      { href: "/image-resizer/", label: "Image Resizer" },
    ],
  },
  {
    slug: "photo-and-signature-size-for-online-forms",
    title: "Photo and signature size for online application forms: a checklist",
    metaTitle: "Photo & Signature Size for Online Forms: Checklist",
    description:
      "How to prepare a photo and signature that online exam, job and government forms accept the first time: dimensions, KB limits, format, background and common rejection reasons.",
    summary:
      "Exam, job and government portals reject uploads for small reasons: wrong dimensions, a few KB too large, a shadow on the signature. This checklist covers what to prepare before you start the form.",
    category: "Images",
    published: "2026-11-04",
    updated: "2026-11-04",
    sections: [
      {
        heading: "Always start with the official notice",
        html: `<p>Every recruitment board, university and government department sets its own upload rules, and they change between years. Before preparing anything, open the official notification or the help page of the portal and write down the exact requirements. Treat any figures you find elsewhere, including on this page, as typical examples rather than rules for your form.</p>
<p>Look for these details: allowed formats (usually JPG/JPEG), the minimum and maximum file size in KB, the dimensions in pixels or centimetres, background colour, whether the photo must be recent, and whether the name and date must appear on the photo.</p>`,
      },
      {
        heading: "Typical ranges you will see",
        html: `<table>
<thead><tr><th>Item</th><th>Common file size</th><th>Common dimensions</th></tr></thead>
<tbody>
<tr><td>Passport-style photo</td><td>20–50 KB, sometimes up to 100–200 KB</td><td>Around 200 × 230 to 413 × 531 pixels, or 3.5 × 4.5 cm</td></tr>
<tr><td>Signature</td><td>10–20 KB, sometimes up to 30–50 KB</td><td>Around 140 × 60 to 300 × 100 pixels</td></tr>
<tr><td>Thumb impression or declaration</td><td>20–50 KB</td><td>Often 240 × 240 or a page-width scan</td></tr>
<tr><td>Certificates and ID scans</td><td>100–500 KB, often as PDF</td><td>Readable A4 scan</td></tr>
</tbody></table>
<p>The <a href="/government-job-photo-signature-resizer/">photo and signature resizer for government forms</a> lets you type the exact width, height and KB range from your notice, so you do not have to rely on these examples.</p>`,
      },
      {
        heading: "Taking a photo that passes",
        html: `<ul>
<li><strong>Light:</strong> face a window in daylight. Avoid overhead bulbs that cast shadows under the eyes and flash that causes glare on glasses.</li>
<li><strong>Background:</strong> stand about a metre in front of a plain white or light wall, so your own shadow falls behind you and out of frame.</li>
<li><strong>Framing:</strong> keep your head straight and centred, with the face taking up roughly 50–70% of the photo height unless the notice says otherwise.</li>
<li><strong>Camera:</strong> ask someone else to take it at eye level from about 1.5 metres. Selfies at arm's length distort the face and are often rejected.</li>
<li><strong>No filters or beauty modes.</strong> Many portals reject edited photos, and smoothing filters also make files harder to compress.</li>
</ul>`,
      },
      {
        heading: "Preparing a clean signature",
        html: `<ol>
<li>Sign in the middle of a plain white sheet with a black or dark blue pen. A gel or felt pen gives a clearer line than a ballpoint.</li>
<li>Photograph it straight from above in good light, so the paper is evenly bright with no shadow of your phone.</li>
<li>Crop tightly around the signature, leaving only a small margin.</li>
<li>Resize to the required dimensions and set the maximum KB with the <a href="/signature-resizer/">signature resizer</a>. If the notice also gives a minimum, use the <a href="/government-job-photo-signature-resizer/">government form resizer</a>, which handles a KB range.</li>
</ol>
<p>If the paper looks grey, increase brightness slightly before compressing; a white background compresses much better than a grey, textured one.</p>`,
      },
      {
        heading: "Pixels, centimetres and DPI",
        html: `<p>Some notices give the size in centimetres, such as 3.5 × 4.5 cm. Screens work in pixels, so the centimetre size only becomes a pixel size once a resolution (DPI, dots per inch) is chosen. At 300 DPI, 3.5 × 4.5 cm is about 413 × 531 pixels; at 200 DPI it is about 276 × 354 pixels. If the notice only gives centimetres, 300 DPI is a safe assumption. The <a href="/passport-photo-resizer/">passport photo resizer</a> includes common millimetre presets.</p>`,
      },
      {
        heading: "Why uploads get rejected",
        html: `<ul>
<li>The file is a PNG or HEIC renamed to .jpg. Convert it properly with <a href="/heic-to-jpg/">HEIC to JPG</a> or <a href="/png-to-jpeg/">PNG to JPEG</a>.</li>
<li>The size is outside the allowed range, including too small. A 4 KB photo can be rejected by a 20–50 KB rule.</li>
<li>The dimensions differ from the required pixels, even slightly.</li>
<li>The photo and signature were uploaded in each other's fields.</li>
<li>The face is too small, blurred, or partly covered by hair, a cap or dark glasses.</li>
</ul>
<p>Keep your original, full-size photo and signature files. If a form is rejected, it is much better to prepare a fresh copy from the original than to compress an already small file again.</p>`,
      },
    ],
    faqs: [
      {
        q: "What size should a signature be for an online form?",
        a: "Use the size in your form's notice. Common requirements are 10–20 KB and roughly 140 × 60 to 300 × 100 pixels, but these vary by organisation.",
      },
      {
        q: "Can I use a selfie as my application photo?",
        a: "It is better not to. Selfies taken at arm's length distort the face and often show uneven lighting. Ask someone to take the photo at eye level against a plain wall.",
      },
      {
        q: "How do I convert 3.5 × 4.5 cm to pixels?",
        a: "Multiply each side in inches by the DPI. At 300 DPI, 3.5 × 4.5 cm is about 413 × 531 pixels.",
      },
    ],
    tools: [
      { href: "/government-job-photo-signature-resizer/", label: "Government job photo & signature resizer" },
      { href: "/signature-resizer/", label: "Signature resizer" },
      { href: "/passport-photo-resizer/", label: "Passport photo resizer" },
      { href: "/compress-image-to-20kb/", label: "Compress image to 20 KB" },
    ],
  },
  {
    slug: "jpg-vs-png-vs-webp-vs-heic",
    title: "JPG, PNG, WebP, AVIF or HEIC: which image format should you use?",
    metaTitle: "JPG vs PNG vs WebP vs AVIF vs HEIC Explained",
    description:
      "A plain-English comparison of the common image formats: how each one compresses, when to use it, compatibility, transparency, and when to convert.",
    summary:
      "Image formats are built for different jobs. This guide explains what each common format is good at, where it causes trouble, and which one to pick for photos, screenshots, logos and uploads.",
    category: "Images",
    published: "2026-11-04",
    updated: "2026-11-04",
    sections: [
      {
        heading: "Lossy and lossless, in one minute",
        html: `<p>A <strong>lossy</strong> format (JPEG, lossy WebP, AVIF, HEIC) discards detail that people are unlikely to notice, which makes photos dramatically smaller. A <strong>lossless</strong> format (PNG, lossless WebP) keeps every pixel exactly, which is ideal for screenshots, diagrams and logos but makes photographs large.</p>
<p>The practical rule: photographs belong in a lossy format; anything with sharp edges, flat colour or text belongs in a lossless one.</p>`,
      },
      {
        heading: "The formats compared",
        html: `<table>
<thead><tr><th>Format</th><th>Best for</th><th>Transparency</th><th>Compatibility</th></tr></thead>
<tbody>
<tr><td>JPEG (.jpg, .jpeg)</td><td>Photos, form uploads, email</td><td>No</td><td>Everything, everywhere</td></tr>
<tr><td>PNG</td><td>Screenshots, logos, graphics with text</td><td>Yes</td><td>Everything</td></tr>
<tr><td>WebP</td><td>Websites (photos and graphics)</td><td>Yes</td><td>All modern browsers; some older apps and forms refuse it</td></tr>
<tr><td>AVIF</td><td>Websites wanting the smallest photos</td><td>Yes</td><td>Modern browsers; limited support in editors and portals</td></tr>
<tr><td>HEIC / HEIF</td><td>iPhone camera storage</td><td>Yes</td><td>Apple devices; often unsupported on Windows, Android apps and websites</td></tr>
<tr><td>JFIF</td><td>Nothing special: it is JPEG</td><td>No</td><td>Rename or convert to .jpg if a site refuses it</td></tr>
</tbody></table>`,
      },
      {
        heading: "JPEG: the safe default for photos",
        html: `<p>JPEG has been the standard for photographs since the early 1990s, and every phone, browser, printer and upload form accepts it. Its weaknesses are that it cannot store transparency and that text or sharp lines get faint halos around them. Each time a JPEG is edited and saved again it loses a little more detail, so keep the original and export once at the end.</p>
<p>If a portal asks for "JPG", it means this format. JPG and JPEG are the same thing with different extensions; the <a href="/jpeg-to-jpg/">JPEG to JPG</a> tool only changes the file name.</p>`,
      },
      {
        heading: "PNG: exact pixels and transparency",
        html: `<p>PNG never discards detail, so screenshots stay crisp and logos keep their exact colours and transparent background. A PNG photograph, however, can easily be five to ten times larger than a good JPEG. If you need to upload a photo that happens to be a PNG, convert it with <a href="/png-to-jpeg/">PNG to JPEG</a>; if you need a transparent logo, keep it as PNG.</p>`,
      },
      {
        heading: "WebP and AVIF: built for the web",
        html: `<p>WebP and AVIF were designed to make websites load faster. At similar visual quality, WebP photos are typically 25–35% smaller than JPEG and AVIF can be smaller still. Both support transparency. The catch is outside the browser: older photo editors, office software and many government or exam portals do not accept them. When you download an image from a website and it will not upload elsewhere, it is usually WebP; <a href="/webp-to-jpg/">WebP to JPG</a> or <a href="/avif-to-jpg/">AVIF to JPG</a> fixes that.</p>`,
      },
      {
        heading: "HEIC: why iPhone photos sometimes will not open",
        html: `<p>iPhones save photos as HEIC by default because it takes roughly half the space of JPEG. Apple devices handle it seamlessly, but Windows, many Android apps and most upload forms do not. Our separate guide on <a href="/guides/heic-to-jpg-iphone-photos/">opening and converting HEIC photos</a> covers the options, and the <a href="/heic-to-jpg/">HEIC to JPG converter</a> does it in your browser.</p>`,
      },
      {
        heading: "Which format to choose",
        html: `<ul>
<li><strong>Uploading to a form or sending by email:</strong> JPEG.</li>
<li><strong>Screenshot of text, a chart or an app screen:</strong> PNG.</li>
<li><strong>Logo or icon with a transparent background:</strong> PNG (or ICO for a website favicon, made with the <a href="/favicon-generator/">favicon generator</a>).</li>
<li><strong>Images on your own website:</strong> WebP, with JPEG as a fallback if you support very old browsers.</li>
<li><strong>Archiving phone photos:</strong> keep the camera's original format; convert copies when you need to share.</li>
</ul>`,
      },
    ],
    faqs: [
      {
        q: "Is JPG better than PNG?",
        a: "For photographs, yes: a JPEG is much smaller with little visible difference. For screenshots, text and logos, PNG is better because it keeps edges sharp and supports transparency.",
      },
      {
        q: "Does converting PNG to JPG lose quality?",
        a: "Slightly, because JPEG is lossy, and any transparent areas are filled with a solid colour. At a high quality setting the difference in a photo is hard to see.",
      },
      {
        q: "Why won't a website accept my WebP image?",
        a: "Many upload forms only allow JPEG and PNG. Convert the file to JPG before uploading.",
      },
    ],
    tools: [
      { href: "/image-converter/", label: "Image Converter" },
      { href: "/webp-to-jpg/", label: "WebP to JPG" },
      { href: "/png-to-jpeg/", label: "PNG to JPEG" },
      { href: "/format-conversions/", label: "All format conversions" },
    ],
  },
  {
    slug: "make-a-small-pdf-from-photos",
    title: "How to turn photos into a small PDF for uploading",
    metaTitle: "How to Convert Photos to a Small PDF (Under 100 KB–1 MB)",
    description:
      "How to combine phone photos of documents into one PDF that is readable and under an upload limit: page order, page size, resolution and compression.",
    summary:
      "Portals often ask for a single PDF under a size limit, while your documents are photos on a phone. This guide shows how to get from one to the other without unreadable pages.",
    category: "PDF and documents",
    published: "2026-11-04",
    updated: "2026-11-04",
    sections: [
      {
        heading: "What makes a PDF of photos large",
        html: `<p>A PDF made from photos is essentially a container with one image per page. Its size is almost exactly the sum of the images inside it, plus a few kilobytes of structure. A five-page PDF of 3 MB phone photos is therefore around 15 MB. To make the PDF small, you make the images inside it small: fewer pixels and sensible JPEG compression.</p>`,
      },
      {
        heading: "Step 1: take clean photos of each page",
        html: `<ul>
<li>Place the page on a dark, plain surface so the edges are easy to see and crop.</li>
<li>Use daylight or an even light source and hold the phone parallel to the page to avoid a trapezoid shape.</li>
<li>Turn off flash; it creates a bright spot that hides text.</li>
<li>Fill the frame with the page, and take one photo per page.</li>
</ul>
<p>A dedicated scanner app can straighten and whiten pages automatically. Our guide on <a href="/guides/scan-documents-with-your-phone/">scanning documents with your phone</a> goes into more detail.</p>`,
      },
      {
        heading: "Step 2: crop and straighten",
        html: `<p>Remove the table, fingers and background around each page with the <a href="/crop-rotate-flip-image/">crop and rotate tool</a>. Cropping alone often cuts a photo's size by a third and makes text appear larger on the PDF page. Rotate sideways photos now, so every page reads the right way up.</p>`,
      },
      {
        heading: "Step 3: choose a resolution that stays readable",
        html: `<p>For an A4 page, an image about 1240 × 1754 pixels is equivalent to 150 DPI, which is comfortable for reading printed text on screen. Around 1000 pixels wide is usually still readable for large print. Going much lower makes small print blurry, which defeats the purpose of the document.</p>
<table>
<thead><tr><th>Pages</th><th>Limit</th><th>Rough budget per page</th></tr></thead>
<tbody>
<tr><td>1</td><td>100 KB</td><td>~95 KB: fine for one clear page</td></tr>
<tr><td>3</td><td>300 KB</td><td>~95 KB each</td></tr>
<tr><td>5</td><td>500 KB</td><td>~95 KB each</td></tr>
<tr><td>10</td><td>1 MB</td><td>~100 KB each</td></tr>
</tbody></table>
<p>Dividing the limit by the number of pages tells you how small each image needs to be.</p>`,
      },
      {
        heading: "Step 4: build the PDF and check the size",
        html: `<p>Add the images to <a href="/jpg-to-pdf/">JPG to PDF</a>, put them in order, choose A4 or "image size" pages, and create the PDF. If you have a hard limit, the target-size versions such as <a href="/jpg-to-pdf-under-100kb/">JPG to PDF under 100 KB</a> or <a href="/jpg-to-pdf-under-500kb/">under 500 KB</a> recompress the images gradually and report the real PDF size.</p>
<p>Then open the PDF and zoom into the smallest text on each page. If it is hard to read, the budget per page is too small: remove unnecessary pages, crop tighter, or ask whether the portal accepts separate files.</p>`,
      },
      {
        heading: "Mistakes that make PDFs unreadable or rejected",
        html: `<ul>
<li>Compressing a page to a tiny size when the limit allowed much more.</li>
<li>Pages in the wrong order or upside down; reviewers may reject the whole upload.</li>
<li>Password-protecting the PDF; most portals cannot open protected files.</li>
<li>Uploading a screenshot of a PDF instead of the PDF itself.</li>
</ul>`,
      },
    ],
    faqs: [
      {
        q: "How do I make a PDF under 100 KB from a photo?",
        a: "Crop the photo to the page, keep it around 1000–1240 pixels wide, and use a JPG to PDF tool that targets 100 KB and reports the real size.",
      },
      {
        q: "Does converting JPG to PDF reduce quality?",
        a: "Not by itself. A good converter embeds the JPEG unchanged. Quality only drops if the images are recompressed to reach a size limit.",
      },
      {
        q: "What DPI should a scanned document be?",
        a: "150 DPI is comfortable for reading on screen and 200–300 DPI is better for printing. Size limits sometimes force about 100–150 DPI.",
      },
    ],
    tools: [
      { href: "/jpg-to-pdf/", label: "JPG to PDF" },
      { href: "/jpg-to-pdf-under-100kb/", label: "JPG to PDF under 100 KB" },
      { href: "/jpg-to-pdf-under-500kb/", label: "JPG to PDF under 500 KB" },
      { href: "/crop-rotate-flip-image/", label: "Crop, rotate and flip" },
    ],
  },
  {
    slug: "image-file-size-pixels-dpi-explained",
    title: "KB, MB, pixels and DPI: image size explained simply",
    metaTitle: "KB vs Pixels vs DPI: Image Size Explained",
    description:
      "The difference between file size, pixel dimensions and DPI, why they get confused, and which one a website, printer or form actually cares about.",
    summary:
      "\"Image size\" can mean three different things. Knowing which one a form, printer or website is asking for saves a lot of trial and error.",
    category: "Images",
    published: "2026-11-04",
    updated: "2026-11-04",
    sections: [
      {
        heading: "Three different meanings of \"size\"",
        html: `<ul>
<li><strong>File size</strong> (bytes, KB, MB): how much storage the file uses and how long it takes to upload.</li>
<li><strong>Pixel dimensions</strong> (for example 1080 × 1350): how many dots of colour the image contains across and down.</li>
<li><strong>Print size</strong> (centimetres or inches) and <strong>DPI</strong>: how large the image appears when printed, and how densely the pixels are packed on paper.</li>
</ul>
<p>They are related but not the same. You can change the file size without changing dimensions (by compressing), and you can change the DPI number without changing either.</p>`,
      },
      {
        heading: "Bytes, kilobytes and megabytes",
        html: `<p>One kilobyte is about a thousand bytes and one megabyte is about a thousand kilobytes. Some software uses 1024 instead of 1000, which is why the same file can show as 49 KB in one place and 50 KB in another. When a form gives a maximum, stay a little under it.</p>
<p>A rough sense of scale: a phone photo is 2–6 MB, a good web photo is 100–300 KB, a form photo is 20–50 KB, and a small signature is under 20 KB.</p>`,
      },
      {
        heading: "Pixels: what screens and websites care about",
        html: `<p>Screens show pixels, so websites and social networks care about pixel dimensions. Instagram, for example, displays posts at about 1080 pixels wide; uploading a 4000-pixel photo gains nothing because the app scales it down anyway. Doubling both width and height quadruples the number of pixels, which roughly quadruples the uncompressed data. That is why resizing is the most effective way to shrink a file. The <a href="/image-resizer/">Image Resizer</a> changes dimensions, and <a href="/zoom-out-image/">Zoom Out Image</a> fits a picture into a frame without cropping.</p>`,
      },
      {
        heading: "DPI: only matters when printing",
        html: `<p>DPI (dots per inch) is a note stored inside the file telling a printer how large to print it. A 1200 × 1800 pixel photo printed at 300 DPI comes out 4 × 6 inches; at 150 DPI it would be 8 × 12 inches, with visibly coarser detail. Changing the DPI field alone does not add or remove a single pixel, and it does not change the file size noticeably.</p>
<p>So when a form says "300 DPI", what usually matters is that the pixel dimensions are large enough to print at the stated physical size with 300 dots per inch.</p>`,
      },
      {
        heading: "Converting between centimetres and pixels",
        html: `<p>Pixels = (centimetres ÷ 2.54) × DPI. A few useful examples at 300 DPI:</p>
<table>
<thead><tr><th>Print size</th><th>Pixels at 300 DPI</th></tr></thead>
<tbody>
<tr><td>3.5 × 4.5 cm (passport photo in many countries)</td><td>413 × 531</td></tr>
<tr><td>2 × 2 inches (US passport photo)</td><td>600 × 600</td></tr>
<tr><td>A4 page (21 × 29.7 cm)</td><td>2480 × 3508</td></tr>
<tr><td>6 × 4 inches (standard print)</td><td>1800 × 1200</td></tr>
</tbody></table>`,
      },
      {
        heading: "Which number to change for each job",
        html: `<ul>
<li><strong>"Maximum 50 KB"</strong>: change file size by compressing, and reduce dimensions if needed (<a href="/compress-image-to-50kb/">compress to 50 KB</a>).</li>
<li><strong>"200 × 230 pixels"</strong>: change dimensions with a resizer.</li>
<li><strong>"3.5 × 4.5 cm at 300 DPI"</strong>: resize to 413 × 531 pixels; the DPI note is secondary.</li>
<li><strong>"Upload a high-resolution image"</strong>: keep the original dimensions and avoid heavy compression.</li>
</ul>`,
      },
    ],
    faqs: [
      {
        q: "Does changing DPI reduce file size?",
        a: "No. DPI is only a printing instruction stored in the file. To reduce file size, reduce the pixel dimensions or increase compression.",
      },
      {
        q: "How many pixels is a 50 KB photo?",
        a: "There is no fixed answer, because file size depends on content and compression too. A clear portrait of 400–700 pixels on the long side commonly fits in 50 KB as a JPEG.",
      },
    ],
    tools: [
      { href: "/image-resizer/", label: "Image Resizer" },
      { href: "/image-compressor/", label: "Image Compressor" },
      { href: "/passport-photo-resizer/", label: "Passport photo resizer" },
    ],
  },
  {
    slug: "remove-location-from-photos-exif",
    title: "What photo metadata (EXIF) reveals, and how to remove location before sharing",
    metaTitle: "What Is EXIF Data? Remove Location From Photos",
    description:
      "What EXIF metadata is, what it can reveal about you (including GPS location), which apps strip it, and how to check and remove it before sharing a photo.",
    summary:
      "Photos carry hidden details: the camera, the exact time and often the GPS position where they were taken. Here is what is stored, when it matters and how to remove it.",
    category: "Privacy",
    published: "2026-11-04",
    updated: "2026-11-04",
    sections: [
      {
        heading: "What EXIF metadata is",
        html: `<p>EXIF (Exchangeable Image File Format) is a block of information that cameras and phones save inside each photo, alongside the picture itself. It was created so that photographers could see how a shot was taken. Today it typically includes:</p>
<ul>
<li>Date and time the photo was taken, sometimes to the second, with time zone</li>
<li>Phone or camera make and model, and lens details</li>
<li>Exposure settings: shutter speed, aperture, ISO, flash</li>
<li>Orientation (which way up to display the image)</li>
<li><strong>GPS latitude, longitude and altitude</strong>, if location tagging is enabled in the camera app</li>
<li>Editing software, and sometimes a small preview thumbnail</li>
</ul>`,
      },
      {
        heading: "Why location data matters",
        html: `<p>A photo taken at home with location tagging on contains coordinates precise enough to identify the building. Share that original file on a forum, marketplace listing or by email, and anyone who downloads it can read the location with free tools. The same applies to photos of children at school or at a regular park, and to items photographed for sale at your address.</p>
<p>This is not a reason to panic about every photo; it is a reason to know which sharing methods keep the data and which remove it.</p>`,
      },
      {
        heading: "Which sharing methods keep or remove metadata",
        html: `<table>
<thead><tr><th>Method</th><th>Usually</th></tr></thead>
<tbody>
<tr><td>Large social networks (Instagram, Facebook, X)</td><td>Strip GPS from the public copy, though the service itself may store it</td></tr>
<tr><td>WhatsApp and similar messengers, sent as a photo</td><td>Recompress and remove most metadata</td></tr>
<tr><td>Messenger "send as document / file"</td><td><strong>Keeps</strong> the original file and its metadata</td></tr>
<tr><td>Email attachments</td><td><strong>Keep</strong> metadata</td></tr>
<tr><td>Cloud links (Drive, Dropbox, iCloud)</td><td><strong>Keep</strong> metadata in the original file</td></tr>
<tr><td>Forums, blogs and small websites</td><td>Vary: many keep it</td></tr>
</tbody></table>
<p>Platform behaviour changes over time, so if privacy matters, remove the data yourself instead of relying on the service.</p>`,
      },
      {
        heading: "How to check a photo's metadata",
        html: `<p>On a computer, Windows shows some EXIF in File Properties → Details, and macOS Preview shows it under Tools → Show Inspector. On a phone, the gallery app's "details" or "info" panel usually shows date, device and location. For a fuller view without installing anything, open the photo in the <a href="/image-metadata/">image metadata viewer</a>; it reads the file in your browser and does not upload it.</p>`,
      },
      {
        heading: "How to remove location and other metadata",
        html: `<ol>
<li><strong>Stop recording it in future:</strong> in your camera app settings, turn off location tags (on iPhone: Settings → Privacy &amp; Security → Location Services → Camera; on Android the option is usually inside the camera app's settings).</li>
<li><strong>Remove it from existing photos before sharing:</strong> iPhone's share sheet has an "Options" switch to exclude location; Android galleries often have a similar "remove location" toggle. The <a href="/image-metadata/">image metadata tool</a> can save a clean copy in the browser.</li>
<li><strong>Edit rather than remove:</strong> if you need to keep dates but fix a wrong time or location, an editor such as the <a href="/apps/photo-exif-editor/">Photo EXIF Editor</a> Android app lets you change GPS and date fields.</li>
</ol>
<p>Removing metadata does not change how the picture looks. It can, however, remove the orientation tag, so check the cleaned copy is the right way up.</p>`,
      },
      {
        heading: "What metadata removal does not hide",
        html: `<p>Clearing EXIF removes the hidden fields, not what is visible in the photo. House numbers, street signs, school uniforms, car number plates and views from a window can reveal a location just as clearly. Crop or blur those details if the photo is going somewhere public.</p>`,
      },
    ],
    faqs: [
      {
        q: "Does WhatsApp remove EXIF data?",
        a: "Photos sent the normal way are recompressed and most metadata is removed. Photos sent as a document keep the original file, including any GPS location.",
      },
      {
        q: "Can someone find my location from a photo?",
        a: "Yes, if location tagging was on and the original file is shared with its metadata. Remove the location before sharing, or share through a service that strips it.",
      },
      {
        q: "Does removing metadata reduce quality?",
        a: "No. Metadata is separate from the image pixels. A good tool removes it without recompressing the picture.",
      },
    ],
    tools: [
      { href: "/image-metadata/", label: "Image metadata viewer and remover" },
      { href: "/apps/photo-exif-editor/", label: "Photo EXIF Editor (Android app)" },
      { href: "/crop-rotate-flip-image/", label: "Crop an image" },
    ],
  },
  {
    slug: "heic-to-jpg-iphone-photos",
    title: "Why iPhone HEIC photos won't open, and how to convert them to JPG",
    metaTitle: "HEIC Won't Open? Convert iPhone Photos to JPG",
    description:
      "What HEIC is, why Windows, Android and upload forms struggle with it, how to make your iPhone save JPG instead, and how to convert existing HEIC photos.",
    summary:
      "HEIC saves space on iPhones but causes problems almost everywhere else. Here is why, and the quickest ways to get a normal JPG.",
    category: "Phones and apps",
    published: "2026-11-04",
    updated: "2026-11-04",
    sections: [
      {
        heading: "What HEIC is",
        html: `<p>HEIC (High Efficiency Image Container) is the format iPhones have used for photos by default since iOS 11 in 2017. It is based on the HEVC video codec and stores a photo in roughly half the space a JPEG would need at similar quality, which is a real advantage when a phone holds thousands of pictures. It can also hold extras such as Live Photo frames and depth information.</p>`,
      },
      {
        heading: "Why it causes problems",
        html: `<ul>
<li><strong>Windows</strong> needs extra codec extensions to preview HEIC files, so many PCs show a blank icon or an error.</li>
<li><strong>Many websites and forms</strong>, including most job, exam and government portals, only accept JPG and PNG.</li>
<li><strong>Older Android apps and photo editors</strong> cannot open HEIC at all.</li>
<li><strong>Web browsers</strong> other than Safari generally cannot display HEIC images directly.</li>
</ul>
<p>The photo is fine; the software at the other end simply does not speak the format.</p>`,
      },
      {
        heading: "Make your iPhone save JPG instead",
        html: `<p>If you regularly share photos with Windows users or upload them to forms, change the camera setting: <strong>Settings → Camera → Formats → Most Compatible</strong>. New photos will be saved as JPEG and videos as H.264. Photos already taken remain HEIC.</p>
<p>There is also a transfer setting: <strong>Settings → Photos → Transfer to Mac or PC → Automatic</strong> converts photos to JPEG when you copy them over a cable.</p>`,
      },
      {
        heading: "Convert existing HEIC photos",
        html: `<ol>
<li><strong>In the browser:</strong> open the <a href="/heic-to-jpg/">HEIC to JPG converter</a>, select one or more photos, and download the JPG copies. The conversion runs on your device, so private photos are not uploaded.</li>
<li><strong>On iPhone:</strong> copying a photo from the Photos app and pasting it into the Files app often saves a JPG copy; sharing by email with "Actual Size" can also convert it.</li>
<li><strong>On a Mac:</strong> open the photo in Preview, choose File → Export, and pick JPEG.</li>
</ol>`,
      },
      {
        heading: "Quality and size after conversion",
        html: `<p>The JPG will normally be larger than the HEIC, sometimes nearly twice the size, because JPEG is a less efficient format. If you need a small file for a form, convert first and then use the <a href="/image-compressor/">Image Compressor</a> to reach the KB limit. Converting does not improve quality, and converting back and forth repeatedly loses a little detail each time, so keep the original HEIC as your master copy.</p>`,
      },
    ],
    faqs: [
      {
        q: "Is HEIC better quality than JPG?",
        a: "At the same file size HEIC usually looks better, or at the same quality it is smaller. The trade-off is compatibility.",
      },
      {
        q: "Will converting HEIC to JPG lose the date and location?",
        a: "It depends on the converter. Some keep metadata and some remove it. If you are sharing publicly, removing the location is usually a good thing.",
      },
    ],
    tools: [
      { href: "/heic-to-jpg/", label: "HEIC to JPG" },
      { href: "/image-converter/", label: "Image Converter" },
      { href: "/image-compressor/", label: "Image Compressor" },
    ],
  },
  {
    slug: "extract-text-from-image-ocr",
    title: "How to extract text from an image (OCR) and get accurate results",
    metaTitle: "Extract Text From an Image: OCR Tips for Accuracy",
    description:
      "How OCR turns photos and screenshots into editable text, what affects accuracy, how to prepare an image, and how to check the result.",
    summary:
      "OCR saves retyping, but a poor photo can produce garbled text. This guide explains how OCR works and the simple preparation steps that make the biggest difference.",
    category: "PDF and documents",
    published: "2026-11-04",
    updated: "2026-11-04",
    sections: [
      {
        heading: "What OCR does",
        html: `<p>Optical character recognition (OCR) looks at an image, finds areas that contain text, splits them into lines and words, and matches the shapes of letters against a trained model to produce editable text. Modern engines such as Tesseract, which powers the tools on this site, use neural networks that recognise whole lines, so clear printed text in common fonts is usually read very accurately.</p>`,
      },
      {
        heading: "What affects accuracy",
        html: `<ul>
<li><strong>Resolution:</strong> letters need enough pixels. Body text should be at least 20–30 pixels tall in the image; tiny text in a wide photo is often misread.</li>
<li><strong>Contrast:</strong> dark text on a plain light background works best. Coloured or patterned backgrounds confuse the engine.</li>
<li><strong>Straightness:</strong> skewed or curved lines (a book photographed near the spine) reduce accuracy.</li>
<li><strong>Blur and shadows:</strong> motion blur and the shadow of your phone over part of the page cause missing or wrong characters.</li>
<li><strong>Handwriting and decorative fonts:</strong> general OCR engines are trained mainly on print, so handwriting results vary widely.</li>
<li><strong>Language:</strong> the engine must know the language; English-trained models will mangle other scripts. The OCR tools on this site read printed English.</li>
</ul>`,
      },
      {
        heading: "Preparing an image for OCR",
        html: `<ol>
<li>Photograph the page straight on in even light, filling the frame.</li>
<li>Crop to the text you need with the <a href="/crop-rotate-flip-image/">crop tool</a>; less clutter means fewer stray characters.</li>
<li>Rotate so lines are horizontal.</li>
<li>For screenshots, use the original PNG rather than a compressed copy; PNG keeps letter edges sharp.</li>
<li>Run <a href="/jpg-to-text/">JPG to Text</a> or <a href="/png-to-text/">PNG to Text</a>, then paste the text into your document. These tools read printed English.</li>
</ol>`,
      },
      {
        heading: "Checking the result",
        html: `<p>Even a 99% accurate result has about one error in every hundred characters, so proofread anything important. Common confusions are 0 and O, 1, l and I, rn and m, and missing accents. Numbers deserve special care: an amount, a date or an ID number should always be compared with the original. Tables are another weak spot; OCR often reads them row by row as plain text, so check the columns line up.</p>`,
      },
      {
        heading: "Good uses and poor uses",
        html: `<p>OCR is excellent for copying a paragraph from a screenshot, digitising printed letters and notices, pulling text out of a scanned PDF page, or making notes from a whiteboard photo. It is less dependable for handwriting, receipts printed on faded thermal paper, stylised posters, and complex forms with many boxes. For those, expect to correct the output by hand.</p>`,
      },
    ],
    faqs: [
      {
        q: "Can OCR read handwriting?",
        a: "Sometimes, if the writing is neat and printed in separate letters. Joined handwriting is usually read poorly by general OCR engines.",
      },
      {
        q: "Is it safe to OCR private documents online?",
        a: "Only if you trust where the image goes. The OCR tools on this site run in your browser, so the image is not uploaded to a server.",
      },
    ],
    tools: [
      { href: "/jpg-to-text/", label: "JPG to Text (OCR)" },
      { href: "/png-to-text/", label: "PNG to Text (OCR)" },
      { href: "/image-to-word/", label: "Image to Word (place images in a .docx)" },
    ],
  },
  {
    slug: "social-media-image-sizes",
    title: "Image sizes for Instagram, WhatsApp and YouTube: a practical reference",
    metaTitle: "Instagram, WhatsApp DP & YouTube Banner Image Sizes",
    description:
      "Recommended pixel sizes and aspect ratios for Instagram posts and stories, WhatsApp profile photos and YouTube channel banners, with tips to avoid unwanted cropping.",
    summary:
      "Every platform crops and compresses images in its own way. Uploading at the right shape and size is the easiest way to keep faces and text where you want them.",
    category: "Images",
    published: "2026-11-04",
    updated: "2026-11-04",
    sections: [
      {
        heading: "Shape matters more than size",
        html: `<p>Platforms resize everything you upload, so a few extra pixels rarely matter. What does matter is the <strong>aspect ratio</strong>, the shape of the image. Upload a wide photo where a square is expected and the app will crop off the sides, sometimes cutting through a face or a line of text. Preparing the image in the right shape lets you decide what stays in frame.</p>
<p>The figures below are widely used recommendations. Platforms change their layouts from time to time, so treat them as sensible targets rather than official guarantees.</p>`,
      },
      {
        heading: "Instagram",
        html: `<table>
<thead><tr><th>Placement</th><th>Ratio</th><th>Recommended size</th></tr></thead>
<tbody>
<tr><td>Square post</td><td>1:1</td><td>1080 × 1080</td></tr>
<tr><td>Portrait post</td><td>4:5</td><td>1080 × 1350</td></tr>
<tr><td>Landscape post</td><td>1.91:1</td><td>1080 × 566</td></tr>
<tr><td>Story or Reel</td><td>9:16</td><td>1080 × 1920</td></tr>
</tbody></table>
<p>Portrait 4:5 takes up the most space in the feed, which is why many creators prefer it. In the profile grid, posts are shown as cropped previews, so keep the subject near the centre. To split one wide image across several grid tiles, use the <a href="/instagram-grid/">Instagram grid maker</a>; to fit any photo to these sizes without losing edges, use <a href="/resize-image-for-instagram/">resize image for Instagram</a>.</p>`,
      },
      {
        heading: "WhatsApp profile photo (DP)",
        html: `<p>WhatsApp shows profile pictures as a circle cut from a square image. Anything in the corners of the square is hidden in the circle. A square of around 500–640 pixels is plenty; larger files are reduced anyway. Keep your face centred with some space around the head so the circular crop does not cut off the top. The <a href="/resize-image-for-whatsapp-dp/">WhatsApp DP resizer</a> previews the circle and can fit a full photo inside the square without cropping.</p>`,
      },
      {
        heading: "YouTube channel banner",
        html: `<p>YouTube asks for a banner of 2048 × 1152 pixels or larger, and 2560 × 1440 is the common recommendation, at most 6 MB. The tricky part is that different devices show different parts of it. Only the central "safe area" is visible everywhere, including on phones: YouTube gives it as 1235 × 338 pixels on the 2048 × 1152 minimum, which works out to about 1544 × 423 pixels on a 2560 × 1440 banner. Put your channel name and any text inside that strip, and treat everything else as background that may be cropped on some screens. The <a href="/resize-image-for-youtube-banner/">YouTube banner resizer</a> overlays the safe area so you can check.</p>`,
      },
      {
        heading: "Keep quality after upload",
        html: `<ul>
<li>Upload at the recommended width; much larger images get compressed harder.</li>
<li>Avoid tiny text. It becomes unreadable after the platform's compression and on phone screens.</li>
<li>Export as high-quality JPEG for photos and PNG for graphics with text.</li>
<li>Do not upload a screenshot of a photo; export the photo itself.</li>
</ul>`,
      },
    ],
    faqs: [
      {
        q: "What is the best size for an Instagram post?",
        a: "1080 × 1350 pixels (4:5 portrait) uses the most feed space. 1080 × 1080 is the classic square.",
      },
      {
        q: "Why is my WhatsApp DP cut off?",
        a: "WhatsApp displays a circle from a square photo, so the corners and edges are hidden. Centre your face and leave space around it, or fit the photo inside a square first.",
      },
    ],
    tools: [
      { href: "/resize-image-for-instagram/", label: "Resize image for Instagram" },
      { href: "/instagram-grid/", label: "Instagram grid maker" },
      { href: "/resize-image-for-whatsapp-dp/", label: "WhatsApp DP resizer" },
      { href: "/resize-image-for-youtube-banner/", label: "YouTube banner resizer" },
    ],
  },
  {
    slug: "scan-documents-with-your-phone",
    title: "How to scan documents with your phone so they look clean",
    metaTitle: "How to Scan Documents With Your Phone (Clean Results)",
    description:
      "Practical steps for clean, readable phone scans of documents: lighting, angle, cropping, black-and-white versus colour, and saving as a PDF of the right size.",
    summary:
      "A phone can produce scans as good as a flatbed scanner if you control a few things: light, angle and background. Here is how to get clean pages every time.",
    category: "Phones and apps",
    published: "2026-11-04",
    updated: "2026-11-04",
    sections: [
      {
        heading: "Set up the page",
        html: `<ul>
<li><strong>Background:</strong> place a light page on a dark, plain surface. The contrast lets scanner apps find the edges automatically.</li>
<li><strong>Flatness:</strong> flatten folded paper under a book for a minute. For bound books, press the page gently near the spine.</li>
<li><strong>Light:</strong> use bright, indirect daylight or two lamps from the sides. A single overhead light causes the shadow of your phone and hands to fall on the page.</li>
</ul>`,
      },
      {
        heading: "Take the photo",
        html: `<ol>
<li>Hold the phone parallel to the page, directly above it. Tilting creates a trapezoid that has to be corrected later, which slightly blurs the text.</li>
<li>Fill most of the frame with the page while keeping all four corners visible.</li>
<li>Tap to focus on the text and keep still; brace your elbows on the table.</li>
<li>Turn off flash. It creates a glare spot and uneven brightness.</li>
<li>Check the photo by zooming into the smallest print before moving on.</li>
</ol>`,
      },
      {
        heading: "Clean up: crop, straighten and enhance",
        html: `<p>Scanner apps detect the page, correct perspective, and whiten the background in one step. If you are working with ordinary photos, crop and rotate each one with the <a href="/crop-rotate-flip-image/">crop and rotate tool</a>. For text-only pages, a black-and-white or greyscale version is often clearer and much smaller than colour. Keep colour for photos, stamps, signatures in blue ink, and anything where colour carries meaning.</p>`,
      },
      {
        heading: "Save in the right format",
        html: `<table>
<thead><tr><th>Purpose</th><th>Format</th></tr></thead>
<tbody>
<tr><td>Multi-page document, official submission</td><td>PDF (one page per image)</td></tr>
<tr><td>Single page uploaded as an image</td><td>JPEG</td></tr>
<tr><td>Need to edit or copy the text</td><td>OCR to plain text</td></tr>
</tbody></table>
<p>To combine pages, use <a href="/jpg-to-pdf/">JPG to PDF</a>; for a size limit, see <a href="/guides/make-a-small-pdf-from-photos/">making a small PDF from photos</a>. To get editable text, run the page through <a href="/jpg-to-text/">JPG to Text</a>; to place the page images into a Word file as pictures, use <a href="/image-to-word/">Image to Word</a>.</p>`,
      },
      {
        heading: "Scanning on Android with an app",
        html: `<p>If you scan often, an offline app saves time. Paul Digital's <a href="/apps/image-to-pdf-converter/">Image to PDF Converter</a> for Android turns photos from your gallery or camera into PDFs on the device, without uploading them. Whatever app you use, check what permissions it asks for; a scanner needs camera and file access, not your contacts or location.</p>`,
      },
      {
        heading: "Keep sensitive scans safe",
        html: `<p>Scans of ID cards, bank statements and certificates are valuable to fraudsters. Store them in one known folder, delete copies from chat apps after sending, and prefer tools that process files on your device. When sending an ID copy, some people add a faint note across it such as "for address verification only, [date]", which makes misuse harder.</p>`,
      },
    ],
    faqs: [
      {
        q: "Is a phone scan acceptable for official documents?",
        a: "Usually yes, as long as it is complete, sharp and readable. Some offices require a certified copy or an original, so check the instructions.",
      },
      {
        q: "Should I scan in colour or black and white?",
        a: "Black and white or greyscale is clearer and smaller for printed text. Use colour when the document has photos, coloured stamps or ink that matters.",
      },
    ],
    tools: [
      { href: "/jpg-to-pdf/", label: "JPG to PDF" },
      { href: "/jpg-to-text/", label: "JPG to Text (OCR)" },
      { href: "/apps/image-to-pdf-converter/", label: "Image to PDF Converter (Android app)" },
    ],
  },
  {
    slug: "how-browser-based-file-tools-work",
    title: "How browser-based file tools work, and why your files stay on your device",
    metaTitle: "Online File Tools Without Uploading: How It Works",
    description:
      "The difference between upload-based and in-browser file tools, what happens to your files in each case, and how to check whether a tool really keeps files local.",
    summary:
      "Many online converters upload your file to a server. Tools that run in the browser do the work on your own device instead. Here is how that works and how to tell the difference.",
    category: "Privacy",
    published: "2026-11-04",
    updated: "2026-11-04",
    sections: [
      {
        heading: "Two kinds of online tool",
        html: `<p><strong>Upload-based tools</strong> send your file to a server, process it there and send back the result. They can handle heavy jobs, but your file leaves your device, travels over the internet and sits on someone else's computer for a while, under their retention policy.</p>
<p><strong>In-browser tools</strong> download a small program (JavaScript and WebAssembly) into the web page. When you choose a file, the browser reads it from your disk into memory, the program processes it on your processor, and the result is offered as a download. The file is never sent anywhere.</p>`,
      },
      {
        heading: "What modern browsers can do locally",
        html: `<p>Browsers now include fast image decoders and encoders, a canvas for drawing and resizing, and WebAssembly, which runs compiled code at close to native speed. That is enough for compressing and resizing images, converting formats, building PDFs, reading Word files, and even running OCR with an engine like Tesseract. Every tool on Paul Digital works this way, which is why they keep working if your connection drops after the page has loaded.</p>`,
      },
      {
        heading: "Why it matters",
        html: `<ul>
<li><strong>Privacy:</strong> ID cards, certificates, contracts and family photos are not copied to a third-party server.</li>
<li><strong>Speed:</strong> there is no waiting for a large upload and download, which helps on slow mobile data.</li>
<li><strong>No account:</strong> there is nothing to store, so there is no need to sign up.</li>
<li><strong>Limits:</strong> processing uses your device's memory, so very large batches can be slow on an older phone.</li>
</ul>`,
      },
      {
        heading: "How to check a tool yourself",
        html: `<ol>
<li>Load the tool page, then turn on airplane mode or disconnect Wi-Fi.</li>
<li>Process a test file. If it still works, the work is happening locally.</li>
<li>For a closer look on a computer, open the browser's developer tools (F12), go to the Network tab, and watch for requests while you process a file. A local tool makes no large outgoing request carrying your file.</li>
</ol>
<p>Also read the privacy policy. It should say plainly whether files are uploaded and, if so, how long they are kept. Paul Digital's <a href="/privacy/">privacy policy</a> explains what the website does and does not collect.</p>`,
      },
      {
        heading: "What still leaves your device",
        html: `<p>Even a local tool loads its page from a web server, so the server sees an ordinary page request. If the site uses analytics or advertising, those services receive standard information about the visit, such as the page address and your browser type, according to their own policies and your consent choices. Your files and their contents are a separate matter, and with an in-browser tool they are not part of any of that.</p>`,
      },
    ],
    faqs: [
      {
        q: "Are Paul Digital tools free to use without uploading files?",
        a: "Yes. The tools run in your browser and your files are processed on your device, not uploaded.",
      },
      {
        q: "Why is a browser tool slower on my phone?",
        a: "The work uses your phone's processor and memory. Large images or many files at once take longer on lower-end devices.",
      },
    ],
    tools: [
      { href: "/tools/", label: "All web tools" },
      { href: "/image-compressor/", label: "Image Compressor" },
      { href: "/jpg-to-pdf/", label: "JPG to PDF" },
    ],
  },
  {
    slug: "preparing-text-for-a-pdf",
    title: "Preparing a document before converting it to PDF",
    metaTitle: "Preparing a Document Before Converting to PDF",
    description:
      "Checks to make before turning a Word document or text into a PDF: structure, fonts, images, page setup, file names and a final review, so the PDF reads well everywhere.",
    summary:
      "A PDF freezes your document exactly as it is. A few minutes of preparation means it looks right on every screen and printer and is easy for others to read.",
    category: "PDF and documents",
    published: "2026-10-03",
    updated: "2026-11-04",
    sections: [
      {
        heading: "Why preparation matters",
        html: `<p>The point of a PDF is that it looks the same on every device. That is also its drawback: any mistake in the original, such as a heading stranded at the bottom of a page, a blurry logo or a missing font, is frozen into the file. Fixing the source document first is much easier than editing a PDF afterwards.</p>`,
      },
      {
        heading: "1. Put the content in a clear order",
        html: `<p>Arrange the title, headings and paragraphs in the order you want someone to read them. Keep related points together and remove duplicate lines or notes to yourself. Use real heading styles (Heading 1, Heading 2) rather than just bold text; good converters carry them into the PDF as bookmarks, and screen readers use them to navigate.</p>`,
      },
      {
        heading: "2. Check page setup and breaks",
        html: `<ul>
<li>Choose the paper size the reader expects: A4 in most of the world, US Letter in the United States and Canada.</li>
<li>Use margins of at least 2 cm (about 0.75 inch) so nothing is cut off when printed.</li>
<li>Look for headings at the bottom of a page and single lines stranded at the top of the next one, and insert page breaks where needed.</li>
<li>Add page numbers to documents longer than a couple of pages.</li>
</ul>`,
      },
      {
        heading: "3. Use fonts that travel well",
        html: `<p>If a font is not embedded in the PDF and the reader's device does not have it, text may be substituted with something that changes the layout. Common fonts such as Arial, Calibri, Times New Roman and Noto avoid surprises. For languages with special scripts, check that every character appears correctly in the finished PDF, especially in names and addresses.</p>`,
      },
      {
        heading: "4. Prepare images",
        html: `<p>Very large photos make a PDF heavy without making it look better. Resize images to the size they actually appear on the page; about 1500 pixels wide is plenty for a full-width picture. Use PNG for logos and screenshots so they stay sharp, and JPEG for photographs. The <a href="/image-resizer/">Image Resizer</a> and <a href="/image-compressor/">Image Compressor</a> help here.</p>`,
      },
      {
        heading: "5. Convert, then review the PDF",
        html: `<p>Convert with your word processor's "Save as PDF" or "Export" option, or for images, with <a href="/jpg-to-pdf/">JPG to PDF</a>. Then open the PDF itself, not the original, and check:</p>
<ul>
<li>Every page is present and in order.</li>
<li>Text, tables and images are where you expect, with nothing cut off.</li>
<li>Links work, if the document has any.</li>
<li>The file size suits where it is going; email attachments are often limited to around 20–25 MB, and forms much less.</li>
</ul>`,
      },
      {
        heading: "6. Name the file clearly",
        html: `<p>A name such as <code>Priya-Sharma-Resume-2026.pdf</code> is far easier for the recipient than <code>Document1.pdf</code>. Avoid spaces and special characters if the file will be uploaded to a portal, since some systems reject them.</p>`,
      },
    ],
    faqs: [
      {
        q: "Why does my PDF look different from my Word document?",
        a: "Usually because of missing fonts, a different paper size, or images that were positioned relative to text. Use common fonts, check page size, and review the PDF before sending.",
      },
      {
        q: "How can I make my PDF smaller?",
        a: "Resize large images before converting, use JPEG for photos, and avoid pasting screenshots of text.",
      },
    ],
    tools: [
      { href: "/jpg-to-pdf/", label: "JPG to PDF" },
      { href: "/image-resizer/", label: "Image Resizer" },
      { href: "/image-compressor/", label: "Image Compressor" },
    ],
  },
];

export const guideBySlug = new Map(guides.map((guide) => [guide.slug, guide]));

/** Rough reading time at 220 words per minute. */
export function readingMinutes(guide: Guide): number {
  const text = guide.sections.map((s) => s.html).join(" ") + guide.faqs.map((f) => f.q + " " + f.a).join(" ");
  const words = text.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 220));
}

/** Guides that mention a given tool route, for "Learn more" links on tool pages. */
export function guidesForRoute(route: string): Guide[] {
  return guides.filter((guide) => guide.tools.some((tool) => tool.href === route) || guide.sections.some((s) => s.html.includes(`href="${route}"`)));
}
