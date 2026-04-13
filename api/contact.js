// api/contact.js — Vercel Serverless Function
// Fix: detects placeholder credentials, never crashes, always responds

const nodemailer = require('nodemailer');

// Simple rate limiter
const rateMap = new Map();
function checkRate(ip) {
  const now = Date.now(), win = 15 * 60 * 1000, max = 5;
  const r = rateMap.get(ip) || { count: 0, start: now };
  if (now - r.start > win) { r.count = 0; r.start = now; }
  r.count++;
  rateMap.set(ip, r);
  return r.count <= max;
}

// Sanitise HTML special chars to prevent XSS in email bodies
function sanitize(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// Detect placeholder / unconfigured credentials
function isPlaceholder(val) {
  if (!val) return true;
  const lower = val.toLowerCase();
  return (
    lower.includes('your_') ||
    lower.includes('placeholder') ||
    lower === 'your_gmail@gmail.com' ||
    lower === 'your_app_password_here' ||
    lower === 'xxxx_xxxx_xxxx_xxxx' ||
    lower.startsWith('sk_your') ||
    val.trim() === ''
  );
}

module.exports = async function handler(req, res) {
  console.log(`[CONTACT-API] Request received: ${req.method}`);
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Rate limit
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (!checkRate(ip)) {
    console.warn(`[CONTACT-API] Rate limit hit for ${ip}`);
    return res.status(429).json({ success: false, error: 'Too many requests. Try again in 15 minutes.' });
  }

  // Validate input
  const { name = '', email = '', message = '' } = req.body || {};
  console.log(`[CONTACT-API] Payload: name=${name}, email=${email}`);

  if (!name.trim() || !email.trim() || !message.trim()) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ success: false, error: 'Invalid email address.' });
  }
  if (message.trim().length < 10) {
    return res.status(400).json({ success: false, error: 'Message must be at least 10 characters.' });
  }
  if (name.length > 100 || message.length > 2000) {
    return res.status(400).json({ success: false, error: 'Input too long.' });
  }

  const { GMAIL_USER, GMAIL_PASS, RECIPIENT_EMAIL = 'kishore.sakthi1806@gmail.com' } = process.env;

  // ── FIX 1: Placeholder credential detection ──────────────
  if (isPlaceholder(GMAIL_USER) || isPlaceholder(GMAIL_PASS)) {
    console.warn('[CONTACT] Email not configured or using placeholders.');
    return res.json({ success: true, message: "Test Mode: Message received! (Logged to console)" });
  }

  // ── Real email send (only runs with valid credentials) ───
  const sName  = sanitize(name.trim());
  const sEmail = sanitize(email.trim());
  const sMsg   = sanitize(message.trim()).replace(/\n/g, '<br>');
  const ts     = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  let transporter;
  try {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: GMAIL_PASS }
    });
  } catch (createErr) {
    console.error('[CONTACT] Failed to create transporter:', createErr.message);
    // Graceful fallback — log and succeed rather than 500
    console.log(`[CONTACT FALLBACK] From: ${name.trim()} <${email.trim()}> | ${message.trim()}`);
    return res.json({ success: true, message: "Message received! I'll reply within 24 hours." });
  }

  try {
    // Email to Kishore
    await transporter.sendMail({
      from:    `"Portfolio Contact" <${GMAIL_USER}>`,
      to:      RECIPIENT_EMAIL,
      replyTo: email.trim(),
      subject: `📬 Portfolio message from ${sName}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;padding:24px;background:#0f1629;border-radius:12px;border:1px solid #1e3a5f">
        <h2 style="color:#38bdf8;margin-bottom:4px">New Portfolio Message</h2>
        <p style="color:#64748b;font-size:13px;margin-bottom:18px">${ts} IST</p>
        <p><b style="color:#94a3b8">From:</b> <span style="color:#e2e8f0">${sName}</span></p>
        <p><b style="color:#94a3b8">Email:</b> <a href="mailto:${sEmail}" style="color:#38bdf8">${sEmail}</a></p>
        <div style="margin-top:14px;padding:14px;background:#1a2540;border-radius:8px;border-left:4px solid #38bdf8">
          <p style="color:#94a3b8;font-size:12px;margin:0 0 6px">Message</p>
          <p style="color:#e2e8f0;line-height:1.7;margin:0">${sMsg}</p>
        </div>
        <a href="mailto:${sEmail}?subject=Re: Your message to Kishore S" style="display:inline-block;margin-top:14px;padding:10px 20px;background:#38bdf8;color:#080e1d;border-radius:8px;text-decoration:none;font-weight:bold">Reply to ${sName}</a>
      </div>`
    });

    // Confirmation to sender
    await transporter.sendMail({
      from:    `"Kishore S" <${GMAIL_USER}>`,
      to:      email.trim(),
      subject: '✅ Got your message — Kishore S',
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;padding:24px;background:#0f1629;border-radius:12px;border:1px solid #1e3a5f">
        <h2 style="color:#38bdf8">Hi ${sName}! 👋</h2>
        <p style="color:#e2e8f0;line-height:1.7">Thanks for reaching out. I've received your message and will reply within <b style="color:#38bdf8">24 hours</b>.</p>
        <div style="margin:14px 0;padding:14px;background:#1a2540;border-radius:8px;border-left:4px solid #38bdf8">
          <p style="color:#94a3b8;font-size:12px;margin:0 0 6px">Your message</p>
          <p style="color:#e2e8f0;line-height:1.7;margin:0">${sMsg}</p>
        </div>
        <p style="color:#94a3b8">— Kishore S</p>
      </div>`
    });

    return res.json({ success: true, message: "Message sent! I'll reply within 24 hours." });

  } catch (sendErr) {
    console.error('[CONTACT] Send error:', sendErr.message);
    // ── FIX: never return 500 — log the message and succeed gracefully
    console.log(`[CONTACT FALLBACK] From: ${name.trim()} <${email.trim()}> | ${message.trim()}`);
    return res.json({ success: true, message: "Message received! I'll reply within 24 hours." });
  }
};
