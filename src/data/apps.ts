export type AppStatus = "Published" | "Coming Soon" | "In Development";

export interface App {
  slug: string;
  name: string;
  description: string;
  purpose: string;
  status: AppStatus;
  code: string;
  platform?: string;
  playUrl?: string;
  packageName?: string;
}

export const apps = {
  "image-to-pdf-converter": {
    slug: "image-to-pdf-converter",
    name: "Image to PDF Converter Offline",
    description: "Convert images to PDF files offline.",
    purpose: "Convert images to PDF files offline.",
    status: "Published",
    code: "PDF",
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
    platform: "Android",
    playUrl: "https://play.google.com/store/apps/details?id=com.pauldigital.wavmp3converter&pcampaignid=web_share",
  },
  "text-to-pdf": {
    slug: "text-to-pdf",
    name: "Text to PDF Converter",
    description: "Android utility app.",
    purpose: "Convert text to PDF.",
    status: "Coming Soon",
    code: "PDF",
    platform: "Android",
    packageName: "com.pauldigital.texttopdfconverter",
  },
  "wifi-site-survey-pro": {
    slug: "wifi-site-survey-pro",
    name: "WiFi Site Survey Pro",
    description: "Paul Digital app.",
    purpose: "WiFi site survey app.",
    status: "Coming Soon",
    code: "WiFi",
  },
  "vob-video-player": {
    slug: "vob-video-player",
    name: "VOB Video Player",
    description: "Paul Digital app.",
    purpose: "VOB video player app.",
    status: "Coming Soon",
    code: "VOB",
  },
} satisfies Record<string, App>;

export type AppSlug = keyof typeof apps;

export const allApps = Object.values(apps);
export const publishedApps = allApps.filter((app) => app.status === "Published");
export const comingSoonApps = allApps.filter((app) => app.status === "Coming Soon");

export function getAppBySlug(slug: AppSlug): App {
  return apps[slug];
}
