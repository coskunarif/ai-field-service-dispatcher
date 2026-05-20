import Fastify from 'fastify';
import postgres from 'postgres';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const fastify = Fastify({ logger: true });
const sql = process.env.DATABASE_URL ? postgres(process.env.DATABASE_URL) : null;
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const root = process.cwd();

fastify.addContentTypeParser('application/x-www-form-urlencoded', { parseAs: 'string' }, (_request, body, done) => {
  done(null, Object.fromEntries(new URLSearchParams(body)));
});

const legacyGonePaths = new Set([
  '/managebystats-alternative',
  '/tools/ad-spend-roi-calculator',
  '/blog/understanding-amazon-seller-fees',
  '/vs/inventory-lab',
  '/integrations/tiktok-ads',
  '/use-cases/private-label',
  '/comparisons',
  '/tools/amazon-fba-fees-calculator',
]);

const normalizePath = (url) => new URL(url, 'http://localhost').pathname.replace(/\/+$/, '') || '/';

const routeRedirects = {
  '/electrical-dispatch-softwar': '/electrical-dispatch-software',
  '/electrician-dispatch-software': '/electrical-dispatch-software',
  '/electrical-contractor-dispatch-software': '/electrical-dispatch-software',
  '/lawn-care-dispatch-software': '/landscaping-dispatch-software',
  '/landscape-dispatch-software': '/landscaping-dispatch-software',
  '/landscaper-dispatch-software': '/landscaping-dispatch-software',
  '/appliance-service-dispatch-software': '/appliance-repair-dispatch-software',
  '/appliance-dispatch-software': '/appliance-repair-dispatch-software',
  '/appliance-repair-scheduling-software': '/appliance-repair-dispatch-software',
  '/garage-door-repair-dispatch-software': '/garage-door-dispatch-software',
  '/garage-door-service-dispatch-software': '/garage-door-dispatch-software',
  '/cleaning-service-dispatch-software': '/cleaning-dispatch-software',
  '/cleaning-company-dispatch-software': '/cleaning-dispatch-software',
  '/janitorial-dispatch-software': '/cleaning-dispatch-software',
  '/pool-cleaning-dispatch-software': '/pool-service-dispatch-software',
  '/pool-maintenance-dispatch-software': '/pool-service-dispatch-software',
  '/roofing-contractor-dispatch-software': '/roofing-dispatch-software',
  '/roofing-service-dispatch-software': '/roofing-dispatch-software',
  '/locksmith-service-dispatch-software': '/locksmith-dispatch-software',
  '/facilities-maintenance-dispatch-software': '/commercial-facilities-dispatch-software',
  '/facilities-dispatch-software': '/commercial-facilities-dispatch-software',
  '/facility-maintenance-dispatch-software': '/commercial-facilities-dispatch-software',
  '/commercial-maintenance-dispatch-software': '/commercial-facilities-dispatch-software',
  '/water-damage-dispatch-software': '/emergency-restoration-dispatch-software',
  '/water-mitigation-dispatch-software': '/emergency-restoration-dispatch-software',
  '/mitigation-dispatch-software': '/emergency-restoration-dispatch-software',
  '/restoration-management-software': '/restoration-job-management-software',
  '/septic-pumping-dispatch-software': '/septic-service-dispatch-software',
  '/septic-tank-dispatch-software': '/septic-service-dispatch-software',
  '/septic-dispatch-software': '/septic-service-dispatch-software',
  '/exterminator-dispatch-software': '/pest-control-dispatch-software',
  '/pest-control-scheduling-software': '/pest-control-dispatch-software',
};

for (const [route, target] of Object.entries(routeRedirects)) {
  fastify.get(route, async (_request, reply) => {
    reply.redirect(target, 301);
  });
}

const pages = {
  '/': 'index.html',
  '/hvac-dispatch-software': 'hvac-dispatch-software.html',
  '/hvac-dispatch-app-vs-spreadsheets': 'hvac-dispatch-app-vs-spreadsheets.html',
  '/how-to-choose-hvac-dispatch-app': 'how-to-choose-hvac-dispatch-app.html',
  '/plumbing-dispatch-software': 'plumbing-dispatch-software.html',
  '/electrical-dispatch-software': 'electrical-dispatch-software.html',
  '/appliance-repair-dispatch-software': 'appliance-repair-dispatch-software.html',
  '/pest-control-dispatch-software': 'pest-control-dispatch-software.html',
  '/garage-door-dispatch-software': 'garage-door-dispatch-software.html',
  '/cleaning-dispatch-software': 'cleaning-dispatch-software.html',
  '/landscaping-dispatch-software': 'landscaping-dispatch-software.html',
  '/roofing-dispatch-software': 'roofing-dispatch-software.html',
  '/locksmith-dispatch-software': 'locksmith-dispatch-software.html',
  '/pool-service-dispatch-software': 'pool-service-dispatch-software.html',
  '/commercial-facilities-dispatch-software': 'commercial-facilities-dispatch-software.html',
  '/septic-service-dispatch-software': 'septic-service-dispatch-software.html',
  '/emergency-restoration-dispatch-software': 'emergency-restoration-dispatch-software.html',
  '/restoration-job-management-software': 'restoration-job-management-software.html',
  '/field-service-scheduling': 'field-service-scheduling.html',
  '/how-hvac-dispatch-apps-reduce-phone-tag': 'how-hvac-dispatch-apps-reduce-phone-tag.html',
  '/mobile-dispatch-board': 'mobile-dispatch-board.html',
};

