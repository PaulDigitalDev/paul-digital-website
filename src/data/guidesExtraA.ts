import type { Guide } from "./guides";

/**
 * Practical guides on PDF files, images, photo uploads and text. Written in the same format as the guides in
 * guides.ts and appended to the same list there. Section bodies are trusted HTML (paragraphs, lists, tables and
 * internal links only).
 */
export const extraGuidesA: Guide[] = [
  {
    slug: "how-to-merge-pdf-files-in-the-right-order",
    title: "How to merge PDF files into one, in the right order",
    metaTitle: "How to Merge PDF Files in the Right Order",
    description:
      "Combine several PDFs into one clean file: plan the order, prepare each file, merge without recompression, check the result and keep the size under a limit.",
    summary:
      "A form that accepts only one attachment turns a folder of PDFs into a small project. Here is how to merge them in the right order, avoid common surprises and keep the result a sensible size.",
    category: "PDF and documents",
    published: "2026-11-18",
    updated: "2026-11-18",
    sections: [
      {
        heading: "When merging is the right move",
        html: `<p>Merging means joining the pages of several PDF files into one document. It is the usual answer when a portal asks for a single upload but your paperwork exists in pieces: a contract and its annexes, an invoice and the receipt, a CV with a cover letter, or a set of scans saved one page at a time.</p>
<p>It is not the right tool when the pieces should stay separate. Many application systems want the photo, the ID and the certificate as three uploads, and a merged file will be rejected. Read the instructions first and merge only when a single file is requested.</p>`,
      },
      {
        heading: "Plan the order before you merge",
        html: `<p>The merged file contains every page of the first file, then every page of the second, and so on. Changing the order afterwards means merging again, so decide it up front.</p>
<ol>
<li><strong>Write the order down.</strong> Most reviewers expect the cover page or application form first, then supporting documents in the order the instructions list them.</li>
<li><strong>Rename the files</strong> with numbers, such as 01-form.pdf and 02-id.pdf, so you can see the order at a glance.</li>
<li><strong>Check each file opens normally.</strong> A damaged or password-protected file will stop the merge. Remove the password in the program you normally use to open it.</li>
<li><strong>Check page orientation.</strong> A landscape page inside a portrait document is fine, but a page that is sideways because it was scanned the wrong way up is not.</li>
</ol>`,
      },
      {
        heading: "Merging step by step",
        html: `<p>With the <a href="/merge-pdf/">Merge PDF</a> tool, add all the files at once, then use the arrows to put them in order. The list shows the page count and size of each file, which is a quick way to catch the wrong file or an empty scan. Press Merge and download the result.</p>
<p>Because the pages are copied rather than redrawn, text, images and links look the same as in the originals and the quality does not drop. The tool runs in your browser, so a document with personal details is not sent to a server. Large files use your device's memory, so a phone copes best with a few moderate files rather than dozens of big ones.</p>
<p>Two things may not survive a merge: interactive form fields and bookmarks. If your document relies on fillable fields, fill and flatten it before merging, or merge first and fill in the combined file.</p>`,
      },
      {
        heading: "Keeping the merged file small enough",
        html: `<p>A merged PDF is roughly the sum of its parts, so five 2 MB files make a file of about 10 MB. If the upload limit is lower, shrink the parts that carry the weight, usually scanned pages and photos.</p>
<ul>
<li>Remove pages you do not need before merging with <a href="/split-pdf/">Split PDF</a>, for example a blank back page.</li>
<li>Run the finished file through <a href="/compress-pdf/">Compress PDF</a>. Scans shrink the most because every page is a large picture.</li>
<li>If your pages are photos, build the PDF directly from the images with <a href="/jpg-to-pdf/">JPG to PDF</a> instead of merging bulky scans.</li>
<li>For a hard limit such as 200 KB, see <a href="/compress-pdf-to-200kb/">Compress PDF to 200 KB</a> and leave a little margin under the number.</li>
</ul>`,
      },
      {
        heading: "Check the result before you upload",
        html: `<p>Open the merged file and scroll through it once. It takes under a minute and catches the mistakes that get applications returned.</p>
<ul>
<li>The page count matches the sum of the originals.</li>
<li>The first page is the one the reviewer should see first.</li>
<li>No page is upside down, cropped or blank.</li>
<li>Text is readable at normal zoom, including in scanned pages.</li>
</ul>
<p>Keep your original files. If you spot a problem, fix the original and merge again rather than editing the combined file.</p>`,
      },
      {
        heading: "Common problems and quick fixes",
        html: `<table>
<thead><tr><th>Problem</th><th>Likely cause</th><th>Fix</th></tr></thead>
<tbody>
<tr><td>The tool rejects a file</td><td>Password-protected, damaged or not really a PDF</td><td>Remove the password, or open and re-save the file in your PDF viewer</td></tr>
<tr><td>Pages are in the wrong order</td><td>Files were added in the wrong order</td><td>Reorder with the arrows and merge again from the originals</td></tr>
<tr><td>The result is too large</td><td>Scans and photos carry most of the size</td><td>Compress the merged file, or shrink the heavy parts first</td></tr>
<tr><td>Fillable fields stopped working</td><td>Form fields and bookmarks may not carry over</td><td>Fill and flatten the form first, or fill it after merging</td></tr>
<tr><td>A page is sideways</td><td>It was scanned that way</td><td>Rotate it in the original file before merging</td></tr>
</tbody>
</table>
<p>The tool accepts up to 30 files, each up to 100 MB and 300 MB in total. If you are near those limits, merge in two stages: join the first half and the second half, then merge the two results. Always merge from the original files, not from a file that was already merged, so the order stays easy to correct.</p>`,
      },
    ],
    faqs: [
      { q: "Does merging reduce the quality of my PDFs?", a: "No. The pages are copied as they are, so text, images and links look the same as before. Quality only drops if you compress the result afterwards." },
      { q: "Can I merge PDFs that have passwords?", a: "Not directly. Remove the password in the program you use to open the file, save a copy, and merge the copy." },
      { q: "Can I change the order after merging?", a: "Not inside the merge tool. Merge again from the original files with the order corrected, or use Split PDF in selected-pages mode to build a new file in a custom order." },
      { q: "Is it safe to merge confidential documents online?", a: "With a browser-based tool the files are processed on your own device and are not uploaded, which is the safer way to handle ID and financial documents." },
    ],
    tools: [
      { href: "/merge-pdf/", label: "Merge PDF" },
      { href: "/split-pdf/", label: "Split PDF" },
      { href: "/compress-pdf/", label: "Compress PDF" },
      { href: "/jpg-to-pdf/", label: "JPG to PDF" },
    ],
  },
  {
    slug: "how-to-split-a-pdf-and-extract-pages",
    title: "How to split a PDF and extract just the pages you need",
    metaTitle: "How to Split a PDF and Extract Pages",
    description:
      "Pull selected pages out of a PDF, split it by page ranges or save every page as its own file, with the page-number mistakes that trip people up.",
    summary:
      "You rarely need a whole 80-page document. This guide shows how to cut out the pages a form asks for, split a long file into parts and avoid the common page-numbering mix-up.",
    category: "PDF and documents",
    published: "2026-11-18",
    updated: "2026-11-18",
    sections: [
      {
        heading: "Why people split PDFs",
        html: `<p>Splitting builds new PDF files from some of the pages of an existing one. The original is not changed. Typical reasons:</p>
<ul>
<li>A form asks only for the signature page of a long contract.</li>
<li>One invoice needs to be sent from a monthly statement that contains twenty.</li>
<li>A file is over an upload limit and you can send it in two parts.</li>
<li>You want a single chapter from a report or a few pages from a scanned book.</li>
<li>You need to remove blank or confidential pages before sharing.</li>
</ul>`,
      },
      {
        heading: "Three ways to split, and when to use each",
        html: `<table>
<thead><tr><th>Mode</th><th>What you get</th><th>Best for</th></tr></thead>
<tbody>
<tr><td>One PDF per range</td><td>Typing 1-3, 5, 8-10 gives three separate files</td><td>Cutting a document into logical parts</td></tr>
<tr><td>One PDF with selected pages</td><td>All chosen pages in a single new file</td><td>Extracting pages from the middle, or building a custom order</td></tr>
<tr><td>Every page separately</td><td>One file per page, offered as a ZIP</td><td>Sorting a scanned batch or sending pages to different people</td></tr>
</tbody>
</table>
<p>The <a href="/split-pdf/">Split PDF</a> tool offers all three. Selected-pages mode is the most flexible because it lets you type or click the pages you want and keep either the order you typed or the order of the document.</p>`,
      },
      {
        heading: "Page numbers: the mix-up that wastes time",
        html: `<p>Page numbers in a PDF tool count from 1 at the first page of the file. The number printed on the page itself may be different, because a document often has a cover, a contents page or roman-numbered front matter. If the printed number says 5 but it is the seventh sheet in the file, you need to type 7.</p>
<p>Before you split, look at the page numbers your PDF viewer shows in its page box, or in the thumbnail panel, and write down the positions you need. Then check these rules, which the tool enforces and will tell you about when one is broken:</p>
<ul>
<li>Numbers run from 1 to the last page.</li>
<li>In a range the smaller number comes first, so write 8-10, not 10-8.</li>
<li>A page cannot be listed twice in one split.</li>
</ul>`,
      },
      {
        heading: "A worked example",
        html: `<p>Suppose you have a 24-page rental agreement and the portal wants the signature page (page 22) and the identity schedule (pages 9 to 11) in one file, in that order.</p>
<ol>
<li>Open <a href="/split-pdf/">Split PDF</a> and add the agreement. It shows 24 pages.</li>
<li>Choose the mode that puts selected pages in one PDF.</li>
<li>Type 22, 9-11 and choose to keep the order you typed.</li>
<li>Press Split PDF and download the new four-page file.</li>
</ol>
<p>If the result is still too large, run it through <a href="/compress-pdf/">Compress PDF</a>. Cutting pages first is always the cheapest saving, because every page you remove takes its images with it.</p>`,
      },
      {
        heading: "Limits and good habits",
        html: `<ul>
<li>Password-protected and damaged PDFs are rejected. Remove the password first.</li>
<li>Very large files need memory on your device. On a phone, split a big file in a few steps rather than all at once.</li>
<li>If you need to join the parts again later, <a href="/merge-pdf/">Merge PDF</a> puts them back in a chosen order.</li>
<li>Keep the original. The tool never changes it, but it is the only complete copy you have.</li>
</ul>`,
      },
      {
        heading: "Splitting a PDF to fit an upload limit",
        html: `<p>When a file is over a portal's limit and the portal accepts several uploads, splitting it in two or three parts is a quick fix. A split works on pages, not on kilobytes, so you cannot ask for a part of exactly 2 MB. Instead, divide the document where it makes sense and check the size of each part.</p>
<ol>
<li>Pick natural break points, such as the end of a chapter or the end of a form section.</li>
<li>Use ranges mode, for example 1-12, 13-24, 25-36, to get one file per range.</li>
<li>Check each part's size. A part with many scanned pages will be larger than a part of text.</li>
<li>If one part is still too big, compress it, or split it again at a different point.</li>
</ol>
<p>The tool handles PDFs up to 100 MB and 1000 pages and produces at most 200 files and 500 MB of output from one split. Name the parts so the order is obvious, such as report-part-1.pdf and report-part-2.pdf, and keep the parts together in one folder. If the portal wants one file after all, <a href="/merge-pdf/">Merge PDF</a> puts them back together in the right order.</p>`,
      },
    ],
    faqs: [
      { q: "How do I extract pages from a PDF?", a: "Open the PDF in a split tool, choose the mode that saves the selected pages in one file, type the pages you want such as 2-4, 9, and download the new file." },
      { q: "Does splitting change my original file?", a: "No. The tool reads your file and builds new ones from copies of the pages. The original stays as it was." },
      { q: "Why does my page range show as invalid?", a: "Ranges must use numbers between 1 and the last page, with the smaller number first and no page listed twice. The message names the part to fix." },
      { q: "Can I put the extracted pages in a different order?", a: "Yes. In selected-pages mode choose to keep the order you typed, so 22, 9-11 gives page 22 first." },
    ],
    tools: [
      { href: "/split-pdf/", label: "Split PDF" },
      { href: "/merge-pdf/", label: "Merge PDF" },
      { href: "/compress-pdf/", label: "Compress PDF" },
    ],
  },
  {
    slug: "how-to-compress-a-pdf-without-ruining-it",
    title: "How to compress a PDF without making it unreadable",
    metaTitle: "How to Compress a PDF Without Losing Readability",
    description:
      "Why PDFs get big, what compression levels really do, and how to reach limits like 100 KB or 200 KB without turning scans and photos into mush.",
    summary:
      "Most of a PDF's weight is pictures. Understand where the size comes from and you can shrink a file with the least damage, and know when a target such as 100 KB is realistic.",
    category: "PDF and documents",
    published: "2026-11-18",
    updated: "2026-11-18",
    sections: [
      {
        heading: "Where the size of a PDF comes from",
        html: `<p>A PDF made from a word processor, with only text, is often tiny: a few pages can be well under 100 KB. Size explodes when pages contain images. A photo or a scanned page is one large picture, and a ten-page scan can be many megabytes even though it looks like a simple text document.</p>
<p>So the useful question is not how to squeeze the file but what is inside it. Mostly text means there is little to save. Mostly scans means the savings come from the images, and every saving costs some sharpness.</p>`,
      },
      {
        heading: "What the compression levels actually do",
        html: `<p>The <a href="/compress-pdf/">Compress PDF</a> tool has three levels, which show the typical trade-off:</p>
<ul>
<li><strong>No quality loss</strong> reorganises and compresses the file structure and does not touch images. Safe, but the saving is usually modest.</li>
<li><strong>Balanced</strong> also shrinks JPEG images to medium-high quality and at most 2000 pixels per side. It is the best first try.</li>
<li><strong>Maximum reduction</strong> goes to medium quality and 1400 pixels. This can be visible in photos and scans, and is what you use when a hard limit forces your hand.</li>
</ul>
<p>Only JPEG images inside the PDF are shrunk. Drawn text and other image types are kept as they are. A PDF that was already optimised may barely change, and an honest tool says so instead of handing you a file that is the same size.</p>`,
      },
      {
        heading: "A sensible order of attack",
        html: `<ol>
<li><strong>Remove what you do not need.</strong> Use <a href="/split-pdf/">Split PDF</a> to drop blank pages, covers and duplicates. This saves the most with no loss in quality.</li>
<li><strong>Try Balanced.</strong> Check the new size and zoom in on a page to judge readability.</li>
<li><strong>Go to Maximum reduction only if needed.</strong> Check small print, stamps and signatures.</li>
<li><strong>Keep the original</strong> in case you need full quality later.</li>
</ol>
<p>A digitally signed PDF loses its signature in a compressed copy, so do not compress a document whose signature must stay valid. Compress before signing instead.</p>`,
      },
      {
        heading: "Reaching 100 KB or 200 KB",
        html: `<p>Portals often set limits such as 50, 100, 200 or 500 KB. Whether you can reach one depends on the content:</p>
<table>
<thead><tr><th>Content</th><th>Realistic at 100 KB?</th></tr></thead>
<tbody>
<tr><td>A few pages of text from a word processor</td><td>Usually yes, often with room to spare</td></tr>
<tr><td>One or two scanned pages, scanned at modest resolution</td><td>Often, on a strong setting</td></tr>
<tr><td>Many scanned pages or colour photos</td><td>Rarely. Fewer pages or a lower scan resolution will do more than compressing again</td></tr>
</tbody>
</table>
<p>The pages for <a href="/compress-pdf-to-100kb/">100 KB</a> and <a href="/compress-pdf-to-200kb/">200 KB</a> start on the strongest level and report the real size reached. Leave a small margin: a file of 96 KB passes whether a website counts a kilobyte as 1,000 or 1,024 bytes, while 100.5 KB may not.</p>`,
      },
      {
        heading: "If the file will not get small enough",
        html: `<ul>
<li><strong>Rescan at a lower resolution.</strong> 150 DPI is enough for readable text, and 300 DPI makes files far larger than a form needs.</li>
<li><strong>Scan in black and white</strong> if colour carries no meaning, such as for a printed letter.</li>
<li><strong>Build the PDF from small images.</strong> <a href="/jpg-to-pdf/">JPG to PDF</a> is more effective than squeezing a finished heavy file.</li>
<li><strong>Compress the images first</strong> with the <a href="/image-compressor/">Image Compressor</a> and then make the PDF.</li>
</ul>
<p>No tool can promise an exact percentage. What you can rely on is a tool that shows the real before-and-after size and lets you decide.</p>`,
      },
      {
        heading: "How to judge the quality after compressing",
        html: `<p>The file size tells you the saving, but only your eyes can tell whether the result is still usable. Check it the way the recipient will read it.</p>
<ul>
<li><strong>Zoom to 100 percent</strong> and read a paragraph of the smallest text. If you have to squint, the compression was too strong.</li>
<li><strong>Look at numbers and codes.</strong> Account numbers, dates, ID digits and amounts must be unmistakable. A 6 that looks like an 8 is a real problem.</li>
<li><strong>Check stamps, seals and signatures.</strong> Fine lines are the first thing to blur.</li>
<li><strong>Open it on a phone.</strong> Many reviewers read on a small screen, where blur is more obvious.</li>
<li><strong>Compare with the original</strong> on the same page, side by side.</li>
</ul>
<p>If the result fails the test, go back one level, from Maximum reduction to Balanced, and look for savings somewhere else: fewer pages, a lower scan resolution or removing the document metadata the tool offers to strip. Remember that a digitally signed document loses its signature in the compressed copy, so keep the signed original for any purpose where the signature must remain valid.</p>`,
      },
    ],
    faqs: [
      { q: "Why is my scanned PDF so big?", a: "Each scanned page is one large picture, and pictures are the heavy part of a PDF. Scan at a lower resolution or in black and white if colour is not needed." },
      { q: "Will compression make my PDF blurry?", a: "The no-quality-loss level does not touch images. Balanced and maximum reduction lower the quality of JPEG images, and the strongest level can be visible in photos and scans." },
      { q: "Why did my PDF not get smaller?", a: "It may already be optimised, or most of its size may be in images that are not JPEG. A good tool reports this instead of giving you a same-sized file." },
      { q: "Does compressing remove the text?", a: "No. Text stays as text. Only images inside the file are re-encoded at a lower quality." },
    ],
    tools: [
      { href: "/compress-pdf/", label: "Compress PDF" },
      { href: "/compress-pdf-to-100kb/", label: "Compress PDF to 100 KB" },
      { href: "/split-pdf/", label: "Split PDF" },
      { href: "/jpg-to-pdf/", label: "JPG to PDF" },
    ],
  },
  {
    slug: "pdf-to-word-what-converts-and-what-does-not",
    title: "Converting PDF to Word: what carries over and what does not",
    metaTitle: "PDF to Word: What Converts and What Does Not",
    description:
      "Know before you convert: text PDFs versus scans, what happens to tables, columns and images, and how to check and tidy the Word file afterwards.",
    summary:
      "A PDF is a picture of a page, and Word is an editable flow of text. This guide explains why the conversion is never perfect, which PDFs work well and how to clean up the result quickly.",
    category: "PDF and documents",
    published: "2026-11-18",
    updated: "2026-11-18",
    sections: [
      {
        heading: "Why PDF to Word is hard",
        html: `<p>A PDF stores where each piece of text sits on a page, almost like instructions for drawing it. It does not store paragraphs, styles or table structures. Word works the other way round: a document is a flow of paragraphs that rewrap when you change the font or margins.</p>
<p>A converter has to guess the structure. It looks at the position of each line to decide which lines belong to the same paragraph, which text looks like a heading and where bold or italic is used. Simple documents guess well. Complicated layouts do not, and no converter can promise the Word file will match the original page exactly.</p>`,
      },
      {
        heading: "The first check: can you select the text?",
        html: `<p>Open the PDF and try to highlight a sentence with your mouse or finger.</p>
<ul>
<li><strong>You can select it:</strong> the PDF contains real text. It can be converted to an editable document.</li>
<li><strong>You cannot select it, or the whole page highlights as one block:</strong> the page is a scan or a photo. The words are pixels, and a converter that reads text finds nothing to convert.</li>
</ul>
<p>The <a href="/pdf-to-word/">PDF to Word</a> tool works on text PDFs. It has no OCR, so scanned pages are reported and left out instead of producing an empty file. For a scan or a photo of a page, you need text recognition first: the <a href="/image-to-word/">Image to Word</a> and <a href="/jpg-to-text/">JPG to text</a> tools read text from pictures.</p>`,
      },
      {
        heading: "What usually carries over",
        html: `<ul>
<li>Body text in reading order, grouped into paragraphs.</li>
<li>Headings, recognised from their size and weight.</li>
<li>Bold and italic, where the converter can tell them apart.</li>
</ul>
<p>It suits reusing the words of contracts, reports, articles, CVs and school work, where what you want is the wording, not the exact page design.</p>`,
      },
      {
        heading: "What often needs fixing",
        html: `<ul>
<li><strong>Tables.</strong> Cell borders and alignment may be lost, and a table can turn into lines of text separated by spaces.</li>
<li><strong>Columns.</strong> A two-column article may be read straight across the page, mixing the columns, or split awkwardly.</li>
<li><strong>Images and graphics.</strong> They may not be kept. Re-insert any figure you need.</li>
<li><strong>Lists.</strong> Bullets and numbers sometimes become plain characters at the start of a line.</li>
<li><strong>Headers, footers and page numbers</strong> can appear as ordinary text in the middle of the document.</li>
</ul>
<p>Open the Word file and scan it against the PDF page by page. Fix headings and lists first, because they are the most common problems and change the look of the whole document.</p>`,
      },
      {
        heading: "Getting the best result",
        html: `<ol>
<li><strong>Start from the original.</strong> If you still have the Word file the PDF came from, edit that instead. It is always better than converting back.</li>
<li><strong>Use a text PDF, not a scan.</strong> A PDF printed to file from a program converts better than one scanned from paper.</li>
<li><strong>Convert only the pages you need.</strong> Use <a href="/split-pdf/">Split PDF</a> to cut out the relevant pages first, so there is less to check.</li>
<li><strong>Proofread the result.</strong> A converter can mishandle ligatures, hyphenated line ends and unusual fonts.</li>
</ol>
<p>When you finish editing, <a href="/word-to-pdf/">Word to PDF</a> turns the document back into a PDF. The conversion runs in your browser, so contracts and personal records are not uploaded.</p>`,
      },
      {
        heading: "A worked example: converting a two-page CV",
        html: `<p>Suppose you have your CV as a PDF and need to update it, but the Word file is lost. The CV has a name heading, section headings, bullet lists and a small table of skills.</p>
<ol>
<li>Try selecting text in the PDF. It highlights line by line, so it is a text PDF and will convert.</li>
<li>Convert it with <a href="/pdf-to-word/">PDF to Word</a>. The summary shows the pages read, the headings and paragraphs found, and any pages left out.</li>
<li>Open the .docx and compare it with the PDF. The name and section headings are probably recognised as headings.</li>
<li>Fix the common issues: bullets that became plain characters, the skills table that turned into lines of text, and any line that broke in the middle of a sentence.</li>
<li>Update the content, then check the page count. A CV that was two pages may spill onto a third after conversion.</li>
<li>Export the finished document back to PDF with <a href="/word-to-pdf/">Word to PDF</a> and read it once more.</li>
</ol>
<p>Fifteen minutes of tidying is normal for a designed document. For a plain one, such as a letter or an essay, it is often a few minutes.</p>`,
      },
    ],
    faqs: [
      { q: "Does PDF to Word work on scanned PDFs?", a: "Not without OCR. A scan is a picture, so a text-only converter has nothing to read. Run the pages through an image-to-text tool first." },
      { q: "Will the layout match the PDF exactly?", a: "Not exactly. Text, headings, bold and italic are kept where possible, but tables, columns and images may need fixing." },
      { q: "Can I edit the converted file?", a: "Yes. The result is a normal .docx file that opens in Word, Google Docs and LibreOffice." },
      { q: "Is my document uploaded when I convert?", a: "With a browser-based tool the conversion happens on your device and the file is not sent to a server." },
    ],
    tools: [
      { href: "/pdf-to-word/", label: "PDF to Word" },
      { href: "/image-to-word/", label: "Image to Word" },
      { href: "/word-to-pdf/", label: "Word to PDF" },
    ],
  },
  {
    slug: "word-to-pdf-keeping-your-layout",
    title: "Word to PDF: how to keep your layout, fonts and images intact",
    metaTitle: "Word to PDF: Keep Layout, Fonts and Images",
    description:
      "Why a Word file can look different as a PDF, which elements convert reliably, and how to check line breaks, fonts and images before you send it.",
    summary:
      "A PDF should look the same on every device, but a quick conversion can move line breaks and drop elements. Here is what to expect, what to check and when to export from Word itself.",
    category: "PDF and documents",
    published: "2026-11-18",
    updated: "2026-11-18",
    sections: [
      {
        heading: "Why people convert Word files to PDF",
        html: `<p>A .docx file reflows depending on the fonts installed and the program that opens it. A PDF freezes the page: the same text sits in the same place on every phone and printer. That makes PDF the standard format for CVs, applications, invoices and anything that will be read but not edited.</p>
<p>It also stops accidental edits, and a recipient with no Word installed can still read it. Note that a PDF can still carry document properties such as the author name, so check those if you are sending a file anonymously.</p>`,
      },
      {
        heading: "What converts reliably",
        html: `<p>The <a href="/word-to-pdf/">Word to PDF</a> tool handles the common building blocks of a document:</p>
<ul>
<li>Text with bold, italic and headings.</li>
<li>Bulleted and numbered lists.</li>
<li>Tables.</li>
<li>Images that sit in line with the text.</li>
</ul>
<p>For letters, assignments, CVs with a simple layout and ordinary reports, this is usually all you need.</p>`,
      },
      {
        heading: "What can differ, and why",
        html: `<p>A browser-based conversion is an approximation, not Word itself. Know the main differences before you send an important document.</p>
<ul>
<li><strong>Fonts.</strong> The PDF uses standard PDF fonts instead of the fonts in your document, so line breaks and page breaks can move. A paragraph that ended a page in Word may spill over by a line.</li>
<li><strong>Headers, footers and page numbers</strong> are not included in this version.</li>
<li><strong>Footnotes, text boxes, shapes, charts and equations</strong> are not included either. The result tells you which of these your document contained.</li>
<li><strong>Characters outside the standard fonts</strong>, such as emoji and non-Latin alphabets, are replaced with a question mark, and the tool reports that.</li>
<li><strong>Old .doc files</strong> cannot be read. Open them in Word and save as .docx first.</li>
</ul>`,
      },
      {
        heading: "Before you convert: a short checklist",
        html: `<ol>
<li><strong>Save as .docx</strong> if the file is an older .doc.</li>
<li><strong>Use a plain layout.</strong> Replace text boxes with ordinary paragraphs or a table, and put images in line with the text.</li>
<li><strong>Accept all tracked changes</strong> and delete comments you do not want to be seen.</li>
<li><strong>Check for password protection.</strong> Protected files are rejected.</li>
<li><strong>Keep the size reasonable.</strong> Very large images make a heavy PDF, which can be shrunk later with <a href="/compress-pdf/">Compress PDF</a>.</li>
</ol>`,
      },
      {
        heading: "After you convert: what to check",
        html: `<p>Open the PDF and read it, do not just glance. A document that fitted exactly on two pages in Word can run a few lines onto a third page, and a signature block that sat at the bottom of page one can move to the top of page two, so allow time to look at every page.</p>
<p>Check the points where the layout is most likely to drift:</p>
<ul>
<li>Page breaks: does a heading sit alone at the bottom of a page?</li>
<li>Tables: are columns still aligned and nothing cut off?</li>
<li>Images: are they in the right place and the right size?</li>
<li>Special characters: any unexpected question marks?</li>
</ul>
<p>For a legal or print-critical document, or one that depends on headers, footers or text boxes, export the PDF from Word itself (Save as PDF or Print to PDF) and use the converter only for convenience files. When several PDFs need to be one, <a href="/merge-pdf/">Merge PDF</a> joins them without recompressing.</p>`,
      },
      {
        heading: "Converter or export from Word: which should you use?",
        html: `<p>Both routes make a PDF, and each suits a different document. The browser converter is quick and private and needs no software, but it is an approximation. Exporting from Word itself uses the fonts and layout engine that created the document.</p>
<table>
<thead><tr><th>Your document</th><th>Better route</th></tr></thead>
<tbody>
<tr><td>Letter, assignment or plain report with text, headings and tables</td><td>The converter is usually fine</td></tr>
<tr><td>CV with a simple one-column layout</td><td>Converter, then check line and page breaks</td></tr>
<tr><td>Document with headers, footers, page numbers or footnotes</td><td>Export from Word</td></tr>
<tr><td>Text boxes, shapes, charts or equations</td><td>Export from Word</td></tr>
<tr><td>Legal, print-critical or signed documents</td><td>Export from Word and check page by page</td></tr>
<tr><td>A phone with no Word installed</td><td>The converter, then check the result</td></tr>
</tbody>
</table>
<p>Whichever route you choose, finish by checking the file size. A document with large pictures can produce a heavy PDF, and <a href="/compress-pdf/">Compress PDF</a> can bring it under an upload limit without changing the text.</p>`,
      },
    ],
    faqs: [
      { q: "Will the PDF look exactly like my Word document?", a: "Not always. Text, formatting, lists, tables and in-line images are kept, but standard PDF fonts are used, so line and page breaks can differ slightly." },
      { q: "Does it work with .doc files?", a: "No, only .docx. Open an older .doc in Word and save it as .docx before converting." },
      { q: "Are headers and footers included?", a: "Not in this version. The tool tells you if your document had them, and you can export from Word for a full-fidelity PDF." },
      { q: "Can I convert a Word file on my phone?", a: "Yes. The conversion runs in the browser, so no app is needed, though very large documents are easier on a computer." },
    ],
    tools: [
      { href: "/word-to-pdf/", label: "Word to PDF" },
      { href: "/pdf-to-word/", label: "PDF to Word" },
      { href: "/merge-pdf/", label: "Merge PDF" },
      { href: "/compress-pdf/", label: "Compress PDF" },
    ],
  },
  {
    slug: "resize-or-compress-an-image-which-to-use",
    title: "Resize or compress an image: which one do you need?",
    metaTitle: "Resize or Compress an Image: Which One to Use",
    description:
      "Resizing changes pixel dimensions, compressing changes file size. Learn which a form needs, how they interact and the right order to apply them.",
    summary:
      "Upload errors mention size, but size can mean pixels or kilobytes. Knowing which one a form is asking about saves a lot of trial and error.",
    category: "Images",
    published: "2026-11-18",
    updated: "2026-11-18",
    sections: [
      {
        heading: "Two different meanings of size",
        html: `<p>When a form says an image is too large, it can mean either of two things, and the fix is different.</p>
<ul>
<li><strong>Dimensions:</strong> the width and height in pixels, such as 600 × 750. This is what <em>resizing</em> changes.</li>
<li><strong>File size:</strong> how much storage the file takes, in KB or MB. This is what <em>compressing</em> changes.</li>
</ul>
<p>The two are linked, which is why people confuse them. An image with fewer pixels usually has a smaller file, but a small image can still be heavy if it is saved at very high quality, and a large image can be light if it is simple and heavily compressed.</p>`,
      },
      {
        heading: "When to resize",
        html: `<p>Resize when a form, template or website states required dimensions, or when the picture is far larger than it will ever be shown.</p>
<ul>
<li>A form asks for exactly 200 × 230 pixels.</li>
<li>A website needs a banner of a stated width and height.</li>
<li>A 4000-pixel camera photo is being used as a small profile picture.</li>
</ul>
<p>The <a href="/image-resizer/">Image Resizer</a> works in pixels, percent or centimetres. Centimetres only describe a print size once a DPI is chosen: pixels equal centimetres divided by 2.54, times the DPI. At 300 DPI, 10 cm is about 1181 pixels. Lock the aspect ratio so the picture is not stretched, and remember that enlarging a small image cannot add detail, so it only looks softer.</p>`,
      },
      {
        heading: "When to compress",
        html: `<p>Compress when the limit is in KB or MB and the dimensions do not matter, or you want to send a photo by email or upload it somewhere slow.</p>
<ul>
<li>A portal says the file must be under 100 KB.</li>
<li>An email attachment is too big.</li>
<li>A page loads slowly because its images are heavy.</li>
</ul>
<p>The <a href="/image-compressor/">Image Compressor</a> lowers quality and, when needed, dimensions until the file fits, and reports the real size it reached. JPG and WebP are lossy and respond well. PNG is lossless, so for a photograph it is usually larger than the same picture as a JPG.</p>`,
      },
      {
        heading: "When you need both, and in what order",
        html: `<p>Many forms state both a pixel size and a KB range. Apply them in this order:</p>
<ol>
<li><strong>Crop first</strong> to the part you want, with <a href="/crop-rotate-flip-image/">Crop, Rotate and Flip</a>, so no bytes go to background you will discard.</li>
<li><strong>Resize</strong> to the required pixel dimensions.</li>
<li><strong>Compress</strong> to the file-size limit, checking that the dimensions did not change.</li>
</ol>
<p>Doing it in the other order, compressing first and resizing afterwards, wastes quality, because the picture is degraded and then rescaled. Resizing the same file repeatedly has the same problem, so go back to the original each time.</p>`,
      },
      {
        heading: "Quick decision table",
        html: `<table>
<thead><tr><th>The form says</th><th>You need</th></tr></thead>
<tbody>
<tr><td>Image must be 600 × 750 pixels</td><td>Resize</td></tr>
<tr><td>Image must be under 200 KB</td><td>Compress</td></tr>
<tr><td>Image must be 3.5 × 4.5 cm</td><td>Resize in cm at a stated DPI, then check the file size</td></tr>
<tr><td>Image must be 20 to 50 KB</td><td>Compress, and make sure it is not too small</td></tr>
<tr><td>Email attachment too large</td><td>Compress, or resize if the picture is huge</td></tr>
</tbody>
</table>
<p>Both tools run in your browser, so photos of people and documents are not uploaded. Use the largest original you have and avoid working on a copy that has already been compressed by a messaging app.</p>`,
      },
      {
        heading: "A worked example: a camera photo for an online form",
        html: `<p>Imagine a form that wants a portrait photo of 300 × 400 pixels and a file between 20 KB and 100 KB. Your phone photo is 4000 × 3000 pixels and about 4 MB.</p>
<ol>
<li><strong>Crop.</strong> The form needs a portrait shape with a 3:4 ratio, and your photo is landscape. Crop around the face and shoulders so the crop is 3:4. If you resize without cropping, the aspect ratio will be wrong and the face will be stretched.</li>
<li><strong>Resize.</strong> With the aspect ratio locked, set the size to 300 × 400 pixels. At this point the file is already much smaller than 4 MB.</li>
<li><strong>Check the file size.</strong> If it is already inside 20 to 100 KB, you are done. If it is above 100 KB, lower the quality with the <a href="/image-compressor/">Image Compressor</a> and check that the pixel size is still 300 × 400.</li>
<li><strong>Check the minimum.</strong> If the file is below 20 KB, raise the quality or start again from the original, because a file can be too small as well as too large.</li>
</ol>
<p>Every step used the original as its source, which keeps quality as high as it can be. The numbers in this example are illustrative, so use the ones in your own form.</p>`,
      },
    ],
    faqs: [
      { q: "Does resizing reduce file size?", a: "Usually, if you make the picture smaller, but not always. A PNG can be bigger than the original JPG, and a high quality setting can keep a file large. Check the real size after resizing." },
      { q: "Does compressing change the dimensions?", a: "A good compressor tries lowering quality first and reduces dimensions only when needed. Check the pixel size afterwards if a form states one." },
      { q: "Why is my file too small for the form?", a: "Some forms set a minimum as well as a maximum. Use a larger original or a higher quality setting instead of the strongest compression." },
      { q: "Which format should I use?", a: "JPG or WebP for photographs, and PNG for screenshots, logos and graphics with sharp edges." },
    ],
    tools: [
      { href: "/image-resizer/", label: "Image Resizer" },
      { href: "/image-compressor/", label: "Image Compressor" },
      { href: "/crop-rotate-flip-image/", label: "Crop, Rotate and Flip" },
    ],
  },
  {
    slug: "passport-photo-upload-checklist",
    title: "Passport photo upload checklist: size, file and common rejections",
    metaTitle: "Passport Photo Upload Checklist and Size Guide",
    description:
      "Prepare a photo for an online passport application: pixel and file-size checks, the UK digital rules, printed sizes, and mistakes that get uploads refused.",
    summary:
      "Online passport portals check more than your face. Work through the pixel size, file size and photo conditions in order and you avoid most refusals.",
    category: "Images",
    published: "2026-11-18",
    updated: "2026-11-18",
    sections: [
      {
        heading: "Printed photos and digital photos have different rules",
        html: `<p>The first thing to settle is whether you are uploading a digital photo to an online application or having a printed photo made. The rules are separate, and mixing them up is a common reason for refusal.</p>
<p>A printed passport photo is described by its physical size. The sizes commonly published for printed photos include 2 × 2 inches for the United States, 35 × 45 mm for the United Kingdom, the EU and Australia, and 50 × 70 mm for Canada. These are the sizes built into our <a href="/passport-photo-resizer/">Passport Photo Resizer</a>, but they are commonly published sizes, not an official rulebook. Head size, background, lighting and file type are separate rules that can change, so always confirm with the authority that issued the form.</p>`,
      },
      {
        heading: "The UK example: what the digital rules say",
        html: `<p>The GOV.UK page for passport photos, checked on 10 October 2026, sets these digital rules for an online application:</p>
<ul>
<li>The photo must be at least <strong>600 pixels wide and 750 pixels tall</strong>.</li>
<li>The file must be at least <strong>50 KB and no more than 10 MB</strong>.</li>
<li><strong>Do not crop</strong> the photo yourself, because it is done for you.</li>
<li>The photo must have been taken in the last month, against a plain light-coloured background, and must not be altered by computer software.</li>
</ul>
<p>The page does not state a required file format or aspect ratio, so we make no claim about them. The <a href="/uk-passport-photo-digital/">UK Digital Passport Photo Checker</a> measures only pixel size and file size, and never crops or enlarges. Note that 35 × 45 mm at 300 DPI is 413 × 531 pixels, which is below the digital minimum, so a printed-size crop is not a valid digital upload. Always check the current GOV.UK page, as rules can change.</p>`,
      },
      {
        heading: "Taking a photo that passes",
        html: `<ol>
<li><strong>Use daylight or even light</strong> from the front, and avoid shadows on the face or the wall behind you.</li>
<li><strong>Stand against a plain light background</strong> with nothing hanging on the wall.</li>
<li><strong>Face the camera directly</strong> with a neutral expression and your whole head visible.</li>
<li><strong>Hold the camera at eye level</strong> and have someone else take the picture.</li>
<li><strong>Use the original file</strong> from the camera, not a copy that went through a messaging app, which is often compressed to a smaller size.</li>
<li><strong>Do not filter or retouch</strong> the picture. Software alterations are a reason for rejection.</li>
</ol>`,
      },
      {
        heading: "Checking the file before you upload",
        html: `<p>Run these checks in order. They take a couple of minutes and catch the problems that portals reject on automatically.</p>
<ul>
<li><strong>Pixel size.</strong> Is it at least the minimum the portal states? If it is smaller, retake the picture instead of enlarging it, because enlarging cannot add detail.</li>
<li><strong>File size.</strong> Is it inside the allowed range? If it is too big, make a smaller copy with the <a href="/image-compressor/">Image Compressor</a>. If it is too small, use the original photo, not a compressed copy.</li>
<li><strong>Metadata.</strong> A phone photo carries date and location data. You can look at it with the <a href="/image-metadata/">Image Metadata</a> tool and remove it if you do not want it shared.</li>
<li><strong>Orientation.</strong> Make sure the picture is the right way up.</li>
</ul>`,
      },
      {
        heading: "Other photo and signature tasks",
        html: `<p>Some applications use exact pixel sizes and file limits for exams and government jobs. Those requirements are published in each notice and can change between years. Our <a href="/government-job-photo-signature-resizer/">Government Job Photo and Signature Resizer</a> lets you enter the exact size and file limit from your notice, and there are dedicated pages for some exams. Always follow the notice for your own application.</p>
<p>None of these tools can guarantee an upload will be accepted, because the receiving organisation also judges background, lighting and what the photo shows. Their job is to make sure the numbers are right.</p>`,
      },
      {
        heading: "Common reasons an upload is refused",
        html: `<p>Rejections follow a pattern. Before you submit, check your photo against this list and the exact wording of your own application.</p>
<ul>
<li><strong>Too small in pixels.</strong> The picture was cropped too tightly, shrunk, or sent through an app that reduced it.</li>
<li><strong>File size out of range.</strong> Either over the maximum or under the minimum, which happens when an image is compressed too hard.</li>
<li><strong>Cropped or edited when the portal said not to.</strong> Where the instructions say the site will crop the photo, do not crop it yourself.</li>
<li><strong>Old photo.</strong> Some applications require a recent photo, such as one taken in the last month in the UK case.</li>
<li><strong>Shadows, uneven light or a patterned background.</strong> The portal expects a plain background and clear lighting.</li>
<li><strong>Filters or retouching.</strong> Alterations by software are a stated reason for rejection in the UK guidance.</li>
<li><strong>Wrong orientation.</strong> A photo that is sideways in your gallery can upload sideways.</li>
</ul>
<p>If a photo is refused, read the message carefully. Portals usually say which check failed, and fixing that one thing is quicker than starting over. When a tool reports that your pixel size is below the minimum, take a new photo with the camera set to its normal resolution instead of enlarging the old one.</p>`,
      },
    ],
    faqs: [
      { q: "What size is a passport photo in pixels?", a: "It depends on the authority. For online UK applications GOV.UK states at least 600 by 750 pixels. Printed photos are described in millimetres or inches instead." },
      { q: "Should I crop my photo to 35 × 45 mm for an online application?", a: "Not for the UK digital application. GOV.UK says not to crop your digital photo. Check what your own portal states." },
      { q: "Why was my upload rejected for being too small?", a: "Either the pixel dimensions or the file size is below the minimum. A photo sent through a messaging app is often compressed, so use the original from your camera." },
      { q: "Does the tool upload my photo?", a: "No. The checks and edits run in your browser, and the photo stays on your device." },
    ],
    tools: [
      { href: "/passport-photo-resizer/", label: "Passport Photo Resizer" },
      { href: "/uk-passport-photo-digital/", label: "UK Digital Passport Photo Checker" },
      { href: "/government-job-photo-signature-resizer/", label: "Government Job Photo and Signature Resizer" },
      { href: "/image-compressor/", label: "Image Compressor" },
    ],
  },
  {
    slug: "scan-a-signature-for-online-forms",
    title: "How to scan or photograph your signature for online forms",
    metaTitle: "How to Scan Your Signature for Online Forms",
    description:
      "Capture a clean signature on paper, crop it tightly and export it at the pixel size and KB limit a form states, without distortion or a grey background.",
    summary:
      "A faint, tilted or grey signature photo is a common reason for rejection. Start with a clean capture and the rest of the resizing becomes simple.",
    category: "Images",
    published: "2026-11-18",
    updated: "2026-11-18",
    sections: [
      {
        heading: "Start with a good capture",
        html: `<p>Most problems with signature uploads begin at the paper. No resizing tool can add contrast that was never there, so spend a minute on the capture.</p>
<ol>
<li><strong>Sign on plain white paper</strong>, with no lines, watermarks or print behind it.</li>
<li><strong>Use a dark pen</strong>: black or dark blue ink. A pencil or a light pen turns pale and grainy after compression.</li>
<li><strong>Use even light.</strong> Daylight from a window is ideal. Put the paper flat on a table and avoid your own shadow falling across it.</li>
<li><strong>Hold the phone parallel to the paper</strong> and directly above it, so the signature is not skewed.</li>
<li><strong>Leave a margin</strong> around the signature so you can crop it neatly.</li>
</ol>`,
      },
      {
        heading: "What the form is asking for",
        html: `<p>Read the instruction line by line. Forms usually specify some of these:</p>
<ul>
<li><strong>Pixel size</strong> such as 140 × 60 or 200 × 80, or a printed size such as 6 × 2 cm.</li>
<li><strong>File size range</strong> such as 10 to 20 KB.</li>
<li><strong>Format</strong>, almost always JPG or JPEG.</li>
<li><strong>Background and ink colour</strong>, sometimes.</li>
</ul>
<p>The sizes shown in our <a href="/signature-resizer/">Signature Resizer</a> list are example sizes that appear on some online forms. They are not official requirements for any organisation, so use the Custom size option and type exactly what your own form or notice states. Exam bodies publish their own figures: see for example the pages for <a href="/ssc-cgl-signature-size/">SSC CGL</a> and <a href="/upsc-signature-resizer/">UPSC</a>, which show the source and date for the figures they use.</p>`,
      },
      {
        heading: "Crop, resize and fit the file limit",
        html: `<ol>
<li>Open the <a href="/signature-resizer/">Signature Resizer</a> and choose your photo. Use Rotate if it is sideways.</li>
<li>Choose Custom size and enter the width and height the form states.</li>
<li>Move the crop box tightly around the signature. It stays locked to the output shape, so the signature is never stretched. Leave a small margin so strokes are not clipped.</li>
<li>If the form has a maximum in KB, enter it and choose JPG. The tool lowers the quality in steps until the file fits and reports the real size, and it tells you plainly if it could not reach the limit.</li>
<li>Check the preview, then download.</li>
</ol>
<p>The tool crops, rotates and resizes. It does not remove backgrounds or fix a shadow, which is why the capture matters.</p>`,
      },
      {
        heading: "Problems and fixes",
        html: `<table>
<thead><tr><th>Problem</th><th>Fix</th></tr></thead>
<tbody>
<tr><td>Signature looks grey or faint</td><td>Re-take it with a darker pen and brighter, even light</td></tr>
<tr><td>File is under the minimum KB</td><td>Use a larger pixel size, or JPG at a higher quality, not the strongest compression</td></tr>
<tr><td>File is over the maximum KB</td><td>Set the KB limit in the tool, or use a smaller pixel size</td></tr>
<tr><td>Shadow or lined paper in the background</td><td>Re-take on plain white paper in even light</td></tr>
<tr><td>Strokes cut off at the edge</td><td>Redraw the crop box with a slightly larger margin</td></tr>
</tbody>
</table>`,
      },
      {
        heading: "A note on privacy and use",
        html: `<p>A signature image is a sensitive document, because it can be copied into other files. A browser-based tool processes the picture on your device and does not upload it. Share the file only where it is needed, keep the original paper capture private and avoid sending it through public messaging groups.</p>
<p>Resizing does not guarantee that a website or institution will accept the file, since they may apply other checks. If an upload is refused, re-read the notice for the exact figures, and compare them with what the tool reports.</p>`,
      },
      {
        heading: "Signing on paper versus signing on a screen",
        html: `<p>You can also create a signature image digitally, for example by signing on a tablet with a stylus or a finger. This can give a clean result with no shadow, but the quality depends on the app and the screen.</p>
<ul>
<li>Sign in black on a white canvas, large enough to see the strokes clearly.</li>
<li>Export as an image, then crop and resize it in the <a href="/signature-resizer/">Signature Resizer</a> like a scanned one.</li>
<li>Use JPG when the form asks for JPG. A PNG is crisp but often larger than a form allows.</li>
</ul>
<p>Whichever method you use, check what the form means by a signature. Many applications say it must be your own handwritten signature and match the one on your other documents. A typed name in a script font is usually not accepted in place of a handwritten signature. When you are unsure, read the instruction again or ask the organisation, because the form decides what counts, not the tool.</p>
<p>Finally, keep one clean master image of your signature at a high resolution. You can then create small versions for different forms from that master, instead of shrinking an already small copy again and losing detail each time.</p>`,
      },
    ],
    faqs: [
      { q: "What size should my signature image be?", a: "Use exactly the size stated by your form or notice. The sizes in the tool list are examples only." },
      { q: "Can I get a signature under 20 KB?", a: "Often, using JPG at a modest pixel size. The tool reports the real file size and says when the limit could not be met." },
      { q: "Does the tool remove the background?", a: "No. It crops and resizes only, so use a clean white background when you capture the signature." },
      { q: "Is my signature uploaded?", a: "No. It is processed in your browser and does not leave your device." },
    ],
    tools: [
      { href: "/signature-resizer/", label: "Signature Resizer" },
      { href: "/government-job-photo-signature-resizer/", label: "Government Job Photo and Signature Resizer" },
      { href: "/image-compressor/", label: "Image Compressor" },
    ],
  },
  {
    slug: "what-is-a-favicon-and-how-to-make-one",
    title: "What is a favicon, and how to make one that works everywhere",
    metaTitle: "What Is a Favicon and How to Make One",
    description:
      "Favicons explained: where they appear, which sizes and files you need, ICO versus PNG, and the design rules that keep a tiny icon readable.",
    summary:
      "The small icon in a browser tab is one of the first things a visitor sees. This guide covers the sizes and files to create and how to add them correctly.",
    category: "Images",
    published: "2026-11-18",
    updated: "2026-11-18",
    sections: [
      {
        heading: "What a favicon is",
        html: `<p>A favicon is the small square icon that represents a website. It appears in browser tabs, bookmarks and history, on phone home screens when someone saves a site, and in some search results. A good one makes your tab easy to find among twenty others and tells visitors the site is a real, cared-for place.</p>
<p>Because it is shown at tiny sizes, often 16 or 32 pixels across, the design has to be simpler than a logo. A word mark with fine text becomes a smudge; a single bold letter or shape survives.</p>`,
      },
      {
        heading: "The files you need",
        html: `<p>Browsers, phones and search tools look for icons at different sizes. The <a href="/favicon-generator/">Favicon Generator</a> makes the common set from one image:</p>
<table>
<thead><tr><th>File</th><th>Size</th><th>Used for</th></tr></thead>
<tbody>
<tr><td>favicon.ico</td><td>16, 32 and 48 px in one file</td><td>Browser tabs, older browsers and tools that request it by default</td></tr>
<tr><td>favicon-16x16.png and favicon-32x32.png</td><td>16 and 32 px</td><td>Tabs and bookmarks in current browsers</td></tr>
<tr><td>apple-touch-icon.png</td><td>180 px</td><td>iPhone and iPad home screens</td></tr>
<tr><td>android-chrome-192x192.png and 512x512.png</td><td>192 and 512 px</td><td>Android home screens and installed web apps</td></tr>
</tbody>
</table>
<p>The Apple touch icon is placed on a solid background, because iOS fills transparent areas with black.</p>`,
      },
      {
        heading: "ICO or PNG?",
        html: `<p>Modern browsers accept PNG icons, so a PNG is enough for most visitors. The .ico file still earns its place: it holds several sizes in one file, and many tools and older browsers request favicon.ico from the root of your site by default. Including both is the safe choice.</p>
<p>If you only have an ICO and need a PNG, or the reverse, the <a href="/png-to-ico/">PNG to ICO</a> and <a href="/webp-to-png/">WebP to PNG</a> converters handle the change. Raster images are expected; this generator does not accept SVG files.</p>`,
      },
      {
        heading: "Design rules for a tiny icon",
        html: `<ul>
<li><strong>Start from a square image</strong> of at least 512 × 512 pixels for the sharpest results at every size.</li>
<li><strong>Keep it bold and simple.</strong> One letter, one shape, two or three colours.</li>
<li><strong>Leave padding.</strong> Icons are cropped to circles or rounded squares on some devices, so keep the key shape away from the edges.</li>
<li><strong>Check contrast</strong> on both light and dark browser themes. A dark icon on a transparent background can vanish on a dark tab bar.</li>
<li><strong>Test at 16 pixels.</strong> If you cannot tell what it is at that size, simplify it.</li>
</ul>`,
      },
      {
        heading: "Adding the favicon to your site",
        html: `<ol>
<li>Generate the set and download the ZIP.</li>
<li>Upload the files to your website. Place favicon.ico at the root so it is found at yourdomain.com/favicon.ico.</li>
<li>Paste the HTML snippet the generator provides into the head of your pages.</li>
<li>Reload the page. If you still see the old icon, clear the browser cache or open the site in a private window, because browsers keep icons for a long time.</li>
</ol>
<p>Search engines refresh favicons on their own schedule, so a new icon can take days or longer to appear in results even when your tab already shows it.</p>`,
      },
      {
        heading: "Troubleshooting a favicon that does not appear",
        html: `<p>If your icon is missing or wrong after you upload it, work through these checks in order.</p>
<ol>
<li><strong>Open the file directly.</strong> Visit yourdomain.com/favicon.ico in a browser. If it does not load, the file is in the wrong folder or the name is misspelled.</li>
<li><strong>Check the link tags.</strong> View the page source and confirm the lines from the generator are inside the head section, with paths that match where you uploaded the files.</li>
<li><strong>Clear the cache.</strong> Browsers keep favicons much longer than normal page content. Use a private window, or clear the site data, to see the current icon.</li>
<li><strong>Check the file type.</strong> A PNG renamed to .ico without being converted may fail, so generate the ICO properly.</li>
<li><strong>Check the sizes.</strong> A very large or very small file can display badly. Use the sizes produced by the generator.</li>
<li><strong>Wait for search engines.</strong> Their copy of your icon updates on their own schedule, and a change may take days or longer.</li>
</ol>
<p>The 192 and 512 pixel icons are used when a site is added to an Android home screen or installed as a web app, and they are normally referenced from the site's web app manifest. If you do not use a manifest, the favicon and Apple touch icon still cover the main cases.</p>`,
      },
    ],
    faqs: [
      { q: "Is favicon.ico really needed?", a: "Modern browsers also accept PNG icons, but favicon.ico at the site root is still requested by many tools and older browsers, so including it is a safe choice." },
      { q: "What size should a favicon be?", a: "A favicon.ico with 16, 32 and 48 pixel entries covers browsers, plus a 180 pixel touch icon and 192 and 512 pixel icons for phones." },
      { q: "Why does my old favicon still show?", a: "Browsers cache icons aggressively. Clear the cache or check in a private window, and allow time for search engines to refresh." },
      { q: "Can I use a transparent background?", a: "Yes for the ICO and PNG favicons. The Apple touch icon needs a solid background, because iOS fills transparency with black." },
    ],
    tools: [
      { href: "/favicon-generator/", label: "Favicon Generator" },
      { href: "/png-to-ico/", label: "PNG to ICO" },
      { href: "/webp-to-png/", label: "WebP to PNG" },
    ],
  },
  {
    slug: "word-count-and-character-limits-explained",
    title: "Word count and character limits: essays, SMS and meta descriptions",
    metaTitle: "Word Count and Character Limits Explained",
    description:
      "How word and character counts differ, why counters disagree, and how to stay within limits for essays, SMS, social posts and search snippets.",
    summary:
      "Different places count differently: words for essays, characters for tweets, segments for SMS. Know what you are counting and you stop being caught out by a limit.",
    category: "Text and writing",
    published: "2026-11-18",
    updated: "2026-11-18",
    sections: [
      {
        heading: "Words, characters and why counts differ",
        html: `<p>A word count splits text wherever there is a space. A character count includes letters, digits, punctuation, spaces and line breaks. Some limits ask for characters with spaces, some for characters without, and some for words, so first work out which one a form means.</p>
<p>Counters can disagree on small details. Is a hyphenated word like well-known one word or two? Does a number count? Does a line break count as a character? Our <a href="/word-counter/">Word Counter</a> and <a href="/character-counter/">Character Counter</a> use the usual conventions and show characters both with and without spaces, so you can match the rule you are given. If a limit is strict, stay a little under it rather than on the line.</p>`,
      },
      {
        heading: "Essays and applications",
        html: `<p>Word limits in essays and applications are normally approximate, and many sets of instructions say whether references, headings and quotations count. Read that line before you trim your argument.</p>
<ul>
<li>Check whether the limit includes the title, footnotes and bibliography.</li>
<li>Paste only the part that is counted into the counter.</li>
<li>If you are 10 percent over, cut repeated ideas and filler phrases before cutting content.</li>
<li>Use the most-used-words table to spot overused words.</li>
</ul>
<p>To judge how long a piece takes to read, the <a href="/reading-time-calculator/">Reading Time Calculator</a> converts a word count into minutes.</p>`,
      },
      {
        heading: "Social posts and search snippets",
        html: `<p>The <a href="/character-counter/">Character Counter</a> shows common limits next to your text: 280 characters for an X post, 2,200 for an Instagram caption and 100 for a YouTube title. Platforms change their limits and may count links or emoji differently, so treat the list as a guide and confirm in the app.</p>
<p>For search results, a page title is commonly shown up to about 60 characters and a description up to about 160. These are rules of thumb, not exact limits, because search engines cut text by pixel width and may rewrite what you provide. Put the most important words first, and do not stuff keywords.</p>`,
      },
      {
        heading: "SMS: characters become segments",
        html: `<p>SMS is different, because the limit controls cost. A single message in the basic GSM-7 alphabet holds 160 characters. Longer messages are split into parts of 153 characters, because a few characters in each part are used to join them back together.</p>
<ul>
<li>If a message contains any character outside GSM-7, such as a Bangla or Hindi letter, an emoji or some curly quotes, the whole message is sent as Unicode.</li>
<li>Unicode holds 70 characters in one message, or 67 in each part of a longer one.</li>
<li>A few symbols such as the euro sign and curly brackets count as two characters even in GSM-7.</li>
</ul>
<p>The <a href="/sms-character-counter/">SMS Character Counter</a> shows the number of segments for your text. Since providers charge per segment, a message that only just spills over costs double, so trim a few words or swap a curly quote for a straight one.</p>`,
      },
      {
        heading: "Habits that keep you under any limit",
        html: `<ol>
<li><strong>Write first, count after.</strong> Counting while drafting interrupts your thinking.</li>
<li><strong>Cut empty openings</strong> such as long introductions and repeated summaries.</li>
<li><strong>Clean the text.</strong> Extra spaces and stray line breaks add characters. <a href="/remove-extra-spaces/">Remove Extra Spaces</a> and <a href="/remove-line-breaks/">Remove Line Breaks</a> tidy pasted text.</li>
<li><strong>Keep a margin.</strong> Aim for a few characters below the limit, in case the platform counts something differently.</li>
</ol>`,
      },
      {
        heading: "A worked example: trimming 540 words down to 500",
        html: `<p>Say an application answer must be at most 500 words and your draft is 540. Cutting 40 words is about 7 percent, which is usually possible without losing a point.</p>
<ol>
<li>Paste the draft into the <a href="/word-counter/">Word Counter</a> and confirm the count and which parts are included in the limit.</li>
<li>Delete throat-clearing phrases such as the fact that, in order to and it is important to note. These often account for 10 to 15 words.</li>
<li>Replace long phrases with short ones. Due to the fact that becomes because.</li>
<li>Cut a repeated idea. If two sentences make the same point, keep the stronger one.</li>
<li>Count again. Stop when you are a few words under the limit.</li>
</ol>
<p>The same approach works for a search description. A page description is commonly shown up to about 160 characters, so a 190-character draft needs about 30 characters removed. Remove adjectives first, then move the most important words to the start, because a snippet that is cut off should lose the least important part.</p>
<p>For social posts, remember that the platform decides what counts. A link may be counted as a fixed length, and an emoji may count as more than one character, so keep a margin below the limit shown.</p>`,
      },
    ],
    faqs: [
      { q: "Do spaces count as characters?", a: "In the main character count, yes. Many tools also show the total without spaces, which some forms use." },
      { q: "How many characters are in one SMS?", a: "160 in the GSM-7 alphabet, or 70 if the message contains Unicode characters such as Bangla letters or emoji." },
      { q: "Why does my text count differ between tools?", a: "Tools handle hyphens, numbers, line breaks and emoji differently. Use the same tool throughout and stay a little under the limit." },
      { q: "Is my text uploaded to count it?", a: "A browser-based counter works on your device, so your text is not sent anywhere." },
    ],
    tools: [
      { href: "/word-counter/", label: "Word Counter" },
      { href: "/character-counter/", label: "Character Counter" },
      { href: "/sms-character-counter/", label: "SMS Character Counter" },
      { href: "/reading-time-calculator/", label: "Reading Time Calculator" },
    ],
  },
  {
    slug: "text-case-styles-explained",
    title: "Text case styles explained: sentence case, title case, camelCase and snake_case",
    metaTitle: "Text Case Styles: Sentence, Title, camelCase, snake_case",
    description:
      "What each text case does and when to use it: sentence and title case for writing, camelCase, PascalCase, snake_case and kebab-case for code and file names.",
    summary:
      "Capitalisation is style, and style is a decision. Here is a plain guide to each case, an example of each and which to pick for headings, names and code.",
    category: "Text and writing",
    published: "2026-11-18",
    updated: "2026-11-18",
    sections: [
      {
        heading: "Cases for ordinary writing",
        html: `<p>There are four styles you will meet in everyday text. The example below uses the phrase the lord of the rings.</p>
<table>
<thead><tr><th>Style</th><th>Rule</th><th>Example</th></tr></thead>
<tbody>
<tr><td>UPPER CASE</td><td>Every letter is a capital</td><td>THE LORD OF THE RINGS</td></tr>
<tr><td>lower case</td><td>No capitals</td><td>the lord of the rings</td></tr>
<tr><td>Sentence case</td><td>First word of each sentence is capitalised, plus proper nouns</td><td>The lord of the rings</td></tr>
<tr><td>Title Case</td><td>Main words capitalised; short words like of and the stay lower case unless first or last</td><td>The Lord of the Rings</td></tr>
</tbody>
</table>
<p>A fifth, Capitalized Case, capitalises every word, so it gives The Lord Of The Rings. It is simple but is not how most style guides treat titles.</p>`,
      },
      {
        heading: "Which to use for headings and titles",
        html: `<p>Neither sentence case nor title case is correct in all situations. Pick one and apply it consistently across a document or site.</p>
<ul>
<li><strong>Sentence case</strong> reads as friendly and modern, and is common for web page headings, interface labels and news headlines in many publications.</li>
<li><strong>Title Case</strong> reads as formal, and is common for book and film titles, and in some style guides for article titles.</li>
<li><strong>Upper case</strong> is for short labels or emphasis. A paragraph in capitals is harder to read, because the shapes of the words are lost.</li>
</ul>
<p>Style guides disagree about which small words stay in lower case, so check yours for names, brand spellings and acronyms. The <a href="/case-converter/">Case Converter</a> applies a simple rule and does not know proper nouns, so it will turn London into london in sentence case unless it begins a sentence. Review its output once.</p>`,
      },
      {
        heading: "Cases for code and file names",
        html: `<p>Programming and file naming need names without spaces, so words are joined in a few standard ways. Using the words hello big world:</p>
<ul>
<li><strong>camelCase:</strong> helloBigWorld. Words are joined and every later word is capitalised. Common for variables and functions in JavaScript and Java.</li>
<li><strong>PascalCase:</strong> HelloBigWorld. Every word is capitalised. Common for class and component names.</li>
<li><strong>snake_case:</strong> hello_big_world. Words are joined with underscores. Common in Python and for database columns.</li>
<li><strong>kebab-case:</strong> hello-big-world. Words are joined with hyphens. Common for web addresses and CSS classes.</li>
<li><strong>CONSTANT_CASE:</strong> HELLO_BIG_WORLD. Capitals with underscores, used for constants.</li>
</ul>
<p>The convention is set by the language or team, not by taste, so follow the style already used in your project.</p>`,
      },
      {
        heading: "Cases in web addresses and file names",
        html: `<p>For URLs, lower-case words separated by hyphens is the safest choice. Some servers treat Page and page as different files, and hyphens are read as word separators, so merge-pdf is more readable than mergepdf. Avoid spaces and special characters in file names you plan to share, since they get turned into codes like %20 in links.</p>`,
      },
      {
        heading: "Fixing text typed in the wrong case",
        html: `<p>The usual cases are text typed with caps lock on, a list of names in capitals and a heading that must follow a style guide. Paste the text into the <a href="/case-converter/">Case Converter</a>, choose the style, check the result and copy it. Where text also has stray spaces or line breaks, clean those with <a href="/remove-extra-spaces/">Remove Extra Spaces</a> first, and count the result with the <a href="/word-counter/">Word Counter</a> if there is a limit.</p>
<p>Not every script has capital letters. Latin, Greek and Cyrillic do, but Bangla and Hindi do not, so case conversion changes nothing in those scripts.</p>`,
      },
      {
        heading: "Title case in practice",
        html: `<p>Title Case follows a simple pattern, but the details vary between style guides, so it helps to know the common rules and where they differ.</p>
<ul>
<li>Capitalise the first and last word of the title.</li>
<li>Capitalise nouns, verbs, adjectives and adverbs.</li>
<li>Keep short articles, conjunctions and prepositions in lower case, such as a, an, the, and, but, or, of, in, on and to, unless they are first or last.</li>
<li>Style guides differ on longer prepositions, so a word like between may be capitalised in some guides and not in others.</li>
<li>Keep acronyms and brand names as the owners write them, for example PDF or iPhone. A converter cannot know these.</li>
</ul>
<p>Some examples with the same rule applied: a guide to the best tools becomes A Guide to the Best Tools, and how to convert a PDF to Word becomes How to Convert a PDF to Word. Hyphenated words and words after a colon are where guides differ most, so choose one approach and use it throughout a website or document.</p>
<p>Because the <a href="/case-converter/">Case Converter</a> works from a simple rule, treat its Title Case output as a first draft and correct acronyms, product names and any word your style guide treats differently.</p>`,
      },
    ],
    faqs: [
      { q: "What is the difference between sentence case and title case?", a: "Sentence case capitalises only the first word of each sentence and proper nouns. Title Case capitalises the main words and leaves short words like of and the in lower case." },
      { q: "Which case is best for URLs?", a: "Lower case with hyphens between words is the safest and most readable option." },
      { q: "What is the difference between camelCase and PascalCase?", a: "In camelCase the first word starts with a lower-case letter, as in helloWorld. In PascalCase every word starts with a capital, as in HelloWorld." },
      { q: "Does case conversion work for Bangla?", a: "No. Bangla and Hindi have no capital letters, so there is nothing to change." },
    ],
    tools: [
      { href: "/case-converter/", label: "Case Converter" },
      { href: "/remove-extra-spaces/", label: "Remove Extra Spaces" },
      { href: "/word-counter/", label: "Word Counter" },
    ],
  },
];
