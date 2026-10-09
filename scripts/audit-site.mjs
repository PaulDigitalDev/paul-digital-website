// Post-build audit: compares dist/ routes with public/sitemap.xml and checks
// canonical URLs, unique titles/descriptions, noindex flags and internal links.
// Usage: npm run build && node scripts/audit-site.mjs
import fs from "node:fs";
import path from "node:path";

const dist = "dist";
const origin = "https://pauldigital.dev";
const pages = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name === "index.html") pages.push(full);
  }
})(dist);

const routeOf = (file) => {
  const rel = path.relative(dist, path.dirname(file)).split(path.sep).join("/");
  return rel ? `/${rel}/` : "/";
};
const routes = pages.map(routeOf);
const sitemap = [...fs.readFileSync("public/sitemap.xml", "utf8").matchAll(/<loc>(.*?)<\/loc>/g)].map((m) =>
  m[1].replace(origin, ""),
);

let problems = 0;
const report = (msg) => {
  problems++;
  console.log("PROBLEM:", msg);
};

console.log(`pages built: ${routes.length}, sitemap entries: ${sitemap.length}`);
routes.filter((r) => !sitemap.includes(r)).forEach((r) => report(`built but not in sitemap: ${r}`));
sitemap.filter((r) => !routes.includes(r)).forEach((r) => report(`in sitemap but not built: ${r}`));

const titles = new Map();
const descriptions = new Map();
const routeSet = new Set(routes);
pages.forEach((file, i) => {
  const route = routes[i];
  const html = fs.readFileSync(file, "utf8");
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
  const canonical = html.match(/rel="canonical" href="(.*?)"/)?.[1];
  const description = html.match(/name="description" content="(.*?)"/)?.[1];
  if (canonical !== origin + route) report(`canonical mismatch on ${route}: ${canonical}`);
  if (!description) report(`missing description on ${route}`);
  if (/noindex/.test(html)) report(`noindex on ${route}`);
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) report(`expected exactly one h1 on ${route}`);
  titles.set(title, [...(titles.get(title) || []), route]);
  descriptions.set(description, [...(descriptions.get(description) || []), route]);
  for (const m of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    const url = m[1];
    if (/\.[a-z0-9]+$/i.test(url)) {
      if (!fs.existsSync(path.join(dist, url))) report(`missing file ${url} linked from ${route}`);
    } else if (!routeSet.has(url)) report(`broken link ${url} on ${route}`);
  }
});
for (const [t, rs] of titles) if (rs.length > 1) report(`duplicate title "${t}": ${rs.join(", ")}`);
for (const [d, rs] of descriptions) if (rs.length > 1) report(`duplicate description: ${rs.join(", ")}`);

console.log(problems ? `${problems} problem(s)` : "audit clean");
process.exitCode = problems ? 1 : 0;
