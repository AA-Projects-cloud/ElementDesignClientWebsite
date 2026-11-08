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
  const HAZE = 'blur(18px) brightness(1.35) saturate(.55)';          // the "fog" an image emerges from
  const CLEAR = 'blur(0px) brightness(1) saturate(1)';
  const hazeIn = (el, { delay = 0, dur = 2.2 } = {}) => gsap.fromTo(el, { filter: HAZE }, { filter: CLEAR, duration: dur, delay, ease: 'power2.out', clearProps: 'filter' });

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
    if (document.body.classList.contains('lock')) lenis.stop();
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
  // per-character delay that restarts on every line, so each wrapped line rolls in on its own
  const charDelays = (chars, perChar, perLine) => {
    let line = -1, last = -1e9, k = 0;
    return chars.map(c => {
      const top = Math.round(c.getBoundingClientRect().top);
      if (Math.abs(top - last) > 6) { line++; last = top; k = 0; }
      return line * perLine + (k++) * perChar;
    });
  };
  const wordDelays = (words, perLine = .1, perWord = .02) => {
    let line = -1, last = -1e9, k = 0;
    return words.map(w => {
      const top = Math.round(w.parentElement.getBoundingClientRect().top);
      if (Math.abs(top - last) > 4) { line++; last = top; k = 0; }
      return line * perLine + (k++) * perWord;
    });
  };
  // headings: characters rise out of a mask line by line. paragraphs: words, line by line.
  function textIn(el, { mode = 'words', dur = 1.15, start = 'top 88%', delay = 0, immediate = false } = {}) {
    const s = splitText(el, mode), items = mode === 'chars' ? s.chars : s.words;
    gsap.set(items, { yPercent: 118 });
    const play = () => {
      const d = mode === 'chars' ? charDelays(items, .018, .09) : wordDelays(items);
      gsap.to(items, { yPercent: 0, duration: dur, ease: EXPO, delay: i => delay + d[i] });
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
  // pointer zoom: the picture slowly pushes in under the cursor and settles back on leave
  function hoverZoom(el) {
    const px = el._px; if (!px || !fine || el._hz) return;
    el._hz = true;
    el.addEventListener('mouseenter', () => gsap.to(px, { scale: '+=0.09', duration: 1.4, ease: EXPO, overwrite: 'auto' }));
    el.addEventListener('mouseleave', () => gsap.to(px, { scale: el._rest || 1.04, duration: 1.4, ease: EXPO, overwrite: 'auto' }));
  }
  function imageMotion(el, { reveal = true, par = 7 } = {}) {
    const px = wrapBg(el); if (!px) return;
    if (reveal) {
      const r = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
      gsap.set(el, { clipPath: `inset(12% 9% 12% 9% round ${r}px)` });
      gsap.set(px, { scale: 1.3, filter: HAZE });
      ST.create({
        trigger: el, start: 'top 88%', once: true, onEnter: () => {
          gsap.to(el, { clipPath: `inset(0% 0% 0% 0% round ${r}px)`, duration: 1.6, ease: 'expo.inOut', clearProps: 'clipPath' });
          gsap.to(px, { scale: 1.04, filter: CLEAR, duration: 2.2, ease: EXPO, clearProps: 'filter' });
        }
      });
      el._rest = 1.04;
    } else { gsap.set(px, { scale: 1.1 }); el._rest = 1.1; }
    gsap.fromTo(px, { yPercent: -par }, { yPercent: par, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    hoverZoom(el);
  }

  /* ----------------------------------------------------- generic (every page) */
  function setupGeneric() {
    const main = $('main') || document.body;
    const handled = new Set();

    // headings: characters roll up out of a mask, line by line
    $$('h2', main).filter(e => !inHero(e) && !e.closest('.modal, .statement, .house')).forEach(h => textIn(h, { mode: 'chars', dur: 1.15, start: 'top 90%' }));
    // paragraphs: words, line by line
    $$('.lead, .across-copy p, .dc-copy p, .steps-head p, .statement-rule p, .contact .muted, .foot-big + p', main)
      .filter(e => !inHero(e) && !e._split && !e.closest('.modal')).forEach(p => textIn(p, { dur: 1.1, start: 'top 92%' }));

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

    // images: fog-to-clear + mask reveal + parallax + hover zoom
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
      gsap.set(img, { clipPath: 'inset(12% 8% 12% 8% round 18px)', scale: 1.1, filter: HAZE });
      ST.create({ trigger: img, start: 'top 88%', once: true, onEnter: () => gsap.to(img, { clipPath: 'inset(0% 0% 0% 0% round 18px)', scale: 1, filter: CLEAR, duration: 1.8, ease: 'expo.inOut', clearProps: 'clipPath,transform,filter' }) });
    });

    // cards that arrive: gentle scale
    $$('.cta-band, .contact, .darkcard, .foot-card', main).forEach(e => {
      gsap.fromTo(e, { scale: .94, y: 40 }, { scale: 1, y: 0, ease: 'none', scrollTrigger: { trigger: e, start: 'top 98%', end: 'top 55%', scrub: .6 } });
    });
    const fb = $('.foot-big'); if (fb) textIn(fb, { mode: 'chars', start: 'top 92%', dur: 1.3 });
  }

  /* ------------------------------------------------------------- home only */
  // soft cloud texture drawn on a canvas (no external image needed)
  function cloudTexture(seed, n = 54, boost = 0) {
    const w = 1600, h = 900, c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d');
    let s = seed; const rnd = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    for (let i = 0; i < n; i++) {
      const cx = rnd() * w, cy = h * (.3 + rnd() * .65), rx = 140 + rnd() * 340, ry = 40 + rnd() * 120;
      const g = x.createRadialGradient(0, 0, 0, 0, 0, rx);
      g.addColorStop(0, 'rgba(255,252,245,1)'); g.addColorStop(.55, 'rgba(255,252,245,.45)'); g.addColorStop(1, 'rgba(255,252,245,0)');
      x.save(); x.globalAlpha = Math.min(1, .12 + boost + rnd() * .3); x.translate(cx, cy); x.scale(1, ry / rx); x.fillStyle = g;
      x.beginPath(); x.arc(0, 0, rx, 0, Math.PI * 2); x.fill(); x.restore();
    }
    return c.toDataURL('image/png');
  }

  // soft smoke: translucent wisps at the top that thicken into a solid body at the bottom (fractal noise, drawn once)
  function smokeTexture(seed, w, h, lo, hi, base, shade) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d'), img = x.createImageData(w, h), d = img.data;
    const hash = (ix, iy) => { let n = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(seed, 1442695041); n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967295; };
    const sm = t => t * t * (3 - 2 * t);
    const vnoise = (px, py) => {
      const ix = Math.floor(px), iy = Math.floor(py), fx = sm(px - ix), fy = sm(py - iy);
      const a = hash(ix, iy), b = hash(ix + 1, iy), c2 = hash(ix, iy + 1), e = hash(ix + 1, iy + 1);
      return a + (b - a) * fx + (c2 - a) * fy + (a - b - c2 + e) * fx * fy;
    };
    const fbm = (px, py) => { let v = 0, amp = .5, f = 1; for (let o = 0; o < 5; o++) { v += amp * vnoise(px * f, py * f); f *= 2; amp *= .5; } return v; };
    const step = (e0, e1, v) => { const t = Math.min(1, Math.max(0, (v - e0) / (e1 - e0))); return sm(t); };
    for (let j = 0; j < h; j++) {
      const v = j / h;
      for (let i = 0; i < w; i++) {
        const u = i / w, n = fbm(u * 4, v * 7), n2 = fbm(u * 8 + 11, v * 13 + 5);
        const ramp = step(lo, hi, v + (n - .5) * .5);                          // opacity: 0 at the top, 1 at the bottom
        const sh = (1 - ramp) * Math.min(1, Math.max(0, (n2 - .3) * 2)) * .6;  // grey-beige shading inside the wisps
        const k = (j * w + i) * 4;
        d[k] = base[0] + (shade[0] - base[0]) * sh; d[k + 1] = base[1] + (shade[1] - base[1]) * sh; d[k + 2] = base[2] + (shade[2] - base[2]) * sh;
        d[k + 3] = ramp * 255;
      }
    }
    x.putImageData(img, 0, 0);
    return c.toDataURL('image/png');
  }

  function setupHome() {
    // hero → page: two layers of beige smoke fade in and rise a little as the cream page rolls up
    const hcs = $$('.hc'), hcw = $('.hero-clouds');
    if (hcw) {
      const CREAM = [237, 230, 214], GREY = [176, 168, 154];
      hcs[0].style.backgroundImage = `url(${smokeTexture(31, 720, 275, .12, .8, CREAM, GREY)})`;   // short layer
      hcs[1].style.backgroundImage = `url(${smokeTexture(77, 720, 450, .1, .62, CREAM, GREY)})`;    // tall layer, solid at its foot
      gsap.set(hcs[0], { opacity: 0, y: () => innerHeight * .075 });
      gsap.set(hcs[1], { opacity: 0, y: () => innerHeight * .06 });
      const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.flow', start: 'top bottom', end: 'top 45%', scrub: .6, invalidateOnRefresh: true } });
      tl.to(hcs[0], { opacity: 1, duration: .4 }, 0).to(hcs[0], { y: () => -innerHeight * .075, duration: 1 }, 0)
        .to(hcs[1], { opacity: 1, duration: .3 }, 0).to(hcs[1], { y: () => -innerHeight * .18, duration: 1 }, 0);
    }

    // scattered projects: emerge from fog, then drift at different speeds
    const parTweens = [];
    $$('.sc-img').forEach(el => {
      const sp = +el.dataset.sp || .1;
      gsap.set(el, { opacity: 0, scale: .84, filter: HAZE });
      ST.create({ trigger: el, start: 'top 98%', once: true, onEnter: () => {
        gsap.to(el, { opacity: 1, scale: 1, duration: 1.5, ease: EXPO });
        gsap.to(el, { filter: CLEAR, duration: 2.2, ease: 'power2.out', clearProps: 'filter' });
      } });
      parTweens.push(gsap.fromTo(el, { y: () => sp * innerHeight * 1.5 }, { y: () => -sp * innerHeight * 1.5, ease: 'none', paused: true, immediateRender: true }));
    });

    // statement: words light up as you read; the thumbnail opens up
    const sh = $('.statement h2');
    if (sh) {
      const s = splitText(sh, 'words');
      gsap.set(s.words, { opacity: .14 });
      gsap.to(s.words, { opacity: 1, stagger: .12, ease: 'none', scrollTrigger: { trigger: sh, start: 'top 82%', end: 'bottom 48%', scrub: true } });
    }
    const thumb = $('.statement .thumb');
    // showcase: two images slide 1 → 2, the second opens to full screen, then shrinks onto the thumbnail inside the sentence below
    const sc = $('.scatter'), card = $('.sc-card'), track = $('.sc-track'), field = $('.sc-field'), head = $('.sc-head');
    if (sc && card && thumb) {
      const slides = $$('.sc-slide i', card), arrows = $('.sc-arrows', card);
      const clamp01 = v => Math.min(1, Math.max(0, v));
      const lerp = (a, b, t) => a + (b - a) * t;
      const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const baseW = () => innerWidth < 760 ? innerWidth * .72 : innerWidth * .34;
      const place = p => {
        const vw = innerWidth, vh = innerHeight, bw = baseW(), bh = bw * .625, bcy = vh * .56;
        const ex = ease(clamp01((p - .26) / .2)), sh = ease(clamp01((p - .56) / .34));
        let w = lerp(bw, vw, ex), h = lerp(bh, vh, ex), cx = vw / 2, cy = lerp(bcy, vh / 2, ex), r = lerp(18, 0, ex);
        if (sh > 0) {                                                                // minimise onto the thumbnail's live position
          const t = thumb.getBoundingClientRect();
          w = lerp(vw, t.width, sh); h = lerp(vh, t.height, sh);
          cx = lerp(vw / 2, t.left + t.width / 2, sh); cy = lerp(vh / 2, Math.min(t.top + t.height / 2, vh - h / 2 - 16), sh);
          r = lerp(0, (parseFloat(getComputedStyle(thumb).fontSize) || 40) * .14, sh);
        }
        gsap.set(card, { left: 0, top: 0, x: cx - w / 2, y: cy - h / 2, width: w, height: h, borderRadius: r, xPercent: 0, yPercent: 0 });
        gsap.set(track, { xPercent: -50 * ease(clamp01(p / .18)) });
        const zoom = 1 + .2 * ease(clamp01((p - .26) / .26)) - .2 * sh;              // zoom in while opening, relax while closing
        gsap.set(slides[1], { scale: zoom });
        gsap.set(slides[0], { scale: 1 + .04 * ease(clamp01(p / .18)) });
        const fade = 1 - ease(clamp01((p - .24) / .14));
        gsap.set([field, head], { opacity: fade, visibility: fade < .01 ? 'hidden' : 'visible' });
        gsap.set(arrows, { opacity: 1 - ease(clamp01((p - .22) / .08)) });
        const landed = p >= .985;
        card.style.visibility = landed ? 'hidden' : 'visible';
        thumb.style.opacity = landed ? '1' : '0';
      };
      gsap.set(thumb, { opacity: 0 });
      // the sentence must already be on screen while the picture is still pinned, so pull it up under the stage
      const overlap = () => { sc.style.marginBottom = '0px'; const rel = thumb.getBoundingClientRect().top - $('.statement').getBoundingClientRect().top; sc.style.marginBottom = -(innerHeight * .6 + rel) + 'px'; };
      ST.addEventListener('refreshInit', overlap);
      overlap();
      ST.create({ trigger: sc, start: 'top top', end: 'bottom bottom', invalidateOnRefresh: true, onUpdate: s => place(s.progress), onRefresh: s => place(s.progress) });
      const showST = ST.getAll().find(t => t.trigger === sc && t.vars.onUpdate);
      // the background photos drift with the page, but stand still while the card slides to image 2 and resume when it starts to zoom
      ST.create({
        trigger: field, start: 'top bottom', end: 'bottom top', invalidateOnRefresh: true,
        onUpdate: self => parallax(self), onRefresh: self => parallax(self)
      });
      function parallax(self) {
        const pos = self.scroll(), D = sc.offsetHeight - innerHeight, pause = D * .26;
        const shift = Math.min(Math.max(pos - showST.start, 0), pause);               // distance scrolled while paused
        const eff = pos - shift;
        const prog = Math.min(1, Math.max(0, (eff - self.start) / (self.end - self.start)));
        parTweens.forEach(t => t.progress(prog));
        gsap.set(field, { y: shift });
      }
      place(0);
      const goTo = f => { const d = sc.offsetHeight - innerHeight; lenis.scrollTo(sc.getBoundingClientRect().top + scrollY + d * f, { duration: 1.6 }); };
      $('.sc-next', card).addEventListener('click', () => goTo(.2));
      $('.sc-prev', card).addEventListener('click', () => goTo(0));
    }
    const rule = $('.statement-rule');
    if (rule) { gsap.set(rule.children, { opacity: 0, y: 40 }); ST.create({ trigger: rule, start: 'top 90%', once: true, onEnter: () => gsap.to(rule.children, { opacity: 1, y: 0, duration: 1.1, ease: EXPO, stagger: .12, clearProps: 'transform,opacity' }) }); }

    // marquee: the small photo card opens up to the full screen while the name slides past
    const mq = $('.mq');
    if (mq) {
      const card = $('.mq-card'), img = $('.mq-img'), track = $('.mq-track');
      gsap.set(card, { xPercent: -50, yPercent: -50 });
      gsap.set(track, { xPercent: 4 });
      gsap.set(img, { scale: 1.4, filter: HAZE });
      const tl = gsap.timeline({ scrollTrigger: { trigger: mq, start: 'top top', end: 'bottom bottom', scrub: .6 } });
      tl.to(track, { xPercent: -38, ease: 'none', duration: 1 }, 0)
        .to(card, { width: '100vw', height: '100svh', borderRadius: 0, ease: 'power2.inOut', duration: .55 }, .18)
        .to(img, { scale: 1.02, filter: CLEAR, ease: 'none', duration: .75 }, .18);
    }

    // 3D residence: scroll scrubs through seven views while the model is taken apart layer by layer
    const house = $('.house');
    if (house) {
      const cv = $('#houseCv'), scene = window.createHouse ? window.createHouse(cv) : null;
      if (!scene) house.remove();
      else {
        const STEP = [['Full View', 'Exterior of an Element Design residence'], ['Foundation', 'Groundwork & footings'], ['Structure', 'Columns, beams & frame'], ['Floors', 'Slabs & levels'], ['Walls', 'Envelope & partitions'], ['Stairs', 'Vertical circulation'], ['Windows & Doors', 'Openings & glazing']];
        const sub = $('#huSub'), title = $('#huTitle'), num = $('#huNum'), dots = $('#huDots'), bar = $('.hu-bar', house), cnt = $('#huCount'), bp = $('.house-bp', house);
        STEP.forEach((_, i) => { const li = document.createElement('li'); li.addEventListener('click', () => lenis.scrollTo(house.getBoundingClientRect().top + scrollY + (house.offsetHeight - innerHeight) * (i + .12) / 7.2, { duration: 1.6 })); dots.appendChild(li); });
        const lis = $$('li', dots);
        let shown = -1, active = false, prog = 0;
        const label = i => {
          if (i === shown) return; shown = i;
          lis.forEach((l, k) => l.classList.toggle('on', k === i));
          num.textContent = '0' + (i + 1); cnt.textContent = '0' + (i + 1) + ' / 07';
          title.textContent = STEP[i][0]; sub.textContent = STEP[i][1];
          gsap.fromTo([title, sub, num], { yPercent: 35, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .9, ease: EXPO, stagger: .06, overwrite: 'auto' });
        };
        label(0);
        const fit = () => scene.resize();
        addEventListener('resize', fit); fit();
        ST.create({
          trigger: house, start: 'top bottom', end: 'bottom top',
          onToggle: s => { active = s.isActive; if (active) fit(); }
        });
        ST.create({
          trigger: house, start: 'top top', end: 'bottom bottom',
          onUpdate: s => {
            prog = Math.min(6, s.progress * 7.2 - .1);                         // short hold on the first and last view
            prog = Math.max(0, prog);
            label(Math.min(6, Math.round(prog)));
            gsap.set(bp, { opacity: Math.min(1, prog * 1.4) });
            bar.style.setProperty('--p', Math.min(1, prog / 6).toFixed(3));
            scene.setProgress(prog);
          }
        });
        gsap.ticker.add(() => { if (active) scene.render(); });
      }
    }

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
        hazeIn(bgs[idx], { dur: 1.6 });
      };
      const dist = () => '+=' + Math.round(innerHeight * (N - 1) * .9);
      ST.create({
        trigger: steps, start: 'top top', end: dist, pin: true, scrub: true, anticipatePin: 1,
        onUpdate: self => { gsap.set(track, { scaleX: self.progress }); show(Math.min(N - 1, Math.floor(self.progress * N * .9999))); }
      });
      gsap.fromTo(bgs, { scale: 1.14 }, { scale: 1.02, ease: 'none', scrollTrigger: { trigger: steps, start: 'top top', end: dist, scrub: true } });
    }

    // dark recognition card: video drifts inside
    const dv = $('.dc-media video');
    if (dv) gsap.fromTo(dv, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.darkcard', start: 'top bottom', end: 'bottom top', scrub: true } });

    // stacked portfolio cards: each one shrinks and dims as the next slides over it
    const cards = $$('.st-card');
    cards.forEach((c, i) => {
      const next = cards[i + 1];
      if (next) gsap.to(c, { scale: .93, opacity: .5, ease: 'none', scrollTrigger: { trigger: next, start: 'top 88%', end: 'top 12%', scrub: true } });
      const sti = $('.st-img', c);
      if (sti) {
        const px = wrapBg(sti); sti._rest = 1.05;
        gsap.set(px, { scale: 1.35, filter: HAZE });
        gsap.to(px, { scale: 1.05, filter: CLEAR, ease: 'none', scrollTrigger: { trigger: c, start: 'top 92%', end: 'top 30%', scrub: true } });
        hoverZoom(sti);
      }
    });

    // fog: a wash of white and drifting clouds covers the section above, then the clients appear
    const fog = $('.fogsec');
    if (fog) {
      const clouds = $$('.cloud', fog), wash = $('.fog-wash', fog);
      clouds.forEach((c, i) => { c.style.backgroundImage = `url(${cloudTexture(i ? 20240 : 7391)})`; });
      gsap.set(clouds, { opacity: 0, yPercent: 24 });
      gsap.set(wash, { opacity: 0 });
      gsap.timeline({ scrollTrigger: { trigger: fog, start: 'top 98%', end: 'top 12%', scrub: .9 } })
        .to(wash, { opacity: 1, ease: 'none', duration: 1 }, 0)
        .to(clouds, { opacity: .95, yPercent: 0, ease: 'none', duration: 1, stagger: .15 }, 0);
      gsap.fromTo(clouds, { xPercent: 0 }, { xPercent: i => (i ? 5 : -5), yPercent: -14, ease: 'none', immediateRender: false, scrollTrigger: { trigger: fog, start: 'top 12%', end: 'bottom bottom', scrub: true } });
      const track = $('.track', fog);
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
    }

    // India: the photo opens like a letterbox, zooming out of fog
    const ac = $('.across');
    if (ac) {
      const frame = $('.across-frame'), photo = $('.across .photo'), pins = $$('.across .pin');
      gsap.set(photo, { xPercent: 0, transformOrigin: '50% 55%' });
      gsap.fromTo(frame, { clipPath: 'inset(34% 5% 34% 5% round 22px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'power2.inOut', scrollTrigger: { trigger: ac, start: 'top 88%', end: 'top top', scrub: .7 } });
      gsap.fromTo(photo, { scale: 1.45, filter: HAZE }, { scale: 1.1, filter: CLEAR, ease: 'none', scrollTrigger: { trigger: ac, start: 'top 88%', end: 'top top', scrub: .7 } });
      gsap.fromTo(photo, { scale: 1.1 }, { scale: 1.26, ease: 'none', immediateRender: false, scrollTrigger: { trigger: ac, start: 'top top', end: 'bottom bottom', scrub: true } });
      gsap.set(pins, { opacity: 0 });
      ST.create({ trigger: ac, start: 'top 30%', once: true, onEnter: () => gsap.to(pins, { opacity: 1, duration: 1, stagger: .2 }) });
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
      const vid = $('video', home), h1 = $('h1', home), links = $$('.hero-links a', home), caps = $$('.hero-caps span', home), tag = $('.hero-tag', home);
      gsap.set(vid, { scale: 1.22, filter: HAZE });                                 // starts zoomed in and in a haze
      gsap.set(home, { clipPath: 'inset(6% 3% 6% 3% round 28px)' });
      const t1 = textIn(h1, { mode: 'chars', immediate: true, dur: 1.3 });
      gsap.set(links, { opacity: 0, y: 24 });
      gsap.set([...caps, tag], { opacity: 0, y: 16 });
      home._intro = () => {
        const tl = gsap.timeline();
        tl.to(home, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.8, ease: 'expo.inOut', clearProps: 'clipPath' }, 0)
          .to(vid, { scale: 1, duration: 2.6, ease: 'power3.out' }, 0)                // zoom out
          .to(vid, { filter: CLEAR, duration: 2.4, ease: 'power2.out', clearProps: 'filter' }, 0)
          .add(t1, .6)
          .to(links, { opacity: 1, y: 0, duration: 1, ease: EXPO, stagger: .12, clearProps: 'transform' }, 1.4)
          .to([...caps, tag], { opacity: 1, y: 0, duration: 1, ease: EXPO, stagger: .08, clearProps: 'transform' }, 1.6);
        return tl;
      };
      // scrolling away: the picture pushes in (zoom in) while the text lifts off
      gsap.fromTo(vid, { yPercent: 0, scale: 1 }, { yPercent: 6, scale: 1.14, ease: 'none', immediateRender: false, scrollTrigger: { trigger: home, start: 'top top', end: 'bottom top', scrub: true } });
      gsap.fromTo('.hero-in', { yPercent: 0, opacity: 1 }, { yPercent: -22, opacity: 0, ease: 'none', immediateRender: false, scrollTrigger: { trigger: home, start: 'top top', end: '65% top', scrub: true } });
      gsap.fromTo('.hero-shade', { opacity: 1 }, { opacity: 1.7, ease: 'none', immediateRender: false, scrollTrigger: { trigger: '.flow', start: 'top bottom', end: 'top top', scrub: true } });
    }

    const inner = $('.inner-hero');
    if (inner) {
      const h1 = $('h1', inner), sub = $('.sub', inner), cta = $('.ulink', inner), back = $('.back', inner), lab = $('.ih-label', inner), vid = $('.hero-bg', inner);
      const target = vid || (wrapBg(inner), inner._px);
      gsap.set(target, { scale: 1.22, filter: HAZE });
      gsap.set(inner, { clipPath: 'inset(5% 3% 5% 3% round 26px)' });
      const t1 = textIn(h1, { mode: 'chars', immediate: true, dur: 1.3 });
      const t2 = sub ? textIn(sub, { immediate: true, dur: 1.1 }) : null;
      gsap.set([back, cta, lab].filter(Boolean), { opacity: 0, y: 20 });
      inner._intro = () => {
        const tl = gsap.timeline();
        tl.to(inner, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.6, ease: 'expo.inOut', clearProps: 'clipPath' }, 0)
          .to(target, { scale: 1, duration: 2.4, ease: 'power3.out' }, 0)
          .to(target, { filter: CLEAR, duration: 2.2, ease: 'power2.out', clearProps: 'filter' }, 0)
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
      if (seen) {
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
    // dropdown menu: items rise in one after another
    addEventListener('menu:toggle', e => {
      if (!e.detail) return;
      gsap.fromTo($$('#site-menu .sm-inner > ul > li'), { yPercent: 105, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .9, ease: EXPO, stagger: .07, delay: .1, clearProps: 'transform,opacity' });
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
