import Fastify from 'fastify';
import postgres from 'postgres';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const fastify = Fastify({ logger: true });
const sql = process.env.DATABASE_URL ? postgres(process.env.DATABASE_URL) : null;
const waitlistApiUrl = process.env.WAITLIST_API_URL || 'https://api.gainhelm.com/waitlist';
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const root = process.cwd();

const contextStore = new Map();

if (sql) {
  (async () => {
    try {
      await sql`CREATE TABLE IF NOT EXISTS gainhelm_contexts (
        email VARCHAR(255) PRIMARY KEY,
        technicians TEXT,
        business_rules TEXT,
        calendar_config TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;
      fastify.log.info('Database table gainhelm_contexts ensured.');
    } catch (err) {
      fastify.log.error('Failed to initialize database table gainhelm_contexts:', err);
    }
  })();
}


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
  '/gainhelm-vs-servicetitan': '/servicetitan-alternative',
  '/gainhelm-vs-jobber': '/jobber-alternative',
  '/gainhelm-vs-housecallpro': '/housecallpro-alternative',
  '/gainhelm-vs-servicefusion': '/servicefusion-alternative',
  '/gainhelm-vs-buildops': '/buildops-alternative',
  '/gainhelm-vs-fieldedge': '/fieldedge-alternative',
  '/handyman-scheduling-software': '/handyman-dispatch-software',
  '/carpet-cleaning-scheduling-software': '/carpet-cleaning-dispatch-software',
  '/tree-service-scheduling-software': '/tree-service-dispatch-software',
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
  '/handyman-dispatch-software': 'handyman-dispatch-software.html',
  '/carpet-cleaning-dispatch-software': 'carpet-cleaning-dispatch-software.html',
  '/tree-service-dispatch-software': 'tree-service-dispatch-software.html',
  '/field-service-scheduling': 'field-service-scheduling.html',
  '/how-hvac-dispatch-apps-reduce-phone-tag': 'how-hvac-dispatch-apps-reduce-phone-tag.html',
  '/mobile-dispatch-board': 'mobile-dispatch-board.html',
  '/servicetitan-alternative': 'servicetitan-alternative.html',
  '/jobber-alternative': 'jobber-alternative.html',
  '/housecallpro-alternative': 'housecallpro-alternative.html',
  '/servicefusion-alternative': 'servicefusion-alternative.html',
  '/buildops-alternative': 'buildops-alternative.html',
  '/fieldedge-alternative': 'fieldedge-alternative.html',
  '/tools/facebook-post-generator': 'tools-facebook-post-generator.html',
};

for (const [route, file] of Object.entries(pages)) {
  fastify.get(route, async (_request, reply) => {
    reply.type('text/html').send(readFileSync(join(root, file), 'utf8'));
  });
}

for (const asset of ['robots.txt', 'sitemap.xml', 'llms.txt', 'styles.css', 'gainhelm_dashboard.png']) {
  fastify.get(`/${asset}`, async (_request, reply) => {
    if (!existsSync(join(root, asset))) return reply.code(404).send('Not found');
    const mime = asset.endsWith('.xml') ? 'application/xml' 
               : asset.endsWith('.css') ? 'text/css' 
               : asset.endsWith('.png') ? 'image/png' 
               : 'text/plain';
    if (asset.endsWith('.png')) {
      reply.type(mime).send(readFileSync(join(root, asset)));
    } else {
      reply.type(mime).send(readFileSync(join(root, asset), 'utf8'));
    }
  });
}

fastify.get('/favicon.ico', async (_request, reply) => {
  reply
    .type('image/svg+xml')
    .send('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#0f172a"/><path d="M9 17.2 14.2 22 24 10" fill="none" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>');
});

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const wantsHtml = (request) => String(request.headers.accept || '').includes('text/html');

const renderWaitlistResponsePage = ({ statusCode, title, heading, message, email = '', returnPath = '/' }) => {
  const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
  const header = (indexHtml.match(/<header>[\s\S]*?<\/header>/)?.[0] || '')
    .replace('href="#waitlist-form" class="nav-cta"', 'href="/#waitlist-form" class="nav-cta"');
  const currentScript = indexHtml.match(/<script>\s*\(\(\) => \{[\s\S]*?currentPath = location\.pathname[\s\S]*?\}\)\(\);\s*<\/script>/)?.[0] || '';
  const safeReturnPath = normalizePath(returnPath);

  const onboardingForm = email ? `
<div class="onboarding-box" style="margin-top: 30px; text-align: left; padding: 24px; background: #111827; border-radius: 14px; border: 1px solid #374151;">
  <h3 style="margin-bottom: 12px; font-size: 1.25rem; color: #fbbf24;">🚀 Try the AI Dispatcher Instantly</h3>
  <p style="margin-bottom: 16px; font-size: 0.92rem; color: #9ca3af;">
    Give us a few details and enter your phone number to launch an **interactive live simulation** of Gainhelm's SMS dispatch workflow.
  </p>
  <form action="/onboarding" method="POST" style="display: flex; flex-direction: column; gap: 12px;">
    <input type="hidden" name="email" value="${escapeHtml(email)}">
    <input type="hidden" name="returnPath" value="${escapeHtml(returnPath)}">
    
    <div>
      <label style="display: block; margin-bottom: 4px; font-size: 0.82rem; font-weight: 600; color: #d1d5db;">Primary Trade</label>
      <select name="trade" style="width: 100%; padding: 10px; background: #030712; border: 1px solid #374151; border-radius: 8px; color: #f3f4f6;" required>
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
      <label style="display: block; margin-bottom: 4px; font-size: 0.82rem; font-weight: 600; color: #d1d5db;">Number of Technicians</label>
      <select name="tech_count" style="width: 100%; padding: 10px; background: #030712; border: 1px solid #374151; border-radius: 8px; color: #f3f4f6;" required>
        <option value="1-5">1–5 techs</option>
        <option value="6-10">6–10 techs</option>
        <option value="11-20">11–20 techs</option>
        <option value="20+">20+ techs</option>
      </select>
    </div>
    
    <div>
      <label style="display: block; margin-bottom: 4px; font-size: 0.82rem; font-weight: 600; color: #d1d5db;">Mobile Phone (for demo context)</label>
      <input type="tel" name="phone" placeholder="+1 (555) 000-0000" style="width: 100%; padding: 10px; background: #030712; border: 1px solid #374151; border-radius: 8px; color: #f3f4f6;" required>
    </div>
    
    <button type="submit" class="cta-primary" style="margin-top: 8px; cursor: pointer; align-self: flex-start; border: none; padding: 10px 20px; background: #f59e0b; color: #030712; font-weight: bold; border-radius: 8px;">Launch SMS Simulator</button>
  </form>
</div>
  ` : '';

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

const renderRecoveryPage = ({ pathname, statusCode, title, heading, message }) => {
  const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
  const header = (indexHtml.match(/<header>[\s\S]*?<\/header>/)?.[0] || '')
    .replace('href="#waitlist-form" class="nav-cta"', 'href="/#waitlist-form" class="nav-cta"');
  const currentScript = indexHtml.match(/<script>\s*\(\(\) => \{[\s\S]*?currentPath = location\.pathname[\s\S]*?\}\)\(\);\s*<\/script>/)?.[0] || '';
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

  try {
    if (!sql) {
      const response = await fetch(waitlistApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, company }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        const message = result.error || 'Failed to save lead';
        if (wantsHtml(request)) {
          return reply.status(response.status).type('text/html').send(renderWaitlistResponsePage({
            statusCode: response.status,
            title: 'Waitlist submission failed',
            heading: 'We had trouble saving your waitlist request.',
            message: 'Please return to the form and try again in a moment.',
            returnPath,
          }));
        }
        return reply.status(response.status).send({ error: message });
      }

      if (wantsHtml(request)) {
        return reply.type('text/html').send(renderWaitlistResponsePage({
          statusCode: 200,
          title: 'Waitlist request received',
          heading: "You're on the waitlist.",
          message: "Thanks for joining. We'll be in touch when early access is ready.",
          email,
          returnPath,
        }));
      }
      return { success: true };
    }

    await sql`INSERT INTO waitlist_leads (name, email, company) VALUES (${name}, ${email}, ${company})`;
    if (wantsHtml(request)) {
      return reply.type('text/html').send(renderWaitlistResponsePage({
        statusCode: 200,
        title: 'Waitlist request received',
        heading: "You're on the waitlist.",
        message: "Thanks for joining. We'll be in touch when early access is ready.",
        email,
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

fastify.post('/onboarding', async (request, reply) => {
  const { email, trade, tech_count, phone, returnPath } = request.body || {};

  // Save onboarding details to database if connected
  if (sql) {
    try {
      // Self-heal table schema by adding columns if they don't exist
      await sql`ALTER TABLE waitlist_leads ADD COLUMN IF NOT EXISTS phone VARCHAR(50)`;
      await sql`ALTER TABLE waitlist_leads ADD COLUMN IF NOT EXISTS trade VARCHAR(100)`;
      await sql`ALTER TABLE waitlist_leads ADD COLUMN IF NOT EXISTS tech_count VARCHAR(50)`;

      // Update the record matching the email
      if (email) {
        await sql`UPDATE waitlist_leads SET phone = ${phone}, trade = ${trade}, tech_count = ${tech_count} WHERE email = ${email}`;
      }
    } catch (err) {
      fastify.log.error('Failed to update onboarding database details:', err);
    }
  }

  // Render the interactive SMS Dispatch Simulator Page
  const cleanTrade = escapeHtml(trade || 'HVAC');
  const cleanPhone = escapeHtml(phone || '+1 (555) 000-0000');

  return reply.type('text/html').send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Gainhelm AI Simulator</title>
<meta name="robots" content="noindex,follow">
<link rel="stylesheet" href="/styles.css?v=20260604-redesign">
<style>
  .phone-container {
    width: 320px;
    height: 520px;
    background: #090e1a;
    border: 8px solid #1f2937;
    border-radius: 36px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    box-shadow: 0 25px 50px -12px rgba(245, 158, 11, 0.25);
    margin: 30px auto;
  }
  .phone-header {
    height: 48px;
    background: #1f2937;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #f3f4f6;
    font-size: 0.85rem;
    font-weight: 700;
  }
  .phone-messages {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .msg {
    max-width: 80%;
    padding: 10px 14px;
    border-radius: 14px;
    font-size: 0.88rem;
    line-height: 1.4;
  }
  .msg-ai {
    background: #1f2937;
    color: #f3f4f6;
    align-self: flex-start;
    border-top-left-radius: 4px;
  }
  .msg-user {
    background: #fbbf24;
    color: #030712;
    align-self: flex-end;
    border-top-right-radius: 4px;
    font-weight: 500;
  }
  .phone-input-bar {
    height: 56px;
    background: #111827;
    border-top: 1px solid #1f2937;
    display: flex;
    padding: 8px;
    gap: 8px;
  }
  .phone-input {
    flex: 1;
    background: #030712;
    border: 1px solid #374151;
    border-radius: 18px;
    padding: 0 12px;
    color: #f3f4f6;
    font-size: 0.88rem;
  }
  .phone-send {
    background: #fbbf24;
    border: none;
    color: #030712;
    font-weight: 700;
    padding: 0 16px;
    border-radius: 18px;
    cursor: pointer;
    font-size: 0.85rem;
  }
</style>
</head>
<body>
<main style="padding: 20px; text-align: center;">
  <div style="max-width: 500px; margin: 0 auto;">
    <h2 style="color: #fbbf24; margin-bottom: 8px;">Gainhelm AI Dispatch Simulator</h2>
    <p style="font-size: 0.95rem; color: #9ca3af; margin-bottom: 20px;">
      Simulating dispatch for a <strong>${cleanTrade}</strong> company. Technician mobile phone: <strong>${cleanPhone}</strong>
    </p>
    
    <div class="phone-container">
      <div class="phone-header">
        Gainhelm Dispatcher
      </div>
      <div class="phone-messages" id="chat">
        <div class="msg msg-ai">
          Hi! I am your Gainhelm AI Dispatcher.
        </div>
        <div class="msg msg-ai">
          A new <strong>${cleanTrade.toLowerCase()}</strong> emergency request came in at 123 Main St. I have matched you for this job. Reply <strong>YES</strong> to accept.
        </div>
      </div>
      <form class="phone-input-bar" id="form" onsubmit="sendMessage(event)">
        <input type="text" class="phone-input" id="input" placeholder="Type YES to accept..." autocomplete="off">
        <button type="submit" class="phone-send">Send</button>
      </form>
    </div>
    
    <a href="/" class="cta-secondary" style="margin-top: 20px; display: inline-block;">Return to Homepage</a>
  </div>
</main>

<script>
  let step = 0;
  function sendMessage(e) {
    e.preventDefault();
    const input = document.getElementById('input');
    const text = input.value.trim();
    if (!text) return;
    
    addMessage(text, 'user');
    input.value = '';
    
    setTimeout(() => {
      if (text.toUpperCase() === 'YES') {
        addMessage('Awesome! Job scheduled in Google Calendar. Confirmation text sent to customer.', 'ai');
        step = 1;
      } else if (step === 1) {
        addMessage('You are already scheduled for this job. Navigate here: maps.google.com/?q=123+Main+St', 'ai');
      } else {
        addMessage('Sorry, I did not catch that. Reply YES to accept the dispatch offer.', 'ai');
      }
    }, 800);
  }
  
  function addMessage(text, sender) {
    const chat = document.getElementById('chat');
    const msg = document.createElement('div');
    msg.className = 'msg msg-' + sender;
    msg.innerHTML = text;
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
  }
</script>
</body>
</html>`);
});
const renderSetupPage = (email, context) => {
  const technicians = context ? JSON.parse(context.technicians) : [];
  const businessRules = context ? JSON.parse(context.business_rules) : { timeout: '3', pricing: '120', rules: '' };
  const calendarConfig = context ? JSON.parse(context.calendar_config) : { calendar_url: '', sandbox_mode: 'true' };

  let techRows = '';
  if (technicians.length === 0) {
    techRows = `
      <div class="tech-row" id="tech-row-0" style="display: flex; gap: 10px; margin-bottom: 12px; align-items: center;">
        <input type="text" name="tech_name_0" placeholder="Name" required style="flex: 1; padding: 10px; background: #030712; border: 1px solid #374151; border-radius: 8px; color: #f3f4f6;">
        <input type="tel" name="tech_phone_0" placeholder="Phone" required style="flex: 1; padding: 10px; background: #030712; border: 1px solid #374151; border-radius: 8px; color: #f3f4f6;">
        <select name="tech_trade_0" style="padding: 10px; background: #030712; border: 1px solid #374151; border-radius: 8px; color: #f3f4f6;">
          <option value="HVAC">HVAC</option>
          <option value="Plumbing">Plumbing</option>
          <option value="Electrical">Electrical</option>
          <option value="Cleaning">Cleaning</option>
          <option value="Landscaping">Landscaping</option>
          <option value="Other">Other</option>
        </select>
        <input type="text" name="tech_skills_0" placeholder="Skills" style="flex: 1; padding: 10px; background: #030712; border: 1px solid #374151; border-radius: 8px; color: #f3f4f6;">
        <button type="button" class="btn-remove" onclick="this.parentElement.remove()" style="padding: 10px 14px; background: #ef4444; border: none; border-radius: 8px; color: white; cursor: pointer; font-weight: bold;">✕</button>
      </div>
    `;
  } else {
    technicians.forEach((t, i) => {
      techRows += `
        <div class="tech-row" id="tech-row-${i}" style="display: flex; gap: 10px; margin-bottom: 12px; align-items: center;">
          <input type="text" name="tech_name_${i}" value="${escapeHtml(t.name)}" placeholder="Name" required style="flex: 1; padding: 10px; background: #030712; border: 1px solid #374151; border-radius: 8px; color: #f3f4f6;">
          <input type="tel" name="tech_phone_${i}" value="${escapeHtml(t.phone)}" placeholder="Phone" required style="flex: 1; padding: 10px; background: #030712; border: 1px solid #374151; border-radius: 8px; color: #f3f4f6;">
          <select name="tech_trade_${i}" style="padding: 10px; background: #030712; border: 1px solid #374151; border-radius: 8px; color: #f3f4f6;">
            <option value="HVAC" ${t.trade === 'HVAC' ? 'selected' : ''}>HVAC</option>
            <option value="Plumbing" ${t.trade === 'Plumbing' ? 'selected' : ''}>Plumbing</option>
            <option value="Electrical" ${t.trade === 'Electrical' ? 'selected' : ''}>Electrical</option>
            <option value="Cleaning" ${t.trade === 'Cleaning' ? 'selected' : ''}>Cleaning</option>
            <option value="Landscaping" ${t.trade === 'Landscaping' ? 'selected' : ''}>Landscaping</option>
            <option value="Other" ${t.trade === 'Other' || !['HVAC','Plumbing','Electrical','Cleaning','Landscaping'].includes(t.trade) ? 'selected' : ''}>Other</option>
          </select>
          <input type="text" name="tech_skills_${i}" value="${escapeHtml(t.skills || '')}" placeholder="Skills" style="flex: 1; padding: 10px; background: #030712; border: 1px solid #374151; border-radius: 8px; color: #f3f4f6;">
          <button type="button" class="btn-remove" onclick="this.parentElement.remove()" style="padding: 10px 14px; background: #ef4444; border: none; border-radius: 8px; color: white; cursor: pointer; font-weight: bold;">✕</button>
        </div>
      `;
    });
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Gainhelm AI Dispatcher Setup</title>
<meta name="robots" content="noindex,follow">
<link rel="stylesheet" href="/styles.css?v=20260604-redesign">
<style>
  .setup-container {
    max-width: 800px;
    margin: 40px auto;
    padding: 32px;
    background: hsl(var(--surface) / 0.9);
    border: 1px solid hsl(var(--line));
    border-radius: 20px;
    box-shadow: var(--shadow-lg);
  }
  .section-title {
    color: hsl(var(--brand-2));
    margin-bottom: 20px;
    font-size: 1.4rem;
    border-bottom: 1px solid hsl(var(--line));
    padding-bottom: 8px;
  }
  label {
    display: block;
    margin-bottom: 6px;
    font-size: 0.9rem;
    font-weight: 600;
    color: hsl(var(--text-2));
  }
  input[type="text"], input[type="tel"], select, textarea {
    width: 100%;
    padding: 12px;
    background: #030712;
    border: 1px solid hsl(var(--line));
    border-radius: 8px;
    color: hsl(var(--text));
    font-size: 0.95rem;
  }
  input[type="text"]:focus, input[type="tel"]:focus, select:focus, textarea:focus {
    border-color: hsl(var(--brand));
    outline: none;
  }
  .form-group {
    margin-bottom: 20px;
  }
  .btn-primary {
    background: hsl(var(--brand));
    color: #030712;
    font-weight: bold;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
  }
  .btn-primary:hover {
    background: hsl(var(--brand-2));
  }
</style>
</head>
<body>
<header>
  <a href="/" class="logo">
    <div class="logo-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
    </div>
    <span>Gainhelm</span>
  </a>
  <div style="font-size: 0.9rem; color: hsl(var(--brand-2)); font-weight: 700;">AI Configuration Wizard</div>
</header>
<main style="padding: 0 20px;">
  <div class="setup-container">
    <h1 style="color: #fff; margin-bottom: 8px; font-size: 2rem;">Setup your AI Dispatch Context</h1>
    <p style="color: hsl(var(--text-3)); margin-bottom: 30px;">
      Configure the rules and team details the AI agent uses to coordinate your dispatch operations automatically.
    </p>

    <form action="/setup" method="POST">
      <input type="hidden" name="email" value="${escapeHtml(email)}">

      <h3 class="section-title">1. Technicians Configuration</h3>
      <div id="tech-list">
        ${techRows}
      </div>
      <button type="button" class="cta-secondary" onclick="addTechRow()" style="margin-bottom: 30px; border: 1px dashed hsl(var(--line)); width: 100%; border-radius: 8px; padding: 12px; background: transparent; color: hsl(var(--brand-2)); font-weight: 600;">+ Add Technician</button>

      <h3 class="section-title">2. AI Dispatch & Business Rules</h3>
      <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div>
          <label>Response Timeout (Minutes)</label>
          <input type="number" name="timeout" value="${escapeHtml(businessRules.timeout)}" min="1" max="60" required>
        </div>
        <div>
          <label>Base Diagnostic Call Fee ($)</label>
          <input type="number" name="pricing" value="${escapeHtml(businessRules.pricing)}" min="0" required>
        </div>
      </div>
      <div class="form-group">
        <label>Custom Natural Language Business Rules</label>
        <textarea name="rules" rows="4" placeholder="E.g. 'John Connor is the primary tech for restoration. If Dave is on call, offer plumber tasks first.'">${escapeHtml(businessRules.rules)}</textarea>
      </div>

      <h3 class="section-title">3. Calendar & Integration</h3>
      <div class="form-group">
        <label>Google Calendar Integration Link</label>
        <input type="text" name="calendar_url" value="${escapeHtml(calendarConfig.calendar_url)}" placeholder="https://calendar.google.com/calendar/...">
      </div>
      <div class="form-group">
        <label>Sandbox / Twilio SMS Mode</label>
        <select name="sandbox_mode">
          <option value="true" ${calendarConfig.sandbox_mode === 'true' ? 'selected' : ''}>Simulation Mode (Mock SMS inside supervision board)</option>
          <option value="false" ${calendarConfig.sandbox_mode === 'false' ? 'selected' : ''}>Live Mode (Will fetch Twilio configuration from env)</option>
        </select>
      </div>

      <div style="margin-top: 30px; display: flex; justify-content: space-between; align-items: center;">
        <a href="/app?email=${escapeHtml(email)}" class="cta-secondary" style="font-weight: bold;">View Supervision Board</a>
        <button type="submit" class="btn-primary">Save & Launch Feed</button>
      </div>
    </form>
  </div>
</main>

<script>
  let rowIndex = ${Math.max(technicians.length, 1)};
  function addTechRow() {
    const list = document.getElementById('tech-list');
    const div = document.createElement('div');
    div.className = 'tech-row';
    div.id = 'tech-row-' + rowIndex;
    div.style = 'display: flex; gap: 10px; margin-bottom: 12px; align-items: center;';
    div.innerHTML = \`
      <input type="text" name="tech_name_\${rowIndex}" placeholder="Name" required style="flex: 1; padding: 10px; background: #030712; border: 1px solid #374151; border-radius: 8px; color: #f3f4f6;">
      <input type="tel" name="tech_phone_\${rowIndex}" placeholder="Phone" required style="flex: 1; padding: 10px; background: #030712; border: 1px solid #374151; border-radius: 8px; color: #f3f4f6;">
      <select name="tech_trade_\${rowIndex}" style="padding: 10px; background: #030712; border: 1px solid #374151; border-radius: 8px; color: #f3f4f6;">
        <option value="HVAC">HVAC</option>
        <option value="Plumbing">Plumbing</option>
        <option value="Electrical">Electrical</option>
        <option value="Cleaning">Cleaning</option>
        <option value="Landscaping">Landscaping</option>
        <option value="Other">Other</option>
      </select>
      <input type="text" name="tech_skills_\${rowIndex}" placeholder="Skills" style="flex: 1; padding: 10px; background: #030712; border: 1px solid #374151; border-radius: 8px; color: #f3f4f6;">
      <button type="button" class="btn-remove" onclick="this.parentElement.remove()" style="padding: 10px 14px; background: #ef4444; border: none; border-radius: 8px; color: white; cursor: pointer; font-weight: bold;">✕</button>
    \`;
    list.appendChild(div);
    rowIndex++;
  }
</script>
</body>
</html>`;
};

const renderAppPage = (email, context) => {
  const technicians = context ? JSON.parse(context.technicians) : [];
  const businessRules = context ? JSON.parse(context.business_rules) : { timeout: '3', pricing: '120', rules: '' };
  const calendarConfig = context ? JSON.parse(context.calendar_config) : { calendar_url: '', sandbox_mode: 'true' };

  let techListHtml = '';
  if (technicians.length === 0) {
    techListHtml = '<p style="color: hsl(var(--text-3)); font-style: italic;">No technicians configured yet.</p>';
  } else {
    technicians.forEach(t => {
      techListHtml += `
        <div style="padding: 12px; background: #030712; border: 1px solid hsl(var(--line)); border-radius: 8px; margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="color: #fff;">${escapeHtml(t.name)}</strong>
            <span class="brand-chip" style="font-size: 0.72rem; padding: 2px 6px; background: hsl(var(--brand) / 0.15); color: hsl(var(--brand-2)); border: 1px solid hsl(var(--brand) / 0.3); border-radius: 4px;">${escapeHtml(t.trade)}</span>
          </div>
          <div style="font-size: 0.82rem; color: hsl(var(--text-3)); margin-top: 4px;">
            📞 ${escapeHtml(t.phone)} <br>
            🛠️ Skills: ${escapeHtml(t.skills || 'None')}
          </div>
        </div>
      `;
    });
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Gainhelm AI Dispatch Board</title>
<meta name="robots" content="noindex,follow">
<link rel="stylesheet" href="/styles.css?v=20260604-redesign">
<style>
  .app-layout {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 24px;
    max-width: var(--container);
    margin: 30px auto;
    padding: 0 20px;
  }
  @media (max-width: 768px) {
    .app-layout {
      grid-template-columns: 1fr;
    }
  }
  .panel {
    background: hsl(var(--surface) / 0.95);
    border: 1px solid hsl(var(--line));
    border-radius: 16px;
    padding: 24px;
    box-shadow: var(--shadow-md);
  }
  .feed-container {
    height: 500px;
    border: 1px solid hsl(var(--line));
    border-radius: 12px;
    background: #030712;
    padding: 16px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    font-family: monospace;
    font-size: 0.9rem;
  }
  .feed-entry {
    padding: 8px 12px;
    border-radius: 6px;
    border-left: 3px solid #374151;
    background: #0b0f19;
    color: hsl(var(--text-2));
    line-height: 1.4;
  }
  .feed-entry.info {
    border-left-color: #3b82f6;
  }
  .feed-entry.ai {
    border-left-color: hsl(var(--brand));
  }
  .feed-entry.success {
    border-left-color: #10b981;
  }
  .feed-entry.warning {
    border-left-color: #f59e0b;
  }
  .feed-entry.error {
    border-left-color: #ef4444;
  }
  .time {
    color: hsl(var(--text-3));
    font-size: 0.78rem;
    margin-bottom: 2px;
  }
</style>
</head>
<body>
<header>
  <a href="/" class="logo">
    <div class="logo-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
    </div>
    <span>Gainhelm</span>
  </a>
  <div style="font-size: 0.9rem; color: hsl(var(--brand-2)); font-weight: 700;">Supervision Board</div>
</header>
<main>
  <div class="app-layout">
    <div class="panel" style="display: flex; flex-direction: column; gap: 20px;">
      <div>
        <h3 style="color: #fff; margin-bottom: 12px; font-size: 1.15rem;">Dispatcher Context</h3>
        <p style="font-size: 0.85rem; color: hsl(var(--text-3)); margin-bottom: 16px;">
          The active business configuration running on early-access sandbox.
        </p>
        <div style="font-size: 0.88rem; margin-bottom: 6px;">
          <span style="color: hsl(var(--text-3));">On behalf of:</span> <br>
          <strong style="color: hsl(var(--brand-2));">${escapeHtml(email)}</strong>
        </div>
      </div>

      <div>
        <h4 style="color: #fff; font-size: 0.95rem; margin-bottom: 8px; border-bottom: 1px solid hsl(var(--line)); padding-bottom: 4px;">Active Technicians</h4>
        ${techListHtml}
      </div>

      <div>
        <h4 style="color: #fff; font-size: 0.95rem; margin-bottom: 8px; border-bottom: 1px solid hsl(var(--line)); padding-bottom: 4px;">Business Rules</h4>
        <div style="font-size: 0.85rem; color: hsl(var(--text-2)); line-height: 1.4; display: flex; flex-direction: column; gap: 6px;">
          <div>⏱️ Timeout: <strong>${escapeHtml(businessRules.timeout)} min</strong></div>
          <div>💰 Call Fee: <strong>$${escapeHtml(businessRules.pricing)}</strong></div>
          <div>📜 Custom instructions: <br>
               <span style="color: hsl(var(--text-3)); font-style: italic;">"${escapeHtml(businessRules.rules || 'None set')}"</span></div>
        </div>
      </div>

      <a href="/setup?email=${escapeHtml(email)}" class="cta-secondary" style="text-align: center; font-weight: bold; border-color: hsl(var(--line)); border-radius: 8px; padding: 10px;">Modify Context</a>
    </div>

    <div class="panel" style="display: flex; flex-direction: column; gap: 20px;">
      <div>
        <h2 style="color: #fff; margin-bottom: 6px; font-size: 1.5rem;">AI Dispatch Supervision Board</h2>
        <p style="font-size: 0.9rem; color: hsl(var(--text-3));">
          Simulate work orders and monitor your AI agent's actions in real-time.
        </p>
      </div>

      <form id="simulate-form" onsubmit="triggerSimulation(event)" style="display: flex; gap: 12px; background: hsl(var(--surface-2)); padding: 14px; border-radius: 12px; border: 1px solid hsl(var(--line));">
        <div style="flex: 2;">
          <input type="text" id="job-desc" placeholder="E.g. Broken pipe at 789 Maple Rd or Emergency AC repair" required style="width: 100%; padding: 10px; background: #030712; border: 1px solid hsl(var(--line)); border-radius: 8px; color: #fff;">
        </div>
        <div style="flex: 1;">
          <select id="job-trade" style="width: 100%; padding: 10px; background: #030712; border: 1px solid hsl(var(--line)); border-radius: 8px; color: #fff;">
            <option value="HVAC">HVAC Required</option>
            <option value="Plumbing">Plumbing Required</option>
            <option value="Electrical">Electrical Required</option>
            <option value="Cleaning">Cleaning Required</option>
            <option value="Landscaping">Landscaping Required</option>
            <option value="Other">General / Other</option>
          </select>
        </div>
        <button type="submit" class="cta-primary" style="border: none; border-radius: 8px; padding: 10px 20px; font-weight: bold; cursor: pointer;">Dispatch Agent</button>
      </form>

      <div class="feed-container" id="feed">
        <div class="feed-entry info" style="border-left-color: hsl(var(--brand-2));">
          <div class="time">${new Date().toLocaleTimeString()}</div>
          Gainhelm AI Dispatcher is running in sandbox mode for <strong>${escapeHtml(email)}</strong>. Submit a job above to test dispatching.
        </div>
      </div>
    </div>
  </div>
</main>

<script>
  const technicians = ${JSON.stringify(technicians)};
  const rules = ${JSON.stringify(businessRules)};
  const calendar = ${JSON.stringify(calendarConfig)};
  
  let currentSim = null;

  function triggerSimulation(e) {
    e.preventDefault();
    const desc = document.getElementById('job-desc').value.trim();
    const trade = document.getElementById('job-trade').value;
    if (!desc) return;
    
    document.getElementById('job-desc').value = '';
    
    logEvent(\`📥 Job Request Received: "\${desc}" (Matches trade classification: \${trade})\`, 'info');
    
    setTimeout(() => {
      logEvent(\`🤖 Agent Reasoning: Loading business rules context (Call fee: $\${rules.pricing}, Timeout: \${rules.timeout} min).\`, 'ai');
    }, 800);

    setTimeout(() => {
      const match = technicians.find(t => t.trade.toUpperCase() === trade.toUpperCase()) 
                    || technicians.find(t => t.trade.toUpperCase() === 'OTHER' || t.trade.toUpperCase() === 'GENERAL')
                    || technicians[0];
      
      if (!match) {
        logEvent(\`⚠️ Agent Alert: No technicians are configured to handle trade \${trade}. Manual intervention required.\`, 'error');
        return;
      }
      
      logEvent(\`🤖 Agent Reasoning: Matched technician \${match.name} (\${match.phone}) for trade '\${trade}'.\`, 'ai');
      
      setTimeout(() => {
        logEvent(\`💬 Sent SMS to \${match.name} (\${match.phone}): "Gainhelm AI Offer: Emergency \${trade} job at \${desc}. Call Fee: $\${rules.pricing}. Reply YES to accept."\`, 'ai');
        showMockInteraction(match, trade, desc);
      }, 1000);

    }, 1800);
  }

  function logEvent(text, type = 'info') {
    const feed = document.getElementById('feed');
    const entry = document.createElement('div');
    entry.className = 'feed-entry ' + type;
    const timeStr = new Date().toLocaleTimeString();
    entry.innerHTML = \`<div class="time">\${timeStr}</div><div>\${text}</div>\`;
    feed.appendChild(entry);
    feed.scrollTop = feed.scrollHeight;
  }

  function showMockInteraction(tech, trade, desc) {
    const feed = document.getElementById('feed');
    const entry = document.createElement('div');
    entry.className = 'feed-entry warning';
    entry.id = 'pending-action';
    entry.innerHTML = \`
      <div class="time">\${new Date().toLocaleTimeString()}</div>
      <div style="font-weight: bold; margin-bottom: 8px;">⏳ Awaiting Technician SMS response...</div>
      <div style="display: flex; gap: 8px;">
        <button onclick="simulateTechResponse(true, '\${tech.name}', '\${trade}', '\${desc}')" style="padding: 6px 12px; background: #10b981; border: none; border-radius: 4px; color: #fff; font-weight: bold; cursor: pointer; font-size: 0.8rem;">Simulate Accept (YES)</button>
        <button onclick="simulateTechResponse(false, '\${tech.name}', '\${trade}', '\${desc}')" style="padding: 6px 12px; background: #ef4444; border: none; border-radius: 4px; color: #fff; font-weight: bold; cursor: pointer; font-size: 0.8rem;">Simulate Reject / Timeout</button>
      </div>
    \`;
    feed.appendChild(entry);
    feed.scrollTop = feed.scrollHeight;
  }

  function simulateTechResponse(accepted, techName, trade, desc) {
    const pending = document.getElementById('pending-action');
    if (pending) pending.remove();

    if (accepted) {
      logEvent(\`📱 Received SMS from \${techName}: "YES"\`, 'success');
      setTimeout(() => {
        logEvent(\`🤖 Agent Action: Booking job on Google Calendar (\${calendar.calendar_url || 'https://calendar.google.com'}).\`, 'ai');
      }, 800);
      setTimeout(() => {
        logEvent(\`✅ Dispatch Complete: \${techName} is assigned to "\${desc}". Customer notified.\`, 'success');
      }, 1600);
    } else {
      logEvent(\`📱 Received SMS from \${techName}: "DECLINE" or dispatch timeout of \${rules.timeout} minutes expired.\`, 'warning');
      
      setTimeout(() => {
        const nextMatch = technicians.find(t => t.name !== techName && (t.trade.toUpperCase() === trade.toUpperCase() || t.trade.toUpperCase() === 'OTHER'));
        if (nextMatch) {
          logEvent(\`🤖 Agent Reasoning: Rerouting job to fallback technician \${nextMatch.name} (\${nextMatch.phone}).\`, 'ai');
          setTimeout(() => {
            logEvent(\`💬 Sent SMS to \${nextMatch.name} (\${nextMatch.phone}): "Gainhelm AI Offer: Emergency \${trade} job at \${desc}. Call Fee: $\${rules.pricing}. Reply YES to accept."\`, 'ai');
            showMockInteraction(nextMatch, trade, desc);
          }, 1000);
        } else {
          logEvent(\`⚠️ Agent Alert: No fallback technicians are available matching trade '\${trade}'. Alerting manager.\`, 'error');
        }
      }, 800);
    }
  }
</script>
</body>
</html>`;
};

fastify.get('/setup', async (request, reply) => {
  const { email } = request.query || {};
  if (!email) {
    return reply.type('text/html').send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Gainhelm AI Config Setup</title>
<link rel="stylesheet" href="/styles.css?v=20260604-redesign">
<style>
  .setup-container {
    max-width: 480px;
    margin: 100px auto;
    padding: 32px;
    background: hsl(var(--surface) / 0.95);
    border: 1px solid hsl(var(--line));
    border-radius: 20px;
    box-shadow: var(--shadow-lg);
    text-align: center;
  }
</style>
</head>
<body>
<header>
  <a href="/" class="logo">
    <div class="logo-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
    </div>
    <span>Gainhelm</span>
  </a>
</header>
<main style="padding: 0 20px;">
  <div class="setup-container">
    <h2 style="color: #fff; margin-bottom: 12px;">Access AI Configuration</h2>
    <p style="color: hsl(var(--text-3)); font-size: 0.9rem; margin-bottom: 24px;">
      Enter the email you used to register on the waitlist to access your Gainhelm dispatcher settings.
    </p>
    <form action="/setup" method="GET" style="display: flex; flex-direction: column; gap: 12px;">
      <input type="email" name="email" placeholder="work@company.com" required>
      <button type="submit" class="cta-primary" style="border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer;">Continue to Setup</button>
    </form>
  </div>
</main>
</body>
</html>`);
  }

  let context = null;
  if (sql) {
    try {
      const results = await sql`SELECT * FROM gainhelm_contexts WHERE email = ${email}`;
      if (results.length > 0) {
        context = results[0];
      }
    } catch (err) {
      fastify.log.error('Failed to fetch context:', err);
    }
  }
  if (!context) {
    context = contextStore.get(email);
  }

  if (!context) {
    context = {
      email,
      technicians: JSON.stringify([
        { name: 'John Doe', phone: '+1 (555) 0199', trade: 'HVAC', skills: 'Emergency repair, wiring' },
        { name: 'Sarah Connor', phone: '+1 (555) 0288', trade: 'Plumbing', skills: 'Drain leak, pipe replace' },
        { name: 'David Miller', phone: '+1 (555) 0377', trade: 'Electrical', skills: 'Breaker box, wiring' }
      ]),
      business_rules: JSON.stringify({
        timeout: '3',
        pricing: '120',
        rules: 'Offered first to closest certified tech. If no reply, auto-fallback. Only send John for emergency HVAC. Do not dispatch after 9 PM unless emergency.'
      }),
      calendar_config: JSON.stringify({
        calendar_url: 'https://calendar.google.com/calendar/u/0/r',
        sandbox_mode: 'true'
      })
    };
  }

  return reply.type('text/html').send(renderSetupPage(email, context));
});

fastify.post('/setup', async (request, reply) => {
  const { email, timeout, pricing, rules, calendar_url, sandbox_mode } = request.body || {};

  if (!email) {
    return reply.status(400).send('Email is required');
  }

  const technicians = [];
  const techIndices = Object.keys(request.body)
    .filter(key => key.startsWith('tech_name_'))
    .map(key => parseInt(key.replace('tech_name_', ''), 10))
    .sort((a, b) => a - b);

  for (const index of techIndices) {
    const name = request.body[`tech_name_${index}`];
    if (name && name.trim()) {
      technicians.push({
        name: name.trim(),
        phone: request.body[`tech_phone_${index}`] || '',
        trade: request.body[`tech_trade_${index}`] || 'Other',
        skills: request.body[`tech_skills_${index}`] || ''
      });
    }
  }

  const context = {
    email,
    technicians: JSON.stringify(technicians),
    business_rules: JSON.stringify({ timeout, pricing, rules }),
    calendar_config: JSON.stringify({ calendar_url, sandbox_mode })
  };

  if (sql) {
    try {
      await sql`
        INSERT INTO gainhelm_contexts (email, technicians, business_rules, calendar_config)
        VALUES (${email}, ${context.technicians}, ${context.business_rules}, ${context.calendar_config})
        ON CONFLICT (email) DO UPDATE
        SET technicians = EXCLUDED.technicians,
            business_rules = EXCLUDED.business_rules,
            calendar_config = EXCLUDED.calendar_config,
            updated_at = CURRENT_TIMESTAMP
      `;
    } catch (err) {
      fastify.log.error('Failed to save context in PostgreSQL:', err);
    }
  }

  contextStore.set(email, context);

  return reply.redirect(`/app?email=${encodeURIComponent(email)}`);
});

fastify.get('/app', async (request, reply) => {
  const { email } = request.query || {};
  if (!email) {
    return reply.redirect('/setup');
  }

  let context = null;
  if (sql) {
    try {
      const results = await sql`SELECT * FROM gainhelm_contexts WHERE email = ${email}`;
      if (results.length > 0) {
        context = results[0];
      }
    } catch (err) {
      fastify.log.error('Failed to fetch context for app:', err);
    }
  }
  if (!context) {
    context = contextStore.get(email);
  }

  if (!context) {
    return reply.redirect(`/setup?email=${encodeURIComponent(email)}`);
  }

  return reply.type('text/html').send(renderAppPage(email, context));
});

fastify.listen({ port, host: '0.0.0.0' }, (err) => {
  if (err) throw err;
});

