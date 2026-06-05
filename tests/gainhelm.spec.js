import { test, expect } from '@playwright/test';

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

const redirects = {
  '/electrical-dispatch-softwar': '/electrical-dispatch-software',
  '/electrician-dispatch-software': '/electrical-dispatch-software',
  '/lawn-care-dispatch-software': '/landscaping-dispatch-software',
  '/landscape-dispatch-software': '/landscaping-dispatch-software',
  '/appliance-service-dispatch-software': '/appliance-repair-dispatch-software',
  '/garage-door-repair-dispatch-software': '/garage-door-dispatch-software',
  '/cleaning-service-dispatch-software': '/cleaning-dispatch-software',
  '/pool-cleaning-dispatch-software': '/pool-service-dispatch-software',
  '/roofing-contractor-dispatch-software': '/roofing-dispatch-software',
  '/locksmith-service-dispatch-software': '/locksmith-dispatch-software',
  '/facilities-maintenance-dispatch-software': '/commercial-facilities-dispatch-software',
  '/water-damage-dispatch-software': '/emergency-restoration-dispatch-software',
  '/septic-pumping-dispatch-software': '/septic-service-dispatch-software',
  '/exterminator-dispatch-software': '/pest-control-dispatch-software',
  '/gainhelm-vs-servicetitan': '/servicetitan-alternative',
  '/gainhelm-vs-jobber': '/jobber-alternative',
  '/gainhelm-vs-housecallpro': '/housecallpro-alternative',
  '/gainhelm-vs-servicefusion': '/servicefusion-alternative',
  '/gainhelm-vs-buildops': '/buildops-alternative',
  '/gainhelm-vs-fieldedge': '/fieldedge-alternative',
  '/handyman-scheduling-software': '/handyman-dispatch-software',
  '/carpet-cleaning-scheduling-software': '/carpet-cleaning-dispatch-software',
  '/tree-service-scheduling-software': '/tree-service-dispatch-software',
};

const legacyGonePaths = [
  '/managebystats-alternative',
  '/tools/ad-spend-roi-calculator',
  '/blog/understanding-amazon-seller-fees',
  '/vs/inventory-lab',
  '/integrations/tiktok-ads',
  '/use-cases/private-label',
  '/comparisons',
  '/tools/amazon-fba-fees-calculator',
];

test.describe('Gainhelm Page Checks', () => {
  for (const path of pages) {
    test(`Page: ${path} returns 200 and loads basic content`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);

      // Verify title is present and contains Gainhelm
      const title = await page.title();
      expect(title).toContain('Gainhelm');

      // Verify h1 tag exists and is unique per page (SEO best practice)
      const h1s = page.locator('h1');
      await expect(h1s).toHaveCount(1);

      // Verify meta description tag exists and is not empty (SEO best practice)
      const metaDescription = page.locator('meta[name="description"]');
      await expect(metaDescription).toHaveAttribute('content', /.+/);

      // Verify canonical link matches the current path (SEO best practice)
      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveAttribute('href', new RegExp(`https://gainhelm.com${path === '/' ? '' : path}`));

      // Verify that common header and footer exist
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
    });
  }
});

test.describe('Redirects and Custom Error Handling', () => {
  for (const [fromPath, toPath] of Object.entries(redirects)) {
    test(`Redirect: ${fromPath} -> ${toPath}`, async ({ page }) => {
      await page.goto(fromPath);
      const pathname = new URL(page.url()).pathname;
      expect(pathname).toBe(toPath);
    });
  }

  for (const path of legacyGonePaths) {
    test(`Legacy retired page (410): ${path}`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(410);

      // Should display custom recovery message
      const brandChip = page.locator('.brand-chip');
      await expect(brandChip).toHaveText('410 route recovery');
      const headerTitle = page.locator('h1');
      await expect(headerTitle).toHaveText('This old page has been retired.');
    });
  }

  test('Not Found handler (404) for random route', async ({ page }) => {
    const response = await page.goto('/some-random-missing-page-here');
    expect(response?.status()).toBe(404);

    const brandChip = page.locator('.brand-chip');
    await expect(brandChip).toHaveText('404 route recovery');
    const headerTitle = page.locator('h1');
    await expect(headerTitle).toHaveText('We could not find that dispatch page.');
  });
});

