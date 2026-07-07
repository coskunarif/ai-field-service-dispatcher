import { chromium } from '@playwright/test';

async function checkUrl(url) {
  console.log(`Checking ${url}...`);
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-ipv6']
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    console.log(`Status: ${response.status()}`);
    console.log(`Headers:`, response.headers());
    console.log(`Title: ${await page.title()}`);
    try {
      const h1 = await page.locator('h1').first().innerText();
      console.log(`H1: ${h1}`);
    } catch (e) {
      console.log(`No H1 found`);
    }
  } catch (err) {
    console.error(`Error loading ${url}:`, err);
  } finally {
    await browser.close();
  }
}

async function run() {
  await checkUrl('https://gainhelm.com/');
  await checkUrl('https://gainhelm-web-250134012801.us-central1.run.app/');
}

run();
