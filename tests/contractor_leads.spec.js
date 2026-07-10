/**
 * [AC-5] Automated Verification
 * Test suite for Local Contractor Leads Acquisition & Cold Outreach Generator.
 * Maps to SPEC.md acceptance criteria.
 */

import { test, expect } from '@playwright/test';
import postgres from 'postgres';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

// [AC-1] Database Schema & Table
test.describe('Database Schema & Table', () => {
  test('Verify local_contractor_leads table schema fields exist', async () => {
    // Skip if DATABASE_URL is not set (e.g. in environments without live DB)
    if (!process.env.DATABASE_URL) {
      test.skip('DATABASE_URL not defined');
      return;
    }
    const sql = postgres(process.env.DATABASE_URL);
    try {
      const tableExistsResult = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'local_contractor_leads'
        );
      `;
      expect(tableExistsResult[0].exists).toBe(true);

      const columns = await sql`
        SELECT column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'local_contractor_leads'
      `;
      const colMap = {};
      columns.forEach(col => {
        colMap[col.column_name] = col;
      });

      // Columns matching interface contract
      expect(colMap.id).toBeDefined();
      expect(colMap.company_name).toBeDefined();
      expect(colMap.owner_name).toBeDefined();
      expect(colMap.email).toBeDefined();
      expect(colMap.phone).toBeDefined();
      expect(colMap.website).toBeDefined();
      expect(colMap.city).toBeDefined();
      expect(colMap.state).toBeDefined();
      expect(colMap.trade).toBeDefined();
      expect(colMap.status).toBeDefined();
      expect(colMap.cold_email).toBeDefined();
      expect(colMap.created_at).toBeDefined();
      expect(colMap.updated_at).toBeDefined();

      // Types / Defaults
      expect(colMap.id.data_type).toBe('uuid');
      expect(colMap.status.column_default).toContain('discovered');
      expect(colMap.company_name.is_nullable).toBe('NO');
      expect(colMap.trade.is_nullable).toBe('NO');

      // Verify email uniqueness (unique constraint or unique index check)
      const indexResult = await sql`
        SELECT count(*) 
        FROM pg_indexes 
        WHERE tablename = 'local_contractor_leads' AND indexdef LIKE '%email%';
      `;
      expect(parseInt(indexResult[0].count, 10)).toBeGreaterThan(0);
    } finally {
      await sql.end();
    }
  });
});

// [AC-2] REST API Endpoints
test.describe('REST API Endpoints', () => {
  test('POST /api/contractors - validation errors (400) for missing/invalid fields', async ({
    request,
  }) => {
    const payloads = [
      {
        desc: 'Missing company_name',
        data: {
          trade: 'hvac',
          email: 'test@hvac.com',
        },
      },
      {
        desc: 'Missing trade',
        data: {
          company_name: 'Test Contractor',
          email: 'test@hvac.com',
        },
      },
      {
        desc: 'Empty company_name',
        data: {
          company_name: '',
          trade: 'hvac',
        },
      },
      {
        desc: 'Empty trade',
        data: {
          company_name: 'Test Contractor',
          trade: '',
        },
      },
      {
        desc: 'Invalid email format',
        data: {
          company_name: 'Test Contractor',
          trade: 'hvac',
          email: 'invalid-email-format',
        },
      },
    ];

    for (const p of payloads) {
      const response = await request.post('/api/contractors', { data: p.data });
      expect(response.status(), `Expected 400 for: ${p.desc}`).toBe(400);
    }
  });

  test('POST /api/contractors - creates lead and generates cold_email automatically if missing', async ({
    request,
  }) => {
    const payload = {
      company_name: 'Seattle Plumbers Inc',
      owner_name: 'Bob',
      email: `bob@seattleplumbers-${Math.random()}.com`,
      phone: '206-555-0199',
      website: 'https://seattleplumbers.net',
      city: 'Seattle',
      state: 'WA',
      trade: 'plumbing',
    };

    const response = await request.post('/api/contractors', { data: payload });
    expect(response.status()).toBe(200);
    const json = await response.json();

    expect(json.id).toBeDefined();
    expect(json.company_name).toBe(payload.company_name);
    expect(json.trade).toBe(payload.trade);
    expect(json.status).toBe('discovered');
    expect(json.cold_email).toBeDefined();
    expect(json.cold_email).not.toBeNull();
    expect(json.cold_email.length).toBeGreaterThan(20);
  });

  test('POST /api/contractors - supports upsert on email duplicate conflict', async ({
    request,
  }) => {
    const duplicateEmail = `conflict-${Math.random()}@hvacpro.com`;
    const initialPayload = {
      company_name: 'HVAC Pro Seattle',
      email: duplicateEmail,
      trade: 'hvac',
      city: 'Seattle',
    };

    // First post
    let response = await request.post('/api/contractors', { data: initialPayload });
    expect(response.status()).toBe(200);
    const firstJson = await response.json();
    expect(firstJson.status).toBe('discovered');

    // Second post with same email but updated company name and status
    const updatedPayload = {
      company_name: 'HVAC Pro Seattle Updated',
      email: duplicateEmail,
      trade: 'hvac',
      status: 'queued',
    };
    response = await request.post('/api/contractors', { data: updatedPayload });
    expect(response.status()).toBe(200);
    const secondJson = await response.json();

    expect(secondJson.id).toBe(firstJson.id); // Same ID
    expect(secondJson.company_name).toBe(updatedPayload.company_name);
    expect(secondJson.status).toBe('queued');
  });

  test('GET /api/contractors - supports filtering and sorting', async ({ request }) => {
    const rand = Math.random();
    const lead1 = {
      company_name: `A-1 Seattle Electrical-${rand}`,
      email: `electrician-${rand}-1@seattle.com`,
      trade: 'electrical',
      city: 'Seattle',
      status: 'discovered',
    };
    const lead2 = {
      company_name: `Z-9 Cleaning Pros-${rand}`,
      email: `cleaner-${rand}-2@seattle.com`,
      trade: 'cleaning',
      city: 'Seattle',
      status: 'queued',
    };

    await request.post('/api/contractors', { data: lead1 });
    await request.post('/api/contractors', { data: lead2 });

    // Filter by trade=electrical
    let response = await request.get('/api/contractors', { params: { trade: 'electrical' } });
    expect(response.status()).toBe(200);
    let data = await response.json();
    expect(data.length).toBeGreaterThanOrEqual(1);
    expect(data.every(c => c.trade === 'electrical')).toBe(true);

    // Filter by status=queued
    response = await request.get('/api/contractors', { params: { status: 'queued' } });
    expect(response.status()).toBe(200);
    data = await response.json();
    expect(data.every(c => c.status === 'queued')).toBe(true);

    // Sort by company_name_asc
    response = await request.get('/api/contractors', { params: { sort: 'company_name_asc' } });
    expect(response.status()).toBe(200);
    data = await response.json();
    for (let i = 0; i < data.length - 1; i++) {
      expect(data[i].company_name.localeCompare(data[i + 1].company_name)).toBeLessThanOrEqual(0);
    }
  });

  test('PATCH /api/contractors/:id - status update validation and cold_email editing', async ({
    request,
  }) => {
    const payload = {
      company_name: 'Landscaping Masters',
      trade: 'landscaping',
      email: `landscaper-${Math.random()}@green.com`,
    };
    const createRes = await request.post('/api/contractors', { data: payload });
    const lead = await createRes.json();
    const id = lead.id;

    // Invalid status (should return 400)
    let patchRes = await request.patch(`/api/contractors/${id}`, {
      data: { status: 'invalid-status' },
    });
    expect(patchRes.status()).toBe(400);

    // Valid status and cold_email update
    patchRes = await request.patch(`/api/contractors/${id}`, {
      data: {
        status: 'email_sent',
        cold_email: 'Updated custom email draft body.',
      },
    });
    expect(patchRes.status()).toBe(200);
    const updatedLead = await patchRes.json();
    expect(updatedLead.status).toBe('email_sent');
    expect(updatedLead.cold_email).toBe('Updated custom email draft body.');
  });

  test('POST /api/contractors/discover - triggers contractor discovery and returns count', async ({
    request,
  }) => {
    const response = await request.post('/api/contractors/discover');
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.count).toBeDefined();
    expect(typeof json.count).toBe('number');
  });
});

// [AC-3] Contractor Discovery Script
test.describe('Contractor Discovery Script', () => {
  test('Verify discovery script exports and generateColdEmail tone and rules', async () => {
    const scriptPath = join(process.cwd(), 'scripts', 'find-local-contractors.mjs');

    // Dynamic import to test ESM file exports
    let module;
    try {
      module = await import(`file://${scriptPath}`);
    } catch (err) {
      throw new Error(`Failed to import scripts/find-local-contractors.mjs: ${err.message}`);
    }

    expect(module.performContractorDiscovery).toBeDefined();
    expect(module.generateColdEmail).toBeDefined();

    // Verify generateColdEmail content structure and rules
    const email = module.generateColdEmail('Seattle HVAC Pros', 'hvac', 'Seattle', 'David');
    expect(email).toContain('Seattle HVAC Pros');
    expect(email).toContain('Seattle');
    expect(email).toContain('David');
    expect(email).toContain('https://gainhelm.com');

    // Conversational, warm, direct
    expect(email).not.toContain('hope this email finds you well');
    expect(email).not.toContain('paradigm-shifting');
    expect(email).not.toContain('synergistic');

    // Pain point check
    const textLower = email.toLowerCase();
    expect(textLower).toMatch(/phone tag|dispatch|technician|schedul/);

    // Value prop check
    expect(textLower).toMatch(/sms|no app|text/);
  });

  test('performContractorDiscovery function execution', async () => {
    const scriptPath = join(process.cwd(), 'scripts', 'find-local-contractors.mjs');
    let module;
    try {
      module = await import(`file://${scriptPath}`);
    } catch (err) {
      test.skip('find-local-contractors.mjs script not found');
      return;
    }

    const inMemoryLeads = [];
    const count = await module.performContractorDiscovery(null, inMemoryLeads);
    expect(typeof count).toBe('number');
    expect(count).toBeGreaterThan(0);
    expect(inMemoryLeads.length).toBe(count);

    // Verify properties of mock/discovered leads
    const firstLead = inMemoryLeads[0];
    expect(firstLead.company_name).toBeDefined();
    expect(firstLead.trade).toBeDefined();
    expect(firstLead.cold_email).toBeDefined();

    // Verify report at reports/local-contractors.md is generated
    const reportPath = join(process.cwd(), 'reports', 'local-contractors.md');
    expect(existsSync(reportPath)).toBe(true);
  });
});

