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

## Go-live checklist (SEO, analytics, forms)

1. **Domain** – `node tools/set-domain.mjs https://your-domain.com` updates canonical/share-preview URLs, `robots.txt` and rebuilds `sitemap.xml`. Re-run `node tools/build-sitemap.mjs` whenever pages or `data.js` change.
2. **Google Search Console** – the verification file `googlefbae803ce8cfec64.html` is already in the site root; submit `https://your-domain.com/sitemap.xml`.
3. **Google Analytics** – put the GA4 measurement ID in `config.js` (`GA_ID`). Link the GA4 property to Search Console in GA → Admin → Product links.
4. **Spam protection** – create a Cloudflare Turnstile widget for your domain, put the *site key* in `config.js` and add `TURNSTILE_SECRET_KEY` in Vercel → Settings → Environment Variables.
5. **Receiving enquiries by e-mail** – add `RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM` in Vercel (see `api/contact.js`).
6. **HTTPS** – Vercel issues the certificate automatically; `vercel.json` adds the HSTS header and each page upgrades insecure requests.