for (const [route, file] of Object.entries(pages)) {
  fastify.get(route, async (_request, reply) => {
    reply.type('text/html').send(readFileSync(join(root, file), 'utf8'));
  });
}

for (const asset of ['robots.txt', 'sitemap.xml', 'llms.txt', 'styles.css']) {
  fastify.get(`/${asset}`, async (_request, reply) => {
    if (!existsSync(join(root, asset))) return reply.code(404).send('Not found');
    const mime = asset.endsWith('.xml') ? 'application/xml' : asset.endsWith('.css') ? 'text/css' : 'text/plain';
    reply.type(mime).send(readFileSync(join(root, asset), 'utf8'));
  });
}

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const wantsHtml = (request) => String(request.headers.accept || '').includes('text/html');

const renderWaitlistResponsePage = ({ statusCode, title, heading, message, returnPath = '/' }) => {
  const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
  const header = (indexHtml.match(/<header>[\s\S]*?<\/header>/)?.[0] || '')
    .replace('href="#waitlist" class="nav-cta"', 'href="/#waitlist" class="nav-cta"');
  const currentScript = indexHtml.match(/<script>\s*\(\(\) => \{[\s\S]*?currentPath = location\.pathname[\s\S]*?\}\)\(\);\s*<\/script>/)?.[0] || '';
  const safeReturnPath = normalizePath(returnPath);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} | Gainhelm</title>
<meta name="robots" content="noindex,follow">
<link rel="stylesheet" href="/styles.css">
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
<div class="hero-actions"><a href="${escapeHtml(safeReturnPath)}#waitlist" class="cta-primary">Return to the waitlist</a><a href="/field-service-scheduling" class="cta-secondary">View scheduling software</a></div>
</div></div>
</section>
</main>
<footer><div>© 2026 Gainhelm. Built for field service dispatch.</div><div class="footer-links"><a href="/">Home</a> · <a href="/field-service-scheduling">Scheduling</a> · <a href="/sitemap.xml">sitemap.xml</a></div></footer>
${currentScript}
</body>
</html>`;
};

const renderRecoveryPage = ({ pathname, statusCode, title, heading, message }) => {
  const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
  const header = (indexHtml.match(/<header>[\s\S]*?<\/header>/)?.[0] || '')
    .replace('href="#waitlist" class="nav-cta"', 'href="/#waitlist" class="nav-cta"');
  const currentScript = indexHtml.match(/<script>\s*\(\(\) => \{[\s\S]*?currentPath = location\.pathname[\s\S]*?\}\)\(\);\s*<\/script>/)?.[0] || '';
  const safePath = escapeHtml(pathname);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} | Gainhelm</title>
<meta name="robots" content="noindex,follow">
<link rel="stylesheet" href="/styles.css">
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

fastify.setNotFoundHandler((request, reply) => {
  const pathname = normalizePath(request.raw.url);
  if (legacyGonePaths.has(pathname)) {
    return reply.code(410).type('text/html').send(renderRecoveryPage({
      pathname,
      statusCode: 410,
      title: 'Page retired',
      heading: 'This old page has been retired.',
      message: 'That legacy route is no longer part of Gainhelm, but the current field-service dispatch pages are still available.',
    }));
  }
  return reply.code(404).type('text/html').send(renderRecoveryPage({
    pathname,
    statusCode: 404,
    title: 'Page not found',
    heading: 'We could not find that dispatch page.',
    message: 'The route may be mistyped, outdated, or too ambiguous to redirect safely.',
  }));
});

fastify.post('/waitlist', async (request, reply) => {
  const { name, email, company } = request.body || {};
  const returnPath = request.headers.referer ? new URL(request.headers.referer, 'http://localhost').pathname : '/';

  if (!email) {
    if (wantsHtml(request)) {
      return reply.status(400).type('text/html').send(renderWaitlistResponsePage({
        statusCode: 400,
        title: 'Waitlist needs an email',
        heading: 'Please add your email before joining the waitlist.',
        message: 'The waitlist form needs a work email so we know where to send the early-access update.',
        returnPath,
      }));
    }
    return reply.status(400).send({ error: 'Email is required' });
  }

  if (!sql) {
    if (wantsHtml(request)) {
      return reply.status(503).type('text/html').send(renderWaitlistResponsePage({
        statusCode: 503,
        title: 'Waitlist temporarily unavailable',
        heading: 'We could not save your waitlist request right now.',
        message: 'Please return to the form and try again in a moment. Your browser stayed on Gainhelm instead of sending you to a dead end.',
        returnPath,
      }));
    }
    return reply.status(500).send({ error: 'DATABASE_URL is required' });
  }

  try {
    await sql`INSERT INTO waitlist_leads (name, email, company) VALUES (${name}, ${email}, ${company})`;
    if (wantsHtml(request)) {
      return reply.type('text/html').send(renderWaitlistResponsePage({
        statusCode: 200,
        title: 'Waitlist request received',
        heading: "You're on the waitlist.",
        message: "Thanks for joining. We'll be in touch when early access is ready.",
        returnPath,
      }));
    }
    return { success: true };
  } catch (err) {
    fastify.log.error(err);
    if (wantsHtml(request)) {
      return reply.status(500).type('text/html').send(renderWaitlistResponsePage({
        statusCode: 500,
        title: 'Waitlist submission failed',
        heading: 'We had trouble saving your waitlist request.',
        message: 'Please return to the form and try again in a moment.',
        returnPath,
      }));
    }
    return reply.status(500).send({ error: 'Failed to save lead' });
  }
});

fastify.listen({ port, host: '0.0.0.0' }, (err) => {
  if (err) throw err;
});
