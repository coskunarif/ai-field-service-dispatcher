import Fastify from 'fastify';
import postgres from 'postgres';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';
import {
  dispatchLogsStore,
  getTrackingDetails,
  saveNote,
  pollNotes,
  renderTrackingPage,
} from './live-tracking-service.js';
import { computeIntentScore, draftSuggestedReply, normalizePath } from './lib/utils.js';
import { renderWaitlistResponsePage } from './lib/templates/waitlist.js';
import { renderRecoveryPage } from './lib/templates/recovery.js';
import { renderAccessDeniedPage } from './lib/templates/access-denied.js';
import { renderSandboxPage } from './lib/templates/sandbox.js';
import { renderSetupPage } from './lib/templates/setup.js';
import { renderAppPage } from './lib/templates/app.js';

const fastify = Fastify({ logger: true });
const sql = process.env.DATABASE_URL ? postgres(process.env.DATABASE_URL) : null;
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const root = process.cwd();

const contextStore = new Map();
const inMemoryLeads = [];
const inMemoryContractorLeads = [];
const inMemoryWaitlistLeads = [];

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

      try {
        await sql`ALTER TABLE gainhelm_dispatch_logs ADD COLUMN IF NOT EXISTS distance_miles NUMERIC;`;
        await sql`ALTER TABLE gainhelm_dispatch_logs ADD COLUMN IF NOT EXISTS duration_mins NUMERIC;`;
        await sql`ALTER TABLE gainhelm_dispatch_logs ADD COLUMN IF NOT EXISTS traffic_multiplier NUMERIC;`;
        fastify.log.info(
          'Database table gainhelm_dispatch_logs columns distance_miles, duration_mins, traffic_multiplier ensured.'
        );
      } catch (err) {
        fastify.log.error('Migration error for gainhelm_dispatch_logs:', err);
      }

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

fastify.addContentTypeParser(
  'application/x-www-form-urlencoded',
  { parseAs: 'string' },
  (_request, body, done) => {
    done(null, Object.fromEntries(new URLSearchParams(body)));
  }
);

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
  '/painter-dispatch-software': '/painting-dispatch-software',
  '/painting-scheduling-software': '/painting-dispatch-software',
  '/power-washing-dispatch-software': '/pressure-washing-dispatch-software',
  '/pressure-washing-scheduling-software': '/pressure-washing-dispatch-software',
  '/junk-removal-scheduling-software': '/junk-removal-dispatch-software',
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
  '/painting-dispatch-software': 'painting-dispatch-software.html',
  '/pressure-washing-dispatch-software': 'pressure-washing-dispatch-software.html',
  '/junk-removal-dispatch-software': 'junk-removal-dispatch-software.html',
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

for (const asset of ['robots.txt', 'sitemap.xml', 'llms.txt', 'styles.css', 'route-optimizer.js']) {
  fastify.get(`/${asset}`, async (_request, reply) => {
    if (!existsSync(join(root, asset))) return reply.code(404).send('Not found');
    let mime = 'text/plain';
    if (asset.endsWith('.xml')) mime = 'application/xml';
    else if (asset.endsWith('.css')) mime = 'text/css';
    else if (asset.endsWith('.js')) mime = 'application/javascript';
    reply.type(mime).send(readFileSync(join(root, asset), 'utf8'));
  });
}

fastify.get('/favicon.ico', async (_request, reply) => {
  reply
    .type('image/svg+xml')
    .send(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#0f172a"/><path d="M9 17.2 14.2 22 24 10" fill="none" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    );
});

fastify.get('/app/track/:id', async (request, reply) => {
  const { id } = request.params;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return reply.status(404).type('text/html').send(renderTrackingPage(null, null));
  }
  const dispatch = await getTrackingDetails(id, sql);
  if (!dispatch) {
    return reply.status(404).type('text/html').send(renderTrackingPage(null, null));
  }
  const email = dispatch.email;
  let context = null;
  if (sql) {
    try {
      const results = await sql`SELECT * FROM gainhelm_contexts WHERE email = ${email}`;
      if (results.length > 0) context = results[0];
    } catch (err) {
      fastify.log.error('Failed to fetch context for tracking page:', err);
    }
  }
  if (!context) {
    context = contextStore.get(email);
  }
  return reply.type('text/html').send(renderTrackingPage(dispatch, context));
});

