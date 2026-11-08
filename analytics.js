// Google Analytics 4 — loaded on every page. Does nothing until a real measurement ID is set in config.js.
import { GA_ID } from './config.js';

window.dataLayer = window.dataLayer || [];
window.gtag = function () { window.dataLayer.push(arguments); };

if (/^G-[A-Z0-9]{6,}$/.test(GA_ID) && !/^G-X+$/.test(GA_ID)) {
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
  window.gtag('js', new Date());
  window.gtag('config', GA_ID);
}
