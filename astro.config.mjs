import { defineConfig } from "astro/config";

import react from "@astrojs/react";

export default defineConfig({
  site: "https://pauldigital.dev",
  trailingSlash: "always",
  integrations: [react()],
});