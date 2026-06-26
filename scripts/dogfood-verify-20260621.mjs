import { chromium } from '@playwright/test';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';

const targets = {
  '/hvac-dispatch-software': {
    title: 'AI-First HVAC Dispatch Software & SMS Scheduling | Gainhelm',
    description: 'Stop playing phone tag. Gainhelm automates HVAC dispatching and scheduling via headless SMS. Coordinates techs, syncs calendars, and runs on autopilot. Try simulator.',
    h1: 'Automate HVAC Dispatching & Keep Techs on the Road Without App Bloat',
    heroCopy: 'Tired of chasing technicians? Gainhelm schedules HVAC service calls, dispatches jobs via text message, and updates your Google Calendar automatically—no apps to download.'
  },
  '/plumbing-dispatch-software': {
    title: 'AI-First Plumbing Dispatch Software & SMS Scheduling | Gainhelm',
    description: 'Stop wasting time on manual plumber scheduling. Gainhelm dispatches plumbing calls via automated SMS, tracks technician acceptance, and syncs Google Calendar.',
    h1: 'Automate Plumber Scheduling & Stop Playing Telephone with Your Crew',
    heroCopy: 'Stop chasing plumbers for job updates. Gainhelm schedules plumbing calls, dispatches technicians via simple text messages, and updates your office calendar on autopilot.'
  },
  '/field-service-scheduling': {
    title: 'AI-First Field Service Scheduling & SMS Dispatching | Gainhelm',
    description: 'Ditch complex field service dashboards. Gainhelm dispatches jobs to field technicians via 100% headless SMS and keeps your Google Calendar updated on autopilot.',
    h1: 'Streamline Field Service Scheduling with Headless SMS Dispatching',
    heroCopy: 'Tired of screen-tapping bulky field service apps? Gainhelm coordinates scheduling and technician dispatching entirely in natural language via text. 100% app-free for techs.'
  },
  '/tree-service-dispatch-software': {
    title: 'AI-First Tree Service Dispatch Software & SMS Scheduling | Gainhelm',
    description: 'Coordinate tree service crews on autopilot. Gainhelm dispatches arborist crews via automated text messages, handles schedule changes, and syncs Google Calendar.',
    h1: 'Dispatch Tree Crews & Coordinate Arborists Without Complex App Logins',
    heroCopy: 'Stop playing phone tag with crews in the field. Gainhelm dispatches tree service work orders via SMS, tracks arborist confirmations, and syncs your calendar automatically.'
  },
  '/septic-service-dispatch-software': {
    title: 'AI-First Septic Service Dispatch & SMS Scheduling | Gainhelm',
    description: 'Automate septic pumping dispatching. Gainhelm schedules tank cleanings, dispatches septic crews via headless SMS, and keeps customer job details organized.',
    h1: 'Automate Septic Dispatching & Pumping Schedules with Headless SMS',
    heroCopy: 'Tired of manually coordinating pumping routes? Gainhelm dispatches septic technicians via simple text messages, tracks job acceptance, and updates your calendar instantly.'
  },
  '/carpet-cleaning-dispatch-software': {
    title: 'AI-First Carpet Cleaning Dispatch & SMS Scheduling | Gainhelm',
    description: 'Stop wasting hours scheduling carpet cleaning crews. Gainhelm dispatches booking requests via automated SMS and syncs cleanings directly with Google Calendar.',
    h1: 'Automate Carpet Cleaning Dispatching & Keep Booking Calendars Full',
    heroCopy: 'Ditch manual calendars and endless texting. Gainhelm coordinates carpet cleaning jobs via headless SMS, dispatches crews instantly, and syncs calendar updates automatically.'
  },
  '/emergency-restoration-dispatch-software': {
    title: 'AI-First Emergency Restoration Dispatch & SMS Job App | Gainhelm',
    description: 'Fast-track emergency dispatching. Gainhelm dispatches disaster restoration crews via automated SMS, handles urgent job confirmations, and syncs Google Calendar.',
    h1: 'Automate Emergency Restoration Dispatching for Rapid Job Responses',
    heroCopy: 'Restoration calls are high-stakes. Gainhelm dispatches disaster restoration technicians via headless SMS instantly, handles rapid confirmation, and coordinates crews 24/7.'
  },
  '/locksmith-dispatch-software': {
    title: 'AI-First Locksmith Dispatch Software & SMS Scheduling | Gainhelm',
    description: 'Automate emergency locksmith dispatching. Gainhelm schedules locksmiths, dispatches urgent jobs via headless text messages, and updates calendars in real-time.',
    h1: 'Dispatch Emergency Locksmiths and Coordinate Crews on Autopilot',
    heroCopy: 'Stop playing phone tag during emergency lockouts. Gainhelm dispatches locksmith technicians via automated SMS, tracks technician acceptance, and syncs Google Calendar.'
  },
  '/electrical-dispatch-software': {
    title: 'AI-First Electrical Dispatch Software & SMS Scheduling | Gainhelm',
    description: 'Ditch the phone tag. Gainhelm dispatches electrician service calls and updates contractor schedules via automated text messages. Syncs with Google Calendar.',
    h1: 'Automate Electrician Dispatching & Coordinate Service Calls via SMS',
    heroCopy: 'No more manual scheduling or text tag. Gainhelm coordinates electrical service calls, dispatches electrician teams via headless text, and updates Google Calendar automatically.'
  }
};

