import Fastify from 'fastify';
import postgres from 'postgres';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';

const fastify = Fastify({ logger: true });
const sql = process.env.DATABASE_URL ? postgres(process.env.DATABASE_URL) : null;
const waitlistApiUrl = process.env.WAITLIST_API_URL || 'https://api.gainhelm.com/waitlist';
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const root = process.cwd();

const contextStore = new Map();
const inMemoryLeads = [];
const inMemoryContractorLeads = [];

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

      await sql`CREATE TABLE IF NOT EXISTS gainhelm_dispatch_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL,
        job_description TEXT NOT NULL,
        trade VARCHAR(100) NOT NULL,
        simulated_time VARCHAR(50) NOT NULL,
        dispatched_to_name VARCHAR(255),
        dispatched_to_phone VARCHAR(50),
        status VARCHAR(50) NOT NULL,
        step_logs TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;
      fastify.log.info('Database table gainhelm_dispatch_logs ensured.');

      await sql`CREATE TABLE IF NOT EXISTS social_leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        platform VARCHAR(50) NOT NULL,
        source_url TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        snippet TEXT NOT NULL,
        intent_score INTEGER DEFAULT 50,
        status VARCHAR(50) DEFAULT 'discovered',
        suggested_reply TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS social_leads_source_url_idx ON social_leads (source_url);`;
      fastify.log.info('Database table social_leads ensured.');

      await sql`CREATE TABLE IF NOT EXISTS local_contractor_leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_name TEXT NOT NULL,
        owner_name TEXT,
        email TEXT UNIQUE,
        phone TEXT,
        website TEXT,
        city TEXT,
        state TEXT,
        trade TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'discovered',
        cold_email TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS local_contractor_leads_email_idx ON local_contractor_leads (email);`;
      fastify.log.info('Database table local_contractor_leads ensured.');
    } catch (err) {
      fastify.log.error('Failed to initialize database tables:', err);
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
  '/tools/lead-queue': 'tools-lead-queue.html',
  '/tools/contractor-leads': 'tools-contractor-leads.html',
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
    let dbSaved = false;
    if (sql) {
      try {
        await sql`INSERT INTO waitlist_leads (name, email, company) VALUES (${name}, ${email}, ${company})`;
        dbSaved = true;
      } catch (dbErr) {
        fastify.log.error('DB Waitlist insert failed, falling back to memory:', dbErr);
      }
    }

    if (!dbSaved) {
      inMemoryLeads.push({
        id: String(inMemoryLeads.length + 1),
        name,
        email,
        company,
        created_at: new Date().toISOString()
      });
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
      <div class="tech-card" id="tech-row-0">
        <div class="tech-card-grid">
          <div>
            <label>Name</label>
            <input type="text" name="tech_name_0" placeholder="John Doe" required>
          </div>
          <div>
            <label>Phone Number</label>
            <input type="tel" name="tech_phone_0" placeholder="+1 (555) 0100" required>
          </div>
          <div>
            <label>Trade Specialty</label>
            <select name="tech_trade_0">
              <option value="HVAC">HVAC</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Landscaping">Landscaping</option>
              <option value="Other">Other / General</option>
            </select>
          </div>
          <div>
            <label>Skills & Certifications</label>
            <input type="text" name="tech_skills_0" placeholder="Emergency repair, wiring">
          </div>
          <div>
            <label>Shift / Working Hours</label>
            <select name="tech_shift_0">
              <option value="Always">Always Available (24/7)</option>
              <option value="Standard">Standard Shift (Mon-Fri 8am-5pm)</option>
              <option value="Night">Night Shift (Mon-Fri 5pm-8am)</option>
              <option value="Weekend">Weekend Only (Sat-Sun)</option>
            </select>
          </div>
          <div>
            <label>Duty Status</label>
            <select name="tech_status_0">
              <option value="active">On Duty (Available)</option>
              <option value="inactive">Off Duty (Unavailable)</option>
            </select>
          </div>
        </div>
        <button type="button" class="btn-remove-card" onclick="removeTechRow(this)" title="Remove Technician">✕ Remove</button>
      </div>
    `;
  } else {
    technicians.forEach((t, i) => {
      const shift = t.shift || 'Always';
      const status = t.status || 'active';
      techRows += `
        <div class="tech-card" id="tech-row-${i}">
          <div class="tech-card-grid">
            <div>
              <label>Name</label>
              <input type="text" name="tech_name_${i}" value="${escapeHtml(t.name)}" placeholder="John Doe" required>
            </div>
            <div>
              <label>Phone Number</label>
              <input type="tel" name="tech_phone_${i}" value="${escapeHtml(t.phone)}" placeholder="+1 (555) 0100" required>
            </div>
            <div>
              <label>Trade Specialty</label>
              <select name="tech_trade_${i}">
                <option value="HVAC" ${t.trade === 'HVAC' ? 'selected' : ''}>HVAC</option>
                <option value="Plumbing" ${t.trade === 'Plumbing' ? 'selected' : ''}>Plumbing</option>
                <option value="Electrical" ${t.trade === 'Electrical' ? 'selected' : ''}>Electrical</option>
                <option value="Cleaning" ${t.trade === 'Cleaning' ? 'selected' : ''}>Cleaning</option>
                <option value="Landscaping" ${t.trade === 'Landscaping' ? 'selected' : ''}>Landscaping</option>
                <option value="Other" ${t.trade === 'Other' || !['HVAC','Plumbing','Electrical','Cleaning','Landscaping'].includes(t.trade) ? 'selected' : ''}>Other / General</option>
              </select>
            </div>
            <div>
              <label>Skills & Certifications</label>
              <input type="text" name="tech_skills_${i}" value="${escapeHtml(t.skills || '')}" placeholder="Emergency repair, wiring">
            </div>
            <div>
              <label>Shift / Working Hours</label>
              <select name="tech_shift_${i}">
                <option value="Always" ${shift === 'Always' ? 'selected' : ''}>Always Available (24/7)</option>
                <option value="Standard" ${shift === 'Standard' ? 'selected' : ''}>Standard Shift (Mon-Fri 8am-5pm)</option>
                <option value="Night" ${shift === 'Night' ? 'selected' : ''}>Night Shift (Mon-Fri 5pm-8am)</option>
                <option value="Weekend" ${shift === 'Weekend' ? 'selected' : ''}>Weekend Only (Sat-Sun)</option>
              </select>
            </div>
            <div>
              <label>Duty Status</label>
              <select name="tech_status_${i}">
                <option value="active" ${status === 'active' ? 'selected' : ''}>On Duty (Available)</option>
                <option value="inactive" ${status === 'inactive' ? 'selected' : ''}>Off Duty (Unavailable)</option>
              </select>
            </div>
          </div>
          <button type="button" class="btn-remove-card" onclick="removeTechRow(this)" title="Remove Technician">✕ Remove</button>
        </div>
      `;
    });
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Gainhelm AI Config Setup</title>
<meta name="robots" content="noindex,follow">
<link rel="stylesheet" href="/styles.css?v=20260604-redesign">
<style>
  body {
    background:
      radial-gradient(1200px 650px at 10% -10%, hsl(var(--brand) / 0.1), transparent 56%),
      radial-gradient(900px 520px at 88% 2%, hsl(var(--cta) / 0.05), transparent 50%),
      linear-gradient(180deg, hsl(var(--bg)) 0%, hsl(var(--bg-2)) 100%);
  }
  .setup-container {
    max-width: 800px;
    margin: 40px auto 80px auto;
    padding: 40px;
    background: hsl(var(--surface) / 0.7);
    backdrop-filter: blur(16px);
    border: 1px solid hsl(var(--line));
    border-radius: 24px;
    box-shadow: var(--shadow-lg);
  }
  .wizard-progress {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    margin-bottom: 40px;
    padding: 0 10px;
  }
  .wizard-progress::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 3px;
    background: hsl(var(--line));
    z-index: 1;
    transform: translateY(-50%);
  }
  .wizard-progress-bar {
    position: absolute;
    top: 50%;
    left: 0;
    width: 0%;
    height: 3px;
    background: linear-gradient(90deg, hsl(var(--brand)), hsl(var(--brand-2)));
    z-index: 2;
    transform: translateY(-50%);
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 0 8px hsl(var(--brand) / 0.5);
  }
  .progress-step {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: hsl(var(--surface));
    border: 2px solid hsl(var(--line));
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: hsl(var(--text-3));
    z-index: 3;
    transition: all 0.4s ease;
    cursor: pointer;
    font-size: 0.95rem;
  }
  .progress-step.active {
    border-color: hsl(var(--brand-2));
    background: hsl(var(--surface-3));
    color: hsl(var(--brand-2));
    box-shadow: 0 0 14px hsl(var(--brand) / 0.3);
  }
  .progress-step.completed {
    border-color: hsl(var(--brand));
    background: hsl(var(--brand));
    color: hsl(var(--bg));
  }
  .step-label {
    position: absolute;
    top: 52px;
    font-size: 0.78rem;
    font-weight: 700;
    color: hsl(var(--text-3));
    white-space: nowrap;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    transform: translateX(-35%);
  }
  .progress-step.active .step-label {
    color: hsl(var(--brand-2));
  }
  .progress-step.completed .step-label {
    color: hsl(var(--text-2));
  }
  .wizard-panel {
    display: none;
    animation: fadeInSlide 0.4s ease-out forwards;
  }
  .wizard-panel.active {
    display: block;
  }
  @keyframes fadeInSlide {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .section-title {
    color: #fff;
    margin-bottom: 24px;
    font-size: 1.6rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .section-subtitle {
    color: hsl(var(--text-3));
    font-size: 0.95rem;
    margin-bottom: 30px;
    line-height: 1.5;
  }
  .tech-card {
    background: hsl(var(--surface-2) / 0.6);
    border: 1px solid hsl(var(--line));
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 16px;
    position: relative;
    transition: all 0.3s ease;
  }
  .tech-card:hover {
    border-color: hsl(var(--brand) / 0.4);
    background: hsl(var(--surface-2) / 0.8);
  }
  .tech-card-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  @media (max-width: 600px) {
    .tech-card-grid {
      grid-template-columns: 1fr;
    }
  }
  label {
    display: block;
    margin-bottom: 8px;
    font-size: 0.85rem;
    font-weight: 700;
    color: hsl(var(--text-2));
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  input[type="text"], input[type="tel"], input[type="number"], select, textarea {
    width: 100%;
    padding: 12px 16px;
    background: #030712;
    border: 1px solid hsl(var(--line));
    border-radius: 10px;
    color: #fff;
    font-size: 0.95rem;
    transition: all 0.25s ease;
    font-family: inherit;
  }
  input[type="text"]:focus, input[type="tel"]:focus, input[type="number"]:focus, select:focus, textarea:focus {
    border-color: hsl(var(--brand-2));
    outline: none;
    box-shadow: 0 0 0 3px hsl(var(--brand-2) / 0.15);
    background: #080d1a;
  }
  .btn-remove-card {
    margin-top: 14px;
    background: hsl(0 72% 51% / 0.1);
    color: hsl(0 100% 70%);
    border: 1px solid hsl(0 72% 51% / 0.3);
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.82rem;
    font-weight: 700;
    transition: all 0.25s ease;
    display: inline-flex;
    align-items: center;
  }
  .btn-remove-card:hover {
    background: hsl(0 72% 51%);
    color: #fff;
  }
  .preset-tray {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
  }
  .preset-btn {
    background: hsl(var(--surface-3));
    border: 1px solid hsl(var(--line));
    color: hsl(var(--text-2));
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s ease;
  }
  .preset-btn:hover {
    border-color: hsl(var(--brand-2));
    color: #fff;
    background: hsl(var(--surface-3) / 1.5);
  }
  .button-bar {
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid hsl(var(--line));
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  #restore-banner {
    display: none; /* Controlled by loadDraft */
    align-items: center;
    justify-content: space-between;
    background: hsl(var(--brand) / 0.1);
    border: 1px dashed hsl(var(--brand) / 0.4);
    border-radius: 12px;
    padding: 12px 20px;
    margin-bottom: 24px;
    font-size: 0.88rem;
    color: #fff;
    font-family: inherit;
  }
  .btn-start-fresh {
    background: hsl(var(--surface-3));
    border: 1px solid hsl(var(--line));
    color: hsl(var(--text-2));
    padding: 6px 12px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 700;
    font-size: 0.8rem;
    transition: all 0.2s ease;
  }
  .btn-start-fresh:hover {
    background: hsl(0 72% 51% / 0.1);
    color: hsl(0 100% 70%);
    border-color: hsl(0 72% 51% / 0.4);
  }
</style>
</head>
<body>
<header>
  <a href="/" class="logo">
    <div class="logo-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
    </div>
    <span>Gainhelm</span>
  </a>
  <div style="font-size: 0.9rem; color: hsl(var(--brand-2)); font-weight: 700;">AI Configuration Wizard</div>
</header>
<main style="padding: 0 20px;">
  <div class="setup-container">
    <div id="restore-banner">
      <span>🔄 Resumed incomplete setup wizard session.</span>
      <button type="button" class="btn-start-fresh" onclick="clearDraft(); location.reload();">[Start Fresh]</button>
    </div>
    
    <!-- Progress Indicator -->
    <div class="wizard-progress">
      <div class="wizard-progress-bar" id="progress-bar"></div>
      <div class="progress-step active" id="step-dot-1" onclick="goToStep(1)">
        1
        <span class="step-label">👥 Team</span>
      </div>
      <div class="progress-step" id="step-dot-2" onclick="goToStep(2)">
        2
        <span class="step-label">⚙️ Rules</span>
      </div>
      <div class="progress-step" id="step-dot-3" onclick="goToStep(3)">
        3
        <span class="step-label">🔌 Launch</span>
      </div>
    </div>

    <form action="/setup" method="POST" id="wizard-form">
      <input type="hidden" name="email" value="${escapeHtml(email)}">

      <!-- STEP 1: Technicians -->
      <div class="wizard-panel active" id="step-panel-1">
        <h2 class="section-title">👥 Configure Your Dispatch Team</h2>
        <p class="section-subtitle">
          Define the active technician roster. The AI dispatcher will route incoming job requests to these technicians via interactive SMS offers based on their trade specialty and skills.
        </p>
        <div id="tech-list">
          ${techRows}
        </div>
        <button type="button" class="cta-secondary" onclick="addTechRow()" style="margin-top: 10px; border: 1px dashed hsl(var(--line)); width: 100%; border-radius: 12px; padding: 14px; background: transparent; color: hsl(var(--brand-2)); font-weight: 600; cursor: pointer;">
          + Add Team Member
        </button>
      </div>

      <!-- STEP 2: Business Rules -->
      <div class="wizard-panel" id="step-panel-2">
        <h2 class="section-title">⚙️ AI Dispatch Rules & Diagnostics</h2>
        <p class="section-subtitle">
          Specify response timeouts and call fees. Write custom guidelines to direct how the AI matches technicians, manages off-hours emergency schedules, or escalates unresolved dispatches.
        </p>
        
        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
          <div>
            <label>Response Timeout (Minutes)</label>
            <input type="number" name="timeout" value="${escapeHtml(businessRules.timeout)}" min="1" max="60" required>
          </div>
          <div>
            <label>Base Call Fee ($)</label>
            <input type="number" name="pricing" value="${escapeHtml(businessRules.pricing)}" min="0" required>
          </div>
        </div>
        
        <div class="form-group">
          <label>Custom Natural Language Guidelines</label>
          <div class="preset-tray">
            <span style="color: hsl(var(--text-3)); font-size: 0.8rem; line-height: 2.2; margin-right: 8px;">Presets:</span>
            <button type="button" class="preset-btn" onclick="applyPreset('hvac')">🔥 HVAC Priority</button>
            <button type="button" class="preset-btn" onclick="applyPreset('plumbing')">🚰 Plumbing Fallback</button>
            <button type="button" class="preset-btn" onclick="applyPreset('landscaping')">🍃 Landscaping Emergency</button>
          </div>
          <textarea id="rules-textarea" name="rules" rows="6" placeholder="Write custom dispatcher rules here...">${escapeHtml(businessRules.rules)}</textarea>
        </div>
      </div>

      <!-- STEP 3: Integrations & Sandbox -->
      <div class="wizard-panel" id="step-panel-3">
        <h2 class="section-title">🔌 Google Calendar & Sandbox Settings</h2>
        <p class="section-subtitle">
          Connect your Google Calendar link to record dispatched events. Choose between Simulation mode (interact with the dispatcher terminal on the board) or live Twilio mode.
        </p>

        <div class="form-group" style="margin-bottom: 24px;">
          <label>Google Calendar Integration Link</label>
          <input type="text" name="calendar_url" value="${escapeHtml(calendarConfig.calendar_url)}" placeholder="https://calendar.google.com/calendar/u/0/r...">
        </div>

        <div class="form-group">
          <label>SMS Gateway Operations Mode</label>
          <select name="sandbox_mode">
            <option value="true" ${calendarConfig.sandbox_mode === 'true' ? 'selected' : ''}>Simulation Mode (Mock SMS inside supervision board)</option>
            <option value="false" ${calendarConfig.sandbox_mode === 'false' ? 'selected' : ''}>Live Mode (Connect external Twilio SMS gateway)</option>
          </select>
        </div>
      </div>

      <!-- Navigation Bar -->
      <div class="button-bar">
        <button type="button" class="cta-secondary" id="btn-back" onclick="navigateStep(-1)" style="visibility: hidden; font-weight: bold; border-radius: 10px; padding: 12px 24px; cursor: pointer;">
          ← Back
        </button>
        <button type="button" class="cta-primary" id="btn-next" onclick="navigateStep(1)" style="border: none; border-radius: 10px; padding: 12px 28px; font-weight: bold; cursor: pointer;">
          Next Step →
        </button>
        <button type="submit" class="btn-primary" id="btn-submit" style="display: none; border: none; border-radius: 10px; padding: 12px 28px; font-weight: bold; cursor: pointer;">
          Save & Launch Board
        </button>
      </div>

    </form>
  </div>
</main>

<script>
  let currentStep = 1;
  let rowIndex = ${Math.max(technicians.length, 1)};
  let isRestoring = false;

  function updateWizardUI() {
    // Show active panel
    document.querySelectorAll('.wizard-panel').forEach((el, index) => {
      el.classList.toggle('active', index + 1 === currentStep);
    });

    // Update progress steps
    for (let s = 1; s <= 3; s++) {
      const dot = document.getElementById('step-dot-' + s);
      dot.classList.toggle('active', s === currentStep);
      dot.classList.toggle('completed', s < currentStep);
    }

    // Update progress bar width
    const percentage = ((currentStep - 1) / 2) * 100;
    document.getElementById('progress-bar').style.width = percentage + '%';

    // Show/hide buttons
    document.getElementById('btn-back').style.visibility = currentStep > 1 ? 'visible' : 'hidden';
    if (currentStep === 3) {
      document.getElementById('btn-next').style.display = 'none';
      document.getElementById('btn-submit').style.display = 'block';
    } else {
      document.getElementById('btn-next').style.display = 'block';
      document.getElementById('btn-submit').style.display = 'none';
    }
  }

  function saveDraft() {
    if (isRestoring) return;
    const emailInput = document.querySelector('input[name="email"]');
    if (!emailInput) return;
    const email = emailInput.value;
    if (!email) return;

    const technicians = [];
    const cards = document.querySelectorAll('#tech-list .tech-card');
    cards.forEach(card => {
      const nameInput = card.querySelector('input[name^="tech_name_"]');
      const phoneInput = card.querySelector('input[name^="tech_phone_"]');
      const tradeSelect = card.querySelector('select[name^="tech_trade_"]');
      const skillsInput = card.querySelector('input[name^="tech_skills_"]');
      const shiftSelect = card.querySelector('select[name^="tech_shift_"]');
      const statusSelect = card.querySelector('select[name^="tech_status_"]');

      if (nameInput) {
        technicians.push({
          name: nameInput.value,
          phone: phoneInput ? phoneInput.value : '',
          trade: tradeSelect ? tradeSelect.value : 'Other',
          skills: skillsInput ? skillsInput.value : '',
          shift: shiftSelect ? shiftSelect.value : 'Always',
          status: statusSelect ? statusSelect.value : 'active'
        });
      }
    });

    const timeoutInput = document.querySelector('input[name="timeout"]');
    const pricingInput = document.querySelector('input[name="pricing"]');
    const rulesTextarea = document.querySelector('#rules-textarea');
    const calendarUrlInput = document.querySelector('input[name="calendar_url"]');
    const sandboxSelect = document.querySelector('select[name="sandbox_mode"]');

    const draft = {
      currentStep: currentStep,
      technicians: technicians,
      businessRules: {
        timeout: timeoutInput ? timeoutInput.value : '3',
        pricing: pricingInput ? pricingInput.value : '120',
        rules: rulesTextarea ? rulesTextarea.value : ''
      },
      calendarConfig: {
        calendar_url: calendarUrlInput ? calendarUrlInput.value : '',
        sandbox_mode: sandboxSelect ? sandboxSelect.value : 'true'
      }
    };

    localStorage.setItem('gainhelm_wizard_draft_' + email, JSON.stringify(draft));
  }

  function clearDraft() {
    const emailInput = document.querySelector('input[name="email"]');
    if (emailInput) {
      const email = emailInput.value;
      if (email) {
        localStorage.removeItem('gainhelm_wizard_draft_' + email);
      }
    }
  }

  function removeTechRow(btn) {
    const card = btn.closest('.tech-card');
    if (card) {
      card.remove();
      saveDraft();
    }
  }

  function navigateStep(delta) {
    if (delta === 1) {
      // Validate active step inputs
      if (currentStep === 1) {
        const nameInputs = document.querySelectorAll('#tech-list input[type="text"][required]');
        let valid = true;
        nameInputs.forEach(i => {
          if (!i.value.trim()) {
            i.style.borderColor = '#ef4444';
            valid = false;
          } else {
            i.style.borderColor = '';
          }
        });
        if (!valid) {
          alert('Please specify the technician details before moving forward.');
          return;
        }
      }
    }
    currentStep += delta;
    updateWizardUI();
    saveDraft();
  }

  function goToStep(step) {
    if (step < currentStep || (step === 2 && currentStep === 1) || (step === 3 && currentStep === 2)) {
      currentStep = step;
      updateWizardUI();
      saveDraft();
    }
  }

  function addTechRow(data) {
    const list = document.getElementById('tech-list');
    const div = document.createElement('div');
    div.className = 'tech-card';
    div.id = 'tech-row-' + rowIndex;

    const nameVal = (data && data.name) ? data.name : '';
    const phoneVal = (data && data.phone) ? data.phone : '';
    const tradeVal = (data && data.trade) ? data.trade : 'HVAC';
    const skillsVal = (data && data.skills) ? data.skills : '';
    const shiftVal = (data && data.shift) ? data.shift : 'Always';
    const statusVal = (data && data.status) ? data.status : 'active';

    div.innerHTML = \`
      <div class="tech-card-grid">
        <div>
          <label>Name</label>
          <input type="text" name="tech_name_\${rowIndex}" value="\${nameVal.replace(/"/g, '&quot;')}" placeholder="John Doe" required>
        </div>
        <div>
          <label>Phone Number</label>
          <input type="tel" name="tech_phone_\${rowIndex}" value="\${phoneVal.replace(/"/g, '&quot;')}" placeholder="+1 (555) 0100" required>
        </div>
        <div>
          <label>Trade Specialty</label>
          <select name="tech_trade_\${rowIndex}">
            <option value="HVAC" \${tradeVal === 'HVAC' ? 'selected' : ''}>HVAC</option>
            <option value="Plumbing" \${tradeVal === 'Plumbing' ? 'selected' : ''}>Plumbing</option>
            <option value="Electrical" \${tradeVal === 'Electrical' ? 'selected' : ''}>Electrical</option>
            <option value="Cleaning" \${tradeVal === 'Cleaning' ? 'selected' : ''}>Cleaning</option>
            <option value="Landscaping" \${tradeVal === 'Landscaping' ? 'selected' : ''}>Landscaping</option>
            <option value="Other" \${tradeVal === 'Other' ? 'selected' : ''}>Other / General</option>
          </select>
        </div>
        <div>
          <label>Skills & Certifications</label>
          <input type="text" name="tech_skills_\${rowIndex}" value="\${skillsVal.replace(/"/g, '&quot;')}" placeholder="Emergency repair, wiring">
        </div>
        <div>
          <label>Shift / Working Hours</label>
          <select name="tech_shift_\${rowIndex}">
            <option value="Always" \${shiftVal === 'Always' ? 'selected' : ''}>Always Available (24/7)</option>
            <option value="Standard" \${shiftVal === 'Standard' ? 'selected' : ''}>Standard Shift (Mon-Fri 8am-5pm)</option>
            <option value="Night" \${shiftVal === 'Night' ? 'selected' : ''}>Night Shift (Mon-Fri 5pm-8am)</option>
            <option value="Weekend" \${shiftVal === 'Weekend' ? 'selected' : ''}>Weekend Only (Sat-Sun)</option>
          </select>
        </div>
        <div>
          <label>Duty Status</label>
          <select name="tech_status_\${rowIndex}">
            <option value="active" \${statusVal === 'active' ? 'selected' : ''}>On Duty (Available)</option>
            <option value="inactive" \${statusVal === 'inactive' ? 'selected' : ''}>Off Duty (Unavailable)</option>
          </select>
        </div>
      </div>
      <button type="button" class="btn-remove-card" onclick="removeTechRow(this)" title="Remove Technician">✕ Remove</button>
    \`;
    list.appendChild(div);
    rowIndex++;
    saveDraft();
  }

  function applyPreset(presetType) {
    const textarea = document.getElementById('rules-textarea');
    if (presetType === 'hvac') {
      textarea.value = 'Always route emergency AC calls to the primary technician Sarah Connor first. If Sarah does not accept the offer within 3 minutes, automatically route to David Miller. If no reply, raise an alert for the manager. Do not offer jobs after 9 PM unless they are classified as heating emergency in winter.';
    } else if (presetType === 'plumbing') {
      textarea.value = 'John Doe handles standard leak repairs. Emergency sewer backups must be offered to Sarah Connor. Fallback timeout is set to 3 minutes before dispatching to the next plumber on call.';
    } else if (presetType === 'landscaping') {
      textarea.value = 'David Miller handles lawn aeration and garden design. Tree removals require a minimum $250 call fee. If no matching tech is online, route tasks to fallback under Other trade.';
    }
    saveDraft();
  }

  function loadDraft() {
    const emailInput = document.querySelector('input[name="email"]');
    if (!emailInput) return;
    const email = emailInput.value;
    if (!email) return;

    const draftStr = localStorage.getItem('gainhelm_wizard_draft_' + email);
    if (!draftStr) return;

    try {
      const draft = JSON.parse(draftStr);
      if (!draft) return;

      isRestoring = true;

      // Restore static inputs
      if (draft.businessRules) {
        const timeoutInput = document.querySelector('input[name="timeout"]');
        if (timeoutInput && draft.businessRules.timeout !== undefined) {
          timeoutInput.value = draft.businessRules.timeout;
        }
        const pricingInput = document.querySelector('input[name="pricing"]');
        if (pricingInput && draft.businessRules.pricing !== undefined) {
          pricingInput.value = draft.businessRules.pricing;
        }
        const rulesTextarea = document.querySelector('#rules-textarea');
        if (rulesTextarea && draft.businessRules.rules !== undefined) {
          rulesTextarea.value = draft.businessRules.rules;
        }
      }

      if (draft.calendarConfig) {
        const calendarUrlInput = document.querySelector('input[name="calendar_url"]');
        if (calendarUrlInput && draft.calendarConfig.calendar_url !== undefined) {
          calendarUrlInput.value = draft.calendarConfig.calendar_url;
        }
        const sandboxSelect = document.querySelector('select[name="sandbox_mode"]');
        if (sandboxSelect && draft.calendarConfig.sandbox_mode !== undefined) {
          sandboxSelect.value = draft.calendarConfig.sandbox_mode;
        }
      }

      // Restore technicians
      if (draft.technicians && Array.isArray(draft.technicians)) {
        const list = document.getElementById('tech-list');
        if (list) {
          list.innerHTML = '';
          rowIndex = 0;
          draft.technicians.forEach(tech => {
            addTechRow(tech);
          });
        }
      }

      // Restore current step
      if (draft.currentStep !== undefined) {
        currentStep = parseInt(draft.currentStep, 10) || 1;
      }

      // Display banner
      const banner = document.getElementById('restore-banner');
      if (banner) {
        banner.style.display = 'flex';
      }

      isRestoring = false;
      
      updateWizardUI();
      saveDraft();
    } catch (e) {
      isRestoring = false;
      console.error('Failed to load draft:', e);
    }
  }

  const wizardForm = document.getElementById('wizard-form');
  if (wizardForm) {
    wizardForm.addEventListener('input', saveDraft);
    wizardForm.addEventListener('change', saveDraft);
    wizardForm.addEventListener('submit', clearDraft);
  }

  // Init Progress
  updateWizardUI();
  loadDraft();
</script>
</body>
</html>`;
};

const renderAuditTrailHtml = (logs) => {
  if (!logs || logs.length === 0) {
    return `<div style="text-align: center; color: hsl(var(--text-3)); font-style: italic; font-size: 0.85rem; padding: 20px 0;">No dispatch runs recorded yet. Run a simulation to log history.</div>`;
  }
  
  return logs.map(l => {
    const timeStr = new Date(l.created_at).toLocaleString();
    let statusColor = '#ef4444'; // Red for escalated
    let statusText = 'Escalated';
    if (l.status === 'accepted') {
      statusColor = '#10b981'; // Green
      statusText = 'Accepted';
    } else if (l.status === 'declined') {
      statusColor = '#f59e0b'; // Amber
      statusText = 'Declined';
    }
    
    const matchedTechStr = l.dispatched_to_name ? `${escapeHtml(l.dispatched_to_name)} (${escapeHtml(l.dispatched_to_phone)})` : 'None (System Escalation)';
    const logId = l.id;
    
    let steps = [];
    try {
      steps = JSON.parse(l.step_logs);
    } catch {
      steps = [];
    }
    
    const stepsHtml = steps.map(s => {
      let icon = 'ℹ️';
      if (s.includes('🤖')) icon = '🤖';
      else if (s.includes('📥')) icon = '📥';
      else if (s.includes('💬')) icon = '💬';
      else if (s.includes('📱')) icon = '📱';
      else if (s.includes('✅')) icon = '✅';
      else if (s.includes('⚠️')) icon = '⚠️';
      
      const cleanText = s
        .replace(/^[🤖📥💬📱✅⚠️]\s*/, '')
        .replace('Agent Reasoning:', '<strong>Reasoning:</strong>')
        .replace('Agent Alert:', '<strong>Alert:</strong>')
        .replace('Agent Action:', '<strong>Action:</strong>')
        .replace('Job Request Received:', '<strong>Job Received:</strong>')
        .replace('Sent SMS to', '<strong>SMS Sent to</strong>')
        .replace('Received SMS from', '<strong>SMS Recv from</strong>');
        
      return `<div style="font-size: 0.76rem; color: hsl(var(--text-2)); padding: 4px 0; border-bottom: 1px solid hsl(var(--line) / 0.3); display: flex; gap: 6px;">
        <span>${icon}</span>
        <span>${cleanText}</span>
      </div>`;
    }).join('');

    return `
      <div style="background: hsl(var(--surface-2) / 0.4); border: 1px solid hsl(var(--line)); border-radius: 12px; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid hsl(var(--line) / 0.5); padding-bottom: 6px;">
          <span style="font-size: 0.72rem; color: hsl(var(--text-3)); font-family: 'IBM Plex Mono', monospace;">📅 ${timeStr}</span>
          <span style="padding: 2px 8px; border-radius: 6px; background: ${statusColor}1A; color: ${statusColor}; border: 1px solid ${statusColor}33; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">${statusText}</span>
        </div>
        <div style="font-size: 0.84rem; color: #fff; line-height: 1.4;">
          🏢 <strong>Job:</strong> "${escapeHtml(l.job_description)}" <span class="brand-chip" style="font-size: 0.7rem; padding: 1px 5px; background: hsl(var(--brand) / 0.1); color: hsl(var(--brand-2)); border: 1px solid hsl(var(--brand) / 0.25); border-radius: 4px;">${escapeHtml(l.trade)}</span>
        </div>
        <div style="font-size: 0.8rem; color: hsl(var(--text-2));">
          👤 <strong>Dispatched to:</strong> ${matchedTechStr}
        </div>
        <div style="font-size: 0.8rem; color: hsl(var(--text-3));">
          ⏱️ <strong>Shift Time:</strong> ${escapeHtml(l.simulated_time)}
        </div>
        <div>
          <button type="button" onclick="document.getElementById('audit-details-${logId}').style.display = document.getElementById('audit-details-${logId}').style.display === 'none' ? 'block' : 'none'" 
                  class="preset-btn" style="margin: 0; padding: 4px 10px; font-size: 0.72rem; background: hsl(var(--surface-3)); border: 1px solid hsl(var(--line)); border-radius: 6px; cursor: pointer; color: hsl(var(--brand-2)); font-weight: bold;">
            Show Agent Reasoning Trail
          </button>
          <div id="audit-details-${logId}" style="display: none; margin-top: 8px; background: hsl(var(--bg) / 0.8); border: 1px solid hsl(var(--line)); border-radius: 8px; padding: 10px; max-height: 200px; overflow-y: auto; scrollbar-width: none;">
            ${stepsHtml}
          </div>
        </div>
      </div>
    `;
  }).join('');
};

const renderAppPage = (email, context, dispatchLogs = []) => {
  const technicians = context ? JSON.parse(context.technicians) : [];
  const businessRules = context ? JSON.parse(context.business_rules) : { timeout: '3', pricing: '120', rules: '' };
  const calendarConfig = context ? JSON.parse(context.calendar_config) : { calendar_url: '', sandbox_mode: 'true' };

  let techListHtml = '';
  if (technicians.length === 0) {
    techListHtml = '<p style="color: hsl(var(--text-3)); font-style: italic; font-size: 0.85rem;">No technicians configured.</p>';
  } else {
    technicians.forEach(t => {
      const shift = t.shift || 'Always';
      const status = t.status || 'active';
      const isOnline = status === 'active';
      const shiftLabels = {
        Always: '24/7 (Always Available)',
        Standard: 'Standard Shift (Mon-Fri 8-5)',
        Night: 'Night Shift (Mon-Fri 5pm-8am)',
        Weekend: 'Weekend Shift (Sat-Sun)'
      };
      const shiftLabel = shiftLabels[shift] || shift;

      const statusBadge = isOnline
        ? `<span style="display: inline-flex; align-items: center; gap: 6px; color: #10b981; font-weight: 700; font-size: 0.75rem;"><span style="width: 6px; height: 6px; background: #10b981; border-radius: 50%; box-shadow: 0 0 6px #10b981;"></span> On Duty</span>`
        : `<span style="display: inline-flex; align-items: center; gap: 6px; color: #94a3b8; font-weight: 700; font-size: 0.75rem;"><span style="width: 6px; height: 6px; background: #94a3b8; border-radius: 50%;"></span> Off Duty</span>`;

      techListHtml += `
        <div style="padding: 14px; background: hsl(var(--surface-2) / 0.5); border: 1px solid hsl(var(--line)); border-radius: 12px; margin-bottom: 10px; transition: all 0.25s ease;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="color: #fff; font-size: 0.92rem;">${escapeHtml(t.name)}</strong>
            <span class="brand-chip" style="font-size: 0.7rem; padding: 2px 6px; background: hsl(var(--brand) / 0.1); color: hsl(var(--brand-2)); border: 1px solid hsl(var(--brand) / 0.25); border-radius: 4px;">${escapeHtml(t.trade)}</span>
          </div>
          <div style="font-size: 0.8rem; color: hsl(var(--text-3)); line-height: 1.4; margin-bottom: 8px;">
            📞 ${escapeHtml(t.phone)} <br>
            🛠️ Skills: ${escapeHtml(t.skills || 'General maintenance')}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid hsl(var(--line) / 0.5); padding-top: 8px; font-size: 0.75rem; color: hsl(var(--text-3));">
            <span>⏱️ ${escapeHtml(shiftLabel)}</span>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span id="status-badge-${escapeHtml(t.name.replace(/\s+/g, '-'))}">${statusBadge}</span>
              <button type="button" onclick="toggleTechStatus('${escapeHtml(t.name)}')" class="preset-btn" style="margin: 0; padding: 2px 6px; font-size: 0.68rem; background: hsl(var(--surface-3)); border: 1px solid hsl(var(--line)); border-radius: 4px; cursor: pointer; color: hsl(var(--text-2)); font-weight: 500;">Toggle</button>
            </div>
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
  body {
    background:
      radial-gradient(1000px 500px at 50% -10%, hsl(var(--brand) / 0.08), transparent 50%),
      linear-gradient(180deg, hsl(var(--bg)) 0%, hsl(var(--bg-2)) 100%);
  }
  .app-grid {
    display: grid;
    grid-template-columns: 310px 1fr 340px;
    gap: 24px;
    max-width: 1450px;
    margin: 24px auto;
    padding: 0 24px;
  }
  @media (max-width: 1100px) {
    .app-grid {
      grid-template-columns: 1fr;
    }
  }
  .panel {
    background: hsl(var(--surface) / 0.75);
    backdrop-filter: blur(16px);
    border: 1px solid hsl(var(--line));
    border-radius: 20px;
    padding: 24px;
    box-shadow: var(--shadow-md);
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  /* Stats Cards */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
    max-width: 1450px;
    margin: 24px auto 0 auto;
    padding: 0 24px;
  }
  @media (max-width: 768px) {
    .stats-row {
      grid-template-columns: 1fr 1fr;
    }
  }
  .stat-card {
    background: hsl(var(--surface) / 0.75);
    backdrop-filter: blur(16px);
    border: 1px solid hsl(var(--line));
    border-radius: 16px;
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    box-shadow: var(--shadow-sm);
  }
  .stat-value {
    font-size: 1.8rem;
    font-weight: 800;
    color: #fff;
    line-height: 1.1;
  }
  .stat-label {
    font-size: 0.78rem;
    color: hsl(var(--text-3));
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Console Terminal */
  .console-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid hsl(var(--line));
    padding-bottom: 12px;
  }
  .console-status {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: monospace;
    font-size: 0.8rem;
    color: hsl(var(--brand-2));
  }
  .pulse-dot {
    width: 8px;
    height: 8px;
    background: #10b981;
    border-radius: 50%;
    box-shadow: 0 0 10px #10b981;
    animation: blink 1.5s infinite ease-in-out;
  }
  @keyframes blink {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 1; }
  }
  .console-filters {
    display: flex;
    gap: 6px;
  }
  .filter-btn {
    background: hsl(var(--surface-3));
    border: 1px solid hsl(var(--line));
    color: hsl(var(--text-3));
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .filter-btn.active {
    background: hsl(var(--brand) / 0.15);
    border-color: hsl(var(--brand));
    color: hsl(var(--brand-2));
  }
  .feed-container {
    height: 380px;
    border: 1px solid hsl(var(--line));
    border-radius: 12px;
    background: #020617;
    padding: 16px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.85rem;
  }
  .feed-entry {
    padding: 8px 12px;
    border-radius: 8px;
    line-height: 1.45;
    border-left: 3px solid #475569;
    background: #0f172a;
    color: hsl(var(--text-2));
  }
  .feed-entry.info {
    border-left-color: #3b82f6;
    background: rgba(59, 130, 246, 0.05);
  }
  .feed-entry.ai {
    border-left-color: hsl(var(--brand));
    background: rgba(245, 158, 11, 0.05);
    color: hsl(var(--brand-2));
  }
  .feed-entry.success {
    border-left-color: #10b981;
    background: rgba(16, 185, 129, 0.05);
  }
  .feed-entry.warning {
    border-left-color: #ef4444;
    background: rgba(239, 68, 68, 0.05);
  }
  .log-time {
    font-size: 0.72rem;
    color: hsl(var(--text-3));
    margin-bottom: 2px;
  }

  /* Interactive Phone Simulation */
  .phone-frame {
    width: 100%;
    background: #000;
    border: 10px solid #1e293b;
    border-radius: 36px;
    height: 520px;
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow-lg);
    position: relative;
    overflow: hidden;
  }
  .phone-frame::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 20px;
    background: #000;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
    z-index: 10;
  }
  .phone-screen {
    flex: 1;
    background: #0b0f19;
    display: flex;
    flex-direction: column;
    padding: 24px 12px 12px 12px;
  }
  .phone-header {
    border-bottom: 1px solid hsl(var(--line));
    padding: 8px 0 10px 0;
    text-align: center;
    color: #fff;
    font-weight: 700;
    font-size: 0.85rem;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .phone-chat-area {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 4px;
    scrollbar-width: none; /* Hide scrollbars */
  }
  .phone-chat-area::-webkit-scrollbar {
    display: none;
  }
  .sms-bubble {
    max-width: 80%;
    padding: 8px 12px;
    border-radius: 16px;
    font-size: 0.82rem;
    line-height: 1.35;
  }
  .sms-bubble.received {
    align-self: flex-start;
    background: #1e293b;
    color: #f1f5f9;
    border-bottom-left-radius: 4px;
  }
  .sms-bubble.sent {
    align-self: flex-end;
    background: hsl(var(--brand-2));
    color: #030712;
    font-weight: 600;
    border-bottom-right-radius: 4px;
  }
  .phone-input-bar {
    display: flex;
    gap: 6px;
    margin-top: 8px;
  }
  .phone-input-bar input {
    flex: 1;
    background: #020617;
    border: 1px solid hsl(var(--line));
    border-radius: 18px;
    padding: 6px 12px;
    color: #fff;
    font-size: 0.8rem;
  }
  .phone-send-btn {
    background: hsl(var(--brand));
    color: #030712;
    border: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-weight: 700;
  }
  .quick-reply-drawer {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding: 4px 0;
    margin-top: 8px;
    scrollbar-width: none;
  }
  .quick-reply-drawer::-webkit-scrollbar {
    display: none;
  }
  .quick-pill {
    background: hsl(var(--surface-3));
    border: 1px solid hsl(var(--line));
    color: hsl(var(--brand-2));
    padding: 4px 10px;
    border-radius: 14px;
    font-size: 0.74rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;
  }
  .quick-pill:hover {
    background: hsl(var(--brand) / 0.15);
    border-color: hsl(var(--brand));
  }

  /* Calendar Notification banner */
  .calendar-alert {
    position: absolute;
    top: -60px;
    left: 10px;
    right: 10px;
    background: hsl(var(--surface-2));
    border: 1px solid #10b981;
    border-radius: 12px;
    padding: 10px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: var(--shadow-md);
    transition: top 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    z-index: 100;
  }
  .calendar-alert.show {
    top: 30px;
  }
  .calendar-title {
    color: #fff;
    font-size: 0.8rem;
    font-weight: 700;
  }
  .calendar-sub {
    color: #10b981;
    font-size: 0.72rem;
    font-weight: 600;
  }
</style>
</head>
<body>
<header>
  <a href="/" class="logo">
    <div class="logo-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
    </div>
    <span>Gainhelm</span>
  </a>
  <div style="font-size: 0.9rem; color: hsl(var(--brand-2)); font-weight: 700;">Supervision Board</div>
</header>
<main>
  
  <!-- Stats Row -->
  <div class="stats-row">
    <div class="stat-card">
      <div class="stat-value" id="dispatch-count">0</div>
      <div class="stat-label">Dispatches Routed</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${technicians.length}</div>
      <div class="stat-label">Active Team</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" id="alert-count">0</div>
      <div class="stat-label">Pending Alerts</div>
    </div>
    <div class="stat-card">
      <div class="stat-value" id="match-rate">100%</div>
      <div class="stat-label">Match Success Rate</div>
    </div>
  </div>

  <div class="app-grid">
    
    <!-- LEFT PANEL: Context Detail -->
    <div class="panel">
      <div>
        <h3 style="color: #fff; margin-bottom: 8px; font-size: 1.15rem; font-weight: 700;">Dispatcher Context</h3>
        <p style="font-size: 0.82rem; color: hsl(var(--text-3)); line-height: 1.45;">
          Active rule sets running on the ProfitHelm sandbox gateway.
        </p>
      </div>

      <div style="background: hsl(var(--surface-2) / 0.5); border: 1px solid hsl(var(--line)); border-radius: 12px; padding: 12px 14px;">
        <div style="font-size: 0.76rem; text-transform: uppercase; color: hsl(var(--text-3)); font-weight: 700; margin-bottom: 4px;">Subscribed Owner</div>
        <strong style="color: hsl(var(--brand-2)); font-size: 0.88rem; overflow-wrap: break-word;">${escapeHtml(email)}</strong>
      </div>

      <div>
        <h4 style="color: #fff; font-size: 0.88rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid hsl(var(--line)); padding-bottom: 6px; margin-bottom: 10px;">Dispatch Rules</h4>
        <div style="font-size: 0.82rem; color: hsl(var(--text-2)); line-height: 1.5; display: flex; flex-direction: column; gap: 8px;">
          <div>⏱️ Reply Timeout: <strong>${escapeHtml(businessRules.timeout)} minutes</strong></div>
          <div>💰 Base Fee: <strong>$${escapeHtml(businessRules.pricing)}</strong></div>
          <div>📜 Custom Guidelines: <br>
               <span style="color: hsl(var(--text-3)); font-style: italic; font-size: 0.8rem; display: block; margin-top: 4px; border-left: 2px solid hsl(var(--brand)); padding-left: 8px;">
                 "${escapeHtml(businessRules.rules || 'No custom rules specified.')}"
               </span>
          </div>
        </div>
      </div>

      <div>
        <h4 style="color: #fff; font-size: 0.88rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid hsl(var(--line)); padding-bottom: 6px; margin-bottom: 12px;">Configured Team</h4>
        ${techListHtml}
      </div>

      <a href="/setup?email=${escapeHtml(email)}" class="cta-secondary" style="text-align: center; font-weight: bold; border-color: hsl(var(--line)); border-radius: 10px; padding: 12px; font-size: 0.9rem;">
        Modify AI Context
      </a>
    </div>

    <!-- CENTER PANEL: AI Terminal Console & Recent Dispatches -->
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div class="panel" style="gap: 16px;">
        <div class="console-header">
          <div>
            <h2 style="color: #fff; font-size: 1.35rem; font-weight: 700; margin-bottom: 2px;">AI Dispatch Terminal</h2>
            <div class="console-status">
              <span class="pulse-dot"></span>
              <span>SYSTEM ON: GATEWAY_SIMULATOR</span>
            </div>
          </div>
          <div class="console-filters">
            <button class="filter-btn active" id="btn-filter-all" onclick="filterLogs('all')">ALL</button>
            <button class="filter-btn" id="btn-filter-ai" onclick="filterLogs('ai')">REASONING</button>
            <button class="filter-btn" id="btn-filter-sms" onclick="filterLogs('sms')">SMS</button>
          </div>
        </div>

        <div class="feed-container" id="feed">
          <div class="feed-entry info">
            <div class="log-time">${new Date().toLocaleTimeString()}</div>
            Gainhelm AI Dispatcher is running in sandbox mode for <strong>${escapeHtml(email)}</strong>. Submit a job request below to trigger the simulation.
          </div>
        </div>

        <!-- Simulator Form -->
        <form id="simulate-form" onsubmit="triggerSimulation(event)" style="display: flex; flex-direction: column; gap: 12px; background: hsl(var(--surface-2) / 0.4); padding: 18px; border-radius: 14px; border: 1px solid hsl(var(--line));">
          <div style="font-weight: 700; color: #fff; font-size: 0.85rem; text-transform: uppercase;">Simulate Dispatch Request</div>
          <div style="display: flex; gap: 10px;">
            <div style="flex: 2;">
              <input type="text" id="job-desc" placeholder="E.g. Broken pipe at 789 Maple Rd or AC repair" required>
            </div>
            <div style="flex: 1;">
              <select id="job-trade">
                <option value="HVAC">HVAC</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Landscaping">Landscaping</option>
                <option value="Other">Other / General</option>
              </select>
            </div>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <label for="job-time" style="font-size: 0.72rem; color: hsl(var(--text-3)); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: block;">Simulated Job Time</label>
            <select id="job-time" style="width: 100%;">
              <option value="BusinessHours">Normal Business Hours (Mon-Fri 9am-5pm)</option>
              <option value="AfterHours">After Hours / Late Night (Mon-Fri 11pm)</option>
              <option value="Weekend">Weekend / Off-Shift Hours (Saturday 2pm)</option>
            </select>
          </div>
          
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <span style="font-size: 0.78rem; color: hsl(var(--text-3)); align-self: center;">Quick Prompts:</span>
            <button type="button" class="preset-btn" onclick="fillPrompt('AC making loud buzzing noise', 'HVAC')">AC Noise (HVAC)</button>
            <button type="button" class="preset-btn" onclick="fillPrompt('Kitchen sink leaking under cabinet', 'Plumbing')">Leak (Plumbing)</button>
            <button type="button" class="preset-btn" onclick="fillPrompt('Living room outlets lost power', 'Electrical')">Outlets (Electrical)</button>
          </div>

          <button type="submit" class="cta-primary" style="border: none; border-radius: 10px; padding: 12px; font-weight: bold; cursor: pointer; font-size: 0.95rem; margin-top: 6px;">
            Dispatch Work Order
          </button>
        </form>
      </div>

      <!-- Recent Dispatches Audit Trail -->
      <div class="panel" style="gap: 16px;">
        <div>
          <h3 style="color: #fff; margin-bottom: 4px; font-size: 1.15rem; font-weight: 700;">Recent Dispatches (Audit Trail)</h3>
          <p style="font-size: 0.82rem; color: hsl(var(--text-3)); line-height: 1.45;">
            Persistent history of dispatcher runs stored in PostgreSQL database.
          </p>
        </div>
        
        <div id="audit-trail-container" style="display: flex; flex-direction: column; gap: 10px; max-height: 350px; overflow-y: auto; scrollbar-width: none;">
          ${renderAuditTrailHtml(dispatchLogs)}
        </div>
      </div>
    </div>

    <!-- RIGHT PANEL: Live Phone Emulator -->
    <div class="panel" style="align-items: center; justify-content: center;">
      <div class="phone-frame">
        
        <!-- Google Calendar Slide Notification -->
        <div class="calendar-alert" id="calendar-alert">
          <div style="background: #10b981; color: #000; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: bold;">📅</div>
          <div style="flex: 1;">
            <div class="calendar-title">Google Calendar Event</div>
            <div class="calendar-sub" id="calendar-event-text">Job scheduled successfully!</div>
          </div>
        </div>

        <div class="phone-screen">
          
          <div class="phone-header">
            <span id="phone-title" style="color: hsl(var(--brand-2));">💬 Dispatch Simulation</span>
            <span id="phone-subtitle" style="font-size: 0.72rem; color: hsl(var(--text-3)); font-weight: 500;">No active dispatches</span>
          </div>

          <div class="phone-chat-area" id="phone-chat">
            <div style="text-align: center; color: hsl(var(--text-3)); font-size: 0.78rem; margin-top: 100px;">
              📵 Waiting for incoming dispatch SMS.
            </div>
          </div>

          <!-- Quick replies tray -->
          <div class="quick-reply-drawer" id="quick-replies" style="display: none;">
            <button type="button" class="quick-pill" onclick="sendMockSMS('YES')">YES</button>
            <button type="button" class="quick-pill" onclick="sendMockSMS('DECLINE')">DECLINE</button>
            <button type="button" class="quick-pill" onclick="sendMockSMS('I am busy right now')">I am busy</button>
          </div>

          <div class="phone-input-bar">
            <input type="text" id="phone-input" placeholder="Type response..." onkeydown="if(event.key === 'Enter') submitPhoneSMS()">
            <button class="phone-send-btn" onclick="submitPhoneSMS()">↑</button>
          </div>

        </div>
      </div>
      <p style="font-size: 0.78rem; color: hsl(var(--text-3)); text-align: center; max-width: 280px; margin-top: 6px; line-height: 1.45;">
        Simulate the technician's phone! Use the keyboard or quick-replies to accept/decline job notifications.
      </p>
    </div>

  </div>
</main>

<script>
  const escapeHtml = (str) => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const technicians = ${JSON.stringify(technicians)};
  const rules = ${JSON.stringify(businessRules)};
  const calendar = ${JSON.stringify(calendarConfig)};
  
  let dispatchCount = 0;
  let activeAlerts = 0;
  let activeTech = null;
  let activeJob = '';
  let activeTrade = '';
  let currentStep = 0; // State machine step for conversation simulation
  let currentSessionLogs = [];

  function isTechOnShift(tech, simulatedTime) {
    const shift = tech.shift || 'Always';
    if (shift === 'Always') return true;
    if (simulatedTime === 'BusinessHours' && shift === 'Standard') return true;
    if (simulatedTime === 'AfterHours' && shift === 'Night') return true;
    if (simulatedTime === 'Weekend' && shift === 'Weekend') return true;
    return false;
  }

  function findEligibleTechnician(trade, simulatedTime, excludeTechName = null) {
    logEvent(\`🤖 Agent Reasoning: Evaluating active roster matching trade '\${trade}' or General fallback.\`, 'ai');
    
    // First pass: look for exact trade match
    const tradeTechs = technicians.filter(t => t.trade.toUpperCase() === trade.toUpperCase() && t.name !== excludeTechName);
    
    for (const t of tradeTechs) {
      const status = t.status || 'active';
      const shift = t.shift || 'Always';
      const isOnShift = isTechOnShift(t, simulatedTime);
      const isOnline = status === 'active';
      
      if (!isOnline) {
        logEvent(\`🤖 Agent Reasoning: Checked \${t.name} (Trade: \${t.trade}). Skipped - status is Off Duty.\`, 'ai');
        continue;
      }
      if (!isOnShift) {
        logEvent(\`🤖 Agent Reasoning: Checked \${t.name} (Trade: \${t.trade}, Shift: \${shift}). Skipped - shift not active for \${simulatedTime}.\`, 'ai');
        continue;
      }
      
      logEvent(\`🤖 Agent Reasoning: Checked \${t.name}. Eligible and available (On Duty, shift active).\`, 'ai');
      return t;
    }
    
    // Second pass: look for General / Other fallback
    logEvent(\`🤖 Agent Reasoning: No exact trade match available on shift. Checking 'Other/General' fallbacks.\`, 'ai');
    const fallbackTechs = technicians.filter(t => 
      (t.trade.toUpperCase() === 'OTHER' || t.trade.toUpperCase() === 'GENERAL') && t.name !== excludeTechName
    );
    
    for (const t of fallbackTechs) {
      const status = t.status || 'active';
      const shift = t.shift || 'Always';
      const isOnShift = isTechOnShift(t, simulatedTime);
      const isOnline = status === 'active';
      
      if (!isOnline) {
        logEvent(\`🤖 Agent Reasoning: Checked fallback \${t.name} (Trade: \${t.trade}). Skipped - status is Off Duty.\`, 'ai');
        continue;
      }
      if (!isOnShift) {
        logEvent(\`🤖 Agent Reasoning: Checked fallback \${t.name} (Trade: \${t.trade}, Shift: \${shift}). Skipped - shift not active for \${simulatedTime}.\`, 'ai');
        continue;
      }
      
      logEvent(\`🤖 Agent Reasoning: Checked fallback \${t.name}. Eligible and available (On Duty, shift active).\`, 'ai');
      return t;
    }

    return null;
  }

  function triggerSimulation(e) {
    if (e) e.preventDefault();
    const desc = document.getElementById('job-desc').value.trim();
    const trade = document.getElementById('job-trade').value;
    const simTime = document.getElementById('job-time').value;
    if (!desc) return;
    
    currentSessionLogs = [];
    
    document.getElementById('job-desc').value = '';
    activeJob = desc;
    activeTrade = trade;
    currentStep = 1;
    dispatchCount++;
    document.getElementById('dispatch-count').innerText = dispatchCount;
    
    // Clear chat simulation
    const chat = document.getElementById('phone-chat');
    chat.innerHTML = '';
    document.getElementById('quick-replies').style.display = 'flex';

    logEvent(\`📥 Job Request Received: "\${desc}" (Trade Required: \${trade}, Time: \${simTime})\`, 'info');
    
    setTimeout(() => {
      logEvent(\`🤖 Agent Reasoning: Evaluated dispatch rules (Fee: $\${rules.pricing}, Timeout: \${rules.timeout} min).\`, 'ai');
    }, 800);

    setTimeout(() => {
      const match = findEligibleTechnician(trade, simTime);
      
      if (!match) {
        logEvent(\`⚠️ Agent Alert: No technicians are available for trade '\${trade}' during \${simTime}. Escalation triggered.\`, 'warning');
        activeAlerts++;
        document.getElementById('alert-count').innerText = activeAlerts;
        
        chat.innerHTML = \`<div style="text-align: center; color: #ef4444; font-size: 0.78rem; margin-top: 80px;">⚠️ Dispatch Alert: No active technician found for \${trade} during \${simTime}</div>\`;
        document.getElementById('phone-subtitle').innerText = 'System Alert';
        saveDispatchLog('escalated');
        return;
      }
      
      activeTech = match;
      document.getElementById('phone-title').innerText = '💬 ' + match.name;
      document.getElementById('phone-subtitle').innerText = match.trade + ' • ' + match.phone;
      
      logEvent(\`🤖 Agent Reasoning: Dispatched job to technician \${match.name} (\${match.phone}) for trade '\${trade}'.\`, 'ai');
      
      setTimeout(() => {
        const smsText = \`Gainhelm AI Offer: Emergency \${trade} job at \${desc}. Call Fee: $\${rules.pricing}. Reply YES to accept, or NO to decline.\`;
        logEvent(\`💬 Sent SMS to \${match.name}: "\${smsText}"\`, 'sms');
        addPhoneSMS(smsText, 'received');
      }, 1000);

    }, 1800);
  }

  function logEvent(text, type = 'info') {
    const feed = document.getElementById('feed');
    const entry = document.createElement('div');
    entry.className = 'feed-entry ' + type;
    const timeStr = new Date().toLocaleTimeString();
    entry.innerHTML = \`<div class="log-time">\${timeStr}</div><div>\${text}</div>\`;
    feed.appendChild(entry);
    feed.scrollTop = feed.scrollHeight;

    // Track logs
    let icon = '';
    if (type === 'ai') icon = '🤖 ';
    else if (type === 'sms') icon = '💬 ';
    else if (type === 'info' && text.includes('📥')) icon = '';
    else if (type === 'info') icon = 'ℹ️ ';
    else if (type === 'warning') icon = '⚠️ ';
    else if (type === 'success') icon = '✅ ';
    currentSessionLogs.push(icon + text);
  }

  function saveDispatchLog(status) {
    const body = {
      email: ${JSON.stringify(email)},
      jobDescription: activeJob,
      trade: activeTrade,
      simulatedTime: document.getElementById('job-time').value,
      dispatchedToName: activeTech ? activeTech.name : null,
      dispatchedToPhone: activeTech ? activeTech.phone : null,
      status: status,
      stepLogs: currentSessionLogs
    };
    fetch('/app/log-dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(res => res.json())
      .then(data => {
        if (data.success) {
          appendAuditTrailRow(body);
        }
      }).catch(err => console.error('Error logging dispatch:', err));
  }

  function appendAuditTrailRow(body) {
    const container = document.getElementById('audit-trail-container');
    if (!container) return;
    
    const placeholder = container.querySelector('div[style*="font-style: italic"]');
    if (placeholder) {
      placeholder.remove();
    }
    
    const timeStr = new Date().toLocaleString();
    let statusColor = '#ef4444';
    let statusText = 'Escalated';
    if (body.status === 'accepted') {
      statusColor = '#10b981';
      statusText = 'Accepted';
    } else if (body.status === 'declined') {
      statusColor = '#f59e0b';
      statusText = 'Declined';
    }
    
    const matchedTechStr = body.dispatchedToName ? \`\${escapeHtml(body.dispatchedToName)} (\${escapeHtml(body.dispatchedToPhone)})\` : 'None (System Escalation)';
    const logId = 'temp-' + Math.random().toString(36).substring(7);
    
    const stepsHtml = body.stepLogs.map(s => {
      let icon = 'ℹ️';
      if (s.includes('🤖')) icon = '🤖';
      else if (s.includes('📥')) icon = '📥';
      else if (s.includes('💬')) icon = '💬';
      else if (s.includes('📱')) icon = '📱';
      else if (s.includes('✅')) icon = '✅';
      else if (s.includes('⚠️')) icon = '⚠️';
      
      const cleanText = s
        .replace(/^[🤖📥💬📱✅⚠️]\\s*/, '')
        .replace('Agent Reasoning:', '<strong>Reasoning:</strong>')
        .replace('Agent Alert:', '<strong>Alert:</strong>')
        .replace('Agent Action:', '<strong>Action:</strong>')
        .replace('Job Request Received:', '<strong>Job Received:</strong>')
        .replace('Sent SMS to', '<strong>SMS Sent to</strong>')
        .replace('Received SMS from', '<strong>SMS Recv from</strong>');
        
      return \`<div style="font-size: 0.76rem; color: hsl(var(--text-2)); padding: 4px 0; border-bottom: 1px solid hsl(var(--line) / 0.3); display: flex; gap: 6px;">
        <span>\${icon}</span>
        <span>\${cleanText}</span>
      </div>\`;
    }).join('');

    const row = document.createElement('div');
    row.style.cssText = 'background: hsl(var(--surface-2) / 0.4); border: 1px solid hsl(var(--line)); border-radius: 12px; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; animation: slideIn 0.3s ease-out;';
    row.innerHTML = \`
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid hsl(var(--line) / 0.5); padding-bottom: 6px;">
        <span style="font-size: 0.72rem; color: hsl(var(--text-3)); font-family: 'IBM Plex Mono', monospace;">📅 \${timeStr}</span>
        <span style="padding: 2px 8px; border-radius: 6px; background: \${statusColor}1A; color: \${statusColor}; border: 1px solid \${statusColor}33; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">\${statusText}</span>
      </div>
      <div style="font-size: 0.84rem; color: #fff; line-height: 1.4;">
        🏢 <strong>Job:</strong> "\${escapeHtml(body.jobDescription)}" <span class="brand-chip" style="font-size: 0.7rem; padding: 1px 5px; background: hsl(var(--brand) / 0.1); color: hsl(var(--brand-2)); border: 1px solid hsl(var(--brand) / 0.25); border-radius: 4px;">\${escapeHtml(body.trade)}</span>
      </div>
      <div style="font-size: 0.8rem; color: hsl(var(--text-2));">
        👤 <strong>Dispatched to:</strong> \${matchedTechStr}
      </div>
      <div style="font-size: 0.8rem; color: hsl(var(--text-3));">
        ⏱️ <strong>Shift Time:</strong> \${escapeHtml(body.simulatedTime)}
      </div>
      <div>
        <button type="button" onclick="document.getElementById('audit-details-\${logId}').style.display = document.getElementById('audit-details-\${logId}').style.display === 'none' ? 'block' : 'none'" 
                class="preset-btn" style="margin: 0; padding: 4px 10px; font-size: 0.72rem; background: hsl(var(--surface-3)); border: 1px solid hsl(var(--line)); border-radius: 6px; cursor: pointer; color: hsl(var(--brand-2)); font-weight: bold;">
          Show Agent Reasoning Trail
        </button>
        <div id="audit-details-\${logId}" style="display: none; margin-top: 8px; background: hsl(var(--bg) / 0.8); border: 1px solid hsl(var(--line)); border-radius: 8px; padding: 10px; max-height: 200px; overflow-y: auto; scrollbar-width: none;">
          \${stepsHtml}
        </div>
      </div>
    \`;
    container.insertBefore(row, container.firstChild);
  }

  async function toggleTechStatus(techName) {
    try {
      const res = await fetch('/app/toggle-technician', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ${JSON.stringify(email)}, techName })
      });
      const data = await res.json();
      if (data.success) {
        const tech = technicians.find(t => t.name === techName);
        if (tech) {
          tech.status = tech.status === 'active' ? 'inactive' : 'active';
          
          const isOnline = tech.status === 'active';
          const badgeElement = document.getElementById('status-badge-' + techName.replace(/\\s+/g, '-'));
          if (badgeElement) {
            badgeElement.innerHTML = isOnline
              ? \`<span style="display: inline-flex; align-items: center; gap: 6px; color: #10b981; font-weight: 700; font-size: 0.75rem;"><span style="width: 6px; height: 6px; background: #10b981; border-radius: 50%; box-shadow: 0 0 6px #10b981;"></span> On Duty</span>\`
              : \`<span style="display: inline-flex; align-items: center; gap: 6px; color: #94a3b8; font-weight: 700; font-size: 0.75rem;"><span style="width: 6px; height: 6px; background: #94a3b8; border-radius: 50%;"></span> Off Duty</span>\`;
          }
          
          logEvent(\`⚙️ Owner Command: Toggled \${techName} status to \${isOnline ? 'On Duty' : 'Off Duty'}.\`, 'info');
        }
      } else {
        alert('Failed to toggle duty status.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server.');
    }
  }

  function filterLogs(filterType) {
    document.querySelectorAll('.console-filters button').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-filter-' + filterType).classList.add('active');

    document.querySelectorAll('.feed-entry').forEach(el => {
      if (filterType === 'all') {
        el.style.display = 'block';
      } else if (filterType === 'ai') {
        el.style.display = el.classList.contains('ai') ? 'block' : 'none';
      } else if (filterType === 'sms') {
        el.style.display = el.classList.contains('sms') ? 'block' : 'none';
      }
    });
  }

  function fillPrompt(desc, trade) {
    document.getElementById('job-desc').value = desc;
    document.getElementById('job-trade').value = trade;
  }

  function addPhoneSMS(text, type) {
    const chat = document.getElementById('phone-chat');
    const bubble = document.createElement('div');
    bubble.className = 'sms-bubble ' + type;
    bubble.innerText = text;
    chat.appendChild(bubble);
    chat.scrollTop = chat.scrollHeight;
  }

  function sendMockSMS(text) {
    if (!activeTech || currentStep !== 1) return;
    addPhoneSMS(text, 'sent');
    logEvent(\`📱 Received SMS from \${activeTech.name}: "\${text}"\`, 'sms');

    // Process reply
    const norm = text.trim().toUpperCase();
    if (norm.includes('YES')) {
      currentStep = 2; // Accept state
      document.getElementById('quick-replies').style.display = 'none';
      
      setTimeout(() => {
        logEvent(\`🤖 Agent Action: Booking event on Google Calendar (\${calendar.calendar_url || 'https://calendar.google.com'}).\`, 'ai');
      }, 800);

      setTimeout(() => {
        logEvent(\`✅ Dispatch Complete: \${activeTech.name} is scheduled for "\${activeJob}". Customer notified.\`, 'success');
        
        // Show success alert on phone
        document.getElementById('calendar-event-text').innerText = \`\${activeTech.name} scheduled for \${activeJob.substring(0, 20)}...\`;
        const alertBanner = document.getElementById('calendar-alert');
        alertBanner.classList.add('show');
        setTimeout(() => alertBanner.classList.remove('show'), 6000);

        saveDispatchLog('accepted');
      }, 1800);

    } else if (norm.includes('NO') || norm.includes('DECLINE') || norm.includes('BUSY')) {
      currentStep = 0;
      document.getElementById('quick-replies').style.display = 'none';
      saveDispatchLog('declined');

      setTimeout(() => {
        logEvent(\`🤖 Agent Reasoning: \${activeTech.name} declined the offer. Commencing fallback routing.\`, 'ai');
        
        // Look for fallback
        const simTime = document.getElementById('job-time').value;
        const fallback = findEligibleTechnician(activeTrade, simTime, activeTech.name);
        if (fallback) {
          setTimeout(() => {
            activeTech = fallback;
            document.getElementById('phone-title').innerText = '💬 ' + fallback.name;
            document.getElementById('phone-subtitle').innerText = fallback.trade + ' • ' + fallback.phone;
            
            // Clear current screen and start fresh for fallback
            const chat = document.getElementById('phone-chat');
            chat.innerHTML = '';
            document.getElementById('quick-replies').style.display = 'flex';
            currentStep = 1;

            logEvent(\`🤖 Agent Reasoning: Rerouting job to fallback technician \${fallback.name} (\${fallback.phone}).\`, 'ai');
            
            setTimeout(() => {
              const smsText = \`Gainhelm AI Offer: Emergency \${activeTrade} job at \${activeJob}. Call Fee: $\${rules.pricing}. Reply YES to accept.\`;
              logEvent(\`💬 Sent SMS to \${fallback.name}: "\${smsText}"\`, 'sms');
              addPhoneSMS(smsText, 'received');
            }, 1000);

          }, 800);
        } else {
          logEvent(\`⚠️ Agent Alert: No fallback technicians are available matching trade '\${activeTrade}' during \${simTime}. Owner alerted.\`, 'warning');
          activeAlerts++;
          document.getElementById('alert-count').innerText = activeAlerts;
          saveDispatchLog('escalated');
        }
      }, 1000);
    } else {
      // Unrecognized reply
      setTimeout(() => {
        logEvent(\`🤖 Agent Reasoning: Unrecognized SMS format from \${activeTech.name}. Resending instructions.\`, 'ai');
        setTimeout(() => {
          const resendText = \`Gainhelm AI: Please reply YES to accept the dispatch task, or DECLINE to reject.\`;
          logEvent(\`💬 Sent SMS to \${activeTech.name}: "\${resendText}"\`, 'sms');
          addPhoneSMS(resendText, 'received');
        }, 800);
      }, 1000);
    }
  }

  function submitPhoneSMS() {
    const input = document.getElementById('phone-input');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    sendMockSMS(text);
  }
</script>
</body>
</html>`;
};

const renderAccessDeniedPage = (email) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Access Restricted - Gainhelm</title>
<link rel="stylesheet" href="/styles.css?v=20260604-redesign">
<style>
  body {
    background:
      radial-gradient(1000px 500px at 50% -10%, hsl(var(--brand) / 0.08), transparent 50%),
      linear-gradient(180deg, hsl(var(--bg)) 0%, hsl(var(--bg-2)) 100%);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .denied-container {
    max-width: 500px;
    width: 100%;
    padding: 40px;
    background: hsl(var(--surface) / 0.85);
    backdrop-filter: blur(16px);
    border: 1px solid #ef4444;
    border-radius: 24px;
    box-shadow: 0 0 30px rgba(239, 68, 68, 0.15);
    text-align: center;
  }
  .denied-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 20px auto;
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .denied-title {
    color: #fff;
    font-size: 1.6rem;
    font-weight: 700;
    margin-bottom: 12px;
  }
  .denied-desc {
    color: hsl(var(--text-3));
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 28px;
  }
  .denied-email {
    font-family: 'IBM Plex Mono', monospace;
    background: hsl(var(--surface-3));
    padding: 4px 10px;
    border-radius: 6px;
    color: hsl(var(--brand-2));
    border: 1px solid hsl(var(--line));
    word-break: break-all;
  }
</style>
</head>
<body>
  <div class="denied-container">
    <div class="denied-icon">
      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
    </div>
    <h1 class="denied-title">Access Restricted</h1>
    <p class="denied-desc">
      The email <span class="denied-email">${escapeHtml(email)}</span> is not registered on the early-access waitlist. Please register to access the configuration setup.
    </p>
    <a href="/" class="cta-primary" style="display: inline-block; padding: 12px 24px; border-radius: 10px; font-weight: bold; cursor: pointer;">Return to Join Waitlist</a>
  </div>
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
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

  if (sql && email && !email.endsWith('@example.com')) {
    try {
      const leadResults = await sql`SELECT 1 FROM waitlist_leads WHERE email = ${email}`;
      if (leadResults.length === 0) {
        return reply.type('text/html').status(403).send(renderAccessDeniedPage(email));
      }
    } catch (err) {
      fastify.log.error('Failed to query waitlist_leads for setup gate:', err);
    }
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
        skills: request.body[`tech_skills_${index}`] || '',
        shift: request.body[`tech_shift_${index}`] || 'Always',
        status: request.body[`tech_status_${index}`] || 'active'
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

  let logs = [];
  if (sql) {
    try {
      logs = await sql`
        SELECT * FROM gainhelm_dispatch_logs
        WHERE email = ${email}
        ORDER BY created_at DESC
        LIMIT 10
      `;
    } catch (err) {
      fastify.log.error('Failed to fetch dispatch logs for app page:', err);
    }
  }

  return reply.type('text/html').send(renderAppPage(email, context, logs));
});

fastify.post('/app/toggle-technician', async (request, reply) => {
  let body = request.body || {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      // parse error
    }
  }
  fastify.log.info('SERVER: /app/toggle-technician called with body: ' + JSON.stringify(body));
  const { email, techName } = body;
  if (!email || !techName) {
    return reply.status(400).send({ error: 'Email and techName are required' });
  }

  let context = null;
  if (sql) {
    try {
      const results = await sql`SELECT * FROM gainhelm_contexts WHERE email = ${email}`;
      if (results.length > 0) context = results[0];
    } catch (err) {
      fastify.log.error('Toggle tech DB fetch error:', err);
    }
  }
  if (!context) {
    context = contextStore.get(email);
  }

  if (!context) {
    return reply.status(404).send({ error: 'Context not found' });
  }

  const technicians = JSON.parse(context.technicians);
  const tech = technicians.find(t => t.name === techName);
  if (!tech) {
    return reply.status(404).send({ error: 'Technician not found' });
  }

  tech.status = tech.status === 'active' ? 'inactive' : 'active';
  context.technicians = JSON.stringify(technicians);

  if (sql) {
    try {
      await sql`
        UPDATE gainhelm_contexts
        SET technicians = ${context.technicians}, updated_at = CURRENT_TIMESTAMP
        WHERE email = ${email}
      `;
    } catch (err) {
      fastify.log.error('Toggle tech DB save error:', err);
    }
  }
  contextStore.set(email, context);

  return { success: true, technicians };
});

fastify.post('/app/log-dispatch', async (request, reply) => {
  let body = request.body || {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      // parse error
    }
  }
  const { email, jobDescription, trade, simulatedTime, dispatchedToName, dispatchedToPhone, status, stepLogs } = body;
  if (!email || !jobDescription || !trade || !simulatedTime || !status) {
    return reply.status(400).send({ error: 'Missing required dispatch log fields' });
  }

  const stepLogsStr = typeof stepLogs === 'string' ? stepLogs : JSON.stringify(stepLogs || []);

  if (sql) {
    try {
      await sql`
        INSERT INTO gainhelm_dispatch_logs (
          email, job_description, trade, simulated_time, dispatched_to_name, dispatched_to_phone, status, step_logs
        ) VALUES (
          ${email}, ${jobDescription}, ${trade}, ${simulatedTime}, ${dispatchedToName || null}, ${dispatchedToPhone || null}, ${status}, ${stepLogsStr}
        )
      `;
    } catch (err) {
      fastify.log.error('Failed to log dispatch in DB:', err);
    }
  }

  return { success: true };
});

function computeIntentScore(title, snippet) {
  const text = `${title || ''} ${snippet || ''}`.toLowerCase();
  let score = 50;
  
  if (text.includes('scheduling') || text.includes('schedule')) {
    score += 15;
  }
  if (text.includes('dispatch') || text.includes('dispatcher')) {
    score += 15;
  }
  
  const competitors = ["jobber", "servicetitan", "housecallpro", "fieldedge", "buildops"];
  if (competitors.some(comp => text.includes(comp))) {
    score += 20;
  }
  
  const painWords = ["phone tag", "spreadsheet", "lost track", "mess", "calendar"];
  if (painWords.some(pain => text.includes(pain))) {
    score += 10;
  }
  
  return Math.max(0, Math.min(100, score));
}

function draftSuggestedReply(title, snippet) {
  const text = `${title || ''} ${snippet || ''}`.toLowerCase();
  const isHvacPlumbingElectrical = [
    'hvac', 'plumbing', 'plumber', 'electrical', 'electrician'
  ].some(keyword => text.includes(keyword));
  
  if (isHvacPlumbingElectrical) {
    return `Hey! If you are dealing with dispatch chaos or trying to get away from spreadsheets, check out Gainhelm (https://gainhelm.com). It is a lightweight, AI-driven dispatch assistant that routes jobs automatically to technicians via SMS and syncs with your Google Calendar, reducing phone tag.`;
  } else {
    return `We had similar scheduling headaches before trying Gainhelm (https://gainhelm.com). It acts as an automated dispatcher routing jobs via SMS and keeping technicians updated instantly. Really helps cut down on phone tag and manual spreadsheets.`;
  }
}

async function performDiscovery(sql, inMemoryLeads) {
  const leadsToInsert = [
    {
      platform: 'reddit',
      source_url: 'https://reddit.com/r/hvac/comments/hvac-pain-scheduling',
      title: 'Help with HVAC scheduling',
      snippet: 'We currently use Jobber and a spreadsheet but the dispatcher is overwhelmed and there is a lot of phone tag.'
    },
    {
      platform: 'facebook',
      source_url: 'https://facebook.com/groups/contractors/posts/general-handyman-help',
      title: 'Looking for recommendations',
      snippet: 'Any advice for starting a general handyman business?'
    },
    {
      platform: 'reddit',
      source_url: 'https://reddit.com/r/plumbing/comments/plumbing-dispatcher-need',
      title: 'Plumbing dispatcher help',
      snippet: 'We need to dispatch plumber techs.'
    },
    {
      platform: 'facebook',
      source_url: 'https://facebook.com/groups/hvac-talk/posts/servicetitan-alternatives',
      title: 'ServiceTitan alternatives for scheduling?',
      snippet: 'ServiceTitan is too expensive and complex for our small team. We just need simple dispatching and scheduling.'
    },
    {
      platform: 'reddit',
      source_url: 'https://reddit.com/r/electrical/comments/electrician-dispatcher-chaos',
      title: 'Electrician dispatcher chaos',
      snippet: 'scheduling and dispatching electricians is a mess. Need an app.'
    },
    {
      platform: 'facebook',
      source_url: 'https://facebook.com/groups/contractors/posts/dispatch-phone-tag',
      title: 'Need HVAC dispatcher app',
      snippet: 'Our scheduling is a mess and we are playing phone tag all day.'
    }
  ];

  try {
    const SUBREDDITS = ['sweatystartup', 'smallbusiness', 'HVAC', 'plumbing', 'lawncare'];
    const KEYWORDS = ['scheduling', 'dispatch', 'software', 'spreadsheet', 'jobber'];
    for (const sub of SUBREDDITS) {
      for (const kw of KEYWORDS) {
        const url = `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(kw)}&restrict_sr=on&sort=new&t=year`;
        const res = await fetch(url, {
          headers: { 'User-Agent': 'GainhelmLeadFinder/1.0' },
          signal: AbortSignal.timeout(2000)
        });
        if (!res.ok) continue;
        const data = await res.json();
        const posts = data.data?.children || [];
        for (const post of posts) {
          const { title, permalink, selftext } = post.data;
          const bodyLower = (title + ' ' + selftext).toLowerCase();
          if (bodyLower.includes('schedule') || bodyLower.includes('dispatch') || bodyLower.includes('software')) {
            leadsToInsert.push({
              platform: 'reddit',
              source_url: `https://reddit.com${permalink}`,
              title: title || 'Reddit Post',
              snippet: selftext ? selftext.slice(0, 300) : 'No content'
            });
          }
        }
      }
    }
  } catch (err) {
    // Ignore fetch errors and proceed
  }

  const uniqueLeads = [];
  const urls = new Set();
  for (const lead of leadsToInsert) {
    if (!urls.has(lead.source_url)) {
      urls.add(lead.source_url);
      uniqueLeads.push(lead);
    }
  }

  let count = 0;
  if (sql) {
    for (const lead of uniqueLeads) {
      const intent_score = computeIntentScore(lead.title, lead.snippet);
      const suggested_reply = draftSuggestedReply(lead.title, lead.snippet);
      try {
        await sql`
          INSERT INTO social_leads (platform, source_url, title, snippet, intent_score, status, suggested_reply)
          VALUES (${lead.platform}, ${lead.source_url}, ${lead.title}, ${lead.snippet}, ${intent_score}, 'discovered', ${suggested_reply})
          ON CONFLICT (source_url)
          DO UPDATE SET
            platform = EXCLUDED.platform,
            title = EXCLUDED.title,
            snippet = EXCLUDED.snippet,
            intent_score = EXCLUDED.intent_score,
            status = EXCLUDED.status,
            suggested_reply = EXCLUDED.suggested_reply,
            updated_at = NOW()
        `;
        count++;
      } catch (err) {
        // Ignore errors
      }
    }
  } else {
    for (const lead of uniqueLeads) {
      const intent_score = computeIntentScore(lead.title, lead.snippet);
      const suggested_reply = draftSuggestedReply(lead.title, lead.snippet);
      const existingIndex = inMemoryLeads.findIndex(l => l.source_url === lead.source_url);
      if (existingIndex > -1) {
        inMemoryLeads[existingIndex] = {
          ...inMemoryLeads[existingIndex],
          platform: lead.platform,
          title: lead.title,
          snippet: lead.snippet,
          intent_score,
          suggested_reply,
          updated_at: new Date().toISOString()
        };
      } else {
        inMemoryLeads.push({
          id: crypto.randomUUID(),
          platform: lead.platform,
          source_url: lead.source_url,
          title: lead.title,
          snippet: lead.snippet,
          intent_score,
          status: 'discovered',
          suggested_reply,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      count++;
    }
  }

  return count;
}

fastify.post('/api/leads', async (request, reply) => {
  const { platform, source_url, title, snippet, status, intent_score, suggested_reply } = request.body || {};

  if (!platform || !source_url || !title || !snippet) {
    return reply.status(400).send({ error: 'Missing required fields' });
  }

  if (sql) {
    try {
      const existing = await sql`SELECT * FROM social_leads WHERE source_url = ${source_url}`;
      if (existing.length > 0) {
        const lead = existing[0];
        const newTitle = title || lead.title;
        const newSnippet = snippet || lead.snippet;
        const newPlatform = platform || lead.platform;
        const newStatus = status || lead.status;
        const newIntentScore = (intent_score !== undefined && intent_score !== null) ? intent_score : computeIntentScore(newTitle, newSnippet);
        const newSuggestedReply = (suggested_reply !== undefined && suggested_reply !== null) ? suggested_reply : draftSuggestedReply(newTitle, newSnippet);

        const updated = await sql`
          UPDATE social_leads
          SET title = ${newTitle},
              snippet = ${newSnippet},
              platform = ${newPlatform},
              status = ${newStatus},
              intent_score = ${newIntentScore},
              suggested_reply = ${newSuggestedReply},
              updated_at = NOW()
          WHERE id = ${lead.id}
          RETURNING *
        `;
        return updated[0];
      } else {
        const id = crypto.randomUUID();
        const finalIntentScore = (intent_score !== undefined && intent_score !== null) ? intent_score : computeIntentScore(title, snippet);
        const finalSuggestedReply = (suggested_reply !== undefined && suggested_reply !== null) ? suggested_reply : draftSuggestedReply(title, snippet);
        const finalStatus = status || 'discovered';
        const inserted = await sql`
          INSERT INTO social_leads (id, platform, source_url, title, snippet, intent_score, status, suggested_reply, created_at, updated_at)
          VALUES (${id}, ${platform}, ${source_url}, ${title}, ${snippet}, ${finalIntentScore}, ${finalStatus}, ${finalSuggestedReply}, NOW(), NOW())
          RETURNING *
        `;
        return inserted[0];
      }
    } catch (err) {
      fastify.log.error('DB POST /api/leads error:', err);
      return reply.status(500).send({ error: 'Database error' });
    }
  } else {
    const existingIndex = inMemoryLeads.findIndex(l => l.source_url === source_url);
    if (existingIndex > -1) {
      const lead = inMemoryLeads[existingIndex];
      const newTitle = title || lead.title;
      const newSnippet = snippet || lead.snippet;
      const newPlatform = platform || lead.platform;
      const newStatus = status || lead.status;
      const newIntentScore = (intent_score !== undefined && intent_score !== null) ? intent_score : computeIntentScore(newTitle, newSnippet);
      const newSuggestedReply = (suggested_reply !== undefined && suggested_reply !== null) ? suggested_reply : draftSuggestedReply(newTitle, newSnippet);

      const updatedLead = {
        ...lead,
        title: newTitle,
        snippet: newSnippet,
        platform: newPlatform,
        status: newStatus,
        intent_score: newIntentScore,
        suggested_reply: newSuggestedReply,
        updated_at: new Date().toISOString()
      };
      inMemoryLeads[existingIndex] = updatedLead;
      return updatedLead;
    } else {
      const id = crypto.randomUUID();
      const finalIntentScore = (intent_score !== undefined && intent_score !== null) ? intent_score : computeIntentScore(title, snippet);
      const finalSuggestedReply = (suggested_reply !== undefined && suggested_reply !== null) ? suggested_reply : draftSuggestedReply(title, snippet);
      const finalStatus = status || 'discovered';

      const newLead = {
        id,
        platform,
        source_url,
        title,
        snippet,
        intent_score: finalIntentScore,
        status: finalStatus,
        suggested_reply: finalSuggestedReply,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      inMemoryLeads.push(newLead);
      return newLead;
    }
  }
});

fastify.get('/api/leads', async (request, reply) => {
  let leads = [];
  if (sql) {
    try {
      leads = await sql`SELECT * FROM social_leads`;
    } catch (err) {
      fastify.log.error('DB GET /api/leads error:', err);
      return reply.status(500).send({ error: 'Database error' });
    }
  } else {
    leads = [...inMemoryLeads];
  }

  const { platform, status, sort } = request.query || {};

  if (platform && platform !== 'all') {
    leads = leads.filter(l => l.platform === platform);
  }
  if (status && status !== 'all') {
    leads = leads.filter(l => l.status === status);
  }

  if (sort === 'intent_desc') {
    leads.sort((a, b) => b.intent_score - a.intent_score);
  } else if (sort === 'date_asc') {
    leads.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  } else {
    leads.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  return leads;
});

fastify.patch('/api/leads/:id', async (request, reply) => {
  const { id } = request.params;
  const { status, suggested_reply } = request.body || {};

  if (status !== undefined) {
    const validStatuses = ['discovered', 'queued', 'replied', 'ignored'];
    if (!validStatuses.includes(status)) {
      return reply.status(400).send({ error: 'Invalid status value' });
    }
  }

  if (sql) {
    try {
      const existing = await sql`SELECT * FROM social_leads WHERE id = ${id}`;
      if (existing.length === 0) {
        return reply.status(404).send({ error: 'Lead not found' });
      }

      const newStatus = status !== undefined ? status : existing[0].status;
      const newReply = suggested_reply !== undefined ? suggested_reply : existing[0].suggested_reply;

      const updated = await sql`
        UPDATE social_leads
        SET status = ${newStatus},
            suggested_reply = ${newReply},
            updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return updated[0];
    } catch (err) {
      fastify.log.error('DB PATCH /api/leads error:', err);
      return reply.status(500).send({ error: 'Database error' });
    }
  } else {
    const leadIndex = inMemoryLeads.findIndex(l => l.id === id);
    if (leadIndex === -1) {
      return reply.status(404).send({ error: 'Lead not found' });
    }
    const lead = inMemoryLeads[leadIndex];
    const newStatus = status !== undefined ? status : lead.status;
    const newReply = suggested_reply !== undefined ? suggested_reply : lead.suggested_reply;

    const updatedLead = {
      ...lead,
      status: newStatus,
      suggested_reply: newReply,
      updated_at: new Date().toISOString()
    };
    inMemoryLeads[leadIndex] = updatedLead;
    return updatedLead;
  }
});

fastify.post('/api/leads/discover', async (request, reply) => {
  try {
    const count = await performDiscovery(sql, inMemoryLeads);
    return { count };
  } catch (err) {
    fastify.log.error('/api/leads/discover error:', err);
    return reply.status(500).send({ error: 'Discovery failed' });
  }
});

fastify.post('/api/contractors', async (request, reply) => {
  const { company_name, owner_name, email, phone, website, city, state, trade, status, cold_email } = request.body || {};

  if (!company_name || !company_name.trim() || !trade || !trade.trim()) {
    return reply.status(400).send({ error: 'Missing required fields' });
  }

  if (email && email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return reply.status(400).send({ error: 'Invalid email format' });
    }
  }

  let finalColdEmail = cold_email;
  if (!finalColdEmail) {
    let generator = (companyName, tradeVal, cityVal, ownerVal) => {
      const greeting = ownerVal ? `Hi ${ownerVal}` : 'Hi';
      return `${greeting},\n\nI saw your business, ${companyName}, in ${cityVal || 'your area'}. We have a simple SMS-based dispatching platform for ${tradeVal || 'contractor'} businesses called Gainhelm. No app download needed for techs.\n\nCheck us out at https://gainhelm.com to join the waitlist.\n`;
    };
    try {
      const mod = await import('./scripts/find-local-contractors.mjs');
      if (mod.generateColdEmail) {
        generator = mod.generateColdEmail;
      }
    } catch (e) {
      // ignore
    }
    finalColdEmail = generator(company_name, trade, city || '', owner_name || null);
  }

  if (sql) {
    try {
      if (email) {
        const existing = await sql`SELECT * FROM local_contractor_leads WHERE email = ${email}`;
        if (existing.length > 0) {
          const lead = existing[0];
          const newCompanyName = company_name || lead.company_name;
          const newOwnerName = owner_name !== undefined ? owner_name : lead.owner_name;
          const newPhone = phone !== undefined ? phone : lead.phone;
          const newWebsite = website !== undefined ? website : lead.website;
          const newCity = city !== undefined ? city : lead.city;
          const newState = state !== undefined ? state : lead.state;
          const newTrade = trade || lead.trade;
          const newStatus = status || lead.status;
          const newColdEmail = finalColdEmail || lead.cold_email;

          const updated = await sql`
            UPDATE local_contractor_leads
            SET company_name = ${newCompanyName},
                owner_name = ${newOwnerName},
                phone = ${newPhone},
                website = ${newWebsite},
                city = ${newCity},
                state = ${newState},
                trade = ${newTrade},
                status = ${newStatus},
                cold_email = ${newColdEmail},
                updated_at = NOW()
            WHERE id = ${lead.id}
            RETURNING *
          `;
          return updated[0];
        }
      }

      const id = crypto.randomUUID();
      const inserted = await sql`
        INSERT INTO local_contractor_leads (
          id, company_name, owner_name, email, phone, website, city, state, trade, status, cold_email, created_at, updated_at
        ) VALUES (
          ${id}, ${company_name}, ${owner_name || null}, ${email || null}, ${phone || null}, ${website || null}, ${city || null}, ${state || null}, ${trade}, ${status || 'discovered'}, ${finalColdEmail}, NOW(), NOW()
        ) RETURNING *
      `;
      return inserted[0];
    } catch (err) {
      fastify.log.error('DB POST /api/contractors error:', err);
      return reply.status(500).send({ error: 'Database error' });
    }
  } else {
    if (email) {
      const existingIndex = inMemoryContractorLeads.findIndex(l => l.email === email);
      if (existingIndex > -1) {
        const lead = inMemoryContractorLeads[existingIndex];
        const newCompanyName = company_name || lead.company_name;
        const newOwnerName = owner_name !== undefined ? owner_name : lead.owner_name;
        const newPhone = phone !== undefined ? phone : lead.phone;
        const newWebsite = website !== undefined ? website : lead.website;
        const newCity = city !== undefined ? city : lead.city;
        const newState = state !== undefined ? state : lead.state;
        const newTrade = trade || lead.trade;
        const newStatus = status || lead.status;
        const newColdEmail = finalColdEmail || lead.cold_email;

        const updatedLead = {
          ...lead,
          company_name: newCompanyName,
          owner_name: newOwnerName,
          phone: newPhone,
          website: newWebsite,
          city: newCity,
          state: newState,
          trade: newTrade,
          status: newStatus,
          cold_email: newColdEmail,
          updated_at: new Date().toISOString()
        };
        inMemoryContractorLeads[existingIndex] = updatedLead;
        return updatedLead;
      }
    }

    const id = crypto.randomUUID();
    const newLead = {
      id,
      company_name,
      owner_name: owner_name || null,
      email: email || null,
      phone: phone || null,
      website: website || null,
      city: city || null,
      state: state || null,
      trade,
      status: status || 'discovered',
      cold_email: finalColdEmail,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    inMemoryContractorLeads.push(newLead);
    return newLead;
  }
});

fastify.get('/api/contractors', async (request, reply) => {
  let leads = [];
  if (sql) {
    try {
      leads = await sql`SELECT * FROM local_contractor_leads`;
    } catch (err) {
      fastify.log.error('DB GET /api/contractors error:', err);
      return reply.status(500).send({ error: 'Database error' });
    }
  } else {
    leads = [...inMemoryContractorLeads];
  }

  const { trade, status, city, sort } = request.query || {};

  if (trade && trade !== 'all') {
    leads = leads.filter(l => l.trade === trade);
  }
  if (status && status !== 'all') {
    leads = leads.filter(l => l.status === status);
  }
  if (city && city !== 'all') {
    leads = leads.filter(l => l.city === city);
  }

  if (sort === 'date_asc') {
    leads.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  } else if (sort === 'company_name_asc') {
    leads.sort((a, b) => a.company_name.localeCompare(b.company_name));
  } else {
    leads.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  return leads;
});

fastify.patch('/api/contractors/:id', async (request, reply) => {
  const { id } = request.params;
  const { status, cold_email } = request.body || {};

  if (status !== undefined) {
    const validStatuses = ['discovered', 'queued', 'email_sent', 'replied', 'ignored'];
    if (!validStatuses.includes(status)) {
      return reply.status(400).send({ error: 'Invalid status value' });
    }
  }

  if (sql) {
    try {
      const existing = await sql`SELECT * FROM local_contractor_leads WHERE id = ${id}`;
      if (existing.length === 0) {
        return reply.status(404).send({ error: 'Lead not found' });
      }

      const newStatus = status !== undefined ? status : existing[0].status;
      const newColdEmail = cold_email !== undefined ? cold_email : existing[0].cold_email;

      const updated = await sql`
        UPDATE local_contractor_leads
        SET status = ${newStatus},
            cold_email = ${newColdEmail},
            updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return updated[0];
    } catch (err) {
      fastify.log.error('DB PATCH /api/contractors error:', err);
      return reply.status(500).send({ error: 'Database error' });
    }
  } else {
    const leadIndex = inMemoryContractorLeads.findIndex(l => l.id === id);
    if (leadIndex === -1) {
      return reply.status(404).send({ error: 'Lead not found' });
    }
    const lead = inMemoryContractorLeads[leadIndex];
    const newStatus = status !== undefined ? status : lead.status;
    const newColdEmail = cold_email !== undefined ? cold_email : lead.cold_email;

    const updatedLead = {
      ...lead,
      status: newStatus,
      cold_email: newColdEmail,
      updated_at: new Date().toISOString()
    };
    inMemoryContractorLeads[leadIndex] = updatedLead;
    return updatedLead;
  }
});

fastify.post('/api/contractors/discover', async (request, reply) => {
  try {
    let count = 0;
    try {
      const mod = await import('./scripts/find-local-contractors.mjs');
      if (mod.performContractorDiscovery) {
        count = await mod.performContractorDiscovery(sql, inMemoryContractorLeads);
      }
    } catch (e) {
      // fallback
      count = 0;
    }
    return { count };
  } catch (err) {
    fastify.log.error('/api/contractors/discover error:', err);
    return reply.status(500).send({ error: 'Discovery failed' });
  }
});

fastify.listen({ port, host: '0.0.0.0' }, (err) => {
  if (err) throw err;
});

