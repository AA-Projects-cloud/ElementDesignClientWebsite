// Shared site chrome: top bar, full-screen menu, footer, cookie notice.
// Loaded on every page (home + inner pages).

const here = location.pathname.split('/').pop() || 'index.html';
const onHome = here === 'index.html';
const H = h => (h.startsWith('#') && !onHome ? 'index.html' + h : h);
const esc = t => t.replace(/&/g, '&amp;');
const IG = 'https://www.instagram.com/the_element_designs?rpxt=Y3h3NmVkMjdmZGI4';
const BRAND = '<img src="logo.png" alt="">ELEMENT DESIGN<sup>®</sup>';

/* ---------- top bar ---------- */
if (!document.getElementById('bar')) {
  document.body.insertAdjacentHTML('afterbegin', `
<header class="bar" id="bar">
  <a class="brand" href="index.html" aria-label="Element Design">${BRAND}</a>
  <button class="menu-btn" id="menuBtn" type="button" aria-haspopup="dialog" aria-controls="menu">MENU <i aria-hidden="true"><b></b><b></b><b></b><b></b></i></button>
</header>`);
}

/* ---------- menu data ---------- */
const S = (slug, label) => [label, `service.html?s=${slug}`];
const MENU = [
  { title: 'About', href: 'about.html', items: [['About Us', 'about.html'], ['Career', 'career.html'], ['Blog', 'blog.html']] },
  { title: 'Portfolio', href: 'portfolio.html', items: [['All projects', 'portfolio.html'], ['Architectural design', 'portfolio.html?c=architectural-design'], ['Interior design', 'portfolio.html?c=residential-interiors'], ['Commercial interiors', 'portfolio.html?c=commercial-interiors']] },
  { title: 'Services', href: 'services.html', items: [
    ['All services', 'services.html'], S('architecture', 'Architecture'),
    { t: 'Interiors', sub: [S('interior', 'Interiors'), S('villas', 'Villas'), S('private-houses', 'Private houses'), S('residences', 'Residences'), S('cottages', 'Cottages'), S('mansions', 'Mansions'), S('penthouses', 'Penthouses'), S('apartments', 'Apartments')] },
    { t: 'For business', sub: [S('commercial-interior', 'For business'), S('hotels', 'Hotels'), S('restaurants', 'Restaurants'), S('resorts', 'Resorts'), S('offices', 'Offices'), S('spa-wellness', 'Spa & Wellness'), S('common-areas', 'Common areas'), S('bars', 'Bars')] },
    S('bim', 'Bim engineering'), S('design-supervision', 'Design supervision'), S('construction-management', 'Construction management'), S('procurement', 'Procurement')] },
  { title: 'Contacts', href: H('#contact'), items: [['Leave a request', H('#contact')], ['Instagram', IG, true]] }
];
const col = m => `<div class="menu-col"><span class="label">0${MENU.indexOf(m) + 1}</span><h3><a href="${m.href}">${m.title}</a></h3><ul>` + m.items.map(it => {
  if (Array.isArray(it)) return `<li><a href="${it[1]}"${it[2] ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(it[0])}</a></li>`;
  return `<li class="grp"><button type="button">${esc(it.t)}<span class="plus">+</span></button><ul>${it.sub.map(s => `<li><a href="${s[1]}">${esc(s[0])}</a></li>`).join('')}</ul></li>`;
}).join('') + '</ul></div>';

/* ---------- menu overlay ---------- */
if (!document.getElementById('menu')) {
  document.body.insertAdjacentHTML('beforeend', `
<div class="menu" id="menu" role="dialog" aria-modal="true" aria-label="Menu" aria-hidden="true" data-lenis-prevent>
  <div class="menu-top"><a class="brand" href="index.html">${BRAND}</a>
    <button class="menu-close" id="menuClose" type="button">CLOSE <svg viewBox="0 0 12 12"><path d="M1 1l10 10M11 1L1 11"/></svg></button></div>
  <div class="menu-cols">${MENU.map(col).join('')}</div>
  <div class="menu-foot"><span>Element Design ®</span><a href="${IG}" target="_blank" rel="noopener noreferrer">Instagram</a><span>Leading international bureau for premium architectural and interior design</span></div>
</div>`);
}
const menu = document.getElementById('menu');
const setMenu = on => {
  menu.classList.toggle('open', on);
  document.body.classList.toggle('menu-open', on);
  menu.setAttribute('aria-hidden', String(!on));
  window.dispatchEvent(new CustomEvent('menu:toggle', { detail: on }));
};
document.getElementById('menuBtn').addEventListener('click', () => setMenu(true));
document.getElementById('menuClose').addEventListener('click', () => setMenu(false));
addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
menu.addEventListener('click', e => {
  const g = e.target.closest('.grp > button');
  if (g) { g.parentElement.classList.toggle('open'); return; }
  const a = e.target.closest('a'); if (!a) return;
  const h = a.getAttribute('href');
  if (h && h.startsWith('#')) {                      // same-page anchor (home)
    e.preventDefault(); setMenu(false);
    const t = h.length > 1 && document.querySelector(h);
    if (t) setTimeout(() => t.scrollIntoView({ behavior: 'smooth' }), 450);
  } else if (!a.target) setMenu(false);
});
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

/* ---------- cookie ---------- */
if (!document.getElementById('cookie')) {
  document.body.insertAdjacentHTML('beforeend', '<div class="cookie" id="cookie">This website uses Cookies. <button id="accept">Accept</button></div>');
  document.getElementById('accept').onclick = () => document.getElementById('cookie').classList.add('gone');
}
