import { chromium } from '@playwright/test';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

async function main() {
  const runId = '20260619-waitlist-conversion';
  const outputDir = join(process.cwd(), 'dogfood-output', runId, 'screenshots');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  console.log('Launching browser to capture Verifier dogfood screenshots...');
  const browser = await chromium.launch({ headless: true });
  
  // 1. Desktop Context
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await desktopContext.newPage();

  // A. Homepage Hero Form
  console.log('1A. Capturing desktop homepage hero form...');
  await page.goto('http://localhost:3005/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: join(outputDir, 'desktop-homepage-hero.png') });

  // B. Fill and submit waitlist on Homepage
  console.log('1B. Submitting homepage waitlist form...');
  const form = page.locator('#waitlist-form');
  await form.locator('#name').fill('Verifier Test');
  await form.locator('#email').fill('verifier@example.com');
  await form.locator('#company').fill('Verifier QA Inc');
  await page.screenshot({ path: join(outputDir, 'desktop-homepage-form-filled.png') });

  await form.locator('.form-submit').click();
  await page.waitForSelector('#waitlist-status');
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(outputDir, 'desktop-homepage-success.png') });

  // Check the link in success message
  const setupLink = await page.locator('#waitlist-status a.waitlist-setup-link').getAttribute('href');
  console.log(`Success link constructed: ${setupLink}`);

  // C. HVAC Software Page Hero Form
  console.log('1C. Capturing HVAC page hero form...');
  await page.goto('http://localhost:3005/hvac-dispatch-software', { waitUntil: 'networkidle' });
  await page.screenshot({ path: join(outputDir, 'desktop-hvac-hero.png') });

  // D. Scroll to bottom of HVAC page to check footer
  console.log('1D. Capturing HVAC page footer scroll-to-top CTA...');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(outputDir, 'desktop-hvac-footer.png') });

  // 2. Mobile Context
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 667 },
    isMobile: true
  });
  const mobilePage = await mobileContext.newPage();

  // A. Homepage Hero Form Mobile
  console.log('2A. Capturing mobile homepage hero form...');
  await mobilePage.goto('http://localhost:3005/', { waitUntil: 'networkidle' });
  await mobilePage.screenshot({ path: join(outputDir, 'mobile-homepage-hero.png') });

  // B. HVAC Page Hero Form Mobile
  console.log('2B. Capturing mobile HVAC page hero form...');
  await mobilePage.goto('http://localhost:3005/hvac-dispatch-software', { waitUntil: 'networkidle' });
  await mobilePage.screenshot({ path: join(outputDir, 'mobile-hvac-hero.png') });

  // 3. E2E Setup Wizard Flow from Success Link
  if (setupLink) {
    console.log('3. Navigating to setup wizard via link...');
    await page.goto(`http://localhost:3005${setupLink}`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: join(outputDir, 'wizard-step1.png') });

    // Step 1 - Add Technician
    await page.fill('input[name="tech_name_0"]', 'Sarah Connor');
    await page.fill('input[name="tech_phone_0"]', '+1 (555) 0288');
    await page.screenshot({ path: join(outputDir, 'wizard-step1-filled.png') });

    // Click Next -> Step 2
    await page.click('#btn-next');
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(outputDir, 'wizard-step2-rules.png') });

    // Click Next -> Step 3
    await page.click('#btn-next');
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(outputDir, 'wizard-step3-calendar.png') });

    // Click Submit -> Redirect to /app
    console.log('Submitting wizard...');
    await page.click('#btn-submit');
    await page.waitForURL(/\/app/, { timeout: 10000 });
    await page.waitForTimeout(1000);
    console.log('App Supervision Board loaded.');
    await page.screenshot({ path: join(outputDir, 'app-supervision-board.png') });

    // Simulation check
    console.log('Running AI dispatch simulation...');
    await page.selectOption('select[id="job-time"]', 'BusinessHours');
    await page.selectOption('select[id="job-trade"]', 'HVAC');
    await page.fill('input[id="job-desc"]', 'AC units making grinding noise');
    await page.screenshot({ path: join(outputDir, 'simulation-ready.png') });

    await page.click('button[type="submit"]:has-text("Dispatch Work Order")');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: join(outputDir, 'simulation-complete.png') });
  }

  await browser.close();
  console.log(`Verifier dogfood screenshots captured inside: ${outputDir}`);
}

main().catch(err => {
  console.error('Failed to capture Verifier dogfood screenshots:', err);
  process.exit(1);
});