// [AC-4] Contractor Leads UI Dashboard Page
test.describe('Contractor Leads UI Dashboard Page', () => {
  test('/tools/contractor-leads serves HTML successfully and matches design system', async ({
    page,
  }) => {
    const response = await page.goto('/tools/contractor-leads');
    expect(response?.status()).toBe(200);

    await expect(page).toHaveTitle(/Gainhelm/);

    // Verify stylesheet exists
    const stylesheet = page.locator('link[rel="stylesheet"]');
    await expect(stylesheet).toHaveAttribute('href', /styles\.css/);
  });
});

// Dashboard Functionality (E2E)
test.describe('Dashboard Functionality E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Route & intercept API calls to run UI tests in isolation
    await page.route('**/api/contractors', async route => {
      if (route.request().method() === 'GET') {
        const url = new URL(route.request().url());
        const trade = url.searchParams.get('trade');
        const status = url.searchParams.get('status');
        const sort = url.searchParams.get('sort');

        let contractors = [
          {
            id: 'fa72ca12-efbe-4836-96b6-b519b78fb2e1',
            company_name: 'Seattle Heating Pros',
            owner_name: 'Alice',
            email: 'alice@seattleheat.com',
            phone: '206-555-0101',
            website: 'https://seattleheat.com',
            city: 'Seattle',
            state: 'WA',
            trade: 'hvac',
            status: 'discovered',
            cold_email: 'Hey Alice! Need simple SMS dispatch for Seattle Heating Pros?',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            updated_at: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: 'bb32df23-dcae-4f12-9c16-c950bb0c59e2',
            company_name: 'Austin Plumbing Co',
            owner_name: 'Tom',
            email: 'tom@austinplumbing.com',
            phone: '512-555-0202',
            website: 'https://austinplumbing.com',
            city: 'Austin',
            state: 'TX',
            trade: 'plumbing',
            status: 'queued',
            cold_email: 'Hey Tom! SMS dispatching solves phone tag at Austin Plumbing Co.',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];

        if (trade && trade !== 'all') {
          contractors = contractors.filter(c => c.trade === trade);
        }
        if (status && status !== 'all') {
          contractors = contractors.filter(c => c.status === status);
        }

        if (sort === 'company_name_asc') {
          contractors.sort((a, b) => a.company_name.localeCompare(b.company_name));
        } else if (sort === 'date_asc') {
          contractors.sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        } else {
          contractors.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        }

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(contractors),
        });
      } else if (route.request().method() === 'POST') {
        const payload = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'new-contractor-uuid',
            company_name: payload.company_name,
            owner_name: payload.owner_name || null,
            email: payload.email || null,
            phone: payload.phone || null,
            website: payload.website || null,
            city: payload.city || null,
            state: payload.state || null,
            trade: payload.trade,
            status: payload.status || 'discovered',
            cold_email: 'Generated cold email...',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }),
        });
      }
    });

    await page.route('**/api/contractors/*', async route => {
      if (route.request().method() === 'PATCH') {
        const payload = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'fa72ca12-efbe-4836-96b6-b519b78fb2e1',
            company_name: 'Seattle Heating Pros',
            owner_name: 'Alice',
            email: 'alice@seattleheat.com',
            phone: '206-555-0101',
            website: 'https://seattleheat.com',
            city: 'Seattle',
            state: 'WA',
            trade: 'hvac',
            status: payload.status || 'discovered',
            cold_email:
              payload.cold_email || 'Hey Alice! Need simple SMS dispatch for Seattle Heating Pros?',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }),
        });
      }
    });

    await page.route('**/api/contractors/discover', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ count: 12 }),
      });
    });
  });

  test('Stats panels display metrics counts correctly', async ({ page }) => {
    await page.goto('/tools/contractor-leads');

    // Confirm that counts exist and represent mock data values
    await expect(page.locator('#discovered-count')).toContainText('1');
    await expect(page.locator('#queued-count')).toContainText('1');
    await expect(page.locator('#email-sent-count')).toContainText('0');
    await expect(page.locator('#replied-count')).toContainText('0');
    await expect(page.locator('#ignored-count')).toContainText('0');
  });

  test('Filtering and sorting leads works in UI', async ({ page }) => {
    await page.goto('/tools/contractor-leads');

    const tradeFilter = page.locator('#filter-trade');
    await tradeFilter.selectOption('hvac');

    const cards = page.locator('.contractor-card');
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toContainText('Seattle Heating Pros');

    const sortSelect = page.locator('#sort-contractors');
    await sortSelect.selectOption('company_name_asc');
    await expect(cards).toHaveCount(1);
  });

  test('Add Custom Lead Form validation and success', async ({ page }) => {
    await page.goto('/tools/contractor-leads');

    const nameInput = page.locator('#contractor-name');
    const tradeSelect = page.locator('#contractor-trade');
    const emailInput = page.locator('#contractor-email');
    const submitButton = page.locator('button[type="submit"]:has-text("Add Lead")');

    // Missing required fields validation
    await submitButton.click();
    const errorMsg = page.locator('.form-error-message');
    await expect(errorMsg).toBeVisible();

    // Invalid email validation
    await nameInput.fill('Tacoma Electric');
    await tradeSelect.selectOption('electrical');
    await emailInput.fill('invalid-email-string');
    await submitButton.click();
    await expect(errorMsg).toBeVisible();

    // Successful submission
    await emailInput.fill('info@tacomaelectric.com');
    await submitButton.click();

    // Form should clear
    await expect(nameInput).toHaveValue('');
    await expect(emailInput).toHaveValue('');
  });

  test('Contractor card features manual email editing, clipboard copy and status transitioning', async ({
    page,
  }) => {
    await page.goto('/tools/contractor-leads');

    const firstCard = page.locator('.contractor-card').first();
    await expect(firstCard.locator('.contractor-company-name')).toBeVisible();
    await expect(firstCard.locator('.contractor-trade')).toBeVisible();
    await expect(firstCard.locator('.contractor-contact-info')).toBeVisible();

    // Edit email text details
    const textarea = firstCard.locator('.cold-email-textarea');
    await expect(textarea).toBeVisible();
    await textarea.fill('New custom email pitch body');

    // Clipboard copy mock
    await page.evaluate(() => {
      window.copiedText = null;
      navigator.clipboard.writeText = async text => {
        window.copiedText = text;
      };
    });

    await firstCard.locator('.btn-copy-email').click();
    const copiedText = await page.evaluate(() => window.copiedText);
    expect(copiedText).toBe('New custom email pitch body');

    // Toast check
    const toast = page.locator('.toast-notification');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText(/copied/i);

    // Status updates: click transitions
    const btnQueue = firstCard.locator('.btn-status-queue');
    const btnSent = firstCard.locator('.btn-status-sent');
    const btnReplied = firstCard.locator('.btn-status-replied');
    const btnIgnore = firstCard.locator('.btn-status-ignore');

    await expect(btnQueue).toBeVisible();
    await expect(btnSent).toBeVisible();
    await expect(btnReplied).toBeVisible();
    await expect(btnIgnore).toBeVisible();

    await btnSent.click();
    await expect(firstCard.locator('.contractor-status-badge')).toContainText('email_sent');
  });

  test('Trigger Discovery button calls API and displays toast with count', async ({ page }) => {
    await page.goto('/tools/contractor-leads');

    const btnDiscover = page.locator('button:has-text("Trigger Discovery")');
    await btnDiscover.click();

    const toast = page.locator('.toast-notification');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText(/discovered 12 new leads/i);
  });
});
