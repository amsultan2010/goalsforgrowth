import { writeFileSync } from "node:fs";

const origin = "https://goalsforgrowth.site";
const routes = ["/", "/gallery"];

const urls = routes
  .map((path) => `  <url><loc>${origin}${path}</loc></url>`)
  .join("\n");

writeFileSync(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
);
