import { test, expect } from '@playwright/test';

/**
 * [AC-1] Auto-Save Wizard Draft
 * When the user inputs, selects, or changes any field in the /setup?email=... form,
 * or adds/removes technician rows, or navigates between steps, the page must
 * automatically serialize the entire current wizard state and write it to browser
 * localStorage keyed under the user's email: gainhelm_wizard_draft_${email}.
 */
test.describe('Wizard Resume: Auto-Save Draft [AC-1]', () => {
  test('saves state to localStorage on field change and step navigation', async ({ page }) => {
    const email = 'ac1-test@example.com';
    await page.goto(`/setup?email=${encodeURIComponent(email)}`);

    // Modify tech 0 values
    await page.fill('input[name="tech_name_0"]', 'Test Tech 1');
    await page.fill('input[name="tech_phone_0"]', '+15551111');
    await page.selectOption('select[name="tech_trade_0"]', 'Electrical');

    // Wait a brief moment or check directly
    let draft = await page.evaluate(
      key => localStorage.getItem(key),
      `gainhelm_wizard_draft_${email}`
    );
    expect(draft).not.toBeNull();
    let draftData = JSON.parse(draft);
    expect(draftData.technicians).toContainEqual(
      expect.objectContaining({
        name: 'Test Tech 1',
        phone: '+15551111',
        trade: 'Electrical',
      })
    );

    // Click next step to go to Step 2
    await page.click('#btn-next');

    // Check that currentStep is saved as 2
    draft = await page.evaluate(key => localStorage.getItem(key), `gainhelm_wizard_draft_${email}`);
    draftData = JSON.parse(draft);
    expect(draftData.currentStep).toBe(2);
  });
});

/**
 * [AC-2] Restore Wizard Draft
 * On page load, if a serialized draft exists in localStorage for the current user's email,
 * the client script must parse and restore all inputs:
 * - Re-populate static fields: timeout, pricing, rules textarea, calendar_url, and sandbox_mode.
 * - Clear and dynamically re-create all dynamic technician cards inside #tech-list using the saved array of technicians.
 * - Set the active step to the saved currentStep and trigger updateWizardUI().
 */
test.describe('Wizard Resume: Restore Draft [AC-2]', () => {
  test('restores state from localStorage on page load', async ({ page }) => {
    const email = 'ac2-test@example.com';

    const draftState = {
      currentStep: 2,
      technicians: [
        {
          name: 'Alice Cooper',
          phone: '+1 (555) 9999',
          trade: 'Electrical',
          skills: 'Wiring',
          shift: 'Standard',
          status: 'active',
        },
      ],
      businessRules: {
        timeout: '10',
        pricing: '150',
        rules: 'Restore guidelines text',
      },
      calendarConfig: {
        calendar_url: 'https://calendar.google.com/test',
        sandbox_mode: 'false',
      },
    };

    // Load setup first to get into context and set localStorage
    await page.goto('/setup');
    await page.evaluate(
      ({ key, val }) => {
        localStorage.setItem(key, JSON.stringify(val));
      },
      { key: `gainhelm_wizard_draft_${email}`, val: draftState }
    );

    // Navigate to setup with query param
    await page.goto(`/setup?email=${encodeURIComponent(email)}`);

    // Verify it is on step 2
    await expect(page.locator('#step-panel-2')).toHaveClass(/active/);

    // Verify business rules inputs are restored
    await expect(page.locator('input[name="timeout"]')).toHaveValue('10');
    await expect(page.locator('input[name="pricing"]')).toHaveValue('150');
    await expect(page.locator('#rules-textarea')).toHaveValue('Restore guidelines text');

    // Go back to step 1 to verify technicians were cleared and restored
    await page.click('#btn-back');
    await expect(page.locator('#tech-list .tech-card')).toHaveCount(1);
    await expect(page.locator('input[name="tech_name_0"]')).toHaveValue('Alice Cooper');
    await expect(page.locator('input[name="tech_phone_0"]')).toHaveValue('+1 (555) 9999');
    await expect(page.locator('select[name="tech_trade_0"]')).toHaveValue('Electrical');
  });
});

/**
 * [AC-3] Visual Resume Notification
 * When a draft is successfully restored from localStorage, a styled resume banner
 * (#restore-banner) must appear at the top of the wizard container.
 * The banner must read: "🔄 Resumed incomplete setup wizard session." and contain a clear [Start Fresh] button/link.
 */
test.describe('Wizard Resume: Visual Notification Banner [AC-3]', () => {
  test('displays #restore-banner when draft is loaded', async ({ page }) => {
    const email = 'ac3-test@example.com';
    const draftState = {
      currentStep: 1,
      technicians: [
        {
          name: 'Sarah',
          phone: '+15550288',
          trade: 'Plumbing',
          skills: '',
          shift: 'Always',
          status: 'active',
        },
      ],
      businessRules: { timeout: '3', pricing: '120', rules: '' },
      calendarConfig: { calendar_url: '', sandbox_mode: 'true' },
    };

    await page.goto('/setup');
    await page.evaluate(
      ({ key, val }) => {
        localStorage.setItem(key, JSON.stringify(val));
      },
      { key: `gainhelm_wizard_draft_${email}`, val: draftState }
    );

    await page.goto(`/setup?email=${encodeURIComponent(email)}`);

    const banner = page.locator('#restore-banner');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('🔄 Resumed incomplete setup wizard session.');

    const startFreshBtn = banner.locator('.btn-start-fresh');
    await expect(startFreshBtn).toBeVisible();
  });
});