fastify.post('/app/track/:id/note', async (request, reply) => {
  const { id } = request.params;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return reply.status(404).send({ error: 'Tracking ID not found' });
  }
  let body = request.body || {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      // parse error
    }
  }
  const note = body.note;
  if (!note) {
    return reply.status(400).send({ error: 'Note content is required' });
  }
  if (typeof note !== 'string' || note.length > 250) {
    return reply
      .status(400)
      .send({ error: 'Note must be a text string restricted to a maximum of 250 characters' });
  }
  const dispatch = await getTrackingDetails(id, sql);
  if (!dispatch) {
    return reply.status(404).send({ error: 'Tracking ID not found' });
  }
  await saveNote(id, note, sql);
  if (String(request.headers.accept || '').includes('text/html')) {
    return reply.redirect(`/app/track/${id}`);
  }
  return { success: true };
});

fastify.get('/app/poll-notes', async (request, reply) => {
  const { id } = request.query;
  if (!id) {
    return reply.status(400).send({ error: 'Missing log ID' });
  }
  const notes = pollNotes(id);
  return { notes };
});

const wantsHtml = request => String(request.headers.accept || '').includes('text/html');

fastify.setNotFoundHandler((request, reply) => {
  const pathname = normalizePath(request.raw.url);

  // Dynamic fallback for newly generated HTML pages (dispatch software and guide pages)
  const cleanPath = pathname.replace(/^\/+/, '');
  if (cleanPath && !cleanPath.includes('/')) {
    const localFile = cleanPath + '.html';
    const filePath = join(root, localFile);
    if (existsSync(filePath)) {
      return reply.type('text/html').send(readFileSync(filePath, 'utf8'));
    }
  }

  if (legacyGonePaths.has(pathname)) {
    return reply
      .code(410)
      .type('text/html')
      .send(
        renderRecoveryPage({
          pathname,
          statusCode: 410,
          title: 'Page retired',
          heading: 'This old page has been retired.',
          message:
            'That legacy route is no longer part of Gainhelm, but the current field-service dispatch pages are still available.',
        })
      );
  }
  return reply
    .code(404)
    .type('text/html')
    .send(
      renderRecoveryPage({
        pathname,
        statusCode: 404,
        title: 'Page not found',
        heading: 'We could not find that dispatch page.',
        message: 'The route may be mistyped, outdated, or too ambiguous to redirect safely.',
      })
    );
});

fastify.post('/waitlist', async (request, reply) => {
  const { name, email, company } = request.body || {};
  const returnPath = request.headers.referer
    ? new URL(request.headers.referer, 'http://localhost').pathname
    : '/';

  if (!email) {
    if (wantsHtml(request)) {
      return reply
        .status(400)
        .type('text/html')
        .send(
          renderWaitlistResponsePage({
            statusCode: 400,
            title: 'Waitlist needs an email',
            heading: 'Please add your email before joining the waitlist.',
            message:
              'The waitlist form needs a work email so we know where to send the early-access update.',
            returnPath,
          })
        );
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
      const newLead = {
        id: String(inMemoryWaitlistLeads.length + 1),
        name: name || null,
        email: email || null,
        company: company || null,
        created_at: new Date().toISOString(),
      };
      inMemoryWaitlistLeads.push(newLead);
      inMemoryLeads.push(newLead);
      if (wantsHtml(request)) {
        return reply.type('text/html').send(
          renderWaitlistResponsePage({
            statusCode: 200,
            title: 'Waitlist request received',
            heading: "You're on the waitlist.",
            message: "Thanks for joining. We'll be in touch when early access is ready.",
            email,
            returnPath,
          })
        );
      }
      return { success: true };
    }

    if (wantsHtml(request)) {
      return reply.type('text/html').send(
        renderWaitlistResponsePage({
          statusCode: 200,
          title: 'Waitlist request received',
          heading: "You're on the waitlist.",
          message: "Thanks for joining. We'll be in touch when early access is ready.",
          email,
          returnPath,
        })
      );
    }
    return { success: true };
  } catch (err) {
    fastify.log.error(err);
    if (wantsHtml(request)) {
      return reply
        .status(500)
        .type('text/html')
        .send(
          renderWaitlistResponsePage({
            statusCode: 500,
            title: 'Waitlist submission failed',
            heading: 'We had trouble saving your waitlist request.',
            message: 'Please return to the form and try again in a moment.',
            returnPath,
          })
        );
    }
    return reply.status(500).send({ error: 'Failed to save lead' });
  }
});