async function main() {
  const runId = '20260621-landing-copy';
  const outputDir = join(process.cwd(), 'dogfood-output', runId, 'screenshots');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const port = 3015;
  console.log(`Starting server on port ${port}...`);
  const serverProc = spawn('node', ['server.js'], {
    env: { ...process.env, PORT: port.toString() }
  });

  serverProc.stdout.on('data', (data) => {
    // console.log(`[Server stdout] ${data.toString().trim()}`);
  });

  serverProc.stderr.on('data', (data) => {
    console.error(`[Server stderr] ${data.toString().trim()}`);
  });

  // Wait 3 seconds for server to boot
  await new Promise((resolve) => setTimeout(resolve, 3000));

  console.log('Launching browser to capture dogfood screenshots...');
  const browser = await chromium.launch({ headless: true });
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 667 },
    isMobile: true
  });

  const dPage = await desktopContext.newPage();
  const mPage = await mobileContext.newPage();

  for (const [path, expected] of Object.entries(targets)) {
    console.log(`Verifying: ${path}`);
    const url = `http://localhost:${port}${path}`;
    
    // 1. Desktop Verification
    await dPage.goto(url, { waitUntil: 'networkidle' });
    const dTitle = await dPage.title();
    if (dTitle !== expected.title) {
      throw new Error(`Title mismatch on ${path}. Expected: "${expected.title}", Got: "${dTitle}"`);
    }

    const dDesc = await dPage.locator('meta[name="description"]').getAttribute('content');
    if (dDesc !== expected.description) {
      throw new Error(`Description mismatch on ${path}. Expected: "${expected.description}", Got: "${dDesc}"`);
    }

    const dH1 = await dPage.locator('h1').innerText();
    if (dH1.trim() !== expected.h1) {
      throw new Error(`H1 mismatch on ${path}. Expected: "${expected.h1}", Got: "${dH1.trim()}"`);
    }

    const dHeroLede = await dPage.locator('p.hero-lede').innerText();
    if (dHeroLede.trim() !== expected.heroCopy) {
      throw new Error(`Hero copy mismatch on ${path}. Expected: "${expected.heroCopy}", Got: "${dHeroLede.trim()}"`);
    }

    const fileBase = path.substring(1);
    await dPage.screenshot({ path: join(outputDir, `desktop-${fileBase}.png`) });

    // 2. Mobile Verification
    await mPage.goto(url, { waitUntil: 'networkidle' });
    await mPage.screenshot({ path: join(outputDir, `mobile-${fileBase}.png`) });
  }

  // 3. Form Submission Verification (HVAC)
  console.log('Verifying HVAC waitlist form submission...');
  await dPage.goto(`http://localhost:${port}/hvac-dispatch-software`, { waitUntil: 'networkidle' });
  const form = dPage.locator('#waitlist-form');
  await form.locator('#name').fill('Verifier Dogfood Test');
  await form.locator('#email').fill('verifier-dogfood@example.com');
  await form.locator('#company').fill('Verifier Trade Inc');
  await dPage.screenshot({ path: join(outputDir, 'desktop-hvac-form-filled.png') });

  await form.locator('.form-submit').click();
  await dPage.waitForSelector('#waitlist-status');
  await dPage.waitForTimeout(500);
  await dPage.screenshot({ path: join(outputDir, 'desktop-hvac-success-state.png') });

  const setupLink = await dPage.locator('#waitlist-status a.waitlist-setup-link').getAttribute('href');
  console.log(`Success link constructed: ${setupLink}`);
  if (!setupLink.includes('/setup?email=')) {
    throw new Error(`Invalid setup link constructed: ${setupLink}`);
  }

  // Navigate setup link
  await dPage.goto(`http://localhost:${port}${setupLink}`, { waitUntil: 'networkidle' });
  await dPage.screenshot({ path: join(outputDir, 'wizard-setup-step1.png') });

  await browser.close();
  console.log('Closing local server...');
  serverProc.kill();
  console.log(`All 9 pages verified successfully. Screenshots saved inside: ${outputDir}`);
}

main().catch(err => {
  console.error('Dogfood verification script failed:', err);
  process.exit(1);
});