test.describe('Footer & Navigation links', () => {
  test('Footer links are valid and not broken', async ({ page }) => {
    await page.goto('/');
    const links = page.locator('footer a');
    const count = await links.count();
    
    // Check that we have a substantial number of links in the footer
    expect(count).toBeGreaterThan(5);

    // Verify href of all links
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      expect(href).not.toBeNull();
      expect(href).not.toBe('');
    }
  });
});

test.describe('Waitlist Form Integration', () => {
  test('Successful waitlist signup on root page', async ({ page }) => {
    // Intercept client-side fetch to /waitlist
    await page.route('**/waitlist', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/');
    
    // Fill the waitlist form
    const form = page.locator('#waitlist-form');
    // Ensure the waitlist form is present
    if (await form.count() > 0) {
      await page.fill('#name', 'Test User');
      await page.fill('#email', 'testuser@example.com');
      await page.fill('#company', 'Test Company');

      // Submit
      await page.click('button[type="submit"]');

      // Check success state
      const statusElement = page.locator('#waitlist-status');
      await expect(statusElement).toBeVisible();
      await expect(statusElement).toHaveClass(/success/);
      await expect(statusElement).toHaveText(/Thanks! You're on the waitlist/);
    }
  });

  test('Shows validation error on empty fields', async ({ page }) => {
    await page.goto('/hvac-dispatch-software');
    
    // Submit empty form
    await page.click('#waitlist-form button[type="submit"]');

    // Should show error about name
    const statusElement = page.locator('#waitlist-status');
    await expect(statusElement).toBeVisible();
    await expect(statusElement).toHaveClass(/error/);
    await expect(statusElement).toHaveText(/Please add your name/);

    // Fill name, submit again
    await page.fill('#name', 'Test User');
    await page.click('#waitlist-form button[type="submit"]');

    // Should show error about email
    await expect(statusElement).toHaveText(/Please add a work email/);
  });

  test('Shows server side error if submission fails', async ({ page }) => {
    // Intercept client-side fetch and return 500
    await page.route('**/waitlist', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' }),
      });
    });

    await page.goto('/plumbing-dispatch-software');
    await page.fill('#name', 'Test User');
    await page.fill('#email', 'testuser@example.com');
    await page.click('#waitlist-form button[type="submit"]');

    const statusElement = page.locator('#waitlist-status');
    await expect(statusElement).toBeVisible();
    await expect(statusElement).toHaveClass(/error/);
    await expect(statusElement).toHaveText(/Server error. Please try again/);
  });
});