/**
 * [AC-4] Discard / Clear Draft
 * Clicking "[Start Fresh]" inside the #restore-banner must remove the draft key from localStorage and reload the page.
 * Submitting the wizard successfully (POST to /setup which redirects to /app) must clear the draft key from localStorage.
 */
test.describe('Wizard Resume: Discard and Clear Draft [AC-4]', () => {
  test('clears draft from localStorage on Start Fresh click', async ({ page }) => {
    const email = 'ac4-test@example.com';
    const draftState = {
      currentStep: 1,
      technicians: [
        {
          name: 'Sarah',
          phone: '+15550288',
          trade: 'Plumbing',
          skills: '',
          shift: 'Always',
          status: 'active',
        },
      ],
      businessRules: { timeout: '3', pricing: '120', rules: '' },
      calendarConfig: { calendar_url: '', sandbox_mode: 'true' },
    };

    await page.goto('/setup');
    await page.evaluate(
      ({ key, val }) => {
        localStorage.setItem(key, JSON.stringify(val));
      },
      { key: `gainhelm_wizard_draft_${email}`, val: draftState }
    );

    await page.goto(`/setup?email=${encodeURIComponent(email)}`);

    // Click Start Fresh
    await page.click('#restore-banner .btn-start-fresh');

    // Page should reload, banner should not be visible anymore
    await expect(page.locator('#restore-banner')).not.toBeVisible();

    // Check localStorage draft is gone
    const draft = await page.evaluate(
      key => localStorage.getItem(key),
      `gainhelm_wizard_draft_${email}`
    );
    expect(draft).toBeNull();
  });

  test('clears draft from localStorage on successful wizard submission', async ({ page }) => {
    const email = `ac4-submit-${Math.random().toString(36).substring(7)}@example.com`;
    await page.goto(`/setup?email=${encodeURIComponent(email)}`);

    // Fill names so step validation passes
    await page.fill('input[name="tech_name_0"]', 'Submission Tech');
    await page.fill('input[name="tech_phone_0"]', '+15559876');

    // Verify draft was saved
    let draft = await page.evaluate(
      key => localStorage.getItem(key),
      `gainhelm_wizard_draft_${email}`
    );
    expect(draft).not.toBeNull();

    // Navigate to step 3 and submit
    await page.click('#btn-next');
    await page.click('#btn-next');
    await page.click('#btn-submit');

    // Redirected to /app
    await expect(page).toHaveURL(/\/app/);

    // Verify draft was cleared
    draft = await page.evaluate(key => localStorage.getItem(key), `gainhelm_wizard_draft_${email}`);
    expect(draft).toBeNull();
  });
});

/**
 * [AC-5] E2E Integration Verification
 * The Playwright integration test suite must contain an end-to-end test confirming
 * that a partially filled form survives reloads, successfully restores steps, and clears
 * state upon successful submission.
 */
test.describe('Wizard Resume: E2E Integration [AC-5]', () => {
  test('partially filled form survives reloads, restores, and clears on submit', async ({
    page,
  }) => {
    const email = `ac5-e2e-${Math.random().toString(36).substring(7)}@example.com`;
    await page.goto(`/setup?email=${encodeURIComponent(email)}`);

    // Fills tech 0
    await page.fill('input[name="tech_name_0"]', 'E2E Tech A');
    await page.fill('input[name="tech_phone_0"]', '+15551234');

    // Click Add Team Member
    await page.click('button:has-text("Add Team Member")');

    // Fills newly added tech card using last selector
    const lastCard = page.locator('#tech-list .tech-card').last();
    await lastCard.locator('input[name^="tech_name_"]').fill('E2E Tech B');
    await lastCard.locator('input[name^="tech_phone_"]').fill('+15555678');

    // Go to Step 2
    await page.click('#btn-next');
    await page.fill('input[name="timeout"]', '15');

    // Reload page
    await page.reload();

    // Verify banner is visible
    await expect(page.locator('#restore-banner')).toBeVisible();

    // Verify we are still on step 2 and timeout is 15
    await expect(page.locator('#step-panel-2')).toHaveClass(/active/);
    await expect(page.locator('input[name="timeout"]')).toHaveValue('15');

    // Go back to Step 1 and verify both tech rows exist and are populated
    await page.click('#btn-back');
    await expect(page.locator('#tech-list .tech-card')).toHaveCount(4); // original 3 + 1 added
    await expect(page.locator('input[name="tech_name_0"]')).toHaveValue('E2E Tech A');
    await expect(page.locator('input[name="tech_phone_0"]')).toHaveValue('+15551234');

    const secondCard = page.locator('#tech-list .tech-card').nth(1);
    await expect(secondCard.locator('input[name^="tech_name_"]')).toHaveValue('Sarah Connor');

    const addedCard = page.locator('#tech-list .tech-card').last();
    await expect(addedCard.locator('input[name^="tech_name_"]')).toHaveValue('E2E Tech B');
    await expect(addedCard.locator('input[name^="tech_phone_"]')).toHaveValue('+15555678');

    // Navigate to step 3 and submit
    await page.click('#btn-next');
    await page.click('#btn-next');
    await page.click('#btn-submit');

    // Redirected to /app
    await expect(page).toHaveURL(/\/app/);

    // Verify localStorage is cleared
    const draft = await page.evaluate(
      key => localStorage.getItem(key),
      `gainhelm_wizard_draft_${email}`
    );
    expect(draft).toBeNull();
  });
});
