import { test, expect } from '@playwright/test';
import postgres from 'postgres';

test.describe('Supervision Map Routing - Technician Setup Wizard', () => {

  test('Latitude and Longitude input fields exist for each technician card', async ({ page }) => {
    const email = 'map-test@example.com';
    await page.goto(`/setup?email=${encodeURIComponent(email)}`);

    // Verify coordinates inputs exist for pre-populated cards
    await expect(page.locator('input[name="tech_lat_0"]')).toBeVisible();
    await expect(page.locator('input[name="tech_lng_0"]')).toBeVisible();

    // Verify dynamic row creation adds coordinates inputs
    await page.click('button:has-text("Add Team Member")');
    const cards = page.locator('#tech-list .tech-card');
    const cardCount = await cards.count();
    const newIndex = cardCount - 1;

    await expect(page.locator(`input[name="tech_lat_${newIndex}"]`)).toBeVisible();
    await expect(page.locator(`input[name="tech_lng_${newIndex}"]`)).toBeVisible();
  });

  test('Coordinates inputted in setup wizard are saved to LocalStorage draft', async ({ page }) => {
    const email = 'map-draft-test@example.com';
    await page.goto(`/setup?email=${encodeURIComponent(email)}`);

    await page.fill('input[name="tech_name_0"]', 'Sarah Connor');
    await page.fill('input[name="tech_phone_0"]', '+15550288');
    await page.fill('input[name="tech_lat_0"]', '41.8781');
    await page.fill('input[name="tech_lng_0"]', '-87.6298');

    // Trigger auto-save draft by changing a value or navigating
    const draft = await page.evaluate((key) => localStorage.getItem(key), `gainhelm_wizard_draft_${email}`);
    expect(draft).not.toBeNull();
    const draftData = JSON.parse(draft);
    expect(draftData.technicians[0]).toEqual(expect.objectContaining({
      name: 'Sarah Connor',
      lat: 41.8781,
      lng: -87.6298
    }));
  });

  test('Coordinates are restored from LocalStorage draft on page load', async ({ page }) => {
    const email = 'map-restore-test@example.com';
    const draftState = {
      currentStep: 1,
      technicians: [
        { name: 'Sarah Connor', phone: '+15550288', trade: 'HVAC', shift: 'Standard', status: 'active', lat: 41.8781, lng: -87.6298 }
      ],
      businessRules: { timeout: '3', pricing: '120', rules: '' },
      calendarConfig: { calendar_url: '', sandbox_mode: 'true' }
    };

    // Load setup first to set context
    await page.goto('/setup');
    await page.evaluate(({ key, val }) => {
      localStorage.setItem(key, JSON.stringify(val));
    }, { key: `gainhelm_wizard_draft_${email}`, val: draftState });

    // Navigate to setup with query param to restore
    await page.goto(`/setup?email=${encodeURIComponent(email)}`);

    // Verify coordinates are restored
    await expect(page.locator('input[name="tech_lat_0"]')).toHaveValue('41.8781');
    await expect(page.locator('input[name="tech_lng_0"]')).toHaveValue('-87.6298');
  });

  test('Coordinates inputted are persisted in Database Context on form submission', async ({ page }) => {
    const email = `map-db-test-${Math.random().toString(36).substring(7)}@example.com`;
    await page.goto(`/setup?email=${encodeURIComponent(email)}`);

    await page.fill('input[name="tech_name_0"]', 'Sarah Connor');
    await page.fill('input[name="tech_phone_0"]', '+15550288');
    await page.fill('input[name="tech_lat_0"]', '41.8781');
    await page.fill('input[name="tech_lng_0"]', '-87.6298');

    // Submit wizard
    await page.click('#btn-next'); // Step 2 rules
    await page.click('#btn-next'); // Step 3 sandbox
    await page.click('#btn-submit'); // Submit

    await expect(page).toHaveURL(/\/app/);

    // Verify database context persistence if DATABASE_URL is available
    if (process.env.DATABASE_URL) {
      const sql = postgres(process.env.DATABASE_URL);
      try {
        const results = await sql`SELECT * FROM gainhelm_contexts WHERE email = ${email}`;
        expect(results.length).toBe(1);
        const technicians = JSON.parse(results[0].technicians);
        expect(technicians[0].lat).toBe(41.8781);
        expect(technicians[0].lng).toBe(-87.6298);
      } finally {
        await sql.end();
      }
    } else {
      // If DATABASE_URL is not set, verify contextOwner is listed (mock app state)
      await expect(page.locator(`strong:has-text("${email}")`).first()).toBeVisible();
    }
  });

});

