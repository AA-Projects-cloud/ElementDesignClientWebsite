// Helpers shared by the inner pages (about, career, blog, portfolio, services ...)

export const back = (href = 'index.html', label = 'Home') =>
  `<a class="back" href="${href}"><svg viewBox="0 0 6 10"><path d="M5 1L1 5l4 4"/></svg>${label}</a>`;

export function hero({ title, sub = '', img, pos = 'center', video, cta, ctaHref = '#contact', backHref, backLabel }) {
  return `<section class="inner-hero${video ? ' has-video' : ''}" style="background-image:url('${img}');background-position:${pos}">
    ${video ? `<video class="hero-bg" src="${video}" poster="${img}" autoplay muted loop playsinline preload="auto" aria-hidden="true"></video>` : ''}
    ${back(backHref, backLabel)}
    <h1>${title}</h1>
    ${sub ? `<p class="sub">${sub}</p>` : ''}
    ${cta ? `<a class="pill" href="${ctaHref}">${cta}</a>` : ''}
  </section>`;
}

export const process = () => `
  <section class="blk process"><div class="wrap">
    <h2 class="center reveal">LEARN MORE ABOUT <em>CREATING YOUR DREAM PROJECT</em> FROM YOUR PERSONAL EXPERT</h2>
    <div class="three">
      <div class="step reveal"><b>1</b><h3>FILL OUT THE FORM</h3><p>Provide your name and current phone number</p></div>
      <div class="step reveal d1"><b>2</b><h3>WE WILL CONTACT YOU</h3><p>Our personal expert will discuss your project's requirements and introduce you to our approach</p></div>
      <div class="step reveal d2"><b>3</b><h3>RECEIVE A TAILORED OFFER</h3><p>After a detailed review of your wishes, we will prepare a personalized project plan</p></div>
    </div></div></section>`;

export const contact = (title = 'TAKE A STEP INTO THE WORLD OF <em>ELEMENT DESIGN ®</em>') => `
  <section class="blk"><div class="wrap">
    <div class="contact" id="contact">
      <div class="contact-img reveal"></div>
      <div class="reveal d1">
        <h2>${title}</h2>
        <p class="muted">A place where your ideas take shape in our studio's original designs. Leave your contact details and our manager will reach out to discuss your project.</p>
        <form id="form">
          <p class="f-label">Fill out the form and our manager will contact you</p>
          <label class="f-field"><input name="name" placeholder="Your name" required autocomplete="name"></label>
          <div class="f-field f-phone"><span class="f-code">IN (+91)</span><input name="phone" type="tel" placeholder="98765 43210" required autocomplete="tel-national" inputmode="tel" pattern="[0-9 ]{10,12}"></div>
          <button class="pill wide" type="submit">Request a manager's consultation</button>
          <small id="note">By clicking the “Send” button, I accept the <a href="#">privacy policy</a> terms</small>
        </form>
      </div>
    </div></div></section>`;

export function boot() {
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
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal,[data-count]').forEach(el => io.observe(el));
  const form = document.getElementById('form');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    document.getElementById('note').textContent = 'Thank you — our manager will contact you shortly.';
    e.target.reset();
  });
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const t = id.length > 1 && document.querySelector(id);
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
  }));
}
