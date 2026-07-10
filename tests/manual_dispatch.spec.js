import { test, expect } from '@playwright/test';
import postgres from 'postgres';

test.describe('Supervision - Manual Dispatch Override', () => {
  test('Assign button is visible for On Duty technicians and status updates correctly', async ({
    page,
  }) => {
    const email = `manual-tech-test-${Math.random().toString(36).substring(7)}@example.com`;

    // Create setup
    await page.goto(`/setup?email=${encodeURIComponent(email)}`);

    // Configure Card 0 -> Sarah Connor
    await page.fill('input[name="tech_name_0"]', 'Sarah Connor');
    await page.fill('input[name="tech_phone_0"]', '+15550288');
    await page.selectOption('select[name="tech_trade_0"]', 'Plumbing');
    await page.fill('input[name="tech_lat_0"]', '41.8781');
    await page.fill('input[name="tech_lng_0"]', '-87.6298');

    // Configure Card 1 -> David Miller
    await page.fill('input[name="tech_name_1"]', 'David Miller');
    await page.fill('input[name="tech_phone_1"]', '+15550999');
    await page.selectOption('select[name="tech_trade_1"]', 'Plumbing');
    await page.fill('input[name="tech_lat_1"]', '41.8900');
    await page.fill('input[name="tech_lng_1"]', '-87.6300');

    // Configure Card 2 -> John Doe (overwriting default David Miller to avoid duplicates)
    await page.fill('input[name="tech_name_2"]', 'John Doe');
    await page.fill('input[name="tech_phone_2"]', '+15550199');
    await page.selectOption('select[name="tech_trade_2"]', 'Electrical');

    await page.click('#btn-next');
    await page.click('#btn-next');
    await page.click('#btn-submit');

    await expect(page).toHaveURL(/\/app/);

    // Both are On Duty by default -> Assign buttons should be visible
    const sarahCard = page.locator('strong:has-text("Sarah Connor") >> xpath=../..');
    const assignBtnSarah = sarahCard.locator('button', { hasText: /^Assign$/ });
    await expect(assignBtnSarah).toBeVisible();

    const daveCard = page.locator('strong:has-text("David Miller") >> xpath=../..');
    const assignBtnDave = daveCard.locator('button', { hasText: /^Assign$/ });
    await expect(assignBtnDave).toBeVisible();

    // Toggle David Miller to Off Duty -> Assign button should disappear or be hidden
    const toggleBtnDave = daveCard.locator('button:has-text("Toggle")');
    await toggleBtnDave.click();

    // Wait for Off Duty badge
    await expect(page.locator('#status-badge-David-Miller')).toContainText('Off Duty');
    await expect(assignBtnDave).not.toBeVisible();
  });

  test('Clicking Assign alerts the user if no active dispatch request is running', async ({
    page,
  }) => {
    const email = `manual-alert-test-${Math.random().toString(36).substring(7)}@example.com`;

    // Create setup
    await page.goto(`/setup?email=${encodeURIComponent(email)}`);

    // Configure Card 0 -> Sarah Connor
    await page.fill('input[name="tech_name_0"]', 'Sarah Connor');
    await page.fill('input[name="tech_phone_0"]', '+15550288');
    await page.selectOption('select[name="tech_trade_0"]', 'Plumbing');
    await page.fill('input[name="tech_lat_0"]', '41.8781');
    await page.fill('input[name="tech_lng_0"]', '-87.6298');

    // Overwrite default Sarah Connor on Card 1 to John Doe to avoid duplicates
    await page.fill('input[name="tech_name_1"]', 'John Doe');

    await page.click('#btn-next');
    await page.click('#btn-next');
    await page.click('#btn-submit');

    await expect(page).toHaveURL(/\/app/);

    // Dialog listener to check for alert
    let dialogMessage = '';
    page.on('dialog', async dialog => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });

    const sarahCard = page.locator('strong:has-text("Sarah Connor") >> xpath=../..');
    const assignBtnSarah = sarahCard.locator('button', { hasText: /^Assign$/ });
    await assignBtnSarah.click();

    expect(dialogMessage).toContain('Please initiate a dispatch request first');
  });

  test('Active dispatch simulation can be manually overridden and logs correctly', async ({
    page,
  }) => {
    const email = `manual-override-test-${Math.random().toString(36).substring(7)}@example.com`;

    // Create setup
    await page.goto(`/setup?email=${encodeURIComponent(email)}`);

    // Configure Card 0 -> Sarah Connor
    await page.fill('input[name="tech_name_0"]', 'Sarah Connor');
    await page.fill('input[name="tech_phone_0"]', '+15550288');
    await page.selectOption('select[name="tech_trade_0"]', 'HVAC');
    await page.fill('input[name="tech_lat_0"]', '41.8781');
    await page.fill('input[name="tech_lng_0"]', '-87.6298');

    // Configure Card 1 -> David Miller
    await page.fill('input[name="tech_name_1"]', 'David Miller');
    await page.fill('input[name="tech_phone_1"]', '+15550999');
    await page.selectOption('select[name="tech_trade_1"]', 'HVAC');
    await page.fill('input[name="tech_lat_1"]', '41.8900');
    await page.fill('input[name="tech_lng_1"]', '-87.6300');

    // Configure Card 2 -> John Doe (avoiding duplicates)
    await page.fill('input[name="tech_name_2"]', 'John Doe');

    await page.click('#btn-next');
    await page.click('#btn-next');
    await page.click('#btn-submit');

    await expect(page).toHaveURL(/\/app/);

    // Start a HVAC simulation
    await page.fill('input[id="job-desc"]', 'Server room AC is down');
    await page.selectOption('select[id="job-trade"]', 'HVAC');
    await page.click('button[type="submit"]:has-text("Dispatch Work Order")');

    // Wait for Sarah to receive SMS
    await expect(page.locator('#phone-title')).toHaveText('💬 Sarah Connor');

    // Instead of replying YES/NO, force assign David Miller
    const daveCard = page.locator('strong:has-text("David Miller") >> xpath=../..');
    const assignBtnDave = daveCard.locator('button', { hasText: /^Assign$/ });
    await assignBtnDave.click();

    // Verify phone shifts to David Miller
    await expect(page.locator('#phone-title')).toHaveText('💬 David Miller');

    // Verify phone displays the calendar event notification banner
    const alertBanner = page.locator('#calendar-alert');
    await expect(alertBanner).toHaveClass(/show/);
    await expect(page.locator('#calendar-event-text')).toContainText(/David Miller scheduled/);

    // Verify routing polyline is drawn as solid green line (no dasharray and stroke is green)
    const polyline = page.locator('.leaflet-overlay-pane svg path');
    await expect(polyline).toBeVisible();
    await expect(polyline).not.toHaveAttribute('stroke-dasharray');
    await expect(polyline).toHaveAttribute('stroke', /#10b981|green/i);

    // Verify database context persistence if DATABASE_URL is available
    if (process.env.DATABASE_URL) {
      const sql = postgres(process.env.DATABASE_URL);
      try {
        // Wait a small moment for db insert to complete
        await page.waitForTimeout(500);
        const results = await sql`
          SELECT * FROM gainhelm_dispatch_logs 
          WHERE email = ${email} AND status = 'manually_assigned'
          ORDER BY created_at DESC 
          LIMIT 1
        `;
        expect(results.length).toBe(1);
        expect(results[0].dispatched_to_name).toBe('David Miller');
        expect(results[0].job_description).toBe('Server room AC is down');
      } finally {
        await sql.end();
      }
    }
  });
});