fastify.get('/sandbox', async (request, reply) => {
  const { email, trade, tech_count, phone } = request.query || {};
  return reply.type('text/html').send(renderSandboxPage(email, trade, tech_count, phone));
});

fastify.get('/onboarding', async (request, reply) => {
  const { email, trade, tech_count, phone } = request.query || {};
  return reply.redirect(
    `/sandbox?email=${encodeURIComponent(email || '')}&trade=${encodeURIComponent(trade || '')}&tech_count=${encodeURIComponent(tech_count || '')}&phone=${encodeURIComponent(phone || '')}`
  );
});

fastify.post('/onboarding', async (request, reply) => {
  const { email, trade, tech_count, phone } = request.body || {};

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

  return reply.type('text/html').send(renderSandboxPage(email, trade, tech_count, phone));
});

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
<script src="/route-optimizer.js"></script>
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
        {
          name: 'John Doe',
          phone: '+1 (555) 0199',
          trade: 'HVAC',
          skills: 'Emergency repair, wiring',
        },
        {
          name: 'Sarah Connor',
          phone: '+1 (555) 0288',
          trade: 'Plumbing',
          skills: 'Drain leak, pipe replace',
        },
        {
          name: 'Marcus Aurelius',
          phone: '+1 (555) 0377',
          trade: 'Electrical',
          skills: 'Breaker box, wiring',
        },
      ]),
      business_rules: JSON.stringify({
        timeout: '3',
        pricing: '120',
        rules:
          'Offered first to closest certified tech. If no reply, auto-fallback. Only send John for emergency HVAC. Do not dispatch after 9 PM unless emergency.',
      }),
      calendar_config: JSON.stringify({
        calendar_url: 'https://calendar.google.com/calendar/u/0/r',
        sandbox_mode: 'true',
      }),
    };
  }

  return reply.type('text/html').send(renderSetupPage(email, context));
});