test.describe('Supervision Map Routing - Supervision Board Map rendering', () => {

  test('Map panel and container are rendered on Supervision Board', async ({ page }) => {
    const email = `map-board-test-${Math.random().toString(36).substring(7)}@example.com`;
    // Create a setup first
    await page.goto(`/setup?email=${encodeURIComponent(email)}`);
    await page.fill('input[name="tech_name_0"]', 'Sarah Connor');
    await page.fill('input[name="tech_phone_0"]', '+15550288');
    await page.fill('input[name="tech_lat_0"]', '41.8781');
    await page.fill('input[name="tech_lng_0"]', '-87.6298');
    await page.click('#btn-next');
    await page.click('#btn-next');
    await page.click('#btn-submit');

    await expect(page).toHaveURL(/\/app/);

    // Verify map panel and container render
    const mapPanel = page.locator('#map-panel');
    await expect(mapPanel).toBeVisible();
    await expect(mapPanel).toHaveCSS('height', /280px|250px|300px/);

    const mapContainer = page.locator('#map');
    await expect(mapContainer).toBeVisible();
  });

  test('Renders fallback warning message when Leaflet JS fails to load', async ({ page }) => {
    // Intercept/block Leaflet JS CDN request
    await page.route('**/unpkg.com/leaflet@1.9.4/dist/leaflet.js', async (route) => {
      await route.abort();
    });

    const email = `map-offline-test-${Math.random().toString(36).substring(7)}@example.com`;
    await page.goto(`/setup?email=${encodeURIComponent(email)}`);
    await page.fill('input[name="tech_name_0"]', 'Sarah Connor');
    await page.fill('input[name="tech_phone_0"]', '+15550288');
    await page.fill('input[name="tech_lat_0"]', '41.8781');
    await page.fill('input[name="tech_lng_0"]', '-87.6298');
    await page.click('#btn-next');
    await page.click('#btn-next');
    await page.click('#btn-submit');

    await expect(page).toHaveURL(/\/app/);

    // Verify that fallback warning is displayed inside the map container
    const fallbackText = page.locator('#map:has-text("🗺️ Map visualization offline")');
    await expect(fallbackText).toBeVisible();
  });

  test('Dispatch simulation plots Job pin and draws polylines representing dispatch flow', async ({ page }) => {
    const email = `map-dispatch-test-${Math.random().toString(36).substring(7)}@example.com`;
    await page.goto(`/setup?email=${encodeURIComponent(email)}`);
    await page.fill('input[name="tech_name_0"]', 'Sarah Connor');
    await page.fill('input[name="tech_phone_0"]', '+15550288');
    await page.selectOption('select[name="tech_trade_0"]', 'HVAC');
    await page.fill('input[name="tech_lat_0"]', '41.8781');
    await page.fill('input[name="tech_lng_0"]', '-87.6298');

    // Add a fallback technician Dave
    await page.click('button:has-text("Add Team Member")');
    const lastCard = page.locator('#tech-list .tech-card').last();
    await lastCard.locator('input[name^="tech_name_"]').fill('David Miller');
    await lastCard.locator('input[name^="tech_phone_"]').fill('+15550999');
    await lastCard.locator('select[name^="tech_trade_"]').selectOption('HVAC');
    await lastCard.locator('input[name^="tech_lat_"]').fill('41.8900');
    await lastCard.locator('input[name^="tech_lng_"]').fill('-87.6300');

    await page.click('#btn-next');
    await page.click('#btn-next');
    await page.click('#btn-submit');

    await expect(page).toHaveURL(/\/app/);

    // Dispatch a work order
    await page.selectOption('select[id="job-time"]', 'BusinessHours');
    await page.selectOption('select[id="job-trade"]', 'HVAC');
    await page.fill('input[id="job-desc"]', 'AC broken in office');
    await page.click('button[type="submit"]:has-text("Dispatch Work Order")');

    // 1. Verify Job pin is plotted on the map
    const markers = page.locator('.leaflet-marker-icon');
    await expect(markers).toHaveCount(3);

    // 2. Verify a polyline is drawn connecting dispatched technician and the job pin during evaluation (dashed style)
    const polyline = page.locator('.leaflet-overlay-pane svg path');
    await expect(polyline).toBeVisible();
    await expect(polyline).toHaveAttribute('stroke-dasharray', /.+/);

    // 3. Confirm dispatch (YES reply) -> routing polyline turns solid green
    await page.click('.quick-reply-btn:has-text("Accept Job (YES)")');
    
    // Polyline should now be solid green (no dasharray and solid color)
    await expect(polyline).not.toHaveAttribute('stroke-dasharray');
    await expect(polyline).toHaveAttribute('stroke', /#10b981|green|#00ff00/i);

    // Test decline/fallback routing
    await page.reload();
    await page.selectOption('select[id="job-time"]', 'BusinessHours');
    await page.selectOption('select[id="job-trade"]', 'HVAC');
    await page.fill('input[id="job-desc"]', 'AC broken again');
    await page.click('button[type="submit"]:has-text("Dispatch Work Order")');

    // Reject job (Decline)
    await expect(page.locator('#phone-title')).toHaveText('💬 Sarah Connor');
    await page.click('.quick-reply-btn:has-text("Decline Job (BUSY)")');

    // Verify fallback polyline is drawn to Dave
    await expect(page.locator('#phone-title')).toHaveText('💬 David Miller');
    const updatedPolyline = page.locator('.leaflet-overlay-pane svg path');
    await expect(updatedPolyline).toBeVisible();
    await expect(updatedPolyline).toHaveAttribute('stroke-dasharray', /.+/);
  });

});
