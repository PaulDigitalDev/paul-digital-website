import type { ImageSizeRoute } from "./imageSizeRoutes";

export interface RouteContent {
  /** Visible introduction (~80–120 words), shown above the tool. */
  intro: string;
  /** Route-specific explanation of the target size (~100–180 words). */
  explanation: string;
  /** Route-specific recommended settings paragraph. */
  settings: string;
  useCases: string[];
  tips: string[];
  /** Plain-text Q&A. Rendered visibly and reused verbatim in FAQPage JSON-LD. */
  faqs: { q: string; a: string }[];
  /** Hand-picked related slugs (4–8). */
  related: string[];
}

export const imageSizeContent: Record<string, RouteContent> = {
  "compress-image-to-5kb": {
    intro:
      "Need to compress an image to 5 KB? This free tool re-encodes your JPEG, PNG or WebP file in your browser, lowering quality first and then shrinking the pixel dimensions until it gets as close to 5 KB as it can. Nothing is uploaded, and the real output size is measured and shown so you never have to guess. Five kilobytes is an extremely small budget, so expect a small, softer picture. Some photographs simply cannot get that low without becoming unusable, and the tool will tell you honestly when that happens rather than pretending it worked.",
    explanation:
      "Five kilobytes is roughly the size of a short email with no attachments, which is why it is a hard target for any photograph. A typical phone photo holds millions of pixels, but a 5 KB file can describe only a few thousand pixels worth of detail. In practice that means a thumbnail-sized picture with heavy JPEG compression. Flat graphics, simple signatures on a white background and small logos reach it far more easily than faces or landscapes. Because quality and dimensions trade against each other, a very low target usually costs both. If the result looks too rough, raise the target to 10 KB or 20 KB, or start from a cleaner, already-cropped original.",
    settings:
      "Use JPEG output for the best chance of reaching 5 KB; WebP can be smaller still if your browser supports it and the destination accepts it. Crop the image to the subject before compressing, because every unnecessary pixel uses part of your tiny budget. PNG files can only shrink by losing pixels, so converting to JPEG is usually better for photographs.",
    useCases: [
      "Tiny avatar or thumbnail fields in legacy systems with a hard size ceiling",
      "Scanned signatures on a white background for strict form fields",
      "Placeholder images and icons where file weight matters more than detail",
    ],
    tips: [
      "Crop tightly around the subject before you start.",
      "Pick a plain, high-contrast original; busy backgrounds eat the budget.",
      "Convert PNG screenshots to JPEG output instead of keeping PNG.",
      "If 5 KB looks too harsh, check whether the form really needs under 10 KB.",
    ],
    faqs: [
      {
        q: "Can every image be compressed to 5 KB?",
        a: "No. Simple, small or high-contrast images often can, but detailed photographs may need so much downscaling that they stop being useful. The tool reports the real size it reached and warns you if it falls short.",
      },
      {
        q: "What happens to image quality at 5 KB?",
        a: "Expect visible softening, blocky colour areas and a much smaller picture. The tool reduces quality first and then dimensions, so the result trades both against the very small size limit.",
      },
      {
        q: "Is my image uploaded to a server?",
        a: "No. The compression runs entirely in your browser, so your file stays on your device.",
      },
    ],
    related: ["compress-jpeg-to-10kb", "compress-image-to-15kb", "compress-image-to-20kb", "compress-jpeg-to-25kb", "compress-jpeg-between-20kb-to-50kb"],
  },

  "compress-jpeg-to-10kb": {
    intro:
      "Want to compress a JPEG to 10 KB? Choose your photo and this tool lowers the JPEG quality step by step, then scales the dimensions down if the file is still too large, measuring the real size after every attempt. It all happens in your browser, so your picture is never uploaded. Ten kilobytes is a small target that keeps a simple portrait or a signature recognisable, but it does cost some sharpness. The result depends on your original image, its dimensions and how much detail it contains, so check the output before you submit it anywhere.",
    explanation:
      "A 10 KB JPEG is a small picture, and how many pixels it can hold varies a lot with the content. Smooth areas such as plain walls and studio backgrounds compress very well; textured areas such as hair, foliage and fabric patterns do not. This is why two photos of the same dimensions can end up with very different quality at the same 10 KB. Reducing JPEG quality shrinks the file quickly at first, but below a certain point blocky artefacts appear around edges, and that is when reducing dimensions gives a cleaner result. The tool tries both in order and keeps the largest result that fits under your limit, so you keep as much quality as the budget allows.",
    settings:
      "Keep the output as JPEG, as this page only accepts JPEG files. Start with the default 10 KB target and look at the preview; if faces or text look too soft, try 15 KB or 20 KB. Photos already cropped to the subject compress noticeably better than full-frame originals.",
    useCases: [
      "Signature or thumbprint fields with a small attachment limit",
      "Small passport-style photo slots in older application portals",
      "Embedding small previews where load speed matters",
    ],
    tips: [
      "Crop out empty background before compressing.",
      "Use a well-lit original; noise from dark photos wastes bytes.",
      "Avoid re-compressing a file that has already been compressed many times.",
      "Compare the preview at actual size, not zoomed in.",
    ],
    faqs: [
      {
        q: "How small will my JPEG look at 10 KB?",
        a: "It depends on how detailed the photo is, because the tool shrinks the picture only as much as needed to fit. The exact dimensions are shown with the result.",
      },
      {
        q: "Does this reduce quality or dimensions first?",
        a: "Quality is lowered first. If the file is still above 10 KB at the lowest reasonable quality, the dimensions are reduced step by step.",
      },
      {
        q: "Why is my result larger than 10 KB?",
        a: "Very detailed images may not reach the target within the tool's attempt limit. Try a slightly higher target or crop the photo first, then run it again.",
      },
      {
        q: "Can I use a PNG here?",
        a: "This page accepts JPEG files only. For PNG or WebP files, use one of the general image size pages such as the 15 KB or 20 KB compressor.",
      },
    ],
    related: ["compress-image-to-5kb", "compress-image-to-15kb", "compress-image-to-20kb", "compress-jpeg-to-25kb", "compress-jpeg-between-20kb-to-50kb"],
  },

  "compress-image-to-15kb": {
    intro:
      "To compress an image to 15 KB, choose a JPEG, PNG or WebP file and let your browser do the work. The tool lowers the encoding quality first and then shrinks the dimensions if the file is still too big, checking the real size after each attempt. Your image is never uploaded to a server. Fifteen kilobytes is a small but workable size for profile pictures and stamps, though photographs with fine detail will need noticeable downscaling. The final size depends on the original image, and the page tells you plainly when it cannot get all the way down to your target.",
    explanation:
      "At 15 KB there is room for a clear, small picture. A JPEG at this size is a small picture whose pixel size depends heavily on the subject. That is usually enough to recognise a face or read a short line of large text, but not enough for fine print or detailed textures. It sits between the extremely tight 10 KB tier and the more comfortable 20 to 30 KB tier, which makes it a useful stepping stone: if 10 KB looks too rough and 20 KB is over your limit, 15 KB is often the compromise. Because PNG is lossless, PNG inputs can only reach 15 KB by losing pixels, so converting to JPEG or WebP output often looks much better.",
    settings:
      "Keep the output format as the original for JPEG; for PNG photos choose JPEG (or WebP where supported) from the output option. Leave the target at 15 KB unless the form allows a little more. Crop first to remove margins and you will keep more resolution on the subject.",
    useCases: [
      "Small profile pictures with a modest upload limit",
      "Scanned stamps, seals or signatures",
      "Compact ID-style photographs on older web forms",
    ],
    tips: [
      "Choose JPEG output for photographs saved as PNG.",
      "Crop to the subject so the pixels you keep are the useful ones.",
      "Use good lighting in the source photo to reduce noise.",
      "If it just misses 15 KB, try again with a slightly smaller crop.",
    ],
    faqs: [
      {
        q: "Will a 15 KB image still look sharp?",
        a: "It will look acceptable at small display sizes but soft if enlarged. Fifteen kilobytes is a tight budget, so both detail and dimensions are reduced.",
      },
      {
        q: "Can I compress PNG to 15 KB?",
        a: "Yes, but PNG is lossless, so the tool must reduce pixel dimensions to get there. Switching the output to JPEG or WebP usually preserves more visible detail.",
      },
      {
        q: "Is 15 KB the same as 15,000 bytes?",
        a: "This tool counts 1 KB as 1,024 bytes, so 15 KB is 15,360 bytes. Some websites count 1,000 bytes per KB, so leave a little margin if a form is strict.",
      },
    ],
    related: ["compress-jpeg-to-10kb", "compress-image-to-20kb", "compress-jpeg-to-25kb", "compress-jpeg-to-30kb", "compress-image-to-5kb"],
  },

  "compress-image-to-20kb": {
    intro:
      "This page helps you compress an image to 20 KB without leaving your browser. Select a JPEG, PNG or WebP file, confirm the target, and the tool re-encodes it, reducing quality first and then dimensions, until it fits or tells you it cannot. The measured result and a download button appear when it is done. Twenty kilobytes works well for avatars, small icons and compact document photos. How close you get depends on the original image, its dimensions and its detail, so always look at the preview before you use the file.",
    explanation:
      "Twenty kilobytes is a popular limit because it is small enough to load instantly yet large enough to keep a face clearly recognisable. A JPEG of this size is a modest-sized picture for a portrait, and somewhat larger for simple graphics. If your first attempt is still above 20 KB, the tool scales the picture down gradually instead of jumping straight to a tiny version, which keeps as much resolution as the limit allows. The tricky cases are large camera originals and busy scenes, because they begin so far above the target. For those, cropping before compressing makes a bigger difference than any quality slider.",
    settings:
      "Leave the output as the original format for JPEG files. For PNG, consider switching to JPEG or WebP, since PNG can only shrink by removing pixels. The 20 KB default is editable, so you can raise it if the form permits something slightly larger.",
    useCases: [
      "Avatar and profile photo uploads with a small limit",
      "Compact photos for application and registration forms",
      "Icons and small illustrations for lightweight pages",
    ],
    tips: [
      "Crop before compressing to focus the pixel budget.",
      "Plain backgrounds compress better than patterned ones.",
      "Prefer JPEG output for photos and PNG only for flat graphics.",
      "Check the preview at the size it will actually be displayed.",
    ],
    faqs: [
      {
        q: "How do I compress an image to 20 KB?",
        a: "Choose your file, keep the target at 20 KB, and select Compress. The tool lowers the quality, scales the dimensions if needed, and shows the measured result for you to download.",
      },
      {
        q: "Why did my image end up bigger than 20 KB?",
        a: "Large or highly detailed images may not reach the target within the number of attempts the tool makes. Crop the picture or raise the target a little and try again.",
      },
      {
        q: "Does compressing to 20 KB change the file format?",
        a: "Not unless you choose to. JPEG, PNG and WebP files keep their format by default, and you can switch the output to JPEG or WebP if that helps.",
      },
    ],
    related: ["compress-image-to-15kb", "compress-jpeg-to-25kb", "compress-jpeg-to-30kb", "compress-jpeg-between-20kb-to-50kb", "compress-jpeg-to-10kb", "compress-jpeg-to-40kb"],
  },

  "compress-jpeg-between-20kb-to-50kb": {
    intro:
      "Some upload forms reject a photo that is too large and also reject one that is too small. This page helps you compress a JPEG to between 20 KB and 50 KB. Enter your own minimum and maximum, choose a file, and the tool searches for a result inside that window, then tells you whether it actually landed there. Everything runs locally in your browser, so your photo is never uploaded. A range target is not always possible, because a small or simple image may not contain enough data to reach the minimum, and you should always check the final size.",
    explanation:
      "Compressing to a size range is different from aiming at a single number. A normal compressor stops as soon as the file drops below your limit, which could leave you at 8 KB when the form requires at least 20 KB. Here the tool uses the maximum as a ceiling and the minimum as a floor, trying to keep quality as high as possible while staying inside the window. If your original is already smaller than the minimum, the tool cannot add real detail to make it bigger; a file can only be as large as its pixels and quality allow. In that case you will see a clear message rather than a padded, artificially bloated file. Starting from a larger original usually gives the search more room.",
    settings:
      "Set the minimum and maximum to match the form exactly, leaving a small buffer on each side because some sites count 1 KB as 1,000 bytes and others as 1,024. This page accepts JPEG only. A larger source photo gives the tool more freedom to land inside a narrow window.",
    useCases: [
      "Portals that require a photo between a minimum and maximum size",
      "Exam, admission or registration forms with two-sided limits",
      "Standardising a batch of photos to a consistent file weight",
    ],
    tips: [
      "Use the largest original you have so there is data to work with.",
      "Narrow windows are harder; widen them if the form allows.",
      "Leave a few KB of margin from each edge of the range.",
      "Do not upscale a small image; it adds pixels but not detail.",
    ],
    faqs: [
      {
        q: "What does compress between 20 KB and 50 KB mean?",
        a: "It means the final JPEG should be no smaller than 20 KB and no larger than 50 KB. The tool aims for that window and reports whether the output is inside it.",
      },
      {
        q: "What if my image is already under 20 KB?",
        a: "The tool cannot create real detail to reach a minimum. You will be told the result is below the range, and you will need a larger or higher-resolution original.",
      },
      {
        q: "Can I change the range?",
        a: "Yes. Edit the minimum and maximum fields to match whatever your form requires before you compress.",
      },
      {
        q: "Does it accept PNG files?",
        a: "No. This page works with JPEG files only. Use one of the general image pages for PNG or WebP.",
      },
    ],
    related: ["compress-image-to-20kb", "compress-jpeg-to-25kb", "compress-jpeg-to-30kb", "compress-jpeg-to-40kb", "compress-image-to-50kb"],
  },

  "compress-jpeg-to-25kb": {
    intro:
      "Use this page to compress a JPEG to 25 KB right in your browser. Pick your photo, and the tool lowers the JPEG quality gradually, then reduces the dimensions only if the file is still too large, measuring the real result after each attempt. Your picture is not uploaded anywhere. Twenty-five kilobytes is a typical limit for application-form photographs, and it leaves enough room for a clear portrait at modest dimensions. Results vary with the original image, its resolution and its detail, so review the preview and the reported file size before you submit the file.",
    explanation:
      "At 25 KB a standard portrait can usually remain clear and recognisable at modest dimensions. It is a middle step between the very small 10 to 20 KB tier, where quality suffers, and the 40 to 50 KB tier, where faces look comfortable. Because JPEG quality has a steep early curve, going from a camera original down to 25 KB removes most of the file in the first few steps, and the last few kilobytes are the hard part. If the picture is still above the limit after reducing quality, the tool scales down in small steps rather than one big jump. Portraits against plain backgrounds hit 25 KB with the least visible damage; patterned clothing and busy scenery take the most.",
    settings:
      "Only JPEG files are accepted here. Keep the 25 KB default or adjust it using the editable target field. For passport-style pictures, crop to head and shoulders before compressing so the available bytes describe the face rather than the surroundings.",
    useCases: [
      "Online application and job-portal photo uploads",
      "ID card and membership photo submissions",
      "Reducing a headshot before attaching it to a lightweight form",
    ],
    tips: [
      "Crop to head and shoulders before you compress.",
      "Use even lighting to avoid noisy shadow areas.",
      "Start from the original photo, not a screenshot of it.",
      "If the form measures 25 KB strictly, aim a little lower for safety.",
    ],
    faqs: [
      {
        q: "Is 25 KB enough for a clear passport-style photo?",
        a: "It is usually enough for a recognisable portrait at modest dimensions. Fine details and small text will look softer than in the original.",
      },
      {
        q: "Why do I need a JPEG for this page?",
        a: "This page is built for JPEG files, which are the most common format for photo upload limits. For PNG or WebP, try the general image size pages.",
      },
      {
        q: "Can I get below 25 KB?",
        a: "You can edit the target to a lower value, but the smaller you go, the more quality and size are lost. Check the preview each time.",
      },
    ],
    related: ["compress-image-to-20kb", "compress-jpeg-to-30kb", "compress-jpeg-to-40kb", "compress-jpeg-between-20kb-to-50kb", "compress-jpeg-to-10kb", "compress-image-to-50kb"],
  },

  "compress-jpeg-to-30kb": {
    intro:
      "This tool compresses a JPEG to 30 KB using nothing but your browser. Select the photo, and it lowers the quality first and shrinks the dimensions only if necessary, encoding and measuring the file on every attempt. Your image never leaves your device. Thirty kilobytes gives enough room for a clear face at small sizes, but large camera originals have to be scaled down considerably to fit. The final result depends on the original image, its dimensions and the amount of detail, so check the reported size and the preview before you upload the file.",
    explanation:
      "Thirty kilobytes is where small JPEGs start to look comfortable. A portrait at this size can keep skin tones and facial features clean at reduced dimensions, with only mild blockiness in the hair and clothing. Compared with 20 KB, you gain roughly 50% more data, which usually means either higher quality or larger dimensions, whichever your source supports. A camera original of several megabytes has to lose over 99% of its weight to land here, so the tool will scale the image substantially. That is normal and unavoidable: no setting can keep a 12-megapixel photograph and also fit in 30 KB. If the output looks too rough, one more step up to 40 KB is often a visible improvement.",
    settings:
      "JPEG only on this page. Keep the target at 30 KB unless your form allows more. Crop to the subject before compressing, and avoid heavy filters or grain in the original, since noise is expensive to encode.",
    useCases: [
      "Government and exam portals that cap photos at about 30 KB",
      "Staff, student or membership ID photo uploads",
      "Lightweight avatars for apps with strict storage limits",
    ],
    tips: [
      "Crop first; it helps more than any slider.",
      "Remove filters, sharpening and heavy grain before compressing.",
      "Check the output at 100% zoom to catch artefacts.",
      "Try 40 KB if faces look blotchy at 30 KB and the form allows it.",
    ],
    faqs: [
      {
        q: "How big will a 30 KB JPEG be in pixels?",
        a: "It varies widely with the image. Simple pictures can stay larger; detailed ones get smaller, and the exact dimensions are shown with the result.",
      },
      {
        q: "Will my original file be changed?",
        a: "No. The tool creates a new compressed copy for you to download and leaves your original file untouched.",
      },
      {
        q: "Why does the result sometimes land under 30 KB instead of exactly 30 KB?",
        a: "The tool keeps the largest result that fits among its attempts. A result a little under the target is normal and keeps the highest quality that qualifies.",
      },
    ],
    related: ["compress-jpeg-to-25kb", "compress-jpeg-to-40kb", "compress-image-to-20kb", "compress-image-to-50kb", "compress-jpeg-between-20kb-to-50kb"],
  },

  "compress-jpeg-to-40kb": {
    intro:
      "Compress a JPEG to 40 KB entirely in your browser. Choose your photo and the tool reduces JPEG quality first, then dimensions if the file is still above the limit, and measures the real file size at every step. Your picture is never uploaded. Forty kilobytes is a handy size for ID photos and portal uploads, because most portraits keep good clarity at screen resolution. The exact outcome depends on the original image, its resolution and complexity, so look at the preview and confirm the reported size before you submit the file anywhere.",
    explanation:
      "Forty kilobytes sits comfortably above the strict 10 to 30 KB tier. For a portrait this usually means enough detail to keep eyes, eyebrows and hairlines clear, at reduced dimensions that depend on the picture. The target is also a safe choice when a portal states a limit of 50 KB, because it leaves a margin for differences in how sites count kilobytes. Photos that start as multi-megabyte phone shots still need to be reduced dramatically, but there is much less compromise than at 20 KB. Landscape and detailed scenes benefit the most from the extra headroom, since fine textures like leaves and brickwork are the first things to degrade as the budget tightens.",
    settings:
      "This page accepts JPEG files only. Keep the default 40 KB or edit it. If a form states 50 KB, 40 KB leaves a useful safety margin; check the actual output size shown by the tool before you upload.",
    useCases: [
      "ID photo and application portal uploads",
      "Photos for forms that cap attachments just under 50 KB",
      "Lightweight listing images where page speed matters",
    ],
    tips: [
      "Aim 10 to 20% below a strict limit for safety.",
      "Crop out wasted space around the subject.",
      "Avoid multiple rounds of compression; always start from the original.",
      "Preview the output on a phone-size screen if that is where it will be viewed.",
    ],
    faqs: [
      {
        q: "Is 40 KB a good size for an ID photo?",
        a: "For many portals, yes. It is large enough to keep a face clear at screen resolution while staying under common limits like 50 KB.",
      },
      {
        q: "Does the tool always hit exactly 40 KB?",
        a: "No. It keeps the largest attempt that fits, so the final size is usually slightly under 40 KB. The exact figure is shown after processing.",
      },
      {
        q: "Can I change the target on this page?",
        a: "Yes. The target size and unit are editable, so you can adjust them to match any form's requirement.",
      },
    ],
    related: ["compress-jpeg-to-30kb", "compress-image-to-50kb", "compress-image-to-60kb", "compress-jpeg-between-20kb-to-50kb", "compress-jpeg-to-25kb"],
  },

  "compress-image-to-50kb": {
    intro:
      "Need to compress an image to 50 KB? Select a JPEG, PNG or WebP file and this tool reduces the encoding quality first, then the pixel dimensions if required, reporting the actual output size when it finishes. Everything happens locally in your browser, so your image is not uploaded. Fifty kilobytes is one of the most requested limits for online forms, and most photographs can reach it with moderate quality loss. How close you get depends on the original image, its dimensions, its content and your browser's encoder, so always check the final size before you upload.",
    explanation:
      "Fifty kilobytes is a sweet spot for forms and portals. A JPEG or WebP portrait at this size can look clean at the reduced dimensions the tool chooses, which is plenty for on-screen viewing. PNG behaves differently: it is a lossless format, so the only way to shrink it is to use fewer pixels, and a PNG photograph may become quite small before it reaches 50 KB. Converting a PNG photo to JPEG or WebP typically preserves far more visible detail at the same size. Screenshots and graphics with large flat areas are the exception, and they often compress well even as PNG. If your original is a multi-megabyte camera image, the tool will take several rounds to get down to this level.",
    settings:
      "Keep the original format for JPEG. For PNG photos, switch the output to JPEG or WebP (WebP depends on browser support and on whether the destination accepts it). Leave the 50 KB target unless the form says otherwise, and consider aiming slightly below if it measures size strictly.",
    useCases: [
      "Online application, exam and registration forms",
      "Profile photos and ID uploads with a 50 KB limit",
      "Lightweight attachments for portals with slow connections",
    ],
    tips: [
      "Convert PNG photos to JPEG output for much better quality.",
      "Crop tightly around the subject first.",
      "Aim a few KB under the limit if the portal counts strictly.",
      "Keep the original file in case you need a different size later.",
    ],
    faqs: [
      {
        q: "How do I reduce an image to 50 KB?",
        a: "Choose your file, keep the target at 50 KB and compress. The tool lowers quality, scales the picture if needed, and shows the measured size for you to download.",
      },
      {
        q: "Why is PNG harder to reduce to 50 KB?",
        a: "PNG is lossless, so it cannot trade quality for size. The tool has to reduce the number of pixels instead, which is why JPEG or WebP output often looks better.",
      },
      {
        q: "Is 50 KB the same everywhere?",
        a: "Not quite. This tool uses 1 KB = 1,024 bytes, but some sites count 1,000 bytes. Leave a small margin if the limit is strict.",
      },
      {
        q: "Will my picture be uploaded to your server?",
        a: "No. Compression runs in your browser and the file stays on your device.",
      },
    ],
    related: ["compress-jpeg-to-40kb", "compress-image-to-60kb", "compress-image-to-70kb", "resize-image-to-50kb", "compress-image-to-100kb", "compress-jpeg-between-20kb-to-50kb"],
  },

  "compress-image-to-60kb": {
    intro:
      "Compress an image to 60 KB without uploading it anywhere. Choose a JPEG, PNG or WebP file, check the target, and the tool lowers the quality first and reduces dimensions only when it has to, measuring the output on every attempt. The target is editable, so if your form asks for something different you can change the number and unit before you start. The final file size depends on the original image, its dimensions and its detail, so always verify the reported size and preview the result before submitting it.",
    explanation:
      "Sixty kilobytes leaves about 20% more room than 50 KB, which often translates into noticeably better photographs: smoother skin tones, less blocking in gradients and cleaner edges around text. To target 60 KB, leave the value as it is or type a different number in the editable size selector; the unit can be switched between KB and MB. After processing, read the actual output size displayed in the results panel rather than assuming it matched exactly, because the tool keeps the largest attempt that fits and the figure will often be a few kilobytes under. If your destination counts kilobytes as 1,000 bytes, check the byte size on your device after downloading.",
    settings:
      "Leave the target at 60 KB, or change it using the size field. JPEG and WebP shrink best; PNG is lossless and can only get smaller with fewer pixels. If you convert to JPEG, transparent areas will be filled with white.",
    useCases: [
      "Forms and portals that cap uploads around 60 KB",
      "Document photos where small text must remain readable",
      "Web thumbnails and listing images with a small budget",
    ],
    tips: [
      "Change the target with the size selector if your limit is different.",
      "Always verify the output size shown after compression.",
      "Crop empty margins before you start.",
      "Prefer JPEG for photographs and keep PNG for flat graphics.",
    ],
    faqs: [
      {
        q: "How do I target 60 KB?",
        a: "Keep the default 60 KB or type your own value in the size field, then compress. The result panel shows the actual size so you can verify it.",
      },
      {
        q: "Can I change the target size?",
        a: "Yes. The size and the unit (KB or MB) are editable on this page, so you can use it for other limits too.",
      },
      {
        q: "Why isn't my output exactly 60 KB?",
        a: "The tool keeps the largest attempt that fits under your target to preserve quality. The result is usually a bit under, and the exact size is displayed.",
      },
    ],
    related: ["compress-image-to-50kb", "compress-image-to-70kb", "compress-image-to-80kb", "compress-jpeg-to-40kb", "compress-image-to-100kb"],
  },

  "compress-image-to-70kb": {
    intro:
      "This tool reduces an image to about 70 KB right in your browser. Select a JPEG, PNG or WebP file, and it lowers the quality first, then the dimensions, until the encoded file fits, then shows you the measured size so you can download the result with confidence. Nothing is uploaded. Seventy kilobytes is a comfortable middle ground for document photos and web thumbnails where detail still matters. Results depend on the original image, its resolution and complexity, so check the preview and the reported size before using the file.",
    explanation:
      "At 70 KB most photographs hold on to good detail at screen resolution. A JPEG portrait may keep much of its resolution, and small printed text in a scanned document is much more likely to remain legible than at 30 or 40 KB. It is also a practical choice when a form says 'under 100 KB' but you want a little safety margin and sharper output than a heavy squeeze would give. Document scans, which combine white backgrounds with sharp text, tend to compress well as JPEG, while PNG scans only shrink by losing pixels. For text-heavy images, check the preview at full size; if letters look fuzzy, reducing the dimensions slightly often reads better than pushing the quality lower.",
    settings:
      "Keep the target at 70 KB or adjust it with the size field. Use JPEG output for photographs and scans. For screenshots with flat colours, PNG may remain a good fit, but compare sizes before choosing.",
    useCases: [
      "Document and ID scans for online submissions",
      "Web thumbnails and product images with a modest budget",
      "Email-friendly photos when you want to keep text readable",
    ],
    tips: [
      "For scans, check that small text is still readable in the preview.",
      "Crop scanner margins and shadows before compressing.",
      "Use JPEG output for scans rather than PNG.",
      "Leave headroom if the portal says 'under 100 KB'.",
    ],
    faqs: [
      {
        q: "Is 70 KB enough for a scanned document?",
        a: "Often yes for a single page at moderate resolution, but it depends on the scan. Check the preview to confirm that small text stays readable.",
      },
      {
        q: "Does the tool keep my image's format?",
        a: "By default, yes. You can switch the output to JPEG or WebP if that gives a smaller or better-looking result.",
      },
      {
        q: "Can I get an exact 70 KB file?",
        a: "Not exactly. The tool aims at or just below 70 KB and shows you the true size after processing.",
      },
    ],
    related: ["compress-image-to-60kb", "compress-image-to-80kb", "compress-image-to-90kb", "compress-image-to-50kb", "compress-image-to-100kb"],
  },

  "compress-image-to-80kb": {
    intro:
      "Get an image down to roughly 80 KB without leaving your browser. Choose a JPEG, PNG or WebP file, and the tool tries a lower quality first and then smaller dimensions, encoding and measuring each attempt before showing you what it achieved. No upload, account or guesswork is involved. Eighty kilobytes is generous for small photos and suits uploads that cap files just under 100 KB. The final result depends on the original image, its dimensions and its detail, so review the preview and the reported file size before you submit the image.",
    explanation:
      "Eighty kilobytes lets a photograph keep its character. At this budget, a JPEG often keeps much of its resolution with only mild compression, so faces, product details and printed text hold up well on a normal monitor or phone. The target is a smart pick when a site's limit is 100 KB but its file counter is imprecise, because it leaves about 20% slack. It also suits batches of web images where you want consistent, light files without visible damage. The main thing that changes the outcome is the source: a phone photo with a clean background will glide down to 80 KB, while a grainy low-light shot carries so much noise that the encoder has to work harder and the result looks softer.",
    settings:
      "Use the default 80 KB or adjust the target. JPEG output is the safest choice for photographs. If your picture is a PNG screenshot with large flat areas, try keeping PNG first and compare file sizes.",
    useCases: [
      "Uploads with a 100 KB limit where you want safe headroom",
      "Blog and product images that need light, consistent file sizes",
      "Profile photos and attachments with moderate size caps",
    ],
    tips: [
      "Keep around 20% below a hard limit for safety.",
      "Reduce noise in dark photos before compressing if you can.",
      "Compress from the original, not a previously compressed copy.",
      "Compare the preview with the original at the same zoom.",
    ],
    faqs: [
      {
        q: "Why choose 80 KB instead of 100 KB?",
        a: "It leaves a safety margin when a site measures size slightly differently from this tool, which counts 1 KB as 1,024 bytes.",
      },
      {
        q: "Will quality noticeably drop at 80 KB?",
        a: "For most photographs the change is mild at normal viewing size. Very large or noisy originals will lose more.",
      },
      {
        q: "Does this work for PNG and WebP?",
        a: "Yes. JPEG, PNG and WebP are accepted. WebP support depends on your browser.",
      },
    ],
    related: ["compress-image-to-70kb", "compress-image-to-90kb", "compress-image-to-100kb", "compress-image-to-60kb", "compress-jpeg-to-150kb"],
  },

  "compress-image-to-90kb": {
    intro:
      "Compress an image to about 90 KB in your browser, with no account, no upload and no guesswork about the final size. Select a JPEG, PNG or WebP file and the tool reduces quality first, then dimensions if needed, measuring the output as it goes. Ninety kilobytes leaves headroom below a 100 KB limit, which is useful when a portal measures size slightly differently. The result depends on the original image, its resolution and complexity, so check the reported size and preview before you rely on the file.",
    explanation:
      "Setting the target to 90 KB rather than 100 KB is a deliberate safety strategy. Differences in counting, such as 1 KB being 1,000 bytes on some sites and 1,024 bytes on others, can push a 99 KB file over a strict 100 KB limit. Keeping the result nearer 90 KB avoids that, and the visible difference in quality between 90 KB and 100 KB is usually small. At this size most photographs stay crisp at normal screen sizes, and scanned pages remain readable. If your image is a PNG, remember that it cannot trade quality for size; the tool will reduce its dimensions to fit, which may be more noticeable than switching to JPEG or WebP output for photographic content.",
    settings:
      "Keep 90 KB as the target when the real limit is 100 KB. Choose JPEG output for photos. Check the reported byte size after download if the destination is strict.",
    useCases: [
      "Portals that state a hard 100 KB limit",
      "Email attachments where multiple images must stay light",
      "Scanned documents that should stay legible but small",
    ],
    tips: [
      "Keep a 10% buffer under strict limits.",
      "Prefer JPEG for photos; PNG only for flat graphics.",
      "Crop dark borders from scans before compressing.",
      "Re-check the file size in your file manager after downloading.",
    ],
    faqs: [
      {
        q: "Why target 90 KB for a 100 KB limit?",
        a: "Different systems count kilobytes differently. A 10% buffer helps your file pass even if the portal's measurement is slightly stricter.",
      },
      {
        q: "Can this tool guarantee 90 KB?",
        a: "No tool can guarantee it for every image. It makes repeated attempts and reports the real size, and warns you if it could not reach the target.",
      },
      {
        q: "Is there any watermark on the result?",
        a: "No. The compressed image is a plain re-encoded copy of your picture.",
      },
    ],
    related: ["compress-image-to-80kb", "compress-image-to-100kb", "compress-image-to-70kb", "compress-jpeg-to-150kb", "compress-image-to-200kb"],
  },

  "resize-image-to-50kb": {
    intro:
      "Resize an image to 50 KB by scaling its dimensions first and lowering quality only if necessary. Choose a JPEG, PNG or WebP file, and the tool shrinks the pixel size step by step, encoding and measuring each version until it gets near 50 KB. Everything runs locally in your browser, so nothing is uploaded. This resize-first approach keeps the compression quality high, which suits images that are far larger than they need to be. The result depends on the original, its dimensions and its content, so check the final size and preview before you use it.",
    explanation:
      "Resizing and compressing are related but different. Compressing changes how the image data is encoded, trading detail for a smaller file at the same pixel dimensions. Resizing changes the number of pixels, for instance from 4000 by 3000 down to 800 by 600. Fewer pixels means less data, so the file shrinks without losing sharpness per pixel. This page uses a resize-first strategy: it scales dimensions down, keeps quality high, and reduces quality only if scaling alone cannot reach 50 KB. That is ideal for oversized phone photos and camera originals, where the picture will be displayed small anyway. It is less suitable if you need to keep the original dimensions; in that case, the compress version of this target is the better choice.",
    settings:
      "Use this page when the pixel dimensions can change. Keep the original format for JPEG, or switch the output to JPEG or WebP for PNG photographs. If a form also demands a particular width and height, resize to those dimensions in an editor first.",
    useCases: [
      "Shrinking raw phone and camera photos for online forms",
      "Preparing images for pages where only a small display size is needed",
      "Reducing scans without heavy compression artefacts",
    ],
    tips: [
      "Use resize-first when the image is much larger than the display size.",
      "Do not upscale the result afterward; it will look soft.",
      "Pick JPEG output for photographs.",
      "If dimensions must stay fixed, use the compress page instead.",
    ],
    faqs: [
      {
        q: "What is the difference between resizing and compressing an image?",
        a: "Resizing changes the pixel dimensions, such as making a photo 800 pixels wide instead of 4000. Compressing re-encodes the data at lower quality. This page resizes first and compresses only if needed.",
      },
      {
        q: "Will resizing to 50 KB change my image's dimensions?",
        a: "Yes, usually. To reach a small file size the tool reduces the width and height, and the new dimensions are shown with the result.",
      },
      {
        q: "When should I use compress instead of resize?",
        a: "Use the compress page when you want to keep the original dimensions as far as possible and accept lower quality instead.",
      },
    ],
    related: ["compress-image-to-50kb", "resize-image-to-200kb", "compress-jpeg-to-40kb", "compress-image-to-60kb", "compress-image-to-100kb"],
  },

  "compress-image-to-100kb": {
    intro:
      "Compress an image to 100 KB without uploading it. Pick a JPEG, PNG or WebP file and the tool lowers the quality first and shrinks dimensions only if necessary, then shows the original and output sizes side by side so you can see exactly what changed. A 100 KB limit is common on forms, job portals and websites that restrict uploads. How closely you reach the target depends on the original image, its dimensions, its detail and your browser's encoder, so check the reported size and preview before you submit the file.",
    explanation:
      "A limit of 100 KB shows up often on application forms, government portals, content management systems and email signature tools. It is large enough for a sharp, readable photograph at typical screen sizes, but small enough to load fast on slow connections. The easiest way to meet the limit is to start with the original image rather than an already compressed copy, because repeated compression degrades quality faster than a single careful pass. If your file is a PNG screenshot or scan, the tool may reduce its dimensions rather than quality, so consider JPEG output. Remember that no tool can promise a perfect result for every file, and a portal that measures in decimal kilobytes might need a few KB of margin.",
    settings:
      "Keep the target at 100 KB or edit it. JPEG output is the best for photos, and WebP can be smaller if both your browser and the destination support it. Leave a small buffer, around 5 to 10 KB, if the form states a hard limit.",
    useCases: [
      "Forms and portals that impose a 100 KB upload limit",
      "Website images that should load quickly on mobile",
      "Email signatures and newsletters with light graphics",
    ],
    tips: [
      "Start from the original, not a previously compressed copy.",
      "Leave a small buffer under hard limits.",
      "Use JPEG output for photographs and screenshots with gradients.",
      "Crop unneeded areas before compressing.",
    ],
    faqs: [
      {
        q: "How do I compress an image to under 100 KB?",
        a: "Select your file, keep the target at 100 KB and compress. The tool shows the original and output sizes so you can check the result before downloading.",
      },
      {
        q: "Which formats are supported?",
        a: "JPEG, PNG and WebP. HEIC and AVIF are not supported, and WebP depends on your browser.",
      },
      {
        q: "Is 100 KB enough for a good-looking photo?",
        a: "For screen viewing, usually yes. Large prints or heavy zoom will reveal the compression.",
      },
      {
        q: "Does my image leave my device?",
        a: "No. Everything happens in your browser and nothing is uploaded.",
      },
    ],
    related: ["compress-image-to-90kb", "compress-jpeg-to-150kb", "compress-image-to-200kb", "compress-image-to-50kb", "compress-image-to-80kb", "resize-image-to-200kb"],
  },

  "compress-jpeg-to-150kb": {
    intro:
      "Reduce a JPEG to 150 KB in your browser. Choose your photo and the tool lowers the JPEG quality gradually and scales the dimensions down only when it must, measuring the output after each attempt. Your file is not uploaded. At 150 KB a typical photograph keeps fine detail at screen sizes, which makes it a good limit for blog images and marketplace listings. The result depends on the original image, its resolution and complexity, so check the reported size and preview before using the file.",
    explanation:
      "A 150 KB JPEG is a very practical target for the web. It is large enough to display sharp images at typical web sizes and small enough to keep pages quick on mobile networks. Marketplace listings, blog posts and CMS uploads often recommend this range. Because 150 KB leaves much more room than the strict 20 to 50 KB tiers, quality loss is mild: you gain smoother gradients, cleaner edges and enough pixels for products and faces. If your original is a multi-megabyte camera file, the tool will first lower the quality in small steps, because that preserves the pixel dimensions; the dimensions are reduced only when quality alone can't reach the target. Heavily textured scenes will need more reduction than portraits with plain backgrounds.",
    settings:
      "JPEG files only on this page. Keep the default 150 KB or edit the target. If you are publishing to the web, consider whether you need the full pixel dimensions at all, since a smaller display size may allow even better quality at the same weight.",
    useCases: [
      "Blog and article images with a page-speed budget",
      "Marketplace and classified listing photos",
      "CMS and form uploads with a mid-sized limit",
    ],
    tips: [
      "Match the pixel width to how large the image appears on the page.",
      "Strip unnecessary margins and borders.",
      "Re-export from the original instead of re-compressing a compressed file.",
      "Test on a phone to confirm the quality is acceptable.",
    ],
    faqs: [
      {
        q: "Is 150 KB good for website images?",
        a: "It is a sensible size for many blog and listing images, though the best choice depends on your page layout and audience.",
      },
      {
        q: "Does this page support PNG?",
        a: "No. This page accepts JPEG only. For PNG and WebP, use the general 100 KB or 200 KB pages.",
      },
      {
        q: "Can I get below 150 KB without losing resolution?",
        a: "Sometimes, if the original is poorly optimised. Otherwise quality or dimensions must drop, and the tool reduces quality first.",
      },
    ],
    related: ["compress-image-to-100kb", "compress-image-to-200kb", "compress-jpeg-to-300kb", "compress-image-to-90kb", "resize-image-to-200kb"],
  },

  "compress-image-to-200kb": {
    intro:
      "Compress an image to 200 KB locally in your browser. Choose a JPEG, PNG or WebP file, confirm the target and download the re-encoded result once the measured size appears. The tool lowers quality first and reduces dimensions only if the file is still too large. Two hundred kilobytes is a frequent cap for online forms, document submissions and website uploads, and most photographs fit with only light quality loss. No tool can promise that every image will be accepted by every site, so always check the reported size and the requirements of the destination.",
    explanation:
      "Online forms and document portals often limit attachments to 200 KB because many applicants upload on mobile connections. At this size a scanned page can remain readable and a photograph can keep strong detail. The practical approach is to compress from your original file, preview the result, and verify the output size shown by the tool. If the original is a PNG scan, keep in mind that PNG will shrink only through reduced dimensions, so switching to JPEG output often keeps pages more legible. For multi-page documents, compress each page image separately and combine them afterward if the portal requires a PDF. A result landing a few KB under 200 KB is normal and helps if the portal counts size differently.",
    settings:
      "Keep 200 KB or edit the target. Choose JPEG output for scans and photos. For documents with fine print, preview at full size to confirm that text remains readable before you submit.",
    useCases: [
      "Online forms that accept attachments up to 200 KB",
      "Document and certificate scans for submissions",
      "Website uploads with moderate image weight limits",
    ],
    tips: [
      "Scan at a sensible resolution; extreme DPI makes files heavy.",
      "Convert PNG scans to JPEG output for better results.",
      "Check text legibility in the preview before uploading.",
      "Keep a buffer below the stated limit.",
    ],
    faqs: [
      {
        q: "Will a 200 KB file be accepted everywhere?",
        a: "Not necessarily. Sites may also check dimensions, format or file type. This tool controls file size only, and you should confirm the full requirements of the destination.",
      },
      {
        q: "How do I keep text readable at 200 KB?",
        a: "Scan at moderate resolution, crop margins and preview the result at full size. If text blurs, reduce dimensions slightly rather than quality.",
      },
      {
        q: "Can I switch between KB and MB?",
        a: "Yes. The size field and the unit are editable on this page.",
      },
    ],
    related: ["compress-image-to-100kb", "compress-jpeg-to-150kb", "resize-image-to-200kb", "compress-jpeg-to-300kb", "compress-jpeg-to-500kb", "compress-image-to-1mb"],
  },

  "resize-image-to-200kb": {
    intro:
      "Resize an image to 200 KB by reducing its dimensions before touching quality. Select a JPEG, PNG or WebP file and the tool scales it down in steps, measuring each version until it fits near 200 KB, with lower quality used only as a fallback. Everything stays on your device and nothing is uploaded. The result depends on the original image, its pixel size and its content, so check the final dimensions, size and preview before you use the file.",
    explanation:
      "Resizing an image means changing its width and height in pixels, while compressing means re-encoding the same pixels with less detail. For a 200 KB target, scaling first is often the better route when your source is huge, such as a 12-megapixel photograph or a 600 DPI scan. Taking it down to a more modest pixel size removes a large amount of data without adding visible compression artefacts, so edges and text stay clean. This page therefore resizes first and keeps JPEG or WebP quality high, only reducing quality when scaling alone isn't enough. The trade-off is that the image will have fewer pixels, which matters if you need to print it large or if a form demands specific dimensions. Text-heavy scans benefit in particular, since blocky compression hurts readability more than a modest size reduction.",
    settings:
      "Best for oversized originals. Keep the original format for JPEG, or choose JPEG/WebP output for PNG photographs. If the destination sets exact pixel dimensions, adjust the dimensions in an editor first and then use this page to meet the file-size limit.",
    useCases: [
      "Reducing high-resolution scans of forms and certificates",
      "Downsizing phone photos for attachments and uploads",
      "Preparing images for web pages with a fixed display width",
    ],
    tips: [
      "Use resize-first for very large sources.",
      "Avoid upscaling the output again later.",
      "Check that small text is still legible after resizing.",
      "Use the compress page if you must keep the original pixel size.",
    ],
    faqs: [
      {
        q: "Is resizing different from compressing?",
        a: "Yes. Resizing changes the number of pixels, while compressing re-encodes the data at lower quality. This page resizes first and lowers quality only if needed.",
      },
      {
        q: "Will the dimensions of my image change?",
        a: "Usually, yes. The tool reduces width and height until the file fits, and shows the new dimensions in the result.",
      },
      {
        q: "Why choose resize over compress for 200 KB?",
        a: "When the source is much larger than needed, resizing keeps each pixel sharper, which can look better than heavy compression at full size.",
      },
      {
        q: "Can I set exact width and height?",
        a: "No. This tool targets file size, not exact dimensions. Use an image editor for fixed dimensions first if a form requires them.",
      },
    ],
    related: ["compress-image-to-200kb", "resize-image-to-50kb", "compress-image-to-100kb", "compress-jpeg-to-300kb", "compress-jpeg-to-150kb"],
  },

  "compress-jpeg-to-300kb": {
    intro:
      "Bring a JPEG down to 300 KB in your browser. Pick your photo and the tool drops the quality first and reduces dimensions only if the file is still too large, encoding and measuring each attempt. Your image is not uploaded. Three hundred kilobytes is plenty for a detailed photo at typical screen widths and is a common limit for document portals. The outcome depends on the original image, its resolution and complexity, so review the reported size and preview before you submit the file.",
    explanation:
      "Three hundred kilobytes leaves space for a high-quality JPEG at generous dimensions, so photographs remain crisp and scanned documents stay readable even with small print. Many portals and email systems choose limits in this region because they balance clarity with upload speed. A phone photo of 3 to 6 MB must lose roughly 90 to 95% of its weight, and because JPEG is efficient at moderate quality, most of that reduction comes from a quality drop that is hardly visible. Only when the file is still above 300 KB does the tool shrink dimensions. Highly detailed pictures, such as crowded scenes or textured surfaces, need more reduction than portraits. If the result still seems heavy for your needs, 150 KB or 200 KB will cut it further.",
    settings:
      "This page accepts JPEG only. Keep the 300 KB default or edit it. Compress from the original file and check the preview at actual size to be sure it meets your quality needs.",
    useCases: [
      "Document and certificate uploads on portals with mid-sized limits",
      "High-quality web images for hero sections and galleries",
      "Sending photos by email while keeping good detail",
    ],
    tips: [
      "Start from the highest-quality original you have.",
      "Check readability of small text in scans.",
      "Choose a lower target if page speed matters more than detail.",
      "Avoid saving the file through multiple apps that re-compress it.",
    ],
    faqs: [
      {
        q: "How large is a 300 KB JPEG in pixels?",
        a: "It varies with detail and content, so there is no fixed answer. The exact dimensions are shown with the result.",
      },
      {
        q: "Does 300 KB keep text readable in scans?",
        a: "Usually, if the scan is moderate resolution. Check the preview at full size before you upload.",
      },
      {
        q: "What if my result is still above 300 KB?",
        a: "The tool reports that it could not reach the target. Crop the picture or lower the target slightly and try again.",
      },
    ],
    related: ["compress-image-to-200kb", "compress-jpeg-to-500kb", "compress-jpeg-to-150kb", "compress-image-to-1mb", "resize-image-to-200kb"],
  },

  "compress-jpeg-to-500kb": {
    intro:
      "Compress a high-resolution JPEG to 500 KB using local processing. Choose your photo and the tool lowers the quality first, shrinks the dimensions only if needed, and measures the final size rather than assuming it. Nothing is uploaded. Half a megabyte is a practical target that keeps more detail than very small limits, and it helps with upload limits on email, CMS and application forms. The outcome depends on the original image, its dimensions and its content, so check the reported size and preview before submitting.",
    explanation:
      "Five hundred kilobytes is a useful middle ground between tight form limits and large originals. A JPEG of this size can usually keep full-screen detail with only subtle compression. That is why it suits situations where visual quality still matters: a portfolio preview, a product photo for an online shop, or an attachment to an email that must stay under a size cap. Compared with a 100 KB target, you retain finer textures, smoother gradients and sharper text. Compared with a 1 MB target, you save half the bandwidth with a difference that is often hard to notice on a phone. Phone photos of 4 to 8 MB typically need a moderate quality reduction, and the tool applies it in small increments so it keeps as much quality as the limit allows.",
    settings:
      "JPEG only on this page. Keep the default 500 KB or edit the target. If you want a lighter file for web use, try 150 KB or 300 KB; if you need more fidelity, 1 MB is a reasonable step up.",
    useCases: [
      "Upload limits on forms and CMS platforms at about 500 KB",
      "Email attachments that must stay compact but detailed",
      "Portfolio and shop images with good quality at modest weight",
    ],
    tips: [
      "Keep the original and compress a copy.",
      "Compare at 100% zoom to check detail loss.",
      "Reduce dimensions for web use to save more bytes without losing quality.",
      "Try 300 KB if a page speed budget is tight.",
    ],
    faqs: [
      {
        q: "Is 500 KB the same as 0.5 MB?",
        a: "Approximately. In this tool 1 MB equals 1,024 KB, so 500 KB is slightly under half a megabyte.",
      },
      {
        q: "Will quality noticeably drop at 500 KB?",
        a: "For most phone photos, the drop is slight at normal viewing size. Very large originals lose more than moderate ones.",
      },
      {
        q: "Can I use PNG on this page?",
        a: "No. This page accepts JPEG only. Use the 1 MB or 200 KB pages for PNG and WebP files.",
      },
    ],
    related: ["compress-jpeg-to-300kb", "compress-image-to-1mb", "compress-image-to-200kb", "compress-image-to-2mb", "compress-jpeg-to-150kb"],
  },

  "compress-image-to-1mb": {
    intro:
      "Compress an image to 1 MB in your browser. Select a JPEG, PNG or WebP file, and the tool lowers quality first and reduces dimensions only if necessary, measuring the real output so you can see the exact result. Your image is never uploaded. A one-megabyte limit is common for attachments and uploads, and many camera photos need only light compression to fit. Results depend on the original image, its format, resolution and detail, so verify the reported size and preview before you submit the file to a form or site.",
    explanation:
      "Megabytes and kilobytes describe the same thing at different scales: in this tool, 1 MB equals 1,024 KB, or 1,048,576 bytes. Some websites use decimal values and treat 1 MB as 1,000 KB, so aim a little under the limit if it is strict. At 1 MB, a JPEG can maintain excellent detail, so photographs look nearly identical to the original at normal viewing size. To choose a suitable output size, think about where the image will be seen: a 1 MB photo is generous for a form or email, whereas a website page often benefits from 150 to 300 KB. PNG screenshots can be large because PNG is lossless; if a screenshot exceeds 1 MB the tool will reduce its dimensions, or you can switch the output to JPEG or WebP to preserve more resolution.",
    settings:
      "Keep the target at 1 MB or edit it using the size and unit fields. Use JPEG or WebP output for photographs and large PNG screenshots. Leave a little room below a strict limit.",
    useCases: [
      "Email attachments and web forms capped at 1 MB",
      "Support tickets and social uploads that reject large photos",
      "Reducing large screenshots for documentation",
    ],
    tips: [
      "Know whether your limit means 1,000 or 1,024 KB; leave margin.",
      "Convert large PNG screenshots to JPEG or WebP output.",
      "Crop screenshots to the useful area.",
      "Use a lower target if the image will only be seen on a small screen.",
    ],
    faqs: [
      {
        q: "How many KB are in 1 MB?",
        a: "In this tool, 1 MB is 1,024 KB. Some sites treat 1 MB as 1,000 KB, so leave a small buffer if the limit is strict.",
      },
      {
        q: "How do I choose the right output size?",
        a: "Think about where the image will be viewed. Forms and email can accept around 1 MB, but web pages usually perform better with much smaller files.",
      },
      {
        q: "Why is my PNG still large?",
        a: "PNG is lossless, so the tool can only reduce its size by lowering the pixel count. Switching to JPEG or WebP output often keeps more detail.",
      },
      {
        q: "Does it work with phone photos?",
        a: "Yes. Most phone photos are a few megabytes and often need only moderate compression to fit within 1 MB.",
      },
    ],
    related: ["compress-jpeg-to-500kb", "compress-image-to-2mb", "compress-jpeg-to-300kb", "compress-image-to-200kb"],
  },

  "compress-image-to-2mb": {
    intro:
      "Reduce a large image to 2 MB locally in your browser. Choose a JPEG, PNG or WebP file, and the tool lowers the quality first, then the dimensions if needed, and shows the measured result. Your full-size photo is never uploaded. Two megabytes is a typical limit for social profiles and support forms, and most phone photos need only light compression to fit. The outcome depends on the original image, its resolution and detail, so confirm the reported size and preview before using the result.",
    explanation:
      "Two megabytes sits near the top of what most upload forms allow. A modern phone photo is typically 2 to 8 MB, so some images already fit while others need a modest reduction. At 2 MB, a JPEG can keep close to its full resolution and fine detail, with compression that is difficult to spot at normal viewing size. This makes it the right choice when you must meet a size cap but still care about quality, for example when sending photos to a support team, submitting evidence images, or uploading a profile picture that will be shown large. Because the reduction needed is smaller than for KB targets, the tool will mostly lower quality in light steps and rarely needs to resize. Screenshots saved as PNG are the exception, since they can be several megabytes at high resolution.",
    settings:
      "Keep the 2 MB default or edit the size and unit fields. JPEG is a good output for photographs. If you only want to shave a little weight, a light reduction is enough and the tool avoids reducing more than it needs to.",
    useCases: [
      "Profile pictures and support tickets with a 2 MB cap",
      "Evidence or claim photos that must retain detail",
      "Sending several photos in one email without hitting limits",
    ],
    tips: [
      "Check whether the image really exceeds the limit before compressing.",
      "Prefer JPEG output for photographs.",
      "Convert high-resolution PNG screenshots to JPEG or WebP.",
      "Keep the original for archiving.",
    ],
    faqs: [
      {
        q: "Is 2 MB large enough to keep full quality?",
        a: "For many phone photos it is close. Light compression usually leaves the image looking much like the original at normal viewing size.",
      },
      {
        q: "How is MB different from KB?",
        a: "A megabyte is 1,024 kilobytes in this tool. So 2 MB is 2,048 KB, which is far more room than typical form limits in the tens of KB.",
      },
      {
        q: "Will my large photo be uploaded for processing?",
        a: "No. All processing happens in your browser, so even full-size images stay on your device.",
      },
    ],
    related: ["compress-image-to-1mb", "compress-jpeg-to-500kb", "compress-jpeg-to-300kb", "compress-image-to-200kb"],
  },
};

export function getContent(route: ImageSizeRoute): RouteContent {
  const content = imageSizeContent[route.slug];
  if (!content) throw new Error(`Missing SEO content for ${route.slug}`);
  return content;
}
