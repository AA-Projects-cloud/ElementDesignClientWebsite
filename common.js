// Shared site chrome: top bar with a dropdown menu, footer, cookie notice.
// Loaded on every page (home + inner pages).

const here = location.pathname.split('/').pop() || 'index.html';
const onHome = here === 'index.html';
const H = h => (h.startsWith('#') && !onHome ? 'index.html' + h : h);
const esc = t => t.replace(/&/g, '&amp;');
const IG = 'https://www.instagram.com/the_element_designs?rpxt=Y3h3NmVkMjdmZGI4';
const BRAND = '<img src="logo.png" alt="">ELEMENT DESIGN<sup>®</sup>';

/* ---------- menu data ---------- */
const S = (slug, label) => [label, `service.html?s=${slug}`];
const MENU = [
  { title: 'About', items: [['About Us', 'about.html'], ['Career', 'career.html'], ['Blog', 'blog.html']] },
  { title: 'Portfolio', items: [['All projects', 'portfolio.html'], ['Architectural design', 'portfolio.html?c=architectural-design'], ['Interior design', 'portfolio.html?c=residential-interiors'], ['Commercial interiors', 'portfolio.html?c=commercial-interiors']] },
  { title: 'Services', items: [
    ['All services', 'services.html'], S('architecture', 'Architecture'),
    { t: 'Interiors', sub: [S('interior', 'Interiors'), S('villas', 'Villas'), S('private-houses', 'Private houses'), S('residences', 'Residences'), S('cottages', 'Cottages'), S('mansions', 'Mansions'), S('penthouses', 'Penthouses'), S('apartments', 'Apartments')] },
    { t: 'For business', sub: [S('commercial-interior', 'For business'), S('hotels', 'Hotels'), S('restaurants', 'Restaurants'), S('resorts', 'Resorts'), S('offices', 'Offices'), S('spa-wellness', 'Spa & Wellness'), S('common-areas', 'Common areas'), S('bars', 'Bars')] },
    S('bim', 'Bim engineering'), S('design-supervision', 'Design supervision'), S('construction-management', 'Construction management'), S('procurement', 'Procurement')] },
  { title: 'Contacts', href: H('#contact') }
];
const link = (it, cls = 'si') => `<li><a class="${cls}" href="${it[1]}">${esc(it[0])}</a></li>`;
const group = (title, inner, cls = '') => `<li class="g ${cls}"><button class="${cls ? 'si' : 'mi'}" type="button" aria-expanded="false">${esc(title)}${cls ? '<span class="pl">+</span>' : ''}</button><div class="sub-wrap"><ul class="sub">${inner}</ul></div></li>`;
const menuItems = MENU.map(m => {
  if (m.href) return `<li><a class="mi" href="${m.href}">${m.title}</a></li>`;
  return group(m.title, m.items.map(it => Array.isArray(it) ? link(it) : group(it.t, it.sub.map(s => link(s, 'si s2')).join(''), 'g2')).join(''));
}).join('');

/* ---------- top bar (brand + MENU dropdown) ---------- */
if (!document.getElementById('bar')) {
  document.body.insertAdjacentHTML('afterbegin', `
<header class="bar" id="bar">
  <a class="brand" href="index.html" aria-label="Element Design">${BRAND}</a>
  <div class="menu-wrap">
    <button class="menu-btn" id="menuBtn" type="button" aria-expanded="false" aria-controls="site-menu">MENU <i aria-hidden="true"><b></b><b></b><b></b><b></b></i></button>
    <div class="site-menu" id="site-menu" data-lenis-prevent><div class="sm-inner"><ul>${menuItems}</ul></div></div>
  </div>
</header>`);
}
const bar = document.getElementById('bar');
const menuBtn = document.getElementById('menuBtn');
const siteMenu = document.getElementById('site-menu');
const setMenu = on => {
  siteMenu.classList.toggle('open', on);
  menuBtn.setAttribute('aria-expanded', String(on));
  if (!on) siteMenu.querySelectorAll('.g.open').forEach(g => { g.classList.remove('open'); g.firstElementChild.setAttribute('aria-expanded', 'false'); });
  window.dispatchEvent(new CustomEvent('menu:toggle', { detail: on }));
};
menuBtn.addEventListener('click', e => { e.stopPropagation(); setMenu(!siteMenu.classList.contains('open')); });
siteMenu.addEventListener('click', e => {
  const b = e.target.closest('button.mi, button.si');
  if (b) {                                               // open / close a sub-list
    const g = b.parentElement, open = !g.classList.contains('open');
    const peers = g.parentElement.children;
    [...peers].forEach(p => { if (p !== g && p.classList.contains('g')) { p.classList.remove('open'); p.firstElementChild.setAttribute('aria-expanded', 'false'); } });
    g.classList.toggle('open', open); b.setAttribute('aria-expanded', String(open));
    return;
  }
  const a = e.target.closest('a'); if (!a) return;
  const h = a.getAttribute('href');
  if (h && h.startsWith('#')) {                          // same-page anchor (home)
    e.preventDefault(); setMenu(false);
    const t = h.length > 1 && document.querySelector(h);
    if (t) setTimeout(() => t.scrollIntoView({ behavior: 'smooth' }), 300);
  } else setMenu(false);
});
document.addEventListener('click', e => { if (siteMenu.classList.contains('open') && !e.target.closest('.menu-wrap')) setMenu(false); });
addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
window.__setMenu = setMenu;

