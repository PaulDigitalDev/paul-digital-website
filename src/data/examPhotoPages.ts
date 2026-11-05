import type { EditorTool, OfficialSource } from "./editorTools";

/* Exam photo and signature pages. Every figure here comes from an official notice or instruction page that was read and is cited on
   the page with its name and date. Where an official document says nothing (for example, SSC captures the photograph live and
   prescribes no photo file, and UPSC prescribes no photo pixel size), the page says so instead of inventing a number. */

const CHECKED = "5 November 2026";
const NOTE = "Paul Digital is not affiliated with the Staff Selection Commission or the Union Public Service Commission. Requirements are set in each notice and can change, so confirm them on the official site before you apply.";
const PRIVACY = { q: "Is my photo or signature uploaded?", a: "No. It is cropped and compressed in your browser and never leaves your device." };

const SSC_CGL: OfficialSource = {
  label: "SSC: Notice of the Combined Graduate Level Examination, 2026 (F. No. HQ-C11018/1/2026-C-1, to be uploaded on 21-05-2026)",
  url: "https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_cgl_2025.pdf",
  verified: CHECKED,
  says: [
    "Para 9.6: the scanned signature is uploaded as a JPEG/JPG file of 10 to 20 KB, with an image dimension of about 6.0 cm (width) × 2.0 cm (height).",
    "Para 9.4: you do not need a pre-existing photograph. The application module captures your photograph live while you fill in the form.",
    "Para 9.3: candidates who opt for Aadhaar-based authentication are not rejected because the photograph or signature does not meet the prescribed standards.",
    "Not stated in the part we read: a pixel size for the signature, or a DPI.",
  ],
};

const SSC_CHSL: OfficialSource = {
  label: "SSC: Notice of the Combined Higher Secondary (10+2) Level Examination, 2026 (F. No. HQ-C1102/5/2026-C-1, to be uploaded on 07-09-2026)",
  url: "https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_chsle_2026.pdf",
  verified: CHECKED,
  says: [
    "Para 9.6: the scanned signature is uploaded in JPEG/JPG format of 10 to 20 KB, about 6.0 cm wide and 2.0 cm high.",
    "Para 9.4: the photograph is captured live by the application module. A pre-existing photograph is not needed, and photographing an existing photograph is not allowed (para 9.5).",
    "Not stated in the part we read: a pixel size for the signature, or a DPI.",
  ],
};

const SSC_GD: OfficialSource = {
  label: "SSC: Notice of the Constable (GD) in CAPFs, SSF and Rifleman (GD) in Assam Rifles Examination, 2026 (to be published 01.12.2025)",
  url: "https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_CTGD_2026.pdf",
  verified: CHECKED,
  says: ["The signature is 10 to 20 KB in JPEG/JPG with an image dimension of about 6.0 cm × 2.0 cm at a resolution of 300 DPI. This is the notice that states the 300 DPI figure, which is how the pixel size on these pages was worked out."],
};

const UPSC_INSTR: OfficialSource = {
  label: "UPSC: Instructions for uploading photo and signature (upsconline.nic.in)",
  url: "https://upsconline.nic.in/ngrp/assets/PDF/instruction-photo-signature-upload-upsc.pdf",
  verified: CHECKED,
  says: [
    "Photograph: a JPG file named photo, between 20 KB and 200 KB. The face must cover at least 75% (three quarters) of the photo, on a plain white background, with both ears visible.",
    "Live photograph: capturing a live photograph is mandatory. It is matched with the uploaded photograph, and a mismatch stops the application.",
    "Signature: sign three times, one below the other, on plain white paper in black ink, and scan all three in a single JPG named signature, 20 KB to 100 KB, with image dimensions of 350 to 500 pixels.",
    "Not stated: a pixel size for the photograph.",
  ],
};

