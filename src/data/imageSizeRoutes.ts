export type ImageSizeMode = "compress" | "resize";
export type ImageFormatScope = "jpeg" | "image";
export type SizeUnit = "KB" | "MB";

export interface ImageSizeRoute {
  slug: string;
  /** Default target the tool initialises with; users can edit it. */
  target: number;
  unit: SizeUnit;
  title: string;
  h1: string;
  /** Unique introduction, also used as the meta description. */
  description: string;
  /** Unique supporting paragraph shown below the tool. */
  details: string;
  mode: ImageSizeMode;
  scope: ImageFormatScope;
  canonical: string;
}

const SITE = "https://pauldigital.dev";

type Entry = Omit<ImageSizeRoute, "canonical" | "title" | "h1"> & { title?: string; h1?: string };

const label = (value: number, unit: SizeUnit) => `${value} ${unit}`;

function build(entry: Entry): ImageSizeRoute {
  const target = label(entry.target, entry.unit);
  const subject = entry.scope === "jpeg" ? "JPEG" : "Image";
  const verb = entry.mode === "resize" ? "Resize" : "Compress";
  const h1 = entry.h1 ?? `${verb} ${subject} to ${target}`;
  return {
    ...entry,
    title: entry.title ?? `${h1} Online — Paul Digital`,
    h1,
    canonical: `${SITE}/${entry.slug}/`,
  };
}

