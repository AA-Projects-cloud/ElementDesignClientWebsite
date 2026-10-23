/* ================= page behaviour ================= */
// nav: hide on scroll down, show on scroll up
const nav = document.getElementById('nav');
let lastY = 0;
addEventListener('scroll', () => {
  const y = scrollY;
  nav.classList.toggle('solid', y > 80);
  lastY = y;
}, { passive: true });

// reveal + count-up
const fmt = (n, f) => f === 'space' ? n.toLocaleString('en-US').replace(/,/g, ' ') : String(n);
function countUp(el) {
  const end = +el.dataset.count, t0 = performance.now(), f = el.dataset.fmt;
  const step = now => {
    const k = Math.min((now - t0) / 1800, 1);
    el.textContent = fmt(Math.round(end * (1 - Math.pow(1 - k, 3))), f);
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
const io = new IntersectionObserver(entries => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    e.target.classList.add('in');
    if (e.target.dataset.count) countUp(e.target);
    e.target.querySelectorAll('[data-count]').forEach(countUp);
    io.unobserve(e.target);
  }
}, { threshold: 0.2 });
document.querySelectorAll('.reveal,[data-count]').forEach(el => io.observe(el));

// draggable portfolio rail
const rail = document.getElementById('rail');
let down = false, sx = 0, sl = 0;
let moved = 0;
rail.addEventListener('pointerdown', e => { down = true; moved = 0; sx = e.clientX; sl = rail.scrollLeft; rail.style.scrollSnapType = 'none'; });
addEventListener('pointerup', () => { down = false; rail.style.scrollSnapType = ''; });
addEventListener('pointermove', e => { if (down) { moved = Math.max(moved, Math.abs(e.clientX - sx)); rail.scrollLeft = sl - (e.clientX - sx); } });
rail.addEventListener('click', e => { if (moved > 6) e.preventDefault(); });

// misc
document.getElementById('accept').onclick = () => document.getElementById('cookie').classList.add('gone');
const _yr = document.getElementById('yr'); if (_yr) _yr.textContent = new Date().getFullYear();
document.getElementById('form').addEventListener('submit', e => {
  e.preventDefault();
  document.getElementById('note').textContent = 'Thank you — our manager will contact you shortly.';
  e.target.reset();
});


