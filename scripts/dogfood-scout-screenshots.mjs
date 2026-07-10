import { chromium } from '@playwright/test';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';

async function main() {
  const outputDir = join(process.cwd(), 'dogfood-output', 'scout-20260620', 'screenshots');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const port = 3012;
  console.log(`Starting server on port ${port}...`);
  const serverProc = spawn('node', ['server.js'], {
    env: { ...process.env, PORT: port.toString() },
  });

  serverProc.stdout.on('data', data => {
    console.log(`[Server stdout] ${data.toString().trim()}`);
  });

  serverProc.stderr.on('data', data => {
    console.error(`[Server stderr] ${data.toString().trim()}`);
  });

  // Wait 2 seconds for server to boot
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('Launching browser to capture dogfood screenshots...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  // 1. Homepage
  console.log('Capturing homepage...');
  await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: join(outputDir, 'homepage.png') });

  // 2. HVAC Software Page
  console.log('Capturing HVAC page...');
  await page.goto(`http://localhost:${port}/hvac-dispatch-software`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: join(outputDir, 'hvac-landing.png') });

  // 3. Setup Wizard Step 1
  const testEmail = `scout-dogfood-${Math.random().toString(36).substring(7)}@example.com`;
  console.log(`Navigating to setup wizard for email: ${testEmail}...`);
  await page.goto(`http://localhost:${port}/setup?email=${encodeURIComponent(testEmail)}`, {
    waitUntil: 'networkidle',
  });
  await page.screenshot({ path: join(outputDir, 'setup-step1.png') });

  // Fill in Step 1 technician details
  await page.fill('input[name="tech_name_0"]', 'Sarah Connor');
  await page.fill('input[name="tech_phone_0"]', '+1 (555) 0288');
  await page.screenshot({ path: join(outputDir, 'setup-step1-filled.png') });

  // Click Next -> Step 2 (Rules)
  console.log('Navigating to step 2 rules...');
  await page.click('#btn-next');
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(outputDir, 'setup-step2-rules.png') });

  // Click Next -> Step 3 (Sandbox/Cal)
  console.log('Navigating to step 3 calendar...');
  await page.click('#btn-next');
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(outputDir, 'setup-step3-calendar.png') });

  // Click Submit -> Redirect to /app
  console.log('Submitting wizard...');
  await page.click('#btn-submit');
  await page.waitForURL(/\/app/, { timeout: 10000 });
  await page.waitForTimeout(1000); // Let logs/mockups render
  console.log('Supervision board loaded.');
  await page.screenshot({ path: join(outputDir, 'supervision-board.png') });

  // Try standard hours HVAC dispatch order simulation
  console.log('Simulating HVAC dispatch order routing...');
  await page.selectOption('select[id="job-time"]', 'BusinessHours');
  await page.selectOption('select[id="job-trade"]', 'HVAC');
  await page.fill('input[id="job-desc"]', 'AC fan broken in office');
  await page.screenshot({ path: join(outputDir, 'simulation-before-dispatch.png') });

  await page.click('button[type="submit"]:has-text("Dispatch Work Order")');
  await page.waitForTimeout(2000); // Wait for simulation log print
  await page.screenshot({ path: join(outputDir, 'simulation-dispatched.png') });

  // 4. Lead Queue Tool
  console.log('Capturing Lead Queue page...');
  await page.goto(`http://localhost:${port}/tools/lead-queue`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: join(outputDir, 'lead-queue.png') });

  // 5. Contractor Leads Tool
  console.log('Capturing Contractor Leads page...');
  await page.goto(`http://localhost:${port}/tools/contractor-leads`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: join(outputDir, 'contractor-leads.png') });

  // 6. Facebook Post Generator Tool
  console.log('Capturing Facebook Post Generator page...');
  await page.goto(`http://localhost:${port}/tools/facebook-post-generator`, {
    waitUntil: 'networkidle',
  });
  await page.screenshot({ path: join(outputDir, 'facebook-post-generator.png') });

  await browser.close();
  console.log('Closing local server...');
  serverProc.kill();
  console.log(
    `Screenshots captured successfully inside dogfood-output/scout-20260620/screenshots/`
  );
}

main().catch(err => {
  console.error('Failed to capture dogfood screenshots:', err);
  process.exit(1);
});