export const imageSizeRoutes: ImageSizeRoute[] = (
  [
    {
      slug: "compress-image-to-5kb",
      target: 5,
      unit: "KB",
      mode: "compress",
      scope: "image",
      description:
        "Squeeze a JPEG, PNG or WebP image toward 5 KB right in your browser. Nothing is uploaded, and the real result is measured and shown.",
      details:
        "5 KB is a very small budget, so expect visible softening and reduced dimensions. Thumbnails, tiny avatars and strict signature fields are the usual use for a target this low.",
    },
    {
      slug: "compress-jpeg-to-10kb",
      target: 10,
      unit: "KB",
      mode: "compress",
      scope: "jpeg",
      description:
        "Reduce a JPEG photo toward 10 KB without leaving your browser. Quality is lowered first, then dimensions, and the final size is measured.",
      details:
        "Around 10 KB suits small passport-style photos, signature scans and form fields with tight attachment limits. Simple images with flat backgrounds reach it most easily.",
    },
    {
      slug: "compress-image-to-15kb",
      target: 15,
      unit: "KB",
      mode: "compress",
      scope: "image",
      description:
        "Compress a JPEG, PNG or WebP image toward 15 KB locally on your device, with a measured result instead of a guess.",
      details:
        "15 KB is a common ceiling for small profile pictures and scanned stamps. Photos with fine detail may need to shrink in dimensions as well as quality.",
    },
    {
      slug: "compress-image-to-20kb",
      target: 20,
      unit: "KB",
      mode: "compress",
      scope: "image",
      description:
        "Shrink an image toward 20 KB in your browser. Pick a file, confirm the target and download the re-encoded result.",
      details:
        "Twenty kilobytes works for avatars, small icons and compact document photos. If the first pass is still too large, the tool scales the picture down step by step.",
    },
    {
      slug: "compress-jpeg-between-20kb-to-50kb",
      target: 20,
      unit: "KB",
      mode: "compress",
      scope: "jpeg",
      description:
        "Compress a JPEG toward 20 KB in your browser. The target starts at 20 KB and stays editable, and the real output size is measured and shown.",
      details:
        "Twenty kilobytes is a common ceiling for photo fields on application forms. Quality is lowered first and dimensions shrink only if the file is still too large, so detailed originals may come out noticeably softer.",
    },
    {
      slug: "compress-jpeg-to-25kb",
      target: 25,
      unit: "KB",
      mode: "compress",
      scope: "jpeg",
      description:
        "Bring a JPEG down toward 25 KB using only your browser. Quality is reduced first and the output is measured after every attempt.",
      details:
        "A 25 KB budget keeps a recognisable portrait at modest dimensions. It is a typical limit for application-form photographs.",
    },
    {
      slug: "compress-jpeg-to-30kb",
      target: 30,
      unit: "KB",
      mode: "compress",
      scope: "jpeg",
      description:
        "Compress a JPEG to roughly 30 KB or less on your own device. Your photo never leaves the page.",
      details:
        "Thirty kilobytes gives enough room for clear faces at small sizes. Large camera originals will be scaled down considerably to fit.",
    },
    {
      slug: "compress-jpeg-to-40kb",
      target: 40,
      unit: "KB",
      mode: "compress",
      scope: "jpeg",
      description:
        "Reduce a JPEG toward 40 KB with local processing. Adjust the target and unit if your upload form asks for something different.",
      details:
        "At 40 KB most portraits keep good clarity at screen resolution. This is a handy size for ID photos and portal uploads.",
    },
    {
      slug: "compress-image-to-50kb",
      target: 50,
      unit: "KB",
      mode: "compress",
      scope: "image",
      description:
        "Compress a JPEG, PNG or WebP image toward 50 KB in your browser, with the actual output size reported after processing.",
      details:
        "Fifty kilobytes is one of the most requested limits for online forms. JPEG and WebP shrink well; PNG usually needs fewer pixels because its encoding is lossless.",
    },
    {
      slug: "compress-image-to-60kb",
      target: 60,
      unit: "KB",
      mode: "compress",
      scope: "image",
      description:
        "Shrink a JPEG, PNG or WebP image toward 60 KB without uploading it anywhere. The target is editable if you need another value.",
      details:
        "Sixty kilobytes leaves a little more room than 50 KB, which often means keeping noticeably higher quality for photographs.",
    },
    {
      slug: "compress-image-to-70kb",
      target: 70,
      unit: "KB",
      mode: "compress",
      scope: "image",
      description:
        "Reduce an image toward 70 KB entirely in your browser and download the re-encoded copy once the measured size is shown.",
      details:
        "Seventy kilobytes is a comfortable middle ground for document photos and web thumbnails where detail still matters.",
    },
    {
      slug: "compress-image-to-80kb",
      target: 80,
      unit: "KB",
      mode: "compress",
      scope: "image",
      description:
        "Compress a picture toward 80 KB locally. The tool tries quality first, then dimensions, and shows what it achieved.",
      details:
        "Eighty kilobytes is generous for small photos and suits uploads that cap files just under 100 KB.",
    },
    {
      slug: "compress-image-to-90kb",
      target: 90,
      unit: "KB",
      mode: "compress",
      scope: "image",
      description:
        "Get an image under about 90 KB in your browser. No account, no upload and no guesses about the final size.",
      details:
        "Ninety kilobytes leaves headroom below a 100 KB limit, which is useful when a portal measures size slightly differently.",
    },
    {
      slug: "resize-image-to-50kb",
      target: 50,
      unit: "KB",
      mode: "resize",
      scope: "image",
      description:
        "Resize an image toward 50 KB by scaling its dimensions first and lowering quality only if needed. Runs locally in your browser.",
      details:
        "Resize-first keeps the compression quality high and reduces pixel dimensions instead. It suits images that are far larger than they need to be, such as raw phone photos.",
    },
    {
      slug: "compress-image-to-100kb",
      target: 100,
      unit: "KB",
      mode: "compress",
      scope: "image",
      description:
        "Compress a JPEG, PNG or WebP image toward 100 KB without uploading it. See original and output sizes side by side.",
      details:
        "A 100 KB budget is a practical balance for web pages, email signatures and many upload forms, and photographs usually remain sharp at moderate dimensions.",
    },
    {
      slug: "compress-jpeg-to-150kb",
      target: 150,
      unit: "KB",
      mode: "compress",
      scope: "jpeg",
      description:
        "Reduce a JPEG toward 150 KB in your browser, lowering quality gradually and scaling down only when necessary.",
      details:
        "At 150 KB a typical photograph retains fine detail at screen sizes, which makes it a good limit for blog images and marketplace listings.",
    },
    {
      slug: "compress-image-to-200kb",
      target: 200,
      unit: "KB",
      mode: "compress",
      scope: "image",
      description:
        "Compress an image toward 200 KB locally. Choose JPEG, PNG or WebP and get a measured result with a download link.",
      details:
        "Two hundred kilobytes is a frequent cap for scanned documents and attachment fields. Most photographs fit with only light quality loss.",
    },
    {
      slug: "resize-image-to-200kb",
      target: 200,
      unit: "KB",
      mode: "resize",
      scope: "image",
      description:
        "Resize an image toward 200 KB by reducing dimensions before quality. Everything stays on your device.",
      details:
        "Scaling the pixel size first preserves compression quality, which helps text-heavy scans stay legible at the target size.",
    },
    {
      slug: "compress-jpeg-to-300kb",
      target: 300,
      unit: "KB",
      mode: "compress",
      scope: "jpeg",
      description:
        "Bring a JPEG down toward 300 KB in your browser. Quality drops first; dimensions shrink only if the file is still too large.",
      details:
        "Three hundred kilobytes is plenty for a detailed photo at typical screen widths and a common limit for document portals.",
    },
    {
      slug: "compress-jpeg-to-500kb",
      target: 500,
      unit: "KB",
      mode: "compress",
      scope: "jpeg",
      description:
        "Compress a high-resolution JPEG toward 500 KB using local processing, with the final size measured rather than assumed.",
      details:
        "Half a megabyte keeps most phone photos looking good while cutting size dramatically, which suits email attachments and CMS uploads.",
    },
    {
      slug: "compress-image-to-1mb",
      target: 1,
      unit: "MB",
      mode: "compress",
      scope: "image",
      description:
        "Compress a JPEG, PNG or WebP image toward 1 MB in your browser. Ideal for attachments and uploads with a one-megabyte limit.",
      details:
        "One megabyte (1,024 KB) is a widespread attachment ceiling. Large PNG screenshots may need scaling, since PNG encoding does not trade quality for size.",
    },
    {
      slug: "compress-image-to-2mb",
      target: 2,
      unit: "MB",
      mode: "compress",
      scope: "image",
      description:
        "Reduce a large image toward 2 MB locally. The browser does the work, so full-size photos are never uploaded.",
      details:
        "Two megabytes is a typical limit for social profiles and support forms. Most phone photos need only light compression to fit.",
    },
  ] as Entry[]
).map(build);

export const imageSizeBySlug = new Map(imageSizeRoutes.map((route) => [route.slug, route]));

export function targetLabel(route: ImageSizeRoute): string {
  return label(route.target, route.unit);
}

/** Convert a size to bytes (1 KB = 1,024 bytes). */
export function toBytes(value: number, unit: SizeUnit): number {
  return Math.round(value * (unit === "MB" ? 1024 * 1024 : 1024));
}

export function relatedRoutes(slug: string, count = 6): ImageSizeRoute[] {
  const current = imageSizeBySlug.get(slug);
  if (!current) return [];
  const bytes = toBytes(current.target, current.unit);
  return imageSizeRoutes
    .filter((route) => route.slug !== slug)
    .sort(
      (a, b) =>
        Math.abs(Math.log(toBytes(a.target, a.unit) / bytes)) -
        Math.abs(Math.log(toBytes(b.target, b.unit) / bytes)),
    )
    .slice(0, count);
}