/* ================= service modals ================= */
const MODALS = [
  { title: 'Element Design takes over the <em>full cycle of the project implementation</em>', lead: 'The studio team manages:',
    list: ['architectural design', 'interior design', 'engineering solutions'],
    text: 'You get a fully implemented project without having to dive into technical processes',
    cta: 'Discuss the implementation of your project', img: 'drawings.jpg' },
  { title: 'From the moment the project starts, you will be assigned a <em>personal Element Design expert</em>',
    text: 'They coordinate the work of architects, designers and engineers so that every decision within the project works as part of one unified system',
    lead: 'A dedicated expert helps to:',
    list: ['develop the concept of the home', 'define the architectural style', 'align key project decisions', 'oversee the implementation timeline'],
    text2: 'This approach lets you keep your usual pace of life while the Element Design team manages the project',
    cta: 'Discuss your project', img: 'meeting.jpg' },
  { title: 'Every Element Design project is <em>created exclusively for you</em>', lead: 'Your design begins with:',
    list: ['individual sketches', 'your lifestyle scenarios', 'your taste and chosen references'],
    text: 'Nothing is taken from a catalogue: every space is drawn around the way you live',
    cta: 'Discuss the design of your future home', img: 'interiors.jpg' },
  { title: '<em>Each Element Design project</em> goes through a well-defined system of stages',
    text: 'You always understand the current stage of the project and the next steps',
    stages: [['Technical specification', 'Discussion and preparation of the brief, then handover of documentation to launch the project'],
             ['Planning solution', 'Several layout options that account for the site, life scenarios and functional needs'],
             ['Selection of references', 'Styles, materials and moodboards agreed with you before drawing begins'],
             ['3D visualization', 'Realistic renders so you can see the result before construction'],
             ['Working documentation', 'Complete drawings and specifications for builders and suppliers'],
             ['Author supervision', 'We visit the site and keep the build true to the design']],
    cta: 'Discuss your project' },
  { title: 'Element Design clients get access to the <em>project reporting system</em> from anywhere in the world', lead: 'You can:',
    list: ['monitor the progress of construction', 'receive photos and videos from the site', 'receive regular reports'],
    text: 'This lets you control the project regardless of which country you are in.',
    cta: 'Discuss the design of your future home', img: 'construction.jpg' },
  { title: 'We prepare a <em>clear budgeting system</em> for your project', lead: 'Based on:',
    list: ['the area of the property', 'the level of individualization', 'the composition of services'],
    text: 'After the first meeting with your personal expert, you will receive a detailed commercial proposal with a complete budget structure.',
    cta: 'Schedule a first meeting with a project expert', img: 'schedule.jpg' }
];
const ic = d => `<svg viewBox="0 0 40 40" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">${d}</svg>`;
const STAGE_ICONS = [
  ic('<rect x="8" y="5" width="24" height="30" rx="3"/><path d="M13 13h14M13 19h14M13 25h9"/>'),
  ic('<path d="M5 20 20 7l15 13"/><path d="M9 18v16h22V18"/><path d="M17 34V24h6v10"/>'),
  ic('<path d="M20 5l4.5 10 10.5 1-8 7 2.5 10.5L20 28l-9.5 5.5L13 23l-8-7 10.5-1z"/>'),
  ic('<rect x="7" y="6" width="26" height="28" rx="3"/><path d="M13 14h8M13 20h14M13 26h14"/><circle cx="27" cy="14" r="2"/>'),
  ic('<path d="M7 29V9h18l8 8v12z"/><path d="M25 9v8h8M12 24h14"/>'),
  ic('<path d="M20 5l14 8v14l-14 8-14-8V13z"/><path d="M6 13l14 8 14-8M20 21v14"/>')
];
const modal = document.getElementById('modal'), mBody = document.getElementById('m-body');
let lastFocus = null;
function openModal(i) {
  const m = MODALS[i];
  let h = `<h2 class="m-title" id="m-title">${m.title}</h2>`;
  if (m.stages) {
    h += `<p class="m-lead">${m.text}</p><div class="m-flow">` + m.stages.map((s, n) => `<div class="f-node" style="--n:${n}"><i>${STAGE_ICONS[n]}</i><h4>${s[0]}</h4><span>${s[1]}</span></div>`).join('') + '<div class="f-arc" aria-hidden="true"></div></div>';
  } else {
    if (m.text && m.lead && i === 1) h += `<p class="m-lead">${m.text}</p>`;
    if (m.lead) h += `<p class="m-lead">${m.lead}</p>`;
    if (m.list) h += '<ul class="m-list">' + m.list.map(x => `<li>${x}</li>`).join('') + '</ul>';
    const t = i === 1 ? m.text2 : m.text;
    if (t) h += `<p class="m-text">${t}</p>`;
  }
  h += `<button class="m-cta" type="button">${m.cta}</button>`;
  if (m.img) h += `<img class="m-img" src="${m.img}" alt="">`;
  mBody.innerHTML = h;
  mBody.querySelector('.m-cta').onclick = () => { closeModal(); document.getElementById('contact').scrollIntoView({ behavior: 'smooth' }); };
  modal.querySelector('.m-box').classList.toggle('m-wide', !!m.stages);
  lastFocus = document.activeElement;
  modal.hidden = false;
  document.body.classList.add('lock');
  requestAnimationFrame(() => modal.classList.add('open'));
  document.getElementById('m-close').focus();
}
function closeModal() {
  modal.classList.remove('open');
  document.body.classList.remove('lock');
  setTimeout(() => { modal.hidden = true; }, 300);
  if (lastFocus) lastFocus.focus();
}
document.querySelectorAll('.s-card[data-modal]').forEach(c => {
  c.addEventListener('click', () => openModal(+c.dataset.modal));
  c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(+c.dataset.modal); } });
});
document.getElementById('m-close').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
