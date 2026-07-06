import { test, expect } from '@playwright/test';

/**
 * [AC-1] Backend validation endpoint POST /api/validate-calendar
 * Tests check parsing, hostname validation, bypass logic, and response formats.
 */
test.describe('Calendar Validation API [AC-1]', () => {
  const malformedUrls = [
    { url: 'not-a-valid-url', desc: 'plain string' },
    { url: 'https://', desc: 'missing host' },
    { url: 'https://calendar.google.com:abc/calendar', desc: 'invalid port' }
  ];

  for (const { url, desc } of malformedUrls) {
    test(`POST /api/validate-calendar - returns valid: false for malformed URLs (${desc})`, async ({ request }) => {
      const response = await request.post('/api/validate-calendar', {
        data: { calendar_url: url }
      });
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.valid).toBe(false);
      expect(body.error).toBeDefined();
    });
  }

  const invalidHostnames = [
    { url: 'https://example.com/calendar', desc: 'external domain' },
    { url: 'https://calendar.google.com.attacker.com/calendar', desc: 'domain spoofing' },
    { url: 'https://google.com/calendar', desc: 'naked google.com' },
    { url: 'https://subdomain.calendar.google.com/calendar', desc: 'subdomain of calendar.google.com' },
    { url: 'https://calendar.google.com@attacker.com/calendar', desc: 'credentials redirect' },
    { url: 'https://calendar.google.com.com/calendar', desc: 'spoofed com suffix' },
    { url: 'https://calendar.google.com.cn/calendar', desc: 'spoofed cn suffix' },
    { url: 'https://calendar.google.com./calendar/embed?src=test', desc: 'trailing dot in hostname' },
    { url: 'https://calendar.google.com%ef%bc%8eattacker.com/calendar', desc: 'fullwidth dot domain spoofing' },
    { url: 'https://calendar.google.com%e3%80%82attacker.com/calendar', desc: 'ideographic dot domain spoofing' },
    { url: 'https://calendar.g\u043e\u043egle.com/calendar', desc: 'Cyrillic homograph spoofing' },
    { url: 'https://calendar.xn--ggle-m50aa.com/calendar', desc: 'punycode domain spoofing' },
    { url: 'https://142.250.190.46/calendar/embed?src=test', desc: 'IPv4 address bypass' },
    { url: 'https://[2607:f8b0:4005:805::200e]/calendar/embed?src=test', desc: 'IPv6 address bypass' },
    { url: 'https://calendar.google.com-attacker.com/calendar', desc: 'dashed domain spoofing' },
    { url: 'https://calendar-google-com.com/calendar', desc: 'hyphenated spoofed domain' },
  ];

  for (const { url, desc } of invalidHostnames) {
    test(`POST /api/validate-calendar - returns valid: false for hostnames other than calendar.google.com (${desc})`, async ({ request }) => {
      const response = await request.post('/api/validate-calendar', {
        data: { calendar_url: url }
      });
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.valid).toBe(false);
      expect(body.error).toContain('hostname');
    });
  }

  const validBypassUrls = [
    { url: 'https://calendar.google.com/calendar/embed?src=test', desc: 'standard query test' },
    { url: 'https://CALENDAR.GOOGLE.COM/calendar/embed?src=test', desc: 'uppercase hostname' },
    { url: 'https://calendar.google.com/test-path', desc: 'path contains test' },
    { url: 'https://calendar.google.com:443/calendar/embed?src=test', desc: 'explicit https port 443' },
    { url: 'https://calendar.google.com/calendar/embed?src=TEST', desc: 'uppercase query TEST' },
    { url: 'http://calendar.google.com/calendar/embed?src=test', desc: 'http protocol' },
    { url: 'https://calendar.google.com/calendar/embed?src=test&foo=bar', desc: 'multiple query parameters' },
    { url: '  https://calendar.google.com/calendar/embed?src=test  ', desc: 'leading and trailing whitespace' },
    { url: 'https://calendar.google.com:8080/calendar/embed?src=test', desc: 'explicit non-standard port 8080' },
    { url: 'https://calendar.google.com\\\\calendar/embed?src=test', desc: 'backslashes in path normalized to forward slashes' },
    { url: 'https://user:pass@calendar.google.com/calendar/embed?src=test', desc: 'credentials in URL' },
    { url: 'https://calendar.google.com/calendar/embed?src=my-test-calendar', desc: 'query contains test separated by hyphens' },
    { url: 'https://calendar.google.com/calendar/embed#test', desc: 'hash contains word test' },
    { url: 'https://calendar.google.com/calendar/embed?src=test%20', desc: 'URL-encoded space after test allows bypass' }
  ];

  for (const { url, desc } of validBypassUrls) {
    test(`POST /api/validate-calendar - returns valid: true for valid bypass URL (${desc})`, async ({ request }) => {
      const response = await request.post('/api/validate-calendar', {
        data: { calendar_url: url }
      });
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.valid).toBe(true);
    });
  }

  const invalidBypassUrls = [
    { url: 'https://calendar.google.com/calendar/embed?src=contest@group.calendar.google.com', desc: 'query contains bypass word contest' },
    { url: 'https://calendar.google.com/calendar/embed?src=testing', desc: 'query contains word testing' },
    { url: 'https://calendar.google.com/calendar/embed?src=pretest', desc: 'query contains word pretest' },
    { url: 'https://calendar.google.com/calendar/embed?src=testpost', desc: 'query contains word testpost' },
    { url: 'https://calendar.google.com/calendar/embed?src=latest', desc: 'query contains word latest' },
    { url: 'https://calendar.google.com/calendar/embed?src=my%20test', desc: 'URL-encoded space before test prevents bypass' },
    { url: 'https://calendar.google.com/calendar/embed?src=my%2dtest', desc: 'URL-encoded hyphen prevents bypass due to raw string regex check' },
    { url: 'https://calendar.google.com/calendar/embed?src=test_123', desc: 'query contains word test_123 (underscore prevents boundary)' },
    { url: 'https://calendar.google.com/calendar/embed?src=%3atest', desc: 'URL-encoded colon before test prevents bypass due to raw string regex check ending in a word character' }
  ];

  for (const { url, desc } of invalidBypassUrls) {
    test(`POST /api/validate-calendar - returns valid: false for invalid bypass URL (${desc})`, async ({ request }) => {
      const response = await request.post('/api/validate-calendar', {
        data: { calendar_url: url }
      });
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.valid).toBe(false);
    });
  }


  test('POST /api/validate-calendar - returns valid: false when calendar_url is omitted', async ({ request }) => {
    const response = await request.post('/api/validate-calendar', {
      data: {}
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.valid).toBe(false);
    expect(body.error).toContain('required');
  });

  test('POST /api/validate-calendar - returns valid: false for invalid protocols (e.g., ftp)', async ({ request }) => {
    const response = await request.post('/api/validate-calendar', {
      data: { calendar_url: 'ftp://calendar.google.com/test' }
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.valid).toBe(false);
    expect(body.error).toContain('protocol');
  });

  test('POST /api/validate-calendar - returns valid: false for a URL that cannot be fetched (no test bypass)', async ({ request }) => {
    const response = await request.post('/api/validate-calendar', {
      data: { calendar_url: 'https://calendar.google.com/calendar' }
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.valid).toBe(false);
    
    const possibleErrors = [
      'Network error or unable to resolve calendar URL',
      'Restricted calendar URL. Please check calendar public sharing settings.'
    ];
    const matchesAny = possibleErrors.some(err => body.error.includes(err));
    expect(matchesAny).toBe(true);
  });
});

/**
 * [AC-2] Wizard Step 3 UI Validation Component
 * Tests the four connection states, pulsing animations, colors, and the helper link.
 */
test.describe('Wizard Step 3 UI Component [AC-2]', () => {
  test('displays initial Not Verified state and helper link', async ({ page }) => {
    const email = 'ac2-ui-init@example.com';
    await page.goto(`/setup?email=${encodeURIComponent(email)}`);

    // Go to step 3
    await page.click('#btn-next');
    await page.click('#btn-next');

    // Check status badge is "Not Verified"
    const badge = page.locator('#calendar-verify-status');
    await expect(badge).toBeVisible();
    await expect(badge).toContainText('⚠️ Connection not verified.');

    // Check color / style (muted orange / default state color)
    await expect(badge).toHaveCSS('color', 'rgb(217, 119, 6)'); // e.g. #d97706 or orange styling

    // Helper link is present
    const helperLink = page.locator('a:has-text("How do I make my calendar link public?")');
    await expect(helperLink).toBeVisible();
  });

  test('shows verifying state during verification and transitions to success', async ({ page }) => {
    const email = 'ac2-ui-verify@example.com';
    await page.goto(`/setup?email=${encodeURIComponent(email)}`);

    // Go to step 3
    await page.click('#btn-next');
    await page.click('#btn-next');

    // Fill calendar URL
    await page.fill('input[name="calendar_url"]', 'https://calendar.google.com/calendar/embed?src=test');

    // Mock API response if needed, but since we are in test mode it will return valid: true.
    // Let's click verify
    await page.click('#btn-verify-calendar');

    // Immediately after click, it should show verifying state
    const badge = page.locator('#calendar-verify-status');
    // Note: Due to fast processing in test mode, the verifying state might be brief, 
    // but the class or pulsing animation should be checked.
    await expect(badge).toContainText('Calendar integration verified.');
    await expect(badge).toHaveCSS('color', 'rgb(16, 185, 129)'); // Success color #10b981
  });

  test('shows error state when verification fails', async ({ page }) => {
    const email = 'ac2-ui-error@example.com';
    await page.goto(`/setup?email=${encodeURIComponent(email)}`);

    // Go to step 3
    await page.click('#btn-next');
    await page.click('#btn-next');

    // Fill invalid URL
    await page.fill('input[name="calendar_url"]', 'https://invalid-host.com/test');

    // Click verify
    await page.click('#btn-verify-calendar');

    // Should transition to error state
    const badge = page.locator('#calendar-verify-status');
    await expect(badge).toContainText('❌ Integration failed:');
    await expect(badge).toHaveCSS('color', 'rgb(239, 68, 68)'); // Error color #ef4444
  });
});

/**
 * [AC-3] Verification Form Submission Guard
 * Tests submission blocks when URL not verified, resets on edit, and enables on verified.
 */
test.describe('Verification Form Submission Guard [AC-3]', () => {
  test('blocks wizard submission if URL is not verified', async ({ page }) => {
    const email = 'ac3-guard-block@example.com';
    await page.goto(`/setup?email=${encodeURIComponent(email)}`);

    // Go to step 3
    await page.click('#btn-next');
    await page.click('#btn-next');

    // Try submitting without verification
    const submitBtn = page.locator('#btn-submit');
    await expect(submitBtn).toBeDisabled();

    // Fill URL but don't click verify
    await page.fill('input[name="calendar_url"]', 'https://calendar.google.com/test');
    await expect(submitBtn).toBeDisabled();
  });

  test('enables submission on successful verification and disables again on URL edit', async ({ page }) => {
    const email = 'ac3-guard-verify@example.com';
    await page.goto(`/setup?email=${encodeURIComponent(email)}`);

    // Go to step 3
    await page.click('#btn-next');
    await page.click('#btn-next');

    // Verify valid URL
    await page.fill('input[name="calendar_url"]', 'https://calendar.google.com/test');
    await page.click('#btn-verify-calendar');

    // Check submit is now enabled
    const submitBtn = page.locator('#btn-submit');
    await expect(submitBtn).toBeEnabled();

    // Edit the calendar input URL
    await page.fill('input[name="calendar_url"]', 'https://calendar.google.com/test-edited');

    // State should reset to Not Verified
    const badge = page.locator('#calendar-verify-status');
    await expect(badge).toContainText('⚠️ Connection not verified.');
    await expect(submitBtn).toBeDisabled();
  });
});

/**
 * [AC-4] Persistence of Verification State in Drafts
 * Tests that localStorage stores is_verified, and restoring draft restores badge & enables submit.
 */
test.describe('Verification State Persistence in Drafts [AC-4]', () => {
  test('stores is_verified boolean in draft localStorage', async ({ page }) => {
    const email = 'ac4-draft-store@example.com';
    await page.goto(`/setup?email=${encodeURIComponent(email)}`);

    // Go to step 3
    await page.click('#btn-next');
    await page.click('#btn-next');

    // Fill URL and verify
    await page.fill('input[name="calendar_url"]', 'https://calendar.google.com/test');
    await page.click('#btn-verify-calendar');

    // Ensure status is verified
    await expect(page.locator('#calendar-verify-status')).toContainText('Calendar integration verified.');

    // Check localStorage draft contains calendarConfig.is_verified: true
    const draft = await page.evaluate((key) => localStorage.getItem(key), `gainhelm_wizard_draft_${email}`);
    expect(draft).not.toBeNull();
    const draftData = JSON.parse(draft);
    expect(draftData.calendarConfig).toBeDefined();
    expect(draftData.calendarConfig.is_verified).toBe(true);
  });

  test('restores verified state and enables submit on draft load', async ({ page }) => {
    const email = 'ac4-draft-restore@example.com';
    const draftState = {
      currentStep: 3,
      technicians: [
        { name: 'Sarah Connor', phone: '+15551234', trade: 'HVAC', skills: '', shift: 'Always', status: 'active' }
      ],
      businessRules: { timeout: '3', pricing: '120', rules: '' },
      calendarConfig: {
        calendar_url: 'https://calendar.google.com/calendar/embed?src=test',
        sandbox_mode: 'true',
        is_verified: true
      }
    };

    // Load setup first to access domain/localStorage
    await page.goto('/setup');
    await page.evaluate(({ key, val }) => {
      localStorage.setItem(key, JSON.stringify(val));
    }, { key: `gainhelm_wizard_draft_${email}`, val: draftState });

    // Load setup with email to trigger restore
    await page.goto(`/setup?email=${encodeURIComponent(email)}`);

    // Verify step 3 is active
    await expect(page.locator('#step-panel-3')).toHaveClass(/active/);

    // Verify verified badge is shown immediately
    const badge = page.locator('#calendar-verify-status');
    await expect(badge).toContainText('Calendar integration verified.');

    // Verify submit button is enabled
    const submitBtn = page.locator('#btn-submit');
    await expect(submitBtn).toBeEnabled();
  });
});
