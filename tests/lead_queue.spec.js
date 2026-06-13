/**
 * [AC-5] Automated Verification
 * Test suite for Find and Queue High-Intent Social Leads.
 * Maps to SPEC.md acceptance criteria.
 */

import { test, expect } from '@playwright/test';
import postgres from 'postgres';

// [AC-1] Database Schema & Table
test.describe('Database Schema & Table', () => {
  test('Verify social_leads table schema fields exist', async () => {
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
          WHERE table_schema = 'public' AND table_name = 'social_leads'
        );
      `;
      expect(tableExistsResult[0].exists).toBe(true);

      const columns = await sql`
        SELECT column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'social_leads'
      `;
      const colMap = {};
      columns.forEach(col => {
        colMap[col.column_name] = col;
      });

      expect(colMap.id).toBeDefined();
      expect(colMap.platform).toBeDefined();
      expect(colMap.source_url).toBeDefined();
      expect(colMap.title).toBeDefined();
      expect(colMap.snippet).toBeDefined();
      expect(colMap.intent_score).toBeDefined();
      expect(colMap.status).toBeDefined();
      expect(colMap.suggested_reply).toBeDefined();
      expect(colMap.created_at).toBeDefined();
      expect(colMap.updated_at).toBeDefined();

      // Verify specific types / defaults from spec
      expect(colMap.id.data_type).toBe('uuid');
      expect(colMap.intent_score.column_default).toContain('50');
      expect(colMap.status.column_default).toContain('discovered');
    } finally {
      await sql.end();
    }
  });
});

// [AC-2] REST API Endpoints
test.describe('REST API Endpoints', () => {
  test('POST /api/leads - validation errors (400) for missing fields', async ({ request }) => {
    const payloads = [
      {
        desc: 'Missing platform',
        data: {
          source_url: 'https://reddit.com/r/hvac/comments/1',
          title: 'Need HVAC dispatcher app',
          snippet: 'Our scheduling is a mess.'
        }
      },
      {
        desc: 'Missing source_url',
        data: {
          platform: 'reddit',
          title: 'Need HVAC dispatcher app',
          snippet: 'Our scheduling is a mess.'
        }
      },
      {
        desc: 'Missing title',
        data: {
          platform: 'reddit',
          source_url: 'https://reddit.com/r/hvac/comments/2',
          snippet: 'Our scheduling is a mess.'
        }
      },
      {
        desc: 'Missing snippet',
        data: {
          platform: 'reddit',
          source_url: 'https://reddit.com/r/hvac/comments/3',
          title: 'Need HVAC dispatcher app'
        }
      },
      {
        desc: 'Empty platform',
        data: {
          platform: '',
          source_url: 'https://reddit.com/r/hvac/comments/4',
          title: 'Need HVAC dispatcher app',
          snippet: 'Our scheduling is a mess.'
        }
      }
    ];

    for (const p of payloads) {
      const response = await request.post('/api/leads', { data: p.data });
      expect(response.status(), `Expected 400 for: ${p.desc}`).toBe(400);
    }
  });

  test('POST /api/leads - automatically computes intent score and suggested reply templates', async ({ request }) => {
    // Case 1: HVAC trade keywords matching and multiple intent score boosts
    // title: "scheduling" -> +15
    // snippet: "dispatcher" -> +15, "Jobber" -> +20, "spreadsheet" -> +10
    // Trade: HVAC detected -> HVAC template
    // Expected score: 50 (base) + 15 + 15 + 20 + 10 = 110, capped at 100
    const hvacPayload = {
      platform: 'reddit',
      source_url: `https://reddit.com/r/hvac/comments/test-${Math.random()}`,
      title: 'Help with HVAC scheduling',
      snippet: 'We currently use Jobber and a spreadsheet but the dispatcher is overwhelmed and there is a lot of phone tag.'
    };
    let response = await request.post('/api/leads', { data: hvacPayload });
    expect(response.status()).toBe(200);
    let json = await response.json();
    expect(json.intent_score).toBe(100);
    expect(json.suggested_reply).toContain('Hey! If you are dealing with dispatch chaos or trying to get away from spreadsheets, check out Gainhelm');

    // Case 2: General trade template and baseline score
    // No keywords matching adjustments.
    // Expected score: 50 (base)
    // Trade: General -> General/Other template
    const generalPayload = {
      platform: 'facebook',
      source_url: `https://facebook.com/groups/contractors/posts/test-${Math.random()}`,
      title: 'Looking for recommendations',
      snippet: 'Any advice for starting a general handyman business?'
    };
    response = await request.post('/api/leads', { data: generalPayload });
    expect(response.status()).toBe(200);
    json = await response.json();
    expect(json.intent_score).toBe(50);
    expect(json.suggested_reply).toContain('We had similar scheduling headaches before trying Gainhelm');
  });

  test('POST /api/leads - supports upsert behavior on duplicate source_url', async ({ request }) => {
    const uniqueUrl = `https://reddit.com/r/plumbing/comments/upsert-${Math.random()}`;
    const initialPayload = {
      platform: 'reddit',
      source_url: uniqueUrl,
      title: 'Plumbing dispatcher help',
      snippet: 'We need to dispatch plumber techs.'
    };
    
    // First post
    let response = await request.post('/api/leads', { data: initialPayload });
    expect(response.status()).toBe(200);
    const firstJson = await response.json();
    expect(firstJson.status).toBe('discovered');

    // Second post with same URL, updated snippet and status
    const updatedPayload = {
      platform: 'reddit',
      source_url: uniqueUrl,
      title: 'Plumbing dispatcher help',
      snippet: 'We need to dispatch plumber techs. Jobber is too expensive.',
      status: 'queued'
    };
    response = await request.post('/api/leads', { data: updatedPayload });
    expect(response.status()).toBe(200);
    const secondJson = await response.json();
    
    expect(secondJson.id).toBe(firstJson.id); // Same lead ID
    expect(secondJson.snippet).toBe(updatedPayload.snippet);
    expect(secondJson.status).toBe('queued');
    expect(secondJson.intent_score).toBeGreaterThan(firstJson.intent_score); // "Jobber" competitor +20 added
  });

  test('GET /api/leads - supports filtering and sorting', async ({ request }) => {
    const rand = Math.random();
    const lead1 = {
      platform: 'reddit',
      source_url: `https://reddit.com/r/elect/test-get-1-${rand}`,
      title: 'Electrician dispatcher chaos',
      snippet: 'scheduling and dispatching electricians is a mess.', 
    };
    const lead2 = {
      platform: 'facebook',
      source_url: `https://facebook.com/test-get-2-${rand}`,
      title: 'Facebook contractor lead',
      snippet: 'We just need a simple calendar tool.',
    };

    await request.post('/api/leads', { data: lead1 });
    await request.post('/api/leads', { data: lead2 });

    // Filter by platform=facebook
    let response = await request.get('/api/leads', { params: { platform: 'facebook' } });
    expect(response.status()).toBe(200);
    let data = await response.json();
    expect(data.every(l => l.platform === 'facebook')).toBe(true);

    // Filter by status=discovered
    response = await request.get('/api/leads', { params: { status: 'discovered' } });
    expect(response.status()).toBe(200);
    data = await response.json();
    expect(data.every(l => l.status === 'discovered')).toBe(true);

    // Sort by intent_desc
    response = await request.get('/api/leads', { params: { sort: 'intent_desc' } });
    expect(response.status()).toBe(200);
    data = await response.json();
    for (let i = 0; i < data.length - 1; i++) {
      expect(data[i].intent_score).toBeGreaterThanOrEqual(data[i+1].intent_score);
    }
  });

  test('PATCH /api/leads/:id - status update validation and custom reply updates', async ({ request }) => {
    const leadPayload = {
      platform: 'reddit',
      source_url: `https://reddit.com/r/hvac/test-patch-${Math.random()}`,
      title: 'Plumber dispatch scheduling',
      snippet: 'Need a calendar that works with dispatch.'
    };
    const createRes = await request.post('/api/leads', { data: leadPayload });
    const lead = await createRes.json();
    const id = lead.id;

    // Invalid status (should return 400)
    let patchRes = await request.patch(`/api/leads/${id}`, {
      data: { status: 'invalid-status' }
    });
    expect(patchRes.status()).toBe(400);

    // Valid status and suggested_reply update
    patchRes = await request.patch(`/api/leads/${id}`, {
      data: {
        status: 'replied',
        suggested_reply: 'Updated custom draft pitch response.'
      }
    });
    expect(patchRes.status()).toBe(200);
    const updatedLead = await patchRes.json();
    expect(updatedLead.status).toBe('replied');
    expect(updatedLead.suggested_reply).toBe('Updated custom draft pitch response.');
  });

  test('POST /api/leads/discover - returns count of newly discovered leads', async ({ request }) => {
    const response = await request.post('/api/leads/discover');
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.count).toBeDefined();
    expect(typeof json.count).toBe('number');
  });
});

