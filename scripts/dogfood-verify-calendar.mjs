import { chromium } from '@playwright/test';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';

async function main() {
  const runId = '20260622-validate-calendar';
  const outputDir = join(process.cwd(), 'dogfood-output', runId);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const port = 3016;
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
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();

  // Dialog event handler for the help alert link and form submit alerts
  page.on('dialog', async (dialog) => {
    console.log(`[Dialog Alert Triggered]: "${dialog.message().replace(/\n/g, ' ')}"`);
    await dialog.accept();
  });

  const email = `dogfood-cal-${Math.random().toString(36).substring(7)}@example.com`;
  console.log(`Navigating to setup wizard for email: ${email}...`);
  await page.goto(`http://localhost:${port}/setup?email=${encodeURIComponent(email)}`, { waitUntil: 'networkidle' });

  // Move to Step 3
  console.log('Moving to Step 3...');
  await page.click('#btn-next');
  await page.waitForTimeout(200);
  await page.click('#btn-next');
  await page.waitForTimeout(200);

  // --- STATE 1: Not Verified (Default) ---
  console.log('Capturing State 1: Not Verified...');
  await page.screenshot({ path: join(outputDir, 'setup-step3-not-verified.png') });

  // --- TEST HELP LINK ---
  console.log('Clicking help guide link...');
  await page.click('#link-calendar-help');
  await page.waitForTimeout(200);

  // --- STATE 2: Verifying (Mocked Delay) ---
  // To capture "verifying" state, we'll click the button but we won't wait.
  // Wait, let's fill a URL and trigger verify
  await page.fill('input[name="calendar_url"]', 'https://calendar.google.com/calendar/embed?src=test');
  
  console.log('Triggering verification (for Verifying state capture)...');
  // We'll click but do not await page action fully to capture intermediate layout
  const verifyBtn = page.locator('#btn-verify-calendar');
  await verifyBtn.click();
  // Take screenshot immediately to catch the pulsing animation text
  await page.screenshot({ path: join(outputDir, 'setup-step3-verifying.png') });

  // Wait for verification success to settle
  await page.waitForSelector('#calendar-verify-status:has-text("verified")');
  
  // --- STATE 3: Verified (Success) ---
  console.log('Capturing State 3: Verified...');
  await page.screenshot({ path: join(outputDir, 'setup-step3-verified.png') });

  // --- STATE 4: Error State ---
  console.log('Triggering invalid validation for Error state...');
  await page.fill('input[name="calendar_url"]', 'https://calendar.google.com/invalid-private-cal');
  await page.click('#btn-verify-calendar');
  
  // Wait for the verification to update to failed / error
  await page.waitForSelector('#calendar-verify-status:has-text("failed")');
  console.log('Capturing State 4: Error...');
  await page.screenshot({ path: join(outputDir, 'setup-step3-error.png') });

  // --- PERSISTENCE TEST ---
  console.log('Testing localStorage persistence...');
  // Let's verify a valid link again
  await page.fill('input[name="calendar_url"]', 'https://calendar.google.com/calendar/embed?src=test');
  await page.click('#btn-verify-calendar');
  await page.waitForSelector('#calendar-verify-status:has-text("verified")');
  
  // Reload the page
  console.log('Reloading page to verify draft restoration...');
  await page.reload({ waitUntil: 'networkidle' });
  
  // Check if button is enabled and verified status is retained
  await page.screenshot({ path: join(outputDir, 'setup-step3-restored-verified.png') });

  await browser.close();
  console.log('Closing local server...');
  serverProc.kill();
  console.log('Verification script completed.');
}

main().catch(err => {
  console.error('Verification script failed:', err);
  process.exit(1);
});
