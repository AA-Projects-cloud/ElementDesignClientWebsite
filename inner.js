// Helpers shared by the inner pages (about, career, blog, portfolio, services ...)
import { initForm } from './form.js';

export const back = (href = 'index.html', label = 'Home') =>
  `<a class="back" href="${href}"><svg viewBox="0 0 6 10"><path d="M5 1L1 5l4 4"/></svg>${label}</a>`;

export function hero({ title, sub = '', img, pos = 'center', video, cta, ctaHref = '#contact', backHref, backLabel }) {
  return `<section class="inner-hero${video ? ' has-video' : ''}" style="background-image:url('${img}');background-position:${pos}">
    ${video ? `<video class="hero-bg" src="${video}" poster="${img}" autoplay muted loop playsinline preload="auto" aria-hidden="true"></video>` : ''}
    ${back(backHref, backLabel)}
    <span class="label ih-label">Element Design ®</span>
    <h1>${title}</h1>
    ${sub ? `<p class="sub">${sub}</p>` : ''}
    ${cta ? `<a class="ulink" href="${ctaHref}">${cta} <span>→</span></a>` : ''}
  </section>`;
}

export const process = () => `
  <section class="blk process"><div class="wrap">
    <h2 class="reveal">LEARN MORE ABOUT <em>CREATING YOUR DREAM PROJECT</em> FROM YOUR PERSONAL EXPERT</h2>
    <ol class="rows">
      <li class="reveal"><span class="no">01</span><h3>Fill out the form</h3><p>Provide your name and current phone number</p></li>
      <li class="reveal"><span class="no">02</span><h3>We will contact you</h3><p>Our personal expert will discuss your project's requirements and introduce you to our approach</p></li>
      <li class="reveal"><span class="no">03</span><h3>Receive a tailored offer</h3><p>After a detailed review of your wishes, we will prepare a personalized project plan</p></li>
    </ol></div></section>`;

export const contact = (title = 'TAKE A STEP INTO THE WORLD OF <em>ELEMENT DESIGN ®</em>') => `
  <section class="blk"><div class="wrap">
    <div class="contact" id="contact">
      <div class="contact-img" role="img" aria-label="An Element Design interior by the studio"></div>
      <div>
        <h2>${title}</h2>
        <p class="muted">A place where your ideas take shape in our studio's original designs. Leave your contact details and our manager will reach out to discuss your project.</p>
        <form id="form">
          <p class="f-label">Fill out the form and our manager will contact you</p>
          <label class="f-field"><input name="name" placeholder="Your name" required autocomplete="name"></label>
          <div class="f-field f-phone"><span class="f-code">IN (+91)</span><input name="phone" type="tel" placeholder="98765 43210" required autocomplete="tel-national" inputmode="tel" pattern="[0-9 ]{10,12}"></div>
          <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
          <div class="cf-slot"></div>
          <button class="pill wide" type="submit">Request a manager's consultation</button>
          <small id="note">By clicking the “Send” button, I accept the <a href="privacy-policy.html">privacy policy</a> terms</small>
        </form>
      </div>
    </div></div></section>`;

export function boot() {
  initForm();
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const t = id.length > 1 && document.querySelector(id);
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
  }));
}