/* ---------- footer ---------- */
if (!document.querySelector('footer.site-footer')) {
  const f = document.createElement('footer');
  f.className = 'site-footer';
  f.innerHTML = `
  <div class="foot-card">
    <div class="foot-top"><b>ELEMENT DESIGN ®</b><span>Premium architectural and interior design</span></div>
    <div class="foot-mid">
      <div><div class="foot-big">Element Design<sup>®</sup></div><p>Leading international bureau for premium architectural and interior design</p></div>
      <div class="foot-cols">
        <div><span class="label">Explore</span><a href="about.html">About Us</a><a href="portfolio.html">Portfolio</a><a href="services.html">Services</a><a href="career.html">Career</a><a href="blog.html">Blog</a><a href="${H('#contact')}">Contacts</a></div>
        <div><span class="label">Follow</span><a href="${IG}" target="_blank" rel="noopener noreferrer">Instagram</a><span class="label" style="margin-top:22px">Studio</span><span class="t">Mumbai, India</span></div>
      </div>
    </div>
    <div class="foot-bot"><span><i class="dot"></i>© <span id="yr"></span> Element Design. All rights reserved.</span><button type="button" id="toTop">Back to top ↑</button></div>
  </div>`;
  (document.querySelector('main') || document.body).appendChild(f);
}
const yr = document.getElementById('yr'); if (yr) yr.textContent = new Date().getFullYear();
document.getElementById('toTop')?.addEventListener('click', () => {
  if (window.__lenis) window.__lenis.scrollTo(0, { duration: 1.6 }); else scrollTo({ top: 0, behavior: 'smooth' });
});

/* ---------- letter-roll hover (CSS only): every character slides up and is replaced ---------- */
function letterRoll(el) {
  if (el.dataset.hr) return;
  const node = [...el.childNodes].find(n => n.nodeType === 3 && n.textContent.trim());
  if (!node) return;
  const txt = node.textContent.trim();
  const wrap = document.createElement('span'); wrap.className = 'hr'; wrap.setAttribute('aria-label', txt);
  [...txt].forEach((c, i) => {
    const ch = document.createElement('span'); ch.className = 'hr-ch'; ch.setAttribute('aria-hidden', 'true'); ch.style.setProperty('--i', i);
    const a = c === ' ' ? ' ' : c;
    ch.innerHTML = `<i>${a}</i><i>${a}</i>`; wrap.appendChild(ch);
  });
  node.replaceWith(wrap);
  el.classList.add('hr-host'); el.dataset.hr = '1';
}
document.querySelectorAll('.mi, .si, .ulink, .foot-cols a, .cats a, .chips a, .back').forEach(letterRoll);
new MutationObserver(() => document.querySelectorAll('.ulink:not([data-hr]), .cats a:not([data-hr]), .chips a:not([data-hr]), .back:not([data-hr])').forEach(letterRoll))
  .observe(document.body, { childList: true, subtree: true });

/* ---------- cookie ---------- */
if (!document.getElementById('cookie')) {
  document.body.insertAdjacentHTML('beforeend', '<div class="cookie" id="cookie">This website uses Cookies. <button id="accept">Accept</button></div>');
  document.getElementById('accept').onclick = () => document.getElementById('cookie').classList.add('gone');
}
