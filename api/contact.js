// Vercel serverless function: POST /api/contact
// 1) rejects bots (honeypot + Cloudflare Turnstile verified server-side)
// 2) forwards the enquiry by e-mail through Resend when configured.
//
// Environment variables (Vercel → Project → Settings → Environment Variables):
//   TURNSTILE_SECRET_KEY  Cloudflare Turnstile secret key            (required for spam protection)
//   RESEND_API_KEY        Resend API key                             (optional – to receive enquiries by e-mail)
//   CONTACT_TO            address that receives enquiries            (optional)
//   CONTACT_FROM          verified sender, e.g. "Element Design <hello@your-domain.com>"  (optional)

const clean = (v, max) => String(v || '').replace(/[\u0000-\u001f<>]/g, ' ').trim().slice(0, max);

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false }); }
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

  if (body.website) return res.status(200).json({ ok: true });                       // honeypot filled → pretend success

  const name = clean(body.name, 80), phone = clean(body.phone, 20), page = clean(body.page, 200);
  if (name.length < 2 || !/^[0-9 ]{10,12}$/.test(phone)) return res.status(400).json({ ok: false, error: 'invalid' });

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (secret) {
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    const form = new URLSearchParams({ secret, response: String(body.token || ''), remoteip: ip });
    const check = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form })
      .then(r => r.json()).catch(() => ({ success: false }));
    if (!check.success) return res.status(403).json({ ok: false, error: 'spam-check' });
  }

  const { RESEND_API_KEY, CONTACT_TO, CONTACT_FROM } = process.env;
  if (RESEND_API_KEY && CONTACT_TO && CONTACT_FROM) {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: CONTACT_FROM, to: [CONTACT_TO], subject: `New enquiry from ${name}`,
        text: `Name: ${name}\nPhone: +91 ${phone}\nPage: ${page}\nTime: ${new Date().toISOString()}`
      })
    }).catch(() => null);
    if (!r || !r.ok) return res.status(502).json({ ok: false, error: 'mail' });
  } else {
    console.log('Enquiry (no mail provider configured):', { name, phone, page });
  }
  return res.status(200).json({ ok: true });
};
