# Element Design — website

Static website (HTML, CSS and JavaScript, no build step) for Element Design.

- Home: `index.html`
- Inner pages: `about.html`, `career.html`, `blog.html`, `article.html?slug=…`, `portfolio.html`, `services.html`, `service.html?s=…`
- Shared code: `common.js` (top bar, full-screen menu, footer), `inner.js` (inner-page helpers), `data.js` (services, portfolio, blog content), `main.js` (home page), `motion.js` (loader, smooth scroll, animations), `site.css` (all styles)
- GSAP, ScrollTrigger and Lenis load from a CDN (jsdelivr), so no install is needed. Fonts: Familjen Grotesk and Instrument Serif (Google Fonts).

## Run locally

```bash
python -m http.server 8080
```

Then open http://localhost:8080

## Deploy on Vercel

Import the repository in Vercel and deploy with the default settings (no `vercel.json` is needed):
Framework preset **Other**, no build command, no output directory (the repository root is served as-is).
