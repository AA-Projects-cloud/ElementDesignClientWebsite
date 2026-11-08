// Points every canonical / share-preview URL, robots.txt and the sitemap at the live domain.
// Run once:   node tools/set-domain.mjs https://www.your-domain.com
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const next = (process.argv[2] || '').replace(/\/+$/, '');
if (!/^https:\/\/[^/\s]+$/.test(next)) { console.error('Usage: node tools/set-domain.mjs https://your-domain.com'); process.exit(1); }

const root = new URL('../', import.meta.url);
const cfgPath = new URL('config.js', root);
const prev = /SITE_URL = '([^']+)'/.exec(readFileSync(cfgPath, 'utf8'))[1];

const files = readdirSync(root).filter(f => /\.(html|txt|xml|js)$/.test(f) && f !== 'house.js');
let n = 0;
for (const f of files) {
  const p = new URL(f, root), s = readFileSync(p, 'utf8');
  if (!s.includes(prev)) continue;
  writeFileSync(p, s.split(prev).join(next)); n++;
}
console.log(`${prev}  →  ${next}  (${n} files)`);
execFileSync(process.execPath, [fileURLToPath(new URL('build-sitemap.mjs', import.meta.url))], { stdio: 'inherit' });
