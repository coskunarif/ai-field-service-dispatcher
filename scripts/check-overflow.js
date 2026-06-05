import { spawn } from 'child_process';
import { chromium } from '@playwright/test';

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

console.log('Starting local server on port 3005...');
const server = spawn('node', ['server.js'], {
  env: { ...process.env, PORT: '3005', DATABASE_URL: '' }
});

await new Promise(resolve => setTimeout(resolve, 2000));

try {
  const browser = await chromium.launch();
  
  const viewports = [
    { name: 'Desktop (1280x800)', width: 1280, height: 800, isMobile: false },
    { name: 'Mobile (390x844)', width: 390, height: 844, isMobile: true }
  ];

  for (const vp of viewports) {
    console.log(`\n=================== TESTING VIEWPORT: ${vp.name} ===================`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      userAgent: vp.isMobile ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1' : undefined
    });
    
    const page = await context.newPage();

    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        console.log(`[${vp.name}] CONSOLE ${msg.type().toUpperCase()}: ${msg.text()}`);
      }
    });

    page.on('pageerror', err => {
      console.error(`[${vp.name}] BROWSER ERROR: ${err.message}`);
    });

    for (const path of pages) {
      const url = `http://localhost:3005${path}`;
      const response = await page.goto(url, { waitUntil: 'load', timeout: 10000 });
      if (response?.status() !== 200) {
        console.error(`[${vp.name}] Failed loading ${path}: HTTP ${response?.status()}`);
        continue;
      }

      const overflowInfo = await page.evaluate(() => {
        const scrollWidth = document.documentElement.scrollWidth;
        const innerWidth = window.innerWidth;
        const bodyScrollWidth = document.body.scrollWidth;
        
        let badElement = null;
        if (scrollWidth > innerWidth || bodyScrollWidth > innerWidth) {
          const all = document.querySelectorAll('*');
          for (const el of all) {
            const rect = el.getBoundingClientRect();
            if (rect.right > innerWidth || rect.left < 0) {
              badElement = {
                tagName: el.tagName,
                className: el.className,
                id: el.id,
                right: rect.right,
                left: rect.left,
                width: rect.width
              };
              break;
            }
          }
        }

        return {
          overflow: scrollWidth > innerWidth || bodyScrollWidth > innerWidth,
          scrollWidth,
          bodyScrollWidth,
          innerWidth,
          badElement
        };
      });

      if (overflowInfo.overflow) {
        console.warn(`[${vp.name}] ⚠️ OVERFLOW on ${path}: scrollWidth=${overflowInfo.scrollWidth}, bodyScrollWidth=${overflowInfo.bodyScrollWidth}, innerWidth=${overflowInfo.innerWidth}`);
        if (overflowInfo.badElement) {
          console.warn(`  Offending element: <${overflowInfo.badElement.tagName} class="${overflowInfo.badElement.className}" id="${overflowInfo.badElement.id}"> (width=${overflowInfo.badElement.width}, right=${overflowInfo.badElement.right})`);
        }
      }
    }
    await context.close();
  }

  await browser.close();
} catch (e) {
  console.error('Error during audits:', e);
} finally {
  server.kill();
  console.log('Server stopped.');
}
