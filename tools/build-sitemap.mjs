// Rebuilds sitemap.xml from the pages and data.js.   Run:  node tools/build-sitemap.mjs
import { writeFileSync } from 'node:fs';
import { SITE_URL } from '../config.js';
import { SERVICES, SUBSERVICES, PORTFOLIO_CATS, BLOG } from '../data.js';

const today = new Date().toISOString().slice(0, 10);
const pages = [
  ['', 1.0, 'weekly'],
  ['services.html', 0.9, 'monthly'],
  ['portfolio.html', 0.9, 'monthly'],
  ['about.html', 0.8, 'monthly'],
  ['blog.html', 0.7, 'weekly'],
  ['career.html', 0.5, 'monthly'],
  ['privacy-policy.html', 0.3, 'yearly'],
  ...SERVICES.map(s => [`service.html?s=${s.slug}`, 0.8, 'monthly']),
  ...SUBSERVICES.map(s => [`service.html?s=${s.slug}`, 0.6, 'monthly']),
  ...PORTFOLIO_CATS.filter(c => c.slug !== 'all').map(c => [`portfolio.html?c=${c.slug}`, 0.6, 'monthly']),
  ...BLOG.map(b => [`article.html?slug=${b.slug}`, 0.6, 'monthly'])
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(([p, pr, fr]) => `  <url>\n    <loc>${SITE_URL}/${p}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${fr}</changefreq>\n    <priority>${pr.toFixed(1)}</priority>\n  </url>`).join('\n')}
</urlset>
`;
writeFileSync(new URL('../sitemap.xml', import.meta.url), xml);
console.log(`sitemap.xml written with ${pages.length} URLs for ${SITE_URL}`);
