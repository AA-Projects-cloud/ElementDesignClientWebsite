// Updates the page's title, description, canonical and share-preview tags (used by pages whose content is built in the browser).
import { SITE_URL } from './config.js';

const tag = (sel, make) => document.head.querySelector(sel) || document.head.appendChild(make());
const meta = (attr, key, value) => {
  const el = tag(`meta[${attr}="${key}"]`, () => { const m = document.createElement('meta'); m.setAttribute(attr, key); return m; });
  el.setAttribute('content', value);
};

export function setSeo({ title, description, image, path }) {
  const url = `${SITE_URL}/${path || ''}`;
  const img = image ? `${SITE_URL}/${image}` : `${SITE_URL}/og-image.jpg`;
  const desc = description.length > 158 ? description.slice(0, 155).replace(/\s+\S*$/, '') + '…' : description;
  document.title = title;
  meta('name', 'description', desc);
  tag('link[rel="canonical"]', () => { const l = document.createElement('link'); l.rel = 'canonical'; return l; }).href = url;
  meta('property', 'og:title', title);
  meta('property', 'og:description', desc);
  meta('property', 'og:url', url);
  meta('property', 'og:image', img);
  meta('name', 'twitter:title', title);
  meta('name', 'twitter:description', desc);
  meta('name', 'twitter:image', img);
}
