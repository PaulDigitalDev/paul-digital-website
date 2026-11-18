import type { ToolArticle } from "./toolArticles";

/** Tool articles, part A: PDF and image tools. */
export const toolArticlesA: ToolArticle[] = [
  {
    route: "/merge-pdf/",
    title: "Getting a clean merged PDF",
    sections: [
      {
        heading: "Decide the order before you merge",
        html: `<p>Merging is quick, but changing your mind afterwards means merging again. Before you press the button, write down the order the reader expects. For an application that is usually the cover letter first, then the main form, then supporting documents, with the least important attachment last.</p>
<p>The file at the top of the list gives the first pages of the result, so use the arrows to move a file up or down until the list matches your plan. If you are combining a document that was already merged once, go back to the original files instead of merging a merged file with new ones. That keeps every piece easy to move.</p>`,
      },
      {
        heading: "Jobs a merged PDF is good for",
        html: `<ul>
<li><strong>One attachment instead of many.</strong> Many portals accept a single upload. A contract, its annexes and a signed page can travel together.</li>
<li><strong>Mixing sources.</strong> You can join a PDF exported from a word processor with pages you scanned or made with <a href="/jpg-to-pdf/">JPG to PDF</a>. Each page keeps its own content, so a scan and a digital page can sit side by side.</li>
<li><strong>Tidying a download pile.</strong> Statements, receipts and invoices for one month become one file that is easier to store and search.</li>
</ul>`,
      },
      {
        heading: "Check the result before you send it",
        html: `<p>Open the merged file and scroll through it once. Confirm that the total page count equals the page counts shown in the list added together, that nothing is upside down, and that the first and last page are the ones you expect.</p>
<p>Because pages are copied without recompression, the merged file is roughly as large as all the files added together. If the upload has a size limit, run the result through <a href="/compress-pdf/">Compress PDF</a>. If you only need some pages of a big file, take them out first with <a href="/split-pdf/">Split PDF</a>.</p>
<p>The limit is 30 files per merge. For more than that, merge them in two or three groups and then merge the groups.</p>`,
      },
    ],
    faqs: [
      { q: "Why is my merged PDF so large?", a: "Pages are copied exactly as they are, so the result is about the size of the inputs combined. Compress it afterwards if a size limit applies." },
      { q: "Can I merge more than 30 files?", a: "Not in one go. Merge them in groups of up to 30, then merge the group files together." },
      { q: "Will the pages keep their original look?", a: "Yes. Nothing is redrawn or recompressed, so text, images and links stay as they were. Interactive form fields and bookmarks may not carry over." },
    ],
  },
  {
    route: "/split-pdf/",
    title: "Pulling the right pages out of a PDF",
    sections: [
      {
        heading: "Pick the mode that matches your goal",
        html: `<p>The three modes answer three different questions. Use <strong>one PDF for each range</strong> when you want to cut a long document into chapters or sections: typing 1-3, 4-9, 10-20 gives three files. Use <strong>one PDF with the selected pages</strong> when you want a single new file made from pages scattered through the original. Use <strong>every page as a separate PDF</strong> when each page is its own item, such as a stack of scanned invoices.</p>`,
      },
      {
        heading: "Removing pages by listing the ones you keep",
        html: `<p>There is no separate delete mode, but selecting pages does the same job. To remove pages 5 and 6 from a 12-page file, choose the selected-pages mode and type 1-4, 7-12. The result is a new PDF without those two pages, and your original stays untouched.</p>
<p>The same idea works for reordering. If you choose to keep the order you typed, entering 3, 1, 2 puts the third page first.</p>`,
      },
      {
        heading: "Page numbers: file position, not printed number",
        html: `<p>The tool counts pages by their position in the file, starting at 1. A report may have a cover and a contents page before the page printed as number 1, so printed page 1 can be file page 3. Look at the page count in your viewer, not the number printed on the page, before you type a range.</p>
<p>When a part is still too large to upload, send it through <a href="/compress-pdf/">Compress PDF</a>. To stitch parts back together later, use <a href="/merge-pdf/">Merge PDF</a>.</p>`,
      },
    ],
    faqs: [
      { q: "How do I delete a page from a PDF?", a: "Choose the selected-pages mode and type every page you want to keep. To drop page 3 of 8, type 1-2, 4-8." },
      { q: "Can I extract just one page?", a: "Yes. Type a single number such as 7 in selected-pages mode and you get a one-page PDF." },
      { q: "Do scanned PDFs split correctly?", a: "Yes. Splitting works on pages, not on text, so scans split the same way as digital documents." },
    ],
  },
  {
    route: "/compress-pdf/",
    title: "What makes a PDF large, and what shrinks it",
    sections: [
      {
        heading: "Where the size comes from",
        html: `<p>Plain text takes very little space. A 20-page report with no pictures can be well under a megabyte. The big files are the ones with images: scans, photographed pages, brochures and slides with large pictures. A scanned page is one big image, so a 30-page scan can reach tens of megabytes even though it looks like a simple document.</p>
<p>That is why the same tool can shrink one PDF by 80% and another by almost nothing. It all depends on how much of the file is JPEG image data that can be recompressed.</p>`,
      },
      {
        heading: "Choosing a level",
        html: `<ul>
<li><strong>No quality loss</strong> rewrites the file structure and leaves images alone. The saving is usually small, but nothing visible changes.</li>
<li><strong>Balanced</strong> shrinks JPEG images moderately. It is the right first try for most documents.</li>
<li><strong>Maximum reduction</strong> compresses images hardest. Use it when a limit is strict, and zoom into the result to make sure small print is still readable.</li>
</ul>
<p>There is also an option to remove document metadata such as author and title, which trims a little more.</p>`,
      },
      {
        heading: "When it will not shrink, and what to do",
        html: `<p>If the tool reports a tiny saving, the file is probably already optimised or its images are not JPEG. A signed PDF also loses its digital signature in the smaller copy, so keep the signed original for the record.</p>
<p>Options that often work better: scan again at a lower resolution, remove pages you do not need with <a href="/split-pdf/">Split PDF</a>, or aim for a fixed goal with <a href="/compress-pdf-to-100kb/">Compress PDF to 100 KB</a> or <a href="/compress-pdf-to-200kb/">200 KB</a>. The guide on <a href="/guides/make-a-small-pdf-from-photos/">making a small PDF from photos</a> covers starting from images instead.</p>`,
      },
    ],
    faqs: [
      { q: "Is a PDF with only text worth compressing?", a: "Rarely. Text is already small, so there is little to gain. The saving comes from images." },
      { q: "Which level should I try first?", a: "Balanced. Move to Maximum reduction only if the file is still over your limit." },
      { q: "Does the original file change?", a: "No. The tool creates a new file for you to download and leaves the original as it was." },
    ],
  },
  {
    route: "/pdf-to-word/",
    title: "Before you convert a PDF to Word",
    sections: [
      {
        heading: "A ten-second test: is there real text?",
        html: `<p>Open the PDF and try to select a sentence with your mouse, or press Ctrl+F and search for a word you can see on the page. If the text highlights or the search finds it, the PDF contains real text and will convert. If nothing can be selected, the pages are pictures, and this tool will tell you that those pages had no text instead of giving you an empty file.</p>
<p>For a scanned document, turn the pages into images with <a href="/pdf-to-jpg/">PDF to JPG</a> and then read the text from each image with <a href="/jpg-to-text/">JPG to Text</a>, which uses optical character recognition.</p>`,
      },
      {
        heading: "What comes through and what needs work",
        html: `<p>The converter rebuilds paragraphs and headings from the position of the text, and keeps bold and italic where it can detect them. It does not copy the page design. Tables, columns, images and exact spacing may not be kept, so the Word file is best seen as clean, editable text rather than a copy of the layout.</p>
<ul>
<li>Check headings first, since they are the most likely to need a style applied in Word.</li>
<li>Look at lists, where bullets and numbers sometimes end up as plain characters.</li>
<li>Rebuild any table you need, using the original PDF as a reference.</li>
</ul>`,
      },
      {
        heading: "Limits worth knowing",
        html: `<p>The tool accepts PDFs up to 50 MB and 500 pages, and password-protected files are rejected, so remove the password first. Everything runs in your browser, which means a long document uses your device's memory and can take a little while on a phone.</p>
<p>To go the other way, use <a href="/word-to-pdf/">Word to PDF</a>. If you only need some pages, cut them out first with <a href="/split-pdf/">Split PDF</a> to speed up the conversion.</p>`,
      },
    ],
    faqs: [
      { q: "Why does the Word file look different from the PDF?", a: "The converter keeps text and basic styling, not the page layout. Tables, columns and images may need to be rebuilt." },
      { q: "Can I convert a scanned PDF?", a: "Not directly. Scanned pages contain no text. Turn them into images and use an OCR tool such as JPG to Text first." },
      { q: "Is the converted text accurate?", a: "For PDFs with real text it is copied from the file, not guessed. You should still read it through, especially numbers and special characters." },
    ],
  },
  {
    route: "/word-to-pdf/",
    title: "Getting a reliable PDF from a Word document",
    sections: [
      {
        heading: "Prepare the document first",
        html: `<p>The converter reads .docx files. If your document is an older .doc, open it in Word, Google Docs or LibreOffice and save it as .docx. Passwords are not supported, so remove protection before converting.</p>
<p>Because the PDF is drawn with standard PDF fonts, a special font in your document is replaced. Line breaks and page breaks can therefore land in slightly different places than in Word. Plain, common fonts and simple spacing give the closest match.</p>`,
      },
      {
        heading: "What is included, and what is not",
        html: `<p>Included: text, bold, italic, headings, lists, tables and images placed in line with the text. Not included in this version: headers, footers, page numbers, footnotes, text boxes, shapes, charts and equations. After conversion the tool lists what it left out, so read that note before you send the file on.</p>
<p>Characters outside the standard PDF fonts, such as emoji or non-Latin alphabets, are replaced with a question mark, and the tool reports it. If your document is mostly in another script, export the PDF from the program you wrote it in instead.</p>`,
      },
      {
        heading: "A short checklist before sending",
        html: `<ol>
<li>Scroll through every page and compare the page count with your expectation.</li>
<li>Check tables and lists, which are where layout differences show first.</li>
<li>If a form or recruiter limits file size, run the result through <a href="/compress-pdf/">Compress PDF</a>.</li>
<li>To add attachments to the same file, join them with <a href="/merge-pdf/">Merge PDF</a>.</li>
</ol>
<p>For tips on preparing text so it converts cleanly, see <a href="/guides/preparing-text-for-a-pdf/">preparing text for a PDF</a>.</p>`,
      },
    ],
    faqs: [
      { q: "Why do my page breaks move?", a: "The PDF uses standard fonts instead of the fonts in your document, so lines can wrap differently and pages can break in other places." },
      { q: "Is my header and page number kept?", a: "No. Headers, footers and page numbers are not part of this version. Export from Word itself if you need them." },
      { q: "Can I convert a Google Doc?", a: "Download it as a Word (.docx) file from Google Docs first, then convert that file here." },
    ],
  },
  {
    route: "/pdf-to-jpg/",
    title: "Turning PDF pages into images: sizes and settings",
    sections: [
      {
        heading: "How resolution turns into pixels",
        html: `<p>A PDF page has a physical size, and the DPI you choose decides how many pixels cover each inch of it. Pixels equal inches times DPI. An A4 page is about 8.27 by 11.69 inches, so it comes out near 595 by 842 pixels at 72 DPI, near 1241 by 1754 at 150 DPI and near 2481 by 3508 at 300 DPI. Doubling the DPI quadruples the number of pixels, which is why the files grow so quickly.</p>`,
      },
      {
        heading: "Choosing a setting for the job",
        html: `<ul>
<li><strong>Sharing or sending on a phone:</strong> 150 DPI keeps text readable and files modest.</li>
<li><strong>Printing:</strong> 300 DPI gives a sharp page, at a much larger file size.</li>
<li><strong>A quick preview or thumbnail:</strong> 72 DPI is enough.</li>
</ul>
<p>Pages with small print benefit from a higher quality setting, since low quality blurs thin letters first. Photos tolerate lower quality much better than text does.</p>`,
      },
      {
        heading: "After you convert",
        html: `<p>Each page becomes a picture, so the text can no longer be selected, searched or edited. If you need editable words, use <a href="/pdf-to-word/">PDF to Word</a> for text PDFs. If you need the text from a scanned page, run the image through <a href="/jpg-to-text/">JPG to Text</a>.</p>
<p>Only want some pages? Use <a href="/split-pdf/">Split PDF</a> first so you do not create images you will never use. If a form limits file size, bring the images down with the <a href="/image-compressor/">Image Compressor</a>. The guide on <a href="/guides/image-file-size-pixels-dpi-explained/">pixels, DPI and file size</a> explains the numbers in more detail.</p>`,
      },
    ],
    faqs: [
      { q: "Why does a very large page come out smaller than I chose?", a: "Browsers limit how big an image can be drawn. For oversized pages the tool lowers the resolution and tells you when it does." },
      { q: "Is the background transparent?", a: "No. JPG has no transparency, so every page is drawn on a white background." },
      { q: "How many pages can I convert at once?", a: "Up to 100 pages and 100 MB per PDF. Download them together as a ZIP." },
    ],
  },
  {
    route: "/jpg-to-pdf/",
    title: "Making a good PDF from photos and scans",
    sections: [
      {
        heading: "Start with clean, cropped images",
        html: `<p>Whatever size limit you face, the PDF can only be as small as the images inside it. Before you convert, crop each photo to the page, straighten any sideways pictures, and remove empty borders. A tightly cropped document photo can be a fraction of the size of the uncropped original and looks better on the page.</p>
<p>If an image is much larger than you need, shrink it with the <a href="/image-resizer/">Image Resizer</a> first. A page needs far fewer pixels to be readable on screen than a modern phone camera produces.</p>`,
      },
      {
        heading: "A4 pages or pages the size of each image",
        html: `<p>Choose A4 when the PDF will be printed or must look like a standard document: every image is placed on an A4 page. Choose pages that match each image when the pictures differ in shape and you do not want white margins, for example receipts of different sizes. The order of the list is the order of the pages, so arrange it before you create the file.</p>`,
      },
      {
        heading: "Working to a size limit",
        html: `<p>The converter embeds JPEGs unchanged when they already fit, and recompresses them gradually only when the PDF would exceed the target. The result panel shows the measured size, so you know whether the limit was met before you download.</p>
<p>When the limit is tight, fewer pages helps more than anything else. If several documents are needed in one upload, make separate PDFs and combine them with <a href="/merge-pdf/">Merge PDF</a>, then check the total. For a ready-made target, open <a href="/jpg-to-pdf-under-100kb/">JPG to PDF under 100 KB</a>.</p>`,
      },
    ],
    faqs: [
      { q: "Does it accept PNG or HEIC images?", a: "The converter takes JPG and JPEG. Convert other formats first with the Image Converter, or HEIC with HEIC to JPG." },
      { q: "Can I change the page order after adding images?", a: "Yes. Use the arrows to move a page up or down, and remove any you do not need before creating the PDF." },
      { q: "Why is my PDF bigger than the target?", a: "Too many or too detailed images. Reduce the number of pages or resize the images, then try again." },
    ],
  },
  {
    route: "/image-compressor/",
    title: "A practical workflow for small image files",
    sections: [
      {
        heading: "Crop and resize before you compress",
        html: `<p>Compression works best on a picture that holds only what you need. First crop away empty background with the <a href="/crop-rotate-flip-image/">crop tool</a>. Then, if the picture is far larger than the form wants, reduce its pixel size with the <a href="/image-resizer/">Image Resizer</a>. Every pixel you remove is data the compressor no longer has to squeeze, so the quality that remains is higher.</p>
<p>Starting from the original is also better than compressing a copy that was already compressed. Each lossy save loses a little detail, and repeated saving adds up.</p>`,
      },
      {
        heading: "Why some images refuse to get small",
        html: `<p>Noisy images, such as photos taken in low light, shots of grass or leaves, and busy patterns, resist compression, because the grain looks like detail. A flat background and an evenly lit subject shrink far more easily. If a 20 KB target looks impossible, check whether a smaller crop or a plainer background fixes it before you lower quality further.</p>
<p>PNG files from screenshots and graphics are a special case. They are lossless, so shrinking them usually means changing the pixel size or saving a photo-like image as JPEG instead. The guide on <a href="/guides/jpg-vs-png-vs-webp-vs-heic/">JPG, PNG, WebP and HEIC</a> explains which format suits which picture.</p>`,
      },
      {
        heading: "Check the result before you upload",
        html: `<ol>
<li>Read the size shown after compression and confirm it is under the limit, with a few KB to spare.</li>
<li>Zoom in on faces, signatures or small text to make sure they are still clear.</li>
<li>Use the form's accepted format. If it asks for JPG, choose JPG.</li>
</ol>
<p>For common limits, ready-made pages such as <a href="/compress-image-to-100kb/">compress image to 100 KB</a> and <a href="/resize-image-to-50kb/">resize image to 50 KB</a> start with the target filled in.</p>`,
      },
    ],
    faqs: [
      { q: "Should I compress or resize?", a: "Compress when the picture's dimensions are fine but the file is too big. Resize when the dimensions are too large. Often both together give the best result." },
      { q: "Can I compress an image several times?", a: "Avoid it. Each lossy save removes some detail. Go back to the original and compress once at the setting you need." },
      { q: "Why is the file slightly different from my exact target?", a: "The target is a goal, not a promise. The tool measures the real size and shows it, aiming at or just under your limit." },
    ],
  },
  {
    route: "/image-resizer/",
    title: "Which resize mode to use",
    sections: [
      {
        heading: "Pixels, percentage or centimetres",
        html: `<p><strong>Pixels</strong> is the mode for websites, forms and apps, which usually state a width and a height in pixels. <strong>Percentage</strong> suits quick scaling, such as halving a photo for email. <strong>Centimetres with a DPI</strong> is for print, where you know the paper size, for example a 10 cm wide photo at 300 DPI, which is about 1181 pixels across.</p>
<p>Keep Lock aspect ratio on unless you really want to stretch the picture. If a form needs an exact width and height that differ from the shape of your photo, crop first with the <a href="/crop-rotate-flip-image/">crop tool</a> so you do not distort a face.</p>`,
      },
      {
        heading: "Making smaller versus making larger",
        html: `<p>Reducing a picture throws away pixels, and the tool does it in steps for large reductions, which helps fine detail survive. Enlarging cannot invent detail that the camera never captured, so an enlarged image looks softer. If you must enlarge, do it once, from the best original you have, and keep the amount modest.</p>`,
      },
      {
        heading: "What DPI does and does not do",
        html: `<p>DPI is only used to convert centimetres into pixels. The downloaded file does not store a DPI value, so print software may assume its own. To check or change density metadata, see <a href="/dpi-checker/">DPI Checker</a> and <a href="/convert-dpi/">Convert DPI</a>. The guide on <a href="/guides/image-file-size-pixels-dpi-explained/">pixels, DPI and file size</a> explains why more pixels do not always mean a bigger print.</p>
<p>Resizing changes the file size indirectly. If the result must be under a size in KB, finish with the <a href="/image-compressor/">Image Compressor</a>, which measures the real size as it works.</p>`,
      },
    ],
    faqs: [
      { q: "Will resizing make the file smaller?", a: "Usually, when you reduce the dimensions. But a PNG or a high quality setting can keep the file large, and the result panel shows the real size." },
      { q: "What is the maximum size I can create?", a: "Up to 12,000 pixels per side and 50 megapixels in total. Larger canvases often fail in browsers." },
      { q: "Which format should I save as?", a: "JPG or WebP for photographs, PNG for screenshots, logos and graphics with sharp edges." },
    ],
  },
  {
    route: "/crop-rotate-flip-image/",
    title: "Cropping and straightening, step by step",
    sections: [
      {
        heading: "The best order to work in",
        html: `<ol>
<li><strong>Rotate or flip first.</strong> Turning a picture changes its shape, and the crop box restarts from the largest allowed area after a rotation. Fix orientation before you place the box.</li>
<li><strong>Choose a shape.</strong> Lock the box to a ratio such as 1:1 for a square or 16:9 for a wide frame so the proportions stay fixed as you resize it.</li>
<li><strong>Position the box</strong> by dragging it, or type exact left, top, width and height values when a form states them.</li>
<li><strong>Export</strong> in the format you need and check the size shown in the result.</li>
</ol>`,
      },
      {
        heading: "When flipping is useful",
        html: `<p>Rotation fixes pictures saved sideways and scans fed in the wrong way. A horizontal flip mirrors the picture left to right, which helps when a front camera saved a selfie as a mirror image, or when text appears reversed. A vertical flip turns the picture top to bottom. Neither changes the original file, since the edited picture is created only when you export.</p>`,
      },
      {
        heading: "Choosing JPG, WebP or PNG for the export",
        html: `<p>Only the pixels inside the box are saved, at their original resolution. JPG and WebP are recompressed once at the quality you choose, which keeps files small. PNG is lossless, so it keeps the cropped area exactly as it is, at a larger size. For a photo going to a form with a KB limit, export as JPG and finish with the <a href="/image-compressor/">Image Compressor</a>.</p>
<p>If the cropped picture must also be a certain size, continue with the <a href="/image-resizer/">Image Resizer</a>. For a portrait with a fixed shape, <a href="/passport-photo-resizer/">Passport Photo Resizer</a> does the cropping and sizing in one step. To make a round avatar, try <a href="/crop-image-to-circle/">Crop Image to Circle</a>.</p>`,
      },
    ],
    faqs: [
      { q: "Can I type exact crop values?", a: "Yes. You can set the left, top, width and height numerically, as well as dragging the box." },
      { q: "Why does the crop box change after I rotate?", a: "Rotation changes the picture's shape, so the old box no longer fits. It restarts at the largest area available." },
      { q: "Does cropping reduce the quality?", a: "The cropped area keeps its resolution. A JPG or WebP export is recompressed once, so choose a high quality setting or PNG to avoid visible loss." },
    ],
  },
  {
    route: "/image-metadata/",
    title: "Where photo metadata hides, and what to do about it",
    sections: [
      {
        heading: "What a photo can carry besides the picture",
        html: `<p>A photo file is more than pixels. Phones and cameras commonly record the device model, the date and time, the lens settings and sometimes GPS coordinates. Editing programs can add XMP or IPTC blocks with titles, keywords or author names, and PNG and WebP files can hold text comments. None of it shows in the picture, but anyone who has the file can read it.</p>
<p>That matters most when you post or send an original file: selling something online from your home, sending a photo of a document, or sharing a picture of a child. It is worth looking at what the file says before it leaves your device.</p>`,
      },
      {
        heading: "Two ways to clean a file",
        html: `<p>The first method copies the picture data unchanged and leaves out the metadata blocks around it, so quality does not change. The second redraws the picture into a new file, which does not copy the original metadata at all and also applies any stored rotation. After either method, the tool reads the new file again and lists what it checked, so you can see the result rather than take it on trust.</p>`,
      },
      {
        heading: "What this cannot fix",
        html: `<p>Removing metadata does not change what is visible in the picture. A street sign, a house number or a face can give away as much as a GPS tag. It also cannot recall copies you have already sent. For a longer look at the risks, read <a href="/guides/remove-location-from-photos-exif/">how to remove location data from photos</a>.</p>
<p>If you also need a smaller file, continue with the <a href="/image-compressor/">Image Compressor</a>, and use the <a href="/image-converter/">Image Converter</a> for formats the viewer cannot read.</p>`,
      },
    ],
    faqs: [
      { q: "Does removing metadata reduce quality?", a: "Not with the default method, which copies the picture data unchanged. The redraw method recompresses the image once." },
      { q: "Will the photo appear sideways after cleaning?", a: "It can, if the file used an orientation tag and some apps ignore the change. The redraw method applies the rotation for you." },
      { q: "Does the tool ask for my location?", a: "No. It never asks for location or any permission. Any GPS data it shows was already inside the file." },
    ],
  },
  {
    route: "/favicon-generator/",
    title: "Which icon files a website needs",
    sections: [
      {
        heading: "What each generated file is for",
        html: `<ul>
<li><strong>favicon.ico</strong> holds 16, 32 and 48 pixel versions in one file. Many tools and older browsers still request it at the site root.</li>
<li><strong>favicon-16x16.png and favicon-32x32.png</strong> are used by modern browsers in tabs and bookmarks.</li>
<li><strong>apple-touch-icon.png</strong> at 180 pixels is the icon iPhones and iPads use when someone saves your site to the home screen.</li>
<li><strong>android-chrome-192x192.png and android-chrome-512x512.png</strong> serve Android home screens and installable web apps.</li>
</ul>`,
      },
      {
        heading: "Prepare the source image",
        html: `<p>Start from a square PNG or similar image of at least 512 by 512 pixels. A favicon is shown at 16 pixels in a browser tab, so simple shapes, thick lines and strong contrast work; fine detail and small text disappear. Leave padding around the symbol so it is not cut off, and choose a background colour for the touch icon, since iOS does not support transparent touch icons. Non-square images can be fitted with padding or cropped from the centre.</p>`,
      },
      {
        heading: "Install and test",
        html: `<ol>
<li>Download the ZIP and upload the files to the root folder of your website.</li>
<li>Paste the generated HTML snippet into the head section of your pages.</li>
<li>Open your site in a private window, since browsers cache the old icon and may keep showing it for a while.</li>
</ol>
<p>SVG sources are not accepted by this version. If you only need an ICO from a PNG, <a href="/png-to-ico/">PNG to ICO</a> is a lighter option, and <a href="/webp-to-png/">WebP to PNG</a> converts a source in another format.</p>`,
      },
    ],
    faqs: [
      { q: "Do I need all the generated files?", a: "A favicon.ico and a PNG or two cover most cases. The touch and Android icons matter if people save your site to a phone home screen." },
      { q: "Why is my old icon still showing?", a: "Browsers cache favicons for a long time. Try a private window, or clear the site data and reload." },
      { q: "What size should my source image be?", a: "At least 512 by 512 pixels and square, so every smaller size is scaled down from enough detail." },
    ],
  },
  {
    route: "/heic-to-jpg/",
    title: "Why iPhone photos are HEIC, and how to share them",
    sections: [
      {
        heading: "What HEIC is and why it causes trouble",
        html: `<p>Recent iPhones and iPads save photos as HEIC (or HEIF) by default because the format keeps good quality at a smaller size than JPG. The catch is compatibility. Many Windows programs, websites and older phones cannot open HEIC, and upload forms often accept only JPG or PNG. Converting to JPG gives a file that opens almost everywhere.</p>`,
      },
      {
        heading: "How the conversion works here",
        html: `<p>Safari can decode HEIC itself. In other browsers a small decoder of about 1.3 MB is downloaded only when you choose a HEIC file, so the rest of the site stays light. Your photos are never uploaded; only the decoder code is fetched. Large photos can take several seconds and a fair amount of memory, so on a phone convert a few at a time.</p>
<p>Only the main still image is converted. Depth maps, video parts of Live Photos and other extras are ignored, and metadata such as date and location is not copied to the JPG.</p>`,
      },
      {
        heading: "After you have the JPG",
        html: `<ul>
<li>If a form has a size limit, reduce the file with the <a href="/image-compressor/">Image Compressor</a>.</li>
<li>If you need a different format, use <a href="/image-to-jpg/">Image to JPG</a> or the Image Converter for other types.</li>
<li>If you also want to check what metadata a photo carries before sharing it, open <a href="/image-metadata/">Image Metadata</a>.</li>
</ul>
<p>To avoid HEIC in future, open Settings, then Camera, then Formats and choose Most Compatible. See <a href="/guides/heic-to-jpg-iphone-photos/">the HEIC to JPG guide</a> for more.</p>`,
      },
    ],
    faqs: [
      { q: "Does converting HEIC to JPG lose quality?", a: "JPG is a lossy format, so a small amount of detail is lost. At a high quality setting the difference is hard to see." },
      { q: "Why did one of my HEIC files fail?", a: "It may be damaged, protected, or a variant the decoder does not support. Export the photo again from your phone as a JPG." },
      { q: "Is the date of the photo kept?", a: "No. Metadata is not copied to the JPG. Keep the original HEIC if you need the date or location." },
    ],
  },
];
