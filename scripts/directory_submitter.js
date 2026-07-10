import { chromium } from '@playwright/test';
import readline from 'readline';
import fs from 'fs';
import path from 'path';

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve =>
    rl.question(query, ans => {
      rl.close();
      resolve(ans);
    })
  );
}

// Read and parse GainHelm listing kit
const listingKitPath = path.resolve('reports/gainhelm-gsc/gainhelm-listing-kit.md');
const content = fs.readFileSync(listingKitPath, 'utf-8');

const productName = content.match(/Product name:\s*(.*)/)?.[1]?.trim() || 'GainHelm';
const website = content.match(/Website:\s*(.*)/)?.[1]?.trim() || 'https://gainhelm.com/';
const email = content.match(/Business email:\s*(.*)/)?.[1]?.trim() || 'arif.coskun@profithelm.com';
const category = content.match(/Category:\s*(.*)/)?.[1]?.trim() || 'Field Service Management';
const tagline =
  content.match(/Short tagline options:\s*\n\n-\s*(.*)/)?.[1]?.trim() ||
  'AI dispatch app for small field-service teams';

// Extract short description
const shortDescription = content.match(/## Short description\s*\n\n(.*)/)?.[1]?.trim() || '';
// Extract longer description
const longDescription =
  content.match(/## Longer directory description\s*\n\n(.*)/)?.[1]?.trim() || '';

const metadata = {
  productName,
  website,
  email,
  category,
  tagline,
  shortDescription,
  longDescription,
};

const isNonInteractive =
  process.argv.includes('--non-interactive') || process.env.NON_INTERACTIVE === 'true';
const hasDisplay = process.env.DISPLAY !== undefined;
const headless = isNonInteractive || !hasDisplay;

async function pauseForHuman(message) {
  console.log(`\n👉 ${message}`);
  if (headless) {
    console.log(
      'Running in headless/non-interactive mode. Proceeding automatically in 3 seconds...'
    );
    await new Promise(resolve => setTimeout(resolve, 3000));
  } else {
    await askQuestion(
      'Press Enter in this terminal after you have resolved this step to continue...'
    );
  }
}

function updateCsvStatus(targetName, newStatus) {
  const csvPath = path.resolve('reports/gainhelm-gsc/submission-tracker.csv');
  if (!fs.existsSync(csvPath)) return;
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const headers = lines[0].split(',');
  const updatedLines = [lines[0]];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const cols = [];
    let current = '';
    let insideQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        insideQuotes = !insideQuotes;
        current += char;
      } else if (char === ',' && !insideQuotes) {
        cols.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    cols.push(current.trim());

    let targetVal = cols[0] || '';
    if (targetVal.startsWith('"') && targetVal.endsWith('"')) {
      targetVal = targetVal.substring(1, targetVal.length - 1);
    }

    if (targetVal.toLowerCase() === targetName.toLowerCase()) {
      cols[3] = newStatus;
    }

    updatedLines.push(cols.join(','));
  }

  fs.writeFileSync(csvPath, updatedLines.join('\n') + '\n', 'utf-8');
}

async function fillGenericFields(page, meta) {
  const inputs = [
    {
      selectors: [
        'input[name*="name" i]',
        'input[placeholder*="name" i]',
        'input[placeholder*="Product" i]',
      ],
      value: meta.productName,
    },
    {
      selectors: [
        'input[name*="url" i]',
        'input[name*="website" i]',
        'input[placeholder*="URL" i]',
        'input[placeholder*="Website" i]',
      ],
      value: meta.website,
    },
    { selectors: ['input[name*="email" i]', 'input[placeholder*="email" i]'], value: meta.email },
    {
      selectors: [
        'input[name*="tagline" i]',
        'input[name*="title" i]',
        'input[placeholder*="tagline" i]',
      ],
      value: meta.tagline,
    },
    {
      selectors: [
        'textarea[name*="description" i]',
        'textarea[name*="desc" i]',
        'textarea[placeholder*="Description" i]',
      ],
      value: meta.longDescription,
    },
  ];

  for (const item of inputs) {
    for (const selector of item.selectors) {
      try {
        const el = await page.$(selector);
        if (el && (await el.isVisible())) {
          await el.fill(item.value);
          console.log(`Filled ${selector} with ${item.value.substring(0, 30)}...`);
          break;
        }
      } catch (e) {
        // ignore
      }
    }
  }
}

async function main() {
  console.log(`Launching chromium (headless: ${headless})...`);
  const browser = await chromium.launch({ headless });
  const context = await browser.newContext();
  const page = await context.newPage();

  const evidenceDir = path.resolve('reports/gainhelm-gsc/evidence');
  if (!fs.existsSync(evidenceDir)) {
    fs.mkdirSync(evidenceDir, { recursive: true });
  }

  // 1. SaaSHub
  console.log('\n--- SaaSHub ---');
  try {
    await page.goto('https://www.saashub.com/submit', {
      timeout: 30000,
      waitUntil: 'domcontentloaded',
    });
    await fillGenericFields(page, metadata);
    await page.screenshot({ path: path.join(evidenceDir, 'saashub-submitted.png') });
    await pauseForHuman('SaaSHub: Solve CAPTCHA and submit');
    updateCsvStatus('SaaSHub', 'submitted');
  } catch (e) {
    console.error('Error on SaaSHub:', e.message);
    try {
      await page.screenshot({ path: path.join(evidenceDir, 'saashub-submitted.png') });
    } catch {
      /* screenshot failed, ignore */
    }
    updateCsvStatus('SaaSHub', 'attempted-unclear');
  }

  // 2. BetaList
  console.log('\n--- BetaList ---');
  try {
    await page.goto('https://betalist.com/submit', {
      timeout: 30000,
      waitUntil: 'domcontentloaded',
    });
    await fillGenericFields(page, metadata);
    await page.screenshot({ path: path.join(evidenceDir, 'betalist-submitted.png') });
    await pauseForHuman('BetaList: Solve CAPTCHA and submit');
    updateCsvStatus('BetaList', 'submitted');
  } catch (e) {
    console.error('Error on BetaList:', e.message);
    try {
      await page.screenshot({ path: path.join(evidenceDir, 'betalist-submitted.png') });
    } catch {
      /* screenshot failed, ignore */
    }
    updateCsvStatus('BetaList', 'attempted-unclear');
  }

  // 3. Futurepedia
  console.log('\n--- Futurepedia ---');
  try {
    await page.goto('https://www.futurepedia.io/submit-a-tool', {
      timeout: 30000,
      waitUntil: 'domcontentloaded',
    });
    await fillGenericFields(page, metadata);
    await page.screenshot({ path: path.join(evidenceDir, 'futurepedia-submitted.png') });
    await pauseForHuman('Futurepedia: Solve CAPTCHA and submit');
    updateCsvStatus('Futurepedia', 'submitted');
  } catch (e) {
    console.error('Error on Futurepedia:', e.message);
    try {
      await page.screenshot({ path: path.join(evidenceDir, 'futurepedia-submitted.png') });
    } catch {
      /* screenshot failed, ignore */
    }
    updateCsvStatus('Futurepedia', 'attempted-unclear');
  }

  // 4. Toolify.ai
  console.log('\n--- Toolify.ai ---');
  try {
    await page.goto('https://www.toolify.ai/submit', {
      timeout: 30000,
      waitUntil: 'domcontentloaded',
    });
    await fillGenericFields(page, metadata);
    await page.screenshot({ path: path.join(evidenceDir, 'toolify-submitted.png') });
    await pauseForHuman('Toolify.ai: Solve CAPTCHA and submit');
    updateCsvStatus('Toolify.ai', 'submitted');
  } catch (e) {
    console.error('Error on Toolify.ai:', e.message);
    try {
      await page.screenshot({ path: path.join(evidenceDir, 'toolify-submitted.png') });
    } catch {
      /* screenshot failed, ignore */
    }
    updateCsvStatus('Toolify.ai', 'attempted-unclear');
  }

  // 5. There’s An AI For That
  console.log('\n--- There’s An AI For That ---');
  try {
    await page.goto('https://theresanaiforthat.com/submit/', {
      timeout: 30000,
      waitUntil: 'domcontentloaded',
    });
    await fillGenericFields(page, metadata);
    await page.screenshot({ path: path.join(evidenceDir, 'theresanaiforthat-submitted.png') });
    await pauseForHuman('There’s An AI For That: Solve CAPTCHA and submit');
    updateCsvStatus('There’s An AI For That', 'submitted');
  } catch (e) {
    console.error('Error on There’s An AI For That:', e.message);
    try {
      await page.screenshot({ path: path.join(evidenceDir, 'theresanaiforthat-submitted.png') });
    } catch {
      /* screenshot failed, ignore */
    }
    updateCsvStatus('There’s An AI For That', 'attempted-unclear');
  }

  // 6. DevHunt
  console.log('\n--- DevHunt ---');
  try {
    await page.goto('https://devhunt.org/', { timeout: 30000, waitUntil: 'domcontentloaded' });
    await fillGenericFields(page, metadata);
    await page.screenshot({ path: path.join(evidenceDir, 'devhunt-submitted.png') });
    await pauseForHuman('DevHunt: Solve CAPTCHA and submit');
    updateCsvStatus('DevHunt', 'submitted');
  } catch (e) {
    console.error('Error on DevHunt:', e.message);
    try {
      await page.screenshot({ path: path.join(evidenceDir, 'devhunt-submitted.png') });
    } catch {
      /* screenshot failed, ignore */
    }
    updateCsvStatus('DevHunt', 'attempted-unclear');
  }

  // 7. Startup Buffer
  console.log('\n--- Startup Buffer ---');
  try {
    await page.goto('https://startupbuffer.com/site/submit', {
      timeout: 30000,
      waitUntil: 'domcontentloaded',
    });
    await fillGenericFields(page, metadata);
    await page.screenshot({ path: path.join(evidenceDir, 'startupbuffer-submitted.png') });
    await pauseForHuman('Startup Buffer: Solve CAPTCHA and submit');
    updateCsvStatus('Startup Buffer', 'submitted');
  } catch (e) {
    console.error('Error on Startup Buffer:', e.message);
    try {
      await page.screenshot({ path: path.join(evidenceDir, 'startupbuffer-submitted.png') });
    } catch {
      /* screenshot failed, ignore */
    }
    updateCsvStatus('Startup Buffer', 'attempted-unclear');
  }

  console.log('\nSubmissions process finished! Closing browser.');
  await browser.close();
}

main().catch(console.error);
