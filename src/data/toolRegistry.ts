import { formatTools } from "./formatTools";
import { socialTools } from "./socialTools";
import { editorTools } from "./editorTools";
import { imageSizeRoutes } from "./imageSizeRoutes";
import { jpgToPdfRoutes } from "./jpgToPdfRoutes";

export type ToolCategoryId = "image" | "pdf" | "document" | "developer" | "calculators" | "media";
/** "available" tools work today and are listed. Anything else is never shown or put in the sitemap. */
export type ToolStatus = "available" | "planned";

export interface ToolCategory {
  id: ToolCategoryId;
  name: string;
  summary: string;
  /** Category page route. Only set once the category has enough working tools to justify its own page. */
  route?: string;
}

export interface RegistryTool {
  id: string;
  name: string;
  category: ToolCategoryId;
  route: string;
  description: string;
  status: ToolStatus;
  related: string[];
  /** Extra words the directory search should match. */
  keywords: string[];
  /** Target-size landing pages that open this tool with a preset goal. */
  variants?: { route: string; label: string }[];
}

export const categories: ToolCategory[] = [
  {
    id: "image",
    name: "Image Tools",
    summary: "Compress, resize, crop, convert and clean images for the web, social media, forms and icons.",
    route: "/tools/image/",
  },
  { id: "pdf", name: "PDF Tools", summary: "Create PDFs from images and check the real file size." },
  {
    id: "document",
    name: "Document Tools",
    summary: "Turn pictures into Word documents or extract printed text with OCR.",
    route: "/tools/document/",
  },
  { id: "developer", name: "Developer Tools", summary: "Small utilities for developers." },
  { id: "calculators", name: "Calculators and Converters", summary: "Everyday calculators and unit converters." },
  { id: "media", name: "File and Media Utilities", summary: "Utilities for files, audio and video." },
];

const formatCategory = (kind: (typeof formatTools)[number]["kind"]): ToolCategoryId =>
  kind === "word" || kind === "ocr" ? "document" : "image";

const formatEntries: RegistryTool[] = formatTools.map((tool) => ({
  id: tool.slug,
  name: tool.h1,
  category: formatCategory(tool.kind),
  route: `/${tool.slug}/`,
  description: tool.summary,
  status: "available",
  related: tool.related,
  keywords: [tool.kind, tool.inputLabel],
}));

const socialEntries: RegistryTool[] = socialTools.map((tool) => ({
  id: tool.slug,
  name: tool.h1,
  category: "image",
  route: `/${tool.slug}/`,
  description: tool.summary,
  status: "available",
  related: tool.related,
  keywords: ["social", "resize", "no crop"],
}));

const editorEntries: RegistryTool[] = editorTools.map((tool) => ({
  id: tool.slug,
  name: tool.h1,
  category: "image",
  route: `/${tool.slug}/`,
  description: tool.summary,
  status: "available",
  related: tool.related,
  keywords: tool.keywords,
}));

export const tools: RegistryTool[] = [
  {
    id: "image-compressor",
    name: "Image Compressor",
    category: "image",
    route: "/image-compressor/",
    description: "Compress or resize an image toward a target size in KB or MB. The real output size is measured and reported.",
    status: "available",
    related: ["jpg-to-pdf", "image-to-jpg", "image-converter", "resize-image-for-instagram"],
    keywords: ["compress", "reduce size", "kb", "mb", "resize"],
    variants: imageSizeRoutes.map((route) => ({ route: `/${route.slug}/`, label: route.h1 })),
  },
  {
    id: "jpg-to-pdf",
    name: "JPG to PDF",
    category: "pdf",
    route: "/jpg-to-pdf/",
    description: "Combine JPG images into one PDF in your browser and compare the real file size with a target.",
    status: "available",
    related: ["image-compressor", "image-to-word", "image-to-jpg", "jpg-to-text"],
    keywords: ["jpeg to pdf", "image to pdf", "combine", "merge images"],
    variants: jpgToPdfRoutes.map((route) => ({ route: `/${route.slug}/`, label: route.h1 })),
  },
  ...formatEntries,
  ...socialEntries,
  ...editorEntries,
];

export const toolById = new Map(tools.map((tool) => [tool.id, tool]));
export const categoryById = new Map(categories.map((category) => [category.id, category]));

export const availableTools = tools.filter((tool) => tool.status === "available");
export const toolsInCategory = (id: ToolCategoryId) => availableTools.filter((tool) => tool.category === id);
export const relatedTools = (id: string) =>
  (toolById.get(id)?.related ?? []).map((rid) => toolById.get(rid)).filter((t): t is RegistryTool => !!t && t.status === "available");

/** Registry integrity problems; empty when consistent. Checked at build time by the directory pages. */
export function registryProblems(): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  const routes = new Set<string>();
  for (const tool of tools) {
    if (seen.has(tool.id)) problems.push(`duplicate id ${tool.id}`);
    if (routes.has(tool.route)) problems.push(`duplicate route ${tool.route}`);
    seen.add(tool.id);
    routes.add(tool.route);
    if (!categoryById.has(tool.category)) problems.push(`${tool.id}: unknown category ${tool.category}`);
    for (const rid of tool.related) if (!toolById.has(rid)) problems.push(`${tool.id}: unknown related tool ${rid}`);
  }
  return problems;
}