// [AC-3] Web UI Dashboard Page
test.describe('Web UI Dashboard Page', () => {
  test('/tools/lead-queue serves HTML successfully and renders basic layouts', async ({ page }) => {
    const response = await page.goto('/tools/lead-queue');
    expect(response?.status()).toBe(200);

    // Verify Gainhelm header, main content area and footer
    await expect(page).toHaveTitle(/Gainhelm/);
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    // Verify responsive styling uses stylesheet
    const stylesheet = page.locator('link[rel="stylesheet"]');
    await expect(stylesheet).toHaveAttribute('href', /styles\.css/);
  });
});

// [AC-4] Dashboard Functionality
test.describe('Dashboard Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API requests for UI tests to run fast and reliably
    await page.route('**/api/leads', async (route) => {
      if (route.request().method() === 'GET') {
        const url = new URL(route.request().url());
        const platform = url.searchParams.get('platform');
        const status = url.searchParams.get('status');
        const sort = url.searchParams.get('sort');

        let leads = [
          {
            id: 'd1c8a1b5-6a7f-4318-8f86-d249aa9b48c0',
            platform: 'reddit',
            source_url: 'https://reddit.com/r/hvac/comments/hvac-pain',
            title: 'Tired of phone tag and calendar spreadsheets',
            snippet: 'Looking for scheduling help. HVAC technician dispatch is a mess.',
            intent_score: 90,
            status: 'discovered',
            suggested_reply: 'Hey! If you are dealing with dispatch chaos or trying to get away from spreadsheets...',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            updated_at: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 'e2b9c3f5-7b8f-4c28-9f96-c350bb0c59d1',
            platform: 'facebook',
            source_url: 'https://facebook.com/groups/contractor-jobs/post-2',
            title: 'Simple scheduler recommendations',
            snippet: 'Just starting a small cleaning business and need scheduling calendar.',
            intent_score: 60,
            status: 'queued',
            suggested_reply: 'We had similar scheduling headaches before trying Gainhelm...',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];

        if (platform && platform !== 'all') {
          leads = leads.filter(l => l.platform === platform);
        }
        if (status && status !== 'all') {
          leads = leads.filter(l => l.status === status);
        }
        
        if (sort === 'intent_desc') {
          leads.sort((a, b) => b.intent_score - a.intent_score);
        } else if (sort === 'date_asc') {
          leads.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        } else {
          leads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(leads),
        });
      } else if (route.request().method() === 'POST') {
        const payload = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'new-lead-uuid',
            platform: payload.platform || 'reddit',
            source_url: payload.source_url,
            title: payload.title,
            snippet: payload.snippet,
            intent_score: 75,
            status: payload.status || 'discovered',
            suggested_reply: 'Suggested reply text draft...',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        });
      }
    });

    await page.route('**/api/leads/*', async (route) => {
      if (route.request().method() === 'PATCH') {
        const payload = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'd1c8a1b5-6a7f-4318-8f86-d249aa9b48c0',
            platform: 'reddit',
            source_url: 'https://reddit.com/r/hvac/comments/hvac-pain',
            title: 'Tired of phone tag and calendar spreadsheets',
            snippet: 'Looking for scheduling help. HVAC technician dispatch is a mess.',
            intent_score: 90,
            status: payload.status || 'discovered',
            suggested_reply: payload.suggested_reply || 'Original reply draft...',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        });
      }
    });

    await page.route('**/api/leads/discover', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ count: 5 })
      });
    });
  });

  test('Stats panel renders counters correctly', async ({ page }) => {
    await page.goto('/tools/lead-queue');

    // Verify stats exist
    await expect(page.locator('#discovered-count')).toContainText('1');
    await expect(page.locator('#queued-count')).toContainText('1');
    await expect(page.locator('#replied-count')).toContainText('0');
    await expect(page.locator('#ignored-count')).toContainText('0');
  });

  test('Filtering and sorting leads updates the displayed list', async ({ page }) => {
    await page.goto('/tools/lead-queue');

    // Filter by Platform = reddit
    const platformFilter = page.locator('#filter-platform');
    await platformFilter.selectOption('reddit');

    const leadCards = page.locator('.lead-card');
    await expect(leadCards).toHaveCount(1);
    await expect(leadCards.first()).toContainText('reddit');

    // Sort by intent score
    const sortSelect = page.locator('#sort-leads');
    await sortSelect.selectOption('intent_desc');
    await expect(leadCards).toHaveCount(1);
  });

  test('Custom Lead Form allows manual submission and validates URL format', async ({ page }) => {
    await page.goto('/tools/lead-queue');

    const urlInput = page.locator('#lead-url');
    const titleInput = page.locator('#lead-title');
    const snippetInput = page.locator('#lead-snippet');
    const platformSelect = page.locator('#lead-platform');
    const submitButton = page.locator('button[type="submit"]:has-text("Add Lead")');

    // Fill invalid URL
    await urlInput.fill('invalid-url-schema');
    await titleInput.fill('Test Lead');
    await snippetInput.fill('Test Snippet');
    await platformSelect.selectOption('reddit');

    await submitButton.click();

    // Verify that validation message/error is displayed
    const errorMessage = page.locator('.form-error-message');
    await expect(errorMessage).toBeVisible();

    // Fill valid URL
    await urlInput.fill('https://reddit.com/r/plumbing/comments/valid-url');
    await submitButton.click();

    // Form should clear on success
    await expect(urlInput).toHaveValue('');
  });

  test('Lead list cards show details, allow editing/copying pitch, and updating status', async ({ page }) => {
    await page.goto('/tools/lead-queue');

    const firstCard = page.locator('.lead-card').first();
    await expect(firstCard.locator('.lead-platform')).toBeVisible();
    await expect(firstCard.locator('.lead-title')).toBeVisible();
    await expect(firstCard.locator('.lead-snippet')).toBeVisible();
    await expect(firstCard.locator('.lead-intent-score')).toBeVisible();

    // Edit textarea suggested reply
    const textarea = firstCard.locator('.draft-reply-textarea');
    await expect(textarea).toBeVisible();
    await textarea.fill('Custom edited response draft pitch');

    // Copy Pitch button copies message and shows toast
    await page.evaluate(() => {
      window.copiedText = null;
      navigator.clipboard.writeText = async (text) => {
        window.copiedText = text;
      };
    });

    await firstCard.locator('.btn-copy-pitch').click();
    const copiedText = await page.evaluate(() => window.copiedText);
    expect(copiedText).toBe('Custom edited response draft pitch');

    const toast = page.locator('.toast-notification');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText(/copied/i);

    // Go to Post link opens in new tab
    const postLink = firstCard.locator('a:has-text("Go to Post")');
    await expect(postLink).toHaveAttribute('target', '_blank');

    // Status Buttons update the status
    const queueButton = firstCard.locator('.btn-status-queue');
    const replyButton = firstCard.locator('.btn-status-reply');
    const ignoreButton = firstCard.locator('.btn-status-ignore');

    await expect(queueButton).toBeVisible();
    await expect(replyButton).toBeVisible();
    await expect(ignoreButton).toBeVisible();

    await replyButton.click();
    await expect(firstCard.locator('.lead-status-badge')).toContainText('replied');
  });

  test('Trigger Discovery button calls API and shows count of new leads', async ({ page }) => {
    await page.goto('/tools/lead-queue');

    const discoverButton = page.locator('button:has-text("Trigger Discovery")');
    await expect(discoverButton).toBeVisible();

    await discoverButton.click();

    // Confirm discovery notification appears
    const toast = page.locator('.toast-notification');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText(/discovered 5 new leads/i);
  });
});
