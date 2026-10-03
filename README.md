# Paul Digital Website

The official, mostly static website for Paul Digital: an Android utility-app developer and future publisher of practical web tools. The site is built with Astro and generates static HTML; it has no backend, database, analytics, or runtime JavaScript dependency.

## Requirements

- Node.js 22.12.0 or newer
- npm

## Local development

```sh
npm install
npm run dev
```

Astro prints the local development URL in the terminal.

## Checks and production build

```sh
npm run check
npm run build
npm run preview
```

The static production site is written to `dist/`.

## Cloudflare Pages deployment

Connect this repository using Cloudflare Pages Git integration. Select `main` as the production branch, use `npm run build` as the build command, and set `dist` as the build output directory. Cloudflare Pages serves the generated static site; no Cloudflare secrets, functions, or deployment command are required. Deployments are not triggered from this project.

## Project structure

```text
public/                  Official logo, social card, robots.txt, and sitemap.xml
src/
  components/            Shared navigation, footer, and content cards
  config/                Centralized Paul Digital brand asset paths
  layouts/               Shared document layout and SEO metadata
  pages/                 File-based routes and guide content
  styles/                Global responsive styles
astro.config.mjs         Static-site configuration and canonical site URL
```

The hero artwork is isolated in `src/components/HeroVisual.astro` so real app screenshots can replace the decorative device illustration without changing the surrounding layout.
