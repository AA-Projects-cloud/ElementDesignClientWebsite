# Element Design — website

Static website (HTML, CSS and JavaScript, no build step) for Element Design.

- Home: `index.html`
- Inner pages: `about.html`, `career.html`, `blog.html`, `article.html?slug=…`, `portfolio.html`, `services.html`, `service.html?s=…`
- Shared code: `common.js` (header, menus, footer), `inner.js` (inner-page helpers), `data.js` (services, portfolio, blog content), `icons.js` (3D icons), `main.js` (home page), `style.css`
- Three.js is loaded from a CDN (unpkg) through an import map, so no install is needed.

## Run locally

```bash
python -m http.server 8080
```

Then open http://localhost:8080

## Deploy on Vercel

Import the repository in Vercel and deploy with the default settings:
Framework preset **Other**, no build command, no output directory (the repository root is served as-is).
