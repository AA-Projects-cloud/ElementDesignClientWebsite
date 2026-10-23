// Shared site chrome: header, dropdown menus, mobile menu, footer, cookie notice.
// Loaded on every page (home + inner pages).

const here = location.pathname.split('/').pop() || 'index.html';
const onHome = here === 'index.html';
const H = h => (h.startsWith('#') && !onHome ? 'index.html' + h : h);
const esc = t => t.replace(/&/g, '&amp;');

/* ---------- header + page chrome (injected on inner pages) ---------- */
if (!document.getElementById('nav')) {
  document.body.insertAdjacentHTML('afterbegin', `
<header class="nav" id="nav">
  <button class="burger" aria-label="Menu"><span></span><span></span><span></span></button>
  <a class="logo" href="index.html" aria-label="Element Design"><img class="logo-img" src="logo.png" alt=""><span>ELEMENT DESIGN<sup>®</sup></span></a>
  <ul class="nav-links" id="navLinks"></ul>
  <div class="nav-right">
    <a href="index.html#contact" class="leave"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>Leave a request</a>
    <span class="lang"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg><b>EN</b></span>
  </div>
</header>`);
}
if (!document.getElementById('mMenu')) document.body.insertAdjacentHTML('beforeend', '<div class="m-menu" id="mMenu" aria-hidden="true"></div>');
if (!document.querySelector('body > footer, main > footer, footer.site-footer')) {
  const f = document.createElement('footer');
  f.className = 'site-footer';
  f.innerHTML = `
    <div class="f-links"><a href="about.html">About us</a><a href="index.html#contact">Contacts</a><a href="services.html">Services</a><a href="career.html">Career</a><a href="blog.html">Blog</a><a href="portfolio.html">Portfolio</a><a href="portfolio.html?c=commercial-interiors">Commercials</a></div>
    <div class="f-links"><a href="portfolio.html?c=architectural-design">Architectural design</a><a href="portfolio.html?c=residential-interiors">Residential interiors</a><a href="service.html?s=interior">Interior services</a><a href="index.html">Home</a>
      <span class="f-soc">We're on social media</span><a href="https://www.instagram.com/the_element_designs?rpxt=Y3h3NmVkMjdmZGI4" target="_blank" rel="noopener noreferrer">Instagram</a></div>
    <div class="f-brand">ELEMENT DESIGN<sup>®</sup><small>© <span id="yr"></span> Element Design. All rights reserved.</small></div>`;
  (document.querySelector('main') || document.body).appendChild(f);
}
const yr = document.getElementById('yr'); if (yr) yr.textContent = new Date().getFullYear();
if (!document.getElementById('cookie')) {
  document.body.insertAdjacentHTML('beforeend', '<div class="cookie" id="cookie">This website uses Cookies. <button id="accept">Accept</button></div>');
  document.getElementById('accept').onclick = () => document.getElementById('cookie').classList.add('gone');
}

/* ---------- menu data ---------- */
const I = {
  people: '<circle cx="9" cy="8" r="3"/><path d="M3 19c0-3 2.5-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.3"/><path d="M16 14c3 0 5 1.7 5 4.5"/>',
  brief: '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M9 8V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18"/>',
  doc: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>',
  grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
  stack: '<rect x="4" y="7" width="13" height="13" rx="1.5"/><path d="M8 7V4h12v13h-3"/>',
  house: '<path d="M3 11l9-7 9 7"/><path d="M5.5 10v10h13V10M10 20v-6h4v6"/>',
  sofa: '<path d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/><path d="M3 12a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v6H3zM6 18v2M18 18v2"/>',
  biz: '<path d="M4 20V11M10 20V6M16 20v-7M3 20h18"/><path d="M13.5 5.5l3-2.2 3 2.2"/>',
  bim: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/><circle cx="12" cy="10" r="2.2"/>',
  helmet: '<path d="M4 17a8 8 0 0 1 16 0z"/><path d="M12 9V6M3 20h18"/>',
  bricks: '<rect x="3.5" y="4.5" width="17" height="15" rx="1.5"/><path d="M3.5 9.5h17M3.5 14.5h17M9 4.5v5M15 9.5v5M9 14.5v5"/>',
  clip: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v3H9zM8.5 11h7M8.5 15h5"/>'
};
const S = (slug, label) => [label, `service.html?s=${slug}`];
const MENU = [
  { label: 'About', key: ['about.html', 'career.html', 'blog.html', 'article.html'], items: [
    { t: 'About Us', i: 'people', h: 'about.html' }, { t: 'Career', i: 'brief', h: 'career.html' }, { t: 'Blog', i: 'doc', h: 'blog.html' }] },
  { label: 'Portfolio', key: ['portfolio.html'], items: [
    { t: 'All projects', i: 'stack', h: 'portfolio.html' },
    { t: 'Architectural design', i: 'house', h: 'portfolio.html?c=architectural-design' },
    { t: 'Interior design', i: 'sofa', h: 'portfolio.html?c=residential-interiors' },
    { t: 'Commercial interiors', i: 'biz', h: 'portfolio.html?c=commercial-interiors' }] },
  { label: 'Services', key: ['services.html', 'service.html'], items: [
    { t: 'All services', i: 'grid', h: 'services.html' },
    { t: 'Architecture', i: 'house', h: 'service.html?s=architecture' },
    { t: 'Interiors', i: 'sofa', h: 'service.html?s=interior',
      sub: [S('interior', 'Interiors'), S('villas', 'Villas'), S('private-houses', 'Private houses'), S('residences', 'Residences'), S('cottages', 'Cottages'), S('mansions', 'Mansions'), S('penthouses', 'Penthouses'), S('apartments', 'Apartments')] },
    { t: 'For business', i: 'biz', h: 'service.html?s=commercial-interior',
      sub: [S('commercial-interior', 'For business'), S('hotels', 'Hotels'), S('restaurants', 'Restaurants'), S('resorts', 'Resorts'), S('offices', 'Offices'), S('spa-wellness', 'Spa & Wellness'), S('common-areas', 'Common areas'), S('bars', 'Bars')] },
    { t: 'Bim engineering', i: 'bim', h: 'service.html?s=bim' },
    { t: 'Design supervision', i: 'helmet', h: 'service.html?s=design-supervision' },
    { t: 'Construction management', i: 'bricks', h: 'service.html?s=construction-management' },
    { t: 'Procurement', i: 'clip', h: 'service.html?s=procurement' }] },
  { label: 'Contacts', href: '#contact', key: [] }
];

