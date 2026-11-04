import { defineConfig } from "astro/config";
import { writeFileSync } from "node:fs";

import react from "@astrojs/react";

const SITE = "https://pauldigital.dev";

/**
 * Writes dist/sitemap.xml from the pages Astro actually built, so a new tool or guide can never be
 * missing from the sitemap (the old hand-written public/sitemap.xml had to be edited by hand).
 * Pages that are not meant to be indexed (404, anything marked noindex) are left out.
 */
function sitemap() {
  return {
    name: "paul-digital-sitemap",
    hooks: {
      "astro:build:done": ({ pages, dir }) => {
        const exclude = new Set(["404/", "500/"]);
        const urls = pages
          .map((page) => page.pathname)
          .filter((pathname) => !exclude.has(pathname))
          .map((pathname) => `${SITE}/${pathname}`.replace(/([^:])\/\/+/g, "$1/"))
          .sort((a, b) => (a === `${SITE}/` ? -1 : b === `${SITE}/` ? 1 : a.localeCompare(b)));
        const body = [...new Set(urls)].map((url) => `  <url><loc>${url}</loc></url>`).join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
        writeFileSync(new URL("sitemap.xml", dir), xml);
      },
    },
  };
}

export default defineConfig({
  site: SITE,
  trailingSlash: "always",
  compressHTML: false,
  integrations: [react(), sitemap()],
});
