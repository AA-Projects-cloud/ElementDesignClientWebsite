// Site-wide settings. Replace the three values below once; everything else reads from here.
// (Static files — canonical/og tags, sitemap.xml, robots.txt — are updated by:  node tools/set-domain.mjs https://your-domain.com)

export const SITE_URL = 'https://YOUR-DOMAIN.com';             // live address, no trailing slash
export const GA_ID = 'G-XXXXXXXXXX';                           // Google Analytics 4 measurement ID
export const TURNSTILE_SITE_KEY = '1x00000000000000000000AA';  // Cloudflare Turnstile site key (this one is Cloudflare's always-pass test key)
