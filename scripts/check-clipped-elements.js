import { spawn } from 'child_process';
import { chromium } from '@playwright/test';
import { writeFileSync } from 'fs';

const pages = [
  '/',
  '/hvac-dispatch-software',
  '/hvac-dispatch-app-vs-spreadsheets',
  '/how-to-choose-hvac-dispatch-app',
  '/plumbing-dispatch-software',
  '/electrical-dispatch-software',
  '/appliance-repair-dispatch-software',
  '/pest-control-dispatch-software',
  '/garage-door-dispatch-software',
  '/cleaning-dispatch-software',
  '/landscaping-dispatch-software',
  '/roofing-dispatch-software',
  '/locksmith-dispatch-software',
  '/pool-service-dispatch-software',
  '/commercial-facilities-dispatch-software',
  '/septic-service-dispatch-software',
  '/emergency-restoration-dispatch-software',
  '/restoration-job-management-software',
  '/handyman-dispatch-software',
  '/carpet-cleaning-dispatch-software',
  '/tree-service-dispatch-software',
  '/field-service-scheduling',
  '/how-hvac-dispatch-apps-reduce-phone-tag',
  '/mobile-dispatch-board',
  '/servicetitan-alternative',
  '/jobber-alternative',
  '/housecallpro-alternative',
  '/servicefusion-alternative',
  '/buildops-alternative',
  '/fieldedge-alternative',
  '/tools/facebook-post-generator',
];

console.log('Starting local server on port 3221...');
const server = spawn('node', ['server.js'], {
  env: { ...process.env, PORT: '3221', DATABASE_URL: '' },
});

server.stdout.on('data', data => {
  console.log(`[Server] ${data.toString().trim()}`);
});

server.stderr.on('data', data => {
  console.error(`[Server Error] ${data.toString().trim()}`);
});

// Wait 4 seconds for server to start
await new Promise(resolve => setTimeout(resolve, 4000));

const results = [];

try {
  const browser = await chromium.launch();

  // We check Mobile (320px) viewport specifically
  const width = 320;
  const height = 568;

  const context = await browser.newContext({
    viewport: { width, height },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
  });

  const page = await context.newPage();

  for (const path of pages) {
    const url = `http://localhost:3221${path}`;
    try {
      const response = await page.goto(url, { waitUntil: 'load', timeout: 10000 });

      if (response?.status() !== 200) {
        console.error(`Page ${path} returned status ${response?.status()}`);
        results.push({
          path,
          error: `HTTP status ${response?.status()}`,
        });
        continue;
      }

      const clippedInfo = await page.evaluate(vpWidth => {
        const all = document.querySelectorAll('*');
        const clippedElements = [];

        for (const el of all) {
          const style = window.getComputedStyle(el);
          if (
            style.display === 'none' ||
            style.visibility === 'hidden' ||
            parseFloat(style.opacity) === 0
          ) {
            continue;
          }

          const rect = el.getBoundingClientRect();

          // Element extends past right edge or left edge of viewport
          if (rect.right > vpWidth + 0.5 || rect.left < -0.5) {
            clippedElements.push({
              tagName: el.tagName,
              className: el.className,
              id: el.id,
              left: rect.left,
              right: rect.right,
              width: rect.width,
              outerHTML: el.outerHTML.substring(0, 150),
            });
          }
        }

        return {
          scrollWidth: document.documentElement.scrollWidth,
          bodyScrollWidth: document.body.scrollWidth,
          clippedElements,
        };
      }, width);

      results.push({
        path,
        scrollWidth: clippedInfo.scrollWidth,
        bodyScrollWidth: clippedInfo.bodyScrollWidth,
        clippedCount: clippedInfo.clippedElements.length,
        clippedElements: clippedInfo.clippedElements,
      });

      if (clippedInfo.clippedElements.length > 0) {
        console.log(
          `Path ${path}: scrollWidth=${clippedInfo.scrollWidth}, bodyScrollWidth=${clippedInfo.bodyScrollWidth}`
        );
        console.log(
          `  Found ${clippedInfo.clippedElements.length} elements extending past viewport limit.`
        );
        const uniqueTags = [...new Set(clippedInfo.clippedElements.map(e => e.tagName))];
        console.log(`  Tags: ${uniqueTags.join(', ')}`);
      } else {
        console.log(`Path ${path}: OK`);
      }
    } catch (err) {
      console.error(`Error on ${path}:`, err.message);
      results.push({
        path,
        error: err.message,
      });
    }
  }

  await browser.close();
} catch (e) {
  console.error(e);
} finally {
  server.kill();
  console.log('Server stopped.');
}

writeFileSync('scripts/clipped-results.json', JSON.stringify(results, null, 2));
console.log('Done checking clipped elements.');