/* ---------- desktop dropdowns ---------- */
const chevDown = '<svg viewBox="0 0 8 5" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M1 1l3 3 3-3"/></svg>';
const chevRight = '<svg class="chev" viewBox="0 0 5 8"><path d="M1 1l3 3-3 3"/></svg>';
document.getElementById('navLinks').innerHTML = MENU.map(m => {
  const cur = m.key.includes(here) ? ' cur' : '';
  if (m.href) return `<li><a class="top" href="${H(m.href)}">${m.label}</a></li>`;
  const rows = m.items.map((it, n) => {
    const sec = it.sub ? `<div class="sec"><ul class="sec-panel">${it.sub.map((s, k) => `<li><a class="d-item" href="${s[1]}">${esc(s[0])}</a></li>${k === 0 ? '<li class="sep"></li>' : ''}`).join('')}</ul></div>` : '';
    return `<li class="p-item"><a class="d-item" href="${it.h}"><svg class="ic" viewBox="0 0 24 24">${I[it.i]}</svg>${esc(it.t)}${it.sub ? chevRight : ''}</a>${sec}</li>${n === 0 ? '<li class="sep"></li>' : ''}`;
  }).join('');
  return `<li class="${cur.trim()}"><button class="top" type="button" aria-haspopup="true">${m.label}${chevDown}</button><div class="dd"><ul class="dd-panel">${rows}</ul></div></li>`;
}).join('');

/* ---------- mobile burger menu ---------- */
const mMenu = document.getElementById('mMenu'), burger = document.querySelector('.burger');
const chevD = '<svg viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M1 1l4 4 4-4"/></svg>';
mMenu.innerHTML = '<ul>' + MENU.map(m => {
  if (m.href) return `<li><a class="mm-link" href="${H(m.href)}">${m.label}</a></li>`;
  const subs = m.items.map(it => {
    const ic = `<svg viewBox="0 0 24 24">${I[it.i]}</svg>`;
    if (it.sub) return `<div class="mm-has"><a href="${it.h}" data-toggle>${ic}${esc(it.t)}<svg class="chev" viewBox="0 0 10 6"><path d="M1 1l4 4 4-4"/></svg></a><div class="mm-deep">${it.sub.map(s => `<a href="${s[1]}">${esc(s[0])}</a>`).join('')}</div></div>`;
    return `<a href="${it.h}">${ic}${esc(it.t)}</a>`;
  }).join('');
  return `<li class="mm-group"><button class="mm-top" type="button">${m.label}${chevD}</button><div class="mm-sub">${subs}</div></li>`;
}).join('') + `<a class="pill wide mm-cta" href="${H('#contact')}">Leave a request</a>`;
function setMenu(on) { mMenu.classList.toggle('open', on); document.body.classList.toggle('menu-open', on); mMenu.setAttribute('aria-hidden', String(!on)); }
burger.addEventListener('click', () => setMenu(!mMenu.classList.contains('open')));
mMenu.addEventListener('click', e => {
  const top = e.target.closest('.mm-top');
  if (top) { top.parentElement.classList.toggle('open'); return; }
  const tg = e.target.closest('[data-toggle]');
  if (tg) { e.preventDefault(); tg.parentElement.classList.toggle('open'); return; }
  const a = e.target.closest('a'); if (!a) return;
  const h = a.getAttribute('href');
  if (h && h.startsWith('#')) {
    e.preventDefault(); setMenu(false);
    const t = h.length > 1 && document.querySelector(h);
    if (t) setTimeout(() => t.scrollIntoView({ behavior: 'smooth' }), 200);
  }
});
addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
addEventListener('resize', () => { if (innerWidth > 767) setMenu(false); });

/* in-page links on the home page (e.g. #contact) scroll smoothly */
document.getElementById('navLinks').addEventListener('click', e => {
  const a = e.target.closest('a'); if (!a) return;
  const h = a.getAttribute('href');
  if (h && h.startsWith('#')) {
    e.preventDefault();
    const t = h.length > 1 && document.querySelector(h);
    if (t) t.scrollIntoView({ behavior: 'smooth' });
    document.activeElement && document.activeElement.blur();
  }
});

/* header hides on scroll down / returns on scroll up */
const nav = document.getElementById('nav');
let lastY = 0;
addEventListener('scroll', () => {
  const y = scrollY;
  nav.classList.toggle('solid', y > 80);
  lastY = y;
}, { passive: true });
