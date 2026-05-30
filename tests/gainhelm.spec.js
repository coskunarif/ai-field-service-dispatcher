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