const UPSC_CSE: OfficialSource = {
  label: "UPSC: Examination Notice No. 05/2026-CSE, dated 04.02.2026 (Civil Services Examination, 2026)",
  url: "https://www.upsc.gov.in/sites/default/files/Notif-CSP-2026-Engl-060226Rev.pdf",
  verified: CHECKED,
  says: [
    "Note 2: applicants upload a photograph and also capture a live photograph in the Common Application Form, following the Photos and Signature instructions on upsconline.nic.in.",
    "Note 3: applicants sign three times, one below the other, on plain white paper in black ink and upload the same.",
  ],
};

const UPSC_CAPF: OfficialSource = {
  label: "UPSC: Examination Notice No. 08/2026-CAPF (Assistant Commandants), 2026",
  url: "https://www.upsc.gov.in/sites/default/files/ExamNotifi_CAPF_AC_Exam_2026_Eng_20022026.pdf",
  verified: CHECKED,
  says: ["Before filling in the form, have your photograph and signature scanned in .jpg: the photograph must not exceed 200 KB or be under 20 KB, and the signature must not exceed 100 KB or be under 20 KB."],
};

export const examPhotoPages: EditorTool[] = [
  {
    slug: "ssc-photo-resizer",
    mode: "government",
    h1: "SSC Photo and Signature Resizer",
    title: "SSC Photo and Signature Size 2026 and Resizer | Paul Digital",
    description: "SSC 2026 notices: photograph captured live, signature 10 to 20 KB at about 6 × 2 cm. Resize your signature to that size in your browser, free and private.",
    summary: "What the SSC 2026 notices say about the photograph and signature, plus a resizer that opens at the signature size.",
    intro: "In the SSC 2026 notices we checked, the photograph is captured live and only the signature is uploaded: a JPEG of 10 to 20 KB, about 6.0 × 2.0 cm. This tool opens at that signature size.",
    keywords: ["ssc photo resizer", "ssc signature size", "ssc photo size", "ssc cgl photo signature", "ssc 2026 signature 10 to 20 kb"],
    steps: [
      "Sign on plain white paper and photograph or scan it. Choose that picture, or drag it onto the drop area.",
      "The size opens at 709 × 236 px (6.0 × 2.0 cm at 300 DPI) with a 10 to 20 KB range, as the notices state. Change them if your own notice differs.",
      "Move the crop box so the signature fills it. It stays locked to the output shape, so the writing is not stretched.",
      "Press Create, read the measured size and any warning, then download the JPG.",
      "Upload it in the SSC application. Your photograph is taken live by the form itself, so you do not upload one.",
    ],
    explanation: [
      "The SSC notices for CGL and CHSL 2026 say the application module captures your photograph while you fill in the form. You do not prepare a photo file, and photographing an old printed photo is not allowed. What you do upload is a scanned signature, as a JPEG of 10 to 20 KB with a size of about 6.0 cm wide and 2.0 cm high.",
      "The notices give centimetres, not pixels. This page turns 6.0 × 2.0 cm into 709 × 236 pixels at 300 DPI, the resolution the SSC Constable (GD) 2026 notice states for the same size. Because the notice says 'about', a small difference is not a problem in itself, but a signature that is blurred or tiny can be rejected.",
      "SSC notices differ between exams and years. An older SSC instruction document for the MTS exam asked for 4.0 × 2.0 cm and a 20 to 50 KB photograph, and one place in the 2026 Sub-Inspector notice also mentions 4.0 × 2.0 cm. Always use the figures in the notice for the exam you are applying to. The width and height boxes here can be changed.",
      "Candidates who choose Aadhaar-based authentication are not rejected for a photograph or signature that misses the prescribed standard, according to the CGL and CHSL notices. That is the notices' rule, not something this tool checks or decides.",
    ],
    useCases: [
      "Preparing the signature for an SSC CGL, CHSL or similar application.",
      "Checking that the signature file is inside 10 to 20 KB before you upload.",
      "Turning a phone photo of a signature into a clean, cropped JPG.",
    ],
    tips: [
      "Sign large, in dark ink on plain white paper, and photograph it straight on in even light.",
      "Crop close to the writing. A signature that looks small inside a big white box is the usual cause of the 'miniature' rejection the notices mention.",
      "Check the numbers against the notice for your exam before uploading. Resizing never guarantees acceptance.",
    ],
    faqs: [
      { q: "What is the SSC photo size?", a: "In the CGL and CHSL 2026 notices we checked there is no photo file to upload. The photograph is captured live in the application form. Only the signature is uploaded." },
      { q: "What is the SSC signature size?", a: "JPEG/JPG of 10 to 20 KB, with an image size of about 6.0 cm wide by 2.0 cm high, according to the CGL and CHSL 2026 notices." },
      { q: "Why do other sites say 20 to 50 KB and 3.5 × 4.5 cm?", a: "Those figures come from earlier SSC instructions, such as a 2023 MTS document, from when a photograph file was uploaded. The 2026 notices above use a live photograph." },
      { q: "Will my signature be accepted?", a: "This tool only sets the size and file size. SSC also rejects blurred or miniature signatures, so check the preview." },
      PRIVACY,
    ],
    related: ["ssc-cgl-signature-size", "ssc-chsl-signature-size", "upsc-photo-resizer", "government-job-photo-signature-resizer"],
    gov: { w: 709, h: 236, minKb: 10, maxKb: 20, hint: "Opened with the SSC 2026 figures: 709 × 236 px (6.0 × 2.0 cm at 300 DPI) and 10 to 20 KB. File sizes use 1 KB = 1,024 bytes. Check them against the notice for your exam." },
    sources: [SSC_CGL, SSC_CHSL, SSC_GD],
    sourceNote: NOTE,
  },
  {
    slug: "ssc-cgl-signature-size",
    mode: "government",
    h1: "SSC CGL Signature Size and Resizer",
    title: "SSC CGL Signature Size 2026: 10 to 20 KB, 6 × 2 cm | Paul Digital",
    description: "SSC CGL 2026 signature: JPEG/JPG, 10 to 20 KB, about 6.0 × 2.0 cm, from the official notice. Crop and compress your signature to fit, privately in your browser.",
    summary: "SSC CGL 2026 signature size from the official notice, with a resizer that opens at 709 × 236 px and 10 to 20 KB.",
    intro: "The SSC CGL 2026 notice asks for a scanned signature in JPEG/JPG, 10 to 20 KB, about 6.0 cm by 2.0 cm. Crop and compress yours to that size here.",
    keywords: ["ssc cgl signature size", "ssc cgl signature 10 to 20 kb", "ssc cgl signature upload", "ssc cgl 2026 signature"],
    steps: [
      "Sign on white paper in dark ink, then photograph or scan the page.",
      "Choose the picture here. The size opens at 709 × 236 px with a 10 to 20 KB range.",
      "Drag the crop box so the signature fills the frame, with only a thin margin.",
      "Press Create and read the measured file size. If it is outside 10 to 20 KB, a warning says so.",
      "Download the JPG and upload it where the CGL form asks for the signature.",
    ],
    explanation: [
      "Paragraph 9.6 of the SSC Combined Graduate Level Examination, 2026 notice (F. No. HQ-C11018/1/2026-C-1, to be uploaded on 21-05-2026) says to upload the scanned signature in JPEG/JPG format of 10 to 20 KB, with a size of about 6.0 cm (width) by 2.0 cm (height). The same notice says the photograph is captured live, so there is no CGL photograph file to resize.",
      "The notice gives centimetres. Converted at 300 DPI, 6.0 × 2.0 cm is 709 × 236 pixels, which is what this page opens with. A signature that is too small inside the frame, or blurred, can be rejected, so crop tightly and use a sharp scan.",
      "If your signature is still above 20 KB at the lowest quality tried, make the pixel size a little smaller, or sign more boldly so the picture compresses well. If it is under 10 KB, the tool raises quality to reach the minimum, and warns you if it cannot.",
      "Applications from candidates who completed Aadhaar-based authentication are not rejected for photograph or signature standards, per the notice. Otherwise, a signature outside the stated range can lead to rejection.",
    ],
    useCases: ["Getting a CGL signature to 10 to 20 KB.", "Fixing a signature the portal said was too large or too small.", "Cropping a phone photo of a signature to the 3:1 shape."],
    tips: ["Use black or blue ink on plain white paper, with no lines.", "Keep the page flat and the phone straight above it.", "Re-check the notice if a corrigendum or a new CGL notice has been published."],
    faqs: [
      { q: "What is the SSC CGL signature size?", a: "JPEG/JPG, 10 to 20 KB, about 6.0 cm wide by 2.0 cm high, in the CGL 2026 notice (para 9.6)." },
      { q: "Do I upload a photograph for SSC CGL?", a: "Not in the 2026 notice we read. The application module captures a live photograph (para 9.4)." },
      { q: "How many pixels is 6 cm × 2 cm?", a: "709 × 236 pixels at 300 DPI. The notice gives centimetres only." },
      PRIVACY,
    ],
    related: ["ssc-photo-resizer", "ssc-chsl-signature-size", "government-job-photo-signature-resizer", "signature-resizer"],
    gov: { w: 709, h: 236, minKb: 10, maxKb: 20, hint: "Opened with the SSC CGL 2026 figures: 709 × 236 px (6.0 × 2.0 cm at 300 DPI) and 10 to 20 KB. File sizes use 1 KB = 1,024 bytes." },
    sources: [SSC_CGL, SSC_GD],
    sourceNote: NOTE,
  },
  {
    slug: "ssc-chsl-signature-size",
    mode: "government",
    h1: "SSC CHSL Signature Size and Resizer",
    title: "SSC CHSL Signature Size 2026: 10 to 20 KB, 6 × 2 cm | Paul Digital",
    description: "SSC CHSL 2026 signature: JPEG/JPG, 10 to 20 KB, about 6.0 × 2.0 cm, per the official notice. Resize yours to fit here, free and private in your browser.",
    summary: "SSC CHSL 2026 signature size from the official notice, with a resizer that opens at 709 × 236 px and 10 to 20 KB.",
    intro: "The SSC CHSL 2026 notice asks for a signature in JPEG/JPG of 10 to 20 KB, about 6.0 by 2.0 cm, and takes the photograph live. Resize your signature here.",
    keywords: ["ssc chsl signature size", "ssc chsl photo size", "ssc chsl signature upload", "ssc chsl 2026 signature kb"],
    steps: [
      "Sign in dark ink on plain white paper and take a clear, straight photo of it.",
      "Choose the picture. The size opens at 709 × 236 px, with a 10 to 20 KB range.",
      "Crop the signature to fill the box.",
      "Press Create, check the size and warnings, and download the JPG.",
      "Upload it in the CHSL form. The photograph is captured live by the form.",
    ],
    explanation: [
      "Paragraph 9.6 of the SSC Combined Higher Secondary (10+2) Level Examination, 2026 notice (F. No. HQ-C1102/5/2026-C-1, to be uploaded on 07-09-2026) asks for the scanned signature in JPEG/JPG of 10 to 20 KB, about 6.0 cm wide and 2.0 cm high.",
      "Many CHSL guides still list a 20 to 50 KB photograph at 3.5 × 4.5 cm. In this 2026 notice the photograph is captured live by the application module (para 9.4), and taking a picture of an old photograph is not allowed (para 9.5). So the file you prepare is only the signature.",
      "The notice gives centimetres, so this page converts to 709 × 236 pixels at 300 DPI. Keep the signature large and clear: blurred or miniature signatures are a stated reason for rejection, apart from candidates who used Aadhaar-based authentication.",
    ],
    useCases: ["Preparing the CHSL signature file.", "Bringing a signature inside 10 to 20 KB.", "Cleaning up a phone photo of a signature."],
    tips: ["Fill the frame with the signature, leaving only a small margin.", "Avoid shadows by photographing in daylight.", "Confirm the numbers in the current CHSL notice if it is updated."],
    faqs: [
      { q: "What is the SSC CHSL signature size?", a: "JPEG/JPG, 10 to 20 KB, about 6.0 × 2.0 cm, per para 9.6 of the CHSL 2026 notice." },
      { q: "What is the SSC CHSL photo size?", a: "The 2026 notice has no photograph file to upload. The photograph is captured live in the form." },
      { q: "Is this the same as the CGL signature?", a: "The size and KB range are the same in both 2026 notices, but each exam has its own notice, so check yours." },
      PRIVACY,
    ],
    related: ["ssc-photo-resizer", "ssc-cgl-signature-size", "government-job-photo-signature-resizer", "signature-resizer"],
    gov: { w: 709, h: 236, minKb: 10, maxKb: 20, hint: "Opened with the SSC CHSL 2026 figures: 709 × 236 px (6.0 × 2.0 cm at 300 DPI) and 10 to 20 KB. File sizes use 1 KB = 1,024 bytes." },
    sources: [SSC_CHSL, SSC_GD],
    sourceNote: NOTE,
  },
  {
    slug: "upsc-photo-resizer",
    mode: "government",
    h1: "UPSC Photo Resizer",
    title: "UPSC Photo Size 2026: JPG 20 to 200 KB Resizer | Paul Digital",
    description: "UPSC photograph rule: JPG named photo, 20 to 200 KB, face covering 75% of the frame, white background. Crop and compress your photo to fit, privately online.",
    summary: "UPSC photograph rules from the official instructions, with a cropper and compressor that opens at 20 to 200 KB.",
    intro: "UPSC wants a JPG photo of 20 to 200 KB with your face covering at least three quarters of the frame. Crop and compress yours to that range in your browser.",
    keywords: ["upsc photo size", "upsc photo resizer", "upsc photo 20 kb to 200 kb", "upsc cse photo upload", "upsc photo face 75%"],
    steps: [
      "Take or pick a recent, clear colour photo against a plain white background, facing the camera with both ears visible.",
      "Choose it here. The range opens at 20 to 200 KB, with a 413 × 531 px suggested shape.",
      "Move the crop box tightly around the head and shoulders so the face covers at least 75% of the frame.",
      "Press Create, read the measured size, and download the JPG.",
      "Name the file photo.jpg and upload it. You also capture a live photograph in the form.",
    ],
    explanation: [
      "UPSC's instructions for uploading the photo and signature say the photograph is a JPG named photo, between 20 KB and 200 KB. Its face must cover at least 75% of the picture, on a plain white background, with a frontal view and both ears visible. The photograph must not be signed.",
      "UPSC prescribes no pixel size for the photograph. The 413 × 531 px shape (3.5 × 4.5 cm at 300 DPI) this page opens with is our suggestion for a head-and-shoulders crop, not an official figure, so you can change it. What matters for the rule is the face coverage and the 20 to 200 KB range.",
      "Capturing a live photograph is also mandatory, and UPSC matches it with the uploaded photo. If they do not match, the application cannot go on. So use a recent photo that looks like you today.",
      "Some older guides and an older portal FAQ give 20 to 300 KB and 350 × 350 px as the limits. The current instruction page and the 2026 notices we read use 20 to 200 KB for the photograph, so follow the instruction shown on the portal when you apply.",
    ],
    useCases: ["Preparing the photo for UPSC CSE, CDS, CAPF and other UPSC applications.", "Bringing a photo inside 20 to 200 KB.", "Cropping so the face fills three quarters of the frame."],
    tips: ["Use a plain white wall, even light and no shadows on the face.", "Do not wear dark glasses, and keep your eyes uncovered by hair.", "Do not sign across the photo."],
    faqs: [
      { q: "What is the UPSC photo size in KB?", a: "20 KB to 200 KB, JPG, according to the UPSC upload instructions and the 2026 CAPF notice." },
      { q: "What is the UPSC photo size in pixels?", a: "No pixel size is prescribed for the photograph in the documents we read. This page suggests 413 × 531 px, which you can change." },
      { q: "How much of the frame should the face cover?", a: "At least 75%, which UPSC states as three quarters of the photo area." },
      { q: "Do I still need a live photo?", a: "Yes. UPSC makes a live photograph mandatory and matches it with your uploaded photo." },
      PRIVACY,
    ],
    related: ["upsc-signature-resizer", "ssc-photo-resizer", "government-job-photo-signature-resizer", "passport-photo-resizer"],
    gov: { w: 413, h: 531, minKb: 20, maxKb: 200, hint: "Opened with UPSC's 20 to 200 KB range. UPSC states no pixel size for the photograph; 413 × 531 px is our suggestion, so change it if you wish. File sizes use 1 KB = 1,024 bytes." },
    sources: [UPSC_INSTR, UPSC_CSE, UPSC_CAPF],
    sourceNote: NOTE,
  },
  {
    slug: "upsc-signature-resizer",
    mode: "government",
    h1: "UPSC Signature Resizer",
    title: "UPSC Signature Size: 3 Signatures, 20 to 100 KB | Paul Digital",
    description: "UPSC signature rule: three signatures in one JPG, 20 to 100 KB, 350 to 500 pixels. Crop and compress your signature sheet to fit, privately in your browser.",
    summary: "UPSC's three-signature upload rule from the official instructions, with a cropper that opens at 400 × 500 px and 20 to 100 KB.",
    intro: "UPSC asks for three signatures, one below the other, in a single JPG of 20 to 100 KB with sides of 350 to 500 pixels. Crop and compress your sheet here.",
    keywords: ["upsc signature size", "upsc signature resizer", "upsc triple signature", "upsc signature 20 kb to 100 kb", "upsc signature 350 500 pixels"],
    steps: [
      "Sign three times, one below the other, in black ink on plain white paper with a gap between each. No lines or colours.",
      "Photograph or scan the sheet so that exactly three signatures are in the picture, straight and sharp.",
      "Choose it here. The size opens at 400 × 500 px with a 20 to 100 KB range.",
      "Crop so all three signatures are inside the frame, then press Create.",
      "Check the measured size, download the JPG, name it signature.jpg and upload it.",
    ],
    explanation: [
      "UPSC's instructions say to sign three times, vertically and one below the other, on plain white paper in black ink, and to scan all three in a single image. The image must be clear and sharp, contain exactly three signatures, be properly oriented and have no lines or colours. It is saved as a JPG named signature.",
      "The file size must be 20 KB to 100 KB and the image dimensions 350 to 500 pixels. The instruction does not say whether that applies to width, height or both, so this page opens at 400 × 500 px, which has both sides inside the range. A tall shape suits three stacked signatures.",
      "If the file is over 100 KB, this tool lowers the JPG quality until it fits, and warns you if it cannot.",
      "The 2026 UPSC notices repeat the three-signature rule in their Note 3 and point to the instruction page for the file details, so check that page when you apply.",
    ],
    useCases: ["Preparing the UPSC signature sheet for CSE, CDS, CAPF and other applications.", "Getting the sheet inside 20 to 100 KB.", "Cropping the sheet to a size within 350 to 500 pixels."],
    tips: ["Leave a clear gap between the three signatures so they do not touch.", "Use black ink on white paper and keep the page flat.", "Do not rotate or flip the image after cropping."],
    faqs: [
      { q: "What is the UPSC signature size?", a: "A single JPG with three signatures, 20 KB to 100 KB, with image dimensions of 350 to 500 pixels, per UPSC's upload instructions." },
      { q: "Do I sign once or three times?", a: "Three times, one below the other, on one sheet, in black ink." },
      { q: "Is 350 to 500 pixels the width or the height?", a: "The instruction does not say. This page opens at 400 × 500 px so both are inside the range." },
      PRIVACY,
    ],
    related: ["upsc-photo-resizer", "ssc-photo-resizer", "government-job-photo-signature-resizer", "signature-resizer"],
    gov: { w: 400, h: 500, minKb: 20, maxKb: 100, hint: "Opened with UPSC's 20 to 100 KB range and 400 × 500 px, which keeps both sides inside the stated 350 to 500 pixels. File sizes use 1 KB = 1,024 bytes." },
    sources: [UPSC_INSTR, UPSC_CSE, UPSC_CAPF],
    sourceNote: NOTE,
  },
];
