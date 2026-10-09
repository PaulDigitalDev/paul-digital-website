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
}

export const apps = {
  "image-to-pdf-converter": {
    slug: "image-to-pdf-converter",
    name: "Image to PDF Converter Offline",
    description: "Convert images to PDF files offline.",
    purpose: "Convert images to PDF files offline.",
    status: "Published",
    code: "PDF",
    icon: "https://play-lh.googleusercontent.com/7O05GWfUwRB9OnUDyXhES4y3xfhayuOep6IE3BTekfhZ-BXMSQxjXZoG_yEkDi1o2xfSlOnnnZck0nSR2xwxbA=w240-h480-rw",
    platform: "Android",
    playUrl: "https://play.google.com/store/apps/details?id=com.pauldigital.imagetopdf",
  },
  "wav-to-mp3-converter": {
    slug: "wav-to-mp3-converter",
    name: "WAV to MP3 Converter",
    description: "Convert WAV audio files to MP3.",
    purpose: "Convert WAV audio files to MP3 format.",
    status: "Published",
    code: "WAV",
    icon: "https://play-lh.googleusercontent.com/LVMuMJT9ImuUn_QTa3pQEeAyifdOOLBx72Zf-I788QfXN7rg7ErTzwFuQpDYRkSzCM8gQX3o1dMJEduvrJmW=w240-h480-rw",
    platform: "Android",
    playUrl: "https://play.google.com/store/apps/details?id=com.pauldigital.wavmp3converter&pcampaignid=web_share",
  },
  "photo-exif-editor": {
    slug: "photo-exif-editor",
    name: "Photo EXIF Editor",
    description: "View and edit photo GPS, date and time, and metadata on Android.",
    purpose: "View and edit photo metadata such as GPS location, date and time, and other EXIF details.",
    status: "Preview",
    code: "EXIF",
    icon: "/apps/photo-exif-editor-icon.png",
    platform: "Android",
    packageName: "com.pauldigital.photoexifeditor.gps.date.metadata",
  },
} satisfies Record<string, App>;

export type AppSlug = keyof typeof apps;

export const allApps = Object.values(apps);
export const publishedApps = allApps.filter((app) => app.status === "Published");
export const previewApps = allApps.filter((app) => app.status === "Preview");

export function getAppBySlug(slug: AppSlug): App {
  return apps[slug];
}
