import { availableTools, toolById } from "./toolRegistry";

export type DirectoryIcon = "pdf" | "docx" | "text" | "image" | "convert" | "photo" | "social";

export interface DirectoryEntry {
  name: string;
  href: string;
}

export interface DirectoryGroup {
  id: string;
  title: string;
  icon: DirectoryIcon;
  tools: DirectoryEntry[];
}

interface GroupSpec {
  id: string;
  title: string;
  icon: DirectoryIcon;
  /** Registry tool ids, in display order. */
  ids: string[];
  /** Working tools that live outside the registry (localized pages), shown after the registry tools. */
  extra?: DirectoryEntry[];
}

/**
 * Homepage grouping. Every available registry tool must appear in exactly one group;
 * the build fails otherwise, so a new tool cannot silently go missing from the homepage.
 * Target-size landing pages (compress-*, jpg-to-pdf-under-*, ...) share
 * an engine with a listed tool and are reached from that tool, so they are not listed again.
 */
const specs: GroupSpec[] = [
  {
    id: "pdf",
    title: "PDF Tools",
    icon: "pdf",
    ids: ["jpg-to-pdf"],
  },
  {
    id: "portuguese",
    title: "Ferramentas em Português",
    icon: "pdf",
    ids: [],
    extra: [
      { name: "Juntar PDF", href: "/juntar-pdf/" },
      { name: "JPG para PDF", href: "/jpg-para-pdf/" },
      { name: "Imagem para PDF", href: "/imagem-para-pdf/" },
    ],
  },
  { id: "docx", title: "DOCX & Text Tools", icon: "docx", ids: ["image-to-word", "jpg-to-text", "png-to-text"] },
  {
    id: "image",
    title: "Image Tools",
    icon: "image",
    ids: ["image-compressor", "image-resizer", "crop-rotate-flip-image", "image-metadata", "favicon-generator"],
  },
  {
    id: "convert",
    title: "Image Converters",
    icon: "convert",
    ids: [
      "image-converter",
      "image-to-jpg",
      "jpeg-to-jpg",
      "jfif-to-jpg",
      "heic-to-jpg",
      "webp-to-jpg",
      "avif-to-jpg",
      "webp-to-png",
      "jpeg-to-png",
      "png-to-jpeg",
      "png-to-ico",
    ],
  },
  {
    id: "photo",
    title: "Photo & Form Resizers",
    icon: "photo",
    ids: ["passport-photo-resizer", "uk-passport-photo-digital", "signature-resizer", "government-job-photo-signature-resizer"],
  },
  {
    id: "social",
    title: "Social Media Tools",
    icon: "social",
    ids: [
      "resize-image-for-instagram",
      "instagram-grid",
      "resize-image-for-whatsapp-dp",
      "resize-image-for-youtube-banner",
      "zoom-out-image",
    ],
  },
];

/** Shorter labels where the registry heading is too long for a compact row. */
const shortNames: Record<string, string> = {
  "resize-image-for-instagram": "Resize for Instagram",
  "resize-image-for-whatsapp-dp": "Resize for WhatsApp DP",
  "resize-image-for-youtube-banner": "Resize for YouTube Banner",
  "crop-rotate-flip-image": "Crop, Rotate & Flip",
  "image-metadata": "Image Metadata",
  "uk-passport-photo-digital": "UK Passport Photo Check",
  "government-job-photo-signature-resizer": "Government Job Photo & Signature",
};

export function buildDirectory(): DirectoryGroup[] {
  const placed = new Map<string, string>();
  const hrefs = new Set<string>();
  const groups = specs.map((spec) => {
    const tools: DirectoryEntry[] = spec.ids.map((id) => {
      const tool = toolById.get(id);
      if (!tool || tool.status !== "available") throw new Error(`Home directory: "${id}" is not an available registry tool`);
      if (placed.has(id)) throw new Error(`Home directory: "${id}" is listed in both "${placed.get(id)}" and "${spec.id}"`);
      placed.set(id, spec.id);
      return { name: shortNames[id] ?? tool.name, href: tool.route };
    });
    tools.push(...(spec.extra ?? []));
    for (const entry of tools) {
      if (hrefs.has(entry.href)) throw new Error(`Home directory: duplicate link ${entry.href}`);
      hrefs.add(entry.href);
    }
    return { id: spec.id, title: spec.title, icon: spec.icon, tools };
  });
  const missing = availableTools.filter((tool) => !placed.has(tool.id)).map((tool) => tool.id);
  if (missing.length) throw new Error(`Home directory: registry tools missing from the homepage: ${missing.join(", ")}`);
  return groups;
}
