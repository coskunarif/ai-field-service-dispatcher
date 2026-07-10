import { test, expect } from '@playwright/test';
import postgres from 'postgres';

test.describe('Customer Live Tracking', () => {
  test('GET /app/track/:id with an invalid UUID returns 404', async ({ request }) => {
    const invalidUuid = '00000000-0000-0000-0000-000000000000';
    const response = await request.get(`/app/track/${invalidUuid}`);
    expect(response.status()).toBe(404);
    const text = await response.text();
    expect(text).toContain('Tracking Link Not Found or Expired');
  });

  test('E2E customer live tracking flow', async ({ page, context }) => {
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.stack || err.message));
    const email = `track-e2e-${Math.random().toString(36).substring(7)}@example.com`;

    // 1. Setup trade technician in /setup
    await page.goto(`/setup?email=${encodeURIComponent(email)}`);

    // Configure Card 0 -> Sarah Connor
    await page.fill('input[name="tech_name_0"]', 'Sarah Connor');
    await page.fill('input[name="tech_phone_0"]', '+15550288');
    await page.selectOption('select[name="tech_trade_0"]', 'HVAC');
    await page.fill('input[name="tech_lat_0"]', '41.8781');
    await page.fill('input[name="tech_lng_0"]', '-87.6298');

    // Configure Card 1 & 2 to avoid duplicates or error validations
    await page.fill('input[name="tech_name_1"]', 'David Miller');
    await page.fill('input[name="tech_name_2"]', 'John Doe');

    await page.click('#btn-next');
    await page.click('#btn-next');
    await page.click('#btn-submit');

    await expect(page).toHaveURL(/\/app/);

    // 2. Dispatch a job
    await page.fill('input[id="job-desc"]', 'AC not cooling');
    await page.selectOption('select[id="job-trade"]', 'HVAC');
    await page.click('button[type="submit"]:has-text("Dispatch Work Order")');

    // Wait for phone simulator to display Sarah Connor
    await expect(page.locator('#phone-title')).toContainText('Sarah Connor');

    // Click Accept Job (YES) to transition status to 'accepted' and append to audit trail
    await page.click('.quick-reply-btn:has-text("Accept Job (YES)")');

    // 3. Wait for the "Track Live Route" button/link to appear on the new audit trail card
    const trackLink = page.locator(
      'a:has-text("Track Live Route"), button:has-text("Track Live Route"), a[href*="/app/track/"]'
    );
    await expect(trackLink).toBeVisible({ timeout: 15000 });

    // 4. Capture the URL from the link
    const href = await trackLink.getAttribute('href');
    expect(href).toBeTruthy();
    const trackingUrl = new URL(href, page.url()).toString();

    // 5. Navigate to /app/track/:id in a new tab so dispatcher board stays open
    const customerPage = await context.newPage();
    await customerPage.goto(trackingUrl);

    // Verify Leaflet map, technician name, and dynamic ETA are shown on the tracking page
    const mapContainer = customerPage.locator('#map, .leaflet-container');
    await expect(mapContainer).toBeVisible();
    await expect(customerPage.locator('body')).toContainText('Sarah Connor');
    await expect(customerPage.locator('body')).toContainText(/ETA/i);

    // 6. Submit a note (e.g. "Gate code: 5432") from the customer tracking page
    const noteInput = customerPage.locator(
      'textarea, input[placeholder*="note" i], input[name="note"]'
    );
    const sendButton = customerPage.locator('button:has-text("Send Note"), button[type="submit"]');
    await noteInput.fill('Gate code: 5432');
    await sendButton.click();

    // 7. Verify that the dispatcher feed on the /app page receives: "📱 Customer sent entry note: Gate code: 5432"
    await expect(page.locator('#feed')).toContainText(
      '📱 Customer sent entry note: Gate code: 5432',
      { timeout: 15000 }
    );

    // 8. Verify that the technician phone simulator displays the note: "Customer Note: Gate code: 5432"
    await expect(page.locator('#phone-chat')).toContainText('Customer Note: Gate code: 5432', {
      timeout: 15000,
    });

    // 9. Verify database logs contain the note inside the log's step_logs
    if (process.env.DATABASE_URL) {
      const sql = postgres(process.env.DATABASE_URL);
      try {
        const uuidMatch = trackingUrl.match(/\/app\/track\/([a-f0-9-]{36})/i);
        expect(uuidMatch).toBeTruthy();
        const uuid = uuidMatch[1];

        await page.waitForTimeout(1000); // Give database write a brief moment to complete
        const results = await sql`
          SELECT step_logs FROM gainhelm_dispatch_logs
          WHERE id = ${uuid}
        `;
        expect(results.length).toBe(1);
        const stepLogs = results[0].step_logs;
        const stepLogsStr = typeof stepLogs === 'string' ? stepLogs : JSON.stringify(stepLogs);
        expect(stepLogsStr).toContain('Customer sent entry note: Gate code: 5432');
      } finally {
        await sql.end();
      }
    }
  });
});
