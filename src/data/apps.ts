export type AppStatus = "Published" | "Preview" | "Coming Soon" | "In Development";

export interface App {
  slug: string;
  name: string;
  description: string;
  purpose: string;
  status: AppStatus;
  code: string;
  icon?: string;
  platform?: string;
  playUrl?: string;
  packageName?: string;
  /** Direct link to a preview APK. Omit until the file is hosted somewhere. */
  previewApkUrl?: string;
  /** <title> for the app's detail page. */
  metaTitle: string;
  /** Meta description for the app's detail page. */
  metaDescription: string;
  /** Longer explanation shown on the app's detail page. */
  overview: string[];
  /** Typical situations the app is useful for. */
  uses: string[];
  /** Background a user may want before choosing or using the app. */
  background?: { heading: string; paragraphs: string[] };
  /** Web tools and guides on this site that do related jobs. */
  related: { href: string; label: string }[];
}

const play = (id: string) => `https://play.google.com/store/apps/details?id=${id}`;

export const apps = {
  "image-to-pdf-converter": {
    slug: "image-to-pdf-converter",
    name: "Image to PDF Converter Offline",
    description: "Convert images to PDF files offline on Android.",
    purpose: "Convert images to PDF files offline.",
    status: "Published",
    code: "PDF",
    icon: "https://play-lh.googleusercontent.com/7O05GWfUwRB9OnUDyXhES4y3xfhayuOep6IE3BTekfhZ-BXMSQxjXZoG_yEkDi1o2xfSlOnnnZck0nSR2xwxbA=w240-h480-rw",
    platform: "Android",
    packageName: "com.pauldigital.imagetopdf",
    playUrl: play("com.pauldigital.imagetopdf"),
    metaTitle: "Image to PDF Converter Offline for Android — Paul Digital",
    metaDescription:
      "Image to PDF Converter Offline is a Paul Digital Android app that turns photos and images into PDF files on your phone, without uploading them.",
    overview: [
      "Image to PDF Converter Offline turns photos and images on your Android phone into PDF files. It is designed for the everyday case of having pictures of documents, receipts, notes or certificates in your gallery and needing to send them as a single, tidy PDF.",
      "The conversion happens on the phone itself, so your images are not uploaded to a server to create the PDF. That makes it suitable for private papers such as ID cards and bank letters, and means it keeps working without a data connection.",
      "If you are on a computer instead, the free JPG to PDF tool on this website does a similar job in the browser.",
    ],
    uses: [
      "Combining photos of a multi-page document into one PDF to email or upload",
      "Sending certificates, mark sheets or ID copies to an office or employer",
      "Keeping receipts and bills as PDFs for records",
      "Turning class notes or whiteboard photos into a shareable document",
    ],
    related: [
      { href: "/jpg-to-pdf/", label: "JPG to PDF (web tool)" },
      { href: "/guides/make-a-small-pdf-from-photos/", label: "Guide: how to turn photos into a small PDF" },
      { href: "/guides/scan-documents-with-your-phone/", label: "Guide: scanning documents with your phone" },
    ],
  },
  "word-to-pdf-converter": {
    slug: "word-to-pdf-converter",
    name: "Word to PDF Converter",
    description: "Convert Word documents to PDF on Android.",
    purpose: "Convert Word (.docx) documents into PDF files on an Android phone.",
    status: "Published",
    code: "DOC",
    icon: "https://play-lh.googleusercontent.com/B_kya1ui1FZhdF_9yRY1ULKR16ql1bwpNZRVYama8rXbRZZpwsDKSlifzvhAUgZYZZwLYudSIQxSWKgesBny=w240-h480-rw",
    platform: "Android",
    packageName: "com.pauldigital.wordtopdfconverter",
    playUrl: play("com.pauldigital.wordtopdfconverter"),
    metaTitle: "Word to PDF Converter for Android — Paul Digital",
    metaDescription:
      "Word to PDF Converter is a Paul Digital Android app for turning Word documents into PDF files on your phone, ready to share or upload.",
    overview: [
      "Word to PDF Converter is an Android app for turning Word documents into PDF files directly on your phone. It is meant for the moments when someone asks for a PDF and the file you have is a .docx, such as a resume, an application letter or an assignment.",
      "PDF is the safer format to send: it looks the same on every device, the recipient cannot accidentally change it, and most portals and offices prefer it.",
    ],
    uses: [
      "Sending a resume or cover letter as a PDF from your phone",
      "Submitting assignments or forms that must be in PDF",
      "Sharing a document so it looks the same on every device",
    ],
    background: {
      heading: "Why convert Word to PDF before sending",
      paragraphs: [
        "A Word file can look different on another phone or computer if fonts, page size or the app version differ, so headings move and pages break in new places. A PDF fixes the layout at the moment of conversion. Before converting, it is worth checking page breaks, fonts and images; the guide below lists the checks.",
      ],
    },
    related: [
      { href: "/guides/preparing-text-for-a-pdf/", label: "Guide: preparing a document before converting it to PDF" },
      { href: "/jpg-to-pdf/", label: "JPG to PDF (web tool)" },
    ],
  },
  "compress-image-size": {
    slug: "compress-image-size",
    name: "Compress Image Size",
    description: "Reduce photo file size in KB on Android.",
    purpose: "Reduce the file size of photos on an Android phone, for example to meet an upload limit.",
    status: "Published",
    code: "KB",
    icon: "https://play-lh.googleusercontent.com/1xjhcTFjnUA-6qoNIur8My9i7mykHwrLVpTlrZAjEu_tqVWj8uYehr6ZS5H6WBA_raDNpX_8hKf24CKKh-_D-7w=w240-h480-rw",
    platform: "Android",
    packageName: "com.pauldigital.compressimagesize",
    playUrl: play("com.pauldigital.compressimagesize"),
    metaTitle: "Compress Image Size App for Android — Paul Digital",
    metaDescription:
      "Compress Image Size is a Paul Digital Android app for making photos smaller in KB, for example to fit an online form's upload limit.",
    overview: [
      "Compress Image Size is an Android app for making photos smaller. Its main job is the common problem of an online form, portal or chat refusing a photo because it is too large, and needing the file to come in under a limit such as 50 KB or 200 KB.",
      "If you are on a computer, or prefer not to install an app, the Image Compressor on this website does the same kind of job in the browser, with preset pages for common targets.",
    ],
    uses: [
      "Preparing exam, job and government application photos and signatures",
      "Shrinking photos before emailing or sharing them",
      "Freeing space by keeping smaller copies of large photos",
    ],
    related: [
      { href: "/image-compressor/", label: "Image Compressor (web tool)" },
      { href: "/guides/compress-image-to-specific-kb-size/", label: "Guide: how to compress an image to an exact KB size" },
      { href: "/guides/photo-and-signature-size-for-online-forms/", label: "Guide: photo and signature size for online forms" },
    ],
  },
  "photo-exif-editor": {
    slug: "photo-exif-editor",
    name: "Photo EXIF Editor : GPS, Date",
    description: "View and edit photo GPS, date and time, and metadata on Android.",
    purpose: "View and edit photo metadata such as GPS location, date and time, and other EXIF details.",
    status: "Published",
    code: "EXIF",
    icon: "/apps/photo-exif-editor-icon.png",
    platform: "Android",
    packageName: "com.pauldigital.photoexifeditor.gps.date.metadata",
    playUrl: play("com.pauldigital.photoexifeditor.gps.date.metadata"),
    metaTitle: "Photo EXIF Editor: Edit GPS & Date on Android — Paul Digital",
    metaDescription:
      "Photo EXIF Editor is a Paul Digital Android app to view and edit a photo's GPS location, date and time, and other EXIF metadata.",
    overview: [
      "Photo EXIF Editor lets you see and change the hidden information stored inside your photos: the date and time a picture was taken, its GPS location, and other EXIF details such as the camera model.",
      "GPS location is set by entering latitude and longitude coordinates, which is precise and works offline.",
    ],
    uses: [
      "Fixing the date on photos from a camera whose clock was wrong, so they sort correctly in your gallery",
      "Adding or correcting the location of photos taken with location tagging off",
      "Checking what a photo reveals before sharing it",
      "Removing or changing location details for privacy",
    ],
    background: {
      heading: "What EXIF metadata is",
      paragraphs: [
        "EXIF is a block of information that cameras and phones save inside each photo. It commonly includes the date and time, camera make and model, exposure settings and, if location tagging is on, precise GPS coordinates. Galleries use it to sort photos and show them on a map; anyone you send the original file to can also read it. The guide below explains what it reveals and which sharing methods keep or remove it.",
      ],
    },
    related: [
      { href: "/image-metadata/", label: "Image metadata viewer (web tool)" },
      { href: "/guides/remove-location-from-photos-exif/", label: "Guide: what EXIF reveals and how to remove location" },
    ],
  },
  "receipt-scanner": {
    slug: "receipt-scanner",
    name: "Receipt Scanner & Tax Expenses",
    description: "Scan receipts offline and track expenses for tax on Android.",
    purpose: "Scan receipts and keep expense records for tax, on your phone.",
    status: "Published",
    code: "RCT",
    icon: "https://play-lh.googleusercontent.com/EoW_7ekrvxN5FqkKT3xSxUS6tRQN1EIJPjCPIUt0l3hLQWw_WhD5Ta_FOO9s3uJjR7TkxB_MGgt-ltyS-7U9=w240-h480-rw",
    platform: "Android",
    packageName: "com.pauldigital.receiptscanner",
    playUrl: play("com.pauldigital.receiptscanner"),
    metaTitle: "Receipt Scanner & Tax Expenses for Android — Paul Digital",
    metaDescription:
      "Receipt Scanner & Tax Expenses is a Paul Digital Android app for scanning receipts offline and tracking expenses for tax, private and with no account.",
    overview: [
      "Receipt Scanner & Tax Expenses is an Android app for people who keep their own expense records, such as the self-employed. You photograph a receipt, and the app keeps it with the amount, date and category so the records are ready at tax time.",
      "It works offline and needs no account. Your receipts and records are kept on your device. See the privacy policy for details of what the app processes.",
    ],
    uses: [
      "Keeping receipts for business expenses in one place",
      "Sorting expenses by category before a tax return",
      "Replacing a shoebox of paper receipts",
    ],
    related: [{ href: "/tools/", label: "All web tools" }],
  },
  "wifi-analyzer-scanner": {
    slug: "wifi-analyzer-scanner",
    name: "WiFi Analyzer & Scanner",
    description: "Check WiFi signal strength, speed, channels and devices on Android.",
    purpose: "Check the strength, speed and channels of Wi-Fi networks and see devices on your network.",
    status: "Published",
    code: "WiFi",
    icon: "https://play-lh.googleusercontent.com/sN6gdckUqkfdV2hUTJ_t5eppqqRC4pDzk-fJbzP9Sx1leJKtvxIUY5388Nx1SJU0vnHhZ6DnWUERC6HevhXMjts=w240-h480-rw",
    platform: "Android",
    packageName: "com.pauldigital.wifianalyzer",
    playUrl: play("com.pauldigital.wifianalyzer"),
    metaTitle: "WiFi Analyzer & Scanner for Android — Paul Digital",
    metaDescription:
      "WiFi Analyzer & Scanner is a Paul Digital Android app to check Wi-Fi signal strength, speed, channels and the devices on your network.",
    overview: [
      "WiFi Analyzer & Scanner shows what is happening on your Wi-Fi from your Android phone: how strong the signal is, how fast the connection is, which channels nearby networks use, and which devices are connected.",
      "It helps you find a weak spot in a room, see whether a crowded channel is slowing you down, and check who is on your network.",
    ],
    uses: [
      "Finding the best spot for a router",
      "Checking whether nearby networks are crowding your channel",
      "Seeing which devices are connected to your network",
    ],
    related: [{ href: "/tools/", label: "All web tools" }],
  },
  "wav-to-mp3-converter": {
    slug: "wav-to-mp3-converter",
    name: "WAV to MP3 Converter",
    description: "Convert WAV audio files to MP3 on Android.",
    purpose: "Convert WAV audio files to MP3 format.",
    status: "Published",
    code: "WAV",
    icon: "https://play-lh.googleusercontent.com/LVMuMJT9ImuUn_QTa3pQEeAyifdOOLBx72Zf-I788QfXN7rg7ErTzwFuQpDYRkSzCM8gQX3o1dMJEduvrJmW=w240-h480-rw",
    platform: "Android",
    packageName: "com.pauldigital.wavmp3converter",
    playUrl: play("com.pauldigital.wavmp3converter"),
    metaTitle: "WAV to MP3 Converter for Android — Paul Digital",
    metaDescription:
      "WAV to MP3 Converter is a Paul Digital Android app that converts large WAV recordings into smaller MP3 files that play everywhere.",
    overview: [
      "WAV to MP3 Converter turns WAV audio files on your Android phone into MP3. WAV recordings from voice recorders, music apps and audio interfaces are large; MP3 copies are a fraction of the size and play on practically every phone, car stereo, website and messaging app.",
    ],
    uses: [
      "Making voice recordings small enough to send by WhatsApp or email",
      "Converting music or podcast exports for playback on older devices",
      "Saving storage space on your phone",
    ],
    background: {
      heading: "WAV versus MP3",
      paragraphs: [
        "WAV usually stores uncompressed audio. At CD quality (44.1 kHz, 16-bit stereo) that is about 1,411 kilobits per second, or roughly 10 MB per minute. MP3 is a lossy format that removes sounds people are unlikely to hear: at 128 kbps a minute takes about 1 MB, and at 320 kbps about 2.4 MB.",
        "For speech, 64–128 kbps is usually plenty. For music, 192–320 kbps is hard to tell apart from the original on most headphones. Keep the original WAV if you may edit the audio later, because each lossy conversion discards a little detail.",
      ],
    },
    related: [{ href: "/guides/how-browser-based-file-tools-work/", label: "Guide: how on-device file tools protect your privacy" }],
  },
} satisfies Record<string, App>;

export type AppSlug = keyof typeof apps;

export const allApps: App[] = Object.values(apps);
export const publishedApps = allApps.filter((app) => app.status === "Published");
export const previewApps = allApps.filter((app) => app.status === "Preview");

export function getAppBySlug(slug: AppSlug): App {
  return apps[slug];
}