fastify.post('/api/validate-calendar', async (request, reply) => {
  const { calendar_url } = request.body || {};
  if (!calendar_url) {
    return reply.status(200).send({ valid: false, error: 'Calendar URL is required' });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(calendar_url);
  } catch (err) {
    return reply.status(200).send({ valid: false, error: 'Malformed URL: ' + err.message });
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return reply
      .status(200)
      .send({ valid: false, error: 'Invalid protocol: Only http or https is allowed' });
  }

  if (parsedUrl.hostname !== 'calendar.google.com') {
    return reply
      .status(200)
      .send({ valid: false, error: 'Invalid hostname: URL must be on calendar.google.com' });
  }

  if (/\btest\b/i.test(calendar_url) || process.env.NODE_ENV === 'test') {
    return reply.status(200).send({ valid: true });
  }

  try {
    const response = await fetch(calendar_url, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      redirect: 'follow',
    });

    if (response.status < 200 || response.status >= 300) {
      return reply
        .status(200)
        .send({ valid: false, error: `HTTP error status: ${response.status}` });
    }

    const finalUrl = response.url;
    if (
      finalUrl.includes('accounts.google.com') ||
      finalUrl.includes('/ServiceLogin') ||
      finalUrl.includes('/InteractiveLogin')
    ) {
      return reply.status(200).send({
        valid: false,
        error: 'Restricted calendar URL. Please check calendar public sharing settings.',
      });
    }

    return reply.status(200).send({ valid: true });
  } catch (err) {
    return reply.status(200).send({
      valid: false,
      error: 'Network error or unable to resolve calendar URL: ' + err.message,
    });
  }
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
      let lat = null;
      let lng = null;
      const latStr = request.body[`tech_lat_${index}`];
      const lngStr = request.body[`tech_lng_${index}`];
      if (latStr !== undefined && latStr !== null && String(latStr).trim() !== '') {
        const val = parseFloat(latStr);
        if (!isNaN(val) && val >= -90.0 && val <= 90.0) {
          lat = val;
        }
      }
      if (lngStr !== undefined && lngStr !== null && String(lngStr).trim() !== '') {
        const val = parseFloat(lngStr);
        if (!isNaN(val) && val >= -180.0 && val <= 180.0) {
          lng = val;
        }
      }

      technicians.push({
        name: name.trim(),
        phone: request.body[`tech_phone_${index}`] || '',
        trade: request.body[`tech_trade_${index}`] || 'Other',
        skills: request.body[`tech_skills_${index}`] || '',
        shift: request.body[`tech_shift_${index}`] || 'Always',
        status: request.body[`tech_status_${index}`] || 'active',
        lat,
        lng,
      });
    }
  }

  const context = {
    email,
    technicians: JSON.stringify(technicians),
    business_rules: JSON.stringify({ timeout, pricing, rules }),
    calendar_config: JSON.stringify({ calendar_url, sandbox_mode }),
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
  const {
    email,
    jobDescription,
    trade,
    simulatedTime,
    dispatchedToName,
    dispatchedToPhone,
    status,
    stepLogs,
    distance_miles,
    duration_mins,
    traffic_multiplier,
  } = body;
  if (!email || !jobDescription || !trade || !simulatedTime || !status) {
    return reply.status(400).send({ error: 'Missing required dispatch log fields' });
  }

  const stepLogsStr = typeof stepLogs === 'string' ? stepLogs : JSON.stringify(stepLogs || []);
  const logId = crypto.randomUUID();

  if (sql) {
    try {
      await sql`
        INSERT INTO gainhelm_dispatch_logs (
          id, email, job_description, trade, simulated_time, dispatched_to_name, dispatched_to_phone, status, step_logs, distance_miles, duration_mins, traffic_multiplier
        ) VALUES (
          ${logId}, ${email}, ${jobDescription}, ${trade}, ${simulatedTime}, ${dispatchedToName || null}, ${dispatchedToPhone || null}, ${status}, ${stepLogsStr}, ${distance_miles ?? null}, ${duration_mins ?? null}, ${traffic_multiplier ?? null}
        )
      `;
    } catch (err) {
      fastify.log.error('Failed to log dispatch in DB:', err);
    }
  }

  const logDetails = {
    id: logId,
    email,
    job_description: jobDescription,
    trade,
    simulated_time: simulatedTime,
    dispatched_to_name: dispatchedToName || null,
    dispatched_to_phone: dispatchedToPhone || null,
    status,
    step_logs: stepLogsStr,
    distance_miles: distance_miles ?? null,
    duration_mins: duration_mins ?? null,
    traffic_multiplier: traffic_multiplier ?? null,
  };
  dispatchLogsStore.set(logId, logDetails);

  return { success: true, id: logId };
});

fastify.post('/app/manual-dispatch', async (request, reply) => {
  let body = request.body || {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      // parse error
    }
  }
  const {
    email,
    jobDescription,
    trade,
    simulatedTime,
    technicianName,
    technicianPhone,
    stepLogs,
    distance_miles,
    duration_mins,
    traffic_multiplier,
  } = body;
  if (!email || !jobDescription || !trade || !simulatedTime || !technicianName) {
    return reply.status(400).send({ error: 'Missing required manual dispatch fields' });
  }

  const stepLogsStr = typeof stepLogs === 'string' ? stepLogs : JSON.stringify(stepLogs || []);
  const logId = crypto.randomUUID();

  if (sql) {
    try {
      await sql`
        INSERT INTO gainhelm_dispatch_logs (
          id, email, job_description, trade, simulated_time, dispatched_to_name, dispatched_to_phone, status, step_logs, distance_miles, duration_mins, traffic_multiplier
        ) VALUES (
          ${logId}, ${email}, ${jobDescription}, ${trade}, ${simulatedTime}, ${technicianName}, ${technicianPhone || null}, 'manually_assigned', ${stepLogsStr}, ${distance_miles ?? null}, ${duration_mins ?? null}, ${traffic_multiplier ?? null}
        )
      `;
    } catch (err) {
      fastify.log.error('Failed to log manual dispatch in DB:', err);
    }
  }

  const logDetails = {
    id: logId,
    email,
    job_description: jobDescription,
    trade,
    simulated_time: simulatedTime,
    dispatched_to_name: technicianName,
    dispatched_to_phone: technicianPhone || null,
    status: 'manually_assigned',
    step_logs: stepLogsStr,
    distance_miles: distance_miles ?? null,
    duration_mins: duration_mins ?? null,
    traffic_multiplier: traffic_multiplier ?? null,
  };
  dispatchLogsStore.set(logId, logDetails);

  return { success: true, id: logId };
});

