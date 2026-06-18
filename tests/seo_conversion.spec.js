import { test, expect } from '@playwright/test';

const targets = {
  '/hvac-dispatch-software': {
    title: 'Best HVAC Dispatch Software | Gainhelm',
    description: 'Gainhelm helps HVAC teams schedule calls, assign technicians, and keep the board readable on iPad or mobile.'
  },
  '/plumbing-dispatch-software': {
    title: 'Plumbing Dispatch Software for Service Calls | Gainhelm',
    description: 'Gainhelm helps plumbing teams schedule service calls, assign plumbers, and keep the day organized.'
  },
  '/field-service-scheduling': {
    title: 'Field Service Scheduling Software | Gainhelm',
    description: 'Gainhelm helps field service teams book jobs, dispatch technicians, and keep work organized.'
  },
  '/tree-service-dispatch-software': {
    title: 'Tree Service Dispatch Software | Gainhelm',
    description: 'Gainhelm helps tree service crews schedule jobs, assign arborists, and manage work orders.'
  },
  '/septic-service-dispatch-software': {
    title: 'Septic Service Dispatch & Scheduling Software | Gainhelm',
    description: 'Gainhelm helps septic teams schedule pumpings, dispatch technicians, and coordinate tank cleanings.'
  },
  '/carpet-cleaning-dispatch-software': {
    title: 'Carpet Cleaning Dispatch & Scheduling Software | Gainhelm',
    description: 'Gainhelm helps carpet cleaning teams schedule service calls, coordinate crews, and dispatch technicians.'
  },
  '/emergency-restoration-dispatch-software': {
    title: 'Emergency Restoration Dispatch & Job Software | Gainhelm',
    description: 'Gainhelm helps disaster restoration teams schedule emergency calls, dispatch technicians, and manage jobs.'
  },
  '/locksmith-dispatch-software': {
    title: 'Locksmith Dispatch & Scheduling Software | Gainhelm',
    description: 'Gainhelm helps locksmith teams dispatch locksmiths, schedule jobs, and track work orders.'
  },
  '/electrical-dispatch-software': {
    title: 'Electrical Contractor Scheduling & Dispatch Software | Gainhelm',
    description: 'Gainhelm helps electrical contractors schedule jobs, dispatch technicians, and coordinate service calls.'
  }
};

