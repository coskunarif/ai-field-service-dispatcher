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

const PORT = 3007;
console.log(`Connecting to server on port ${PORT}...`);

const results = [];

try {
  const browser = await chromium.launch();
  
  const viewports = [
    { name: 'Mobile (320px)', width: 320, height: 568, isMobile: true },
    { name: 'Tablet (768px)', width: 768, height: 1024, isMobile: false },
    { name: 'Desktop (1440px)', width: 1440, height: 900, isMobile: false }
  ];

  for (const vp of viewports) {
    console.log(`\n=================== TESTING VIEWPORT: ${vp.name} ===================`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      userAgent: vp.isMobile ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1' : undefined
    });
    
    const page = await context.newPage();

    for (const path of pages) {
      const url = `http://localhost:${PORT}${path}`;
      const response = await page.goto(url, { waitUntil: 'load', timeout: 10000 });
      if (response?.status() !== 200) {
        console.error(`[${vp.name}] Failed loading ${path}: HTTP ${response?.status()}`);
        results.push({
          viewport: vp.name,
          path,
          status: response?.status(),
          overflow: false,
          error: 'Failed to load page'
        });
        continue;
      }

      // Check overflow
      const overflowInfo = await page.evaluate(() => {
        const scrollWidth = document.documentElement.scrollWidth;
        const innerWidth = window.innerWidth;
        const bodyScrollWidth = document.body.scrollWidth;
        
        const overflow = scrollWidth > innerWidth || bodyScrollWidth > innerWidth;
        
        let badElements = [];
        if (overflow) {
          const all = document.querySelectorAll('*');
          for (const el of all) {
            const style = window.getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden') {
              continue;
            }
            
            const rect = el.getBoundingClientRect();
            if (rect.right > innerWidth + 0.5 || rect.left < -0.5) {
              badElements.push({
                tagName: el.tagName,
                className: el.className,
                id: el.id,
                right: rect.right,
                left: rect.left,
                width: rect.width,
                outerHTML: el.outerHTML.substring(0, 200)
              });
            }
          }
        }

        return {
          overflow,
          scrollWidth,
          bodyScrollWidth,
          innerWidth,
          badElements
        };
      });

      results.push({
        viewport: vp.name,
        width: vp.width,
        path,
        status: 200,
        ...overflowInfo
      });

      if (overflowInfo.overflow) {
        console.warn(`[${vp.name}] ⚠️ OVERFLOW on ${path}: scrollWidth=${overflowInfo.scrollWidth}, bodyScrollWidth=${overflowInfo.bodyScrollWidth}, innerWidth=${overflowInfo.innerWidth}`);
        if (overflowInfo.badElements.length > 0) {
          console.warn(`  Offending elements count: ${overflowInfo.badElements.length}`);
          overflowInfo.badElements.slice(0, 3).forEach(el => {
            console.warn(`    <${el.tagName} class="${el.className}" id="${el.id}"> width=${el.width.toFixed(1)} left=${el.left.toFixed(1)} right=${el.right.toFixed(1)}`);
          });
        }
      } else {
        console.log(`[${vp.name}] ✅ Pass: ${path}`);
      }
    }
    await context.close();
  }

  await browser.close();
} catch (e) {
  console.error('Error during audits:', e);
}

// Write the findings to a JSON file for analysis
writeFileSync('scripts/custom-overflow-results.json', JSON.stringify(results, null, 2));
console.log('Results written to scripts/custom-overflow-results.json');
