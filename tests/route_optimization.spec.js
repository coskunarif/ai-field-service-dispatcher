import { test, expect } from '@playwright/test';
import postgres from 'postgres';

test.describe('Route Optimization & ETA Simulator', () => {
  test('GET /route-optimizer.js returns the file with javascript Content-Type', async ({
    request,
  }) => {
    const response = await request.get('/route-optimizer.js');
    expect(response.status()).toBe(200);
    const contentType = response.headers()['content-type'];
    expect(contentType).toMatch(/javascript/);
  });

  test('Unit calculations for RouteOptimizer in browser context', async ({ page }) => {
    // Go to /app where the script should be loaded
    await page.goto('/app');

    // Check RouteOptimizer exists
    const exists = await page.evaluate(() => typeof window.RouteOptimizer !== 'undefined');
    expect(exists).toBe(true);

    // Test haversineDistance calculations
    const distSame = await page.evaluate(() =>
      window.RouteOptimizer.haversineDistance(41.8781, -87.6298, 41.8781, -87.6298)
    );
    expect(distSame).toBe(0);

    const distDiff = await page.evaluate(() =>
      window.RouteOptimizer.haversineDistance(41.8781, -87.6298, 41.89, -87.63)
    );
    expect(distDiff).toBe(0.82);

    // Test calculateETA formulas
    // Normal traffic multiplier: 1.0
    const etaNormal = await page.evaluate(() => window.RouteOptimizer.calculateETA(0.82, 1.0));
    expect(etaNormal).toBe(2);

    // Rush Hour traffic multiplier: 1.8
    const etaRush = await page.evaluate(() => window.RouteOptimizer.calculateETA(0.82, 1.8));
    expect(etaRush).toBe(3);

    // Accident traffic multiplier: 3.0
    const etaAccident = await page.evaluate(() => window.RouteOptimizer.calculateETA(5, 3.0));
    expect(etaAccident).toBe(30);

    // Test animateMarker sets window.activeRouteAnimationId
    const animIdSet = await page.evaluate(() => {
      const dummyMarker = { setLatLng: () => {} };
      const dummyPolyline = { getLatLngs: () => [] };
      window.RouteOptimizer.animateMarker(
        dummyMarker,
        dummyPolyline,
        [41.8781, -87.6298],
        [41.89, -87.63],
        100
      );
      return window.activeRouteAnimationId !== undefined;
    });
    expect(animIdSet).toBe(true);
  });

  test('E2E flow: Selecting traffic multiplier (Rush Hour), submitting dispatch request, verifying that the SMS text shows the ETA, verifying the database logs', async ({
    page,
  }) => {
    const email = `route-e2e-test-${Math.random().toString(36).substring(7)}@example.com`;

    // 1. Go to setup and configure Sarah Connor
    await page.goto(`/setup?email=${encodeURIComponent(email)}`);
    await page.fill('input[name="tech_name_0"]', 'Sarah Connor');
    await page.fill('input[name="tech_phone_0"]', '+15550288');
    await page.selectOption('select[name="tech_trade_0"]', 'HVAC');
    await page.fill('input[name="tech_lat_0"]', '41.8781');
    await page.fill('input[name="tech_lng_0"]', '-87.6298');

    // Configure Card 1 -> John Doe to avoid duplicate technician error
    await page.fill('input[name="tech_name_1"]', 'John Doe');

    await page.click('#btn-next');
    await page.click('#btn-next');
    await page.click('#btn-submit');

    await expect(page).toHaveURL(/\/app/);

    // 2. Select Traffic Multiplier: Rush Hour (1.8x)
    await expect(page.locator('#traffic-multiplier')).toBeVisible();
    await page.selectOption('#traffic-multiplier', '1.8');

    // 3. Submit dispatch request
    await page.fill('input[id="job-desc"]', 'AC leaking water');
    await page.selectOption('select[id="job-trade"]', 'HVAC');
    await page.click('button[type="submit"]:has-text("Dispatch Work Order")');

    // 4. Verify SMS text contains the ETA
    await expect(page.locator('#phone-title')).toHaveText('💬 Sarah Connor');

    const phoneChat = page.locator('#phone-chat');
    await expect(phoneChat).toContainText(/ETA/i);
    await expect(phoneChat).toContainText(/Rush Hour/i);

    // 5. Click YES to accept job and trigger database save
    await page.click('.quick-reply-btn:has-text("Accept Job (YES)")');

    // 6. Verify database logs contain distance_miles, duration_mins, and traffic_multiplier
    if (process.env.DATABASE_URL) {
      const sql = postgres(process.env.DATABASE_URL);
      try {
        await page.waitForTimeout(1000);
        const results = await sql`
          SELECT * FROM gainhelm_dispatch_logs 
          WHERE email = ${email} AND status = 'accepted'
          ORDER BY created_at DESC 
          LIMIT 1
        `;
        expect(results.length).toBe(1);
        const log = results[0];

        expect(log.distance_miles).not.toBeNull();
        expect(Number(log.distance_miles)).toBeGreaterThan(0);

        expect(log.duration_mins).not.toBeNull();
        expect(Number(log.duration_mins)).toBeGreaterThan(0);

        expect(log.traffic_multiplier).not.toBeNull();
        expect(Number(log.traffic_multiplier)).toBe(1.8);
      } finally {
        await sql.end();
      }
    }
  });

  test('E2E flow: Manual dispatch also does the calculations and records it in the DB', async ({
    page,
  }) => {
    const email = `route-manual-test-${Math.random().toString(36).substring(7)}@example.com`;

    // 1. Go to setup and configure David Miller
    await page.goto(`/setup?email=${encodeURIComponent(email)}`);
    await page.fill('input[name="tech_name_0"]', 'David Miller');
    await page.fill('input[name="tech_phone_0"]', '+15550999');
    await page.selectOption('select[name="tech_trade_0"]', 'Plumbing');
    await page.fill('input[name="tech_lat_0"]', '41.8900');
    await page.fill('input[name="tech_lng_0"]', '-87.6300');

    // Configure Card 1 -> John Doe to avoid duplicates
    await page.fill('input[name="tech_name_1"]', 'John Doe');

    await page.click('#btn-next');
    await page.click('#btn-next');
    await page.click('#btn-submit');

    await expect(page).toHaveURL(/\/app/);

    // 2. Select Traffic Multiplier: Accident (3.0x)
    await expect(page.locator('#traffic-multiplier')).toBeVisible();
    await page.selectOption('#traffic-multiplier', '3.0');

    // 3. Submit dispatch request
    await page.fill('input[id="job-desc"]', 'Clogged toilet in lobby');
    await page.selectOption('select[id="job-trade"]', 'Plumbing');
    await page.click('button[type="submit"]:has-text("Dispatch Work Order")');

    // 4. Force assign David Miller (manual dispatch override)
    const daveCard = page.locator('strong:has-text("David Miller") >> xpath=../..');
    const assignBtnDave = daveCard.locator('button', { hasText: /^Assign$/ });
    await assignBtnDave.click();

    // 5. Verify database logs contain distance_miles, duration_mins, and traffic_multiplier
    if (process.env.DATABASE_URL) {
      const sql = postgres(process.env.DATABASE_URL);
      try {
        await page.waitForTimeout(1000);
        const results = await sql`
          SELECT * FROM gainhelm_dispatch_logs 
          WHERE email = ${email} AND status = 'manually_assigned'
          ORDER BY created_at DESC 
          LIMIT 1
        `;
        expect(results.length).toBe(1);
        const log = results[0];

        expect(log.distance_miles).not.toBeNull();
        expect(Number(log.distance_miles)).toBeGreaterThan(0);

        expect(log.duration_mins).not.toBeNull();
        expect(Number(log.duration_mins)).toBeGreaterThan(0);

        expect(log.traffic_multiplier).not.toBeNull();
        expect(Number(log.traffic_multiplier)).toBe(3.0);
      } finally {
        await sql.end();
      }
    }
  });
});
