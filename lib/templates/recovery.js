import { readFileSync } from 'fs';
import { join } from 'path';
import { escapeHtml } from '../utils.js';

export const renderRecoveryPage = ({ pathname, statusCode, title, heading, message }) => {
  const root = process.cwd();
  const templateHtml = readFileSync(join(root, 'hvac-dispatch-software.html'), 'utf8');
  const header = (templateHtml.match(/<header>[\s\S]*?<\/header>/)?.[0] || '').replace(
    'href="#waitlist-form" class="nav-cta"',
    'href="/#waitlist-form" class="nav-cta"'
  );
  const currentScript =
    templateHtml.match(/<script>[\s\S]*?currentPath = location\.pathname[\s\S]*?<\/script>/)?.[0] ||
    '';
  const safePath = escapeHtml(pathname);

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
<div class="brand-chip">${statusCode} route recovery</div>
<h1>${escapeHtml(heading)}</h1>
<p>${escapeHtml(message)}</p>
<p>The address <strong>${safePath}</strong> is not a canonical Gainhelm page. Use the navigation above or jump to one of the common dispatch pages below.</p>
<div class="hero-actions"><a href="/" class="cta-primary">Go to homepage</a><a href="/field-service-scheduling" class="cta-secondary">View scheduling software</a></div>
<div class="badge-row" aria-label="Helpful route suggestions"><a class="badge" href="/hvac-dispatch-software">HVAC</a><a class="badge" href="/plumbing-dispatch-software">Plumbing</a><a class="badge" href="/electrical-dispatch-software">Electrical</a><a class="badge" href="/restoration-job-management-software">Restoration jobs</a></div>
</div><div class="hero-preview" aria-label="Route recovery options"><div class="preview-card"><div class="preview-top"><span class="preview-title">Find the right page</span><span class="preview-pill">Navigation recovery</span></div><div class="preview-list"><div class="preview-item"><div><strong>Service pages</strong><span>Open Services in the header for all dispatch domains.</span></div><span class="preview-status success">Available</span></div><div class="preview-item"><div><strong>Waitlist</strong><span>Start from the homepage if you want early access.</span></div><span class="preview-status neutral">Ready</span></div><div class="preview-item"><div><strong>Scheduling</strong><span>Compare the broader field service scheduling workflow.</span></div><span class="preview-status success">Suggested</span></div></div></div></div></div>
</section>
</main>
<footer><div>© 2026 Gainhelm. Built for field service dispatch.</div><div class="footer-links"><a href="/">Home</a> · <a href="/field-service-scheduling">Scheduling</a> · <a href="/sitemap.xml">sitemap.xml</a></div></footer>
${currentScript}
</body>
</html>`;
};