test.describe('SEO/GEO Conversion and Waitlist Enhancements', () => {

  // [AC-1]: Metadata Optimization for Target Landing Pages
  for (const [path, expected] of Object.entries(targets)) {
    test(`[AC-1] Metadata: Page ${path} matches target title and description exactly`, async ({ page }) => {
      await page.goto(path);
      
      const title = await page.title();
      expect(title).toBe(expected.title);
      expect(title.length).toBeLessThanOrEqual(70);

      const description = page.locator('meta[name="description"]');
      await expect(description).toHaveAttribute('content', expected.description);
      expect(expected.description.length).toBeGreaterThanOrEqual(120);
      expect(expected.description.length).toBeLessThanOrEqual(180);
    });
  }

  // [AC-2]: Structured Data & Schema Consistency
  for (const [path, expected] of Object.entries(targets)) {
    test(`[AC-2] Structured Data: Page ${path} has consistent H1, canonical link, and JSON-LD schema`, async ({ page }) => {
      await page.goto(path);
      
      // Canonical link checks
      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveAttribute('href', `https://gainhelm.com${path}`);

      // H1 Header uniqueness check
      const h1s = page.locator('h1');
      await expect(h1s).toHaveCount(1);

      // JSON-LD schema parsing and consistency check
      const scripts = await page.locator('script[type="application/ld+json"]').allInnerTexts();
      expect(scripts.length).toBeGreaterThan(0);

      let foundWebPage = false;
      for (const scriptText of scripts) {
        try {
          const data = JSON.parse(scriptText);
          const graph = data['@graph'] || (Array.isArray(data) ? data : [data]);
          for (const item of graph) {
            if (item['@type'] === 'WebPage') {
              expect(item.name).toBe(expected.title);
              expect(item.description).toBe(expected.description);
              expect(item.url).toBe(`https://gainhelm.com${path}`);
              foundWebPage = true;
            }
          }
        } catch (e) {
          throw new Error(`Failed to parse JSON-LD: ${e.message}`);
        }
      }
      expect(foundWebPage, `Expected to find WebPage entity in JSON-LD graph matching metadata for ${path}`).toBe(true);
    });
  }

  // [AC-2]: Structured Data & Schema Consistency (Audit Script Run)
  test('[AC-2] Audit Script: Run gainhelm-seo-geo-audit.mjs with zero failures and warnings (excluding homepage warning)', async () => {
    const { execSync } = await import('child_process');
    try {
      const output = execSync('node scripts/gainhelm-seo-geo-audit.mjs', { encoding: 'utf8', stdio: 'pipe' });
      const warningsIndex = output.indexOf('Warnings:');
      if (warningsIndex !== -1) {
        const warningsPart = output.slice(warningsIndex);
        const lines = warningsPart.split('\n').filter(line => line.startsWith('-'));
        const nonHomeWarnings = lines.filter(l => !l.includes('/: no inline waitlist form'));
        expect(nonHomeWarnings.length).toBe(0);
      }
    } catch (err) {
      throw new Error(`Audit script execution failed or returned errors:\nStdout: ${err.stdout}\nStderr: ${err.stderr}`);
    }
  });

  // [AC-3] & [AC-4]: Interactive Onboarding Playground & Waitlist Form UX
  test('[AC-3] & [AC-4] Waitlist Integration: Submit form and verify button text, helper text, and onboarding link', async ({ page }) => {
    // Intercept client-side fetch to /waitlist to simulate success
    await page.route('**/waitlist', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/hvac-dispatch-software');

    // [AC-4] Submit button has action-oriented text
    const submitButton = page.locator('#waitlist-form button[type="submit"], #waitlist-form .form-submit');
    await expect(submitButton).toHaveText('Join Waitlist & Try Simulator');

    // [AC-4] A small helper text or sublabel indicates instant access to interactive SMS simulator
    const helperTextElement = page.locator('#waitlist-help, .waitlist-help');
    await expect(helperTextElement).toBeVisible();
    const helperText = await helperTextElement.innerText();
    expect(helperText).toMatch(/instant access|SMS simulator|simulator/i);

    // [AC-3] Fill in waitlist details
    const testEmail = 'john.doe@company.com';
    await page.fill('#name', 'John Doe');
    await page.fill('#email', testEmail);
    await page.fill('#company', 'JD AC Services');

    // Submit form
    await submitButton.click();

    // [AC-3] Success message shows standard waitlist success string
    const statusElement = page.locator('#waitlist-status');
    await expect(statusElement).toBeVisible();
    await expect(statusElement).toHaveClass(/success/);
    await expect(statusElement).toContainText("Thanks! You're on the waitlist. We'll be in touch soon.");

    // [AC-3] Check for prominent, visible link pointing to /setup?email=[USER_EMAIL] (URL-encoded)
    const ctaLink = statusElement.locator('a');
    await expect(ctaLink).toBeVisible();
    const expectedHref = `/setup?email=${encodeURIComponent(testEmail)}`;
    await expect(ctaLink).toHaveAttribute('href', expectedHref);
  });

  // [AC-5]: Offline Test Resilience (Fastify Server DB Fallback)
  test('[AC-5] Offline Resilience: server fallback saves lead to in-memory array when database is offline', async ({ request }) => {
    if (process.env.DATABASE_URL) {
      test.skip('DATABASE_URL is set, skipping offline database fallback test');
      return;
    }

    const uniqueEmail = `offline-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
    const payload = {
      name: 'Offline Lead',
      email: uniqueEmail,
      company: 'Offline Corp'
    };

    // Post to /waitlist
    const response = await request.post('/waitlist', {
      data: payload,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    expect(response.status()).toBe(200);
    const result = await response.json();
    expect(result.success).toBe(true);

    // Verify lead was stored in inMemoryLeads by retrieving via GET /api/leads
    const getResponse = await request.get('/api/leads');
    expect(getResponse.status()).toBe(200);
    const leads = await getResponse.json();

    const storedLead = leads.find(l => l.email === uniqueEmail);
    expect(storedLead).toBeDefined();
    expect(storedLead.name).toBe('Offline Lead');
    expect(storedLead.company).toBe('Offline Corp');
  });

});