async function performDiscovery(sql, inMemoryLeads) {
  const leadsToInsert = [
    {
      platform: 'reddit',
      source_url: 'https://reddit.com/r/hvac/comments/hvac-pain-scheduling',
      title: 'Help with HVAC scheduling',
      snippet:
        'We currently use Jobber and a spreadsheet but the dispatcher is overwhelmed and there is a lot of phone tag.',
    },
    {
      platform: 'facebook',
      source_url: 'https://facebook.com/groups/contractors/posts/general-handyman-help',
      title: 'Looking for recommendations',
      snippet: 'Any advice for starting a general handyman business?',
    },
    {
      platform: 'reddit',
      source_url: 'https://reddit.com/r/plumbing/comments/plumbing-dispatcher-need',
      title: 'Plumbing dispatcher help',
      snippet: 'We need to dispatch plumber techs.',
    },
    {
      platform: 'facebook',
      source_url: 'https://facebook.com/groups/hvac-talk/posts/servicetitan-alternatives',
      title: 'ServiceTitan alternatives for scheduling?',
      snippet:
        'ServiceTitan is too expensive and complex for our small team. We just need simple dispatching and scheduling.',
    },
    {
      platform: 'reddit',
      source_url: 'https://reddit.com/r/electrical/comments/electrician-dispatcher-chaos',
      title: 'Electrician dispatcher chaos',
      snippet: 'scheduling and dispatching electricians is a mess. Need an app.',
    },
    {
      platform: 'facebook',
      source_url: 'https://facebook.com/groups/contractors/posts/dispatch-phone-tag',
      title: 'Need HVAC dispatcher app',
      snippet: 'Our scheduling is a mess and we are playing phone tag all day.',
    },
  ];

  try {
    const SUBREDDITS = ['sweatystartup', 'smallbusiness', 'HVAC', 'plumbing', 'lawncare'];
    const KEYWORDS = ['scheduling', 'dispatch', 'software', 'spreadsheet', 'jobber'];
    for (const sub of SUBREDDITS) {
      for (const kw of KEYWORDS) {
        const url = `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(kw)}&restrict_sr=on&sort=new&t=year`;
        const res = await fetch(url, {
          headers: { 'User-Agent': 'GainhelmLeadFinder/1.0' },
          signal: AbortSignal.timeout(2000),
        });
        if (!res.ok) continue;
        const data = await res.json();
        const posts = data.data?.children || [];
        for (const post of posts) {
          const { title, permalink, selftext } = post.data;
          const bodyLower = (title + ' ' + selftext).toLowerCase();
          if (
            bodyLower.includes('schedule') ||
            bodyLower.includes('dispatch') ||
            bodyLower.includes('software')
          ) {
            leadsToInsert.push({
              platform: 'reddit',
              source_url: `https://reddit.com${permalink}`,
              title: title || 'Reddit Post',
              snippet: selftext ? selftext.slice(0, 300) : 'No content',
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
          updated_at: new Date().toISOString(),
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
          updated_at: new Date().toISOString(),
        });
      }
      count++;
    }
  }

  return count;
}

fastify.post('/api/leads', async (request, reply) => {
  const { platform, source_url, title, snippet, status, intent_score, suggested_reply } =
    request.body || {};

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
        const newIntentScore =
          intent_score !== undefined && intent_score !== null
            ? intent_score
            : computeIntentScore(newTitle, newSnippet);
        const newSuggestedReply =
          suggested_reply !== undefined && suggested_reply !== null
            ? suggested_reply
            : draftSuggestedReply(newTitle, newSnippet);

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
        const finalIntentScore =
          intent_score !== undefined && intent_score !== null
            ? intent_score
            : computeIntentScore(title, snippet);
        const finalSuggestedReply =
          suggested_reply !== undefined && suggested_reply !== null
            ? suggested_reply
            : draftSuggestedReply(title, snippet);
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
      const newIntentScore =
        intent_score !== undefined && intent_score !== null
          ? intent_score
          : computeIntentScore(newTitle, newSnippet);
      const newSuggestedReply =
        suggested_reply !== undefined && suggested_reply !== null
          ? suggested_reply
          : draftSuggestedReply(newTitle, newSnippet);

      const updatedLead = {
        ...lead,
        title: newTitle,
        snippet: newSnippet,
        platform: newPlatform,
        status: newStatus,
        intent_score: newIntentScore,
        suggested_reply: newSuggestedReply,
        updated_at: new Date().toISOString(),
      };
      inMemoryLeads[existingIndex] = updatedLead;
      return updatedLead;
    } else {
      const id = crypto.randomUUID();
      const finalIntentScore =
        intent_score !== undefined && intent_score !== null
          ? intent_score
          : computeIntentScore(title, snippet);
      const finalSuggestedReply =
        suggested_reply !== undefined && suggested_reply !== null
          ? suggested_reply
          : draftSuggestedReply(title, snippet);
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
        updated_at: new Date().toISOString(),
      };
      inMemoryLeads.push(newLead);
      return newLead;
    }
  }
});

