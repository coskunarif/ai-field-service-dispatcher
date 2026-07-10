import { chromium } from '@playwright/test';

async function main() {
  console.log('Connecting to browser at port 3012...');
  const browser = await chromium.connectOverCDP('http://localhost:3012');
  const contexts = browser.contexts();

  for (const context of contexts) {
    const pages = context.pages();
    for (const page of pages) {
      const url = page.url();
      if (url.includes('capterra.com')) {
        console.log(`\nAnalyzing Capterra Page: ${url}`);
        const title = await page.title();
        console.log(`Title: ${title}`);

        const finalUrl = page.url();
        console.log(`Actual URL: ${finalUrl}`);

        try {
          const bodyText = await page.innerText('body');
          console.log(`Page content:\n${bodyText.slice(0, 1500)}`);
        } catch (e) {
          console.log(`Could not fetch body text:`, e.message);
        }
      }
    }
  }

  await browser.close();
}

main().catch(console.error);
