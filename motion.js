/* =====================================================================
   Element Design — motion system
   GSAP + ScrollTrigger + Lenis (loaded from a CDN in each page).
   Loaded as the LAST module on every page so all content already exists.
   If anything is unavailable, the page falls back to the original static
   behaviour (the `motion` class is removed from <html>).
   ===================================================================== */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const { gsap, ScrollTrigger: ST, Lenis } = window;
  const preloader = document.getElementById('preloader');

  if (reduce || !gsap || !ST || !Lenis) {            // graceful fallback
    root.classList.remove('motion');
    if (preloader) preloader.remove();
    return;
  }
  gsap.registerPlugin(ST);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';   // always start at the top
  window.scrollTo(0, 0);

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const EXPO = 'expo.out';
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const inHero = e => e.closest('.hero, .inner-hero');

  /* ------------------------------------------------------------ smooth scroll */
  const lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, touchMultiplier: 1.4 });
  window.__lenis = lenis;
  lenis.on('scroll', ST.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();                                      // locked until the loader finishes

  // every existing scrollIntoView({behavior:'smooth'}) now glides through Lenis
  Element.prototype.scrollIntoView = function () { lenis.scrollTo(this, { offset: -72, duration: 1.4 }); };
  // scrollable overlays keep native scrolling
  $$('.m-box, .m-menu, .filter ul').forEach(e => e.setAttribute('data-lenis-prevent', ''));
  // body locks (modal / mobile menu) pause Lenis
  const syncLock = () => {
    if (document.body.classList.contains('lock') || document.body.classList.contains('menu-open')) lenis.stop();
    else if (!loading) lenis.start();
  };
  let loading = true;
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
  // delay each word by its line, so paragraphs reveal line by line
  const lineDelays = (words, perLine = .11, perWord = .022) => {
    let line = -1, last = -1e9, k = 0;
    return words.map(w => {
      const top = Math.round(w.parentElement.getBoundingClientRect().top);
      if (Math.abs(top - last) > 4) { line++; last = top; k = 0; }
      return line * perLine + (k++) * perWord;
    });
  };
  // prepares an element and returns a play() function; plays on scroll unless `immediate`
  function textIn(el, { mode = 'words', dur = 1.15, start = 'top 88%', delay = 0, immediate = false, stagger = .032 } = {}) {
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

  /* ------------------------------------------------------------------- setup */
  function setup() {
    const main = $('main') || document.body;
    const handled = new Set();

    /* A. headings + paragraphs: masked reveals */
    $$('h2', main).filter(e => !inHero(e) && !e.closest('.modal')).forEach(h => textIn(h, { dur: 1.2 }));
    $$('.lead, .globe-copy p, .style-text > p:not(.muted), .recog p, .contact p.muted, .cta-band p', main)
      .filter(e => !inHero(e) && !e.closest('.modal') && !e._split)
      .forEach(p => textIn(p, { dur: 1.1, start: 'top 90%' }));

    /* B. groups of cards: staggered, each with its own direction */
    const groups = [
      ['.stat-card', () => ({ y: 80, scale: .94 })],
      ['.s-card', (i) => ({ x: i % 2 ? 70 : -70, y: 30 })],
      ['.f-card', () => ({ y: 70, scale: .96 })],
      ['.step', () => ({ y: 70, rotate: 1.2 })],
      ['.person', () => ({ y: 50, x: -30 })],
      ['.tl-i', () => ({ x: -50 })],
      ['.b-card', () => ({ y: 90 })],
      ['.sv-card', () => ({ y: 80, scale: .97 })]
    ];
    groups.forEach(([sel, from]) => {
      const els = $$(sel, main).filter(e => !inHero(e) && !handled.has(e));
      if (!els.length) return;
      els.forEach((e, i) => { handled.add(e); gsap.set(e, { opacity: 0, ...from(i) }); });
      ST.batch(els, {
        start: 'top 90%', once: true,
        onEnter: b => gsap.to(b, { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, duration: 1.2, ease: EXPO, stagger: .12, clearProps: 'transform,opacity' })
      });
    });

    /* C. images: mask reveal + parallax */
    $$('.style-img, .contact-img, .img-r, .b-img', main).filter(e => !inHero(e) && !e.closest('.india')).forEach(e => {
      if (e.classList.contains('b-img') && e.closest('.sv-card, .b-card')) imageMotion(e, { reveal: false, par: 6 });
      else imageMotion(e);
    });

    /* D. any remaining .reveal: fade up (or only the non-text children of a split block) */
    $$('.reveal', main).filter(e => !inHero(e) && !handled.has(e) && !e.matches('.india, [data-split], .contact-img, .style-img, .img-r')).forEach(e => {
      handled.add(e);
      const hasSplit = e.querySelector('[data-split]');
      const targets = hasSplit ? [...e.children].filter(c => !c.dataset.split && !c.querySelector('[data-split]')) : [e];
      if (!targets.length) return;
      gsap.set(targets, { opacity: 0, y: 46 });
      ST.create({
        trigger: e, start: 'top 88%', once: true,
        onEnter: () => gsap.to(targets, { opacity: 1, y: 0, duration: 1.1, ease: EXPO, stagger: .1, delay: hasSplit ? .35 : 0, clearProps: 'transform,opacity' })
      });
    });

    /* E. big containers ease in as they arrive */
    $$('.recog, .clients, .contact, .cta-band, .box:not(#portfolio)', main).filter(e => !inHero(e)).forEach(e => {
      e.classList.add('mo-scale');
      gsap.fromTo(e, { scale: .94, y: 40 }, { scale: 1, y: 0, ease: 'none', scrollTrigger: { trigger: e, start: 'top 98%', end: 'top 58%', scrub: .6 } });
    });

    /* F. recognition video drifts inside its frame */
    const rv = $('.recog-bg');
    if (rv) gsap.fromTo(rv, { yPercent: -8, scale: 1.18 }, { yPercent: 8, scale: 1.06, ease: 'none', scrollTrigger: { trigger: '.recog', start: 'top bottom', end: 'bottom top', scrub: true } });

    /* G. India panel and 3D stat icons get a gentle scroll drift */
    const india = $('.india-stage');
    if (india) gsap.to('.india', { yPercent: -4, ease: 'none', scrollTrigger: { trigger: '.globe', start: 'top bottom', end: 'bottom top', scrub: true } });

    /* H. pinned horizontal portfolio rail (desktop) */
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', () => {
      const box = $('#portfolio'), rail = $('#rail');
      if (!box || !rail) return;
      root.classList.add('hz');
      const dist = () => Math.max(0, rail.scrollWidth - rail.clientWidth);
      gsap.to(rail, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: box, start: 'top 14%', end: () => '+=' + (dist() + innerHeight * .15), pin: true, scrub: .7, invalidateOnRefresh: true, anticipatePin: 1 }
      });
      return () => { root.classList.remove('hz'); gsap.set(rail, { clearProps: 'transform' }); };
    });

    /* H2. article body: paragraphs rise in, images open like a curtain */
    const artBlocks = $$('.art > .art-meta, .art > .art-date, .art > p, .art > h2, .art > blockquote, .art > .src');
    if (artBlocks.length) {
      gsap.set(artBlocks, { opacity: 0, y: 36 });
      ST.batch(artBlocks, { start: 'top 92%', once: true, onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 1.1, ease: EXPO, stagger: .09, clearProps: 'transform,opacity' }) });
    }
    $$('.art figure img').forEach(img => {
      gsap.set(img, { clipPath: 'inset(14% 10% 14% 10% round 25px)', scale: 1.12 });
      ST.create({ trigger: img, start: 'top 88%', once: true, onEnter: () => gsap.to(img, { clipPath: 'inset(0% 0% 0% 0% round 25px)', scale: 1, duration: 1.5, ease: 'expo.inOut', clearProps: 'clipPath,transform' }) });
    });

    /* H3. footer columns and wordmark */
    const fcols = $$('.site-footer .f-links, .site-footer .f-brand');
    if (fcols.length) {
      gsap.set(fcols, { opacity: 0, y: 50 });
      ST.create({ trigger: '.site-footer', start: 'top 92%', once: true, onEnter: () => gsap.to(fcols, { opacity: 1, y: 0, duration: 1.2, ease: EXPO, stagger: .12, clearProps: 'transform,opacity' }) });
    }

    /* I. brand marquee driven by scroll velocity */
    const track = $('.mq-track');
    if (track) {
      let x = 0; const half = () => track.scrollWidth / 2;
      gsap.ticker.add(() => {
        const v = lenis.velocity || 0;
        x -= .7 + Math.min(Math.abs(v), 40) * .5 * (v < 0 ? -1 : 1);
        const h = half(); if (x <= -h) x += h; if (x > 0) x -= h;
        gsap.set(track, { x, skewX: gsap.utils.clamp(-9, 9, v * -.22) });
      });
    }
  }

  /* ------------------------------------------------------------ hero intros */
  function prepareHeroes() {
    const nav = $('#nav');
    if (nav) gsap.set(nav, { yPercent: -140, opacity: 0 });
    const links = $$('#navLinks > li, .nav-right > *, .logo');
    gsap.set(links, { opacity: 0, y: -14 });

    const home = $('.hero');
    if (home) {
      const h1 = $('h1', home), p = $('.hero-copy p', home), cta = $('.pill', home), vid = $('#bg', home);
      home._play = [];
      gsap.set(vid, { scale: 1.25, transformOrigin: '50% 50%' });
      gsap.set(home, { clipPath: 'inset(7% 4% 7% 4% round 30px)' });
      const t1 = textIn(h1, { mode: 'chars', immediate: true, stagger: .03, dur: 1.2 });
      const t2 = textIn(p, { immediate: true, dur: 1.1 });
      gsap.set(cta, { opacity: 0, y: 36 });
      home._intro = () => {
        const tl = gsap.timeline();
        tl.to(home, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.8, ease: 'expo.inOut', clearProps: 'clipPath' }, 0)
          .to(vid, { scale: 1.02, duration: 2.4, ease: EXPO }, 0)
          .add(t1, .55).add(t2, .95)
          .to(cta, { opacity: 1, y: 0, duration: 1, ease: EXPO, clearProps: 'transform' }, 1.25);
        return tl;
      };
      // scroll: the hero drifts away, the video pushes in
      gsap.fromTo(vid, { yPercent: 0 }, { yPercent: 8, ease: 'none', immediateRender: false, scrollTrigger: { trigger: home, start: 'top top', end: 'bottom top', scrub: true } });
      gsap.fromTo('.hero-copy', { yPercent: 0, opacity: 1 }, { yPercent: -28, opacity: 0, ease: 'none', immediateRender: false, scrollTrigger: { trigger: home, start: 'top top', end: '70% top', scrub: true } });
    }

    const inner = $('.inner-hero');
    if (inner) {
      const h1 = $('h1', inner), sub = $('.sub', inner), cta = $('.pill', inner), back = $('.back', inner), vid = $('.hero-bg', inner);
      const target = vid || (wrapBg(inner), inner._px);
      gsap.set(target, { scale: 1.25 });
      gsap.set(inner, { clipPath: 'inset(6% 3% 6% 3% round 28px)' });
      const t1 = textIn(h1, { immediate: true, dur: 1.25 });
      const t2 = sub ? textIn(sub, { immediate: true, dur: 1.1 }) : null;
      gsap.set([back, cta].filter(Boolean), { opacity: 0, y: 24 });
      inner._intro = () => {
        const tl = gsap.timeline();
        tl.to(inner, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.6, ease: 'expo.inOut', clearProps: 'clipPath' }, 0)
          .to(target, { scale: 1.04, duration: 2.2, ease: EXPO }, 0)
          .to(back, { opacity: 1, y: 0, duration: .9, ease: EXPO }, .5)
          .add(t1, .55);
        if (t2) tl.add(t2, .95);
        if (cta) tl.to(cta, { opacity: 1, y: 0, duration: 1, ease: EXPO, clearProps: 'transform' }, 1.2);
        return tl;
      };
      gsap.fromTo(target, { yPercent: 0 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: inner, start: 'top top', end: 'bottom top', scrub: true } });
      gsap.fromTo([h1, sub].filter(Boolean), { yPercent: 0, opacity: 1 }, { yPercent: -18, opacity: 0, ease: 'none', immediateRender: false, scrollTrigger: { trigger: inner, start: '55% top', end: 'bottom top', scrub: true } });
    }
  }
  function playHero() {
    const nav = $('#nav');
    if (nav) gsap.to(nav, { yPercent: 0, opacity: 1, duration: 1.3, ease: EXPO, clearProps: 'transform,opacity', delay: .5 });
    gsap.to($$('#navLinks > li, .nav-right > *, .logo'), { opacity: 1, y: 0, duration: 1, ease: EXPO, stagger: .06, delay: .7, clearProps: 'transform,opacity' });
    const h = $('.hero') || $('.inner-hero');
    if (h && h._intro) h._intro();
  }

  /* -------------------------------------------------------------- preloader */
  function runPreloader() {
    return new Promise(resolve => {
      if (!preloader) { resolve(); return; }
      let seen = false;
      try { seen = !!sessionStorage.getItem('ed-seen'); sessionStorage.setItem('ed-seen', '1'); } catch (e) { /* private mode */ }
      const bar = $('.pl-bar i', preloader), cnt = $('.pl-count', preloader), name = $('.pl-name', preloader), logo = $('.pl-logo', preloader), row = $('.pl-row', preloader);
      const loaded = new Promise(r => { if (document.readyState === 'complete') r(); else addEventListener('load', r, { once: true }); });
      const cap = new Promise(r => setTimeout(r, 4500));              // never wait forever
      const v = { p: 0 };
      const paint = () => { const n = Math.round(v.p); cnt.textContent = n + '%'; gsap.set(bar, { scaleX: v.p / 100 }); };
      const exit = () => {
        const tl = gsap.timeline({ onComplete: () => { preloader.remove(); resolve(); } });
        tl.to([logo, name, row], { yPercent: -40, opacity: 0, duration: .7, ease: 'expo.in', stagger: .05 })
          .add(() => { resolve(); }, '-=.15')                         // hero starts while the curtain lifts
          .to(preloader, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, '-=.1');
      };
      if (seen) {                                                     // returning pages: quick curtain only
        gsap.set([logo, name, row], { opacity: 0 });
        loaded.then(() => gsap.delayedCall(.12, () => { const tl = gsap.timeline({ onComplete: () => preloader.remove() }); tl.to(preloader, { clipPath: 'inset(0 0 100% 0)', duration: .9, ease: 'expo.inOut' }); resolve(); }));
        return;
      }
      const s = splitText(name, 'chars');
      gsap.set(s.chars, { yPercent: 118 });
      gsap.set(logo, { opacity: 0, scale: .6 });
      gsap.set(row, { opacity: 0 });
      gsap.timeline()
        .to(logo, { opacity: 1, scale: 1, duration: .9, ease: EXPO })
        .to(s.chars, { yPercent: 0, duration: 1, ease: EXPO, stagger: .035 }, .1)
        .to(row, { opacity: 1, duration: .5 }, .3);
      gsap.to(v, { p: 88, duration: 1.7, ease: 'power2.inOut', onUpdate: paint, onComplete: () => {
        Promise.race([loaded, cap]).then(() => gsap.to(v, { p: 100, duration: .45, ease: 'power1.out', onUpdate: paint, onComplete: () => gsap.delayedCall(.2, exit) }));
      } });
    });
  }

  /* ---------------------------------------------------- interactions + extras */
  function interactions() {
    // magnetic buttons
    if (fine) $$('.pill, .outline, .back').forEach(b => {
      const xTo = gsap.quickTo(b, 'x', { duration: .5, ease: 'power3' }), yTo = gsap.quickTo(b, 'y', { duration: .5, ease: 'power3' });
      b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * .28); yTo((e.clientY - r.top - r.height / 2) * .4); });
      b.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });
    // mobile menu items glide in when it opens
    const mm = $('#mMenu');
    if (mm) new MutationObserver(() => {
      if (!mm.classList.contains('open')) return;
      gsap.fromTo($$('#mMenu > ul > li, #mMenu .mm-cta'), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .8, ease: EXPO, stagger: .07, clearProps: 'transform,opacity' });
    }).observe(mm, { attributes: true, attributeFilter: ['class'] });
    // modal pops in with a little rise
    const modal = $('#modal');
    if (modal) new MutationObserver(() => {
      if (modal.hidden || !modal.classList.contains('open')) return;
      gsap.fromTo($$('.m-title, .m-lead, .m-list li, .m-text, .m-cta, .m-img, .f-node', modal), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .8, ease: EXPO, stagger: .05, clearProps: 'transform,opacity' });
    }).observe(modal, { attributes: true, attributeFilter: ['class', 'hidden'] });
  }

  // page transition: a curtain sweeps up before navigating to another page
  function pageTransitions() {
    const curtain = document.createElement('div'); curtain.className = 'curtain'; document.body.appendChild(curtain);
    addEventListener('pageshow', e => { if (e.persisted) gsap.set(curtain, { yPercent: 0, y: 0, clearProps: 'transform' }); });
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
      if (a.target && a.target !== '_self') return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;          // same page (anchors)
      e.preventDefault();
      lenis.stop();
      gsap.fromTo(curtain, { yPercent: 101 }, { yPercent: 0, duration: .75, ease: 'expo.inOut', onComplete: () => { location.href = url.href; } });
    }, true);
  }

  /* ------------------------------------------------------------------- go */
  setup();
  prepareHeroes();
  interactions();
  pageTransitions();
  runPreloader().then(() => {
    loading = false;
    playHero();
    syncLock();
    ST.refresh();
  });
  addEventListener('load', () => ST.refresh());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ST.refresh());
})();
