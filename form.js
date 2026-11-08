// Contact form: Cloudflare Turnstile spam protection + honeypot, server-side check in /api/contact, then the thank-you page.
import { TURNSTILE_SITE_KEY } from './config.js';

let tsReady = null;
const loadTurnstile = () => tsReady || (tsReady = new Promise((resolve, reject) => {
  if (window.turnstile) { resolve(window.turnstile); return; }
  const s = document.createElement('script');
  s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
  s.async = true; s.defer = true;
  s.onload = () => resolve(window.turnstile);
  s.onerror = reject;
  document.head.appendChild(s);
}));

export function initForm() {
  const form = document.getElementById('form');
  if (!form) return;
  const note = document.getElementById('note');
  const slot = form.querySelector('.cf-slot');
  const btn = form.querySelector('button[type="submit"]');
  const defaultNote = note ? note.innerHTML : '';
  let widget = null;

  if (slot) loadTurnstile().then(t => { widget = t.render(slot, { sitekey: TURNSTILE_SITE_KEY, theme: 'light', size: 'flexible' }); }).catch(() => {});

  const say = (msg, bad) => { if (note) { note.textContent = msg; note.classList.toggle('bad', !!bad); } };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
    const token = window.turnstile && widget !== null ? window.turnstile.getResponse(widget) : '';
    if (!token && !local) { say('Please complete the security check below, then press send again.', true); return; }
    btn.disabled = true; say('Sending…');
    try {
      let ok = local;                                                   // no server runs on a local preview
      if (!local) {
        const r = await fetch('/api/contact', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: data.name, phone: data.phone, website: data.website || '', token, page: location.pathname + location.search })
        });
        ok = r.ok;
      }
      if (!ok) throw new Error('rejected');
      if (window.gtag) window.gtag('event', 'generate_lead', { event_category: 'contact_form', event_label: location.pathname });
      location.href = 'thank-you.html';
    } catch (err) {
      say('Sorry, the request could not be sent. Please try again in a moment.', true);
      if (window.turnstile && widget !== null) window.turnstile.reset(widget);
      btn.disabled = false;
    }
  });
  if (note) note.dataset.default = defaultNote;
}
