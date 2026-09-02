import { test, expect } from '@playwright/test';

test.describe('Emergency Contractor Cost Estimator & Instant Dispatch Tool', () => {
  test.beforeEach(async ({ page }) => {
    if (process.env.BASE_URL && !process.env.BASE_URL.includes('localhost')) {
      await page.waitForTimeout(500);
    }
  });

  test('loads tool page and conforms to SEO, accessibility, and schema standards', async ({
    page,
  }) => {
    await page.goto('/tools/emergency-cost-estimator');

    // 1. Single H1 check
    const h1s = page.locator('h1');
    await expect(h1s).toHaveCount(1);
    await expect(h1s).toHaveText('Emergency Contractor Cost Estimator & Instant Dispatch');

    // 2. Title and canonical
    await expect(page).toHaveTitle(/Emergency Contractor Cost Estimator/);
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute(
      'href',
      'https://gainhelm.com/tools/emergency-cost-estimator'
    );

    // 3. Structured Data
    const schemaScript = page.locator('script[type="application/ld+json"]');
    await expect(schemaScript).toBeVisible({ visible: false });
    const schemaContent = await schemaScript.textContent();
    expect(schemaContent).toContain('FAQPage');
    expect(schemaContent).toContain('Emergency Contractor Cost Estimator');

    // 4. Skip link
    const skipLink = page.locator('a.skip-link');
    await expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  test('interactively recalculates estimated repair cost upon trade, urgency, and zip changes', async ({
    page,
  }) => {
    await page.goto('/tools/emergency-cost-estimator');

    const estimatedRange = page.locator('#estimated-range-val');
    await expect(estimatedRange).toBeVisible();
    const initialText = await estimatedRange.textContent();
    expect(initialText).toContain('$');

    // Select Plumbing
    await page.locator('#trade-select').selectOption('plumbing');
    // Issue dropdown should dynamically populate plumbing issues
    const issueSelect = page.locator('#issue-select');
    await expect(issueSelect).toHaveValue('burst-pipe');

    // Change urgency to Scheduled (Next 48h) - Emergency surcharge should vanish
    await page.locator('label[for="urgency-scheduled"]').click();
    const emergencyRow = page.locator('#breakdown-emergency-row');
    await expect(emergencyRow).toBeHidden();

    // Change ZIP code to West Coast (90210)
    await page.locator('#zip-input').fill('90210');
    const regionIndicator = page.locator('#zip-region-indicator');
    await expect(regionIndicator).toContainText('West Coast Metro (1.30x)');

    const updatedText = await estimatedRange.textContent();
    expect(updatedText).not.toBe(initialText);
  });

  test('validates pay-per-call phone routing CTA', async ({ page }) => {
    await page.goto('/tools/emergency-cost-estimator');

    const callBtn = page.locator('#call-dispatch-btn');
    await expect(callBtn).toBeVisible();
    await expect(callBtn).toHaveAttribute('href', 'tel:+18885884246');
    await expect(callBtn).toContainText('(888) 588-GAIN');
  });

  test('dispatches on-duty technician via instant SMS dispatch and routes to live tracking', async ({
    page,
  }) => {
    await page.goto('/tools/emergency-cost-estimator');

    // Select trade & urgency
    await page.locator('#trade-select').selectOption('hvac');
    await page.locator('label[for="urgency-emergency"]').click();
    await page.locator('#zip-input').fill('75001');

    // Fill contact details
    await page.locator('#dispatch-phone').fill('555-432-1098');
    await page.locator('#dispatch-address').fill('742 Evergreen Terrace');
    await page.locator('#dispatch-notes').fill('Gate code #4412');

    // Submit dispatch
    await page.locator('#submit-dispatch-btn').click();

    // Verify result card appears
    const resultCard = page.locator('#dispatch-result-card');
    await expect(resultCard).toBeVisible();
    await expect(page.locator('#dispatch-status-title')).toHaveText('Technician Dispatched!');
    await expect(page.locator('#dispatch-tech-name')).toContainText('Marcus Cole');

    // Verify live tracking link
    const trackLink = page.locator('#dispatch-track-link');
    await expect(trackLink).toBeVisible();
    const trackHref = await trackLink.getAttribute('href');
    expect(trackHref).toMatch(/\/app\/track\/[0-9a-f-]+/i);

    // Follow tracking link and verify live tracking UI
    await page.goto(trackHref);
    await expect(page).toHaveURL(new RegExp(trackHref));
    await expect(page.locator('text=Technician En Route')).toBeVisible();
    await expect(page.locator('text=Driver Notes & Instructions')).toBeVisible();
  });
});