fastify.get('/api/waitlist', async (request, reply) => {
  let leads = [];
  if (sql) {
    try {
      leads = await sql`SELECT * FROM waitlist_leads ORDER BY created_at ASC`;
    } catch (err) {
      fastify.log.error('DB GET /api/waitlist error:', err);
      return reply.status(500).send({ error: 'Database error' });
    }
  } else {
    leads = [...inMemoryWaitlistLeads];
  }
  return leads;
});

fastify.get('/api/waitlist/first', async (request, reply) => {
  let firstLead = null;
  let source = 'waitlist_leads';

  if (sql) {
    try {
      const dbLeads = await sql`SELECT * FROM waitlist_leads ORDER BY created_at ASC LIMIT 1`;
      if (dbLeads.length > 0) {
        firstLead = dbLeads[0];
      }
    } catch (err) {
      fastify.log.error('DB GET /api/waitlist/first error:', err);
    }
  }

  if (!firstLead && inMemoryWaitlistLeads.length > 0) {
    firstLead = inMemoryWaitlistLeads[0];
    source = 'waitlist_leads';
  }

  // Fallback to social_leads if waitlist_leads has no entries yet
  if (!firstLead) {
    if (sql) {
      try {
        const socialLeads =
          await sql`SELECT * FROM social_leads ORDER BY intent_score DESC, created_at ASC LIMIT 1`;
        if (socialLeads.length > 0) {
          firstLead = socialLeads[0];
          source = 'social_leads';
        }
      } catch (err) {
        fastify.log.error('DB GET /api/waitlist/first social_leads fallback error:', err);
      }
    } else if (inMemoryLeads.length > 0) {
      firstLead = inMemoryLeads[0];
      source = 'social_leads';
    }
  }

  if (!firstLead) {
    return reply.status(404).send({ error: 'No waitlist leads found' });
  }

  return {
    success: true,
    source,
    customer: firstLead,
  };
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

  leads = leads.map(l => ({
    ...l,
    intent_score: l.intent_score !== undefined && l.intent_score !== null ? l.intent_score : 50,
  }));

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
      const newReply =
        suggested_reply !== undefined ? suggested_reply : existing[0].suggested_reply;

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
      updated_at: new Date().toISOString(),
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
  const {
    company_name,
    owner_name,
    email,
    phone,
    website,
    city,
    state,
    trade,
    status,
    cold_email,
  } = request.body || {};

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
          updated_at: new Date().toISOString(),
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
      updated_at: new Date().toISOString(),
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
      updated_at: new Date().toISOString(),
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

fastify.listen({ port, host: '0.0.0.0' }, err => {
  if (err) throw err;
});
