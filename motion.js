/* =====================================================================
   Element Design — motion system
   GSAP + ScrollTrigger + Lenis (loaded from a CDN in each page).
   Loaded as the LAST module on every page so all content already exists.
   If anything is unavailable the page falls back to its static layout
   (the `motion` class is removed from <html>).
   ===================================================================== */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const { gsap, ScrollTrigger: ST, Lenis } = window;
  const loader = document.getElementById('loader');

  if (reduce || !gsap || !ST || !Lenis) {
    root.classList.remove('motion');
    if (loader) loader.remove();
    return;
  }
  gsap.registerPlugin(ST);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const EXPO = 'expo.out';
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isHome = !!$('.hero');
  const inHero = e => e.closest('.hero, .inner-hero');

  /* ------------------------------------------------------------ smooth scroll */
  const lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, touchMultiplier: 1.4 });
  window.__lenis = lenis;
  lenis.on('scroll', ST.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
  let loading = true;

  Element.prototype.scrollIntoView = function () { lenis.scrollTo(this, { offset: -40, duration: 1.5 }); };
  const syncLock = () => {
    const b = document.body.classList;
    if (b.contains('lock') || b.contains('menu-open')) lenis.stop();
    else if (!loading) lenis.start();
  };
  new MutationObserver(syncLock).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  /* -------------------------------------------------------------- split text */
  function splitText(el, mode = 'words') {
    if (el._split) return el._split;
    const words = [], chars = [];
    const walk = (src, dst) => src.childNodes.forEach(n => {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(tok => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) { dst.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'); w.className = 'w';
          const wi = document.createElement('span'); wi.className = 'wi';
          if (mode === 'chars') [...tok].forEach(c => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; wi.appendChild(s); chars.push(s); });
          else wi.textContent = tok;
          w.appendChild(wi); dst.appendChild(w); words.push(wi);
        });
      } else if (n.nodeType === 1) {
        if (n.tagName === 'BR') { dst.appendChild(n.cloneNode()); return; }
        const c = n.cloneNode(false); dst.appendChild(c); walk(n, c);
      }
    });
    const label = el.textContent.replace(/\s+/g, ' ').trim();
    const frag = document.createDocumentFragment(); walk(el, frag);
    el.textContent = ''; el.appendChild(frag);
    el.setAttribute('aria-label', label); el.dataset.split = mode;
    return (el._split = { words, chars });
  }
  const lineDelays = (words, perLine = .1, perWord = .02) => {
    let line = -1, last = -1e9, k = 0;
    return words.map(w => {
      const top = Math.round(w.parentElement.getBoundingClientRect().top);
      if (Math.abs(top - last) > 4) { line++; last = top; k = 0; }
      return line * perLine + (k++) * perWord;
    });
  };
  function textIn(el, { mode = 'words', dur = 1.15, start = 'top 88%', delay = 0, immediate = false, stagger = .03 } = {}) {
    const s = splitText(el, mode), items = mode === 'chars' ? s.chars : s.words;
    gsap.set(items, { yPercent: 118 });
    const play = () => {
      const d = mode === 'chars' ? null : lineDelays(items);
      gsap.to(items, { yPercent: 0, duration: dur, ease: EXPO, delay: mode === 'chars' ? delay : i => delay + d[i], stagger: mode === 'chars' ? stagger : 0 });
    };
    if (!immediate) ST.create({ trigger: el, start, once: true, onEnter: play });
    return play;
  }

  /* --------------------------------------------------------- image wrappers */
  function wrapBg(el) {
    if (el._px) return el._px;
    const cs = getComputedStyle(el);
    if (cs.backgroundImage === 'none') return null;
    const px = document.createElement('div'); px.className = 'px';
    px.style.backgroundImage = cs.backgroundImage;
    px.style.backgroundSize = cs.backgroundSize === 'auto' ? 'cover' : cs.backgroundSize;
    px.style.backgroundPosition = cs.backgroundPosition;
    el.style.backgroundImage = 'none';
    el.classList.add('has-px');
    el.insertBefore(px, el.firstChild);
    return (el._px = px);
  }
  function imageMotion(el, { reveal = true, par = 7 } = {}) {
    const px = wrapBg(el); if (!px) return;
    if (reveal) {
      const r = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
      gsap.set(el, { clipPath: `inset(12% 9% 12% 9% round ${r}px)` });
      gsap.set(px, { scale: 1.28 });
      ST.create({
        trigger: el, start: 'top 88%', once: true, onEnter: () => {
          gsap.to(el, { clipPath: `inset(0% 0% 0% 0% round ${r}px)`, duration: 1.5, ease: 'expo.inOut', clearProps: 'clipPath' });
          gsap.to(px, { scale: 1.04, duration: 1.9, ease: EXPO });
        }
      });
    } else gsap.set(px, { scale: 1.1 });
    gsap.fromTo(px, { yPercent: -par }, { yPercent: par, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  /* ----------------------------------------------------- generic (every page) */
  function setupGeneric() {
    const main = $('main') || document.body;
    const handled = new Set();

    // headings and paragraphs: masked reveals
    $$('h2', main).filter(e => !inHero(e) && !e.closest('.modal, .reel-copy')).forEach(h => textIn(h, { dur: 1.2 }));
    $$('.lead, .across-copy p, .dc-copy p, .steps-head p, .statement-rule p, .contact .muted, .foot-big + p', main)
      .filter(e => !inHero(e) && !e._split && !e.closest('.modal')).forEach(p => textIn(p, { dur: 1.1, start: 'top 90%' }));

    // groups: staggered rise
    const groups = [
      ['.spec', () => ({ y: 60 })],
      ['.rows li', () => ({ y: 50 })],
      ['.f-card', () => ({ y: 60 })],
      ['.step', () => ({ y: 60 })],
      ['.person', () => ({ y: 50 })],
      ['.tl-i', () => ({ x: -40 })],
      ['.b-card', () => ({ y: 80 })],
      ['.sv-card', () => ({ y: 70 })],
      ['.foot-cols > div', () => ({ y: 40 })],
      ['.dc-links a', () => ({ y: 20 })],
      ['.chips a, .cats a', () => ({ y: 20 })]
    ];
    groups.forEach(([sel, from]) => {
      const els = $$(sel, main).filter(e => !inHero(e) && !handled.has(e));
      if (!els.length) return;
      els.forEach((e, i) => { handled.add(e); gsap.set(e, { opacity: 0, ...from(i) }); });
      ST.batch(els, { start: 'top 92%', once: true, onEnter: b => gsap.to(b, { opacity: 1, x: 0, y: 0, duration: 1.15, ease: EXPO, stagger: .1, clearProps: 'transform,opacity' }) });
    });

    // images: mask reveal + parallax
    $$('.img-r, .contact-img, .b-img', main).filter(e => !inHero(e)).forEach(e => {
      if (e.classList.contains('b-img') && e.closest('.sv-card, .b-card')) imageMotion(e, { reveal: false, par: 6 });
      else imageMotion(e);
    });

    // remaining .reveal helpers (inner pages): fade up
    $$('.reveal', main).filter(e => !inHero(e) && !handled.has(e) && !e.dataset.split).forEach(e => {
      handled.add(e);
      gsap.set(e, { opacity: 0, y: 40 });
      ST.create({ trigger: e, start: 'top 90%', once: true, onEnter: () => gsap.to(e, { opacity: 1, y: 0, duration: 1.1, ease: EXPO, clearProps: 'transform,opacity' }) });
    });

    // article body
    const art = $$('.art > .art-meta, .art > .art-date, .art > p, .art > blockquote, .art > .src');
    if (art.length) {
      gsap.set(art, { opacity: 0, y: 36 });
      ST.batch(art, { start: 'top 92%', once: true, onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 1.1, ease: EXPO, stagger: .08, clearProps: 'transform,opacity' }) });
    }
    $$('.art figure img').forEach(img => {
      gsap.set(img, { clipPath: 'inset(12% 8% 12% 8% round 18px)', scale: 1.1 });
      ST.create({ trigger: img, start: 'top 88%', once: true, onEnter: () => gsap.to(img, { clipPath: 'inset(0% 0% 0% 0% round 18px)', scale: 1, duration: 1.5, ease: 'expo.inOut', clearProps: 'clipPath,transform' }) });
    });

    // cards that arrive: gentle scale
    $$('.cta-band, .contact, .darkcard, .foot-card', main).forEach(e => {
      gsap.fromTo(e, { scale: .94, y: 40 }, { scale: 1, y: 0, ease: 'none', scrollTrigger: { trigger: e, start: 'top 98%', end: 'top 55%', scrub: .6 } });
    });

    // footer wordmark
    const fb = $('.foot-big'); if (fb) textIn(fb, { mode: 'chars', stagger: .025, start: 'top 92%', dur: 1.3 });
  }

  /* ------------------------------------------------------------- home only */
  function setupHome() {
    // scattered projects drift at different speeds
    $$('.sc-img').forEach(el => {
      const sp = +el.dataset.sp || .1;
      gsap.set(el, { opacity: 0, scale: .84 });
      ST.create({ trigger: el, start: 'top 98%', once: true, onEnter: () => gsap.to(el, { opacity: 1, scale: 1, duration: 1.5, ease: EXPO }) });
      gsap.fromTo(el, { y: () => sp * innerHeight * 1.5 }, { y: () => -sp * innerHeight * 1.5, ease: 'none', scrollTrigger: { trigger: '.scatter', start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
    });

    // portfolio slider: frame grows into place, text rises on every change
    const frame = $('.reel-frame');
    if (frame) {
      gsap.fromTo(frame, { scale: .9, borderRadius: 44 }, { scale: 1, borderRadius: 16, ease: 'none', scrollTrigger: { trigger: '.reel', start: 'top 92%', end: 'top 18%', scrub: .5 } });
      const slides = $$('.reel-slide');
      const parts = slides.map(s => ({ h: splitText($('h2', s)).words, rest: $$('.label, .ulink', s) }));
      parts.forEach(p => { gsap.set(p.h, { yPercent: 118 }); gsap.set(p.rest, { opacity: 0, y: 18 }); });
      const play = i => {
        gsap.to(parts[i].h, { yPercent: 0, duration: 1.2, ease: EXPO, stagger: .06 });
        gsap.to(parts[i].rest, { opacity: 1, y: 0, duration: .9, ease: EXPO, stagger: .1, delay: .25 });
      };
      ST.create({ trigger: '.reel', start: 'top 55%', once: true, onEnter: () => play(0) });
      addEventListener('reel:change', e => {
        const { from, to } = e.detail;
        gsap.to(parts[from].h, { yPercent: -118, duration: .6, ease: 'expo.in' });
        gsap.set(parts[to].h, { yPercent: 118 });
        gsap.set(parts[to].rest, { opacity: 0, y: 18 });
        play(to);
      });
    }

    // statement: the inline thumbnail opens up
    const thumb = $('.statement .thumb');
    if (thumb) { gsap.set(thumb, { scaleX: 0, transformOrigin: 'left center' }); ST.create({ trigger: thumb, start: 'top 88%', once: true, onEnter: () => gsap.to(thumb, { scaleX: 1, duration: 1.4, ease: 'expo.inOut', delay: .1 }) }); }
    const rule = $('.statement-rule');
    if (rule) { gsap.set(rule.children, { opacity: 0, y: 40 }); ST.create({ trigger: rule, start: 'top 90%', once: true, onEnter: () => gsap.to(rule.children, { opacity: 1, y: 0, duration: 1.1, ease: EXPO, stagger: .12, clearProps: 'transform,opacity' }) }); }

    // pinned service step-through
    const steps = $('.steps');
    if (steps) {
      const items = $$('.step-item', steps), bgs = $$('.steps-bg .bg', steps), dots = $$('.steps-dots b', steps);
      const num = $('#stepNum'), track = $('.steps-track i', steps), N = items.length;
      let idx = 0;
      const show = i => {
        if (i === idx) return;
        items[idx].classList.remove('on'); bgs[idx].classList.remove('on'); dots[idx].classList.remove('on');
        idx = i;
        items[idx].classList.add('on'); bgs[idx].classList.add('on'); dots[idx].classList.add('on');
        num.textContent = '0' + (idx + 1);
        gsap.fromTo($$('.label, h3, p, .step-more', items[idx]), { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: EXPO, stagger: .07, overwrite: 'auto' });
        gsap.fromTo(num, { yPercent: 35, opacity: .2 }, { yPercent: 0, opacity: 1, duration: .8, ease: EXPO });
      };
      const dist = () => '+=' + Math.round(innerHeight * (N - 1) * .9);
      ST.create({
        trigger: steps, start: 'top top', end: dist, pin: true, scrub: true, anticipatePin: 1,
        onUpdate: self => { gsap.set(track, { scaleX: self.progress }); show(Math.min(N - 1, Math.floor(self.progress * N * .9999))); }
      });
      gsap.fromTo(bgs, { scale: 1.12 }, { scale: 1.02, ease: 'none', scrollTrigger: { trigger: steps, start: 'top top', end: dist, scrub: true } });
    }

    // dark recognition card: video drifts inside
    const dv = $('.dc-media video');
    if (dv) gsap.fromTo(dv, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.darkcard', start: 'top bottom', end: 'bottom top', scrub: true } });

    // India: slow push-in while the stage is pinned
    const photo = $('.across .photo');
    if (photo) {
      gsap.set(photo, { xPercent: -50, scale: 1.05, transformOrigin: '50% 55%' });
      gsap.to(photo, { scale: 1.22, ease: 'none', scrollTrigger: { trigger: '.across', start: 'top top', end: 'bottom bottom', scrub: true } });
      const pins = $$('.across .pin');
      gsap.set(pins, { opacity: 0 });
      ST.create({ trigger: '.across', start: 'top 40%', once: true, onEnter: () => gsap.to(pins, { opacity: 1, duration: 1, stagger: .2 }) });
    }

    // clients marquee follows the scroll speed
    const track = $('.track');
    if (track) {
      track.style.animation = 'none';
      let x = 0; const half = () => track.scrollWidth / 2;
      gsap.ticker.add(() => {
        const v = lenis.velocity || 0;
        x -= .8 + Math.min(Math.abs(v), 40) * .45 * (v < 0 ? -1 : 1);
        const h = half(); if (x <= -h) x += h; if (x > 0) x -= h;
        gsap.set(track, { x });
      });
    }

    // contact: background drifts, form rises
    const cb = $('.close .bg');
    if (cb) gsap.fromTo(cb, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.close', start: 'top bottom', end: 'bottom top', scrub: true } });
    const cf = $('.close-form');
    if (cf) { gsap.set(cf, { opacity: 0, y: 70 }); ST.create({ trigger: cf, start: 'top 92%', once: true, onEnter: () => gsap.to(cf, { opacity: 1, y: 0, duration: 1.3, ease: EXPO, clearProps: 'transform,opacity' }) }); }
  }

  /* ------------------------------------------------------------ hero intros */
  function prepareHeroes() {
    const bar = $('#bar');
    if (bar) gsap.set(bar, { opacity: 0, y: -24 });

    const home = $('.hero');
    if (home) {
      const vid = $('video', home), h1 = $('h1', home), links = $$('.hero-links a', home), caps = $$('.hero-caps span', home);
      gsap.set(vid, { scale: 1.2 });
      gsap.set(home, { clipPath: 'inset(6% 3% 6% 3% round 28px)' });
      const t1 = textIn(h1, { immediate: true, dur: 1.3 });
      gsap.set(links, { opacity: 0, y: 24 });
      gsap.set(caps, { opacity: 0, y: 16 });
      home._intro = () => {
        const tl = gsap.timeline();
        tl.to(home, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.8, ease: 'expo.inOut', clearProps: 'clipPath' }, 0)
          .to(vid, { scale: 1.02, duration: 2.4, ease: EXPO }, 0)
          .add(t1, .55)
          .to(links, { opacity: 1, y: 0, duration: 1, ease: EXPO, stagger: .12, clearProps: 'transform' }, 1.3)
          .to(caps, { opacity: 1, y: 0, duration: 1, ease: EXPO, stagger: .1, clearProps: 'transform' }, 1.5);
        return tl;
      };
      gsap.fromTo(vid, { yPercent: 0 }, { yPercent: 6, ease: 'none', immediateRender: false, scrollTrigger: { trigger: home, start: 'top top', end: 'bottom top', scrub: true } });
      gsap.fromTo('.hero-in', { yPercent: 0, opacity: 1 }, { yPercent: -22, opacity: 0, ease: 'none', immediateRender: false, scrollTrigger: { trigger: home, start: 'top top', end: '65% top', scrub: true } });
      gsap.fromTo('.hero-shade', { opacity: 1 }, { opacity: 1.7, ease: 'none', immediateRender: false, scrollTrigger: { trigger: '.flow', start: 'top bottom', end: 'top top', scrub: true } });
    }

    const inner = $('.inner-hero');
    if (inner) {
      const h1 = $('h1', inner), sub = $('.sub', inner), cta = $('.ulink', inner), back = $('.back', inner), lab = $('.ih-label', inner), vid = $('.hero-bg', inner);
      const target = vid || (wrapBg(inner), inner._px);
      gsap.set(target, { scale: 1.22 });
      gsap.set(inner, { clipPath: 'inset(5% 3% 5% 3% round 26px)' });
      const t1 = textIn(h1, { immediate: true, dur: 1.3 });
      const t2 = sub ? textIn(sub, { immediate: true, dur: 1.1 }) : null;
      gsap.set([back, cta, lab].filter(Boolean), { opacity: 0, y: 20 });
      inner._intro = () => {
        const tl = gsap.timeline();
        tl.to(inner, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.6, ease: 'expo.inOut', clearProps: 'clipPath' }, 0)
          .to(target, { scale: 1.03, duration: 2.2, ease: EXPO }, 0)
          .to([back, lab].filter(Boolean), { opacity: 1, y: 0, duration: .9, ease: EXPO, stagger: .1 }, .5)
          .add(t1, .6);
        if (t2) tl.add(t2, 1);
        if (cta) tl.to(cta, { opacity: 1, y: 0, duration: 1, ease: EXPO, clearProps: 'transform' }, 1.25);
        return tl;
      };
      gsap.fromTo(target, { yPercent: 0 }, { yPercent: 7, ease: 'none', immediateRender: false, scrollTrigger: { trigger: inner, start: 'top top', end: 'bottom top', scrub: true } });
      gsap.fromTo([h1, sub, lab].filter(Boolean), { yPercent: 0, opacity: 1 }, { yPercent: -16, opacity: 0, ease: 'none', immediateRender: false, scrollTrigger: { trigger: inner, start: '55% top', end: 'bottom top', scrub: true } });
    }
  }
  function playHero() {
    const bar = $('#bar');
    if (bar) gsap.to(bar, { opacity: 1, y: 0, duration: 1.2, ease: EXPO, delay: .6, clearProps: 'transform,opacity' });
    const h = $('.hero') || $('.inner-hero');
    if (h && h._intro) h._intro();
  }

  /* -------------------------------------------------------------- loader */
  function runLoader() {
    return new Promise(resolve => {
      if (!loader) { resolve(); return; }
      let seen = false;
      try { seen = !!sessionStorage.getItem('ed-seen'); sessionStorage.setItem('ed-seen', '1'); } catch (e) { /* private mode */ }
      const name = $('.ld-name', loader), cnt = $('.ld-count', loader), bar = $('.ld-line i', loader), row = $('.ld-row', loader);
      // wait only for what the first screen needs (fonts + the hero video's first frame), never for the whole page
      const media = $('.hero video, .inner-hero .hero-bg');
      const firstFrame = new Promise(r => { if (!media || media.readyState >= 2) r(); else media.addEventListener('loadeddata', r, { once: true }); });
      const ready = Promise.race([Promise.all([document.fonts ? document.fonts.ready : 0, firstFrame]), new Promise(r => setTimeout(r, seen ? 1400 : 3000))]);
      const lift = (dur, then) => gsap.to(loader, { yPercent: -100, duration: dur, ease: 'expo.inOut', onComplete: () => { loader.remove(); then && then(); } });
      if (seen) {                                                       // later pages: just a quick curtain lift
        gsap.set([row, $('.ld-line', loader)], { opacity: 0 });
        ready.then(() => gsap.delayedCall(.1, () => { resolve(); lift(.9); }));
        return;
      }
      const s = splitText($('span', name), 'chars');
      gsap.set(s.chars, { yPercent: 118 });
      gsap.set($('img', name), { opacity: 0, scale: .6 });
      gsap.timeline()
        .to($('img', name), { opacity: 1, scale: 1, duration: .9, ease: EXPO })
        .to(s.chars, { yPercent: 0, duration: 1, ease: EXPO, stagger: .03 }, .1);
      const v = { p: 0 };
      const paint = () => { cnt.textContent = Math.round(v.p); gsap.set(bar, { scaleX: v.p / 100 }); };
      gsap.to(v, { p: 88, duration: 1.7, ease: 'power2.inOut', onUpdate: paint, onComplete: () => {
        ready.then(() => gsap.to(v, { p: 100, duration: .45, ease: 'power1.out', onUpdate: paint, onComplete: () => gsap.delayedCall(.25, () => {
          gsap.to(row, { opacity: 0, duration: .4 });
          resolve(); lift(1.1);
        }) }));
      } });
    });
  }

  /* ---------------------------------------------------- interactions + extras */
  function interactions() {
    if (fine) $$('.pill, .circle-btn, .menu-btn').forEach(b => {
      const xTo = gsap.quickTo(b, 'x', { duration: .5, ease: 'power3' }), yTo = gsap.quickTo(b, 'y', { duration: .5, ease: 'power3' });
      b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * .25); yTo((e.clientY - r.top - r.height / 2) * .35); });
      b.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });
    // menu: columns rise in once the panel has opened
    addEventListener('menu:toggle', e => {
      if (!e.detail) return;
      gsap.fromTo($$('.menu-col'), { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: EXPO, stagger: .09, delay: .45, clearProps: 'transform,opacity' });
      gsap.fromTo($$('.menu-foot > *, .menu-top > *'), { opacity: 0 }, { opacity: 1, duration: .8, delay: .6, clearProps: 'opacity' });
    });
    // popups
    const modal = $('#modal');
    if (modal) new MutationObserver(() => {
      if (modal.hidden || !modal.classList.contains('open')) return;
      gsap.fromTo($$('.m-title, .m-lead, .m-list li, .m-text, .m-cta, .m-img, .f-node', modal), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .8, ease: EXPO, stagger: .05, clearProps: 'transform,opacity' });
    }).observe(modal, { attributes: true, attributeFilter: ['class', 'hidden'] });
  }

  // a dark curtain sweeps across before navigating to another page
  function pageTransitions() {
    const curtain = document.createElement('div'); curtain.className = 'curtain'; document.body.appendChild(curtain);
    addEventListener('pageshow', e => { if (e.persisted) gsap.set(curtain, { yPercent: 101 }); });
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
      if (a.target && a.target !== '_self') return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      e.preventDefault();
      lenis.stop();
      if (window.__setMenu) window.__setMenu(false);
      gsap.fromTo(curtain, { yPercent: 101 }, { yPercent: 0, duration: .75, ease: 'expo.inOut', onComplete: () => { location.href = url.href; } });
    }, true);
  }

  /* ------------------------------------------------------------------- go */
  setupGeneric();
  if (isHome) setupHome();
  prepareHeroes();
  interactions();
  pageTransitions();
  runLoader().then(() => {
    loading = false;
    playHero();
    syncLock();
    ST.refresh();
  });
  addEventListener('load', () => ST.refresh());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ST.refresh());
})();
