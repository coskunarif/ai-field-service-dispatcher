import { readFileSync } from 'fs';
import { join } from 'path';
import { escapeHtml, normalizePath } from '../utils.js';

export const renderWaitlistResponsePage = ({
  statusCode,
  title,
  heading,
  message,
  email = '',
  returnPath = '/',
}) => {
  const root = process.cwd();
  const templateHtml = readFileSync(join(root, 'hvac-dispatch-software.html'), 'utf8');
  const header = (templateHtml.match(/<header>[\s\S]*?<\/header>/)?.[0] || '').replace(
    'href="#waitlist-form" class="nav-cta"',
    'href="/#waitlist-form" class="nav-cta"'
  );
  const currentScript =
    templateHtml.match(/<script>[\s\S]*?currentPath = location\.pathname[\s\S]*?<\/script>/)?.[0] ||
    '';
  const safeReturnPath = normalizePath(returnPath);

  const onboardingForm = email
    ? `
<div class="onboarding-box" style="margin-top: 30px; text-align: left; padding: 24px; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(16px); border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);">
  <h3 style="margin-bottom: 12px; font-size: 1.25rem; font-weight: 800; color: #34d399;">🚀 Try the AI Dispatcher Instantly</h3>
  <p style="margin-bottom: 16px; font-size: 0.92rem; color: #94a3b8; line-height: 1.6;">
    Give us a few details and enter your phone number to launch an **interactive live simulation** of Gainhelm's SMS dispatch workflow.
  </p>
  <form action="/onboarding" method="POST" style="display: flex; flex-direction: column; gap: 14px;">
    <input type="hidden" name="email" value="${escapeHtml(email)}">
    <input type="hidden" name="returnPath" value="${escapeHtml(returnPath)}">
    
    <div>
      <label style="display: block; margin-bottom: 6px; font-size: 0.82rem; font-weight: 700; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.05em;">Primary Trade</label>
      <select name="trade" style="width: 100%; padding: 12px 14px; background: rgba(2, 6, 23, 0.8); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 10px; color: #f8fafc; font-size: 0.95rem;" required>
        <option value="">Select your trade...</option>
        <option value="HVAC">HVAC</option>
        <option value="Plumbing">Plumbing</option>
        <option value="Electrical">Electrical</option>
        <option value="Cleaning">Cleaning</option>
        <option value="Landscaping">Landscaping</option>
        <option value="Other">Other / General Contracting</option>
      </select>
    </div>
    
    <div>
      <label style="display: block; margin-bottom: 6px; font-size: 0.82rem; font-weight: 700; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.05em;">Number of Technicians</label>
      <select name="tech_count" style="width: 100%; padding: 12px 14px; background: rgba(2, 6, 23, 0.8); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 10px; color: #f8fafc; font-size: 0.95rem;" required>
        <option value="1-5">1–5 techs</option>
        <option value="6-10">6–10 techs</option>
        <option value="11-20">11–20 techs</option>
        <option value="20+">20+ techs</option>
      </select>
    </div>
    
    <div>
      <label style="display: block; margin-bottom: 6px; font-size: 0.82rem; font-weight: 700; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.05em;">Mobile Phone (for demo context)</label>
      <input type="tel" name="phone" placeholder="+1 (555) 000-0000" style="width: 100%; padding: 12px 14px; background: rgba(2, 6, 23, 0.8); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 10px; color: #f8fafc; font-size: 0.95rem; box-sizing: border-box;" required>
    </div>
    
    <button type="submit" class="cta-primary" style="margin-top: 8px; cursor: pointer; align-self: flex-start; border: none; padding: 12px 24px; background: linear-gradient(180deg, #10b981 0%, #059669 100%); color: #020617; font-weight: 800; border-radius: 10px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);">Launch SMS Simulator</button>
  </form>
</div>
  `
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} | Gainhelm</title>
<meta name="robots" content="noindex,follow">
<link rel="stylesheet" href="/styles.css?v=20260604-redesign">
</head>
<body>
<a class="skip-link" href="#top">Skip to main content</a>
${header}
<main>
<section class="hero" id="top">
<div class="hero-layout"><div class="hero-copy">
<div class="brand-chip">${statusCode} waitlist update</div>
<h1>${escapeHtml(heading)}</h1>
<p>${escapeHtml(message)}</p>
${onboardingForm}
<div class="hero-actions"><a href="${escapeHtml(safeReturnPath)}#waitlist-form" class="cta-primary">Return to the waitlist</a><a href="/field-service-scheduling" class="cta-secondary">View scheduling software</a></div>
</div></div>
</section>
</main>
<footer><div>© 2026 Gainhelm. Built for field service dispatch.</div><div class="footer-links"><a href="/">Home</a> · <a href="/field-service-scheduling">Scheduling</a> · <a href="/sitemap.xml">sitemap.xml</a></div></footer>
${currentScript}
</body>
</html>`;
};