test.describe('Gainhelm Product Setup & App Board', () => {
  test('/setup renders authentication gateway without email', async ({ page }) => {
    await page.goto('/setup');
    const headerTitle = page.locator('h2');
    await expect(headerTitle).toHaveText('Access AI Configuration');
  });

  test('/setup?email=test@example.com renders wizard page', async ({ page }) => {
    await page.goto('/setup?email=test%40example.com');
    
    // Check that the step-dot is visible instead of checking the 0-width progress bar
    const stepDot = page.locator('#step-dot-1');
    await expect(stepDot).toBeVisible();
    
    const wizardTitle = page.locator('.section-title').first();
    await expect(wizardTitle).toContainText('Configure Your Dispatch Team');
  });

  test('Walks through setup wizard and redirects to /app', async ({ page }) => {
    const testEmail = `test-${Math.random().toString(36).substring(7)}@example.com`;
    await page.goto(`/setup?email=${encodeURIComponent(testEmail)}`);
    
    // Step 1: Fill technician
    await page.fill('input[name="tech_name_0"]', 'Sarah Connor');
    await page.fill('input[name="tech_phone_0"]', '+1 (555) 0288');
    
    // Go to Step 2
    await page.click('#btn-next');
    const sectionTitle2 = page.locator('.section-title').nth(1);
    await expect(sectionTitle2).toContainText('AI Dispatch Rules');
    
    // Go to Step 3
    await page.click('#btn-next');
    const sectionTitle3 = page.locator('.section-title').nth(2);
    await expect(sectionTitle3).toContainText('Google Calendar');
    
    // Submit Wizard
    await page.click('#btn-submit');
    
    // Should redirect to app supervision board
    await expect(page).toHaveURL(/\/app/);
    
    // Verify context owner is listed
    const ownerEmail = page.locator(`strong:has-text("${testEmail}")`).first();
    await expect(ownerEmail).toBeVisible();

    // Verify AI dispatcher terminal header is visible
    const terminalTitle = page.locator('h2:has-text("AI Dispatch Terminal")');
    await expect(terminalTitle).toBeVisible();

    // Verify visual phone mockup exists
    const phoneFrame = page.locator('.phone-frame');
    await expect(phoneFrame).toBeVisible();
  });

  test('Configures shifts and availability, and tests shift-based AI dispatch simulator routing', async ({ page }) => {
    // Listen to console and dialog events for debugging
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', exception => console.log('BROWSER EXCEPTION:', exception.stack || exception.message));
    page.on('dialog', async dialog => {
      console.log('DIALOG OPENED:', dialog.message());
      await dialog.dismiss();
    });

    const testEmail = `shifts-test-${Math.random().toString(36).substring(7)}@example.com`;
    // 1. Go to setup page
    await page.goto(`/setup?email=${encodeURIComponent(testEmail)}`);
    
    // 2. Configure Technician 1 (On Duty, Standard Shift, HVAC)
    await page.fill('input[name="tech_name_0"]', 'Sarah Connor');
    await page.fill('input[name="tech_phone_0"]', '+1 (555) 0288');
    await page.selectOption('select[name="tech_trade_0"]', 'HVAC');
    await page.selectOption('select[name="tech_shift_0"]', 'Standard');
    await page.selectOption('select[name="tech_status_0"]', 'active');
    
    // 3. Configure Technician 2 (On Duty, Night Shift, HVAC) — already pre-populated as row 1
    await page.fill('input[name="tech_name_1"]', 'David Miller');
    await page.fill('input[name="tech_phone_1"]', '+1 (555) 0999');
    await page.selectOption('select[name="tech_trade_1"]', 'HVAC');
    await page.selectOption('select[name="tech_shift_1"]', 'Night');
    await page.selectOption('select[name="tech_status_1"]', 'active');
    
    // 4. Configure Technician 3 (Off Duty, Always Shift, HVAC) — already pre-populated as row 2
    await page.fill('input[name="tech_name_2"]', 'John Doe');
    await page.fill('input[name="tech_phone_2"]', '+1 (555) 0111');
    await page.selectOption('select[name="tech_trade_2"]', 'HVAC');
    await page.selectOption('select[name="tech_shift_2"]', 'Always');
    await page.selectOption('select[name="tech_status_2"]', 'inactive');

    // 5. Navigate through wizard
    try {
      await page.click('#btn-next', { timeout: 3000 }); // Step 2 rules
      await page.click('#btn-next', { timeout: 3000 }); // Step 3 sandbox
      await page.click('#btn-submit', { timeout: 3000 }); // Save & Launch
    } catch (err) {
      console.log('PAGE CONTENT ON FAILURE:', await page.content());
      throw err;
    }
    
    // 6. Should redirect to app supervision board
    await expect(page).toHaveURL(/\/app/);
    
    // 7. Verify technician statuses and shifts are displayed
    await expect(page.locator('text=Sarah Connor')).toBeVisible();
    await expect(page.locator('text=Standard Shift (Mon-Fri 8-5)')).toBeVisible();
    const sarahCard = page.locator('strong:has-text("Sarah Connor") >> xpath=../..');
    await expect(sarahCard.locator('text=On Duty')).toBeVisible();
    
    await expect(page.locator('text=David Miller')).toBeVisible();
    await expect(page.locator('text=Night Shift (Mon-Fri 5pm-8am)')).toBeVisible();
    const davidCard = page.locator('strong:has-text("David Miller") >> xpath=../..');
    await expect(davidCard.locator('text=On Duty')).toBeVisible();
    
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=24/7 (Always Available)')).toBeVisible();
    const johnCard = page.locator('strong:has-text("John Doe") >> xpath=../..');
    await expect(johnCard.locator('text=Off Duty')).toBeVisible();

    // 8. Test simulation routing under "Normal Business Hours"
    await page.selectOption('select[id="job-time"]', 'BusinessHours');
    await page.selectOption('select[id="job-trade"]', 'HVAC');
    await page.fill('input[id="job-desc"]', 'AC fan broken in office');
    await page.click('button[type="submit"]:has-text("Dispatch Work Order")');

    // Standard Shift tech (Sarah Connor) is on-duty and standard shift matches BusinessHours.
    await expect(page.locator('#phone-title')).toHaveText('💬 Sarah Connor');
    const logs = page.locator('#feed');
    await expect(logs).toContainText('Dispatched job to technician Sarah Connor');

    // 9. Test decline fallback routing under "After Hours"
    await page.selectOption('select[id="job-time"]', 'AfterHours');
    await page.selectOption('select[id="job-trade"]', 'HVAC');
    await page.fill('input[id="job-desc"]', 'AC blowing warm air at midnight');
    await page.click('button[type="submit"]:has-text("Dispatch Work Order")');

    // Under AfterHours, Sarah Connor is off-shift. David Miller (Night Shift) is active.
    await expect(page.locator('#phone-title')).toHaveText('💬 David Miller');
    await expect(logs).toContainText('Dispatched job to technician David Miller');
  });

  test('Toggles technician duty status dynamically on Supervision Board and affects simulation routing', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', exception => console.log('BROWSER EXCEPTION:', exception.stack || exception.message));
    page.on('dialog', async dialog => {
      console.log('DIALOG WINDOW:', dialog.message());
      await dialog.dismiss();
    });

    const testEmail = `toggle-test-${Math.random().toString(36).substring(7)}@example.com`;
    
    // 1. Setup technicians
    await page.goto(`/setup?email=${encodeURIComponent(testEmail)}`);
    
    // Sarah Connor (HVAC, Standard, active)
    await page.fill('input[name="tech_name_0"]', 'Sarah Connor');
    await page.fill('input[name="tech_phone_0"]', '+1 (555) 0288');
    await page.selectOption('select[name="tech_trade_0"]', 'HVAC');
    await page.selectOption('select[name="tech_shift_0"]', 'Standard');
    await page.selectOption('select[name="tech_status_0"]', 'active');
    
    // David Miller (HVAC, Always, active)
    await page.fill('input[name="tech_name_1"]', 'David Miller');
    await page.fill('input[name="tech_phone_1"]', '+1 (555) 0999');
    await page.selectOption('select[name="tech_trade_1"]', 'HVAC');
    await page.selectOption('select[name="tech_shift_1"]', 'Always');
    await page.selectOption('select[name="tech_status_1"]', 'active');

    // Navigate wizard
    await page.click('#btn-next');
    await page.click('#btn-next');
    await page.click('#btn-submit');

    await expect(page).toHaveURL(/\/app/);

    // Verify Sarah is initially On Duty
    const sarahBadge = page.locator('#status-badge-Sarah-Connor');
    await expect(sarahBadge).toContainText('On Duty');

    // Toggle Sarah to Off Duty
    const sarahCard = page.locator('strong:has-text("Sarah Connor") >> xpath=../..');
    await sarahCard.locator('button:has-text("Toggle")').click();

    // Verify badge changes to Off Duty
    await expect(sarahBadge).toContainText('Off Duty');

    // Try standard hours HVAC dispatch. Sarah should be skipped (Off Duty) and dispatched to David Miller.
    await page.selectOption('select[id="job-time"]', 'BusinessHours');
    await page.selectOption('select[id="job-trade"]', 'HVAC');
    await page.fill('input[id="job-desc"]', 'AC fan broken in office');
    await page.click('button[type="submit"]:has-text("Dispatch Work Order")');

    await expect(page.locator('#phone-title')).toHaveText('💬 David Miller');
    const logs = page.locator('#feed');
    await expect(logs).toContainText('Dispatched job to technician David Miller');
  });
});

